import {StyleSheet, Text, View, useColorScheme, ScrollView, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, RefreshControl, Platform, PermissionsAndroid} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  FONT_SEDANG,
  GREY_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_BACKGROUND,
  windowWidth,
} from '../../utils/const';
import Input from '../../components/form/Input';
import BottomButton from '../../components/BottomButton';
import ProductCard from '../../components/ProductCard';
import SkeletonCard from '../../components/SkeletonCard';
import BottomModal from '../../components/BottomModal';
import TransactionDetail from '../../components/TransactionDetail';
import { api } from '../../utils/api';
import {numberWithCommas} from '../../utils/formatter';
import { makeTopupCall } from '../../helpers/apiBiometricHelper';
import CustomHeader from '../../components/CustomHeader';
import { UserDefault } from '../../assets';
import { selectContactPhone } from 'react-native-select-contact';

export default function TopupData({route, navigation}) {
  const {provider, title, type} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef(null);

  // State for products
  const [customer_no, setCustomerNo] = useState('');
  const [selectItem, setSelectItem] = useState(null);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Simple validation
  const validateInputs = () => {
    const errors = {};
    if (!customer_no.trim()) {
      errors.customer_no = 'Nomor tujuan harus diisi';
    } else if (!/^\d+$/.test(customer_no)) {
      errors.customer_no = 'Nomor tidak valid';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearValidationErrors = () => setValidationErrors({});
  const [isPickingContact, setIsPickingContact] = useState(false);
  const resetInput = () => {
    setCustomerNo('');
    setSelectItem(null);
    clearValidationErrors();
  };

  const handlePickContact = async () => {
    if (isPickingContact) return;
    setIsPickingContact(true);

    try {
      if (Platform.OS === 'android') {
        const request = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        );
        if (request === PermissionsAndroid.RESULTS.DENIED ||
            request === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setIsPickingContact(false);
          return;
        }
      }

      const selection = await selectContactPhone();
      if (selection) {
        const { selectedPhone } = selection;
        let formattedNumber = selectedPhone.number.replace(/[^0-9]/g, '');
        
        if (formattedNumber.startsWith('62')) {
          formattedNumber = '0' + formattedNumber.slice(2);
        }
        
        setCustomerNo(formattedNumber);
        if (selectItem) setSelectItem(null);
        clearValidationErrors();
      }
    } catch (error) {
      console.log('[CONTACT] Error:', error.message || String(error));
    } finally {
      setIsPickingContact(false);
    }
  };

  // Fetch products when component mounts (using provider and type from route params)
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);
    
    try {
      // Fetch products based on provider (since customer_no might not be enough to determine provider)
      // Don't send type parameter as it might cause server error
      const response = await api.post('/api/product/data', {
        provider: provider
      });

      console.log('API Response for products:', response.data); // Debug log

      let allProducts = [];

      // Correctly parse the response structure: { status, message, data: { data: [...] } }
      if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
        allProducts = response.data.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Fallback if the structure is slightly different
        allProducts = response.data.data;
      }

      // Filter products by provider first
      let filteredProducts = allProducts.filter(product =>
        product.provider &&
        (product.provider.toLowerCase() === provider.toLowerCase())
      );

      // Then, if type is specified, filter by type as well
      if (type) {
        const typeFiltered = filteredProducts.filter(product =>
          product.type &&
          (product.type === type || product.type.toLowerCase() === type.toLowerCase())
        );

        // If no products found with the specified type, show a warning but still display all products for this provider
        if (typeFiltered.length === 0) {
          console.log(`Warning: No products found for type "${type}" for provider "${provider}". Showing all available products for this provider.`);
        } else {
          filteredProducts = typeFiltered;
        }
      }

      // Sort products by price (or any other criteria)
      const sorted = [...filteredProducts].sort((a, b) => a.price - b.price);

      setSortedProducts(sorted);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchProducts(true);
  };

  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Loading state to prevent spam clicks

  const handleContinue = () => {
    if (!validateInputs()) {
      // If validation fails, scroll to the top to show the error indicators
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    } else {
      // If validation passes, show confirmation modal
      setShowModal(true);
    }
  };

  const confirmOrder = async () => {
    if (isProcessing) return; // Prevent multiple clicks

    console.log('[DATA DEBUG] Initiating confirmOrder');
    console.log('[DATA DEBUG] current customer_no state:', customer_no);
    console.log('[DATA DEBUG] current selectItem state:', JSON.stringify(selectItem, null, 2));

    setIsProcessing(true); // Set loading state to prevent spam clicks

    try {
      const response = await makeTopupCall({
        sku: selectItem.sku,
        customer_no: customer_no,
      }, 'Verifikasi sidik jari atau wajah untuk melakukan isi data');

      console.log('Topup response:', response);

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
      console.error('Topup error:', error);
      setShowModal(false);
      // Error will be handled by global interceptor
    } finally {
      setIsProcessing(false); // Reset loading state
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND, paddingBottom: 100}}>
      <CustomHeader title={title || "Topup Paket Data"} />
      
      {/* Fixed Header and Input Section */}
      <View style={[styles.container, {paddingBottom: 10, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
        <View style={{marginBottom: 15}}>
          <Text
            style={{
              fontFamily: MEDIUM_FONT,
              fontSize: 16,
              color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
            }}>
            Pilih Paket {provider}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Input
            value={customer_no}
            placeholder="Masukan nomor tujuan"
            onchange={text => {
              setCustomerNo(text);
              if (selectItem) setSelectItem(null); // Clear selected item if number changes
              if (validationErrors.customer_no) {
                clearValidationErrors();
              }
            }}
            ondelete={resetInput}
            type="numeric"
            lebar={windowWidth * 0.9}
            hasError={!!validationErrors.customer_no}
            rightIcon={<UserDefault width={24} height={24} color={isDarkMode ? LIGHT_COLOR : BLUE_COLOR} />}
            onRightAction={handlePickContact}
            disabledRightAction={isPickingContact}
          />
        </View>
      </View>

      {/* Scrollable Product List */}
      {loading ? (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[BLUE_COLOR]}
              tintColor={BLUE_COLOR}
            />
          }
        >
          <View style={styles.productsContainer}>
            {/* Skeleton cards while loading */}
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={`skeleton-${index}`} style={styles.productItem}>
                <SkeletonCard />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : sortedProducts.length > 0 ? (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[BLUE_COLOR]}
              tintColor={BLUE_COLOR}
            />
          }
        >
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
            {type ? `Tidak ada produk ${type} tersedia untuk ${provider}` : `Tidak ada produk tersedia untuk ${provider}`}
          </Text>
        </View>
      )}

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
    paddingBottom: 150, // Extra padding to prevent overlap with bottom button
  },
  productItem: {
    width: '47%', // Adjusted to prevent clipping
    marginBottom: 0, // Let the rowGap in parent handle spacing
  },
  spacer: {
    height: 120, // Space equivalent to bottom button height plus some extra
    width: '100%',
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
});