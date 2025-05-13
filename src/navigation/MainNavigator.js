import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import TasksScreen from '../screens/tasks/TasksScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import PomodoroScreen from '../screens/pomodoro/PomodoroScreen';
import SettingsNavigator from './SettingsNavigator';
import theme from '../styles/theme';

// Створюємо об'єкт нижньої панелі навігації
// Tab.Navigator відповідає за навігацію між основними розділами додатку
// за допомогою вкладок у нижній частині екрану
const Tab = createBottomTabNavigator();

// Компонент MainNavigator
// Створює основну навігацію для авторизованих користувачів
// Містить чотири основні розділи: завдання, календар, таймер Pomodoro та налаштування
const MainNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Tasks" // Вказуємо початковий екран - список завдань
      screenOptions={({ route }) => ({
        // Показуємо заголовок для всіх екранів, крім налаштувань
        headerShown: route.name !== 'Settings',
        // Функція для вибору іконки залежно від активності та типу вкладки
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Вибір іконки для кожного екрану
          // Для активних вкладок використовуємо заповнені іконки, для неактивних - контурні
          if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Pomodoro') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          // Повертаємо компонент іконки з бібліотеки Ionicons
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Кольори для активної та неактивної вкладки
        tabBarActiveTintColor: theme.colors.primary,      // Колір активної вкладки
        tabBarInactiveTintColor: theme.colors.darkGray,   // Колір неактивної вкладки
        // Стиль для тексту вкладки
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 0,
          paddingBottom: 0,
        },
        // Стиль для елемента вкладки
        tabBarItemStyle: {
          paddingBottom: 0,
          paddingTop: 0,
          marginTop: -15,
        },
        // Стиль для всієї нижньої панелі навігації
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          height: 60,
          paddingTop: 5,
          paddingBottom: 5,
          // Видаляємо тіні та рамки для більш сучасного вигляду
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
          borderWidth: 0,
          shadowOffset: {
            width: 0,
            height: 0
          },
          shadowRadius: 0,
          shadowColor: 'transparent',
          borderTopColor: 'transparent',
        },
        // Стиль для заголовка екрану
        headerStyle: {
          backgroundColor: theme.colors.primary, // Фон заголовка в колір додатку
          elevation: 0,                        // Видаляємо тінь заголовка
          shadowOpacity: 0,
        },
        headerTintColor: 'white',             // Білий колір тексту заголовка
        headerTitleStyle: {
          fontWeight: 'bold',                 // Жирний шрифт для заголовка
        },
      })}
    >
      {/* Екран завдань - основний екран для перегляду та управління завданнями */}
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ 
          title: 'Zadania',                  // Назва вкладки
          headerTitle: 'Zadania',            // Заголовок екрану
        }}
      />
      
      {/* Екран календаря - для перегляду завдань у вигляді календаря */}
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ 
          title: 'Kalendarz',                // Назва вкладки
          headerTitle: 'Kalendarz',          // Заголовок екрану
        }}
      />
      
      {/* Екран Pomodoro - для роботи з таймером Pomodoro */}
      <Tab.Screen
        name="Pomodoro"
        component={PomodoroScreen}
        options={{ 
          title: 'Pomodoro',                 // Назва вкладки
          headerTitle: 'Pomodoro',           // Заголовок екрану
        }}
      />
      
      {/* Екран налаштувань - для зміни параметрів додатку та управління профілем користувача */}
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}        // Використовуємо окремий навігатор для налаштувань
        options={{ 
          title: 'Ustawienia',               // Назва вкладки
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;