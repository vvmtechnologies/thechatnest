// Button — TheChatNest mobile design system
//
// Variants: gold (primary CTA), ghost (secondary), text (tertiary), danger
// Sizes: sm, md, lg
// Supports left/right icons and loading state.

import React from "react";
import { Text, Pressable, View, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { colors, brand, spacing, radius, fontSize, fontWeight, shadow } from "../../theme/colors";

const Button = ({
  label,
  onPress,
  variant = "gold",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  haptic = true,
}) => {
  const isGold = variant === "gold";
  const isGhost = variant === "ghost";
  const isText = variant === "text";
  const isDanger = variant === "danger";

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }
    onPress?.();
  };

  const sizeStyle = {
    sm: { paddingVertical: 8,  paddingHorizontal: 14, minHeight: 36, fontSize: fontSize.sm },
    md: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 46, fontSize: fontSize.md },
    lg: { paddingVertical: 16, paddingHorizontal: 24, minHeight: 54, fontSize: fontSize.lg },
  }[size];

  const inner = (
    <View style={[
      styles.inner,
      { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal, minHeight: sizeStyle.minHeight },
    ]}>
      {loading ? (
        <ActivityIndicator color={isGold ? brand.goldInk : colors.textOnDark} size="small" />
      ) : (
        <>
          {Icon && <Icon size={sizeStyle.fontSize + 3} color={
            isGold ? brand.goldInk
              : isDanger ? "#fff"
              : isGhost || isText ? colors.textOnDark
              : "#fff"
          } />}
          <Text style={[
            styles.label,
            {
              fontSize: sizeStyle.fontSize,
              color: isGold ? brand.goldInk
                : isDanger ? "#fff"
                : isGhost || isText ? colors.textOnDark
                : "#fff",
            },
          ]}>
            {label}
          </Text>
          {IconRight && <IconRight size={sizeStyle.fontSize + 1} color={
            isGold ? brand.goldInk
              : isDanger ? "#fff"
              : colors.textOnDark
          } />}
        </>
      )}
    </View>
  );

  if (isGold) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          fullWidth && styles.full,
          shadow.glow,
          { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={brand.gradientGold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.full,
        isGhost && styles.ghost,
        isText && styles.textVariant,
        isDanger && styles.danger,
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {inner}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  full: {
    alignSelf: "stretch",
  },
  gradient: {
    borderRadius: radius.full,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontWeight: fontWeight.bold,
    letterSpacing: -0.1,
    textAlign: "center",
  },
  ghost: {
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  textVariant: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.error,
  },
});

export default Button;
