import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  useColorScheme,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PaymentRequestService from '../../services/PaymentRequestService';
import ModernButton from '../../components/ModernButton';
import {
  isBiometricRequiredForOrder,
  authenticateWithBiometrics,
} from '../../utils/biometricUtils';
import {
  DARK_BACKGROUND,
  WHITE_BACKGROUND,
  DARK_COLOR,
  LIGHT_COLOR,
  BOLD_FONT,
  MEDIUM_FONT,
  REGULAR_FONT,
  BLUE_COLOR,
  GREY_COLOR,
  SLATE_COLOR,
} from '../../utils/const';

const PaymentPage = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const route = useRoute();
  
  const { paymentRequest } = route.params || {};
  
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    name: paymentRequest?.name || '',
    id: paymentRequest?.id || '',
    destination: paymentRequest?.destination || '',
    price: paymentRequest?.price || 0,
    email: paymentRequest?.email || '',
  });

  const handleApprove = async () => {
    if (!paymentRequest?.id) {
      Alert.alert('Error', 'Payment request ID is missing');
      return;
    }

    // Biometric check
    const biometricRequired = await isBiometricRequiredForOrder();
    if (biometricRequired) {
      try {
        const biometricResult = await authenticateWithBiometrics(
          'Verifikasi identitas untuk memproses pembayaran',
        );
        if (!biometricResult) {
          Alert.alert('Dibatalkan', 'Verifikasi biometrik gagal. Pembayaran tidak diproses.');
          return;
        }
      } catch (error) {
        Alert.alert('Dibatalkan', 'Verifikasi biometrik gagal. Pembayaran tidak diproses.');
        return;
      }
    }

    setApproving(true);

    try {
      const response = await PaymentRequestService.approvePaymentRequest(paymentRequest.id);

      if (response.new_balance !== undefined) {
        Alert.alert(
          'Success',
          `Payment approved successfully! New balance: Rp ${response.new_balance.toLocaleString('id-ID')}`,
          [
            { text: 'OK', onPress: () => {
              navigation.navigate('PaymentSuccessPage', {
                paymentDetails: paymentDetails,
              });
            }}
          ]
        );
      } else {
        navigation.navigate('PaymentSuccessPage', {
          paymentDetails: paymentDetails,
        });
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      if (error.response?.data?.data?.error === 'Saldo tidak cukup') {
        Alert.alert(
          'Saldo Tidak Cukup',
          `${error.response.data.data.indonesian_message}\nSaldo saat ini: Rp ${error.response.data.data.current_balance.toLocaleString('id-ID')}\nJumlah yang dibutuhkan: Rp ${error.response.data.data.required_amount.toLocaleString('id-ID')}`
        );
      }
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    // Biometric check
    const biometricRequired = await isBiometricRequiredForOrder();
    if (biometricRequired) {
      try {
        const biometricResult = await authenticateWithBiometrics(
          'Verifikasi identitas untuk menolak pembayaran',
        );
        if (!biometricResult) {
          Alert.alert('Dibatalkan', 'Verifikasi biometrik gagal.');
          return;
        }
      } catch (error) {
        Alert.alert('Dibatalkan', 'Verifikasi biometrik gagal.');
        return;
      }
    }

    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menolak pembayaran ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            setRejecting(true);
            try {
              await PaymentRequestService.rejectPaymentRequest(paymentRequest.id);
              Alert.alert(
                'Berhasil',
                'Pembayaran berhasil ditolak.',
                [
                  { text: 'OK', onPress: () => {
                    navigation.goBack();
                  }}
                ]
              );
            } catch (error) {
              console.error('Error rejecting payment:', error);
            } finally {
              setRejecting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
      <CustomHeader title="Detail Pembayaran" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={[styles.paymentCard, {backgroundColor: isDarkMode ? '#1e293b' : '#fff'}]}>
          <View style={styles.detailRow}>
            <Text style={[styles.label, {color: isDarkMode ? SLATE_COLOR : '#666'}]}>Nama</Text>
            <Text style={[styles.value, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{paymentDetails.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, {color: isDarkMode ? SLATE_COLOR : '#666'}]}>ID Transaksi</Text>
            <Text style={[styles.value, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{paymentDetails.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, {color: isDarkMode ? SLATE_COLOR : '#666'}]}>Tujuan</Text>
            <Text style={[styles.value, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{paymentDetails.destination}</Text>
          </View>

          <View style={[styles.detailRow, {borderBottomWidth: 0}]}>
            <Text style={[styles.label, {color: isDarkMode ? SLATE_COLOR : '#666'}]}>Total Bayar</Text>
            <Text style={[styles.value, styles.price, {color: BLUE_COLOR}]}>
              Rp {parseFloat(paymentDetails.price).toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, {color: isDarkMode ? SLATE_COLOR : '#666'}]}>Email</Text>
            <Text style={[styles.value, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>{paymentDetails.email}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <ModernButton
            label="Proses Pembayaran"
            onPress={handleApprove}
            isLoading={approving}
            disabled={rejecting}
          />
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleReject}
            disabled={approving || rejecting}
          >
            <Text style={[styles.cancelButtonText, {color: isDarkMode ? SLATE_COLOR : '#64748b'}]}>Tolak Pembayaran</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  paymentCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  },
  value: {
    fontSize: 15,
    fontFamily: MEDIUM_FONT,
    textAlign: 'right',
    flex: 1,
    marginLeft: 15,
  },
  price: {
    fontSize: 18,
    fontFamily: BOLD_FONT,
  },
  buttonContainer: {
    marginTop: 10,
    rowGap: 12,
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: MEDIUM_FONT,
  },
});

export default PaymentPage;