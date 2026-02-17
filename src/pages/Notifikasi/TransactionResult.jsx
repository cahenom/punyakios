import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  SafeAreaView,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import SoundPlayer from 'react-native-sound-player';
import {
  DARK_BACKGROUND,
  WHITE_COLOR,
  BOLD_FONT,
  MEDIUM_FONT,
} from '../../utils/const';

const {width, height} = Dimensions.get('window');

export default function TransactionResult({route}) {
  const {item = {}, product = {}} = route.params || {};
  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  // Determine transaction status
  const responseData = item?.data || item;
  const status = (responseData?.status || item?.status || 'Berhasil').toLowerCase();
  
  const isFailed = ['gagal', 'failed', 'error', 'none'].includes(status);
  const isPending = ['pending', 'diproses', 'processing'].includes(status);
  const isSuccess = !isFailed && !isPending;

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Provide haptic feedback and play sound for successful/pending transactions
    if (!isFailed) {
      // Vibrate in a success pattern: short-pause-short
      Vibration.vibrate([0, 100, 50, 100]);
      
      // Play success sound
      try {
        // playSoundFile will look in android/app/src/main/res/raw
        SoundPlayer.playSoundFile('success', 'mp3');
      } catch (e) {
        console.log(`Cannot play the sound file`, e);
      }
    } else if (isFailed) {
      // Vibrate in a failure pattern: long vibration
      Vibration.vibrate(400);
    }

    // Auto-redirect to SuccessNotif after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('SuccessNotif', {
        item,
        product,
      });
    }, 2500);

    // Cleanup
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const getStatusColor = () => {
    if (isFailed) return '#EF4444';
    if (isPending) return '#F59E0B';
    return '#01C1A2';
  };

  const getStatusText = () => {
    if (isFailed) return 'Transaksi Gagal';
    // Display both success and pending as "Pembayaran Berhasil" for optimistic UI
    return 'Pembayaran Berhasil';
  };

  const getStatusMessage = () => {
    if (isFailed) return 'Mohon maaf, transaksi Anda gagal diproses';
    // Display success message for both success and pending
    return 'Transaksi Anda telah berhasil diproses';
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? DARK_BACKGROUND : '#f8fafc'},
      ]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* Lottie Animation */}
        <View style={styles.animationContainer}>
          {isFailed ? (
            <LottieView
              source={require('../../assets/lottie/gagal-animation.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
          ) : (
            // Use success animation for both success and pending
            <LottieView
              source={require('../../assets/lottie/success-animation.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
          )}
        </View>

        {/* Status Text */}
        <Text
          style={[
            styles.statusText,
            {color: getStatusColor()},
          ]}>
          {getStatusText()}
        </Text>

        {/* Status Message */}
        <Text style={[styles.messageText, {color: isDarkMode ? '#94a3b8' : '#64748b'}]}>
          {getStatusMessage()}
        </Text>

        {/* Product Name */}
        <Text style={[styles.productText, {color: isDarkMode ? '#cbd5e1' : '#475569'}]}>
          {responseData?.produk || item?.produk || product?.produk || 'Transaksi'}
        </Text>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: getStatusColor(),
                    opacity: fadeAnim,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  animationContainer: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  statusText: {
    fontSize: 28,
    fontFamily: BOLD_FONT,
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    fontFamily: MEDIUM_FONT,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  productText: {
    fontSize: 14,
    fontFamily: MEDIUM_FONT,
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingContainer: {
    marginTop: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
