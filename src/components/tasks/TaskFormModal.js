import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, IconButton, Snackbar, Surface, Switch } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../../styles/theme'; // Імпорт теми для стилізації

// Компонент модальної форми для додавання/редагування завдань
const TaskFormModal = ({ visible, onClose, onSave, initialTask = null }) => {
// Стан для полів форми
const [title, setTitle] = useState(''); // Стан для заголовка завдання
const [description, setDescription] = useState(''); // Стан для опису завдання
const [priority, setPriority] = useState('medium'); // Стан для пріоритету завдання (за замовчуванням "середній")
const [dueDate, setDueDate] = useState(null); // Стан для дати виконання
const [dueTime, setDueTime] = useState(null); // Стан для часу виконання
const [showDatePicker, setShowDatePicker] = useState(false); // Стан для видимості вибору дати
const [showTimePicker, setShowTimePicker] = useState(false); // Стан для видимості вибору часу
const [error, setError] = useState(''); // Стан для повідомлення про помилку
const [snackbarVisible, setSnackbarVisible] = useState(false); // Стан для видимості Snackbar
const [enableReminder, setEnableReminder] = useState(false); // Стан для ввімкнення нагадування

// Ефект, який спрацьовує при зміні initialTask або visible
useEffect(() => {
if (initialTask) {
// Якщо передано initialTask (режим редагування), заповнюємо форму даними завдання
setTitle(initialTask.title || '');
setDescription(initialTask.description || '');
setPriority(initialTask.priority || 'medium');

if (initialTask.dueDate) {
const dateObj = new Date(initialTask.dueDate);
setDueDate(dateObj);

// Якщо є час у даті, встановлюємо його та вмикаємо нагадування
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
// Якщо initialTask відсутній (режим додавання нового завдання), скидаємо форму
resetForm();
}
}, [initialTask, visible]);

// Функція для скидання форми до початкового стану
const resetForm = () => {
setTitle('');
setDescription('');
setPriority('medium');
setDueDate(null);
setDueTime(null);
setError('');
setEnableReminder(false);
};

// Обробник збереження завдання
const handleSave = () => {
if (!title.trim()) {
// Перевірка на наявність заголовка
setError('Tytuł zadania jest wymagany'); // Встановлення повідомлення про помилку
setSnackbarVisible(true); // Показуємо Snackbar
return;
}

let finalDueDate = null;

if (dueDate) {
// Створення остаточної дати виконання
finalDueDate = new Date(dueDate);

if (dueTime) {
// Якщо є час, встановлюємо його
finalDueDate.setHours(dueTime.getHours());
finalDueDate.setMinutes(dueTime.getMinutes());
finalDueDate.setSeconds(0);
} else {
// Якщо часу немає, встановлюємо на початок дня
finalDueDate.setHours(0);
finalDueDate.setMinutes(0);
finalDueDate.setSeconds(0);
}
}

// Формування об'єкта даних завдання
const taskData = {
title: title.trim(),
description: description.trim(),
priority,
dueDate: finalDueDate ? finalDueDate.toISOString() : null, // Конвертація дати в ISO рядок
reminder: dueTime ? enableReminder : false, // Ввімкнення нагадування лише якщо є час
};

if (initialTask) {
// Якщо це редагування, додаємо ID завдання
taskData.id = initialTask.id;
}

onSave(taskData); // Виклик функції збереження, переданої через пропси
resetForm(); // Скидання форми
onClose(); // Закриття модального вікна
};

// Функція для показу вікна вибору дати
const showDatepicker = () => {
Keyboard.dismiss(); // Приховуємо клавіатуру
setShowDatePicker(true);
};

// Функція для показу вікна вибору часу
const showTimepicker = () => {
if (!dueDate) {
Alert.alert("Uwaga", "Najpierw wybierz datę zadania"); // Попередження, якщо дата не вибрана
return;
}

Keyboard.dismiss(); // Приховуємо клавіатуру
setShowTimePicker(true);
};

// Обробник зміни дати
const onChangeDate = (event, selectedDate) => {
setShowDatePicker(false); // Приховуємо вибір дати

if (selectedDate) {
setDueDate(selectedDate); // Встановлюємо вибрану дату
}
};

// Обробник зміни часу
const onChangeTime = (event, selectedTime) => {
setShowTimePicker(false); // Приховуємо вибір часу

if (selectedTime) {
const newTime = new Date(selectedTime);
if (dueDate) {
// Оновлюємо час, зберігаючи дату
const updatedTime = new Date(dueDate);
updatedTime.setHours(newTime.getHours());
updatedTime.setMinutes(newTime.getMinutes());
setDueTime(updatedTime);
} else {
setDueTime(newTime);
}
setEnableReminder(true); // Вмикаємо нагадування при виборі часу
}
};

// Функція для очищення дати
const clearDate = () => {
setDueDate(null);
setDueTime(null);
setEnableReminder(false);
};

// Функція для очищення часу
const clearTime = () => {
setDueTime(null);
setEnableReminder(false);
};

// Функція форматування дати для відображення
const formatDate = (date) => {
if (!date) return '';

const day = date.getDate().toString().padStart(2, '0');
const month = (date.getMonth() + 1).toString().padStart(2, '0');
const year = date.getFullYear();

return `${day}.${month}.${year}`;
};

// Функція форматування часу для відображення
const formatTime = (date) => {
if (!date) return '';

const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');

return `${hours}:${minutes}`;
};

return (
<Modal
visible={visible} // Видимість модального вікна
animationType="slide" // Тип анімації
transparent={true} // Прозорий фон
onRequestClose={onClose} // Обробник закриття модального вікна
>
<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
{/* Область, яка приховує клавіатуру при торканні */}
<View style={styles.modalOverlay}>
{/* Затемнення фону */}
<Surface style={styles.modalContainer}>
{/* Контейнер модального вікна */}
<View style={styles.header}>
{/* Заголовок модального вікна */}
<Text style={styles.title}>
{initialTask ? 'Edytuj zadanie' : 'Dodaj nowe zadanie'} {/* Зміна заголовка залежно від режиму */}
</Text>
</View>

<View style={{ flex: 1 }}>
<ScrollView
style={styles.formContainer}
contentContainerStyle={{ paddingBottom: 16 }}
keyboardShouldPersistTaps="handled"
showsVerticalScrollIndicator={false}
>
{/* Поле для введення заголовка завдання */}
<TextInput
label="Tytuł zadania"
value={title}
onChangeText={setTitle}
style={styles.input}
autoCapitalize="sentences"
error={!!error} // Показ помилки, якщо є
mode="outlined"
activeOutlineColor={theme.colors.primary}
outlineColor="#E0E0E0"
theme={{ roundness: 12 }}
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
activeOutlineColor={theme.colors.primary}
outlineColor="#E0E0E0"
theme={{ roundness: 12 }}
/>

<Text style={styles.labelText}>Priorytet</Text>
<View style={styles.priorityContainer}>
{/* Кнопки вибору пріоритету */}
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

<Text style={styles.labelText}>Termin wykonania</Text>
<View style={styles.dateTimeContainer}>
{/* Кнопка вибору дати */}
<View style={styles.datePickerButton}>
<Button
mode="outlined"
onPress={showDatepicker}
icon="calendar"
style={styles.dateButton}
>
{dueDate ? formatDate(dueDate) : 'Wybierz datę'}
</Button>
{dueDate && (
<IconButton
icon="close"
size={20}
onPress={clearDate}
style={styles.clearButton}
/>
)}
</View>
{/* Кнопка вибору часу */}
<View style={styles.timePickerButton}>
<Button
mode="outlined"
onPress={showTimepicker}
icon="clock-outline"
style={styles.timeButton}
disabled={!dueDate} // Деактивація, якщо дата не вибрана
>
{dueTime ? formatTime(dueTime) : 'Wybierz czas'}
</Button>
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

{dueTime && (
<View style={styles.reminderContainer}>
{/* Перемикач для нагадування (видимий лише якщо вибрано час) */}
<Text style={styles.reminderText}>Przypomnienie</Text>
<Switch
value={enableReminder}
onValueChange={setEnableReminder}
color={theme.colors.primary}
/>
</View>
)}

{showDatePicker && (
// Компонент для вибору дати
<DateTimePicker
value={dueDate || new Date()}
mode="date"
display={Platform.OS === 'ios' ? 'spinner' : 'default'}
onChange={onChangeDate}
minimumDate={new Date()} // Мінімальна дата - сьогодні
/>
)}

{showTimePicker && (
// Компонент для вибору часу
<DateTimePicker
value={dueTime || dueDate || new Date()}
mode="time"
display={Platform.OS === 'ios' ? 'spinner' : 'default'}
onChange={onChangeTime}
/>
)}
</ScrollView>
</View>

<View style={styles.buttonsContainer}>
{/* Кнопка "Скасувати" */}
<Button
mode="outlined"
onPress={onClose}
style={styles.cancelButton}
labelStyle={styles.cancelButtonLabel}
>
Anuluj
</Button>
{/* Кнопка "Зберегти" */}
<Button
mode="contained"
onPress={handleSave}
style={styles.saveButton}
labelStyle={styles.saveButtonLabel}
>
Zapisz
</Button>
</View>
</Surface>
</View>
</TouchableWithoutFeedback>

{/* Компонент Snackbar для відображення повідомлень про помилки */}
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

// Стилі компонента
const styles = StyleSheet.create({
modalOverlay: {
flex: 1,
justifyContent: 'flex-end',
backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContainer: {
backgroundColor: theme.colors.background,
borderTopLeftRadius: 20,
borderTopRightRadius: 20,
maxHeight: '90%',
width: '100%',
overflow: 'hidden',
flex: 1,
flexDirection: 'column',
},
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingHorizontal: theme.spacing.l,
paddingVertical: theme.spacing.m,
paddingTop: 60,
borderBottomWidth: 1,
borderBottomColor: theme.colors.lightGray,
backgroundColor: theme.colors.primary,
},
title: {
fontSize: 20,
fontWeight: 'bold',
color: 'white',
},
formContainer: {
padding: theme.spacing.m,
},
input: {
marginBottom: theme.spacing.l,
backgroundColor: 'white',
},
labelText: {
fontSize: 16,
marginBottom: theme.spacing.m,
color: theme.colors.text,
fontWeight: '500',
},
priorityContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: theme.spacing.l,
marginHorizontal: -4,
},
priorityButton: {
alignItems: 'center',
paddingVertical: 12,
paddingHorizontal: 20,
borderRadius: 25,
borderWidth: 2,
flex: 1,
marginHorizontal: 4,
justifyContent: 'center',
},
priorityButtonActive: {
elevation: 2,
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 2,
},
priorityText: {
fontSize: 16,
fontWeight: '500',
},
dateTimeContainer: {
flexDirection: 'row',
marginBottom: theme.spacing.l,
},
datePickerButton: {
flex: 1,
flexDirection: 'row',
alignItems: 'center',
},
timePickerButton: {
flex: 1,
flexDirection: 'row',
alignItems: 'center',
},
dateButton: {
flex: 1,
borderRadius: 25,
marginRight: theme.spacing.s,
},
timeButton: {
flex: 1,
borderRadius: 25,
marginLeft: theme.spacing.s,
},
clearButton: {
marginLeft: theme.spacing.s,
},
reminderContainer: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
marginBottom: theme.spacing.l,
paddingVertical: theme.spacing.s,
},
reminderText: {
fontSize: 16,
color: theme.colors.text,
},
buttonsContainer: {
flexDirection: 'row',
justifyContent: 'space-around',
paddingHorizontal: 24,
paddingVertical: 24,
marginTop: 50,
backgroundColor: theme.colors.background,
borderTopWidth: 1,
borderTopColor: theme.colors.lightGray,
},
cancelButton: {
marginRight: 16,
borderColor: theme.colors.darkGray,
borderRadius: 25,
minWidth: 140,
paddingVertical: 6,
},
cancelButtonLabel: {
color: theme.colors.darkGray,
fontSize: 16,
},
saveButton: {
backgroundColor: theme.colors.primary,
borderRadius: 25,
minWidth: 140,
paddingVertical: 6,
},
saveButtonLabel: {
color: 'white',
fontWeight: 'bold',
fontSize: 16,
},
snackbar: {
backgroundColor: theme.colors.error,
},
});

export default TaskFormModal;
