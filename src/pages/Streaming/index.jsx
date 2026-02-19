import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
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

export default function Streaming({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviders(false);
  }, []);

  const fetchProviders = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    }

    const result = await fetchProviderList('streaming_providers', '/api/product/streaming', 'streaming', forceRefresh);

    setProviders(result.providers);

    if (result.providers.length === 0 && result.error) {
      setError(result.error);
    } else {
      setError(null);
    }

    setLoading(false);
    setIsRefreshing(false);
  };

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    await fetchProviders(true);
    setLoading(false);
  };

  const handleProviderPress = (provider) => {
    navigation.navigate('StreamingProduct', {
      provider: provider,
      title: `${provider}`,
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
      <CustomHeader title="Streaming" />
      <View style={styles.wrapper(isDarkMode)}>
        <View style={styles.container(isDarkMode)}>
          {loading && !error ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6, 7, 8]}
              renderItem={() => <SkeletonCard style={{height: 50, marginBottom: 15}} />}
              keyExtractor={(item) => item.toString()}
            />
          ) : error ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, marginTop: 100}}>
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
