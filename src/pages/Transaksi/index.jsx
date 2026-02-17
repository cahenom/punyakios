import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {Alert} from '../../utils/alert';
import {useNavigation} from '@react-navigation/native';
import {api} from '../../utils/api';
import CustomHeader from '../../components/CustomHeader';
import SkeletonCard from '../../components/SkeletonCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BOLD_FONT,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  FONT_SEDANG,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_COLOR,
  BLUE_COLOR,
  WHITE_BACKGROUND,
  GREY_COLOR,
} from '../../utils/const';

const Transaksi = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadCachedTransactions = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('user_transactions');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        // Ensure parsedData is an array
        if (Array.isArray(parsedData)) {
          setTransactions(parsedData);
        } else {
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }
      // Fetch fresh data after loading cache
      fetchTransactions();
    } catch (error) {
      console.error('Error loading cached transactions:', error);
      setTransactions([]);
      fetchTransactions(); // Still try to fetch fresh data
    } finally {
      setLoading(false);
    }
  };

  // Load cached transactions on component mount
  useEffect(() => {
    loadCachedTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Using POST method as suggested
      const response = await api.post('/api/user/transaksi');

      if (response.data.status) {
        // Handle the new API response structure
        let fetchedTransactions = response.data.data || [];

        // Ensure fetchedTransactions is an array
        if (!Array.isArray(fetchedTransactions)) {
          fetchedTransactions = [];
        }

        // Validate each transaction object to ensure required fields exist
        const validatedTransactions = fetchedTransactions.map(transaction => ({
          ref: transaction.ref || '-',
          tujuan: transaction.tujuan || '-',
          sku: transaction.sku || '-',
          produk: transaction.produk || '-',
          status: transaction.status || '-',
          message: transaction.message || '-',
          price:
            transaction.price !== undefined && transaction.price !== null
              ? typeof transaction.price === 'number'
                ? transaction.price
                : typeof transaction.price === 'string'
                ? parseFloat(transaction.price) || 0
                : 0
              : 0,
          sn: transaction.sn || '-',
          type: transaction.type || '-',
          created_at: transaction.created_at || '-',
        }));

        setTransactions(validatedTransactions);

        // Cache the transactions
        await AsyncStorage.setItem(
          'user_transactions',
          JSON.stringify(validatedTransactions),
        );
      } else {
        Alert.alert(
          'Error',
          response.data.message || 'Failed to fetch transactions',
        );
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Handle different error types
      if (error.response?.status === 405) {
        Alert.alert('Error', 'Gangguan jaringan. Silakan coba lagi nanti.');
      } else if (error.response?.status === 401) {
        Alert.alert('Error', 'Unauthorized access. Please login again.');
      } else if (error.response?.status === 404) {
        Alert.alert(
          'Error',
          'Endpoint not found. Please check API configuration.',
        );
      } else if (error.response?.status === 0) {
        Alert.alert(
          'Error',
          'Gangguan koneksi jaringan. Silakan periksa koneksi internet Anda.',
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message ||
            'Gangguan sistem. Silakan coba lagi nanti.',
        );
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const formatDate = dateString => {
    if (!dateString) {
      return '-';
    }
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusTheme = (status, isDarkMode) => {
    if (!status) {
      return {
        bg: isDarkMode ? '#1e293b' : '#f1f5f9',
        text: isDarkMode ? '#94a3b8' : '#64748b',
      };
    }

    const s = status.toLowerCase();
    if (['berhasil', 'sukses', 'success', 'completed'].includes(s)) {
      return {
        bg: isDarkMode ? 'rgba(1, 193, 162, 0.15)' : 'rgba(1, 193, 162, 0.1)',
        text: '#01C1A2',
      };
    }
    if (['gagal', 'failed', 'error', 'none'].includes(s)) {
      return {
        bg: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
        text: '#EF4444',
      };
    }
    if (['pending', 'diproses', 'processing'].includes(s)) {
      return {
        bg: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
        text: '#F59E0B',
      };
    }

    return {
      bg: isDarkMode ? '#1e293b' : '#f1f5f9',
      text: isDarkMode ? '#94a3b8' : '#64748b',
    };
  };

  const renderTransactionItem = ({item}) => {
    const statusTheme = getStatusTheme(item.status, isDarkMode);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.transactionCard,
          {
            backgroundColor: isDarkMode ? '#1e293b' : WHITE_COLOR,
            borderColor: isDarkMode ? '#334155' : '#f1f5f9',
          },
        ]}
        onPress={() => {
          // Jika tipe transaksi adalah merchant_request dan statusnya pending, arahkan ke halaman pembayaran
          if (item.type === 'merchant_request' && item.status === 'pending') {
            const paymentRequest = {
              id: item.internal_id || item.ref,
              name: item.message.includes('Payment request from ')
                ? item.message.replace('Payment request from ', '')
                : item.sku,
              destination: item.tujuan,
              price: item.price,
              email: item.tujuan,
            };

            navigation.navigate('PaymentPage', {
              paymentRequest: paymentRequest,
            });
          } else {
            navigation.navigate('SuccessNotif', {
              item: {
                ref: item.ref || '-',
                tujuan: item.tujuan || '-',
                sku: item.sku || '-',
                status: item.status || '-',
                message: item.message || '-',
                price: item.price || 0,
                sn: item.sn || '-',
                type: item.type || '-',
                created_at: item.created_at || '-',
                customer_no: item.tujuan || '-',
                ref_id: item.ref || '-',
                data: {
                  ref: item.ref || '-',
                  tujuan: item.tujuan || '-',
                  sku: item.sku || '-',
                  status: item.status || '-',
                  message: item.message || '-',
                  price: item.price || 0,
                  sn: item.sn || '-',
                  type: item.type || '-',
                  created_at: item.created_at || '-',
                },
              },
              product: {
                produk: item.produk || 'Transaksi',
                name: item.sku || 'Transaksi',
                label: item.sku || 'Transaksi',
                product_seller_price: item.price
                  ? `Rp ${item.price.toLocaleString('id-ID')}`
                  : 'Rp 0',
                price: item.price
                  ? `Rp ${item.price.toLocaleString('id-ID')}`
                  : 'Rp 0',
              },
            });
          }
        }}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={[styles.typeBadgeText, {color: isDarkMode ? '#94a3b8' : '#64748b'}]}>
              {item.produk || 'Transaksi'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: statusTheme.bg},
            ]}>
            <Text style={[styles.statusText, {color: statusTheme.text}]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.productInfo}>
            <Text
              style={[
                styles.transactionNumber,
                {color: isDarkMode ? WHITE_COLOR : LIGHT_COLOR},
              ]}>
              {item.tujuan || '-'}
            </Text>
            <Text
              style={[
                styles.transactionDate,
                {color: isDarkMode ? '#94a3b8' : SLATE_COLOR},
              ]}>
              {formatDate(item.created_at)} •{' '}
              {item.created_at
                ? new Date(item.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-'}
            </Text>
          </View>
          <View style={styles.priceInfo}>
            <Text
              style={[
                styles.transactionAmount,
                {color: isDarkMode ? WHITE_COLOR : DARK_COLOR},
              ]}>
              Rp {item.price.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'},
      ]}>
      <CustomHeader title="Riwayat Transaksi" showBackButton={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE_COLOR} colors={[BLUE_COLOR]} />
        }
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_MARGIN,
          paddingTop: 15,
          paddingBottom: 120,
        }}>
        {loading ? (
          <View style={styles.transactionsContainer}>
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <SkeletonCard key={index} style={{height: 100, marginBottom: 15, borderRadius: 16}} />
            ))}
          </View>
        ) : (
          <View style={styles.transactionsContainer}>
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item, index) =>
                `${item.type}_${item.ref ? item.ref : index}`.toString()
              }
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text
                    style={[
                      styles.emptyText,
                      {color: isDarkMode ? '#64748b' : SLATE_COLOR},
                    ]}>
                    Belum ada riwayat transaksi
                  </Text>
                </View>
              }
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transactionsContainer: {
    rowGap: 12,
  },
  transactionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 12,
    fontFamily: MEDIUM_FONT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontFamily: BOLD_FONT,
    textTransform: 'capitalize',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productInfo: {
    flex: 1,
  },
  transactionNumber: {
    fontSize: 15,
    fontFamily: BOLD_FONT,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: REGULAR_FONT,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: MEDIUM_FONT,
  },
});

export default Transaksi;
