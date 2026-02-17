import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Share,
  Clipboard,
  TouchableOpacity,
} from 'react-native';
import {Alert} from '../../utils/alert';
import React from 'react';
import LottieView from 'lottie-react-native';
import CustomHeader from '../../components/CustomHeader';
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
  BLUE_COLOR,
  WHITE_COLOR,
  BOLD_FONT,
} from '../../utils/const';

const {width} = Dimensions.get('window');

export default function SuccessNotif({route}) {
  const {item = {}, product = {}} = route.params || {};

  console.log('[SUCCESS DEBUG] Received route.params.item:', JSON.stringify(item, null, 2));
  console.log('[SUCCESS DEBUG] Received route.params.product:', JSON.stringify(product, null, 2));

  const isDarkMode = useColorScheme() === 'dark';

  const responseData = item?.data || item;
  const status = (responseData?.status || item?.status || 'Berhasil').toLowerCase();

  const isFailed = ['gagal', 'failed', 'error', 'none'].includes(status);
  const isPending = ['pending', 'diproses', 'processing'].includes(status);

  const getStatusColor = () => {
    if (isFailed) return '#EF4444';
    if (isPending) return '#F59E0B';
    return '#01C1A2';
  };

  const renderDetailRow = (label, value, isCopyable = false, onCopy = null) => {
    if (value === undefined || value === null || value === '' || value === '-') return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.labelDetail(isDarkMode)}>{label}</Text>
        <View style={{flex: 1.5, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
          <Text style={[styles.valueDetail(isDarkMode), {flex: isCopyable ? 0 : 1.5, marginRight: isCopyable ? 8 : 0}]}>
            {String(value)}
          </Text>
          {isCopyable && (
            <TouchableOpacity onPress={onCopy} activeOpacity={0.6}>
              <View style={[styles.copyIcon, {backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}]}>
                <Text style={{fontSize: 10, color: isDarkMode ? '#94a3b8' : '#64748b', fontFamily: BOLD_FONT}}>SALIN</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const getPrice = () => {
    const priceValue = responseData?.price ?? item?.price ?? product?.price ?? product?.product_seller_price;
    if (priceValue === undefined || priceValue === null || priceValue === '-') return '-';
    
    if (typeof priceValue === 'number') {
      return `Rp ${priceValue.toLocaleString('id-ID')}`;
    }
    
    if (typeof priceValue === 'string') {
      const parsed = parseFloat(priceValue.replace(/[^0-9]/g, ''));
      if (!isNaN(parsed)) {
        return `Rp ${parsed.toLocaleString('id-ID')}`;
      }
      return priceValue.includes('Rp') ? priceValue : `Rp ${priceValue}`;
    }
    
    return priceValue;
  };

  const formattedPrice = getPrice();

  const getFormattedDate = (dateVal) => {
    if (!dateVal || dateVal === '-') return null;
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return dateVal;
    
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onShare = async () => {
    try {
      const shareMessage = `*Bukti Transaksi*\n\nProduk: ${responseData?.produk || item?.produk || product?.produk || 'Transaksi'}\nStatus: ${status.toUpperCase()}\nNomor Tujuan: ${responseData?.tujuan || item?.tujuan || item?.customer_no || '-'}\nRef ID: ${responseData?.ref || responseData?.ref_id || item?.ref || '-'}\nSN: ${responseData?.sn || item?.sn || '-'}\nTotal: ${formattedPrice}\nWaktu: ${getFormattedDate(responseData?.created_at || item?.created_at)}\n\nTerima kasih.`;
      
      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const onCopyValue = (value, label) => {
    if (value && value !== '-') {
      Clipboard.setString(value);
      Alert.alert('Berhasil', `${label} berhasil disalin ke clipboard`);
    }
  };

  const onPrint = () => {
    Alert.alert(
      'Cetak Struk',
      'Fitur cetak struk memerlukan koneksi Bluetooth ke printer thermal. Pastikan printer Anda sudah terhubung.',
      [
        {text: 'Batal', style: 'cancel'},
        {text: 'Cetak', onPress: () => console.log('Print requested')},
      ]
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      }}>
      <CustomHeader title="Detail Transaksi" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
        <View style={styles.receiptContainer}>
          <View
            style={[
              styles.receiptCard,
              {backgroundColor: isDarkMode ? '#1e293b' : WHITE_COLOR},
            ]}>
            <View style={styles.animationHeader}>
              <View style={styles.lottieWrapper}>
                {isFailed ? (
                  <LottieView
                    source={require('../../assets/lottie/gagal-animation.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                  />
                ) : isPending ? (
                  <LottieView
                    source={require('../../assets/lottie/pending-animation.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                  />
                ) : (
                  <LottieView
                    source={require('../../assets/lottie/success-animation.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                  />
                )}
              </View>
              <Text style={[styles.statusMainText, {color: getStatusColor()}]}>
                Transaksi {isFailed ? 'Gagal' : isPending ? 'Sedang Diproses' : 'Berhasil'}
              </Text>
              <Text style={styles.productName(isDarkMode)}>
                {responseData?.produk || item?.produk || product?.produk || 'Transaksi'}
              </Text>
              <Text style={styles.mainAmount(isDarkMode)}>{formattedPrice}</Text>
            </View>

            <View style={styles.dividerWrapper}>
              <View style={[styles.dot, styles.dotLeft, {backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'}]} />
              <View style={[styles.dashedLine, {borderColor: isDarkMode ? '#334155' : '#e2e8f0'}]} />
              <View style={[styles.dot, styles.dotRight, {backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'}]} />
            </View>

            <View style={styles.detailsSection}>
              {renderDetailRow('Nomor Tujuan', item?.customer_no || responseData?.customer_no || responseData?.tujuan || item?.tujuan)}
              {renderDetailRow('Produk', responseData?.produk || item?.produk || product?.produk)}
              {renderDetailRow('SKU', responseData?.sku || item?.sku)}
              {renderDetailRow('Harga', formattedPrice)}
              {renderDetailRow('Status', responseData?.message || item?.message)}
              {renderDetailRow('Waktu', getFormattedDate(responseData?.created_at || item?.created_at))}
              {renderDetailRow('Ref ID', responseData?.ref || responseData?.ref_id || item?.ref || item?.ref_id, true, () => onCopyValue(responseData?.ref || responseData?.ref_id || item?.ref || item?.ref_id, 'Ref ID'))}
            </View>
          </View>

          <View
            style={[
              styles.secondaryCard,
              {backgroundColor: isDarkMode ? '#1e293b' : WHITE_COLOR},
            ]}>
            <View style={styles.keteranganHeader}>
              <Text style={styles.labelDetail(isDarkMode)}>Keterangan</Text>
              <TouchableOpacity 
                onPress={() => onCopyValue(responseData?.sn || item?.sn || item?.serial_number || responseData?.serial_number, 'Keterangan')} 
                activeOpacity={0.6}
              >
                <View style={[styles.copyIcon, {backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}]}>
                  <Text style={{fontSize: 10, color: isDarkMode ? '#94a3b8' : '#64748b', fontFamily: BOLD_FONT}}>SALIN</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.keteranganValue(isDarkMode)}>
              {String(responseData?.sn || item?.sn || item?.serial_number || responseData?.serial_number || '-')}
            </Text>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: isDarkMode ? '#1e293b' : WHITE_COLOR}]}
              onPress={onShare}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, {color: isDarkMode ? WHITE_COLOR : '#3e516dff'}]}>Bagikan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: BLUE_COLOR}]}
              onPress={onPrint}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, {color: WHITE_COLOR}]}>Print Struk</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            Terima kasih telah menggunakan layanan kami. Simpan struk ini sebagai bukti transaksi yang sah.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  receiptContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  receiptCard: {
    borderRadius: 24,
    paddingVertical: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  secondaryCard: {
    borderRadius: 20,
    paddingVertical: 20,
    marginTop: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    paddingHorizontal: 25,
  },
  keteranganHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  keteranganValue: isDarkMode => ({
    fontSize: 14,
    fontFamily: MEDIUM_FONT,
    color: isDarkMode ? WHITE_COLOR : '#607693ff',
    lineHeight: 22,
  }),
  animationHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  lottieWrapper: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  statusMainText: {
    fontSize: 20,
    fontFamily: BOLD_FONT,
    marginBottom: 8,
  },
  productName: isDarkMode => ({
    fontSize: 14,
    fontFamily: MEDIUM_FONT,
    color: isDarkMode ? '#94a3b8' : '#64748b',
    marginBottom: 4,
  }),
  mainAmount: isDarkMode => ({
    fontSize: 28,
    fontFamily: BOLD_FONT,
    color: isDarkMode ? WHITE_COLOR : DARK_COLOR,
  }),
  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    overflow: 'hidden',
  },
  dashedLine: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
    marginHorizontal: 15,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  dotLeft: {
    left: -10,
  },
  dotRight: {
    right: -10,
  },
  detailsSection: {
    paddingHorizontal: 25,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  labelDetail: isDarkMode => ({
    fontSize: 13,
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? '#94a3b8' : '#64748b',
    flex: 1,
  }),
  valueDetail: isDarkMode => ({
    fontSize: 13,
    fontFamily: MEDIUM_FONT,
    color: isDarkMode ? WHITE_COLOR : '#607693ff',
    flex: 1.5,
    textAlign: 'right',
  }),
  messageBox: {
    marginHorizontal: 25,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
  },
  messageLabel: isDarkMode => ({
    fontSize: 12,
    fontFamily: MEDIUM_FONT,
    color: isDarkMode ? '#64748b' : '#94a3b8',
    marginBottom: 4,
  }),
  messageValue: isDarkMode => ({
    fontSize: 12,
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? '#94a3b8' : '#64748b',
    lineHeight: 18,
  }),
  footerNote: {
    marginTop: 25,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: REGULAR_FONT,
    color: '#94a3b8',
    paddingHorizontal: 40,
    lineHeight: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    columnGap: 15,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: BOLD_FONT,
  },
  copyIcon: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
