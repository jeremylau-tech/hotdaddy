"use client"

import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH } from '../firebase';

const AuthComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const firestore = getFirestore();

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      await setDoc(doc(collection(firestore, 'users'), email), { userId, email});
      setCurrentUser(email);
      setError(null); // Clear any previous error
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user.email);
      setError(null); // Clear any previous error
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Authentication</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleLogin}>Login</button>
      {currentUser && <p>Logged in as: {currentUser}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AuthComponent;
