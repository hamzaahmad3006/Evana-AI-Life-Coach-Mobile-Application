import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({ 
  label, 
  selected, 
  onPress, 
  style 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        selected ? styles.selected : styles.unselected,
        style
      ]}
    >
      <Text style={[
        styles.text,
        selected ? styles.textSelected : styles.textUnselected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    margin: 4,
    borderWidth: 1.5,
  },
  unselected: {
    backgroundColor: COLORS.cardBg,
    borderColor: 'rgba(124, 92, 252, 0.15)',
  },
  selected: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textUnselected: {
    color: COLORS.textMid,
  },
  textSelected: {
    color: COLORS.white,
  },
});
