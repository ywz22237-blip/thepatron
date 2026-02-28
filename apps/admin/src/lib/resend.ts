// Resend 이메일 발송 클라이언트 (Admin용)
const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM_EMAIL = 'THE PATRON <noreply@thepatron.co.kr>'

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
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
        <tr><td style="background:#C9A84C;padding:24px 32px;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#0A0A0A;font-weight:700;">THE PATRON</p>
        </td></tr>
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
            ${signupUrl}
          </p>
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
