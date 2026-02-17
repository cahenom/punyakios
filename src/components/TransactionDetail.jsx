import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {useColorScheme} from 'react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  FONT_SEDANG,
  GREY_COLOR,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_BACKGROUND,
  WHITE_COLOR,
} from '../utils/const';
import ModernButton from './ModernButton';
import {numberWithCommas} from '../utils/formatter';

const TransactionDetail = ({
  destination,
  product,
  description,
  price,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.modalData(isDarkMode)}>
          <Text style={styles.labelModalData(isDarkMode)}>Nomor Tujuan</Text>
          <Text style={styles.valueModalData(isDarkMode)}>{destination}</Text>
        </View>
        <View style={styles.modalData(isDarkMode)}>
          <Text style={styles.labelModalData(isDarkMode)}>Produk</Text>
          <Text style={styles.valueModalData(isDarkMode)}>{product}</Text>
        </View>
        {description && (
          <View style={styles.modalData(isDarkMode)}>
            <Text style={styles.labelModalData(isDarkMode)}>Deskripsi</Text>
            <Text style={styles.valueModalData(isDarkMode)}>{description}</Text>
          </View>
        )}
        <View style={styles.modalData(isDarkMode)}>
          <Text style={styles.labelModalData(isDarkMode)}>Harga Total</Text>
          <Text style={[styles.valueModalData(isDarkMode), {color: BLUE_COLOR, fontWeight: '700', fontSize: 18}]}>
            {typeof price === 'string' && price.includes('Rp') ? price : `Rp ${numberWithCommas(price)}`}
          </Text>
        </View>
      </View>
      <View style={styles.bottom(isDarkMode)}>
        <ModernButton
          label="Bayar Sekarang"
          onPress={onConfirm}
          isLoading={isLoading}
        />
        {onCancel && (
          <TouchableOpacity 
            onPress={onCancel} 
            style={{marginTop: 10, paddingVertical: 10}}
            disabled={isLoading}
          >
            <Text style={{
              textAlign: 'center', 
              color: isDarkMode ? '#94a3b8' : '#64748b',
              fontFamily: MEDIUM_FONT
            }}>
              Batalkan Transaksi
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30, // Increased bottom padding
    paddingTop: 10,    // Added top padding
  },
  content: {
    paddingHorizontal: 10,
  },
  bottom: isDarkMode => ({
    backgroundColor: 'transparent',
    paddingTop: 30,    // Increased spacing before button
    marginTop: 15,
  }),
  modalData: isDarkMode => ({
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    paddingVertical: 18, // Increased vertical padding for rows
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  labelModalData: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 15, // Slightly larger font
    color: isDarkMode ? '#94a3b8' : '#64748b',
  }),
  valueModalData: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 16, // Slightly larger font
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  }),
});

export default TransactionDetail;
