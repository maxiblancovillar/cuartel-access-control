/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        danger: '#dc2626',
        success: '#16a34a',
        warning: '#f59e0b',
        info: '#0ea5e9',
      },
    },
  },
  plugins: [],
};
