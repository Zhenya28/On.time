import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, ScrollView, Image, useWindowDimensions } from 'react-native';
import { Text, FAB, Chip, Searchbar, Divider, Banner, IconButton } from 'react-native-paper';
import { useTask } from '../../context/TaskContext';
import TaskItem from '../../components/tasks/TaskItem';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import theme from '../../styles/theme';

// Ekran zadań
const TasksScreen = () => {
  // Хуки та стани
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTask();
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Ключ для примусового оновлення
  const { width } = useWindowDimensions();
  const isWide = width >= 700; // np. iPad landscape

  // Фільтрація та пошук завдань
  useEffect(() => {
    let result = [...tasks];
    
    // Фільтр за статусом
    if (filter === 'active') {
      result = result.filter(task => !task.completed);
    } else if (filter === 'completed') {
      result = result.filter(task => task.completed);
    } else if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(task => {
        if (!task.dueDate) return false;
        return task.dueDate.split('T')[0] === today;
      });
    } else if (filter === 'high') {
      result = result.filter(task => task.priority === 'high');
    }
    
    // Пошук
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(lowercasedQuery) || 
          (task.description && task.description.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    // Сортування: спочатку невиконані, потім за датою, потім за пріоритетом
    result.sort((a, b) => {
      // Спочатку невиконані
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Потім за датою (якщо є)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      
      // Завдання з датою показуємо вище ніж без дати
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // За пріоритетом
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    setFilteredTasks(result);
  }, [tasks, filter, searchQuery, refreshKey]);

  // Обробка додавання/редагування завдання
  const handleSaveTask = async (taskData) => {
    if (currentTask) {
      await updateTask(currentTask.id, taskData);
    } else {
      await addTask(taskData);
    }
    setRefreshKey(prev => prev + 1); // Примусове оновлення списку
  };

  // Обробка видалення завдання
  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    setRefreshKey(prev => prev + 1); // Примусове оновлення списку
  };

  // Обробка зміни статусу виконання
  const handleToggleCompletion = async (taskId) => {
    await toggleTaskCompletion(taskId);
    setRefreshKey(prev => prev + 1); // Примусове оновлення списку
  };

  // Відкриття модального вікна для редагування
  const handleEdit = (task) => {
    setCurrentTask(task);
    setModalVisible(true);
  };

  // Відкриття модального вікна для додавання
  const openAddTaskModal = () => {
    setCurrentTask(null);
    setModalVisible(true);
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
    const groups = groupTasksByPriority(filteredTasks);
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
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </View>
        );
      }
    });
    return sections.length > 0 ? sections : renderEmptyList();
  };

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
    
    return (
      <View style={styles.emptyContainer}>
        {/* Obrazek w formacie JPG */}
        <Image 
  source={require('../../../assets/images/empty-tasks.png')} 
  style={styles.emptyImage}
  resizeMode="contain"
/>
        
        <Text style={styles.emptyText}>
          {searchQuery 
            ? 'Nie znaleziono zadań spełniających kryteria wyszukiwania' 
            : filter === 'all' 
              ? 'Brak zadań. Dotknij "+" aby dodać nowe zadanie.' 
              : 'Brak zadań w wybranej kategorii.'}
        </Text>
        
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

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Szukaj zadań..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={theme.colors.primary}
      />

      <View style={styles.filtersContainer}>
        {isWide ? (
          <View style={styles.filtersRow}>
            <Chip
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
              style={[styles.flexChip, filter === 'all' && styles.coloredChip]}
              textStyle={filter === 'all' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Wszystkie
            </Chip>
            <Chip
              selected={filter === 'active'}
              onPress={() => setFilter('active')}
              style={[styles.flexChip, filter === 'active' && styles.coloredChip]}
              textStyle={filter === 'active' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Aktywne
            </Chip>
            <Chip
              selected={filter === 'completed'}
              onPress={() => setFilter('completed')}
              style={[styles.flexChip, filter === 'completed' && styles.coloredChip]}
              textStyle={filter === 'completed' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Ukończone
            </Chip>
            <Chip
              selected={filter === 'today'}
              onPress={() => setFilter('today')}
              style={[styles.flexChip, filter === 'today' && styles.coloredChip]}
              textStyle={filter === 'today' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Na dziś
            </Chip>
            <Chip
              selected={filter === 'high'}
              onPress={() => setFilter('high')}
              style={[styles.flexChip, filter === 'high' && styles.coloredChip]}
              textStyle={filter === 'high' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Priorytetowe
            </Chip>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chip
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
              style={[styles.filterChip, filter === 'all' && styles.coloredChip]}
              textStyle={filter === 'all' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Wszystkie
            </Chip>
            <Chip
              selected={filter === 'active'}
              onPress={() => setFilter('active')}
              style={[styles.filterChip, filter === 'active' && styles.coloredChip]}
              textStyle={filter === 'active' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Aktywne
            </Chip>
            <Chip
              selected={filter === 'completed'}
              onPress={() => setFilter('completed')}
              style={[styles.filterChip, filter === 'completed' && styles.coloredChip]}
              textStyle={filter === 'completed' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Ukończone
            </Chip>
            <Chip
              selected={filter === 'today'}
              onPress={() => setFilter('today')}
              style={[styles.filterChip, filter === 'today' && styles.coloredChip]}
              textStyle={filter === 'today' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Na dziś
            </Chip>
            <Chip
              selected={filter === 'high'}
              onPress={() => setFilter('high')}
              style={[styles.filterChip, filter === 'high' && styles.coloredChip]}
              textStyle={filter === 'high' ? styles.coloredChipText : {textAlign: 'center'}}
              showSelectedCheck={false}
            >
              Priorytetowe
            </Chip>
          </ScrollView>
        )}
      </View>

      {filteredTasks.length > 0 && <Divider />}

      <ScrollView contentContainerStyle={filteredTasks.length === 0 ? { flex: 1 } : { paddingBottom: theme.spacing.s }}>
        {renderGroupedTasks()}
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openAddTaskModal}
        color="white"
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
  searchBar: {
    margin: theme.spacing.m,
    borderRadius: theme.roundness,
    backgroundColor: 'white',
    elevation: 0,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexChip: {
    marginRight: theme.spacing.s,
    minWidth: 120,
    maxWidth: 180,
    backgroundColor: 'white',
    borderColor: theme.colors.lightGray,
    borderWidth: 1,
  },
  coloredChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  coloredChipText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: 'white',
    marginBottom: 100,
  },
  emptyImage: {
    width: 300,  // Szerokość obrazka
    height: 300, // Wysokość obrazka
    marginBottom: theme.spacing.m,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
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
  filterChip: {
    marginRight: theme.spacing.s,
    backgroundColor: 'white',
    minWidth: 120,
    maxWidth: 180,
    borderColor: theme.colors.lightGray,
    borderWidth: 1,
  },
});

export default TasksScreen;