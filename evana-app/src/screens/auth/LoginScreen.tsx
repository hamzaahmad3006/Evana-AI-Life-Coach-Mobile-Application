import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

const AppLogo = require('../../../assets/evana.png');

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SocialButton } from '../../components/ui/SocialButton';

import {
  COLORS,
  SPACING,
} from '../../constants/theme';

import {
  useAppDispatch,
  useAppSelector,
} from '../../store/store';

import {
  signIn,
  clearError,
} from '../../store/authSlice';

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToSignUp,
}) => {
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof fieldErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setFieldErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    dispatch(clearError());

    dispatch(
      signIn({
        email: email.trim(),
        password,
      })
    );
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* App Logo Orb */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F5F3FF', '#EDE9FE']}
              style={styles.logoOrb}
            >
              <Image
                source={AppLogo}
                style={styles.logo}
              />
            </LinearGradient>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue with Evana
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                {error}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="sara@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={fieldErrors.email}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={fieldErrors.password}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <Button
              title={
                loading
                  ? 'Signing in...'
                  : 'Sign in'
              }
              onPress={handleSignIn}
              disabled={loading}
              style={styles.signInButton}
            />

            {/* Google Button */}
            <SocialButton
              onPress={() => {}}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onNavigateToSignUp}
              >
                <Text style={styles.footerText}>
                  New here?{' '}
                  <Text style={styles.footerLink}>
                    Create account
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,

    paddingHorizontal: SPACING.lg,

    paddingTop: 16,

    paddingBottom: 40,
  },

  logoContainer: {
    alignSelf: 'center',
    marginBottom: 42,
    shadowColor: '#7C5CFC',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 14,
  },

  logoOrb: {
    width: 100,
    height: 100,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },

  logo: {
    width: 260,
    height: 260,
    resizeMode: 'contain',
  },
  header: {
    alignItems: 'center',
    marginBottom: 34,
  },

  title: {
    fontSize: 24,

    fontWeight: '800',

    color: COLORS.textDark,

    marginBottom: 8,

    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,

    fontWeight: '500',

    color: COLORS.textMid,

    textAlign: 'center',
  },

  errorBanner: {
    width: '100%',

    backgroundColor: '#FEE2E2',

    borderRadius: 12,

    padding: 12,

    marginBottom: 18,

    borderWidth: 1,

    borderColor: '#FECACA',
  },

  errorBannerText: {
    fontSize: 12,

    color: '#DC2626',

    fontWeight: '600',

    textAlign: 'center',
  },

  form: {
    width: '100%',
  },

  forgotPassword: {
    alignSelf: 'flex-end',

    marginTop: 4,

    marginBottom: 26,
  },

  forgotPasswordText: {
    fontSize: 14,

    fontWeight: '700',

    color: COLORS.purple,
  },

  signInButton: {
    marginBottom: 18,
  },

  footer: {
    marginTop: 12,

    alignItems: 'center',
  },

  footerText: {
    fontSize: 12,

    color: COLORS.textMid,

    fontWeight: '500',
  },

  footerLink: {
    color: COLORS.purple,

    fontWeight: '700',

    fontSize: 14,
  },
});