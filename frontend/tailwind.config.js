/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deepfake-blue': {
          50: '#eef8ff',
          100: '#d8eeff',
          200: '#b3ddff',
          300: '#7cc8ff',
          400: '#3aadff',
          500: '#0a92ff',
          600: '#0070e0',
          700: '#0057b3',
          800: '#00448a',
          900: '#003366',
        },
        'deepfake-purple': {
          50: '#f0f1ff',
          100: '#e2e3ff',
          200: '#c5c7ff',
          300: '#a0a2ff',
          400: '#7a7cff',
          500: '#5f60ff',
          600: '#4a4bff',
          700: '#393ac5',
          800: '#2c2d99',
          900: '#212270',
        }
      }
    },
  },
  plugins: [],
}