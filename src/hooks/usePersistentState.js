import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BACKGROUND_REFRESH_THRESHOLD = 0; // Always attempt background refresh if data exists

const usePersistentState = (key, defaultValue, cacheDuration = CACHE_DURATION) => {
  const [state, setState] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Track background refresh
  const LOCAL_CACHE_DURATION = cacheDuration;
  const LOCAL_BACKGROUND_REFRESH_THRESHOLD = Math.min(LOCAL_CACHE_DURATION / 2, BACKGROUND_REFRESH_THRESHOLD); // Half of cache duration or max 1 hour

  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const persistedData = await AsyncStorage.getItem(key);
        if (persistedData !== null) {
          const parsedData = JSON.parse(persistedData);
          const currentTime = Date.now();
          const age = currentTime - parsedData.timestamp;

          // If cache is still valid, load it immediately
          if (parsedData.timestamp && age < LOCAL_CACHE_DURATION) {
            setState(parsedData.value);

            // If cache is older than threshold, refresh in background
            if (age > LOCAL_BACKGROUND_REFRESH_THRESHOLD) {
              setIsRefreshing(true);
              // Note: Actual background refresh should be triggered by the component
              // when it detects this condition
            }
          } else {
            // Cache expired, remove it
            await AsyncStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error(`Error loading persisted state for key "${key}":`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedState();
  }, [key, LOCAL_CACHE_DURATION]);

  const setPersistentState = async (newValue) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(state) : newValue;
      setState(valueToStore);
      // Store with timestamp
      await AsyncStorage.setItem(key, JSON.stringify({
        value: valueToStore,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`Error saving persisted state for key "${key}":`, error);
    }
  };

  // Function to force clear the cache
  const clearPersistentState = async () => {
    try {
      await AsyncStorage.removeItem(key);
      setState(defaultValue);
    } catch (error) {
      console.error(`Error clearing persisted state for key "${key}":`, error);
    }
  };

  // Function to check if cache needs background refresh
  const needsBackgroundRefresh = async () => {
    try {
      const persistedData = await AsyncStorage.getItem(key);
      if (persistedData !== null) {
        const parsedData = JSON.parse(persistedData);
        const currentTime = Date.now();
        const age = currentTime - parsedData.timestamp;
        return age > LOCAL_BACKGROUND_REFRESH_THRESHOLD && age < LOCAL_CACHE_DURATION;
      }
      return false; // If no data, no need for background refresh
    } catch (error) {
      console.error(`Error checking background refresh for key "${key}":`, error);
      return false;
    }
  };

  // Function to check if cache is expired (Daily or Duration based)
  const isCacheExpired = async () => {
    try {
      const persistedData = await AsyncStorage.getItem(key);
      if (persistedData !== null) {
        const parsedData = JSON.parse(persistedData);
        const currentTime = Date.now();
        
        // 1. Check if duration exceeded
        const isDurationExpired = (currentTime - parsedData.timestamp) >= LOCAL_CACHE_DURATION;
        if (isDurationExpired) return true;

        // 2. Check if day has changed (Daily Cache)
        const cachedDate = new Date(parsedData.timestamp).toDateString();
        const currentDate = new Date(currentTime).toDateString();
        const isDifferentDay = cachedDate !== currentDate;
        
        return isDifferentDay;
      }
      return true; // If no data, consider it expired
    } catch (error) {
      console.error(`Error checking cache expiration for key "${key}":`, error);
      return true;
    }
  };

  return [state, setPersistentState, isLoading, clearPersistentState, isCacheExpired, needsBackgroundRefresh, isRefreshing];
};

export default usePersistentState;