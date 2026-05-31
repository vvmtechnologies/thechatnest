import { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { useAuth } from '../../../src/store/AuthContext';
import { useTheme } from '../../../src/store/ThemeContext';
import useMeeting, { isWebrtcAvailable } from '../../../src/hooks/useMeeting';
import { getMeetingById, setCoHost } from '../../../src/api/meetings';

// react-native-webrtc's <RTCView> renders the live stream. Lazy-required so
// Expo Go (no native module) doesn't crash on import.
let RTCView = null;
try { RTCView = require('react-native-webrtc').RTCView; } catch {}

const { width: SCREEN_W } = Dimensions.get('window');

const REACTIONS = [
  { key: '👏', label: 'Clap' },
  { key: '❤️', label: 'Love' },
  { key: '🎉', label: 'Party' },
  { key: '😂', label: 'Laugh' },
  { key: '👍', label: 'Thumbs up' },
  { key: '🤔', label: 'Hmm' },
];

const fmtDuration = (sec) => {
  const s = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return `${m}:${String(ss).padStart(2, '0')}`;
};

const initialsOf = (name) => {
  const n = String(name || '').trim();
  if (!n) return '?';
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const QUALITY = {
  good:    { color: '#22c55e', label: 'Good' },
  fair:    { color: '#f59e0b', label: 'Fair' },
  poor:    { color: '#ef4444', label: 'Poor' },
  unknown: { color: '#64748b', label: '…' },
};

const ParticipantTile = ({ participant, theme: t, isLocal, isPinned, onPin, dimensions }) => {
  const stream = participant?.stream;
  const isVideoOff = !participant?.video;
  const isScreenShare = !!participant?.screenShare;
  const handRaised = !!participant?.handRaised;

  return (
    <View style={[s.tile, dimensions, isPinned && { borderColor: t.accent, borderWidth: 2 }]}>
      {!isVideoOff && stream && RTCView ? (
        <RTCView
          streamURL={stream.toURL ? stream.toURL() : ''}
          style={s.video}
          objectFit={isScreenShare ? 'contain' : 'cover'}
          mirror={isLocal && !isScreenShare}
        />
      ) : (
        <View style={[s.placeholder, { backgroundColor: '#0f172a' }]}>
          <View style={[s.avatarFallback, { backgroundColor: '#334155' }]}>
            <Text style={s.avatarTxt}>{initialsOf(participant?.userName || 'You')}</Text>
          </View>
        </View>
      )}

      <View style={s.tileOverlay}>
        <View style={s.tileNameRow}>
          {isScreenShare && (
            <Ionicons name="desktop-outline" size={12} color="#fff" style={{ marginRight: 4 }} />
          )}
          <Text style={s.tileName} numberOfLines={1}>
            {isLocal ? 'You' : (participant?.userName || 'Guest')}
          </Text>
          {!participant?.audio && (
            <Ionicons name="mic-off" size={12} color="#fff" style={{ marginLeft: 4 }} />
          )}
        </View>
        {handRaised && (
          <View style={s.handBadge}>
            <Text style={{ fontSize: 14 }}>✋</Text>
          </View>
        )}
      </View>
      {!isLocal && (
        <TouchableOpacity style={s.pinBtn} onPress={onPin} hitSlop={8}>
          <Ionicons name={isPinned ? 'pin' : 'pin-outline'} size={14} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function MeetingRoomScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { theme: t } = useTheme();
  const meeting = useMeeting();
  const insets = useSafeAreaInsets();
  const controlsBottom = Math.max(insets.bottom, 12);
  const controlsHeight = 68;
  const scrollBottomPad = controlsBottom + controlsHeight + 16;
  const [meetingData, setMeetingData] = useState(null);
  const [coHostIds, setCoHostIds] = useState(new Set()); // user_id Set
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const joinedRef = useRef(false);

  const userName = useMemo(() => (
    user?.name || user?.email?.split?.('@')[0] || 'User'
  ), [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = await getMeetingById(id);
        if (cancelled) return;
        const data = m?.meeting || m;
        setMeetingData(data);
        // Seed co-host set from initial participants (role === 'co_host' or 'co-host')
        const seed = new Set();
        (data?.participants || []).forEach((p) => {
          const role = String(p.role || '').toLowerCase();
          if (role === 'co_host' || role === 'co-host') seed.add(Number(p.user_id));
        });
        setCoHostIds(seed);
        const roomId = data?.meeting_id || data?.id;
        if (!isWebrtcAvailable()) {
          Alert.alert(
            'Video unavailable',
            'WebRTC is not available in Expo Go. Build the app with EAS to use the meeting room.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
        if (joinedRef.current) return;
        joinedRef.current = true;
        const res = await meeting.joinMeeting({ meetingRoomId: roomId, meetingData: data, userName });
        if (cancelled) return;
        if (res?.error) {
          Alert.alert('Could not join', String(res.error), [{ text: 'OK', onPress: () => router.back() }]);
        }
      } catch (e) {
        if (!cancelled) Alert.alert('Failed to load meeting', e?.response?.data?.message || e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      try { meeting.leaveMeeting(); } catch {}
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isHost = meetingData && Number(meetingData.host_id) === Number(user?.id);
  const isCoHost = coHostIds.has(Number(user?.id));
  const canManage = isHost || isCoHost;

  const allTiles = useMemo(() => {
    const me = {
      socketId: 'self',
      userId: user?.id,
      userName,
      stream: meeting.localStream,
      audio: !meeting.isMuted,
      video: !meeting.isVideoOff || meeting.isScreenSharing,
      screenShare: meeting.isScreenSharing,
      handRaised: meeting.handRaised,
      isLocal: true,
    };
    return [me, ...meeting.participants.map((p) => ({ ...p, isLocal: false }))];
  }, [meeting.localStream, meeting.isMuted, meeting.isVideoOff, meeting.isScreenSharing, meeting.handRaised, meeting.participants, user?.id, userName]);

  // Spotlight (host-set, wins over personal pin) overrides personal pin.
  const effectivePinnedId = meeting.spotlightSocketId || meeting.pinnedSocketId;
  const pinnedTile = useMemo(() => {
    if (!effectivePinnedId) {
      // Auto-pin any active screen share
      const sharer = allTiles.find((p) => p.screenShare && !p.isLocal);
      if (sharer) return sharer;
      return null;
    }
    return allTiles.find((p) => p.socketId === effectivePinnedId) || null;
  }, [allTiles, effectivePinnedId]);

  const otherTiles = pinnedTile
    ? allTiles.filter((p) => p.socketId !== pinnedTile.socketId)
    : allTiles;

  const gridTileSize = useMemo(() => {
    const n = otherTiles.length;
    if (n <= 1) return { width: SCREEN_W - 16, height: 220 };
    if (n === 2) return { width: SCREEN_W / 2 - 12, height: 220 };
    if (n <= 4) return { width: SCREEN_W / 2 - 12, height: 160 };
    return { width: SCREEN_W / 3 - 10, height: 130 };
  }, [otherTiles.length]);

  const handleLeave = () => {
    Alert.alert('Leave meeting?', 'You can rejoin later with the meeting code.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => { meeting.leaveMeeting(); router.back(); } },
    ]);
  };

  const handleScreenShare = async () => {
    try {
      await meeting.toggleScreenShare();
    } catch (err) {
      Alert.alert('Screen share unavailable', err?.message || 'Screen sharing failed.');
    }
  };

  const sendEmoji = (emoji) => {
    meeting.sendReaction(emoji);
    setShowReactions(false);
  };

  const toggleSpotlight = (socketId) => {
    if (!canManage) return;
    const same = meeting.spotlightSocketId === socketId;
    meeting.spotlight(same ? null : socketId);
  };

  const promoteToCoHost = async (userId) => {
    if (!isHost) return;
    const wasCoHost = coHostIds.has(Number(userId));
    setCoHostIds((prev) => {
      const next = new Set(prev);
      if (wasCoHost) next.delete(Number(userId)); else next.add(Number(userId));
      return next;
    });
    try {
      await setCoHost(meetingData.id, userId, !wasCoHost);
    } catch (e) {
      // Roll back
      setCoHostIds((prev) => {
        const next = new Set(prev);
        if (wasCoHost) next.add(Number(userId)); else next.delete(Number(userId));
        return next;
      });
      Alert.alert('Failed', e?.response?.data?.message || e.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: '#0f172a' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color="#fff" size="large" style={{ marginTop: 80 }} />
        <Text style={s.loadingTxt}>Joining meeting…</Text>
      </SafeAreaView>
    );
  }

  const quality = QUALITY[meeting.networkQuality] || QUALITY.unknown;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SafeAreaView style={[s.container, { backgroundColor: '#0f172a' }]} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle} numberOfLines={1}>
              {meetingData?.title || 'Meeting'}
            </Text>
            <View style={s.headerMeta}>
              <View style={s.liveDot} />
              <Text style={s.headerTime}>{fmtDuration(meeting.duration)}</Text>
              <Text style={s.headerCount}> · {allTiles.length} participant{allTiles.length === 1 ? '' : 's'}</Text>
              <View style={[s.qDot, { backgroundColor: quality.color }]} />
            </View>
          </View>
          {canManage && (
            <TouchableOpacity
              style={[s.headerBtn, meeting.isLocked && { backgroundColor: '#dc262633' }]}
              onPress={() => meeting.setLocked(!meeting.isLocked)}
              hitSlop={8}
            >
              <Ionicons
                name={meeting.isLocked ? 'lock-closed' : 'lock-open-outline'}
                size={18}
                color={meeting.isLocked ? '#ef4444' : '#fff'}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.headerBtn} onPress={() => setShowParticipants(true)} hitSlop={8}>
            <Ionicons name="people-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stage: pinned tile (if any) + grid */}
        <ScrollView contentContainerStyle={{ padding: 8, paddingBottom: scrollBottomPad }}>
          {pinnedTile && (
            <ParticipantTile
              participant={pinnedTile}
              theme={t}
              isLocal={pinnedTile.isLocal}
              isPinned
              onPin={() => meeting.pinParticipant(pinnedTile.socketId)}
              dimensions={{ width: SCREEN_W - 16, height: 280, marginBottom: 8 }}
            />
          )}
          <View style={s.grid}>
            {otherTiles.map((p) => (
              <ParticipantTile
                key={p.socketId}
                participant={p}
                theme={t}
                isLocal={p.isLocal}
                isPinned={false}
                onPin={() => !p.isLocal && meeting.pinParticipant(p.socketId)}
                dimensions={gridTileSize}
              />
            ))}
          </View>

          {/* Floating reactions feed */}
          {meeting.reactions.length > 0 && (
            <View style={s.reactionsBar}>
              {meeting.reactions.slice(-5).map((r) => (
                <Text key={r.id} style={s.reactionItem}>
                  {r.reaction === 'hand-raise' || r.reaction === 'hand-lower' ? '✋' : r.reaction} {r.userName}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom controls */}
        <View style={[s.controls, { bottom: controlsBottom }]}>
          <TouchableOpacity
            style={[s.ctrlBtn, meeting.isMuted ? s.ctrlOff : s.ctrlOn]}
            onPress={meeting.toggleMute}
            activeOpacity={0.8}
          >
            <Ionicons name={meeting.isMuted ? 'mic-off' : 'mic'} size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.ctrlBtn, meeting.isVideoOff ? s.ctrlOff : s.ctrlOn]}
            onPress={meeting.toggleVideo}
            activeOpacity={0.8}
          >
            <Ionicons name={meeting.isVideoOff ? 'videocam-off' : 'videocam'} size={20} color="#fff" />
          </TouchableOpacity>
          {!meeting.isVideoOff && (
            <TouchableOpacity style={[s.ctrlBtn, s.ctrlOn]} onPress={meeting.switchCamera} activeOpacity={0.8}>
              <Ionicons name="camera-reverse-outline" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.ctrlBtn, meeting.isScreenSharing ? { backgroundColor: '#3b82f6' } : s.ctrlOn]}
            onPress={handleScreenShare}
            activeOpacity={0.8}
          >
            <Ionicons name="desktop-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.ctrlBtn, meeting.handRaised ? { backgroundColor: '#f59e0b' } : s.ctrlOn]}
            onPress={meeting.toggleHandRaise}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 18 }}>✋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.ctrlBtn, s.ctrlOn]}
            onPress={() => setShowReactions(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="happy-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.ctrlBtn, s.ctrlOn]} onPress={() => setShowChat(true)} activeOpacity={0.8}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            {meeting.chatMessages.length > 0 && (
              <View style={s.badgeDot}>
                <Text style={s.badgeTxt}>{meeting.chatMessages.length > 9 ? '9+' : meeting.chatMessages.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[s.ctrlBtn, s.endBtn]} onPress={handleLeave} activeOpacity={0.85}>
            <Ionicons name="call" size={20} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>

        {/* Reactions picker — small horizontal strip above controls */}
        <Modal visible={showReactions} animationType="fade" transparent onRequestClose={() => setShowReactions(false)}>
          <TouchableOpacity
            style={s.reactionsOverlay}
            activeOpacity={1}
            onPress={() => setShowReactions(false)}
          >
            <View style={[s.reactionsTray, { bottom: controlsBottom + controlsHeight + 16 }]}>
              {REACTIONS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={s.reactionTrayBtn}
                  onPress={() => sendEmoji(r.key)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24 }}>{r.key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Chat panel */}
        <Modal visible={showChat} animationType="slide" transparent onRequestClose={() => setShowChat(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={s.chatOverlay}
          >
            <View style={[s.chatPanel, { backgroundColor: '#1e293b' }]}>
              <View style={s.chatHeader}>
                <Text style={s.chatTitle}>In-meeting chat</Text>
                <TouchableOpacity onPress={() => setShowChat(false)} hitSlop={8}>
                  <Ionicons name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={meeting.chatMessages}
                keyExtractor={(_, i) => String(i)}
                contentContainerStyle={{ padding: 12 }}
                renderItem={({ item }) => (
                  <View style={s.chatMsg}>
                    <Text style={s.chatMsgAuthor}>{item.userName || 'Guest'}</Text>
                    <Text style={s.chatMsgBody}>{item.message}</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={[s.chatMsgBody, { textAlign: 'center', marginTop: 40 }]}>
                    No messages yet. Say hi!
                  </Text>
                }
              />
              <View style={s.chatInputRow}>
                <TextInput
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Type a message"
                  placeholderTextColor="#64748b"
                  style={s.chatInput}
                  onSubmitEditing={() => {
                    if (chatInput.trim()) { meeting.sendChatMessage(chatInput); setChatInput(''); }
                  }}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={[s.chatSendBtn, { backgroundColor: t.accent }]}
                  onPress={() => {
                    if (chatInput.trim()) { meeting.sendChatMessage(chatInput); setChatInput(''); }
                  }}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Participants panel */}
        <Modal visible={showParticipants} animationType="slide" transparent onRequestClose={() => setShowParticipants(false)}>
          <View style={s.chatOverlay}>
            <View style={[s.chatPanel, { backgroundColor: '#1e293b' }]}>
              <View style={s.chatHeader}>
                <Text style={s.chatTitle}>Participants ({allTiles.length})</Text>
                <TouchableOpacity onPress={() => setShowParticipants(false)} hitSlop={8}>
                  <Ionicons name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={allTiles}
                keyExtractor={(item) => String(item.socketId)}
                contentContainerStyle={{ padding: 12 }}
                renderItem={({ item }) => {
                  const itemUid = Number(item.userId);
                  const isThemCoHost = coHostIds.has(itemUid);
                  const isThemHost = meetingData && Number(meetingData.host_id) === itemUid;
                  const isSpotlit = meeting.spotlightSocketId === item.socketId;
                  return (
                    <View style={s.participantRow}>
                      <View style={[s.smallAvatar, { backgroundColor: '#334155' }]}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                          {initialsOf(item.userName)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.participantName} numberOfLines={1}>
                          {item.isLocal ? `${item.userName} (You)` : item.userName}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                          {isThemHost && (
                            <Text style={[s.tag, { backgroundColor: '#fef3c733', color: '#facc15' }]}>HOST</Text>
                          )}
                          {isThemCoHost && !isThemHost && (
                            <Text style={[s.tag, { backgroundColor: '#10b98133', color: '#34d399' }]}>CO-HOST</Text>
                          )}
                          {isSpotlit && (
                            <Text style={[s.tag, { backgroundColor: '#3b82f633', color: '#60a5fa' }]}>SPOTLIT</Text>
                          )}
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        {!item.audio && <Ionicons name="mic-off" size={14} color="#94a3b8" />}
                        {!item.video && !item.screenShare && <Ionicons name="videocam-off" size={14} color="#94a3b8" />}
                        {item.screenShare && <Ionicons name="desktop-outline" size={14} color="#60a5fa" />}
                        {item.handRaised && <Text>✋</Text>}
                      </View>
                      {canManage && !item.isLocal && (
                        <TouchableOpacity
                          onPress={() => toggleSpotlight(item.socketId)}
                          hitSlop={8}
                          style={[s.actionIcon, isSpotlit && { backgroundColor: '#3b82f633' }]}
                        >
                          <Ionicons name="star" size={14} color={isSpotlit ? '#60a5fa' : '#94a3b8'} />
                        </TouchableOpacity>
                      )}
                      {isHost && !item.isLocal && !isThemHost && (
                        <TouchableOpacity
                          onPress={() => promoteToCoHost(itemUid)}
                          hitSlop={8}
                          style={[s.actionIcon, isThemCoHost && { backgroundColor: '#10b98133' }]}
                        >
                          <Ionicons name="ribbon" size={14} color={isThemCoHost ? '#34d399' : '#94a3b8'} />
                        </TouchableOpacity>
                      )}
                      {isHost && !item.isLocal && (
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert('Remove participant?', `Remove ${item.userName} from the meeting?`, [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Remove', style: 'destructive', onPress: () => meeting.removeParticipant(item.socketId, item.userId) },
                            ]);
                          }}
                          hitSlop={8}
                          style={s.actionIcon}
                        >
                          <Ionicons name="person-remove-outline" size={14} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
              />
              {canManage && (
                <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: '#334155', flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[s.muteAllBtn, { backgroundColor: t.accent, flex: 1 }]}
                    onPress={() => {
                      meeting.muteAll();
                      setShowParticipants(false);
                    }}
                  >
                    <Ionicons name="mic-off" size={16} color="#fff" />
                    <Text style={s.muteAllTxt}>Mute everyone</Text>
                  </TouchableOpacity>
                </View>
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
  loadingTxt: { color: '#94a3b8', textAlign: 'center', marginTop: 12, fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  headerTime: { color: '#94a3b8', fontSize: 12, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) },
  headerCount: { color: '#64748b', fontSize: 12 },
  qDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444', marginRight: 6 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tile: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
  video: { flex: 1, width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarFallback: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: '700' },
  tileOverlay: { position: 'absolute', left: 8, right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileNameRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tileName: { color: '#fff', fontSize: 11, fontWeight: '600', maxWidth: 100 },
  handBadge: { backgroundColor: 'rgba(245,158,11,0.9)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
  pinBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(15,23,42,0.6)', padding: 6, borderRadius: 14 },
  reactionsBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingHorizontal: 8 },
  reactionItem: { color: '#fff', fontSize: 12, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  controls: {
    position: 'absolute', left: 12, right: 12, bottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 10, borderRadius: 30, backgroundColor: 'rgba(30,41,59,0.95)',
  },
  ctrlBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  ctrlOn: { backgroundColor: '#475569' },
  ctrlOff: { backgroundColor: '#ef4444' },
  endBtn: { backgroundColor: '#dc2626', width: 52, height: 44, borderRadius: 22 },
  badgeDot: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444', minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  reactionsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  reactionsTray: {
    position: 'absolute', left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: 'rgba(30,41,59,0.97)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 8,
  },
  reactionTrayBtn: { padding: 8 },
  chatOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  chatPanel: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', minHeight: 320 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#334155' },
  chatTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  chatMsg: { paddingVertical: 6 },
  chatMsgAuthor: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
  chatMsgBody: { color: '#f1f5f9', fontSize: 14, marginTop: 2 },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  chatInput: { flex: 1, color: '#fff', backgroundColor: '#0f172a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  chatSendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  smallAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  participantName: { color: '#f1f5f9', fontSize: 14 },
  tag: { fontSize: 9, fontWeight: '800', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, letterSpacing: 0.4, overflow: 'hidden' },
  actionIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  muteAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  muteAllTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
