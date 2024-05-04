"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { APP, FIREBASE_AUTH, DB } from "@/firebase";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );
    await setDoc(doc(collection(DB, "users"), email), {
      userId: userCredential.user.uid,
      email,
      name,
    });
    localStorage.setItem("user", JSON.stringify(userCredential.user));
    setCurrentUser(userCredential.user);
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );
    localStorage.setItem("user", JSON.stringify(userCredential.user));
    setCurrentUser(userCredential.user);
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    setCurrentUser(JSON.parse(user));
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
