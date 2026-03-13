'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('이메일을 올바르게 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  passwordConfirm: z.string(),
  phone: z
    .string()
    .min(10, '올바른 연락처를 입력하세요')
    .regex(/^[0-9-]+$/, '숫자와 하이픈(-)만 입력 가능합니다'),
  company: z.string().min(1, '회사명을 입력하세요'),
  position: z.string().min(1, '직책을 입력하세요'),
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

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: searchParams.get('email') ?? '',
    },
  })

  useEffect(() => {
    const email = searchParams.get('email')
    if (email) setValue('email', email)
  }, [searchParams, setValue])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            phone: values.phone,
            company: values.company,
            position: values.position,
          },
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

      await supabase.from('InvestorProfile').insert({
        userId: authData.user.id,
        name: values.company,
        email: values.email,
        phone: values.phone,
        profession: values.position,
        status: 'ACTIVE',
        inviteCode: null,
      })

      toast.success('가입이 완료되었습니다')
      router.push('/dashboard')
    } catch {
      toast.error('가입 처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
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
          <p className="mt-1 text-sm text-[#9CA3AF]">THE PATRON에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 아이디 (이메일) */}
          <div>
            <label className="mb-1.5 block text-sm text-[#9CA3AF]">아이디 (이메일)</label>
            <input
              {...register('email')}
              type="email"
              placeholder="example@email.com"
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

          {/* 연락처 */}
          <div>
            <label className="mb-1.5 block text-sm text-[#9CA3AF]">연락처</label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="010-0000-0000"
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-3 text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#C9A84C]"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
          </div>

          {/* 회사명 */}
          <div>
            <label className="mb-1.5 block text-sm text-[#9CA3AF]">회사명</label>
            <input
              {...register('company')}
              type="text"
              placeholder="회사명을 입력하세요"
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-3 text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#C9A84C]"
            />
            {errors.company && <p className="mt-1 text-xs text-red-400">{errors.company.message}</p>}
          </div>

          {/* 직책 */}
          <div>
            <label className="mb-1.5 block text-sm text-[#9CA3AF]">직책</label>
            <input
              {...register('position')}
              type="text"
              placeholder="직책을 입력하세요"
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-3 text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#C9A84C]"
            />
            {errors.position && <p className="mt-1 text-xs text-red-400">{errors.position.message}</p>}
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
