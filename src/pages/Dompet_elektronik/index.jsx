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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import SkeletonCard from '../../components/SkeletonCard';
import ModernButton from '../../components/ModernButton';
import {SafeAreaView} from 'react-native';

export default function DompetElektronik({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    fetchProviders(false);
  }, []);

  const [error, setError] = useState(null);

  const fetchProviders = async (forceRefresh = false) => {
    // For forced refresh, show loading
    if (forceRefresh) {
      setIsRefreshing(true);
    }

    const result = await fetchProviderList('emoney_providers', '/api/product/emoney', 'emoney', forceRefresh);

    // Update state with new providers
    setProviders(result.providers);

    // Only show error if there are no providers AND there's an error message
    // This means if we have cached data (providers.length > 0), we don't show the error
    if (result.providers.length === 0 && result.error) {
      setError(result.error);
    } else {
      setError(null); // Clear any previous error if we have data
    }

    // Hide loading indicator after data is loaded
    setLoading(false);
    setIsRefreshing(false);
  };

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    await fetchProviders(true); // Force refresh when user clicks retry
    setLoading(false);
  };

  const handleProviderPress = (provider) => {
    navigation.navigate('TypeEmoney', {
      provider: provider,
      title: `${provider} Product`,
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
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title="Dompet Elektronik" />
      <View style={styles.wrapper(isDarkMode)}>
        <View style={styles.container(isDarkMode)}>
          {loading && !error ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6, 7, 8]}
              renderItem={() => <SkeletonCard style={{height: 50, marginBottom: 15}} />}
              keyExtractor={(item) => item.toString()}
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
