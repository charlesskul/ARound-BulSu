import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';
import ARNavigationScreen from './src/screens/ARNavigationScreen';
import AREmergencyScreen from './src/screens/AREmergencyScreen';
import BuildingDetailsScreen from './src/screens/BuildingDetailsScreen';
import BuildingSearchScreen from './src/screens/BuildingSearchScreen';

import { AppProvider } from './src/context/AppContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator 
            initialRouteName="Splash"
            screenOptions={{ 
              headerShown: false,
              animation: 'fade'
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="ARNavigation" 
              component={ARNavigationScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen 
              name="AREmergency" 
              component={AREmergencyScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen 
              name="BuildingDetails" 
              component={BuildingDetailsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="BuildingSearch" 
              component={BuildingSearchScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
