// Utility wrapper untuk kompatibilitas dengan Alert.alert
// Gunakan ini untuk migrasi bertahap dari Alert.alert ke custom alert
import {Alert as RNAlert} from 'react-native';

let globalShowAlert = null;

export const setGlobalAlertHandler = (showAlertFn) => {
  globalShowAlert = showAlertFn;
};

export const Alert = {
  alert: (title, message, buttons, options) => {
    if (!globalShowAlert) {
      // Fallback to native alert if custom alert not available
      RNAlert.alert(title, message, buttons, options);
      return;
    }

    // Determine alert type based on title
    let type = 'info';
    const titleLower = title?.toLowerCase() || '';
    if (titleLower.includes('error') || titleLower.includes('gagal')) {
      type = 'error';
    } else if (titleLower.includes('success') || titleLower.includes('sukses') || titleLower.includes('berhasil')) {
      type = 'success';
    } else if (titleLower.includes('warning') || titleLower.includes('peringatan')) {
      type = 'warning';
    }

    // Convert buttons to custom alert format
    const customButtons = buttons?.map((btn) => ({
      text: btn.text,
      style: btn.style === 'cancel' ? 'secondary' : 'primary',
      onPress: btn.onPress,
    })) || [];

    globalShowAlert(title, message, type, customButtons);
  },
};
