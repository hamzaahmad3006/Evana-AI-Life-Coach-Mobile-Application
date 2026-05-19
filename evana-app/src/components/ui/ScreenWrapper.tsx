import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style }) => {
  return (
    <LinearGradient
      colors={[COLORS.bgGradStart, COLORS.bgGradEnd]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={[styles.safeArea, style]}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
});
