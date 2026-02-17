import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import {
  BOLD_FONT,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  FONT_SEDANG,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  MEDIUM_FONT,
  REGULAR_FONT,
  SLATE_COLOR,
  WHITE_BACKGROUND,
  BLUE_COLOR,
  WHITE_COLOR,
} from '../../utils/const';

export default function HelpCenter({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';

  const faqItems = [
    {
      question: 'Bagaimana cara melakukan deposit?',
      answer: 'Anda dapat melakukan deposit melalui menu "Deposit Saldo" di halaman Profil atau Home. Kami mendukung berbagai metode pembayaran seperti transfer bank dan e-wallet.',
    },
    {
      question: 'Kenapa transaksi saya masih pending?',
      answer: 'Transaksi pending biasanya terjadi karena gangguan dari pihak provider atau sedang dalam antrian sistem. Mohon tunggu maksimal 1x24 jam.',
    },
    {
      question: 'Bagaimana cara mendaftar akun?',
      answer: 'Klik tombol "Daftar Sekarang" pada halaman login, isi data diri Anda dengan benar, dan ikuti instruksi selanjutnya.',
    },
    {
      question: 'Apakah aplikasi ini aman?',
      answer: 'Ya, kami menggunakan enkripsi standar industri dan mendukung fitur keamanan tambahan seperti Biometric Login.',
    },
  ];

  const handleContactSupport = () => {
    Linking.openURL('https://wa.me/6285179921771'); // Placeholder WA number
  };

  const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
  const secondaryTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const borderColor = isDarkMode ? '#334155' : '#f1f5f9';

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'}]}>
      <CustomHeader title="Help Center" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, {color: textColor}]}>Ada yang bisa kami bantu?</Text>
          <Text style={[styles.heroSubtitle, {color: secondaryTextColor}]}>
            Temukan jawaban dari pertanyaan Anda atau hubungi layanan pelanggan kami.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>FAQ (Pertanyaan Populer)</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={[styles.faqCard, {backgroundColor: cardBg, borderColor: borderColor}]}>
              <Text style={[styles.faqQuestion, {color: textColor}]}>{item.question}</Text>
              <Text style={[styles.faqAnswer, {color: secondaryTextColor}]}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>Butuh bantuan lebih lanjut?</Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContactSupport}
            activeOpacity={0.8}
          >
            <Text style={styles.contactButtonText}>Hubungi Customer Service (WhatsApp)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_MARGIN,
    paddingBottom: 40,
  },
  heroSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: BOLD_FONT,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
    marginBottom: 15,
  },
  faqCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  faqQuestion: {
    fontSize: 14,
    fontFamily: MEDIUM_FONT,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: REGULAR_FONT,
    lineHeight: 18,
  },
  contactSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  contactButton: {
    backgroundColor: BLUE_COLOR,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  contactButtonText: {
    color: WHITE_COLOR,
    fontFamily: BOLD_FONT,
    fontSize: 14,
  },
});
