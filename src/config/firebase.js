import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8QbK7_4YTqTmgX4JQryzEzUDPm5J_II4",
  authDomain: "ontime-4ee92.firebaseapp.com",
  projectId: "ontime-4ee92",
  storageBucket: "ontime-4ee92.firebasestorage.app",
  messagingSenderId: "283407605194",
  appId: "1:283407605194:web:e622e6e6bc28cac0f98333"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 