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
          50: '#e1e8ef',
          100: '#c1ceda',
          200: '#94a7bb',
          300: '#6f89a1',
          400: '#547592',
          500: '#3f6080',
          600: '#32506e',
          700: '#27405a',
          800: '#1b2f44',
          900: '#111e2d',
        },
        surface: {
          50: '#1e3148',
          100: '#182841',
          200: '#111e2d',
        },
        // Redirected to blue tones for backward compatibility
        magenta: {
          300: '#94a7bb',
          400: '#6f89a1',
          500: '#547592',
          600: '#3f6080',
        },
        neon: {
          300: '#94a7bb',
          400: '#6f89a1',
          500: '#547592',
          600: '#3f6080',
          700: '#27405a',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 2px 12px rgba(17, 30, 45, 0.4)',
        'glow-cyan-lg': '0 4px 20px rgba(17, 30, 45, 0.5)',
        'glow-magenta': '0 2px 12px rgba(17, 30, 45, 0.4)',
        'glow-neon': '0 2px 12px rgba(17, 30, 45, 0.4)',
        'glass': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.18)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(135deg, #3f6080, #27405a)',
        'magenta-gradient': 'linear-gradient(135deg, #3f6080, #32506e)',
        'void-gradient': 'linear-gradient(180deg, #1b2f44 0%, #111e2d 100%)',
      },
    },
  },
  plugins: [],
}
