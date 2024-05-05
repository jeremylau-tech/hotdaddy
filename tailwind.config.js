/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      height: {
        content: "calc(100% - 4rem)",
        fullScreen: "calc(100vh - 4 rem)",
      },
      maxHeight: {
        content: "calc(100% - 4rem)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "base-100": "#f8f9fa",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
        },
      },
    ],
  },
};
