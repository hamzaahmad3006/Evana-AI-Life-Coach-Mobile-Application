import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../constants/config';

export interface Goal {
  id: string;
  title: str;
  description?: string;
  category: string;
  target_date: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
}

interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalState = {
  goals: [],
  loading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.goals(userId));
      if (!response.ok) throw new Error('Failed to fetch goals');
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateGoalProgress = createAsyncThunk(
  'goals/updateProgress',
  async ({ goalId, progress }: { goalId: string; progress: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.updateGoal(goalId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      });
      if (!response.ok) throw new Error('Failed to update goal');
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateGoalProgress.fulfilled, (state, action) => {
        const index = state.goals.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      });
  },
});

export default goalSlice.reducer;
