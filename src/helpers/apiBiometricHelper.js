import {Alert} from '../utils/alert';
import {api} from '../utils/api';
import {
  isBiometricRequiredForOrder,
  authenticateWithBiometrics,
} from '../utils/biometricUtils';

/**
 * Helper function to make API calls with optional biometric authentication
 * @param {string} endpoint - The API endpoint to call
 * @param {object} data - The data to send with the request
 * @param {string} method - The HTTP method (default: 'POST')
 * @param {string} biometricPrompt - The prompt message for biometric authentication
 * @param {boolean} requireBiometric - Whether biometric authentication is required (default: true for order endpoints)
 * @returns {Promise<any>} - The API response data
 */
export const makeApiCallWithBiometric = async (
  endpoint,
  data,
  method = 'POST',
  biometricPrompt = 'Verify your identity to proceed with the transaction',
  requireBiometric = shouldRequireBiometric(endpoint),
) => {
  // Check if biometric authentication is required for this endpoint
  if (requireBiometric) {
    const isBiometricRequired = await isBiometricRequiredForOrder();

    if (isBiometricRequired) {
      const authResult = await authenticateWithBiometrics(biometricPrompt);

      if (!authResult.success) {
        if (
          authResult.error !== 'user_cancel' &&
          authResult.error !== 'userfallback'
        ) {
          Alert.alert('Gagal', 'Verifikasi biometrik gagal ');
        }
        throw new Error('Biometric authentication failed');
      }
    }
  }

  try {
    let response;

    console.log(`[API DEBUG] Calling ${endpoint} [${method.toUpperCase()}]`);
    if (data) {
      console.log(`[API DEBUG] Payload:`, JSON.stringify(data, null, 2));
    }

    if (method.toUpperCase() === 'GET') {
      response = await api.get(endpoint);
    } else if (method.toUpperCase() === 'POST') {
      response = await api.post(endpoint, data);
    } else if (method.toUpperCase() === 'PUT') {
      response = await api.put(endpoint, data);
    } else if (method.toUpperCase() === 'DELETE') {
      response = await api.delete(endpoint);
    } else {
      // Default to POST if method is not recognized
      response = await api.post(endpoint, data);
    }

    console.log(`[API DEBUG] Response for ${endpoint}:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(`[API DEBUG] API call failed for ${endpoint}:`, error);
    if (error.response) {
      console.error(`[API DEBUG] Error response:`, JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

/**
 * Determines if biometric authentication should be required based on the endpoint
 * @param {string} endpoint - The API endpoint
 * @returns {boolean} - Whether biometric authentication should be required
 */
const shouldRequireBiometric = endpoint => {
  // Require biometric for order-related endpoints
  const orderEndpoints = [
    '/api/order/topup',
    '/api/order/cek-tagihan',
    '/api/order/bayar-tagihan',
    '/api/payment/pulsa',
    '/api/payment/pln',
    '/api/payment/plnpascabayan',
    '/api/payment/listrik',
    '/api/payment/pdam',
    '/api/payment/internet',
    '/api/payment/tv',
    '/api/payment/bpjs',
    '/api/payment/emoney',
    '/api/payment/voucher',
    '/api/payment/games',
    '/api/payment/masaaktif',
  ];

  return orderEndpoints.some(
    orderEndpoint =>
      endpoint
        .toLowerCase()
        .includes(orderEndpoint.replace('/api/order/', '')) ||
      endpoint === orderEndpoint,
  );
};

/**
 * Specific helper for topup endpoints
 */
export const makeTopupCall = async (
  data,
  biometricPrompt = 'Verify your identity to proceed with the topup',
) => {
  return makeApiCallWithBiometric(
    '/api/order/topup',
    data,
    'POST',
    biometricPrompt,
    true, // Always require biometric for topup
  );
};

/**
 * Specific helper for cek-tagihan endpoints
 */
export const makeCekTagihanCall = async (
  data,
  biometricPrompt = 'Verify your identity to check the bill',
) => {
  return makeApiCallWithBiometric(
    '/api/order/cek-tagihan',
    data,
    'POST',
    biometricPrompt,
    true, // Always require biometric for cek-tagihan
  );
};

/**
 * Specific helper for bayar-tagihan endpoints
 */
export const makeBayarTagihanCall = async (
  data,
  biometricPrompt = 'Verify your identity to pay the bill',
) => {
  return makeApiCallWithBiometric(
    '/api/order/bayar-tagihan',
    data,
    'POST',
    biometricPrompt,
    true, // Always require biometric for bayar-tagihan
  );
};

/**
 * Generic helper for payment endpoints
 */
export const makePaymentCall = async (
  endpoint,
  data,
  biometricPrompt = 'Verify your identity to proceed with the payment',
) => {
  return makeApiCallWithBiometric(
    endpoint,
    data,
    'POST',
    biometricPrompt,
    true, // Always require biometric for payment endpoints
  );
};
