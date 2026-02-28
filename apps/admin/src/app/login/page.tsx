'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
})
type FormValues = z.infer<typeof schema>

export default function AdminLoginPage() {
  const router = useRouter()
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error || !data.user) {
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다')
      setLoading(false)
      return
    }

    // 관리자 권한 확인
    const { data: admin } = await supabase
      .from('AdminProfile')
      .select('role')
      .eq('userId', data.user.id)
      .single()

    if (!admin) {
      await supabase.auth.signOut()
      toast.error('관리자 권한이 없습니다')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#1B3A6B]">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">관리자 로그인</h1>
          <p className="mt-1 text-sm text-[#64748B]">THE PATRON 관리자 패널</p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-[#64748B]">이메일</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@thepatron.co.kr"
                autoComplete="email"
                className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] placeholder-[#CBD5E1] outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]/20"
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
                  placeholder="비밀번호"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 pr-10 text-sm text-[#0F172A] placeholder-[#CBD5E1] outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#94A3B8]"
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
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] py-3 font-semibold text-white hover:bg-[#2B5099] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                '로그인'
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[#94A3B8]">
          THE PATRON 관리자 전용 시스템입니다
        </p>
      </div>
    </div>
  )
}
