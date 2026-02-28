'use client'

import { useState } from 'react'
import { FileSignature, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface NdaSignButtonProps {
  matchId: string
  ndaSigned: boolean
}

export function NdaSignButton({ matchId, ndaSigned }: NdaSignButtonProps) {
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)
  const [signingUrl, setSigningUrl] = useState<string | null>(null)

  if (ndaSigned) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-cyan-500/10 px-4 py-3">
        <CheckCircle2 size={18} className="text-cyan-400" />
        <span className="text-sm font-medium text-cyan-400">NDA 서명 완료</span>
      </div>
    )
  }

  async function handleRequest() {
    setLoading(true)
    try {
      const res = await fetch('/api/nda/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.signingUrl) {
        setSigningUrl(data.signingUrl)
      }
      setRequested(true)
      toast.success('NDA 서명 요청이 이메일로 발송되었습니다')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'NDA 요청 실패'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (requested) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-medium text-amber-400">NDA 서명 이메일이 발송되었습니다</p>
          <p className="mt-0.5 text-xs text-amber-400/70">이메일에서 서명을 완료하면 Deal Room에 접근할 수 있습니다</p>
        </div>
        {signingUrl && (
          <a
            href={signingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20"
          >
            <ExternalLink size={14} />
            바로 서명하기
          </a>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleRequest}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <>
          <FileSignature size={16} />
          NDA 전자서명 요청
        </>
      )}
    </button>
  )
}
