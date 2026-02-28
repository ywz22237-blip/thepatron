import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Lock, TrendingUp, Eye, Heart, Handshake } from 'lucide-react'
import Link from 'next/link'
import { MatchRequestButton } from '@/components/deals/match-request-button'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: '딜 상세' }
}

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000)
    const man = amount % 10000
    if (man === 0) return `${eok}억원`
    return `${eok}억 ${man.toLocaleString()}만원`
  }
  return `${amount.toLocaleString()}만원`
}

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 딜 조회
  const { data: deal } = await supabase
    .from('Deal')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'ACTIVE')
    .single()

  if (!deal) notFound()

  // 투자자 프로필
  const { data: profile } = await supabase
    .from('InvestorProfile')
    .select('id, status')
    .eq('userId', user.id)
    .single()

  // 기존 매칭 신청 여부
  const { data: existingMatch } = profile
    ? await supabase
        .from('MatchRequest')
        .select('id, status, ndaSigned')
        .eq('investorId', profile.id)
        .eq('dealId', deal.id)
        .single()
    : { data: null }

  // 조회수 증가 (fire-and-forget)
  supabase
    .from('Deal')
    .update({ viewCount: deal.viewCount + 1 })
    .eq('id', deal.id)
    .then(() => {})

  const canSeeDescription = existingMatch?.ndaSigned === true

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Link
        href="/deals"
        className="inline-flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white"
      >
        <ArrowLeft size={16} />
        딜 목록
      </Link>

      {/* 헤더 */}
      <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#D4AF37]/10 px-2 py-1 text-sm font-medium text-[#D4AF37]">
            {deal.stage}
          </span>
          <span className="rounded-md bg-[#2F2F2F] px-2 py-1 text-sm text-[#A0A0A0]">
            {deal.category}
          </span>
          <span className="ml-auto flex items-center gap-1 text-xs text-[#555555]">
            <Eye size={12} /> {deal.viewCount} 조회
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold">{deal.briefTitle}</h1>
        <p className="text-sm text-[#666666]">
          기업명은 NDA 체결 후 공개됩니다 · 등록일{' '}
          {new Date(deal.createdAt).toLocaleDateString('ko-KR')}
        </p>
      </div>

      {/* 투자 조건 */}
      <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <TrendingUp size={18} className="text-[#D4AF37]" />
          투자 조건
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <InfoItem label="목표 투자금" value={formatAmount(deal.targetAmount)} />
          <InfoItem label="최소 투자금" value={formatAmount(deal.minInvestment)} />
          {deal.maxInvestment && (
            <InfoItem label="최대 투자금" value={formatAmount(deal.maxInvestment)} />
          )}
          {deal.valuation && (
            <InfoItem label="기업가치" value={formatAmount(deal.valuation)} highlight />
          )}
          {deal.equity && (
            <InfoItem label="지분율" value={`${deal.equity}%`} />
          )}
        </div>
      </div>

      {/* 딜 설명 — NDA 체결 후만 열람 */}
      <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
        <h2 className="mb-4 font-semibold">딜 상세 정보</h2>
        {canSeeDescription ? (
          <div className="prose prose-invert prose-sm max-w-none text-[#A0A0A0]">
            <p className="leading-relaxed">{deal.description}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[#2F2F2F] bg-[#111111] py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F2F2F]">
              <Lock size={20} className="text-[#555555]" />
            </div>
            <div>
              <p className="font-medium text-[#A0A0A0]">NDA 체결 후 열람 가능</p>
              <p className="mt-1 text-sm text-[#555555]">
                매칭 신청 후 DEAL_ROOM 단계에서 상세 정보가 공개됩니다
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 매칭 신청 섹션 */}
      <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
            <Handshake size={20} className="text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">매칭 신청</h2>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              더페트론 매니저가 기업과의 미팅을 중개합니다. NDA 체결 후 기업 정보가 공개됩니다.
            </p>

            {existingMatch ? (
              <div className="mt-4 rounded-lg border border-[#2F2F2F] bg-[#1A1A1A] px-4 py-3">
                <p className="text-sm">
                  <span className="text-[#A0A0A0]">현재 매칭 상태: </span>
                  <span className="font-semibold text-[#D4AF37]">
                    {MATCH_STATUS_LABELS[existingMatch.status as keyof typeof MATCH_STATUS_LABELS]}
                  </span>
                </p>
                <Link
                  href="/matches"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-[#D4AF37] hover:underline"
                >
                  매칭 현황 보기
                </Link>
              </div>
            ) : (
              <MatchRequestButton
                dealId={deal.id}
                profileId={profile?.id}
                minInvestment={deal.minInvestment}
                maxInvestment={deal.maxInvestment}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const MATCH_STATUS_LABELS = {
  REQUESTED: '신청 접수',
  REVIEWING: '검토 중',
  DELIVERED: '기업 전달',
  MEETING: '미팅 조율',
  DEAL_ROOM: 'NDA 완료',
  CONTRACT: '계약 진행',
  COMPLETED: '투자 완료',
}

function InfoItem({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-lg bg-[#111111] p-4">
      <p className="text-xs text-[#555555]">{label}</p>
      <p className={`mt-1 text-lg font-bold ${highlight ? 'text-[#D4AF37]' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}
