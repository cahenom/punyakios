import {getFcmToken, onTokenRefresh} from '../utils/notifications';
import {api} from '../utils/api';
import { configurePushNotifications } from '../utils/pushNotificationConfig';

// Fungsi untuk mendapatkan FCM token dan menambahkannya ke data permintaan
export const addFcmTokenToRequest = async (requestData) => {
  try {
    const fcmToken = await getFcmToken();

    if (fcmToken) {
      // Tambahkan FCM token ke data permintaan
      return {
        ...requestData,
        fcm_token: fcmToken
      };
    }

    return requestData;
  } catch (error) {
    console.error('Error getting FCM token for request:', error);
    // Kembalikan data permintaan asli jika gagal mendapatkan FCM token
    return requestData;
  }
};

// Fungsi untuk menangani refresh token dan mengirimnya ke server saat login
export const handleTokenRefreshForServer = async (onTokenUpdate) => {
  try {
    // Dengarkan perubahan token dan panggil fungsi callback jika terjadi perubahan
    const unsubscribe = await onTokenRefresh(async (newToken) => {
      try {
        // Panggil fungsi callback dengan token baru
        if (onTokenUpdate && typeof onTokenUpdate === 'function') {
          await onTokenUpdate(newToken);
        }
      } catch (error) {
        console.error('Error in token update callback:', error);
      }
    });

    // Return fungsi unsubscribe untuk membersihkan listener nanti jika diperlukan
    return unsubscribe;
  } catch (error) {
    // Jangan lemparkan error karena ini bukan fungsi utama
    console.warn('Warning: Error setting up token refresh handler:', error.message);
    return null;
  }
};