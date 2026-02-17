import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  useColorScheme,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API_URL} from '../../utils/const';
import ProductBadge from '../../components/ProductBadge';
import TransactionDetailModal from '../../components/TransactionDetailModal';
import {
  DARK_BACKGROUND,
  WHITE_BACKGROUND,
  HORIZONTAL_MARGIN,
  DARK_COLOR,
  LIGHT_COLOR,
  REGULAR_FONT,
  MEDIUM_FONT,
  BLUE_COLOR,
} from '../../utils/const';
import SkeletonCard from '../../components/SkeletonCard';
import ModernButton from '../../components/ModernButton';

const IndosatPage = () => {
  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';
  const [phoneNumber, setPhoneNumber] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // State to prevent double clicks

  const fetchProducts = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert(
        'Peringatan',
        'Silakan masukkan nomor telepon terlebih dahulu.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'https://m3-psi.vercel.app/api/indosat',
        {
          nohp: phoneNumber,
        },
      );

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        Alert.alert('Error', 'Gagal memuat produk. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error fetching Indosat products:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan saat memuat produk. Silakan coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = product => {
    setSelectedProduct(product);
  };

  const handleLanjutkan = () => {
    if (!selectedProduct) {
      Alert.alert('Peringatan', 'Silakan pilih paket terlebih dahulu.');
      return;
    }
    setTransactionModalVisible(true);
  };

  const handleLanjut = async () => {
    if (selectedProduct && !isProcessing) {
      setIsProcessing(true); // Set processing to true to prevent double clicks

      try {
        // Call the external inquiry endpoint first
        const inquiryResponse = await axios.post(
          'https://m3-psi.vercel.app/api/indosat/inquiry',
          {
            nohp: phoneNumber,
            id: selectedProduct.numericId,
            kode: selectedProduct.id,
          },
        );

        // Log the inquiry response
        console.log('Inquiry response:', inquiryResponse.data);

        // Check if the response contains kode_bayar
        if (
          inquiryResponse.data.originalResponse &&
          inquiryResponse.data.originalResponse.kode_bayar
        ) {
          console.log(
            'Kode Bayar:',
            inquiryResponse.data.originalResponse.kode_bayar,
          );

          // Get the auth token
          const token = await AsyncStorage.getItem('token');

          // call the cektagihan endpoint on our backend
          const cekResponse = await axios.post(
            `${API_URL}/api/order/cek-tagihan`,
            {
              sku: 'indosat', // Use 'indosat' as the sku
              customer_no: inquiryResponse.data.originalResponse.kode_bayar, // Use kode_bayar as customer_no
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          // Log the cektagihan response
          console.log('Cek tagihan response:', cekResponse.data);

          // Call the bayartagihan endpoint on our backend
          const bayarResponse = await axios.post(
            `${API_URL}/api/order/bayar-tagihan`,
            {
              sku: 'indosat', // Use 'indosat' as the sku
              customer_no: inquiryResponse.data.originalResponse.kode_bayar, // Use kode_bayar as customer_no
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          // Log the bayartagihan response
          console.log('Bayar tagihan response:', bayarResponse.data);

          // Close the modal
          setTransactionModalVisible(false);

          // Navigate to success notification screen with the response data
          navigation.navigate('SuccessNotif', {
            item: {
              ...bayarResponse.data,
              customer_no: phoneNumber,
              ref: cekResponse.data.data?.ref_id || bayarResponse.data.ref_id || `IND-${Date.now()}`,
              tujuan: phoneNumber,
              sku: 'indosat',
              status: bayarResponse.data.status || 'Sukses',
              message: bayarResponse.data.message || 'Transaksi Sukses',
              price: selectedProduct.price,
              sn: bayarResponse.data.sn || bayarResponse.data.serial_number || cekResponse.data.data?.ref_id,
            },
            product: {
              product_name: selectedProduct.title || 'Indosat Pulsa/Data',
              name: selectedProduct.title || 'Indosat Pulsa/Data',
              label: selectedProduct.title || 'Indosat Pulsa/Data',
              product_seller_price: selectedProduct.price,
              price: selectedProduct.price
            },
          });
        } else {
          console.log('Kode Bayar is not available in the response');
          Alert.alert(
            'Error',
            'Kode pembayaran tidak tersedia. Silakan coba lagi.',
          );
          return;
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        Alert.alert('Error', 'Terjadi kesalahan saat memproses pembayaran.');
      } finally {
        setIsProcessing(false); // Reset processing state
      }
    }
  };

  const handleBatal = () => {
    setTransactionModalVisible(false);
  };

  const renderProduct = ({item}) => {
    const isSelected = selectedProduct && selectedProduct.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.productCard, isSelected && styles.selectedProductCard]}
        onPress={() => handleProductSelect(item)}>
        <View style={styles.productHeader}>
          <Text
            style={[
              styles.productTitle,
              isSelected && styles.selectedProductText,
            ]}
            numberOfLines={2}>
            {item.title}
          </Text>
          <Text
            style={[
              styles.productPrice,
              isSelected && styles.selectedProductText,
              {color: isDarkMode ? '#e74c3c' : '#e74c3c'} // Red color for both themes, adjust as needed
            ]}>
            {item.price}
          </Text>
        </View>
        <View style={styles.productDetails}>
          <Text
            style={[styles.duration, isSelected && styles.selectedProductText]}>
            Durasi: {item.duration}
          </Text>
          <Text
            style={[
              styles.destination,
              isSelected && styles.selectedProductText,
            ]}>
            Tujuan: {item.destination}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
      <CustomHeader title="Indosat" />
      
      {/* Fixed Header and Input Section */}
      <View style={{paddingHorizontal: HORIZONTAL_MARGIN, marginTop: 15, marginBottom: 10}}>
        <Text style={[styles.headerSubtitle, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR, marginBottom: 10}]}>
          Masukkan nomor telepon untuk melihat paket
        </Text>
        <View style={styles.inputContainer}>
          <View style={{flex: 1}}>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                color: isDarkMode ? '#fff' : '#000',
                borderColor: isDarkMode ? '#334155' : '#e2e8f0'
              }]}
              placeholder="Contoh: 081234567890"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
            />
          </View>
          <TouchableOpacity 
            style={[styles.cekButton, {backgroundColor: BLUE_COLOR}]} 
            onPress={fetchProducts}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.cekButtonText}>Cek</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={{flex: 1}}>
        {loading ? (
          <View style={{paddingHorizontal: HORIZONTAL_MARGIN, marginTop: 10}}>
            <Text style={[styles.productsTitle, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>Memuat Paket...</Text>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <SkeletonCard key={i} style={{height: 80, marginBottom: 12}} />
            ))}
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {products.length > 0 && (
              <Text style={[styles.productsTitle, {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}]}>Pilihan Paket</Text>
            )}
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                !loading && (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, {color: isDarkMode ? '#94a3b8' : '#64748b'}]}>
                      Belum ada produk. Masukkan nomor telepon dan tekan Cek.
                    </Text>
                  </View>
                )
              }
            />
          </View>
        )}
      </View>

      {products.length > 0 && !loading && (
        <View style={[styles.bottomButtonContainer, {backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
          <ModernButton
            label="Lanjutkan"
            onPress={handleLanjutkan}
            disabled={!selectedProduct}
          />
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={transactionModalVisible}
        onRequestClose={() => setTransactionModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <TransactionDetailModal
              selectedProduct={selectedProduct}
              onLanjut={handleLanjut}
              onBatal={handleBatal}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  cekButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cekButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  productsContainer: {
    flex: 1,
    padding: 20,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedProductCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  selectedProductText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginLeft: 10,
  },
  productDetails: {
    flexDirection: 'column',
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  destination: {
    fontSize: 14,
    color: '#999',
  },
  productsList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bottomButtonContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  lanjutkanButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  lanjutkanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
});

export default IndosatPage;
