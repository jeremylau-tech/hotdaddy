"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { poetsen } from "@/fonts";
import FAB from "@/components/FAB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { useRouter } from "next/navigation";

const AuthComponent = ({ children }) => {
  const router = useRouter();
  const { currentUser, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleSignUp = async () => {
    try {
      await signup(email, password, name);
      setError(null); // Clear any previous error
      setIsSuccessful(true);
      router.push("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignUp();
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }, [error]);

  return (
    <main className="w-screen h-screen flex justify-center items-center px-6">
      <div className="w-3/4 break-words whitespace-pre-wrap toast toast-top toast-center">
        {error && (
          <div className="flex break-words alert alert-error">
            <span>{error}</span>
          </div>
        )}
        {isSuccessful && (
          <div className="flex break-words alert alert-success">
            <span>You've signed up successfully!</span>
          </div>
        )}
      </div>

      <FAB
        onClick={() => router.push("/login")}
        position="topLeft"
        className={"glass"}
      >
        <FontAwesomeIcon icon={faChevronLeft} /> Back
      </FAB>
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
    </main>
  );
};

export default AuthComponent;
