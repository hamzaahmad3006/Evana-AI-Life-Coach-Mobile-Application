import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { Check } from 'lucide-react-native';

interface ChatBubbleProps {
  message: string;
  isAI?: boolean;
  isTyping?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  isAI = true,
  isTyping = false
}) => {
  if (isTyping) {
    return (
      <View style={[styles.container, styles.aiContainer]}>
        <View style={styles.bubbleAI}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, { opacity: 1 }]} />
            <View style={[styles.dot, { opacity: 0.6 }]} />
            <View style={[styles.dot, { opacity: 0.3 }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      isAI ? styles.aiContainer : styles.userContainer
    ]}>
      <View style={[
        styles.bubble, 
        isAI ? styles.bubbleAI : styles.bubbleUser
      ]}>
        <Text style={[
          styles.text, 
          isAI ? styles.textAI : styles.textUser
        ]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  aiContainer: {
    justifyContent: 'flex-start',
    paddingRight: 40,
  },
  userContainer: {
    justifyContent: 'flex-end',
    paddingLeft: 60,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  bubbleAI: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: COLORS.purple,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
  textAI: {
    color: COLORS.textDark,
  },
  textUser: {
    color: COLORS.white,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.purple,
  },
});
