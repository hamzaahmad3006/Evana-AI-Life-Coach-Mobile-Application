import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { signOut } from '../../store/authSlice';

export const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const userName = user?.user_metadata?.full_name || 'User';
  const userEmail = user?.email || '';

  const handleSignOut = () => {
    dispatch(signOut());
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{userName} 👋</Text>
          <Text style={styles.emailText}>{userEmail}</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>🎉 You're all set!</Text>
          <Text style={styles.statusText}>
            Your account is connected to Supabase and your session is being maintained via Redux. 
            Close the app and reopen it — you'll still be logged in.
          </Text>
        </View>

        {/* Logout Button */}
        <Button 
          title="Log out"
          variant="outline"
          onPress={handleSignOut}
          style={styles.logoutBtn}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textMid,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 4,
  },
  emailText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.textMid,
    lineHeight: 20,
  },
  logoutBtn: {
    borderColor: COLORS.error,
  },
});
