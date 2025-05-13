import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Text, FAB, Chip, Searchbar, Divider, Banner, IconButton } from 'react-native-paper';
import { useTask } from '../../context/TaskContext';
import TaskItem from '../../components/tasks/TaskItem';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import theme from '../../styles/theme';

// Компонент екрану завдань
// Основний екран додатку, що відображає список завдань
// з можливістю фільтрації, пошуку, додавання, редагування та видалення
const TasksScreen = () => {
  // Отримуємо функції та дані з контексту завдань
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTask();
  // Стан для зберігання відфільтрованих завдань
  const [filteredTasks, setFilteredTasks] = useState([]);
  // Стан для зберігання тексту пошуку
  const [searchQuery, setSearchQuery] = useState('');
  // Стан для поточного фільтра ('all', 'active', 'completed', 'today', 'high')
  const [filter, setFilter] = useState('all');
  // Стан для керування видимістю модального вікна форми завдання
  const [modalVisible, setModalVisible] = useState(false);
  // Стан для зберігання поточного завдання при редагуванні
  const [currentTask, setCurrentTask] = useState(null);
  // Стан для видимості банера підтвердження
  const [bannerVisible, setBannerVisible] = useState(false);
  // Стан для зберігання завдання, що потрібно видалити
  const [taskToDelete, setTaskToDelete] = useState(null);
  // Ключ для примусового оновлення компонента
  const [refreshKey, setRefreshKey] = useState(0);

  // Ефект для фільтрації та сортування завдань
  // Виконується при зміні завдань, фільтра, пошукового запиту або ключа оновлення
  useEffect(() => {
    // Починаємо з повного списку завдань
    let result = [...tasks];
    
    // Фільтруємо за обраним фільтром
    if (filter === 'active') {
      // Тільки невиконані завдання
      result = result.filter(task => !task.completed);
    } else if (filter === 'completed') {
      // Тільки виконані завдання
      result = result.filter(task => task.completed);
    } else if (filter === 'today') {
      // Завдання на сьогодні
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(task => {
        if (!task.dueDate) return false;
        return task.dueDate.split('T')[0] === today;
      });
    } else if (filter === 'high') {
      // Завдання з високим пріоритетом
      result = result.filter(task => task.priority === 'high');
    }
    
    // Фільтруємо за пошуковим запитом (якщо є)
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(lowercasedQuery) || 
          (task.description && task.description.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    // Сортуємо завдання: спочатку невиконані, потім за датою, потім за пріоритетом
    result.sort((a, b) => {
      // Спочатку відображаємо невиконані завдання
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Потім сортуємо за датою виконання (якщо вона є)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      
      // Завдання з датою відображаємо вище ніж без дати
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // Нарешті сортуємо за пріоритетом
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Оновлюємо стан відфільтрованих завдань
    setFilteredTasks(result);
  }, [tasks, filter, searchQuery, refreshKey]);

  // Функція обробки збереження завдання
  // Викликається при додаванні нового або редагуванні існуючого завдання
  const handleSaveTask = async (taskData) => {
    if (currentTask) {
      // Якщо є currentTask, оновлюємо існуюче завдання
      await updateTask(currentTask.id, taskData);
    } else {
      // Інакше додаємо нове завдання
      await addTask(taskData);
    }
    // Оновлюємо список для відображення змін
    setRefreshKey(prev => prev + 1);
  };

  // Функція обробки видалення завдання
  // Викликається при свайпі елемента завдання вліво або через меню
  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    // Оновлюємо список для відображення змін
    setRefreshKey(prev => prev + 1);
  };

  // Функція обробки зміни статусу виконання завдання
  // Викликається при натисканні на чекбокс завдання
  const handleToggleCompletion = async (taskId) => {
    await toggleTaskCompletion(taskId);
    // Оновлюємо список для відображення змін
    setRefreshKey(prev => prev + 1);
  };

  // Функція для відкриття модального вікна редагування завдання
  // Передає дані існуючого завдання у форму
  const handleEdit = (task) => {
    setCurrentTask(task);
    setModalVisible(true);
  };

  // Функція для відкриття модального вікна додавання нового завдання
  // Скидає currentTask для створення нового завдання
  const openAddTaskModal = () => {
    setCurrentTask(null);
    setModalVisible(true);
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
  // Використовуються для візуального відображення різних рівнів пріоритету
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

  // Функція для рендерингу згрупованих завдань з заголовками
  // Відображає завдання, розділені на групи за пріоритетом
  const renderGroupedTasks = () => {
    // Групуємо завдання за пріоритетом
    const groups = groupTasksByPriority(filteredTasks);
    const sections = [];
    
    // Створюємо секції для кожного пріоритету, якщо є завдання
    ['high', 'medium', 'low'].forEach(priority => {
      if (groups[priority].length > 0) {
        sections.push(
          <View key={priority} style={{ marginTop: sections.length > 0 ? 24 : 0 }}>
            {/* Заголовок секції з кольором відповідного пріоритету */}
            <Text style={[styles.sectionHeader, { color: PRIORITY_COLORS[priority] }]}>{PRIORITY_LABELS[priority]}</Text>
            {/* Відображаємо завдання у цій групі пріоритету */}
            {groups[priority].map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleCompletion}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </View>
        );
      }
    });
    
    // Якщо немає завдань у жодній групі, показуємо порожній список
    return sections.length > 0 ? sections : renderEmptyList();
  };

  // Функція для рендерингу вмісту при відсутності завдань
  // Відображає індикатор завантаження або повідомлення про відсутність завдань
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
    
    // Інакше показуємо повідомлення про відсутність завдань
    return (
      <View style={styles.emptyContainer}>
        {/* Зображення для порожнього списку */}
        <Image 
          source={require('../../../assets/images/empty-tasks.png')} 
          style={styles.emptyImage}
          resizeMode="contain"
        />
        
        {/* Текст повідомлення залежно від фільтра та пошуку */}
        <Text style={styles.emptyText}>
          {searchQuery 
            ? 'Nie znaleziono zadań spełniających kryteria wyszukiwania' 
            : filter === 'all' 
              ? 'Brak zadań. Dotknij "+" aby dodać nowe zadanie.' 
              : 'Brak zadań w wybranej kategorii.'}
        </Text>
        
        {/* Якщо використовується фільтр, показуємо кнопку для скидання фільтра */}
        {filter !== 'all' && (
          <Chip 
            mode="flat"
            style={styles.coloredChip}
            onPress={() => setFilter('all')}
            textStyle={styles.coloredChipText}
            showSelectedCheck={false}
          >
            Pokaż wszystkie zadania
          </Chip>
        )}
      </View>
    );
  };

  // Рендеримо основний інтерфейс екрану завдань
  return (
    <View style={styles.container}>
      {/* Поле пошуку */}
      <Searchbar
        placeholder="Szukaj zadań..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={theme.colors.primary}
      />

      {/* Панель фільтрів */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Чіп для відображення всіх завдань */}
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={[
              styles.filterChip,
              filter === 'all' ? styles.coloredChip : {}
            ]}
            textStyle={filter === 'all' ? styles.coloredChipText : {}}
            showSelectedCheck={false}
          >
            Wszystkie
          </Chip>
          {/* Чіп для відображення активних (невиконаних) завдань */}
          <Chip
            selected={filter === 'active'}
            onPress={() => setFilter('active')}
            style={[
              styles.filterChip,
              filter === 'active' ? styles.coloredChip : {}
            ]}
            textStyle={filter === 'active' ? styles.coloredChipText : {}}
            showSelectedCheck={false}
          >
            Aktywne
          </Chip>
          {/* Чіп для відображення виконаних завдань */}
          <Chip
            selected={filter === 'completed'}
            onPress={() => setFilter('completed')}
            style={[
              styles.filterChip,
              filter === 'completed' ? styles.coloredChip : {}
            ]}
            textStyle={filter === 'completed' ? styles.coloredChipText : {}}
            showSelectedCheck={false}
          >
            Ukończone
          </Chip>
          {/* Чіп для відображення завдань на сьогодні */}
          <Chip
            selected={filter === 'today'}
            onPress={() => setFilter('today')}
            style={[
              styles.filterChip,
              filter === 'today' ? styles.coloredChip : {}
            ]}
            textStyle={filter === 'today' ? styles.coloredChipText : {}}
            showSelectedCheck={false}
          >
            Na dziś
          </Chip>
          {/* Чіп для відображення пріоритетних завдань */}
          <Chip
            selected={filter === 'high'}
            onPress={() => setFilter('high')}
            style={[
              styles.filterChip,
              filter === 'high' ? styles.coloredChip : {}
            ]}
            textStyle={filter === 'high' ? styles.coloredChipText : {}}
            showSelectedCheck={false}
          >
            Priorytetowe
          </Chip>
        </ScrollView>
      </View>

      {/* Розділювач (відображається, якщо є завдання) */}
      {filteredTasks.length > 0 && <Divider />}

      {/* Прокручуваний список завдань */}
      <ScrollView contentContainerStyle={filteredTasks.length === 0 ? { flex: 1 } : { paddingBottom: theme.spacing.s }}>
        {renderGroupedTasks()}
      </ScrollView>
      
      {/* Плаваюча кнопка для додавання нового завдання */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openAddTaskModal}
        color="white"
      />

      {/* Модальне вікно форми для додавання/редагування завдання */}
      <TaskFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        initialTask={currentTask}
      />
    </View>
  );
};

// Стилі для компонентів екрану завдань
const styles = StyleSheet.create({
  // Основний контейнер
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  // Стиль для поля пошуку
  searchBar: {
    margin: theme.spacing.m,
    borderRadius: theme.roundness,
    backgroundColor: 'white',
    elevation: 0,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  // Контейнер для фільтрів
  filtersContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  // Стиль для чіпа фільтра
  filterChip: {
    marginRight: theme.spacing.s,
    backgroundColor: 'white',
  },
  // Стиль для активного чіпа фільтра
  coloredChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  // Стиль тексту для активного чіпа фільтра
  coloredChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Контейнер для відображення порожнього списку
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: 'white',
    marginBottom: 100,
  },
  // Стиль для зображення порожнього списку
  emptyImage: {
    width: 300,  // Ширина зображення
    height: 300, // Висота зображення
    marginBottom: theme.spacing.m,
  },
  // Стиль для тексту порожнього списку
  emptyText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  // Стиль для плаваючої кнопки
  fab: {
    position: 'absolute',
    margin: theme.spacing.m,
    right: 0,
    bottom: 15,
    backgroundColor: theme.colors.primary,
  },
  // Стиль для заголовка секції
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 16,
    marginBottom: 4,
    marginTop: 8,
  },
});

export default TasksScreen;