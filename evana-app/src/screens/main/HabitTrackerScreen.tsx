import React, {
  useState,
  useEffect,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { BottomTab } from '../../components/ui/BottomTab';
import { HabitRow } from '../../components/ui/HabitRow';

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
} from '../../constants/theme';

import { LinearGradient } from 'expo-linear-gradient';

import {
  useAppDispatch,
  useAppSelector,
} from '../../store/store';

import {
  fetchHabits,
  toggleHabitStatus,
  createHabit,
  fetchWeeklyLogs,
  Habit,
} from '../../store/habitSlice';

import {
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  format,
} from 'date-fns';

import { Plus } from 'lucide-react-native';

const EMOJIS = [
  '💧',
  '🏃',
  '📖',
  '🪞',
  '🧘',
  '🍎',
  '💪',
  '🧠',
];

const PRESET_COLORS = [
  '#EDE8FF',
  '#E1F5EE',
  '#FAEEDA',
  '#FBEAF0',
  '#E0F2FE',
  '#FEF3C7',
];

export const HabitTrackerScreen: React.FC =
  () => {
    const dispatch =
      useAppDispatch();

    const { user } =
      useAppSelector(
        (state) => state.auth
      );

    const {
      habits,
      globalStreak,
      weeklyLogs,
      loading,
      togglingHabitId,
    } = useAppSelector(
      (state) => state.habits
    );

    const [
      modalVisible,
      setModalVisible,
    ] = useState(false);

    const [newHabit, setNewHabit] =
      useState({
        title: '',
        emoji: '✨',
        bg_color: '#EDE8FF',
        frequency: 'daily',
      });

    // Calendar logic
    const todayDate = new Date();
    const weekStart = startOfWeek(todayDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    useEffect(() => {
      if (user?.id) {
        dispatch(fetchHabits(user.id));
        
        // Fetch logs for the week
        dispatch(fetchWeeklyLogs({
          userId: user.id,
          startDate: format(weekStart, 'yyyy-MM-dd'),
          endDate: format(addDays(weekStart, 6), 'yyyy-MM-dd')
        }));
      }
    }, [user?.id]);

    const handleToggle = (
      habit: Habit
    ) => {
      if (!user?.id) return;

      dispatch(
        toggleHabitStatus({
          habitId: habit.id,
          userId: user.id,
          status:
            !habit.is_completed_today,
        })
      );
    };

    const hasLogForDate = (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return weeklyLogs.some(log => log.logged_at === dateStr && log.status);
    };

    const handleCreate =
      async () => {
        if (
          !newHabit.title.trim() ||
          !user?.id
        ) {
          Alert.alert(
            'Error',
            'Please enter a habit title'
          );

          return;
        }

        try {
          await dispatch(
            createHabit({
              ...newHabit,
              user_id: user.id,
            })
          ).unwrap();

          setModalVisible(false);

          setNewHabit({
            title: '',
            emoji: '✨',
            bg_color: '#EDE8FF',
            frequency: 'daily',
          });
        } catch (err) {
          Alert.alert(
            'Error',
            'Failed to create habit'
          );
        }
      };

    const completedCount =
      habits.filter(
        (h) =>
          h.is_completed_today
      ).length;

    const totalStreak = globalStreak;

    if (
      loading &&
      habits.length === 0
    ) {
      return (
        <ScreenWrapper
          style={
            styles.centered
          }
        >
          <ActivityIndicator
            size="large"
            color={
              COLORS.purple
            }
          />
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
          {/* Header */}

          <View
            style={styles.header}
          >
            <Text
              style={styles.title}
            >
              Today's habits
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {format(
                new Date(),
                'EEEE, d MMM'
              )}{' '}
              · {completedCount}{' '}
              of {habits.length}{' '}
              done
            </Text>
          </View>

          {/* Weekly Calendar */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarRow}>
              {weekDays.map((date, index) => {
                const dayLabel = format(date, 'EEEEEE'); // M, T, W...
                const dayNum = format(date, 'd');
                const isCurrent = isToday(date);
                const hasDot = hasLogForDate(date);

                return (
                  <View key={index} style={styles.calendarDay}>
                    <Text style={styles.dayLabel}>{dayLabel}</Text>
                    <View style={[
                      styles.dayCircle,
                      isCurrent && styles.dayCircleCurrent
                    ]}>
                      <Text style={[
                        styles.dayNum,
                        isCurrent && styles.dayNumCurrent
                      ]}>
                        {dayNum}
                      </Text>
                    </View>
                    <View style={[
                      styles.dot,
                      hasDot ? styles.dotActive : styles.dotInactive
                    ]} />
                  </View>
                );
              })}
            </View>
          </View>

          {/* Streak Card */}

          <LinearGradient
            colors={[
              COLORS.purple,
              COLORS.purpleLight,
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={
              styles.streakCard
            }
          >
            <View
              style={
                styles.streakEmojiWrapper
              }
            >
              <Text
                style={
                  styles.streakEmoji
                }
              >
                🔥
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.streakTitle
                }
              >
                {totalStreak} day
                streak
              </Text>

              <Text
                style={
                  styles.streakSub
                }
              >
                Keep it going!
              </Text>
            </View>
          </LinearGradient>

          {/* Habits */}

          <View
            style={
              styles.habitsList
            }
          >
            {habits.map(
              (habit) => (
                <HabitRow
                  key={habit.id}
                  title={habit.title}
                  subtitle={`${habit.frequency.charAt(0).toUpperCase()}${habit.frequency.slice(1)} · ${habit.streak_count} day streak`}
                  emoji={habit.emoji}
                  iconBg={habit.bg_color}
                  completed={habit.is_completed_today}
                  loading={
                    togglingHabitId ===
                    habit.id
                  }
                  onToggle={() =>
                    handleToggle(
                      habit
                    )
                  }
                />
              )
            )}

            {/* Add Habit Button */}

            <TouchableOpacity
              activeOpacity={
                0.85
              }
              style={
                styles.addHabitButton
              }
              onPress={() =>
                setModalVisible(
                  true
                )
              }
            >
              <LinearGradient
                colors={[
                  COLORS.purple,
                  COLORS.purpleLight,
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 1,
                }}
                style={
                  styles.addHabitGradient
                }
              >
                <Plus
                  size={18}
                  color="#FFF"
                />

                <Text
                  style={
                    styles.addHabitText
                  }
                >
                  Add new habit
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 140,
            }}
          />
        </ScrollView>

        {/* Modal */}

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() =>
            setModalVisible(false)
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={
                styles.modalContent
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                New Habit
              </Text>

              <TextInput
                style={
                  styles.modalInput
                }
                placeholder="Habit Title"
                placeholderTextColor={
                  COLORS.textLight
                }
                value={
                  newHabit.title
                }
                onChangeText={(
                  txt
                ) =>
                  setNewHabit({
                    ...newHabit,
                    title: txt,
                  })
                }
              />

              <Text
                style={
                  styles.label
                }
              >
                Select Emoji
              </Text>

              <View
                style={
                  styles.emojiGrid
                }
              >
                {EMOJIS.map(
                  (e) => (
                    <TouchableOpacity
                      key={e}
                      activeOpacity={
                        0.8
                      }
                      style={[
                        styles.emojiBtn,
                        newHabit.emoji ===
                          e &&
                          styles.selectedEmoji,
                      ]}
                      onPress={() =>
                        setNewHabit({
                          ...newHabit,
                          emoji: e,
                        })
                      }
                    >
                      <Text
                        style={
                          styles.emojiText
                        }
                      >
                        {e}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text
                style={
                  styles.label
                }
              >
                Select Color
              </Text>

              <View
                style={
                  styles.colorGrid
                }
              >
                {PRESET_COLORS.map(
                  (c) => (
                    <TouchableOpacity
                      key={c}
                      activeOpacity={
                        0.8
                      }
                      style={[
                        styles.colorBtn,
                        {
                          backgroundColor:
                            c,
                        },
                        newHabit.bg_color ===
                          c &&
                          styles.selectedColor,
                      ]}
                      onPress={() =>
                        setNewHabit({
                          ...newHabit,
                          bg_color:
                            c,
                        })
                      }
                    />
                  )
                )}
              </View>

              <View
                style={
                  styles.modalButtons
                }
              >
                <TouchableOpacity
                  style={
                    styles.cancelBtn
                  }
                  onPress={() =>
                    setModalVisible(
                      false
                    )
                  }
                >
                  <Text
                    style={
                      styles.cancelBtnText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.createBtn
                  }
                  onPress={
                    handleCreate
                  }
                >
                  <Text
                    style={
                      styles.createBtnText
                    }
                  >
                    Create
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <BottomTab activeTab="habits" />
      </ScreenWrapper>
    );
  };

const styles = StyleSheet.create({
  centered: {
    flex: 1,

    justifyContent:
      'center',

    alignItems: 'center',
  },

  scrollContent: {
    paddingHorizontal:
      SPACING.lg,

    paddingTop:
      Platform.OS ===
      'android'
        ? (StatusBar.currentHeight ||
            0) + 28
        : 68,

    paddingBottom: 40,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    ...TYPOGRAPHY.h3,

    fontSize: 30,

    color:
      COLORS.textDark,

    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,

    color:
      COLORS.textMid,

    fontWeight: '500',

    marginTop: 6,
  },

  /* Calendar */
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarDay: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleCurrent: {
    backgroundColor: COLORS.purple,
  },
  dayNum: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  dayNumCurrent: {
    color: COLORS.white,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    backgroundColor: '#38B48B',
  },
  dotInactive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  /* Streak */
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 24,
    marginBottom: 22,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },

  streakEmojiWrapper: {
    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor:
      'rgba(255,255,255,0.18)',

    justifyContent:
      'center',

    alignItems: 'center',

    marginRight: 14,
  },

  streakEmoji: {
    fontSize: 22,
  },

  streakTitle: {
    fontSize: 20,

    fontWeight: '800',

    color: COLORS.white,
  },

  streakSub: {
    fontSize: 12,

    color:
      'rgba(255,255,255,0.82)',

    fontWeight: '600',

    marginTop: 4,
  },

  /* Habits */

  habitsList: {
    gap: 14,
  },

  /* Add Habit */

  addHabitButton: {
    marginTop: 20,
  },

  addHabitGradient: {
    height: 56,

    borderRadius: 28,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'center',

    gap: 10,

    shadowColor:
      COLORS.purple,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.18,

    shadowRadius: 18,

    elevation: 8,
  },

  addHabitText: {
    fontSize: 15,

    fontWeight: '700',

    color: '#FFF',
  },

  /* Modal */

  modalOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(0,0,0,0.35)',

    justifyContent:
      'flex-end',
  },

  modalContent: {
    backgroundColor:
      COLORS.white,

    borderTopLeftRadius: 32,

    borderTopRightRadius: 32,

    padding: SPACING.xl,

    minHeight: 420,
  },

  modalTitle: {
    ...TYPOGRAPHY.h3,

    marginBottom: 22,

    color:
      COLORS.textDark,
  },

  modalInput: {
    backgroundColor:
      COLORS.cardBg,

    borderRadius: 18,

    padding: 16,

    fontSize: 15,

    borderWidth: 1,

    borderColor:
      COLORS.cardBorder,

    marginBottom: 22,

    color:
      COLORS.textDark,
  },

  label: {
    fontSize: 12,

    fontWeight: '700',

    color:
      COLORS.textMid,

    marginBottom: 12,
  },

  emojiGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 12,

    marginBottom: 22,
  },

  emojiBtn: {
    width: 44,
    height: 44,

    borderRadius: 22,

    justifyContent:
      'center',

    alignItems: 'center',

    backgroundColor:
      COLORS.cardBg,
  },

  selectedEmoji: {
    borderWidth: 2,

    borderColor:
      COLORS.purple,
  },

  emojiText: {
    fontSize: 22,
  },

  colorGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 12,

    marginBottom: 30,
  },

  colorBtn: {
    width: 42,
    height: 42,

    borderRadius: 21,

    borderWidth: 1,

    borderColor:
      'rgba(0,0,0,0.05)',
  },

  selectedColor: {
    borderWidth: 3,

    borderColor:
      COLORS.purple,
  },

  modalButtons: {
    flexDirection: 'row',

    gap: 12,
  },

  cancelBtn: {
    flex: 1,

    padding: 16,

    alignItems: 'center',

    borderRadius: 18,

    backgroundColor:
      COLORS.cardBg,
  },

  cancelBtnText: {
    color:
      COLORS.textMid,

    fontWeight: '700',
  },

  createBtn: {
    flex: 2,

    padding: 16,

    alignItems: 'center',

    borderRadius: 18,

    backgroundColor:
      COLORS.purple,
  },

  createBtnText: {
    color: COLORS.white,

    fontWeight: '700',
  },
});