'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { CreditCard, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestBillingAuth: (
        method: string,
        options: Record<string, string>
      ) => Promise<{ authKey: string; customerKey: string }>
    }
  }
}

type Subscription = {
  id: string
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED'
  amount: number
  nextBillingAt: string
  startedAt: string
}

type Payment = {
  id: string
  amount: number
  status: string
  paidAt: string | null
  failReason: string | null
}

const STATUS_MAP = {
  ACTIVE: { label: '구독 중', color: 'text-emerald-400', icon: CheckCircle2 },
  PAST_DUE: { label: '결제 실패', color: 'text-amber-400', icon: AlertTriangle },
  CANCELLED: { label: '해지됨', color: 'text-[#6B7280]', icon: XCircle },
}

export default function BillingPage() {
  const [sub, setSub] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [registering, setRegistering] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: investor } = await supabase
      .from('InvestorProfile')
      .select('id')
      .eq('userId', user.id)
      .single()

    if (!investor) { setLoading(false); return }

    const { data: subscription } = await supabase
      .from('Subscription')
      .select('*')
      .eq('investorId', investor.id)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single()

    setSub(subscription ?? null)

    if (subscription) {
      const { data: hist } = await supabase
        .from('SubscriptionPayment')
        .select('*')
        .eq('subscriptionId', subscription.id)
        .order('createdAt', { ascending: false })
        .limit(12)
      setPayments(hist ?? [])
    }

    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleRegisterCard() {
    setRegistering(true)
    try {
      // Toss Payments 빌링키 발급 위젯 실행
      const script = document.createElement('script')
      script.src = 'https://js.tosspayments.com/v1/payment'
      document.head.appendChild(script)
      await new Promise((resolve) => (script.onload = resolve))

      const toss = window.TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)
      const customerKey = crypto.randomUUID()
      const { authKey } = await toss.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/billing/callback?customerKey=${customerKey}`,
        failUrl: `${window.location.origin}/billing?error=card_fail`,
      })

      // 빌링키 발급 + 첫 결제
      const res = await fetch('/api/billing/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, customerKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('카드 등록 및 첫 결제가 완료되었습니다')
      fetchData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '카드 등록 실패'
      toast.error(message)
    } finally {
      setRegistering(false)
    }
  }

  async function handleCancel() {
    if (!confirm('정말 구독을 해지하시겠습니까? 해지 후에는 서비스 이용이 불가합니다.')) return
    setCancelling(true)
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('구독이 해지되었습니다')
      fetchData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '해지 오류'
      toast.error(message)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A84C]" size={32} />
      </div>
    )
  }

  const statusInfo = sub ? STATUS_MAP[sub.status] : null
  const StatusIcon = statusInfo?.icon

  return (
    <div className="space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-bold text-white">구독 & 결제</h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">THE PATRON 월 구독 정보를 관리하세요</p>
      </div>

      {/* 구독 상태 카드 */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/10">
              <CreditCard className="text-[#C9A84C]" size={24} />
            </div>
            <div>
              <p className="text-sm text-[#9CA3AF]">월 구독료</p>
              <p className="text-2xl font-bold text-white">59,000<span className="ml-1 text-base font-normal text-[#9CA3AF]">원</span></p>
            </div>
          </div>

          {statusInfo && StatusIcon && (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${statusInfo.color}`}>
              <StatusIcon size={16} />
              {statusInfo.label}
            </div>
          )}
        </div>

        {sub && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#2A2A2A] pt-5 md:grid-cols-3">
            <div>
              <p className="text-xs text-[#6B7280]">구독 시작일</p>
              <p className="mt-1 text-sm text-white">
                {new Date(sub.startedAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
            {sub.status === 'ACTIVE' && (
              <div>
                <p className="text-xs text-[#6B7280]">다음 결제일</p>
                <p className="mt-1 text-sm text-white">
                  {new Date(sub.nextBillingAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            )}
            {sub.status === 'PAST_DUE' && (
              <div>
                <p className="text-xs text-amber-400">결제 실패 — 카드를 재등록하세요</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {(!sub || sub.status !== 'ACTIVE') && (
            <button
              onClick={handleRegisterCard}
              disabled={registering}
              className="flex items-center gap-2 rounded-lg bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#D4B860] disabled:opacity-50"
            >
              {registering ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              {sub ? '카드 재등록' : '카드 등록 & 구독 시작'}
            </button>
          )}
          {sub?.status === 'ACTIVE' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-lg border border-[#3A3A3A] px-5 py-2.5 text-sm text-[#9CA3AF] hover:border-red-500 hover:text-red-400 disabled:opacity-50"
            >
              {cancelling ? '해지 처리 중...' : '구독 해지'}
            </button>
          )}
        </div>
      </div>

      {/* 결제 내역 */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">결제 내역</h2>
        {payments.length === 0 ? (
          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-8 text-center text-sm text-[#6B7280]">
            결제 내역이 없습니다
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#2A2A2A]">
            <table className="w-full text-sm">
              <thead className="border-b border-[#2A2A2A] bg-[#0F0F0F]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[#6B7280]">날짜</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B7280]">금액</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B7280]">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E1E] bg-[#141414]">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-[#D1D5DB]">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {p.amount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'SUCCESS' ? (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">결제 완료</span>
                      ) : (
                        <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs text-red-400">결제 실패</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
