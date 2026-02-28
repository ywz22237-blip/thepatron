import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { MobileHeader } from '@/components/layout/mobile-header'
import { ChannelTalk } from '@/components/support/channel-talk'

// 대시보드 레이아웃 — ACTIVE 구독자만 접근
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 투자자 프로필 (채널톡 + 알림 + 사이드바 사용자 식별용)
  const { data: investor } = await supabase
    .from('InvestorProfile')
    .select('id, name, email')
    .eq('userId', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] md:flex-row">
      {/* 모바일 상단 헤더 (md 미만) */}
      <MobileHeader
        investorId={investor?.id}
        investorName={investor?.name}
      />

      {/* PC/태블릿 사이드바 */}
      <Sidebar investorId={investor?.id} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</div>
      </main>

      {/* 모바일 하단 탭바 */}
      <MobileNav />

      {/* 채널톡 CS 위젯 */}
      {process.env.NEXT_PUBLIC_CHANNEL_TALK_KEY && (
        <ChannelTalk
          pluginKey={process.env.NEXT_PUBLIC_CHANNEL_TALK_KEY}
          userId={investor?.id}
          userEmail={investor?.email ?? user.email}
          userName={investor?.name}
        />
      )}
    </div>
  )
}
