import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  companyName: z.string().min(2),
  ceoName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  website: z.string().url().optional().or(z.literal('')),
  bizNumber: z.string().optional(),
  category: z.string().min(1),
  stage: z.string().min(1),
  targetAmount: z.number().int().positive(),
  minInvestment: z.number().int().positive(),
  valuation: z.number().int().positive().optional(),
  briefTitle: z.string().min(10),
  description: z.string().min(100),
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

    const { data: { user } } = await supabase.auth.getUser()

    // 기업 프로필 조회 또는 생성
    let companyId: string | null = null

    if (user) {
      const { data: existing } = await supabase
        .from('CompanyProfile')
        .select('id')
        .eq('userId', user.id)
        .single()

      if (existing) {
        companyId = existing.id
      } else {
        const { data: newProfile } = await supabase
          .from('CompanyProfile')
          .insert({
            userId: user.id,
            name: data.companyName,
            ceoName: data.ceoName,
            email: data.email,
            phone: data.phone,
            website: data.website || null,
            bizNumber: data.bizNumber || null,
          })
          .select('id')
          .single()
        companyId = newProfile?.id ?? null
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: '로그인이 필요합니다' } },
        { status: 401 }
      )
    }

    // 딜 생성
    const { data: deal, error } = await supabase
      .from('Deal')
      .insert({
        companyId,
        briefTitle: data.briefTitle,
        category: data.category,
        stage: data.stage,
        targetAmount: data.targetAmount,
        minInvestment: data.minInvestment,
        maxInvestment: null,
        valuation: data.valuation ?? null,
        description: data.description,
        status: 'DRAFT',
        feePaid: false,
        feeAmount: 1000000,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: '딜 등록 중 오류가 발생했습니다' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { id: deal.id } }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요' } },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}
