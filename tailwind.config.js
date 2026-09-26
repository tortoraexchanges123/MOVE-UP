/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          400: '#4da3ff',
          500: '#2f8cff',
          600: '#1f6fe0',
          700: '#1857b3',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(47,140,255,0.35)',
      },
    },
  },
  plugins: [],
}
