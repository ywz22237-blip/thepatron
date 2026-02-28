import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: admin } = await supabase
    .from('AdminProfile')
    .select('role')
    .eq('userId', user.id)
    .single()

  if (!admin || !['SUPER_ADMIN', 'MANAGER'].includes(admin.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const {
    briefTitle,
    category,
    stage,
    targetAmount,
    minInvestment,
    maxInvestment,
    valuation,
    equity,
    description,
    companyName,
    companyEmail,
    companyCeoName,
    companyPhone,
    companyWebsite,
    companyBizNumber,
  } = body

  if (!briefTitle || !category || !stage || !targetAmount || !minInvestment || !description) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요' }, { status: 400 })
  }

  // 1. CompanyProfile 생성 (또는 이메일로 기존 조회)
  let companyId: string

  if (companyEmail) {
    const { data: existing } = await supabase
      .from('CompanyProfile')
      .select('id')
      .eq('email', companyEmail)
      .single()

    if (existing) {
      companyId = existing.id
    } else {
      const { data: newCompany, error: companyErr } = await supabase
        .from('CompanyProfile')
        .insert({
          name: companyName || '미등록 기업',
          email: companyEmail,
          ceoName: companyCeoName || null,
          phone: companyPhone || null,
          website: companyWebsite || null,
          bizNumber: companyBizNumber || null,
          // userId는 회사 계정이 없으므로 더미 UUID 사용
          userId: crypto.randomUUID(),
        })
        .select('id')
        .single()

      if (companyErr || !newCompany) {
        return NextResponse.json({ error: '기업 정보 저장 실패: ' + companyErr?.message }, { status: 500 })
      }
      companyId = newCompany.id
    }
  } else {
    // 기업 정보 없이 등록 — 더미 CompanyProfile
    const { data: newCompany, error: companyErr } = await supabase
      .from('CompanyProfile')
      .insert({
        name: companyName || '미등록 기업',
        email: `admin-created-${Date.now()}@thepatron.co.kr`,
        userId: crypto.randomUUID(),
      })
      .select('id')
      .single()

    if (companyErr || !newCompany) {
      return NextResponse.json({ error: '기업 정보 저장 실패' }, { status: 500 })
    }
    companyId = newCompany.id
  }

  // 2. Deal 생성
  const { data: deal, error: dealErr } = await supabase
    .from('Deal')
    .insert({
      companyId,
      briefTitle,
      category,
      stage,
      targetAmount: Number(targetAmount),
      minInvestment: Number(minInvestment),
      maxInvestment: maxInvestment ? Number(maxInvestment) : null,
      valuation: valuation ? Number(valuation) : null,
      equity: equity ? Number(equity) : null,
      description,
      status: 'ACTIVE', // 관리자가 직접 등록하면 바로 ACTIVE
    })
    .select('id')
    .single()

  if (dealErr || !deal) {
    return NextResponse.json({ error: '딜 등록 실패: ' + dealErr?.message }, { status: 500 })
  }

  // 3. 관리자 알림 생성
  await supabase.from('AdminNotification').insert({
    type: 'NEW_DEAL',
    title: '새 딜 등록',
    body: `관리자에 의해 "${briefTitle}" 딜이 등록되었습니다.`,
    data: { dealId: deal.id },
  }).then(() => {})

  return NextResponse.json({ dealId: deal.id }, { status: 201 })
}
