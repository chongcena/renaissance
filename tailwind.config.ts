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
        bg: '#05070D',
        panel: '#0B0F1A',
        panelAlt: '#0D1322',
        neon: '#7CFFB2',
        neonDim: '#43C280',
        ember: '#FF9E5E',
        fire: '#FF5C7A',
        text: '#E6F1FF',
        muted: '#7F8DA3'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,255,178,0.3), 0 0 30px rgba(124,255,178,0.08)'
      }
    }
  },
  plugins: []
};

export default config;
