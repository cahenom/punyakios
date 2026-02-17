import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './const';
import { Alert } from './alert';
import { Platform } from 'react-native';
import { version as appVersion } from '../../package.json';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

api.interceptors.request.use(async config => {
  if (!authToken) {
    authToken = await AsyncStorage.getItem('token');
  }
  if (authToken) {
    config.headers.Authorization = 'Bearer ' + authToken;
  }
  
  // Add App Version and Platform headers
  config.headers['X-App-Version'] = appVersion;
  config.headers['X-App-Platform'] = Platform.OS;
  
  return config;
});

// Response interceptor to handle all API errors globally
api.interceptors.response.use(
  (response) => {
    // If the response is successful, return it as is
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with an error status (4xx, 5xx)
      console.log('Server Error:', error.response.status, error.response.data);
      if (error.response.status === 429) {
        // Handle rate limiting silently or with a specific message if needed
        return Promise.reject(error);
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
