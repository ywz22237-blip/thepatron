import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, CreditCard, Shield, AlertCircle } from 'lucide-react'
import { SignOutButton } from '@/components/profile/sign-out-button'
import { SubscriptionSection } from '@/components/profile/subscription-section'

export const metadata = { title: '내 정보' }

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; desc: string }
> = {
  PENDING: {
    label: '심사 대기',
    color: 'text-amber-400 bg-amber-400/10',
    desc: '심사가 진행 중입니다. 영업일 2~3일 내 결과를 안내드립니다.',
  },
  APPROVED: {
    label: '심사 승인',
    color: 'text-blue-400 bg-blue-400/10',
    desc: '초대 코드가 발송되었습니다. 이메일을 확인해주세요.',
  },
  REJECTED: {
    label: '심사 거절',
    color: 'text-red-400 bg-red-400/10',
    desc: '죄송합니다. 이번 심사에서는 선정되지 않았습니다.',
  },
  ACTIVE: {
    label: '활성 구독',
    color: 'text-emerald-400 bg-emerald-400/10',
    desc: '패트론 멤버십이 활성화되어 있습니다.',
  },
  SUSPENDED: {
    label: '정지',
    color: 'text-red-400 bg-red-400/10',
    desc: '계정이 일시 정지되었습니다. 관리자에게 문의하세요.',
  },
}

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('InvestorProfile')
    .select('*')
    .eq('userId', user.id)
    .single()

  // 구독 정보
  const { data: subscription } = profile
    ? await supabase
        .from('Subscription')
        .select('*')
        .eq('investorId', profile.id)
        .order('createdAt', { ascending: false })
        .limit(1)
        .single()
    : { data: null }

  const statusInfo = profile ? STATUS_CONFIG[profile.status] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">내 정보</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">계정 정보와 구독 현황을 확인하세요</p>
      </div>

      {/* 프로필 카드 */}
      {profile ? (
        <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10">
              <User size={24} className="text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{profile.name}</h2>
              <p className="text-sm text-[#A0A0A0]">{profile.profession}</p>
            </div>
            {statusInfo && (
              <span
                className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            )}
          </div>

          {statusInfo && profile.status !== 'ACTIVE' && (
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-[#2F2F2F] bg-[#111111] px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#A0A0A0]" />
              <p className="text-sm text-[#A0A0A0]">{statusInfo.desc}</p>
            </div>
          )}

          <div className="space-y-3">
            <InfoRow label="이메일" value={profile.email} />
            <InfoRow label="연락처" value={profile.phone ?? '미등록'} />
            <InfoRow label="직군" value={profile.profession} />
            {profile.annualIncome && (
              <InfoRow
                label="연간 소득"
                value={`${profile.annualIncome.toLocaleString()}만원`}
              />
            )}
            <InfoRow
              label="가입일"
              value={new Date(profile.createdAt).toLocaleDateString('ko-KR')}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
          <div className="flex items-center gap-2 text-[#A0A0A0]">
            <Shield size={18} />
            <p className="text-sm">프로필 정보가 없습니다. 심사 완료 후 생성됩니다.</p>
          </div>
          <div className="mt-3 space-y-1 text-sm text-[#555555]">
            <p>로그인 이메일: {user.email}</p>
          </div>
        </div>
      )}

      {/* 구독 정보 */}
      <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <CreditCard size={18} className="text-[#D4AF37]" />
          구독 정보
        </h2>
        <SubscriptionSection subscription={subscription} />
      </div>

      {/* 로그아웃 */}
      <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6">
        <h2 className="mb-4 font-semibold">계정 관리</h2>
        <SignOutButton />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#2F2F2F] last:border-0">
      <span className="text-sm text-[#A0A0A0]">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  )
}
