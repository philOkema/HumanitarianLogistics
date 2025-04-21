// client/src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig";

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig, 'client-app') : getApps()[0];
//const analytics = getAnalytics(app); //Commented out to prevent errors
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export const firebaseApp = app;