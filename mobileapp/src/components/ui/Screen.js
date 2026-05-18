// Screen — TheChatNest mobile page wrapper
//
// Handles status bar, safe area, background color/gradient, and KeyboardAvoidingView.
// Two modes: dark (default, navy bg) and light (cream/white bg).

import React from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, brand } from "../../theme/colors";

const Screen = ({
  children,
  mode = "dark",
  gradient = false,
  scroll = false,
  keyboardAvoiding = true,
  edges = ["top", "bottom", "left", "right"],
  style,
}) => {
  const isDark = mode === "dark";
  const bg = isDark ? colors.screen : colors.bg;
  const statusBarStyle = isDark ? "light" : "dark";

  const inner = (
    <View style={[styles.flex, style]}>
      {children}
    </View>
  );

  const wrapped = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {inner}
    </KeyboardAvoidingView>
  ) : (
    inner
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={isDark ? brand.gradientHero : ["#fafbff", "#ffffff"]}
        style={styles.flex}
      >
        <StatusBar style={statusBarStyle} />
        <SafeAreaView edges={edges} style={styles.flex}>
          {wrapped}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: bg }]}>
      <StatusBar style={statusBarStyle} />
      <SafeAreaView edges={edges} style={styles.flex}>
        {wrapped}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default Screen;
