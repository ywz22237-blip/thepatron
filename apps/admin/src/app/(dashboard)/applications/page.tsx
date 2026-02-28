import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'

export const metadata = { title: '멤버십 신청 심사' }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: '검토 대기', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  APPROVED: { label: '승인', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  REJECTED: { label: '거절', color: 'text-red-600 bg-red-50 border-red-200' },
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const statusFilter = searchParams.status || 'PENDING'

  const { data: applications } = await supabase
    .from('MembershipApplication')
    .select('*')
    .eq('status', statusFilter)
    .order('createdAt', { ascending: false })

  const { data: counts } = await supabase
    .from('MembershipApplication')
    .select('status')

  const statusCounts = (counts ?? []).reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">멤버십 신청 심사</h1>
        <p className="mt-1 text-sm text-[#64748B]">패트론 입장 신청을 검토하고 승인/거절하세요</p>
      </div>

      {/* 탭 필터 */}
      <div className="flex gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <Link
            key={status}
            href={`/applications?status=${status}`}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all ${
              statusFilter === status
                ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white'
                : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#1B3A6B]/30'
            }`}
          >
            {STATUS_CONFIG[status].label}
            {statusCounts[status] > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  statusFilter === status
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {statusCounts[status]}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* 신청 목록 */}
      {!applications || applications.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-[#94A3B8]">
          <Users size={28} className="opacity-40" />
          <p className="text-sm">{STATUS_CONFIG[statusFilter].label} 신청이 없습니다</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          <table className="w-full">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  신청자
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  직군
                </th>
                <th className="hidden px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#94A3B8] lg:table-cell">
                  예상 절세액
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  신청일
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  상태
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0F172A]">{app.name}</p>
                    <p className="text-xs text-[#94A3B8]">{app.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#64748B]">{app.profession}</span>
                  </td>
                  <td className="hidden px-6 py-4 text-right lg:table-cell">
                    {app.simulatedTaxSaving ? (
                      <span className="text-sm font-semibold text-[#1B3A6B]">
                        {app.simulatedTaxSaving.toLocaleString()}만원
                      </span>
                    ) : (
                      <span className="text-sm text-[#CBD5E1]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#64748B]">
                      {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_CONFIG[app.status].color
                      }`}
                    >
                      {STATUS_CONFIG[app.status].label}
                    </span>
                  </td>
                  <td className="pr-4">
                    <Link
                      href={`/applications/${app.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#1B3A6B]"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
