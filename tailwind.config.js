/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FAF9FF',
          100: '#F3EFFF',
          200: '#EDE9FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        accent: {
          50: '#E8EDFF',
          100: '#D4DCFF',
          200: '#B0C0FF',
          300: '#8BA3FF',
          400: '#6B89FF',
          500: '#4C6FFF',
          600: '#3B5EEE',
          700: '#2A4DD6',
          800: '#1E3CB8',
          900: '#162D8A',
        },
        surface: {
          white: '#FAF9FF',
          light: '#F3EFFF',
          pure: '#FFFFFF',
        },
        text: {
          primary: '#1F2430',
          secondary: '#5B6178',
          tertiary: '#8E93A6',
        },
        border: {
          DEFAULT: '#E5E2F0',
          light: '#F0EDF8',
        },
        success: {
          light: '#ECFDF5',
          DEFAULT: '#22C55E',
        },
        warning: {
          light: '#FFFBEB',
          DEFAULT: '#F59E0B',
        },
        error: {
          light: '#FEF2F2',
          DEFAULT: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.06em' }],
        'sm': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'base': ['0.9375rem', { lineHeight: '1.55', letterSpacing: '-0.01em' }],
        'md': ['1rem', { lineHeight: '1.55', letterSpacing: '-0.01em' }],
        'lg': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'xl': ['1.3125rem', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
        '2xl': ['1.625rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '3xl': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        '4xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        '5xl': ['3.25rem', { lineHeight: '1.1', letterSpacing: '-0.035em' }],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(31, 36, 48, 0.04)',
        'sm': '0 1px 3px rgba(31, 36, 48, 0.06), 0 1px 2px rgba(31, 36, 48, 0.04)',
        'md': '0 4px 12px rgba(31, 36, 48, 0.06), 0 1px 4px rgba(31, 36, 48, 0.04)',
        'lg': '0 8px 24px rgba(31, 36, 48, 0.08), 0 2px 8px rgba(31, 36, 48, 0.04)',
        'xl': '0 16px 40px rgba(31, 36, 48, 0.10), 0 4px 12px rgba(31, 36, 48, 0.04)',
        'primary': '0 4px 14px rgba(139, 92, 246, 0.20)',
        'accent': '0 4px 14px rgba(76, 111, 255, 0.20)',
      },
      transitionDuration: {
        'fast': '120ms',
        'base': '200ms',
        'slow': '350ms',
      },
    },
  },
  plugins: [],
}
