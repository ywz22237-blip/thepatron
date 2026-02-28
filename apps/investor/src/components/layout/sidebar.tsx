'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  GitMerge,
  Users,
  User,
  Calculator,
  CreditCard,
  LogOut,
  Bell,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface SidebarProps {
  investorId?: string
}

const NAV_ITEMS = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/deals', label: '딜 목록', icon: Briefcase },
  { href: '/matches', label: '매칭 현황', icon: GitMerge },
  { href: '/circles', label: 'Patron Circle', icon: Users },
  { href: '/simulator', label: '절세 계산기', icon: Calculator },
  { href: '/billing', label: '구독 & 결제', icon: CreditCard },
  { href: '/notifications', label: '알림', icon: Bell, badge: true },
  { href: '/profile', label: '내 정보', icon: User },
]

export function Sidebar({ investorId }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!investorId) return
    const supabase = createClient()

    supabase
      .from('InvestorNotification')
      .select('id', { count: 'exact', head: true })
      .eq('investorId', investorId)
      .eq('isRead', false)
      .then(({ count }) => setUnread(count ?? 0))

    const channel = supabase
      .channel(`sidebar-notifications-${investorId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'InvestorNotification',
        filter: `investorId=eq.${investorId}`,
      }, () => setUnread((c) => c + 1))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [investorId])

  async function handleSignOut() {
    const supabase = createClient()
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
          const showBadge = 'badge' in item && item.badge && unread > 0

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
              <div className="relative shrink-0">
                <Icon size={18} />
                {showBadge && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#D4AF37] text-[8px] font-bold text-black">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              <span className="hidden flex-1 truncate lg:block">{item.label}</span>
              {showBadge && (
                <span className="ml-auto hidden rounded-full bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#D4AF37] lg:block">
                  {unread}
                </span>
              )}
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
