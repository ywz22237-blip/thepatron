// POST /api/billing/setup
// 카드 등록(빌링키 발급) 완료 후 호출 — Toss Payments 빌링키를 DB에 저장하고 첫 달 결제 실행

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { issueBillingKey, chargeBilling } from '@/lib/toss'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const schema = z.object({
  authKey: z.string(),
  customerKey: z.string(),
})

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parse = schema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  const { authKey, customerKey } = parse.data

  // 투자자 프로필 조회
  const { data: investor } = await supabase
    .from('InvestorProfile')
    .select('id, name, email, status')
    .eq('userId', user.id)
    .single()

  if (!investor) return NextResponse.json({ error: '투자자 정보 없음' }, { status: 404 })
  if (investor.status !== 'ACTIVE') return NextResponse.json({ error: '활성화된 계정이 아닙니다' }, { status: 403 })

  try {
    // 1. 빌링키 발급
    const billing = await issueBillingKey(authKey, customerKey)

    // 2. 첫 달 결제 실행
    const MONTHLY_AMOUNT = 59000
    const orderId = `PAT-${nanoid(10)}`
    const payment = await chargeBilling({
      billingKey: billing.billingKey,
      customerKey,
      amount: MONTHLY_AMOUNT,
      orderId,
      orderName: 'THE PATRON 월 구독 (59,000원)',
      customerEmail: investor.email,
      customerName: investor.name,
    })

    // 3. 구독 레코드 생성
    const nextBillingAt = new Date()
    nextBillingAt.setMonth(nextBillingAt.getMonth() + 1)

    const { data: sub, error: subErr } = await supabase.from('Subscription').insert({
      investorId: investor.id,
      status: 'ACTIVE',
      amount: MONTHLY_AMOUNT,
      tossPaymentKey: payment.paymentKey,
      tossOrderId: orderId,
      tossBillingKey: billing.billingKey,
      nextBillingAt: nextBillingAt.toISOString(),
    }).select().single()

    if (subErr) throw new Error(subErr.message)

    // 4. 결제 내역 저장
    await supabase.from('SubscriptionPayment').insert({
      subscriptionId: sub.id,
      amount: MONTHLY_AMOUNT,
      status: 'SUCCESS',
      tossPaymentKey: payment.paymentKey,
      tossOrderId: orderId,
      paidAt: payment.approvedAt,
    })

    return NextResponse.json({ success: true, subscriptionId: sub.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '결제 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
