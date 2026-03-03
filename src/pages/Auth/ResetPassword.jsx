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
import {api} from '../../utils/api';
import {Eye, EyeCros} from '../../assets';

export default function ResetPasswordPage({navigation, route}) {
  const { email, token } = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSecure, setIsSecure] = useState(true);
  const [isSecureConfirm, setIsSecureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);
  const {showAlert} = useAlert();

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    
    if (!password || !confirmPassword) {
      showAlert('Error', 'Semua field wajib diisi', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Password konfirmasi tidak cocok', 'error');
      return;
    }

    if (password.length < 6) {
      showAlert('Error', 'Password minimal 6 karakter', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/reset-password', {
        email: email,
        token: token,
        password: password,
        password_confirmation: confirmPassword,
      });

      if (response.data?.status === 'success') {
        showAlert('Success', 'Password berhasil diperbarui', 'success');
        navigation.navigate('Login');
      } else {
        setLoading(false);
        showAlert('Error', response.data?.message || 'Gagal reset password', 'error');
      }
    } catch (error) {
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
        
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroSection}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Ke Login</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Sandi Baru</Text>
          <Text style={styles.heroSubtitle}>
            Tentukan password baru untuk akun **{email}**.
          </Text>
        </LinearGradient>

        <View style={styles.cardContainer(isDarkMode)}>
          <View style={styles.formContainer}>
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel(isDarkMode)}>Password Baru</Text>
              <View style={styles.passwordWrapper(isDarkMode)}>
                <TextInput
                  style={styles.passwordInput(isDarkMode)}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor={isDarkMode ? SLATE_COLOR : GREY_COLOR}
                  secureTextEntry={isSecure}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setIsSecure(!isSecure)}>
                  {isSecure ? <Eye /> : <EyeCros />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel(isDarkMode)}>Konfirmasi Password Baru</Text>
              <View style={styles.passwordWrapper(isDarkMode)}>
                <TextInput
                  style={styles.passwordInput(isDarkMode)}
                  placeholder="Ulangi password baru"
                  placeholderTextColor={isDarkMode ? SLATE_COLOR : GREY_COLOR}
                  secureTextEntry={isSecureConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setIsSecureConfirm(!isSecureConfirm)}>
                  {isSecureConfirm ? <Eye /> : <EyeCros />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={loading ? ['#94a3b8', '#64748b'] : GRADIENTS.primary}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.button}>
                <Text style={styles.buttonText}>
                  {loading ? 'Memproses...' : 'Reset Password'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.xxxl * 2,
    paddingHorizontal: HORIZONTAL_MARGIN,
  },
  backButton: {
    marginBottom: SPACING.lg,
  },
  backButtonText: {
    color: WHITE_COLOR,
    fontFamily: MEDIUM_FONT,
    fontSize: 16,
  },
  heroTitle: {
    fontFamily: BOLD_FONT,
    fontSize: 28,
    color: WHITE_COLOR,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
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
  passwordWrapper: isDarkMode => ({
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
  buttonContainer: {
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: WHITE_COLOR,
    fontFamily: BOLD_FONT,
    fontSize: 16,
  },
});
