/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#2E7D5B',
          50: '#F0F7F3',
          100: '#DFEFE5',
          200: '#C0DDCB',
          300: '#97C4A9',
          400: '#62A183',
          500: '#2E7D5B',
          600: '#206D4D',
          700: '#17543C',
          800: '#12422F',
          900: '#0D3526',
        },
        sky: {
          DEFAULT: '#3D736D',
          50: '#EDF4F2',
          100: '#DBE9E6',
          200: '#B7D1CD',
          300: '#8DB3AE',
          400: '#5C8F89',
          500: '#3D736D',
          600: '#2E5C57',
          700: '#274A46',
          800: '#223F3C',
          900: '#1C3431',
        },
        amber: {
          DEFAULT: '#FBBF24',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        slate: {
          50: '#FAF8F4',
          100: '#F3EFE7',
          200: '#E6DFD3',
          300: '#CFC5B4',
          400: '#A79B89',
          500: '#7E7365',
          600: '#645A4E',
          700: '#4E463D',
          800: '#39322C',
          900: '#242019',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(36, 32, 25, 0.06)',
        'card-hover': '0 12px 48px rgba(46, 125, 91, 0.12)',
        glow: '0 8px 40px rgba(46, 125, 91, 0.10)',
        'glow-lg': '0 20px 60px rgba(46, 125, 91, 0.16)',
        chat: '0 24px 80px rgba(36, 32, 25, 0.18)',
      },
      fontSize: {
        'display': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
    },
  },
  plugins: [],
}