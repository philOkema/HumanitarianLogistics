// firebaseConfig.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

export const firebaseConfig = {
  apiKey: "AIzaSyCECE4RoYlRls-jED9DWI3HGvnOqC2VxQ4",
  authDomain: "humanitarianlogistics-d0b77.firebaseapp.com",
  projectId: "humanitarianlogistics-d0b77",
  storageBucket: "humanitarianlogistics-d0b77.firebasestorage.app",
  messagingSenderId: "874559986585",
  appId: "1:874559986585:web:cf16f3b1ed7a495f7bd108",
  measurementId: "G-G7CXG3Q4LL",
  databaseURL: "https://humanitarianlogistics-d0b77-default-rtdb.europe-west1.firebasedatabase.app"
};

// ✅ Initialize the Firebase app only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Export the Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export default app;
