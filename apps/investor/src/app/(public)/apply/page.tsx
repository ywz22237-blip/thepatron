'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { calculateTaxSaving, formatKRW } from '@thepatron/utils/tax-calculator'
import type { TaxCalculatorResult } from '@thepatron/types'
import { toast } from 'sonner'

// ─── Step 1: 절세 시뮬레이터 ──────────────────────────────────────────────────

const INCOME_OPTIONS = [
  { label: '5,000만원', value: 5000 },
  { label: '8,000만원', value: 8000 },
  { label: '1억원', value: 10000 },
  { label: '1억 5천만원', value: 15000 },
  { label: '2억원', value: 20000 },
  { label: '3억원', value: 30000 },
  { label: '5억원 이상', value: 50000 },
]

const INVESTMENT_OPTIONS = [
  { label: '1,000만원', value: 1000 },
  { label: '2,000만원', value: 2000 },
  { label: '3,000만원', value: 3000 },
  { label: '4,000만원', value: 4000 },
  { label: '5,000만원', value: 5000 },
  { label: '7,000만원', value: 7000 },
  { label: '1억원', value: 10000 },
]

const PROFESSIONS = [
  '의사',
  '변호사',
  '회계사',
  '세무사',
  '대기업 임원',
  '금융전문직',
  '자산가',
  '기타 전문직',
]

// ─── Step 2: 신청 폼 ───────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일 주소를 입력하세요'),
  profession: z.string().min(1, '직군을 선택해주세요'),
  annualIncome: z.number().int().positive().optional(),
})

type FormValues = z.infer<typeof formSchema>

type Step = 'simulator' | 'form' | 'done'

export default function ApplyPage() {
  const [step, setStep] = useState<Step>('simulator')

  // 시뮬레이터 상태
  const [annualIncome, setAnnualIncome] = useState<number | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState<number | null>(null)
  const [simResult, setSimResult] = useState<TaxCalculatorResult | null>(null)

  // 폼
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  const selectedProfession = watch('profession')

  function runSimulator() {
    if (!annualIncome || !investmentAmount) return
    const result = calculateTaxSaving({ investmentAmount, annualIncome })
    setSimResult(result)
    // 연간 소득을 폼에도 세팅
    setValue('annualIncome', annualIncome)
  }

  function skipSimulator() {
    setStep('form')
  }

  function continueToForm() {
    setStep('form')
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          simulatedInvestment: simResult ? investmentAmount : undefined,
          simulatedTaxSaving: simResult?.estimatedTaxSaving,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error?.message || '신청 처리 중 오류가 발생했습니다.')
        setSubmitting(false)
        return
      }

      setStep('done')
    } catch {
      toast.error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setSubmitting(false)
    }
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
          <span className="ml-auto text-sm text-[#A0A0A0]">패트론 입장 신청</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* 진행 단계 표시 */}
        {step !== 'done' && (
          <div className="mb-10 flex items-center justify-center gap-3">
            <StepDot
              num={1}
              label="절세 계산"
              active={step === 'simulator'}
              done={step === 'form'}
            />
            <div className="h-px w-12 bg-[#2F2F2F]" />
            <StepDot num={2} label="신청 정보" active={step === 'form'} done={false} />
          </div>
        )}

        {/* ─── Step 1: 절세 시뮬레이터 ─── */}
        {step === 'simulator' && (
          <div>
            <div className="mb-8 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <Calculator className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
                  Tax-to-Equity
                </span>
              </div>
              <h1 className="text-2xl font-bold lg:text-3xl">내 절세액 미리 확인하기</h1>
              <p className="mt-2 text-sm text-[#A0A0A0]">
                투자 전 예상 절세액을 계산해보세요 (선택 사항)
              </p>
            </div>

            <div className="space-y-6 rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
              {/* 연간 소득 */}
              <div>
                <label className="mb-3 block text-sm text-[#A0A0A0]">연간 소득</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
                onClick={runSimulator}
                disabled={!annualIncome || !investmentAmount}
                className="w-full rounded-lg bg-[#D4AF37] py-3 font-semibold text-[#0A0A0A] transition-all hover:bg-[#E8CC6A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                절세액 계산하기
              </button>

              {/* 결과 */}
              {simResult && (
                <div className="rounded-xl border border-[#D4AF37] bg-[#D4AF37]/10 p-5 text-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                  <p className="mb-1 text-sm text-[#A0A0A0]">예상 절세액</p>
                  <p className="text-4xl font-bold text-[#D4AF37]">
                    {formatKRW(simResult.estimatedTaxSaving)}
                  </p>
                  <p className="mt-1 text-xs text-[#666666]">
                    소득공제율 {Math.round(simResult.deductionRate * 100)}% ·{' '}
                    소득세율 {Math.round(simResult.incomeTaxRate * 100)}% 적용
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={skipSimulator}
                className="flex-1 rounded-lg border border-[#2F2F2F] py-3 text-sm text-[#A0A0A0] hover:border-[#404040] hover:text-white"
              >
                건너뛰기
              </button>
              <button
                onClick={continueToForm}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#D4AF37] py-3 font-semibold text-[#0A0A0A] hover:bg-[#E8CC6A]"
              >
                신청 정보 입력하기 <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 2: 신청 폼 ─── */}
        {step === 'form' && (
          <div>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold lg:text-3xl">패트론 입장 신청</h1>
              <p className="mt-2 text-sm text-[#A0A0A0]">
                심사 후 영업일 기준 2~3일 내 결과를 알려드립니다
              </p>
            </div>

            {/* 시뮬레이터 결과 요약 */}
            {simResult && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-4 py-3">
                <Calculator size={16} className="shrink-0 text-[#D4AF37]" />
                <p className="text-sm">
                  <span className="text-[#A0A0A0]">예상 절세액 </span>
                  <span className="font-semibold text-[#D4AF37]">
                    {formatKRW(simResult.estimatedTaxSaving)}
                  </span>
                  <span className="text-[#A0A0A0]"> 으로 신청합니다</span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* 이름 */}
              <div>
                <label className="mb-1.5 block text-sm text-[#A0A0A0]">
                  이름 <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="홍길동"
                  className="w-full rounded-lg border border-[#2F2F2F] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-[#555555] outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* 이메일 */}
              <div>
                <label className="mb-1.5 block text-sm text-[#A0A0A0]">
                  이메일 <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="patron@example.com"
                  className="w-full rounded-lg border border-[#2F2F2F] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-[#555555] outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* 직군 */}
              <div>
                <label className="mb-1.5 block text-sm text-[#A0A0A0]">
                  직군 <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PROFESSIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setValue('profession', p)}
                      className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${
                        selectedProfession === p
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'border-[#2F2F2F] text-[#A0A0A0] hover:border-[#404040]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {errors.profession && (
                  <p className="mt-1 text-xs text-red-400">{errors.profession.message}</p>
                )}
              </div>

              {/* 개인정보 동의 */}
              <div className="rounded-lg border border-[#2F2F2F] bg-[#111111] p-4 text-sm text-[#666666]">
                <p className="font-medium text-[#A0A0A0]">개인정보 수집 · 이용 동의</p>
                <p className="mt-2 leading-relaxed">
                  더페트론(주식회사 벤처플랫폼)은 멤버십 심사 목적으로 개인정보를 수집합니다.
                  수집 항목: 이름, 이메일, 직군. 보유 기간: 심사 완료 후 1년.
                </p>
                <p className="mt-2 text-xs">신청 버튼 클릭 시 개인정보 수집 및 이용에 동의한 것으로 간주합니다.</p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep('simulator')}
                  className="flex-1 rounded-lg border border-[#2F2F2F] py-3 text-sm text-[#A0A0A0] hover:border-[#404040] hover:text-white"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#D4AF37] py-3 font-semibold text-[#0A0A0A] hover:bg-[#E8CC6A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      패트론 입장 신청 <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── Step 3: 완료 ─── */}
        {step === 'done' && (
          <div className="py-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#D4AF37]/10">
                <CheckCircle2 className="h-10 w-10 text-[#D4AF37]" />
              </div>
            </div>
            <h1 className="mb-3 text-2xl font-bold">신청이 접수되었습니다</h1>
            <p className="mb-8 text-[#A0A0A0]">
              심사 결과는 영업일 기준 2~3일 내 이메일로 안내드립니다.
              <br />
              승인 시 초대 코드와 함께 가입 안내가 발송됩니다.
            </p>

            <div className="mb-8 rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6 text-left">
              <h3 className="mb-4 font-semibold text-[#D4AF37]">심사 프로세스</h3>
              <div className="space-y-3">
                {[
                  '신청 접수 확인 이메일 발송',
                  '더페트론 심사팀 검토 (영업일 2~3일)',
                  '심사 결과 이메일 통보',
                  '승인 시 초대 코드 발송 → 회원가입 → 구독 결제',
                  '패트론 플랫폼 입장',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10 text-xs font-bold text-[#D4AF37]">
                      {i + 1}
                    </div>
                    <p className="text-sm text-[#A0A0A0]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:underline"
            >
              <ArrowLeft size={14} /> 홈으로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StepDot({
  num,
  label,
  active,
  done,
}: {
  num: number
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
          done
            ? 'bg-[#D4AF37] text-[#0A0A0A]'
            : active
              ? 'bg-[#D4AF37]/20 text-[#D4AF37] ring-1 ring-[#D4AF37]'
              : 'bg-[#1A1A1A] text-[#555555]'
        }`}
      >
        {done ? <CheckCircle2 size={16} /> : num}
      </div>
      <span className={`text-xs ${active ? 'text-[#D4AF37]' : 'text-[#555555]'}`}>{label}</span>
    </div>
  )
}
