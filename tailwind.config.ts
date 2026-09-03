import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        danger: "hsl(var(--danger))",
        warning: "hsl(var(--warning))",
      },
      boxShadow: {
        glow: "0 0 28px rgba(166, 255, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
