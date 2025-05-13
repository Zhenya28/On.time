import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Створюємо об'єкт навігаційного стеку
// Stack.Navigator відповідає за навігацію між екранами в стилі стеку
// (останній відкритий екран відображається зверху)
const Stack = createStackNavigator();

// Компонент AuthNavigator
// Відповідає за навігацію між екранами авторизації у додатку
// Включає екрани входу та реєстрації
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login" // Вказуємо початковий екран - екран входу
      screenOptions={{
        headerShown: false,    // Приховуємо стандартний заголовок навігації
        cardStyle: { backgroundColor: 'white' } // Встановлюємо білий фон для всіх екранів
      }}
    >
      {/* Екран входу в систему */}
      <Stack.Screen name="Login" component={LoginScreen} />
      
      {/* Екран реєстрації нового користувача */}
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;