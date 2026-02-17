import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Router from './router';
import AuthProvider from './context/AuthContext';
import {AlertProvider} from './context/AlertContext';
import { useEffect } from 'react';
import { preloadAllData } from './services/preloadService';
import { handleTokenRefreshForServer } from './services/notificationService';
import initializeFirebase, { requestUserPermission } from '../firebase';
import { configurePushNotifications } from './utils/pushNotificationConfig';
import { appConfigService } from './services';
import ForceUpdateModal from './components/ForceUpdateModal';
import { version as appVersion } from '../package.json';
import notifee, { EventType } from '@notifee/react-native';

function App() {
  // Notifee foreground event listener
  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification in foreground', detail.notification);
          break;
      }
    });
  }, []);
  const [updateInfo, setUpdateInfo] = React.useState({
    visible: false,
    minVersion: '1.0.0',
    updateUrl: '',
    isMaintenance: false,
    maintenanceMessage: '',
  });

  const compareVersions = (v1, v2) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    return 0;
  };

  useEffect(() => {
    const initApp = async () => {
      // 1. Check for version update/maintenance FIRST
      let isBlocked = false;
      try {
        const config = await appConfigService.checkVersion();
        if (config.success) {
          const { min_version, update_url, is_maintenance, maintenance_message } = config.data;
          
          if (is_maintenance) {
            isBlocked = true;
            setUpdateInfo({
              visible: true,
              minVersion: min_version,
              updateUrl: update_url,
              isMaintenance: true,
              maintenanceMessage: maintenance_message,
            });
          } else if (compareVersions(appVersion, min_version) < 0) {
            isBlocked = true;
            setUpdateInfo({
              visible: true,
              minVersion: min_version,
              updateUrl: update_url,
              isMaintenance: false,
              maintenanceMessage: '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to check version:', error);
        // If the middleware blocks the request itself, handle the response data
        if (error.response && error.response.data) {
          const { is_maintenance, force_update, message, min_version, update_url } = error.response.data;
          if (is_maintenance || force_update) {
            isBlocked = true;
            setUpdateInfo({
              visible: true,
              minVersion: min_version || '1.0.0',
              updateUrl: update_url || '',
              isMaintenance: !!is_maintenance,
              maintenanceMessage: message || '',
            });
          }
        }
      }

      // 2. STOP if blocked
      if (isBlocked) {
        console.log('App blocked by version check or maintenance');
        return;
      }

      // 3. Continue initialization if not blocked
      try {
        await initializeFirebase();
        console.log('Firebase initialized successfully in App component');
        await requestUserPermission();
        configurePushNotifications();
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }

      try {
        await preloadAllData();
        console.log('All provider and product data preloaded successfully');
      } catch (error) {
        console.error('Error preloading data:', error);
      }

      try {
        const handleTokenUpdate = (newToken) => {
          console.log('FCM token updated:', newToken);
        };
        await handleTokenRefreshForServer(handleTokenUpdate);
      } catch (error) {
        console.error('Error setting up notification handlers:', error);
      }
    };

    initApp();
  }, []);

  const linking = {
    prefixes: ['saldoplus://'],
    config: {
      screens: {
        ProtectedRoute: {
          screens: {
            DepositSuccess: 'deposit/success',
            DepositFailed: 'deposit/failed',
          },
        },
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <AuthProvider>
        <AlertProvider>
          <Router />
        </AlertProvider>
      </AuthProvider>
      <ForceUpdateModal {...updateInfo} />
    </NavigationContainer>
  );
}

export default App;
