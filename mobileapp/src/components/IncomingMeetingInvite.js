import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useSocket from '../hooks/useSocket';
import { useTheme } from '../store/ThemeContext';

// Global popup that listens for `meeting:invited` socket events and shows
// an Accept / Decline prompt regardless of which screen the user is on.
// Mirrors the web frontend's MeetingInviteDialog. Mounted once at the root
// inside InnerLayout (see app/_layout.js).
export default function IncomingMeetingInvite() {
  const { on } = useSocket();
  const { theme: t } = useTheme();
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    const unsub = on('meeting:invited', (data) => {
      if (!data?.meetingId) return;
      setInvite({
        meetingId: data.meetingId,
        title: data.meetingTitle || 'Meeting',
        hostName: data.hostName || 'Someone',
      });
      // Auto-dismiss after 30s if the user does nothing
      setTimeout(() => {
        setInvite((cur) => (cur && cur.meetingId === data.meetingId ? null : cur));
      }, 30_000);
    });
    return () => unsub?.();
  }, [on]);

  if (!invite) return null;

  const handleJoin = () => {
    const meetingId = invite.meetingId;
    setInvite(null);
    // The backend uses meeting_id (string code) for routing. The router
    // accepts both numeric pk and the code via /meetings/:id (resolved by
    // getMeetingById). Push by id and let the details screen handle.
    router.push(`/meetings/${meetingId}`);
  };

  return (
    <Modal visible animationType="fade" transparent onRequestClose={() => setInvite(null)}>
      <View style={s.overlay}>
        <View style={[s.card, { backgroundColor: t.surface }]}>
          <View style={[s.iconWrap, { backgroundColor: t.accentBg }]}>
            <Ionicons name="videocam" size={36} color={t.accent} />
          </View>
          <Text style={[s.heading, { color: t.text }]}>Meeting Invitation</Text>
          <Text style={[s.host, { color: t.textSec }]}>
            <Text style={{ fontWeight: '700' }}>{invite.hostName}</Text> invited you to
          </Text>
          <Text style={[s.title, { color: t.accent }]} numberOfLines={2}>
            {invite.title}
          </Text>
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: t.surfaceAlt }]}
              onPress={() => setInvite(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={t.text} />
              <Text style={[s.btnTxt, { color: t.text }]}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: t.accent }]}
              onPress={handleJoin}
              activeOpacity={0.85}
            >
              <Ionicons name="videocam" size={18} color="#fff" />
              <Text style={[s.btnTxt, { color: '#fff' }]}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, borderRadius: 20, padding: 24, alignItems: 'center' },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heading: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  host: { fontSize: 14, textAlign: 'center' },
  title: { fontSize: 20, fontWeight: '800', marginTop: 4, marginBottom: 22, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, width: '100%' },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { fontSize: 14, fontWeight: '700' },
});
