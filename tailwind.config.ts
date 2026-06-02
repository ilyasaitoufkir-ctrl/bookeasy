import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          25:  '#fefaf8',
          50:  '#fdf6f0',
          100: '#faeee6',
          200: '#f5ddd1',
          300: '#e8c4b4',
          400: '#d9a899',
          500: '#c9a99a',
          600: '#b8887a',
          700: '#a06b5e',
          800: '#8b6f6f',
          900: '#6b4f4f',
          950: '#3d2b2b',
        },
        cream: {
          50:  '#fdfaf6',
          100: '#fdf6f0',
          200: '#fdf0eb',
          300: '#f5e6e0',
          400: '#ead8cf',
        },
        mauve: {
          100: '#ede0de',
          200: '#d9bfbc',
          300: '#c4a09c',
          400: '#b08480',
          500: '#8b6f6f',
          600: '#7a5f5f',
          700: '#634f4f',
          800: '#503f3f',
          900: '#3d2b2b',
        },
      },
      fontFamily: {
        sans:  ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        rose:       '0 4px 24px rgba(201,169,154,0.18), 0 1px 4px rgba(201,169,154,0.12)',
        'rose-lg':  '0 8px 40px rgba(201,169,154,0.24), 0 2px 8px rgba(201,169,154,0.14)',
        'rose-xl':  '0 20px 60px rgba(201,169,154,0.30)',
        card:       '0 2px 16px rgba(61,43,43,0.06), 0 0 1px rgba(61,43,43,0.04)',
        'card-hover': '0 8px 32px rgba(61,43,43,0.10), 0 0 1px rgba(61,43,43,0.06)',
        glass:      '0 8px 32px rgba(201,169,154,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'beauty-gradient':    'linear-gradient(135deg, #f5e6e0 0%, #fdf0eb 50%, #fdf6f0 100%)',
        'hero-gradient':      'linear-gradient(160deg, #e8c4b4 0%, #f5ddd1 30%, #fdf0eb 70%, #faeee6 100%)',
        'rose-gradient':      'linear-gradient(135deg, #c9a99a 0%, #b8887a 100%)',
        'subtle-gradient':    'linear-gradient(180deg, #fdf6f0 0%, #ffffff 100%)',
        'card-gradient':      'linear-gradient(145deg, #ffffff 0%, #fdf9f6 100%)',
        'glass-gradient':     'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(253,246,240,0.6) 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        full:  '9999px',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease-out',
        'fade-in':   'fadeIn 0.3s ease-out',
        'scale-in':  'scaleIn 0.3s ease-out',
        float:       'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn:  { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
