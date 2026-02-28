'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const INVESTMENT_OPTIONS = [
  { label: '1,000만원', value: 1000 },
  { label: '2,000만원', value: 2000 },
  { label: '3,000만원', value: 3000 },
  { label: '5,000만원', value: 5000 },
  { label: '7,000만원', value: 7000 },
  { label: '1억원', value: 10000 },
]

interface Props {
  dealId: string
  profileId?: string
  minInvestment: number
  maxInvestment: number | null
}

export function MatchRequestButton({ dealId, profileId, minInvestment, maxInvestment }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredOptions = INVESTMENT_OPTIONS.filter(
    (opt) =>
      opt.value >= minInvestment &&
      (maxInvestment === null || opt.value <= maxInvestment)
  )

  if (!profileId) {
    return (
      <div className="mt-4 rounded-lg border border-[#2F2F2F] bg-[#1A1A1A] px-4 py-3 text-sm text-[#A0A0A0]">
        매칭 신청은 ACTIVE 구독자만 가능합니다.
      </div>
    )
  }

  async function handleSubmit() {
    if (!amount) {
      toast.error('투자 희망 금액을 선택해주세요')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('MatchRequest').insert({
      investorId: profileId,
      dealId,
      investmentAmount: amount,
      investmentType: 'SOLO_PATRON',
      investorNote: note || null,
      status: 'REQUESTED',
    })
    if (error) {
      toast.error('매칭 신청 중 오류가 발생했습니다')
      setLoading(false)
      return
    }
    toast.success('매칭 신청이 완료되었습니다!')
    router.refresh()
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-[#0A0A0A] transition-all hover:bg-[#E8CC6A]"
      >
        매칭 신청하기 <ArrowRight size={16} />
      </button>
    )
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-[#2F2F2F] bg-[#1A1A1A] p-4">
      <h3 className="text-sm font-semibold text-white">투자 희망 금액 선택</h3>

      {filteredOptions.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {filteredOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAmount(opt.value)}
              className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                amount === opt.value
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-[#2F2F2F] text-[#A0A0A0] hover:border-[#404040]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#A0A0A0]">
          최소 투자금: {minInvestment.toLocaleString()}만원{' '}
          {maxInvestment && `~ 최대 ${maxInvestment.toLocaleString()}만원`}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-xs text-[#A0A0A0]">
          투자 의향 메모 (선택 — 관리자만 열람)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="투자 배경, 질문 사항 등을 간략히 적어주세요"
          rows={3}
          className="w-full resize-none rounded-lg border border-[#2F2F2F] bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder-[#555555] outline-none focus:border-[#D4AF37]"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 rounded-lg border border-[#2F2F2F] py-2.5 text-sm text-[#A0A0A0] hover:border-[#404040]"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#D4AF37] py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8CC6A] disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : '신청 확정'}
        </button>
      </div>
    </div>
  )
}
