import {getMessagingService, requestUserPermission} from '../../firebase/index';

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
    const messagingService = await getMessagingService();
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
  const messagingService = await getMessagingService();
  if (!messagingService) {
    console.log('FCM messaging service not available for token refresh');
    return null;
  }

  return messagingService.onTokenRefresh(token => {
    console.log('New FCM token:', token);
    callback(token);
  });
};