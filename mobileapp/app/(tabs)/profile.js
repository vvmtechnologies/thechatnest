import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, AppState,
  Platform, TextInput, ActivityIndicator, Keyboard, RefreshControl, Linking, Modal, Pressable,
  useWindowDimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';
import { AudioModule, createAudioPlayer } from 'expo-audio';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../../src/constants/storageKeys';
import Avatar from '../../src/components/Avatar';
import { useToast } from '../../src/components/Toast';
import { useAuth } from '../../src/store/AuthContext';
import { useTheme } from '../../src/store/ThemeContext';
import { getMe, changePassword, getTrustedDevices, revokeDevice, logoutAll } from '../../src/api/auth';
import api from '../../src/api/config';

// ─── Constants ─────────────────────────────────────────────────────────────
const NOTIFICATION_TONES = [
  { key: 'default', label: 'Default' },
  { key: 'chime', label: 'Chime' }, { key: 'ping', label: 'Ping' },
  { key: 'bubble', label: 'Bubble' }, { key: 'bell', label: 'Bell' },
  { key: 'drop', label: 'Drop' }, { key: 'pop', label: 'Pop' },
  { key: 'ding', label: 'Ding' }, { key: 'chirp', label: 'Chirp' },
  { key: 'soft', label: 'Soft' }, { key: 'bright', label: 'Bright' },
  { key: 'knock', label: 'Knock' }, { key: 'swoosh', label: 'Swoosh' },
  { key: 'crystal', label: 'Crystal' }, { key: 'ripple', label: 'Ripple' },
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

const PRESET_COLORS = ['#ffd54a', '#6d5dfc', '#ffb74d', '#22c55e', '#0ea5e9', '#ec4899', '#f59e0b', '#11162a'];
const FONTS_LIST = ['SF Display', 'Poppins', 'Noto Sans', 'Inter', 'Roboto'];
const FONT_SIZES_LIST = ['Small', 'Normal', 'Large'];
const STRIPE_PALETTE = ['#6d5dfc', '#ffd54a', '#22c55e', '#ec4899', '#0ea5e9', '#f59e0b'];

const STATUS_OPTIONS = [
  { key: 'Available', color: '#22c55e', label: 'Available' },
  { key: 'Busy',      color: '#ef4444', label: 'Busy' },
  { key: 'Away',      color: '#f59e0b', label: 'Away' },
  { key: 'DND',       color: '#8b5cf6', label: 'Do Not Disturb' },
  { key: 'Offline',   color: '#94a3b8', label: 'Appear Offline' },
];

const ROLE_LABELS = { 1: 'Owner', 2: 'Admin', 3: 'Super Admin', 4: 'User', owner: 'Owner', admin: 'Admin', super_admin: 'Super Admin', users: 'User' };

const getTimeAgo = (d) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, refreshUser, logout: doLogout, organizations, orgsLoading, loadOrganizations, switchOrganization } = useAuth();
  const { theme: t, mode, setTheme, isDark, setBrand, setFont, setFontSize, brandColor: currentBrand, fontFamily: currentFont, fontSizeKey: currentFontSize } = useTheme();
  const toast = useToast();
  const { width: winW } = useWindowDimensions();
  const isTablet = winW >= 768;
  const contentMaxWidth = isTablet ? 720 : winW;
  const quickGridCols = isTablet ? 4 : 2;

  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  // Password form
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  // Devices
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Customize (color hex input)
  const [hexInput, setHexInput] = useState(currentBrand || '#ffd54a');
  useEffect(() => { setHexInput(currentBrand); }, [currentBrand]);

  // Notification tone
  const [selectedTone, setSelectedTone] = useState('default');
  const [showTonePicker, setShowTonePicker] = useState(false);
  const [playingTone, setPlayingTone] = useState(null);
  useEffect(() => {
    AsyncStorage.getItem(StorageKeys.notificationTone).then((v) => { if (v) setSelectedTone(v); });
  }, []);

  // Status picker
  const [myStatus, setMyStatus] = useState('Available');
  const [statusText, setStatusText] = useState('');
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  // Permissions
  const [perms, setPerms] = useState({});
  const loadPerms = useCallback(async () => {
    const [cam, gal, loc, contact, notif, mic, bioAvail] = await Promise.all([
      ImagePicker.getCameraPermissionsAsync().catch(() => ({ status: 'undetermined' })),
      ImagePicker.getMediaLibraryPermissionsAsync().catch(() => ({ status: 'undetermined' })),
      Location.getForegroundPermissionsAsync().catch(() => ({ status: 'undetermined' })),
      Contacts.getPermissionsAsync().catch(() => ({ status: 'undetermined' })),
      Notifications.getPermissionsAsync().catch(() => ({ status: 'undetermined' })),
      AudioModule.getRecordingPermissionsAsync().catch(() => ({ granted: false })),
      LocalAuthentication.hasHardwareAsync().catch(() => false),
    ]);
    let bioStatus = 'unavailable';
    if (bioAvail) {
      const enrolled = await LocalAuthentication.isEnrolledAsync().catch(() => false);
      bioStatus = enrolled ? 'granted' : 'undetermined';
    }
    setPerms({
      camera: cam.status, gallery: gal.status, location: loc.status,
      contacts: contact.status, notifications: notif.status,
      microphone: mic.granted ? 'granted' : (mic.status || 'undetermined'),
      biometric: bioStatus,
    });
  }, []);
  useEffect(() => { loadPerms(); }, [loadPerms]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') loadPerms(); });
    return () => sub.remove();
  }, [loadPerms]);

  useEffect(() => { if (user && loadOrganizations) loadOrganizations(); }, [user, loadOrganizations]);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleSwitchOrg = useCallback(async (orgId) => {
    if (Number(orgId) === Number(user?.orgId)) return;
    await switchOrganization(orgId);
    if (refreshUser) await refreshUser();
    toast?.success?.('Organization switched');
  }, [user?.orgId, switchOrganization, refreshUser, toast]);

  const requestPerm = useCallback(async (type) => {
    try {
      if (type === 'camera') await ImagePicker.requestCameraPermissionsAsync();
      else if (type === 'gallery') await ImagePicker.requestMediaLibraryPermissionsAsync();
      else if (type === 'location') await Location.requestForegroundPermissionsAsync();
      else if (type === 'contacts') await Contacts.requestPermissionsAsync();
      else if (type === 'notifications') await Notifications.requestPermissionsAsync();
      else if (type === 'microphone') await AudioModule.requestRecordingPermissionsAsync();
      else { Linking.openSettings(); return; }
    } catch { Linking.openSettings(); return; }
    loadPerms();
  }, [loadPerms]);

  const togglePerm = useCallback(async (key, currentlyGranted) => {
    if (currentlyGranted) { Linking.openSettings(); }
    else {
      const denied = perms[key] === 'denied';
      if (denied) Linking.openSettings();
      else await requestPerm(key);
    }
  }, [perms, requestPerm]);

  const loadProfile = useCallback(async () => {
    try {
      const raw = await getMe();
      const u = raw?.user || raw;
      const org = raw?.organization || {};
      const userRole = raw?.user_role || {};
      const mem = raw?.organization_member || {};
      setProfile({
        ...u,
        company_name: org?.name || '',
        custom_domain: org?.custom_domain || '',
        department_name: mem?.department_name || u?.department_name || '',
        designation_name: mem?.designation_name || u?.designation_name || '',
        location_name: mem?.location_name || u?.location_name || '',
        role_id: userRole.role_id || mem?.role_id || u?.role_id,
        role_key: userRole.role_key || mem?.role_key || u?.role_key,
        role_name: userRole.role_name || mem?.role_name || u?.role_name,
      });
    } catch (e) { console.log('[profile] error:', e?.message); }
  }, []);

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const data = await getTrustedDevices();
      const list = data?.trusted_devices || data?.devices || (Array.isArray(data) ? data : []);
      setDevices(Array.isArray(list) ? list : []);
    } catch {} finally { setLoadingDevices(false); }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => { if (expanded === 'devices') loadDevices(); }, [expanded, loadDevices]);

  const onRefresh = async () => { setRefreshing(true); await loadProfile(); setRefreshing(false); };

  const handleChangePassword = useCallback(async () => {
    if (!oldPass) return toast('Enter old password', 'warning');
    if (newPass.length < 8) return toast('Min 8 characters', 'warning');
    if (newPass !== confirmPass) return toast('Passwords don\'t match', 'error');
    Keyboard.dismiss(); setSaving(true);
    try {
      await changePassword(oldPass, newPass, confirmPass);
      toast('Password changed!', 'success');
      setOldPass(''); setNewPass(''); setConfirmPass('');
    } catch (e) { toast(e?.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }, [oldPass, newPass, confirmPass, toast]);

  const handleLogout = useCallback(async () => {
    await doLogout();
    toast('Logged out', 'info');
    router.replace('/(auth)/login');
  }, [doLogout, toast]);

  const handleLogoutAll = useCallback(async () => {
    Alert.alert('Logout all devices?', 'You will be signed out from every device including this one.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout all', style: 'destructive', onPress: async () => {
        await logoutAll();
        toast('All devices logged out', 'info');
        router.replace('/(auth)/login');
      }},
    ]);
  }, [toast]);

  const handleRevokeDevice = useCallback(async (id) => {
    try { await revokeDevice(id); toast('Revoked', 'success'); loadDevices(); }
    catch { toast('Failed', 'error'); }
  }, [loadDevices, toast]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert('Delete Account', 'This permanently deletes your account, all messages, and data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete My Account', style: 'destructive', onPress: async () => {
        try {
          await api.delete('/auth/me');
          await doLogout();
          toast('Account deleted', 'info');
          setTimeout(() => router.replace('/(auth)/login'), 300);
        } catch { toast('Contact support to delete account', 'info'); }
      }},
    ]);
  }, [doLogout, toast]);

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
    await AsyncStorage.setItem(StorageKeys.notificationTone, key);
    previewTone(key);
    setShowTonePicker(false);
    toast(`Tone set to ${NOTIFICATION_TONES.find((tn) => tn.key === key)?.label}`, 'success');
  }, [previewTone, toast]);

  const toggleSection = useCallback((key) => setExpanded((prev) => prev === key ? null : key), []);

  const handleAvatarUpload = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', { uri: asset.uri, name: 'avatar.jpg', type: asset.mimeType || 'image/jpeg' });
      toast('Uploading…', 'info');
      const { data } = await api.post('/upload/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newUrl = data?.data?.profile_url || data?.data?.url || data?.profile_url;
      if (newUrl) {
        setProfile((prev) => ({ ...prev, profile_url: newUrl }));
        toast('Photo updated!', 'success');
        refreshUser?.();
      } else { toast('Updated', 'success'); }
    } catch (e) { toast(e?.response?.data?.message || 'Upload failed', 'error'); }
  }, [refreshUser, toast]);

  // ─── Derived values ────────────────────────────────────────────────────
  const p = profile || user || {};
  const rawRole = p.role_name || p.role_key || profile?.role_name || profile?.role_key || user?.role_name || user?.role_key;
  const role = rawRole || ROLE_LABELS[p.role_id || user?.role_id] || 'Member';
  const stripeIdx = ((p.user_id || p.id || 0) + (p.name || '').length) % STRIPE_PALETTE.length;
  const userStripe = STRIPE_PALETTE[stripeIdx];
  const joinDate = p.created_at || profile?.joined_at || profile?.created_at;
  const joinLabel = joinDate ? new Date(joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
  const initials = (p.name || 'U').split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const isAdmin = Number(user?.role_id) <= 3 && Number(user?.role_id) >= 1;
  const currentStatus = STATUS_OPTIONS.find((s) => s.key === myStatus) || STATUS_OPTIONS[0];

  const quickActions = useMemo(() => [
    { icon: 'qr-code',          label: 'Linked devices',  tint: '#6d5dfc', onPress: () => router.push('/chat/linked-devices') },
    { icon: 'shield-checkmark', label: 'Privacy',         tint: '#22c55e', onPress: () => router.push('/chat/privacy') },
    { icon: 'notifications',    label: 'Notifications',   tint: '#0ea5e9', onPress: () => router.push('/chat/notifications') },
    { icon: 'help-circle',      label: 'Help',            tint: '#f59e0b', onPress: () => router.push('/chat/help') },
  ], []);

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[t.accent]} tintColor={t.accent} />}
      >
        <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>

          {/* Top bar */}
          <View style={s.topBar}>
            <View>
              <Text style={[s.topKicker, { color: t.textTer }]}>YOUR ACCOUNT</Text>
              <Text style={[s.topTitle, { color: t.text }]}>Profile & Settings</Text>
            </View>
            <TouchableOpacity
              style={[s.topLogout, { backgroundColor: '#ef444412', borderColor: '#ef444433' }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={14} color="#ef4444" />
              <Text style={s.topLogoutText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          {/* Hero card */}
          <View style={[s.hero, { backgroundColor: t.surface, borderColor: t.divider }]}>
            <View style={[s.heroBanner, { backgroundColor: userStripe }]}>
              <View style={[s.heroBannerGlow, { backgroundColor: '#fff' }]} />
            </View>

            <View style={s.heroBody}>
              <TouchableOpacity activeOpacity={0.85} onPress={handleAvatarUpload} style={s.heroAvatarWrap}>
                <View style={[s.heroAvatarRing, { backgroundColor: t.surface, borderColor: t.surface }]}>
                  <Avatar uri={p.profile_url || p.avatar} name={p.name} size={92} />
                </View>
                <View style={[s.heroCameraBadge, { backgroundColor: userStripe, borderColor: t.surface }]}>
                  <Ionicons name="camera" size={12} color="#fff" />
                </View>
              </TouchableOpacity>

              <Text style={[s.heroName, { color: t.text }]} numberOfLines={1}>{p.name || 'User'}</Text>
              <Text style={[s.heroEmail, { color: t.textSec }]} numberOfLines={1}>{p.email}</Text>

              <View style={s.heroPills}>
                <View style={[s.heroPill, { backgroundColor: userStripe + '1f', borderColor: userStripe + '55' }]}>
                  <View style={[s.heroPillDot, { backgroundColor: userStripe }]} />
                  <Text style={[s.heroPillText, { color: userStripe }]}>{role}</Text>
                </View>
                <View style={[s.heroPill, { backgroundColor: t.bg, borderColor: t.divider }]}>
                  <Ionicons name="finger-print" size={11} color={t.textTer} />
                  <Text style={[s.heroPillText, { color: t.textSec, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) }]}>
                    #{String(p.user_id || p.id || '—').padStart(4, '0')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowStatusPicker(true)}
                  style={[s.heroPill, { backgroundColor: currentStatus.color + '1f', borderColor: currentStatus.color + '55' }]}
                  activeOpacity={0.7}
                >
                  <View style={[s.heroPillDot, { backgroundColor: currentStatus.color }]} />
                  <Text style={[s.heroPillText, { color: currentStatus.color }]}>{myStatus}</Text>
                  <Ionicons name="chevron-down" size={11} color={currentStatus.color} />
                </TouchableOpacity>
              </View>

              <View style={[s.heroStats, { borderColor: t.divider }]}>
                <View style={s.heroStatCell}>
                  <Text style={[s.heroStatVal, { color: t.text }]}>{joinLabel}</Text>
                  <Text style={[s.heroStatLabel, { color: t.textTer }]}>JOINED</Text>
                </View>
                <View style={[s.heroStatDivider, { backgroundColor: t.divider }]} />
                <View style={s.heroStatCell}>
                  <Text style={[s.heroStatVal, { color: t.text }]} numberOfLines={1}>
                    {organizations?.length || 1}
                  </Text>
                  <Text style={[s.heroStatLabel, { color: t.textTer }]}>WORKSPACES</Text>
                </View>
                <View style={[s.heroStatDivider, { backgroundColor: t.divider }]} />
                <View style={s.heroStatCell}>
                  <Text style={[s.heroStatVal, { color: '#22c55e' }]}>● Active</Text>
                  <Text style={[s.heroStatLabel, { color: t.textTer }]}>STATUS</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick actions grid (2 cols phone / 4 cols tablet) */}
          <View style={[s.quickGrid, { paddingHorizontal: 12, marginTop: 14 }]}>
            {quickActions.map((q) => (
              <TouchableOpacity
                key={q.label}
                style={[
                  s.quickCard,
                  {
                    backgroundColor: t.surface,
                    borderColor: t.divider,
                    width: `${100 / quickGridCols - 2}%`,
                  },
                ]}
                onPress={q.onPress}
                activeOpacity={0.7}
              >
                <View style={[s.quickIcon, { backgroundColor: q.tint + '22' }]}>
                  <Ionicons name={q.icon} size={18} color={q.tint} />
                </View>
                <Text style={[s.quickLabel, { color: t.text }]} numberOfLines={1}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Admin shortcut */}
          {isAdmin && (
            <NavCard
              t={t}
              icon="shield-checkmark"
              tint="#ef4444"
              label="Admin Panel"
              hint="Users, groups, controls, billing"
              onPress={() => router.push('/chat/admin')}
            />
          )}

          {/* Organizations */}
          {organizations.length > 1 && (
            <>
              <GroupLabel t={t}>WORKSPACES</GroupLabel>
              <View style={[s.card, { backgroundColor: t.card, borderColor: t.divider }]}>
                {organizations.map((org, idx) => {
                  const active = Number(org.organization_id) === Number(user?.orgId);
                  return (
                    <TouchableOpacity
                      key={org.organization_id}
                      style={[s.cardRow, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.divider }]}
                      onPress={() => handleSwitchOrg(org.organization_id)}
                      activeOpacity={0.6}
                      disabled={active}
                    >
                      <View style={[s.cardIcon, { backgroundColor: active ? t.accent + '22' : '#94a3b815' }]}>
                        <Ionicons name={active ? 'checkmark-circle' : 'business-outline'} size={18} color={active ? t.accent : t.textTer} />
                      </View>
                      <View style={s.cardRowText}>
                        <Text style={[s.cardLabel, { color: t.text }]} numberOfLines={1}>{org.org_name || `Org #${org.organization_id}`}</Text>
                        <Text style={[s.cardHint, { color: t.textTer }]} numberOfLines={1}>
                          {org.role_name || org.role_key || 'Member'}{active ? ' · Current' : ''}
                        </Text>
                      </View>
                      {!active && <Ionicons name="swap-horizontal" size={16} color={t.textTer} />}
                    </TouchableOpacity>
                  );
                })}
                {orgsLoading && <View style={{ padding: 12, alignItems: 'center' }}><ActivityIndicator size="small" color={t.accent} /></View>}
              </View>
            </>
          )}

          {/* ─── ACCOUNT ─── */}
          <GroupLabel t={t}>ACCOUNT</GroupLabel>

          <Section t={t} id="profile" icon="person-circle-outline" tint={t.accent} label="Profile information" isOpen={expanded === 'profile'} onToggle={() => toggleSection('profile')}>
            <InfoRow t={t} icon="briefcase-outline" label="Department" value={p.department_name} />
            <InfoRow t={t} icon="ribbon-outline" label="Designation" value={p.designation_name} />
            <InfoRow t={t} icon="call-outline" label="Mobile" value={p.mobile || p.phone} />
            <InfoRow t={t} icon="business-outline" label="Company" value={p.company_name} />
            <InfoRow t={t} icon="location-outline" label="Location" value={p.location_name} />
            <InfoRow t={t} icon="time-outline" label="Last login" value={p.last_login_at ? new Date(p.last_login_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null} last />
          </Section>

          <Section t={t} id="password" icon="key-outline" tint="#0ea5e9" label="Change password" isOpen={expanded === 'password'} onToggle={() => toggleSection('password')}>
            <PasswordField t={t} icon="lock-closed-outline" label="OLD PASSWORD" value={oldPass} onChange={setOldPass} placeholder="Current password" show={showPass} />
            <PasswordField t={t} icon="key-outline" label="NEW PASSWORD" value={newPass} onChange={setNewPass} placeholder="Min 8 characters" show={showPass} onToggleShow={() => setShowPass(!showPass)} />
            <PasswordField t={t} icon="shield-checkmark-outline" label="CONFIRM PASSWORD" value={confirmPass} onChange={setConfirmPass} placeholder="Re-enter new password" show={showPass} />
            <TouchableOpacity style={[s.cta, { backgroundColor: t.accent }]} onPress={handleChangePassword} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaText}>Save password</Text>}
            </TouchableOpacity>
          </Section>

          <NavCard
            t={t}
            icon="qr-code-outline"
            tint="#3b82f6"
            label="Link to web"
            hint="Scan QR to sign in on web / desktop"
            onPress={() => router.push('/chat/linked-devices')}
          />

          <Section t={t} id="devices" icon="phone-portrait-outline" tint="#8b5cf6" label="Active sessions" badge={devices.length > 0 ? String(devices.length) : null} isOpen={expanded === 'devices'} onToggle={() => toggleSection('devices')}>
            {loadingDevices ? (
              <ActivityIndicator color={t.accent} style={{ marginVertical: 20 }} />
            ) : (
              <>
                {devices.length > 0 && (
                  <TouchableOpacity style={[s.dangerRow, { backgroundColor: '#ef444412' }]} onPress={handleLogoutAll} activeOpacity={0.7}>
                    <Ionicons name="log-out-outline" size={14} color="#ef4444" />
                    <Text style={[s.dangerRowText, { color: '#ef4444' }]}>Logout from all devices</Text>
                  </TouchableOpacity>
                )}
                {devices.slice(0, 5).map((d, i) => {
                  const isCurrent = i === 0;
                  const os = (d.os_name || '').toLowerCase();
                  let devIcon = 'monitor', devColor = '#3b82f6';
                  if (os.includes('android')) { devIcon = 'android'; devColor = '#3DDC84'; }
                  else if (os.includes('ios') || os.includes('mac')) { devIcon = 'apple'; devColor = '#94a3b8'; }
                  else if (os.includes('windows')) { devIcon = 'microsoft-windows'; devColor = '#00A4EF'; }
                  return (
                    <View key={d.device_id || i} style={[s.deviceRow, { borderBottomColor: t.divider }]}>
                      <View style={[s.deviceIcon, { backgroundColor: (isCurrent ? '#22c55e' : devColor) + '14' }]}>
                        <MaterialCommunityIcons name={devIcon} size={20} color={isCurrent ? '#22c55e' : devColor} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[s.deviceName, { color: t.text }]} numberOfLines={1}>{d.device_name || 'Unknown'}</Text>
                          {isCurrent && <View style={[s.currentDot, { backgroundColor: '#22c55e' }]} />}
                        </View>
                        <Text style={[s.deviceMeta, { color: t.textTer }]} numberOfLines={1}>
                          {[d.os_name, d.city, d.country].filter(Boolean).join(' · ')} · {isCurrent ? 'Active now' : getTimeAgo(d.last_active_at)}
                        </Text>
                      </View>
                      {!isCurrent && (
                        <TouchableOpacity onPress={() => handleRevokeDevice(d.device_id)} style={[s.revokeBtn, { backgroundColor: '#ef444412' }]}>
                          <Text style={[s.revokeText, { color: '#ef4444' }]}>Revoke</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
                {devices.length === 0 && <Text style={[s.empty, { color: t.textTer }]}>No active devices</Text>}
              </>
            )}
          </Section>

          {/* ─── APPEARANCE ─── */}
          <GroupLabel t={t}>APPEARANCE</GroupLabel>

          <View style={[s.card, { backgroundColor: t.card, borderColor: t.divider }]}>
            <View style={s.cardRow}>
              <View style={[s.cardIcon, { backgroundColor: t.accent + '14' }]}>
                <Ionicons name="moon-outline" size={18} color={t.accent} />
              </View>
              <Text style={[s.cardLabel, { color: t.text, flex: 1 }]}>Dark mode</Text>
              <Switch
                value={isDark}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ false: '#e2e8f0', true: t.accent + '60' }}
                thumbColor={isDark ? t.accent : '#fff'}
                ios_backgroundColor="#e2e8f0"
              />
            </View>
            <View style={[s.cardRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.divider }]}>
              <View style={[s.cardIcon, { backgroundColor: t.accent + '14' }]}>
                <Ionicons name="color-palette-outline" size={18} color={t.accent} />
              </View>
              <Text style={[s.cardLabel, { color: t.text, flex: 1 }]}>Theme</Text>
              <View style={s.chipRow}>
                {['light', 'dark', 'system'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[s.chip, mode === m && { backgroundColor: t.accent + '14', borderColor: t.accent }]}
                    onPress={() => setTheme(m)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.chipText, { color: mode === m ? t.accent : t.textTer }]}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Section t={t} id="customize" icon="brush-outline" tint="#ec4899" label="Customize" isOpen={expanded === 'customize'} onToggle={() => toggleSection('customize')}>
            <Text style={[s.subLabel, { color: t.textSec }]}>Brand color</Text>
            <View style={s.colorRow}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { setBrand(c); setHexInput(c); }}
                  activeOpacity={0.7}
                  style={[s.colorCircle, { backgroundColor: c }, currentBrand === c && s.colorActive]}
                >
                  {currentBrand === c && <Ionicons name="checkmark" size={13} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.hexRow}>
              <View style={[s.hexPreview, { backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(hexInput) ? hexInput : currentBrand }]} />
              <View style={[s.hexWrap, { borderColor: t.border, backgroundColor: t.inputBg }]}>
                <Text style={[s.hexLabel, { color: t.textTer }]}>HEX</Text>
                <TextInput
                  style={[s.hexInput, { color: t.text }]}
                  value={hexInput}
                  onChangeText={setHexInput}
                  placeholder="#ffd54a"
                  placeholderTextColor={t.textTer}
                  maxLength={7}
                  autoCapitalize="characters"
                />
              </View>
              <TouchableOpacity
                style={[s.hexApply, { backgroundColor: currentBrand }]}
                onPress={() => { setBrand(hexInput); toast('Applied!', 'success'); }}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={[s.subLabel, { color: t.textSec, marginTop: 18 }]}>Font family</Text>
            <View style={s.chipWrap}>
              {FONTS_LIST.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[s.fontChip, currentFont === f && { backgroundColor: t.accent + '14', borderColor: t.accent }]}
                  onPress={() => setFont(f)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.fontChipText, { color: currentFont === f ? t.accent : t.textSec }]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[s.subLabel, { color: t.textSec, marginTop: 18 }]}>Font size</Text>
            <View style={s.fontSizeRow}>
              {FONT_SIZES_LIST.map((fs) => (
                <TouchableOpacity
                  key={fs}
                  style={[s.fontSizeBtn, currentFontSize === fs && { backgroundColor: t.accent + '14', borderColor: t.accent }]}
                  onPress={() => setFontSize(fs)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.fontSizeText, { color: currentFontSize === fs ? t.accent : t.textSec, fontSize: fs === 'Small' ? 12 : fs === 'Large' ? 16 : 14 }]}>
                    {fs}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          {/* ─── PRIVACY & SECURITY ─── */}
          <GroupLabel t={t}>PRIVACY & SECURITY</GroupLabel>

          <Section t={t} id="notifications" icon="notifications-outline" tint="#0ea5e9" label="Notifications" isOpen={expanded === 'notifications'} onToggle={() => toggleSection('notifications')}>
            <View style={s.toggleRow}>
              <Text style={[s.toggleLabel, { color: t.text }]}>Do not disturb</Text>
              <Switch
                value={false}
                onValueChange={() => toast('DND scheduling coming soon', 'info')}
                trackColor={{ false: '#e2e8f0', true: t.accent + '60' }}
                ios_backgroundColor="#e2e8f0"
              />
            </View>
            <View style={[s.toggleRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.divider }]}>
              <Text style={[s.toggleLabel, { color: t.text }]}>Notification tone</Text>
              <TouchableOpacity onPress={() => setShowTonePicker(true)} style={[s.inlinePill, { backgroundColor: t.accent + '14' }]}>
                <Ionicons name="musical-notes" size={12} color={t.accent} />
                <Text style={{ color: t.accent, fontWeight: '700', fontSize: 13 }}>
                  {NOTIFICATION_TONES.find((tn) => tn.key === selectedTone)?.label || 'Default'}
                </Text>
              </TouchableOpacity>
            </View>
          </Section>

          <Section t={t} id="permissions" icon="shield-outline" tint="#22c55e" label="Permissions" isOpen={expanded === 'permissions'} onToggle={() => toggleSection('permissions')}>
            <Text style={[s.hint, { color: t.textTer }]}>Toggle to allow / revoke. System settings open when needed.</Text>
            {[
              { key: 'camera', icon: 'camera-outline', label: 'Camera', desc: 'Take photos & videos' },
              { key: 'gallery', icon: 'images-outline', label: 'Photo library', desc: 'Share images & videos' },
              { key: 'microphone', icon: 'mic-outline', label: 'Microphone', desc: 'Voice messages' },
              { key: 'location', icon: 'location-outline', label: 'Location', desc: 'Share your location' },
              { key: 'contacts', icon: 'people-outline', label: 'Contacts', desc: 'Share contact info' },
              { key: 'notifications', icon: 'notifications-outline', label: 'Notifications', desc: 'Message alerts' },
              { key: 'biometric', icon: 'finger-print-outline', label: 'Biometric login', desc: 'Fingerprint / face unlock' },
            ].map((pm) => {
              const ok = perms[pm.key] === 'granted';
              const unavail = perms[pm.key] === 'unavailable';
              return (
                <View key={pm.key} style={[s.permRow, { borderBottomColor: t.divider }]}>
                  <View style={[s.permIcon, { backgroundColor: ok ? '#22c55e15' : unavail ? '#94a3b815' : '#f59e0b15' }]}>
                    <Ionicons name={pm.icon} size={16} color={ok ? '#22c55e' : unavail ? t.textTer : '#f59e0b'} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[s.permLabel, { color: unavail ? t.textTer : t.text }]}>{pm.label}</Text>
                    <Text style={[s.permDesc, { color: t.textTer }]}>
                      {unavail ? 'Not available on this device' : pm.desc}
                    </Text>
                  </View>
                  {!unavail && (
                    <Switch
                      value={ok}
                      onValueChange={() => togglePerm(pm.key, ok)}
                      trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: '#22c55e60' }}
                      thumbColor={ok ? '#22c55e' : (isDark ? '#64748b' : '#cbd5e1')}
                      ios_backgroundColor={isDark ? '#334155' : '#e2e8f0'}
                    />
                  )}
                </View>
              );
            })}
          </Section>

          {/* ─── CHAT ─── */}
          <GroupLabel t={t}>CHAT</GroupLabel>

          <NavCard t={t} icon="server-outline" tint={t.accent} label="Storage & data" hint="Manage downloads, auto-download settings" onPress={() => router.push('/chat/storage')} />
          <NavCard t={t} icon="star-outline" tint="#eab308" label="Starred messages" hint="Your saved messages" onPress={() => router.push('/chat/starred')} />
          <NavCard t={t} icon="megaphone-outline" tint="#3b82f6" label="Broadcast message" hint="Send to multiple chats at once" onPress={() => router.push('/chat/broadcast')} />

          {/* ─── HELP ─── */}
          <GroupLabel t={t}>HELP & SUPPORT</GroupLabel>

          <View style={[s.dualCardRow, { marginTop: 4 }]}>
            <TouchableOpacity style={[s.dualCard, { backgroundColor: t.card, borderColor: t.divider }]} onPress={() => router.push('/chat/guide')} activeOpacity={0.7}>
              <View style={[s.dualIcon, { backgroundColor: '#06b6d422' }]}>
                <Ionicons name="book" size={20} color="#06b6d4" />
              </View>
              <Text style={[s.dualTitle, { color: t.text }]}>App guide</Text>
              <Text style={[s.dualSub, { color: t.textTer }]}>Help & FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.dualCard, { backgroundColor: t.card, borderColor: t.divider }]} onPress={() => router.push('/chat/assistant')} activeOpacity={0.7}>
              <View style={[s.dualIcon, { backgroundColor: t.accent + '22' }]}>
                <Ionicons name="sparkles" size={20} color={t.accent} />
              </View>
              <Text style={[s.dualTitle, { color: t.text }]}>AI assistant</Text>
              <Text style={[s.dualSub, { color: t.textTer }]}>Ask anything</Text>
            </TouchableOpacity>
          </View>

          <View style={[s.dualCardRow, { marginTop: 8 }]}>
            <TouchableOpacity style={[s.dualLegal, { backgroundColor: t.card, borderColor: t.divider }]} onPress={() => router.push('/chat/legal?type=privacy')} activeOpacity={0.7}>
              <Ionicons name="shield-checkmark" size={18} color="#3b82f6" />
              <Text style={[s.dualLegalText, { color: t.text }]}>Privacy policy</Text>
              <Ionicons name="chevron-forward" size={14} color={t.textTer} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.dualLegal, { backgroundColor: t.card, borderColor: t.divider }]} onPress={() => router.push('/chat/legal?type=terms')} activeOpacity={0.7}>
              <Ionicons name="document-text" size={18} color="#8b5cf6" />
              <Text style={[s.dualLegalText, { color: t.text }]}>Terms of service</Text>
              <Ionicons name="chevron-forward" size={14} color={t.textTer} />
            </TouchableOpacity>
          </View>

          <View style={[s.card, { backgroundColor: t.card, borderColor: t.divider, marginTop: 8 }]}>
            <View style={s.cardRow}>
              <View style={[s.cardIcon, { backgroundColor: '#94a3b822' }]}>
                <Ionicons name="information-circle-outline" size={18} color={t.textTer} />
              </View>
              <Text style={[s.cardLabel, { color: t.text, flex: 1 }]}>Version</Text>
              <Text style={[s.cardHint, { color: t.textTer }]}>1.0.0</Text>
            </View>
          </View>

          {/* ─── DANGER ─── */}
          <GroupLabel t={t} color="#ef4444">DANGER ZONE</GroupLabel>

          <TouchableOpacity
            style={[s.card, { backgroundColor: '#ef444408', borderColor: '#ef444433' }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={s.cardRow}>
              <View style={[s.cardIcon, { backgroundColor: '#ef444415' }]}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </View>
              <View style={s.cardRowText}>
                <Text style={[s.cardLabel, { color: '#ef4444' }]}>Delete account</Text>
                <Text style={[s.cardHint, { color: '#ef4444aa' }]}>Permanent — no undo</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ef4444" />
            </View>
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>

      {/* ─── Status Picker Modal ─── */}
      {showStatusPicker && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowStatusPicker(false)}>
          <Pressable style={s.modalOverlay} onPress={() => setShowStatusPicker(false)}>
            <Pressable style={[s.modalSheet, { backgroundColor: t.surface }]} onPress={() => {}}>
              <View style={s.modalHandle} />
              <Text style={[s.modalTitle, { color: t.text }]}>Set your status</Text>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.statusOpt, myStatus === opt.key && { backgroundColor: opt.color + '12' }, { borderBottomColor: t.divider }]}
                  onPress={() => setMyStatus(opt.key)}
                  activeOpacity={0.6}
                >
                  <View style={[s.statusOptDot, { backgroundColor: opt.color }]} />
                  <Text style={[s.statusOptLabel, { color: t.text }]}>{opt.label}</Text>
                  {myStatus === opt.key && <Ionicons name="checkmark-circle" size={20} color={opt.color} />}
                </TouchableOpacity>
              ))}
              <View style={[s.statusInputWrap, { borderTopColor: t.divider }]}>
                <TextInput
                  style={[s.statusInput, { color: t.text, backgroundColor: t.bg, borderColor: t.border }]}
                  placeholder="What's your status?"
                  placeholderTextColor={t.textTer}
                  value={statusText}
                  onChangeText={setStatusText}
                  maxLength={100}
                />
              </View>
              <TouchableOpacity
                style={[s.modalCta, { backgroundColor: t.accent }]}
                onPress={() => { setShowStatusPicker(false); toast(`Status: ${myStatus}`, 'success'); }}
                activeOpacity={0.85}
              >
                <Text style={s.modalCtaText}>Save</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* ─── Tone Picker Modal ─── */}
      {showTonePicker && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowTonePicker(false)}>
          <Pressable style={s.modalOverlay} onPress={() => setShowTonePicker(false)}>
            <Pressable style={[s.modalSheet, { backgroundColor: t.surface, maxHeight: '75%' }]} onPress={() => {}}>
              <View style={s.modalHandle} />
              <View style={s.toneHeader}>
                <Ionicons name="musical-notes" size={20} color={t.accent} />
                <Text style={[s.modalTitle, { color: t.text, flex: 1, marginLeft: 10, marginBottom: 0 }]}>Notification tone</Text>
                <TouchableOpacity onPress={() => setShowTonePicker(false)} hitSlop={10}>
                  <Ionicons name="close" size={22} color={t.textSec} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ paddingHorizontal: 16 }}>
                {NOTIFICATION_TONES.map((tn) => {
                  const active = selectedTone === tn.key;
                  return (
                    <TouchableOpacity
                      key={tn.key}
                      onPress={() => selectTone(tn.key)}
                      style={[s.toneOpt, active && { backgroundColor: t.accent + '15' }]}
                      activeOpacity={0.7}
                    >
                      <View style={[s.toneOptIcon, { backgroundColor: active ? t.accent + '22' : t.textTer + '12' }]}>
                        <Ionicons name={active ? 'volume-high' : 'musical-note'} size={16} color={active ? t.accent : t.textSec} />
                      </View>
                      <Text style={[s.toneOptLabel, { color: active ? t.accent : t.text, fontWeight: active ? '700' : '500' }]}>
                        {tn.label}
                      </Text>
                      {tn.key !== 'default' && (
                        <TouchableOpacity onPress={() => previewTone(tn.key)} hitSlop={10}>
                          <Ionicons name="play-circle" size={24} color={t.textSec} />
                        </TouchableOpacity>
                      )}
                      {active && <Ionicons name="checkmark-circle" size={20} color={t.accent} style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 30 }} />
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────
function GroupLabel({ t, color, children }) {
  return <Text style={[s.groupLabel, { color: color || t.textTer }]}>{children}</Text>;
}

function Section({ t, icon, tint, label, badge, children, isOpen, onToggle }) {
  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.divider }]}>
      <TouchableOpacity style={s.cardRow} onPress={onToggle} activeOpacity={0.6}>
        <View style={[s.cardIcon, { backgroundColor: (tint || t.accent) + '14' }]}>
          <Ionicons name={icon} size={18} color={tint || t.accent} />
        </View>
        <Text style={[s.cardLabel, { color: t.text, flex: 1 }]}>{label}</Text>
        {badge ? (
          <View style={[s.badge, { backgroundColor: (tint || t.accent) + '22' }]}>
            <Text style={[s.badgeText, { color: tint || t.accent }]}>{badge}</Text>
          </View>
        ) : null}
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={t.textTer} />
      </TouchableOpacity>
      {isOpen && <View style={[s.cardBody, { borderTopColor: t.divider }]}>{children}</View>}
    </View>
  );
}

function NavCard({ t, icon, tint, label, hint, onPress }) {
  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.divider }]}>
      <TouchableOpacity style={s.cardRow} onPress={onPress} activeOpacity={0.6}>
        <View style={[s.cardIcon, { backgroundColor: (tint || t.accent) + '14' }]}>
          <Ionicons name={icon} size={18} color={tint || t.accent} />
        </View>
        <View style={s.cardRowText}>
          <Text style={[s.cardLabel, { color: t.text }]} numberOfLines={1}>{label}</Text>
          {hint ? <Text style={[s.cardHint, { color: t.textTer }]} numberOfLines={1}>{hint}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={t.textTer} />
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({ t, icon, label, value, last }) {
  if (!value) return null;
  return (
    <View style={[s.infoRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.divider }]}>
      <Ionicons name={icon} size={16} color={t.textTer} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.infoLabel, { color: t.textTer }]}>{label}</Text>
        <Text style={[s.infoValue, { color: t.text }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function PasswordField({ t, icon, label, value, onChange, placeholder, show, onToggleShow }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[s.fieldLabel, { color: t.textTer }]}>{label}</Text>
      <View style={[s.field, { borderColor: t.border, backgroundColor: t.inputBg }]}>
        <Ionicons name={icon} size={16} color={t.icon} />
        <TextInput
          style={[s.fieldInput, { color: t.text }]}
          placeholder={placeholder}
          placeholderTextColor={t.textTer}
          secureTextEntry={!show}
          value={value}
          onChangeText={onChange}
        />
        {onToggleShow && (
          <TouchableOpacity onPress={onToggleShow} hitSlop={10}>
            <Ionicons name={show ? 'eye-off' : 'eye'} size={16} color={t.icon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 40 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12,
  },
  topKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  topTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginTop: 2 },
  topLogout: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1,
  },
  topLogoutText: { fontSize: 12, fontWeight: '800', color: '#ef4444', letterSpacing: 0.2 },

  // Hero
  hero: {
    marginHorizontal: 12, marginTop: 2,
    borderRadius: 20, borderWidth: 1, overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14 },
      android: { elevation: 3 },
    }),
  },
  heroBanner: { height: 90, position: 'relative', overflow: 'hidden' },
  heroBannerGlow: {
    position: 'absolute', top: -50, right: -30,
    width: 180, height: 180, borderRadius: 90,
    opacity: 0.18,
  },
  heroBody: { alignItems: 'center', paddingHorizontal: 18, paddingBottom: 16, marginTop: -46 },
  heroAvatarWrap: { position: 'relative' },
  heroAvatarRing: {
    padding: 4, borderRadius: 60, borderWidth: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  heroCameraBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3,
  },
  heroName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginTop: 8, textAlign: 'center' },
  heroEmail: { fontSize: 13, fontWeight: '500', marginTop: 2, textAlign: 'center' },
  heroPills: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    justifyContent: 'center', marginTop: 12,
  },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1,
  },
  heroPillDot: { width: 6, height: 6, borderRadius: 3 },
  heroPillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  heroStats: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    marginTop: 16, paddingTop: 14, borderTopWidth: 1,
  },
  heroStatCell: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: 13, fontWeight: '800', letterSpacing: -0.2 },
  heroStatLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  heroStatDivider: { width: 1, height: 24 },

  // Quick grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickCard: {
    paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: 1, gap: 10,
  },
  quickIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 13, fontWeight: '800', letterSpacing: -0.1 },

  // Group label
  groupLabel: {
    fontSize: 10, fontWeight: '900', letterSpacing: 2,
    marginHorizontal: 18, marginTop: 22, marginBottom: 6,
  },

  // Card
  card: {
    marginHorizontal: 12, marginTop: 8, borderRadius: 14,
    borderWidth: 1, overflow: 'hidden',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  cardRowText: { flex: 1, minWidth: 0, gap: 1 },
  cardIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 14.5, fontWeight: '700', letterSpacing: -0.2 },
  cardHint: { fontSize: 11, marginTop: 1 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 22, alignItems: 'center' },
  badgeText: { fontSize: 11, fontWeight: '800' },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  infoLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '500', marginTop: 2 },

  // Password form
  fieldLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, height: 46 },
  fieldInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  cta: { height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  // Devices
  dangerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, marginBottom: 10 },
  dangerRowText: { fontSize: 12, fontWeight: '700' },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  deviceIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  deviceName: { fontSize: 14, fontWeight: '700' },
  currentDot: { width: 7, height: 7, borderRadius: 3.5 },
  deviceMeta: { fontSize: 11, marginTop: 2 },
  revokeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  revokeText: { fontSize: 11, fontWeight: '800' },
  empty: { textAlign: 'center', paddingVertical: 20, fontSize: 13 },

  // Toggle rows
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '500' },
  inlinePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  chipRow: { flexDirection: 'row', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5, borderColor: 'transparent' },
  chipText: { fontSize: 12, fontWeight: '700' },

  // Customize
  subLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  colorCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  colorActive: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hexPreview: { width: 36, height: 36, borderRadius: 10 },
  hexWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, height: 40, gap: 6 },
  hexLabel: { fontSize: 10, fontWeight: '800' },
  hexInput: { flex: 1, fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  hexApply: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fontChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: 'transparent' },
  fontChipText: { fontSize: 13, fontWeight: '600' },
  fontSizeRow: { flexDirection: 'row', gap: 8 },
  fontSizeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center' },
  fontSizeText: { fontWeight: '700' },

  // Permissions
  hint: { fontSize: 11, marginBottom: 10, lineHeight: 16 },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  permIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  permLabel: { fontSize: 14, fontWeight: '600' },
  permDesc: { fontSize: 11, marginTop: 1 },

  // Dual card row (Help/AI, Privacy/Terms)
  dualCardRow: { flexDirection: 'row', gap: 8, marginHorizontal: 12 },
  dualCard: { flex: 1, alignItems: 'flex-start', padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  dualIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dualTitle: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  dualSub: { fontSize: 11 },
  dualLegal: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  dualLegalText: { flex: 1, fontSize: 12, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 8, paddingBottom: 30,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(148,163,184,0.4)',
    alignSelf: 'center', marginBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', paddingHorizontal: 20, marginBottom: 12 },
  modalCta: { marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  modalCtaText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Status picker
  statusOpt: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  statusOptDot: { width: 10, height: 10, borderRadius: 5 },
  statusOptLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  statusInputWrap: { paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth },
  statusInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },

  // Tone picker
  toneHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(148,163,184,0.2)' },
  toneOpt: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  toneOptIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toneOptLabel: { flex: 1, fontSize: 15, marginLeft: 12 },
});
