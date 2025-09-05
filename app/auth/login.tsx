/*
 * LOGIN — Aligned to Home Liquid-Glass UI
 * - Glassy header row, frosted panel, macOS hover fields
 * - Fixed duplicate keys & trailing commas
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Phone } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
} from '../../styles/HEYWAY_STYLE_GUIDE';
import { StatusBar } from 'expo-status-bar';
import { handlePhoneNumberInput, isValidForSubmission } from '@/utils/phoneUtils';

export default function LoginScreen() {
  const { sendSMSVerification, verifySMS, isLoading } = useAuth();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [phoneValidation, setPhoneValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true });
  const [agreed, setAgreed] = useState(false);

  const handlePhoneChange = (input: string) => {
    const { displayValue, e164Value } = handlePhoneNumberInput(input, displayPhoneNumber);
    setDisplayPhoneNumber(displayValue);
    setPhoneNumber(e164Value);
    const ok = isValidForSubmission(e164Value);
    setPhoneValidation({
      isValid: ok,
      error: !ok && e164Value.length > 3 ? 'Please enter a valid 10-digit phone number' : undefined,
    });
  };

  const handleSMSLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!phoneValidation.isValid) {
      Alert.alert('Error', phoneValidation.error || 'Please enter a valid phone number');
      return;
    }
    try {
      await sendSMSVerification({ phoneNumber: phoneNumber.trim(), isSignIn: true });
      setStep('verify');
    } catch (error: any) {
      if (error?.response?.status === 404 || (error?.message && error.message.includes('No account found'))) {
        Alert.alert('Account Not Found', 'No account found with this phone number. Please sign up first.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Up', onPress: () => router.push('/auth/register') },
        ]);
      } else {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send verification code');
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    try {
      await verifySMS({ phoneNumber: phoneNumber.trim(), code: verificationCode.trim() });
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'Invalid code');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        {/* Top “liquid-glass” header strip to match Home */}
        <View style={styles.liquidGlassHeader}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerLogoText}>Heyway</Text>
          </View>
          <View style={styles.headerCenter} />
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Card */}
            <View style={styles.panelCard}>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/images/logo.png')} style={styles.formLogo} resizeMode="contain" />
              </View>
              <Text style={styles.title}>Sign In</Text>
              {step === 'input' ? (
                <>
                  <View
                    style={[
                      styles.inputContainer,
                      !phoneValidation.isValid && phoneValidation.error ? styles.inputError : undefined,
                    ]}
                  >
                    <Phone size={18} color={HEYWAY_COLORS.text.secondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="(555) 123-4567"
                      placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                      value={displayPhoneNumber}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={14}
                    />
                  </View>
                  {phoneValidation.error ? <Text style={styles.errorText}>{phoneValidation.error}</Text> : null}

                  <View style={styles.agreeRow}>
                    <TouchableOpacity
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: agreed }}
                      onPress={() => setAgreed(!agreed)}
                      style={[styles.checkboxBox, agreed && { borderColor: HEYWAY_COLORS.interactive.focus }]}
                    >
                      {agreed && <View style={styles.checkboxMark} />}
                    </TouchableOpacity>
                    <Text style={styles.agreeText}>
                      I agree to the{' '}
                      <Text style={styles.linkText} onPress={() => router.push('/legal/terms' as any)}>
                        Terms of Service
                      </Text>{' '}
                      and{' '}
                      <Text style={styles.linkText} onPress={() => router.push('/legal/service-agreement' as any)}>
                        Service Agreement
                      </Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryBtn, (isLoading || !agreed) && styles.primaryBtnDisabled]}
                    onPress={handleSMSLogin}
                    disabled={isLoading || !agreed}
                    activeOpacity={0.9}
                  >
                    {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Send Verification Code</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Lock size={18} color={HEYWAY_COLORS.text.secondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <Text style={styles.hintText}>We sent a code to {displayPhoneNumber || phoneNumber}</Text>

                  <TouchableOpacity
                    style={[styles.primaryBtn, (isLoading || !agreed) && styles.primaryBtnDisabled]}
                    onPress={handleVerifyCode}
                    disabled={isLoading || !agreed}
                    activeOpacity={0.9}
                  >
                    {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Verify</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep('input')} activeOpacity={0.8}>
                    <Text style={styles.secondaryBtnText}>Back</Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Don’t have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <Text style={styles.switchLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const CARD_MAX_W = 480;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HEYWAY_COLORS.background.primary },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  keyboardView: { flex: 1 },

  // match Home header (no menu/actions here — just visual continuity)
  liquidGlassHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: HEYWAY_COLORS.background.panel,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.lg,
    ...HEYWAY_SHADOWS.light.sm,
    zIndex: 10,
  },
  headerLeft: { width: 120, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: { width: 28, height: 28 },
  headerLogoText: { fontSize: 18, fontWeight: '600', color: HEYWAY_COLORS.interactive.primary, letterSpacing: -0.2 },
  headerCenter: { flex: 1 },
  headerRight: { width: 120 },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 44 + HEYWAY_SPACING.xxl,
    paddingBottom: HEYWAY_SPACING.xxxl,
    paddingHorizontal: HEYWAY_SPACING.lg,
  },

  panelCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: CARD_MAX_W,
    backgroundColor: HEYWAY_COLORS.background.panel,
    borderRadius: HEYWAY_RADIUS.lg,
    padding: HEYWAY_SPACING.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.lg,
  },

  title: {
    fontSize: 28,
    fontWeight: '600', // Use valid value for fontWeight
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.fill.quaternary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: HEYWAY_COLORS.text.primary,
    backgroundColor: 'transparent',
    paddingVertical: 2,
  },
  inputError: {
    borderColor: HEYWAY_COLORS.accent.error,
  },
  errorText: {
    color: HEYWAY_COLORS.accent.error,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },

  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 8 },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.panel,
  },
  checkboxMark: { width: 10, height: 10, borderRadius: 2, backgroundColor: HEYWAY_COLORS.interactive.focus },
  agreeText: { fontSize: 13, color: HEYWAY_COLORS.text.secondary, flex: 1, flexWrap: 'wrap' },
  linkText: { color: HEYWAY_COLORS.interactive.primary, textDecorationLine: 'underline', fontWeight: '500' },

  primaryBtn: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: HEYWAY_COLORS.interactive.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 },

  secondaryBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: HEYWAY_RADIUS.md,
    backgroundColor: HEYWAY_COLORS.background.macosHover,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.secondary,
  },
  secondaryBtnText: { color: HEYWAY_COLORS.text.primary, fontWeight: '600', fontSize: 14 },

  hintText: { fontSize: 13, color: HEYWAY_COLORS.text.secondary, marginTop: 2, marginBottom: 6, marginLeft: 4 },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formLogo: {
    width: 80,
    height: 80,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 4 },
  switchText: { fontSize: 13, color: HEYWAY_COLORS.text.secondary },
  switchLink: { color: HEYWAY_COLORS.interactive.primary, fontWeight: '600', fontSize: 13, textDecorationLine: 'underline' },
});
