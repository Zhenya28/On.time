import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/settings/SettingsScreen';
import AboutScreen from '../screens/about/AboutScreen';
import theme from '../styles/theme';

const Stack = createStackNavigator();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ 
          title: 'Ustawienia',
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ 
          title: 'O aplikacji',
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator; 