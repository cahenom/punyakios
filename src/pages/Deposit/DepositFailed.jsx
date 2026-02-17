import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import {
  DARK_BACKGROUND,
  DARK_COLOR,
  LIGHT_COLOR,
  WHITE_COLOR,
} from '../../utils/const';

const DepositFailed = () => {
  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';
  const scaleAnim = new Animated.Value(0);
  const crossAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate the failed icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(crossAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTryAgain = () => {
    navigation.navigate('DepositPage');
  };

  const handleBackToHome = () => {
    navigation.navigate('MyTabs', {screen: 'Home'});
  };

  const iconScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const crossOpacity = crossAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={getStyles(isDarkMode).container}>
      <CustomHeader title="Deposit Gagal" showBackButton={false} />
      <View style={getStyles(isDarkMode).content}>
        <Animated.View
          style={[
            getStyles(isDarkMode).failedIconContainer,
            {transform: [{scale: iconScale}]},
          ]}>
          <Animated.Text
            style={[getStyles(isDarkMode).crossIcon, {opacity: crossOpacity}]}>
            ✕
          </Animated.Text>
        </Animated.View>

        <Text style={getStyles(isDarkMode).failedTitle}>Deposit Gagal</Text>
        <Text style={getStyles(isDarkMode).failedMessage}>
          Pembayaran Anda tidak dapat diproses. Silakan coba lagi atau hubungi
          customer service kami.
        </Text>

        <View style={getStyles(isDarkMode).infoBox}>
          <Text style={getStyles(isDarkMode).infoText}>
            ℹ️ Jika masalah berlanjut, silakan hubungi customer service
          </Text>
        </View>

        <TouchableOpacity
          style={getStyles(isDarkMode).tryAgainButton}
          onPress={handleTryAgain}>
          <Text style={getStyles(isDarkMode).tryAgainButtonText}>
            Coba Lagi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getStyles(isDarkMode).homeButton}
          onPress={handleBackToHome}>
          <Text style={getStyles(isDarkMode).homeButtonText}>
            Kembali ke Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = isDarkMode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? DARK_BACKGROUND : '#f5f5f5',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    failedIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      backgroundColor: '#f5576c',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 30,
      shadowColor: '#f5576c',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    crossIcon: {
      fontSize: 60,
      color: WHITE_COLOR,
      fontWeight: 'bold',
    },
    failedTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#f5576c',
      marginBottom: 10,
      textAlign: 'center',
    },
    failedMessage: {
      fontSize: 16,
      color: isDarkMode ? DARK_COLOR : '#666',
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    infoBox: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#fff3cd',
      borderRadius: 12,
      padding: 16,
      marginBottom: 30,
      width: '100%',
      borderLeftWidth: 4,
      borderLeftColor: '#f5576c',
    },
    infoText: {
      fontSize: 14,
      color: isDarkMode ? DARK_COLOR : '#555',
      textAlign: 'center',
      lineHeight: 20,
    },
    tryAgainButton: {
      backgroundColor: '#f5576c',
      paddingVertical: 16,
      paddingHorizontal: 40,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: '#f5576c',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    tryAgainButtonText: {
      color: WHITE_COLOR,
      fontSize: 16,
      fontWeight: 'bold',
    },
    homeButton: {
      backgroundColor: isDarkMode ? '#555' : '#e0e0e0',
      paddingVertical: 16,
      paddingHorizontal: 40,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
    },
    homeButtonText: {
      color: isDarkMode ? DARK_COLOR : '#333',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default DepositFailed;
