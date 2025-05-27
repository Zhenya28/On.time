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

// Контекст для управління авторизацією
const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes and restore user session
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
        // Save user data to AsyncStorage
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
        // User is signed out
        setUser(null);
        try {
          await AsyncStorage.removeItem('user');
        } catch (error) {
          console.error('Error removing user data:', error);
        }
      }
      setLoading(false);
    });

    // Check for stored user data on app launch
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

    bootstrapAsync();

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Функція для оновлення імені користувача
  const updateUserName = async (newName) => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName
      });

      // Update local user state
      setUser(prev => ({
        ...prev,
        displayName: newName
      }));

      // Update AsyncStorage
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

  // Функція для реєстрації користувача
  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with their name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Update local user state with the name
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
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Функція для виходу з системи
  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
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