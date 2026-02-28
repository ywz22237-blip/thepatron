// PATCH /api/matches/[id]/status
// 매칭 상태 변경 + 투자자 이메일 알림 발송

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const MATCH_STATUS_KO: Record<string, string> = {
  REVIEWING: '검토 중',
  DELIVERED: '기업 전달 완료',
  MEETING: '미팅 단계',
  DEAL_ROOM: 'Deal Room 입장',
  CONTRACT: '계약 진행 중',
  COMPLETED: '투자 완료',
}

const schema = z.object({
  status: z.enum(['REQUESTED', 'REVIEWING', 'DELIVERED', 'MEETING', 'DEAL_ROOM', 'CONTRACT', 'COMPLETED']),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: admin } = await supabase
    .from('AdminProfile')
    .select('role')
    .eq('userId', user.id)
    .single()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const parse = schema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const newStatus = parse.data.status
  const updateData: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'DEAL_ROOM') updateData.ndaSigned = true

  // 매칭 + 투자자 + 딜 조회
  const { data: match } = await supabase
    .from('MatchRequest')
    .select('id, investor:InvestorProfile(name, email), deal:Deal(briefTitle)')
    .eq('id', params.id)
    .single()

  if (!match) return NextResponse.json({ error: '매칭 없음' }, { status: 404 })

  const { error } = await supabase
    .from('MatchRequest')
    .update(updateData)
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const investor = Array.isArray(match.investor) ? match.investor[0] : match.investor
  const deal = Array.isArray(match.deal) ? match.deal[0] : match.deal

  // 인앱 알림 — InvestorNotification 생성
  if (newStatus !== 'REQUESTED' && investor) {
    const statusKo = MATCH_STATUS_KO[newStatus] || newStatus
    const { data: investorProfile } = await supabase
      .from('InvestorProfile')
      .select('id')
      .eq('email', investor.email)
      .single()

    if (investorProfile) {
      supabase.from('InvestorNotification').insert({
        investorId: investorProfile.id,
        type: 'MATCH_UPDATE',
        title: `매칭 상태 업데이트 — ${statusKo}`,
        body: `"${deal?.briefTitle ?? '딜'}" 매칭이 ${statusKo} 단계로 변경되었습니다.`,
        data: { matchId: params.id },
      }).then(() => {})
    }
  }

  // 이메일 알림 — REQUESTED 제외한 상태에서 발송


  if (newStatus !== 'REQUESTED' && investor?.email) {
    const statusKo = MATCH_STATUS_KO[newStatus] || newStatus
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'THE PATRON <noreply@thepatron.co.kr>',
          to: investor.email,
          subject: `[THE PATRON] 매칭 상태 업데이트 — ${statusKo}`,
          html: `
<!DOCTYPE html>
<html>
<body style="background:#0A0A0A;color:#E5E7EB;font-family:sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" style="background:#141414;border:1px solid #2A2A2A;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#C9A84C;padding:20px 32px;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#0A0A0A;font-weight:700;">THE PATRON</p>
        </td></tr>
        <tr><td style="padding:36px 32px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fff;">매칭 상태 업데이트</p>
          <p style="margin:0 0 28px;font-size:14px;color:#9CA3AF;">안녕하세요, ${investor.name}님</p>
          <div style="background:#1A1A1A;border-left:3px solid #C9A84C;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">딜</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#fff;">${deal?.briefTitle ?? '-'}</p>
          </div>
          <div style="text-align:center;padding:24px;background:#1E1E1E;border-radius:12px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#9CA3AF;">현재 단계</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:#C9A84C;">${statusKo}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_INVESTOR_URL || 'http://localhost:3000'}/matches"
             style="display:block;background:#C9A84C;color:#0A0A0A;font-weight:700;font-size:14px;text-align:center;padding:13px;border-radius:10px;text-decoration:none;">
            매칭 현황 확인하기
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        }),
      })
    } catch {
      // 이메일 실패 로그만 기록, 상태 변경은 성공
    }
  }

  return NextResponse.json({ success: true, status: newStatus })
}
