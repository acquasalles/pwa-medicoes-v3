/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#203B8C',
          light: '#0487D9',
        },
        secondary: '#049DD9',
        accent: '#B6F2EC',
        dark: '#0D0D0D',
      }
    },
  },
  plugins: [],
};
