import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AppLogo = require('../../../assets/evana.png');

import {
  ChevronLeft,
  ArrowUp,
} from 'lucide-react-native';

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ChatBubble } from '../../components/chat/ChatBubble';

import {
  COLORS,
  SPACING,
} from '../../constants/theme';

import {
  useAppDispatch,
  useAppSelector,
} from '../../store/store';

import {
  setOnboardingStep,
  setChatHistory,
} from '../../store/authSlice';

import { API_ENDPOINTS } from '../../constants/config';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
}

export const OnboardingChatScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const { user } =
    useAppSelector(
      (state) => state.auth
    );

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [inputText, setInputText] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [isReady, setIsReady] =
    useState(false);

  const flatListRef =
    useRef<FlatList>(null);

  /* Initial Greeting */

  useEffect(() => {
    const name =
      user?.user_metadata
        ?.full_name || 'there';

    const initialMsg: Message = {
      id: '1',
      text: `Hi ${name}! I'm Evana, your personal AI life coach. What areas of your life would you most like to improve? 🌱`,
      isAI: true,
    };

    setMessages([initialMsg]);
  }, []);

  /* Send */

  const handleSend = async () => {
    if (!inputText.trim() || loading)
      return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isAI: false,
    };

    const newMessages = [
      ...messages,
      userMsg,
    ];

    setMessages(newMessages);

    setInputText('');

    setLoading(true);

    try {
      const response = await fetch(
        API_ENDPOINTS.onboardingChat,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            user_id: user?.id,

            messages:
              newMessages.map(
                (m) => ({
                  role: m.isAI
                    ? 'assistant'
                    : 'user',

                  content: m.text,
                })
              ),
          }),
        }
      );

      const data =
        await response.json();

      const aiMsg: Message = {
        id: (
          Date.now() + 1
        ).toString(),

        text: data.message,

        isAI: true,
      };

      const finalMessages = [
        ...newMessages,
        aiMsg,
      ];

      setMessages(finalMessages);

      if (data.is_ready_for_goals) {
        setIsReady(true);

        dispatch(
          setChatHistory(
            finalMessages.map((m) => ({
              role: m.isAI
                ? 'assistant'
                : 'user',

              content: m.text,
            }))
          )
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /* Render */

  return (
    <ScreenWrapper
      style={styles.screen}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
          >
            <ChevronLeft
              size={18}
              color={COLORS.textDark}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Evana</Text>
            <Text style={styles.headerStatus}>• Active now</Text>
          </View>
        </View>

        {/* Messages */}
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => (
              <View style={item.isAI ? styles.aiRow : styles.userRow}>
                {item.isAI ? (
                  <View style={styles.aiOrb}>
                    <Image 
                      source={AppLogo} 
                      style={styles.avatarImage} 
                      resizeMode="contain"
                    />
                  </View>
                ) : null}
                
                <ChatBubble message={item.text} isAI={item.isAI} />
                
                {!item.isAI && (
                  <View style={[styles.userAvatar, !user?.user_metadata?.avatar_url && styles.userAvatarFallback]}>
                    {user?.user_metadata?.avatar_url ? (
                      <Image 
                        source={{ uri: user.user_metadata.avatar_url }} 
                        style={styles.avatarImage} 
                      />
                    ) : null}
                  </View>
                )}
              </View>
            )}
            ListFooterComponent={() =>
              loading ? (
                <View style={styles.typingContainer}>
                  <View style={styles.aiOrb} />
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color={COLORS.purple} />
                    <Text style={styles.typingText}>Evana is typing...</Text>
                  </View>
                </View>
              ) : null
            }
          />
        </View>

        {/* Input Container */}
        <View
          style={[
            styles.inputWrapper,
             {
      paddingBottom:
        Platform.OS === 'ios'
          ? Math.max(insets.bottom, 18)
          : 14,
    },
          ]}
        >
          {isReady ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.readyButton}
              onPress={() => dispatch(setOnboardingStep('goals'))}
            >
              <Text style={styles.readyButtonText}>View my suggestions</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Type a message..."
                placeholderTextColor="#9E94BC"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!loading}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSend}
                disabled={!inputText.trim() || loading}
                style={[
                  styles.sendButton,
                  (!inputText.trim() || loading) && { opacity: 0.5 }
                ]}
              >
                <ArrowUp size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,

    backgroundColor:
      COLORS.background,
  },

  container: {
    flex: 1,
  },

  /* Header */

  header: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal:
      SPACING.lg,

    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight ||
            0) + 24
        : 64,

    paddingBottom: 22,
  },

  backButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor:
      'rgba(255,255,255,0.65)',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  headerCenter: {
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 16,

    fontWeight: '800',

    color: COLORS.textDark,

    marginBottom: 2,
  },

  headerStatus: {
    fontSize: 11,

    fontWeight: '600',

    color: '#4CAF50',
  },

  /* Chat */

  chatContent: {
    paddingHorizontal:
      SPACING.lg,

    paddingBottom: 120,
  },

  aiRow: {
    flexDirection: 'row',

    alignItems: 'flex-end',

    marginBottom: 18,
  },

  userRow: {
    alignItems: 'flex-end',

    marginBottom: 18,
  },

  aiOrb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    marginRight: 8,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.1)',
  },

  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
    marginBottom: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userAvatarFallback: {
    backgroundColor: '#7C5CFC',
    opacity: 0.9,
  },

  avatarImage: {
    width: '170%',
    height: '170%',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: 18,
  },

  /* Typing */
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },

  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    maxWidth: '74%',
  },

  typingText: {
    fontSize: 13,
    color: COLORS.textMid,
    fontWeight: '500',
  },

inputWrapper: {
  position: 'absolute',

  left: 0,
  right: 0,
  bottom: 0,

  paddingHorizontal: 18,

  paddingTop: 10,

  backgroundColor: 'transparent',
},

 inputContainer: {
  flexDirection: 'row',

  alignItems: 'center',

  backgroundColor: 'rgba(255,255,255,0.72)',

  borderRadius: 22,

  paddingLeft: 14,

  paddingRight: 8,

  paddingVertical: 8,

  borderWidth: 1,

  borderColor: 'rgba(255,255,255,0.45)',

  shadowColor: '#7C5CFC',

  shadowOffset: {
    width: 0,
    height: 10,
  },

  shadowOpacity: 0.08,

  shadowRadius: 18,

  elevation: 6,
},
  inputField: {
    flex: 1,
    minHeight: 40,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.08)',
  },

  sendButton: {
  width: 38,
  height: 38,

  borderRadius: 19,

  backgroundColor: COLORS.purple,

  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: 8,

  shadowColor: COLORS.purple,

  shadowOffset: {
    width: 0,
    height: 6,
  },

  shadowOpacity: 0.22,

  shadowRadius: 10,

  elevation: 4,
},

  /* CTA */

  readyButton: {
    height: 58,

    borderRadius: 29,

    backgroundColor:
      COLORS.purple,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor:
      COLORS.purple,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.22,

    shadowRadius: 16,

    elevation: 6,
  },

  readyButtonText: {
    color: '#FFF',

    fontSize: 15,

    fontWeight: '700',
  },
});