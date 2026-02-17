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
  Keyboard,
} from 'react-native';
import React, {useState} from 'react';
import {useAlert} from '../../context/AlertContext';
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

export default function LoginPage({navigation}) {
  const {login, setIsLoggedIn, setLoggedInState} = useAuth();
  const isDarkMode = useColorScheme() === 'dark';
  const [isSecure, setIsSecure] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {showAlert} = useAlert();

  const handleLogin = async () => {
    Keyboard.dismiss();
    // Basic validation
    if (!email || !password) {
      showAlert('Error', 'Email dan password wajib diisi', 'error');
      return;
    }

    setLoading(true);

    try {
      // Gunakan fungsi login baru yang full online
      const result = await login(email, password);

      if (result.success) {
        showAlert('Success', 'Login berhasil', 'success');
      } else {
        // Jika ada error lain
        setLoading(false);
        showAlert('Login Gagal', result.error || 'Terjadi kesalahan saat login', 'error');
      }
    } catch (error) {
      console.log('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data
        } : undefined
      });

      setLoading(false);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal terhubung ke server';
      showAlert('Error', errorMessage, 'error');
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container(isDarkMode)}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroSection}>
          <Text style={styles.heroTitle}>Selamat Datang</Text>
          <Text style={styles.heroSubtitle}>
            Masuk untuk melanjutkan transaksi Anda
          </Text>
        </LinearGradient>

        {/* Login Card */}
        <View style={styles.cardContainer(isDarkMode)}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle(isDarkMode)}>Login</Text>
            
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

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButtonContainer}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={loading ? ['#94a3b8', '#64748b'] : GRADIENTS.primary}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.loginButton}>
                <Text style={styles.loginButtonText}>
                  {loading ? 'Loading...' : 'Login'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider(isDarkMode)} />
              <Text style={styles.dividerText(isDarkMode)}>atau</Text>
              <View style={styles.divider(isDarkMode)} />
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText(isDarkMode)}>
                Belum punya akun?{' '}
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}>
                <Text style={styles.registerLink}>Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
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
    paddingTop: SPACING.xxxl * 2,
    paddingBottom: SPACING.xxxl * 3,
    paddingHorizontal: HORIZONTAL_MARGIN,
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
  loginButtonContainer: {
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
  },
  loginButton: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  registerLink: {
    fontFamily: BOLD_FONT,
    fontSize: 14,
    color: BLUE_COLOR,
  },
});
