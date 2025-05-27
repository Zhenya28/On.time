import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import TasksScreen from '../screens/tasks/TasksScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import PomodoroScreen from '../screens/pomodoro/PomodoroScreen';
import SettingsNavigator from './SettingsNavigator';
import theme from '../styles/theme';

const Tab = createBottomTabNavigator();

// Навігація для авторизованих користувачів
const MainNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Tasks"
      screenOptions={({ route }) => ({
        headerShown: route.name !== 'Settings',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Вибір іконки для кожного екрану
          if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Pomodoro') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.darkGray,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 0,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          paddingBottom: 0,
          paddingTop: 0,
          marginTop: -15,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          height: 60,
          paddingTop: 5,
          paddingBottom: 5,
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
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ 
          title: 'Zadania',
          headerTitle: 'Zadania',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ 
          title: 'Kalendarz',
          headerTitle: 'Kalendarz',
        }}
      />
      <Tab.Screen
        name="Pomodoro"
        component={PomodoroScreen}
        options={{ 
          title: 'Pomodoro',
          headerTitle: 'Pomodoro',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{ 
          title: 'Ustawienia',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;