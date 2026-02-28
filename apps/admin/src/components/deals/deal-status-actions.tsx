'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Eye, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

interface Deal {
  id: string
  status: string
  feePaid: boolean
  feeAmount: number
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: '심사 대기',
  REVIEWING: '심사 중',
  ACTIVE: '활성',
  CLOSED: '마감',
  REJECTED: '거절',
}

const NEXT_STATUSES: Record<string, string[]> = {
  DRAFT: ['REVIEWING', 'REJECTED'],
  REVIEWING: ['ACTIVE', 'REJECTED'],
  ACTIVE: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
}

export function DealStatusActions({ deal }: { deal: Deal }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function updateStatus(newStatus: string) {
    setLoading(true)
    const { error } = await supabase
      .from('Deal')
      .update({ status: newStatus })
      .eq('id', deal.id)

    if (error) {
      toast.error('상태 변경 중 오류가 발생했습니다')
      setLoading(false)
      return
    }

    toast.success(`딜 상태를 "${STATUS_LABELS[newStatus]}"으로 변경했습니다`)
    router.refresh()
    setLoading(false)
  }

  async function toggleFeePaid() {
    setLoading(true)
    const { error } = await supabase
      .from('Deal')
      .update({ feePaid: !deal.feePaid })
      .eq('id', deal.id)

    if (error) {
      toast.error('오류가 발생했습니다')
      setLoading(false)
      return
    }

    toast.success(deal.feePaid ? '중계료 미납으로 변경했습니다' : '중계료 납부 확인했습니다')
    router.refresh()
    setLoading(false)
  }

  const nextStatuses = NEXT_STATUSES[deal.status] ?? []

  return (
    <div className="space-y-4">
      {/* 현재 상태 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">현재 상태</h3>
        <div className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${
          deal.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
          deal.status === 'REVIEWING' ? 'bg-amber-50 text-amber-600' :
          deal.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
          'bg-[#F1F5F9] text-[#64748B]'
        }`}>
          {STATUS_LABELS[deal.status]}
        </div>
      </div>

      {/* 상태 변경 */}
      {nextStatuses.length > 0 && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">상태 변경</h3>
          <div className="space-y-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
                  status === 'ACTIVE'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : status === 'REVIEWING'
                      ? 'bg-[#1B3A6B] text-white hover:bg-[#2B5099]'
                      : status === 'REJECTED'
                        ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
                }`}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : status === 'ACTIVE' ? (
                  <><CheckCircle2 size={16} /> 승인 — 플랫폼 등재</>
                ) : status === 'REVIEWING' ? (
                  <><Eye size={16} /> 심사 중으로 변경</>
                ) : status === 'REJECTED' ? (
                  <><XCircle size={16} /> 거절</>
                ) : (
                  `${STATUS_LABELS[status]}으로 변경`
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 중계료 관리 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">중계료 관리</h3>
        <div className="mb-3 flex items-center justify-between rounded-lg bg-[#F8FAFC] px-4 py-3">
          <span className="text-sm text-[#64748B]">중계료</span>
          <span className="font-semibold text-[#0F172A]">
            {deal.feeAmount.toLocaleString()}원
          </span>
        </div>
        <button
          onClick={toggleFeePaid}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
            deal.feePaid
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              : 'border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
          }`}
        >
          {deal.feePaid ? (
            <><CheckCircle2 size={16} /> 납부 완료 (클릭 시 취소)</>
          ) : (
            '납부 확인하기'
          )}
        </button>
      </div>
    </div>
  )
}
