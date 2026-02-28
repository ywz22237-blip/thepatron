// POST /api/billing/cancel
// 구독 해지 요청

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelPayment } from '@/lib/toss'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: investor } = await supabase
    .from('InvestorProfile')
    .select('id')
    .eq('userId', user.id)
    .single()

  if (!investor) return NextResponse.json({ error: '투자자 정보 없음' }, { status: 404 })

  // 활성 구독 조회
  const { data: sub } = await supabase
    .from('Subscription')
    .select('*')
    .eq('investorId', investor.id)
    .eq('status', 'ACTIVE')
    .single()

  if (!sub) return NextResponse.json({ error: '활성 구독 없음' }, { status: 404 })

  try {
    // 가장 최근 결제 취소 (구독 해지 — 실제로는 다음 결제일부터 중단)
    if (sub.tossPaymentKey) {
      await cancelPayment(sub.tossPaymentKey, '고객 구독 해지 요청')
    }

    // 구독 상태 CANCELLED 처리
    await supabase
      .from('Subscription')
      .update({ status: 'CANCELLED', cancelledAt: new Date().toISOString() })
      .eq('id', sub.id)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '해지 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
