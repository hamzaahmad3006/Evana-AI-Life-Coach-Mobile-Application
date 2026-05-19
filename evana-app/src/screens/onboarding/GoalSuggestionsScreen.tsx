import React, {
  useState,
  useEffect,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';

import {
  Target,
  Heart,
  BookOpen,
  Dumbbell,
  Briefcase,
  Zap,
} from 'lucide-react-native';

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { GoalCard } from '../../components/ui/GoalCard';

import {
  COLORS,
  SPACING,
} from '../../constants/theme';

import {
  useAppDispatch,
  useAppSelector,
} from '../../store/store';

import {
  completeOnboarding,
  saveGoals,
} from '../../store/authSlice';

import { API_ENDPOINTS } from '../../constants/config';

const getIconForCategory = (
  category: string
) => {
  const cat = category.toLowerCase();

  if (
    cat.includes('fit') ||
    cat.includes('health') ||
    cat.includes('workout')
  ) {
    return {
      icon: (
        <Dumbbell
          size={18}
          color="#7C5CFC"
        />
      ),
      bg: '#EEE8FF',
    };
  }

  if (
    cat.includes('mental') ||
    cat.includes('mind') ||
    cat.includes('well')
  ) {
    return {
      icon: (
        <Heart
          size={18}
          color="#38B48B"
        />
      ),
      bg: '#E8F8F1',
    };
  }

  if (
    cat.includes('grow') ||
    cat.includes('read') ||
    cat.includes('learn')
  ) {
    return {
      icon: (
        <BookOpen
          size={18}
          color="#F2A93B"
        />
      ),
      bg: '#FFF4E2',
    };
  }

  if (
    cat.includes('career') ||
    cat.includes('work')
  ) {
    return {
      icon: (
        <Briefcase
          size={18}
          color="#7C5CFC"
        />
      ),
      bg: '#EEE8FF',
    };
  }

  return {
    icon: (
      <Zap
        size={18}
        color="#7C5CFC"
      />
    ),
    bg: '#EEE8FF',
  };
};

export const GoalSuggestionsScreen: React.FC =
  () => {
    const dispatch =
      useAppDispatch();

    const {
      loading,
      error,
      chatHistory,
      user,
    } = useAppSelector(
      (state) => state.auth
    );

    const [
      suggestions,
      setSuggestions,
    ] = useState<any[]>([]);

    const [
      selectedIds,
      setSelectedIds,
    ] = useState<string[]>([]);

    const [
      isFetching,
      setIsFetching,
    ] = useState(true);

    useEffect(() => {
      const fetchSuggestions =
        async () => {
          try {
            const response =
              await fetch(
                API_ENDPOINTS.goalSuggestions,
                {
                  method: 'POST',

                  headers: {
                    'Content-Type':
                      'application/json',
                  },

                  body: JSON.stringify(
                    {
                      user_id:
                        user?.id,

                      messages:
                        chatHistory,

                      user_context:
                        {
                          full_name:
                            user
                              ?.user_metadata
                              ?.full_name,

                          interests:
                            user
                              ?.user_metadata
                              ?.interests,
                        },
                    }
                  ),
                }
              );

            const data =
              await response.json();

            const goals =
              data.suggestions ||
              [];

            setSuggestions(goals);

            setSelectedIds(
              goals.map(
                (
                  _: any,
                  index: number
                ) =>
                  index.toString()
              )
            );
          } catch (err) {
            console.log(err);
          } finally {
            setIsFetching(false);
          }
        };

      fetchSuggestions();
    }, []);

    const toggleGoal = (
      id: string
    ) => {
      setSelectedIds((prev) =>
        prev.includes(id)
          ? prev.filter(
              (i) => i !== id
            )
          : [...prev, id]
      );
    };

    const handleConfirm =
      async () => {
        const selectedGoals =
          suggestions.filter(
            (_, index) =>
              selectedIds.includes(
                index.toString()
              )
          );

        if (
          selectedGoals.length > 0
        ) {
          await dispatch(
            saveGoals(
              selectedGoals
            )
          );
        }

        dispatch(
          completeOnboarding()
        );
      };

    if (isFetching) {
      return (
        <ScreenWrapper>
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={
                COLORS.purple
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Evana is creating
              your personalized
              goals...
            </Text>
          </View>
        </ScreenWrapper>
      );
    }

    return (
      <ScreenWrapper>
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* Progress */}

          <View
            style={
              styles.progressContainer
            }
          >
            <View
              style={[
                styles.progressBar,
                styles.progressBarActive,
              ]}
            />

            <View
              style={[
                styles.progressBar,
                styles.progressBarActive,
              ]}
            />

            <View
              style={[
                styles.progressBar,
                styles.progressBarActive,
              ]}
            />
          </View>

          {/* Header */}

          <View style={styles.header}>
            <Text
              style={
                styles.contextText
              }
            >
              Based on our chat
            </Text>

            <Text style={styles.title}>
              Suggested goals
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Accept, edit or skip
              any of these
            </Text>
          </View>

          {/* Error */}

          {error && (
            <View
              style={
                styles.errorBanner
              }
            >
              <Text
                style={
                  styles.errorBannerText
                }
              >
                {error}
              </Text>
            </View>
          )}

          {/* Goal Cards */}

          <View
            style={
              styles.goalsContainer
            }
          >
            {suggestions.map(
              (goal, index) => {
                const {
                  icon,
                  bg,
                } =
                  getIconForCategory(
                    goal.category
                  );

                const id =
                  index.toString();

                return (
                  <GoalCard
                    key={id}
                    title={
                      goal.title
                    }
                    category={
                      goal.category
                    }
                    duration={
                      goal.duration
                    }
                    icon={icon}
                    iconBg={bg}
                    selected={selectedIds.includes(
                      id
                    )}
                    onPress={() =>
                      toggleGoal(
                        id
                      )
                    }
                  />
                );
              }
            )}
          </View>

          {/* CTA */}

          <View
            style={
              styles.ctaSection
            }
          >
            <Button
              title={
                loading
                  ? 'Saving...'
                  : 'Confirm goals →'
              }
              onPress={
                handleConfirm
              }
              disabled={
                loading ||
                selectedIds.length ===
                  0
              }
            />
          </View>

          {/* Footer */}

          <Text
            style={
              styles.footerText
            }
          >
            You can add more goals
            anytime
          </Text>
        </ScrollView>
      </ScreenWrapper>
    );
  };

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal:
      SPACING.lg,

    paddingTop: 16,

    paddingBottom: 52,
  },

  /* Loading */

  loadingContainer: {
    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    paddingHorizontal: 40,
  },

  loadingText: {
    marginTop: 18,

    fontSize: 14,

    lineHeight: 22,

    textAlign: 'center',

    color: COLORS.textMid,

    fontWeight: '600',
  },

  /* Progress */

  progressContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,

    marginBottom: 26,
  },

  progressBar: {
    flex: 1,

    height: 4,

    borderRadius: 999,

    backgroundColor:
      'rgba(124,92,252,0.14)',
  },

  progressBarActive: {
    backgroundColor:
      COLORS.purple,
  },

  /* Header */

  header: {
    marginBottom: 28,
  },

  contextText: {
    fontSize: 11,

    fontWeight: '600',

    color: COLORS.textLight,

    marginBottom: 8,
  },

  title: {
    fontSize: 30,

    fontWeight: '800',

    color: COLORS.textDark,

    marginBottom: 8,

    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,

    lineHeight: 22,

    color: COLORS.textMid,

    fontWeight: '500',
  },

  /* Goal List */

  goalsContainer: {
    gap: 8,
  },

  /* Error */

  errorBanner: {
    backgroundColor:
      '#FEE2E2',

    borderRadius: 14,

    padding: 14,

    marginBottom: 18,

    borderWidth: 1,

    borderColor: '#FECACA',
  },

  errorBannerText: {
    fontSize: 12,

    color: '#DC2626',

    fontWeight: '600',

    textAlign: 'center',
  },

  /* CTA */

  ctaSection: {
    marginTop: 6,
  },

  /* Footer */

  footerText: {
    marginTop: 8,

    textAlign: 'center',

    fontSize: 12,

    lineHeight: 18,

    color: COLORS.textMid,

    fontWeight: '500',
  },
});