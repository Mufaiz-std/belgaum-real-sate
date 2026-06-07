import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4A017",
          light: "#E8C547",
          dark: "#A07810",
        },
        dark: {
          DEFAULT: "#0F1115",
          card: "#1A1D23",
        },
        cream: {
          DEFAULT: "#F9F7F2",
          dark: "#EEE9DF",
        },
        neutral: "#8B7280",
      },
      fontFamily: {
        headline: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-fira)", "Helvetica Neue", "sans-serif"],
        label: ["var(--font-space-mono)", "Courier New", "monospace"],
        sans: ["var(--font-fira)", "Helvetica Neue", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-space-mono)", "Courier New", "monospace"],
      },
      animation: {
        kenburns: "kenburns 20s ease-in-out infinite alternate",
      },
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
