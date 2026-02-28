'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = ['IT/SaaS', '바이오/헬스케어', '핀테크', '커머스/리테일', '에듀테크', '클린테크', '기타']
const STAGES = ['Pre-Seed', 'Seed', 'Pre-A', 'Series A', 'Series B', 'Series C+']

const schema = z.object({
  companyName: z.string().min(2, '기업명은 2자 이상이어야 합니다'),
  ceoName: z.string().min(2, '대표자명을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력하세요'),
  phone: z.string().min(10, '연락처를 입력해주세요'),
  website: z.string().url('올바른 URL을 입력하세요 (https:// 포함)').optional().or(z.literal('')),
  bizNumber: z.string().optional(),
  category: z.string().min(1, '섹터를 선택해주세요'),
  stage: z.string().min(1, '투자 단계를 선택해주세요'),
  targetAmount: z.number().int().positive('목표 투자금을 입력해주세요'),
  minInvestment: z.number().int().positive('최소 투자금을 입력해주세요'),
  valuation: z.number().int().positive().optional(),
  briefTitle: z.string().min(10, '투자자 표시 제목을 10자 이상 입력해주세요').max(100),
  description: z.string().min(100, '딜 상세 내용을 100자 이상 작성해주세요'),
})

type FormValues = z.infer<typeof schema>

export default function CompanyApplyPage() {
  const [step, setStep] = useState<'form' | 'done'>('form')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const selectedCategory = watch('category')
  const selectedStage = watch('stage')

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/deals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message || '신청 처리 중 오류가 발생했습니다')
        setSubmitting(false)
        return
      }
      setStep('done')
    } catch {
      toast.error('네트워크 오류가 발생했습니다')
      setSubmitting(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-[#0F172A]">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1B3A6B]/10">
              <CheckCircle2 className="h-10 w-10 text-[#1B3A6B]" />
            </div>
          </div>
          <h1 className="mb-3 text-2xl font-bold">딜 등재 신청 완료</h1>
          <p className="mb-8 text-[#64748B]">
            신청이 접수되었습니다. 더페트론 심사팀이 검토 후 영업일 3~5일 내 연락드립니다.
          </p>
          <div className="mb-8 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 text-left">
            <h3 className="mb-3 font-semibold text-[#1B3A6B]">심사 이후 프로세스</h3>
            <div className="space-y-2">
              {[
                '심사팀 서류 검토 (3~5영업일)',
                '추가 자료 요청 또는 심사 결과 통보',
                '승인 시 중계료 100만원 납부 안내',
                '납부 확인 후 플랫폼 딜 등재',
                '더페트론 매니저 패트론 매칭 시작',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B]/10 text-xs font-bold text-[#1B3A6B]">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#64748B]">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <Link href="/" className="text-sm text-[#1B3A6B] hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      {/* 헤더 */}
      <header className="border-b border-[#E2E8F0]">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A]">
            <ArrowLeft size={18} />
            <span className="hidden sm:block">홈으로</span>
          </Link>
          <span className="text-[#E2E8F0]">|</span>
          <span className="font-bold text-[#1B3A6B]">THE PATRON</span>
          <span className="ml-auto text-sm text-[#64748B]">딜 등재 신청</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold lg:text-3xl">딜 등재 신청</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            VC Route를 통해 유입된 스타트업만 신청 가능합니다.
            <br />
            심사 후 중계료 100만원 납부 시 플랫폼에 등재됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 기업 정보 */}
          <section>
            <h2 className="mb-4 border-b border-[#E2E8F0] pb-2 font-semibold text-[#1B3A6B]">
              기업 정보
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="기업명 *" error={errors.companyName?.message}>
                  <input
                    {...register('companyName')}
                    placeholder="주식회사 ○○○"
                    className={inputCls}
                  />
                </Field>
                <Field label="대표자명 *" error={errors.ceoName?.message}>
                  <input {...register('ceoName')} placeholder="홍길동" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="이메일 *" error={errors.email?.message}>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="ceo@startup.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="연락처 *" error={errors.phone?.message}>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="02-0000-0000"
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="사업자등록번호" error={errors.bizNumber?.message}>
                  <input
                    {...register('bizNumber')}
                    placeholder="000-00-00000"
                    className={inputCls}
                  />
                </Field>
                <Field label="웹사이트" error={errors.website?.message}>
                  <input
                    {...register('website')}
                    type="url"
                    placeholder="https://startup.com"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* 딜 정보 */}
          <section>
            <h2 className="mb-4 border-b border-[#E2E8F0] pb-2 font-semibold text-[#1B3A6B]">
              딜 정보
            </h2>
            <div className="space-y-4">
              {/* 섹터 */}
              <div>
                <label className="mb-2 block text-sm text-[#64748B]">섹터 *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue('category', cat)}
                      className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                        selectedCategory === cat
                          ? 'border-[#1B3A6B] bg-[#1B3A6B]/10 text-[#1B3A6B]'
                          : 'border-[#E2E8F0] text-[#64748B] hover:border-[#1B3A6B]/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>
                )}
              </div>

              {/* 투자 단계 */}
              <div>
                <label className="mb-2 block text-sm text-[#64748B]">투자 단계 *</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setValue('stage', stage)}
                      className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                        selectedStage === stage
                          ? 'border-[#1B3A6B] bg-[#1B3A6B]/10 text-[#1B3A6B]'
                          : 'border-[#E2E8F0] text-[#64748B] hover:border-[#1B3A6B]/30'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
                {errors.stage && (
                  <p className="mt-1 text-xs text-red-500">{errors.stage.message}</p>
                )}
              </div>

              {/* 투자 금액 */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="목표 투자금 (만원) *" error={errors.targetAmount?.message}>
                  <input
                    {...register('targetAmount', { valueAsNumber: true })}
                    type="number"
                    placeholder="5000"
                    min={0}
                    className={inputCls}
                  />
                </Field>
                <Field label="최소 투자금 (만원) *" error={errors.minInvestment?.message}>
                  <input
                    {...register('minInvestment', { valueAsNumber: true })}
                    type="number"
                    placeholder="1000"
                    min={0}
                    className={inputCls}
                  />
                </Field>
                <Field label="기업가치 (만원)" error={errors.valuation?.message}>
                  <input
                    {...register('valuation', { valueAsNumber: true })}
                    type="number"
                    placeholder="50000"
                    min={0}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* 투자자 표시 제목 */}
              <Field
                label="투자자 표시 제목 *"
                error={errors.briefTitle?.message}
                hint="기업명 없이 딜을 소개하는 제목 (예: 국내 1위 B2B SaaS 솔루션 Pre-A)"
              >
                <input
                  {...register('briefTitle')}
                  placeholder="국내 1위 B2B SaaS 솔루션 Pre-A"
                  className={inputCls}
                  maxLength={100}
                />
              </Field>

              {/* 딜 상세 설명 */}
              <Field
                label="딜 상세 내용 *"
                error={errors.description?.message}
                hint="NDA 체결 투자자에게만 공개됩니다. 사업 개요, 성장 지표, 투자 사용처 등을 포함하세요."
              >
                <textarea
                  {...register('description')}
                  rows={8}
                  placeholder="사업 개요, 핵심 지표, 투자 사용처, 팀 소개 등을 작성해주세요..."
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>
          </section>

          {/* 중요 안내 */}
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
            <p className="font-semibold text-[#0F172A]">신청 전 확인사항</p>
            <ul className="mt-2 space-y-1">
              <li>• 심사 통과 후 중계료 <strong className="text-[#0F172A]">100만원</strong>이 발생합니다</li>
              <li>• 기업명은 투자자(패트론)에게 NDA 체결 전까지 공개되지 않습니다</li>
              <li>• VC Route 유입 딜만 신청 가능합니다</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] py-3 font-semibold text-white hover:bg-[#2B5099] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>딜 등재 신청하기 <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#CBD5E1] outline-none transition-all focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]/20'

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-[#64748B]">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-[#94A3B8]">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
