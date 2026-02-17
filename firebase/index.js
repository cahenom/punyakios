import { firebase } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import { NativeModules } from 'react-native';

// Helper delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// Fungsi untuk inisialisasi Firebase
export async function initializeFirebase() {
  try {
    // Di RN Firebase v21+, auto-initialization dari google-services.json
    // biasanya sudah cukup. Kita cek dulu apakah sudah ada app.
    if (firebase.apps && firebase.apps.length > 0) {
      console.log('Firebase apps detected:', firebase.apps.map(a => a.name));
      return firebase.app();
    }
    
    // Jika belum ada, kemungkinan native auto-init belum siap atau gagal.
    // Kita coba inisialisasi manual menggunakan config.
    console.log('No Firebase app detected, attempting manual initialization...');
    
    const firebaseConfig = {
      apiKey: "AIzaSyCkVYuurbpSC1ZD4mPr6WpcRhn13_Ab2sE",
      appId: "1:538126065836:android:4012fed34e67fbb436ff09",
      messagingSenderId: "538126065836",
      projectId: "punya-kios",
      storageBucket: "punya-kios.firebasestorage.app",
      databaseURL: "https://punya-kios-default-rtdb.firebaseio.com"
    };
    
    if (firebase.initializeApp) {
      const app = await firebase.initializeApp(firebaseConfig);
      console.log('Firebase manual initialization successful');
      return app;
    } else {
      console.error('CRITICAL: firebase.initializeApp is undefined. Library might be misconfigured.');
      return null;
    }
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('Firebase app already exists, returning existing instance');
      return firebase.app();
    }
    console.error('Firebase initialization error:', error.message);
    return null;
  }
}

// Getter untuk messaging service
export async function getMessagingService() {
  try {
    const appInstance = await initializeFirebase();
    if (!appInstance) {
      console.error('Firebase app instance not available for messaging');
      return null;
    }
    
    // Beri waktu agar native module sinkron (Bridgeless mode)
    await delay(1000);

    // Diagnostic logging untuk native bridge
    console.log('Native Bridge Status:', {
      RNFirebaseMessaging: !!NativeModules.RNFirebaseMessaging,
      RNFBMessagingModule: !!NativeModules.RNFBMessagingModule,
      firebaseModules: Object.keys(NativeModules).filter(k => k.toLowerCase().includes('firebase') || k.toLowerCase().includes('fb'))
    });
    
    // Gunakan instance app spesifik
    const messagingInstance = messaging(appInstance);
    if (!messagingInstance) {
      console.error('messaging(appInstance) returned null');
      return null;
    }

    // Cek ketersediaan metode native
    if (messagingInstance.native) {
       console.log('Messaging native object found. Methods:', Object.keys(messagingInstance.native));
       if (!messagingInstance.native.getToken) {
          console.error('CRITICAL: getToken is MISSING from native object');
       }
    } else {
       console.warn('messagingInstance.native is undefined. Bridge state unknown.');
    }

    return messagingInstance;
  } catch (error) {
    console.error('Error getting messaging service:', error);
    return null;
  }
}

// Request permission for notifications
export async function requestUserPermission() {
  try {
    const messagingService = await getMessagingService();
    if (!messagingService) {
      console.warn('Firebase messaging not available, skipping permission request');
      return false;
    }

    const authStatus = await messagingService.requestPermission();
    // 1: AUTHORIZED, 2: PROVISIONAL
    const enabled = authStatus === 1 || authStatus === 2;

    if (enabled) {
      console.log('Notification permission granted (status):', authStatus);
    }

    return enabled;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export default initializeFirebase;