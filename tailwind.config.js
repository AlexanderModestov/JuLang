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
        // Deep dark backgrounds
        surface: {
          900: '#060a14',
          800: '#0a0e1a',
          700: '#0f1525',
          600: '#151c30',
          500: '#1a2340',
          400: '#222d4a',
        },
        // Electric cyan primary
        primary: {
          50: '#e0feff',
          100: '#b3fdff',
          200: '#80fbff',
          300: '#4df9ff',
          400: '#1af5ff',
          500: '#00f0ff',
          600: '#00c8d9',
          700: '#009fb3',
          800: '#00778c',
          900: '#004e66',
        },
        // Neon magenta accent
        accent: {
          50: '#ffe0fb',
          100: '#ffb3f5',
          200: '#ff80ee',
          300: '#ff4de8',
          400: '#ff1ae1',
          500: '#ff00e5',
          600: '#d900bf',
          700: '#b30099',
          800: '#8c0073',
          900: '#66004d',
        },
        // Neon purple
        neon: {
          50: '#f0e0ff',
          100: '#d9b3ff',
          200: '#c280ff',
          300: '#ab4dff',
          400: '#b347ff',
          500: '#9333ea',
          600: '#7c2bd4',
          700: '#6522be',
          800: '#4e1aa8',
          900: '#371192',
        },
        // Success neon green
        success: {
          400: '#4dffaa',
          500: '#00ff88',
          600: '#00d970',
        },
        // Warning neon amber
        warning: {
          400: '#ffc44d',
          500: '#ffaa00',
          600: '#d99100',
        },
        // Danger neon red
        danger: {
          400: '#ff6688',
          500: '#ff3366',
          600: '#d92955',
        },
        // Glass surfaces
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.08)',
          heavy: 'rgba(255, 255, 255, 0.12)',
        },
      },
      fontFamily: {
        sans: ['"Exo 2"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.3), 0 0 60px rgba(0, 240, 255, 0.1)',
        'glow-magenta': '0 0 20px rgba(255, 0, 229, 0.3), 0 0 60px rgba(255, 0, 229, 0.1)',
        'glow-purple': '0 0 20px rgba(179, 71, 255, 0.3), 0 0 60px rgba(179, 71, 255, 0.1)',
        'glow-cyan-sm': '0 0 10px rgba(0, 240, 255, 0.2)',
        'glow-magenta-sm': '0 0 10px rgba(255, 0, 229, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(ellipse at 20% 50%, rgba(0, 240, 255, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(179, 71, 255, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(255, 0, 229, 0.06) 0%, transparent 50%)',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
