import { displayNotification, setupNotifeeChannels } from './notifeeHelper';
import { getMessagingService } from '../../firebase/index';

/**
 * Configure push notification handlers
 */
export const configurePushNotifications = async () => {
  // Setup Notifee channels for sound
  setupNotifeeChannels();

  try {
    const messagingService = await getMessagingService();
    if (!messagingService) {
      console.warn('Messaging service not available for configuration');
      return null;
    }

    // Handle foreground messages (when app is active)
    const unsubscribeForeground = messagingService.onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);

      // Show local notification with sound via Notifee
      if (remoteMessage.notification) {
        const { title, body } = remoteMessage.notification;
        await displayNotification(
          title,
          body,
          remoteMessage.data
        );
      }
    });

    // Handle notification tap (when user taps on notification)
    const unsubscribeNotificationTap = messagingService.onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
    });

    // Handle app launch from terminated state via notification
    const initialNotification = await messagingService.getInitialNotification();
    if (initialNotification) {
      console.log('Notification caused app to open from quit state:', initialNotification);
    }

    // Return unsubscribe functions to clean up when needed
    return {
      unsubscribeForeground,
      unsubscribeNotificationTap,
    };
  } catch (error) {
    console.error('Error configuring push notifications:', error);
    return null;
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async () => {
  try {
    const messagingService = await getMessagingService();
    if (!messagingService) return false;

    const authStatus = await messagingService.requestPermission();
    const enabled =
       authStatus === 1 || // AUTHORIZED
       authStatus === 2;   // PROVISIONAL

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }

    return enabled;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Get FCM token
 */
export const getFcmToken = async () => {
  try {
    const messagingService = await getMessagingService();
    if (!messagingService) return null;

    const enabled = await requestNotificationPermission();
    if (!enabled) {
      console.log('Notification permission not granted');
      return null;
    }

    const fcmToken = await messagingService.getToken();

    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      return fcmToken;
    } else {
      console.log('Failed to get FCM token');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};