import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MyTabBar from '../components/BottomTab';
import {
  BpjsKesehatan,
  DompetElektronik,
  Games,
  HomeScreen,
  Internet,
  LayananPLN,
  LihatSemuaScreen,
  MasaAktif,
  PDAM,
  PLNPascabayar,
  PLNPrabayar,
  ProfilScreen,
  PromoScreen,
  Pulsa,
  ScanScreen,
  SettingsScreen,
  SuccessNotif,
  TransactionResult,
  TopupDompet,
  TopupGames,
  TopupMasaAktif,
  TopupTV,
  TypeTV,
  TopupVoucher,
  TypeVoucher,
  TV,
  Voucher,
  Indosat,
  DepositPage,
  DataPackage,
  DataType,
  TopupData,
  TypeEmoney,
  DepositSuccess,
  DepositFailed,
  PaymentWebView,
  HelpCenter,
  PrivacyPolicy
} from '../pages';
import Transaksi from '../pages/Transaksi';
import {
  PaymentPage,
  PaymentSuccessPage,
} from '../pages';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator tabBar={props => <MyTabBar {...props} />}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Promo"
        component={PromoScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Transaksi"
        component={Transaksi}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function ProtectedRoute() {
  return (
    <Stack.Navigator initialRouteName="MyTabs">
      <Stack.Screen
        name="MyTabs"
        component={MyTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Pulsa"
        component={Pulsa}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DataPackage"
        component={DataPackage}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DataType"
        component={DataType}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TopupData"
        component={TopupData}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LayananPLN"
        component={LayananPLN}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PLNPrabayar"
        component={PLNPrabayar}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PLNPascabayar"
        component={PLNPascabayar}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TransactionResult"
        component={TransactionResult}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SuccessNotif"
        component={SuccessNotif}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DompetElektronik"
        component={DompetElektronik}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TypeEmoney"
        component={TypeEmoney}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TopupDompet"
        component={TopupDompet}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Games"
        component={Games}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TopupGames"
        component={TopupGames}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MasaAktif"
        component={MasaAktif}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TopupMasaAktif"
        component={TopupMasaAktif}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TV"
        component={TV}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TopupTV"
        component={TopupTV}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TypeTV"
        component={TypeTV}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Voucher"
        component={Voucher}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TopupVoucher"
        component={TopupVoucher}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TypeVoucher"
        component={TypeVoucher}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BpjsKesehatan"
        component={BpjsKesehatan}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PDAM"
        component={PDAM}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Internet"
        component={Internet}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LihatSemua"
        component={LihatSemuaScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Indosat"
        component={Indosat}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentPage"
        component={PaymentPage}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentSuccessPage"
        component={PaymentSuccessPage}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DepositPage"
        component={DepositPage}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DepositSuccess"
        component={DepositSuccess}
        options={{
          title: 'Deposit Berhasil',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DepositFailed"
        component={DepositFailed}
        options={{
          title: 'Deposit Gagal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentWebView"
        component={PaymentWebView}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenter}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default ProtectedRoute;
