import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import usePersistentState from '../../hooks/usePersistentState';
import {
  DARK_BACKGROUND,
  DARK_COLOR,
  GREY_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_BACKGROUND,
  BLUE_COLOR,
} from '../../utils/const';
import {ArrowRight} from '../../assets';
import {fetchProviderList} from '../../helpers/providerHelper';
import CustomHeader from '../../components/CustomHeader';
import ModernButton from '../../components/ModernButton';
import SkeletonCard from '../../components/SkeletonCard';
import {SafeAreaView} from 'react-native';

export default function Voucher({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [providers, setProviders, isLoadingFromHook, , isCacheExpired, needsBackgroundRefresh, isRefreshing] = usePersistentState('voucher_providers', []);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false); // Track if data has been loaded in this session

  useEffect(() => {
    // Check if we have data from persistent storage
    const initializeData = async () => {
      if (hasLoaded.current) {
        return; // Already initialized in this session
      }

      // Wait for persistent state to load
      if (!isLoadingFromHook) {
        // Check if cache is expired
        const expired = await isCacheExpired();
        if (providers.length === 0 || expired) {
          // No data available or cache is expired, fetch fresh data
          await fetchProviders(false);
        } else {
          // We have valid cached data, no need to fetch initially
          setLoading(false);
          hasLoaded.current = true; // Mark as initialized

          // Check if background refresh is needed
          const shouldRefreshInBackground = await needsBackgroundRefresh();
          if (shouldRefreshInBackground) {
            // Fetch fresh data in background without affecting UI
            fetchProviders(false); // Don't force refresh, just update cache
          }
        }
      }
    };

    initializeData();
  }, [isLoadingFromHook, providers, isCacheExpired, needsBackgroundRefresh]);

  // Update loading state based on persistent state loading
  useEffect(() => {
    if (isLoadingFromHook) {
      setLoading(true); // Still loading persistent state
    }
    // Don't override loading state set by fetchProviders
  }, [isLoadingFromHook]);

  const [error, setError] = useState(null);

  const fetchProviders = async (forceRefresh = false) => {
    // For forced refresh, show loading
    if (forceRefresh) {
      setLoading(true);
    }

    const result = await fetchProviderList('voucher_providers', '/api/product/voucher', 'voucher', forceRefresh);

    // Update persistent state with new providers
    await setProviders(result.providers);

    // Only show error if there are no providers AND there's an error message
    // This means if we have cached data (providers.length > 0), we don't show the error
    if (result.providers.length === 0 && result.error) {
      setError(result.error);
    } else {
      setError(null); // Clear any previous error if we have data
    }

    // Hide loading indicator after data is loaded (only if we showed it for forced refresh)
    // For background refresh, don't affect the main loading state
    if (forceRefresh) {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    await fetchProviders(true); // Force refresh when user clicks retry
    setLoading(false);
  };

  const handleProviderPress = (provider) => {
    navigation.navigate('TypeVoucher', {
      provider: provider,
      title: `${provider} Voucher`,
    });
  };

  const renderProviderItem = ({item}) => (
    <TouchableOpacity
      style={styles.layananButton(isDarkMode)}
      onPress={() => handleProviderPress(item)}>
      <Text style={styles.buttonText(isDarkMode)}>{item}</Text>
      <ArrowRight />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
      }}>
      <CustomHeader title="Voucher" />
      <View style={styles.wrapper(isDarkMode)}>
        <View style={styles.container(isDarkMode)}>
          {loading && !error ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              renderItem={() => <SkeletonCard style={{height: 50, marginBottom: 15}} />}
              keyExtractor={(item) => item.toString()}
              showsVerticalScrollIndicator={false}
            />
          ) : error ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20}}>
              <Text style={[styles.buttonText(isDarkMode), {textAlign: 'center', marginBottom: 20}]}>
                {error}
              </Text>
              <ModernButton
                label="Coba Lagi"
                onPress={handleRetry}
              />
            </View>
          ) : (
            <FlatList
              data={providers}
              renderItem={renderProviderItem}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => fetchProviders(true)}
                  colors={[BLUE_COLOR]}
                  tintColor={BLUE_COLOR}
                />
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
  }),
  container: isDarkMode => ({
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: 15,
    flex: 1,
  }),
  layananButton: isDarkMode => ({
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    padding: 10,
    justifyContent: 'space-between',
  }),
  buttonText: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
});