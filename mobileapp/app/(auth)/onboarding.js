// ─── TheChatNest Mobile — Onboarding Carousel ──────────────────────
//
// Three-slide swipeable onboarding with animated illustrations,
// page indicators, skip button. Fully responsive — uses % units and
// safe-area insets so it works from tiny SE-class phones up to tablets.

import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Platform, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { brand, colors, spacing, radius, fontSize, fontWeight } from '../../src/theme/colors';

const SLIDES = [
  {
    key: 'chat',
    kicker: '01 · MESSAGING',
    title: 'Team chat that\nactually feels fast.',
    titleAccent: 'actually feels fast.',
    desc: 'Real-time messages, threads, voice notes & rich media — synced across web, iOS and Android in milliseconds.',
    primary: { icon: 'chatbubbles', tint: '#ffd54a' },
    orbits: [
      { icon: 'mic',         tint: '#ec4899', angle: -40, dist: 0.62 },
      { icon: 'image',       tint: '#0ea5e9', angle: 30,  dist: 0.55 },
      { icon: 'happy',       tint: '#22c55e', angle: 110, dist: 0.6  },
      { icon: 'document',    tint: '#a78bfa', angle: 200, dist: 0.58 },
      { icon: 'paper-plane', tint: '#f59e0b', angle: 280, dist: 0.5  },
    ],
  },
  {
    key: 'meet',
    kicker: '02 · MEETINGS',
    title: 'Video meetings\nbuilt in.',
    titleAccent: 'built in.',
    desc: 'Spin up HD video calls with screen-share & recording — no separate Zoom tab, no per-seat add-on, no extra invoice.',
    primary: { icon: 'videocam', tint: '#6d5dfc' },
    orbits: [
      { icon: 'desktop',          tint: '#ffd54a', angle: -20, dist: 0.62 },
      { icon: 'recording',        tint: '#ef4444', angle: 60,  dist: 0.55 },
      { icon: 'people',           tint: '#22c55e', angle: 140, dist: 0.6  },
      { icon: 'volume-high',      tint: '#0ea5e9', angle: 220, dist: 0.55 },
      { icon: 'expand',           tint: '#f59e0b', angle: 310, dist: 0.58 },
    ],
  },
  {
    key: 'secure',
    kicker: '03 · PRIVACY',
    title: 'Hosted in India.\nEncrypted by default.',
    titleAccent: 'Encrypted by default.',
    desc: 'End-to-end encryption, DPDP + GDPR ready, data stays in Indian regions. No model training, no ad profiling.',
    primary: { icon: 'shield-checkmark', tint: '#22c55e' },
    orbits: [
      { icon: 'lock-closed',  tint: '#ffd54a', angle: -30, dist: 0.6  },
      { icon: 'key',          tint: '#6d5dfc', angle: 50,  dist: 0.55 },
      { icon: 'server',       tint: '#0ea5e9', angle: 130, dist: 0.62 },
      { icon: 'flag',         tint: '#ff9933', angle: 210, dist: 0.55 },
      { icon: 'eye-off',      tint: '#ec4899', angle: 295, dist: 0.58 },
    ],
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const isSmall = H < 700;
  const isTablet = W >= 600;

  const listRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  // Compute responsive sizing
  const visualSize = Math.min(W * 0.7, isSmall ? 240 : 320, H * 0.34);
  const primaryTileSize = visualSize * 0.32;
  const orbitIconSize = visualSize * 0.13;

  const handleStart = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    router.push('/(auth)/register');
  };
  const handleSignIn = () => router.push('/(auth)/login');
  const handleSkip = () => {
    try { Haptics.selectionAsync(); } catch {}
    listRef.current?.scrollToIndex({ index: SLIDES.length - 1, animated: true });
  };
  const handleNext = () => {
    try { Haptics.selectionAsync(); } catch {}
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      handleStart();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.[0]) setIndex(viewableItems[0].index);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={brand.gradientHero}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Atmospheric glows */}
      <View style={[s.glowGold, { width: W * 0.9, height: W * 0.9, top: -W * 0.3, right: -W * 0.25 }]} />
      <View style={[s.glowViolet, { width: W * 0.85, height: W * 0.85, bottom: -W * 0.3, left: -W * 0.25 }]} />

      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8, paddingHorizontal: W * 0.05 }]}>
        <View style={s.brandPill}>
          <LinearGradient
            colors={brand.gradientGold}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.brandTile}
          >
            <Ionicons name="chatbubbles" size={13} color={brand.goldInk} />
          </LinearGradient>
          <Text style={s.brandText}>TheChatNest</Text>
        </View>

        {index < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} hitSlop={10} style={s.skipBtn}>
            <Text style={s.skipText}>Skip</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textOnDarkMuted} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>

      {/* Slide carousel */}
      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
        renderItem={({ item, index: i }) => (
          <Slide
            slide={item}
            width={W}
            scrollX={scrollX}
            slideIndex={i}
            visualSize={visualSize}
            primaryTileSize={primaryTileSize}
            orbitIconSize={orbitIconSize}
            isSmall={isSmall}
            isTablet={isTablet}
          />
        )}
      />

      {/* Bottom panel — page dots + CTA */}
      <View
        style={[
          s.bottom,
          {
            paddingBottom: Math.max(insets.bottom + 14, 24),
            paddingHorizontal: W * 0.06,
          },
        ]}
      >
        {/* Page dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * W, i * W, (i + 1) * W];
            // scaleX is native-driver compatible (width is not)
            const scaleX = scrollX.interpolate({
              inputRange,
              outputRange: [1, 3.5, 1],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });
            const active = index === i;
            return (
              <Animated.View
                key={i}
                style={[
                  s.dot,
                  {
                    opacity,
                    backgroundColor: active ? brand.gold : 'rgba(255,255,255,0.3)',
                    transform: [{ scaleX }],
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Primary CTA */}
        <TouchableOpacity activeOpacity={0.88} onPress={handleNext}>
          <LinearGradient
            colors={brand.gradientGold}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[s.btn, { height: isSmall ? 52 : 58 }]}
          >
            <Text style={[s.btnText, { fontSize: isSmall ? 15 : 16 }]}>
              {index === SLIDES.length - 1 ? "Get started — it's free" : 'Continue'}
            </Text>
            <View style={s.btnArrow}>
              <Ionicons name="arrow-forward" size={14} color={brand.gold} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Sign in row */}
        <View style={s.signinRow}>
          <Text style={s.signinText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSignIn} hitSlop={8}>
            <Text style={s.signinLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Individual slide ──────────────────────────────────────────────
function Slide({ slide, width, scrollX, slideIndex, visualSize, primaryTileSize, orbitIconSize, isSmall, isTablet }) {
  const inputRange = [(slideIndex - 1) * width, slideIndex * width, (slideIndex + 1) * width];

  const visualScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
    extrapolate: 'clamp',
  });
  const visualOp = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });
  const textX = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.4, 0, -width * 0.4],
    extrapolate: 'clamp',
  });
  const textOp = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const titleParts = slide.title.split(slide.titleAccent);
  const maxContentWidth = isTablet ? 480 : width - 48;

  return (
    <View style={[ss.slide, { width }]}>
      {/* Visual */}
      <View style={[ss.visualWrap, { height: visualSize + 30 }]}>
        <Animated.View
          style={[
            ss.visual,
            {
              width: visualSize,
              height: visualSize,
              opacity: visualOp,
              transform: [{ scale: visualScale }],
            },
          ]}
        >
          {/* Soft outer halo */}
          <View
            style={[
              ss.halo,
              {
                width: visualSize,
                height: visualSize,
                borderRadius: visualSize / 2,
                backgroundColor: slide.primary.tint,
                opacity: 0.08,
              },
            ]}
          />
          {/* Inner ring */}
          <View
            style={[
              ss.ring,
              {
                width: visualSize * 0.78,
                height: visualSize * 0.78,
                borderRadius: (visualSize * 0.78) / 2,
              },
            ]}
          />
          {/* Dashed outer ring */}
          <View
            style={[
              ss.ringDashed,
              {
                width: visualSize * 0.95,
                height: visualSize * 0.95,
                borderRadius: (visualSize * 0.95) / 2,
              },
            ]}
          />

          {/* Primary tile */}
          <LinearGradient
            colors={brand.gradientGold}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[
              ss.primaryTile,
              {
                width: primaryTileSize,
                height: primaryTileSize,
                borderRadius: primaryTileSize * 0.28,
              },
            ]}
          >
            <Ionicons
              name={slide.primary.icon}
              size={primaryTileSize * 0.42}
              color={brand.goldInk}
            />
          </LinearGradient>

          {/* Orbit icons */}
          {slide.orbits.map((o, i) => {
            const rad = (o.angle * Math.PI) / 180;
            const r = (visualSize / 2) * o.dist;
            const cx = visualSize / 2 + Math.cos(rad) * r - orbitIconSize / 2;
            const cy = visualSize / 2 + Math.sin(rad) * r - orbitIconSize / 2;
            return (
              <View
                key={i}
                style={[
                  ss.orbit,
                  {
                    left: cx,
                    top: cy,
                    width: orbitIconSize,
                    height: orbitIconSize,
                    borderRadius: orbitIconSize * 0.3,
                    borderColor: o.tint + '60',
                  },
                ]}
              >
                <Ionicons name={o.icon} size={orbitIconSize * 0.42} color={o.tint} />
              </View>
            );
          })}
        </Animated.View>
      </View>

      {/* Text block */}
      <Animated.View
        style={[
          ss.text,
          { maxWidth: maxContentWidth, opacity: textOp, transform: [{ translateX: textX }] },
        ]}
      >
        <Text style={[ss.kicker, isSmall && { fontSize: 9 }]}>{slide.kicker}</Text>
        <Text style={[ss.title, isSmall && { fontSize: 24, lineHeight: 30 }]}>
          {titleParts[0]}
          <Text style={ss.titleAccent}>{slide.titleAccent}</Text>
          {titleParts[1] || ''}
        </Text>
        <Text style={[ss.desc, isSmall && { fontSize: 13, lineHeight: 19 }]}>
          {slide.desc}
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.navy },

  glowGold: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: brand.gold,
    opacity: 0.08,
  },
  glowViolet: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: brand.violet,
    opacity: 0.12,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  brandTile: {
    width: 22, height: 22, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: {
    color: colors.textOnDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  skipText: {
    color: colors.textOnDarkMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  bottom: {
    paddingTop: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  btn: {
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    marginTop: spacing.md,
  },
  signinText: {
    fontSize: fontSize.sm,
    color: colors.textOnDarkMuted,
  },
  signinLink: {
    fontSize: fontSize.sm,
    color: brand.gold,
    fontWeight: fontWeight.black,
  },
});

const ss = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: spacing.lg,
  },
  visualWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  visual: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ringDashed: {
    position: 'absolute',
    borderWidth: 1.2,
    borderColor: 'rgba(255,213,74,0.22)',
    borderStyle: 'dashed',
  },
  primaryTile: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    ...Platform.select({
      ios: {
        shadowColor: brand.gold,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
      },
      android: { elevation: 14 },
    }),
  },
  orbit: {
    position: 'absolute',
    backgroundColor: 'rgba(11,15,30,0.85)',
    borderWidth: 1.3,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },

  text: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: spacing.xl,
  },
  kicker: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: brand.gold,
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: fontWeight.black,
    color: colors.textOnDark,
    lineHeight: 36,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  titleAccent: {
    color: brand.gold,
    fontStyle: 'italic',
  },
  desc: {
    fontSize: 14,
    color: colors.textOnDarkMuted,
    lineHeight: 21,
    fontWeight: fontWeight.medium,
  },
});
