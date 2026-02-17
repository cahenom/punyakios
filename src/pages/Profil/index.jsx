import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  Switch,
  Linking,
  SafeAreaView,
} from 'react-native';
import {Alert} from '../../utils/alert';
import React, {useState, useEffect, useCallback} from 'react';
import {Eye, EyeCros, CheckProduct} from '../../assets';
import CustomHeader from '../../components/CustomHeader';
import {useFocusEffect} from '@react-navigation/native';
import {
  BOLD_FONT,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  REGULAR_FONT,
  WHITE_BACKGROUND,
  BLUE_COLOR,
  WHITE_COLOR,
  GREY_COLOR,
  SLATE_COLOR,
} from '../../utils/const';
import {useAuth} from '../../context/AuthContext';
import {useAlert} from '../../context/AlertContext';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';
import RNBiometrics from 'react-native-biometrics';
import {setBiometricEnabledStatus} from '../../utils/biometricUtils';

export default function ProfilScreen({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const {user, logout, refreshUserProfile, isBalanceVisible, toggleBalanceVisibility} = useAuth();
  const {showAlert} = useAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Check notification permission status and biometric status on component mount
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // Check notification permission
        let notificationEnabled = false;

        if (Platform.OS === 'android' && parseInt(Platform.Version) >= 33) {
          // For Android 13+, check for POST_NOTIFICATIONS permission
          const permissionStatus = await PermissionsAndroid.check(
            'android.permission.POST_NOTIFICATIONS',
          );
          notificationEnabled = permissionStatus;
        } else {
          // For older Android versions and iOS, use Firebase messaging
          const settings = await messaging().getNotificationSettings();
          notificationEnabled = settings.authorizationStatus === 1; // AUTHORIZED = 1
        }

        setNotificationsEnabled(notificationEnabled);

        // Load biometric status from cache
        const biometricStatus = await import('../../utils/biometricUtils').then(
          module => module.isBiometricEnabled(),
        );
        setBiometricEnabled(biometricStatus);
      } catch (error) {
        console.log('Settings initialization error:', error);
        setNotificationsEnabled(false);
      }
    };

    initializeSettings();
  }, []);

  const handleNotificationToggle = async () => {
    try {
      if (!notificationsEnabled) {
        let granted = false;

        if (Platform.OS === 'android' && parseInt(Platform.Version) >= 33) {
          // For Android 13+ (API level 33+), request POST_NOTIFICATIONS permission
          const permissionResult = await PermissionsAndroid.request(
            'android.permission.POST_NOTIFICATIONS',
          );

          granted = permissionResult === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // For older Android versions and iOS, use Firebase messaging
          const authStatus = await messaging().requestPermission();
          granted = authStatus === 1; // AUTHORIZED = 1
        }

        if (granted) {
          setNotificationsEnabled(true);
          Alert.alert('Sukses', 'Notifikasi telah diaktifkan');
        } else {
          Alert.alert(
            'Gagal',
            'Izin notifikasi ditolak. Anda tidak akan menerima notifikasi.',
          );
        }
      } else {
        // For disabling notifications, guide user to system settings
        Alert.alert(
          'Nonaktifkan Notifikasi',
          'Untuk menonaktifkan notifikasi, silakan atur di pengaturan aplikasi perangkat Anda.',
          [
            {
              text: 'Atur Sekarang',
              onPress: () => {
                // Open app settings to allow user to disable notifications
                Linking.openSettings();
              },
            },
            {
              text: 'Nanti Saja',
              style: 'cancel',
            },
          ],
        );
      }
    } catch (error) {
      console.log('Error toggling notifications:', error);
      Alert.alert('Error', 'Gagal mengelola izin notifikasi');
    }
  };

  const handleBiometricToggle = async () => {
    try {
      if (!biometricEnabled) {
        // Enable biometric authentication
        try {
          // Check if biometric hardware is available
          const rnBiometrics = new RNBiometrics();
          const {available, biometryType} =
            await rnBiometrics.isSensorAvailable();

          if (available) {
            // Determine if it's fingerprint or face recognition
            if (biometryType === RNBiometrics.TouchID) {
              // Fingerprint authentication
              const {success, error} = await rnBiometrics.simplePrompt({
                promptMessage:
                  'Verifikasi sidik jari untuk mengaktifkan login sidik jari',
                cancelButtonText: 'Batal',
                allowDeviceCredentials: true,
              });

              if (success) {
                setBiometricEnabled(true);
                await setBiometricEnabledStatus(true); // Store in cache
                Alert.alert('Sukses', 'Login sidik jari telah diaktifkan');
              } else {
                if (error === 'user_cancel' || error === 'userfallback') {
                  Alert.alert('Info', 'Verifikasi sidik jari dibatalkan');
                } else {
                  Alert.alert('Gagal', 'Verifikasi sidik jari gagal: ' + error);
                }
              }
            } else if (biometryType === RNBiometrics.FaceID) {
              // Face recognition
              const {success, error} = await rnBiometrics.simplePrompt({
                promptMessage:
                  'Verifikasi wajah untuk mengaktifkan login wajah',
                cancelButtonText: 'Batal',
                allowDeviceCredentials: true,
              });

              if (success) {
                setBiometricEnabled(true);
                await setBiometricEnabledStatus(true); // Store in cache
                Alert.alert('Sukses', 'Login wajah telah diaktifkan');
              } else {
                if (error === 'user_cancel' || error === 'userfallback') {
                  Alert.alert('Info', 'Verifikasi wajah dibatalkan');
                } else {
                  Alert.alert('Gagal', 'Verifikasi wajah gagal: ' + error);
                }
              }
            } else {
              // General biometric
              const {success, error} = await rnBiometrics.simplePrompt({
                promptMessage:
                  'Verifikasi sidik jari atau wajah untuk mengaktifkan login biometrik',
                cancelButtonText: 'Batal',
                allowDeviceCredentials: true,
              });

              if (success) {
                setBiometricEnabled(true);
                await setBiometricEnabledStatus(true); // Store in cache
                Alert.alert('Sukses', 'Login biometrik telah diaktifkan');
              } else {
                if (error === 'user_cancel' || error === 'userfallback') {
                  Alert.alert('Info', 'Verifikasi biometrik dibatalkan');
                } else {
                  Alert.alert('Gagal', 'Verifikasi biometrik gagal: ' + error);
                }
              }
            }
          } else if (Platform.OS === 'android') {
            // Android fallback to Device PIN if sensor not available
            const {success, error} = await rnBiometrics.simplePrompt({
              promptMessage:
                'Verifikasi keamanan perangkat Anda untuk mengaktifkan fitur ini',
              cancelButtonText: 'Batal',
              allowDeviceCredentials: true,
            });

            if (success) {
              setBiometricEnabled(true);
              await setBiometricEnabledStatus(true);
              Alert.alert('Sukses', 'Keamanan perangkat telah diaktifkan');
            } else {
              if (error === 'user_cancel' || error === 'userfallback') {
                Alert.alert('Info', 'Verifikasi dibatalkan');
              } else {
                Alert.alert('Gagal', 'Verifikasi gagal: ' + error);
              }
            }
          } else {
            Alert.alert(
              'Gagal',
              'Sensor biometrik tidak tersedia pada perangkat ini',
            );
          }
        } catch (error) {
          console.log('Biometric error:', error);
          Alert.alert(
            'Gagal',
            'Gagal mengaktifkan login biometrik. Pastikan sensor biometrik tersedia.',
          );
        }
      } else {
        // Disable biometric authentication - requires biometric verification first
        try {
          // Check if biometric hardware is available
          const rnBiometrics = new RNBiometrics();
          const {available, biometryType} =
            await rnBiometrics.isSensorAvailable();

          if (available) {
            // Authenticate user before allowing to disable biometrics
            let success = false;
            let error = null;

            if (biometryType === RNBiometrics.TouchID) {
              // Fingerprint authentication
              const result = await rnBiometrics.simplePrompt({
                promptMessage:
                  'Verifikasi sidik jari untuk menonaktifkan login sidik jari',
                cancelButtonText: 'Batal',
                allowDeviceCredentials: true,
              });
              success = result.success;
              error = result.error;
            } else if (biometryType === RNBiometrics.FaceID) {
              // Face recognition
              const result = await rnBiometrics.simplePrompt({
                promptMessage:
                  'Verifikasi wajah untuk menonaktifkan login wajah',
                cancelButtonText: 'Batal',
                allowDeviceCredentials: true,
              });
              success = result.success;
              error = result.error;
            } else {
              // General biometric
              const result = await rnBiometrics.simplePrompt({
                promptMessage:
                  'Verifikasi sidik jari atau wajah untuk menonaktifkan login biometrik',
                cancelButtonText: 'Batal',
                allowDeviceCredentials: true,
              });
              success = result.success;
              error = result.error;
            }

            if (success) {
              setBiometricEnabled(false);
              await setBiometricEnabledStatus(false); // Store in cache
              Alert.alert('Info', 'Login biometrik telah dinonaktifkan');
            } else {
              if (error === 'user_cancel' || error === 'userfallback') {
                Alert.alert(
                  'Info',
                  'Verifikasi dibatalkan. Biometrik tetap aktif.',
                );
              } else {
                Alert.alert(
                  'Gagal',
                  'Verifikasi gagal. Biometrik tetap aktif.',
                );
              }
            }
          } else if (Platform.OS === 'android') {
            // Android disable requires verification via PIN
            const result = await rnBiometrics.simplePrompt({
              promptMessage:
                'Verifikasi keamanan perangkat untuk menonaktifkan fitur ini',
              cancelButtonText: 'Batal',
              allowDeviceCredentials: true,
            });

            if (result.success) {
              setBiometricEnabled(false);
              await setBiometricEnabledStatus(false);
              Alert.alert('Info', 'Keamanan perangkat telah dinonaktifkan');
            } else {
              Alert.alert('Info', 'Verifikasi dibatalkan. Fitur tetap aktif.');
            }
          } else {
            Alert.alert(
              'Gagal',
              'Sensor biometrik tidak tersedia pada perangkat ini',
            );
          }
        } catch (error) {
          console.log('Biometric error when disabling:', error);
          Alert.alert(
            'Gagal',
            'Gagal menonaktifkan login biometrik. Pastikan sensor biometrik tersedia.',
          );
        }
      }
    } catch (error) {
      console.log('Error toggling biometrics:', error);
      Alert.alert('Error', 'Gagal mengelola login biometrik');
    }
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar?', [
      {
        text: 'Batal',
        style: 'cancel',
      },
      {
        text: 'Keluar',
        onPress: async () => {
          try {
            // Call the logout function from context
            await logout();
            // Navigate to login screen after logout
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
          }
        },
      },
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserProfile]);

  // Auto-refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const cardBackgroundColor = isDarkMode ? '#1e293b' : '#ffffff'; // slate-800 or white
  const sectionBackgroundColor = isDarkMode ? '#1e293b' : '#ffffff';
  const dividerColor = isDarkMode ? '#334155' : '#f1f5f9'; // dark:border-slate-700 or light:border-slate-100
  const textColor = isDarkMode ? '#f1f5f9' : '#1e293b'; // dark:text-slate-100 or light:text-slate-900
  const secondaryTextColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 or slate-500

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', // dark:bg-background-dark or light:bg-background-light
    },
    profileHeader: {
      marginBottom: 20,
      paddingTop: 20,
    },
    title: {
      fontSize: FONT_NORMAL + 4,
      fontFamily: BOLD_FONT,
      color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
      textAlign: 'center',
    },
    profileCard: {
      backgroundColor: cardBackgroundColor,
      borderRadius: 18, // rounded-2xl
      padding: 24, // p-6
      marginBottom: 20,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      position: 'relative',
      overflow: 'hidden',
    },
    profileCardBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: 96, // h-24
      backgroundColor: '#1d4ed8', // from-primary/10
      opacity: 0.1,
    },
    profileCardContent: {
      zIndex: 10,
      alignItems: 'center',
      gap: 12, // gap-3
    },
    profileImageContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 4,
      borderColor: isDarkMode ? '#1e293b' : '#ffffff',
      position: 'relative',
    },
    profileAvatarText: {
      fontSize: 40,
      fontFamily: BOLD_FONT,
      color: WHITE_COLOR,
    },
    editIconContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#1d4ed8', // primary
      borderRadius: 9999, // rounded-full
      padding: 4,
      borderWidth: 4,
      borderColor: isDarkMode ? '#1e293b' : '#ffffff', // dark:border-slate-800 or border-white
    },
    editIcon: {
      color: WHITE_COLOR,
      fontSize: 16,
    },
    profileTextContainer: {
      alignItems: 'center',
    },
    profileNameWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    verifiedBadge: {
      backgroundColor: '#1d4ed8', // primary
      borderRadius: 9999,
      padding: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileName: {
      fontSize: FONT_NORMAL + 4,
      fontFamily: BOLD_FONT,
      color: isDarkMode ? '#f1f5f9' : '#1e293b', // dark:text-white or text-slate-900
    },
    profilePhone: {
      fontSize: FONT_NORMAL - 2,
      color: secondaryTextColor, // slate-500 or dark:text-slate-400
      marginTop: 2,
    },
    badgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDarkMode ? '#1e293b' : '#dbeafe', // slate-800 or primary/10
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 9999, // rounded-full
      marginTop: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#dbeafe', // slate-700 or primary/10
    },
    badgeText: {
      fontSize: FONT_NORMAL - 4,
      fontFamily: BOLD_FONT,
      color: isDarkMode ? '#93c5fd' : '#1d4ed8', // slate-300 or primary
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    quickActionItem: {
      flex: 1,
      marginHorizontal: 5,
      backgroundColor: cardBackgroundColor,
      borderRadius: 12, // rounded-xl
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: dividerColor,
    },
    quickActionText: {
      fontSize: FONT_NORMAL - 4,
      fontFamily: BOLD_FONT,
      color: secondaryTextColor, // slate-700 or dark:text-slate-300
    },
    sectionTitle: {
      fontSize: FONT_NORMAL - 4,
      fontFamily: BOLD_FONT,
      color: secondaryTextColor, // slate-500 or dark:text-slate-400
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 8,
      paddingLeft: 4,
    },
    sectionCard: {
      backgroundColor: sectionBackgroundColor,
      borderRadius: 12, // rounded-xl
      marginBottom: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: dividerColor,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16, // gap-4
      paddingHorizontal: 16,
      paddingVertical: 14, // py-3.5
    },
    listItemText: {
      flex: 1,
      fontSize: FONT_NORMAL,
      fontFamily: REGULAR_FONT,
      color: textColor, // slate-900 or dark:text-white
    },
    chevronText: {
      color: secondaryTextColor, // slate-400
      fontSize: 16,
    },
    divider: {
      height: 1,
      backgroundColor: dividerColor,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switch: {
      transform: [{scaleX: 0.8}, {scaleY: 0.8}],
    },
    logoutSection: {
      flex: 1,
      justifyContent: 'flex-end',
      marginBottom: 30,
    },
    logoutButton: {
      backgroundColor: '#fee2e2', // red-50
      opacity: isDarkMode ? 0.1 : 1,
      padding: 14, // py-3.5
      borderRadius: 12, // rounded-xl
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: '#fecaca', // red-100
    },
    logoutButtonText: {
      color: '#dc2626', // red-600
      fontFamily: BOLD_FONT,
      fontSize: FONT_NORMAL,
    },
    versionText: {
      fontSize: FONT_NORMAL - 4,
      fontFamily: REGULAR_FONT,
      color: secondaryTextColor, // slate-400
      textAlign: 'center',
      marginTop: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Profile" showBackButton={false} />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_MARGIN,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>

      <View style={styles.profileCard}>
        <View style={styles.profileCardBackground} />
        <View style={styles.profileCardContent}>
          <View
            style={[
              styles.profileImageContainer,
              {
                backgroundColor: isDarkMode ? '#1e293b' : '#3b82f6',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
            <Text style={styles.profileAvatarText}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.profileTextContainer}>
            <View style={styles.profileNameWrapper}>
              <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
              <View style={styles.verifiedBadge}>
                <CheckProduct width={10} height={10} fill={WHITE_COLOR} />
              </View>
            </View>
            <Text style={styles.profilePhone}>
              {user?.email || 'user@example.com'}
            </Text>
            <View style={[styles.badgeContainer, {flexDirection: 'row', alignItems: 'center', gap: 8}]}>
              <Text style={styles.badgeText}>
                {isBalanceVisible
                  ? `Rp ${user?.saldo ? parseFloat(user.saldo).toLocaleString() : '0'}`
                  : 'Rp ••••••'}
              </Text>
              <TouchableOpacity onPress={toggleBalanceVisibility} activeOpacity={0.7}>
                {isBalanceVisible ? (
                  <Eye width={16} height={16} fill={isDarkMode ? '#93c5fd' : '#1d4ed8'} />
                ) : (
                  <EyeCros width={16} height={16} fill={isDarkMode ? '#93c5fd' : '#1d4ed8'} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionText}>Verify ID</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionText}>My QR</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Wallet & Payment</Text>
      <View style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate('DepositPage')}>
          <Text style={styles.listItemText}>Deposit Saldo</Text>
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => Alert.alert('Payment Methods')}>
          <Text style={styles.listItemText}>Payment Methods</Text>
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate('Transaksi')}>
          <Text style={styles.listItemText}>Transaction History</Text>
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.sectionCard}>
        <View style={[styles.listItem, {paddingVertical: 14}]}>
          <Text style={styles.listItemText}>Notifications</Text>
          <Switch
            style={styles.switch}
            trackColor={{false: '#767577', true: '#1d4ed8'}}
            thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleNotificationToggle}
            value={notificationsEnabled}
          />
        </View>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.listItemText}>Update Profile</Text>
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <View style={[styles.listItem, {paddingVertical: 14}]}>
          <Text style={styles.listItemText}>Biometric Login</Text>
          <Switch
            style={styles.switch}
            trackColor={{false: '#767577', true: '#1d4ed8'}}
            thumbColor={biometricEnabled ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleBiometricToggle}
            value={biometricEnabled}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>General</Text>
      <View style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate('HelpCenter')}>
          <Text style={styles.listItemText}>Help Center</Text>
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.listItemText}>Privacy Policy</Text>
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Version 2.1.0</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
