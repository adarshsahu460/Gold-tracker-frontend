/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fff7e6',
          100: '#ffedc2',
          200: '#ffdb85',
          300: '#ffd700', // Main gold
          400: '#ffcc00',
          500: '#e6b800',
          600: '#bfa100',
          700: '#997d00',
          800: '#665400',
          900: '#332a00',
        },
        dark: {
          50: '#f7f7f7',
          100: '#e6e6e6',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#1a1a1a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}
