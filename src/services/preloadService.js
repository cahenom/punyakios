import { api } from '../utils/api';

// Service to preload all provider and product data
export const preloadAllData = async () => {
  try {
    // Fetch all provider data in parallel to improve performance
    const [
      gamesResponse,
      emoneyResponse,
      tvResponse,
      voucherResponse,
      masaaktifResponse
    ] = await Promise.allSettled([
      api.post('/api/product/games'),
      api.post('/api/product/emoney'),
      api.post('/api/product/tv'),
      api.post('/api/product/voucher'),
      api.post('/api/product/masaaktif')
    ]);

    const allData = {
      games: [],
      emoney: [],
      tv: [],
      voucher: [],
      masaaktif: []
    };

    // Process games data
    if (gamesResponse.status === 'fulfilled' && gamesResponse.value.data?.data?.games) {
      allData.games = gamesResponse.value.data.data.games;
    }

    // Process emoney data
    if (emoneyResponse.status === 'fulfilled' && emoneyResponse.value.data?.data?.emoney) {
      allData.emoney = emoneyResponse.value.data.data.emoney;
    }

    // Process tv data
    if (tvResponse.status === 'fulfilled' && tvResponse.value.data?.data?.tv) {
      allData.tv = tvResponse.value.data.data.tv;
    }

    // Process voucher data
    if (voucherResponse.status === 'fulfilled' && voucherResponse.value.data?.data?.voucher) {
      allData.voucher = voucherResponse.value.data.data.voucher;
    }

    // Process masaaktif data
    if (masaaktifResponse.status === 'fulfilled' && masaaktifResponse.value.data?.data?.masa_aktif) {
      allData.masaaktif = masaaktifResponse.value.data.data.masa_aktif;
    }

    // Store the data in a global cache or local storage for later use
    // For now, we'll just return the data
    return allData;
  } catch (error) {
    console.error('Error preloading data:', error);
    throw error;
  }
};

// Function to get all providers from the preloaded data
export const getAllProviders = (allData) => {
  const providers = new Set();

  // Extract unique providers from all categories
  [...allData.games, ...allData.emoney, ...allData.tv, ...allData.voucher, ...allData.masaaktif]
    .forEach(item => {
      if (item.provider) {
        providers.add(item.provider);
      }
    });

  return Array.from(providers);
};