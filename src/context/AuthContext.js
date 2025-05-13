import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Контекст для управління авторизацією користувача в додатку
// Зберігає стан користувача та надає функції для авторизації
const AuthContext = createContext({});

// Хук для зручного доступу до контексту авторизації з будь-якого компонента
export const useAuth = () => useContext(AuthContext);

// Провайдер контексту авторизації, який надає доступ до функцій та стану для дочірніх компонентів
export const AuthProvider = ({ children }) => {
  // Стан для зберігання інформації про поточного користувача
  const [user, setUser] = useState(null);
  // Стан для відстеження процесу завантаження стану авторизації
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Підписка на зміни стану авторизації в Firebase
    // Викликається при вході, виході або зміні сесії користувача
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Користувач авторизований
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
        // Зберігаємо дані користувача в AsyncStorage для збереження сесії
        try {
          await AsyncStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          }));
        } catch (error) {
          console.error('Błąd podczas zapisywania danych użytkownika:', error);
        }
      } else {
        // Користувач неавторизований (вийшов із системи)
        setUser(null);
        // Видаляємо збережені дані користувача з AsyncStorage
        try {
          await AsyncStorage.removeItem('user');
        } catch (error) {
          console.error('Błąd podczas usuwania danych użytkownika:', error);
        }
      }
      // Завершуємо завантаження стану авторизації
      setLoading(false);
    });

    // Перевіряємо збережені дані користувача при запуску додатку
    // Це дозволяє відновити сесію користувача без повторної авторизації
    const bootstrapAsync = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Błąd podczas odczytu danych użytkownika:', error);
      }
    };

    // Викликаємо функцію перевірки збережених даних
    bootstrapAsync();

    // Функція очищення - відписуємось від слухача змін авторизації при розмонтуванні компонента
    return () => unsubscribe();
  }, []);

  // Функція для оновлення імені користувача в профілі
  // Оновлює ім'я в Firebase, в локальному стані та в AsyncStorage
  const updateUserName = async (newName) => {
    try {
      // Оновлюємо ім'я користувача в Firebase
      await updateProfile(auth.currentUser, {
        displayName: newName
      });

      // Оновлюємо локальний стан користувача
      setUser(prev => ({
        ...prev,
        displayName: newName
      }));

      // Оновлюємо дані в AsyncStorage
      const updatedUser = {
        uid: user.uid,
        email: user.email,
        displayName: newName
      };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Функція для реєстрації нового користувача
  // Створює новий обліковий запис у Firebase з ім'ям, електронною поштою та паролем
  const register = async (name, email, password) => {
    try {
      // Створюємо нового користувача в Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Оновлюємо профіль користувача, додаючи ім'я
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Оновлюємо локальний стан користувача з ім'ям
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name
      });

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Функція для входу в систему
  // Авторизує користувача за допомогою електронної пошти та пароля
  const login = async (email, password) => {
    try {
      // Здійснюємо вхід в Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Функція для виходу з системи
  // Завершує сесію користувача та видаляє локальні дані
  const logout = async () => {
    try {
      // Виходимо з Firebase Authentication
      await signOut(auth);
      // Видаляємо збережені дані користувача з AsyncStorage
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Надаємо контекст авторизації з доступом до стану та функцій для дочірніх компонентів
  return (
    <AuthContext.Provider value={{ 
        user,         // Інформація про поточного користувача
        loading,      // Стан завантаження аутентифікації
        login,        // Функція для входу в систему
        register,     // Функція для реєстрації
        logout,       // Функція для виходу з системи
        updateUserName // Функція для оновлення імені користувача
    }}>
      {children}
    </AuthContext.Provider>
  );
};