import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('InvestorProfile')
    .select('id')
    .eq('userId', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase
    .from('InvestorNotification')
    .update({ isRead: true })
    .eq('investorId', profile.id)
    .eq('isRead', false)

  return NextResponse.json({ ok: true })
}
