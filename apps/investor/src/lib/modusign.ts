// 모두싸인 API 클라이언트
// https://docs.modusign.co.kr/

const MODUSIGN_API_KEY = process.env.MODUSIGN_API_KEY!
const MODUSIGN_EMAIL = process.env.MODUSIGN_EMAIL!
const MODUSIGN_BASE_URL = 'https://api.modusign.co.kr'
const NDA_TEMPLATE_ID = process.env.MODUSIGN_NDA_TEMPLATE_ID!

function getAuthHeader() {
  const encoded = Buffer.from(`${MODUSIGN_EMAIL}:${MODUSIGN_API_KEY}`).toString('base64')
  return `Basic ${encoded}`
}

export interface NdaRequestPayload {
  investorName: string
  investorEmail: string
  dealTitle: string
  matchId: string
}

export async function requestNdaSignature({
  investorName,
  investorEmail,
  dealTitle,
  matchId,
}: NdaRequestPayload) {
  const redirectUrl = `${process.env.NEXT_PUBLIC_INVESTOR_URL}/deals?nda=done&match=${matchId}`

  const res = await fetch(`${MODUSIGN_BASE_URL}/documents/request-with-template`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateId: NDA_TEMPLATE_ID,
      title: `[THE PATRON] NDA — ${dealTitle}`,
      participantMappings: [
        {
          templateParticipantId: 'investor', // 템플릿에서 설정한 참여자 ID
          name: investorName,
          signingMethod: {
            type: 'EMAIL',
            value: investorEmail,
          },
        },
      ],
      fields: [
        { templateFieldId: 'deal_title', value: dealTitle },
        { templateFieldId: 'investor_name', value: investorName },
        { templateFieldId: 'date', value: new Date().toLocaleDateString('ko-KR') },
      ],
      requesterInputs: [],
      notificationRequest: {
        notifyAtCreation: true,
        redirectUrl,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'NDA 서명 요청 실패')
  }

  const data = await res.json()
  return { documentId: data.id as string, signingUrl: data.participantSigningUrls?.[0]?.signingUrl as string | undefined }
}

export async function getNdaDocumentStatus(documentId: string): Promise<'COMPLETED' | 'PENDING' | 'EXPIRED'> {
  const res = await fetch(`${MODUSIGN_BASE_URL}/documents/${documentId}`, {
    headers: { Authorization: getAuthHeader() },
  })
  if (!res.ok) return 'PENDING'
  const data = await res.json()
  if (data.status === 'COMPLETED') return 'COMPLETED'
  if (data.status === 'EXPIRED') return 'EXPIRED'
  return 'PENDING'
}
