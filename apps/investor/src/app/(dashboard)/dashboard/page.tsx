import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, TrendingUp, GitMerge, Briefcase, CreditCard, AlertTriangle } from 'lucide-react'

const MATCH_STATUS_KO: Record<string, string> = {
  REQUESTED: '신청 접수',
  REVIEWING: '검토 중',
  DELIVERED: '기업 전달',
  MEETING: '미팅 조율',
  DEAL_ROOM: 'Deal Room',
  CONTRACT: '계약 진행',
  COMPLETED: '투자 완료',
}

const MATCH_STATUS_COLOR: Record<string, string> = {
  REQUESTED: 'bg-blue-500/10 text-blue-400',
  REVIEWING: 'bg-amber-500/10 text-amber-400',
  DELIVERED: 'bg-purple-500/10 text-purple-400',
  MEETING: 'bg-orange-500/10 text-orange-400',
  DEAL_ROOM: 'bg-cyan-500/10 text-cyan-400',
  CONTRACT: 'bg-emerald-500/10 text-emerald-400',
  COMPLETED: 'bg-[#C9A84C]/10 text-[#C9A84C]',
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 투자자 프로필
  const { data: investor } = await supabase
    .from('InvestorProfile')
    .select('id, name, status')
    .eq('userId', user.id)
    .single()

  // 매칭 현황 (진행 중)
  const { data: matches } = investor
    ? await supabase
        .from('MatchRequest')
        .select('id, status, investmentAmount, deal:Deal(briefTitle, category)')
        .eq('investorId', investor.id)
        .not('status', 'eq', 'COMPLETED')
        .order('updatedAt', { ascending: false })
        .limit(5)
    : { data: [] }

  // 활성 구독 확인
  const { data: subscription } = investor
    ? await supabase
        .from('Subscription')
        .select('status, nextBillingAt')
        .eq('investorId', investor.id)
        .eq('status', 'ACTIVE')
        .single()
    : { data: null }

  // 최신 딜 (ACTIVE)
  const { data: recentDeals } = await supabase
    .from('Deal')
    .select('id, briefTitle, category, stage, targetAmount, minInvestment')
    .eq('status', 'ACTIVE')
    .order('createdAt', { ascending: false })
    .limit(3)

  const activeMatchCount = matches?.length ?? 0

  return (
    <div className="space-y-8 p-6 md:p-10">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          안녕하세요, {investor?.name ?? '패트론'}님
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">오늘도 THE PATRON과 함께하세요</p>
      </div>

      {/* 구독 미납 경고 */}
      {!subscription && investor && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-400">구독이 활성화되지 않았습니다</p>
            <p className="mt-0.5 text-xs text-amber-400/70">
              카드를 등록하고 월 구독을 시작하면 모든 딜에 접근할 수 있습니다.
            </p>
          </div>
          <Link
            href="/billing"
            className="ml-auto shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-300"
          >
            구독 시작
          </Link>
        </div>
      )}

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<GitMerge size={18} className="text-[#C9A84C]" />}
          label="진행 중 매칭"
          value={`${activeMatchCount}건`}
          href="/matches"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-emerald-400" />}
          label="열람한 딜"
          value={`${recentDeals?.length ?? 0}건+`}
          href="/deals"
        />
        <StatCard
          icon={<Briefcase size={18} className="text-purple-400" />}
          label="활성 딜"
          value={`${recentDeals?.length ?? 0}건`}
          href="/deals"
        />
        <StatCard
          icon={<CreditCard size={18} className="text-blue-400" />}
          label="구독 상태"
          value={subscription ? 'ACTIVE' : '미구독'}
          href="/billing"
          valueColor={subscription ? 'text-emerald-400' : 'text-amber-400'}
        />
      </div>

      {/* 진행 중 매칭 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">진행 중 매칭</h2>
          <Link href="/matches" className="flex items-center gap-1 text-sm text-[#C9A84C] hover:underline">
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>

        {!matches || matches.length === 0 ? (
          <div className="flex h-28 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#141414] text-sm text-[#6B7280]">
            진행 중인 매칭이 없습니다 &mdash;{' '}
            <Link href="/deals" className="ml-1 text-[#C9A84C] hover:underline">딜 둘러보기</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => {
              const deal = Array.isArray(match.deal) ? match.deal[0] : match.deal
              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between rounded-xl border border-[#2A2A2A] bg-[#141414] px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{deal?.briefTitle ?? '-'}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      {deal?.category} · {match.investmentAmount.toLocaleString()}만원
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${MATCH_STATUS_COLOR[match.status] ?? ''}`}>
                    {MATCH_STATUS_KO[match.status] ?? match.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 최신 딜 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">최신 딜</h2>
          <Link href="/deals" className="flex items-center gap-1 text-sm text-[#C9A84C] hover:underline">
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>

        {!recentDeals || recentDeals.length === 0 ? (
          <div className="flex h-28 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#141414] text-sm text-[#6B7280]">
            등록된 딜이 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {recentDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="group rounded-xl border border-[#2A2A2A] bg-[#141414] p-5 transition-all hover:border-[#C9A84C]/30 hover:shadow-[0_4px_20px_rgba(201,168,76,0.08)]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full border border-[#3A3A3A] px-2 py-0.5 text-[10px] text-[#9CA3AF]">
                    {deal.category}
                  </span>
                  <span className="rounded-full border border-[#3A3A3A] px-2 py-0.5 text-[10px] text-[#9CA3AF]">
                    {deal.stage}
                  </span>
                </div>
                <p className="mb-3 text-sm font-semibold text-white line-clamp-2 group-hover:text-[#C9A84C]">
                  {deal.briefTitle}
                </p>
                <p className="text-xs text-[#6B7280]">
                  최소 {deal.minInvestment.toLocaleString()}만원
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  href,
  valueColor = 'text-white',
}: {
  icon: React.ReactNode
  label: string
  value: string
  href: string
  valueColor?: string
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-5 transition-all hover:border-[#3A3A3A]"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E1E1E]">
        {icon}
      </div>
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueColor}`}>{value}</p>
    </Link>
  )
}
