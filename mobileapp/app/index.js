// ─── TheChatNest Mobile — Splash Screen ─────────────────────────────
//
// Distinctive navy + gold aesthetic matching the brand. Animated nest
// icon with orbital messaging icons that whisper "team chat" without
// being literal. Routes to onboarding (if logged out) or chat list
// (if logged in) after the animation completes.

import { useEffect, useRef, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, StyleSheet, Animated, Dimensions, Platform, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/store/AuthContext';
import { brand } from '../src/theme/colors';

const { width } = Dimensions.get('window');
const RADIUS = Math.min(width * 0.32, 110);
const ICON = 38;
const COUNT = 6;

// Orbit icons in brand-coordinated colors
const ICONS = [
  { name: 'chatbubble-ellipses', tint: '#ffd54a' },
  { name: 'videocam',            tint: '#6d5dfc' },
  { name: 'shield-checkmark',    tint: '#22c55e' },
  { name: 'document-text',       tint: '#f59e0b' },
  { name: 'mic',                 tint: '#ec4899' },
  { name: 'sparkles',            tint: '#0ea5e9' },
];

export default function Splash() {
  const { user, loading } = useAuth();
  const [done, setDone] = useState(false);

  const ring = useRef(new Animated.Value(0)).current;
  const logo = useRef(new Animated.Value(0)).current;
  const logoOp = useRef(new Animated.Value(0)).current;
  const iconAn = useRef(ICONS.map(() => new Animated.Value(0))).current;
  const iconOp = useRef(ICONS.map(() => new Animated.Value(0))).current;
  const spin = useRef(new Animated.Value(0)).current;
  const titleOp = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(15)).current;
  const tagOp = useRef(new Animated.Value(0)).current;
  const dotsOp = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous outer ring rotation
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Subtle pulsing glow behind logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Entrance sequence
    Animated.sequence([
      Animated.spring(ring, { toValue: 1, tension: 36, friction: 8, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logo, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOp, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]),
      Animated.stagger(110, iconAn.map((a, i) =>
        Animated.parallel([
          Animated.spring(a, { toValue: 1, tension: 65, friction: 7, useNativeDriver: true }),
          Animated.timing(iconOp[i], { toValue: 1, duration: 220, useNativeDriver: true }),
        ])
      )),
      Animated.parallel([
        Animated.spring(titleY, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
        Animated.timing(titleOp, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]),
      Animated.timing(tagOp, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(dotsOp, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(fade, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start(() => setDone(true));
  }, []);

  if (done) {
    if (loading) {
      return (
        <View style={[z.root, { backgroundColor: brand.navy, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="chatbubbles" size={48} color={brand.gold} />
        </View>
      );
    }
    if (user) return <Redirect href="/(tabs)/chats" />;
    return <Redirect href="/(auth)/onboarding" />;
  }

  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const counterRot = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
  const ringS = ring.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const glowOp = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
  const insets = useSafeAreaInsets();
  const BOX = RADIUS * 2 + ICON;

  return (
    <Animated.View style={[z.root, { opacity: fade }]}>
      <LinearGradient
        colors={[brand.navy, brand.navyMid, brand.navySoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={z.grad}
      >
        {/* Soft radial glow blob top-right (warm gold) */}
        <View style={z.glowTopRight} />
        {/* Soft radial glow blob bottom-left (cool violet) */}
        <View style={z.glowBottomLeft} />

        <View style={[z.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={[z.center, { width: BOX + 20, height: BOX + 20 }]}>

            {/* Outer dashed ring */}
            <Animated.View
              style={[
                z.ring,
                { width: BOX, height: BOX, borderRadius: BOX / 2, opacity: ring, transform: [{ scale: ringS }] },
              ]}
            />

            {/* Inner solid ring */}
            <Animated.View
              style={[
                z.ringSolid,
                { width: BOX - 38, height: BOX - 38, borderRadius: (BOX - 38) / 2, opacity: ring, transform: [{ scale: ringS }] },
              ]}
            />

            {/* Orbiting icons (rotating) */}
            <Animated.View style={{ width: BOX, height: BOX, position: 'absolute', transform: [{ rotate: rotation }] }}>
              {ICONS.map((ic, i) => {
                const a = (i / COUNT) * Math.PI * 2 - Math.PI / 2;
                const cx = BOX / 2 + Math.cos(a) * RADIUS - ICON / 2;
                const cy = BOX / 2 + Math.sin(a) * RADIUS - ICON / 2;
                return (
                  <Animated.View
                    key={i}
                    style={{
                      position: 'absolute',
                      left: cx, top: cy,
                      width: ICON, height: ICON,
                      opacity: iconOp[i],
                      transform: [{ scale: iconAn[i] }, { rotate: counterRot }],
                    }}
                  >
                    <View style={[z.iconBg, { borderColor: ic.tint + '55' }]}>
                      <Ionicons name={ic.name} size={17} color={ic.tint} />
                    </View>
                  </Animated.View>
                );
              })}
            </Animated.View>

            {/* Pulsing gold halo behind logo */}
            <Animated.View
              style={[
                z.halo,
                { opacity: glowOp, transform: [{ scale: glowScale }] },
              ]}
            />

            {/* Center logo tile — gold */}
            <Animated.View style={[z.centerContent, { opacity: logoOp, transform: [{ scale: logo }] }]}>
              <LinearGradient
                colors={brand.gradientGold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={z.logoTile}
              >
                <Ionicons name="chatbubbles" size={32} color={brand.goldInk} />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Brand wordmark + dots */}
          <View style={z.below}>
            <Animated.Text
              style={[
                z.brandText,
                { opacity: titleOp, transform: [{ translateY: titleY }] },
              ]}
            >
              TheChatNest
            </Animated.Text>
            <Animated.Text style={[z.tagText, { opacity: tagOp }]}>
              Secure team chat, built for India
            </Animated.Text>
            <Animated.View style={{ opacity: dotsOp, marginTop: 22 }}>
              <Dots />
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function Dots() {
  const d = [
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
  ];
  useEffect(() => {
    d.forEach((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0.2, duration: 400, useNativeDriver: true }),
        ])
      ).start()
    );
  }, []);
  return (
    <View style={z.dots}>
      {d.map((a, i) => (
        <Animated.View key={i} style={[z.dot, { opacity: a, transform: [{ scale: a }] }]} />
      ))}
    </View>
  );
}

const z = StyleSheet.create({
  root: { flex: 1 },
  grad: { flex: 1 },
  safe: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  glowTopRight: {
    position: 'absolute',
    top: -100, right: -80,
    width: 400, height: 400,
    borderRadius: 200,
    backgroundColor: brand.gold,
    opacity: 0.06,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -120, left: -80,
    width: 360, height: 360,
    borderRadius: 180,
    backgroundColor: brand.violet,
    opacity: 0.1,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255,213,74,0.25)',
    borderStyle: 'dashed',
  },
  ringSolid: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  iconBg: {
    width: ICON, height: ICON,
    borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
      android: { elevation: 5 },
    }),
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  halo: {
    position: 'absolute',
    width: 110, height: 110,
    borderRadius: 55,
    backgroundColor: brand.gold,
    zIndex: 5,
  },
  logoTile: {
    width: 78, height: 78,
    borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: brand.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16 },
      android: { elevation: 12 },
    }),
  },
  below: { alignItems: 'center', marginTop: 38 },
  brandText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  dots: { flexDirection: 'row', gap: 10 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: brand.gold },
});
