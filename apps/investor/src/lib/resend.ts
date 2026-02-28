// Resend 이메일 발송 클라이언트
// https://resend.com/docs

const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM_EMAIL = 'THE PATRON <noreply@thepatron.co.kr>'

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '이메일 발송 실패')
  }
  return res.json() as Promise<{ id: string }>
}

// ── 초대 코드 이메일 ────────────────────────────────────────────────────────────
export function sendInviteEmail({ to, name, code, signupUrl }: {
  to: string
  name: string
  code: string
  signupUrl: string
}) {
  return sendEmail({
    to,
    subject: '[THE PATRON] 회원 가입 초대장이 도착했습니다',
    html: `
<!DOCTYPE html>
<html>
<body style="background:#0A0A0A;color:#E5E7EB;font-family:'Apple SD Gothic Neo',sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #2A2A2A;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#C9A84C;padding:24px 32px;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#0A0A0A;font-weight:700;">THE PATRON</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 32px;">
          <h1 style="margin:0 0 8px;font-size:24px;color:#FFFFFF;font-weight:700;">회원 가입 초대</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9CA3AF;">안녕하세요, ${name}님. 심사가 완료되었습니다.</p>

          <div style="background:#1E1E1E;border:1px solid #2A2A2A;border-radius:12px;padding:24px;margin-bottom:28px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#9CA3AF;letter-spacing:2px;">초대 코드</p>
            <p style="margin:0;font-size:32px;font-weight:700;color:#C9A84C;letter-spacing:6px;">${code}</p>
            <p style="margin:8px 0 0;font-size:11px;color:#6B7280;">7일 이내 사용 가능</p>
          </div>

          <a href="${signupUrl}" style="display:block;background:#C9A84C;color:#0A0A0A;font-weight:700;font-size:15px;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;margin-bottom:20px;">
            회원 가입 완료하기
          </a>

          <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.6;">
            버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
            <span style="color:#C9A84C;">${signupUrl}</span>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #2A2A2A;">
          <p style="margin:0;font-size:11px;color:#6B7280;text-align:center;">
            © THE PATRON. All rights reserved.<br>
            이 이메일은 THE PATRON 가입 신청자에게 발송됩니다.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

// ── 매칭 상태 변경 알림 ─────────────────────────────────────────────────────────
const MATCH_STATUS_KO: Record<string, string> = {
  REVIEWING: '검토 중',
  DELIVERED: '자료 전달 완료',
  MEETING: '미팅 단계',
  DEAL_ROOM: 'Deal Room 입장',
  CONTRACT: '계약 진행 중',
  COMPLETED: '투자 완료',
}

export function sendMatchStatusEmail({ to, investorName, dealTitle, status }: {
  to: string
  investorName: string
  dealTitle: string
  status: string
}) {
  const statusKo = MATCH_STATUS_KO[status] || status
  return sendEmail({
    to,
    subject: `[THE PATRON] 매칭 상태 업데이트 — ${statusKo}`,
    html: `
<!DOCTYPE html>
<html>
<body style="background:#0A0A0A;color:#E5E7EB;font-family:'Apple SD Gothic Neo',sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #2A2A2A;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#C9A84C;padding:24px 32px;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#0A0A0A;font-weight:700;">THE PATRON</p>
        </td></tr>
        <tr><td style="padding:40px 32px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#FFFFFF;font-weight:700;">매칭 상태 업데이트</h1>
          <p style="margin:0 0 28px;font-size:14px;color:#9CA3AF;">안녕하세요, ${investorName}님</p>

          <div style="background:#1A1A1A;border-left:3px solid #C9A84C;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:13px;color:#9CA3AF;">딜</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#FFFFFF;">${dealTitle}</p>
          </div>

          <div style="text-align:center;padding:24px;background:#1E1E1E;border-radius:12px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#9CA3AF;">현재 단계</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:#C9A84C;">${statusKo}</p>
          </div>

          <a href="${process.env.NEXT_PUBLIC_INVESTOR_URL || 'https://app.thepatron.co.kr'}/matches"
             style="display:block;background:#C9A84C;color:#0A0A0A;font-weight:700;font-size:14px;text-align:center;padding:13px 24px;border-radius:10px;text-decoration:none;">
            매칭 현황 확인하기
          </a>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #2A2A2A;">
          <p style="margin:0;font-size:11px;color:#6B7280;text-align:center;">© THE PATRON. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

// ── 신규 신청서 접수 알림 (관리자용) ──────────────────────────────────────────────
export function sendNewApplicationAlert({ to, applicantName, profession, adminUrl }: {
  to: string
  applicantName: string
  profession: string
  adminUrl: string
}) {
  return sendEmail({
    to,
    subject: `[THE PATRON] 신규 멤버십 신청 — ${applicantName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="background:#F8FAFC;font-family:'Apple SD Gothic Neo',sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="520" style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#1B3A6B;padding:20px 28px;">
          <p style="margin:0;font-size:13px;color:#FFFFFF;font-weight:700;">THE PATRON 관리자</p>
        </td></tr>
        <tr><td style="padding:32px 28px;">
          <h2 style="margin:0 0 16px;color:#0F172A;">신규 멤버십 신청이 접수되었습니다</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;color:#64748B;font-size:14px;width:100px;">신청자</td>
                <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;color:#0F172A;font-size:14px;font-weight:600;">${applicantName}</td></tr>
            <tr><td style="padding:8px 0;color:#64748B;font-size:14px;">직업</td>
                <td style="padding:8px 0;color:#0F172A;font-size:14px;">${profession}</td></tr>
          </table>
          <a href="${adminUrl}" style="display:inline-block;margin-top:24px;background:#1B3A6B;color:#FFFFFF;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
            신청서 검토하기
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
