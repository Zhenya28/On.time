import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8QbK7_4YTqTmgX4JQryzEzUDPm5J_II4",
  authDomain: "ontime-4ee92.firebaseapp.com",
  projectId: "ontime-4ee92",
  storageBucket: "ontime-4ee92.firebasestorage.app",
  messagingSenderId: "283407605194",
  appId: "1:283407605194:web:e622e6e6bc28cac0f98333"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app; 
