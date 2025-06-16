import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, FAB, Surface, ActivityIndicator } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTask } from '../../context/TaskContext';
import TaskItem from '../../components/tasks/TaskItem';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import theme from '../../styles/theme';

const CalendarScreen = () => {
  const { tasks, loading, getTasksByDate, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTask();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [markedDates, setMarkedDates] = useState({});
  const [dailyTasks, setDailyTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Функція для форматування дати у формат YYYY-MM-DD
  function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  // Функція для форматування дати у читабельний формат
  function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    
    // Форматуємо дату у польській локалізації
    return date.toLocaleDateString('pl-PL', options);
  }

  // Підготовка даних для календаря
  useEffect(() => {
    if (loading) return;

    const marks = {};
    
    // Додаємо поточну дату
    marks[selectedDate] = { selected: true, selectedColor: theme.colors.primary };
    
    // Додаємо дати з завданнями
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
          // Звичайна дата з завданням - вибираємо колір в залежності від пріоритету першого завдання на цю дату
          const tasksForDate = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === dateStr);
          let dotColor = theme.colors.primary;
          
          // Якщо є невиконане завдання з високим пріоритетом
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
    
    setMarkedDates(marks);

    // Оновлюємо список завдань на вибрану дату
    const tasksForSelectedDate = tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === selectedDate;
    });
    
    // Сортуємо: спочатку невиконані, потім за пріоритетом
    tasksForSelectedDate.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    setDailyTasks(tasksForSelectedDate);
  }, [tasks, selectedDate, loading, refreshKey]);

  // Обробка збереження завдання
  const handleSaveTask = async (taskData) => {
    // Додаємо дату, якщо не вказана
    if (!taskData.dueDate) {
      taskData.dueDate = new Date(selectedDate).toISOString();
    }
    
    if (currentTask) {
      await updateTask(currentTask.id, taskData);
    } else {
      await addTask(taskData);
    }
    
    setModalVisible(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Обробка видалення завдання
  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Обробка позначення завдання як виконане/невиконане
  const handleToggleCompletion = async (taskId) => {
    await toggleTaskCompletion(taskId);
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Відображення кольору пріоритету
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

  // Helper to group tasks by priority
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

  // Section header labels and colors
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

  // Render grouped tasks with section headers
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

  // Рендеринг елемента списку завдань
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

  // Відображення пустого списку
  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Ładowanie zadań...</Text>
        </View>
      );
    }
    
    const formattedDate = formatDisplayDate(selectedDate);
    
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

  // Обробка додавання нового завдання
  const addNewTask = () => {
    setCurrentTask(null);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          hideExtraDays={true}
          firstDay={1}
          enableSwipeMonths={true}
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
      
      <ScrollView contentContainerStyle={dailyTasks.length === 0 ? styles.emptyListContainer : styles.listContainer}>
        {renderGroupedTasks()}
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={addNewTask}
      />
      
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
