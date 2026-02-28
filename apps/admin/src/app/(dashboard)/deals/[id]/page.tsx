import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DealStatusActions } from '@/components/deals/deal-status-actions'

export const metadata = { title: '딜 상세 심사' }

function formatAmount(amount: number): string {
  if (amount >= 10000) return `${Math.floor(amount / 10000)}억원`
  return `${amount.toLocaleString()}만원`
}

export default async function AdminDealDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: deal } = await supabase
    .from('Deal')
    .select(`*, company:CompanyProfile(id, name, email, phone, website, bizNumber, ceoName)`)
    .eq('id', params.id)
    .single()

  if (!deal) notFound()

  const company = deal.company as {
    id: string; name: string; email: string; phone: string | null;
    website: string | null; bizNumber: string | null; ceoName: string | null;
  } | null

  return (
    <div className="space-y-6">
      <Link
        href="/deals"
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]"
      >
        <ArrowLeft size={16} />
        딜 목록
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 왼쪽: 딜 정보 */}
        <div className="space-y-5 lg:col-span-2">
          {/* 딜 개요 */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-md bg-[#1B3A6B]/10 px-2 py-0.5 text-sm font-medium text-[#1B3A6B]">
                {deal.stage}
              </span>
              <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-sm text-[#64748B]">
                {deal.category}
              </span>
            </div>
            <h1 className="mb-2 text-xl font-bold text-[#0F172A]">{deal.briefTitle}</h1>
            <p className="text-sm text-[#94A3B8]">
              등록일 {new Date(deal.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* 투자 조건 */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[#0F172A]">투자 조건</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <InfoBox label="목표 투자금" value={formatAmount(deal.targetAmount)} />
              <InfoBox label="최소 투자금" value={formatAmount(deal.minInvestment)} />
              {deal.maxInvestment && (
                <InfoBox label="최대 투자금" value={formatAmount(deal.maxInvestment)} />
              )}
              {deal.valuation && (
                <InfoBox label="기업가치" value={formatAmount(deal.valuation)} highlight />
              )}
              {deal.equity && (
                <InfoBox label="지분율" value={`${deal.equity}%`} />
              )}
            </div>
          </div>

          {/* 기업 정보 */}
          {company && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <h2 className="mb-4 font-semibold text-[#0F172A]">기업 정보 (관리자 전용)</h2>
              <div className="space-y-3">
                <InfoRow label="기업명" value={company.name} />
                <InfoRow label="대표자" value={company.ceoName ?? '-'} />
                <InfoRow label="이메일" value={company.email} />
                <InfoRow label="연락처" value={company.phone ?? '-'} />
                <InfoRow label="사업자번호" value={company.bizNumber ?? '-'} />
                {company.website && (
                  <InfoRow label="웹사이트" value={company.website} />
                )}
              </div>
            </div>
          )}

          {/* 딜 상세 설명 */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[#0F172A]">딜 상세 설명</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#64748B]">
              {deal.description}
            </p>
          </div>
        </div>

        {/* 오른쪽: 심사 액션 */}
        <div>
          <DealStatusActions deal={deal} />
        </div>
      </div>
    </div>
  )
}

function InfoBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-[#F8FAFC] p-4">
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p className={`mt-1 text-base font-bold ${highlight ? 'text-[#1B3A6B]' : 'text-[#0F172A]'}`}>
        {value}
      </p>
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
