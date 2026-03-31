/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Primary: Emerald green (growth, trust) ──
        primary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // ── Secondary: Cyan (kept for compatibility) ──
        secondary: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // ── Semantic ──
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // ── Gray: Deep navy dark mode ──
        gray: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f1524',  // dark navy card bg
          950: '#080c16',  // darkest navy page bg
        },
        // ── Hero: Dark navy for landing sections ──
        hero: {
          DEFAULT: '#080c16',
          card:    '#0f1524',
          muted:   '#8194a8',
        },
      },
      fontFamily: {
        sans:   ['Inter', 'Cairo', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
      },
      lineHeight: {
        relaxed: '1.75',
        arabic:  '1.9',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        card:       '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover':'0 4px 12px 0 rgb(0 0 0 / 0.08), 0 1px 3px -1px rgb(0 0 0 / 0.06)',
        glow:       '0 0 40px hsla(160, 84%, 39%, 0.18)',
        'glow-lg':  '0 0 60px hsla(160, 84%, 39%, 0.28)',
        'shadow-md':'0 4px 16px hsla(222, 47%, 11%, 0.08)',
        'shadow-lg':'0 8px 32px hsla(222, 47%, 11%, 0.12)',
      },
      animation: {
        'fade-in':       'fadeIn 0.2s ease-out',
        'fade-in-slow':  'fadeIn 0.6s ease-out forwards',
        'fade-in-left':  'fadeInLeft 0.6s ease-out forwards',
        'fade-in-right': 'fadeInRight 0.6s ease-out forwards',
        'scale-in':      'scaleIn 0.4s ease-out forwards',
        'slide-up':      'slideUp 0.5s ease-out forwards',
        shimmer:         'shimmer 2s linear infinite',
        float:           'float 6s ease-in-out infinite',
        'pulse-slow':    'pulseSlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
      },
    }
  },
  plugins: []
}
