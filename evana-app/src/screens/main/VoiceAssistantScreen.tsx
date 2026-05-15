import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Square, X, ChevronLeft, Menu, Volume2, Pause } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { API_ENDPOINTS } from '../../constants/config';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setMainScreen } from '../../store/authSlice';

const { width, height } = Dimensions.get('window');

export const VoiceAssistantScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  // States
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [aiText, setAiText] = useState<string>('');
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Animations
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Idle breathing animation
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(orbScale, {
          toValue: 0.98,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    // Constant slow rotation
    const rotation = Animated.loop(
      Animated.timing(orbRotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    breathing.start();
    rotation.start();

    return () => {
      breathing.stop();
      rotation.stop();
      if (sound) sound.unloadAsync();
    };
  }, []);

  const rotateInterpolate = orbRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
      setStatus('listening');
      setAiText('');
      setUserTranscript('');
      
      // Animate text appearance
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecordingAndSend = async () => {
    setIsRecording(false);
    if (!recording) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    
    if (uri) {
      await sendVoiceRequest(uri);
    }
  };

  const sendVoiceRequest = async (uri: string) => {
    if (!user?.id) return;

    setStatus('thinking');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('audio', {
        uri: uri,
        name: 'voice.m4a',
        type: 'audio/m4a',
      } as any);

      const response = await fetch(API_ENDPOINTS.assistantVoice, {
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
      
      // Intense pulse during speaking
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbScale, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(orbScale, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        { iterations: 10 }
      ).start();

      const fileUri = `${FileSystem.cacheDirectory}evana_voice.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: 'base64' as any,
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
    <LinearGradient
      colors={['#E8E0FF', '#FFFFFF', '#D1C4FF']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => dispatch(setMainScreen('home'))}>
          <ChevronLeft color={COLORS.textDark} size={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Voice Analysis</Text>
        
        <TouchableOpacity style={styles.headerBtn}>
          <Menu color={COLORS.textDark} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.statusLabel}>
          {status === 'listening' ? 'Listening...' : 
           status === 'thinking' ? 'Analyzing...' : 
           status === 'speaking' ? 'Evana is speaking' : ''}
        </Text>

        {/* The Iridescent Orb */}
        <View style={styles.orbWrapper}>
          <Animated.Image
            source={require('../../../assets/images/voice_orb.png')}
            style={[
              styles.orbImage,
              {
                transform: [
                  { scale: orbScale },
                  { rotate: rotateInterpolate }
                ]
              }
            ]}
          />
          
          {status === 'thinking' && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={COLORS.purple} />
            </View>
          )}
        </View>

        {/* Text Area */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          {userTranscript !== '' && (
            <Text style={styles.userTranscript}>
              {userTranscript.split(' ').map((word, i) => (
                <Text key={i} style={i > 5 ? styles.wordDim : styles.wordBold}>{word} </Text>
              ))}
            </Text>
          )}
          
          {aiText !== '' && (
            <Text style={styles.aiResponse}>{aiText}</Text>
          )}
          
          {status === 'listening' && (
            <Text style={styles.listeningHint}>What's on your mind?</Text>
          )}
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.controlBtn}>
          <Pause color={COLORS.textDark} size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.micMainBtn, isRecording && styles.micActive]} 
          onPress={isRecording ? stopRecordingAndSend : startRecording}
        >
          {isRecording ? (
            <Square color={COLORS.white} size={28} fill={COLORS.white} />
          ) : (
            <Mic color={COLORS.white} size={32} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={() => dispatch(setMainScreen('home'))}>
          <X color={COLORS.textDark} size={24} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textDark,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.textMid,
    fontWeight: '600',
    marginBottom: 40,
  },
  orbWrapper: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  orbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loaderOverlay: {
    position: 'absolute',
    zIndex: 10,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  userTranscript: {
    fontSize: 22,
    lineHeight: 32,
    textAlign: 'center',
    color: COLORS.textDark,
    marginBottom: 20,
  },
  wordBold: {
    fontWeight: '800',
    color: COLORS.textDark,
  },
  wordDim: {
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '600',
  },
  aiResponse: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: COLORS.textMid,
    fontWeight: '600',
  },
  listeningHint: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.2)',
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  micMainBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B49AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#B49AFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  micActive: {
    backgroundColor: '#FF4B4B',
    shadowColor: '#FF4B4B',
  },
});
