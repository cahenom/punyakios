import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { PaymentRequestService } from '../../services';

const MerchantPaymentRequestScreen = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    id: 'TRX-' + Date.now(),
    destination: '',
    price: '',
    email: '',
  });

  const handleRequest = async () => {
    if (!form.name || !form.destination || !form.price || !form.email) {
      Alert.alert('Error', 'Semua field wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      // Note: This service requires API Key in real scenario, 
      // but we use the existing service pattern.
      const result = await PaymentRequestService.createRequest(form);
      if (result.status) {
        Alert.alert('Sukses', 'Permintaan pembayaran berhasil dikirim ke pelanggan.');
        setForm({
          name: '',
          id: 'TRX-' + Date.now(),
          destination: '',
          price: '',
          email: '',
        });
      } else {
        Alert.alert('Gagal', result.message || 'Gagal mengirim permintaan.');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tagih Pembeli</Text>
      <Text style={styles.label}>Nama Merchant / Toko</Text>
      <TextInput 
        style={styles.input} 
        value={form.name} 
        onChangeText={(t) => setForm({...form, name: t})} 
        placeholder="Nama Toko Anda"
      />

      <Text style={styles.label}>Email Pelanggan</Text>
      <TextInput 
        style={styles.input} 
        value={form.email} 
        onChangeText={(t) => setForm({...form, email: t})} 
        placeholder="user@example.com"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Deskripsi Layanan / Barang</Text>
      <TextInput 
        style={styles.input} 
        value={form.destination} 
        onChangeText={(t) => setForm({...form, destination: t})} 
        placeholder="Contoh: Paket Data 50GB"
      />

      <Text style={styles.label}>Nominal Tagihan (Rp)</Text>
      <TextInput 
        style={styles.input} 
        value={form.price} 
        onChangeText={(t) => setForm({...form, price: t})} 
        placeholder="10000"
        keyboardType="numeric"
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleRequest}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kirim Tagihan Sekarang</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333'
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default MerchantPaymentRequestScreen;
