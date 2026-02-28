import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── THE PATRON 관리자 패널 — 클린 네이비 테마 ────────────────────────
      colors: {
        background: { DEFAULT: '#FFFFFF', secondary: '#F8FAFC' },
        sidebar: { DEFAULT: '#1B3A6B', hover: '#2B5099', active: '#FFFFFF1A' },
        navy: { DEFAULT: '#1B3A6B', light: '#2B5099', dark: '#132C52' },
        foreground: { DEFAULT: '#0F172A', muted: '#64748B', subtle: '#94A3B8' },
        card: { DEFAULT: '#FFFFFF', border: '#E2E8F0' },
        primary: { DEFAULT: '#1B3A6B', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#F1F5F9', foreground: '#1B3A6B' },
        muted: { DEFAULT: '#F8FAFC', foreground: '#64748B' },
        accent: { DEFAULT: '#1B3A6B1A', foreground: '#1B3A6B' },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#1B3A6B',
        success: '#10B981',
        warning: '#F59E0B',
        destructive: '#EF4444',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: { lg: '0.75rem', md: '0.5rem', sm: '0.375rem' },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
