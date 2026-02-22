import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import {
  BLUE_COLOR,
  DARK_BACKGROUND,
  DARK_COLOR,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  WHITE_BACKGROUND,
} from '../../utils/const';
import {UserDefault, ScanIcon} from '../../assets';
import Input from '../../components/form/Input';
import CustomHeader from '../../components/CustomHeader';
import ModernButton from '../../components/ModernButton';
import {api} from '../../utils/api';
import {useAlert} from '../../context/AlertContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';

export default function TransferPage({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const {showAlert} = useAlert();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const historyStr = await AsyncStorage.getItem('transfer_history');
      if (historyStr) {
        setHistory(JSON.parse(historyStr));
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const handleSearch = async (phoneNumber) => {
    const searchPhone = phoneNumber || phone;
    if (!searchPhone) {
      showAlert('Error', 'Masukan nomor HP tujuan', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/api/user/search-phone', { phone: searchPhone });
      if (response.data.status === 'success') {
        navigation.navigate('TransferAmount', { recipient: response.data.data });
      } else {
        showAlert('Info', response.data.message, 'info');
      }
    } catch (error) {
      console.log('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHistoryItem = ({item}) => (
    <TouchableOpacity
      onPress={() => handleSearch(item.phone)}
      activeOpacity={0.7}
      style={{
        alignItems: 'center',
        marginRight: 20,
        width: 70,
      }}>
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? '#334155' : '#e2e8f0'
      }}>
        <UserDefault width={24} height={24} color={isDarkMode ? LIGHT_COLOR : BLUE_COLOR} />
      </View>
      <Text 
        numberOfLines={1} 
        style={{
          fontSize: 12, 
          color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
          fontFamily: 'Medium',
          textAlign: 'center'
        }}>
        {item.name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? DARK_BACKGROUND : WHITE_BACKGROUND}}>
      <CustomHeader title="Transfer Saldo" />
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={{marginHorizontal: HORIZONTAL_MARGIN, marginTop: 20}}>
          <View style={{marginBottom: 25}}>
            <Text style={{
              fontFamily: 'Medium', 
              fontSize: 14, 
              color: isDarkMode ? LIGHT_COLOR : DARK_COLOR,
              marginBottom: 8
            }}>Nomor HP Tujuan</Text>
            <Input
              value={phone}
              placeholder="0812xxxxxx"
              onchange={(text) => setPhone(text)}
              type="numeric"
              rightIcon={<UserDefault width={24} height={24} color={isDarkMode ? LIGHT_COLOR : BLUE_COLOR} />}
            />
            <View style={{marginTop: 15, flexDirection: 'row', gap: 10}}>
              <View style={{flex: 1}}>
                <ModernButton
                  label={loading ? 'Mencari...' : 'Cek Nomor'}
                  isLoading={loading}
                  onPress={() => handleSearch()}
                />
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('P2PScan', {tab: 'scan'})}
                activeOpacity={0.8}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: isDarkMode ? '#1e293b' : '#eff6ff',
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#334155' : '#dbeafe',
                }}>
                <ScanIcon width={24} height={24} color={BLUE_COLOR} />
              </TouchableOpacity>
            </View>
          </View>

          {history.length > 0 && (
            <View>
              <Text style={{
                fontFamily: 'Bold', 
                fontSize: 16, 
                color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
                marginBottom: 15
              }}>Nomor Terakhir</Text>
              <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 20}}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
