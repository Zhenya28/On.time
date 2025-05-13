import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Конфігурація Firebase для веб-додатку
// Містить унікальні ідентифікатори та ключі для підключення до сервісів Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8QbK7_4YTqTmgX4JQryzEzUDPm5J_II4",        
  authDomain: "ontime-4ee92.firebaseapp.com",               
  projectId: "ontime-4ee92",                                
  storageBucket: "ontime-4ee92.firebasestorage.app",        
  messagingSenderId: "283407605194",                        
  appId: "1:283407605194:web:e622e6e6bc28cac0f98333"        
};

// Ініціалізація Firebase
// Створює та налаштовує екземпляр Firebase для використання в додатку
const app = initializeApp(firebaseConfig);

// Ініціалізація сервісу аутентифікації Firebase
// Дозволяє працювати з реєстрацією та входом користувачів
export const auth = getAuth(app);

// Ініціалізація Cloud Firestore (база даних Firebase)
// Дозволяє працювати з документами та колекціями в базі даних
export const db = getFirestore(app);

// Експортуємо екземпляр Firebase для використання в інших частинах додатку
export default app;