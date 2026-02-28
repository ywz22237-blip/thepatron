// POST /api/webhooks/toss
// Toss Payments 웹훅 수신 — 자동 결제 결과 처리
// https://docs.tosspayments.com/guides/webhook

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!

// 웹훅 시그니처 검증
function verifySignature(request: Request): boolean {
  // Toss는 Basic Auth 헤더로 검증
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return false
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')
  return authHeader === `Basic ${encoded}`
}

export async function POST(request: Request) {
  if (!verifySignature(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { eventType, data } = body

  const supabase = createClient()

  if (eventType === 'PAYMENT_STATUS_CHANGED') {
    const { paymentKey, orderId, status, approvedAt, failureMessage } = data

    // 구독 조회
    const { data: sub } = await supabase
      .from('Subscription')
      .select('id, investorId')
      .eq('tossOrderId', orderId)
      .single()

    if (!sub) {
      // 새 결제 (다음 달 자동 결제)
      const { data: subByKey } = await supabase
        .from('Subscription')
        .select('id, investorId')
        .eq('tossPaymentKey', paymentKey)
        .single()

      if (!subByKey) return NextResponse.json({ received: true })

      if (status === 'DONE') {
        const nextBillingAt = new Date()
        nextBillingAt.setMonth(nextBillingAt.getMonth() + 1)

        await supabase.from('SubscriptionPayment').insert({
          subscriptionId: subByKey.id,
          amount: 59000,
          status: 'SUCCESS',
          tossPaymentKey: paymentKey,
          tossOrderId: orderId,
          paidAt: approvedAt,
        })

        await supabase
          .from('Subscription')
          .update({ status: 'ACTIVE', nextBillingAt: nextBillingAt.toISOString() })
          .eq('id', subByKey.id)
      } else if (status === 'ABORTED' || status === 'EXPIRED') {
        await supabase.from('SubscriptionPayment').insert({
          subscriptionId: subByKey.id,
          amount: 59000,
          status: 'FAILED',
          tossPaymentKey: paymentKey,
          tossOrderId: orderId,
          failReason: failureMessage,
        })

        await supabase
          .from('Subscription')
          .update({ status: 'PAST_DUE' })
          .eq('id', subByKey.id)
      }
      return NextResponse.json({ received: true })
    }

    // 기존 구독의 상태 업데이트
    if (status === 'DONE') {
      await supabase
        .from('Subscription')
        .update({ status: 'ACTIVE', tossPaymentKey: paymentKey })
        .eq('id', sub.id)
    } else if (status === 'ABORTED' || status === 'EXPIRED') {
      await supabase
        .from('Subscription')
        .update({ status: 'PAST_DUE' })
        .eq('id', sub.id)

      await supabase.from('SubscriptionPayment').upsert({
        subscriptionId: sub.id,
        amount: 59000,
        status: 'FAILED',
        tossPaymentKey: paymentKey,
        tossOrderId: orderId,
        failReason: failureMessage,
      })
    }
  }

  return NextResponse.json({ received: true })
}
