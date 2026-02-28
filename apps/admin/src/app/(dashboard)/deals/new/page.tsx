'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

const CATEGORIES = ['IT/SaaS', 'BIO/헬스케어', '핀테크', '이커머스', '제조/하드웨어', '콘텐츠/미디어', 'AI', '기타']
const STAGES = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Pre-IPO']

export default function NewDealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    briefTitle: '',
    category: '',
    stage: '',
    targetAmount: '',
    minInvestment: '',
    maxInvestment: '',
    valuation: '',
    equity: '',
    description: '',
    companyName: '',
    companyEmail: '',
    companyCeoName: '',
    companyPhone: '',
    companyWebsite: '',
    companyBizNumber: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const { dealId } = await res.json()
      router.push(`/deals/${dealId}`)
    } else {
      const data = await res.json()
      setError(data.error || '딜 등록에 실패했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/deals"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">딜 직접 등록</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">관리자가 직접 딜을 등록합니다. 등록 즉시 ACTIVE 상태로 공개됩니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 왼쪽 — 딜 정보 */}
        <div className="space-y-5 lg:col-span-2">
          {/* 기본 정보 */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[#0F172A]">딜 기본 정보</h2>
            <div className="space-y-4">
              <Field label="딜 제목 (공개 제목)" required>
                <input
                  name="briefTitle"
                  value={form.briefTitle}
                  onChange={handleChange}
                  placeholder="예: AI 기반 세무 자동화 SaaS"
                  required
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="카테고리" required>
                  <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
                    <option value="">선택</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="스테이지" required>
                  <select name="stage" value={form.stage} onChange={handleChange} required className={inputClass}>
                    <option value="">선택</option>
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </div>

          {/* 투자 조건 */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[#0F172A]">투자 조건 (만원 단위)</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="목표 투자금" required>
                <input
                  name="targetAmount"
                  type="number"
                  value={form.targetAmount}
                  onChange={handleChange}
                  placeholder="50000 (= 5억)"
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="최소 투자금" required>
                <input
                  name="minInvestment"
                  type="number"
                  value={form.minInvestment}
                  onChange={handleChange}
                  placeholder="5000 (= 5천만)"
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="최대 투자금 (선택)">
                <input
                  name="maxInvestment"
                  type="number"
                  value={form.maxInvestment}
                  onChange={handleChange}
                  placeholder="10000 (= 1억)"
                  className={inputClass}
                />
              </Field>
              <Field label="기업가치 (선택)">
                <input
                  name="valuation"
                  type="number"
                  value={form.valuation}
                  onChange={handleChange}
                  placeholder="200000 (= 200억)"
                  className={inputClass}
                />
              </Field>
              <Field label="지분율 % (선택)">
                <input
                  name="equity"
                  type="number"
                  step="0.1"
                  value={form.equity}
                  onChange={handleChange}
                  placeholder="10.5"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {/* 딜 상세 설명 */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[#0F172A]">딜 상세 설명 (NDA 후 공개)</h2>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={10}
              placeholder="기업 소개, 사업 모델, 팀 구성, 재무 현황, 투자 사용 계획 등을 상세히 작성하세요.&#10;&#10;이 내용은 NDA 서명 완료 후 투자자에게 공개됩니다."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* 오른쪽 — 기업 정보 + 등록 버튼 */}
        <div className="space-y-5">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[#0F172A]">기업 정보 (관리자 전용)</h2>
            <div className="space-y-4">
              <Field label="기업명">
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="(주)예시기업"
                  className={inputClass}
                />
              </Field>
              <Field label="기업 이메일">
                <input
                  name="companyEmail"
                  type="email"
                  value={form.companyEmail}
                  onChange={handleChange}
                  placeholder="ceo@example.com"
                  className={inputClass}
                />
              </Field>
              <Field label="대표자명">
                <input
                  name="companyCeoName"
                  value={form.companyCeoName}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className={inputClass}
                />
              </Field>
              <Field label="연락처">
                <input
                  name="companyPhone"
                  value={form.companyPhone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  className={inputClass}
                />
              </Field>
              <Field label="웹사이트">
                <input
                  name="companyWebsite"
                  value={form.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </Field>
              <Field label="사업자등록번호">
                <input
                  name="companyBizNumber"
                  value={form.companyBizNumber}
                  onChange={handleChange}
                  placeholder="000-00-00000"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {/* 등록 버튼 */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <div className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              등록 즉시 <strong>ACTIVE</strong> 상태로 투자자에게 공개됩니다.
            </div>
            {error && (
              <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Plus size={16} />
              {loading ? '등록 중...' : '딜 등록하기'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#CBD5E1] outline-none transition-colors focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]'

function Field({
  label,
  required = false,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#374151]">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
