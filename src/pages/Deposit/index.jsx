import React, {useState, useEffect} from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  FlatList,
  useColorScheme,
} from 'react-native';
import {depositService} from '../../services';
import CustomHeader from '../../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BOLD_FONT,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  REGULAR_FONT,
  WHITE_BACKGROUND,
  BLUE_COLOR,
  WHITE_COLOR,
  GREY_COLOR,
  SLATE_COLOR,
} from '../../utils/const';

import ModernButton from '../../components/ModernButton';
import { useNavigation } from '@react-navigation/native';

const DepositPage = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const {token} = useAuth();

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  // Load transaction history
  useEffect(() => {
    loadTransactionHistory();
  }, []);

  const loadTransactionHistory = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('user_transactions');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        if (Array.isArray(parsedData)) {
          // Filter for deposit transactions only
          const depositTransactions = parsedData
            .filter(
              transaction =>
                transaction.sku &&
                (transaction.sku.toLowerCase().includes('deposit') ||
                  transaction.sku.toLowerCase().includes('top up') ||
                  transaction.type === 'credit'),
            )
            .slice(0, 5); // Show only last 5 transactions

          setTransactions(depositTransactions);
        }
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
    }
  };

  const handleQuickAmountSelect = selectedAmount => {
    setAmount(selectedAmount.toString());
  };

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      Alert.alert('Error', 'Silakan masukkan nominal deposit yang valid');
      return;
    }

    setLoading(true);
    try {
      const response = await depositService.createDeposit(token, {
        amount: parseInt(amount),
      });

      if (response && response.status === true) {
        setInvoiceData(response.data);
        // Reset amount after successful creation
        setAmount('');
      } else {
        Alert.alert(
          'Error',
          response?.message || 'Gagal membuat invoice deposit',
        );
      }
    } catch (error) {
      console.error('Deposit error:', error);
      let errorMessage = 'Terjadi kesalahan saat membuat invoice deposit';

      if (error.response) {
        // Server responded with error status
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Error ${error.response.status}: Gagal membuat invoice`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage =
          'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    if (invoiceData?.payment_url) {
      navigation.navigate('PaymentWebView', {
        paymentUrl: invoiceData.payment_url,
        invoiceId: invoiceData.invoice_id,
        amount: invoiceData.amount,
      });
    }
  };

  const renderTransactionItem = ({item}) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionService}>
          {item.sku || item.product_name || 'Deposit'}
        </Text>
        <Text style={styles.transactionTime}>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString('id-ID')
            : 'Tanggal tidak tersedia'}
        </Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text style={styles.transactionAmount}>
          +Rp {item.price ? parseInt(item.price).toLocaleString('id-ID') : '0'}
        </Text>
        <Text
          style={[
            styles.transactionStatus,
            {
              color:
                item.status === 'Success' || item.status === 'BERHASIL'
                  ? '#10b981'
                  : '#f59e0b',
            },
          ]}>
          {item.status || 'Pending'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={getStyles(isDarkMode).container}>
      <CustomHeader title="Deposit Saldo" />
      <ScrollView contentContainerStyle={getStyles(isDarkMode).content} showsVerticalScrollIndicator={false}>

        <Text style={getStyles(isDarkMode).label}>Nominal Deposit</Text>
        <TextInput
          style={getStyles(isDarkMode).input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Masukkan nominal deposit"
          keyboardType="numeric"
          placeholderTextColor={isDarkMode ? SLATE_COLOR : GREY_COLOR}
        />

        <Text style={getStyles(isDarkMode).quickAmountLabel}>Pilihan Nominal Cepat:</Text>
        <View style={getStyles(isDarkMode).quickAmountContainer}>
          {quickAmounts.map((value, index) => (
            <TouchableOpacity
              key={index}
              style={[
                getStyles(isDarkMode).quickAmountButton,
                amount === value.toString() && getStyles(isDarkMode).selectedQuickAmount,
              ]}
              onPress={() => handleQuickAmountSelect(value)}>
              <Text style={[
                getStyles(isDarkMode).quickAmountText,
                amount === value.toString() && {color: WHITE_COLOR, fontWeight: '700'}
              ]}>
                {value.toLocaleString('id-ID')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ModernButton
          label="Buat Invoice"
          onPress={handleDeposit}
          isLoading={loading}
          style={{marginBottom: 20}}
        />

        {invoiceData && (
          <View style={getStyles(isDarkMode).invoiceSection}>
            <Text style={getStyles(isDarkMode).invoiceTitle}>Invoice Detail</Text>
            <View style={{rowGap: 8, marginBottom: 20}}>
              <View style={styles.detailRowAlt}>
                <Text style={getStyles(isDarkMode).invoiceText}>ID Invoice</Text>
                <Text style={[getStyles(isDarkMode).invoiceText, {fontWeight: '700'}]}>{invoiceData.invoice_id}</Text>
              </View>
              <View style={styles.detailRowAlt}>
                <Text style={getStyles(isDarkMode).invoiceText}>Nominal</Text>
                <Text style={[getStyles(isDarkMode).invoiceText, {fontWeight: '700', color: BLUE_COLOR}]}>Rp {parseInt(invoiceData.amount).toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.detailRowAlt}>
                <Text style={getStyles(isDarkMode).invoiceText}>Status</Text>
                <Text style={[getStyles(isDarkMode).invoiceText, {color: '#f59e0b'}]}>{invoiceData.status}</Text>
              </View>
            </View>

            <ModernButton
              label="Bayar Sekarang"
              onPress={handlePayNow}
              style={{marginBottom: 20}}
            />

            <Text style={getStyles(isDarkMode).bankTitle}>Instruksi Pembayaran:</Text>
            <View style={{rowGap: 5}}>
              <Text style={getStyles(isDarkMode).invoiceNote}>1. Klik tombol "Bayar Sekarang" untuk menuju halaman pembayaran.</Text>
              <Text style={getStyles(isDarkMode).invoiceNote}>2. Pilih metode pembayaran yang tersedia.</Text>
              <Text style={getStyles(isDarkMode).invoiceNote}>3. Selesaikan pembayaran sebelum batas waktu berakhir.</Text>
              <Text style={getStyles(isDarkMode).invoiceNote}>4. Saldo akan otomatis bertambah setelah verifikasi sukses.</Text>
            </View>
          </View>
        )}

        {/* Transaction History Section */}
        {transactions.length > 0 && (
          <View style={getStyles(isDarkMode).historySection}>
            <Text style={getStyles(isDarkMode).historyTitle}>Riwayat Terakhir</Text>
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
    marginBottom: 10,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  },
  input: {
    borderWidth: 1,
    borderColor: isDarkMode ? SLATE_COLOR : '#e2e8f0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: REGULAR_FONT,
    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: 20,
  },
  quickAmountLabel: {
    fontSize: 14,
    fontFamily: BOLD_FONT,
    marginBottom: 10,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
    textTransform: 'uppercase',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  quickAmountButton: {
    backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedQuickAmount: {
    backgroundColor: BLUE_COLOR,
    borderColor: BLUE_COLOR,
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  },
  buttonText: {
    color: WHITE_COLOR,
    fontSize: 16,
    fontFamily: BOLD_FONT,
  },
  invoiceSection: {
    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  invoiceTitle: {
    fontSize: 18,
    fontFamily: BOLD_FONT,
    marginBottom: 20,
    textAlign: 'center',
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  },
  invoiceText: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  },
  invoiceNote: {
    fontSize: 13,
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
    lineHeight: 18,
  },
  bankTitle: {
    fontSize: 15,
    fontFamily: BOLD_FONT,
    marginTop: 10,
    marginBottom: 8,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  },
  historySection: {
    marginTop: 30,
    paddingBottom: 40,
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
    marginBottom: 15,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  },
});

const styles = StyleSheet.create({
  detailRowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionService: {
    fontSize: 14,
    fontFamily: BOLD_FONT,
    marginBottom: 4,
    color: BLUE_COLOR,
  },
  transactionTime: {
    fontSize: 12,
    fontFamily: REGULAR_FONT,
    color: '#94a3b8',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontFamily: BOLD_FONT,
    color: '#10b981',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 12,
    fontFamily: BOLD_FONT,
  },
});

export default DepositPage;
