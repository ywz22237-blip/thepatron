import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MatchKanban } from '@/components/matches/match-kanban'

export const metadata = { title: '매칭 칸반' }

export default async function AdminMatchesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: matches } = await supabase
    .from('MatchRequest')
    .select(`
      id, status, investmentAmount, investmentType, ndaSigned, createdAt, updatedAt, adminNote,
      investor:InvestorProfile(id, name, email, profession),
      deal:Deal(id, briefTitle, category, stage)
    `)
    .order('updatedAt', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">매칭 칸반</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          패트론 투자자와 딜의 매칭 진행 상황을 관리하세요
        </p>
      </div>
      <MatchKanban matches={matches ?? []} />
    </div>
  )
}
