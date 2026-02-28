import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, GitMerge, AlertCircle, PlusCircle } from 'lucide-react'

export const metadata = { title: '대시보드' }

const DEAL_STATUS_LABELS: Record<string, string> = {
  DRAFT: '심사 대기',
  REVIEWING: '심사 중',
  ACTIVE: '활성',
  CLOSED: '마감',
  REJECTED: '거절',
}

const DEAL_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'text-[#64748B] bg-[#F1F5F9]',
  REVIEWING: 'text-amber-600 bg-amber-50',
  ACTIVE: 'text-emerald-600 bg-emerald-50',
  CLOSED: 'text-[#94A3B8] bg-[#F8FAFC]',
  REJECTED: 'text-red-600 bg-red-50',
}

export default async function CompanyDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('CompanyProfile')
    .select('id, name')
    .eq('userId', user.id)
    .single()

  const { data: deals } = profile
    ? await supabase
        .from('Deal')
        .select('id, briefTitle, category, stage, status, viewCount, interestCount, createdAt, feePaid')
        .eq('companyId', profile.id)
        .order('createdAt', { ascending: false })
    : { data: null }

  // 매칭 신청 수 집계
  const activeDealIds = (deals ?? []).filter((d) => d.status === 'ACTIVE').map((d) => d.id)
  const { data: matchCounts } = activeDealIds.length
    ? await supabase
        .from('MatchRequest')
        .select('dealId, status')
        .in('dealId', activeDealIds)
    : { data: null }

  const totalMatches = matchCounts?.length ?? 0
  const activeDeals = (deals ?? []).filter((d) => d.status === 'ACTIVE').length
  const pendingDeals = (deals ?? []).filter((d) => ['DRAFT', 'REVIEWING'].includes(d.status)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">대시보드</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {profile ? `${profile.name} 운영 현황` : '기업 운영 현황'}
          </p>
        </div>
        <Link
          href="/apply"
          className="flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2B5099]"
        >
          <PlusCircle size={16} />
          딜 등재 신청
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={<Briefcase size={20} className="text-[#1B3A6B]" />}
          label="활성 딜"
          value={`${activeDeals}건`}
          sub="플랫폼 노출 중"
          color="blue"
        />
        <KpiCard
          icon={<GitMerge size={20} className="text-emerald-600" />}
          label="매칭 신청"
          value={`${totalMatches}건`}
          sub="패트론 투자 관심"
          color="green"
        />
        <KpiCard
          icon={<AlertCircle size={20} className="text-amber-500" />}
          label="심사 중"
          value={`${pendingDeals}건`}
          sub="검토 대기 딜"
          color="amber"
        />
      </div>

      {/* 딜 목록 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h2 className="font-semibold text-[#0F172A]">등재 딜 현황</h2>
          <Link href="/deals" className="text-sm text-[#1B3A6B] hover:underline">
            전체 보기
          </Link>
        </div>

        {!deals || deals.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-[#94A3B8]">
            <Briefcase size={28} className="opacity-40" />
            <p className="text-sm">등재된 딜이 없습니다</p>
            <Link href="/apply" className="text-sm text-[#1B3A6B] hover:underline">
              딜 등재 신청하기
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {deals.slice(0, 5).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-[#0F172A]">{deal.briefTitle}</p>
                  <p className="mt-0.5 text-xs text-[#94A3B8]">
                    {deal.stage} · {deal.category} ·{' '}
                    {new Date(deal.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!deal.feePaid && deal.status !== 'DRAFT' && (
                    <span className="text-xs text-amber-500">중계료 미납</span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      DEAL_STATUS_COLORS[deal.status]
                    }`}
                  >
                    {DEAL_STATUS_LABELS[deal.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 안내 박스 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
        <h3 className="mb-3 font-semibold text-[#1B3A6B]">투자자 정보 보호 안내</h3>
        <div className="space-y-1.5 text-sm text-[#64748B]">
          <p>• 패트론 투자자 신원은 절대 공개되지 않습니다</p>
          <p>• NDA 체결 후 미팅 시 기업명과 연락처가 투자자에게 공개됩니다</p>
          <p>• 더페트론 매니저가 투자자와 스타트업 사이를 중개합니다</p>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  color: 'blue' | 'green' | 'amber'
}) {
  const bgMap = { blue: 'bg-[#1B3A6B]/5', green: 'bg-emerald-50', amber: 'bg-amber-50' }
  return (
    <div className={`rounded-xl border border-[#E2E8F0] bg-white p-5`}>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${bgMap[color]}`}>
        {icon}
      </div>
      <p className="text-sm text-[#64748B]">{label}</p>
      <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
      <p className="mt-0.5 text-xs text-[#94A3B8]">{sub}</p>
    </div>
  )
}
