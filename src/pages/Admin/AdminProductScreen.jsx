import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { adminService } from '../../services';

const AdminProductScreen = () => {
  const [loading, setLoading] = useState(false);

  const handleSyncPrepaid = async () => {
    setLoading(true);
    try {
      const result = await adminService.syncPrepaid();
      if (result.status === 'success') {
        Alert.alert('Sukses', `Berhasil sinkronisasi ${result.data.total} produk prabayar.`);
      } else {
        Alert.alert('Gagal', result.message || 'Gagal sinkronisasi produk.');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPasca = async () => {
    setLoading(true);
    try {
      const result = await adminService.syncPasca();
      if (result.status === 'success') {
        Alert.alert('Sukses', `Berhasil sinkronisasi ${result.data.total} produk pascabayar.`);
      } else {
        Alert.alert('Gagal', result.message || 'Gagal sinkronisasi produk.');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manajemen Produk</Text>
      <Text style={styles.description}>
        Klik tombol di bawah untuk mengambil data produk terbaru langsung dari portal supplier (Digiflazz).
      </Text>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSyncPrepaid}
        disabled={loading}
      >
        <Text style={styles.buttonText}>🔄 Sinkronisasi Produk Prabayar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonPasca, loading && styles.buttonDisabled]} 
        onPress={handleSyncPasca}
        disabled={loading}
      >
        <Text style={styles.buttonText}>🔄 Sinkronisasi Produk Pascabayar</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#dc3545" />
          <Text style={styles.loaderText}>Sedang Memproses...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 14, color: '#666', marginBottom: 30, lineHeight: 20 },
  button: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  buttonPasca: { backgroundColor: '#007bff' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loaderContainer: { marginTop: 30, alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#dc3545', fontWeight: 'bold' }
});

export default AdminProductScreen;
