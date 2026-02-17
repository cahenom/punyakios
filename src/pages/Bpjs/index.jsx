import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import {Alert} from '../../utils/alert';
import React, {useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import {
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
} from '../../utils/const';
import Input from '../../components/form/Input';
import { makeCekTagihanCall, makeBayarTagihanCall } from '../../helpers/apiBiometricHelper';
import CustomHeader from '../../components/CustomHeader';
import ModernButton from '../../components/ModernButton';

export default function BpjsKesehatan() {
  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';

  const [customer_no, setCustomerNo] = useState('');
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCekTagihan = async () => {
    if (!customer_no.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor VA Keluarga');
      return;
    }

    setLoading(true);

    try {
      const response = await makeCekTagihanCall({
        sku: 'bpjs',
        customer_no: customer_no
      }, 'Verifikasi sidik jari atau wajah untuk melihat tagihan BPJS');

      if (response.status === 'Sukses') {
        setBillData(response.data);
      } else {
        Alert.alert('Error', response.message || 'Gagal mengambil data tagihan');
      }
    } catch (error) {
      console.error('Error checking BPJS bill:', error);
      if (error.message !== 'Biometric authentication failed') {
        Alert.alert('Error', error.response?.data?.message || `Gagal menghubungi server: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBayarTagihan = async (data) => {
    if (!data) return;
    
    setIsProcessing(true);
    try {
      const response = await makeBayarTagihanCall({
        sku: 'bpjs',
        customer_no: data.customer_no,
        ref_id: data.ref_id,
      }, 'Verifikasi sidik jari atau biometric wajah untuk membayar tagihan BPJS');

      // Navigate to success screen
      navigation.navigate('SuccessNotif', {
        item: {
          ...response,
          customer_no: data.customer_no,
          ref: data.ref_id,
          tujuan: data.customer_no,
          sku: 'bpjs',
          status: response.status || 'Sukses',
          message: response.message || 'Transaksi Sukses',
          price: data.selling_price || data.price,
          sn: data.ref_id,
        },
        product: {
          product_name: 'BPJS Kesehatan',
          name: 'BPJS Kesehatan',
          label: 'BPJS Kesehatan',
          product_seller_price: `Rp ${(data.selling_price || data.price)?.toLocaleString('id-ID')}`,
          price: `Rp ${(data.selling_price || data.price)?.toLocaleString('id-ID')}`
        },
      });
    } catch (error) {
      console.error('Error paying BPJS bill:', error);
      // Error will be handled by global interceptor
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
              <Text style={styles.label(isDarkMode)}>Status</Text>
              <Text style={styles.value(isDarkMode)}>{billData.status || '-'}</Text>
            </View>
            <View style={styles.contentBlock(isDarkMode)}>
              <Text style={styles.label(isDarkMode)}>Total Tagihan</Text>
              <Text style={styles.value(isDarkMode)}>Rp. {(billData.selling_price || billData.price || 0).toLocaleString('id-ID')}</Text>
            </View>
          </View>
        )}
      </View>

      {billData && (
        <View style={styles.bottomInline(isDarkMode)}>
          <ModernButton
            label="Bayar Tagihan"
            onPress={() => handleBayarTagihan(billData)}
            isLoading={isProcessing}
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
    color: isDarkMode ? LIGHT_COLOR : DARK_COLOR,
  }),
  value: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
    color: isDarkMode ? LIGHT_COLOR : DARK_COLOR,
  }),
  bottomInline: isDarkMode => ({
    marginHorizontal: HORIZONTAL_MARGIN,
    marginBottom: 20,
    marginTop: 10,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
  }),
});
