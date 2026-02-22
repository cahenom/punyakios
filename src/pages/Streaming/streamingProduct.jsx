import {StyleSheet, Text, View, useColorScheme, ScrollView, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
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
import {useAuth} from '../../context/AuthContext';
import { makeTopupCall } from '../../helpers/apiBiometricHelper';
import CustomHeader from '../../components/CustomHeader';

export default function StreamingProduct({route, navigation}) {
  const {provider, title} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef(null);

  const [customer_no, setCustomerNo] = useState('');
  const [selectItem, setSelectItem] = useState(null);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/product/streaming', {
        provider: provider
      });

      let allProducts = [];
      if (response.data?.data) {
        const data = response.data.data;
        if (Array.isArray(data.streaming)) {
          allProducts = data.streaming;
        } else if (Array.isArray(data)) {
          allProducts = data;
        } else if (data.data && Array.isArray(data.data)) {
          allProducts = data.data;
        }
      }

      // Filter products by provider
      let filteredProducts = allProducts.filter(product =>
        product.provider &&
        (product.provider.toLowerCase() === provider.toLowerCase())
      );

      const sorted = [...filteredProducts].sort((a, b) => a.price - b.price);
      setSortedProducts(sorted);
    } catch (error) {
      console.error('Error fetching streaming products:', error?.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const {user} = useAuth();

  const validateInputs = () => {
    const errors = {};
    if (!customer_no.trim()) {
      errors.customer_no = 'Nomor pelanggan harus diisi';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    if (!validateInputs()) {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    } else {
      setShowModal(true);
    }
  };

  const confirmOrder = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await makeTopupCall({
        sku: selectItem.sku,
        customer_no: customer_no,
        use_points: usePoints,
      }, `Verifikasi untuk berlangganan ${selectItem.name}`);

      setShowModal(false);

      navigation.navigate('SuccessNotif', {
        item: {
          ...response,
          customer_no: customer_no
        },
        product: {
          ...selectItem,
          product_name: selectItem?.name,
          product_seller_price: selectItem?.price,
          customer_no: customer_no
        },
      });
    } catch (error) {
      console.error('Streaming topup error:', error?.message || String(error));
      setShowModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title={title || "Streaming"} />
      
      <View style={[styles.container, {paddingBottom: 10}]}>
        <View style={{marginBottom: 15}}>
          <Text
            style={{
              fontFamily: MEDIUM_FONT,
              fontSize: 16,
              color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
            }}>
            Pilih paket {provider}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Input
            value={customer_no}
            placeholder="Masukan ID Pelanggan"
            onchange={text => {
              setCustomerNo(text);
              if (validationErrors.customer_no) setValidationErrors({});
            }}
            ondelete={() => setCustomerNo('')}
            type="default"
            lebar={windowWidth * 0.9}
            hasError={!!validationErrors.customer_no}
          />
        </View>
      </View>

      {loading ? (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.productsContainer}>
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
            Tidak ada produk tersedia untuk {provider}
          </Text>
        </View>
      )}

      {selectItem && (
        <View style={[styles.bottomButtonContainer, {backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
          <BottomButton
            label="Lanjutkan"
            action={handleContinue}
            isLoading={false}
          />
        </View>
      )}

      <BottomModal
        visible={showModal}
        onDismis={() => setShowModal(false)}
        title="Detail Transaksi">
        <TransactionDetail
          destination={customer_no}
          product={selectItem?.name}
          description={selectItem?.desc}
          price={selectItem?.price}
          onConfirm={confirmOrder}
          onCancel={() => setShowModal(false)}
          isLoading={isProcessing}
          availablePoints={user?.points || 0}
          usePoints={usePoints}
          onTogglePoints={() => setUsePoints(!usePoints)}
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
    paddingBottom: 150,
  },
  productItem: {
    width: '47%',
    marginBottom: 0,
  },
  bottomButtonContainer: {
    paddingHorizontal: HORIZONTAL_MARGIN,
    paddingBottom: 20,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
