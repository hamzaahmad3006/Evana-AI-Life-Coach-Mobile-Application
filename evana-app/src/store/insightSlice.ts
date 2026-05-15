import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../constants/config';

export interface AIInsight {
  id?: string;
  title: string;
  description: string;
  type: string;
  priority: number;
  is_read: boolean;
  created_at?: string;
}

interface InsightState {
  insights: AIInsight[];
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const initialState: InsightState = {
  insights: [],
  loading: false,
  generating: false,
  error: null,
};

export const fetchInsights = createAsyncThunk(
  'insights/fetchInsights',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.insights(userId));
      if (!response.ok) throw new Error('Failed to fetch insights');
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const generateInsights = createAsyncThunk(
  'insights/generateInsights',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.generateInsights(userId), {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate fresh insights');
      const data = await response.json();
      return data.insights;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const insightSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsights.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generateInsights.pending, (state) => {
        state.generating = true;
      })
      .addCase(generateInsights.fulfilled, (state, action) => {
        state.generating = false;
        state.insights = action.payload;
      })
      .addCase(generateInsights.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload as string;
      });
  },
});

export default insightSlice.reducer;
