/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Rolig, autoritativ blå – norsk offentlig/juridisk uttrykk
        primary: {
          50: '#eef4fb',
          100: '#d8e6f5',
          200: '#b3cded',
          300: '#84ade0',
          400: '#5388cf',
          500: '#2e6bbb',
          600: '#1e4d86',
          700: '#1a3d68',
          800: '#152f4d',
          900: '#0f2136',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
