import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { MarkAllReadButton } from '@/components/notifications/mark-all-read'

export const metadata = { title: '알림' }

const TYPE_LABELS: Record<string, string> = {
  NEW_APPLICATION: '신청 완료',
  NEW_DEAL: '새 딜',
  NEW_MATCH_REQUEST: '매칭 신청',
  MATCH_UPDATE: '매칭 업데이트',
  SUBSCRIPTION_EVENT: '구독',
}

const TYPE_COLORS: Record<string, string> = {
  MATCH_UPDATE: 'bg-[#D4AF37]/10 text-[#D4AF37]',
  NEW_DEAL: 'bg-emerald-500/10 text-emerald-400',
  SUBSCRIPTION_EVENT: 'bg-red-500/10 text-red-400',
  NEW_APPLICATION: 'bg-blue-500/10 text-blue-400',
  NEW_MATCH_REQUEST: 'bg-purple-500/10 text-purple-400',
}

export default async function InvestorNotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('InvestorProfile')
    .select('id')
    .eq('userId', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: notifications } = await supabase
    .from('InvestorNotification')
    .select('*')
    .eq('investorId', profile.id)
    .order('createdAt', { ascending: false })
    .limit(100)

  const unreadCount = (notifications ?? []).filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">알림</h1>
          <p className="mt-0.5 text-sm text-[#A0A0A0]">
            {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}건` : '모두 확인했습니다'}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] text-[#555555]">
          <BellOff size={32} className="opacity-40" />
          <p className="text-sm">알림이 없습니다</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#2F2F2F] bg-[#1A1A1A]">
          {notifications.map((n, idx) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 ${
                idx !== notifications.length - 1 ? 'border-b border-[#2F2F2F]' : ''
              } ${!n.isRead ? 'bg-[#D4AF37]/5' : ''}`}
            >
              {/* 아이콘 */}
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                !n.isRead ? 'bg-[#D4AF37]/10' : 'bg-[#2F2F2F]'
              }`}>
                <Bell size={14} className={!n.isRead ? 'text-[#D4AF37]' : 'text-[#555555]'} />
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    TYPE_COLORS[n.type] ?? 'bg-[#2F2F2F] text-[#A0A0A0]'
                  }`}>
                    {TYPE_LABELS[n.type] ?? n.type}
                  </span>
                  {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />}
                </div>
                <p className="mt-1 font-medium text-white">{n.title}</p>
                <p className="mt-0.5 text-sm text-[#A0A0A0]">{n.body}</p>
                {n.data?.matchId && (
                  <Link href="/matches" className="mt-1 inline-flex text-xs font-medium text-[#D4AF37] hover:underline">
                    매칭 현황 보기 →
                  </Link>
                )}
                {n.data?.dealId && (
                  <Link href={`/deals/${n.data.dealId}`} className="mt-1 inline-flex text-xs font-medium text-[#D4AF37] hover:underline">
                    딜 보기 →
                  </Link>
                )}
              </div>

              {/* 시간 */}
              <p className="shrink-0 text-xs text-[#555555]">
                {new Date(n.createdAt).toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
