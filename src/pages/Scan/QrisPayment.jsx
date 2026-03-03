import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  WHITE_BACKGROUND,
  WHITE_COLOR,
  BOLD_FONT,
  REGULAR_FONT,
  MEDIUM_FONT,
} from '../../utils/const';
import {CheckProduct} from '../../assets';
import Input from '../../components/form/Input';
import CustomHeader from '../../components/CustomHeader';
import BottomButton from '../../components/BottomButton';
import BottomModal from '../../components/BottomModal';
import TransactionDetail from '../../components/TransactionDetail';
import {api} from '../../utils/api';
import {useAuth} from '../../context/AuthContext';
import {useAlert} from '../../context/AlertContext';
import { makeTopupCall } from '../../helpers/apiBiometricHelper';

export default function QrisPayment({navigation, route}) {
  const isDarkMode = useColorScheme() === 'dark';
  const {user, refreshUserProfile} = useAuth();
  const {showAlert} = useAlert();
  const {qrisData} = route.params || {};
  
  const [amount, setAmount] = useState(qrisData?.amount || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (!qrisData) {
    navigation.goBack();
    return null;
  }

  const handlePayment = async () => {
    if (!amount) return;

    if (parseFloat(amount) < 100) {
      showAlert('Error', 'Minimal pembayaran Rp 100', 'error');
      return;
    }

    if (parseFloat(user.saldo) < parseFloat(amount)) {
      showAlert('Error', 'Saldo tidak mencukupi', 'error');
      return;
    }

    setIsProcessing(true);
    
    // Simulate a delay
    setTimeout(() => {
      setIsProcessing(false);
      setShowModal(false);
      showAlert(
        'Info Pembayaran',
        `Pembayaran ke ${qrisData.merchantName} sebesar Rp ${parseInt(amount).toLocaleString('id-ID')} sedang dalam pengembangan (menunggu regulasi)`,
        'info'
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title="Pembayaran QRIS" />
      <ScrollView style={{flex: 1}}>
        <View style={{marginHorizontal: HORIZONTAL_MARGIN, marginTop: 20}}>
          {/* Merchant Card */}
          <View style={[styles.card(isDarkMode), {backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'}]}>
            <View style={styles.merchantIcon}>
              <CheckProduct width={24} height={24} fill={WHITE_COLOR} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.label(isDarkMode)}>Merchant:</Text>
              <Text style={styles.merchantName(isDarkMode)}>{qrisData.merchantName}</Text>
              <Text style={styles.merchantCity(isDarkMode)}>{qrisData.merchantCity}</Text>
            </View>
          </View>

          <View style={{marginTop: 10}}>
            <Text style={styles.inputLabel(isDarkMode)}>Nominal Pembayaran</Text>
            <Input
              value={amount}
              placeholder="Masukan jumlah pembayaran"
              onchange={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
              type="number-pad"
              editable={!qrisData.amount} // Only allow input if amount is not fixed in QR
              autoFocus={true}
            />
            <Text style={styles.hint(isDarkMode)}>Minimal pembayaran Rp 100</Text>
          </View>
        </View>
      </ScrollView>

      {amount.length > 0 && (
        <BottomButton
          label="Bayar Sekarang"
          action={() => setShowModal(true)}
          isLoading={false}
        />
      )}

      <BottomModal
        visible={showModal}
        onDismis={() => setShowModal(false)}
        title="Konfirmasi Pembayaran">
        <TransactionDetail
          destination={qrisData.merchantName}
          product="Pembayaran QRIS"
          description={`Pembayaran ke ${qrisData.merchantName}`}
          price={amount}
          onConfirm={handlePayment}
          onCancel={() => setShowModal(false)}
          isLoading={isProcessing}
        />
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: isDarkMode => ({
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  }),
  merchantIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BLUE_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  label: isDarkMode => ({
    color: isDarkMode ? '#94a3b8' : '#64748b',
    fontSize: 12,
    fontFamily: REGULAR_FONT,
  }),
  merchantName: isDarkMode => ({
    color: isDarkMode ? DARK_COLOR : '#1e293b',
    fontSize: 18,
    fontFamily: BOLD_FONT,
  }),
  merchantCity: isDarkMode => ({
    color: isDarkMode ? '#94a3b8' : '#64748b',
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  }),
  inputLabel: isDarkMode => ({
    fontFamily: MEDIUM_FONT, 
    fontSize: 16, 
    color: isDarkMode ? DARK_COLOR : '#1e293b',
    marginBottom: 10,
  }),
  hint: isDarkMode => ({
    fontSize: 12, 
    color: isDarkMode ? '#94a3b8' : '#64748b', 
    marginTop: 8,
    fontFamily: REGULAR_FONT,
  }),
});
