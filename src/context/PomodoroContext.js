import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

// Налаштування обробника сповіщень для Expo.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Показувати сповіщення як спливаюче вікно.
    shouldPlaySound: true, // Відтворювати звук при сповіщенні.
    shouldSetBadge: false, // Не встановлювати бейдж на іконці додатку.
  }),
});

// Типи сесій Pomodoro для використання в додатку.
export const SESSION_TYPES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

// Налаштування Pomodoro за замовчуванням.
const DEFAULT_SETTINGS = {
  workDuration: 25, // тривалість робочої сесії у хвилинах
  shortBreakDuration: 5, // тривалість короткої перерви у хвилинах
  longBreakDuration: 15, // тривалість довгої перерви у хвилинах
  sessionsBeforeLongBreak: 4, // кількість робочих сесій до довгої перерви
  autoStartBreaks: false, // автоматичний початок перерв
  autoStartWork: false, // автоматичний початок робочих сесій
  notifications: true, // увімкнення сповіщень
};

// Створюємо контекст Pomodoro для глобального доступу до його стану.
const PomodoroContext = createContext();

// Хук usePomodoro для зручного доступу до контексту.
export const usePomodoro = () => useContext(PomodoroContext);

// PomodoroProvider надає стан і функції Pomodoro-таймера своїм дочірнім компонентам.
export const PomodoroProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isRunning, setIsRunning] = useState(false); // Чи працює таймер зараз.
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60); // Залишок часу в секундах.
  const [currentSession, setCurrentSession] = useState(SESSION_TYPES.WORK); // Поточний тип сесії.
  const [sessionsCompleted, setSessionsCompleted] = useState(0); // Кількість завершених робочих сесій.
  const { user } = useAuth(); // Отримуємо інформацію про поточного користувача.
  const timerRef = useRef(null); // Референс для зберігання ідентифікатора інтервалу таймера.

  // Ефект для завантаження налаштувань та кількості завершених сесій з AsyncStorage
  // при зміні користувача.
  useEffect(() => {
    const loadData = async () => {
      if (!user) return; // Не завантажуємо дані, якщо немає користувача.
      
      try {
        const savedSettings = await AsyncStorage.getItem(`@pomodoro_settings_${user.email}`);
        const savedSessions = await AsyncStorage.getItem(`@pomodoro_sessions_${user.email}`);
        
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        if (savedSessions) {
          setSessionsCompleted(parseInt(savedSessions));
        }
      } catch (error) {
        console.error('Error loading pomodoro data:', error);
      }
    };

    loadData();
  }, [user?.email]); // Залежність від email користувача.

  // Ефект для збереження кількості завершених сесій в AsyncStorage
  // щоразу, коли sessionsCompleted змінюється.
  useEffect(() => {
    const saveSessions = async () => {
      if (!user) return;
      
      try {
        await AsyncStorage.setItem(`@pomodoro_sessions_${user.email}`, sessionsCompleted.toString());
      } catch (error) {
        console.error('Error saving sessions completed:', error);
      }
    };

    saveSessions();
  }, [sessionsCompleted, user?.email]); // Залежність від sessionsCompleted та email користувача.

  // Ефект для збереження налаштувань в AsyncStorage
  // щоразу, коли settings змінюється.
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
  }, [settings, user?.email]); // Залежність від settings та email користувача.

  // Ефект, що керує логікою таймера (setInterval).
  // Він запускає або зупиняє таймер залежно від isRunning.
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) { // Якщо час вийшов.
            clearInterval(timerRef.current); // Зупиняємо таймер.
            handleSessionComplete(); // Обробляємо завершення сесії.
            return 0;
          }
          return prevTime - 1; // Зменшуємо час на 1 секунду.
        });
      }, 1000); // Інтервал в 1 секунду.
    } else if (timerRef.current) {
      clearInterval(timerRef.current); // Зупиняємо таймер, якщо isRunning false.
    }

    // Функція очищення, яка зупиняє таймер при розмонтуванні компонента.
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]); // Залежність від стану isRunning.

  // Обробник завершення поточної сесії (робочої або перерви).
  const handleSessionComplete = async () => {
    setIsRunning(false); // Зупиняємо таймер.
    
    if (currentSession === SESSION_TYPES.WORK) {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      if (settings.notifications) { // Надсилаємо сповіщення, якщо вони увімкнені.
        await scheduleNotification('Sesja pracy zakończona!', 'Czas na przerwę.');
      }
      
      // Визначаємо наступну сесію (довга перерва або коротка).
      if (newSessionsCompleted % settings.sessionsBeforeLongBreak === 0) {
        setCurrentSession(SESSION_TYPES.LONG_BREAK);
        setTimeLeft(settings.longBreakDuration * 60);
        if (settings.autoStartBreaks) setIsRunning(true); // Автоматичний старт, якщо увімкнено.
      } else {
        setCurrentSession(SESSION_TYPES.SHORT_BREAK);
        setTimeLeft(settings.shortBreakDuration * 60);
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else { // Якщо завершилася перерва (коротка або довга).
      if (settings.notifications) {
        await scheduleNotification('Przerwa zakończona!', 'Czas wrócić do pracy.');
      }
      
      setCurrentSession(SESSION_TYPES.WORK); // Повертаємося до робочої сесії.
      setTimeLeft(settings.workDuration * 60);
      if (settings.autoStartWork) setIsRunning(true); // Автоматичний старт, якщо увімкнено.
    }
  };

  // Функція для планування локальних сповіщень.
  const scheduleNotification = async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true, // Звукове сповіщення.
        },
        trigger: null, // Негайне спрацьовування.
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Функція для оновлення налаштувань Pomodoro.
  const updateSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      // Якщо таймер не запущений, оновлюємо час відповідно до нових налаштувань.
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

  // Функції для керування таймером: старт, пауза, скидання.
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
  };

  // Скидає всі налаштування таймера, включаючи кількість завершених сесій.
  const resetAll = async () => {
    setIsRunning(false);
    setTimeLeft(settings.workDuration * 60);
    setCurrentSession(SESSION_TYPES.WORK);
    setSessionsCompleted(0);
    if (user) {
      try {
        await AsyncStorage.removeItem(`@pomodoro_sessions_${user.email}`); // Видаляємо дані сесій з AsyncStorage.
      } catch (error) {
        console.error('Error resetting sessions:', error);
      }
    }
  };

  // Функція для пропуску поточної сесії та переходу до наступної або зазначеної.
  const skipSession = (targetSession) => {
    setIsRunning(false); // Зупиняємо таймер.
    
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
      default: // Якщо targetSession не вказано, переходимо до наступної логічної сесії.
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
    // Надаємо доступ до всіх значень контексту для дочірніх компонентів.
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
        resetAll,
        skipSession,
        SESSION_TYPES
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export default PomodoroContext;
