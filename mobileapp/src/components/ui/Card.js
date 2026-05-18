// Card — base surface primitive for mobile lists / sheets
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing, shadow } from "../../theme/colors";

const Card = ({
  children,
  variant = "elevated",     // elevated | flat | glass | outlined
  onPress,
  style,
  padding = "lg",
  ...rest
}) => {
  const padValue = typeof padding === "string" ? spacing[padding] : padding;

  const variantStyle = {
    elevated: [styles.elevated, shadow.md],
    flat: styles.flat,
    glass: styles.glass,
    outlined: styles.outlined,
  }[variant];

  const Container = onPress ? Pressable : View;
  const containerProps = onPress
    ? {
        onPress,
        android_ripple: { color: "rgba(255,255,255,0.06)", borderless: false },
        style: ({ pressed }) => [
          styles.base,
          variantStyle,
          { padding: padValue, opacity: pressed ? 0.85 : 1 },
          style,
        ],
      }
    : {
        style: [styles.base, variantStyle, { padding: padValue }, style],
      };

  return <Container {...containerProps} {...rest}>{children}</Container>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  elevated: {
    backgroundColor: colors.card,
  },
  flat: {
    backgroundColor: colors.cardElevated,
  },
  glass: {
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;
