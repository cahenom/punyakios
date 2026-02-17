import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {Alert} from '../../utils/alert';
import React, {useState, useEffect, useMemo, useRef} from 'react';
import usePersistentState from '../../hooks/usePersistentState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_KECIL,
  FONT_NORMAL,
  GREEN_COLOR,
  GREY_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_BACKGROUND,
  WHITE_COLOR,
  windowWidth,
} from '../../utils/const';
import Input from '../../components/form/Input';
import {CheckProduct} from '../../assets';
import {api} from '../../utils/api';
import { makeTopupCall } from '../../helpers/apiBiometricHelper';
import ProductCard from '../../components/ProductCard';
import BottomButton from '../../components/BottomButton';
import BottomModal from '../../components/BottomModal';
import TransactionDetail from '../../components/TransactionDetail';
import {numberWithCommas} from '../../utils/formatter';
import CustomHeader from '../../components/CustomHeader';
import SkeletonCard from '../../components/SkeletonCard';
import ModernButton from '../../components/ModernButton';

// Smart Daily Cache Logic for PLN Prabayar
const PLN_CACHE_KEY = 'pln_prabayar_cache';

export default function PLNPrabayar({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';

  const [customer_no, setCustomerNo] = useState('');
  const [selectItem, setSelectItem] = useState(null);
  const [products, setProducts, isLoadingFromHook, , isCacheExpired, needsBackgroundRefresh, isRefreshing] = usePersistentState('pln_prabayar_products', []);
  const [loading, setLoading] = useState(true);
  const [isRefreshingState, setIsRefreshingState] = useState(false);
  const hasLoaded = useRef(false); // Track if data has been loaded in this session

  // Memoized sorted products to avoid re-sorting on every render
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.price - b.price);
  }, [products]);

  const resetInput = () => {
    setCustomerNo('');
  };

  const handleRefresh = async () => {
    setIsRefreshingState(true);
    await handleProductList(true); // Force refresh when user wants to update data
    setIsRefreshingState(false);
  };

  const handleProductList = async (forceRefresh = false) => {
    if (!forceRefresh) setLoading(true);

    // 1. Try to load from Persistent Cache for Instant display
    const cachedString = await AsyncStorage.getItem(PLN_CACHE_KEY);
    
    if (cachedString && !forceRefresh) {
      try {
        const parsed = JSON.parse(cachedString);
        const cachedDate = new Date(parsed.timestamp).toDateString();
        const currentDate = new Date().toDateString();

        // If same day, show immediately but still sync in background
        if (cachedDate === currentDate) {
          console.log('Using persistent same-day cache for PLN Prabayar');
          await setProducts(parsed.products || []);
          setLoading(false);
          
          // Background sync silently
          backgroundSyncPLN();
          return;
        }
      } catch (e) {
        console.warn('Error parsing PLN cache:', e);
      }
    }

    // 2. If no valid cache or forceRefresh, perform online fetch
    await backgroundSyncPLN();
  };

  const backgroundSyncPLN = async () => {
    try {
      const response = await api.post('/api/product/pln');
      if (response.data && response.data.data && response.data.data.pln) {
        const transformedProducts = response.data.data.pln.map(item => ({
          id: item.id,
          label: item.name,
          price: item.price,
          desc: item.desc,
          category: item.category,
          sku: item.sku,
          multi: item.multi
        }));

        // Save to Persistence
        const cacheData = {
          products: transformedProducts,
          timestamp: Date.now()
        };
        await AsyncStorage.setItem(PLN_CACHE_KEY, JSON.stringify(cacheData));
        
        await setProducts(transformedProducts);
      }
    } catch (error) {
      console.log('PLN sync failed:', error.message);
    } finally {
      setLoading(false);
      setIsRefreshingState(false);
    }
  };

  // Initialize data from persistent storage
  useEffect(() => {
    const initializeData = async () => {
      if (hasLoaded.current) {
        return; // Already initialized in this session
      }

      // Wait for persistent state to load
      if (!isLoadingFromHook) {
        // Check if cache is expired
        const expired = await isCacheExpired();
        if (products.length === 0 || expired) {
          // No data available or cache is expired (new day), fetch fresh data
          await handleProductList(false);
        } else {
          // We have valid cached data, use it but sync in background
          setLoading(false);
          hasLoaded.current = true; // Mark as initialized
          
          // Re-trigger background sync
          backgroundSyncPLN();
        }
      }
    };

    initializeData();
  }, [isLoadingFromHook, products, isCacheExpired]);

  // Update loading state based on persistent state loading
  useEffect(() => {
    if (isLoadingFromHook) {
      setLoading(true); // Still loading persistent state
    }
    // Don't override loading state set by fetchProducts
  }, [isLoadingFromHook]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Loading state to prevent spam clicks

  const handleContinue = () => {
    if (!customer_no) {
      Alert.alert('Error', 'Silakan masukkan nomor meter');
      return;
    }
    if (!selectItem) {
      Alert.alert('Error', 'Silakan pilih produk terlebih dahulu');
      return;
    }

    console.log('Selected Item:', selectItem);
    console.log('Customer Number:', customer_no);

    // Show confirmation modal
    setShowModal(true);
  };

  const confirmOrder = async () => {
    if (isProcessing) return; // Prevent multiple clicks

    console.log('[PLN DEBUG] Initiating confirmOrder');
    console.log('[PLN DEBUG] current customer_no state:', customer_no);
    console.log('[PLN DEBUG] current selectItem state:', JSON.stringify(selectItem, null, 2));

    setIsProcessing(true); // Set loading state to prevent spam clicks

    try {
      const response = await makeTopupCall({
        sku: selectItem.sku,
        customer_no: customer_no,
      }, 'Verifikasi sidik jari atau wajah untuk melakukan topup PLN prabayar');

      console.log('PLN Topup response:', response);

      // Close confirmation modal
      setShowModal(false);

      // Check if transaction is successful or pending/processing
      const status = (response?.status || 'Berhasil').toLowerCase();
      // Include pending statuses as "successful initiations" to show the animation
      const isSuccessOrPending = !['gagal', 'failed', 'error', 'none'].includes(status);

      // Navigate to TransactionResult for successful or pending initiations
      if (isSuccessOrPending) {
        navigation.navigate('TransactionResult', {
          item: {
            ...response,
            customer_no: customer_no
          },
          product: {
            ...selectItem,
            product_name: selectItem?.name || selectItem?.label,
            product_seller_price: selectItem?.price,
            customer_no: customer_no
          },
        });
      } else {
        navigation.navigate('SuccessNotif', {
          item: {
            ...response,
            customer_no: customer_no
          },
          product: {
            ...selectItem,
            product_name: selectItem?.name || selectItem?.label,
            product_seller_price: selectItem?.price,
            customer_no: customer_no
          },
        });
      }
    } catch (error) {
      console.error('PLN Topup error:', error);
      setShowModal(false);
      // Error will be handled by global interceptor
    } finally {
      setIsProcessing(false); // Reset loading state
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND, paddingBottom: 100}}>
      <CustomHeader title="PLN Prabayar" />
      
      {/* Fixed Header and Input Section */}
      <View style={[styles.container, {paddingBottom: 10, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
        <View style={styles.formGroup}>
          <Input
            value={customer_no}
            placeholder="Masukan nomor meter"
            onchange={text => {
              setCustomerNo(text);
              if (selectItem) setSelectItem(null); // Clear selected item if number changes
            }}
            ondelete={resetInput}
            type="numeric"
            lebar={windowWidth * 0.9}
          />
        </View>
      </View>

      {/* Scrollable Product List */}
      <View style={{flex: 1}}>
        {loading ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshingState}
                onRefresh={handleRefresh}
                colors={[BLUE_COLOR]}
                tintColor={BLUE_COLOR}
              />
            }>
            <View style={styles.productsContainer}>
              {Array.from({length: 6}).map((_, index) => (
                <View key={`skeleton-${index}`} style={styles.productItem}>
                  <SkeletonCard style={{height: 100}} />
                </View>
              ))}
            </View>
          </ScrollView>
        ) : sortedProducts.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshingState}
                onRefresh={handleRefresh}
                colors={[BLUE_COLOR]}
                tintColor={BLUE_COLOR}
              />
            }>
            <View style={styles.productsContainer}>
              {sortedProducts.map((p, index) => (
                <ProductCard
                  key={`${p.id}-${index}`}
                  product={p}
                  isSelected={selectItem?.id === p.id}
                  onSelect={setSelectItem}
                  style={styles.productItem}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
            <Text style={{fontFamily: REGULAR_FONT, color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}}>
              Tidak ada produk PLN Prabayar tersedia
            </Text>
          </View>
        )}
      </View>

      {/* Fixed Bottom Button */}
      {selectItem && (
        <View style={[styles.bottomButtonContainer, {backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
          <BottomButton
            label="Lanjutkan"
            action={handleContinue}
            isLoading={false}
          />
        </View>
      )}

      {/* Confirmation Modal */}
      <BottomModal
        visible={showModal}
        onDismis={() => setShowModal(false)}
        title="Detail Transaksi">
        <TransactionDetail
          destination={customer_no}
          product={selectItem?.label || selectItem?.name}
          description={selectItem?.desc}
          price={selectItem?.price}
          onConfirm={() => {
            confirmOrder();
          }}
          onCancel={() => setShowModal(false)}
          isLoading={isProcessing}
        />
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: 15,
  },
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 5,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    borderRadius: 5,
    padding: 15,
    flex: 1,
  },
  buttonText: {
    color: WHITE_COLOR,
    fontFamily: REGULAR_FONT,
    textAlign: 'center',
  },
  infoPelanggan: isDarkMode => ({
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    borderRadius: 10,
  }),
  contentBlock: isDarkMode => ({
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    marginTop: 10,
    rowGap: 5,
  }),
  label: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: FONT_KECIL,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  value: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  scrollContent: {
    flexGrow: 1,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 25,
    marginTop: 10,
    paddingHorizontal: HORIZONTAL_MARGIN,
    columnGap: 5,
  },
  productItem: {
    width: '47%', // Adjusted to prevent clipping
    marginBottom: 0, // Let the rowGap in parent handle spacing
  },
  bottomButtonContainer: {
    paddingHorizontal: HORIZONTAL_MARGIN,
    paddingBottom: 20,
    paddingTop: 10,
    position: 'absolute', // Position absolutely at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Ensure it appears on top if needed
  },
  bottomButton: {
    backgroundColor: BLUE_COLOR,
    padding: 10,
    borderRadius: 5,
  },
});
