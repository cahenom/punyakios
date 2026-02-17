/**
 * @format
 */

import {AppRegistry} from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import '@react-native-firebase/app'; // Ensure Firebase is initialized
import messaging from '@react-native-firebase/messaging';
import App from './src/App';
import {name as appName} from './app.json';
import { displayNotification } from './src/utils/notifeeHelper';


// Inisialisasi Firebase secara manual untuk background/killed state
import { initializeFirebase } from './firebase';

// Latar belakang (Background/Killed) notification handler
// Harus didaftarkan di root level sesegera mungkin
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  // Tangani data-only message (pesan tanpa property notification)
  if (!remoteMessage.notification && remoteMessage.data && remoteMessage.data.title && remoteMessage.data.body) {
    console.log('Data-only background message received, displaying with Notifee');
    try {
      await displayNotification(
        remoteMessage.data.title,
        remoteMessage.data.body,
        remoteMessage.data
      );
    } catch (error) {
      console.error('Error displaying background notification:', error);
    }
  }
});

// Notifee background handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  // Check if the user pressed the notification
  if (type === EventType.PRESS && pressAction.id === 'default') {
    console.log('User pressed the notification in background/killed state', notification);
    // Navigasi biasanya ditangani oleh linking config di NavigationContainer
    // tapi kita pastikan event terdaftar agar OS tidak mematikan process
  }
});

initializeFirebase().then(() => {
  console.log('Firebase ready from background check');
}).catch(err => {
  console.error('Failed to initialize Firebase in background phase:', err);
});

AppRegistry.registerComponent(appName, () => App);
