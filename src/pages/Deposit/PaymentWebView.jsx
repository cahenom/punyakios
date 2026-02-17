import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {WebView} from 'react-native-webview';
import CustomHeader from '../../components/CustomHeader';
import {
  DARK_BACKGROUND,
  DARK_COLOR,
  LIGHT_COLOR,
  WHITE_BACKGROUND,
  BLUE_COLOR,
  REGULAR_FONT,
  BOLD_FONT,
} from '../../utils/const';
import {useNavigation} from '@react-navigation/native';

const PaymentWebView = ({route}) => {
  const {paymentUrl, invoiceId, amount} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(paymentUrl);

  const handleNavigationStateChange = navState => {
    setCurrentUrl(navState.url);
    
    // Check if payment is completed based on URL patterns
    // Adjust these patterns based on your payment gateway's callback URLs
    if (
      navState.url.includes('/deposit/success') ||
      navState.url.includes('/payment/success') ||
      navState.url.includes('status=success')
    ) {
      // Navigate to success page
      navigation.replace('DepositSuccess', {
        invoiceId,
        amount,
      });
    } else if (
      navState.url.includes('/deposit/failed') ||
      navState.url.includes('/payment/failed') ||
      navState.url.includes('status=failed')
    ) {
      // Navigate to failed page
      navigation.replace('DepositFailed', {
        invoiceId,
        amount,
      });
    }
  };

  const handleWebViewError = syntheticEvent => {
    const {nativeEvent} = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND},
      ]}>
      <CustomHeader title="Pembayaran Deposit" />

      {/* Payment Info Bar */}
      <View
        style={[
          styles.infoBar,
          {
            backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
            borderBottomColor: isDarkMode
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.1)',
          },
        ]}>
        <View style={styles.infoRow}>
          <Text
            style={[
              styles.infoLabel,
              {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
            ]}>
            Invoice ID:
          </Text>
          <Text
            style={[
              styles.infoValue,
              {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
            ]}>
            {invoiceId}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text
            style={[
              styles.infoLabel,
              {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
            ]}>
            Nominal:
          </Text>
          <Text style={[styles.infoValue, {color: BLUE_COLOR}]}>
            Rp {parseInt(amount).toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BLUE_COLOR} />
            <Text
              style={[
                styles.loadingText,
                {color: isDarkMode ? DARK_COLOR : LIGHT_COLOR},
              ]}>
              Memuat halaman pembayaran...
            </Text>
          </View>
        )}
        <WebView
          source={{uri: paymentUrl}}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleWebViewError}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          style={styles.webView}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: BOLD_FONT,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  },
});

export default PaymentWebView;
