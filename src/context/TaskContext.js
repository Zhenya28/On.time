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

  const saveTasks = async (updatedTasks) => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem(`@tasks_${user.email}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  };

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

      if (taskWithId.reminder && taskWithId.dueDate && notification) {
        await notification.scheduleTaskReminder(taskWithId);
      }

      return { success: true, task: taskWithId };
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, error: error.message };
    }
  };

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

  const getTasksByPriority = (priority) => {
    if (!priority) return tasks;
    return tasks.filter(task => task.priority === priority);
  };

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
