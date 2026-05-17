import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",   // Índigo vibrante
        secondary: "#1e293b", // Fondo de tarjetas
        accent: "#22c55e",    // Verde online
        background: "#020617", // Fondo oscuro total
      },
    },
  },
  plugins: [],
};
export default config;