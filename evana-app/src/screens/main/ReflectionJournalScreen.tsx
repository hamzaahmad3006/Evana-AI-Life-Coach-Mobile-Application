import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
  ChevronRight,
  Sparkles,
  History as HistoryIcon,
  X,
} from 'lucide-react-native';

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';

import { useAppDispatch, useAppSelector } from '../../store/store';
import { setMainScreen } from '../../store/authSlice';

import {
  addReflection,
  fetchReflections,
  Reflection,
} from '../../store/reflectionSlice';

const COLORS = {
  bg: '#F6F3FF',
  purple: '#7C5CFC',
  purpleLight: '#9A7DFF',
  textDark: '#1F1147',
  textMid: '#7F78A8',
  textLight: '#B6AFD2',
  white: '#FFFFFF',
  softPurple: '#F3F0FF',
};

export const ReflectionJournalScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const { reflections, creating } = useAppSelector(
    state => state.reflections
  );

  const [content, setContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [latestInsight, setLatestInsight] = useState<Reflection | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchReflections(user.id));
    }
  }, [user?.id]);

  const handleSave = async () => {
    if (!content.trim() || !user?.id) {
      Alert.alert(
        'Reflection Empty',
        'Please write something before saving.'
      );
      return;
    }

    try {
      const result = await dispatch(
        addReflection({
          userId: user.id,
          content,
          mood: '😊',
        })
      ).unwrap();

      setLatestInsight(result);
      setShowInsight(true);
      setContent('');
    } catch (e) {
      Alert.alert(
        'Error',
        'Failed to save reflection.'
      );
    }
  };

  const PromptItem = ({
    icon,
    title,
    bg,
  }: {
    icon: React.ReactNode;
    title: string;
    bg: string;
  }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.promptItem}
    >
      <View
        style={[
          styles.promptIconContainer,
          { backgroundColor: bg },
        ]}
      >
        {icon}
      </View>

      <Text style={styles.promptText}>
        {title}
      </Text>

      <ChevronRight
        size={18}
        color="#B8B0D4"
      />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
         {/* HEADER */}
<View style={styles.headerContainer}>
  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.headerIconButton}
    onPress={() => dispatch(setMainScreen('home'))}
  >
    <X
      size={20}
      color={COLORS.textDark}
    />
  </TouchableOpacity>

  <Text style={styles.headerTitle}>
    Daily reflection
  </Text>

  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.historyButton}
    onPress={() => setShowHistory(true)}
  >
    <Text style={styles.historyText}>
      History
    </Text>
  </TouchableOpacity>
</View>

          {/* PROMPT CARD */}
          <LinearGradient
            colors={[
              '#9075FF',
              '#7C5CFC',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promptCard}
          >
            <Text style={styles.promptLabel}>
              TODAY'S PROMPTS
            </Text>

            <Text style={styles.promptTitle}>
              What went well today? 🌟
            </Text>

            <Text
              style={
                styles.promptDescription
              }
            >
              Take a moment to celebrate
              your wins, big or small.
            </Text>
          </LinearGradient>

          {/* INPUT */}
          <View style={styles.inputContainer}>
            <TextInput
              multiline
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
              placeholder="Write your reflection here..."
              placeholderTextColor={
                COLORS.textLight
              }
              style={styles.input}
            />
          </View>

          {/* MORE PROMPTS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              More prompts
            </Text>

            <PromptItem
              title="What challenges did you face?"
              bg="#F4F0FF"
              icon={
                <Text
                  style={{ fontSize: 18 }}
                >
                  😟
                </Text>
              }
            />

            <PromptItem
              title="What will you improve tomorrow?"
              bg="#E6F7F0"
              icon={
                <Sparkles
                  size={18}
                  color="#39B88F"
                />
              }
            />

            <PromptItem
              title="Rate your mood today"
              bg="#FFF8E8"
              icon={
                <HistoryIcon
                  size={18}
                  color="#E2B000"
                />
              }
            />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {creating
                ? 'Saving...'
                : 'Save reflection'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI INSIGHT MODAL */}
        <Modal visible={showInsight} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.insightCard}>
              <LinearGradient colors={[COLORS.purple, COLORS.purpleLight]} style={styles.insightHeader}>
                <Sparkles size={24} color={COLORS.white} />
                <Text style={styles.insightTitle}>Evana's Analysis</Text>
              </LinearGradient>
              <View style={styles.insightBody}>
                <View style={styles.emotionRow}>
                  <View style={styles.moodBadge}>
                    <Text style={styles.moodBadgeText}>{latestInsight?.ai_analysis?.primary_emotion || 'Balanced'}</Text>
                  </View>
                  <Text style={styles.sentimentText}>{latestInsight?.ai_analysis?.sentiment_score}/10 Mood</Text>
                </View>

                <Text style={styles.insightText}>"{latestInsight?.ai_summary}"</Text>
                
                {latestInsight?.ai_analysis?.correlation && (
                  <View style={styles.correlationBox}>
                    <Text style={styles.correlationLabel}>Behavioral Insight:</Text>
                    <Text style={styles.correlationText}>{latestInsight.ai_analysis.correlation}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={() => setShowInsight(false)}
                >
                  <Text style={styles.saveButtonText}>Amazing, thanks!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* HISTORY MODAL */}
        <Modal
          visible={showHistory}
          animationType="slide"
        >
          <ScreenWrapper
            style={{
              backgroundColor:
                COLORS.bg,
            }}
          >
            <View
              style={
                styles.historyHeader
              }
            >
              <Text
                style={
                  styles.historyTitle
                }
              >
                Reflection History
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowHistory(false)
                }
              >
                <X
                  size={22}
                  color={
                    COLORS.textDark
                  }
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                padding: 20,
              }}
            >
              {reflections.map(item => (
                <View
                  key={item.id}
                  style={
                    styles.historyCard
                  }
                >
                  <Text
                    style={
                      styles.historyDate
                    }
                  >
                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </Text>

                  <Text
                    style={
                      styles.historyContent
                    }
                  >
                    {item.content}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </ScreenWrapper>
        </Modal>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F3FF',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
headerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',

  paddingTop: 18,
  marginBottom: 28,
},
headerIconButton: {
  width: 42,
  height: 42,
  borderRadius: 21,

  backgroundColor: '#FFFFFF',

  justifyContent: 'center',
  alignItems: 'center',
},
headerTitle: {
  flex: 1,
  textAlign: 'center',

  fontSize: 18,
  fontWeight: '700',

  color: COLORS.textDark,
},
historyButton: {
  minWidth: 42,
  alignItems: 'flex-end',
},
historyText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#8F73FF',
},

  promptCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 22,
  },

  promptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
    marginBottom: 14,
  },

  promptTitle: {
    fontSize: 21,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
  },

  promptDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.88)',
  },

  inputContainer: {
    height: 180,
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 20,
    marginBottom: 28,
  },

  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.textDark,
  },

  section: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 18,
  },

  promptItem: {
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  promptIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  promptText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 10,
    backgroundColor: COLORS.bg,
  },

  saveButton: {
    height: 64,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.purple,

    shadowColor: '#7C5CFC',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 3,
  },

  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 30,
  },
  insightCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  insightTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  insightBody: {
    padding: 24,
  },
  emotionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  moodBadge: {
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodBadgeText: {
    color: '#7C5CFC',
    fontSize: 12,
    fontWeight: '700',
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textDark,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  correlationBox: {
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  correlationLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C5CFC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  correlationText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textMid,
  },

  historyHeader: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },

  historyDate: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 10,
  },

  historyContent: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textMid,
  },
});