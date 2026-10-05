/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Government-grade premium theme
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7dbff',
          300: '#a3c2ff',
          400: '#7a9eff',
          500: '#1d4ed8', // Main Brand Blue (Ashoka Blue / Navy)
          600: '#1e40af',
          700: '#1d3557', // Deep slate navy
          800: '#0f172a', // Ultra deep slate/black
          900: '#020617', // Onyx background
        },
        accent: {
          saffron: '#f97316', // Dynamic saffron
          green: '#10b981',   // Organic growth emerald
          gold: '#eab308',    // Active status gold
        },
        slate: {
          950: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Instrument Sans', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
