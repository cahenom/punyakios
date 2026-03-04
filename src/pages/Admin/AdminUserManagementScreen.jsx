import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { adminService } from '../../services';

const AdminUserManagementScreen = () => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [foundUser, setFoundUser] = useState(null);

  const handleSearch = async () => {
    if (!phone) return;
    setLoading(true);
    setFoundUser(null);
    try {
      const result = await adminService.searchUserByPhone(phone);
      if (result.status === 'success') {
        setFoundUser(result.data);
      } else {
        Alert.alert('Tidak Ditemukan', 'User dengan nomor tersebut tidak ada.');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mencari user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manajemen Akun</Text>
      
      <View style={styles.searchBox}>
        <TextInput 
          style={styles.searchInput} 
          value={phone} 
          onChangeText={setPhone} 
          placeholder="Cari Nomor HP (0812...)"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.searchButtonText}>Cari</Text>}
        </TouchableOpacity>
      </View>

      {foundUser && (
        <View style={styles.userCard}>
          <Text style={styles.userName}>{foundUser.name}</Text>
          <Text style={styles.userPhone}>{foundUser.phone}</Text>
          <View style={styles.divider} />
          
          <Text style={styles.cardLabel}>Aksi Cepat:</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>➕ Tambah Saldo (Manual)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.buttonSecondary]}>
            <Text style={styles.actionButtonText}>📈 Upgrade ke Reseller</Text>
          </TouchableOpacity>
        </View>
      )}

      {!foundUser && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Gunakan kolom di atas untuk mencari data user.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  searchBox: { flexDirection: 'row', marginBottom: 20 },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    fontSize: 16
  },
  searchButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchButtonText: { color: '#fff', fontWeight: 'bold' },
  userCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userPhone: { fontSize: 16, color: '#666', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  cardLabel: { fontSize: 14, color: '#888', marginBottom: 10, fontWeight: '600' },
  actionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  actionButtonText: { color: '#dc3545', fontWeight: 'bold' },
  buttonSecondary: { borderColor: '#007bff' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', textAlign: 'center' }
});

export default AdminUserManagementScreen;
