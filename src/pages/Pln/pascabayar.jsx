import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {Alert} from '../../utils/alert';
import React, {useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_KECIL,
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
  WHITE_COLOR,
  windowWidth,
} from '../../utils/const';
import Input from '../../components/form/Input';
import {product_token} from '../../data/product_pln';
import {CheckProduct} from '../../assets';
import {api} from '../../utils/api';
import { makeCekTagihanCall, makeBayarTagihanCall } from '../../helpers/apiBiometricHelper';
import CustomHeader from '../../components/CustomHeader';
import ModernButton from '../../components/ModernButton';

export default function PLNPascabayar() {
  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';

  const [customer_no, setCustomerNo] = useState('');
  const [selectItem, setSelectItem] = useState(null);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCekTagihan = async () => {
    if (!customer_no.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor pelanggan');
      return;
    }

    setLoading(true);

    console.log('[PLN PASCA DEBUG] Initiating handleCekTagihan');
    console.log('[PLN PASCA DEBUG] current customer_no state:', customer_no);

    try {
      const response = await makeCekTagihanCall({
        sku: 'plnpascabayar', // Using the correct SKU for PLN postpaid
        customer_no: customer_no
      }, 'Verifikasi sidik jari atau wajah untuk melihat tagihan PLN');

      console.log('Cek tagihan response:', response); // Debug log

      if (response.status === 'Sukses') {
        setBillData(response.data);
      } else {
        Alert.alert('Error', response.message || 'Gagal mengambil data tagihan');
      }
    } catch (error) {
      console.error('Error checking bill:', error);
      if (error.message !== 'Biometric authentication failed') {
        Alert.alert('Error', error.response?.data?.message || `Gagal menghubungi server: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBayarTagihan = async (billData) => {
    console.log('[PLN PASCA DEBUG] Initiating handleBayarTagihan');
    console.log('[PLN PASCA DEBUG] billData passed:', JSON.stringify(billData, null, 2));

    try {
      const response = await makeBayarTagihanCall({
        sku: 'plnpascabayar',
        customer_no: billData.customer_no,
        ref_id: billData.ref_id, // Include the reference ID from the bill data
      }, 'Verifikasi sidik jari atau biometric wajah untuk membayar tagihan PLN');

      // Navigate to success screen with the response data
      navigation.navigate('SuccessNotif', {
        item: {
          ...response,
          customer_no: billData.customer_no,
          ref: billData.ref_id,
          tujuan: billData.customer_no,
          sku: 'plnpascabayar',
          status: response.status || 'Sukses',
          message: response.message || 'Transaksi Sukses',
          price: billData.selling_price || billData.price,
          sn: billData.ref_id, // Using ref_id as serial number
        },
        product: {
          product_name: 'PLN Pascabayar',
          name: 'PLN Pascabayar',
          label: 'PLN Pascabayar',
          product_seller_price: `Rp ${billData.selling_price?.toLocaleString('id-ID')}`,
          price: `Rp ${billData.selling_price?.toLocaleString('id-ID')}`
        },
      });
    } catch (error) {
      console.error('Error paying bill:', error);
      if (error.message !== 'Biometric authentication failed') {
        // Error will be handled by global interceptor
      }
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title="PLN Pascabayar" />
      
      <View style={styles.container}>
        <View style={styles.formGroup}>
          <Input
            value={customer_no}
            placeholder="Masukan nomor meter"
            onchange={text => {
              setCustomerNo(text);
              if (billData) setBillData(null); // Clear bill data if number changes
            }}
            ondelete={() => {
              setCustomerNo('');
              setBillData(null);
            }}
            type="numeric"
          />
          <View style={{marginTop: 10}}>
            <ModernButton
              label="Cek"
              onPress={handleCekTagihan}
              isLoading={loading}
            />
          </View>
        </View>

        {billData && (
          <View style={styles.infoPelanggan(isDarkMode)}>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Ref ID</Text>
              <Text style={styles.value(isDarkMode)}>{billData.ref_id}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Nama Pelanggan</Text>
              <Text style={styles.value(isDarkMode)}>{billData.customer_name}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>ID Pelanggan</Text>
              <Text style={styles.value(isDarkMode)}>{billData.customer_no}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Periode</Text>
              <Text style={styles.value(isDarkMode)}>{billData.periode}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Tarif / Daya</Text>
              <Text style={styles.value(isDarkMode)}>{billData.desc ? `${billData.desc.tarif} / ${billData.desc.daya} VA` : '-'}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Lembar Tagihan</Text>
              <Text style={styles.value(isDarkMode)}>{billData.desc ? `${billData.desc.lembar_tagihan} lbr` : '-'}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Tagihan Pokok</Text>
              <Text style={styles.value(isDarkMode)}>Rp. {(billData.price || 0).toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Harga Jual</Text>
              <Text style={styles.value(isDarkMode)}>Rp. {(billData.selling_price || 0).toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Admin</Text>
              <Text style={styles.value(isDarkMode)}>Rp. {(billData.admin || 0).toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Status</Text>
              <Text style={styles.value(isDarkMode)}>{billData.status}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Pesan</Text>
              <Text style={styles.value(isDarkMode)}>{billData.message}</Text>
            </View>
          </View>
        )}
      </View>

      {billData && (
        <View style={styles.bottomInline(isDarkMode)}>
          <ModernButton
            label="Bayar Tagihan"
            onPress={() => handleBayarTagihan(billData)}
            loading={isProcessing}
          />
        </View>
      )}
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
  disabledButton: {
    opacity: 0.6,
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
    color: isDarkMode ? LIGHT_COLOR : DARK_COLOR, // Changed to ensure contrast
  }),
  value: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
    color: isDarkMode ? LIGHT_COLOR : DARK_COLOR, // Changed to ensure contrast
  }),
  billingDetail: isDarkMode => ({
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
  }),
  sectionTitle: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: FONT_SEDANG,
    color: isDarkMode ? LIGHT_COLOR : DARK_COLOR, // Changed to ensure contrast
    marginBottom: 10,
  }),
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailCol: {
    flex: 1,
    paddingHorizontal: 5,
  },
  detailLabel: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_KECIL,
    color: isDarkMode ? LIGHT_COLOR : DARK_COLOR, // Changed to ensure contrast
    opacity: 0.7,
  }),
  detailValue: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_KECIL,
    color: isDarkMode ? LIGHT_COLOR : DARK_COLOR, // Changed to ensure contrast
  }),

  bottomInline: isDarkMode => ({
    marginHorizontal: HORIZONTAL_MARGIN,
    marginBottom: 20,
    marginTop: 10,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
  }),
  bottomButton: {
    backgroundColor: BLUE_COLOR,
    padding: 10,
    borderRadius: 5,
  },
});
