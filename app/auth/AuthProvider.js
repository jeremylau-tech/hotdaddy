"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const path = usePathname();
  const router = useRouter();

  const signup = async (email, password, name) => {
    console.log(email, password, name);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });

    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data.user));
    setCurrentUser(data.user);
  };

  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data.user));
    setCurrentUser(data.user);
  };

  const signout = async () => {
    const res = await fetch("/api/auth/signout");
    if (res.status === 200) {
      localStorage.removeItem("user");
      router.push("/login");
    }
    setCurrentUser(null);
  };

  const verifyUser = async () => {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({
        user: currentUser,
      }),
    });
    return res.status;
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user && (path !== '/login' && path !== '/signup')) {
      return router.push("/");
    }

    const getAuthenticatedUser = async () => {
      const status = await verifyUser();
      switch (status) {
        case 200:
          setCurrentUser(JSON.parse(user));
          break;
        case 401:
          localStorage.removeItem("user");
          router.push("/login");
          break;
        default:
          router.push("/404");
          break;
      }
    };
    getAuthenticatedUser();
  }, [path]);

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
