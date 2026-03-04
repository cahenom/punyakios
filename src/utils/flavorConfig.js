import { NativeModules } from 'react-native';

const { AppConfig } = NativeModules;

/**
 * Returns the current build flavor of the application.
 * Values can be 'user', 'admin', or 'merchant'.
 */
export const getAppFlavor = () => {
  return AppConfig ? AppConfig.APP_FLAVOR : 'user'; // Fallback to 'user'
};

export const isUserVersion = () => getAppFlavor() === 'user';
export const isAdminVersion = () => getAppFlavor() === 'admin';
export const isMerchantVersion = () => getAppFlavor() === 'merchant';
