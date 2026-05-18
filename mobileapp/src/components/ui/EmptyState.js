// EmptyState — zero-data illustration card
//
// Used in chats list, contacts list, search results.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, brand, spacing, radius, fontSize, fontWeight, shadow } from "../../theme/colors";

const EmptyState = ({
  icon: Icon,
  iconSize = 28,
  title,
  body,
  cta,
  mode = "dark",
  style,
}) => {
  const isDark = mode === "dark";
  const titleColor = isDark ? colors.textOnDark : colors.text;
  const bodyColor = isDark ? colors.textOnDarkMuted : colors.textSecondary;

  return (
    <View style={[styles.wrap, style]}>
      {Icon && (
        <LinearGradient
          colors={brand.gradientGold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconWrap, shadow.glow]}
        >
          <Icon size={iconSize} color={brand.goldInk} />
        </LinearGradient>
      )}
      {title && (
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      )}
      {body && (
        <Text style={[styles.body, { color: bodyColor }]}>{body}</Text>
      )}
      {cta && <View style={styles.cta}>{cta}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.xxl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  body: {
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
  },
  cta: {
    marginTop: spacing.xl,
  },
});

export default EmptyState;
