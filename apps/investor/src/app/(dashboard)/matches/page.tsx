import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GitMerge, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: '매칭 현황' }

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: '신청 접수',
  REVIEWING: '검토 중',
  DELIVERED: '기업 전달',
  MEETING: '미팅 조율',
  DEAL_ROOM: 'NDA 완료',
  CONTRACT: '계약 진행',
  COMPLETED: '투자 완료',
}

const STATUS_ORDER = [
  'REQUESTED',
  'REVIEWING',
  'DELIVERED',
  'MEETING',
  'DEAL_ROOM',
  'CONTRACT',
  'COMPLETED',
]

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  REVIEWING: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  DELIVERED: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  MEETING: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  DEAL_ROOM: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  CONTRACT: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  COMPLETED: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30',
}

export default async function MatchesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('InvestorProfile')
    .select('id')
    .eq('userId', user.id)
    .single()

  const { data: matches } = profile
    ? await supabase
        .from('MatchRequest')
        .select(
          `id, status, investmentAmount, investmentType, ndaSigned, createdAt, updatedAt,
           deal:Deal(id, briefTitle, category, stage)`
        )
        .eq('investorId', profile.id)
        .order('updatedAt', { ascending: false })
    : { data: null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">매칭 현황</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">
          신청한 딜 매칭의 진행 상황을 확인하세요
        </p>
      </div>

      {!matches || matches.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] text-[#555555]">
          <GitMerge size={36} className="opacity-40" />
          <p className="text-sm">진행 중인 매칭이 없습니다</p>
          <Link href="/deals" className="text-sm text-[#D4AF37] hover:underline">
            딜 목록 보러가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const deal = match.deal as { id: string; briefTitle: string; category: string; stage: string } | null
            const currentStep = STATUS_ORDER.indexOf(match.status)

            return (
              <div
                key={match.id}
                className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-5"
              >
                {/* 딜 정보 */}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/deals/${deal?.id}`}
                      className="font-semibold text-white hover:text-[#D4AF37]"
                    >
                      {deal?.briefTitle ?? '딜 정보 없음'}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-[#555555]">{deal?.stage}</span>
                      <span className="text-xs text-[#555555]">·</span>
                      <span className="text-xs text-[#555555]">{deal?.category}</span>
                      <span className="text-xs text-[#555555]">·</span>
                      <span className="text-xs text-[#555555]">
                        희망 투자금 {match.investmentAmount.toLocaleString()}만원
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[match.status]
                    }`}
                  >
                    {STATUS_LABELS[match.status]}
                  </span>
                </div>

                {/* 진행 단계 타임라인 */}
                <div className="mb-4 overflow-x-auto">
                  <div className="flex min-w-max items-center gap-0">
                    {STATUS_ORDER.map((status, idx) => {
                      const isPast = idx < currentStep
                      const isCurrent = idx === currentStep
                      const isNext = idx > currentStep

                      return (
                        <div key={status} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                isPast
                                  ? 'bg-[#D4AF37] text-[#0A0A0A]'
                                  : isCurrent
                                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] ring-1 ring-[#D4AF37]'
                                    : 'bg-[#2F2F2F] text-[#555555]'
                              }`}
                            >
                              {isPast ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`mt-1 whitespace-nowrap text-[10px] ${
                                isCurrent
                                  ? 'font-semibold text-[#D4AF37]'
                                  : isNext
                                    ? 'text-[#555555]'
                                    : 'text-[#A0A0A0]'
                              }`}
                            >
                              {STATUS_LABELS[status]}
                            </span>
                          </div>
                          {idx < STATUS_ORDER.length - 1 && (
                            <div
                              className={`h-px w-6 ${
                                idx < currentStep ? 'bg-[#D4AF37]' : 'bg-[#2F2F2F]'
                              }`}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* NDA 상태 + 날짜 */}
                <div className="flex items-center justify-between text-xs text-[#555555]">
                  <span>
                    {match.ndaSigned ? (
                      <span className="text-cyan-400">✓ NDA 체결 완료</span>
                    ) : (
                      'NDA 미체결'
                    )}
                  </span>
                  <span>
                    신청일 {new Date(match.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
