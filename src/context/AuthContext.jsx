import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api, setAuthToken} from '../utils/api'; // Import the API utility and setter
import {Alert} from 'react-native';
import { setBiometricEnabledStatus } from '../utils/biometricUtils';
import { getFcmToken } from '../utils/notifications';

const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // State untuk menandakan proses pengecekan otentikasi
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [cachedFcmToken, setCachedFcmToken] = useState(null);

  // Function to reload user data from storage
  const reloadUserData = async () => {
    const token = await AsyncStorage.getItem('token');
    const userData = await AsyncStorage.getItem('user');

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Initialize on mount
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    // Load balance visibility preference
    const balanceVisible = await AsyncStorage.getItem('isBalanceVisible');
    if (balanceVisible !== null) {
      setIsBalanceVisible(balanceVisible === 'true');
    }

    const token = await AsyncStorage.getItem('token');

    if (token) {
      try {
        // Fetch fresh user data from API using POST method
        const response = await api.post('/api/user/profile');
        if (response.data && response.data.data) {
          const userProfile = response.data.data;
          await AsyncStorage.setItem('user', JSON.stringify(userProfile)); // Update local storage

          // Store biometric status in cache
          if (userProfile.biometric_enabled !== undefined) {
            await setBiometricEnabledStatus(userProfile.biometric_enabled);
          }

          setUser(userProfile);
          setIsLoggedIn(true);
        } else {
          // Jika API tidak mengembalikan data valid, paksa logout
          await logout();
        }
      } catch (error) {
        console.error('Error fetching user profile on init:', error);
        // Jika gagal terhubung ke server saat inisialisasi, paksa logout (Full Online)
        await logout();
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }

    // Pre-fetch FCM token
    try {
      const tokenFCM = await getFcmToken();
      setCachedFcmToken(tokenFCM);
    } catch (err) {
      console.log('Error pre-fetching FCM in init:', err);
    }

    setIsCheckingAuth(false); // Selesai pengecekan otentikasi
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setAuthToken(null);
    setIsLoggedIn(false);
    setUser(null);
  };

  // Function to update login state manually when user logs in
  const setLoggedInState = async (userData, token) => {
    if (token) {
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
    }

    if (userData) {
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Store biometric status in cache
      if (userData.biometric_enabled !== undefined) {
        await setBiometricEnabledStatus(userData.biometric_enabled);
      }

      setIsLoggedIn(true);
      setUser(userData);
    }
  };

  // Function to refresh user profile data from API
  const refreshUserProfile = async (force = false) => {
    const now = Date.now();
    // Prevent refreshes if called too frequently (e.g., within 30 seconds), unless forced
    if (!force && now - lastRefreshTime < 30000) {
      console.log('Profile refresh skipped (cooldown)');
      return user;
    }

    try {
      // Use POST method for refreshing user profile
      const response = await api.post('/api/user/profile');
      if (response.data && response.data.data) {
        const userProfile = response.data.data;
        await AsyncStorage.setItem('user', JSON.stringify(userProfile));

        // Store biometric status in cache
        if (userProfile.biometric_enabled !== undefined) {
          await setBiometricEnabledStatus(userProfile.biometric_enabled);
        }

        setUser(userProfile);
        setLastRefreshTime(now);
        return userProfile;
      }
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('Profile refresh rate limited (429)');
        return user; // Silently return existing user data on rate limit
      }
      console.error('Error refreshing user profile:', error);
      throw error;
    }
  };

  // Function to login with fallback mechanism
  const login = async (email, password) => {
    try {
      // Gunakan token yang sudah di-cache jika ada, jika tidak ambil baru
      let fcmToken = cachedFcmToken;
      if (!fcmToken) {
        console.log('FCM token not cached, fetching now...');
        fcmToken = await getFcmToken();
        setCachedFcmToken(fcmToken);
      }

      const loginData = {
        email,
        password,
      };

      // Tambahkan FCM token ke data login jika tersedia
      if (fcmToken) {
        loginData.fcm_token = fcmToken;
      }

      const response = await api.post(`/api/auth/login`, loginData);

      console.log('Login response:', response.data); // Debug log

      const token = response.data.data?.token;
      const user = response.data.data?.user;

      if (!token) {
        throw new Error('Token tidak ditemukan dalam respons');
      }

      // SIMPAN TOKEN
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);

      // SIMPAN USER
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Store biometric status in cache
      if (user.biometric_enabled !== undefined) {
        await setBiometricEnabledStatus(user.biometric_enabled);
      }

      // Update the context state with user data
      setIsLoggedIn(true);
      setUser(user);

      return { success: true, user, token };
    } catch (error) {
      console.log('Login error details:', error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Login gagal';
      return { success: false, error: errorMessage };
    }
  };

  const toggleBalanceVisibility = async () => {
    const newState = !isBalanceVisible;
    setIsBalanceVisible(newState);
    await AsyncStorage.setItem('isBalanceVisible', newState.toString());
  };

  return (
    <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn, user, setUser, logout, setLoggedInState, reloadUserData, refreshUserProfile, login, isCheckingAuth, isBalanceVisible, toggleBalanceVisibility}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;