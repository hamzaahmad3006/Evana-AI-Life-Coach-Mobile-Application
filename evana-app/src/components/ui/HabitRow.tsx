import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Check } from 'lucide-react-native';

interface HabitRowProps {
  title: string;
  subtitle: string;
  emoji: string;
  iconBg: string;
  completed: boolean;
  loading?: boolean;
  onToggle: () => void;
}

export const HabitRow: React.FC<HabitRowProps> = ({ 
  title, 
  subtitle, 
  emoji, 
  iconBg, 
  completed,
  loading = false,
  onToggle
}) => {
  return (
    <TouchableOpacity 
      onPress={onToggle}
      disabled={loading}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={[
        styles.checkbox,
        completed ? styles.checkboxCompleted : styles.checkboxPending
      ]}>
        {loading ? (
          <ActivityIndicator size="small" color={completed ? COLORS.white : COLORS.primary} />
        ) : (
          completed && <Check size={14} color={COLORS.white} strokeWidth={3} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMid,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  checkboxPending: {
    borderColor: 'rgba(124, 92, 252, 0.25)',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
});
