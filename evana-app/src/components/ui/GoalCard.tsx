import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  ViewStyle 
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Check } from 'lucide-react-native';

interface GoalCardProps {
  title: string;
  category: string;
  duration: string;
  icon: React.ReactNode;
  iconBg: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const GoalCard: React.FC<GoalCardProps> = ({ 
  title, 
  category, 
  duration, 
  icon,
  iconBg,
  selected, 
  onPress, 
  style 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.unselectedContainer,
        style
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{category} · {duration}</Text>
      </View>

      <View style={[
        styles.indicator,
        selected ? styles.indicatorSelected : styles.indicatorUnselected
      ]}>
        {selected && <Check size={14} color={COLORS.white} strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.md,
    marginBottom: 10,
    borderWidth: 1.5,
    backgroundColor: COLORS.cardBg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  unselectedContainer: {
    borderColor: 'rgba(124, 92, 252, 0.12)',
  },
  selectedContainer: {
    borderColor: COLORS.purple,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMid,
    marginTop: 2,
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  indicatorUnselected: {
    borderColor: 'rgba(124, 92, 252, 0.2)',
  },
  indicatorSelected: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
});
