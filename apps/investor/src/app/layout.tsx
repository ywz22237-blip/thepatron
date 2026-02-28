import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    default: 'THE PATRON — 패트론 전용 플랫폼',
    template: '%s | THE PATRON',
  },
  description: '고소득 전문직 패트론을 위한 프라이빗 벤처투자 브릿지. Tax-to-Equity로 납부할 세금을 기업 지분으로 전환하세요.',
  keywords: ['벤처투자', '소득공제', '세금공제', '엔젤투자', '스타트업투자', '패트론'],
  authors: [{ name: '주식회사 벤처플랫폼' }],
  robots: 'noindex, nofollow', // 프라이빗 플랫폼
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: '#2F2F2F',
                border: '1px solid #404040',
                color: '#FFFFFF',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
