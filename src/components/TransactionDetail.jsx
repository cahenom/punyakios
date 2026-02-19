import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import ModernButton from './ModernButton';
import {
  DARK_COLOR,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  BLUE_COLOR,
} from '../utils/const';
import {numberWithCommas} from '../utils/formatter';

const TransactionDetail = ({ 
  destination, 
  product, 
  description, 
  price, 
  onConfirm, 
  onCancel, 
  isLoading 
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  // Fallback to empty strings if props are missing
  const displayDestination = destination || '-';
  const displayProduct = product || '-';
  const displayDescription = description || '-';
  
  const formatPrice = (val) => {
    if (!val) return 'Rp 0';
    if (typeof val === 'string' && val.includes('Rp')) return val;
    return `Rp ${numberWithCommas(val)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Tujuan</Text>
        <Text style={[styles.detailValue, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>
          {displayDestination}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Produk</Text>
        <Text style={[styles.detailValue, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>
          {displayProduct}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Keterangan</Text>
        <Text style={[styles.detailValue, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>
          {displayDescription}
        </Text>
      </View>
      
      <View style={[styles.detailRow, {borderBottomWidth: 0}]}>
        <Text style={styles.detailLabel}>Total Harga</Text>
        <Text style={[styles.detailValue, {color: BLUE_COLOR, fontWeight: '700', fontSize: 18}]}>
          {formatPrice(price)}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <ModernButton
          label="Bayar Sekarang"
          onPress={onConfirm}
          isLoading={isLoading}
        />
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 20,
    paddingTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: REGULAR_FONT,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: MEDIUM_FONT,
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  buttonContainer: {
    marginTop: 25,
    rowGap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontFamily: MEDIUM_FONT,
  },
});

export default TransactionDetail;