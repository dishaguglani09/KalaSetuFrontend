import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg:          '#07080F',
        'bg-raised': '#0C0E1A',
        'bg-float':  '#11142A',
        text:        '#EDE8DC',
        amber:       '#D4702A',
        gold:        '#B8902A',
        terracotta:  '#C45A2A',
        teal:        '#1A6A5A',
        indigo:      '#2A3A8C',
      },
    },
  },
  plugins: [],
};

export default config;
