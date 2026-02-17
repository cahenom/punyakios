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
import {useAuth} from '../../context/AuthContext';
import {
  DARK_BACKGROUND,
  DARK_COLOR,
  LIGHT_COLOR,
  WHITE_COLOR,
} from '../../utils/const';

const DepositSuccess = () => {
  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';
  const {refreshUserProfile} = useAuth();
  const scaleAnim = new Animated.Value(0);
  const checkAnim = new Animated.Value(0);

  useEffect(() => {
    // Refresh user balance when entering this page
    refreshUserProfile();

    // Animate the success icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBackToHome = () => {
    navigation.navigate('MyTabs', {screen: 'Home'});
  };

  const iconScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const checkOpacity = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={getStyles(isDarkMode).container}>
      <CustomHeader title="Deposit Berhasil" showBackButton={false} />
      <View style={getStyles(isDarkMode).content}>
        <Animated.View
          style={[
            getStyles(isDarkMode).successIconContainer,
            {transform: [{scale: iconScale}]},
          ]}>
          <Animated.Text
            style={[getStyles(isDarkMode).checkIcon, {opacity: checkOpacity}]}>
            ✓
          </Animated.Text>
        </Animated.View>

        <Text style={getStyles(isDarkMode).successTitle}>
          Deposit Berhasil!
        </Text>
        <Text style={getStyles(isDarkMode).successMessage}>
          Pembayaran Anda telah berhasil diproses. Saldo akan segera
          ditambahkan ke akun Anda.
        </Text>

        <View style={getStyles(isDarkMode).infoBox}>
          <Text style={getStyles(isDarkMode).infoText}>
            💡 Saldo Anda akan diperbarui dalam beberapa saat
          </Text>
        </View>

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
    successIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundColor: '#667eea',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 30,
      shadowColor: '#667eea',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    checkIcon: {
      fontSize: 60,
      color: WHITE_COLOR,
      fontWeight: 'bold',
    },
    successTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#667eea',
      marginBottom: 10,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: 16,
      color: isDarkMode ? DARK_COLOR : '#666',
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    infoBox: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#e8f4f8',
      borderRadius: 12,
      padding: 16,
      marginBottom: 30,
      width: '100%',
      borderLeftWidth: 4,
      borderLeftColor: '#667eea',
    },
    infoText: {
      fontSize: 14,
      color: isDarkMode ? DARK_COLOR : '#555',
      textAlign: 'center',
      lineHeight: 20,
    },
    homeButton: {
      backgroundColor: '#667eea',
      paddingVertical: 16,
      paddingHorizontal: 40,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      shadowColor: '#667eea',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    homeButtonText: {
      color: WHITE_COLOR,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default DepositSuccess;
