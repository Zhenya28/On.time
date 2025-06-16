import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const TaskContext = createContext();

export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const notification = useNotification();

  // Завантажуємо завдання з AsyncStorage при зміні користувача.
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const tasksJSON = await AsyncStorage.getItem(`@tasks_${user.email}`);
        if (tasksJSON) {
          const loadedTasks = JSON.parse(tasksJSON);
          setTasks(loadedTasks);
        } else {
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
  }, [user?.email]);

  // Плануємо нагадування для всіх завдань з нагадуваннями після завантаження.
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

  // Зберігаємо завдання в AsyncStorage щоразу, коли список завдань змінюється.
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

  // Зберігає оновлений список завдань в AsyncStorage.
  const saveTasks = async (updatedTasks) => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem(`@tasks_${user.email}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  };

  // Додає нове завдання до списку та планує нагадування, якщо потрібно.
  const addTask = async (newTask) => {
    try {
      const taskWithId = {
        ...newTask,
        id: Date.now().toString(), // Генеруємо унікальний ID для нового завдання.
        createdAt: new Date().toISOString(),
        completed: false,
      };

      const updatedTasks = [...tasks, taskWithId];
      setTasks(updatedTasks);

      if (taskWithId.reminder && taskWithId.dueDate && notification) {
        await notification.scheduleTaskReminder(taskWithId);
      }

      return { success: true, task: taskWithId };
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, error: error.message };
    }
  };

  // Оновлює існуюче завдання та оновлює/скасовує його нагадування.
  const updateTask = async (taskId, updatedData) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updatedData } : task
      );
      
      setTasks(updatedTasks);
      const updatedTask = updatedTasks.find(task => task.id === taskId);
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

  // Видаляє завдання зі списку та скасовує пов'язане нагадування.
  const deleteTask = async (taskId) => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      if (notification) {
        await notification.cancelTaskReminder(taskId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }
  };

  // Перемикає статус завершення завдання та скасовує нагадування, якщо завдання завершено.
  const toggleTaskCompletion = async (taskId) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      );
      
      setTasks(updatedTasks);
      const updatedTask = updatedTasks.find(task => task.id === taskId);

      if (updatedTask.completed && notification) {
        await notification.cancelTaskReminder(taskId);
      }

      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return { success: false, error: error.message };
    }
  };

  // Фільтрує завдання за вказаною датою виконання.
  const getTasksByDate = (date) => {
    if (!date) return [];
    
    const dateString = typeof date === 'string' 
      ? new Date(date).toISOString().split('T')[0] 
      : date.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateString;
    });
  };

  // Фільтрує завдання за вказаним пріоритетом.
  const getTasksByPriority = (priority) => {
    if (!priority) return tasks;
    return tasks.filter(task => task.priority === priority);
  };

  // Видаляє всі завдання та скасовує всі нагадування.
  const clearAllTasks = async () => {
    if (!user) return { success: false, error: 'User is not logged in' };
    
    try {
      setTasks([]);

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
    // Надаємо доступ до стану завдань та функцій для керування ними.
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
