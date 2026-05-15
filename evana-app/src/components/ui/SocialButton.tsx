import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  Image,
} from 'react-native';

const GoogleLogo = require('../../../assets/google.png');

import {
  COLORS,
  RADIUS,
} from '../../constants/theme';

interface SocialButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <View style={styles.content}>
        <Image
          source={GoogleLogo}
          style={styles.logoImage}
        />

        <Text style={styles.text}>
          Continue with Google
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,

    backgroundColor: '#FFFFFF',

    borderRadius: RADIUS.pill,

    borderWidth: 1,
    borderColor: '#E9E2F5',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 4,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },

  text: {
    marginLeft: 8,

    fontSize: 16,
    fontWeight: '600',

    color: COLORS.textDark,

    letterSpacing: -0.2,
  },
});