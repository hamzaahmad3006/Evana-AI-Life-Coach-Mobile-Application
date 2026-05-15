import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { StatusBar } from 'react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SocialButton } from '../../components/ui/SocialButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { signUp, clearError } from '../../store/authSlice';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToLogin }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof fieldErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password && password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    dispatch(clearError());
    dispatch(signUp({ 
      email: email.trim(), 
      password, 
      fullName: fullName.trim(),
      age: age.trim() || undefined 
    }));
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>
              eva<Text style={{ color: COLORS.purple }}>na</Text>
            </Text>
           
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start your personal growth journey</Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input 
              label="Full name"
              placeholder="Sara Ahmed"
              value={fullName}
              onChangeText={setFullName}
              error={fieldErrors.fullName}
            />
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
            <Input 
              label="Age (optional)"
              placeholder="25"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />

            <View style={{ height: 16 }} />
            
            <Button 
              title={loading ? "Creating account..." : "Create account"}
              onPress={handleSignUp}
              disabled={loading}
            />

            <View style={styles.dividerContainer}>
              <Text style={styles.dividerText}>or continue with</Text>
            </View>

            <SocialButton onPress={() => {}} />

            <View style={styles.footer}>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={styles.footerText}>
                  Already have an account?{' '}
                  <Text style={styles.footerLink}>Sign in</Text>
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
 scrollContent: {
  flexGrow: 1,
  paddingHorizontal: SPACING.lg,
  paddingTop:
    Platform.OS === 'android'
      ? (StatusBar.currentHeight || 0) + 24
      : 60,
  paddingBottom: SPACING.xxl,
},
  header: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
   title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textMid,
    fontWeight: '500',
  },
  errorBanner: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    marginBottom: SPACING.md,
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
  dividerContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
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
