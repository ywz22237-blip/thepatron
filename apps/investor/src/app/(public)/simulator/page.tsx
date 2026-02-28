'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calculator } from 'lucide-react'
import { calculateTaxSaving, formatKRW, formatPercent } from '@thepatron/utils/tax-calculator'
import type { TaxCalculatorResult } from '@thepatron/types'

const PROFESSIONS = ['의사', '변호사', '회계사', '세무사', '대기업 임원', '금융전문직', '기타 전문직']

// 연봉 구간 옵션 (만원)
const INCOME_OPTIONS = [
  { label: '5,000만원', value: 5000 },
  { label: '8,000만원', value: 8000 },
  { label: '1억원', value: 10000 },
  { label: '1억 5천만원', value: 15000 },
  { label: '2억원', value: 20000 },
  { label: '3억원', value: 30000 },
  { label: '5억원 이상', value: 50000 },
]

// 투자금 구간 옵션 (만원)
const INVESTMENT_OPTIONS = [
  { label: '1,000만원', value: 1000 },
  { label: '2,000만원', value: 2000 },
  { label: '3,000만원', value: 3000 },
  { label: '4,000만원', value: 4000 },
  { label: '5,000만원', value: 5000 },
  { label: '7,000만원', value: 7000 },
  { label: '1억원', value: 10000 },
]

export default function SimulatorPage() {
  const [annualIncome, setAnnualIncome] = useState<number | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState<number | null>(null)
  const [result, setResult] = useState<TaxCalculatorResult | null>(null)

  function calculate() {
    if (!annualIncome || !investmentAmount) return
    const r = calculateTaxSaving({ investmentAmount, annualIncome })
    setResult(r)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* 헤더 */}
      <header className="border-b border-[#2F2F2F] bg-[#0A0A0A]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 text-[#A0A0A0] hover:text-white">
            <ArrowLeft size={18} />
            <span className="hidden sm:block">홈으로</span>
          </Link>
          <span className="text-[#2F2F2F]">|</span>
          <span className="font-bold text-[#D4AF37]">THE PATRON</span>
          <span className="ml-auto text-sm text-[#A0A0A0]">절세 시뮬레이터</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 lg:py-20">
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Calculator className="h-6 w-6 text-[#D4AF37]" />
            <span className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">Tax-to-Equity</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold lg:text-4xl">벤처투자 절세 시뮬레이터</h1>
          <p className="text-[#A0A0A0]">
            조세특례제한법 제16조 기준으로 예상 절세액을 계산합니다
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 입력 패널 */}
          <div className="space-y-6 rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
            <h2 className="font-semibold text-[#D4AF37]">내 정보 입력</h2>

            {/* 연간 소득 */}
            <div>
              <label className="mb-3 block text-sm text-[#A0A0A0]">연간 소득</label>
              <div className="grid grid-cols-2 gap-2">
                {INCOME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAnnualIncome(opt.value)}
                    className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${
                      annualIncome === opt.value
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                        : 'border-[#2F2F2F] text-[#A0A0A0] hover:border-[#404040]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 투자 희망 금액 */}
            <div>
              <label className="mb-3 block text-sm text-[#A0A0A0]">투자 희망 금액</label>
              <div className="grid grid-cols-2 gap-2">
                {INVESTMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setInvestmentAmount(opt.value)}
                    className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${
                      investmentAmount === opt.value
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                        : 'border-[#2F2F2F] text-[#A0A0A0] hover:border-[#404040]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={calculate}
              disabled={!annualIncome || !investmentAmount}
              className="w-full rounded-lg bg-[#D4AF37] py-3 font-semibold text-[#0A0A0A] transition-all hover:bg-[#E8CC6A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              절세액 계산하기
            </button>
          </div>

          {/* 결과 패널 */}
          <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
            <h2 className="mb-6 font-semibold text-[#D4AF37]">예상 절세 결과</h2>

            {!result ? (
              <div className="flex h-48 flex-col items-center justify-center text-center text-[#666666]">
                <Calculator className="mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">소득과 투자금을 선택하고<br />계산하기를 누르세요</p>
              </div>
            ) : (
              <div className="space-y-4">
                <ResultRow
                  label="투자 금액"
                  value={formatKRW(result.investmentAmount)}
                />
                <ResultRow
                  label="소득공제율"
                  value={formatPercent(result.deductionRate)}
                  highlight
                />
                <ResultRow
                  label="공제 금액"
                  value={formatKRW(result.deductionAmount)}
                />
                <ResultRow
                  label="실제 적용 공제액"
                  value={formatKRW(result.effectiveDeduction)}
                  sub="(연 소득 50% 한도 적용)"
                />
                <ResultRow
                  label="적용 소득세율"
                  value={formatPercent(result.incomeTaxRate)}
                />

                <div className="mt-6 rounded-xl border border-[#D4AF37] bg-[#D4AF37]/10 p-5 text-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                  <p className="mb-1 text-sm text-[#A0A0A0]">예상 절세액</p>
                  <p className="text-4xl font-bold text-[#D4AF37]">
                    {formatKRW(result.estimatedTaxSaving)}
                  </p>
                  <p className="mt-2 text-xs text-[#666666]">
                    * 실제 세액은 개인 세율 및 공제 상황에 따라 다를 수 있습니다
                  </p>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/apply"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-[#0A0A0A] transition-colors hover:bg-[#E8CC6A]"
                  >
                    패트론 신청하기 <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="mt-8 rounded-lg border border-[#2F2F2F] bg-[#111111] p-4 text-sm text-[#666666]">
          <strong className="text-[#A0A0A0]">조세특례제한법 제16조 (벤처기업등에의 투자에 대한 소득공제)</strong>
          <p className="mt-2">
            투자금 ≤ 3,000만원: 100% 소득공제 | 3,000만원 초과 ~ 5,000만원: 70% | 5,000만원 초과: 30%
            <br />
            한도: 해당 과세연도 종합소득금액의 50%
          </p>
        </div>
      </div>
    </div>
  )
}

function ResultRow({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <span className="text-sm text-[#A0A0A0]">{label}</span>
        {sub && <p className="text-xs text-[#666666]">{sub}</p>}
      </div>
      <span className={`font-semibold ${highlight ? 'text-[#D4AF37]' : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}
