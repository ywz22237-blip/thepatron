'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const STATUS_ORDER = [
  'REQUESTED',
  'REVIEWING',
  'DELIVERED',
  'MEETING',
  'DEAL_ROOM',
  'CONTRACT',
  'COMPLETED',
]

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: '신청 접수',
  REVIEWING: '검토 중',
  DELIVERED: '기업 전달',
  MEETING: '미팅 조율',
  DEAL_ROOM: 'NDA 완료',
  CONTRACT: '계약 진행',
  COMPLETED: '투자 완료',
}

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-blue-50 border-blue-200',
  REVIEWING: 'bg-amber-50 border-amber-200',
  DELIVERED: 'bg-purple-50 border-purple-200',
  MEETING: 'bg-orange-50 border-orange-200',
  DEAL_ROOM: 'bg-cyan-50 border-cyan-200',
  CONTRACT: 'bg-emerald-50 border-emerald-200',
  COMPLETED: 'bg-[#1B3A6B]/5 border-[#1B3A6B]/20',
}

const STATUS_HEADER_COLORS: Record<string, string> = {
  REQUESTED: 'bg-blue-100 text-blue-700',
  REVIEWING: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-purple-100 text-purple-700',
  MEETING: 'bg-orange-100 text-orange-700',
  DEAL_ROOM: 'bg-cyan-100 text-cyan-700',
  CONTRACT: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-[#1B3A6B]/10 text-[#1B3A6B]',
}

interface MatchRequest {
  id: string
  status: string
  investmentAmount: number
  investmentType: string
  ndaSigned: boolean
  createdAt: string
  updatedAt: string
  adminNote: string | null
  investor: { id: string; name: string; email: string; profession: string } | null
  deal: { id: string; briefTitle: string; category: string; stage: string } | null
}

export function MatchKanban({ matches }: { matches: MatchRequest[] }) {
  const [matchList, setMatchList] = useState(matches)
  const [selectedMatch, setSelectedMatch] = useState<MatchRequest | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function moveStatus(matchId: string, direction: 'forward' | 'back') {
    const match = matchList.find((m) => m.id === matchId)
    if (!match) return

    const currentIdx = STATUS_ORDER.indexOf(match.status)
    const nextIdx = direction === 'forward' ? currentIdx + 1 : currentIdx - 1
    if (nextIdx < 0 || nextIdx >= STATUS_ORDER.length) return

    const newStatus = STATUS_ORDER[nextIdx]
    setLoading(true)

    // API 라우트를 통해 상태 변경 + 이메일 알림
    try {
      const res = await fetch(`/api/matches/${matchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('상태 변경 실패')
    } catch {
      toast.error('상태 변경 실패')
      setLoading(false)
      return
    }

    setMatchList((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, status: newStatus, ndaSigned: newStatus === 'DEAL_ROOM' ? true : m.ndaSigned }
          : m
      )
    )

    if (selectedMatch?.id === matchId) {
      setSelectedMatch((prev) => prev ? { ...prev, status: newStatus } : null)
    }

    toast.success(`"${STATUS_LABELS[newStatus]}"으로 변경 — 이메일 알림 발송`)
    setLoading(false)
  }

  async function saveNote(matchId: string) {
    setLoading(true)
    const { error } = await supabase
      .from('MatchRequest')
      .update({ adminNote })
      .eq('id', matchId)

    if (error) {
      toast.error('메모 저장 실패')
    } else {
      toast.success('메모 저장 완료')
      setMatchList((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, adminNote } : m))
      )
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUS_ORDER.map((status) => {
        const colMatches = matchList.filter((m) => m.status === status)
        return (
          <div key={status} className="w-64 shrink-0">
            {/* 컬럼 헤더 */}
            <div
              className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${STATUS_HEADER_COLORS[status]}`}
            >
              <span className="text-sm font-semibold">{STATUS_LABELS[status]}</span>
              <span className="text-xs font-bold">{colMatches.length}</span>
            </div>

            {/* 카드 목록 */}
            <div className="space-y-2">
              {colMatches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => {
                    setSelectedMatch(match)
                    setAdminNote(match.adminNote ?? '')
                  }}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all hover:shadow-sm ${
                    STATUS_COLORS[status]
                  } ${selectedMatch?.id === match.id ? 'ring-2 ring-[#1B3A6B]' : ''}`}
                >
                  {/* 딜 제목 */}
                  <p className="mb-1.5 text-sm font-semibold text-[#0F172A] line-clamp-2">
                    {match.deal?.briefTitle ?? '딜 정보 없음'}
                  </p>

                  {/* 투자자 */}
                  <p className="mb-1 text-xs text-[#64748B]">
                    {match.investor?.name} · {match.investor?.profession}
                  </p>

                  {/* 금액 + NDA */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0F172A]">
                      {match.investmentAmount.toLocaleString()}만원
                    </span>
                    {match.ndaSigned && (
                      <span className="rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700">
                        NDA
                      </span>
                    )}
                  </div>

                  {/* 이동 버튼 */}
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveStatus(match.id, 'back')
                      }}
                      disabled={loading || STATUS_ORDER.indexOf(status) === 0}
                      className="flex h-6 flex-1 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#94A3B8] hover:text-[#1B3A6B] disabled:opacity-30"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveStatus(match.id, 'forward')
                      }}
                      disabled={loading || STATUS_ORDER.indexOf(status) === STATUS_ORDER.length - 1}
                      className="flex h-6 flex-1 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#94A3B8] hover:text-[#1B3A6B] disabled:opacity-30"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {colMatches.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#E2E8F0] px-3 py-6 text-center text-xs text-[#CBD5E1]">
                  없음
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* 상세 패널 */}
      {selectedMatch && (
        <div className="w-72 shrink-0 rounded-xl border border-[#E2E8F0] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[#0F172A]">매칭 상세</h3>
            <button
              onClick={() => setSelectedMatch(null)}
              className="text-sm text-[#94A3B8] hover:text-[#64748B]"
            >
              닫기
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-[#94A3B8]">딜</p>
              <p className="font-medium text-[#0F172A]">{selectedMatch.deal?.briefTitle}</p>
              <p className="text-xs text-[#94A3B8]">{selectedMatch.deal?.stage} · {selectedMatch.deal?.category}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">투자자</p>
              <p className="font-medium text-[#0F172A]">{selectedMatch.investor?.name}</p>
              <p className="text-xs text-[#94A3B8]">{selectedMatch.investor?.email}</p>
              <p className="text-xs text-[#94A3B8]">{selectedMatch.investor?.profession}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">투자 희망금액</p>
              <p className="font-semibold text-[#0F172A]">
                {selectedMatch.investmentAmount.toLocaleString()}만원
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">현재 단계</p>
              <p className="font-semibold text-[#1B3A6B]">
                {STATUS_LABELS[selectedMatch.status]}
              </p>
            </div>
          </div>

          {/* 관리자 메모 */}
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-[#64748B]">
              관리자 메모 (투자자 비공개)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] placeholder-[#CBD5E1] outline-none focus:border-[#1B3A6B]"
              placeholder="미팅 일정, 협의 내용 등..."
            />
            <button
              onClick={() => saveNote(selectedMatch.id)}
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[#1B3A6B] py-2 text-sm font-semibold text-white hover:bg-[#2B5099] disabled:opacity-50"
            >
              메모 저장
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
