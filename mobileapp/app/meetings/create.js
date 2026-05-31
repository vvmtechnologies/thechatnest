import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '../../src/components/SimpleDateTimePicker';
import { useAuth } from '../../src/store/AuthContext';
import { useTheme } from '../../src/store/ThemeContext';
import { createMeeting, addParticipant, setCoHost } from '../../src/api/meetings';
import { getContacts } from '../../src/api/chat';

const pad = (n) => String(n).padStart(2, '0');

const buildDefaultDateTime = () => {
  const d = new Date(Date.now() + 30 * 60_000);
  // Round to next 5 mins
  const mins = d.getMinutes();
  const round = Math.ceil(mins / 5) * 5;
  d.setMinutes(round, 0, 0);
  return d;
};

const formatDateLabel = (d) =>
  d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const formatTimeLabel = (d) =>
  d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function CreateMeetingScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { theme: t } = useTheme();

  const initialMode = params.mode === 'scheduled' ? 'scheduled' : 'instant';
  const [mode, setMode] = useState(initialMode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [when, setWhen] = useState(buildDefaultDateTime);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  const [waitingRoom, setWaitingRoom] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [loading, setLoading] = useState(false);

  // Members picker
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); // {id, name, email, user_id}
  const [coHostIds, setCoHostIds] = useState(new Set()); // Set<user_id>

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContacts(true);
      try {
        const res = await getContacts();
        const list = res?.contacts || res?.data || res || [];
        if (!cancelled) setContacts(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn('[create-meeting] contacts load:', e?.message);
      } finally {
        if (!cancelled) setLoadingContacts(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredContacts = useMemo(() => {
    const list = (contacts || []).filter((c) => {
      if (!c) return false;
      const uid = Number(c.user_id || c.id);
      if (!uid || uid === Number(user?.id)) return false;
      return true;
    });
    if (!memberQuery.trim()) return list;
    const q = memberQuery.toLowerCase();
    return list.filter((c) =>
      (c.name || c.display_name || c.full_name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  }, [contacts, memberQuery, user?.id]);

  const toggleMember = (c) => {
    const uid = Number(c.user_id || c.id);
    setSelectedMembers((prev) => {
      const exists = prev.find((m) => Number(m.user_id || m.id) === uid);
      if (exists) {
        // Also remove from co-host if it was selected
        setCoHostIds((s) => { const next = new Set(s); next.delete(uid); return next; });
        return prev.filter((m) => Number(m.user_id || m.id) !== uid);
      }
      return [...prev, c];
    });
  };

  const toggleCoHost = (uid) => {
    setCoHostIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  };

  const recurrenceOptions = [
    { key: 'none', label: 'No repeat' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  const onChangeDate = (event, picked) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event?.type === 'dismissed') return;
    if (picked) {
      const next = new Date(when);
      next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
      setWhen(next);
    }
  };

  const onChangeTime = (event, picked) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event?.type === 'dismissed') return;
    if (picked) {
      const next = new Date(when);
      next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
      setWhen(next);
    }
  };

  const submit = async () => {
    if (!user?.orgId) {
      Alert.alert('No organization', 'You must be part of an organization to host a meeting.');
      return;
    }
    let scheduled_at = null;
    if (mode === 'scheduled') {
      if (when.getTime() < Date.now() - 60_000) {
        Alert.alert('Pick a future time', 'Scheduled time should be in the future.');
        return;
      }
      scheduled_at = when.toISOString();
    }

    setLoading(true);
    try {
      const payload = {
        organization_id: user.orgId,
        title: title.trim() || (mode === 'scheduled' ? 'Scheduled Meeting' : 'Quick Meeting'),
        description: description.trim() || undefined,
        meeting_type: mode === 'scheduled' ? 'scheduled' : 'instant',
        scheduled_at,
        passcode: passcode.trim() || undefined,
        settings: {
          video_enabled: enableVideo,
          audio_enabled: enableAudio,
          waiting_room: waitingRoom,
        },
      };
      if (mode === 'scheduled' && recurrence !== 'none') {
        payload.recurrence_rule = recurrence;
      }
      if (selectedMembers.length > 0) {
        payload.participants = selectedMembers.map((m) => ({
          user_id: Number(m.user_id || m.id),
          role: coHostIds.has(Number(m.user_id || m.id)) ? 'co_host' : 'participant',
        }));
      }

      const meeting = await createMeeting(payload);
      const id = meeting?.id || meeting?.meeting?.id;

      // Best-effort: if backend didn't honor co_host role in createMeeting,
      // promote each co_host explicitly.
      if (id && coHostIds.size > 0) {
        await Promise.all(
          Array.from(coHostIds).map((uid) =>
            setCoHost(id, uid, true).catch(() => null)
          )
        );
      }

      if (id) {
        router.replace(`/meetings/${id}`);
      } else {
        Alert.alert('Created', 'Meeting created successfully.');
        router.replace('/(tabs)/meetings');
      }
    } catch (e) {
      Alert.alert('Failed to create', e?.response?.data?.message || e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: mode === 'scheduled' ? 'Schedule Meeting' : 'New Meeting',
          headerStyle: { backgroundColor: t.bg },
          headerTitleStyle: { color: t.text, fontWeight: '700' },
          headerTintColor: t.text,
        }}
      />
      <SafeAreaView style={[s.container, { backgroundColor: t.bg }]} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
          {/* Mode switcher */}
          <View style={[s.modeRow, { backgroundColor: t.surfaceAlt }]}>
            <TouchableOpacity
              style={[s.modeBtn, mode === 'instant' && { backgroundColor: t.surface, ...shadow }]}
              onPress={() => setMode('instant')}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={16} color={mode === 'instant' ? t.accent : t.textTer} />
              <Text style={[s.modeLabel, { color: mode === 'instant' ? t.accent : t.textTer }]}>Instant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modeBtn, mode === 'scheduled' && { backgroundColor: t.surface, ...shadow }]}
              onPress={() => setMode('scheduled')}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={16} color={mode === 'scheduled' ? t.accent : t.textTer} />
              <Text style={[s.modeLabel, { color: mode === 'scheduled' ? t.accent : t.textTer }]}>Scheduled</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={[s.label, { color: t.textSec }]}>Title</Text>
          <TextInput
            style={[s.input, { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.text }]}
            placeholder={mode === 'scheduled' ? 'Weekly Standup' : 'Quick chat'}
            placeholderTextColor={t.textQuad}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Description */}
          <Text style={[s.label, { color: t.textSec }]}>Description (optional)</Text>
          <TextInput
            style={[s.input, s.textarea, { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.text }]}
            placeholder="Agenda, links, etc."
            placeholderTextColor={t.textQuad}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={1000}
          />

          {/* Schedule fields with native pickers */}
          {mode === 'scheduled' && (
            <>
              <Text style={[s.label, { color: t.textSec }]}>When</Text>
              <View style={s.row}>
                <TouchableOpacity
                  style={[s.pickerBtn, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={16} color={t.textSec} />
                  <Text style={[s.pickerTxt, { color: t.text }]}>{formatDateLabel(when)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.pickerBtn, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={16} color={t.textSec} />
                  <Text style={[s.pickerTxt, { color: t.text }]}>{formatTimeLabel(when)}</Text>
                </TouchableOpacity>
              </View>

              {(showDatePicker || Platform.OS === 'ios') && showDatePicker && (
                <DateTimePicker
                  value={when}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={new Date()}
                  onChange={onChangeDate}
                />
              )}
              {(showTimePicker || Platform.OS === 'ios') && showTimePicker && (
                <DateTimePicker
                  value={when}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeTime}
                />
              )}
              {Platform.OS === 'ios' && showDatePicker && (
                <TouchableOpacity
                  style={[s.iosDone, { backgroundColor: t.accent }]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
                </TouchableOpacity>
              )}
              {Platform.OS === 'ios' && showTimePicker && (
                <TouchableOpacity
                  style={[s.iosDone, { backgroundColor: t.accent }]}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
                </TouchableOpacity>
              )}

              <Text style={[s.label, { color: t.textSec }]}>Repeat</Text>
              <View style={s.recurrenceRow}>
                {recurrenceOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      s.chip,
                      { borderColor: t.inputBorder, backgroundColor: recurrence === opt.key ? t.accentBg : 'transparent' },
                    ]}
                    onPress={() => setRecurrence(opt.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: recurrence === opt.key ? t.accent : t.textSec }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Invite members */}
          <Text style={[s.label, { color: t.textSec }]}>Invite people (optional)</Text>
          <TouchableOpacity
            style={[s.inviteBtn, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}
            onPress={() => setShowMembers(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add-outline" size={18} color={t.textSec} />
            <Text style={[s.inviteTxt, { color: t.text }]}>
              {selectedMembers.length > 0 ? `${selectedMembers.length} selected` : 'Pick teammates'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={t.textTer} />
          </TouchableOpacity>
          {selectedMembers.length > 0 && (
            <View style={s.selectedRow}>
              {selectedMembers.slice(0, 6).map((m) => {
                const uid = Number(m.user_id || m.id);
                const isCoHost = coHostIds.has(uid);
                return (
                  <View
                    key={uid}
                    style={[s.selectedChip, { backgroundColor: isCoHost ? t.accentBg : t.surfaceAlt }]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: isCoHost ? t.accent : t.textSec }}>
                      {(m.name || m.display_name || m.email || '?').slice(0, 16)}
                    </Text>
                    {isCoHost && <Ionicons name="ribbon" size={10} color={t.accent} />}
                  </View>
                );
              })}
              {selectedMembers.length > 6 && (
                <View style={[s.selectedChip, { backgroundColor: t.surfaceAlt }]}>
                  <Text style={{ fontSize: 11, color: t.textSec }}>+{selectedMembers.length - 6}</Text>
                </View>
              )}
            </View>
          )}

          {/* Passcode */}
          <Text style={[s.label, { color: t.textSec }]}>Passcode (optional)</Text>
          <TextInput
            style={[s.input, { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.text }]}
            placeholder="Leave blank for no passcode"
            placeholderTextColor={t.textQuad}
            value={passcode}
            onChangeText={setPasscode}
            autoCapitalize="characters"
            maxLength={20}
          />

          {/* Toggles */}
          <View style={[s.toggleCard, { backgroundColor: t.surface, borderColor: t.borderLight }]}>
            <View style={s.toggleRow}>
              <Ionicons name="videocam-outline" size={18} color={t.textSec} />
              <Text style={[s.toggleLabel, { color: t.text }]}>Video</Text>
              <Switch value={enableVideo} onValueChange={setEnableVideo} trackColor={{ true: t.accent }} />
            </View>
            <View style={[s.divider, { backgroundColor: t.borderLight }]} />
            <View style={s.toggleRow}>
              <Ionicons name="mic-outline" size={18} color={t.textSec} />
              <Text style={[s.toggleLabel, { color: t.text }]}>Audio</Text>
              <Switch value={enableAudio} onValueChange={setEnableAudio} trackColor={{ true: t.accent }} />
            </View>
            <View style={[s.divider, { backgroundColor: t.borderLight }]} />
            <View style={s.toggleRow}>
              <Ionicons name="hourglass-outline" size={18} color={t.textSec} />
              <Text style={[s.toggleLabel, { color: t.text }]}>Waiting room</Text>
              <Switch value={waitingRoom} onValueChange={setWaitingRoom} trackColor={{ true: t.accent }} />
            </View>
          </View>
        </ScrollView>

        {/* Submit bar */}
        <View style={[s.submitBar, { backgroundColor: t.surface, borderTopColor: t.borderLight }]}>
          <TouchableOpacity
            style={[s.submitBtn, { backgroundColor: t.accent, opacity: loading ? 0.6 : 1 }]}
            onPress={submit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name={mode === 'scheduled' ? 'calendar' : 'videocam'} size={18} color="#fff" />
                <Text style={s.submitTxt}>{mode === 'scheduled' ? 'Schedule meeting' : 'Start now'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Member picker modal */}
        <Modal visible={showMembers} animationType="slide" transparent onRequestClose={() => setShowMembers(false)}>
          <View style={s.modalOverlay}>
            <View style={[s.modalPanel, { backgroundColor: t.surface }]}>
              <View style={[s.modalHeader, { borderBottomColor: t.borderLight }]}>
                <Text style={[s.modalTitle, { color: t.text }]}>Invite people</Text>
                <TouchableOpacity onPress={() => setShowMembers(false)} hitSlop={10}>
                  <Ionicons name="close" size={24} color={t.text} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[s.searchInput, { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.text }]}
                placeholder="Search name or email"
                placeholderTextColor={t.textQuad}
                value={memberQuery}
                onChangeText={setMemberQuery}
                autoCapitalize="none"
              />
              {loadingContacts ? (
                <ActivityIndicator color={t.accent} style={{ marginTop: 30 }} />
              ) : (
                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item, i) => String(item.user_id || item.id || i)}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <Text style={[s.modalEmpty, { color: t.textTer }]}>No teammates found.</Text>
                  }
                  renderItem={({ item }) => {
                    const uid = Number(item.user_id || item.id);
                    const selected = !!selectedMembers.find((m) => Number(m.user_id || m.id) === uid);
                    const isCoHost = coHostIds.has(uid);
                    return (
                      <View style={[s.memberRow, { borderBottomColor: t.borderLight }]}>
                        <TouchableOpacity
                          style={s.memberMain}
                          onPress={() => toggleMember(item)}
                          activeOpacity={0.7}
                        >
                          <View style={[s.memberAvatar, { backgroundColor: t.accentBg }]}>
                            <Text style={{ color: t.accent, fontWeight: '700' }}>
                              {(item.name || item.display_name || item.email || '?').slice(0, 1).toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[s.memberName, { color: t.text }]} numberOfLines={1}>
                              {item.name || item.display_name || item.email}
                            </Text>
                            {!!item.email && (
                              <Text style={[s.memberEmail, { color: t.textTer }]} numberOfLines={1}>
                                {item.email}
                              </Text>
                            )}
                          </View>
                          <View style={[
                            s.checkBox,
                            { borderColor: selected ? t.accent : t.inputBorder, backgroundColor: selected ? t.accent : 'transparent' },
                          ]}>
                            {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
                          </View>
                        </TouchableOpacity>
                        {selected && (
                          <TouchableOpacity
                            onPress={() => toggleCoHost(uid)}
                            style={[
                              s.coHostBtn,
                              { backgroundColor: isCoHost ? t.accent : t.surfaceAlt },
                            ]}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="ribbon-outline" size={12} color={isCoHost ? '#fff' : t.textSec} />
                            <Text style={{
                              fontSize: 10, fontWeight: '700',
                              color: isCoHost ? '#fff' : t.textSec,
                            }}>
                              Co-host
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  }}
                />
              )}
              <TouchableOpacity
                style={[s.doneBtn, { backgroundColor: t.accent }]}
                onPress={() => setShowMembers(false)}
              >
                <Text style={s.doneTxt}>Done ({selectedMembers.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  android: { elevation: 1 },
});

const s = StyleSheet.create({
  container: { flex: 1 },
  modeRow: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  modeLabel: { fontSize: 13, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600', marginTop: 14, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textarea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  row: { flexDirection: 'row', gap: 10 },
  recurrenceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  toggleCard: { borderRadius: 12, borderWidth: 1, marginTop: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  toggleLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, marginHorizontal: 14 },
  submitBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, borderTopWidth: 1 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  submitTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  pickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  pickerTxt: { fontSize: 14, fontWeight: '600' },
  iosDone: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 4 },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 10, borderWidth: 1 },
  inviteTxt: { flex: 1, fontSize: 14, fontWeight: '600' },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  selectedChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalPanel: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 12 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  searchInput: { margin: 12, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, fontSize: 14 },
  modalEmpty: { textAlign: 'center', marginTop: 30, fontSize: 14 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  memberMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberEmail: { fontSize: 12, marginTop: 1 },
  checkBox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  coHostBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10 },
  doneBtn: { marginHorizontal: 12, marginTop: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  doneTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
