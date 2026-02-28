'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('이메일 또는 비밀번호가 올바르지 않습니다')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('이메일 인증을 완료해주세요. 받은 메일함을 확인하세요.')
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] text-white">
      {/* 헤더 */}
      <header className="border-b border-[#2F2F2F] bg-[#0A0A0A]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37] text-xs font-bold text-[#0A0A0A]">
              P
            </div>
            <span className="font-bold tracking-widest text-[#D4AF37]">THE PATRON</span>
          </Link>
        </div>
      </header>

      {/* 로그인 폼 */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">패트론 로그인</h1>
            <p className="mt-2 text-sm text-[#A0A0A0]">
              더페트론 멤버십 계정으로 로그인하세요
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label className="mb-1.5 block text-sm text-[#A0A0A0]">이메일</label>
              <input
                {...register('email')}
                type="email"
                placeholder="patron@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-[#2F2F2F] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-[#555555] outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="mb-1.5 block text-sm text-[#A0A0A0]">비밀번호</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[#2F2F2F] bg-[#1A1A1A] px-4 py-3 pr-10 text-sm text-white placeholder-[#555555] outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#A0A0A0]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] py-3 font-semibold text-[#0A0A0A] transition-all hover:bg-[#E8CC6A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  로그인 <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* 구분선 */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-[#2F2F2F]" />
            <span className="text-xs text-[#555555]">또는</span>
            <div className="flex-1 border-t border-[#2F2F2F]" />
          </div>

          {/* 신청 안내 */}
          <div className="rounded-lg border border-[#2F2F2F] bg-[#1A1A1A] p-4 text-center">
            <p className="text-sm text-[#A0A0A0]">아직 패트론 멤버가 아니신가요?</p>
            <Link
              href="/apply"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#D4AF37] hover:underline"
            >
              패트론 입장 신청하기 <ArrowRight size={14} />
            </Link>
            <p className="mt-3 text-xs text-[#666666]">
              심사를 통과한 고소득 전문직 패트론만 입장 가능합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
