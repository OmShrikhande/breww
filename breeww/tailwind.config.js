/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        casino: {
          dark: '#070B1A',
          base: '#0F1629',
          card: '#141E38',
          elevated: '#1A2744',
          accent: '#4F8EF7',
          gold: '#F5C542',
          win: '#22C55E',
          lose: '#EF4444',
        },
      },
      fontFamily: {
        display: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(79, 142, 247, 0.25)',
        'glow-gold': '0 0 30px rgba(245, 197, 66, 0.3)',
      },
      animation: {
        scroll: 'scroll 15s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
