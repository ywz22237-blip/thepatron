import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">패트론 멤버십 현황과 최신 딜을 확인하세요</p>
      </div>

      {/* 통계 카드 — 2열 그리드 (PC), 1열 (모바일) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatCard label="활성 매칭" value="0건" sub="진행 중인 딜 매칭" />
        <StatCard label="총 관심 딜" value="0건" sub="관심 표시한 딜" />
      </div>

      {/* 최신 딜 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">최신 딜</h2>
          <a href="/deals" className="text-sm text-[#D4AF37] hover:underline">
            전체 보기
          </a>
        </div>
        {/* TODO: DealList 컴포넌트 */}
        <div className="flex h-48 items-center justify-center rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] text-[#666666]">
          <p className="text-sm">등록된 딜이 없습니다</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-5">
      <p className="mb-1 text-sm text-[#A0A0A0]">{label}</p>
      <p className="text-3xl font-bold text-[#D4AF37]">{value}</p>
      <p className="mt-1 text-xs text-[#666666]">{sub}</p>
    </div>
  )
}
