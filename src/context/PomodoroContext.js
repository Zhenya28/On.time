import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

// Налаштування повідомлень
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Типи сесій Pomodoro
export const SESSION_TYPES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

// Значення за замовчуванням
const DEFAULT_SETTINGS = {
  workDuration: 25, // minutes
  shortBreakDuration: 5, // minutes
  longBreakDuration: 15, // minutes
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  notifications: true,
};

// Контекст для таймера Pomodoro
const PomodoroContext = createContext();

export const usePomodoro = () => useContext(PomodoroContext);

export const PomodoroProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [currentSession, setCurrentSession] = useState(SESSION_TYPES.WORK);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const { user } = useAuth();
  const timerRef = useRef(null);

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const savedSettings = await AsyncStorage.getItem(`@pomodoro_settings_${user.email}`);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading pomodoro settings:', error);
      }
    };

    loadSettings();
  }, [user?.email]);

  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
    if (!user) return;
    
    try {
        await AsyncStorage.setItem(`@pomodoro_settings_${user.email}`, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving pomodoro settings:', error);
      }
    };

    saveSettings();
  }, [settings, user?.email]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(timerRef.current);
          handleSessionComplete();
          return 0;
        }
          return prevTime - 1;
      });
    }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    if (currentSession === SESSION_TYPES.WORK) {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      // Show notification
      if (settings.notifications) {
        await scheduleNotification('Work session completed!', 'Time for a break.');
      }
      
      // Determine next break type
      if (newSessionsCompleted % settings.sessionsBeforeLongBreak === 0) {
        setCurrentSession(SESSION_TYPES.LONG_BREAK);
        setTimeLeft(settings.longBreakDuration * 60);
        if (settings.autoStartBreaks) setIsRunning(true);
      } else {
        setCurrentSession(SESSION_TYPES.SHORT_BREAK);
        setTimeLeft(settings.shortBreakDuration * 60);
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else {
      // Break completed
      if (settings.notifications) {
        await scheduleNotification('Break completed!', 'Time to work.');
      }
      
      setCurrentSession(SESSION_TYPES.WORK);
      setTimeLeft(settings.workDuration * 60);
      if (settings.autoStartWork) setIsRunning(true);
    }
  };

  const scheduleNotification = async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      // Update current timer if needed
      if (!isRunning) {
        if (currentSession === SESSION_TYPES.WORK) {
          setTimeLeft(newSettings.workDuration * 60);
        } else if (currentSession === SESSION_TYPES.SHORT_BREAK) {
          setTimeLeft(newSettings.shortBreakDuration * 60);
        } else {
          setTimeLeft(newSettings.longBreakDuration * 60);
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings.workDuration * 60);
    setCurrentSession(SESSION_TYPES.WORK);
    setSessionsCompleted(0);
  };

  const skipSession = (targetSession) => {
    setIsRunning(false);
    
    // Set the timer based on the target session type
    switch (targetSession) {
      case SESSION_TYPES.WORK:
        setCurrentSession(SESSION_TYPES.WORK);
        setTimeLeft(settings.workDuration * 60);
        break;
      case SESSION_TYPES.SHORT_BREAK:
        setCurrentSession(SESSION_TYPES.SHORT_BREAK);
        setTimeLeft(settings.shortBreakDuration * 60);
        break;
      case SESSION_TYPES.LONG_BREAK:
        setCurrentSession(SESSION_TYPES.LONG_BREAK);
        setTimeLeft(settings.longBreakDuration * 60);
        break;
      default:
        // If no target session specified, use the default cycling behavior
        if (currentSession === SESSION_TYPES.WORK) {
          if (sessionsCompleted % settings.sessionsBeforeLongBreak === 0) {
            setCurrentSession(SESSION_TYPES.LONG_BREAK);
            setTimeLeft(settings.longBreakDuration * 60);
          } else {
            setCurrentSession(SESSION_TYPES.SHORT_BREAK);
            setTimeLeft(settings.shortBreakDuration * 60);
          }
        } else {
          setCurrentSession(SESSION_TYPES.WORK);
          setTimeLeft(settings.workDuration * 60);
        }
    }
  };

  return (
    <PomodoroContext.Provider
      value={{
        settings,
        updateSettings,
        isRunning,
        timeLeft,
        currentSession,
        sessionsCompleted,
        startTimer,
        pauseTimer,
        resetTimer,
        skipSession,
        SESSION_TYPES
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export default PomodoroContext;