import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {useAlert} from '../../context/AlertContext';
import {makeExchangeCall} from '../../helpers/apiBiometricHelper';
import CustomHeader from '../../components/CustomHeader';
import {
  BOLD_FONT,
  MEDIUM_FONT,
  REGULAR_FONT,
  BLUE_COLOR,
  WHITE_COLOR,
  HORIZONTAL_MARGIN,
  SPACING,
  BORDER_RADIUS,
} from '../../utils/const';

export default function PointsRedeem() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const {user, refreshUserProfile} = useAuth();
  const {showAlert} = useAlert();
  const [points, setPoints] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExchange = async () => {
    const pointsNum = parseInt(points);
    if (isNaN(pointsNum) || pointsNum < 100) {
      showAlert('Error', 'Minimal penukaran adalah 100 poin');
      return;
    }

    if (pointsNum > user?.points) {
      showAlert('Error', 'Poin Anda tidak cukup');
      return;
    }

    setLoading(true);
    try {
      const response = await makeExchangeCall({points: pointsNum});
      if (response.status === 'success' || response.status === true) {
        showAlert('Berhasil', response.message || 'Poin berhasil ditukar menjadi saldo');
        await refreshUserProfile();
        navigation.goBack();
      } else {
        showAlert('Gagal', response.message || 'Gagal menukar poin');
      }
    } catch (error) {
      console.error('Error exchanging points:', error);
      if (error.message !== 'Biometric authentication failed') {
        showAlert('Gagal', error.response?.data?.message || 'Terjadi kesalahan sistem');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container(isDarkMode)}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <CustomHeader title="Tukar Poin" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card(isDarkMode)}>
          <Text style={styles.label(isDarkMode)}>Total Poin Anda</Text>
          <Text style={styles.pointsValue}>🪙 {user?.points || 0}</Text>
          <Text style={styles.infoText}>1 Poin = Rp 1 Saldo</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel(isDarkMode)}>Jumlah Poin yang Ditukar</Text>
          <TextInput
            style={styles.input(isDarkMode)}
            placeholder="Minimal 100"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            value={points}
            onChangeText={setPoints}
          />
          <Text style={styles.helperText}>
            Kamu akan menerima Rp {points ? parseInt(points).toLocaleString('id-ID') : 0} Saldo
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleExchange}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={WHITE_COLOR} />
          ) : (
            <Text style={styles.buttonText}>Tukar Sekarang</Text>
          )}
        </TouchableOpacity>

        <View style={styles.notesContainer(isDarkMode)}>
          <Text style={styles.notesTitle(isDarkMode)}>Catatan:</Text>
          <Text style={styles.noteItem(isDarkMode)}>• Minimal penukaran adalah 100 Poin.</Text>
          <Text style={styles.noteItem(isDarkMode)}>• Poin yang sudah ditukar tidak dapat dikembalikan.</Text>
          <Text style={styles.noteItem(isDarkMode)}>• Saldo akan langsung bertambah ke akun Anda.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? '#101622' : '#f6f6f8',
  }),
  content: {
    padding: HORIZONTAL_MARGIN,
  },
  card: isDarkMode => ({
    backgroundColor: isDarkMode ? '#1a2332' : WHITE_COLOR,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  }),
  label: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? '#94a3b8' : '#64748b',
    marginBottom: 8,
  }),
  pointsValue: {
    fontFamily: BOLD_FONT,
    fontSize: 32,
    color: '#f97316',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: MEDIUM_FONT,
    fontSize: 12,
    color: BLUE_COLOR,
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  inputLabel: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 14,
    color: isDarkMode ? WHITE_COLOR : '#334155',
    marginBottom: 8,
  }),
  input: isDarkMode => ({
    backgroundColor: isDarkMode ? '#1e293b' : WHITE_COLOR,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
    borderRadius: BORDER_RADIUS.medium,
    padding: 12,
    fontSize: 16,
    color: isDarkMode ? WHITE_COLOR : '#000',
    fontFamily: MEDIUM_FONT,
  }),
  helperText: {
    fontFamily: REGULAR_FONT,
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    padding: 16,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  buttonText: {
    fontFamily: BOLD_FONT,
    fontSize: 16,
    color: WHITE_COLOR,
  },
  notesContainer: isDarkMode => ({
    backgroundColor: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.05)',
    padding: 16,
    borderRadius: BORDER_RADIUS.medium,
  }),
  notesTitle: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 14,
    color: isDarkMode ? WHITE_COLOR : '#334155',
    marginBottom: 8,
  }),
  noteItem: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 12,
    color: isDarkMode ? '#94a3b8' : '#64748b',
    marginBottom: 4,
    lineHeight: 18,
  }),
});
