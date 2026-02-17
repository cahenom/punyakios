import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import ModernButton from '../../components/ModernButton';
import {
  DARK_BACKGROUND,
  WHITE_BACKGROUND,
  DARK_COLOR,
  LIGHT_COLOR,
  BOLD_FONT,
  MEDIUM_FONT,
  REGULAR_FONT,
  BLUE_COLOR,
  SLATE_COLOR,
} from '../../utils/const';

const PaymentSuccessPage = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const route = useRoute();

  const { paymentDetails } = route.params || {};

  const handleDone = () => {
    navigation.navigate('MyTabs');
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
      <CustomHeader title="Pembayaran Berhasil" />
      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={[styles.successTitle, {color: '#10b981'}]}>Pembayaran Berhasil!</Text>
        <Text style={[styles.successMessage, {color: isDarkMode ? SLATE_COLOR : '#64748b'}]}>
          Transaksi Anda telah berhasil diproses.
        </Text>

        <View style={[styles.paymentSummary, {backgroundColor: isDarkMode ? '#1e293b' : '#fff'}]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {color: isDarkMode ? SLATE_COLOR : '#666'}]}>Penerima</Text>
            <Text style={[styles.summaryValue, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{paymentDetails?.name || '-'}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {color: isDarkMode ? SLATE_COLOR : '#666'}]}>ID Transaksi</Text>
            <Text style={[styles.summaryValue, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{paymentDetails?.id || '-'}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {color: isDarkMode ? SLATE_COLOR : '#666'}]}>Tujuan</Text>
            <Text style={[styles.summaryValue, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{paymentDetails?.destination || '-'}</Text>
          </View>

          <View style={[styles.summaryRow, {borderBottomWidth: 0}]}>
            <Text style={[styles.summaryLabel, {color: isDarkMode ? SLATE_COLOR : '#666'}]}>Total Pembayaran</Text>
            <Text style={[styles.summaryValuePrice, {color: BLUE_COLOR}]}>
              Rp {paymentDetails?.price ? parseFloat(paymentDetails.price).toLocaleString('id-ID') : '0'}
            </Text>
          </View>
        </View>

        <ModernButton
          label="Selesai"
          onPress={handleDone}
          style={{width: '100%'}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkIcon: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 22,
    fontFamily: BOLD_FONT,
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    fontFamily: REGULAR_FONT,
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 22,
  },
  paymentSummary: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  },
  summaryValue: {
    fontSize: 15,
    fontFamily: MEDIUM_FONT,
    textAlign: 'right',
    flex: 1,
    marginLeft: 15,
  },
  summaryValuePrice: {
    fontSize: 18,
    fontFamily: BOLD_FONT,
    textAlign: 'right',
    flex: 1,
    marginLeft: 15,
  },
});

export default PaymentSuccessPage;