import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { BottomTab } from '../../components/ui/BottomTab';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchGoals, updateGoalProgress, Goal } from '../../store/goalSlice';
import { format } from 'date-fns';

export const GoalDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { goals, loading } = useAppSelector(state => state.goals);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchGoals(user.id));
    }
  }, [user?.id]);

  const handleCheckIn = async (goal: Goal) => {
    if (goal.progress >= 100) {
      Alert.alert('Goal Completed!', 'This goal is already 100% complete. Great job!');
      return;
    }

    const newProgress = Math.min(goal.progress + 10, 100);
    setUpdatingId(goal.id);
    try {
      await dispatch(updateGoalProgress({ goalId: goal.id, progress: newProgress })).unwrap();
    } catch (err) {
      Alert.alert('Error', 'Failed to update goal progress. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed' || g.progress === 100);
  const featuredGoal = activeGoals[0];
  const otherGoals = activeGoals.slice(1);

  if (loading && goals.length === 0) {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Goals</Text>
          <Text style={styles.subtitle}>
            {activeGoals.length} active · {completedGoals.length} completed
          </Text>
        </View>

        {featuredGoal ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => handleCheckIn(featuredGoal)}>
            <LinearGradient
              colors={[COLORS.purple, COLORS.purpleLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredCard}
            >
              <View style={styles.featuredHeader}>
                <View>
                  <Text style={styles.categoryTag}>{featuredGoal.category.toUpperCase()}</Text>
                  <Text style={styles.featuredTitle}>{featuredGoal.title}</Text>
                </View>
                {updatingId === featuredGoal.id ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Check-in +10%</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${featuredGoal.progress}%` }]} />
                </View>
              </View>

              <View style={styles.featuredFooter}>
                <Text style={styles.progressText}>{featuredGoal.progress}% complete</Text>
                <Text style={styles.dateText}>
                  Due {format(new Date(featuredGoal.target_date), 'MMM d')}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active goals. Time to set some! 🚀</Text>
          </View>
        )}

        <View style={styles.goalsList}>
          {otherGoals.map(goal => (
            <TouchableOpacity 
              key={goal.id} 
              style={styles.goalCard}
              onPress={() => handleCheckIn(goal)}
            >
              <ProgressRing percentage={goal.progress} />
              <View style={styles.goalInfo}>
                <Text style={styles.goalCategoryMini}>{goal.category.toUpperCase()}</Text>
                <Text style={styles.goalTitleSmall}>{goal.title}</Text>
                <Text style={styles.goalDurationMini}>
                  Due {format(new Date(goal.target_date), 'MMM d')}
                </Text>
              </View>
              {updatingId === goal.id ? (
                <ActivityIndicator size="small" color={COLORS.purple} />
              ) : (
                <TouchableOpacity style={styles.editBtn} onPress={() => handleCheckIn(goal)}>
                  <Text style={styles.editBtnText}>+10%</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button 
          title="+ Add new goal"
          variant="secondary"
          onPress={() => {}}
          style={styles.addBtn}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomTab activeTab="goals" />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 16,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontSize: 22,
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: '500',
  },
  featuredCard: {
    borderRadius: RADIUS.md,
    padding: 20,
    marginBottom: SPACING.md,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  categoryTag: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '800',
    marginBottom: 2,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  activePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  activePillText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  goalsList: {
    gap: 12,
    marginBottom: SPACING.lg,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  goalInfo: {
    flex: 1,
    marginLeft: 16,
  },
  goalCategoryMini: {
    fontSize: 9,
    color: COLORS.textLight,
    fontWeight: '700',
    marginBottom: 2,
  },
  goalTitleSmall: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  goalDurationMini: {
    fontSize: 10,
    color: COLORS.textMid,
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: COLORS.purpleSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  editBtnText: {
    fontSize: 10,
    color: COLORS.purple,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMid,
    fontWeight: '600',
  },
  addBtn: {
    marginTop: 8,
  },
});
