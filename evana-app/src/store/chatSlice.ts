import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../constants/config';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};

// Thunk to fetch chat history
export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.assistantHistory(userId));
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      return data as ChatMessage[];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk to send a message to the assistant
export const sendAssistantMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ userId, message }: { userId: string; message: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.assistantChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      const data = await response.json();
      
      return {
        userMsg: { id: Date.now().toString(), role: 'user', content: message } as ChatMessage,
        aiMsg: { id: data.id, role: 'assistant', content: data.message, created_at: data.created_at } as ChatMessage
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChat: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch History
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action: PayloadAction<ChatMessage[]>) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Send Message
      .addCase(sendAssistantMessage.pending, (state, action) => {
        state.loading = true;
        // Optimistically add user message
        if (action.meta?.arg?.message) {
          state.messages.push({
            id: 'temp-' + Date.now().toString(),
            role: 'user',
            content: action.meta.arg.message,
          });
        }
      })
      .addCase(sendAssistantMessage.fulfilled, (state, action) => {
        state.loading = false;
        // Remove optimistic user message
        state.messages = state.messages.filter(msg => !msg.id.startsWith('temp-'));
        state.messages.push(action.payload.userMsg);
        state.messages.push(action.payload.aiMsg);
      })
      .addCase(sendAssistantMessage.rejected, (state, action) => {
        state.loading = false;
        // Remove optimistic user message on error
        state.messages = state.messages.filter(msg => !msg.id.startsWith('temp-'));
        state.error = action.payload as string;
      });
  },
});

export const { clearChat } = chatSlice.actions;
export default chatSlice.reducer;
