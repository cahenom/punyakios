import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  FONT_SEDANG,
  GREEN_COLOR,
  GREY_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_BACKGROUND,
} from '../../utils/const';
import {product_pulsa} from '../../data/product_pulsa';
import {UserDefault} from '../../assets';
import {selectContactPhone} from 'react-native-select-contact';
import BottomModal from '../../components/BottomModal';
import Input from '../../components/form/Input';
import TransactionDetail from '../../components/TransactionDetail';
import ProductCard from '../../components/ProductCard';
import SkeletonCard from '../../components/SkeletonCard';
import {numberWithCommas} from '../../utils/formatter';
import {api} from '../../utils/api';
import {makePaymentCall, makeTopupCall} from '../../helpers/apiBiometricHelper';
import CustomHeader from '../../components/CustomHeader';
import ModernButton from '../../components/ModernButton';
import BottomButton from '../../components/BottomButton';

// Smart Daily Cache Logic for Pulsa
const getPulsaCacheKey = (nomor) => `pulsa_cache_${nomor}`;

export default function Pulsa({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [nomorTujuan, setNomor] = useState(null);
  const [selectItem, setSelectItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [data_pulsa, setPulsa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPickingContact, setIsPickingContact] = useState(false);

  const clearNomor = () => {
    setNomor(null);
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
        
        setNomor(formattedNumber);
        if (selectItem) setSelectItem(null);
        if (data_pulsa.length > 0) setPulsa([]);
      }
    } catch (error) {
      console.log('[CONTACT] Error:', error.message || String(error));
    } finally {
      setIsPickingContact(false);
    }
  };


  const handleProduct = async (forceRefresh = false) => {
    if (!nomorTujuan) {
      if (forceRefresh) setIsRefreshing(false);
      return;
    }

    if (!forceRefresh) setLoading(true);

    // 1. Try to load from Persistent Cache for Instant display
    const cacheKey = getPulsaCacheKey(nomorTujuan);
    const cachedString = await AsyncStorage.getItem(cacheKey);
    
    if (cachedString && !forceRefresh) {
      try {
        const parsed = JSON.parse(cachedString);
        const cachedDate = new Date(parsed.timestamp).toDateString();
        const currentDate = new Date().toDateString();

        // If same day, show immediately but still sync in background
        if (cachedDate === currentDate) {
          console.log('Using persistent same-day cache for Pulsa:', nomorTujuan);
          setPulsa(parsed.pulsa || []);
          setLoading(false);
          
          // Background sync silently
          backgroundSyncPulsa(nomorTujuan, cacheKey);
          return;
        }
      } catch (e) {
        console.warn('Error parsing pulsa cache:', e);
      }
    }

    // 2. If no valid cache or forceRefresh, perform online fetch
    await backgroundSyncPulsa(nomorTujuan, cacheKey);
  };

  const backgroundSyncPulsa = async (nomor, cacheKey) => {
    try {
      const response = await api.post(`/api/product/pulsa`, {
        customer_no: nomor,
      });

      if (response.data && response.data.data) {
        const pulsaProducts = response.data.data.pulsa || response.data.data.pulsas || [];
        
        // Save to Persistence
        const cacheData = {
          pulsa: pulsaProducts,
          timestamp: Date.now()
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        setPulsa(pulsaProducts);
      }
    } catch (error) {
      console.log('Pulsa sync failed:', error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = () => {
    setIsRefreshing(true);
    handleProduct(true);
  };

  const [isProcessing, setIsProcessing] = useState(false); // Loading state to prevent spam clicks

  const handleTopup = async () => {
    if (isProcessing) return; // Prevent multiple clicks

    console.log('[PULSA DEBUG] Initiating handleTopup');
    console.log('[PULSA DEBUG] current nomorTujuan state:', nomorTujuan);
    console.log('[PULSA DEBUG] current selectItem state:', JSON.stringify(selectItem, null, 2));

    setIsProcessing(true); // Set loading state to prevent spam clicks

    try {
      const response = await makeTopupCall(
        {
          customer_no: nomorTujuan,
          sku: selectItem?.sku || selectItem?.product_sku,
          type: 'pulsa', // Specify the type for the unified endpoint
        },
        'Verifikasi sidik jari atau wajah untuk melakukan isi pulsa',
      );

      // Close the modal after response
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
            customer_no: nomorTujuan,
          },
          product: {
            ...selectItem,
            product_name: selectItem?.name || selectItem?.product_name,
            product_seller_price:
              selectItem?.price || selectItem?.product_seller_price,
          },
        });
      } else {
        navigation.navigate('SuccessNotif', {
          item: {
            ...response,
            customer_no: nomorTujuan,
          },
          product: {
            ...selectItem,
            product_name: selectItem?.name || selectItem?.product_name,
            product_seller_price:
              selectItem?.price || selectItem?.product_seller_price,
          },
        });
      }
      console.log('response topup : ', response);
    } catch (error) {
      console.log('response error : ', error);
      setShowModal(false);
      if (error.message !== 'Biometric authentication failed') {
        // Error will be handled by global interceptor
      }
    } finally {
      setIsProcessing(false); // Reset loading state
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title="Topup Pulsa" />
      <View
        style={{
          flex: 1,
          marginHorizontal: HORIZONTAL_MARGIN,
          marginTop: 15,
          backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
        }}>
        <View
          style={{
            rowGap: 10,
          }}>
          <Input
            value={nomorTujuan}
            placeholder="Masukan nomor tujuan"
            onchange={text => {
              setNomor(text);
              if (selectItem) setSelectItem(null); // Clear selected item if number changes
              if (data_pulsa.length > 0) setPulsa([]); // Force re-check products for new number
            }}
            ondelete={() => {
              clearNomor();
              setSelectItem(null);
              setPulsa([]);
            }}
            type="numeric"
            rightIcon={<UserDefault width={24} height={24} color={isDarkMode ? LIGHT_COLOR : BLUE_COLOR} />}
            onRightAction={handlePickContact}
            disabledRightAction={isPickingContact}
          />

          <ModernButton
            label={loading ? 'Loading' : 'Tampilkan produk'}
            isLoading={loading}
            onPress={() => handleProduct()}
          />
        </View>

        {/* PRODUK PULSA */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1, marginTop: 10}}
          contentContainerStyle={{paddingBottom: 100}}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[BLUE_COLOR]}
              tintColor={BLUE_COLOR}
            />
          }>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: 25,
            }}>
            {loading && data_pulsa.length === 0 ? (
              // Skeleton cards while loading initially
              Array.from({ length: 6 }).map((_, index) => (
                <View key={`skeleton-${index}`} style={{width: '45%'}}>
                  <SkeletonCard style={{height: 100}} />
                </View>
              ))
            ) : data_pulsa.map(p => {
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  isSelected={selectItem?.id === p.id}
                  onSelect={setSelectItem}
                  style={{width: '45%'}}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
      {selectItem && (
        <BottomButton
          label="Lanjutkan"
          action={() => setShowModal(!showModal)}
          isLoading={false}
        />
      )}
      <BottomModal
        visible={showModal}
        onDismis={() => setShowModal(!showModal)}
        title="Detail Transaksi">
        <TransactionDetail
          destination={nomorTujuan}
          product={selectItem?.name || selectItem?.product_name}
          description={selectItem?.desc || selectItem?.product_desc}
          price={selectItem?.price || selectItem?.product_seller_price}
          onConfirm={() => handleTopup()}
          onCancel={() => setShowModal(false)}
          isLoading={isProcessing}
        />
      </BottomModal>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  inputContainer: {
    rowGap: 10,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    borderRadius: 5,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: REGULAR_FONT,
    color: WHITE_BACKGROUND,
    textAlign: 'center',
  },
  bottom: isDarkMode => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    padding: 10,
  }),
  bottomButton: {
    backgroundColor: BLUE_COLOR,
    padding: 10,
    borderRadius: 5,
  },
  modalData: isDarkMode => ({
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    paddingVertical: 5,
    rowGap: 5,
  }),
  labelModalData: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: FONT_SEDANG,
    color: isDarkMode ? LIGHT_COLOR : LIGHT_COLOR, // Changed to ensure contrast
  }),
  valueModalData: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
    color: isDarkMode ? LIGHT_COLOR : LIGHT_COLOR, // Changed to ensure contrast
  }),
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
  },
});
