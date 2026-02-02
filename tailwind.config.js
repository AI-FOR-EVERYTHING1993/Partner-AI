/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'success-100': '#49de50',
        'success-200': '#42c748',
        'destructive-100': '#f75353',
        'destructive-200': '#c44141',
        'primary-100': '#dddfff',
        'primary-200': '#cac5fe',
        'light-100': '#d6e0ff',
        'light-400': '#6870a6',
        'light-600': '#4f557d',
        'light-800': '#24273a',
        'dark-100': '#020408',
        'dark-200': '#27282f',
        'dark-300': '#242633',
      },
      fontFamily: {
        'mona-sans': ['Mona Sans', 'sans-serif'],
      },
      backgroundImage: {
        'pattern': "url('/pattern.png')",
      },
      borderRadius: {
        'lg': '0.625rem',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};