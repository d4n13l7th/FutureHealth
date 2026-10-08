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
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        sky: {
          DEFAULT: '#0EA5E9',
          50: '#F0F9FF',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        amber: {
          DEFAULT: '#FBBF24',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        slate: {
          50: '#F8FAFC',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 12px 48px rgba(16, 185, 129, 0.12)',
        glow: '0 8px 40px rgba(16, 185, 129, 0.10)',
        'glow-lg': '0 20px 60px rgba(16, 185, 129, 0.16)',
        chat: '0 24px 80px rgba(15, 23, 42, 0.18)',
      },
      fontSize: {
        'display': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
    },
  },
  plugins: [],
}