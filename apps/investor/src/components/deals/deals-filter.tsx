'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface DealsFilterProps {
  categories: string[]
  stages: string[]
  selectedCategory?: string
  selectedStage?: string
}

export function DealsFilter({
  categories,
  stages,
  selectedCategory,
  selectedStage,
}: DealsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/deals?${params.toString()}`)
    },
    [router, searchParams]
  )

  if (categories.length === 0 && stages.length === 0) return null

  return (
    <div className="space-y-3">
      {/* 섹터 필터 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#555555]">섹터</span>
          <button
            onClick={() => updateFilter('category', null)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
              !selectedCategory
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'border-[#2F2F2F] text-[#A0A0A0] hover:border-[#404040]'
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter('category', cat === selectedCategory ? null : cat)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                selectedCategory === cat
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-[#2F2F2F] text-[#A0A0A0] hover:border-[#404040]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 투자 단계 필터 */}
      {stages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#555555]">단계</span>
          <button
            onClick={() => updateFilter('stage', null)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
              !selectedStage
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'border-[#2F2F2F] text-[#A0A0A0] hover:border-[#404040]'
            }`}
          >
            전체
          </button>
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => updateFilter('stage', stage === selectedStage ? null : stage)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                selectedStage === stage
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-[#2F2F2F] text-[#A0A0A0] hover:border-[#404040]'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
