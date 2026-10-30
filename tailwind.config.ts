import type { Config } from 'tailwindcss';

// Theme colours come from CSS variables (set in src/lib/theme.ts) so the admin
// can switch palettes live. Values are "R G B" triplets to keep /opacity working.
const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const fromVar = (name: string) => Object.fromEntries(SHADES.map((s) => [s, `rgb(var(--${name}-${s}) / <alpha-value>)`]));

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
        botanical: fromVar('botanical'),
        sandal: fromVar('sandal'),
        emerald: fromVar('emerald'),
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
