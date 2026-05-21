import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../../src/store/ThemeContext';
import { useToast } from '../../src/components/Toast';
import { StorageKeys } from '../../src/constants/storageKeys';

const VISIBILITY_OPTIONS = [
  { key: 'everyone', label: 'Everyone' },
  { key: 'contacts', label: 'My Contacts' },
  { key: 'nobody',   label: 'Nobody' },
];

const STORAGE_KEY_MAP = {
  lastSeen:    StorageKeys.privacyLastSeen,
  profilePhoto:StorageKeys.privacyProfilePhoto,
  about:       StorageKeys.privacyAbout,
  readReceipts:StorageKeys.privacyReadReceipts,
  groups:      StorageKeys.privacyGroups,
  appLock:     StorageKeys.privacyAppLock,
  screenshot:  StorageKeys.privacyBlockScreenshot,
};

export default function PrivacyScreen() {
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
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    readReceipts: true,
    groups: 'everyone',
    appLock: false,
    screenshot: false,
  });
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        Object.entries(STORAGE_KEY_MAP).map(async ([key, storageKey]) => {
          const v = await AsyncStorage.getItem(storageKey);
          if (v == null) return null;
          if (v === 'true') return [key, true];
          if (v === 'false') return [key, false];
          return [key, v];
        })
      );
      const loaded = Object.fromEntries(entries.filter(Boolean));
      if (Object.keys(loaded).length) setPrefs(prev => ({ ...prev, ...loaded }));

      const has = await LocalAuthentication.hasHardwareAsync().catch(() => false);
      const enrolled = has ? await LocalAuthentication.isEnrolledAsync().catch(() => false) : false;
      setBioAvailable(!!enrolled);
    })();
  }, []);

  const save = useCallback(async (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    try { await AsyncStorage.setItem(STORAGE_KEY_MAP[key], String(value)); } catch {}
  }, []);

  const cycleVisibility = useCallback((key) => {
    const idx = VISIBILITY_OPTIONS.findIndex(o => o.key === prefs[key]);
    const next = VISIBILITY_OPTIONS[(idx + 1) % VISIBILITY_OPTIONS.length];
    save(key, next.key);
    toast(`${next.label}`, 'success');
  }, [prefs, save, toast]);

  const toggleAppLock = useCallback(async (val) => {
    if (val && !bioAvailable) {
      toast('Set up Face/Fingerprint in system settings first', 'warning');
      Linking.openSettings();
      return;
    }
    if (val) {
      const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Enable App Lock' }).catch(() => ({ success: false }));
      if (!res.success) { toast('Authentication failed', 'error'); return; }
    }
    save('appLock', val);
    toast(val ? 'App Lock enabled' : 'App Lock disabled', 'success');
  }, [bioAvailable, save, toast]);

  const labelFor = (key) => VISIBILITY_OPTIONS.find(o => o.key === prefs[key])?.label || 'Everyone';

  const VISIBILITY_ITEMS = [
    { key: 'lastSeen',     icon: 'time-outline',      label: 'Last Seen',     desc: 'Who can see when you were last online' },
    { key: 'profilePhoto', icon: 'image-outline',     label: 'Profile Photo', desc: 'Who can see your profile picture' },
    { key: 'about',        icon: 'information-circle-outline', label: 'About', desc: 'Who can read your bio' },
    { key: 'groups',       icon: 'people-outline',    label: 'Groups',        desc: 'Who can add you to groups' },
  ];

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <View style={[s.header, { backgroundColor: headerBg, paddingTop: insets.top + 6 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 50 }]}>
        <Text style={[s.sectionLabel, { color: subColor }]}>WHO CAN SEE MY INFO</Text>
        {VISIBILITY_ITEMS.map(item => (
          <TouchableOpacity key={item.key} style={[s.row, { backgroundColor: cardBg }]} activeOpacity={0.7} onPress={() => cycleVisibility(item.key)}>
            <View style={[s.rowIcon, { backgroundColor: ACCENT + '15' }]}>
              <Ionicons name={item.icon} size={18} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: textColor }]}>{item.label}</Text>
              <Text style={[s.rowDesc, { color: subColor }]}>{item.desc}</Text>
            </View>
            <Text style={[s.rowValue, { color: ACCENT }]}>{labelFor(item.key)}</Text>
            <Ionicons name="chevron-forward" size={14} color={subColor} />
          </TouchableOpacity>
        ))}

        <Text style={[s.sectionLabel, { color: subColor, marginTop: 18 }]}>MESSAGING</Text>
        <View style={[s.row, { backgroundColor: cardBg }]}>
          <View style={[s.rowIcon, { backgroundColor: '#3b82f615' }]}>
            <Ionicons name="checkmark-done-outline" size={18} color="#3b82f6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.rowLabel, { color: textColor }]}>Read Receipts</Text>
            <Text style={[s.rowDesc, { color: subColor }]}>Send blue ticks when you read a message</Text>
          </View>
          <Switch value={!!prefs.readReceipts} onValueChange={(v) => save('readReceipts', v)}
            trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: ACCENT + '70' }} thumbColor={prefs.readReceipts ? ACCENT : '#fff'} />
        </View>

        <Text style={[s.sectionLabel, { color: subColor, marginTop: 18 }]}>APP SECURITY</Text>
        <View style={[s.row, { backgroundColor: cardBg }]}>
          <View style={[s.rowIcon, { backgroundColor: '#22c55e15' }]}>
            <Ionicons name="finger-print" size={18} color="#22c55e" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.rowLabel, { color: textColor }]}>App Lock</Text>
            <Text style={[s.rowDesc, { color: subColor }]}>{bioAvailable ? 'Unlock with biometrics' : 'Set up biometrics first'}</Text>
          </View>
          <Switch value={!!prefs.appLock} onValueChange={toggleAppLock}
            trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: '#22c55e70' }} thumbColor={prefs.appLock ? '#22c55e' : '#fff'} />
        </View>

        <View style={[s.row, { backgroundColor: cardBg }]}>
          <View style={[s.rowIcon, { backgroundColor: '#ef444415' }]}>
            <Ionicons name="eye-off-outline" size={18} color="#ef4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.rowLabel, { color: textColor }]}>Block Screenshots</Text>
            <Text style={[s.rowDesc, { color: subColor }]}>Prevent screenshots inside chats (Android)</Text>
          </View>
          <Switch value={!!prefs.screenshot} onValueChange={(v) => save('screenshot', v)}
            trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: '#ef444470' }} thumbColor={prefs.screenshot ? '#ef4444' : '#fff'} />
        </View>

        <Text style={[s.sectionLabel, { color: subColor, marginTop: 18 }]}>ADVANCED</Text>
        <TouchableOpacity style={[s.row, { backgroundColor: cardBg }]} activeOpacity={0.7} onPress={() => router.push('/chat/linked-devices')}>
          <View style={[s.rowIcon, { backgroundColor: '#6d5dfc15' }]}>
            <Ionicons name="qr-code-outline" size={18} color="#6d5dfc" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.rowLabel, { color: textColor }]}>Linked Devices</Text>
            <Text style={[s.rowDesc, { color: subColor }]}>Manage active web/desktop sessions</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={subColor} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.row, { backgroundColor: cardBg }]} activeOpacity={0.7} onPress={() => Linking.openSettings()}>
          <View style={[s.rowIcon, { backgroundColor: '#f59e0b15' }]}>
            <Ionicons name="settings-outline" size={18} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.rowLabel, { color: textColor }]}>System Permissions</Text>
            <Text style={[s.rowDesc, { color: subColor }]}>Open OS settings for app permissions</Text>
          </View>
          <Ionicons name="open-outline" size={16} color={subColor} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingBottom: 12, elevation: 4 },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  body: { padding: 12, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 6, marginBottom: 4, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14.5, fontWeight: '700' },
  rowDesc: { fontSize: 11.5, marginTop: 2 },
  rowValue: { fontSize: 12.5, fontWeight: '700', marginRight: 4 },
});
