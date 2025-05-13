import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

// Kontekst dla zarządzania zadaniami
const TaskContext = createContext();

export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const notification = useNotification();

  // Ładowanie zadań gdy użytkownik się zmienia
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Używamy e-maila użytkownika jako klucza, ponieważ jest on bardziej stabilny niż uid między sesjami
        const tasksJSON = await AsyncStorage.getItem(`@tasks_${user.email}`);
        if (tasksJSON) {
          const loadedTasks = JSON.parse(tasksJSON);
          setTasks(loadedTasks);
        } else {
          // Start with empty tasks for new users
          setTasks([]);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user?.email]); // Przeładuj tylko, gdy e-mail użytkownika się zmieni

  // Zaplanuj przypomnienia dla wszystkich zadań z przypomnieniami
  useEffect(() => {
    const scheduleAllReminders = async () => {
      if (!user || !notification) return;

      const tasksWithReminders = tasks.filter(task => task.reminder && task.dueDate);
      
      for (const task of tasksWithReminders) {
        await notification.scheduleTaskReminder(task);
      }
    };

    if (tasks.length > 0 && !loading) {
      scheduleAllReminders();
    }
  }, [tasks, loading, user, notification]);

  // Zapisz zadania przy każdej zmianie
  useEffect(() => {
    const persistTasks = async () => {
      if (user && tasks) {
        try {
          await AsyncStorage.setItem(`@tasks_${user.email}`, JSON.stringify(tasks));
        } catch (error) {
          console.error('Error persisting tasks:', error);
        }
      }
    };

    persistTasks();
  }, [tasks, user?.email]);

  // Zapisywanie zadań
  const saveTasks = async (updatedTasks) => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem(`@tasks_${user.email}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  };

  // Dodawanie nowego zadania
  const addTask = async (newTask) => {
    try {
      const taskWithId = {
        ...newTask,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completed: false,
      };

      const updatedTasks = [...tasks, taskWithId];
      setTasks(updatedTasks);

      // Jeśli zadanie ma przypomnienie, zaplanuj je
      if (taskWithId.reminder && taskWithId.dueDate && notification) {
        await notification.scheduleTaskReminder(taskWithId);
      }

      return { success: true, task: taskWithId };
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, error: error.message };
    }
  };

  // Aktualizacja zadania
  const updateTask = async (taskId, updatedData) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updatedData } : task
      );
      
      setTasks(updatedTasks);
      const updatedTask = updatedTasks.find(task => task.id === taskId);

      // Zaplanuj nowe przypomnienie lub anuluj istniejące
      if (notification) {
        if (updatedTask.reminder && updatedTask.dueDate) {
          await notification.scheduleTaskReminder(updatedTask);
        } else {
          await notification.cancelTaskReminder(taskId);
        }
      }

      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }
  };

  // Usuwanie zadania
  const deleteTask = async (taskId) => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);

      // Anuluj przypomnienie dla usuniętego zadania
      if (notification) {
        await notification.cancelTaskReminder(taskId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }
  };

  // Przełączanie stanu wykonania zadania
  const toggleTaskCompletion = async (taskId) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      );
      
      setTasks(updatedTasks);
      const updatedTask = updatedTasks.find(task => task.id === taskId);

      // Jeśli zadanie zostało oznaczone jako wykonane, anuluj przypomnienie
      if (updatedTask.completed && notification) {
        await notification.cancelTaskReminder(taskId);
      }

      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return { success: false, error: error.message };
    }
  };

  // Pobieranie zadań na określoną datę
  const getTasksByDate = (date) => {
    if (!date) return [];
    
    // Konwertuj datę na ciąg YYYY-MM-DD
    const dateString = typeof date === 'string' 
      ? new Date(date).toISOString().split('T')[0] 
      : date.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateString;
    });
  };

  // Pobieranie zadań według priorytetu
  const getTasksByPriority = (priority) => {
    if (!priority) return tasks;
    return tasks.filter(task => task.priority === priority);
  };

  // Usuwanie wszystkich zadań użytkownika
  const clearAllTasks = async () => {
    if (!user) return { success: false, error: 'User is not logged in' };
    
    try {
      setTasks([]);

      // Anuluj wszystkie przypomnienia
      if (notification) {
        await notification.cancelAllReminders();
      }

      return { success: true };
    } catch (error) {
      console.error('Error clearing all tasks:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        getTasksByDate,
        getTasksByPriority,
        clearAllTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};