// POST /api/nda/request
// DEAL_ROOM 단계에서 투자자 NDA 서명 요청

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requestNdaSignature } from '@/lib/modusign'
import { z } from 'zod'

const schema = z.object({ matchId: z.string() })

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parse = schema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })

  const { matchId } = parse.data

  // 매칭 + 투자자 + 딜 조회
  const { data: match } = await supabase
    .from('MatchRequest')
    .select(`
      id, status, ndaSigned,
      investor:InvestorProfile(id, name, email),
      deal:Deal(briefTitle)
    `)
    .eq('id', matchId)
    .single()

  if (!match) return NextResponse.json({ error: '매칭 없음' }, { status: 404 })
  if (match.status !== 'DEAL_ROOM') {
    return NextResponse.json({ error: 'DEAL_ROOM 단계에서만 NDA 요청 가능' }, { status: 400 })
  }
  if (match.ndaSigned) {
    return NextResponse.json({ error: '이미 NDA가 서명되었습니다' }, { status: 409 })
  }

  const investor = Array.isArray(match.investor) ? match.investor[0] : match.investor
  const deal = Array.isArray(match.deal) ? match.deal[0] : match.deal

  // 본인 확인 (투자자 자신의 매칭만 요청 가능)
  if (investor?.id) {
    const { data: myProfile } = await supabase
      .from('InvestorProfile')
      .select('id')
      .eq('userId', user.id)
      .single()
    if (!myProfile || myProfile.id !== investor.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // 기존 대기 중인 NDA 요청 확인
  const { data: existing } = await supabase
    .from('NdaRequest')
    .select('id, status, modusignDocId')
    .eq('matchId', matchId)
    .eq('status', 'PENDING')
    .single()

  if (existing) {
    return NextResponse.json({
      success: true,
      message: '이미 서명 요청이 발송되었습니다. 이메일을 확인하세요.',
      ndaRequestId: existing.id,
    })
  }

  try {
    const { documentId, signingUrl } = await requestNdaSignature({
      investorName: investor?.name ?? '',
      investorEmail: investor?.email ?? '',
      dealTitle: deal?.briefTitle ?? '',
      matchId,
    })

    // NDA 요청 기록 저장
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 3)

    await supabase.from('NdaRequest').insert({
      matchId,
      investorId: investor?.id,
      modusignDocId: documentId,
      status: 'PENDING',
      expiresAt: expiresAt.toISOString(),
    })

    return NextResponse.json({ success: true, signingUrl, documentId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'NDA 요청 실패'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
