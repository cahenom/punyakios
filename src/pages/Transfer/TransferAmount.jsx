import React, {useState} from 'react';
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
} from '../../utils/const';
import {UserDefault} from '../../assets';
import Input from '../../components/form/Input';
import CustomHeader from '../../components/CustomHeader';
import BottomButton from '../../components/BottomButton';
import BottomModal from '../../components/BottomModal';
import TransactionDetail from '../../components/TransactionDetail';
import {api} from '../../utils/api';
import {useAuth} from '../../context/AuthContext';
import {useAlert} from '../../context/AlertContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {makeTransferCall} from '../../helpers/apiBiometricHelper';

export default function TransferAmountPage({navigation, route}) {
  const isDarkMode = useColorScheme() === 'dark';
  const {user, refreshUserProfile} = useAuth();
  const {showAlert} = useAlert();
  const {recipient} = route.params || {};
  
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (!recipient) {
    navigation.goBack();
    return null;
  }

  const saveToHistory = async (newRecipient) => {
    try {
      const historyStr = await AsyncStorage.getItem('transfer_history');
      let history = historyStr ? JSON.parse(historyStr) : [];
      
      // Remove if exists
      history = history.filter(item => item.id !== newRecipient.id);
      
      // Add to beginning
      history.unshift({
        id: newRecipient.id,
        name: newRecipient.name,
        phone: newRecipient.phone,
        timestamp: Date.now(),
      });
      
      // Limit to 10
      history = history.slice(0, 10);
      
      await AsyncStorage.setItem('transfer_history', JSON.stringify(history));
    } catch (error) {
      console.log('Error saving history:', error);
    }
  };

  const handleTransfer = async () => {
    if (!recipient || !amount) return;

    if (parseFloat(amount) < 1) {
      showAlert('Error', 'Minimal transfer Rp 1', 'error');
      return;
    }

    if (parseFloat(user.saldo) < parseFloat(amount)) {
      showAlert('Error', 'Saldo tidak mencukupi', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await makeTransferCall({
        phone: recipient.phone,
        amount: parseFloat(amount),
      });

      if (response.status === 'success') {
        setShowModal(false);
        await saveToHistory(recipient);
        await refreshUserProfile();
        
        navigation.navigate('TransactionResult', {
          item: {
            ref: 'TRF-' + Date.now(),
            tujuan: recipient.phone,
            sku: 'TRANSFER_BALANCE',
            produk: 'Transfer Saldo',
            status: 'Sukses',
            message: 'Sukses',
            sn: 'Transfer ke ' + recipient.name,
            price: parseFloat(amount),
            type: 'transfer_out',
            created_at: new Date().toISOString(),
          },
          product: {
            produk: 'Transfer Saldo',
            name: 'Transfer ke ' + recipient.name,
            price: parseFloat(amount),
          },
        });
      }
    } catch (error) {
      console.log('Transfer error:', error);
      setShowModal(false);
      if (error.message !== 'Biometric authentication failed') {
        showAlert('Gagal', error.response?.data?.message || 'Gagal memproses transfer');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title="Input Nominal" />
      <ScrollView style={{flex: 1}}>
        <View style={{marginHorizontal: HORIZONTAL_MARGIN, marginTop: 20}}>
          {/* Recipient Card */}
          <View style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
            padding: 20,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 25
          }}>
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: BLUE_COLOR,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 15
            }}>
              <UserDefault width={24} height={24} color={WHITE_COLOR} />
            </View>
            <View>
              <Text style={{color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}}>Transfer ke:</Text>
              <Text style={{color: isDarkMode ? DARK_COLOR : LIGHT_COLOR, fontSize: 18, fontWeight: 'bold'}}>{recipient.name}</Text>
              <Text style={{color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 14}}>{recipient.phone}</Text>
            </View>
          </View>

          <View>
            <Text style={{
              fontFamily: 'Medium', 
              fontSize: 16, 
              color: isDarkMode ? LIGHT_COLOR : DARK_COLOR,
              marginBottom: 10
            }}>Nominal Transfer</Text>
            <Input
              value={amount}
              placeholder="Masukan jumlah transfer"
              onchange={(text) => setAmount(text)}
              type="numeric"
              autoFocus={true}
            />
            <Text style={{
              fontSize: 12, 
              color: isDarkMode ? '#94a3b8' : '#64748b', 
              marginTop: 8
            }}>Minimal transfer Rp 100</Text>
          </View>
        </View>
      </ScrollView>

      {amount.length > 0 && (
        <BottomButton
          label="Lanjutkan"
          action={() => setShowModal(true)}
          isLoading={false}
        />
      )}

      <BottomModal
        visible={showModal}
        onDismis={() => setShowModal(false)}
        title="Konfirmasi Transfer">
        <TransactionDetail
          destination={recipient.phone}
          product="Transfer Saldo"
          description={`Transfer ke ${recipient.name}`}
          price={amount}
          onConfirm={handleTransfer}
          onCancel={() => setShowModal(false)}
          isLoading={isProcessing}
        />
      </BottomModal>
    </SafeAreaView>
  );
}
