'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

interface Application {
  id: string
  name: string
  email: string
  status: string
  reviewNote: string | null
}

export function ApplicationActions({ application }: { application: Application }) {
  const router = useRouter()
  const [note, setNote] = useState(application.reviewNote ?? '')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action)
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    const { error } = await supabase
      .from('MembershipApplication')
      .update({ status: newStatus, reviewNote: note || null })
      .eq('id', application.id)

    if (error) {
      toast.error('처리 중 오류가 발생했습니다')
      setLoading(null)
      return
    }

    if (action === 'approve') {
      toast.success(`${application.name}님 신청을 승인했습니다`)
    } else {
      toast.success(`${application.name}님 신청을 거절했습니다`)
    }

    router.push('/applications')
    router.refresh()
  }

  const isPending = application.status === 'PENDING'

  return (
    <div className="space-y-4">
      {/* 현재 상태 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">심사 상태</h3>
        <div
          className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${
            application.status === 'PENDING'
              ? 'bg-amber-50 text-amber-600'
              : application.status === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
          }`}
        >
          {application.status === 'PENDING'
            ? '검토 대기'
            : application.status === 'APPROVED'
              ? '승인됨'
              : '거절됨'}
        </div>
      </div>

      {/* 메모 입력 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
          검토 메모
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="승인/거절 사유 또는 메모를 입력하세요 (내부용)"
          rows={4}
          className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] placeholder-[#CBD5E1] outline-none focus:border-[#1B3A6B]"
        />
      </div>

      {/* 액션 버튼 */}
      {isPending && (
        <div className="space-y-2">
          <button
            onClick={() => handleAction('approve')}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading === 'approve' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={18} />
                승인 — 초대 코드 발송
              </>
            )}
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-3 font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            {loading === 'reject' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <XCircle size={18} />
                거절
              </>
            )}
          </button>
        </div>
      )}

      {!isPending && (
        <p className="text-center text-xs text-[#94A3B8]">
          이미 처리된 신청입니다
        </p>
      )}
    </div>
  )
}
