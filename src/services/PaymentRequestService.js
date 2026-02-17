import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { api } from '../utils/api'; // Menggunakan instance axios yang sudah dikonfigurasi
import { API_URL } from '../utils/const';

class PaymentRequestService {
  constructor() {
    this.baseURL = API_URL; // API_URL dari konstanta
  }

  // Mendapatkan token FCM dan menyimpannya ke backend
  async registerFCMToken() {
    try {
      const token = await messaging().getToken();

      // Instance api sudah dikonfigurasi dengan interceptor untuk token
      await api.post('/api/fcm/token', { fcm_token: token });

      console.log('FCM Token registered successfully');
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }

  // Mendapatkan permintaan pembayaran yang tertunda
  async getPendingPaymentRequests() {
    try {
      // Instance api sudah dikonfigurasi dengan interceptor untuk token
      const response = await api.get('/api/payment-requests/pending');

      console.log('Payment requests response:', response.data); // Debug log

      // Ensure the response contains the expected data structure
      if (response.data && response.data.data && Array.isArray(response.data.data.payment_requests)) {
        // Standard API response structure: {code: 200, data: {payment_requests: [...]}, message: "...", status: true}
        return response.data.data.payment_requests;
      } else if (response.data && Array.isArray(response.data.payment_requests)) {
        // Alternative structure where payment_requests is directly in data
        return response.data.payment_requests;
      } else if (Array.isArray(response.data)) {
        // If the response data is directly an array
        return response.data;
      } else {
        // If the expected structure isn't present, return an empty array
        console.warn('Unexpected response structure for payment requests:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error getting pending payment requests:', error);
      throw error;
    }
  }

  // Menyetujui permintaan pembayaran
  async approvePaymentRequest(requestId) {
    console.log('Attempting to approve payment request with ID:', requestId); // Debug log
    try {
      // Instance api sudah dikonfigurasi dengan interceptor untuk token
      const response = await api.post(`/api/payment-requests/${requestId}/approve`, {});

      console.log('Approve payment response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error approving payment request:', error);
      throw error;
    }
  }

  // Menolak permintaan pembayaran
  async rejectPaymentRequest(requestId) {
    console.log('Attempting to reject payment request with ID:', requestId); // Debug log
    try {
      // Instance api sudah dikonfigurasi dengan interceptor untuk token
      const response = await api.post(`/api/payment-requests/${requestId}/reject`, {});

      console.log('Reject payment response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error rejecting payment request:', error);
      throw error;
    }
  }

  // Menginisialisasi layanan notifikasi
  initializeNotificationListener(navigation) {
    // Handle notification when app is in foreground
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);

      // Navigate to payment page when notification is received
      if (remoteMessage.data && remoteMessage.data.type === 'payment_request') {
        navigation.navigate('PaymentPage', {
          paymentRequest: {
            id: remoteMessage.data.payment_request_id, // Use the internal ID for API calls
            name: remoteMessage.data.name,
            external_id: remoteMessage.data.payment_id,
            destination: remoteMessage.data.destination,
            price: remoteMessage.data.price,
            email: remoteMessage.data.email,
          }
        });
      }
    });

    // Handle notification when app is opened from background/killed state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);

      if (remoteMessage.data && remoteMessage.data.type === 'payment_request') {
        navigation.navigate('PaymentPage', {
          paymentRequest: {
            id: remoteMessage.data.payment_request_id, // Use the internal ID for API calls
            name: remoteMessage.data.name,
            external_id: remoteMessage.data.payment_id,
            destination: remoteMessage.data.destination,
            price: remoteMessage.data.price,
            email: remoteMessage.data.email,
          }
        });
      }
    });

    // Check if app was opened from a notification when initially launched
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage && remoteMessage.data && remoteMessage.data.type === 'payment_request') {
          console.log('App opened from notification:', remoteMessage);
          navigation.navigate('PaymentPage', {
            paymentRequest: {
              id: remoteMessage.data.payment_request_id, // Use the internal ID for API calls
              name: remoteMessage.data.name,
              external_id: remoteMessage.data.payment_id,
              destination: remoteMessage.data.destination,
              price: remoteMessage.data.price,
              email: remoteMessage.data.email,
            }
          });
        }
      });
  }
}

export default new PaymentRequestService();