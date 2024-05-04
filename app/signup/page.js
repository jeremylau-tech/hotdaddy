"use client";

import React, { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { poetsen } from "@/fonts";

const AuthComponent = ({ children }) => {
  const { currentUser, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    try {
      await signup(email, password, name);
      setError(null); // Clear any previous error
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignUp();
  };

  return (
    <main className="w-screen h-screen flex justify-center items-center px-6">
      <form onSubmit={handleSubmit} className="form-control gap-y-2 mb-24">
        <h1 className="text-primary text-center text-4xl font-extralight">
          Your <span className={`${poetsen.className}`}>HotDaddy</span>{" "}
          Information
        </h1>
        <div style={{ marginBottom: "15px", marginTop: "8px" }}>
          <input
            className="input input-bordered w-full"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        </div>
        <div style={{ marginBottom: "15px", marginTop: "8px" }}>
          <input
            className="input input-bordered w-full"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <input
            className="input input-bordered w-full"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <button className="btn btn-primary">Sign Up</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
};

export default AuthComponent;
