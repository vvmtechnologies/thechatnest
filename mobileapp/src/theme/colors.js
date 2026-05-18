// ─── TheChatNest Mobile — Brand System v2 ─────────────────────────
//
// Mobile app gets its own distinct aesthetic, separate from the web
// dashboard. Where the web feels editorial / desktop-first, mobile
// feels tactile, warm, and gesture-led.
//
// Palette: deep nest navy + gold honey accent + cream paper for soft
// surfaces. High-contrast where needed, soft elsewhere — built for
// long reading + frequent gestures.

// ─── Brand Colors ─────────────────────────────────────
export const brand = {
  // Primary surfaces
  navy:       '#0b0f1e',           // Deepest — top bars, status bar, nav
  navyMid:    '#11162a',           // Mid navy — chat backgrounds, cards
  navySoft:   '#1a1f3a',           // Soft navy — secondary surfaces

  // Accent (calls, badges, highlights)
  gold:       '#ffd54a',           // Primary gold — CTAs, badges, highlights
  goldDeep:   '#ffb74d',           // Gold deeper — gradient companion
  goldInk:    '#6e4f10',           // Gold-on-gold text (e.g. inside gold buttons)
  goldGlow:   'rgba(255,213,74,0.18)', // Translucent gold halo

  // Secondary accent — used sparingly for state colors only
  violet:     '#6d5dfc',           // Action / link tint
  violetDeep: '#4d3eff',           // Violet pressed state

  // Paper / cream — message-list backgrounds, modals
  paper:      '#f4f0e8',
  paperDeep:  '#ece6d4',

  // Gradients (use as arrays for LinearGradient)
  gradientNavy:  ['#0b0f1e', '#11162a'],
  gradientGold:  ['#ffd54a', '#ffb74d'],
  gradientHero:  ['#0b0f1e', '#11162a', '#1a3a8a'],
};

// ─── Surface / Background tokens ──────────────────────
export const colors = {
  // Brand
  primary:        brand.gold,
  primaryDeep:    brand.goldDeep,
  primaryInk:     brand.goldInk,
  accent:         brand.violet,

  // Surfaces
  screen:         '#0b0f1e',       // Default app background (dark theme default)
  screenAlt:      '#11162a',       // Alternate surface
  card:           '#1a1f3a',       // Card background
  cardElevated:   '#22273f',       // Elevated card (modals, sheets)

  // Light theme surfaces (for white-content screens)
  bg:             '#fafbff',
  surface:        '#ffffff',
  surfaceMuted:   '#f4f0e8',       // Cream — for "paper" feel
  surfaceVariant: '#f1f5f9',

  // Text on dark
  textOnDark:        '#ffffff',
  textOnDarkMuted:   'rgba(255,255,255,0.72)',
  textOnDarkSubtle:  'rgba(255,255,255,0.55)',

  // Text on light
  text:           '#0b0f1e',
  textSecondary:  'rgba(11,15,30,0.65)',
  textTertiary:   'rgba(11,15,30,0.45)',
  textInverse:    '#ffffff',

  // Status
  success:        '#22c55e',
  warning:        '#f59e0b',
  error:          '#ef4444',
  info:           '#0ea5e9',

  // Borders & dividers
  border:         'rgba(255,255,255,0.08)',
  borderLight:    'rgba(15,23,42,0.08)',
  divider:        'rgba(255,255,255,0.06)',
  dividerLight:   'rgba(15,23,42,0.06)',

  // Chat bubbles — TheChatNest distinctive look
  bubbleSent:        brand.gold,           // Outgoing — gold bubble
  bubbleSentInk:     brand.goldInk,        // Text on gold bubble
  bubbleReceived:    brand.navySoft,       // Incoming on dark — navy soft
  bubbleReceivedInk: '#ffffff',            // Text on dark bubble
  bubbleReceivedLight: '#ffffff',          // Incoming on light theme
  bubbleReceivedLightInk: '#0b0f1e',

  // Status indicators
  online:         '#22c55e',
  offline:        '#94a3b8',
  busy:           '#f59e0b',

  // Overlays
  overlay:           'rgba(11,15,30,0.65)',
  overlayDeep:       'rgba(11,15,30,0.85)',
  glassDark:         'rgba(11,15,30,0.7)',
  glassLight:        'rgba(255,255,255,0.08)',

  // Skeletons
  skeleton:       'rgba(255,255,255,0.06)',
  skeletonLight:  'rgba(15,23,42,0.06)',

  // Shadow tokens (use with shadow* style props)
  shadow:         'rgba(0,0,0,0.32)',
  shadowGlow:     'rgba(255,213,74,0.35)',

  // Header / nav
  headerBg:       brand.navy,
  headerText:     '#ffffff',
  tabBarBg:       brand.navyMid,
  tabBarInactive: 'rgba(255,255,255,0.45)',
  tabBarActive:   brand.gold,
};

// ─── Spacing scale ────────────────────────────────────
export const spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// ─── Border radius ────────────────────────────────────
export const radius = {
  xs:   4,
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  xxl:  24,
  bubble: 20,   // Chat bubbles
  full: 999,
};

// ─── Typography scale ─────────────────────────────────
export const fontSize = {
  xxs: 10,
  xs:  12,
  sm:  13,
  md:  15,
  lg:  17,
  xl:  20,
  xxl: 24,
  xxxl: 30,
  display: 36,
  hero: 44,
};

// ─── Font weight semantic tokens ──────────────────────
export const fontWeight = {
  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
  heavy:   '800',
  black:   '900',
};

// ─── Animation timing ─────────────────────────────────
export const motion = {
  fast:    150,
  base:    220,
  slow:    320,
  spring:  { damping: 18, mass: 0.8, stiffness: 220 },
};

// ─── Shadow presets ───────────────────────────────────
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
  },
  glow: {
    shadowColor: brand.gold,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
};

// Convenience export bundle
export default {
  brand,
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  motion,
  shadow,
};
