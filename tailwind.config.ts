import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050507',
        panel: '#111216',
        panelAlt: '#171820',
        neon: '#F29F43',
        neonDim: '#D9A34A',
        ember: '#F6BF6C',
        fire: '#F06B43',
        text: '#F6F0E6',
        muted: '#A09488',
        frozen: '#6C7C92'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(242,159,67,0.35), 0 0 30px rgba(242,159,67,0.12)'
      }
    }
  },
  plugins: []
};

export default config;
