// 관리자 대시보드 — 운영 현황 요약
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">운영 대시보드</h1>
        <p className="mt-1 text-sm text-[#64748B]">더페트론 플랫폼 실시간 현황</p>
      </div>

      {/* KPI 카드 — 2열 그리드 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="전체 패트론" value="0명" sub="ACTIVE 구독자" color="navy" />
        <KpiCard label="검토 대기 신청" value="0건" sub="PENDING 멤버십 신청" color="warning" />
        <KpiCard label="활성 딜" value="0건" sub="플랫폼 노출 중" color="navy" />
        <KpiCard label="진행 중 매칭" value="0건" sub="REQUESTED~CONTRACT" color="success" />
      </div>

      {/* 최근 신청 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0F172A]">최근 멤버십 신청</h2>
        <div className="flex h-32 items-center justify-center text-sm text-[#94A3B8]">
          신청 내역이 없습니다
        </div>
      </div>

      {/* 매칭 현황 미리보기 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-[#0F172A]">매칭 현황</h2>
          <a href="/matches" className="text-sm text-[#1B3A6B] hover:underline">
            칸반 보기
          </a>
        </div>
        <div className="flex h-32 items-center justify-center text-sm text-[#94A3B8]">
          진행 중인 매칭이 없습니다
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub: string
  color: 'navy' | 'warning' | 'success'
}) {
  const colorMap = {
    navy: 'text-[#1B3A6B]',
    warning: 'text-[#F59E0B]',
    success: 'text-[#10B981]',
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <p className="mb-1 text-sm text-[#64748B]">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="mt-1 text-xs text-[#94A3B8]">{sub}</p>
    </div>
  )
}
