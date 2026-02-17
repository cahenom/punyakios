import { useState, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { api } from '../utils/api';
import usePersistentState from './usePersistentState';

/**
 * Custom hook for managing topup products
 * @param {string} provider - The provider name
 * @param {string} title - The title to display
 * @param {string} endpoint - The API endpoint to fetch products from
 * @param {string} cacheKeyPrefix - The prefix for the cache key
 * @param {number} cacheDuration - Duration in milliseconds to cache data (default: 1 hour instead of 24 hours)
 * @returns {Object} - The state and functions for managing topup products
 */
/**
 * Custom hook for managing topup products
 * @param {string} provider - The provider name
 * @param {string} title - The title to display
 * @param {string} endpoint - The API endpoint to fetch products from
 * @param {string} cacheKeyPrefix - The prefix for the cache key
 * @param {string} type - Optional product type (e.g., Prepaid, Postpaid)
 * @param {number} cacheDuration - Duration in milliseconds to cache data (default: 1 hour)
 * @returns {Object} - The state and functions for managing topup products
 */
export default function useTopupProducts(provider, title, endpoint, cacheKeyPrefix, type = null, cacheDuration = 60 * 60 * 1000) {
  const [customer_no, setCustomerNo] = useState('');
  const [selectItem, setSelectItem] = useState(null);
  const [products, setProducts, isLoadingFromHook, , checkCacheExpired, checkNeedsBackgroundRefresh] = usePersistentState(`${cacheKeyPrefix}_${provider}_${type || 'all'}_products`, [], cacheDuration);
  const [loading, setLoading] = useState(false);
  const [isCacheExpiredState, setIsCacheExpiredState] = useState(false);
  const hasFetchedRef = useRef({}); // Track if products have been fetched for each provider
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Memoized sorted products to avoid re-sorting on every render
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.price - b.price);
  }, [products]);

  // RESET LOGIC: Clear selected product if customer number changes
  useEffect(() => {
    if (selectItem) {
      console.log('Resetting selected product because customer number changed');
      setSelectItem(null);
    }
  }, [customer_no]);

  useEffect(() => {
    let isMounted = true;

    const initializeProducts = async () => {
      const providerKey = `${cacheKeyPrefix}_${provider}_${type || 'all'}`;
      const hasFetchedForThisProvider = hasFetchedRef.current[providerKey];

      if (!isLoadingFromHook) {
        const cacheExpired = await checkCacheExpired();

        if (isMounted) {
          setIsCacheExpiredState(cacheExpired);

          if (products.length === 0) {
            setLoading(true);
            hasFetchedRef.current[providerKey] = true;
            await fetchProductsByProvider();
          } else if (cacheExpired) {
            setLoading(true);
            hasFetchedRef.current[providerKey] = true;
            await fetchProductsByProvider();
          } else {
            setLoading(false);
            if (!hasFetchedForThisProvider) {
              hasFetchedRef.current[providerKey] = true;
              checkAndRefreshInBackground();
            }
          }
        }
      }
    };

    initializeProducts();

    return () => {
      isMounted = false;
    };
  }, [provider, type, isLoadingFromHook, checkCacheExpired, cacheKeyPrefix]);

  const fetchProductsByProvider = async () => {
    try {
      const response = await api.post(endpoint, {
        provider: provider.toLowerCase(),
        type: type // Send type to API if needed, some APIs might use it
      });

      if (response.data && response.data.data) {
        let allProducts = [];
        if (endpoint.includes('/api/product/masaaktif')) {
          allProducts = response.data.data.masa_aktif || [];
        } else if (endpoint.includes('/api/product/games')) {
          allProducts = response.data.data.games || [];
        } else if (endpoint.includes('/api/product/emoney')) {
          allProducts = response.data.data.emoney || [];
        } else if (endpoint.includes('/api/product/tv')) {
          allProducts = response.data.data.tv || [];
        } else if (endpoint.includes('/api/product/voucher')) {
          allProducts = response.data.data.voucher || [];
        } else {
          const dataKeys = Object.keys(response.data.data);
          if (dataKeys.length > 0) {
            allProducts = response.data.data[dataKeys[0]] || [];
          }
        }

        // Filter products by provider and type
        let filteredProducts = allProducts.filter(item => 
          item.provider && item.provider.toLowerCase() === provider.toLowerCase()
        );

        if (type) {
          filteredProducts = filteredProducts.filter(item => 
            item.type === type || (item.type && item.type.toLowerCase() === type.toLowerCase())
          );
        }

        const transformedProducts = filteredProducts.map(item => ({
          id: item.id,
          label: item.name,
          price: item.price,
          desc: item.desc,
          category: item.category,
          sku: item.sku,
          multi: item.multi
        }));

        await setProducts(transformedProducts);

        if (transformedProducts.length === 0) {
          const providerKey = `${cacheKeyPrefix}_${provider}_${type || 'all'}`;
          hasFetchedRef.current[providerKey] = false;
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      const providerKey = `${cacheKeyPrefix}_${provider}_${type || 'all'}`;
      hasFetchedRef.current[providerKey] = false;
    } finally {
      setLoading(false);
    }
  };

  const checkAndRefreshInBackground = async () => {
    if (products.length > 0) {
      try {
        const response = await api.post(endpoint, {
          provider: provider.toLowerCase(),
          type: type
        });
        if (response.data && response.data.data) {
          let allProducts = [];
          // ... same logic as above ...
          if (endpoint.includes('/api/product/masaaktif')) {
            allProducts = response.data.data.masa_aktif || [];
          } else if (endpoint.includes('/api/product/games')) {
            allProducts = response.data.data.games || [];
          } else if (endpoint.includes('/api/product/emoney')) {
            allProducts = response.data.data.emoney || [];
          } else if (endpoint.includes('/api/product/tv')) {
            allProducts = response.data.data.tv || [];
          } else if (endpoint.includes('/api/product/voucher')) {
            allProducts = response.data.data.voucher || [];
          } else {
            const dataKeys = Object.keys(response.data.data);
            if (dataKeys.length > 0) {
              allProducts = response.data.data[dataKeys[0]] || [];
            }
          }

          let filteredProducts = allProducts.filter(item => 
            item.provider && item.provider.toLowerCase() === provider.toLowerCase()
          );

          if (type) {
            filteredProducts = filteredProducts.filter(item => 
              item.type === type || (item.type && item.type.toLowerCase() === type.toLowerCase())
            );
          }

          const transformedProducts = filteredProducts.map(item => ({
            id: item.id,
            label: item.name,
            price: item.price,
            desc: item.desc,
            category: item.category,
            sku: item.sku,
            multi: item.multi
          }));

          await setProducts(transformedProducts);
        }
      } catch (error) {
        console.warn('Background sync failed:', error.message);
      }
    }
  };

  useEffect(() => {
    if (!isLoadingFromHook) {
      checkAndRefreshInBackground();
    }
  }, [isLoadingFromHook, provider, type, endpoint]);

  const resetInput = () => {
    setCustomerNo('');
  };

  const validateInputs = () => {
    const errors = {};
    if (!customer_no) errors.customer_no = true;
    if (!selectItem) errors.selectItem = true;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  return {
    customer_no,
    setCustomerNo,
    selectItem,
    setSelectItem,
    sortedProducts,
    loading,
    showConfirmation,
    setShowConfirmation,
    fetchProductsByProvider,
    resetInput,
    title,
    validationErrors,
    validateInputs,
    clearValidationErrors
  };
}