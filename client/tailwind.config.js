/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F7',
          100: '#F8E8EE',
          200: '#F2D1DD',
          300: '#E8B4C8',
          400: '#D4A5A5',
          500: '#C48B8B',
          600: '#A66B6B',
          700: '#8B5050',
          800: '#6B3A3A',
          900: '#4A2828',
        },
        accent: '#D4A5A5',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
