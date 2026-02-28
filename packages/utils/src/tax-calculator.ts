/**
 * THE PATRON — 절세 계산기
 * 조세특례제한법 제16조 (벤처투자 소득공제)
 *
 * 공제율:
 *   투자금 ≤ 3,000만원       → 100%
 *   3,000만원 < 투자금 ≤ 5,000만원 → 70%
 *   5,000만원 초과           → 30%
 *
 * 한도: 연간 소득의 50%
 * 절세액 = 공제금액 × 소득세율(6~45%)
 */

import type { TaxCalculatorInput, TaxCalculatorResult } from '@thepatron/types'

// ─── 소득세율 (누진세율, 2024년 기준) ────────────────────────────────────────
// 단위: 만원

const TAX_BRACKETS = [
  { limit: 1400, rate: 0.06 },
  { limit: 5000, rate: 0.15 },
  { limit: 8800, rate: 0.24 },
  { limit: 15000, rate: 0.35 },
  { limit: 30000, rate: 0.38 },
  { limit: 50000, rate: 0.40 },
  { limit: 100000, rate: 0.42 },
  { limit: Infinity, rate: 0.45 },
] as const

/**
 * 연간 소득에 대한 한계세율 반환
 */
export function getMarginalTaxRate(annualIncomeMW: number): number {
  for (const bracket of TAX_BRACKETS) {
    if (annualIncomeMW <= bracket.limit) {
      return bracket.rate
    }
  }
  return 0.45
}

/**
 * 투자금에 대한 소득공제율 반환
 * 조세특례제한법 제16조
 */
export function getDeductionRate(investmentAmountMW: number): number {
  if (investmentAmountMW <= 3000) return 1.0  // 100%
  if (investmentAmountMW <= 5000) return 0.7  // 70%
  return 0.3                                   // 30%
}

/**
 * 구간별 가중 평균 공제율 계산
 * 3,000만원 초과 시 구간별로 나눠서 계산
 */
function getDeductionAmount(investmentAmountMW: number): number {
  if (investmentAmountMW <= 3000) {
    return investmentAmountMW * 1.0
  }
  if (investmentAmountMW <= 5000) {
    return 3000 * 1.0 + (investmentAmountMW - 3000) * 0.7
  }
  return 3000 * 1.0 + 2000 * 0.7 + (investmentAmountMW - 5000) * 0.3
}

/**
 * 절세 계산기 핵심 함수
 *
 * @param input - 투자금(만원), 연간 소득(만원)
 * @returns 절세 계산 결과
 */
export function calculateTaxSaving(input: TaxCalculatorInput): TaxCalculatorResult {
  const { investmentAmount, annualIncome } = input

  // 1. 소득공제율 (대표 구간 기준)
  const deductionRate = getDeductionRate(investmentAmount)

  // 2. 구간별 공제 금액 계산
  const deductionAmount = getDeductionAmount(investmentAmount)

  // 3. 연간 소득 50% 한도 적용
  const incomeCap = annualIncome * 0.5
  const effectiveDeduction = Math.min(deductionAmount, incomeCap)

  // 4. 한계세율 적용하여 절세액 계산
  const incomeTaxRate = getMarginalTaxRate(annualIncome)
  const estimatedTaxSaving = Math.floor(effectiveDeduction * incomeTaxRate)

  return {
    investmentAmount,
    deductionRate,
    deductionAmount: Math.floor(deductionAmount),
    effectiveDeduction: Math.floor(effectiveDeduction),
    estimatedTaxSaving,
    incomeTaxRate,
  }
}

/**
 * 딜 카드용 간단 절세액 계산
 * 투자금과 연간 소득으로 예상 절세액만 반환
 */
export function getEstimatedTaxSaving(
  investmentAmountMW: number,
  annualIncomeMW: number
): number {
  const result = calculateTaxSaving({
    investmentAmount: investmentAmountMW,
    annualIncome: annualIncomeMW,
  })
  return result.estimatedTaxSaving
}

/**
 * 만원 → 한국 원화 포맷
 * @example formatKRW(5000) → "5,000만원"
 */
export function formatKRW(amountMW: number): string {
  if (amountMW >= 10000) {
    const eok = Math.floor(amountMW / 10000)
    const man = amountMW % 10000
    if (man === 0) return `${eok.toLocaleString('ko-KR')}억원`
    return `${eok.toLocaleString('ko-KR')}억 ${man.toLocaleString('ko-KR')}만원`
  }
  return `${amountMW.toLocaleString('ko-KR')}만원`
}

/**
 * 퍼센트 포맷
 * @example formatPercent(0.35) → "35%"
 */
export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`
}
