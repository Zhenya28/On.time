import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

// Налаштування сповіщень для Pomodoro таймера
// Визначає, як будуть відображатися сповіщення
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // Показувати сповіщення як алерт
    shouldPlaySound: true,     // Відтворювати звук при сповіщенні
    shouldSetBadge: false,     // Не показувати бейдж на іконці додатку
  }),
});

// Типи сесій Pomodoro
// Визначає різні стани таймера для циклу роботи та відпочинку
export const SESSION_TYPES = {
  WORK: 'work',              // Робоча сесія
  SHORT_BREAK: 'shortBreak', // Коротка перерва
  LONG_BREAK: 'longBreak',   // Довга перерва
};

// Значення налаштувань за замовчуванням
// Встановлює початкові значення для таймерів та поведінки Pomodoro
const DEFAULT_SETTINGS = {
  workDuration: 25,            // Тривалість робочої сесії в хвилинах
  shortBreakDuration: 5,       // Тривалість короткої перерви в хвилинах
  longBreakDuration: 15,       // Тривалість довгої перерви в хвилинах
  sessionsBeforeLongBreak: 4,  // Кількість сесій до довгої перерви
  autoStartBreaks: false,      // Автоматичний запуск перерв
  autoStartWork: false,        // Автоматичний запуск робочих сесій
  notifications: true,         // Увімкнення сповіщень
};

// Контекст для таймера Pomodoro
// Дозволяє передавати стан таймера та функції керування по всьому додатку
const PomodoroContext = createContext();

// Хук для зручного доступу до контексту Pomodoro з будь-якого компонента
export const usePomodoro = () => useContext(PomodoroContext);

// Провайдер контексту Pomodoro, який надає доступ до функцій та стану для дочірніх компонентів
export const PomodoroProvider = ({ children }) => {
  // Стани для керування таймером та його налаштуваннями
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);      // Налаштування таймера
  const [isRunning, setIsRunning] = useState(false);               // Стан роботи таймера (запущений/призупинений)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60); // Залишок часу в секундах
  const [currentSession, setCurrentSession] = useState(SESSION_TYPES.WORK);    // Поточний тип сесії
  const [sessionsCompleted, setSessionsCompleted] = useState(0);   // Кількість завершених робочих сесій
  const { user } = useAuth();                                      // Отримуємо дані користувача для збереження налаштувань
  const timerRef = useRef(null);                                   // Посилання на інтервал таймера для очищення

  // Завантаження налаштувань з AsyncStorage при першому рендері
  // та при зміні користувача
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const savedSettings = await AsyncStorage.getItem(`@pomodoro_settings_${user.email}`);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Błąd podczas wczytywania ustawień pomodoro:', error);
      }
    };

    loadSettings();
  }, [user?.email]);

  // Збереження налаштувань в AsyncStorage при їх зміні
  useEffect(() => {
    const saveSettings = async () => {
    if (!user) return;
    
    try {
        await AsyncStorage.setItem(`@pomodoro_settings_${user.email}`, JSON.stringify(settings));
      } catch (error) {
        console.error('Błąd podczas zapisywania ustawień pomodoro:', error);
      }
    };

    saveSettings();
  }, [settings, user?.email]);

  // Ефект для управління таймером
  // Запускає та зупиняє інтервал в залежності від стану isRunning
  useEffect(() => {
    if (isRunning) {
      // Створюємо інтервал, який зменшує час на 1 секунду кожну секунду
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Таймер завершився
            clearInterval(timerRef.current);
            handleSessionComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      // Якщо таймер зупинено, очищаємо інтервал
      clearInterval(timerRef.current);
    }

    // Очищаємо інтервал при розмонтуванні компонента
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // Функція обробки завершення сесії
  // Визначає, яка сесія буде наступною та налаштовує таймер
  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    if (currentSession === SESSION_TYPES.WORK) {
      // Завершена робоча сесія
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      // Показуємо сповіщення, якщо вони увімкнені
      if (settings.notifications) {
        await scheduleNotification('Sesja robocza zakończona!', 'Czas na przerwę.');
      }
      
      // Визначаємо тип наступної перерви (коротка чи довга)
      if (newSessionsCompleted % settings.sessionsBeforeLongBreak === 0) {
        // Час для довгої перерви
        setCurrentSession(SESSION_TYPES.LONG_BREAK);
        setTimeLeft(settings.longBreakDuration * 60);
        if (settings.autoStartBreaks) setIsRunning(true);
      } else {
        // Час для короткої перерви
        setCurrentSession(SESSION_TYPES.SHORT_BREAK);
        setTimeLeft(settings.shortBreakDuration * 60);
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else {
      // Завершена перерва (коротка або довга)
      if (settings.notifications) {
        await scheduleNotification('Przerwa zakończona!', 'Czas do pracy.');
      }
      
      // Повертаємося до робочої сесії
      setCurrentSession(SESSION_TYPES.WORK);
      setTimeLeft(settings.workDuration * 60);
      if (settings.autoStartWork) setIsRunning(true);
    }
  };

  // Функція для планування сповіщення
  // Створює негайне сповіщення з вказаним заголовком та текстом
  const scheduleNotification = async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // Відправити негайно
      });
    } catch (error) {
      console.error('Błąd podczas planowania powiadomienia:', error);
    }
  };

  // Функція оновлення налаштувань таймера
  // Зберігає нові налаштування та оновлює поточний таймер
  const updateSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      // Оновлюємо поточний таймер, якщо він не запущений
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
      console.error('Błąd podczas aktualizacji ustawień:', error);
      return { success: false, error: error.message };
    }
  };

  // Функція запуску таймера
  const startTimer = () => {
    setIsRunning(true);
  };

  // Функція паузи таймера
  const pauseTimer = () => {
    setIsRunning(false);
  };

  // Функція скидання таймера
  // Повертає таймер до початкового стану робочої сесії
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings.workDuration * 60);
    setCurrentSession(SESSION_TYPES.WORK);
    setSessionsCompleted(0);
  };

  // Функція пропуску поточної сесії
  // Дозволяє перейти до вказаної сесії або до наступної сесії в циклі
  const skipSession = (targetSession) => {
    setIsRunning(false);
    
    // Встановлюємо таймер в залежності від типу цільової сесії
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
        // Якщо цільова сесія не вказана, використовуємо стандартний цикл
        if (currentSession === SESSION_TYPES.WORK) {
          // Після роботи переходимо на перерву
          if (sessionsCompleted % settings.sessionsBeforeLongBreak === 0) {
            setCurrentSession(SESSION_TYPES.LONG_BREAK);
            setTimeLeft(settings.longBreakDuration * 60);
          } else {
            setCurrentSession(SESSION_TYPES.SHORT_BREAK);
            setTimeLeft(settings.shortBreakDuration * 60);
          }
        } else {
          // Після перерви переходимо на роботу
          setCurrentSession(SESSION_TYPES.WORK);
          setTimeLeft(settings.workDuration * 60);
        }
    }
  };

  // Надаємо контекст Pomodoro з доступом до стану та функцій для дочірніх компонентів
  return (
    <PomodoroContext.Provider
      value={{
        settings,           // Поточні налаштування таймера
        updateSettings,     // Функція оновлення налаштувань
        isRunning,          // Стан роботи таймера
        timeLeft,           // Залишок часу
        currentSession,     // Поточний тип сесії
        sessionsCompleted,  // Кількість завершених сесій
        startTimer,         // Функція запуску таймера
        pauseTimer,         // Функція паузи таймера
        resetTimer,         // Функція скидання таймера
        skipSession,        // Функція пропуску сесії
        SESSION_TYPES       // Типи сесій для використання в компонентах
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export default PomodoroContext;