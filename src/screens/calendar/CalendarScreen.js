import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, FAB, Surface, ActivityIndicator } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTask } from '../../context/TaskContext';
import TaskItem from '../../components/tasks/TaskItem';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import theme from '../../styles/theme';

// Компонент CalendarScreen
// Відображає календар та список завдань на вибрану дату
// Дозволяє користувачу переглядати, додавати, редагувати та видаляти завдання в календарному форматі
const CalendarScreen = () => {
  // Отримуємо функції та дані з контексту завдань
  const { tasks, loading, getTasksByDate, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTask();
  // Стан для збереження вибраної дати в календарі (формат YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  // Стан для збереження позначених дат у календарі (дати з завданнями)
  const [markedDates, setMarkedDates] = useState({});
  // Стан для збереження завдань на вибрану дату
  const [dailyTasks, setDailyTasks] = useState([]);
  // Стан для керування видимістю модального вікна форми завдання
  const [modalVisible, setModalVisible] = useState(false);
  // Стан для збереження поточного завдання (для редагування)
  const [currentTask, setCurrentTask] = useState(null);
  // Стан для примусового оновлення компонента
  const [refreshKey, setRefreshKey] = useState(0);

  // Функція для форматування дати у формат YYYY-MM-DD
  // Використовується для стандартизації формату дат у додатку
  function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    // Додаємо нуль спереду для місяців та днів менше 10
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  // Функція для форматування дати у читабельний формат
  // Перетворює рядок дати у локалізований формат для відображення користувачу
  function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    
    // Форматуємо дату у польській локалізації
    return date.toLocaleDateString('pl-PL', options);
  }

  // Ефект для підготовки даних календаря та списку завдань
  // Виконується при зміні списку завдань, вибраної дати або стану завантаження
  useEffect(() => {
    if (loading) return;

    // Об'єкт для зберігання позначених дат у календарі
    const marks = {};
    
    // Додаємо поточну вибрану дату
    marks[selectedDate] = { selected: true, selectedColor: theme.colors.primary };
    
    // Перебираємо всі завдання та позначаємо їхні дати в календарі
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateStr = task.dueDate.split('T')[0];
        
        if (dateStr === selectedDate) {
          // Якщо це вибрана дата, зберігаємо формат вибраної дати
          marks[dateStr] = {
            ...marks[dateStr],
            selected: true,
            selectedColor: theme.colors.primary,
            marked: true,
            dotColor: 'white'
          };
        } else {
          // Звичайна дата з завданням - вибираємо колір в залежності від пріоритету завдань на цю дату
          const tasksForDate = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === dateStr);
          let dotColor = theme.colors.primary;
          
          // Якщо є невиконане завдання з високим пріоритетом, позначаємо червоним
          const highPriorityTask = tasksForDate.find(t => t.priority === 'high' && !t.completed);
          if (highPriorityTask) {
            dotColor = theme.colors.error;
          }
          
          marks[dateStr] = {
            ...marks[dateStr],
            marked: true,
            dotColor: dotColor
          };
        }
      }
    });
    
    // Оновлюємо стан позначених дат
    setMarkedDates(marks);

    // Оновлюємо список завдань на вибрану дату
    const tasksForSelectedDate = tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === selectedDate;
    });
    
    // Сортуємо завдання: спочатку невиконані, потім за пріоритетом
    tasksForSelectedDate.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Оновлюємо стан завдань на вибрану дату
    setDailyTasks(tasksForSelectedDate);
  }, [tasks, selectedDate, loading, refreshKey]);

  // Функція для обробки збереження завдання
  // Викликається при додаванні нового або оновленні існуючого завдання
  const handleSaveTask = async (taskData) => {
    // Якщо дата не вказана, використовуємо вибрану дату з календаря
    if (!taskData.dueDate) {
      taskData.dueDate = new Date(selectedDate).toISOString();
    }
    
    // Визначаємо, це оновлення чи створення нового завдання
    if (currentTask) {
      await updateTask(currentTask.id, taskData);
    } else {
      await addTask(taskData);
    }
    
    // Закриваємо модальне вікно та оновлюємо дані
    setModalVisible(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Функція для обробки видалення завдання
  // Викликається при свайпі елемента завдання вліво
  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Функція для обробки зміни стану виконання завдання
  // Викликається при натисканні на чекбокс завдання
  const handleToggleCompletion = async (taskId) => {
    await toggleTaskCompletion(taskId);
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Функція для отримання кольору відповідно до пріоритету завдання
  // Використовується для візуального відображення пріоритету
  const getPriorityColor = (priority, completed) => {
    if (completed) return theme.colors.disabled;
    
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.accent;
    }
  };

  // Допоміжна функція для групування завдань за пріоритетом
  // Розділяє завдання на три групи: високого, середнього та низького пріоритету
  const groupTasksByPriority = (tasks) => {
    const groups = {
      high: [],
      medium: [],
      low: [],
    };
    tasks.forEach(task => {
      if (task.priority === 'high') groups.high.push(task);
      else if (task.priority === 'medium') groups.medium.push(task);
      else groups.low.push(task);
    });
    return groups;
  };

  // Підписи та кольори для заголовків груп пріоритетів
  const PRIORITY_LABELS = {
    high: 'Wysoki priorytet',
    medium: 'Średni priorytet',
    low: 'Niski priorytet',
  };
  const PRIORITY_COLORS = {
    high: '#FF486A',
    medium: '#FBA518',
    low: '#72BF78',
  };

  // Функція для рендерингу згрупованих завдань з заголовками секцій
  // Відображає завдання, розділені на групи за пріоритетом
  const renderGroupedTasks = () => {
    const groups = groupTasksByPriority(dailyTasks);
    const sections = [];
    ['high', 'medium', 'low'].forEach(priority => {
      if (groups[priority].length > 0) {
        sections.push(
          <View key={priority} style={{ marginTop: sections.length > 0 ? 24 : 0 }}>
            <Text style={[styles.sectionHeader, { color: PRIORITY_COLORS[priority] }]}>{PRIORITY_LABELS[priority]}</Text>
            {groups[priority].map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleCompletion}
                onEdit={() => {
                  setCurrentTask(task);
                  setModalVisible(true);
                }}
                onDelete={handleDeleteTask}
              />
            ))}
          </View>
        );
      }
    });
    return sections.length > 0 ? sections : renderEmptyList();
  };

  // Функція для рендерингу окремого елемента списку завдань
  // Використовується для відображення одного завдання
  const renderTaskItem = ({ item }) => (
    <TaskItem
      task={item}
      onToggleComplete={handleToggleCompletion}
      onEdit={() => {
        setCurrentTask(item);
        setModalVisible(true);
      }}
      onDelete={handleDeleteTask}
    />
  );

  // Функція для рендерингу порожнього списку
  // Відображає повідомлення, якщо на вибрану дату немає завдань
  const renderEmptyList = () => {
    // Якщо дані завантажуються, показуємо індикатор завантаження
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Ładowanie zadań...</Text>
        </View>
      );
    }
    
    // Форматуємо вибрану дату для відображення
    const formattedDate = formatDisplayDate(selectedDate);
    
    // Відображаємо повідомлення та кнопку для додавання нового завдання
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyDateText}>{formattedDate}</Text>
        <Text style={styles.emptyText}>
          Brak zadań na ten dzień
        </Text>
        <TouchableOpacity 
          style={styles.addTaskButton} 
          onPress={() => {
            setCurrentTask(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.addTaskButtonText}>Dodaj zadanie</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Функція для обробки додавання нового завдання
  // Відкриває модальне вікно форми для нового завдання
  const addNewTask = () => {
    setCurrentTask(null);
    setModalVisible(true);
  };

  // Рендерим інтерфейс екрану календаря
  return (
    <View style={styles.container}>
      {/* Компонент календаря */}
      <Surface style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          hideExtraDays={true}
          firstDay={1}                  // Тиждень починається з понеділка
          enableSwipeMonths={true}      // Дозволяє свайпати для зміни місяця
          theme={{
            calendarBackground: theme.colors.surface,
            textSectionTitleColor: theme.colors.text,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.text,
            textDisabledColor: theme.colors.disabled,
            dotColor: theme.colors.primary,
            monthTextColor: theme.colors.primary,
            indicatorColor: theme.colors.primary,
            arrowColor: theme.colors.primary,
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
        />
      </Surface>
      
      {/* Список завдань на вибрану дату */}
      <ScrollView contentContainerStyle={dailyTasks.length === 0 ? styles.emptyListContainer : styles.listContainer}>
        {renderGroupedTasks()}
      </ScrollView>
      
      {/* Плаваюча кнопка додавання нового завдання */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={addNewTask}
      />
      
      {/* Модальне вікно форми завдання */}
      <TaskFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        initialTask={currentTask}
      />
    </View>
  );
};

// Стилі для компонентів екрану календаря
const styles = StyleSheet.create({
  // Основний контейнер
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  // Контейнер для календаря з тінню
  calendarContainer: {
    elevation: 1,
    borderRadius: 0,
    marginBottom: 1,
  },
  // Контейнер для списку завдань
  listContainer: {
    paddingVertical: theme.spacing.s,
  },
  // Контейнер для порожнього списку
  emptyListContainer: {
    flexGrow: 1,
  },
  // Контейнер для відображення повідомлення про порожній список
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: 'white',
    paddingTop: 0,
    marginTop: -80,
  },
  // Стиль для відображення дати в порожньому списку
  emptyDateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  // Стиль для тексту повідомлення про порожній список
  emptyText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  // Стиль для кнопки додавання завдання
  addTaskButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    borderRadius: 20,
    marginTop: theme.spacing.s,
  },
  // Стиль для тексту кнопки додавання завдання
  addTaskButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Стиль для плаваючої кнопки додавання
  fab: {
    position: 'absolute',
    margin: theme.spacing.m,
    right: 0,
    bottom: 15,
    backgroundColor: theme.colors.primary,
  },
  // Стиль для заголовків секцій пріоритетів
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 16,
    marginBottom: 4,
    marginTop: 8,
  },
});

export default CalendarScreen;