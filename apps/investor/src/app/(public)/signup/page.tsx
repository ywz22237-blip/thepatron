'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

const schema = z.object({
  code: z.string().length(8, '초대 코드는 8자리입니다'),
  email: z.string().email('이메일을 올바르게 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  passwordConfirm: z.string(),
}).refine((v) => v.password === v.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
})
type FormValues = z.infer<typeof schema>

export default function SignupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: searchParams.get('code') ?? '',
      email: searchParams.get('email') ?? '',
    },
  })

  useEffect(() => {
    const code = searchParams.get('code')
    const email = searchParams.get('email')
    if (code) setValue('code', code.toUpperCase())
    if (email) setValue('email', email)
  }, [searchParams, setValue])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      // 1. 초대코드 검증
      const { data: invite, error: inviteErr } = await supabase
        .from('InviteCode')
        .select('id, email, usedAt, expiresAt')
        .eq('code', values.code.toUpperCase())
        .single()

      if (inviteErr || !invite) {
        toast.error('유효하지 않은 초대 코드입니다')
        setLoading(false)
        return
      }
      if (invite.usedAt) {
        toast.error('이미 사용된 초대 코드입니다')
        setLoading(false)
        return
      }
      if (new Date(invite.expiresAt) < new Date()) {
        toast.error('만료된 초대 코드입니다. 관리자에게 문의하세요')
        setLoading(false)
        return
      }
      if (invite.email.toLowerCase() !== values.email.toLowerCase()) {
        toast.error('초대 코드와 이메일이 일치하지 않습니다')
        setLoading(false)
        return
      }

      // 2. Supabase 계정 생성
      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpErr) {
        toast.error(signUpErr.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        toast.error('계정 생성에 실패했습니다')
        setLoading(false)
        return
      }

      // 3. 초대코드 사용 처리
      await supabase
        .from('InviteCode')
        .update({ usedAt: new Date().toISOString() })
        .eq('id', invite.id)

      // 4. MembershipApplication 연결하여 InvestorProfile 생성
      const { data: app } = await supabase
        .from('MembershipApplication')
        .select('*')
        .eq('id', (await supabase.from('InviteCode').select('applicationId').eq('id', invite.id).single()).data?.applicationId ?? '')
        .single()

      if (app) {
        await supabase.from('InvestorProfile').insert({
          userId: authData.user.id,
          name: app.name,
          email: app.email,
          phone: app.phone,
          profession: app.profession,
          annualIncome: app.annualIncome,
          status: 'ACTIVE',
          inviteCode: values.code,
        })
      }

      setDone(true)
    } catch {
      toast.error('가입 처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">가입 완료!</h1>
          <p className="mt-3 text-sm text-[#9CA3AF] leading-relaxed">
            이메일 인증 링크가 발송되었습니다.<br />
            인증 후 THE PATRON 서비스를 이용하실 수 있습니다.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-8 w-full rounded-lg bg-[#C9A84C] py-3 font-semibold text-black hover:bg-[#D4B860]"
          >
            로그인 하러 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#C9A84C]/10">
            <KeyRound size={28} className="text-[#C9A84C]" />
          </div>
          <h1 className="text-2xl font-bold text-white">회원 가입</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">초대 코드로 THE PATRON에 입장하세요</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 초대 코드 */}
          <div>
            <label className="mb-1.5 block text-sm text-[#9CA3AF]">초대 코드</label>
            <input
              {...register('code')}
              type="text"
              placeholder="XXXXXXXX"
              maxLength={8}
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-3 text-center text-lg font-bold tracking-widest text-[#C9A84C] placeholder-[#4B5563] outline-none focus:border-[#C9A84C] uppercase"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase()
              }}
            />
            {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code.message}</p>}
          </div>

          {/* 이메일 */}
          <div>
            <label className="mb-1.5 block text-sm text-[#9CA3AF]">이메일</label>
            <input
              {...register('email')}
              type="email"
              placeholder="초대 이메일 주소"
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-3 text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#C9A84C]"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="mb-1.5 block text-sm text-[#9CA3AF]">비밀번호</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                placeholder="8자 이상"
                className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-3 pr-10 text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#C9A84C]"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF]"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="mb-1.5 block text-sm text-[#9CA3AF]">비밀번호 확인</label>
            <input
              {...register('passwordConfirm')}
              type={showPw ? 'text' : 'password'}
              placeholder="비밀번호 재입력"
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-3 text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#C9A84C]"
            />
            {errors.passwordConfirm && (
              <p className="mt-1 text-xs text-red-400">{errors.passwordConfirm.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A84C] py-3 font-semibold text-black hover:bg-[#D4B860] disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : '가입 완료'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#6B7280]">
          이미 계정이 있으신가요?{' '}
          <button onClick={() => router.push('/login')} className="text-[#C9A84C] hover:underline">
            로그인
          </button>
        </p>
      </div>
    </div>
  )
}
