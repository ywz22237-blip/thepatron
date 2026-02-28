import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Eye, GitMerge, PlusCircle } from 'lucide-react'

export const metadata = { title: '딜 현황' }

const DEAL_STATUS_LABELS: Record<string, string> = {
  DRAFT: '심사 대기',
  REVIEWING: '심사 중',
  ACTIVE: '활성',
  CLOSED: '마감',
  REJECTED: '거절',
}

const DEAL_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'text-[#64748B] bg-[#F1F5F9] border-[#E2E8F0]',
  REVIEWING: 'text-amber-600 bg-amber-50 border-amber-200',
  ACTIVE: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  CLOSED: 'text-[#94A3B8] bg-[#F8FAFC] border-[#E2E8F0]',
  REJECTED: 'text-red-600 bg-red-50 border-red-200',
}

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000)
    return `${eok}억원`
  }
  return `${amount.toLocaleString()}만원`
}

export default async function CompanyDealsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('CompanyProfile')
    .select('id')
    .eq('userId', user.id)
    .single()

  const { data: deals } = profile
    ? await supabase
        .from('Deal')
        .select(`
          id, briefTitle, category, stage, status,
          targetAmount, minInvestment, viewCount, interestCount,
          feePaid, feeAmount, createdAt, closedAt,
          matchRequests:MatchRequest(id, status)
        `)
        .eq('companyId', profile.id)
        .order('createdAt', { ascending: false })
    : { data: null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">딜 현황</h1>
          <p className="mt-1 text-sm text-[#64748B]">등재 신청한 딜의 심사 및 매칭 현황</p>
        </div>
        <Link
          href="/apply"
          className="flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2B5099]"
        >
          <PlusCircle size={16} />
          새 딜 신청
        </Link>
      </div>

      {!deals || deals.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[#E2E8F0] bg-white text-[#94A3B8]">
          <Briefcase size={36} className="opacity-40" />
          <p className="text-sm">등재된 딜이 없습니다</p>
          <Link href="/apply" className="text-sm text-[#1B3A6B] hover:underline">
            딜 등재 신청하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => {
            const matchRequests = deal.matchRequests as { id: string; status: string }[] | null ?? []
            const activeMatches = matchRequests.filter(
              (m) => !['COMPLETED'].includes(m.status)
            ).length

            return (
              <div
                key={deal.id}
                className="rounded-xl border border-[#E2E8F0] bg-white p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">{deal.briefTitle}</h3>
                    <p className="mt-0.5 text-sm text-[#94A3B8]">
                      {deal.stage} · {deal.category} ·{' '}
                      {new Date(deal.createdAt).toLocaleDateString('ko-KR')} 신청
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      DEAL_STATUS_COLORS[deal.status]
                    }`}
                  >
                    {DEAL_STATUS_LABELS[deal.status]}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat
                    label="목표 투자금"
                    value={formatAmount(deal.targetAmount)}
                  />
                  <MiniStat
                    label="최소 투자금"
                    value={formatAmount(deal.minInvestment)}
                  />
                  <MiniStat
                    label="조회수"
                    value={`${deal.viewCount}회`}
                    icon={<Eye size={12} />}
                  />
                  <MiniStat
                    label="매칭 신청"
                    value={`${activeMatches}건`}
                    icon={<GitMerge size={12} />}
                    highlight={activeMatches > 0}
                  />
                </div>

                {/* 중계료 안내 */}
                {deal.status === 'ACTIVE' && !deal.feePaid && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
                    <p className="text-sm font-medium text-amber-700">
                      중계료 미납 — {formatAmount(deal.feeAmount)} 납부 후 매칭이 활성화됩니다
                    </p>
                    <p className="mt-0.5 text-xs text-amber-600">
                      납부 문의: 더페트론 매니저에게 연락해주세요
                    </p>
                  </div>
                )}

                {deal.status === 'REJECTED' && (
                  <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
                    <p className="text-sm text-red-600">
                      이번 심사에서 등재 기준을 충족하지 못했습니다. 자세한 사유는 이메일을 확인해주세요.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MiniStat({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="rounded-lg bg-[#F8FAFC] p-3">
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p
        className={`mt-0.5 flex items-center gap-1 text-sm font-semibold ${
          highlight ? 'text-[#1B3A6B]' : 'text-[#0F172A]'
        }`}
      >
        {icon}
        {value}
      </p>
    </div>
  )
}
