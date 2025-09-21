// This is the full, corrected content for frontend/src/firebase.ts

import { initializeApp } from "firebase/app";
// REMOVED: getAnalytics as we don't need it right now.
// ADDED: getAuth and getFirestore for user management
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfuV0FHXrLs7d35dy6zYhhxyRrcVimleE",
  authDomain: "cement-ai-472715.firebaseapp.com",
  projectId: "cement-ai-472715",
  storageBucket: "cement-ai-472715.firebasestorage.app",
  messagingSenderId: "472642907752",
  appId: "1:472642907752:web:f2b10718289ca8acc6d5dd",
  measurementId: "G-JCDD4MP59C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the Firebase services we will use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();