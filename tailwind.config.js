/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#4262FF', hover: '#3451E3' },
        canvas: { bg: '#F4F4F4' },
        dashboard: {
          dark: '#1e1e20',    // affine-like dark gray
          darker: '#141415',  // almost black
          card: '#2a2a2b',    // slightly lighter for cards
          border: '#3c3c3e'   // border in dark mode
        }
      },
      boxShadow: {
        'floating': '0px 8px 24px rgba(0, 0, 0, 0.08), 0px 2px 8px rgba(0, 0, 0, 0.04)',
        'panel': '0px 4px 12px rgba(0, 0, 0, 0.05), 0px 1px 4px rgba(0, 0, 0, 0.02)',
        'crisp': '0px 1px 2px rgba(0, 0, 0, 0.05), 0px 4px 12px rgba(0, 0, 0, 0.05)',
      }
    }
  },
  plugins: []
}
