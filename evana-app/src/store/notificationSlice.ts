import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  pushToken: string | null;
  permissionsGranted: boolean;
  notifications: any[];
}

const initialState: NotificationState = {
  pushToken: null,
  permissionsGranted: false,
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setPushToken: (state, action: PayloadAction<string | null>) => {
      state.pushToken = action.payload;
      state.permissionsGranted = !!action.payload;
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { setPushToken, addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
