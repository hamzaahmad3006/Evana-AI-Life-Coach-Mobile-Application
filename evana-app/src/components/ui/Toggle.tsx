import React from 'react';
import { TouchableOpacity, StyleSheet, View, Animated } from 'react-native';
import { COLORS } from '../../constants/theme';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onToggle}
      style={[
        styles.container,
        isOn ? styles.containerOn : styles.containerOff
      ]}
    >
      <View style={[
        styles.circle,
        isOn ? styles.circleOn : styles.circleOff
      ]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 2,
    justifyContent: 'center',
  },
  containerOn: {
    backgroundColor: COLORS.purple,
  },
  containerOff: {
    backgroundColor: 'rgba(124, 92, 252, 0.15)',
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.white,
  },
  circleOn: {
    alignSelf: 'flex-end',
  },
  circleOff: {
    alignSelf: 'flex-start',
  },
});
