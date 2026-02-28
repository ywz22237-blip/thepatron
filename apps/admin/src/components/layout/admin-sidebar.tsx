'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GitMerge,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: '운영',
    items: [
      { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
      { href: '/notifications', label: '알림', icon: Bell },
    ],
  },
  {
    label: '패트론 관리',
    items: [
      { href: '/investors', label: '패트론 목록', icon: Users },
      { href: '/applications', label: '멤버십 신청', icon: Users },
    ],
  },
  {
    label: '딜 관리',
    items: [
      { href: '/deals', label: '딜 목록', icon: Briefcase },
      { href: '/matches', label: '매칭 칸반', icon: GitMerge },
    ],
  },
  {
    label: '설정',
    items: [{ href: '/settings', label: '설정', icon: Settings }],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[#1B3A6B] text-white">
      {/* 로고 */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#1B3A6B]">
          P
        </div>
        <div>
          <p className="text-sm font-bold tracking-wider">THE PATRON</p>
          <p className="text-xs text-white/50">관리자 패널</p>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-all ${
                    isActive
                      ? 'bg-white/15 font-medium text-white'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto shrink-0 opacity-60" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* 하단 로그아웃 */}
      <div className="border-t border-white/10 p-3">
        <button className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-white/40 transition-all hover:bg-white/10 hover:text-white">
          <LogOut size={16} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  )
}
