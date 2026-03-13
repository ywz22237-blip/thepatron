import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { syncApplicationToNotion } from '@/lib/notion'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  profession: z.string().min(1),
  annualIncome: z.number().int().positive().optional(),
  simulatedInvestment: z.number().int().positive().optional(),
  simulatedTaxSaving: z.number().int().positive().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // 중복 신청 확인
    const { data: existing } = await supabase
      .from('MembershipApplication')
      .select('id, status')
      .eq('email', data.email)
      .single()

    if (existing) {
      if (existing.status === 'PENDING') {
        return NextResponse.json(
          { error: { code: 'ALREADY_APPLIED', message: '이미 심사 대기 중인 신청이 있습니다.' } },
          { status: 409 }
        )
      }
      if (existing.status === 'APPROVED') {
        return NextResponse.json(
          { error: { code: 'ALREADY_APPROVED', message: '이미 승인된 계정입니다. 초대 이메일을 확인하세요.' } },
          { status: 409 }
        )
      }
    }

    const { data: application, error } = await supabase
      .from('MembershipApplication')
      .insert({
        name: data.name,
        email: data.email,
        profession: data.profession,
        annualIncome: data.annualIncome ?? null,
        simulatedInvestment: data.simulatedInvestment ?? null,
        simulatedTaxSaving: data.simulatedTaxSaving ?? null,
        status: 'PENDING',
      })
      .select('id, createdAt')
      .single()

    if (error) {
      console.error('Application insert error:', error)
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: '신청 처리 중 오류가 발생했습니다.' } },
        { status: 500 }
      )
    }

    // Notion DB 동기화 (비동기 — 실패해도 신청은 성공 처리)
    if (process.env.NOTION_API_KEY && process.env.NOTION_APPLICATIONS_DB_ID) {
      syncApplicationToNotion({
        id: application.id,
        name: data.name,
        email: data.email,
        profession: data.profession,
        annualIncome: data.annualIncome,
        simulatedInvestment: data.simulatedInvestment,
        simulatedTaxSaving: data.simulatedTaxSaving,
        createdAt: (application as { id: string; createdAt: string }).createdAt ?? new Date().toISOString(),
      })
        .then((notionPageId) => {
          if (notionPageId) {
            supabase.from('MembershipApplication')
              .update({ notionPageId })
              .eq('id', application.id)
              .then(() => {})
          }
        })
        .catch((err) => console.error('Notion sync failed:', err))
    }

    return NextResponse.json({ data: { id: application.id } }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.' } },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    )
  }
}
