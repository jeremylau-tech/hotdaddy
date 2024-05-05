"use client";

import React, { useState, useEffect } from "react";

export default function FAB({ className, children, position, onClick }) {
  // Initialize theme based on localStorage or default to 'light'
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  // Apply the theme to the body or root element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const getPosition = () => {
    switch (position) {
      case "topLeft":
        return "top-0 left-0";
      case "topRight":
        return "top-0 right-0";
      case "bottomLeft":
        return "bottom-[4rem] left-0";
      case "bottomRight":
        return "bottom-[4rem] right-0";
      default:
        return "top-0";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`btn rounded-3xl ${
        className ? className : ""
      } absolute ${getPosition()}`}
    >
      {children}
    </button>
  );
}