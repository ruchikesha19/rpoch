/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { 
        sans: ["Inter", "sans-serif"] 
      },
      colors: {
        ocean: { 
          50: "#f5fbff", 
          100: "#e6f6ff", 
          300: "#91d8ff", 
          600: "#1588d6", 
          700: "#1372b3",
          800: "#15557d", 
          950: "#102f48" 
        },
        mint: { 
          100: "#e9fbf4", 
          500: "#22b887", 
          700: "#13765b" 
        },
        coral: "#ff7a59",
        honey: "#f4b740"
      },
      boxShadow: { 
        soft: "0 24px 70px rgba(21, 136, 214, 0.16)" 
      },
      animation: {
        rise: 'rise 0.6s ease-out',
        floatIn: 'float-in 0.8s ease-out'
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'float-in': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
