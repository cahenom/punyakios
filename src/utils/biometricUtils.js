import RNBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

/**
 * Utility functions for biometric authentication in order processes
 */

const rnBiometrics = new RNBiometrics();

/**
 * Check if biometric authentication is available on the device
 */
export const isBiometricAvailable = async () => {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return { available, biometryType };
  } catch (error) {
    console.log('Biometric availability check failed:', error);
    return { available: false, biometryType: null };
  }
};

/**
 * Check if user has enabled biometric authentication in their profile
 */
export const isBiometricEnabled = async () => {
  try {
    const biometricEnabled = await AsyncStorage.getItem('biometric_enabled');
    return biometricEnabled === 'true';
  } catch (error) {
    console.log('Error checking biometric status:', error);
    return false;
  }
};

/**
 * Store biometric enabled status in cache
 */
export const setBiometricEnabledStatus = async (enabled) => {
  try {
    await AsyncStorage.setItem('biometric_enabled', enabled.toString());
  } catch (error) {
    console.log('Error storing biometric status:', error);
  }
};

/**
 * Perform biometric authentication
 */
export const authenticateWithBiometrics = async (promptMessage = 'Verify your identity to proceed with the transaction') => {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();

    if (!available && Platform.OS === 'ios') {
      throw new Error('Biometric sensor is not available on this device');
    }

    let biometricPromptMessage = promptMessage;
    
    if (biometryType === RNBiometrics.TouchID) {
      biometricPromptMessage = promptMessage.includes('transaction') 
        ? 'Verify your fingerprint to proceed with the transaction' 
        : promptMessage;
    } else if (biometryType === RNBiometrics.FaceID) {
      biometricPromptMessage = promptMessage.includes('transaction') 
        ? 'Verify your face to proceed with the transaction' 
        : promptMessage;
    }

    const { success, error } = await rnBiometrics.simplePrompt({
      promptMessage: biometricPromptMessage,
      cancelButtonText: 'Cancel',
      allowDeviceCredentials: true
    });

    if (success) {
      return { success: true };
    } else {
      return { success: false, error };
    }
  } catch (error) {
    console.log('Biometric authentication failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if biometric authentication is required for an order
 * Returns true if both biometric is available and enabled in user profile
 */
export const isBiometricRequiredForOrder = async () => {
  const isAvailable = await isBiometricAvailable();
  const isEnabled = await isBiometricEnabled();
  
  // On Android, we can fallback to Device PIN even if sensor is not available
  // On iOS, we currently strictly require biometric sensor availability
  if (Platform.OS === 'android') {
    return isEnabled;
  }
  
  return isAvailable.available && isEnabled;
};