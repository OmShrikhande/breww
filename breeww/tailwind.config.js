/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        casino: {
          dark: '#070B19',
          base: '#140202',
          wine: '#2A0404',
          card: '#1F0303',
          cardHover: '#2B0505',
          elevated: '#280404',
          accent: '#FFD700',
          gold: '#FFD700',
          amber: '#F59E0B',
          win: '#10B981',
          lose: '#EF4444',
          crimson: '#8B0000',
        },
      },
      fontFamily: {
        display: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 35px rgba(255, 215, 0, 0.25)',
        'glow-gold': '0 0 25px rgba(255, 215, 0, 0.4)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.35)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        scroll: 'scroll 18s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        fadeInFast: 'fadeInFast 0.15s ease-out forwards',
        modalPop: 'modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
        fadeInFast: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalPop: {
          '0%': { transform: 'scale(0.93) translateY(6px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
