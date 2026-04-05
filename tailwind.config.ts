import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FAF7F5',
          secondary: '#F5F5F4',
          tertiary: '#E7E5E4',
        },
        text: {
          primary: '#1C1917',
          secondary: '#78716C',
        },
        accent: {
          primary: '#1C1917',
          warm: '#A67B5B',
          cool: '#E2E8F0',
          teal: '#0D9488',
          success: '#16a34a',
          warning: '#ca8a04',
          error: '#dc2626',
        },
        points: {
          gold: '#eab308',
        },
        streak: {
          fire: '#F97316',
        },
        brand: {
          50: '#FAF7F5',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 8px 24px -4px rgb(0 0 0 / 0.08)',
        'float': '0 12px 40px -8px rgb(0 0 0 / 0.12)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config
