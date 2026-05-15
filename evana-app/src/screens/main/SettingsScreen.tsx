import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Toggle } from '../../components/ui/Toggle';
import { BottomTab } from '../../components/ui/BottomTab';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import { Bell, ShieldCheck, Target, Lock, LogOut, ChevronRight, Sparkles } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { signOut, setMainScreen } from '../../store/authSlice';
import { supabase } from '../../lib/supabase';

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({ 
  icon, 
  iconBg, 
  title, 
  subtitle, 
  onPress, 
  rightElement,
  isDestructive 
}) => (
  <TouchableOpacity 
    style={styles.row} 
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
      {icon}
    </View>
    <View style={styles.rowContent}>
      <Text style={[styles.rowTitle, isDestructive && { color: COLORS.error }]}>{title}</Text>
      {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || <ChevronRight size={16} color={COLORS.textLight} />}
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { pushToken } = useAppSelector(state => state.notifications);
  
  const [habitReminders, setHabitReminders] = useState(true);
  const [reflectionReminders, setReflectionReminders] = useState(true);
  const [goalUpdates, setGoalUpdates] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of Evana?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: () => dispatch(signOut())
        }
      ]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <ScreenWrapper>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {user?.full_name ? getInitials(user.full_name) : 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.full_name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => dispatch(setMainScreen('edit-profile'))}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionLabel}>Accountability</Text>
        <View style={styles.section}>
          <SettingRow
            icon={<Bell size={16} color={COLORS.purple} />}
            iconBg={COLORS.purpleSoft}
            title="Habit reminders"
            subtitle="Immediate alerts for logging"
            rightElement={
              <Toggle isOn={habitReminders} onToggle={() => setHabitReminders(!habitReminders)} />
            }
          />
          <SettingRow
            icon={<ShieldCheck size={16} color={COLORS.success} />}
            iconBg="#E1F5EE"
            title="Daily reflection"
            subtitle="Evening journaling prompts"
            rightElement={
              <Toggle isOn={reflectionReminders} onToggle={() => setReflectionReminders(!reflectionReminders)} />
            }
          />
          <SettingRow
            icon={<Sparkles size={16} color={COLORS.warning} />}
            iconBg="#FAEEDA"
            title="AI Coaching Nudges"
            subtitle="Push notifications from Evana"
            rightElement={
              <Toggle isOn={goalUpdates} onToggle={() => setGoalUpdates(!goalUpdates)} />
            }
          />
        </View>

        {/* Device Sync Section */}
        <Text style={styles.sectionLabel}>System</Text>
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Push Token Status</Text>
            <Text style={[styles.infoValue, { color: pushToken ? COLORS.success : COLORS.error }]}>
              {pushToken ? 'Registered' : 'Not Linked'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0 (Gold)</Text>
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.section}>
          <SettingRow
            icon={<Lock size={16} color={COLORS.purple} />}
            iconBg={COLORS.purpleSoft}
            title="Privacy Policy"
            onPress={() => Alert.alert("Privacy", "Your data is encrypted and only used to improve your coaching experience.")}
          />
          <SettingRow
            icon={<LogOut size={16} color={COLORS.error} />}
            iconBg="#FBEAF0"
            title="Log out"
            isDestructive
            onPress={handleLogout}
          />
        </View>

        <Text style={styles.versionText}>Evana · Your AI Life Coach</Text>
        
        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomTab activeTab="settings" />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: 18,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  profileEmail: {
    fontSize: 11,
    color: COLORS.textMid,
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: COLORS.purpleSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  editBtnText: {
    fontSize: 11,
    color: COLORS.purple,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  section: {
    marginBottom: SPACING.xl,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    marginLeft: 14,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  rowSubtitle: {
    fontSize: 10,
    color: COLORS.textMid,
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMid,
  },
});
