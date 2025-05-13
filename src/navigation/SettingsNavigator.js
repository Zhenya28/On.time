import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/settings/SettingsScreen';
import AboutScreen from '../screens/about/AboutScreen';
import theme from '../styles/theme';

// Створюємо об'єкт навігаційного стеку
// Stack.Navigator дозволяє переміщатися між різними екранами налаштувань
// з навігацією у стилі стеку (екрани відкриваються поверх один одного)
const Stack = createStackNavigator();

// Компонент SettingsNavigator
// Відповідає за навігацію між різними екранами розділу налаштувань
// Включає головний екран налаштувань та екран "Про додаток"
const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        // Стиль для заголовка екрану
        headerStyle: {
          backgroundColor: theme.colors.primary, // Колір фону заголовка з теми додатку
        },
        headerTintColor: '#fff',              // Білий колір тексту заголовка
        headerTitleStyle: {
          fontWeight: 'bold',                 // Жирний шрифт для заголовка
        },
      }}
    >
      {/* Головний екран налаштувань */}
      <Stack.Screen
        name="SettingsMain"                   // Внутрішня назва екрану для навігації
        component={SettingsScreen}            // Компонент, який буде відображатися
        options={{ 
          title: 'Ustawienia',                // Заголовок екрану, що відображається користувачу
        }}
      />
      
      {/* Екран інформації про додаток */}
      <Stack.Screen
        name="About"                          // Внутрішня назва екрану для навігації
        component={AboutScreen}               // Компонент, який буде відображатися
        options={{ 
          title: 'O aplikacji',               // Заголовок екрану, що відображається користувачу
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;