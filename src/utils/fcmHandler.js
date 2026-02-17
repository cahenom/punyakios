import messaging from '@react-native-firebase/messaging';
import { displayNotification, setupNotifeeChannels } from './notifeeHelper';

// Fungsi untuk menangani notifikasi saat aplikasi dalam mode foreground
export const handleForegroundNotifications = () => {
  // Menangani notifikasi yang datang saat aplikasi dalam mode foreground
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Notifikasi diterima saat foreground:', remoteMessage);

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

  return unsubscribe;
};

// Fungsi untuk menangani notifikasi saat aplikasi dalam mode background/killed
export const setBackgroundNotificationHandler = () => {
  // Menangani notifikasi yang diklik saat aplikasi dalam mode background/killed
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Notifikasi diterima saat background/killed:', remoteMessage);
    
    // Play sound via local notification even in background
    if (remoteMessage.notification) {
        const { title, body } = remoteMessage.notification;
        await displayNotification(
          title,
          body,
          remoteMessage.data
        );
    }

    return Promise.resolve();
  });
};

// Fungsi untuk request permission dan setup semua handler
export const setupNotificationHandlers = async () => {
  try {
    // Request permission untuk notifikasi
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Izin notifikasi diberikan');
    } else {
      console.log('Izin notifikasi ditolak');
    }

    // Setup Notifee channels (for sound)
    await setupNotifeeChannels();

    // Setup handler untuk notifikasi background
    setBackgroundNotificationHandler();

    // Setup handler untuk notifikasi foreground
    const foregroundUnsubscribe = handleForegroundNotifications();

    // Kembalikan fungsi unsubscribe untuk membersihkan listener nanti jika diperlukan
    return {
      foregroundUnsubscribe,
      backgroundUnsubscribe: null // setBackgroundMessageHandler tidak perlu unsubscribe
    };
  } catch (error) {
    console.error('Error setting up notification handlers:', error);
    return null;
  }
};

// Fungsi untuk mendapatkan FCM token
export const getFcmToken = async () => {
  try {
    // Request permission untuk notifikasi
    const enabled = await requestUserPermission();

    if (!enabled) {
      console.log('Notification permission not granted');
      return null;
    }

    // Mendapatkan instance messaging service
    const messagingService = messaging();
    if (!messagingService) {
      console.log('FCM messaging service not available');
      return null;
    }

    // Mendapatkan token FCM
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

// Fungsi untuk menangani perubahan token (jika terjadi perubahan)
export const onTokenRefresh = async (callback) => {
  const messagingService = messaging();
  if (!messagingService) {
    console.log('FCM messaging service not available for token refresh');
    return null;
  }

  return messagingService.onTokenRefresh(token => {
    console.log('New FCM token:', token);
    callback(token);
  });
};

// Fungsi untuk request permission
export const requestUserPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }

    return enabled;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Fungsi untuk menangani notifikasi yang diklik
export const handleNotificationTap = async () => {
  // Mendapatkan initial notification (jika aplikasi dibuka dari notifikasi)
  const initialNotification = await messaging().getInitialNotification();
  
  if (initialNotification) {
    console.log('Aplikasi dibuka dari notifikasi:', initialNotification);
    // Lakukan sesuatu saat aplikasi dibuka dari notifikasi
    return initialNotification;
  }
  
  return null;
};