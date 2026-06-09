/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C0622B",
        dark: "#121212",
        darkCard: "#1E1E1E",
        darkHeader: "#181818",
        textPrimary: "#FFFFFF",
        textSecondary: "#A1A1AA",
      },
    },
  },
  plugins: [],
}