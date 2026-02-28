/**
 * THE PATRON — 노션 API 유틸리티
 *
 * 절대 규칙: 노션 API 실패해도 메인 플로우 절대 중단 금지
 * try { await notion.xxx() } catch (e) { console.error('[Notion]', e) }
 *
 * 동기화 이벤트:
 *   1. 멤버십 신청 → NOTION_INVESTOR_DB_ID
 *   2. 딜 등재    → NOTION_DEAL_DB_ID
 *   3. 매칭 신청  → NOTION_MATCH_DB_ID
 */

import { Client } from '@notionhq/client'

// ─── Client Singleton ─────────────────────────────────────────────────────────

let _client: Client | null = null

function getClient(): Client {
  if (!_client) {
    const token = process.env.NOTION_INTEGRATION_TOKEN
    if (!token) throw new Error('NOTION_INTEGRATION_TOKEN is not set')
    _client = new Client({ auth: token })
  }
  return _client
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotionInvestorRecord {
  name: string
  email: string
  phone: string
  profession: string
  annualIncome?: number
  simulatedInvestment?: number
  simulatedTaxSaving?: number
  status: string
  appliedAt: string
}

export interface NotionDealRecord {
  briefTitle: string
  category: string
  stage: string
  targetAmount: number
  companyEmail: string
  status: string
  registeredAt: string
}

export interface NotionMatchRecord {
  dealBriefTitle: string
  investorProfession: string
  investmentAmount: number
  investmentType: string
  status: string
  requestedAt: string
}

// ─── Investor DB ─────────────────────────────────────────────────────────────

export async function addInvestorToNotion(record: NotionInvestorRecord): Promise<string | null> {
  const dbId = process.env.NOTION_INVESTOR_DB_ID
  if (!dbId) {
    console.error('[Notion] NOTION_INVESTOR_DB_ID is not set')
    return null
  }

  try {
    const client = getClient()
    const page = await client.pages.create({
      parent: { database_id: dbId },
      properties: {
        이름: {
          title: [{ text: { content: record.name } }],
        },
        이메일: {
          email: record.email,
        },
        연락처: {
          phone_number: record.phone,
        },
        직군: {
          select: { name: record.profession },
        },
        연간소득: {
          number: record.annualIncome ?? 0,
        },
        시뮬레이션_투자금: {
          number: record.simulatedInvestment ?? 0,
        },
        시뮬레이션_절세액: {
          number: record.simulatedTaxSaving ?? 0,
        },
        상태: {
          select: { name: record.status },
        },
        신청일시: {
          date: { start: record.appliedAt },
        },
      },
    })
    return page.id
  } catch (e) {
    console.error('[Notion] addInvestorToNotion failed:', e)
    return null
  }
}

export async function updateInvestorStatusInNotion(
  pageId: string,
  status: string
): Promise<void> {
  try {
    const client = getClient()
    await client.pages.update({
      page_id: pageId,
      properties: {
        상태: {
          select: { name: status },
        },
      },
    })
  } catch (e) {
    console.error('[Notion] updateInvestorStatusInNotion failed:', e)
  }
}

// ─── Deal DB ─────────────────────────────────────────────────────────────────

export async function addDealToNotion(record: NotionDealRecord): Promise<string | null> {
  const dbId = process.env.NOTION_DEAL_DB_ID
  if (!dbId) {
    console.error('[Notion] NOTION_DEAL_DB_ID is not set')
    return null
  }

  try {
    const client = getClient()
    const page = await client.pages.create({
      parent: { database_id: dbId },
      properties: {
        딜명: {
          title: [{ text: { content: record.briefTitle } }],
        },
        카테고리: {
          select: { name: record.category },
        },
        단계: {
          select: { name: record.stage },
        },
        목표투자금: {
          number: record.targetAmount,
        },
        기업이메일: {
          email: record.companyEmail,
        },
        상태: {
          select: { name: record.status },
        },
        등록일시: {
          date: { start: record.registeredAt },
        },
      },
    })
    return page.id
  } catch (e) {
    console.error('[Notion] addDealToNotion failed:', e)
    return null
  }
}

// ─── Match DB ─────────────────────────────────────────────────────────────────

export async function addMatchToNotion(record: NotionMatchRecord): Promise<string | null> {
  const dbId = process.env.NOTION_MATCH_DB_ID
  if (!dbId) {
    console.error('[Notion] NOTION_MATCH_DB_ID is not set')
    return null
  }

  try {
    const client = getClient()
    const page = await client.pages.create({
      parent: { database_id: dbId },
      properties: {
        딜명: {
          title: [{ text: { content: record.dealBriefTitle } }],
        },
        패트론직군: {
          select: { name: record.investorProfession },
        },
        투자희망금액: {
          number: record.investmentAmount,
        },
        투자방식: {
          select: { name: record.investmentType },
        },
        매칭상태: {
          select: { name: record.status },
        },
        신청일시: {
          date: { start: record.requestedAt },
        },
      },
    })
    return page.id
  } catch (e) {
    console.error('[Notion] addMatchToNotion failed:', e)
    return null
  }
}
