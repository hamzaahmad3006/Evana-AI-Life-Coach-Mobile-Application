import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { BottomTab } from '../../components/ui/BottomTab';
import { Button } from '../../components/ui/Button';
import { useAppDispatch } from '../../store/store';
import { setMainScreen } from '../../store/authSlice';

import {
  COLORS,
  SPACING,
  RADIUS,
} from '../../constants/theme';

import {
  Bell,
  Mic,
  Target,
  ChevronRight,
  Sparkles,
  User,
} from 'lucide-react-native';

import { VoiceInterface } from './VoiceInterface';

const { width, height } = Dimensions.get('window');

const isSmallDevice = width < 360;

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 12,
            paddingBottom: insets.bottom + 120,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SA</Text>
            </View>

            <View>
              <Text style={styles.greetingMini}>
                Hi Sara
              </Text>

              <Text style={styles.greetingMain}>
                Welcome Back
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.notificationBtn}
          >
            <Bell
              size={20}
              color={COLORS.textDark}
            />

            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <Text style={styles.heroText}>
          Good Morning,{'\n'}
          How can I help you?
        </Text>

        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          {/* Large Card */}
          <View style={styles.largeCard}>
            <View style={styles.iconBox}>
              <User
                size={20}
                color={COLORS.purple}
              />
            </View>

            <Text style={styles.cardTitle}>
              Talk to AI{'\n'}
              assistant
            </Text>

            <Text style={styles.cardSub}>
              Let's try it now
            </Text>

            <Button
              title="Start Talking"
              onPress={() => setIsVoiceVisible(true)}
              style={styles.cardBtn}
              textStyle={styles.cardBtnText}
            />
          </View>

          {/* Right Side Cards */}
          <View style={styles.smallCardColumn}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.smallCard}
              onPress={() => dispatch(setMainScreen('journal'))}
            >
              <View style={styles.smallCardContent}>
                <View style={styles.smallIconBox}>
                  <Sparkles
                    size={14}
                    color={COLORS.purple}
                  />
                </View>

                <Text style={styles.smallCardTitle}>
                  Reflection
                </Text>

                <Text style={styles.smallCardSub}>
                  Daily journal
                </Text>
              </View>

              <ChevronRight
                size={18}
                color={COLORS.purple}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.smallCard}
              onPress={() => dispatch(setMainScreen('goals'))}
            >
              <View style={styles.smallCardContent}>
                <View
                  style={[
                    styles.smallIconBox,
                    {
                      backgroundColor:
                        COLORS.purplePale,
                    },
                  ]}
                >
                  <Target
                    size={14}
                    color={COLORS.purple}
                  />
                </View>

                <Text style={styles.smallCardTitle}>
                  Goals
                </Text>

                <Text style={styles.smallCardSub}>
                  Track goals
                </Text>
              </View>

              <ChevronRight
                size={18}
                color={COLORS.purple}
              />
            </TouchableOpacity>


          </View>
        </View>

        {/* Topics Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Topics
          </Text>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillContainer}
          contentContainerStyle={styles.pillContent}
        >
          {[
            'Daily life',
            'Business',
            'Health',
            'Growth',
          ].map((pill, idx) => (
            <View
              key={pill}
              style={[
                styles.pill,
                idx === 0
                  ? styles.pillActive
                  : styles.pillInactive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  idx === 0
                    ? styles.pillTextActive
                    : styles.pillTextInactive,
                ]}
              >
                {pill}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Voice Assistant Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Voice Assistant
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.voiceAssistantCard}
          onPress={() => dispatch(setMainScreen('voice-mode'))}
        >
          <View style={styles.voiceIconBox}>
            <Mic size={24} color={COLORS.white} />
          </View>
          
          <View style={styles.voiceCardContent}>
            <Text style={styles.voiceCardTitle}>Immersive Voice Mode</Text>
            <Text style={styles.voiceCardSub}>Experience a natural conversation with Evana</Text>
          </View>
          
          <ChevronRight size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* AI Insights Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            AI Insights
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => dispatch(setMainScreen('insights'))}>
            <Text style={styles.seeAllText}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.insightHeroCard}
          onPress={() => dispatch(setMainScreen('insights'))}
        >
          <View style={styles.insightHeader}>
            <View style={styles.insightIconBox}>
              <Sparkles size={18} color={COLORS.white} />
            </View>
            <Text style={styles.insightBadge}>TRENDING</Text>
          </View>
          
          <Text style={styles.insightHeroTitle}>
            Identify your peak performance hours
          </Text>
          <Text style={styles.insightHeroSub}>
            Evana has analyzed your habits and noticed a 20% higher consistency during morning sessions...
          </Text>
          
          <View style={styles.insightFooter}>
            <Text style={styles.insightActionText}>Read full analysis</Text>
            <ChevronRight size={16} color={COLORS.purple} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <BottomTab activeTab="home" />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  greetingMini: {
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: '600',
    marginBottom: 2,
  },

  greetingMain: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  heroText: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 26,
  },

  featureGrid: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    gap: 14,
    marginBottom: 28,
  },

  largeCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.purpleSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 24,
    marginBottom: 6,
  },

  cardSub: {
    fontSize: 12,
    color: COLORS.textMid,
    marginBottom: 18,
  },

  cardBtn: {
    paddingVertical: 12,
    borderRadius: 30,
  },

  cardBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  smallCardColumn: {
    flex: 1,
    gap: 14,
  },

  smallCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  smallCardContent: {
    flex: 1,
  },

  smallIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.purpleSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  smallCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },

  smallCardSub: {
    fontSize: 11,
    color: COLORS.textMid,
    marginBottom: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  seeAllText: {
    fontSize: 13,
    color: COLORS.purple,
    fontWeight: '700',
  },

  pillContainer: {
    marginBottom: 20,
  },

  pillContent: {
    paddingRight: 40,
  },

  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    marginRight: 10,
  },

  pillActive: {
    backgroundColor: COLORS.purple,
  },

  pillInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.2)',
  },

  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  pillTextActive: {
    color: COLORS.white,
  },

  pillTextInactive: {
    color: COLORS.textMid,
  },

  insightHeroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
    marginBottom: 40,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.purple,
    backgroundColor: COLORS.purpleSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  insightHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 24,
    marginBottom: 8,
  },
  insightHeroSub: {
    fontSize: 13,
    color: COLORS.textMid,
    lineHeight: 20,
    marginBottom: 20,
  },
  insightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  insightActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.purple,
  },
  voiceAssistantCard: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.lg,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  voiceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceCardContent: {
    flex: 1,
    marginLeft: 16,
  },
  voiceCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  voiceCardSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
});