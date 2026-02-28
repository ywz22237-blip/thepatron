import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'THE PATRON — 스타트업 포털', template: '%s | THE PATRON 스타트업' },
  description: '더페트론 검증 스타트업 전용 딜 등재 포털. VC 검증 후 패트론 투자자와 연결됩니다.',
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
