import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, TrendingUp } from 'lucide-react'

export const metadata = { title: 'Patron Circle' }

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000)
    return `${eok}억원`
  }
  return `${amount.toLocaleString()}만원`
}

export default async function CirclesPage() {
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

  // 내가 속한 서클 조회
  const { data: memberships } = profile
    ? await supabase
        .from('PatronCircleMember')
        .select(`amount, joinedAt, circle:PatronCircle(id, name, status, targetAmount, currentAmount, managementFeeRate)`)
        .eq('investorId', profile.id)
    : { data: null }

  // 공개 서클 (모집 중)
  const { data: openCircles } = await supabase
    .from('PatronCircle')
    .select('id, name, status, targetAmount, currentAmount, managementFeeRate')
    .eq('status', 'FORMING')
    .order('createdAt', { ascending: false })

  const STATUS_LABELS: Record<string, string> = {
    FORMING: '결성 중',
    ACTIVE: '운영 중',
    CLOSED: '해산',
  }

  const STATUS_COLORS: Record<string, string> = {
    FORMING: 'text-amber-400 bg-amber-400/10',
    ACTIVE: 'text-emerald-400 bg-emerald-400/10',
    CLOSED: 'text-[#555555] bg-[#2F2F2F]',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Patron Circle</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">
          더페트론이 GP 역할을 맡는 엔젤투자조합입니다. 여러 패트론이 공동으로 투자합니다.
        </p>
      </div>

      {/* 내 서클 멤버십 */}
      {memberships && memberships.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">내 서클</h2>
          <div className="space-y-3">
            {memberships.map((m) => {
              const circle = m.circle as {
                id: string
                name: string
                status: string
                targetAmount: number
                currentAmount: number
                managementFeeRate: number
              } | null
              if (!circle) return null
              const progress = Math.min(
                Math.round((circle.currentAmount / circle.targetAmount) * 100),
                100
              )
              return (
                <div
                  key={circle.id}
                  className="rounded-xl border border-[#D4AF37]/20 bg-[#1A1A1A] p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">{circle.name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[circle.status]
                      }`}
                    >
                      {STATUS_LABELS[circle.status]}
                    </span>
                  </div>
                  <div className="mb-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#555555]">목표 금액</p>
                      <p className="mt-0.5 text-sm font-semibold">
                        {formatAmount(circle.targetAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#555555]">내 출자금</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#D4AF37]">
                        {formatAmount(m.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#555555]">운영 보수</p>
                      <p className="mt-0.5 text-sm font-semibold">
                        {(circle.managementFeeRate * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  {/* 결성 진행률 */}
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-[#555555]">
                      <span>결성 진행률</span>
                      <span>
                        {formatAmount(circle.currentAmount)} / {formatAmount(circle.targetAmount)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#2F2F2F]">
                      <div
                        className="h-full rounded-full bg-[#D4AF37] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 결성 중인 공개 서클 */}
      <section>
        <h2 className="mb-3 font-semibold">결성 중인 서클</h2>
        {!openCircles || openCircles.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] text-[#555555]">
            <Users size={28} className="opacity-40" />
            <p className="text-sm">현재 결성 중인 서클이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {openCircles.map((circle) => {
              const progress = Math.min(
                Math.round((circle.currentAmount / circle.targetAmount) * 100),
                100
              )
              return (
                <div
                  key={circle.id}
                  className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-5"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{circle.name}</h3>
                      <p className="mt-0.5 text-xs text-[#555555]">
                        운영 보수 {(circle.managementFeeRate * 100).toFixed(0)}% ·
                        더페트론 GP
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                      {STATUS_LABELS[circle.status]}
                    </span>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#111111] p-3">
                      <p className="text-xs text-[#555555]">목표 금액</p>
                      <p className="mt-0.5 text-sm font-semibold">
                        {formatAmount(circle.targetAmount)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#111111] p-3">
                      <p className="text-xs text-[#555555]">현재 결성액</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#D4AF37]">
                        {formatAmount(circle.currentAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-xs text-[#555555]">
                      <span>결성 진행률</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#2F2F2F]">
                      <div
                        className="h-full rounded-full bg-[#D4AF37]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-center text-xs text-[#555555]">
                    서클 참여 문의는 더페트론 매니저에게 연락하세요
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 서클이란? */}
      <div className="rounded-xl border border-[#2F2F2F] bg-[#111111] p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#D4AF37]">
          <TrendingUp size={16} /> Patron Circle이란?
        </h3>
        <div className="space-y-2 text-sm text-[#A0A0A0]">
          <p>
            • 더페트론이 <strong className="text-white">GP(General Partner)</strong> 역할을 맡아
            운영하는 엔젤투자조합입니다
          </p>
          <p>
            • 여러 패트론이 LP(Limited Partner)로 참여하여 <strong className="text-white">공동 투자</strong>를
            진행합니다
          </p>
          <p>
            • 개인 투자보다 큰 딜에 참여할 수 있으며, 운영 보수는{' '}
            <strong className="text-white">연 2%</strong> 기준입니다
          </p>
          <p>• 서클 참여를 원하시면 더페트론 매니저에게 문의하세요</p>
        </div>
      </div>
    </div>
  )
}
