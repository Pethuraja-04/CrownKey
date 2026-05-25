import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', md: '2rem', lg: '3rem' },
      screens: { '2xl': '1320px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        gold: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#18181b',
          500: '#27272a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        canvas: '#ffffff',
        luxury: {
          navy: '#0B1F3A',
          deep: '#163A70',
          gold: '#D4A574',
          bg: '#F8FAFC',
          text: '#0F172A',
          muted: '#64748B',
        },
      },
       boxShadow: {
        soft: '0 1px 2px rgba(24,24,27,0.04), 0 4px 16px rgba(24,24,27,0.06)',
        lift: '0 8px 24px rgba(24,24,27,0.08), 0 2px 4px rgba(24,24,27,0.04)',
        glow: '0 0 0 1px rgba(24,24,27,0.15), 0 8px 24px rgba(24,24,27,0.1)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, rgba(24,24,27,0.85) 0%, rgba(39,39,42,0.7) 50%, rgba(24,24,27,0.85) 100%)',
        'shimmer':
          'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // Slow, organic drift for ambient background blobs.
        'blob-1': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, 30px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 50px) scale(0.97)' },
        },
        'blob-2': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-50px, -30px) scale(1.04)' },
          '66%': { transform: 'translate(30px, -50px) scale(0.96)' },
        },
        'blob-3': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-40px, 40px) scale(1.08)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'blob-1': 'blob-1 22s ease-in-out infinite',
        'blob-2': 'blob-2 26s ease-in-out infinite',
        'blob-3': 'blob-3 30s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
