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
          50: "#f8fafb",    // Very light background
          100: "#A7EBF2",   // Light teal (accents)
          200: "#54ACBF",   // Primary teal (main brand color)
          300: "#26658C",   // Deep blue (secondary)
          400: "#023859",   // Darker blue
          500: "#011C40",   // Navy (dark accents)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      boxShadow: {
        'luna': '0 4px 6px -1px rgba(84, 172, 191, 0.1), 0 2px 4px -1px rgba(84, 172, 191, 0.06)',
        'luna-lg': '0 10px 15px -3px rgba(84, 172, 191, 0.1), 0 4px 6px -2px rgba(84, 172, 191, 0.05)',
        'luna-xl': '0 20px 25px -5px rgba(84, 172, 191, 0.1), 0 10px 10px -5px rgba(84, 172, 191, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
