import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MerchantPaymentRequestScreen from '../pages/Merchant/MerchantPaymentRequestScreen';
import { ProfilScreen, SettingsScreen } from '../pages';

const Stack = createNativeStackNavigator();

const MerchantDashboard = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.text}>Dashboard Merchant</Text>
    <Text style={styles.subtext}>Kelola Stok & Penjualan Toko</Text>

    <TouchableOpacity 
      style={styles.menuButton} 
      onPress={() => navigation.navigate('PaymentRequest')}
    >
      <Text style={styles.menuButtonText}>💸 Tagih Pembeli</Text>
    </TouchableOpacity>
  </View>
);

function MerchantProtectedRoute() {
  return (
    <Stack.Navigator initialRouteName="MerchantHome">
      <Stack.Screen 
        name="MerchantHome" 
        component={MerchantDashboard} 
        options={{ title: 'Merchant Panel' }}
      />
      <Stack.Screen 
        name="PaymentRequest" 
        component={MerchantPaymentRequestScreen} 
        options={{ title: 'Kirim Tagihan' }}
      />
      <Stack.Screen name="Profil" component={ProfilScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#28a745' },
  subtext: { fontSize: 16, color: '#6c757d', marginTop: 10, marginBottom: 30 },
  menuButton: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
  },
  menuButtonText: { fontSize: 18, color: '#333', fontWeight: 'bold' }
});

export default MerchantProtectedRoute;
