'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, GitMerge, Bell, User } from 'lucide-react'

const TAB_ITEMS = [
  { href: '/dashboard', label: '홈', icon: LayoutDashboard },
  { href: '/deals', label: '딜', icon: Briefcase },
  { href: '/matches', label: '매칭', icon: GitMerge },
  { href: '/notifications', label: '알림', icon: Bell },
  { href: '/profile', label: '내 정보', icon: User },
]

// 모바일 하단 탭바 (767px 이하)
export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#2F2F2F] bg-[#111111] md:hidden">
      {TAB_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${
              isActive ? 'text-[#D4AF37]' : 'text-[#666666]'
            }`}
          >
            <div className="flex h-12 flex-col items-center justify-center gap-1">
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
