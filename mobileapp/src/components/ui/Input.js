// Input — TheChatNest mobile input primitive
//
// Modes: light (on cream/white) or dark (on navy)
// Supports label, hint, error, left/right icon, secure entry.

import React, { useState, useRef } from "react";
import { View, TextInput, Text, Pressable, StyleSheet, Animated } from "react-native";
import { colors, radius, spacing, fontSize, fontWeight } from "../../theme/colors";

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  secureTextEntry = false,
  icon: Icon,
  iconRight: IconRight,
  onIconRightPress,
  mode = "dark",       // dark | light
  keyboardType,
  autoCapitalize = "none",
  autoComplete,
  textContentType,
  multiline = false,
  numberOfLines,
  maxLength,
  editable = true,
  inputRef,
  onSubmitEditing,
  returnKeyType,
  style,
}) => {
  const [focused, setFocused] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const isLight = mode === "light";
  const placeholderColor = isLight ? "rgba(15,23,42,0.4)" : "rgba(255,255,255,0.4)";
  const textColor = isLight ? colors.text : colors.textOnDark;
  const labelColor = isLight ? colors.textSecondary : colors.textOnDarkMuted;
  const baseBg = isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.06)";
  const focusedBg = isLight ? "rgba(15,23,42,0.07)" : "rgba(255,255,255,0.12)";
  const baseBorder = isLight ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.12)";
  const focusedBorder = error ? colors.error : colors.primary;

  React.useEffect(() => {
    Animated.timing(animValue, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, animValue]);

  return (
    <View style={[styles.wrap, style]}>
      {label && (
        <Text style={[styles.label, { color: labelColor }]}>
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.field,
          {
            backgroundColor: focused ? focusedBg : baseBg,
            borderColor: focused ? focusedBorder : (error ? colors.error : baseBorder),
          },
        ]}
      >
        {Icon && (
          <View style={styles.iconLeft}>
            <Icon size={18} color={focused ? colors.primary : (isLight ? colors.textTertiary : colors.textOnDarkSubtle)} />
          </View>
        )}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          style={[
            styles.input,
            {
              color: textColor,
              paddingLeft: Icon ? 0 : spacing.lg,
              paddingRight: (IconRight || secureTextEntry) ? 0 : spacing.lg,
              textAlignVertical: multiline ? "top" : "center",
              minHeight: multiline ? 90 : 48,
            },
          ]}
        />

        {IconRight && (
          <Pressable
            onPress={onIconRightPress}
            style={styles.iconRight}
            hitSlop={10}
          >
            <IconRight size={18} color={isLight ? colors.textTertiary : colors.textOnDarkSubtle} />
          </Pressable>
        )}
      </Animated.View>

      {error && <Text style={styles.error}>{error}</Text>}
      {!error && hint && (
        <Text style={[styles.hint, { color: labelColor }]}>{hint}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    minHeight: 50,
  },
  iconLeft: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  iconRight: {
    paddingHorizontal: spacing.lg,
    height: "100%",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: fontWeight.semibold,
  },
  hint: {
    fontSize: fontSize.xs,
    marginTop: 6,
    marginLeft: 4,
  },
});

export default Input;
