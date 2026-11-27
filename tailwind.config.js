/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tune: {
          bg: "#121212",
          surface: "#181818",
          elevated: "#242424",
          card: "#282828",
          cardHover: "#333333",
          border: "#3e3e3e",
          accent: "#1ed760",
          accentHover: "#3be477",
          textPrimary: "#ffffff",
          textSecondary: "#b3b3b3",
          textMuted: "#8a8a8a"
        }
      }
    },
  },
  plugins: [],
}
