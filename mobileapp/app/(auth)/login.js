// ─── TheChatNest Mobile — Login Screen ──────────────────────────────
//
// Distinctive navy + gold aesthetic. All login logic preserved
// (biometric, OTP, validation, cooldown) — only UI is new.

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  ActivityIndicator, ScrollView, Keyboard, Dimensions, Animated, KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import OtpInput from '../../src/components/OtpInput';
import { useToast } from '../../src/components/Toast';
import { login, loginWithOtp, loginBiometric } from '../../src/api/auth';
import { useAuth } from '../../src/store/AuthContext';
import { brand, colors } from '../../src/theme/colors';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';

const { width: W, height: H } = Dimensions.get('window');
const COOL = 30;

export default function LoginScreen() {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState({});

  // Biometric
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasFingerprint, setHasFingerprint] = useState(false);
  const [hasFaceId, setHasFaceId] = useState(false);
  const [hasSavedCreds, setHasSavedCreds] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 15, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, damping: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (compatible && enrolled) {
          setBiometricAvailable(true);
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          setHasFingerprint(types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT));
          setHasFaceId(types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) || types.includes(LocalAuthentication.AuthenticationType.IRIS));
          const savedE = await SecureStore.getItemAsync('biometric_email');
          const savedP = await SecureStore.getItemAsync('biometric_password');
          if (savedE && savedP) {
            setHasSavedCreds(true);
            setSavedEmail(savedE);
          }
        }
      } catch {}
    })();
  }, []);

  const handleBiometricLogin = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to TheChatNest',
        cancelLabel: 'Use password',
        disableDeviceFallback: false,
        fallbackLabel: 'Use password',
      });
      if (!result.success) return;
      setLoading(true);
      const savedE = await SecureStore.getItemAsync('biometric_email');
      const savedP = await SecureStore.getItemAsync('biometric_password');
      if (!savedE || !savedP) { toast('No saved credentials', 'error'); setLoading(false); return; }
      const loginResult = await loginBiometric(savedE, savedP);
      if (loginResult?.otp_required) {
        setEmail(savedE); setPassword(savedP);
        setStep(2); setCooldown(loginResult?.resend_available_in_seconds || COOL); setOtp('');
        toast('OTP verification needed', 'info');
      } else {
        await refreshUser();
        toast('Welcome back!', 'success');
        setTimeout(() => router.replace('/(tabs)/chats'), 100);
      }
    } catch (err) {
      toast(err?.response?.data?.message || 'Login failed', 'error');
    } finally { setLoading(false); }
  }, [refreshUser, toast]);

  const saveCredentialsForBiometric = useCallback(async (e, p) => {
    if (biometricAvailable) {
      try {
        await SecureStore.setItemAsync('biometric_email', e);
        await SecureStore.setItemAsync('biometric_password', p);
      } catch {}
    }
  }, [biometricAvailable]);

  if (cooldown > 0) setTimeout(() => setCooldown(c => c > 0 ? c - 1 : 0), 1000);

  const validate = useCallback(() => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email.trim())) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (result?.otp_required) {
        setStep(2); setCooldown(result?.resend_available_in_seconds || COOL); setOtp('');
        toast('OTP sent to your email', 'success');
      } else {
        await saveCredentialsForBiometric(email.trim().toLowerCase(), password);
        await refreshUser();
        setTimeout(() => router.replace('/(tabs)/chats'), 100);
      }
    } catch (err) {
      toast(err?.response?.data?.message || 'Login failed', 'error');
    } finally { setLoading(false); }
  }, [email, password, validate, refreshUser, toast]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length < 6) return toast('Enter 6-digit code', 'warning');
    Keyboard.dismiss(); setLoading(true);
    try {
      await loginWithOtp(email.trim().toLowerCase(), password, otp);
      await saveCredentialsForBiometric(email.trim().toLowerCase(), password);
      await refreshUser();
      toast('Welcome back!', 'success');
      setTimeout(() => router.replace('/(tabs)/chats'), 300);
    } catch (err) { toast(err?.response?.data?.message || 'Invalid OTP', 'error'); }
    finally { setLoading(false); }
  }, [email, password, otp, refreshUser, toast]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    try {
      const r = await login(email.trim().toLowerCase(), password);
      setCooldown(r?.resend_available_in_seconds || COOL); setOtp('');
      toast('New code sent', 'success');
    } catch { toast('Failed to resend', 'error'); }
  }, [email, password, cooldown, toast]);

  return (
    <View style={z.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[brand.navy, brand.navyMid, brand.navySoft]}
        style={StyleSheet.absoluteFill}
      />
      {/* Glow blobs */}
      <View style={z.glowTopRight} />
      <View style={z.glowBottomLeft} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={z.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Brand row */}
            <Animated.View style={[z.brandSection, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
              <LinearGradient
                colors={brand.gradientGold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={z.brandTile}
              >
                <Ionicons name="chatbubbles" size={24} color={brand.goldInk} />
              </LinearGradient>
              <Text style={z.brandName}>TheChatNest</Text>
              <Text style={z.brandTag}>Secure team workspace</Text>
            </Animated.View>

            {/* Card */}
            <Animated.View style={[z.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {step === 1 ? (
                <>
                  <Text style={z.title}>Welcome back</Text>
                  <Text style={z.sub}>Sign in to your workspace</Text>

                  {/* Biometric quick action */}
                  {biometricAvailable && hasSavedCreds && (
                    <>
                      <TouchableOpacity
                        style={z.bioBtn}
                        onPress={handleBiometricLogin}
                        activeOpacity={0.85}
                        disabled={loading}
                      >
                        <View style={z.bioIconCircle}>
                          <MaterialCommunityIcons
                            name={Platform.OS === 'ios' && hasFaceId ? 'face-recognition' : 'fingerprint'}
                            size={22}
                            color={brand.gold}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={z.bioLabel}>
                            {Platform.OS === 'ios' && hasFaceId ? 'Sign in with Face ID' : 'Sign in with Fingerprint'}
                          </Text>
                          <Text style={z.bioEmail}>{savedEmail}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textOnDarkSubtle} />
                      </TouchableOpacity>

                      <View style={z.divider}>
                        <View style={z.divLine} />
                        <Text style={z.divText}>OR USE PASSWORD</Text>
                        <View style={z.divLine} />
                      </View>
                    </>
                  )}

                  <Input
                    label="Email"
                    placeholder="your@work.email"
                    value={email}
                    onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: '' })); }}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    mode="dark"
                    icon={(props) => <Ionicons name="mail-outline" {...props} />}
                  />
                  <Input
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: '' })); }}
                    error={errors.password}
                    secureTextEntry={!showPass}
                    mode="dark"
                    icon={(props) => <Ionicons name="lock-closed-outline" {...props} />}
                    iconRight={(props) => <Ionicons name={showPass ? 'eye-off' : 'eye'} {...props} />}
                    onIconRightPress={() => setShowPass(!showPass)}
                  />

                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/forgot-password')}
                    hitSlop={8}
                    style={z.forgotRow}
                  >
                    <Text style={z.forgot}>Forgot password?</Text>
                  </TouchableOpacity>

                  <Button
                    label="Sign In"
                    onPress={handleLogin}
                    loading={loading}
                    fullWidth
                    size="lg"
                    style={{ marginTop: 6 }}
                  />

                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/qr-login')}
                    style={z.qrBtn}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="qr-code" size={18} color={colors.textOnDark} />
                    <Text style={z.qrText}>Sign in with QR code</Text>
                  </TouchableOpacity>

                  <View style={z.regRow}>
                    <Text style={z.regText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                      <Text style={z.regLink}>Sign up</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* ─── OTP Step ─── */
                <>
                  <View style={z.otpHeader}>
                    <LinearGradient
                      colors={brand.gradientGold}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={z.otpBadgeGrad}
                    >
                      <Ionicons name="shield-checkmark" size={32} color={brand.goldInk} />
                    </LinearGradient>
                    <Text style={[z.title, { textAlign: 'center', marginTop: 16 }]}>
                      Verification code
                    </Text>
                    <Text style={[z.sub, { textAlign: 'center' }]}>
                      We sent a 6-digit code to{'\n'}
                      <Text style={z.emailHighlight}>{email}</Text>
                    </Text>
                  </View>

                  <View style={{ marginVertical: 28 }}>
                    <OtpInput value={otp} onChange={setOtp} />
                  </View>

                  <Button
                    label="Verify & Sign In"
                    onPress={handleVerifyOtp}
                    loading={loading}
                    disabled={otp.length < 6}
                    fullWidth
                    size="lg"
                  />

                  <View style={z.resendRow}>
                    <Text style={z.subText}>Didn't receive it? </Text>
                    {cooldown > 0 ? (
                      <View style={z.coolBadge}>
                        <Text style={z.coolText}>{cooldown}s</Text>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={handleResend}>
                        <Text style={z.linkText}>Resend code</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => { setStep(1); setOtp(''); }}
                    style={z.backBtn}
                  >
                    <Ionicons name="arrow-back" size={16} color={colors.textOnDarkSubtle} />
                    <Text style={z.backText}>Back to login</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>

            <View style={z.footer}>
              <Ionicons name="lock-closed" size={11} color={colors.textOnDarkSubtle} />
              <Text style={z.footerText}>End-to-end encrypted. GDPR aligned.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const z = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.navy },
  glowTopRight: {
    position: 'absolute',
    top: -100, right: -80,
    width: 380, height: 380,
    borderRadius: 190,
    backgroundColor: brand.gold,
    opacity: 0.05,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -120, left: -80,
    width: 360, height: 360,
    borderRadius: 180,
    backgroundColor: brand.violet,
    opacity: 0.08,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },

  brandSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandTile: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: brand.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  brandTag: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textOnDarkSubtle,
    marginTop: 3,
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backdropFilter: 'blur(20px)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 14,
    color: colors.textOnDarkMuted,
    marginBottom: 18,
    lineHeight: 20,
  },
  emailHighlight: {
    color: brand.gold,
    fontWeight: '700',
  },

  // Biometric quick login
  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,213,74,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,213,74,0.25)',
    marginBottom: 14,
  },
  bioIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,213,74,0.15)',
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  bioEmail: {
    fontSize: 12,
    color: colors.textOnDarkSubtle,
    marginTop: 2,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  divLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  divText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.textOnDarkSubtle,
  },

  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 14,
  },
  forgot: {
    fontSize: 13,
    color: brand.gold,
    fontWeight: '700',
  },

  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  qrText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  regRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  regText: { fontSize: 13, color: colors.textOnDarkMuted },
  regLink: { fontSize: 13, color: brand.gold, fontWeight: '800' },

  otpHeader: { alignItems: 'center' },
  otpBadgeGrad: {
    width: 64, height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: brand.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  subText: { fontSize: 13, color: colors.textOnDarkMuted },
  linkText: { fontSize: 13, color: brand.gold, fontWeight: '700' },
  coolBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  coolText: {
    fontSize: 12,
    color: colors.textOnDarkMuted,
    fontWeight: '800',
  },
  backBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  backText: {
    fontSize: 12,
    color: colors.textOnDarkSubtle,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
  },
  footerText: {
    fontSize: 11,
    color: colors.textOnDarkSubtle,
    fontWeight: '500',
  },
});
