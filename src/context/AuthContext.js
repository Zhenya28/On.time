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

// Створення контексту авторизації для доступу до стану та функцій з будь-якого компонента.
const AuthContext = createContext({});

// Хук для зручного використання контексту авторизації в компонентах.
export const useAuth = () => useContext(AuthContext);

// Провайдер авторизації, який обгортає компоненти та надає їм доступ до стану авторизації.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Стан для зберігання інформації про поточного користувача.
  const [loading, setLoading] = useState(true); // Стан для індикації завантаження (наприклад, під час ініціалізації).

  useEffect(() => {
    // onAuthStateChanged підписується на зміни стану авторизації Firebase.
    // Він спрацьовує при вході, виході або реєстрації користувача.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Якщо користувач увійшов, зберігаємо його дані в стані та AsyncStorage.
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
        try {
          await AsyncStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          }));
        } catch (error) {
          console.error('Error saving user data:', error);
        }
        } else {
        // Якщо користувач вийшов, очищаємо дані користувача зі стану та AsyncStorage.
        setUser(null);
        try {
          await AsyncStorage.removeItem('user');
        } catch (error) {
          console.error('Error removing user data:', error);
        }
      }
      setLoading(false); // Завершуємо завантаження після перевірки стану авторизації.
    });

    // bootstrapAsync перевіряє AsyncStorage на наявність збережених даних користувача при запуску.
    const bootstrapAsync = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error reading user data:', error);
      }
    };

    bootstrapAsync(); // Викликаємо функцію для завантаження даних користувача.

    // Повертаємо функцію очищення підписки, щоб уникнути витоків пам'яті.
    return () => unsubscribe();
  }, []);

  // Функція updateUserName оновлює відображуване ім'я користувача в Firebase та локально.
  const updateUserName = async (newName) => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName
      });

      // Оновлюємо ім'я користувача в локальному стані.
      setUser(prev => ({
        ...prev,
        displayName: newName
      }));

      // Зберігаємо оновлені дані користувача в AsyncStorage.
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

  // Функція register створює нового користувача з email та паролем, а також встановлює ім'я.
  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Встановлюємо відображуване ім'я для щойно зареєстрованого користувача.
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Зберігаємо дані нового користувача в стані.
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

  // Функція login дозволяє користувачу увійти за допомогою email та пароля.
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Функція logout виходить з системи Firebase та очищає дані користувача з AsyncStorage.
  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user'); // Видаляємо дані користувача з локального сховища.
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    // AuthContext.Provider надає доступ до стану користувача, статусу завантаження
    // та функцій авторизації для всіх дочірніх компонентів.
    <AuthContext.Provider value={{
        user,
        loading,
      login,
        register,
        logout,
      updateUserName
    }}>
      {children}
    </AuthContext.Provider>
  );
};
