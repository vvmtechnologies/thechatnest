// Avatar — circular user image with fallback initials gradient
//
// Sizes: xs (24), sm (32), md (40), lg (48), xl (64), xxl (96)
// Supports online dot (presence) and optional ring.

import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, brand, fontWeight } from "../../theme/colors";

const SIZE_MAP = {
  xs: { d: 24, font: 10 },
  sm: { d: 32, font: 12 },
  md: { d: 40, font: 14 },
  lg: { d: 48, font: 17 },
  xl: { d: 64, font: 22 },
  xxl: { d: 96, font: 32 },
};

const PALETTES = [
  ["#2065D1", "#1242a3"],
  ["#6d5dfc", "#4d3eff"],
  ["#16a34a", "#15803d"],
  ["#f59e0b", "#d97706"],
  ["#ec4899", "#be185d"],
  ["#a855f7", "#7e22ce"],
  ["#0891b2", "#155e75"],
  ["#dc2626", "#991b1b"],
];

const pickPalette = (seed = "") => {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % PALETTES.length;
  return PALETTES[n];
};

const getInitials = (label = "") => {
  const parts = String(label).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "TC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Avatar = ({
  uri,
  label = "",
  size = "md",
  online = null,        // true | false | null
  ring = false,
  style,
}) => {
  const cfg = SIZE_MAP[size] || SIZE_MAP.md;
  const initials = getInitials(label);
  const palette = pickPalette(label || "tcn");
  const dotSize = Math.max(8, Math.round(cfg.d * 0.22));

  return (
    <View style={[{ width: cfg.d, height: cfg.d }, style]}>
      <View
        style={[
          styles.wrap,
          { width: cfg.d, height: cfg.d, borderRadius: cfg.d / 2 },
          ring && {
            padding: 2,
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: brand.gold,
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={[
              styles.img,
              {
                width: ring ? cfg.d - 4 : cfg.d,
                height: ring ? cfg.d - 4 : cfg.d,
                borderRadius: (ring ? cfg.d - 4 : cfg.d) / 2,
              },
            ]}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={palette}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.fallback,
              {
                width: ring ? cfg.d - 4 : cfg.d,
                height: ring ? cfg.d - 4 : cfg.d,
                borderRadius: (ring ? cfg.d - 4 : cfg.d) / 2,
              },
            ]}
          >
            <Text style={[styles.initials, { fontSize: cfg.font, color: "#fff" }]}>
              {initials}
            </Text>
          </LinearGradient>
        )}
      </View>

      {online !== null && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: online ? colors.online : colors.offline,
              right: 0,
              bottom: 0,
              borderColor: colors.screen,
              borderWidth: 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  dot: {
    position: "absolute",
  },
});

export default Avatar;
