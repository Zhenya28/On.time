import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, IconButton, Snackbar, Surface, Switch } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../../styles/theme';

// Компонент TaskFormModal
// Відображає модальне вікно для створення або редагування завдання
// Дозволяє користувачеві встановлювати заголовок, опис, пріоритет, дату та час виконання
const TaskFormModal = ({ visible, onClose, onSave, initialTask = null }) => {
  // Стани компонента для зберігання даних форми
  const [title, setTitle] = useState(''); // Заголовок завдання
  const [description, setDescription] = useState(''); // Опис завдання
  const [priority, setPriority] = useState('medium'); // Пріоритет: high, medium, low
  const [dueDate, setDueDate] = useState(null); // Дата виконання завдання
  const [dueTime, setDueTime] = useState(null); // Час виконання завдання
  const [showDatePicker, setShowDatePicker] = useState(false); // Видимість компонента вибору дати
  const [showTimePicker, setShowTimePicker] = useState(false); // Видимість компонента вибору часу
  const [error, setError] = useState(''); // Повідомлення про помилку
  const [snackbarVisible, setSnackbarVisible] = useState(false); // Видимість snackbar повідомлення
  const [enableReminder, setEnableReminder] = useState(false); // Включення нагадування

  // Заповнюємо форму даними при редагуванні існуючого завдання
  // Виконується при першому відкритті модального вікна або при зміні initialTask
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority || 'medium');
      
      if (initialTask.dueDate) {
        const dateObj = new Date(initialTask.dueDate);
        setDueDate(dateObj);
        
        // Перевіряємо, чи завдання має встановлений час
        if (dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0) {
          setDueTime(dateObj);
          setEnableReminder(initialTask.reminder || false);
        }
      } else {
        setDueDate(null);
        setDueTime(null);
        setEnableReminder(false);
      }
    } else {
      resetForm();
    }
  }, [initialTask, visible]);

  // Функція скидання форми до початкових значень
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(null);
    setDueTime(null);
    setError('');
    setEnableReminder(false);
  };

  // Функція обробки збереження завдання
  // Виконує валідацію та форматування даних перед збереженням
  const handleSave = () => {
    // Перевіряємо, чи заголовок не порожній
    if (!title.trim()) {
      setError('Tytuł zadania jest wymagany');
      setSnackbarVisible(true);
      return;
    }

    let finalDueDate = null;
    
    if (dueDate) {
      // Створюємо нову дату, щоб не модифікувати оригінальну
      finalDueDate = new Date(dueDate);
      
      // Якщо вибрано час, встановлюємо його
      if (dueTime) {
        finalDueDate.setHours(dueTime.getHours());
        finalDueDate.setMinutes(dueTime.getMinutes());
        finalDueDate.setSeconds(0);
      } else {
        // Якщо не вибрано час, встановлюємо 00:00
        finalDueDate.setHours(0);
        finalDueDate.setMinutes(0);
        finalDueDate.setSeconds(0);
      }
    }

    // Формуємо об'єкт даних завдання для збереження
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: finalDueDate ? finalDueDate.toISOString() : null,
      reminder: dueTime ? enableReminder : false,
    };

    // Якщо редагуємо існуюче завдання, зберігаємо його ID
    if (initialTask) {
      taskData.id = initialTask.id;
    }

    // Викликаємо функцію збереження і закриваємо форму
    onSave(taskData);
    resetForm();
    onClose();
  };

  // Функція для показу компонента вибору дати
  const showDatepicker = () => {
    Keyboard.dismiss(); // Ховаємо клавіатуру
    setShowDatePicker(true);
  };

  // Функція для показу компонента вибору часу
  // Спочатку перевіряє, чи вибрана дата
  const showTimepicker = () => {
    if (!dueDate) {
      Alert.alert("Uwaga", "Najpierw wybierz datę zadania");
      return;
    }
    
    Keyboard.dismiss(); // Ховаємо клавіатуру
    setShowTimePicker(true);
  };

  // Обробка зміни дати через DateTimePicker
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  // Обробка зміни часу через DateTimePicker
  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    
    if (selectedTime) {
      const newTime = new Date(selectedTime);
      // Зберігаємо тільки час з вибраного значення
      if (dueDate) {
        const updatedTime = new Date(dueDate);
        updatedTime.setHours(newTime.getHours());
        updatedTime.setMinutes(newTime.getMinutes());
        setDueTime(updatedTime);
      } else {
        setDueTime(newTime);
      }
      setEnableReminder(true); // Автоматично вмикаємо нагадування при виборі часу
    }
  };

  // Функція очищення вибраної дати та часу
  const clearDate = () => {
    setDueDate(null);
    setDueTime(null);
    setEnableReminder(false);
  };

  // Функція очищення вибраного часу
  const clearTime = () => {
    setDueTime(null);
    setEnableReminder(false);
  };

  // Форматування дати для відображення у вигляді рядка
  const formatDate = (date) => {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  };

  // Форматування часу для відображення у вигляді рядка
  const formatTime = (date) => {
    if (!date) return '';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };

  // Рендерим інтерфейс модального вікна
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Компонент для закриття клавіатури при натисканні за межами форми */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContainer}>
            {/* Заголовок і кнопка закриття */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {initialTask ? 'Edytuj zadanie' : 'Dodaj nowe zadanie'}
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={onClose}
                style={styles.closeButton}
              />
            </View>

            {/* Основна форма з прокруткою */}
            <ScrollView style={styles.formContainer}>
              {/* Поле для введення заголовку завдання */}
              <TextInput
                label="Tytuł zadania"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                autoCapitalize="sentences"
                error={!!error}
                mode="outlined"
              />

              {/* Поле для введення опису завдання */}
              <TextInput
                label="Opis (opcjonalnie)"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                multiline
                numberOfLines={3}
                mode="outlined"
              />

              {/* Секція вибору пріоритету завдання */}
              <Text style={styles.labelText}>Priorytet</Text>
              <View style={styles.priorityContainer}>
                {/* Кнопка високого пріоритету */}
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'high' && styles.priorityButtonActive,
                    priority === 'high' && { backgroundColor: '#FF486A', borderColor: '#FF486A' },
                    priority !== 'high' && { borderColor: '#FF486A' }
                  ]}
                  onPress={() => setPriority('high')}
                >
                  <Text style={[
                    styles.priorityText,
                    priority === 'high' && { color: 'white' },
                    priority !== 'high' && { color: '#FF486A' }
                  ]}>Wysoki</Text>
                </TouchableOpacity>
                
                {/* Кнопка середнього пріоритету */}
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'medium' && styles.priorityButtonActive,
                    priority === 'medium' && { backgroundColor: '#FBA518', borderColor: '#FBA518' },
                    priority !== 'medium' && { borderColor: '#FBA518' }
                  ]}
                  onPress={() => setPriority('medium')}
                >
                  <Text style={[
                    styles.priorityText,
                    priority === 'medium' && { color: 'white' },
                    priority !== 'medium' && { color: '#FBA518' }
                  ]}>Średni</Text>
                </TouchableOpacity>
                
                {/* Кнопка низького пріоритету */}
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'low' && styles.priorityButtonActive,
                    priority === 'low' && { backgroundColor: '#72BF78', borderColor: '#72BF78' },
                    priority !== 'low' && { borderColor: '#72BF78' }
                  ]}
                  onPress={() => setPriority('low')}
                >
                  <Text style={[
                    styles.priorityText,
                    priority === 'low' && { color: 'white' },
                    priority !== 'low' && { color: '#72BF78' }
                  ]}>Niski</Text>
                </TouchableOpacity>
              </View>

              {/* Секція вибору терміну виконання */}
              <Text style={styles.labelText}>Termin wykonania</Text>
              <View style={styles.dateTimeContainer}>
                {/* Компонент вибору дати */}
                <View style={styles.datePickerButton}>
                  <Button
                    mode="outlined"
                    onPress={showDatepicker}
                    icon="calendar"
                    style={styles.dateButton}
                  >
                    {dueDate ? formatDate(dueDate) : 'Wybierz datę'}
                  </Button>
                  {/* Кнопка очищення дати (умовно видима) */}
                  {dueDate && (
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={clearDate}
                      style={styles.clearButton}
                    />
                  )}
                </View>

                {/* Компонент вибору часу */}
                <View style={styles.timePickerButton}>
                  <Button
                    mode="outlined"
                    onPress={showTimepicker}
                    icon="clock-outline"
                    style={styles.timeButton}
                    disabled={!dueDate} // Вимкнено, якщо дата не вибрана
                  >
                    {dueTime ? formatTime(dueTime) : 'Wybierz czas'}
                  </Button>
                  {/* Кнопка очищення часу (умовно видима) */}
                  {dueTime && (
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={clearTime}
                      style={styles.clearButton}
                    />
                  )}
                </View>
              </View>

              {/* Секція налаштування нагадування (видима, якщо вибрано час) */}
              {dueTime && (
                <View style={styles.reminderContainer}>
                  <Text style={styles.reminderText}>Przypomnienie</Text>
                  <Switch
                    value={enableReminder}
                    onValueChange={setEnableReminder}
                    color={theme.colors.primary}
                  />
                </View>
              )}

              {/* Компонент вибору дати (умовно видимий) */}
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                  minimumDate={new Date()} // Мінімальна дата - сьогодні
                />
              )}

              {/* Компонент вибору часу (умовно видимий) */}
              {showTimePicker && (
                <DateTimePicker
                  value={dueTime || dueDate || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeTime}
                />
              )}
            </ScrollView>

            {/* Футер з кнопками дій */}
            <View style={styles.buttonsContainer}>
              <Button 
                mode="outlined" 
                onPress={onClose}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
                contentStyle={styles.buttonContent}
              >
                Anuluj
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={styles.saveButton}
                labelStyle={styles.saveButtonLabel}
                contentStyle={styles.buttonContent}
              >
                Zapisz
              </Button>
            </View>
          </Surface>
        </View>
      </TouchableWithoutFeedback>

      {/* Snackbar для відображення повідомлень про помилки */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </Modal>
  );
};

// Стилі для компонентів модального вікна
const styles = StyleSheet.create({
  // Оверлей для модального вікна з напівпрозорим фоном
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Контейнер модального вікна
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    width: '100%',
    overflow: 'hidden',
  },
  // Стиль заголовка модального вікна
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    backgroundColor: theme.colors.primary,
  },
  // Стиль тексту заголовка
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  // Стиль кнопки закриття
  closeButton: {
    margin: 0,
    marginRight: -theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Контейнер форми з відступами
  formContainer: {
    padding: theme.spacing.m,
  },
  // Стиль полів введення
  input: {
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  // Стиль заголовків секцій
  labelText: {
    fontSize: 16,
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    fontWeight: '500',
  },
  // Контейнер для кнопок пріоритету
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  // Базовий стиль для кнопок пріоритету
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  // Додатковий стиль для активної кнопки пріоритету
  priorityButtonActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  // Стиль тексту для кнопок пріоритету
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Контейнер для вибору дати та часу
  dateTimeContainer: {
    flexDirection: 'column',
    marginBottom: theme.spacing.m,
  },
  // Контейнер для кнопки вибору дати
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  // Контейнер для кнопки вибору часу
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Стиль для кнопки вибору дати
  dateButton: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  // Стиль для кнопки вибору часу
  timeButton: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  // Стиль для кнопки очищення дати/часу
  clearButton: {
    margin: 0,
  },
  // Контейнер для налаштування нагадування
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  // Стиль тексту нагадування
  reminderText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  // Контейнер для кнопок внизу форми
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.m,
    paddingTop: theme.spacing.s,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  // Загальний стиль для вмісту кнопок
  buttonContent: {
    height: 45,
    minWidth: 150,
  },
  // Стиль для кнопки скасування
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.m,
    borderColor: theme.colors.darkGray,
    borderRadius: 20,
  },
  // Стиль для тексту кнопки скасування
  cancelButtonLabel: {
    color: theme.colors.darkGray,
    fontSize: 16,
    fontWeight: '500',
  },
  // Стиль для кнопки збереження
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  // Стиль для тексту кнопки збереження
  saveButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  // Стиль для snackbar-повідомлення про помилку
  snackbar: {
    backgroundColor: theme.colors.error,
  },
});

export default TaskFormModal;