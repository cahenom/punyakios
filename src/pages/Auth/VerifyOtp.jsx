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

export default function VerifyOtpPage({navigation, route}) {
  const { email } = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const {showAlert} = useAlert();

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    if (otp.length !== 6) {
      showAlert('Error', 'OTP harus 6 digit', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/verify-otp', {
        email: email,
        token: otp,
      });

      if (response.data?.status === 'success') {
        navigation.navigate('ResetPassword', { email: email, token: otp });
      } else {
        setLoading(false);
        showAlert('Error', response.data?.message || 'Kode OTP tidak valid', 'error');
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
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Verifikasi OTP</Text>
          <Text style={styles.heroSubtitle}>
            Masukkan 6 digit kode yang telah dikirim ke email **{email}**.
          </Text>
        </LinearGradient>

        <View style={styles.cardContainer(isDarkMode)}>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel(isDarkMode)}>Kode OTP</Text>
              <TextInput
                placeholder="000000"
                placeholderTextColor={isDarkMode ? SLATE_COLOR : GREY_COLOR}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
                style={[styles.input(isDarkMode), {fontSize: 24, letterSpacing: 10}]}
              />
            </View>

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={loading ? ['#94a3b8', '#64748b'] : GRADIENTS.primary}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.button}>
                <Text style={styles.buttonText}>
                  {loading ? 'Memverifikasi...' : 'Verifikasi'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText(isDarkMode)}>Tidak menerima kode? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.resendLink}>Kirim Ulang</Text>
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
    textAlign: 'center',
  }),
  input: isDarkMode => ({
    borderWidth: 1,
    borderColor: isDarkMode ? SLATE_COLOR : GREY_COLOR,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    fontFamily: BOLD_FONT,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
    backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND,
  }),
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  resendText: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  resendLink: {
    fontFamily: BOLD_FONT,
    fontSize: 14,
    color: GRADIENTS.primary[0],
  },
});
