import { useEffect, useContext } from 'react';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  onMessage,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { showMessage } from 'react-native-flash-message';
import { AppContext } from '../contexts/AppContext';
import { PushNotificationType } from '../models/enums/Notifications';

export default function NotificationListener() {
  const { setNodeInitStatus } = useContext(AppContext);

  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    const requestPermission = async () => {
      try {
        const authStatus = await messaging.requestPermission();
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('Notification permission not granted');
        }
      } catch (err) {
        console.warn('Permission request failed:', err);
      }
    };

    requestPermission();
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      const { title, body } = remoteMessage.notification ?? {};
      const { type } = remoteMessage.data ?? {};

      showMessage({
        message: title ?? 'Notification',
        description: body ?? '',
        type: 'info',
        icon: 'auto',
        duration: 4000,
      });

      switch (type?.toLowerCase()) {
        case PushNotificationType.NODE_INIT_COMPLETE:
          setNodeInitStatus(false);
          break;
        case PushNotificationType.NODE_PAUSED:
          // handle pause state
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
