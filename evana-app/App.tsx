import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { Provider } from 'react-redux';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import {
  store,
  useAppDispatch,
  useAppSelector,
} from './src/store/store';

import {
  initializeAuth,
  setSession,
} from './src/store/authSlice';

import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignUpScreen } from './src/screens/auth/SignUpScreen';
import { HomeScreen } from './src/screens/main/HomeScreen';
import { GoalDashboardScreen } from './src/screens/main/GoalDashboardScreen';
import { HabitTrackerScreen } from './src/screens/main/HabitTrackerScreen';
import { SettingsScreen } from './src/screens/main/SettingsScreen';
import { ReflectionJournalScreen } from './src/screens/main/ReflectionJournalScreen';
import { AnalyticsScreen } from './src/screens/main/AnalyticsScreen';
import { InsightsScreen } from './src/screens/main/InsightsScreen';
import { VoiceAssistantScreen } from './src/screens/main/VoiceAssistantScreen';

import { COLORS } from './src/constants/theme';

import { supabase } from './src/lib/supabase';

import { ProfileSetupScreen } from './src/screens/onboarding/ProfileSetupScreen';
import { OnboardingChatScreen } from './src/screens/onboarding/OnboardingChatScreen';
import { GoalSuggestionsScreen } from './src/screens/onboarding/GoalSuggestionsScreen';
import { ChatScreen } from './src/screens/main/ChatScreen';
import { NotificationWrapper } from './src/components/NotificationWrapper';
import { EditProfileScreen } from './src/screens/main/EditProfileScreen';

// ================================================
// App Navigator
// ================================================
const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    user,
    initializing,
    onboardingStep,
    currentMainScreen,
  } = useAppSelector((state) => state.auth);

  const [screen, setScreen] = useState<
    'login' | 'signup'
  >('login');

  useEffect(() => {
    dispatch(initializeAuth());

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        dispatch(setSession(session));
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch]);

  // Loading State
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.purple}
        />

        <Text style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  if (user) {
    if (onboardingStep === 'profile') return <ProfileSetupScreen />;
    if (onboardingStep === 'chat') return <OnboardingChatScreen />;
    if (onboardingStep === 'goals') return <GoalSuggestionsScreen />;
    
    // Main Authenticated Screens
    if (currentMainScreen === 'voice-mode') {
      return <VoiceAssistantScreen />;
    }

    if (currentMainScreen === 'assistant') {
      return <ChatScreen />;
    }

    if (currentMainScreen === 'goals') {
      return <GoalDashboardScreen />;
    }

    if (currentMainScreen === 'habits') {
      return <HabitTrackerScreen />;
    }

    if (currentMainScreen === 'settings') {
      return <SettingsScreen />;
    }

    if (currentMainScreen === 'edit-profile') {
      return <EditProfileScreen />;
    }

    if (currentMainScreen === 'journal') {
      return <ReflectionJournalScreen />;
    }

    if (currentMainScreen === 'analytics') {
      return <AnalyticsScreen />;
    }

    if (currentMainScreen === 'insights') {
      return <InsightsScreen />;
    }

    return <HomeScreen />;
  }

  // Guest Flow
  if (screen === 'signup') {
    return (
      <SignUpScreen
        onNavigateToLogin={() =>
          setScreen('login')
        }
      />
    );
  }

  return (
    <LoginScreen
      onNavigateToSignUp={() =>
        setScreen('signup')
      }
    />
  );
};

// ================================================
// App Root
// ================================================
export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NotificationWrapper>
          <AppNavigator />
        </NotificationWrapper>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E0FF',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.purple,
    fontWeight: '600',
  },
});