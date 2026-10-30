import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        botanical: {
          50: '#F6F8F5',
          100: '#EBF0E8',
          200: '#D4E0CE',
          500: '#2E5A44',
          600: '#234735',
          700: '#1B3B2B',
          800: '#132A1F',
          900: '#0C1C14',
        },
        sandal: {
          50: '#FCFBF7',
          100: '#F7F3E8',
          200: '#EFE6D1',
          300: '#E2D2B0',
          500: '#C89D54',
          600: '#B0843B',
          700: '#8E6728',
        },
        terracotta: {
          500: '#B85D3B',
          600: '#9E4B2C',
        },
      },
    },
  },
  plugins: [],
};

export default config;
