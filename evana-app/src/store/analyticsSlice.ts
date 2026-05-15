import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../constants/config';

export interface HabitConsistency {
  day: string;
  date: string;
  completed_count: number;
  total_count: number;
  is_fully_completed: boolean;
}

export interface GoalProgress {
  id: string;
  title: string;
  progress: number;
  color: string;
  bg_color: string;
}

export interface MoodTrend {
  date: string;
  mood_score: number;
  mood_emoji: string;
}

export interface AnalyticsSummary {
  habit_streak: number;
  total_goals_active: number;
  goals_completed_count: number;
  weekly_ai_insight?: string;
  top_tags?: string[];
  habit_consistency: HabitConsistency[];
  goal_progress: GoalProgress[];
  mood_trends: MoodTrend[];
}

interface AnalyticsState {
  summary: AnalyticsSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  summary: null,
  loading: false,
  error: null,
};

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async ({ userId, days }: { userId: string; days: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.analytics(userId, days));
      if (!response.ok) throw new Error('Failed to fetch progress insights');
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default analyticsSlice.reducer;
