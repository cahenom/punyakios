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
import FullModal from '../../components/FullModal';
import {ArrowRight} from '../../assets';
import {Alert} from '../../utils/alert';
import {makeCekTagihanCall, makeBayarTagihanCall} from '../../helpers/apiBiometricHelper';
import BottomModal from '../../components/BottomModal';
import TransactionDetail from '../../components/TransactionDetail';
import { useNavigation } from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {api} from '../../utils/api';

export default function PDAM() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const [customer_no, setCustomerNo] = useState('');
  const [showModalWilayah, setShowModalWilayah] = useState(false);
  const [wilayahPdam, setWilayah] = useState(null);
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
      const response = await api.post('/api/product/pdam');
      if (response.data.status === 'success') {
        setProducts(response.data.data.pdam || []);
      }
    } catch (error) {
      console.error('Error fetching PDAM products:', error?.message || String(error));
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSetWilayah = item => {
    setWilayah(item);
    setShowModalWilayah(!showModalWilayah);
    if (billData) setBillData(null);
  };

  const handleCekTagihan = async () => {
    if (!customer_no.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor pelanggan');
      return;
    }
    if (!wilayahPdam) {
      Alert.alert('Error', 'Silakan pilih wilayah PDAM');
      return;
    }

    setLoading(true);
    try {
      const response = await makeCekTagihanCall({
        sku: wilayahPdam.sku,
        customer_no: customer_no
      }, `Verifikasi untuk melihat tagihan PDAM ${wilayahPdam.name}`);

      if (response.data) {
        setBillData(response.data);
        if (response.status !== 'Sukses' && response.message !== 'tagihan berhasil di cek') {
          Alert.alert('Info', response.message || 'Gagal mengambil data tagihan');
        }
      } else {
        Alert.alert('Error', response.message || 'Gagal mengambil data tagihan');
      }
    } catch (error) {
      console.error('Error checking PDAM bill:', error?.message || String(error));
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
        sku: wilayahPdam.sku,
        customer_no: data.customer_no,
        ref_id: data.ref_id,
        use_points: usePoints,
      }, `Verifikasi untuk membayar tagihan PDAM ${wilayahPdam.name}`);

      setShowModalConfirm(false);

      navigation.navigate('SuccessNotif', {
        item: {
          ...response,
          customer_no: data.customer_no,
          ref: data.ref_id,
          tujuan: data.customer_no,
          sku: wilayahPdam.sku || 'pdam',
          status: response.status || 'Sukses',
          message: response.message || 'Transaksi Sukses',
          price: data.selling_price || data.price,
          sn: data.ref_id,
        },
        product: {
          product_name: wilayahPdam.name,
          name: wilayahPdam.name,
          label: wilayahPdam.name,
          product_seller_price: `Rp ${(data.selling_price || data.price)?.toLocaleString('id-ID')}`,
          price: `Rp ${(data.selling_price || data.price)?.toLocaleString('id-ID')}`
        },
      });
    } catch (error) {
      console.error('Error paying PDAM bill:', error?.message || String(error));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title="PDAM" />
      <View style={[styles.container, {flex: 1}]}>
        <View style={styles.formGroup}>
          <Input
            value={customer_no}
            placeholder="Masukan nomor meter"
            onchange={text => {
              setCustomerNo(text);
              // reset bill info here when real integration is added
            }}
            ondelete={() => setCustomerNo('')}
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
            onPress={() => setShowModalWilayah(!showModalWilayah)}>
            <Text
              style={{
                color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
                fontFamily: REGULAR_FONT,
              }}>
              {wilayahPdam ? wilayahPdam?.name : 'Pilih Wilayah'}
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
                <Text style={styles.label(isDarkMode)}>Wilayah</Text>
                <Text style={styles.value(isDarkMode)}>{wilayahPdam?.name}</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Total Tagihan</Text>
                <Text style={styles.value(isDarkMode)}>Rp. {(billData.selling_price || billData.price || 0).toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Admin</Text>
                <Text style={styles.value(isDarkMode)}>Rp. {(billData.admin || 0).toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Status</Text>
                <Text style={styles.value(isDarkMode)}>{billData.status || '-'}</Text>
              </View>
              <View style={styles.contentBlock(isDarkMode)}>
                <Text style={styles.label(isDarkMode)}>Pesan</Text>
                <Text style={styles.value(isDarkMode)}>{billData.message || '-'}</Text>
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

      {/* Modal removed from ScrollView and placed here */}

      <BottomModal
        visible={showModalConfirm}
        onDismis={() => setShowModalConfirm(false)}
        title="Detail Transaksi">
        <TransactionDetail
          destination={billData?.customer_no}
          product={wilayahPdam?.name}
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
        visible={showModalWilayah}
        onDismis={() => setShowModalWilayah(!showModalWilayah)}
        title="Wilayah PDAM">
        <View style={{marginTop: 15, maxHeight: 400}}>
          <FlatList
            data={products}
            refreshing={loadingProducts}
            onRefresh={fetchProducts}
            renderItem={({item}) => (
              <TouchableOpacity
                key={item.sku}
                style={styles.layananButton(isDarkMode)}
                onPress={() => handleSetWilayah(item)}>
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
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: 15,
  },
  formGroup: {
    flexDirection: 'column',
    rowGap: 5,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    borderRadius: 5,
    padding: 15,
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
    fontSize: FONT_SEDANG,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  value: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),

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
