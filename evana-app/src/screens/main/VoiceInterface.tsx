import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Mic, Square, Send, X, Volume2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { API_ENDPOINTS } from '../../constants/config';
import { useAppSelector } from '../../store/store';

const { width, height } = Dimensions.get('window');

interface VoiceInterfaceProps {
  isVisible: boolean;
  onClose: () => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ isVisible, onClose }) => {
  const { user } = useAppSelector(state => state.auth);
  
  // States
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'speaking'>('idle');
  const [aiText, setAiText] = useState<string>('');
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setStatus('recording');
      setAiText('');
      setUserTranscript('');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
    setRecording(null);
    setStatus('idle');
  };

  const sendVoiceRequest = async () => {
    if (!audioUri || !user?.id) return;

    setStatus('processing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('audio', {
        uri: audioUri,
        name: 'voice.m4a',
        type: 'audio/m4a',
      } as any);

      const response = await fetch(`${API_ENDPOINTS.baseUrl}/assistant/voice`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setUserTranscript(data.user_transcript);
        setAiText(data.ai_response_text);
        
        // Play the response
        if (data.ai_audio_base64) {
          await playBase64Audio(data.ai_audio_base64);
        } else {
          setStatus('idle');
        }
      }
    } catch (err) {
      console.error('Voice request failed', err);
      setStatus('idle');
    }
  };

  const playBase64Audio = async (base64Data: string) => {
    try {
      setStatus('speaking');
      const fileUri = `${FileSystem.cacheDirectory}evana_voice.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      
      setSound(sound);
      
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setStatus('idle');
        }
      });
    } catch (err) {
      console.error('Failed to play audio', err);
      setStatus('idle');
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X color={COLORS.white} size={28} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <Animated.View style={[
              styles.pulseCircle,
              { transform: [{ scale: pulseAnim }] },
              isRecording && styles.pulseCircleActive
            ]} />
            <View style={styles.evanaAvatar}>
              <Volume2 color={COLORS.white} size={40} />
            </View>
          </View>

          <Text style={styles.statusText}>
            {status === 'recording' ? 'Evana is listening...' : 
             status === 'processing' ? 'Thinking...' : 
             status === 'speaking' ? 'Evana is speaking' : 'Tap to speak'}
          </Text>

          {(userTranscript !== '' || aiText !== '') && (
            <View style={styles.transcriptContainer}>
              {userTranscript !== '' && (
                <Text style={styles.userTranscript}>"{userTranscript}"</Text>
              )}
              {aiText !== '' && (
                <Text style={styles.aiResponse}>{aiText}</Text>
              )}
            </View>
          )}

          <View style={styles.controls}>
            {status === 'idle' && !audioUri && (
              <TouchableOpacity style={styles.micButton} onPress={startRecording}>
                <Mic color={COLORS.white} size={32} />
              </TouchableOpacity>
            )}

            {isRecording && (
              <TouchableOpacity style={[styles.micButton, styles.stopButton]} onPress={stopRecording}>
                <Square color={COLORS.white} size={32} fill={COLORS.white} />
              </TouchableOpacity>
            )}

            {status === 'idle' && audioUri && !isRecording && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.retryButton} onPress={startRecording}>
                  <Mic color={COLORS.purple} size={24} />
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.sendButton} onPress={sendVoiceRequest}>
                  <Send color={COLORS.white} size={28} />
                </TouchableOpacity>
              </View>
            )}

            {status === 'processing' && (
              <ActivityIndicator size="large" color={COLORS.purple} />
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  evanaAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 10,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(124, 92, 252, 0.3)',
    zIndex: 1,
  },
  pulseCircleActive: {
    backgroundColor: 'rgba(124, 92, 252, 0.6)',
  },
  statusText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  transcriptContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.lg,
    padding: 20,
    width: '100%',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userTranscript: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginBottom: 10,
    textAlign: 'center',
  },
  aiResponse: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  controls: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  stopButton: {
    backgroundColor: '#FF4B4B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  sendButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    alignItems: 'center',
    gap: 4,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
