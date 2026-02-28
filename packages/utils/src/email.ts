/**
 * THE PATRON — 이메일 유틸리티 (Resend)
 *
 * 이메일 이벤트:
 *   - 멤버십 신청 완료 → 신청자에게 접수 확인
 *   - 심사 승인 → 초대코드 발송 (48h 유효)
 *   - 심사 거절 → 거절 안내
 *   - 구독 결제 완료 → 영수증
 *   - 매칭 상태 변경 → 투자자 알림
 */

import { Resend } from 'resend'

// ─── Client Singleton ─────────────────────────────────────────────────────────

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(apiKey)
  }
  return _resend
}

const FROM = 'THE PATRON <noreply@thepatron.co.kr>'

// ─── Email Templates ─────────────────────────────────────────────────────────

export interface ApplicationReceivedEmailData {
  to: string
  name: string
}

export async function sendApplicationReceivedEmail(
  data: ApplicationReceivedEmailData
): Promise<void> {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: FROM,
      to: data.to,
      subject: '[THE PATRON] 패트론 멤버십 신청이 접수되었습니다',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">THE PATRON</h2>
          <p>${data.name} 님, 패트론 멤버십 신청이 정상적으로 접수되었습니다.</p>
          <p>더페트론 매니저가 신청 내용을 검토 후 영업일 기준 2~3일 내 결과를 안내드립니다.</p>
          <hr style="border-color: #333;" />
          <p style="color: #888; font-size: 12px;">주식회사 벤처플랫폼 | THE PATRON</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('[Email] sendApplicationReceivedEmail failed:', e)
  }
}

export interface InviteCodeEmailData {
  to: string
  name: string
  inviteCode: string
  expiresAt: Date
}

export async function sendInviteCodeEmail(data: InviteCodeEmailData): Promise<void> {
  try {
    const resend = getResend()
    const investorUrl = process.env.NEXT_PUBLIC_INVESTOR_URL ?? 'https://app.thepatron.co.kr'
    const signupUrl = `${investorUrl}/signup?code=${data.inviteCode}`
    const expiresStr = data.expiresAt.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    await resend.emails.send({
      from: FROM,
      to: data.to,
      subject: '[THE PATRON] 패트론 멤버십 입장 초대코드가 발급되었습니다',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #fff; padding: 40px;">
          <h2 style="color: #D4AF37;">THE PATRON</h2>
          <p>${data.name} 님, 패트론 멤버십 심사를 통과하셨습니다.</p>
          <p>아래 초대코드로 회원가입 후 구독을 시작하시면 플랫폼에 입장하실 수 있습니다.</p>
          <div style="background: #2F2F2F; border: 1px solid #D4AF37; padding: 24px; text-align: center; margin: 24px 0; border-radius: 8px;">
            <p style="color: #888; margin: 0 0 8px;">초대코드</p>
            <p style="font-size: 28px; font-weight: bold; color: #D4AF37; letter-spacing: 4px; margin: 0;">${data.inviteCode}</p>
          </div>
          <p style="color: #888; font-size: 14px;">⏰ 유효 기간: ${expiresStr}까지</p>
          <a href="${signupUrl}" style="display: inline-block; background: #D4AF37; color: #0A0A0A; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            지금 입장하기
          </a>
          <hr style="border-color: #333; margin-top: 32px;" />
          <p style="color: #555; font-size: 12px;">주식회사 벤처플랫폼 | THE PATRON</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('[Email] sendInviteCodeEmail failed:', e)
  }
}

export interface ApplicationRejectedEmailData {
  to: string
  name: string
  reason?: string
}

export async function sendApplicationRejectedEmail(
  data: ApplicationRejectedEmailData
): Promise<void> {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: FROM,
      to: data.to,
      subject: '[THE PATRON] 패트론 멤버십 심사 결과 안내',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">THE PATRON</h2>
          <p>${data.name} 님, 패트론 멤버십 심사 결과를 안내드립니다.</p>
          <p>아쉽게도 이번 심사에서는 멤버십 승인이 어렵습니다.</p>
          ${data.reason ? `<p style="color: #666;">사유: ${data.reason}</p>` : ''}
          <p>문의 사항은 더페트론에 연락 주시기 바랍니다.</p>
          <hr />
          <p style="color: #888; font-size: 12px;">주식회사 벤처플랫폼 | THE PATRON</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('[Email] sendApplicationRejectedEmail failed:', e)
  }
}

export interface MatchStatusEmailData {
  to: string
  name: string
  dealBriefTitle: string
  newStatus: string
  statusLabel: string
}

export async function sendMatchStatusEmail(data: MatchStatusEmailData): Promise<void> {
  try {
    const resend = getResend()
    const investorUrl = process.env.NEXT_PUBLIC_INVESTOR_URL ?? 'https://app.thepatron.co.kr'

    await resend.emails.send({
      from: FROM,
      to: data.to,
      subject: `[THE PATRON] 매칭 상태 업데이트: ${data.statusLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #fff; padding: 40px;">
          <h2 style="color: #D4AF37;">THE PATRON</h2>
          <p>${data.name} 님, 매칭 신청 상태가 업데이트되었습니다.</p>
          <div style="background: #2F2F2F; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px; color: #888;">딜</p>
            <p style="margin: 0 0 16px; font-weight: bold;">${data.dealBriefTitle}</p>
            <p style="margin: 0 0 8px; color: #888;">현재 상태</p>
            <p style="margin: 0; color: #D4AF37; font-weight: bold; font-size: 18px;">${data.statusLabel}</p>
          </div>
          <a href="${investorUrl}/matches" style="display: inline-block; background: #D4AF37; color: #0A0A0A; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            매칭 현황 확인하기
          </a>
          <hr style="border-color: #333; margin-top: 32px;" />
          <p style="color: #555; font-size: 12px;">주식회사 벤처플랫폼 | THE PATRON</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('[Email] sendMatchStatusEmail failed:', e)
  }
}
