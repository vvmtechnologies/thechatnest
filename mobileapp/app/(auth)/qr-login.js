// ─── TheChatNest Mobile — Linked Devices & QR Scanner ──────────────
//
// Navy + gold aesthetic, glass cards, animated scanner frame.
// All trusted-devices + QR confirm API logic preserved.

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  FlatList, Alert, Animated, Platform, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import api from '../../src/api/config';
import { useToast } from '../../src/components/Toast';
import { brand, colors, spacing, radius, fontSize, fontWeight } from '../../src/theme/colors';

let CameraView, useCameraPermissions;
try {
  const cam = require('expo-camera');
  CameraView = cam.CameraView;
  useCameraPermissions = cam.useCameraPermissions;
} catch { CameraView = null; useCameraPermissions = null; }

const getTimeAgo = (d) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const FRAME = 250;

export default function LinkedDevicesScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [mode, setMode] = useState('list');
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Scanner line animation
  const scanLine = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (mode !== 'scan') return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [mode]);

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const { data } = await api.get('/auth/trusted-devices');
      const list = data?.data?.trusted_devices || data?.data?.devices || data?.data || [];
      setDevices(Array.isArray(list) ? list : []);
    } catch {}
    finally { setLoadingDevices(false); }
  }, []);

  useEffect(() => { loadDevices(); }, []);

  const revokeDevice = useCallback((deviceId, name) => {
    Alert.alert('Remove device', `Remove "${name || 'Unknown'}" from linked devices?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await api.post(`/auth/trusted-devices/${deviceId}/revoke`);
            setDevices(prev => prev.filter(d => d.device_id !== deviceId));
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
            toast('Device removed', 'success');
          } catch { toast('Failed', 'error'); }
        }
      },
    ]);
  }, [toast]);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    try {
      let qrToken = data;
      try { const parsed = JSON.parse(data); qrToken = parsed.qrToken || parsed.token || data; } catch {}
      const { data: res } = await api.post('/auth/qr/confirm', { qrToken });
      if (res?.status === 'success' || res?.data?.ok) {
        toast('Web browser linked!', 'success');
        setMode('list');
        loadDevices();
      } else {
        toast(res?.message || 'QR expired or invalid', 'error');
        setScanned(false);
      }
    } catch (e) {
      toast(e?.response?.data?.message || 'QR login failed', 'error');
      setScanned(false);
    }
    finally { setProcessing(false); }
  };

  // ─── Scanner mode ───
  if (mode === 'scan') {
    const lineY = scanLine.interpolate({ inputRange: [0, 1], outputRange: [10, FRAME - 10] });
    return (
      <View style={s.scanRoot}>
        <StatusBar style="light" />
        {CameraView ? (
          <CameraView
            style={s.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        ) : (
          <View style={s.noCam}>
            <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.4)" />
            <Text style={s.noCamText}>Camera not available</Text>
          </View>
        )}

        {/* Dim overlay outside frame */}
        <View style={s.dimTop} />
        <View style={s.dimBottom} />
        <View style={s.dimLeft} />
        <View style={s.dimRight} />

        {/* Header overlay */}
        <View style={[s.scanHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => { setMode('list'); setScanned(false); }}
            style={s.scanBackBtn}
            hitSlop={10}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.scanTitle}>Scan QR code</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scanner frame */}
        <View style={s.scanOverlay} pointerEvents="none">
          <View style={s.scanFrame}>
            <View style={[s.corner, s.tl]} />
            <View style={[s.corner, s.tr]} />
            <View style={[s.corner, s.bl]} />
            <View style={[s.corner, s.br]} />
            {!scanned && (
              <Animated.View
                style={[s.scanLine, { transform: [{ translateY: lineY }] }]}
              >
                <LinearGradient
                  colors={['transparent', brand.gold, 'transparent']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: 2 }}
                />
              </Animated.View>
            )}
          </View>
          <Text style={s.scanHint}>
            Point camera at QR code on{'\n'}TheChatNest web login page
          </Text>
          {processing && <ActivityIndicator color={brand.gold} style={{ marginTop: 18 }} />}
        </View>

        {scanned && !processing && (
          <TouchableOpacity
            style={s.rescanBtn}
            onPress={() => setScanned(false)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={brand.gradientGold}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.rescanInner}
            >
              <Ionicons name="refresh" size={16} color={brand.goldInk} />
              <Text style={s.rescanText}>Scan again</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ─── List mode ───
  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={brand.gradientHero}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={s.glowGold} />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.textOnDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Linked devices</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={devices}
        keyExtractor={(d, i) => String(d.device_id || i)}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshing={loadingDevices}
        onRefresh={loadDevices}
        ListHeaderComponent={
          <>
            {/* Link new device CTA */}
            <TouchableOpacity
              style={s.linkBtn}
              onPress={() => { setScanned(false); setMode('scan'); }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={brand.gradientGold}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.linkIcon}
              >
                <Ionicons name="qr-code" size={26} color={brand.goldInk} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={s.linkTitle}>Link a device</Text>
                <Text style={s.linkSub}>Scan QR from web to sign in</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={brand.gold} />
            </TouchableOpacity>

            {/* How it works */}
            <View style={s.howCard}>
              <Text style={s.howTitle}>How it works</Text>
              {[
                'Open TheChatNest in your web browser',
                'Click "Login via QR Code" on the login page',
                'Tap "Link a device" above and scan the QR',
              ].map((text, i) => (
                <View key={i} style={s.howRow}>
                  <View style={s.howStep}>
                    <Text style={s.howStepText}>{i + 1}</Text>
                  </View>
                  <Text style={s.howText}>{text}</Text>
                </View>
              ))}
            </View>

            <View style={s.sectionTitleRow}>
              <Text style={s.sectionTitle}>Active devices</Text>
              <Text style={s.sectionCount}>
                {devices.length || (loadingDevices ? '…' : '0')}
              </Text>
            </View>
          </>
        }
        renderItem={({ item: d, index }) => {
          const isCurrent = index === 0;
          const os = (d.os_name || '').toLowerCase();
          const isAndroid = os.includes('android');
          const isIOS = os.includes('ios') || os.includes('mac');
          const isWindows = os.includes('windows');
          let devIcon = 'monitor';
          let devColor = '#6d5dfc';
          if (isAndroid) { devIcon = 'android'; devColor = '#3DDC84'; }
          else if (isIOS) { devIcon = 'apple'; devColor = '#e2e8f0'; }
          else if (isWindows) { devIcon = 'microsoft-windows'; devColor = '#0ea5e9'; }

          return (
            <View style={s.deviceRow}>
              <View style={[s.deviceIcon, { backgroundColor: `${devColor}1f` }]}>
                <MaterialCommunityIcons name={devIcon} size={22} color={devColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.deviceNameRow}>
                  <Text style={s.deviceName}>{d.device_name || 'Unknown device'}</Text>
                  {isCurrent && (
                    <View style={s.currentBadge}>
                      <View style={s.currentDot} />
                      <Text style={s.currentText}>This device</Text>
                    </View>
                  )}
                </View>
                <Text style={s.deviceMeta} numberOfLines={1}>
                  {[d.os_name, d.city, d.country].filter(Boolean).join(' · ')}
                </Text>
                <Text style={s.deviceTime}>
                  {isCurrent ? 'Active now' : `Last active ${getTimeAgo(d.last_active_at)}`}
                </Text>
              </View>
              {!isCurrent && (
                <TouchableOpacity
                  style={s.revokeBtn}
                  onPress={() => revokeDevice(d.device_id, d.device_name)}
                  activeOpacity={0.7}
                  hitSlop={6}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          loadingDevices ? null : (
            <View style={s.empty}>
              <Ionicons name="phone-portrait-outline" size={36} color={colors.textOnDarkSubtle} />
              <Text style={s.emptyText}>No devices yet</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.navy },

  glowGold: {
    position: 'absolute',
    top: -100, right: -80,
    width: 320, height: 320,
    borderRadius: 160,
    backgroundColor: brand.gold,
    opacity: 0.05,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textOnDark,
    letterSpacing: -0.3,
  },

  // Link CTA
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,213,74,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,213,74,0.25)',
  },
  linkIcon: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: brand.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  linkTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textOnDark,
  },
  linkSub: {
    fontSize: fontSize.xs,
    color: colors.textOnDarkMuted,
    marginTop: 2,
  },

  // How it works
  howCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  howTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textOnDark,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  howRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  howStep: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,213,74,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  howStepText: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    color: brand.gold,
  },
  howText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textOnDarkMuted,
    lineHeight: 18,
  },

  // Section
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textOnDark,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 11,
    color: brand.gold,
    fontWeight: fontWeight.black,
    backgroundColor: 'rgba(255,213,74,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },

  // Device row
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing.lg,
    marginBottom: 8,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  deviceIcon: {
    width: 42, height: 42, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  deviceName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textOnDark,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  currentDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  currentText: {
    fontSize: 9,
    fontWeight: fontWeight.black,
    color: '#22c55e',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  deviceMeta: {
    fontSize: 11,
    color: colors.textOnDarkMuted,
    marginTop: 3,
  },
  deviceTime: {
    fontSize: 10,
    color: colors.textOnDarkSubtle,
    marginTop: 2,
  },
  revokeBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Empty
  empty: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyText: { fontSize: fontSize.sm, color: colors.textOnDarkMuted },

  // Scanner
  scanRoot: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  noCam: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#000', gap: 12,
  },
  noCamText: { color: 'rgba(255,255,255,0.6)', fontSize: fontSize.md },

  dimTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    transform: [{ translateY: -FRAME / 2 }],
    marginTop: '50%',
  },
  dimBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    transform: [{ translateY: FRAME / 2 }],
    marginBottom: '50%',
  },
  dimLeft: {
    position: 'absolute', top: '50%', left: 0,
    width: '50%', height: FRAME,
    backgroundColor: 'rgba(0,0,0,0.55)',
    transform: [{ translateY: -FRAME / 2 }, { translateX: -FRAME / 2 }],
  },
  dimRight: {
    position: 'absolute', top: '50%', right: 0,
    width: '50%', height: FRAME,
    backgroundColor: 'rgba(0,0,0,0.55)',
    transform: [{ translateY: -FRAME / 2 }, { translateX: FRAME / 2 }],
  },

  scanHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  scanBackBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  scanTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fff',
    letterSpacing: -0.2,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  scanFrame: {
    width: FRAME, height: FRAME,
    position: 'relative',
  },
  corner: {
    position: 'absolute', width: 32, height: 32,
    borderColor: brand.gold, borderWidth: 3,
  },
  tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 16 },
  tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 16 },
  bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 16 },
  br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 16 },
  scanLine: {
    position: 'absolute', left: 6, right: 6, top: 0,
  },
  scanHint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: 28,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  rescanBtn: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  rescanInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  rescanText: {
    color: brand.goldInk,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
});
