import { redirect } from 'next/navigation'

// 관리자 루트 → 대시보드로 리다이렉트
export default function AdminRootPage() {
  redirect('/dashboard')
}
