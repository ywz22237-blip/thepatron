import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Briefcase, Filter } from 'lucide-react'
import { DealCard } from '@/components/deals/deal-card'
import { DealsFilter } from '@/components/deals/deals-filter'

export const metadata = {
  title: '딜 목록',
}

interface SearchParams {
  category?: string
  stage?: string
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 투자자 프로필 확인 (ACTIVE인지)
  const { data: profile } = await supabase
    .from('InvestorProfile')
    .select('status')
    .eq('userId', user.id)
    .single()

  // 딜 조회 (ACTIVE만)
  let query = supabase
    .from('Deal')
    .select(
      'id, briefTitle, category, stage, targetAmount, minInvestment, maxInvestment, valuation, equity, status, viewCount, interestCount, createdAt, closedAt'
    )
    .eq('status', 'ACTIVE')
    .order('createdAt', { ascending: false })

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.stage) {
    query = query.eq('stage', searchParams.stage)
  }

  const { data: deals } = await query

  // 카테고리/스테이지 집계
  const { data: allDeals } = await supabase
    .from('Deal')
    .select('category, stage')
    .eq('status', 'ACTIVE')

  const categories = [...new Set((allDeals ?? []).map((d) => d.category))].filter(Boolean)
  const stages = [...new Set((allDeals ?? []).map((d) => d.stage))].filter(Boolean)

  const isActive = profile?.status === 'ACTIVE'

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">딜 목록</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">
          더페트론이 검증한 투자 딜을 확인하세요. 기업명은 NDA 체결 후 공개됩니다.
        </p>
      </div>

      {/* 구독 미활성 경고 */}
      {!isActive && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-400">
            <span className="font-semibold">구독 활성화 필요</span> — 딜 목록을 확인하려면
            구독이 활성화되어야 합니다.{' '}
            <a href="/profile" className="underline hover:text-amber-300">
              구독 관리
            </a>
          </p>
        </div>
      )}

      {/* 필터 */}
      <DealsFilter
        categories={categories}
        stages={stages}
        selectedCategory={searchParams.category}
        selectedStage={searchParams.stage}
      />

      {/* 딜 카드 그리드 */}
      {!deals || deals.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] text-[#555555]">
          <Briefcase size={36} className="opacity-40" />
          <p className="text-sm">
            {searchParams.category || searchParams.stage
              ? '해당 조건의 딜이 없습니다'
              : '등록된 딜이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}

      {/* 딜 수 */}
      {deals && deals.length > 0 && (
        <p className="text-right text-xs text-[#555555]">
          총 {deals.length}건의 활성 딜
        </p>
      )}
    </div>
  )
}
