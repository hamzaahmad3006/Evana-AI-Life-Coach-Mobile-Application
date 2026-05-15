import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {
  TrendingUp,
  Flame,
  Target,
} from 'lucide-react-native';

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { BottomTab } from '../../components/ui/BottomTab';

import { useAppDispatch, useAppSelector } from '../../store/store';

import { fetchAnalytics } from '../../store/analyticsSlice';

const COLORS = {
  bg: '#F6F3FF',
  purple: '#7C5CFC',
  purpleLight: '#9A7DFF',
  purpleSoft: '#F3F0FF',
  textDark: '#1F1147',
  textMid: '#7F78A8',
  textLight: '#B6AFD2',
  white: '#FFFFFF',
  success: '#47C28B',
  warning: '#F5B545',
};

export const AnalyticsScreen = () => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(
    state => state.auth
  );

  const { summary, loading } =
    useAppSelector(
      (state) => state.analytics
    );

  const { globalStreak } =
    useAppSelector(
      (state) => state.habits
    );

  const [timeRange, setTimeRange] =
    useState<'week' | 'month'>(
      'week'
    );

  useEffect(() => {
    if (user?.id) {
      dispatch(
        fetchAnalytics({
          userId: user.id,
          days:
            timeRange === 'week'
              ? 7
              : 30,
        })
      );
    }
  }, [timeRange, user?.id]);

  if (!summary && loading) {
    return (
      <ScreenWrapper
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color={COLORS.purple}
        />

        <Text style={styles.loadingText}>
          Preparing your growth
          insights...
        </Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              if (user?.id) {
                dispatch(
                  fetchAnalytics({
                    userId:
                      user.id,
                    days:
                      timeRange ===
                      'week'
                        ? 7
                        : 30,
                  })
                );
              }
            }}
            tintColor={
              COLORS.purple
            }
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Progress
            </Text>


          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tab,
                timeRange ===
                  'week' &&
                  styles.activeTab,
              ]}
              onPress={() =>
                setTimeRange(
                  'week'
                )
              }
            >
              <Text
                style={[
                  styles.tabText,
                  timeRange ===
                    'week' &&
                    styles.activeTabText,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tab,
                timeRange ===
                  'month' &&
                  styles.activeTab,
              ]}
              onPress={() =>
                setTimeRange(
                  'month'
                )
              }
            >
              <Text
                style={[
                  styles.tabText,
                  timeRange ===
                    'month' &&
                    styles.activeTabText,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.primaryCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabelPrimary}>HABIT STREAK</Text>
            </View>
            <View style={styles.streakValueRow}>
              <Text style={styles.metricValuePrimary}>{globalStreak || 0}</Text>
              <Text style={styles.streakEmoji}>🔥</Text>
            </View>
            <Text style={styles.metricSubPrimary}>days consistency</Text>
          </View>

          <View style={styles.secondaryCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabelSecondary}>GOALS ACTIVE</Text>
            </View>
            <Text style={styles.metricValueSecondary}>{summary?.total_goals_active || 0}</Text>
            <Text style={styles.metricSubSecondary}>
              {summary?.goals_completed_count || 0} completed
            </Text>
          </View>
        </View>

        {/* HABIT CONSISTENCY */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Habit consistency</Text>
            <TrendingUp size={16} color={COLORS.textMid} />
          </View>

          <View style={styles.chartContainer}>
            {summary?.habit_consistency?.map((item, index) => {
              const ratio = item.total_count > 0 ? item.completed_count / item.total_count : 0;
              return (
                <View key={index} style={styles.chartColumn}>
                  <View style={[
                    styles.chartBar,
                    {
                      height: Math.max(12, ratio * 78),
                      backgroundColor: item.is_fully_completed ? COLORS.purple : '#F1EDFF',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                    },
                  ]} />
                  <Text style={styles.chartLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* GOAL PROGRESS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Goal progress</Text>
          {summary?.goal_progress?.map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={[styles.goalPercent, { color: goal.color }]}>
                  {Math.round(goal.progress)}%
                </Text>
              </View>

              <View style={[styles.goalTrack, { backgroundColor: goal.bg_color }]}>
                <View style={[
                  styles.goalFill,
                  { width: `${goal.progress}%`, backgroundColor: goal.color }
                ]} />
              </View>
            </View>
          ))}
        </View>

        {/* MOOD TREND */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Mood trend
          </Text>

          <View style={styles.moodChart}>
            {summary?.mood_trends?.map((mood, index) => (
              <View key={index} style={styles.moodColumn}>
                <View style={[
                  styles.moodBar,
                  {
                    height: Math.max(12, mood.mood_score * 16),
                    backgroundColor: mood.mood_score >= 4 ? COLORS.purple : mood.mood_score >= 3 ? '#BBAEFF' : '#F1EDFF',
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                  }
                ]} />
                <Text style={styles.moodEmoji}>{mood.mood_emoji}</Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{ height: 120 }}
        />
      </ScrollView>

      <BottomTab activeTab="analytics" />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3FF',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F3FF',
  },

  loadingText: {
    marginTop: 18,
    fontSize: 15,
    color: COLORS.textMid,
    fontWeight: '600',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',

    paddingTop: 28,

    marginTop: 24,
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 34,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1EDFF',
    borderRadius: 999,
    padding: 4,
  },

  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  streakEmoji: {
    fontSize: 28,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },

  activeTab: {
    backgroundColor: COLORS.purple,
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMid,
  },

  activeTabText: {
    color: COLORS.white,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },

  primaryCard: {
    flex: 1,
    backgroundColor: COLORS.purple,
    borderRadius: 24,
    padding: 18,
  },

  secondaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
  },

  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  metricLabelPrimary: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },

  metricLabelSecondary: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
  },

  metricValuePrimary: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
  },

  metricSubPrimary: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  metricValueSecondary: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  metricSubSecondary: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: '500',
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom:10,
  },

  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
  },

  chartColumn: {
    alignItems: 'center',
  },

  chartBar: {
    width: 18,
    borderRadius: 10,
    marginBottom: 10,
  },

  chartLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
  },

  goalItem: {
    marginBottom: 18,
  },

  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  goalTitle: {
    fontSize: 13,
    color: COLORS.textMid,
    fontWeight: '500',
  },

  goalPercent: {
    fontSize: 12,
    fontWeight: '700',
  },

  goalTrack: {
    height: 8,
    borderRadius: 99,
    overflow: 'hidden',
  },

  goalFill: {
    height: '100%',
    borderRadius: 99,
  },

  moodChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
    paddingHorizontal: 6,
  },

  moodColumn: {
    alignItems: 'center',
  },

  moodBar: {
    width: 18,
    borderRadius: 10,
    marginBottom: 10,
  },

  moodEmoji: {
    fontSize: 16,
  },
});