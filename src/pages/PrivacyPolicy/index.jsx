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
      title: '1. Pengumpulan dan Penggunaan Data Pribadi',
      content: 'PunyaKios mengumpulkan Data Pribadi yang Anda berikan secara langsung, data yang dikumpulkan saat Anda menggunakan Layanan, serta data yang kami peroleh dari sumber lain. Ini mencakup data identitas, data kontak, informasi perangkat (IMEI, Alamat IP), dan data lokasi untuk kepatuhan terhadap regulasi dan pencegahan penipuan.',
    },
    {
      title: '2. Penggunaan Informasi untuk Layanan Finansial',
      content: 'Kami menggunakan Data Pribadi untuk: (a) Memproses transaksi pembayaran, PPOB, dan transfer saldo; (b) Melakukan verifikasi identitas sesuai peraturan yang berlaku; (c) Menilai kelayakan layanan dan profil risiko; (d) Mendeteksi dan mencegah aktivitas ilegal atau penipuan; serta (e) Memberikan layanan dukungan pelanggan yang dipersonalisasi.',
    },
    {
      title: '3. Keamanan dan Perlindungan Data Terenkripsi',
      content: 'Kami menerapkan standar keamanan internasional termasuk enkripsi AES-256 dan TLS 1.3 untuk melindungi data selama transit dan penyimpanan. PunyaKios menggunakan arsitektur keamanan bertingkat untuk memastikan hanya sistem yang berwenang yang dapat mengakses data secara terbatas untuk keperluan operasional layanan.',
    },
    {
      title: '4. Pengungkapan Kepada Pihak Ketiga',
      content: 'Kami dapat mengungkapkan Data Pribadi kepada mitra strategis kami (seperti penyedia infrastruktur pembayaran, penyelenggara sistem elektronik, dan otoritas pemerintah) hanya sejauh yang diperlukan untuk menyediakan Layanan kepada Anda atau untuk mematuhi kewajiban hukum yang berlaku di negara Republik Indonesia.',
    },
    {
      title: '5. Hak-Hak Subjek Data',
      content: 'Sesuai dengan peraturan pelindungan data pribadi yang berlaku, Anda memiliki hak untuk mengakses, memperbaiki, memperbarui, atau meminta penghapusan Data Pribadi Anda. Anda juga berhak untuk menarik persetujuan pemrosesan data, dengan pemahaman bahwa hal ini dapat berdampak pada ketersediaan atau akses terhadap Layanan PunyaKios tertentu.',
    },
    {
      title: '6. Cookies dan Teknologi Pelacakan',
      content: 'Aplikasi dan situs web kami menggunakan cookies dan teknologi serupa untuk memahami perilaku pengguna, meningkatkan keamanan, mengelola preferensi autentikasi, dan mempersonalisasi materi pemasaran kami. Anda dapat mengatur preferensi pelacakan melalui pengaturan perangkat Anda.',
    },
    {
      title: '7. Penyimpanan dan Retensi Data',
      content: 'Kami menyimpan Data Pribadi Anda selama Anda memiliki akun PunyaKios yang aktif dan setelahnya untuk periode sesuai dengan ketentuan peraturan perundang-undangan (minimal 5-10 tahun untuk data transaksi keuangan) atau selama diperlukan untuk melindungi kepentingan hukum kami.',
    },
    {
      title: '8. Hubungi Kami',
      content: 'Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi ini, Anda dapat menghubungi tim Pelindungan Data kami melalui Help Center di aplikasi atau melalui saluran komunikasi resmi PT Visionary Digital Indonesia lainnya.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'}]}>
      <CustomHeader title="Kebijakan Privasi" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={[styles.lastUpdated, {color: secondaryTextColor}]}>
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
          </Text>
        </View>

        {policySections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>{section.title}</Text>
            <Text style={[styles.sectionContent, {color: secondaryTextColor}]}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.footerSection}>
          <Text style={[styles.footerText, {color: secondaryTextColor}]}>
            Dengan menggunakan layanan PunyaKios, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan dalam Kebijakan Privasi ini. Jika memiliki pertanyaan, Hubungi kami melalui Help Center.
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
