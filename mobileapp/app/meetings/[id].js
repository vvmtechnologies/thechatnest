import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import DateTimePicker from '../../src/components/SimpleDateTimePicker';
import { useAuth } from '../../src/store/AuthContext';
import { useTheme } from '../../src/store/ThemeContext';
import {
  getMeetingById,
  rsvpMeeting,
  changeMeetingStatus,
  deleteMeeting,
  updateMeeting,
  getMeetingAttendance,
} from '../../src/api/meetings';

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDuration = (ms) => {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

// Fold attendance sessions into per-user totals (mirrors web details dialog).
const foldSessions = (sessions = []) => {
  const map = new Map();
  for (const s of sessions) {
    const key = s.user_id != null ? `u-${s.user_id}` : `g-${s.display_name || s.socket_id || ''}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        userId: s.user_id || null,
        name: s.user_name || s.display_name || (s.user_id ? `User #${s.user_id}` : 'Guest'),
        email: s.user_email || null,
        firstJoinedAt: s.joined_at,
        lastLeftAt: s.left_at,
        totalMs: 0,
        sessions: 0,
        stillIn: false,
      });
    }
    const entry = map.get(key);
    entry.sessions += 1;
    if (s.joined_at && (!entry.firstJoinedAt || new Date(s.joined_at) < new Date(entry.firstJoinedAt))) {
      entry.firstJoinedAt = s.joined_at;
    }
    if (s.left_at) {
      if (!entry.lastLeftAt || new Date(s.left_at) > new Date(entry.lastLeftAt)) {
        entry.lastLeftAt = s.left_at;
      }
    } else {
      entry.stillIn = true;
    }
    if (s.joined_at) {
      const start = new Date(s.joined_at).getTime();
      const end = s.left_at ? new Date(s.left_at).getTime() : Date.now();
      if (Number.isFinite(start) && end > start) entry.totalMs += end - start;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalMs - a.totalMs);
};

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { theme: t } = useTheme();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  // QR share modal
  const [showQR, setShowQR] = useState(false);

  // Edit meeting modal
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWhen, setEditWhen] = useState(new Date());
  const [editDateOpen, setEditDateOpen] = useState(false);
  const [editTimeOpen, setEditTimeOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Attendance modal
  const [showAttendance, setShowAttendance] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const load = useCallback(async () => {
    try {
      const m = await getMeetingById(id);
      setMeeting(m?.meeting || m);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) Alert.alert('Not found', 'This meeting no longer exists.');
      else console.warn('[meeting] load failed:', e?.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const isHost = meeting && Number(meeting.host_id) === Number(user?.id);
  const status = String(meeting?.status || '').toLowerCase();
  const isLive = status === 'live' || status === 'active';
  const isPast = status === 'ended' || status === 'completed';
  const participants = meeting?.participants || [];

  const inviteUrl = useMemo(() => {
    if (!meeting?.meeting_id) return '';
    return `https://dream-phi-three.vercel.app/app/meeting?join=${encodeURIComponent(meeting.meeting_id)}`;
  }, [meeting?.meeting_id]);

  const qrSrc = useMemo(() => {
    if (!inviteUrl) return '';
    // Public QR rendering — no native deps. 220×220 px PNG.
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteUrl)}`;
  }, [inviteUrl]);

  const copyCode = async () => {
    if (!meeting?.meeting_id) return;
    await Clipboard.setStringAsync(String(meeting.meeting_id));
    Alert.alert('Copied', `Meeting code copied: ${meeting.meeting_id}`);
  };

  const copyLink = async () => {
    if (!inviteUrl) return;
    await Clipboard.setStringAsync(inviteUrl);
    Alert.alert('Copied', 'Invite link copied to clipboard.');
  };

  const setRsvp = async (rsvp) => {
    setBusy(true);
    try {
      await rsvpMeeting(id, rsvp);
      await load();
    } catch (e) {
      Alert.alert('Failed', e?.response?.data?.message || e.message);
    } finally { setBusy(false); }
  };

  const startMeeting = async () => {
    setBusy(true);
    try {
      await changeMeetingStatus(id, 'live');
      await load();
    } catch (e) {
      Alert.alert('Failed', e?.response?.data?.message || e.message);
    } finally { setBusy(false); }
  };

  const endMeeting = async () => {
    Alert.alert('End meeting?', 'This will end the meeting for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: async () => {
        setBusy(true);
        try {
          await changeMeetingStatus(id, 'ended');
          await load();
        } catch (e) {
          Alert.alert('Failed', e?.response?.data?.message || e.message);
        } finally { setBusy(false); }
      }},
    ]);
  };

  const removeMeeting = () => {
    Alert.alert('Delete meeting?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setBusy(true);
        try {
          await deleteMeeting(id);
          router.back();
        } catch (e) {
          Alert.alert('Failed', e?.response?.data?.message || e.message);
          setBusy(false);
        }
      }},
    ]);
  };

  const openEdit = () => {
    setEditTitle(meeting?.title || '');
    setEditDescription(meeting?.description || '');
    setEditWhen(meeting?.scheduled_at ? new Date(meeting.scheduled_at) : new Date(Date.now() + 30 * 60_000));
    setShowEdit(true);
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      const payload = {
        title: editTitle.trim() || 'Untitled meeting',
        description: editDescription.trim() || null,
      };
      if (meeting?.meeting_type === 'scheduled' || meeting?.scheduled_at) {
        payload.scheduled_at = editWhen.toISOString();
      }
      await updateMeeting(id, payload);
      setShowEdit(false);
      await load();
    } catch (e) {
      Alert.alert('Failed', e?.response?.data?.message || e.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const openAttendance = async () => {
    setShowAttendance(true);
    setLoadingAttendance(true);
    try {
      const data = await getMeetingAttendance(id);
      setAttendance(data);
    } catch (e) {
      console.warn('[attendance] load failed:', e?.message);
    } finally {
      setLoadingAttendance(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: t.bg }]}>
        <ActivityIndicator color={t.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!meeting) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: t.bg }]}>
        <Text style={[s.empty, { color: t.textSec }]}>Meeting not found.</Text>
      </SafeAreaView>
    );
  }

  const sessions = attendance?.sessions || attendance?.rows || attendance || [];
  const folded = foldSessions(Array.isArray(sessions) ? sessions : []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Meeting',
          headerStyle: { backgroundColor: t.bg },
          headerTitleStyle: { color: t.text, fontWeight: '700' },
          headerTintColor: t.text,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 4, marginRight: 6 }}>
              {!!meeting.meeting_id && (
                <TouchableOpacity onPress={() => setShowQR(true)} hitSlop={8} style={s.headerIcon}>
                  <Ionicons name="qr-code-outline" size={20} color={t.accent} />
                </TouchableOpacity>
              )}
              {isHost && !isLive && !isPast && (
                <TouchableOpacity onPress={openEdit} hitSlop={8} style={s.headerIcon}>
                  <Ionicons name="create-outline" size={20} color={t.accent} />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <SafeAreaView style={[s.container, { backgroundColor: t.bg }]} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
        >
          {/* Status badge */}
          <View style={s.statusRow}>
            {isLive && (
              <View style={[s.badge, { backgroundColor: '#dc262615' }]}>
                <View style={s.liveDot} />
                <Text style={s.liveTxt}>LIVE</Text>
              </View>
            )}
            {isPast && (
              <View style={[s.badge, { backgroundColor: t.surfaceAlt }]}>
                <Text style={[s.badgeTxt, { color: t.textSec }]}>ENDED</Text>
              </View>
            )}
            {!isLive && !isPast && (
              <View style={[s.badge, { backgroundColor: t.accentBg }]}>
                <Text style={[s.badgeTxt, { color: t.accent }]}>SCHEDULED</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={[s.title, { color: t.text }]}>{meeting.title || 'Untitled meeting'}</Text>
          {!!meeting.description && (
            <Text style={[s.description, { color: t.textSec }]}>{meeting.description}</Text>
          )}

          {/* Meta card */}
          <View style={[s.card, { backgroundColor: t.surface, borderColor: t.borderLight }]}>
            <View style={s.metaRow}>
              <Ionicons name="calendar-outline" size={18} color={t.textTer} />
              <Text style={[s.metaLabel, { color: t.textSec }]}>When</Text>
              <Text style={[s.metaValue, { color: t.text }]}>
                {formatDateTime(meeting.scheduled_at || meeting.started_at || meeting.created_at)}
              </Text>
            </View>
            {!!meeting.duration_minutes && (
              <>
                <View style={[s.divider, { backgroundColor: t.borderLight }]} />
                <View style={s.metaRow}>
                  <Ionicons name="hourglass-outline" size={18} color={t.textTer} />
                  <Text style={[s.metaLabel, { color: t.textSec }]}>Duration</Text>
                  <Text style={[s.metaValue, { color: t.text }]}>{meeting.duration_minutes}m</Text>
                </View>
              </>
            )}
            {!!meeting.recurrence_rule && meeting.recurrence_rule !== 'none' && (
              <>
                <View style={[s.divider, { backgroundColor: t.borderLight }]} />
                <View style={s.metaRow}>
                  <Ionicons name="repeat-outline" size={18} color={t.textTer} />
                  <Text style={[s.metaLabel, { color: t.textSec }]}>Repeats</Text>
                  <Text style={[s.metaValue, { color: t.text }]}>{meeting.recurrence_rule}</Text>
                </View>
              </>
            )}
            {!!meeting.reminder_sent_at && (
              <>
                <View style={[s.divider, { backgroundColor: t.borderLight }]} />
                <View style={s.metaRow}>
                  <Ionicons name="notifications-outline" size={18} color={t.textTer} />
                  <Text style={[s.metaLabel, { color: t.textSec }]}>Reminder sent</Text>
                  <Text style={[s.metaValue, { color: t.text }]}>
                    {formatDateTime(meeting.reminder_sent_at)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Code + link */}
          {!!meeting.meeting_id && (
            <View style={[s.card, { backgroundColor: t.surface, borderColor: t.borderLight }]}>
              <Text style={[s.cardLabel, { color: t.textSec }]}>Meeting code</Text>
              <Text style={[s.code, { color: t.text }]}>{meeting.meeting_id}</Text>
              <View style={s.actionRow}>
                <TouchableOpacity
                  style={[s.smallBtn, { backgroundColor: t.accentBg }]}
                  onPress={copyCode}
                  activeOpacity={0.7}
                >
                  <Ionicons name="copy-outline" size={14} color={t.accent} />
                  <Text style={[s.smallBtnTxt, { color: t.accent }]}>Copy code</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.smallBtn, { backgroundColor: t.accentBg }]}
                  onPress={copyLink}
                  activeOpacity={0.7}
                >
                  <Ionicons name="link-outline" size={14} color={t.accent} />
                  <Text style={[s.smallBtnTxt, { color: t.accent }]}>Copy link</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.smallBtn, { backgroundColor: t.accentBg }]}
                  onPress={() => setShowQR(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="qr-code-outline" size={14} color={t.accent} />
                  <Text style={[s.smallBtnTxt, { color: t.accent }]}>QR</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Passcode */}
          {!!meeting.passcode && (
            <View style={[s.card, { backgroundColor: t.surface, borderColor: t.borderLight }]}>
              <Text style={[s.cardLabel, { color: t.textSec }]}>Passcode</Text>
              <Text style={[s.code, { color: t.text }]}>{meeting.passcode}</Text>
            </View>
          )}

          {/* Participants */}
          {participants.length > 0 && (
            <View style={[s.card, { backgroundColor: t.surface, borderColor: t.borderLight }]}>
              <Text style={[s.cardLabel, { color: t.textSec }]}>Participants ({participants.length})</Text>
              {participants.slice(0, 10).map((p, i) => (
                <View key={p.id || p.user_id || i} style={s.participantRow}>
                  <View style={[s.avatarFallback, { backgroundColor: t.accentBg }]}>
                    <Text style={{ color: t.accent, fontWeight: '700', fontSize: 12 }}>
                      {(p.display_name || p.email || '?').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[s.participantName, { color: t.text }]} numberOfLines={1}>
                    {p.display_name || p.email || `User #${p.user_id}`}
                  </Text>
                  {p.role === 'host' && (
                    <View style={[s.roleBadge, { backgroundColor: t.accentBg }]}>
                      <Text style={[s.roleBadgeTxt, { color: t.accent }]}>HOST</Text>
                    </View>
                  )}
                  {(p.role === 'co_host' || p.role === 'co-host') && (
                    <View style={[s.roleBadge, { backgroundColor: '#10b98115' }]}>
                      <Text style={[s.roleBadgeTxt, { color: '#10b981' }]}>CO-HOST</Text>
                    </View>
                  )}
                </View>
              ))}
              {participants.length > 10 && (
                <Text style={[s.metaLabel, { color: t.textTer, marginTop: 8 }]}>
                  +{participants.length - 10} more
                </Text>
              )}
            </View>
          )}

          {/* Attendance — host only, available for live or past meetings */}
          {isHost && (isLive || isPast) && (
            <TouchableOpacity
              style={[s.card, { backgroundColor: t.surface, borderColor: t.borderLight, flexDirection: 'row', alignItems: 'center', gap: 12 }]}
              onPress={openAttendance}
              activeOpacity={0.7}
            >
              <View style={[s.avatarFallback, { backgroundColor: t.accentBg, width: 40, height: 40, borderRadius: 20 }]}>
                <Ionicons name="analytics-outline" size={20} color={t.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.cardLabel, { color: t.textSec, marginBottom: 2 }]}>Attendance report</Text>
                <Text style={{ color: t.text, fontSize: 14, fontWeight: '600' }}>View who joined and for how long</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={t.textTer} />
            </TouchableOpacity>
          )}

          {/* RSVP (non-host, not past) */}
          {!isHost && !isPast && (
            <View style={[s.card, { backgroundColor: t.surface, borderColor: t.borderLight }]}>
              <Text style={[s.cardLabel, { color: t.textSec }]}>Will you attend?</Text>
              <View style={s.rsvpRow}>
                {['yes', 'maybe', 'no'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[s.rsvpBtn, { borderColor: t.inputBorder }]}
                    onPress={() => setRsvp(r)}
                    disabled={busy}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.rsvpTxt, { color: t.text }]}>
                      {r === 'yes' ? '✓ Yes' : r === 'maybe' ? '? Maybe' : '✗ No'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        </ScrollView>

        {/* Action bar */}
        <View style={[s.actionBar, { backgroundColor: t.surface, borderTopColor: t.borderLight }]}>
          {isHost && !isLive && !isPast && (
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: t.accent }]}
              onPress={async () => {
                await startMeeting();
                router.push(`/meetings/room/${id}`);
              }}
              disabled={busy}
              activeOpacity={0.85}
            >
              <Ionicons name="videocam" size={18} color="#fff" />
              <Text style={s.actionTxt}>Start meeting</Text>
            </TouchableOpacity>
          )}
          {isLive && !isHost && (
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: t.accent }]}
              onPress={() => router.push(`/meetings/room/${id}`)}
              disabled={busy}
              activeOpacity={0.85}
            >
              <Ionicons name="enter" size={18} color="#fff" />
              <Text style={s.actionTxt}>Join now</Text>
            </TouchableOpacity>
          )}
          {isHost && isLive && (
            <>
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: t.accent }]}
                onPress={() => router.push(`/meetings/room/${id}`)}
                disabled={busy}
                activeOpacity={0.85}
              >
                <Ionicons name="enter" size={18} color="#fff" />
                <Text style={s.actionTxt}>Rejoin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.iconBtn, { backgroundColor: '#dc262615' }]}
                onPress={endMeeting}
                disabled={busy}
                activeOpacity={0.7}
              >
                <Ionicons name="stop" size={18} color="#dc2626" />
              </TouchableOpacity>
            </>
          )}
          {isHost && !isLive && (
            <TouchableOpacity
              style={[s.iconBtn, { backgroundColor: t.surfaceAlt }]}
              onPress={removeMeeting}
              disabled={busy}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={t.textSec} />
            </TouchableOpacity>
          )}
        </View>

        {/* QR Modal */}
        <Modal visible={showQR} animationType="fade" transparent onRequestClose={() => setShowQR(false)}>
          <View style={s.modalOverlay}>
            <View style={[s.qrCard, { backgroundColor: t.surface }]}>
              <View style={s.qrHeader}>
                <Text style={[s.qrHeading, { color: t.text }]}>Share meeting</Text>
                <TouchableOpacity onPress={() => setShowQR(false)} hitSlop={10}>
                  <Ionicons name="close" size={22} color={t.text} />
                </TouchableOpacity>
              </View>
              <Text style={[s.qrSub, { color: t.textSec }]}>{meeting.title}</Text>
              <View style={s.qrImageWrap}>
                <Image source={{ uri: qrSrc }} style={s.qrImage} />
              </View>
              <Text style={[s.code, { color: t.text, textAlign: 'center', marginTop: 8 }]}>
                {meeting.meeting_id}
              </Text>
              <TouchableOpacity
                style={[s.qrLinkBtn, { backgroundColor: t.accent }]}
                onPress={copyLink}
                activeOpacity={0.85}
              >
                <Ionicons name="link" size={16} color="#fff" />
                <Text style={s.qrLinkTxt}>Copy invite link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={showEdit} animationType="slide" transparent onRequestClose={() => setShowEdit(false)}>
          <View style={s.modalOverlay}>
            <View style={[s.editCard, { backgroundColor: t.surface }]}>
              <View style={s.qrHeader}>
                <Text style={[s.qrHeading, { color: t.text }]}>Edit meeting</Text>
                <TouchableOpacity onPress={() => setShowEdit(false)} hitSlop={10}>
                  <Ionicons name="close" size={22} color={t.text} />
                </TouchableOpacity>
              </View>
              <Text style={[s.label, { color: t.textSec }]}>Title</Text>
              <TextInput
                style={[s.input, { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.text }]}
                value={editTitle}
                onChangeText={setEditTitle}
                maxLength={100}
              />
              <Text style={[s.label, { color: t.textSec }]}>Description</Text>
              <TextInput
                style={[s.input, s.textarea, { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.text }]}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                maxLength={1000}
              />
              {(meeting?.meeting_type === 'scheduled' || meeting?.scheduled_at) && (
                <>
                  <Text style={[s.label, { color: t.textSec }]}>When</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={[s.pickerBtn, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}
                      onPress={() => setEditDateOpen(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="calendar-outline" size={16} color={t.textSec} />
                      <Text style={[s.pickerTxt, { color: t.text }]}>
                        {editWhen.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.pickerBtn, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}
                      onPress={() => setEditTimeOpen(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="time-outline" size={16} color={t.textSec} />
                      <Text style={[s.pickerTxt, { color: t.text }]}>
                        {editWhen.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {editDateOpen && (
                    <DateTimePicker
                      value={editWhen}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      minimumDate={new Date()}
                      onChange={(event, picked) => {
                        if (Platform.OS === 'android') setEditDateOpen(false);
                        if (event?.type === 'dismissed') return;
                        if (picked) {
                          const next = new Date(editWhen);
                          next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
                          setEditWhen(next);
                        }
                      }}
                    />
                  )}
                  {editTimeOpen && (
                    <DateTimePicker
                      value={editWhen}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, picked) => {
                        if (Platform.OS === 'android') setEditTimeOpen(false);
                        if (event?.type === 'dismissed') return;
                        if (picked) {
                          const next = new Date(editWhen);
                          next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
                          setEditWhen(next);
                        }
                      }}
                    />
                  )}
                  {Platform.OS === 'ios' && (editDateOpen || editTimeOpen) && (
                    <TouchableOpacity
                      style={[s.iosDone, { backgroundColor: t.accent }]}
                      onPress={() => { setEditDateOpen(false); setEditTimeOpen(false); }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              <TouchableOpacity
                style={[s.qrLinkBtn, { backgroundColor: t.accent, opacity: savingEdit ? 0.6 : 1, marginTop: 16 }]}
                onPress={saveEdit}
                disabled={savingEdit}
                activeOpacity={0.85}
              >
                {savingEdit ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save" size={16} color="#fff" />
                    <Text style={s.qrLinkTxt}>Save changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Attendance Modal */}
        <Modal visible={showAttendance} animationType="slide" transparent onRequestClose={() => setShowAttendance(false)}>
          <View style={s.modalOverlay}>
            <View style={[s.attCard, { backgroundColor: t.surface }]}>
              <View style={s.qrHeader}>
                <Text style={[s.qrHeading, { color: t.text }]}>Attendance</Text>
                <TouchableOpacity onPress={() => setShowAttendance(false)} hitSlop={10}>
                  <Ionicons name="close" size={22} color={t.text} />
                </TouchableOpacity>
              </View>
              {loadingAttendance ? (
                <ActivityIndicator color={t.accent} style={{ marginVertical: 30 }} />
              ) : folded.length === 0 ? (
                <Text style={{ textAlign: 'center', color: t.textTer, marginVertical: 30 }}>
                  No attendance recorded yet.
                </Text>
              ) : (
                <FlatList
                  data={folded}
                  keyExtractor={(item) => item.key}
                  contentContainerStyle={{ paddingBottom: 12 }}
                  renderItem={({ item }) => (
                    <View style={[s.attRow, { borderBottomColor: t.borderLight }]}>
                      <View style={[s.avatarFallback, { backgroundColor: t.accentBg, width: 36, height: 36, borderRadius: 18 }]}>
                        <Text style={{ color: t.accent, fontWeight: '700' }}>
                          {(item.name || '?').slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.text, fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {!!item.email && (
                          <Text style={{ color: t.textTer, fontSize: 11 }} numberOfLines={1}>{item.email}</Text>
                        )}
                        <Text style={{ color: t.textSec, fontSize: 11, marginTop: 2 }}>
                          {item.sessions} session{item.sessions === 1 ? '' : 's'} · joined {formatDateTime(item.firstJoinedAt)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }}>
                          {formatDuration(item.totalMs)}
                        </Text>
                        {item.stillIn && (
                          <View style={[s.badge, { backgroundColor: '#dc262615', marginTop: 4 }]}>
                            <View style={s.liveDot} />
                            <Text style={s.liveTxt}>IN</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  statusRow: { flexDirection: 'row', marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#dc2626' },
  liveTxt: { fontSize: 11, fontWeight: '900', color: '#dc2626', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  description: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 14 },
  cardLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  code: { fontSize: 18, fontWeight: '700', fontFamily: 'monospace', letterSpacing: 1 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallBtnTxt: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  metaLabel: { fontSize: 13, width: 110 },
  metaValue: { flex: 1, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  divider: { height: 1, marginVertical: 6 },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  avatarFallback: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  participantName: { flex: 1, fontSize: 14 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleBadgeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  rsvpRow: { flexDirection: 'row', gap: 8 },
  rsvpBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  rsvpTxt: { fontSize: 13, fontWeight: '600' },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, borderTopWidth: 1, flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  actionTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  iconBtn: { width: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  headerIcon: { paddingHorizontal: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 24 },
  qrCard: { width: '100%', maxWidth: 340, borderRadius: 20, padding: 20, alignSelf: 'center' },
  qrHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  qrHeading: { fontSize: 17, fontWeight: '800' },
  qrSub: { fontSize: 13, marginBottom: 16, textAlign: 'center' },
  qrImageWrap: { alignSelf: 'center', padding: 14, backgroundColor: '#fff', borderRadius: 12 },
  qrImage: { width: 220, height: 220 },
  qrLinkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, marginTop: 16 },
  qrLinkTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  editCard: { width: '100%', maxWidth: 420, borderRadius: 20, padding: 20, alignSelf: 'center', maxHeight: '90%' },
  label: { fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textarea: { minHeight: 70, textAlignVertical: 'top', paddingTop: 12 },
  pickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  pickerTxt: { fontSize: 14, fontWeight: '600' },
  iosDone: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 4 },
  attCard: { width: '100%', maxWidth: 460, borderRadius: 20, padding: 16, alignSelf: 'center', maxHeight: '85%' },
  attRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
});
