/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        casino: {
          dark: '#0B0F2A',
          card: '#141A3C',
          accent: '#6366f1', // Indigo-500 equivalent
          gold: '#FFD700',
        }
      },
      animation: {
        'scroll': 'scroll 15s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}

