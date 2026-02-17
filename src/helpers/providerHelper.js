import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';

// Cache to store fetched products with timestamp
const productCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generic function to fetch provider lists with caching and error handling
 * @param {string} cacheKey - The cache key for this provider type
 * @param {string} apiEndpoint - The API endpoint to fetch from
 * @param {string} dataField - The field in the response that contains the products
 * @returns {Promise<{providers: Array, error: string|null}>}
 */
/**
 * Generic function to fetch provider lists with Smart Daily Cache strategy:
 * 1. Instant Load from cache if it's from the same day.
 * 2. Background sync to keep data fresh.
 * 3. Force fresh fetch if it's a new day.
 */
export const fetchProviderList = async (cacheKey, apiEndpoint, dataField, forceRefresh = false) => {
  let cachedData = null;
  const storageKey = `${cacheKey}_cache`;

  // 1. Load from AsyncStorage immediately
  const cachedString = await AsyncStorage.getItem(storageKey);
  if (cachedString) {
    try {
      const parsed = JSON.parse(cachedString);
      const cachedDate = new Date(parsed.timestamp).toDateString();
      const currentDate = new Date().toDateString();

      // If same day and not forcing refresh, use it immediately
      if (cachedDate === currentDate && !forceRefresh) {
        cachedData = parsed.providers;
        
        // Trigger background refresh silently
        setTimeout(() => {
          backgroundSyncProviders(cacheKey, apiEndpoint, dataField);
        }, 100);

        return {
          providers: cachedData,
          error: null
        };
      }
    } catch (e) {
      console.warn('Error parsing cache:', e);
    }
  }

  // 2. If no valid same-day cache or forceRefresh, fetch from API immediately (Online-first)
  return await backgroundSyncProviders(cacheKey, apiEndpoint, dataField);
};

/**
 * Perform actual network fetch and update cache
 */
const backgroundSyncProviders = async (cacheKey, apiEndpoint, dataField) => {
  try {
    const response = await api.post(apiEndpoint);

    if (response.data && response.data.data && response.data.data[dataField]) {
      const allProducts = response.data.data[dataField];
      const uniqueProviders = [...new Set(allProducts.map(item => item.provider))];
      const cacheData = {
        providers: uniqueProviders,
        timestamp: Date.now()
      };

      // Cache for persistence
      await AsyncStorage.setItem(`${cacheKey}_cache`, JSON.stringify(cacheData));

      return {
        providers: uniqueProviders,
        error: null
      };
    } else {
      return {
        providers: [],
        error: 'Struktur data tidak sesuai.'
      };
    }
  } catch (error) {
    console.error(`Background sync failed for ${cacheKey}:`, error.message);
    
    // On error, try to return whatever we have in cache even if it's old
    const cachedString = await AsyncStorage.getItem(`${cacheKey}_cache`);
    if (cachedString) {
      const parsed = JSON.parse(cachedString);
      return {
        providers: parsed.providers,
        error: null // Silently use old cache if network fails
      };
    }

    return {
      providers: [],
      error: 'Terjadi kesalahan jaringan. Coba lagi nanti.'
    };
  }
};

/**
 * Generic function to fetch product types with Smart Daily Cache strategy
 */
export const fetchProductTypes = async (cacheKey, apiEndpoint, dataField, provider, forceRefresh = false) => {
  let cachedData = null;
  const storageKey = `${cacheKey}_${provider.toLowerCase()}_types_cache`;

  // 1. Load from AsyncStorage immediately
  const cachedString = await AsyncStorage.getItem(storageKey);
  if (cachedString) {
    try {
      const parsed = JSON.parse(cachedString);
      const cachedDate = new Date(parsed.timestamp).toDateString();
      const currentDate = new Date().toDateString();

      // If same day and not forcing refresh, use it immediately
      if (cachedDate === currentDate && !forceRefresh) {
        cachedData = parsed.types;
        
        // Trigger background refresh silently
        setTimeout(() => {
          backgroundSyncProductTypes(cacheKey, apiEndpoint, dataField, provider);
        }, 100);

        return {
          types: cachedData,
          error: null
        };
      }
    } catch (e) {
      console.warn('Error parsing product types cache:', e);
    }
  }

  // 2. If no valid same-day cache or forceRefresh, fetch from API immediately
  return await backgroundSyncProductTypes(cacheKey, apiEndpoint, dataField, provider);
};

/**
 * Perform actual network fetch for product types and update cache
 */
const backgroundSyncProductTypes = async (cacheKey, apiEndpoint, dataField, provider) => {
  try {
    const response = await api.post(apiEndpoint, {
      provider: provider.toLowerCase(),
    });

    if (response.data && response.data.data) {
      let allProducts = [];
      
      // Handle the correct response structure for different endpoints
      if (response.data.data[dataField]) {
        allProducts = response.data.data[dataField];
      } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
        allProducts = response.data.data.data;
      } else if (Array.isArray(response.data.data)) {
        allProducts = response.data.data;
      }

      // Filter to ensure we only have objects with a 'type' property and belong to the selected provider
      const validProducts = allProducts.filter(item =>
        item && item.type && item.provider &&
        item.provider.toLowerCase() === provider.toLowerCase()
      );

      // Extract unique types
      const uniqueTypes = [...new Set(validProducts.map(item => item.type))];
      
      // Format the types for display
      const formattedTypes = uniqueTypes
        .filter(type => type)
        .map(type => ({
          id: type,
          name: type,
          provider: provider
        }));

      const cacheData = {
        types: formattedTypes,
        timestamp: Date.now()
      };

      // Cache for persistence
      await AsyncStorage.setItem(`${cacheKey}_${provider.toLowerCase()}_types_cache`, JSON.stringify(cacheData));

      return {
        types: formattedTypes,
        error: null
      };
    } else {
      return {
        types: [],
        error: 'Struktur data tidak sesuai.'
      };
    }
  } catch (error) {
    console.error(`Background sync failed for ${cacheKey} types:`, error.message);
    
    // On error, try to return whatever we have in cache even if it's old
    const storageKey = `${cacheKey}_${provider.toLowerCase()}_types_cache`;
    const cachedString = await AsyncStorage.getItem(storageKey);
    if (cachedString) {
      const parsed = JSON.parse(cachedString);
      return {
        types: parsed.types,
        error: null
      };
    }

    return {
      types: [],
      error: 'Terjadi kesalahan jaringan. Coba lagi nanti.'
    };
  }
};