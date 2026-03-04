import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './const';
import { Alert } from './alert';
import { Platform } from 'react-native';
import { version as appVersion } from '../../package.json';
import CryptoJS from 'crypto-js';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let authToken = null;
let deviceId = null;

export const setAuthToken = (token) => {
  authToken = token;
};

api.interceptors.request.use(async config => {
  // 1. Get Auth Token
  if (!authToken) {
    authToken = await AsyncStorage.getItem('token');
  }
  if (authToken) {
    config.headers.Authorization = 'Bearer ' + authToken;
  }
  
  // 2. Get/Create Device ID
  if (!deviceId) {
    deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'DPK-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('device_id', deviceId);
    }
  }

  // 3. Security Headers
  const timestamp = Math.floor(Date.now() / 1000);
  const method = (config.method || 'GET').toUpperCase();
  // Ensure path matches Laravel's $request->path() (usually no leading slash)
  const path = (config.url || '').replace(/^\//, '');
  const payload = config.data ? JSON.stringify(config.data) : '';
  
  const secret = 'PunyaKiosSecretKey2026!';
  const dataToSign = `${method}|${path}|${timestamp}|${payload}`;
  const signature = CryptoJS.HmacSHA256(dataToSign, secret).toString(CryptoJS.enc.Hex);

  config.headers['X-App-Version'] = appVersion;
  config.headers['X-App-Platform'] = Platform.OS;
  config.headers['X-Device-ID'] = deviceId;
  config.headers['X-Timestamp'] = timestamp;
  config.headers['X-Signature'] = signature;
  
  return config;
});

// Response interceptor to handle all API errors globally
api.interceptors.response.use(
  (response) => {
    // If the response is successful, return it as is
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Temporarily swap authToken for refresh token to make the refresh request
          const oldAuthToken = authToken;
          setAuthToken(refreshToken);
          
          const response = await api.post('/api/auth/refresh');
          
          if (response.data?.status === 'success') {
            const newToken = response.data.data.token;
            
            // Save new access token
            await AsyncStorage.setItem('token', newToken);
            setAuthToken(newToken);
            
            // Update original request header and retry
            originalRequest.headers.Authorization = 'Bearer ' + newToken;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log('Failed to refresh token:', refreshError);
        // If refresh fails, tokens are probably invalid or expired
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
        setAuthToken(null);
        // We can't easily trigger navigation from here, but the app state will react to token being null
      }
    }

    // Handle other types of errors
    if (error.response) {
      // Server responded with an error status (4xx, 5xx)
      console.log('Server Error:', error.response.status, error.response.data);
      
      if (error.response.status === 429) {
        // Handle rate limiting silently
        return Promise.reject(error);
      }

      // Show error message from server if available
      const serverMessage = error.response.data?.message;
      if (serverMessage) {
        Alert.alert('Server Error', serverMessage);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.log('Network Error: No response received', error.request);
      Alert.alert('Error', 'kesalahan gagal terhubung ke server');
    } else {
      // Something else happened while setting up the request
      console.log('Request Setup Error:', error.message);
      Alert.alert('Error', 'kesalahan gagal terhubung ke server');
    }

    // Return the error to the calling function so it can be handled locally if needed
    return Promise.reject(error);
  }
);
