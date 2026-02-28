import Link from 'next/link'
import { TrendingUp, Eye, Heart, ArrowRight } from 'lucide-react'

interface Deal {
  id: string
  briefTitle: string
  category: string
  stage: string
  targetAmount: number
  minInvestment: number
  maxInvestment: number | null
  valuation: number | null
  equity: number | null
  status: string
  viewCount: number
  interestCount: number
  createdAt: string
  closedAt: string | null
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

export function DealCard({ deal }: { deal: Deal }) {
  const isNew =
    new Date().getTime() - new Date(deal.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="group block rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-5 transition-all hover:-translate-y-0.5 hover:border-[#D4AF37]/30 hover:shadow-[0_8px_32px_rgba(212,175,55,0.08)]"
    >
      {/* 상단: 배지 */}
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-[#D4AF37]/10 px-2 py-0.5 text-xs font-medium text-[#D4AF37]">
          {deal.stage}
        </span>
        <span className="rounded-md bg-[#2F2F2F] px-2 py-0.5 text-xs text-[#A0A0A0]">
          {deal.category}
        </span>
        {isNew && (
          <span className="ml-auto rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            NEW
          </span>
        )}
      </div>

      {/* 타이틀 */}
      <h3 className="mb-4 font-semibold leading-snug text-white group-hover:text-[#D4AF37] transition-colors">
        {deal.briefTitle}
      </h3>

      {/* 투자 조건 */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-[#111111] p-3">
        <div>
          <p className="text-xs text-[#555555]">목표 투자금</p>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {formatAmount(deal.targetAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#555555]">최소 투자금</p>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {formatAmount(deal.minInvestment)}
          </p>
        </div>
        {deal.valuation && (
          <div>
            <p className="text-xs text-[#555555]">기업가치</p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {formatAmount(deal.valuation)}
            </p>
          </div>
        )}
        {deal.equity && (
          <div>
            <p className="text-xs text-[#555555]">지분율</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{deal.equity}%</p>
          </div>
        )}
      </div>

      {/* 하단: 통계 + 더보기 */}
      <div className="flex items-center justify-between text-xs text-[#555555]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye size={12} /> {deal.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} /> {deal.interestCount}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[#D4AF37] opacity-0 transition-opacity group-hover:opacity-100">
          상세 보기 <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}
