import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, TextInput, Button, Text } from 'react-native-paper';
import theme from '../../styles/theme';

// Компонент EditNameModal
// Дозволяє користувачу змінити своє ім'я в додатку
// Відображається як модальне вікно, яке можна закрити або зберегти зміни
const EditNameModal = ({ visible, onDismiss, onSave, currentName }) => {
  // Стани компоненту для зберігання даних
  const [name, setName] = useState(currentName || ''); // Поточне ім'я користувача
  const [error, setError] = useState(''); // Повідомлення про помилку валідації

  // Функція для обробки збереження нового імені
  // Перевіряє дані перед збереженням і викликає функцію з пропсів
  const handleSave = () => {
    // Перевіряємо, чи ім'я не порожнє
    if (!name.trim()) {
      setError('Imię nie może być puste');
      return;
    }
    // Викликаємо функцію збереження з передачею нового значення
    onSave(name.trim());
    // Скидаємо стан після збереження
    setName('');
    setError('');
  };

  // Функція для обробки закриття модального вікна
  // Скидає стан форми до початкових значень
  const handleDismiss = () => {
    setName(currentName || '');
    setError('');
    onDismiss();
  };

  // Рендеринг інтерфейсу компоненту
  return (
    // Portal забезпечує відображення модального вікна поверх інших елементів
    <Portal>
      {/* Модальне вікно з React Native Paper з обробкою закриття */}
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.container}
      >
        {/* Заголовок модального вікна */}
        <Text style={styles.title}>Zmień imię</Text>
        
        {/* Поле для введення нового імені */}
        <TextInput
          label="Imię"
          value={name}
          onChangeText={setName} // Оновлення стану під час введення
          style={styles.input}
          error={!!error} // Відображення стану помилки
          autoFocus // Автоматичне фокусування поля після відкриття модального вікна
          left={<TextInput.Icon icon="account" />} // Іконка акаунту зліва
        />
        {/* Умовне відображення повідомлення про помилку */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Контейнер для кнопок дій */}
        <View style={styles.buttonContainer}>
          {/* Кнопка скасування змін */}
          <Button
            mode="outlined"
            onPress={handleDismiss}
            style={styles.button}
          >
            Anuluj
          </Button>
          {/* Кнопка збереження змін */}
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
          >
            Zapisz
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

// Стилі для компонентів модального вікна
const styles = StyleSheet.create({
  // Головний контейнер модального вікна
  container: {
    backgroundColor: theme.colors.background,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  // Стиль для заголовка модального вікна
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  // Стиль для поля введення тексту
  input: {
    marginBottom: 8,
  },
  // Стиль для повідомлення про помилку
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginBottom: 8,
  },
  // Контейнер для кнопок, розміщує їх поруч
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  // Стиль для окремої кнопки
  button: {
    marginLeft: 8,
  },
});

export default EditNameModal;