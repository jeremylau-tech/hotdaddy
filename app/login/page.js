"use client";
import React, { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link"; 

const AuthComponent = () => {
  const router = useRouter();
  const { currentUser, login, signup } = useAuth();
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

  const handleLogin = async () => {
    try {
      await login(email, password);
      setError(null); // Clear any previous error
      router.push("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="form-control px-12 gap-y-2">
        
        
        <h2>Sign in to HotDaddy</h2>
        <div style={{ marginBottom: "15px" }}>
          <input
            className="input input-bordered"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <input
            className="input input-bordered"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
        </div>
          <p>Don't have an account yet? <Link href = "/signup"> Sign-up here.</Link> </p>
          
          <button
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "3px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        
          >Login
        </button>
      </form>
      {currentUser && <p>Logged in as: {currentUser.email}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
};

export default AuthComponent;
