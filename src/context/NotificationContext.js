import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

// Налаштування сповіщень
// Встановлюємо обробник для визначення, як саме мають відображатися сповіщення
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // Показувати сповіщення як алерт
    shouldPlaySound: true,     // Відтворювати звук при сповіщенні
    shouldSetBadge: false,     // Не показувати бейдж на іконці додатку
  }),
});

// Контекст для управління сповіщеннями в додатку
// Надає функції та стани для роботи зі сповіщеннями
const NotificationContext = createContext();

// Хук для зручного доступу до контексту сповіщень з будь-якого компонента
export const useNotification = () => useContext(NotificationContext);

// Провайдер контексту сповіщень, що надає доступ до функцій та станів для дочірніх компонентів
export const NotificationProvider = ({ children }) => {
  // Стан для зберігання статусу дозволу на сповіщення
  const [permission, setPermission] = useState(false);
  // Отримуємо інформацію про поточного користувача з контексту авторизації
  const { user } = useAuth();

  // Налаштування сповіщень при завантаженні компонента
  useEffect(() => {
    const configureNotifications = async () => {
      // Перевіряємо наявні дозволи на сповіщення
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Якщо дозволу немає, запитуємо його у користувача
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Оновлюємо стан дозволу
      setPermission(finalStatus === 'granted');

      // Додаткове налаштування для Android - створення каналу сповіщень
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',                             // Назва каналу
          importance: Notifications.AndroidImportance.MAX, // Максимальний пріоритет
          vibrationPattern: [0, 250, 250, 250],        // Паттерн вібрації
          lightColor: '#FF231F7C',                     // Колір світлодіоду сповіщення
        });
      }
    };

    // Викликаємо функцію налаштування
    configureNotifications();
  }, []);

  // Функція для планування нагадування про завдання
  // Створює сповіщення на основі дати виконання завдання
  const scheduleTaskReminder = async (task) => {
    // Перевіряємо, чи є дозвіл на сповіщення
    if (!permission) {
      console.log('Brak uprawnień do powiadomień');
      return null;
    }

    // Перевіряємо, чи завдання має дату та увімкнене нагадування
    if (!task.dueDate || !task.reminder) {
      return null;
    }

    try {
      // Отримуємо дату виконання завдання для тригера сповіщення
      const triggerDate = new Date(task.dueDate);
      
      // Переконуємося, що дата не в минулому
      const now = new Date();
      if (triggerDate <= now) {
        console.log('Data przypomnienia jest w przeszłości');
        return null;
      }

      // Скасовуємо існуюче сповіщення для цього завдання, якщо воно є
      await cancelTaskReminder(task.id);

      // Створюємо унікальний ідентифікатор для сповіщення
      const identifier = `task-${task.id}`;

      // Плануємо нове сповіщення
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Przypomnienie: ${task.title}`,          // Заголовок сповіщення
          body: task.description || 'Czas na wykonanie zadania!', // Текст сповіщення
          data: { taskId: task.id },                      // Додаткові дані
          sound: true,                                    // Відтворювати звук
        },
        trigger: triggerDate,   // Дата і час спрацювання
        identifier: identifier  // Унікальний ідентифікатор
      });

      console.log('Zaplanowano powiadomienie: ', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Błąd przy planowaniu powiadomienia:', error);
      return null;
    }
  };

  // Функція для скасування нагадування про завдання
  // Видаляє заплановане сповіщення за ідентифікатором завдання
  const cancelTaskReminder = async (taskId) => {
    try {
      // Формуємо ідентифікатор сповіщення на основі ID завдання
      const identifier = `task-${taskId}`;
      // Скасовуємо заплановане сповіщення
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('Anulowano powiadomienie dla zadania: ', taskId);
      return true;
    } catch (error) {
      console.error('Błąd przy anulowaniu powiadomienia:', error);
      return false;
    }
  };

  // Функція для скасування всіх нагадувань
  // Видаляє всі заплановані сповіщення
  const cancelAllReminders = async () => {
    try {
      // Скасовуємо всі заплановані сповіщення
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Anulowano wszystkie powiadomienia');
      return true;
    } catch (error) {
      console.error('Błąd przy anulowaniu wszystkich powiadomień:', error);
      return false;
    }
  };

  // Функція для показу тестового сповіщення
  // Створює і відображає сповіщення негайно (для перевірки роботи сповіщень)
  const showTestNotification = async (title, body) => {
    // Перевіряємо, чи є дозвіл на сповіщення
    if (!permission) {
      console.log('Brak uprawnień do powiadomień');
      return null;
    }

    try {
      // Відправляємо тестове сповіщення
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title || 'Test powiadomienia',          // Заголовок сповіщення
          body: body || 'To jest testowe powiadomienie!', // Текст сповіщення
        },
        trigger: null, // Негайне відображення (без затримки)
      });

      console.log('Wysłano testowe powiadomienie: ', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Błąd przy wysyłaniu testowego powiadomienia:', error);
      return null;
    }
  };

  // Надаємо контекст сповіщень з доступом до функцій та станів для дочірніх компонентів
  return (
    <NotificationContext.Provider
      value={{
        hasPermission: permission,      // Стан дозволу на сповіщення
        scheduleTaskReminder,           // Функція планування нагадування
        cancelTaskReminder,             // Функція скасування нагадування
        cancelAllReminders,             // Функція скасування всіх нагадувань
        showTestNotification,           // Функція показу тестового сповіщення
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;