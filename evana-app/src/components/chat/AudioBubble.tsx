import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Play } from 'lucide-react-native';

interface AudioBubbleProps {
  duration: string;
}

export const AudioBubble: React.FC<AudioBubbleProps> = ({ duration }) => {
  return (
    <View style={styles.container}>
      <View style={styles.waveform}>
        {[8, 16, 12, 20, 10, 18, 8, 14, 20, 10, 15, 7, 12].map((height, i) => (
          <View key={i} style={[styles.waveBar, { height: height }]} />
        ))}
      </View>
      <Text style={styles.duration}>{duration}</Text>
      <TouchableOpacity style={styles.playBtn}>
        <Play size={14} color={COLORS.white} fill={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.textDark,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  duration: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
