import { CheckCircle2, XCircle, Clock } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  amount: number
  startedAt: string
  nextBillingAt: string
  cancelledAt: string | null
}

const STATUS_CONFIG = {
  ACTIVE: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    label: '구독 중',
  },
  PAST_DUE: {
    icon: Clock,
    color: 'text-amber-400',
    label: '결제 미납',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-400',
    label: '구독 취소',
  },
}

export function SubscriptionSection({
  subscription,
}: {
  subscription: Subscription | null
}) {
  if (!subscription) {
    return (
      <div className="rounded-lg border border-[#2F2F2F] bg-[#111111] px-4 py-6 text-center">
        <p className="mb-1 text-sm text-[#A0A0A0]">활성 구독이 없습니다</p>
        <p className="text-xs text-[#555555]">
          심사 승인 후 초대 코드를 통해 가입 및 구독 결제가 가능합니다
        </p>
      </div>
    )
  }

  const config = STATUS_CONFIG[subscription.status as keyof typeof STATUS_CONFIG]
  const Icon = config?.icon ?? Clock

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className={config?.color} />
          <span className={`font-semibold ${config?.color}`}>{config?.label}</span>
        </div>
        <span className="text-lg font-bold">
          {subscription.amount.toLocaleString()}원
          <span className="text-sm font-normal text-[#A0A0A0]">/월</span>
        </span>
      </div>

      <div className="space-y-2 rounded-lg bg-[#111111] p-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#A0A0A0]">구독 시작일</span>
          <span>{new Date(subscription.startedAt).toLocaleDateString('ko-KR')}</span>
        </div>
        {subscription.status === 'ACTIVE' && (
          <div className="flex justify-between text-sm">
            <span className="text-[#A0A0A0]">다음 결제일</span>
            <span>{new Date(subscription.nextBillingAt).toLocaleDateString('ko-KR')}</span>
          </div>
        )}
        {subscription.cancelledAt && (
          <div className="flex justify-between text-sm">
            <span className="text-[#A0A0A0]">취소일</span>
            <span className="text-red-400">
              {new Date(subscription.cancelledAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        )}
      </div>

      {subscription.status === 'ACTIVE' && (
        <p className="text-xs text-[#555555]">
          구독 취소 문의는 더페트론 매니저에게 연락해주세요
        </p>
      )}
    </div>
  )
}
