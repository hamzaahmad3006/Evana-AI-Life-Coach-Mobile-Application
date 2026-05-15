import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../constants/config';

export interface Reflection {
  id: string;
  user_id: string;
  content: string;
  mood: string;
  ai_summary?: string;
  ai_analysis?: {
    sentiment_score: number;
    primary_emotion: string;
    coaching_note: string;
    tags: string[];
    intensity: string;
  };
  created_at: string;
}

interface ReflectionState {
  reflections: Reflection[];
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: ReflectionState = {
  reflections: [],
  loading: false,
  creating: false,
  error: null,
};

export const fetchReflections = createAsyncThunk(
  'reflections/fetchReflections',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.reflections(userId));
      if (!response.ok) throw new Error('Failed to fetch journal entries');
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addReflection = createAsyncThunk(
  'reflections/addReflection',
  async (reflectionData: { userId: string; content: string; mood: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.createReflection, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: reflectionData.userId,
          content: reflectionData.content,
          mood: reflectionData.mood
        }),
      });
      if (!response.ok) throw new Error('Failed to save reflection');
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const reflectionSlice = createSlice({
  name: 'reflections',
  initialState,
  reducers: {
    clearReflectionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReflections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReflections.fulfilled, (state, action) => {
        state.loading = false;
        state.reflections = action.payload;
      })
      .addCase(fetchReflections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addReflection.pending, (state) => {
        state.creating = true;
      })
      .addCase(addReflection.fulfilled, (state, action) => {
        state.creating = false;
        state.reflections.unshift(action.payload);
      })
      .addCase(addReflection.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReflectionError } = reflectionSlice.actions;
export default reflectionSlice.reducer;
