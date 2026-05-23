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
          50: '#F6F7F9',
          100: '#ECEEF2',
          200: '#D6DAE2',
          300: '#B2B9C7',
          400: '#7C8497',
          500: '#525B70',
          600: '#3B4356',
          700: '#2C3344',
          800: '#1C2233',
          900: '#0B1220',
          950: '#050810',
        },
        gold: {
          50: '#FBF6EC',
          100: '#F6ECD5',
          200: '#ECD8A8',
          300: '#E0BF74',
          400: '#D4A45A',
          500: '#B98842',
          600: '#946A32',
          700: '#704F27',
          800: '#4B361B',
          900: '#2A1E10',
        },
        canvas: '#FAFAF7',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11,18,32,0.04), 0 4px 16px rgba(11,18,32,0.06)',
        lift: '0 8px 24px rgba(11,18,32,0.08), 0 2px 4px rgba(11,18,32,0.04)',
        glow: '0 0 0 1px rgba(212,164,90,0.4), 0 8px 24px rgba(212,164,90,0.15)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, rgba(11,18,32,0.85) 0%, rgba(28,34,51,0.7) 50%, rgba(11,18,32,0.85) 100%)',
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
        'blob-1': 'blob-1 22s ease-in-out infinite',
        'blob-2': 'blob-2 26s ease-in-out infinite',
        'blob-3': 'blob-3 30s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
