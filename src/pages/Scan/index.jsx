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
import CustomHeader from '../../components/CustomHeader';
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

import {useAlert} from '../../context/AlertContext';
import {useAuth} from '../../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import {api} from '../../utils/api';

const {width} = Dimensions.get('window');

export default function ScanScreen({navigation, route}) {
  const isDarkMode = useColorScheme() === 'dark';
  const {showAlert} = useAlert();
  const {user} = useAuth();
  const {hasPermission, requestPermission} = useCameraPermission();
  const [isActive, setIsActive] = useState(true);
  
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

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        const value = codes[0].value;
        console.log('QR Code scanned:', value);
        
        // PunyaKios Transfer Format: PUNYAKIOS:TRANSFER:PHONE_NUMBER
        if (value.startsWith('PUNYAKIOS:TRANSFER:')) {
          const phone = value.split(':')[2];
          handleTranserScan(phone);
        } else {
          setIsActive(false);
          showAlert('QR Scanned', `Scanned: ${value}`, 'info');
          setTimeout(() => setIsActive(true), 3000);
        }
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
                color={isDarkMode ? '#ffffff' : '#000000'}
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
          isActive={isActive && activeTab === 'scan'}
          codeScanner={codeScanner}
          photo={false}
          video={false}
        />
        
        {/* Overlay Scanner */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer} />
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
