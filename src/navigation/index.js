import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Головний компонент навігації додатку
export default function AppNavigation() {
  const { isAuthenticated, loading } = useAuth();

  // Поки перевіряємо автентифікацію, показуємо заглушку
  if (loading) {
    return null;
  }

  // Основний контейнер навігації, який обгортає всі навігатори
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
