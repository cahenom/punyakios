import notifee, { AndroidImportance } from '@notifee/react-native';

/**
 * Initialize Notifee channels
 */
export const setupNotifeeChannels = async () => {
  // Create a channel for transactions with custom sound
  await notifee.createChannel({
    id: 'transactions',
    name: 'Transaction Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'success', // Refers to res/raw/success.mp3
    vibration: true,
  });
};

/**
 * Display a local notification with sound
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
export const displayNotification = async (title, body, data = {}) => {
  // Skip if title or body is missing or empty
  if (!title || !body || title.trim() === '' || body.trim() === '') {
    console.log('Skipping notification: title or body is missing/empty', { title, body });
    return;
  }

  // Request permissions (required for iOS and Android 13+)
  await notifee.requestPermission();

  // Display a notification
  await notifee.displayNotification({
    title: title,
    body: body,
    data: data,
    android: {
      channelId: 'transactions',
      importance: AndroidImportance.HIGH,
      smallIcon: 'ic_launcher', // Use default launcher icon
      color: '#0066CC', // Professional blue
      pressAction: {
        id: 'default',
      },
      // You can also specify sound here if not specified in the channel
      sound: 'success', 
      visibility: 1, // PUBLIC
    },
  });
};
