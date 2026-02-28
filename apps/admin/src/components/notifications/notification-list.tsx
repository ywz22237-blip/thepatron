'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'

function MarkAllRead() {
  const router = useRouter()

  async function handleMarkAll() {
    await fetch('/api/notifications/read-all', { method: 'POST' })
    router.refresh()
  }

  return (
    <button
      onClick={handleMarkAll}
      className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
    >
      <CheckCheck size={14} />
      모두 읽음 처리
    </button>
  )
}

function DataLink({ type, data }: { type: string; data: Record<string, string> }) {
  if (type === 'NEW_APPLICATION' && data.applicationId) {
    return (
      <Link
        href={`/applications/${data.applicationId}`}
        className="mt-1 inline-flex text-xs font-medium text-[#1B3A6B] hover:underline"
      >
        신청서 보기 →
      </Link>
    )
  }
  if ((type === 'NEW_DEAL' || type === 'MATCH_UPDATE' || type === 'NEW_MATCH_REQUEST') && data.dealId) {
    return (
      <Link
        href={`/deals/${data.dealId}`}
        className="mt-1 inline-flex text-xs font-medium text-[#1B3A6B] hover:underline"
      >
        딜 보기 →
      </Link>
    )
  }
  return null
}

export const NotificationList = { MarkAllRead, DataLink }
