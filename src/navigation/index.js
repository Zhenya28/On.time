import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Головний компонент навігації додатку
// Визначає, який навігатор показувати (авторизації чи основний) в залежності від стану аутентифікації
export default function AppNavigation() {
  // Отримуємо дані про стан аутентифікації та завантаження з контексту
  // isAuthenticated - чи авторизований користувач
  // loading - чи відбувається завантаження даних авторизації
  const { isAuthenticated, loading } = useAuth();

  // Поки перевіряємо автентифікацію, показуємо заглушку
  // Це запобігає мерехтінню між екранами авторизації та основним додатком
  if (loading) {
    return null;
  }

  // Основний контейнер навігації, який обгортає всі навігатори
  // NavigationContainer - кореневий компонент, що керує станом навігації додатку
  return (
    <NavigationContainer>
      {/* Умовний рендер: якщо користувач аутентифікований - показуємо основний навігатор
          якщо ні - показуємо навігатор авторизації */}
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}