import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, BellOff } from 'lucide-react'
import { NotificationList } from '@/components/notifications/notification-list'

export const metadata = { title: '알림 센터' }

const TYPE_LABELS: Record<string, string> = {
  NEW_APPLICATION: '멤버십 신청',
  NEW_DEAL: '새 딜',
  NEW_MATCH_REQUEST: '매칭 신청',
  MATCH_UPDATE: '매칭 업데이트',
  SUBSCRIPTION_EVENT: '구독 이벤트',
}

export default async function AdminNotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('AdminNotification')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(100)

  const unreadCount = (notifications ?? []).filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">알림 센터</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}건` : '모든 알림을 확인했습니다'}
          </p>
        </div>
        {unreadCount > 0 && (
          <NotificationList.MarkAllRead />
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[#E2E8F0] bg-white text-[#94A3B8]">
          <BellOff size={32} className="opacity-30" />
          <p className="text-sm">알림이 없습니다</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          {notifications.map((n, idx) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                idx !== notifications.length - 1 ? 'border-b border-[#F1F5F9]' : ''
              } ${!n.isRead ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'}`}
            >
              {/* 아이콘 */}
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                !n.isRead ? 'bg-[#1B3A6B]/10' : 'bg-[#F1F5F9]'
              }`}>
                <Bell size={14} className={!n.isRead ? 'text-[#1B3A6B]' : 'text-[#94A3B8]'} />
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#64748B]">
                    {TYPE_LABELS[n.type] ?? n.type}
                  </span>
                  {!n.isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1B3A6B]" />
                  )}
                </div>
                <p className="mt-1 font-medium text-[#0F172A]">{n.title}</p>
                <p className="mt-0.5 text-sm text-[#64748B]">{n.body}</p>
                {n.data && (
                  <NotificationList.DataLink type={n.type} data={n.data} />
                )}
              </div>

              {/* 시간 */}
              <p className="shrink-0 text-xs text-[#CBD5E1]">
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
