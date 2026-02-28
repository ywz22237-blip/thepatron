'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface MobileHeaderProps {
  investorId?: string
  investorName?: string
}

export function MobileHeader({ investorId, investorName }: MobileHeaderProps) {
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
      .channel(`investor-notifications-${investorId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'InvestorNotification',
        filter: `investorId=eq.${investorId}`,
      }, () => setUnread((c) => c + 1))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [investorId])

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#2F2F2F] bg-[#111111] px-4 md:hidden">
      {/* 로고 */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#D4AF37] text-[10px] font-black text-black">
          P
        </div>
        <span className="text-sm font-bold tracking-wider text-white">THE PATRON</span>
      </div>

      {/* 우측 알림 */}
      <div className="flex items-center gap-3">
        {investorName && (
          <span className="text-xs text-[#666666]">{investorName}</span>
        )}
        <Link
          href="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#A0A0A0] transition-colors hover:bg-[#2F2F2F] hover:text-white"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-bold text-black">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
