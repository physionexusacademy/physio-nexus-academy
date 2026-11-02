import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Extracted directly from the official PNA logo
        navy: {
          50: "#eef2f6",
          100: "#d5dde8",
          200: "#aabccf",
          300: "#7c99b5",
          400: "#4a6d8d",
          500: "#1f4468",
          600: "#0f2f4f",
          700: "#0a2544",
          800: "#041e3f", // primary logo navy
          900: "#02142c",
        },
        teal: {
          50: "#e6f6f7",
          100: "#c1ebec",
          200: "#93dbde",
          300: "#5cc4c8",
          400: "#2aa4a9",
          500: "#01828b", // primary logo teal
          600: "#016f77",
          700: "#015a60",
          800: "#01474c",
          900: "#013438",
        },
        grey: {
          50: "#f8f9fa",
          100: "#f1f3f4",
          200: "#e4e7e9",
          300: "#c9ced2",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
