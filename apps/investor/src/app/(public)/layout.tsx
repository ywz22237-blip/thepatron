// 퍼블릭 레이아웃 — 인증 불필요 (랜딩, 시뮬레이터, 신청)
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
