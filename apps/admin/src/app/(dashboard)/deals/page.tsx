import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, ChevronRight, Eye } from 'lucide-react'

export const metadata = { title: '딜 관리' }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '심사 대기', color: 'text-[#64748B] bg-[#F1F5F9] border-[#E2E8F0]' },
  REVIEWING: { label: '심사 중', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ACTIVE: { label: '활성', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  CLOSED: { label: '마감', color: 'text-[#94A3B8] bg-[#F8FAFC] border-[#E2E8F0]' },
  REJECTED: { label: '거절', color: 'text-red-600 bg-red-50 border-red-200' },
}

function formatAmount(amount: number): string {
  if (amount >= 10000) return `${Math.floor(amount / 10000)}억원`
  return `${amount.toLocaleString()}만원`
}

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const statusFilter = searchParams.status || 'DRAFT'

  const { data: deals } = await supabase
    .from('Deal')
    .select(`
      id, briefTitle, category, stage, status, targetAmount, minInvestment,
      viewCount, interestCount, feePaid, createdAt,
      company:CompanyProfile(id, name, email)
    `)
    .eq('status', statusFilter)
    .order('createdAt', { ascending: false })

  const { data: allDeals } = await supabase.from('Deal').select('status')
  const statusCounts = (allDeals ?? []).reduce(
    (acc, d) => { acc[d.status] = (acc[d.status] ?? 0) + 1; return acc },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">딜 관리</h1>
        <p className="mt-1 text-sm text-[#64748B]">기업이 등재 신청한 딜을 심사하고 관리하세요</p>
      </div>

      {/* 탭 */}
      <div className="flex flex-wrap gap-2">
        {(['DRAFT', 'REVIEWING', 'ACTIVE', 'CLOSED', 'REJECTED'] as const).map((status) => (
          <Link
            key={status}
            href={`/deals?status=${status}`}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
              statusFilter === status
                ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white'
                : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#1B3A6B]/30'
            }`}
          >
            {STATUS_CONFIG[status].label}
            {(statusCounts[status] ?? 0) > 0 && (
              <span className={`rounded-full px-1.5 text-xs font-bold ${
                statusFilter === status ? 'bg-white/20' : 'bg-[#F1F5F9]'
              }`}>
                {statusCounts[status]}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* 딜 테이블 */}
      {!deals || deals.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-[#94A3B8]">
          <Briefcase size={28} className="opacity-40" />
          <p className="text-sm">{STATUS_CONFIG[statusFilter].label} 딜이 없습니다</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          <table className="w-full">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">딜</th>
                <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94A3B8] lg:table-cell">기업</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">목표금액</th>
                <th className="hidden px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#94A3B8] sm:table-cell">조회</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">상태</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {deals.map((deal) => {
                const company = deal.company as { id: string; name: string; email: string } | null
                return (
                  <tr key={deal.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#0F172A]">{deal.briefTitle}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {deal.stage} · {deal.category} · {new Date(deal.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </td>
                    <td className="hidden px-6 py-4 lg:table-cell">
                      <p className="text-sm text-[#0F172A]">{company?.name ?? '-'}</p>
                      <p className="text-xs text-[#94A3B8]">{company?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-[#0F172A]">
                        {formatAmount(deal.targetAmount)}
                      </span>
                    </td>
                    <td className="hidden px-6 py-4 text-center sm:table-cell">
                      <span className="flex items-center justify-center gap-1 text-sm text-[#64748B]">
                        <Eye size={12} /> {deal.viewCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CONFIG[deal.status].color}`}>
                        {STATUS_CONFIG[deal.status].label}
                      </span>
                    </td>
                    <td className="pr-4">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#1B3A6B]"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
