/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        pearl: {
          50:  '#fdf8f0',
          100: '#f9edd8',
          200: '#f3d9b0',
          300: '#e9bc7e',
          400: '#dd9a4a',
          500: '#d4802a',
          600: '#c06620',
          700: '#9e4f1c',
          800: '#7f401d',
          900: '#69371b',
        },
        museum: {
          bg:      '#0d0a07',
          surface: '#1a1510',
          card:    '#221c14',
          border:  '#3a2e1e',
          muted:   '#8a7a62',
          text:    '#e8dcc8',
          accent:  '#d4802a',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
