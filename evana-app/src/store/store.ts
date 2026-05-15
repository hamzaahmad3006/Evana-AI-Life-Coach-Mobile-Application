import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import goalReducer from './goalSlice';
import habitReducer from './habitSlice';
import reflectionReducer from './reflectionSlice';
import analyticsReducer from './analyticsSlice';
import insightReducer from './insightSlice';
import notificationReducer from './notificationSlice';

// ================================================
// Redux Store Configuration
// ================================================
export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    goals: goalReducer,
    habits: habitReducer,
    reflections: reflectionReducer,
    analytics: analyticsReducer,
    insights: insightReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Supabase User/Session objects contain non-serializable values
        ignoredActions: [
          'auth/initialize/fulfilled',
          'auth/signUp/fulfilled',
          'auth/signIn/fulfilled',
        ],
        ignoredPaths: ['auth.user', 'auth.session'],
      },
    }),
});

// ================================================
// Typed Hooks — Use these instead of plain useDispatch/useSelector
// ================================================
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
