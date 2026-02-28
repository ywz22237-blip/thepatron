import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'THE PATRON — 관리자', template: '%s | THE PATRON 관리자' },
  description: '더페트론 관리자 패널 — PC 전용',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
