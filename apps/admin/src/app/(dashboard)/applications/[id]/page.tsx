import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ApplicationActions } from '@/components/applications/application-actions'

export const metadata = { title: '신청 상세' }

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: app } = await supabase
    .from('MembershipApplication')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!app) notFound()

  return (
    <div className="space-y-6">
      <Link
        href="/applications"
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]"
      >
        <ArrowLeft size={16} />
        신청 목록
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 왼쪽: 신청자 정보 */}
        <div className="space-y-5 lg:col-span-2">
          {/* 기본 정보 */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[#0F172A]">신청자 정보</h2>
            <div className="space-y-3">
              <InfoRow label="이름" value={app.name} />
              <InfoRow label="이메일" value={app.email} />
              <InfoRow label="연락처" value={app.phone} />
              <InfoRow label="직군" value={app.profession} />
              {app.annualIncome && (
                <InfoRow
                  label="연간 소득"
                  value={`${app.annualIncome.toLocaleString()}만원`}
                />
              )}
              <InfoRow
                label="신청일"
                value={new Date(app.createdAt).toLocaleString('ko-KR')}
              />
            </div>
          </div>

          {/* 절세 시뮬레이터 결과 */}
          {(app.simulatedInvestment || app.simulatedTaxSaving) && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <h2 className="mb-4 font-semibold text-[#0F172A]">절세 시뮬레이션 결과</h2>
              <div className="grid grid-cols-2 gap-4">
                {app.simulatedInvestment && (
                  <div className="rounded-lg bg-[#F8FAFC] p-4">
                    <p className="text-xs text-[#94A3B8]">투자 희망금액</p>
                    <p className="mt-1 text-lg font-bold text-[#0F172A]">
                      {app.simulatedInvestment.toLocaleString()}만원
                    </p>
                  </div>
                )}
                {app.simulatedTaxSaving && (
                  <div className="rounded-lg bg-[#1B3A6B]/5 p-4">
                    <p className="text-xs text-[#94A3B8]">예상 절세액</p>
                    <p className="mt-1 text-lg font-bold text-[#1B3A6B]">
                      {app.simulatedTaxSaving.toLocaleString()}만원
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 검토 메모 */}
          {app.reviewNote && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <h2 className="mb-2 font-semibold text-[#0F172A]">검토 메모</h2>
              <p className="text-sm text-[#64748B] whitespace-pre-wrap">{app.reviewNote}</p>
            </div>
          )}
        </div>

        {/* 오른쪽: 액션 */}
        <div>
          <ApplicationActions application={app} />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#F1F5F9] py-2 last:border-0">
      <span className="text-sm text-[#94A3B8]">{label}</span>
      <span className="text-sm font-medium text-[#0F172A]">{value}</span>
    </div>
  )
}
