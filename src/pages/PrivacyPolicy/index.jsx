import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import {
  BOLD_FONT,
  HORIZONTAL_MARGIN,
  MEDIUM_FONT,
  REGULAR_FONT,
} from '../../utils/const';

export default function PrivacyPolicy({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';

  const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
  const secondaryTextColor = isDarkMode ? '#94a3b8' : '#64748b';

  const policySections = [
    {
      title: '1. Pengumpulan Informasi',
      content: 'Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat mendaftar akun, melakukan transaksi, atau menghubungi layanan pelanggan. Informasi ini mencakup nama, alamat email, nomor telepon, dan data transaksi.',
    },
    {
      title: '2. Penggunaan Informasi',
      content: 'Informasi yang kami kumpulkan digunakan untuk memproses transaksi Anda, mengelola akun Anda, meningkatkan layanan kami, dan mengirimkan informasi penting terkait akun atau transaksi Anda.',
    },
    {
      title: '3. Keamanan Data',
      content: 'Kami mengambil langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi informasi pribadi Anda dari akses yang tidak sah, pengungkapan, atau kerusakan.',
    },
    {
      title: '4. Berbagi Informasi',
      content: 'Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya berbagi informasi dengan mitra layanan yang diperlukan untuk memproses transaksi atau menyediakan layanan kepada Anda.',
    },
    {
      title: '5. Perubahan Kebijakan',
      content: 'Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan diberitahukan melalui aplikasi atau email yang terdaftar.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'}]}>
      <CustomHeader title="Privacy Policy" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={[styles.lastUpdated, {color: secondaryTextColor}]}>Terakhir diperbarui: 8 Februari 2026</Text>
        </View>

        {policySections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>{section.title}</Text>
            <Text style={[styles.sectionContent, {color: secondaryTextColor}]}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.footerSection}>
          <Text style={[styles.footerText, {color: secondaryTextColor}]}>
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui Help Center.
          </Text>
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
  headerSection: {
    paddingVertical: 20,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: REGULAR_FONT,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
    lineHeight: 22,
    textAlign: 'justify',
  },
  footerSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 13,
    fontFamily: REGULAR_FONT,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
