import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import React, {useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  API_URL,
  BLUE_COLOR,
  BOLD_FONT,
  DARK_BACKGROUND,
  DARK_COLOR,
  GREY_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_BACKGROUND,
  WHITE_COLOR,
  GRADIENTS,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  MEDIUM_FONT,
} from '../../utils/const';
import {Eye, EyeCros} from '../../assets';
import {api} from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../../context/AuthContext';
import {getFcmToken} from '../../utils/notifications';
import CustomAlert from '../../components/CustomAlert';

export default function RegisterPage({navigation}) {
  // Hide header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  const {setIsLoggedIn, setLoggedInState} = useAuth();
  const isDarkMode = useColorScheme() === 'dark';
  const [isSecure, setIsSecure] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  });

  const showAlert = (title, message, type = 'info', buttons = []) => {
    setAlert({visible: true, title, message, type, buttons});
  };

  const hideAlert = () => {
    setAlert({...alert, visible: false});
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      showAlert('Error', 'Semua field wajib diisi', 'error');
      return;
    }

    if (password !== passwordConfirmation) {
      showAlert('Error', 'Konfirmasi password tidak cocok', 'error');
      return;
    }

    setLoading(true);

    try {
      // Dapatkan FCM token
      const fcmToken = await getFcmToken();

      const registerData = {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      };

      // Tambahkan FCM token ke data registrasi jika tersedia
      if (fcmToken) {
        registerData.fcm_token = fcmToken;
      }

      const response = await api.post(`/api/auth/register`, registerData);

      console.log('Register response:', response.data); // Debug log

      const token = response.data.data?.token;
      const user = response.data.data?.user;

      if (!token) {
        throw new Error('Token tidak ditemukan dalam respons');
      }

      // SIMPAN TOKEN
      await AsyncStorage.setItem('token', token);

      // SIMPAN USER
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Don't set logged in state yet, navigate to login first
      showAlert('Success', 'Registrasi berhasil', 'success', [
        {
          text: 'OK',
          style: 'primary',
          onPress: () => {
            navigation.navigate('Login');
          },
        },
      ]);

    } catch (error) {
      console.log('Register error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Error will be handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container(isDarkMode)}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroSection}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.heroTitle}>Daftar Sekarang</Text>
          <Text style={styles.heroSubtitle}>
            Buat akun untuk mulai bertransaksi
          </Text>
        </LinearGradient>

        {/* Register Card */}
        <View style={styles.cardContainer(isDarkMode)}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle(isDarkMode)}>Register</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel(isDarkMode)}>Nama Lengkap</Text>
              <TextInput
                style={styles.input(isDarkMode)}
                placeholder="Masukan Nama"
                placeholderTextColor={isDarkMode ? SLATE_COLOR : GREY_COLOR}
                value={name}
                onChangeText={text => setName(text)}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel(isDarkMode)}>Email</Text>
              <TextInput
                style={styles.input(isDarkMode)}
                placeholder="Masukan email"
                placeholderTextColor={isDarkMode ? SLATE_COLOR : GREY_COLOR}
                value={email}
                onChangeText={text => setEmail(text.trim())}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel(isDarkMode)}>Password</Text>
              <View style={styles.passwordContainer(isDarkMode)}>
                <TextInput
                  style={styles.passwordInput(isDarkMode)}
                  placeholder="Password"
                  placeholderTextColor={isDarkMode ? SLATE_COLOR : GREY_COLOR}
                  secureTextEntry={isSecure}
                  value={password}
                  onChangeText={text => setPassword(text)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setIsSecure(!isSecure)}>
                  {isSecure ? <Eye /> : <EyeCros />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Confirmation Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel(isDarkMode)}>Konfirmasi Password</Text>
              <View style={styles.passwordContainer(isDarkMode)}>
                <TextInput
                  style={styles.passwordInput(isDarkMode)}
                  placeholder="Konfirmasi Password"
                  placeholderTextColor={isDarkMode ? SLATE_COLOR : GREY_COLOR}
                  secureTextEntry={isSecure}
                  value={passwordConfirmation}
                  onChangeText={text => setPasswordConfirmation(text)}
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButtonContainer}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={loading ? ['#94a3b8', '#64748b'] : GRADIENTS.primary}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.registerButton}>
                <Text style={styles.registerButtonText}>
                  {loading ? 'Loading...' : 'Register'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider(isDarkMode)} />
              <Text style={styles.dividerText(isDarkMode)}>atau</Text>
              <View style={styles.divider(isDarkMode)} />
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText(isDarkMode)}>
                Sudah punya akun?{' '}
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}>
                <Text style={styles.loginLink}>Login Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onDismiss={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : '#f6f6f8',
  }),
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingTop: SPACING.xxxl * 3,
    paddingBottom: SPACING.xxxl * 3,
    paddingHorizontal: HORIZONTAL_MARGIN,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  backButtonText: {
    fontSize: 24,
    color: WHITE_COLOR,
    fontFamily: BOLD_FONT,
  },
  heroTitle: {
    fontFamily: BOLD_FONT,
    fontSize: 32,
    color: WHITE_COLOR,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontFamily: REGULAR_FONT,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  cardContainer: isDarkMode => ({
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
    borderTopLeftRadius: BORDER_RADIUS.xlarge,
    borderTopRightRadius: BORDER_RADIUS.xlarge,
    marginTop: -SPACING.xxxl,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: HORIZONTAL_MARGIN,
    paddingBottom: SPACING.xxxl * 2,
    flex: 1,
    ...SHADOWS.small,
  }),
  formContainer: {
    gap: SPACING.lg,
  },
  formTitle: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 24,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    marginBottom: SPACING.md,
  }),
  inputContainer: {
    gap: SPACING.sm,
  },
  inputLabel: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 14,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  input: isDarkMode => ({
    borderWidth: 1,
    borderColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    fontFamily: REGULAR_FONT,
    fontSize: 16,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
  }),
  passwordContainer: isDarkMode => ({
    borderWidth: 1,
    borderColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    borderRadius: BORDER_RADIUS.medium,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
  }),
  passwordInput: isDarkMode => ({
    flex: 1,
    fontFamily: REGULAR_FONT,
    fontSize: 16,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    paddingVertical: SPACING.lg,
  }),
  eyeButton: {
    padding: SPACING.sm,
  },
  registerButtonContainer: {
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
  },
  registerButton: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: WHITE_COLOR,
    fontFamily: BOLD_FONT,
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  divider: isDarkMode => ({
    flex: 1,
    height: 1,
    backgroundColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
  }),
  dividerText: isDarkMode => ({
    marginHorizontal: SPACING.lg,
    fontFamily: REGULAR_FONT,
    fontSize: 12,
    color: isDarkMode ? SLATE_COLOR : GREY_COLOR,
  }),
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  loginLink: {
    fontFamily: BOLD_FONT,
    fontSize: 14,
    color: BLUE_COLOR,
  },
});