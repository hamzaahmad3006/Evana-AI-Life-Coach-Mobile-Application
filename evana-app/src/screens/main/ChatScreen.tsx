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
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  Image,
} from 'react-native';

import {
  ChevronLeft,
  Menu,
  Plus,
  ArrowUp,
} from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ChatBubble } from '../../components/chat/ChatBubble';

const AppLogo = require('../../../assets/evana.png');

import {
  COLORS,
  SPACING,
} from '../../constants/theme';

import {
  useAppDispatch,
  useAppSelector,
} from '../../store/store';

import {
  setMainScreen,
} from '../../store/authSlice';

import {
  fetchChatHistory,
  sendAssistantMessage,
} from '../../store/chatSlice';

export const ChatScreen: React.FC =
  () => {
    const insets =
      useSafeAreaInsets();

    const dispatch =
      useAppDispatch();

    const { user } =
      useAppSelector(
        (state) => state.auth
      );

    const {
      messages,
      loading,
    } = useAppSelector(
      (state) => state.chat
    );

    const [inputText, setInputText] =
      useState('');

    const flatListRef =
      useRef<FlatList>(null);

    useEffect(() => {
      if (user?.id) {
        dispatch(
          fetchChatHistory(
            user.id
          )
        );
      }
    }, [user?.id]);

    const handleSend = () => {
      if (
        !inputText.trim() ||
        loading ||
        !user?.id
      )
        return;

      const message =
        inputText.trim();

      setInputText('');

      Keyboard.dismiss();

      dispatch(
        sendAssistantMessage({
          userId: user.id,
          message,
        })
      );
    };

    const handleBack = () => {
      dispatch(
        setMainScreen('home')
      );
    };

    return (
      <ScreenWrapper
        style={styles.screen}
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : 'height'
          }
          style={styles.container}
        >
          {/* Header */}

          <View
            style={[
              styles.header,
              {
                paddingTop: 12,
              },
            ]}
          >
            <View
              style={
                styles.headerLeft
              }
            >
              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                style={
                  styles.backButton
                }
                onPress={
                  handleBack
                }
              >
                <ChevronLeft
                  size={18}
                  color={
                    COLORS.textDark
                  }
                />
              </TouchableOpacity>

              <Text
                style={
                  styles.headerTitle
                }
              >
                Smart Chat
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
            >
              <Menu
                size={18}
                color={
                  COLORS.textDark
                }
              />
            </TouchableOpacity>
          </View>

          {/* Chat */}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(
              item
            ) => item.id}
            style={styles.chatList}
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.chatContent
            }
            onContentSizeChange={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 120);
            }}
            onLayout={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 120);
            }}
            renderItem={({
              item,
            }) => (
              <View style={item.role === 'assistant' ? styles.aiRow : styles.userRow}>
                {item.role === 'assistant' ? (
                  <View style={styles.aiOrb}>
                    <Image 
                      source={AppLogo} 
                      style={styles.avatarImage} 
                      resizeMode="contain"
                    />
                  </View>
                ) : null}
                
                <ChatBubble
                  message={item.content}
                  isAI={item.role === 'assistant'}
                />
                
                {item.role === 'user' && (
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
            ListHeaderComponent={null}
            ListFooterComponent={() =>
              loading ? (
                <View
                  style={
                    styles.loadingContainer
                  }
                >
                  <View
                    style={
                      styles.aiOrb
                    }
                  />

                  <View
                    style={
                      styles.loadingBubble
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color={
                        COLORS.purple
                      }
                    />

                    <Text
                      style={
                        styles.loadingText
                      }
                    >
                      Evana is
                      thinking...
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />

          {/* Floating Input */}

          <View
            style={[
              styles.inputWrapper,
              {
                paddingBottom:
                  Platform.OS ===
                  'ios'
                    ? Math.max(
                        insets.bottom,
                        16
                      )
                    : 14,
              },
            ]}
          >
            <View
              style={
                styles.inputDock
              }
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.plusButton
                }
              >
                <Plus
                  size={16}
                  color={
                    COLORS.purple
                  }
                />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Type a message"
                placeholderTextColor="#A296C6"
                value={inputText}
                onChangeText={
                  setInputText
                }
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.sendButton
                }
                onPress={
                  handleSend
                }
                disabled={!inputText.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFF"
                  />
                ) : (
                  <ArrowUp
                    size={16}
                    color="#FFF"
                  />
                )}
              </TouchableOpacity>
            </View>
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

    justifyContent:
      'space-between',

    paddingHorizontal:
      SPACING.lg,

    paddingBottom: 20,
  },

  headerLeft: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor:
      'rgba(255,255,255,0.72)',

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 12,
  },

  headerTitle: {
    fontSize: 17,

    fontWeight: '800',

    color: COLORS.textDark,
  },

  /* Chat */

  chatList: {
    flex: 1,
  },

  chatContent: {
    paddingHorizontal:
      SPACING.lg,

    paddingTop: 8,

    paddingBottom: 20,
  },

  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 22,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: 22,
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

  /* Loading */

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24,
  },

  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },

  loadingText: {
    fontSize: 13,
    color: COLORS.textMid,
    fontWeight: '500',
  },

  /* Input */

  inputWrapper: {
    paddingHorizontal: 18,
  },

  inputDock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 24,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  plusButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.textDark,
    marginHorizontal: 8,
  },

  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
});