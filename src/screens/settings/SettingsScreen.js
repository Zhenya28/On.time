import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Button, Divider, Snackbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import EditNameModal from '../../components/settings/EditNameModal';
import theme from '../../styles/theme';

// Компонент SettingsScreen
// Відображає екран налаштувань додатку з параметрами облікового запису
// та іншими налаштуваннями програми
const SettingsScreen = ({ navigation }) => {
  // Отримуємо функції та дані з контексту авторизації
  const { user, logout, updateUserName } = useAuth();
  // Отримуємо функцію очищення завдань з контексту завдань
  const { clearAllTasks } = useTask();
  // Стан для керування видимістю модального вікна редагування імені
  const [editNameVisible, setEditNameVisible] = useState(false);
  // Стани для керування відображенням Snackbar повідомлень
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Функція обробки виходу з системи
  // Викликає функцію logout з контексту авторизації
  const handleLogout = async () => {
    await logout();
  };

  // Функція для очищення всіх завдань користувача
  // Викликає функцію clearAllTasks з контексту завдань
  const handleClearTasks = async () => {
    const result = await clearAllTasks();
    if (result?.success) {
      // Показуємо повідомлення про успішне видалення
      setSnackbarMessage('Wszystkie zadania zostały usunięte');
      setSnackbarVisible(true);
    }
  };

  // Функція для оновлення імені користувача
  // Викликає функцію updateUserName з контексту авторизації
  const handleUpdateName = async (newName) => {
    const result = await updateUserName(newName);
    if (result.success) {
      // Показуємо повідомлення про успішне оновлення
      setSnackbarMessage('Imię zostało zaktualizowane');
      setSnackbarVisible(true);
      setEditNameVisible(false);
    } else {
      // Показуємо повідомлення про помилку
      setSnackbarMessage('Wystąpił błąd podczas aktualizacji imienia');
      setSnackbarVisible(true);
    }
  };

  // Рендеримо інтерфейс екрану налаштувань
  return (
    <>
      <ScrollView style={styles.container}>
        {/* Секція налаштувань облікового запису */}
        <List.Section>
          <List.Subheader>Konto użytkownika</List.Subheader>
          {/* Елемент для редагування імені */}
          <List.Item
            title="Imię"
            description={user?.displayName || 'Nie podano'} // Відображаємо ім'я або текст "Не вказано"
            left={props => <List.Icon {...props} icon="account" />} // Іконка користувача зліва
            right={props => <List.Icon {...props} icon="pencil" />} // Іконка редагування справа
            onPress={() => setEditNameVisible(true)} // Відкриваємо модальне вікно при натисканні
          />
          {/* Елемент для відображення електронної пошти (лише для читання) */}
          <List.Item
            title="Email"
            description={user?.email}
            left={props => <List.Icon {...props} icon="email" />}
          />
          <Divider /> {/* Розділювач між елементами */}
          {/* Елемент для видалення всіх завдань */}
          <List.Item
            title="Wyczyść wszystkie zadania"
            description="Usuń wszystkie zapisane zadania"
            left={props => <List.Icon {...props} icon="delete" />}
            onPress={handleClearTasks} // Викликаємо функцію видалення при натисканні
          />
        </List.Section>

        {/* Секція інформації про додаток */}
        <List.Section>
          <List.Subheader>Aplikacja</List.Subheader>
          {/* Елемент для переходу на екран "Про додаток" */}
          <List.Item
            title="O aplikacji"
            description="Informacje o aplikacji On.Time"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('About')} // Переходимо на екран About при натисканні
          />
        </List.Section>

        {/* Контейнер з кнопкою виходу */}
        <View style={styles.logoutContainer}>
          <Button 
            mode="contained" 
            onPress={handleLogout} // Викликаємо функцію виходу при натисканні
            style={styles.logoutButton}
          >
            Wyloguj się
          </Button>
        </View>
      </ScrollView>

      {/* Модальне вікно для редагування імені */}
      <EditNameModal
        visible={editNameVisible} // Контролюємо видимість модального вікна
        onDismiss={() => setEditNameVisible(false)} // Закриваємо вікно при скасуванні
        onSave={handleUpdateName} // Викликаємо функцію оновлення імені при збереженні
        currentName={user?.displayName} // Передаємо поточне ім'я для початкового значення
      />

      {/* Snackbar для відображення повідомлень користувачу */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000} // Тривалість відображення в мілісекундах
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

// Стилі для компонентів екрану налаштувань
const styles = StyleSheet.create({
  // Основний контейнер з прокруткою
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Контейнер для кнопки виходу
  logoutContainer: {
    padding: 16,
    marginTop: 16,
  },
  // Стиль для кнопки виходу (червоний колір)
  logoutButton: {
    backgroundColor: '#FF486A',
  },
});

export default SettingsScreen;