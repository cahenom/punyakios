import * as React from 'react';
import {useState, useEffect} from 'react';
import {ActivityIndicator, View, useColorScheme} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LoginPage, RegisterPage, OnboardingScreen} from '../pages';
import {DARK_BACKGROUND, BLUE_COLOR} from '../utils/const';

const Stack = createNativeStackNavigator();

function PublicRoute() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem('@onboarding_seen');
        setHasSeenOnboarding(seen === 'true');
      } catch (e) {
        setHasSeenOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDarkMode ? DARK_BACKGROUND : '#f6f6f8',
        }}>
        <ActivityIndicator size="large" color={BLUE_COLOR} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={hasSeenOnboarding ? 'Login' : 'Onboarding'}>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginPage}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterPage}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default PublicRoute;
