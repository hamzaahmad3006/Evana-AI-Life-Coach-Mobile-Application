import React from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { SendHorizontal } from 'lucide-react-native';
import { BlurView } from 'expo-blur'; // Will need to install expo-blur

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChangeText, 
  onSend 
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message…"
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        multiline
      />
      <TouchableOpacity 
        style={styles.sendButton}
        onPress={onSend}
        activeOpacity={0.8}
      >
        <SendHorizontal size={18} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.15)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 13,
    color: COLORS.textDark,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
