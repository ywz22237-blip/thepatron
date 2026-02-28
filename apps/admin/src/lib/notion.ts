// Notion API 클라이언트 (Admin용) — 신청서 상태 업데이트
const NOTION_API_KEY = process.env.NOTION_API_KEY!
const NOTION_BASE = 'https://api.notion.com/v1'

function notionHeaders() {
  return {
    Authorization: `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  }
}

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
