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
          bg: "#0a0a0a",
          surface: "#121212",
          elevated: "#181818",
          card: "#242424",
          cardHover: "#2a2a2a",
          border: "#282828",
          accent: "#1db954",
          accentHover: "#1ed760",
          textPrimary: "#ffffff",
          textSecondary: "#b3b3b3",
          textMuted: "#727272"
        }
      }
    },
  },
  plugins: [],
}
