import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth,
  getReactNativePersistence,
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Конфігурація Firebase з твоїми даними
const firebaseConfig = {
  apiKey: "AIzaSyB8QbK7_4YTqTmgX4JQryzEzUDPm5J_II4",
  authDomain: "ontime-4ee92.firebaseapp.com",
  projectId: "ontime-4ee92",
  storageBucket: "ontime-4ee92.firebasestorage.app",
  messagingSenderId: "283407605194",
  appId: "1:283407605194:web:e622e6e6bc28cac0f98333"
};

// Ініціалізація Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Ініціалізація Auth з перевіркою на існуюючий екземпляр
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Експортуємо функції автентифікації
export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};