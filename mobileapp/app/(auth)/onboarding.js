// ─── TheChatNest Mobile — Onboarding ───────────────────────────────
//
// Distinctive welcome screen: navy gradient top with staggered feature
// grid + cream card overlay with CTA. Different visual structure from
// the login flow but same brand DNA.

import { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  Animated, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { brand, colors, spacing, radius, fontSize, fontWeight } from '../../src/theme/colors';

const { width: W, height: H } = Dimensions.get('window');
const isSmall = H < 700;

const COLS = 3;
const GAP = 10;
const PAD = 20;
const CARD_W = (W - PAD * 2 - GAP * (COLS - 1)) / COLS;

const FEATURES = [
  { icon: 'chatbubble-ellipses', label: 'Chat',    tint: '#ffd54a' },
  { icon: 'people',              label: 'Groups',  tint: '#6d5dfc' },
  { icon: 'videocam',            label: 'Meet',    tint: '#0ea5e9' },
  { icon: 'document-text',       label: 'Files',   tint: '#f59e0b' },
  { icon: 'mic',                 label: 'Voice',   tint: '#ec4899' },
  { icon: 'shield-checkmark',    label: 'Secure',  tint: '#22c55e' },
];

export default function OnboardingScreen() {
  const anims = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const opacs = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const btnScale = useRef(new Animated.Value(0.85)).current;
  const headerY = useRef(new Animated.Value(-20)).current;
  const headerOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(headerY, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(headerOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.stagger(70, anims.map((a, i) =>
        Animated.parallel([
          Animated.spring(a, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
          Animated.timing(opacs[i], { toValue: 1, duration: 280, useNativeDriver: true }),
        ])
      )),
      Animated.parallel([
        Animated.spring(cardSlide, { toValue: 0, tension: 45, friction: 10, useNativeDriver: true }),
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.spring(btnScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const insets = useSafeAreaInsets();

  const handleStart = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    router.push('/(auth)/register');
  };

  return (
    <View style={z.root}>
      <StatusBar style="light" />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, minHeight: H }}
      >
        {/* ─── Dark Top Section ─── */}
        <LinearGradient
          colors={brand.gradientHero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[z.top, { paddingTop: insets.top + 16 }]}
        >
          <View style={z.glowGold} />
          <View style={z.glowViolet} />

          {/* Header */}
          <Animated.View
            style={[
              z.header,
              { opacity: headerOp, transform: [{ translateY: headerY }] },
            ]}
          >
            <LinearGradient
              colors={brand.gradientGold}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={z.logoBadge}
            >
              <Ionicons name="chatbubbles" size={14} color={brand.goldInk} />
            </LinearGradient>
            <Text style={z.logoText}>TheChatNest</Text>
            <View style={z.indiaPill}>
              <Text style={z.indiaPillText}>🇮🇳 IN</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={{ opacity: headerOp, transform: [{ translateY: headerY }] }}
          >
            <Text style={z.kicker}>SECURE TEAM CHAT</Text>
            <Text style={z.topTitle}>
              Built for{'\n'}
              <Text style={z.topTitleGold}>teams that ship.</Text>
            </Text>
            <Text style={z.topSub}>
              One workspace for chat, meetings, files & voice notes —
              hosted in India, encrypted end-to-end.
            </Text>
          </Animated.View>

          {/* Feature grid */}
          <View style={z.grid}>
            {FEATURES.map((f, i) => (
              <Animated.View
                key={f.label}
                style={[
                  z.gridItem,
                  {
                    opacity: opacs[i],
                    transform: [{ scale: anims[i] }],
                  },
                ]}
              >
                <View style={[z.gridIcon, { borderColor: f.tint + '40' }]}>
                  <Ionicons name={f.icon} size={isSmall ? 18 : 20} color={f.tint} />
                </View>
                <Text style={z.gridLabel}>{f.label}</Text>
              </Animated.View>
            ))}
          </View>
        </LinearGradient>

        {/* ─── Bottom Cream Card ─── */}
        <Animated.View
          style={[
            z.bottom,
            { opacity: cardFade, transform: [{ translateY: cardSlide }] },
          ]}
        >
          <View style={[z.bottomInner, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
            <View style={z.notch} />

            <Text style={z.heading}>
              Your team's{'\n'}
              <Text style={z.headingItalic}>command center.</Text>
            </Text>
            <Text style={z.desc}>
              Real-time messaging, file sharing, video meetings and voice
              notes — secured by default, priced for India.
            </Text>

            {/* Trust badges */}
            <View style={z.trustRow}>
              {[
                { icon: 'lock-closed', text: 'End-to-end encrypted' },
                { icon: 'flag', text: 'Hosted in India' },
                { icon: 'shield-checkmark', text: 'GDPR + DPDP' },
              ].map(t => (
                <View key={t.text} style={z.trustBadge}>
                  <Ionicons name={t.icon} size={10} color="#0d9c5b" />
                  <Text style={z.trustText}>{t.text}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity activeOpacity={0.88} onPress={handleStart}>
                <LinearGradient
                  colors={brand.gradientGold}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={z.btn}
                >
                  <Text style={z.btnText}>Get started — it's free</Text>
                  <View style={z.btnArrow}>
                    <Ionicons name="arrow-forward" size={14} color={brand.gold} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={z.signinRow}>
              <Text style={z.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={z.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const z = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.navy },

  // Top section
  top: {
    paddingHorizontal: PAD,
    paddingBottom: 50,
    overflow: 'hidden',
  },

  glowGold: {
    position: 'absolute',
    width: 280, height: 280,
    borderRadius: 140,
    backgroundColor: brand.gold,
    opacity: 0.07,
    top: -80, right: -60,
  },
  glowViolet: {
    position: 'absolute',
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: brand.violet,
    opacity: 0.1,
    bottom: 40, left: -50,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: isSmall ? 24 : 30,
  },
  logoBadge: {
    width: 28, height: 28, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: brand.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  logoText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.textOnDark,
    letterSpacing: -0.3,
    flex: 1,
  },
  indiaPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  indiaPillText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textOnDarkMuted,
    letterSpacing: 0.3,
  },

  // Hero copy
  kicker: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: brand.gold,
    letterSpacing: 2,
    marginBottom: 10,
  },
  topTitle: {
    fontSize: isSmall ? 26 : 32,
    fontWeight: fontWeight.black,
    color: colors.textOnDark,
    lineHeight: isSmall ? 34 : 40,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  topTitleGold: {
    color: brand.gold,
    fontStyle: 'italic',
  },
  topSub: {
    fontSize: fontSize.sm,
    color: colors.textOnDarkMuted,
    marginBottom: isSmall ? 20 : 26,
    lineHeight: 20,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  gridItem: {
    width: CARD_W,
    paddingVertical: isSmall ? 14 : 18,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
  },
  gridIcon: {
    width: isSmall ? 40 : 44,
    height: isSmall ? 40 : 44,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Bottom cream card
  bottom: {
    backgroundColor: brand.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
  },
  bottomInner: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  notch: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(15,23,42,0.12)',
    alignSelf: 'center',
    marginBottom: 18,
  },

  heading: {
    fontSize: isSmall ? 26 : 30,
    fontWeight: fontWeight.black,
    color: colors.text,
    lineHeight: isSmall ? 32 : 36,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  headingItalic: {
    color: brand.violet,
    fontStyle: 'italic',
  },
  desc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },

  // Trust badges
  trustRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
    flexWrap: 'wrap',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(13,156,91,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(13,156,91,0.2)',
  },
  trustText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: '#0d9c5b',
    letterSpacing: 0.2,
  },

  // CTA
  btn: {
    height: 56, borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: brand.gold,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  btnText: {
    color: brand.goldInk,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    letterSpacing: -0.2,
  },
  btnArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: brand.navy,
    alignItems: 'center', justifyContent: 'center',
  },

  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  signinText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  signinLink: {
    fontSize: fontSize.sm,
    color: brand.violet,
    fontWeight: fontWeight.black,
  },
});
