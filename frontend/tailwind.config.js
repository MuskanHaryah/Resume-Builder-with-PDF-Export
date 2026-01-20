/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luna: {
          50: "#f8fafb",
          100: "#A7EBF2",
          200: "#54ACBF",
          300: "#26658C",
          400: "#0238c9",
          500: "#011C40",
        },
      },
    },
  },
  plugins: [],
}
