'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, User, LogOut } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/deals', label: '딜 현황', icon: Briefcase },
  { href: '/profile', label: '기업 정보', icon: User },
]

export function CompanySidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="hidden w-60 flex-col border-r border-[#E2E8F0] bg-white md:flex">
      {/* 로고 */}
      <div className="flex h-16 items-center border-b border-[#E2E8F0] px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1B3A6B] text-xs font-bold text-white">
            P
          </div>
          <div>
            <p className="text-sm font-bold text-[#1B3A6B]">THE PATRON</p>
            <p className="text-xs text-[#94A3B8]">스타트업 포털</p>
          </div>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-all ${
                isActive
                  ? 'bg-[#1B3A6B]/10 text-[#1B3A6B] font-medium'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="border-t border-[#E2E8F0] p-3">
        <button
          onClick={handleSignOut}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#64748B]"
        >
          <LogOut size={18} className="shrink-0" />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
