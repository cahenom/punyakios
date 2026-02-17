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

const TransactionDetailModal = ({ selectedProduct, onLanjut, onBatal }) => {
  const isDarkMode = useColorScheme() === 'dark';
  if (!selectedProduct) return null;

  return (
    <View style={styles.transactionModalContent}>
      <Text style={[styles.modalTitle, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>Detail Transaksi</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Nomor Tujuan</Text>
        <Text style={[styles.detailValue, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{selectedProduct.destination}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Paket</Text>
        <Text style={[styles.detailValue, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{selectedProduct.title}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Durasi</Text>
        <Text style={[styles.detailValue, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{selectedProduct.duration}</Text>
      </View>
      
      <View style={[styles.detailRow, {borderBottomWidth: 0}]}>
        <Text style={styles.detailLabel}>Harga Total</Text>
        <Text style={[styles.detailValue, {color: BLUE_COLOR, fontWeight: '700', fontSize: 18}]}>
          {typeof selectedProduct.price === 'string' && selectedProduct.price.includes('Rp') ? selectedProduct.price : `Rp ${numberWithCommas(selectedProduct.price)}`}
        </Text>
      </View>
      
      <View style={styles.modalButtons}>
        <ModernButton
          label="Bayar Sekarang"
          onPress={onLanjut}
          style={{flex: 1}}
        />
        <TouchableOpacity 
          style={styles.batalButton} 
          onPress={onBatal}
        >
          <Text style={styles.batalButtonText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionModalContent: {
    width: '100%',
    paddingBottom: 35, // Increased bottom padding
    paddingTop: 10,    // Added top padding
  },
  modalTitle: {
    fontSize: 22,      // Larger title
    fontFamily: MEDIUM_FONT,
    marginBottom: 35,  // More space after title
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18, // Increased row height
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,      // Larger label
    color: '#64748b',
    fontFamily: REGULAR_FONT,
  },
  detailValue: {
    fontSize: 16,      // Larger value
    fontFamily: MEDIUM_FONT,
    textAlign: 'right',
    flex: 1,
    marginLeft: 15,
  },
  modalButtons: {
    marginTop: 40,     // More space before buttons
    rowGap: 16,        // More space between buttons
  },
  batalButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  batalButtonText: {
    color: '#64748b',
    fontSize: 15,      // Larger font
    fontFamily: MEDIUM_FONT,
  },
});

export default TransactionDetailModal;