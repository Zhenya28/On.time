import React from 'react';
import { StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import { PomodoroProvider } from './src/context/PomodoroContext';
import { NotificationProvider } from './src/context/NotificationContext';
import RootNavigator from './src/navigation/RootNavigator';
import theme from './src/styles/theme';

// Головний компонент додатку
// Налаштовує всі необхідні провайдери та структуру додатку
// Забезпечує доступ до стану та функцій через систему контекстів
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <StatusBar style="light" backgroundColor={theme.colors.primary} />
          <AuthProvider>
            <NotificationProvider>
              <TaskProvider>
                <PomodoroProvider>
                  <RootNavigator />
                </PomodoroProvider>
              </TaskProvider>
            </NotificationProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}