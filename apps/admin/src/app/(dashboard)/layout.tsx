import { AdminSidebar } from '@/components/layout/admin-sidebar'

// 관리자 대시보드 레이아웃 — PC 전용
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* 네이비 사이드바 240px */}
      <AdminSidebar />
      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
