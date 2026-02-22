import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import ModernButton from './ModernButton';
import {
  DARK_COLOR,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  BLUE_COLOR,
  BOLD_FONT,
  WHITE_COLOR,
} from '../utils/const';
import {numberWithCommas} from '../utils/formatter';

const TransactionDetail = ({ 
  destination, 
  product, 
  description, 
  price, 
  onConfirm, 
  onCancel, 
  isLoading,
  availablePoints = 0,
  usePoints = false,
  onTogglePoints = () => {}
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
      <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight: 400}}>
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
            {formatPrice(usePoints ? Math.max(0, price - availablePoints) : price)}
          </Text>
        </View>

        {availablePoints > 0 && (
          <TouchableOpacity 
            style={styles.pointsToggle}
            onPress={onTogglePoints}
            activeOpacity={0.7}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 20, marginRight: 8}}>🪙</Text>
              <View>
                <Text style={styles.pointsLabel(isDarkMode)}>Gunakan {availablePoints} Poin</Text>
                <Text style={styles.pointsSublabel}>Potongan Harga Rp {numberWithCommas(availablePoints)}</Text>
              </View>
            </View>
            <View style={[styles.switch, usePoints && styles.switchOn]}>
              <View style={[styles.switchThumb, usePoints && styles.switchThumbOn]} />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
      
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
  pointsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.1)',
    marginTop: 10,
  },
  pointsLabel: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 14,
    color: isDarkMode ? '#cbd5e1' : '#334155',
  }),
  pointsSublabel: {
    fontFamily: REGULAR_FONT,
    fontSize: 11,
    color: '#f97316',
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#cbd5e1',
    padding: 2,
  },
  switchOn: {
    backgroundColor: '#f97316',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: WHITE_COLOR,
  },
  switchThumbOn: {
    transform: [{translateX: 20}],
  },
});

export default TransactionDetail;