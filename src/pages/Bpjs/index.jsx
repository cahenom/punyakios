import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  SafeAreaView,
  Keyboard,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import ModernButton from '../../components/ModernButton';
import React, {useState, useEffect} from 'react';
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
  WHITE_COLOR,
} from '../../utils/const';
import Input from '../../components/form/Input';
import {ArrowRight} from '../../assets';
import {Alert} from '../../utils/alert';
import {makeCekTagihanCall, makeBayarTagihanCall} from '../../helpers/apiBiometricHelper';
import BottomModal from '../../components/BottomModal';
import TransactionDetail from '../../components/TransactionDetail';
import { useNavigation } from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {api} from '../../utils/api';

export default function BpjsKesehatan() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const [customer_no, setCustomerNo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [provider, setProvider] = useState(null);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await api.post('/api/product/bpjs');
      if (response.data.status === 'success') {
        const bpjsProducts = response.data.data.bpjs || [];
        setProducts(bpjsProducts);
        // Default select if only one product
        if (bpjsProducts.length === 1) {
          setProvider(bpjsProducts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching BPJS products:', error?.message || String(error));
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSetProvider = item => {
    setProvider(item);
    setShowModal(false);
    if (billData) setBillData(null);
  };

  const handleCekTagihan = async () => {
    if (!customer_no.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor VA Keluarga');
      return;
    }
    if (!provider) {
      Alert.alert('Error', 'Silakan pilih provider BPJS');
      return;
    }

    setLoading(true);
    try {
      const response = await makeCekTagihanCall({
        sku: provider.sku,
        customer_no: customer_no
      }, `Verifikasi untuk melihat tagihan ${provider.name}`);

      if (response.data) {
        setBillData(response.data);
        if (response.status !== 'Sukses') {
          Alert.alert('Info', response.message || 'Gagal mengambil data tagihan');
        }
      } else {
        Alert.alert('Error', response.message || 'Gagal mengambil data tagihan');
      }
    } catch (error) {
      console.error('Error checking BPJS bill:', error?.message || String(error));
      if (error?.message !== 'Biometric authentication failed') {
        Alert.alert('Error', error?.response?.data?.message || `Gagal menghubungi server: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBayarTagihan = () => {
    Keyboard.dismiss();
    if (!billData) return;
    setShowModalConfirm(true);
  };

  const confirmPayment = async (data) => {
    if (!data || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await makeBayarTagihanCall({
        sku: provider.sku,
        customer_no: data.customer_no,
        ref_id: data.ref_id,
        use_points: usePoints,
      }, `Verifikasi untuk membayar tagihan ${provider.name}`);

      setShowModalConfirm(false);

      navigation.navigate('SuccessNotif', {
        item: {
          ...response,
          customer_no: data.customer_no,
          ref: data.ref_id,
          tujuan: data.customer_no,
          sku: provider.sku || 'bpjs',
          status: response.status || 'Sukses',
          message: response.message || 'Transaksi Sukses',
          price: data.selling_price || data.price,
          sn: data.ref_id,
        },
        product: {
          product_name: provider.name,
          name: provider.name,
          label: provider.name,
          product_seller_price: `Rp ${(data.selling_price || data.price)?.toLocaleString('id-ID')}`,
          price: `Rp ${(data.selling_price || data.price)?.toLocaleString('id-ID')}`
        },
      });
    } catch (error) {
      console.error('Error paying BPJS bill:', error?.message || String(error));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title="BPJS Kesehatan" />
      <View style={styles.container}>
        <View style={styles.formGroup}>
          <Input
            value={customer_no}
            placeholder="Masukan nomor VA Keluarga"
            onchange={text => {
              setCustomerNo(text);
              if (billData) setBillData(null);
            }}
            ondelete={() => {
              setCustomerNo('');
              setBillData(null);
            }}
            type="numeric"
          />
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
              borderRadius: 5,
              backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
              padding: 10,
              height: 50,
              justifyContent: 'center',
            }}
            onPress={() => setShowModal(true)}>
            <Text
              style={{
                color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
                fontFamily: REGULAR_FONT,
              }}>
              {provider ? provider?.name : 'Pilih produk BPJS'}
            </Text>
          </TouchableOpacity>
          <View style={{marginTop: 5}}>
            <ModernButton
              label="Cek"
              onPress={handleCekTagihan}
              isLoading={loading}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
          {billData && (
            <View style={styles.infoPelanggan(isDarkMode)}>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Ref ID</Text>
                <Text style={styles.value(isDarkMode)}>{billData.ref_id || '-'}</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Nama Pelanggan</Text>
                <Text style={styles.value(isDarkMode)}>{billData.customer_name || billData.nama || '-'}</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>ID Pelanggan</Text>
                <Text style={styles.value(isDarkMode)}>{billData.customer_no}</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Jumlah Peserta</Text>
                <Text style={styles.value(isDarkMode)}>{billData.desc?.jumlah_peserta || '-'}</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Lembar Tagihan</Text>
                <Text style={styles.value(isDarkMode)}>{billData.desc?.lembar_tagihan || billData.lembar_tagihan || '-'} lbr</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Total Tagihan</Text>
                <Text style={styles.value(isDarkMode)}>Rp. {(billData.selling_price || billData.price || 0).toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Status</Text>
                <Text style={styles.value(isDarkMode)}>{billData.status || '-'}</Text>
              </View>
            </View>
          )}

          {billData && (
            <View style={{marginTop: 15}}>
              <ModernButton
                label="Bayar Tagihan"
                onPress={handleBayarTagihan}
                isLoading={isProcessing && !showModalConfirm}
              />
            </View>
          )}
        </ScrollView>
      </View>

      <BottomModal
        visible={showModalConfirm}
        onDismis={() => setShowModalConfirm(false)}
        title="Detail Transaksi">
        <TransactionDetail
          destination={billData?.customer_no}
          product={provider?.name}
          description={billData?.customer_name || billData?.nama}
          price={billData?.selling_price || billData?.price}
          onConfirm={() => confirmPayment(billData)}
          onCancel={() => setShowModalConfirm(false)}
          isLoading={isProcessing}
          availablePoints={user?.points || 0}
          usePoints={usePoints}
          onTogglePoints={() => setUsePoints(!usePoints)}
        />
      </BottomModal>

      <BottomModal
        visible={showModal}
        onDismis={() => setShowModal(false)}
        title="Produk BPJS">
        <View style={{marginTop: 15, maxHeight: 400}}>
          <FlatList
            data={products}
            refreshing={loadingProducts}
            onRefresh={fetchProducts}
            renderItem={({item}) => (
              <TouchableOpacity
                key={item.sku}
                style={styles.layananButton(isDarkMode)}
                onPress={() => handleSetProvider(item)}>
                <Text style={styles.textOption(isDarkMode)}>{item.name}</Text>
                <ArrowRight />
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={{padding: 20, alignItems: 'center'}}>
                {loadingProducts ? (
                  <ActivityIndicator color={BLUE_COLOR} />
                ) : (
                  <Text style={{color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}}>No products found</Text>
                )}
              </View>
            )}
          />
        </View>
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: 15,
  },
  formGroup: {
    flexDirection: 'column',
    rowGap: 5,
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
    fontSize: FONT_SEDANG,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  value: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  layananButton: isDarkMode => ({
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    padding: 10,
    justifyContent: 'space-between',
  }),
  textOption: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
});
