import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'contact@esmian.com'

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
    <div style="width:32px;height:32px;background:#6c47ff;border-radius:8px;text-align:center;line-height:32px;">
      <span style="color:white;font-weight:800;font-size:14px;">E</span>
    </div>
    <span style="color:#f0f0f5;font-weight:700;font-size:16px;">ESMIAN</span>
    <span style="margin-left:auto;background:#f59e0b22;border:1px solid #f59e0b55;color:#f59e0b;border-radius:100px;padding:3px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Call Booked</span>
  </div>
  ${content}
  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #2a2a3a;">
    <p style="color:#555566;font-size:11px;margin:0;">ESMIAN Lead Tracker · Private admin notification · Do not forward</p>
  </div>
</div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Calendly sends event data in this structure
    const eventType = body?.event
    if (eventType !== 'invitee.created') {
      return NextResponse.json({ received: true })
    }

    const invitee = body?.payload?.invitee
    const event = body?.payload?.event
    const questions = body?.payload?.questions_and_answers || []

    const name = invitee?.name || 'Unknown'
    const email = invitee?.email || 'Unknown'
    const eventName = event?.name || 'Strategy Call'
    const startTime = event?.start_time ? new Date(event.start_time).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    }) : 'TBD'

    const questionsHtml = questions.length > 0 ? questions.map((q: any) => `
      <tr>
        <td style="padding:8px 12px;color:#8888aa;font-size:12px;border-bottom:1px solid #2a2a3a;vertical-align:top;">${q.question}</td>
        <td style="padding:8px 12px;color:#f0f0f5;font-size:12px;border-bottom:1px solid #2a2a3a;">${q.answer || '—'}</td>
      </tr>
    `).join('') : ''

    const content = `
      <h2 style="color:#f0f0f5;font-size:20px;font-weight:700;margin:0 0 4px;">📅 New Call Booked!</h2>
      <p style="color:#8888aa;font-size:13px;margin:0 0 20px;">Someone just booked a free strategy call with you.</p>

      <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:16px;overflow:hidden;margin-bottom:16px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 12px;color:#8888aa;font-size:13px;border-bottom:1px solid #2a2a3a;">Name</td>
            <td style="padding:8px 12px;color:#f0f0f5;font-size:13px;font-weight:600;border-bottom:1px solid #2a2a3a;text-align:right;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#8888aa;font-size:13px;border-bottom:1px solid #2a2a3a;">Email</td>
            <td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #2a2a3a;text-align:right;"><a href="mailto:${email}" style="color:#6c47ff;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#8888aa;font-size:13px;border-bottom:1px solid #2a2a3a;">Meeting</td>
            <td style="padding:8px 12px;color:#f0f0f5;font-size:13px;border-bottom:1px solid #2a2a3a;text-align:right;">${eventName}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#8888aa;font-size:13px;">Time</td>
            <td style="padding:8px 12px;color:#fcd34d;font-size:13px;font-weight:600;text-align:right;">${startTime}</td>
          </tr>
        </table>
      </div>

      ${questionsHtml ? `
      <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:16px;overflow:hidden;margin-bottom:16px;">
        <div style="padding:12px 16px;border-bottom:1px solid #2a2a3a;">
          <p style="color:#8888aa;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Their Answers</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${questionsHtml}
        </table>
      </div>` : ''}

      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:14px 16px;">
        <p style="color:#fcd34d;font-size:13px;margin:0;">🎯 Prep tip: Look up ${name}'s business before the call. They came through your SEO score tester — pull up their score if you have it so you can walk through it live.</p>
      </div>`

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'ESMIAN Leads <onboarding@resend.dev>',
      replyTo: ADMIN_EMAIL,
      to: ADMIN_EMAIL,
      subject: `📅 Call Booked: ${name} — ${startTime}`,
      html: baseTemplate(content),
    })

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('Calendly webhook error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
