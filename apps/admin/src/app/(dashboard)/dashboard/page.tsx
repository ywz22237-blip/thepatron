// 관리자 대시보드 — 운영 현황 실데이터
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const STATUS_KO: Record<string, string> = {
  REQUESTED: '신청 접수',
  REVIEWING: '검토 중',
  DELIVERED: '기업 전달',
  MEETING: '미팅',
  DEAL_ROOM: 'Deal Room',
  CONTRACT: '계약',
  COMPLETED: '완료',
}

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-blue-50 text-blue-600',
  REVIEWING: 'bg-amber-50 text-amber-600',
  DELIVERED: 'bg-purple-50 text-purple-600',
  MEETING: 'bg-orange-50 text-orange-600',
  DEAL_ROOM: 'bg-cyan-50 text-cyan-600',
  CONTRACT: 'bg-emerald-50 text-emerald-600',
  COMPLETED: 'bg-[#1B3A6B]/5 text-[#1B3A6B]',
}

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // 병렬 쿼리
  const [
    { count: patronCount },
    { count: pendingAppsCount },
    { count: activeDealsCount },
    { count: activeMatchCount },
    { data: recentApps },
    { data: recentMatches },
    { data: matchByStatus },
  ] = await Promise.all([
    supabase.from('InvestorProfile').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('MembershipApplication').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('Deal').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('MatchRequest').select('*', { count: 'exact', head: true }).not('status', 'in', '("COMPLETED")'),
    supabase
      .from('MembershipApplication')
      .select('id, name, email, profession, simulatedTaxSaving, status, createdAt')
      .order('createdAt', { ascending: false })
      .limit(6),
    supabase
      .from('MatchRequest')
      .select('id, status, investmentAmount, investor:InvestorProfile(name), deal:Deal(briefTitle)')
      .not('status', 'in', '("COMPLETED")')
      .order('updatedAt', { ascending: false })
      .limit(6),
    supabase
      .from('MatchRequest')
      .select('status')
      .not('status', 'eq', 'COMPLETED'),
  ])

  // 상태별 집계
  const statusCounts: Record<string, number> = {}
  matchByStatus?.forEach((m) => {
    statusCounts[m.status] = (statusCounts[m.status] ?? 0) + 1
  })

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">운영 대시보드</h1>
        <p className="mt-1 text-sm text-[#64748B]">더페트론 플랫폼 실시간 현황</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="전체 패트론" value={`${patronCount ?? 0}명`} sub="ACTIVE 구독자" color="navy" />
        <KpiCard label="검토 대기 신청" value={`${pendingAppsCount ?? 0}건`} sub="PENDING 신청서" color="warning" href="/applications" />
        <KpiCard label="활성 딜" value={`${activeDealsCount ?? 0}건`} sub="플랫폼 노출 중" color="navy" href="/deals" />
        <KpiCard label="진행 중 매칭" value={`${activeMatchCount ?? 0}건`} sub="완료 전 매칭" color="success" href="/matches" />
      </div>

      {/* 매칭 단계별 현황 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0F172A]">매칭 단계별 현황</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_KO).map(([status, label]) => (
            <div key={status} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${STATUS_COLORS[status]}`}>
              <span className="font-medium">{label}</span>
              <span className="font-bold">{statusCounts[status] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* 최근 멤버십 신청 */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#0F172A]">최근 멤버십 신청</h2>
            <Link href="/applications" className="flex items-center gap-1 text-sm text-[#1B3A6B] hover:underline">
              전체 보기 <ArrowRight size={13} />
            </Link>
          </div>
          {!recentApps || recentApps.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-[#94A3B8]">신청 내역이 없습니다</div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {recentApps.map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between py-3 hover:bg-[#F8FAFC] -mx-2 px-2 rounded"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{app.name}</p>
                    <p className="text-xs text-[#64748B]">{app.profession} · {app.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      app.status === 'PENDING' ? 'bg-amber-50 text-amber-600'
                      : app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-500'
                    }`}>
                      {app.status === 'PENDING' ? '검토 대기' : app.status === 'APPROVED' ? '승인' : '거절'}
                    </span>
                    {app.simulatedTaxSaving && (
                      <p className="mt-0.5 text-xs text-[#94A3B8]">절세 {app.simulatedTaxSaving.toLocaleString()}만원</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 최근 매칭 */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#0F172A]">진행 중 매칭</h2>
            <Link href="/matches" className="flex items-center gap-1 text-sm text-[#1B3A6B] hover:underline">
              칸반 보기 <ArrowRight size={13} />
            </Link>
          </div>
          {!recentMatches || recentMatches.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-[#94A3B8]">진행 중인 매칭이 없습니다</div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {recentMatches.map((match) => {
                const investor = Array.isArray(match.investor) ? match.investor[0] : match.investor
                const deal = Array.isArray(match.deal) ? match.deal[0] : match.deal
                return (
                  <div key={match.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-[#0F172A] line-clamp-1">{deal?.briefTitle ?? '-'}</p>
                      <p className="text-xs text-[#64748B]">{investor?.name} · {match.investmentAmount.toLocaleString()}만원</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[match.status] ?? ''}`}>
                      {STATUS_KO[match.status] ?? match.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  color,
  href,
}: {
  label: string
  value: string
  sub: string
  color: 'navy' | 'warning' | 'success'
  href?: string
}) {
  const colorMap = {
    navy: 'text-[#1B3A6B]',
    warning: 'text-[#F59E0B]',
    success: 'text-[#10B981]',
  }

  const inner = (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all hover:border-[#CBD5E1]">
      <p className="mb-1 text-sm text-[#64748B]">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="mt-1 text-xs text-[#94A3B8]">{sub}</p>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}
