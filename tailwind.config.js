/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./sections/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          50: '#F7F0D8',
          100: '#F2E7C3',
          200: '#E9D69A',
          300: '#E0C571',
          400: '#D7B448',
          500: '#D4AF37',
          600: '#B8942A',
          700: '#937622',
          800: '#6E5819',
          900: '#493A11',
        },
      },
      fontFamily: {
        serif: ['Park Lane', 'serif'],
        sans: ['MPIDeco', 'sans-serif'],
        navbar: ['Market Deco', 'sans-serif'],
        body: ['MPIDeco', 'sans-serif'],
      },
    },
  },
  plugins: [],
}