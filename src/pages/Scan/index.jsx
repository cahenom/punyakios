import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import { FlashlightIkon, GalleryIkon } from '../../assets';
import {
  BOLD_FONT,
  REGULAR_FONT,
  DARK_BACKGROUND,
  WHITE_COLOR,
  DARK_COLOR,
  LIGHT_COLOR,
  SLATE_COLOR,
  BLUE_COLOR,
  WHITE_BACKGROUND,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  HORIZONTAL_MARGIN,
  MEDIUM_FONT,
} from '../../utils/const';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
} from 'react-native-vision-camera';
import {launchImageLibrary} from 'react-native-image-picker';
import jsQR from 'jsqr';
import {Buffer} from 'buffer';
import jpeg from 'jpeg-js';

import {useAlert} from '../../context/AlertContext';
import {useAuth} from '../../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import {api} from '../../utils/api';
import {parseQRIS} from '../../utils/qrisParser';

const {width} = Dimensions.get('window');

export default function ScanScreen({navigation, route}) {
  const isFocused = useIsFocused();
  const isDarkMode = useColorScheme() === 'dark';
  const {showAlert} = useAlert();
  const {user} = useAuth();
  const {hasPermission, requestPermission} = useCameraPermission();
  const [isActive, setIsActive] = useState(true);
  const [torch, setTorch] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  
  // Reset camera activity when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
        setTorch(false);
      };
    }, [])
  );

  // Tab Mode: Opened from Bottom Tab (Route name: 'Scan')
  // P2P Mode: Opened from Stack (Route name: 'P2PScan')
  const isTabMode = route.name === 'Scan';
  const [activeTab, setActiveTab] = useState(route.params?.tab || (isTabMode ? 'scan' : 'scan')); 
  const device = useCameraDevice('back');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleTranserScan = async (phoneNumber) => {
    try {
      setIsActive(false);
      const response = await api.post('/api/user/search-phone', { phone: phoneNumber });
      if (response.data.status === 'success') {
        if (isTabMode) {
          // Tab Mode: Just show the name in an alert
          showAlert('User PunyaKios', `Nama: ${response.data.data.name}`, 'info');
          setTimeout(() => setIsActive(true), 3000);
        } else {
          // P2P Mode: Navigate to transfer
          navigation.navigate('TransferAmount', { recipient: response.data.data });
        }
      } else {
        showAlert('Info', response.data.message, 'info');
        setTimeout(() => setIsActive(true), 2000);
      }
    } catch (error) {
      console.log('Search error:', error);
      setIsActive(true);
    }
  };

  const processQRValue = (value) => {
    console.log('Processing QR value:', value);
    
    // 1. PunyaKios Transfer Format: PUNYAKIOS:TRANSFER:PHONE_NUMBER
    if (value.startsWith('PUNYAKIOS:TRANSFER:')) {
      const phone = value.split(':')[2];
      handleTranserScan(phone);
      return true;
    } 
    // 2. EMVCo QRIS Format: Starts with 000201
    else if (value.startsWith('00')) {
      const qrisData = parseQRIS(value);
      if (qrisData) {
        setIsActive(false);
        navigation.navigate('QrisPayment', { qrisData });
        return true;
      }
    }
    
    // Default fallback
    setIsActive(false);
    showAlert('QR Scanned', `Scanned: ${value}`, 'info');
    setTimeout(() => setIsActive(true), 3000);
    return false;
  };

  const handleGalleryScan = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.5, 
      maxWidth: 600, 
      maxHeight: 600,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    setIsGalleryLoading(true);
    const asset = result.assets[0];
    if (!asset.base64) {
      showAlert('Error', 'Gagal membaca data gambar', 'error');
      return;
    }

    try {
      const buffer = Buffer.from(asset.base64, 'base64');
      const rawImageData = jpeg.decode(buffer, {useTArray: true});
      
      const code = jsQR(rawImageData.data, rawImageData.width, rawImageData.height);

      if (code && code.data) {
        processQRValue(code.data);
      } else {
        showAlert('Error', 'Tidak ditemukan kode QR pada gambar tersebut. Pastikan gambar cukup jelas dan berformat JPEG.', 'error');
      }
    } catch (error) {
      console.log('Gallery scan error:', error);
      showAlert('Error', 'Gagal memproses gambar. Pastikan format gambar didukung (JPEG).', 'error');
    } finally {
      setIsGalleryLoading(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        processQRValue(codes[0].value);
      }
    },
  });

  const renderTabs = () => {
    if (isTabMode) return null;
    return (
      <View style={styles.tabContainer(isDarkMode)}>
        <TouchableOpacity 
          onPress={() => setActiveTab('scan')}
          style={[styles.tabItem, activeTab === 'scan' && styles.activeTabItem]}
        >
          <Text style={[styles.tabText(isDarkMode), activeTab === 'scan' && styles.activeTabText]}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('myqr')}
          style={[styles.tabItem, activeTab === 'myqr' && styles.activeTabItem]}
        >
          <Text style={[styles.tabText(isDarkMode), activeTab === 'myqr' && styles.activeTabText]}>My QR</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const headerTitle = isTabMode ? 'SCAN QR' : 'TRANSFER & MY QR';

  if (activeTab === 'myqr' && !isTabMode) {
    return (
      <SafeAreaView style={styles.container(isDarkMode)}>
        <CustomHeader title={headerTitle} showBackButton={true} />
        <View style={styles.centerContent}>
          <View style={styles.qrCard(isDarkMode)}>
            <Text style={styles.qrTitle(isDarkMode)}>{user?.name}</Text>
            <Text style={styles.qrDesc(isDarkMode)}>{user?.phone}</Text>
            
            <View style={styles.qrWrapper(isDarkMode)}>
              <QRCode
                value={`PUNYAKIOS:TRANSFER:${user?.phone}`}
                size={width * 0.6}
                color="#000000"
                backgroundColor="transparent"
              />
            </View>
            
            <Text style={styles.qrInstruction(isDarkMode)}>
              Scan QR code ini untuk transfer saldo ke akun saya
            </Text>
          </View>
        </View>
        {renderTabs()}
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container(isDarkMode)}>
        <CustomHeader title={headerTitle} showBackButton={!isTabMode} />
        <View style={styles.centerContent}>
          <View style={styles.emptyCard(isDarkMode)}>
            <Text style={styles.emptyEmoji}>📷</Text>
            <Text style={styles.emptyTitle(isDarkMode)}>Izin Kamera</Text>
            <Text style={styles.emptyDesc(isDarkMode)}>
              Aplikasi memerlukan izin kamera untuk melakukan scan QR code.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => requestPermission()}>
              <Text style={styles.buttonText}>Beri Izin</Text>
            </TouchableOpacity>
          </View>
        </View>
        {renderTabs()}
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.container(isDarkMode)}>
        <CustomHeader title={headerTitle} showBackButton={!isTabMode} />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Kamera tidak ditemukan</Text>
        </View>
        {renderTabs()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container(isDarkMode)}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive && isFocused && activeTab === 'scan'}
          codeScanner={codeScanner}
          torch={torch ? 'on' : 'off'}
          photo={false}
          video={false}
        />
        
        {/* Overlay Scanner */}
        <View style={styles.overlay}>
          <View style={[styles.unfocusedContainer, {justifyContent: 'flex-start'}]}>
            {/* Control Buttons at the top */}
            <View style={styles.topCard}>
              <View style={styles.controlButtons}>
                <TouchableOpacity 
                  style={styles.iconControlButton}
                  onPress={() => setTorch(!torch)}>
                  <FlashlightIkon width={20} height={20} style={{opacity: torch ? 1 : 0.7}} />
                  <Text style={styles.iconControlButtonText}>{torch ? 'Nyala' : 'Senter'}</Text>
                </TouchableOpacity>
                
                <View style={styles.verticalDivider} />

                <TouchableOpacity 
                  style={styles.iconControlButton}
                  onPress={handleGalleryScan}>
                  <GalleryIkon width={20} height={20} style={{opacity: 0.7}} />
                  <Text style={styles.iconControlButtonText}>Galeri</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.focusedContainer}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>
          <View style={styles.unfocusedContainer}>
            <Text style={styles.scanText}>Posisikan QR code di dalam kotak</Text>
          </View>
        </View>

        {isGalleryLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={BLUE_COLOR} />
            <Text style={styles.loadingText}>Membaca QR...</Text>
          </View>
        )}

        <CustomHeader 
          title={headerTitle} 
          showBackButton={!isTabMode} 
          containerStyle={{backgroundColor: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, borderBottomWidth: 0}}
          titleStyle={{color: 'white'}}
        />

        {renderTabs()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : '#f6f6f8',
  }),
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_MARGIN,
    paddingBottom: 80,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flexDirection: 'row',
    height: width * 0.7,
  },
  focusedContainer: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: BLUE_COLOR,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: BLUE_COLOR,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: BLUE_COLOR,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: BLUE_COLOR,
  },
  scanText: {
    color: 'white',
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    paddingTop: 20,
    textAlign: 'center',
  },
  topCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
    marginTop: 75,
    paddingVertical: 10, // Slimmer card
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 35, // Increased spacing
  },
  iconControlButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconControlButtonText: {
    color: 'white',
    fontFamily: REGULAR_FONT,
    fontSize: 10, // Slightly smaller text
    marginTop: 4,
    opacity: 0.7,
  },
  emptyCard: isDarkMode => ({
    backgroundColor: isDarkMode ? '#1a2332' : '#ffffff',
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
    ...SHADOWS.medium,
  }),
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.xl,
  },
  emptyTitle: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 20,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: SPACING.md,
  }),
  emptyDesc: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  }),
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: 'white',
    marginTop: 15,
    fontFamily: MEDIUM_FONT,
    fontSize: 16,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.medium,
  },
  buttonText: {
    color: 'white',
    fontFamily: BOLD_FONT,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontFamily: REGULAR_FONT,
    textAlign: 'center',
  },
  tabContainer: isDarkMode => ({
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    backgroundColor: isDarkMode ? '#1a2332' : '#ffffff',
    borderRadius: 30,
    padding: 6,
    ...SHADOWS.large,
  }),
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25,
  },
  activeTabItem: {
    backgroundColor: BLUE_COLOR,
  },
  tabText: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 15,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
  }),
  activeTabText: {
    color: WHITE_COLOR,
    fontFamily: BOLD_FONT,
  },
  qrCard: isDarkMode => ({
    backgroundColor: isDarkMode ? '#1a2332' : '#ffffff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
    ...SHADOWS.large,
  }),
  qrTitle: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 22,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: 4,
  }),
  qrDesc: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 16,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
    marginBottom: 25,
  }),
  qrWrapper: isDarkMode => ({
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 25,
  }),
  qrInstruction: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  }),
});
