import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6SeC-xSOiPKeo-NvcOY8H_LCAwwjZYuA",
  authDomain: "guelph-2024.firebaseapp.com",
  projectId: "guelph-2024",
  storageBucket: "guelph-2024.appspot.com",
  messagingSenderId: "913682142221",
  appId: "1:913682142221:web:1d80e4dbd5ffecf9c6f144",
};

// Initialize Firebase
export const APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(APP);
export const DB = getFirestore(APP);
