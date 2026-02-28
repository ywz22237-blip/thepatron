import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompanySidebar } from '@/components/layout/company-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <CompanySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
