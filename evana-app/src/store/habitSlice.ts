import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../constants/config';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  emoji: string;
  bg_color: string;
  frequency: 'daily' | 'weekly';
  streak_count: number;
  is_completed_today: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  logged_at: string;
  status: boolean;
}

interface HabitState {
  habits: Habit[];
  globalStreak: number;
  weeklyLogs: HabitLog[];
  loading: boolean;
  togglingHabitId: string | null;
  error: string | null;
}

const initialState: HabitState = {
  habits: [],
  globalStreak: 0,
  weeklyLogs: [],
  loading: false,
  togglingHabitId: null,
  error: null,
};

export const fetchHabits = createAsyncThunk(
  'habits/fetchHabits',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.habits(userId));
      if (!response.ok) throw new Error('Failed to fetch habits');
      const data = await response.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchWeeklyLogs = createAsyncThunk(
  'habits/fetchWeeklyLogs',
  async ({ userId, startDate, endDate }: { userId: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/habits/logs/${userId}?start_date=${startDate}&end_date=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch weekly logs');
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleHabitStatus = createAsyncThunk(
  'habits/toggleStatus',
  async ({ habitId, userId, status }: { habitId: string; userId: string; status: boolean }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.logHabit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit_id: habitId,
          user_id: userId,
          logged_at: new Date().toISOString().split('T')[0],
          status: status
        }),
      });
      if (!response.ok) throw new Error('Failed to log habit');
      
      // Refetch habits to get the true calculated streak from the server
      const habitsRes = await fetch(API_ENDPOINTS.habits(userId));
      const dashboardData = await habitsRes.json();
      return { habitId, status, dashboardData };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createHabit = createAsyncThunk(
  'habits/createHabit',
  async (habitData: any, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.createHabit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      });
      if (!response.ok) throw new Error('Failed to create habit');
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const habitSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload.habits;
        state.globalStreak = action.payload.global_streak;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWeeklyLogs.fulfilled, (state, action) => {
        state.weeklyLogs = action.payload;
      })
      .addCase(toggleHabitStatus.pending, (state, action) => {
        state.togglingHabitId = action.meta.arg.habitId;
      })
      .addCase(toggleHabitStatus.fulfilled, (state, action) => {
        state.habits = action.payload.dashboardData.habits;
        state.globalStreak = action.payload.dashboardData.global_streak;
        state.togglingHabitId = null;
      })
      .addCase(toggleHabitStatus.rejected, (state, action) => {
        state.togglingHabitId = null;
        state.error = action.payload as string;
      })
      .addCase(createHabit.fulfilled, (state, action) => {
        state.habits.unshift(action.payload);
      });
  },
});

export default habitSlice.reducer;
