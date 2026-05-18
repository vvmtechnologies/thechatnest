// ─── TheChatNest Mobile — Sign Up ──────────────────────────────────
//
// Navy + gold aesthetic matching splash/login. Two-step form: details
// then email OTP. All registration/verify/resend API logic preserved.

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
import { register, verifyOtp, resendOtp } from '../../src/api/auth';
import { brand, colors, spacing, radius, fontSize, fontWeight } from '../../src/theme/colors';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';

const COOL = 30;

export default function RegisterScreen() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [show, setShow] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cool, setCool] = useState(0);
  const [err, setErr] = useState({});

  const fade = useState(new Animated.Value(0))[0];
  const slide = useState(new Animated.Value(20))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  }, [step]);

  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  // Password strength
  const getPasswordStrength = (p) => {
    if (!p) return { level: 0, label: '', color: 'rgba(255,255,255,0.15)' };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#22c55e' };
    return { level: 4, label: 'Strong', color: brand.gold };
  };
  const passStrength = getPasswordStrength(pass);

  const validate = useCallback(() => {
    const e = {};
    if (!company.trim()) e.company = 'Required';
    if (!name.trim()) e.name = 'Required';
    if (!phone.trim()) e.phone = 'Required';
    else if (phone.replace(/\D/g, '').length < 10) e.phone = 'Min 10 digits';
    if (!email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!pass) e.pass = 'Required';
    else if (pass.length < 8) e.pass = 'Min 8 chars';
    if (!confirm) e.confirm = 'Required';
    else if (pass !== confirm) e.confirm = "Don't match";
    setErr(e);
    return !Object.keys(e).length;
  }, [company, name, email, phone, pass, confirm]);

  const handleRegister = useCallback(async () => {
    Keyboard.dismiss();
    if (!validate()) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      return;
    }
    if (!termsAccepted) { toast('Please accept Terms & Privacy Policy', 'error'); return; }
    setLoading(true);
    try {
      await register({
        companyName: company.trim(),
        ownerName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ''),
        password: pass,
      });
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      fade.setValue(0); slide.setValue(20);
      setStep(2); setCool(COOL); setOtp('');
      toast('OTP sent to your email', 'success');
    } catch (e) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      toast(e?.response?.data?.message || 'Failed', 'error');
    }
    finally { setLoading(false); }
  }, [company, name, email, phone, pass, validate, termsAccepted, toast]);

  const handleVerify = useCallback(async () => {
    if (otp.length < 6) return toast('Enter 6-digit code', 'warning');
    Keyboard.dismiss(); setLoading(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), otp);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      toast('Account created! Please sign in.', 'success');
      setTimeout(() => router.replace('/(auth)/login'), 800);
    } catch (e) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      toast(e?.response?.data?.message || 'Invalid OTP', 'error');
    }
    finally { setLoading(false); }
  }, [email, otp, toast]);

  const handleResend = useCallback(async () => {
    if (cool > 0) return;
    try {
      await resendOtp(email.trim().toLowerCase());
      setCool(COOL); setOtp('');
      toast('New code sent', 'success');
    } catch { toast('Resend failed', 'error'); }
  }, [email, cool, toast]);

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={brand.gradientHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Atmospheric glow blobs */}
      <View style={s.glowGold} />
      <View style={s.glowViolet} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 12}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top bar */}
            <View style={s.topBar}>
              <TouchableOpacity
                onPress={() => step === 2 ? setStep(1) : router.back()}
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
                  <Ionicons name="chatbubbles" size={14} color={brand.goldInk} />
                </LinearGradient>
                <Text style={s.brandText}>TheChatNest</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            {/* Step indicator */}
            <View style={s.steps}>
              <View style={[s.stepDot, step >= 1 && s.stepDotActive]} />
              <View style={[s.stepLine, step >= 2 && s.stepLineActive]} />
              <View style={[s.stepDot, step >= 2 && s.stepDotActive]} />
            </View>

            <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
              {step === 1 ? (
                <>
                  {/* Header */}
                  <View style={s.headerWrap}>
                    <Text style={s.kicker}>STEP 1 OF 2</Text>
                    <Text style={s.title}>Create your{'\n'}<Text style={s.titleGold}>workspace</Text></Text>
                    <Text style={s.sub}>
                      Spin up a secure team workspace in under a minute.
                    </Text>
                  </View>

                  {/* Glass card */}
                  <View style={s.card}>
                    <Input
                      mode="dark"
                      placeholder="Company name"
                      value={company}
                      onChangeText={setCompany}
                      autoCapitalize="words"
                      icon={(p) => <Ionicons name="business-outline" {...p} />}
                      error={err.company}
                    />

                    <Input
                      mode="dark"
                      placeholder="Your full name"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      icon={(p) => <Ionicons name="person-outline" {...p} />}
                      error={err.name}
                    />

                    <View style={s.row}>
                      <View style={{ flex: 1 }}>
                        <Input
                          mode="dark"
                          placeholder="Phone"
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                          maxLength={10}
                          icon={(p) => <Ionicons name="call-outline" {...p} />}
                          error={err.phone}
                        />
                      </View>
                      <View style={{ flex: 1.2 }}>
                        <Input
                          mode="dark"
                          placeholder="Email"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          icon={(p) => <Ionicons name="mail-outline" {...p} />}
                          error={err.email}
                        />
                      </View>
                    </View>

                    <Input
                      mode="dark"
                      placeholder="Password (min 8 chars)"
                      value={pass}
                      onChangeText={setPass}
                      secureTextEntry={!show}
                      icon={(p) => <Ionicons name="lock-closed-outline" {...p} />}
                      iconRight={(p) => <Ionicons name={show ? 'eye-off' : 'eye'} {...p} />}
                      onIconRightPress={() => setShow(!show)}
                      error={err.pass}
                    />

                    {/* Strength meter */}
                    {pass.length > 0 && (
                      <View style={s.strengthWrap}>
                        <View style={s.strengthBar}>
                          {[1, 2, 3, 4].map(i => (
                            <View
                              key={i}
                              style={[
                                s.strengthSeg,
                                {
                                  backgroundColor: i <= passStrength.level
                                    ? passStrength.color
                                    : 'rgba(255,255,255,0.08)',
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <Text style={[s.strengthLabel, { color: passStrength.color }]}>
                          {passStrength.label}
                        </Text>
                      </View>
                    )}

                    <Input
                      mode="dark"
                      placeholder="Confirm password"
                      value={confirm}
                      onChangeText={setConfirm}
                      secureTextEntry={!show}
                      icon={(p) => <Ionicons name="shield-checkmark-outline" {...p} />}
                      error={err.confirm}
                    />

                    {/* Terms */}
                    <TouchableOpacity
                      style={s.termsRow}
                      onPress={() => setTermsAccepted(!termsAccepted)}
                      activeOpacity={0.7}
                    >
                      <View style={[s.checkbox, termsAccepted && s.checkboxOn]}>
                        {termsAccepted && (
                          <Ionicons name="checkmark" size={14} color={brand.goldInk} />
                        )}
                      </View>
                      <Text style={s.termsText}>
                        I agree to the{' '}
                        <Text
                          style={s.termsLink}
                          onPress={() => router.push('/chat/legal?type=terms')}
                        >
                          Terms
                        </Text>
                        {' '}and{' '}
                        <Text
                          style={s.termsLink}
                          onPress={() => router.push('/chat/legal?type=privacy')}
                        >
                          Privacy Policy
                        </Text>
                      </Text>
                    </TouchableOpacity>

                    <Button
                      label="Create account"
                      onPress={handleRegister}
                      loading={loading}
                      disabled={!termsAccepted}
                      variant="gold"
                      size="lg"
                      fullWidth
                      iconRight={(p) => <Ionicons name="arrow-forward" {...p} />}
                      style={{ marginTop: spacing.md }}
                    />

                    <View style={s.footerRow}>
                      <Text style={s.footerText}>Already have an account? </Text>
                      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                        <Text style={s.footerLink}>Sign in</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Trust strip */}
                  <View style={s.trustRow}>
                    <Trust icon="shield-checkmark" text="End-to-end encrypted" />
                    <Trust icon="server" text="Made in India" />
                    <Trust icon="lock-closed" text="No data sold" />
                  </View>
                </>
              ) : (
                /* ─── OTP STEP ─── */
                <>
                  <View style={s.headerWrap}>
                    <View style={s.otpBadgeWrap}>
                      <LinearGradient
                        colors={brand.gradientGold}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.otpBadge}
                      >
                        <Ionicons name="mail-open" size={28} color={brand.goldInk} />
                      </LinearGradient>
                    </View>
                    <Text style={s.kicker}>STEP 2 OF 2</Text>
                    <Text style={s.title}>Verify your email</Text>
                    <Text style={s.sub}>
                      We sent a 6-digit code to{'\n'}
                      <Text style={s.subEmail}>{email}</Text>
                    </Text>
                  </View>

                  <View style={s.card}>
                    <View style={s.otpInputWrap}>
                      <OtpInput value={otp} onChange={setOtp} />
                    </View>

                    <Button
                      label="Verify & continue"
                      onPress={handleVerify}
                      loading={loading}
                      disabled={otp.length < 6}
                      variant="gold"
                      size="lg"
                      fullWidth
                      iconRight={(p) => <Ionicons name="arrow-forward" {...p} />}
                      style={{ marginTop: spacing.md }}
                    />

                    <View style={s.resendRow}>
                      <Text style={s.footerText}>Didn't get it? </Text>
                      {cool > 0 ? (
                        <Text style={s.coolText}>Resend in {cool}s</Text>
                      ) : (
                        <TouchableOpacity onPress={handleResend}>
                          <Text style={s.footerLink}>Resend code</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity onPress={() => setStep(1)} style={s.editRow}>
                      <Ionicons name="pencil-outline" size={14} color={colors.textOnDarkMuted} />
                      <Text style={s.editText}>Edit details</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Trust({ icon, text }) {
  return (
    <View style={s.trustItem}>
      <Ionicons name={icon} size={11} color={brand.gold} />
      <Text style={s.trustText}>{text}</Text>
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

  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.xl,
  },
  stepDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepDotActive: { backgroundColor: brand.gold },
  stepLine: {
    width: 40, height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
  },
  stepLineActive: { backgroundColor: brand.gold },

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
  titleGold: {
    color: brand.gold,
    fontStyle: 'italic',
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

  row: { flexDirection: 'row', gap: 10 },

  // Strength
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -10,
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  strengthSeg: {
    flex: 1, height: 3, borderRadius: 2,
  },
  strengthLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    width: 52,
    textAlign: 'right',
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingRight: 4,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: brand.gold,
    borderColor: brand.gold,
  },
  termsText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textOnDarkMuted,
    lineHeight: 18,
  },
  termsLink: {
    color: brand.gold,
    fontWeight: fontWeight.bold,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textOnDarkMuted,
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: brand.gold,
    fontWeight: fontWeight.black,
  },

  // Trust strip
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontSize: 10,
    color: colors.textOnDarkSubtle,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },

  // OTP
  otpBadgeWrap: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  otpBadge: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: brand.gold,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
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
  coolText: {
    fontSize: fontSize.sm,
    color: colors.textOnDarkSubtle,
    fontWeight: fontWeight.semibold,
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.md,
    paddingVertical: 6,
  },
  editText: {
    fontSize: fontSize.xs,
    color: colors.textOnDarkMuted,
    fontWeight: fontWeight.semibold,
  },
});
