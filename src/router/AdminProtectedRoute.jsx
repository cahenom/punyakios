import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminProductScreen from '../pages/Admin/AdminProductScreen';
import AdminNotificationScreen from '../pages/Admin/AdminNotificationScreen';
import AdminUserManagementScreen from '../pages/Admin/AdminUserManagementScreen';
import { ProfilScreen, SettingsScreen } from '../pages';

const Stack = createNativeStackNavigator();

const AdminDashboard = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.text}>Dashboard Admin</Text>
    <Text style={styles.subtext}>Kelola PunyaKios dari sini</Text>
    
    <TouchableOpacity 
      style={styles.menuButton} 
      onPress={() => navigation.navigate('UserManagement')}
    >
      <Text style={styles.menuButtonText}>👥 Manajemen Akun</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={styles.menuButton} 
      onPress={() => navigation.navigate('ProductSync')}
    >
      <Text style={styles.menuButtonText}>📦 Sinkronisasi Produk</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={styles.menuButton} 
      onPress={() => navigation.navigate('Broadcast')}
    >
      <Text style={styles.menuButtonText}>📢 Broadcast Notifikasi</Text>
    </TouchableOpacity>
  </View>
);

function AdminProtectedRoute() {
  return (
    <Stack.Navigator initialRouteName="AdminHome">
      <Stack.Screen 
        name="AdminHome" 
        component={AdminDashboard} 
        options={{ title: 'Admin Panel' }}
      />
      <Stack.Screen 
        name="UserManagement" 
        component={AdminUserManagementScreen} 
        options={{ title: 'Kelola User' }}
      />
      <Stack.Screen 
        name="ProductSync" 
        component={AdminProductScreen} 
        options={{ title: 'Sinkronisasi Produk' }}
      />
      <Stack.Screen 
        name="Broadcast" 
        component={AdminNotificationScreen} 
        options={{ title: 'Kirim Notifikasi' }}
      />
      <Stack.Screen name="Profil" component={ProfilScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#dc3545', marginBottom: 5 },
  subtext: { fontSize: 16, color: '#6c757d', marginBottom: 40 },
  menuButton: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    marginBottom: 15,
  },
  menuButtonText: { fontSize: 18, color: '#333', fontWeight: 'bold' }
});

export default AdminProtectedRoute;
