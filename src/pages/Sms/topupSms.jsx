import {StyleSheet, Text, View, useColorScheme, ScrollView, SafeAreaView} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
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

export default function TopupSms({route, navigation}) {
  const {provider, title, type} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef(null);

  const [customer_no, setCustomerNo] = useState('');
  const [selectItem, setSelectItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [usePoints, setUsePoints] = useState(false);
  const {user} = useAuth();

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/product/sms');
      let allProducts = [];

      if (response.data && response.data.data && Array.isArray(response.data.data.sms)) {
        allProducts = response.data.data.sms;
      }

      let filtered = allProducts.filter(p => 
        p.provider && p.provider.toLowerCase() === provider.toLowerCase()
      );

      if (type) {
        const typeFiltered = filtered.filter(p => 
          p.type && p.type.toLowerCase() === type.toLowerCase()
        );
        if (typeFiltered.length > 0) filtered = typeFiltered;
      }

      setProducts(filtered.sort((a, b) => a.price - b.price));
    } catch (error) {
      console.error('Error fetching SMS products:', error);
    } finally {
      setLoading(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = () => {
    if (validateInputs()) setShowModal(true);
    else scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  const confirmOrder = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await makeTopupCall({
        sku: selectItem.sku,
        customer_no: customer_no,
        use_points: usePoints,
      }, 'Verifikasi sidik jari atau wajah untuk melakukan aktivasi paket SMS');

      setShowModal(false);
      navigation.navigate('TransactionResult', {
        item: { ...response, customer_no },
        product: {
          ...selectItem,
          product_name: selectItem?.name || selectItem?.label,
          product_seller_price: selectItem?.price,
          customer_no
        },
      });
    } catch (error) {
      console.error('SMS Topup error:', error);
      setShowModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title={title || "Paket SMS"} />
      <View style={styles.container}>
        <View style={{marginBottom: 15}}>
          <Text style={{fontFamily: MEDIUM_FONT, fontSize: 16, color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}}>
            Pilih paket {provider}
          </Text>
        </View>
        <Input
          value={customer_no}
          placeholder="Masukan nomor tujuan"
          onchange={setCustomerNo}
          ondelete={() => setCustomerNo('')}
          type="numeric"
          lebar={windowWidth * 0.9}
          hasError={!!validationErrors.customer_no}
        />
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.productsContainer}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} style={styles.productItem} />)}
          </View>
        </ScrollView>
      ) : products.length > 0 ? (
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
          <View style={styles.productsContainer}>
            {products.map((p, i) => (
              <ProductCard
                key={`${p.id}-${i}`}
                product={p}
                isSelected={selectItem?.id === p.id}
                onSelect={setSelectItem}
                style={styles.productItem}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontFamily: REGULAR_FONT, color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}}>Produk tidak tersedia</Text>
        </View>
      )}

      {selectItem && (
        <View style={styles.bottomButtonContainer}>
          <BottomButton label="Lanjutkan" action={handleContinue} />
        </View>
      )}

      <BottomModal visible={showModal} onDismis={() => setShowModal(false)} title="Detail Transaksi">
        <TransactionDetail
          destination={customer_no}
          product={selectItem?.label || selectItem?.name}
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
  container: { marginHorizontal: HORIZONTAL_MARGIN, marginTop: 15 },
  scrollContent: { flexGrow: 1, paddingBottom: 120 },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_MARGIN,
    marginTop: 10,
    rowGap: 20
  },
  productItem: { width: '47%' },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: HORIZONTAL_MARGIN,
    backgroundColor: 'transparent'
  }
});
