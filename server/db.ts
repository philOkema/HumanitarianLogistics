import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import * as schema from "../shared/schema";
import { FirebaseOptions } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCECE4RoYlRls-jED9DWI3HGvnOqC2VxQ4",
  authDomain: "humanitarianlogistics-d0b77.firebaseapp.com",
  projectId: "humanitarianlogistics-d0b77",
  storageBucket: "humanitarianlogistics-d0b77.firebasestorage.app",
  messagingSenderId: "874559986585",
  appId: "1:874559986585:web:cf16f3b1ed7a495f7bd108",
  measurementId: "G-G7CXG3Q4LL"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Firestore collection references
export const usersCollection = collection(db, "users");
export const distributionsCollection = collection(db, "distributions");
export const inventoriesCollection = collection(db, "inventories");
export const aidRequestsCollection = collection(db, "aidRequests");
export const beneficiariesCollection = collection(db, "beneficiaries");
export const volunteerApplicationsCollection = collection(db, "volunteerApplications");


// Export Firestore functions for CRUD operations

// Example usage (in other files)
