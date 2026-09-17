/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070C0A', // Base canvas
          800: '#0B1410', // Container background
          700: '#122019', // Card background
          600: '#1A2E24', // Border / subtle highlight
          500: '#254234', // Hover states
        },
        forest: {
          900: '#0F291E',
          800: '#143829',
          700: '#1B4D38',
          600: '#24664B',
          500: '#10B981', // Accent Emerald
          400: '#34D399', // Bright Emerald
          300: '#6EE7B7',
        },
        brand: {
          lime: '#A3E635',
          emerald: '#10B981',
          teal: '#14B8A6',
          gold: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
