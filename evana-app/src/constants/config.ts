// ================================================
// Evana App Configuration
// ================================================
// This file manages the API URL for connecting
// your Expo Go mobile app to the FastAPI backend.
//
// IMPORTANT: Both devices must be on the SAME Wi-Fi network.
// ================================================

// Your laptop's Wi-Fi IPv4 address (found via `ipconfig`)
const LOCAL_IP = '172.50.100.233';

// Backend server port (must match uvicorn --port)
const PORT = 8000;

// The base URL your app will use for all API calls
export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${LOCAL_IP}:${PORT}`;

// Convenience export for common endpoints
export const API_ENDPOINTS = {
  health: `${API_URL}/api/v1/health`,
  onboardingChat: `${API_URL}/api/v1/chat/onboarding`,
  goalSuggestions: `${API_URL}/api/v1/chat/suggestions`,
  assistantChat: `${API_URL}/api/v1/assistant/chat`,
  assistantHistory: (userId: string) => `${API_URL}/api/v1/assistant/history/${userId}`,
  assistantVoice: `${API_URL}/api/v1/assistant/voice`,
  goals: (userId: string) => `${API_URL}/api/v1/goals/${userId}`,
  createGoal: `${API_URL}/api/v1/goals/`,
  updateGoal: (goalId: string) => `${API_URL}/api/v1/goals/${goalId}`,
  habits: (userId: string) => `${API_URL}/api/v1/habits/${userId}`,
  logHabit: `${API_URL}/api/v1/habits/log`,
  createHabit: `${API_URL}/api/v1/habits/`,
  reflections: (userId: string) => `${API_URL}/api/v1/reflections/${userId}`,
  createReflection: `${API_URL}/api/v1/reflections/`,
  analytics: (userId: string, days: number = 7) => `${API_URL}/api/v1/analytics/summary/${userId}?days=${days}`,
  insights: (userId: string) => `${API_URL}/api/v1/insights/${userId}`,
  generateInsights: (userId: string) => `${API_URL}/api/v1/insights/generate/${userId}`,
} as const;
