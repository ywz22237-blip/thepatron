// POST /api/webhooks/modusign
// 모두싸인 서명 완료 웹훅 수신

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json()

  // 모두싸인 웹훅 이벤트: document.completed
  if (body.event !== 'document.completed') {
    return NextResponse.json({ received: true })
  }

  const documentId = body.document?.id
  if (!documentId) return NextResponse.json({ received: true })

  const supabase = createClient()

  // NdaRequest 조회
  const { data: ndaReq } = await supabase
    .from('NdaRequest')
    .select('id, matchId')
    .eq('modusignDocId', documentId)
    .single()

  if (!ndaReq) return NextResponse.json({ received: true })

  // NDA 서명 완료 처리
  await supabase
    .from('NdaRequest')
    .update({ status: 'SIGNED', signedAt: new Date().toISOString() })
    .eq('id', ndaReq.id)

  // MatchRequest.ndaSigned = true
  await supabase
    .from('MatchRequest')
    .update({ ndaSigned: true, ndaSignedAt: new Date().toISOString() })
    .eq('id', ndaReq.matchId)

  return NextResponse.json({ received: true })
}
