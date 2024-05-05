"use client";

import React, { useState, useEffect } from 'react';

export default function FAB({ className, children, position, onClick }) {
  // Initialize theme based on localStorage or default to 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light'); //gets local theme

  // Apply the theme to the body or root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
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
    <div className={`absolute ${getPosition()}`}>

      <label className="flex cursor-pointer gap-2 ml-4 items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
        <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="toggle theme-controller"/>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      </label>

      <button
        onClick={onClick}
        className={`btn btn-accent rounded-3xl ${className || ""}`}
      >
        {children}
      </button>

    </div>
  );
}
