'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  GitMerge,
  Users,
  User,
  Calculator,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: '대시보드',
    icon: LayoutDashboard,
  },
  {
    href: '/deals',
    label: '딜 목록',
    icon: Briefcase,
  },
  {
    href: '/matches',
    label: '매칭 현황',
    icon: GitMerge,
  },
  {
    href: '/circles',
    label: 'Patron Circle',
    icon: Users,
  },
  {
    href: '/simulator',
    label: '절세 계산기',
    icon: Calculator,
  },
  {
    href: '/profile',
    label: '내 정보',
    icon: User,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    // PC: w-60 고정 | 태블릿(768~1023px): w-16 아이콘만
    <aside className="hidden flex-col border-r border-[#2F2F2F] bg-[#111111] md:flex md:w-16 lg:w-60">
      {/* 로고 */}
      <div className="flex h-16 items-center border-b border-[#2F2F2F] px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37] text-xs font-bold text-[#0A0A0A]">
            P
          </div>
          <span className="hidden text-sm font-bold tracking-widest text-[#D4AF37] lg:block">
            THE PATRON
          </span>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-1 flex-col gap-1 p-2 lg:p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-all ${
                isActive
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                  : 'text-[#A0A0A0] hover:bg-[#2F2F2F] hover:text-white'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden truncate lg:block">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="border-t border-[#2F2F2F] p-2 lg:p-3">
        <button
          onClick={handleSignOut}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#666666] transition-all hover:bg-[#2F2F2F] hover:text-[#A0A0A0]"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:block">로그아웃</span>
        </button>
      </div>
    </aside>
  )
}
