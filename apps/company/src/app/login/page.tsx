'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
})
type FormValues = z.infer<typeof schema>

export default function CompanyLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error) {
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다')
      setLoading(false)
      return
    }
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0F172A]">
      {/* 헤더 */}
      <header className="border-b border-[#E2E8F0]">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3A6B] text-xs font-bold text-white">
              P
            </div>
            <div>
              <span className="font-bold text-[#1B3A6B]">THE PATRON</span>
              <span className="ml-2 text-xs text-[#64748B]">스타트업 포털</span>
            </div>
          </Link>
        </div>
      </header>

      {/* 로그인 폼 */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#0F172A]">기업 로그인</h1>
            <p className="mt-2 text-sm text-[#64748B]">더페트론 스타트업 포털에 로그인하세요</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-[#64748B]">이메일</label>
              <input
                {...register('email')}
                type="email"
                placeholder="company@example.com"
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#CBD5E1] outline-none transition-all focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]/20"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-[#64748B]">비밀번호</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 pr-10 text-sm text-[#0F172A] placeholder-[#CBD5E1] outline-none transition-all focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] py-3 font-semibold text-white transition-all hover:bg-[#2B5099] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>로그인 <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-[#E2E8F0]" />
            <span className="text-xs text-[#CBD5E1]">또는</span>
            <div className="flex-1 border-t border-[#E2E8F0]" />
          </div>

          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
            <p className="text-sm text-[#64748B]">딜 등재 신청을 원하시나요?</p>
            <Link
              href="/apply"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#1B3A6B] hover:underline"
            >
              딜 등재 신청하기 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
