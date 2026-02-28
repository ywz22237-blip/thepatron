'use client'

import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'

export function MarkAllReadButton() {
  const router = useRouter()

  async function handleClick() {
    await fetch('/api/notifications/read-all', { method: 'POST' })
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-lg border border-[#2F2F2F] bg-[#1A1A1A] px-3 py-2 text-sm text-[#A0A0A0] transition-colors hover:bg-[#2F2F2F]"
    >
      <CheckCheck size={14} />
      모두 읽음
    </button>
  )
}
