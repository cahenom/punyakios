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

export default function TermsConditions({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';

  const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
  const secondaryTextColor = isDarkMode ? '#94a3b8' : '#64748b';

  const termSections = [
    {
      title: '1. Ketentuan Umum',
      content: 'Layanan PunyaKios disediakan oleh PT Visionary Digital Indonesia. Dengan mengakses atau menggunakan aplikasi, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini, Kebijakan Privasi, dan pedoman operasional lainnya yang kami terbitkan.',
    },
    {
      title: '2. Pendaftaran Akun dan Keamanan',
      content: 'Anda bertanggung jawab penuh atas keamanan kredensial akun Anda (Username & PIN/Password). Segala aktivitas yang terjadi melalui akun Anda dianggap sebagai aktivitas sah Anda. PunyaKios tidak bertanggung jawab atas kerugian akibat kelalaian dalam menjaga kerahasiaan akun.',
    },
    {
      title: '3. Layanan Transaksi Finansial',
      content: 'Layanan mencakup pembelian pulsa, paket data, pembayaran PPOB, dan transfer saldo P2P. Anda menjamin bahwa dana yang digunakan berasal dari sumber yang sah. PunyaKios berhak menangguhkan transaksi yang mencurigakan atau melanggar hukum.',
    },
    {
      title: '4. Biaya dan Pembayaran',
      content: 'Biaya layanan dan admin akan diinformasikan secara transparan sebelum transaksi dikonfirmasi. Anda menyetujui bahwa semua biaya yang telah dibayarkan bersifat final dan tidak dapat dikembalikan, kecuali ditentukan lain oleh kebijakan perlindungan konsumen PunyaKios.',
    },
    {
      title: '5. Batasan Tanggung Jawab',
      content: 'PunyaKios menyediakan layanan secara "as is" dan "as available". Kami tidak bertanggung jawab atas kegagalan transaksi yang disebabkan oleh gangguan jaringan operator seluler, pemeliharaan sistem pihak ketiga, atau kesalahan input data oleh Pengguna.',
    },
    {
      title: '6. Hak Atas Kekayaan Intelektual',
      content: 'Seluruh desain, logo, perangkat lunak, dan merek dagang PunyaKios adalah milik sah PT Visionary Digital Indonesia. Penggunaan tanpa izin dilarang keras dan dapat dikenakan sanksi hukum sesuai peraturan di Indonesia.',
    },
    {
      title: '7. Penangguhan dan Penghentian Akun',
      content: 'Kami berhak memblokir akun secara permanen jika ditemukan indikasi penyalahgunaan layanan, tindak pidana pencucian uang, atau pelanggaran berat terhadap Syarat dan Ketentuan ini tanpa pemberitahuan sebelumnya.',
    },
    {
      title: '8. Hukum yang Berlaku',
      content: 'Syarat dan Ketentuan ini diatur oleh hukum Negara Kesatuan Republik Indonesia. Segala perselisihan yang timbul akan diselesaikan melalui musyawarah, dan jika tidak tercapai mufakat, akan diselesaikan melalui pengadilan yang berwenang.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'}]}>
      <CustomHeader title="Syarat & Ketentuan" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={[styles.lastUpdated, {color: secondaryTextColor}]}>
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
          </Text>
        </View>

        {termSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>{section.title}</Text>
            <Text style={[styles.sectionContent, {color: secondaryTextColor}]}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.footerSection}>
          <Text style={[styles.footerText, {color: secondaryTextColor}]}>
            Dengan menggunakan layanan PunyaKios, Anda menyatakan telah setuju untuk tunduk pada seluruh peraturan dan batasan hukum yang ditetapkan di atas.
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
