import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import MainNavigator from './MainNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import theme from '../styles/theme';

// Створюємо об'єкт нативного стеку навігації
// Stack.Navigator відповідає за навігацію верхнього рівня додатку
const Stack = createNativeStackNavigator();

// Компонент екрану завантаження
// Відображається під час перевірки стану авторизації користувача
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

// Головний компонент навігації
// Визначає, які екрани відображати залежно від стану авторизації користувача
const RootNavigator = () => {
  // Отримуємо інформацію про поточного користувача та стан завантаження
  // з контексту авторизації
  const { user, loading } = useAuth();

  // Якщо триває завантаження стану авторизації, 
  // показуємо індикатор завантаження
  if (loading) {
    return <LoadingScreen />;
  }

  // Після завершення завантаження створюємо навігаційну структуру
  return (
    <NavigationContainer>
      {/* Основний навігаційний стек без заголовків */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Якщо користувач авторизований, показуємо головну навігацію з вкладками
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // Якщо користувач не авторизований, показуємо екрани автентифікації
          <Stack.Group>
            {/* Екран входу в систему */}
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* Екран реєстрації нового користувача */}
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;