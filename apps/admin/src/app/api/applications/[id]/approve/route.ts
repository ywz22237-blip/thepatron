// POST /api/applications/[id]/approve
// 멤버십 신청 승인 → 초대코드 생성 → Resend 이메일 발송

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInviteEmail } from '@/lib/resend'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // AdminProfile.role 검증
  const { data: admin } = await supabase
    .from('AdminProfile')
    .select('role')
    .eq('userId', user.id)
    .single()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const reviewNote = body.reviewNote || null

  // 신청서 조회
  const { data: application } = await supabase
    .from('MembershipApplication')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!application) return NextResponse.json({ error: '신청서 없음' }, { status: 404 })
  if (application.status !== 'PENDING') {
    return NextResponse.json({ error: '이미 처리된 신청서입니다' }, { status: 409 })
  }

  // 초대코드 생성 (중복 방지 루프)
  let code = generateInviteCode()
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from('InviteCode')
      .select('id')
      .eq('code', code)
      .single()
    if (!existing) break
    code = generateInviteCode()
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // 트랜잭션처럼 처리 (Supabase는 RPC로 처리 가능하나, 여기서는 순차적으로)
  const { error: codeErr } = await supabase.from('InviteCode').insert({
    code,
    email: application.email,
    applicationId: application.id,
    expiresAt: expiresAt.toISOString(),
  })
  if (codeErr) return NextResponse.json({ error: codeErr.message }, { status: 500 })

  const { error: appErr } = await supabase
    .from('MembershipApplication')
    .update({ status: 'APPROVED', reviewNote })
    .eq('id', params.id)
  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 })

  // 이메일 발송
  const investorUrl = process.env.NEXT_PUBLIC_INVESTOR_URL || 'http://localhost:3000'
  const signupUrl = `${investorUrl}/signup?code=${code}&email=${encodeURIComponent(application.email)}`

  try {
    await sendInviteEmail({
      to: application.email,
      name: application.name,
      code,
      signupUrl,
    })
  } catch {
    // 이메일 실패해도 승인은 완료됨 — 관리자가 수동 발송 가능
    return NextResponse.json({
      success: true,
      code,
      warning: '이메일 발송에 실패했습니다. 초대코드를 직접 전달하세요.',
    })
  }

  return NextResponse.json({ success: true, code })
}
