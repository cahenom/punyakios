import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { adminService } from '../../services';

const AdminNotificationScreen = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ title: '', body: '' });

  const handleSend = async () => {
    if (!notification.title || !notification.body) {
      Alert.alert('Error', 'Judul dan isi notifikasi wajib diisi.');
      return;
    }

    Alert.confirm = (title, msg, onConfirm) => {
        Alert.alert(title, msg, [
            { text: 'Batal', style: 'cancel' },
            { text: 'Kirim', onPress: onConfirm }
        ]);
    };

    Alert.alert(
        'Konfirmasi',
        'Kirim notifikasi ini ke seluruh pengguna?',
        [
            { text: 'Batal', style: 'cancel' },
            { 
                text: 'Kirim', 
                onPress: async () => {
                    setLoading(true);
                    try {
                        const result = await adminService.sendBroadcast(notification.title, notification.body);
                        Alert.alert('Sukses', result.message || 'Notifikasi berhasil diproses.');
                        setNotification({ title: '', body: '' });
                    } catch (error) {
                        Alert.alert('Error', 'Gagal mengirim notifikasi.');
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Broadcast Notifikasi</Text>
      <Text style={styles.description}>
        Pesan ini akan muncul sebagai push notification di HP semua pengguna PunyaKios.
      </Text>

      <Text style={styles.label}>Judul Pesan</Text>
      <TextInput 
        style={styles.input} 
        value={notification.title} 
        onChangeText={(t) => setNotification({...notification, title: t})} 
        placeholder="Contoh: Info Pemeliharaan"
      />

      <Text style={styles.label} >Isi Pesan</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={notification.body} 
        onChangeText={(t) => setNotification({...notification, body: t})} 
        placeholder="Tulis pesan lengkap di sini..."
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSend}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🚀 Kirim ke Semua User</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 14, color: '#666', marginBottom: 30, lineHeight: 20 },
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
  textArea: { height: 120, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AdminNotificationScreen;
