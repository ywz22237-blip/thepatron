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
      // ─── THE PATRON 투자자 앱 — 럭셔리 다크 테마 ─────────────────────────
      colors: {
        // 배경 계층
        background: {
          DEFAULT: '#0A0A0A',
          secondary: '#111111',
          tertiary: '#1A1A1A',
        },
        // 카드
        card: {
          DEFAULT: '#2F2F2F',
          hover: '#3A3A3A',
          border: '#404040',
        },
        // 골드 포인트
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8CC6A',
          dark: '#B8941F',
          muted: '#D4AF3733',
        },
        // 텍스트
        foreground: {
          DEFAULT: '#FFFFFF',
          muted: '#A0A0A0',
          subtle: '#666666',
        },
        // 상태
        success: '#22C55E',
        warning: '#F59E0B',
        destructive: '#EF4444',
        // shadcn 호환
        border: '#2F2F2F',
        input: '#2F2F2F',
        ring: '#D4AF37',
        primary: {
          DEFAULT: '#D4AF37',
          foreground: '#0A0A0A',
        },
        secondary: {
          DEFAULT: '#2F2F2F',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#1A1A1A',
          foreground: '#A0A0A0',
        },
        accent: {
          DEFAULT: '#D4AF3720',
          foreground: '#D4AF37',
        },
        popover: {
          DEFAULT: '#1A1A1A',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'gold-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s infinite',
        'gold-pulse': 'gold-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
