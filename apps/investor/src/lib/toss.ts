// Toss Payments API 클라이언트
// https://docs.tosspayments.com/guides/billing

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!
const TOSS_BASE_URL = 'https://api.tosspayments.com/v1'

function getAuthHeader() {
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')
  return `Basic ${encoded}`
}

export async function issueBillingKey(authKey: string, customerKey: string) {
  const res = await fetch(`${TOSS_BASE_URL}/billing/authorizations/issue`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ authKey, customerKey }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '빌링키 발급 실패')
  }
  return res.json() as Promise<{ billingKey: string; method: string; card?: { number: string; cardType: string } }>
}

export async function chargeBilling({
  billingKey,
  customerKey,
  amount,
  orderId,
  orderName,
  customerEmail,
  customerName,
}: {
  billingKey: string
  customerKey: string
  amount: number
  orderId: string
  orderName: string
  customerEmail: string
  customerName: string
}) {
  const res = await fetch(`${TOSS_BASE_URL}/billing/${billingKey}`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerKey, amount, orderId, orderName, customerEmail, customerName }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || '결제 실패')
  return data as { paymentKey: string; orderId: string; status: string; approvedAt: string }
}

export async function cancelPayment(paymentKey: string, cancelReason: string) {
  const res = await fetch(`${TOSS_BASE_URL}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancelReason }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '결제 취소 실패')
  }
  return res.json()
}
