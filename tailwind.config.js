/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb', dark: '#1e40af', light: '#3b82f6' },
        surface: '#0f172a',
        card: '#1e293b',
      },
    },
  },
  plugins: [],
}
