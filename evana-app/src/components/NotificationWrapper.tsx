import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setPushToken, addNotification } from '../store/notificationSlice';
import { setMainScreen } from '../store/authSlice';
import { NotificationService } from '../services/NotificationService';
import { supabase } from '../lib/supabase';

interface NotificationWrapperProps {
  children: React.ReactNode;
}

export const NotificationWrapper: React.FC<NotificationWrapperProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // 1. Register for Push Notifications
    if (user?.id) {
      NotificationService.registerForPushNotificationsAsync().then(token => {
        if (token) {
          dispatch(setPushToken(token));
          // Save token to Supabase
          supabase.from('profiles').update({ expo_push_token: token }).eq('id', user.id);
        }
      });
    }

    // 2. Handle Notifications when app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      dispatch(addNotification(notification));
    });

    // 3. Handle when user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('User tapped on notification:', data);
      
      if (data?.type === 'milestone') {
        dispatch(setMainScreen('goals'));
      } else if (data?.type === 'streak') {
        dispatch(setMainScreen('habits'));
      } else if (data?.screen) {
        dispatch(setMainScreen(data.screen));
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user?.id]);

  return <>{children}</>;
};
