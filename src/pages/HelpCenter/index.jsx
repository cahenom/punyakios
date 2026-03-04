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
  GREY_COLOR,
  BORDER_RADIUS,
  SPACING,
} from '../../utils/const';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HelpCenter({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [expandedIndex, setExpandedIndex] = React.useState(null);

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
            <TouchableOpacity 
              key={index} 
              style={[
                styles.faqCard, 
                {
                  backgroundColor: cardBg, 
                  borderColor: expandedIndex === index ? BLUE_COLOR : borderColor,
                  borderWidth: expandedIndex === index ? 1.5 : 1
                }
              ]}
              onPress={() => toggleExpand(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, {color: textColor, flex: 1}]}>{item.question}</Text>
                <Text style={{color: expandedIndex === index ? BLUE_COLOR : secondaryTextColor, fontSize: 18, fontWeight: 'bold'}}>
                  {expandedIndex === index ? '−' : '+'}
                </Text>
              </View>
              {expandedIndex === index && (
                <View style={styles.answerContainer}>
                  <View style={styles.divider} />
                  <Text style={[styles.faqAnswer, {color: secondaryTextColor}]}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={[styles.contactTitle, {color: textColor}]}>Butuh bantuan lebih lanjut?</Text>
          <Text style={styles.contactSubtitle}>
            Tim kami siap membantu Anda 24/7 untuk segala kendala transaksi.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContactSupport}
            activeOpacity={0.8}
          >
            <Text style={styles.contactButtonText}>Chat via WhatsApp</Text>
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
    paddingVertical: 35,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: BOLD_FONT,
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: REGULAR_FONT,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: BOLD_FONT,
    marginBottom: 16,
  },
  faqCard: {
    borderRadius: BORDER_RADIUS.medium,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      }
    })
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 15,
    fontFamily: MEDIUM_FONT,
  },
  answerContainer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
    opacity: 0.5,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
    lineHeight: 22,
  },
  contactSection: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: '#eff6ff', // Light blue background for emphasis
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 13,
    fontFamily: REGULAR_FONT,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: BLUE_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.medium,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  contactButtonText: {
    color: WHITE_COLOR,
    fontFamily: BOLD_FONT,
    fontSize: 15,
  },
});
