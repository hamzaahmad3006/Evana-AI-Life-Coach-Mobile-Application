import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ================================================
// Auth State Interface
// ================================================
type OnboardingStep = 'profile' | 'chat' | 'goals' | 'completed';

interface AuthState {
  user: (User & { full_name?: string; bio?: string; interests?: string[] }) | null;
  session: Session | null;
  loading: boolean;
  initializing: boolean;
  onboardingStep: OnboardingStep;
  currentMainScreen: 'home' | 'assistant' | 'goals' | 'habits' | 'reflections' | 'analytics' | 'insights' | 'settings' | 'journal' | 'edit-profile' | 'voice-mode';
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: false,
  initializing: true,
  onboardingStep: 'profile',
  currentMainScreen: 'home',
  chatHistory: [],
  error: null,
};

// ================================================
// Async Thunks
// ================================================

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('interests, onboarding_completed')
        .eq('id', session.user.id)
        .single();
      
      // If user deleted from DB but session persists locally
      if (error || !profile) {
        await supabase.auth.signOut();
        return { session: null, onboardingStep: 'profile' };
      }
      
      let step: OnboardingStep = 'profile';
      if (profile?.onboarding_completed) {
        step = 'completed';
      } else if (profile?.interests && profile.interests.length > 0) {
        step = 'chat';
      }
      
      return { session, onboardingStep: step };
    }
    
    return { session, onboardingStep: 'profile' };
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, fullName, age }: { email: string; password: string; fullName: string; age?: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName,
          age: age ? parseInt(age) : null
        } 
      },
    });
    if (error) return rejectWithValue(error.message);
    return data.session;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ fullName, bio, interests, age }: { fullName?: string; bio?: string; interests?: string[]; age?: string }, { rejectWithValue }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('User not found');

    const updatePayload: any = {};
    if (fullName) updatePayload.full_name = fullName;
    if (bio) updatePayload.bio = bio;
    if (interests) updatePayload.interests = interests;
    if (age) updatePayload.age = parseInt(age);

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (profileError) return rejectWithValue(profileError.message);

    // Also update auth metadata
    const metadataUpdate: any = {};
    if (fullName) metadataUpdate.full_name = fullName;
    if (age) metadataUpdate.age = parseInt(age);

    if (Object.keys(metadataUpdate).length > 0) {
      await supabase.auth.updateUser({
        data: metadataUpdate
      });
    }

    return updatePayload;
  }
);

export const completeOnboarding = createAsyncThunk(
  'auth/completeOnboarding',
  async (_, { rejectWithValue }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('User not found');

    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id);

    if (error) return rejectWithValue(error.message);
    return true;
  }
);

export const saveGoals = createAsyncThunk(
  'auth/saveGoals',
  async (goals: any[], { rejectWithValue }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('User not found');

    const goalsToInsert = goals.map(g => ({
      user_id: user.id,
      title: g.title,
      category: g.category,
      description: g.description,
      status: 'active',
      target_date: g.target_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Default 3 months
    }));

    const { error } = await supabase.from('goals').insert(goalsToInsert);
    if (error) return rejectWithValue(error.message);
    
    return true;
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return rejectWithValue(error.message);
    return data.session;
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    await supabase.auth.signOut();
  }
);

// ================================================
// Auth Slice
// ================================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      if (action.payload?.user) {
        state.user = {
          ...action.payload.user,
          full_name: action.payload.user.user_metadata?.full_name,
        };
      } else {
        state.user = null;
      }
    },
    setOnboardingStep: (state, action: PayloadAction<OnboardingStep>) => {
      state.onboardingStep = action.payload;
    },
    setChatHistory: (state, action: PayloadAction<{ role: 'user' | 'assistant'; content: string }[]>) => {
      state.chatHistory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setMainScreen: (state, action: PayloadAction<AuthState['currentMainScreen']>) => {
      state.currentMainScreen = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Initialize
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.session = action.payload.session;
      state.user = action.payload.session?.user ?? null;
      state.onboardingStep = action.payload.onboardingStep;
      state.initializing = false;
    });
    builder.addCase(initializeAuth.rejected, (state) => {
      state.initializing = false;
    });

    // Sign Up
    builder.addCase(signUp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.loading = false;
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
      state.onboardingStep = 'profile'; 
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      if (state.user) {
        state.user = {
          ...state.user,
          full_name: action.payload.full_name || state.user.full_name,
          bio: action.payload.bio || state.user.bio,
          interests: action.payload.interests || state.user.interests,
          age: action.payload.age || state.user.age,
        };
      }
      // Transition to chat onboarding step
      state.onboardingStep = 'chat';
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Complete Onboarding
    builder.addCase(completeOnboarding.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(completeOnboarding.fulfilled, (state) => {
      state.loading = false;
      state.onboardingStep = 'completed';
    });
    builder.addCase(completeOnboarding.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Save Goals
    builder.addCase(saveGoals.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(saveGoals.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(saveGoals.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sign In
    builder.addCase(signIn.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.loading = false;
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sign Out
    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
      state.session = null;
      state.error = null;
    });
  },
});

export const { setSession, clearError, setOnboardingStep, setChatHistory, setMainScreen } = authSlice.actions;
export default authSlice.reducer;
