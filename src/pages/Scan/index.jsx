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
} from '../../utils/const';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
} from 'react-native-vision-camera';

const {width} = Dimensions.get('window');

export default function ScanScreen({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const {hasPermission, requestPermission} = useCameraPermission();
  const [isActive, setIsActive] = useState(true);
  const device = useCameraDevice('back');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        console.log('QR Code scanned:', codes[0].value);
        // Handle scanned QR code here
        // For example: navigate to a payment page or show details
        setIsActive(false);
        alert(`Scanned: ${codes[0].value}`);
        // Reactivate after 2 seconds
        setTimeout(() => setIsActive(true), 2000);
      }
    },
  });

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container(isDarkMode)}>
        <CustomHeader title="SCAN QR" showBackButton={false} />
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
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.container(isDarkMode)}>
        <CustomHeader title="SCAN QR" showBackButton={false} />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Kamera tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container(isDarkMode)}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
          enableHighQualityPhotos={false}
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
          title="SCAN QR" 
          showBackButton={false} 
          containerStyle={{backgroundColor: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, borderBottomWidth: 0}}
          titleStyle={{color: 'white'}}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? '#101622' : '#f6f6f8',
  }),
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_MARGIN,
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
    borderColor: '#3b82f6',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#3b82f6',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#3b82f6',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#3b82f6',
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
    backgroundColor: '#3b82f6',
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
});
