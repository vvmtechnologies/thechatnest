// ─── TheChatNest Mobile — Forgot Password ──────────────────────────
//
// Navy + gold aesthetic. Three-step flow: email → OTP → new password.
// All forgotPassword/forgotVerify/resetPassword API logic preserved.

import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  ScrollView, Keyboard, KeyboardAvoidingView, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import OtpInput from '../../src/components/OtpInput';
import { useToast } from '../../src/components/Toast';
import { forgotPassword, forgotVerify, resetPassword } from '../../src/api/auth';
import { brand, colors, spacing, radius, fontSize, fontWeight } from '../../src/theme/colors';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';

const COOL = 30;

export default function ForgotPasswordScreen() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cool, setCool] = useState(0);
  const [errors, setErrors] = useState({});

  const fade = useState(new Animated.Value(0))[0];
  const slide = useState(new Animated.Value(20))[0];

  useEffect(() => {
    fade.setValue(0); slide.setValue(20);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  }, [step]);

  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  const handleSendOtp = useCallback(async () => {
    if (!email.trim()) { setErrors({ email: 'Email required' }); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErrors({ email: 'Invalid email' }); return; }
    Keyboard.dismiss(); setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setStep(2); setCool(COOL); setOtp('');
      toast('OTP sent', 'success');
    } catch (e) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      toast(e?.response?.data?.message || 'Failed', 'error');
    } finally { setLoading(false); }
  }, [email, toast]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length < 6) return toast('Enter 6-digit code', 'warning');
    Keyboard.dismiss(); setLoading(true);
    try {
      const r = await forgotVerify(email.trim().toLowerCase(), otp);
      setResetToken(r?.reset_token || r?.token || '');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setStep(3); toast('OTP verified', 'success');
    } catch (e) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      toast(e?.response?.data?.message || 'Invalid OTP', 'error');
    } finally { setLoading(false); }
  }, [email, otp, toast]);

  const handleReset = useCallback(async () => {
    const e = {};
    if (newPass.length < 8) e.pass = 'Min 8 characters';
    if (newPass !== confirm) e.confirm = "Don't match";
    if (Object.keys(e).length) { setErrors(e); return; }
    Keyboard.dismiss(); setLoading(true);
    try {
      await resetPassword(resetToken, newPass);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      toast('Password reset!', 'success');
      setTimeout(() => router.replace('/(auth)/login'), 800);
    } catch (e) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      toast(e?.response?.data?.message || 'Failed', 'error');
    } finally { setLoading(false); }
  }, [newPass, confirm, resetToken, toast]);

  const handleResend = useCallback(async () => {
    if (cool > 0) return;
    try {
      await forgotPassword(email.trim().toLowerCase());
      setCool(COOL); setOtp('');
      toast('New code sent', 'success');
    } catch { toast('Failed', 'error'); }
  }, [email, cool, toast]);

  const titles = ['Forgot password?', 'Verify your email', 'Set new password'];
  const kickers = ['STEP 1 OF 3', 'STEP 2 OF 3', 'STEP 3 OF 3'];
  const subs = [
    "Enter the email tied to your account — we'll send a 6-digit code.",
    `We sent a 6-digit code to`,
    'Pick something strong — at least 8 characters.',
  ];

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={brand.gradientHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={s.glowGold} />
      <View style={s.glowViolet} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top bar */}
            <View style={s.topBar}>
              <TouchableOpacity
                onPress={() => step === 1 ? router.back() : setStep(step - 1)}
                hitSlop={12}
                style={s.backBtn}
              >
                <Ionicons name="chevron-back" size={20} color={colors.textOnDark} />
              </TouchableOpacity>
              <View style={s.brandPill}>
                <LinearGradient
                  colors={brand.gradientGold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.brandTile}
                >
                  <Ionicons name="key" size={13} color={brand.goldInk} />
                </LinearGradient>
                <Text style={s.brandText}>Reset</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            {/* Step indicator */}
            <View style={s.steps}>
              {[1, 2, 3].map(i => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[s.stepCircle, step >= i && s.stepCircleActive]}>
                    {step > i ? (
                      <Ionicons name="checkmark" size={12} color={brand.goldInk} />
                    ) : (
                      <Text style={[s.stepNum, step >= i && s.stepNumActive]}>{i}</Text>
                    )}
                  </View>
                  {i < 3 && <View style={[s.stepLine, step > i && s.stepLineActive]} />}
                </View>
              ))}
            </View>

            <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
              {/* Header */}
              <View style={s.headerWrap}>
                <Text style={s.kicker}>{kickers[step - 1]}</Text>
                <Text style={s.title}>{titles[step - 1]}</Text>
                <Text style={s.sub}>
                  {subs[step - 1]}
                  {step === 2 && <Text style={s.subEmail}>{'\n'}{email}</Text>}
                </Text>
              </View>

              {/* Card */}
              <View style={s.card}>
                {step === 1 && (
                  <>
                    <Input
                      mode="dark"
                      label="Email address"
                      placeholder="you@company.com"
                      value={email}
                      onChangeText={(t) => { setEmail(t); setErrors({}); }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      icon={(p) => <Ionicons name="mail-outline" {...p} />}
                      error={errors.email}
                    />
                    <Button
                      label="Send code"
                      onPress={handleSendOtp}
                      loading={loading}
                      variant="gold"
                      size="lg"
                      fullWidth
                      iconRight={(p) => <Ionicons name="paper-plane" {...p} />}
                      style={{ marginTop: spacing.xs }}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <View style={s.otpInputWrap}>
                      <OtpInput value={otp} onChange={setOtp} />
                    </View>
                    <Button
                      label="Verify code"
                      onPress={handleVerifyOtp}
                      loading={loading}
                      disabled={otp.length < 6}
                      variant="gold"
                      size="lg"
                      fullWidth
                      iconRight={(p) => <Ionicons name="checkmark-circle" {...p} />}
                    />
                    <View style={s.resendRow}>
                      <Text style={s.muted}>Didn't get it? </Text>
                      {cool > 0 ? (
                        <Text style={s.coolText}>Resend in {cool}s</Text>
                      ) : (
                        <TouchableOpacity onPress={handleResend}>
                          <Text style={s.link}>Resend code</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}

                {step === 3 && (
                  <>
                    <Input
                      mode="dark"
                      label="New password"
                      placeholder="Min 8 characters"
                      value={newPass}
                      onChangeText={(t) => { setNewPass(t); setErrors(e => ({ ...e, pass: '' })); }}
                      secureTextEntry={!show}
                      icon={(p) => <Ionicons name="lock-closed-outline" {...p} />}
                      iconRight={(p) => <Ionicons name={show ? 'eye-off' : 'eye'} {...p} />}
                      onIconRightPress={() => setShow(!show)}
                      error={errors.pass}
                    />
                    <Input
                      mode="dark"
                      label="Confirm password"
                      placeholder="Re-enter password"
                      value={confirm}
                      onChangeText={(t) => { setConfirm(t); setErrors(e => ({ ...e, confirm: '' })); }}
                      secureTextEntry={!show}
                      icon={(p) => <Ionicons name="shield-checkmark-outline" {...p} />}
                      error={errors.confirm}
                    />
                    <Button
                      label="Reset password"
                      onPress={handleReset}
                      loading={loading}
                      variant="gold"
                      size="lg"
                      fullWidth
                      iconRight={(p) => <Ionicons name="lock-open" {...p} />}
                      style={{ marginTop: spacing.xs }}
                    />
                  </>
                )}
              </View>

              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                style={s.signInRow}
              >
                <Ionicons name="arrow-back-outline" size={14} color={colors.textOnDarkMuted} />
                <Text style={s.signInText}>Back to sign in</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.navy },

  glowGold: {
    position: 'absolute',
    top: -120, right: -90,
    width: 380, height: 380,
    borderRadius: 190,
    backgroundColor: brand.gold,
    opacity: 0.06,
  },
  glowViolet: {
    position: 'absolute',
    bottom: -140, left: -100,
    width: 360, height: 360,
    borderRadius: 180,
    backgroundColor: brand.violet,
    opacity: 0.08,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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

  // Steps
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: brand.gold,
    borderColor: brand.gold,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.35)',
  },
  stepNumActive: { color: brand.goldInk },
  stepLine: {
    width: 38, height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
    borderRadius: 1,
  },
  stepLineActive: { backgroundColor: brand.gold },

  // Header
  headerWrap: {
    marginBottom: spacing.xl,
    alignItems: 'flex-start',
  },
  kicker: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: brand.gold,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: fontWeight.black,
    color: colors.textOnDark,
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: 10,
  },
  sub: {
    fontSize: fontSize.sm,
    color: colors.textOnDarkMuted,
    lineHeight: 20,
  },
  subEmail: {
    color: brand.gold,
    fontWeight: fontWeight.bold,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.4,
        shadowRadius: 32,
      },
      android: { elevation: 8 },
    }),
  },

  otpInputWrap: {
    marginVertical: spacing.lg,
    alignItems: 'center',
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textOnDarkMuted,
  },
  coolText: {
    fontSize: fontSize.sm,
    color: colors.textOnDarkSubtle,
    fontWeight: fontWeight.semibold,
  },
  link: {
    fontSize: fontSize.sm,
    color: brand.gold,
    fontWeight: fontWeight.black,
  },

  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xl,
    paddingVertical: 8,
  },
  signInText: {
    fontSize: fontSize.xs,
    color: colors.textOnDarkMuted,
    fontWeight: fontWeight.semibold,
  },
});
