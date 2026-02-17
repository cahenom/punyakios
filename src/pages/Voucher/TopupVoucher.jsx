import {StyleSheet, Text, View, useColorScheme, ScrollView, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity} from 'react-native';
import React, {useRef, useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  FONT_SEDANG,
  GREY_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_BACKGROUND,
  windowWidth,
} from '../../utils/const';
import Input from '../../components/form/Input';
import BottomButton from '../../components/BottomButton';
import ProductCard from '../../components/ProductCard';
import SkeletonCard from '../../components/SkeletonCard';
import BottomModal from '../../components/BottomModal';
import TransactionDetail from '../../components/TransactionDetail';
import useTopupProducts from '../../hooks/useTopupProducts';
import { api } from '../../utils/api';
import {numberWithCommas} from '../../utils/formatter';
import { makeTopupCall } from '../../helpers/apiBiometricHelper';
import CustomHeader from '../../components/CustomHeader';

export default function TopupVoucher({route}) {
  const navigation = useNavigation();
  const {provider, title, type} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef(null);

  const {
    customer_no,
    setCustomerNo,
    selectItem,
    setSelectItem,
    sortedProducts,
    loading,
    showConfirmation,
    setShowConfirmation,
    resetInput,
    validationErrors,
    validateInputs,
    clearValidationErrors
  } = useTopupProducts(provider, title, '/api/product/voucher', 'voucher', type);

  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Loading state to prevent spam clicks

  const handleContinue = () => {
    if (!validateInputs()) {
      // If validation fails, scroll to the top to show the error indicators
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    } else {
      // If validation passes, show confirmation modal
      setShowModal(true);
    }
  };

  const confirmOrder = async () => {
    if (isProcessing) return; // Prevent multiple clicks

    console.log('[VOUCHER DEBUG] Initiating confirmOrder');
    console.log('[VOUCHER DEBUG] current customer_no state:', customer_no);
    console.log('[VOUCHER DEBUG] current selectItem state:', JSON.stringify(selectItem, null, 2));

    setIsProcessing(true); // Set loading state to prevent spam clicks

    try {
      const response = await makeTopupCall({
        sku: selectItem.sku,
        customer_no: customer_no,
      }, 'Verifikasi sidik jari atau wajah untuk melakukan topup voucher');

      console.log('Topup response:', response);

      // Close confirmation modal
      setShowModal(false);

      // Check if transaction is successful or pending/processing
      const status = (response?.status || 'Berhasil').toLowerCase();
      // Include pending statuses as "successful initiations" to show the animation
      const isSuccessOrPending = !['gagal', 'failed', 'error', 'none'].includes(status);

      // Navigate to TransactionResult for successful or pending initiations
      if (isSuccessOrPending) {
        navigation.navigate('TransactionResult', {
          item: {
            ...response,
            customer_no: customer_no
          },
          product: {
            ...selectItem,
            product_name: selectItem?.name || selectItem?.label,
            product_seller_price: selectItem?.price
          },
        });
      } else {
        // Pending or failed - skip animation, go directly to SuccessNotif
        navigation.navigate('SuccessNotif', {
          item: {
            ...response,
            customer_no: customer_no
          },
          product: {
            ...selectItem,
            product_name: selectItem?.name || selectItem?.label,
            product_seller_price: selectItem?.price
          },
        });
      }
    } catch (error) {
      console.error('Topup error:', error);
      setShowModal(false);
      if (error.message !== 'Biometric authentication failed') {
        // Error will be handled by global interceptor
      }
    } finally {
      setIsProcessing(false); // Reset loading state
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND, paddingBottom: 100}}>
      <CustomHeader title={title || "Topup Voucher"} />
      
      {/* Fixed Header and Input Section */}
      <View style={[styles.container, {paddingBottom: 10, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
        <View style={{marginBottom: 15}}>
          <Text
            style={{
              fontFamily: MEDIUM_FONT,
              fontSize: 16,
              color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
            }}>
            Pilih nominal {provider}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Input
            value={customer_no}
            placeholder="Masukan nomor tujuan"
            onchange={text => {
              setCustomerNo(text);
              if (validationErrors.customer_no) {
                clearValidationErrors();
              }
            }}
            ondelete={resetInput}
            type="numeric"
            lebar={windowWidth * 0.9}
            hasError={!!validationErrors.customer_no}
          />
        </View>
      </View>

      {/* Scrollable Product List */}
      {loading ? (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.productsContainer}>
            {/* Skeleton cards while loading */}
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={`skeleton-${index}`} style={styles.productItem}>
                <SkeletonCard />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : sortedProducts.length > 0 ? (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.productsContainer}>
            {sortedProducts.map((p, index) => (
              <ProductCard
                key={`${p.id}-${index}`}
                product={p}
                isSelected={selectItem?.id === p.id}
                onSelect={setSelectItem}
                style={styles.productItem}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <Text style={{fontFamily: REGULAR_FONT, color: isDarkMode ? DARK_COLOR : LIGHT_COLOR}}>
            Tidak ada produk tersedia untuk {provider}
          </Text>
        </View>
      )}

      {/* Fixed Bottom Button */}
      {selectItem && (
        <View style={[styles.bottomButtonContainer, {backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}]}>
          <BottomButton
            label="Lanjutkan"
            action={handleContinue}
            isLoading={false}
          />
        </View>
      )}

      {/* Confirmation Modal */}
      <BottomModal
        visible={showModal}
        onDismis={() => setShowModal(false)}
        title="Detail Transaksi">
        <TransactionDetail
          destination={customer_no}
          product={selectItem?.label || selectItem?.name}
          description={selectItem?.desc}
          price={selectItem?.price}
          onConfirm={() => {
            confirmOrder();
          }}
          onCancel={() => setShowModal(false)}
          isLoading={isProcessing}
        />
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: 15,
  },
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 25,
    marginTop: 10,
    paddingHorizontal: HORIZONTAL_MARGIN,
    columnGap: 5,
    paddingBottom: 150, // Extra padding to prevent overlap with bottom button
  },
  productItem: {
    width: '47%', // Adjusted to prevent clipping
    marginBottom: 0, // Let the rowGap in parent handle spacing
  },
  bottomButtonContainer: {
    paddingHorizontal: HORIZONTAL_MARGIN,
    paddingBottom: 20,
    paddingTop: 10,
    position: 'absolute', // Position absolutely at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Ensure it appears on top if needed
  },
  bottom: isDarkMode => ({
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    padding: 10,
  }),
  bottomButton: {
    backgroundColor: BLUE_COLOR,
    padding: 10,
    borderRadius: 5,
  },
  modalData: isDarkMode => ({
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    paddingVertical: 5,
    rowGap: 5,
  }),
  labelModalData: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: FONT_SEDANG,
    color: isDarkMode ? LIGHT_COLOR : DARK_COLOR, // Changed to ensure contrast
  }),
  valueModalData: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: FONT_NORMAL,
    color: isDarkMode ? LIGHT_COLOR : DARK_COLOR, // Changed to ensure contrast
  }),
  buttonLabel: {
    fontFamily: REGULAR_FONT,
    color: WHITE_BACKGROUND,
    textAlign: 'center',
  },
});