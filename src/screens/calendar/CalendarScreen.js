import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, FAB, Surface, ActivityIndicator } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTask } from '../../context/TaskContext'; // Імпортуємо хук для роботи з завданнями.
import TaskItem from '../../components/tasks/TaskItem'; // Компонент для відображення одного завдання.
import TaskFormModal from '../../components/tasks/TaskFormModal'; // Модальне вікно для додавання/редагування завдань.
import theme from '../../styles/theme'; // Імпортуємо тему оформлення.

const CalendarScreen = () => {
  const { tasks, loading, getTasksByDate, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTask(); // Отримуємо функції та дані з TaskContext.
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date())); // Стан для обраної дати в календарі.
  const [markedDates, setMarkedDates] = useState({}); // Стан для позначених дат в календарі (з завданнями).
  const [dailyTasks, setDailyTasks] = useState([]); // Стан для завдань на обрану дату.
  const [modalVisible, setModalVisible] = useState(false); // Стан для видимості модального вікна.
  const [currentTask, setCurrentTask] = useState(null); // Стан для поточного завдання, яке редагується.
  const [refreshKey, setRefreshKey] = useState(0); // Ключ для примусового оновлення списку завдань.

  // Форматує об'єкт Date в рядок у форматі РРРР-ММ-ДД.
  function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  // Форматує рядок дати у читабельний формат (наприклад, "понеділок, 1 січня 2024").
  function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pl-PL', options); // Форматуємо дату для польської локалі.
  }

  // Обробляє зміни в стані завдань, обраної дати та завантаження для оновлення UI.
  useEffect(() => {
    if (loading) return; // Якщо дані ще завантажуються, нічого не робимо.

    const marks = {}; // Об'єкт для позначення дат в календарі.
    marks[selectedDate] = { selected: true, selectedColor: theme.colors.primary }; // Позначаємо обрану дату.

    tasks.forEach(task => {
      if (task.dueDate) {
        const dateStr = task.dueDate.split('T')[0]; // Отримуємо дату завдання у форматі РРРР-ММ-ДД.

        if (dateStr === selectedDate) {
          // Якщо дата завдання співпадає з обраною датою.
          marks[dateStr] = {
            ...marks[dateStr],
            selected: true,
            selectedColor: theme.colors.primary,
            marked: true,
            dotColor: 'white' // Колір точки для позначеної дати.
          };
        } else {
          // Якщо дата завдання не співпадає з обраною датою.
          const tasksForDate = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === dateStr);
          let dotColor = theme.colors.primary;

          // Визначаємо колір точки в залежності від пріоритету завдання.
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

    setMarkedDates(marks); // Оновлюємо позначені дати в календарі.

    // Фільтруємо завдання для обраної дати.
    const tasksForSelectedDate = tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === selectedDate;
    });

    // Сортуємо завдання: спочатку невиконані, потім за пріоритетом.
    tasksForSelectedDate.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setDailyTasks(tasksForSelectedDate); // Оновлюємо список завдань для обраної дати.
  }, [tasks, selectedDate, loading, refreshKey]);

  // Обробляє збереження (створення або оновлення) завдання.
  const handleSaveTask = async (taskData) => {
    if (!taskData.dueDate) {
      taskData.dueDate = new Date(selectedDate).toISOString(); // Якщо дата не вказана, використовуємо обрану дату.
    }

    if (currentTask) {
      await updateTask(currentTask.id, taskData); // Оновлюємо існуюче завдання.
    } else {
      await addTask(taskData); // Додаємо нове завдання.
    }

    setModalVisible(false); // Закриваємо модальне вікно.
    setRefreshKey(prevKey => prevKey + 1); // Примусово оновлюємо список завдань.
  };

  // Обробляє видалення завдання.
  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setRefreshKey(prevKey => prevKey + 1); // Примусово оновлюємо список завдань.
  };

  // Обробляє перемикання статусу виконання завдання.
  const handleToggleCompletion = async (taskId) => {
    await toggleTaskCompletion(taskId);
    setRefreshKey(prevKey => prevKey + 1); // Примусово оновлюємо список завдань.
  };

  // Визначає колір для відображення пріоритету завдання.
  const getPriorityColor = (priority, completed) => {
    if (completed) return theme.colors.disabled; // Сірий колір для виконаних завдань.

    switch (priority) {
      case 'high':
        return theme.colors.error;      // Червоний для високого пріоритету.
      case 'medium':
        return theme.colors.warning;    // Жовтий для середнього пріоритету.
      case 'low':
        return theme.colors.success;    // Зелений для низького пріоритету.
      default:
        return theme.colors.accent;     // Акцентний колір для інших випадків.
    }
  };

  // Групує завдання за пріоритетом.
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

  // Мітки та кольори для секцій пріоритетів.
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

  // Відображає згруповані завдання з заголовками секцій.
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
    return sections.length > 0 ? sections : renderEmptyList(); // Якщо немає завдань, відображаємо повідомлення.
  };

  // Відображає один елемент завдання у списку.
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

  // Відображає повідомлення, якщо на обрану дату немає завдань.
  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Ładowanie zadań...</Text>
        </View>
      );
    }

    const formattedDate = formatDisplayDate(selectedDate); // Форматуємо обрану дату.

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

  // Обробляє додавання нового завдання.
  const addNewTask = () => {
    setCurrentTask(null); // Скидаємо поточне завдання.
    setModalVisible(true); // Показуємо модальне вікно.
  };

  return (
    // Головний контейнер екрану.
    <View style={styles.container}>
      {/* Контейнер календаря. */}
      <Surface style={styles.calendarContainer}>
        <Calendar
          current={selectedDate} // Поточна обрана дата.
          onDayPress={(day) => setSelectedDate(day.dateString)} // Обробник натискання на день.
          markedDates={markedDates} // Obiekt z zaznaczonymi datami.
          hideExtraDays={true} // Ukrywa dni z poprzedniego i następnego miesiąca.
          firstDay={1} // Pierwszy dzień tygodnia to poniedziałek.
          enableSwipeMonths={true} // Umożliwia przesuwanie miesięcy.
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

      {/* Контейнер для списку завдань. */}
      <ScrollView contentContainerStyle={dailyTasks.length === 0 ? styles.emptyListContainer : styles.listContainer}>
        {renderGroupedTasks()}
      </ScrollView>

      {/* Кнопка для додавання нового завдання. */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={addNewTask}
      />

      {/* Модальне вікно для додавання/редагування завдання. */}
      <TaskFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        initialTask={currentTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  calendarContainer: {
    elevation: 1,
    borderRadius: 0,
    marginBottom: 1,
  },
  listContainer: {
    paddingVertical: theme.spacing.s,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: 'white',
    paddingTop: 0,
    marginTop: -80,
  },
  emptyDateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  addTaskButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    borderRadius: 20,
    marginTop: theme.spacing.s,
  },
  addTaskButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.m,
    right: 0,
    bottom: 15,
    backgroundColor: theme.colors.primary,
  },
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
