import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Modal, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer } from 'expo-audio';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../src/store/ThemeContext';
import { useToast } from '../../src/components/Toast';
import { StorageKeys } from '../../src/constants/storageKeys';

const NOTIFICATION_TONES = [
  { key: 'default', label: 'Default' },
  { key: 'chime', label: 'Chime' },
  { key: 'ping', label: 'Ping' },
  { key: 'bubble', label: 'Bubble' },
  { key: 'bell', label: 'Bell' },
  { key: 'drop', label: 'Drop' },
  { key: 'pop', label: 'Pop' },
  { key: 'ding', label: 'Ding' },
  { key: 'chirp', label: 'Chirp' },
  { key: 'soft', label: 'Soft' },
  { key: 'bright', label: 'Bright' },
  { key: 'knock', label: 'Knock' },
  { key: 'swoosh', label: 'Swoosh' },
  { key: 'crystal', label: 'Crystal' },
  { key: 'ripple', label: 'Ripple' },
  { key: 'alert', label: 'Alert' },
];

const TONE_FILES = {
  chime: require('../../assets/tones/chime.wav'),
  ping: require('../../assets/tones/ping.wav'),
  bubble: require('../../assets/tones/bubble.wav'),
  bell: require('../../assets/tones/bell.wav'),
  drop: require('../../assets/tones/drop.wav'),
  pop: require('../../assets/tones/pop.wav'),
  ding: require('../../assets/tones/ding.wav'),
  chirp: require('../../assets/tones/chirp.wav'),
  soft: require('../../assets/tones/soft.wav'),
  bright: require('../../assets/tones/bright.wav'),
  knock: require('../../assets/tones/knock.wav'),
  swoosh: require('../../assets/tones/swoosh.wav'),
  crystal: require('../../assets/tones/crystal.wav'),
  ripple: require('../../assets/tones/ripple.wav'),
  alert: require('../../assets/tones/alert.wav'),
};

const STORAGE = {
  tone:      StorageKeys.notificationTone,
  message:   StorageKeys.notifyMessage,
  group:     StorageKeys.notifyGroup,
  call:      StorageKeys.notifyCall,
  mention:   StorageKeys.notifyMention,
  preview:   StorageKeys.notifyPreview,
  vibrate:   StorageKeys.notifyVibrate,
  inApp:     StorageKeys.notifyInApp,
  dnd:       StorageKeys.notifyDnd,
};

export default function NotificationsScreen() {
  const { theme: t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const ACCENT = t.accent;
  const bg = isDark ? '#0b141a' : '#fff';
  const headerBg = isDark ? '#1f2c34' : ACCENT;
  const cardBg = isDark ? '#1e293b' : '#f8fafc';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const subColor = isDark ? '#64748b' : '#94a3b8';

  const [prefs, setPrefs] = useState({
    message: true, group: true, call: true, mention: true,
    preview: true, vibrate: true, inApp: true, dnd: false,
  });
  const [selectedTone, setSelectedTone] = useState('default');
  const [showTonePicker, setShowTonePicker] = useState(false);
  const [playingTone, setPlayingTone] = useState(null);
  const [systemPerm, setSystemPerm] = useState('undetermined');

  useEffect(() => {
    (async () => {
      const tone = await AsyncStorage.getItem(STORAGE.tone);
      if (tone) setSelectedTone(tone);

      const keys = ['message','group','call','mention','preview','vibrate','inApp','dnd'];
      const entries = await Promise.all(keys.map(async k => {
        const v = await AsyncStorage.getItem(STORAGE[k]);
        return v == null ? null : [k, v === 'true'];
      }));
      const loaded = Object.fromEntries(entries.filter(Boolean));
      if (Object.keys(loaded).length) setPrefs(prev => ({ ...prev, ...loaded }));

      const perm = await Notifications.getPermissionsAsync().catch(() => ({ status: 'undetermined' }));
      setSystemPerm(perm.status || 'undetermined');
    })();
  }, []);

  const save = useCallback(async (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    try { await AsyncStorage.setItem(STORAGE[key], String(value)); } catch {}
  }, []);

  const previewTone = useCallback(async (key) => {
    if (playingTone) { try { playingTone.pause(); playingTone.remove(); } catch {} }
    if (key === 'default') { setPlayingTone(null); return; }
    try {
      const player = createAudioPlayer(TONE_FILES[key]);
      player.volume = 1.0;
      player.play();
      setPlayingTone(player);
      const sub = player.addListener('playbackStatusUpdate', (s) => {
        if (s?.didJustFinish) { try { player.remove(); } catch {} setPlayingTone(null); sub?.remove?.(); }
      });
    } catch {}
  }, [playingTone]);

  const selectTone = useCallback(async (key) => {
    setSelectedTone(key);
    await AsyncStorage.setItem(STORAGE.tone, key);
    previewTone(key);
    setShowTonePicker(false);
    toast(`Tone: ${NOTIFICATION_TONES.find(tn => tn.key === key)?.label}`, 'success');
  }, [previewTone, toast]);

  const requestSystemPerm = useCallback(async () => {
    const res = await Notifications.requestPermissionsAsync().catch(() => null);
    if (res?.status === 'granted') { setSystemPerm('granted'); toast('Notifications enabled', 'success'); }
    else if (res?.status === 'denied') { Linking.openSettings(); }
  }, [toast]);

  const TOGGLES_ALERTS = [
    { key: 'message', icon: 'chatbubble-outline',   tint: '#3b82f6', label: 'Direct Messages',   desc: 'Alerts for 1-to-1 messages' },
    { key: 'group',   icon: 'people-outline',       tint: '#22c55e', label: 'Group Messages',    desc: 'Alerts for group chats' },
    { key: 'mention', icon: 'at-outline',           tint: '#f59e0b', label: '@Mentions',         desc: 'Alert me when I am mentioned' },
    { key: 'call',    icon: 'call-outline',         tint: '#ef4444', label: 'Calls',             desc: 'Incoming voice/video call ringer' },
  ];

  const TOGGLES_BEHAVIOR = [
    { key: 'preview', icon: 'eye-outline',          tint: '#0ea5e9', label: 'Show Preview',      desc: 'Display message text in notifications' },
    { key: 'vibrate', icon: 'phone-portrait-outline', tint: '#8b5cf6', label: 'Vibration',       desc: 'Vibrate on new notification' },
    { key: 'inApp',   icon: 'notifications-circle-outline', tint: '#06b6d4', label: 'In-App Banners', desc: 'Show banners while using the app' },
  ];

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <View style={[s.header, { backgroundColor: headerBg, paddingTop: insets.top + 6 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 50 }]}>
        {systemPerm !== 'granted' && (
          <TouchableOpacity style={[s.warnCard, { backgroundColor: '#f59e0b15' }]} onPress={requestSystemPerm} activeOpacity={0.85}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <View style={{ flex: 1 }}>
              <Text style={[s.warnTitle, { color: '#f59e0b' }]}>Notifications are off</Text>
              <Text style={[s.warnDesc, { color: subColor }]}>Tap to enable system notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#f59e0b" />
          </TouchableOpacity>
        )}

        <Text style={[s.sectionLabel, { color: subColor }]}>ALERTS</Text>
        {TOGGLES_ALERTS.map(item => (
          <View key={item.key} style={[s.row, { backgroundColor: cardBg }]}>
            <View style={[s.rowIcon, { backgroundColor: item.tint + '15' }]}>
              <Ionicons name={item.icon} size={18} color={item.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: textColor }]}>{item.label}</Text>
              <Text style={[s.rowDesc, { color: subColor }]}>{item.desc}</Text>
            </View>
            <Switch value={!!prefs[item.key]} onValueChange={(v) => save(item.key, v)}
              trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: item.tint + '70' }} thumbColor={prefs[item.key] ? item.tint : '#fff'} />
          </View>
        ))}

        <Text style={[s.sectionLabel, { color: subColor, marginTop: 18 }]}>BEHAVIOR</Text>
        {TOGGLES_BEHAVIOR.map(item => (
          <View key={item.key} style={[s.row, { backgroundColor: cardBg }]}>
            <View style={[s.rowIcon, { backgroundColor: item.tint + '15' }]}>
              <Ionicons name={item.icon} size={18} color={item.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: textColor }]}>{item.label}</Text>
              <Text style={[s.rowDesc, { color: subColor }]}>{item.desc}</Text>
            </View>
            <Switch value={!!prefs[item.key]} onValueChange={(v) => save(item.key, v)}
              trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: item.tint + '70' }} thumbColor={prefs[item.key] ? item.tint : '#fff'} />
          </View>
        ))}

        <Text style={[s.sectionLabel, { color: subColor, marginTop: 18 }]}>SOUND</Text>
        <TouchableOpacity style={[s.row, { backgroundColor: cardBg }]} onPress={() => setShowTonePicker(true)} activeOpacity={0.7}>
          <View style={[s.rowIcon, { backgroundColor: ACCENT + '15' }]}>
            <Ionicons name="musical-notes-outline" size={18} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.rowLabel, { color: textColor }]}>Notification Tone</Text>
            <Text style={[s.rowDesc, { color: subColor }]}>Preview & choose your alert sound</Text>
          </View>
          <Text style={[s.rowValue, { color: ACCENT }]}>{NOTIFICATION_TONES.find(tn => tn.key === selectedTone)?.label || 'Default'}</Text>
          <Ionicons name="chevron-forward" size={14} color={subColor} />
        </TouchableOpacity>

        <Text style={[s.sectionLabel, { color: subColor, marginTop: 18 }]}>QUIET HOURS</Text>
        <View style={[s.row, { backgroundColor: cardBg }]}>
          <View style={[s.rowIcon, { backgroundColor: '#ef444415' }]}>
            <Ionicons name="moon-outline" size={18} color="#ef4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.rowLabel, { color: textColor }]}>Do Not Disturb</Text>
            <Text style={[s.rowDesc, { color: subColor }]}>Silence all notifications</Text>
          </View>
          <Switch value={!!prefs.dnd} onValueChange={(v) => save('dnd', v)}
            trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: '#ef444470' }} thumbColor={prefs.dnd ? '#ef4444' : '#fff'} />
        </View>
      </ScrollView>

      {showTonePicker && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowTonePicker(false)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={() => setShowTonePicker(false)}>
            <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingTop: 16 }} onStartShouldSetResponder={() => true}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: subColor + '40' }}>
                <Ionicons name="musical-notes" size={20} color={ACCENT} />
                <Text style={{ flex: 1, fontSize: 17, fontWeight: '800', color: textColor, marginLeft: 10 }}>Notification Tone</Text>
                <TouchableOpacity onPress={() => setShowTonePicker(false)}>
                  <Ionicons name="close" size={22} color={subColor} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                {NOTIFICATION_TONES.map((tn) => (
                  <TouchableOpacity key={tn.key} onPress={() => selectTone(tn.key)}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
                      backgroundColor: selectedTone === tn.key ? `${ACCENT}15` : 'transparent' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: selectedTone === tn.key ? `${ACCENT}20` : `${subColor}20` }}>
                      <Ionicons name={selectedTone === tn.key ? 'volume-high' : 'musical-note'} size={18} color={selectedTone === tn.key ? ACCENT : subColor} />
                    </View>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: selectedTone === tn.key ? '700' : '500',
                      color: selectedTone === tn.key ? ACCENT : textColor, marginLeft: 12 }}>{tn.label}</Text>
                    {tn.key !== 'default' && (
                      <TouchableOpacity onPress={() => previewTone(tn.key)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="play-circle" size={24} color={subColor} />
                      </TouchableOpacity>
                    )}
                    {selectedTone === tn.key && <Ionicons name="checkmark-circle" size={22} color={ACCENT} style={{ marginLeft: 8 }} />}
                  </TouchableOpacity>
                ))}
                <View style={{ height: 30 }} />
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingBottom: 12, elevation: 4 },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  body: { padding: 12, gap: 8 },
  warnCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, marginBottom: 8 },
  warnTitle: { fontSize: 14, fontWeight: '800' },
  warnDesc: { fontSize: 11.5, marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 6, marginBottom: 4, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14.5, fontWeight: '700' },
  rowDesc: { fontSize: 11.5, marginTop: 2 },
  rowValue: { fontSize: 12.5, fontWeight: '700', marginRight: 4 },
});
