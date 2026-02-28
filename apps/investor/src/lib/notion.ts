// Notion API 클라이언트 — 멤버십 신청서 DB 동기화
// https://developers.notion.com/docs

const NOTION_API_KEY = process.env.NOTION_API_KEY!
const NOTION_DB_ID = process.env.NOTION_APPLICATIONS_DB_ID!
const NOTION_BASE = 'https://api.notion.com/v1'

function notionHeaders() {
  return {
    Authorization: `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  }
}

export interface ApplicationForNotion {
  id: string
  name: string
  email: string
  phone: string
  profession: string
  annualIncome?: number | null
  simulatedInvestment?: number | null
  simulatedTaxSaving?: number | null
  createdAt: string
}

// 신청서를 Notion DB에 새 페이지로 추가
export async function syncApplicationToNotion(app: ApplicationForNotion): Promise<string | null> {
  const properties: Record<string, unknown> = {
    '이름': { title: [{ text: { content: app.name } }] },
    '이메일': { email: app.email },
    '연락처': { phone_number: app.phone },
    '직업': { select: { name: app.profession } },
    '상태': { select: { name: 'PENDING' } },
    '신청일': { date: { start: app.createdAt } },
    'Application ID': { rich_text: [{ text: { content: app.id } }] },
  }

  if (app.annualIncome) {
    properties['연소득 (만원)'] = { number: app.annualIncome }
  }
  if (app.simulatedInvestment) {
    properties['시뮬 투자액 (만원)'] = { number: app.simulatedInvestment }
  }
  if (app.simulatedTaxSaving) {
    properties['시뮬 절세액 (만원)'] = { number: app.simulatedTaxSaving }
  }

  const res = await fetch(`${NOTION_BASE}/pages`, {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_ID },
      properties,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Notion 동기화 실패')
  }

  const data = await res.json()
  return data.id as string  // Notion 페이지 ID
}

// 신청서 상태 업데이트 (승인/거절 시)
export async function updateNotionApplicationStatus(
  notionPageId: string,
  status: 'APPROVED' | 'REJECTED',
  reviewNote?: string | null
) {
  const properties: Record<string, unknown> = {
    '상태': { select: { name: status } },
  }

  if (reviewNote) {
    properties['검토 메모'] = { rich_text: [{ text: { content: reviewNote } }] }
  }

  const res = await fetch(`${NOTION_BASE}/pages/${notionPageId}`, {
    method: 'PATCH',
    headers: notionHeaders(),
    body: JSON.stringify({ properties }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Notion 상태 업데이트 실패')
  }
}
