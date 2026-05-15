import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Home, Calendar, Plus, BarChart2, User } from 'lucide-react-native';
import { useAppDispatch } from '../../store/store';
import { setMainScreen } from '../../store/authSlice';

interface BottomTabProps {
  activeTab: 'home' | 'habits' | 'assistant' | 'analytics' | 'settings';
}

export const BottomTab: React.FC<BottomTabProps> = ({ activeTab }) => {
  const dispatch = useAppDispatch();

  const handlePress = (screen: 'home' | 'habits' | 'assistant' | 'analytics' | 'settings') => {
    dispatch(setMainScreen(screen));
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('home')}>
          <View style={[styles.iconWrap, activeTab === 'home' && styles.iconWrapActive]}>
            <Home size={20} color={activeTab === 'home' ? COLORS.white : COLORS.textLight} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('habits')}>
          <View style={[styles.iconWrap, activeTab === 'habits' && styles.iconWrapActive]}>
            <Calendar size={20} color={activeTab === 'habits' ? COLORS.white : COLORS.textLight} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={() => handlePress('assistant')}>
          <Plus size={24} color={COLORS.white} strokeWidth={3} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('analytics')}>
          <View style={[styles.iconWrap, activeTab === 'analytics' && styles.iconWrapActive]}>
            <BarChart2 size={20} color={activeTab === 'analytics' ? COLORS.white : COLORS.textLight} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('settings')}>
          <View style={[styles.iconWrap, activeTab === 'settings' && styles.iconWrapActive]}>
            <User size={20} color={activeTab === 'settings' ? COLORS.white : COLORS.textLight} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: COLORS.purple,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
