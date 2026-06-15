import { Resend } from 'resend'

const ADMIN_EMAIL = 'dani.maier07@gmail.com'

function getScoreColor(score: number) {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Needs Work'
  if (score >= 40) return 'Poor'
  return 'Critical'
}

function baseTemplate(content: string, badge: string, badgeColor: string) {
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
    <span style="margin-left:auto;background:${badgeColor}22;border:1px solid ${badgeColor}55;color:${badgeColor};border-radius:100px;padding:3px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${badge}</span>
  </div>
  ${content}
  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #2a2a3a;">
    <p style="color:#555566;font-size:11px;margin:0;">ESMIAN Lead Tracker · Private admin notification · Do not forward</p>
  </div>
</div>
</body>
</html>`
}

function scoreRow(label: string, value: string, highlight = false) {
  return `<tr>
    <td style="padding:8px 12px;color:#8888aa;font-size:13px;border-bottom:1px solid #2a2a3a;">${label}</td>
    <td style="padding:8px 12px;color:${highlight ? '#f0f0f5' : '#ccccdd'};font-size:13px;font-weight:${highlight ? 600 : 400};border-bottom:1px solid #2a2a3a;text-align:right;">${value}</td>
  </tr>`
}

export async function notifyNewLead(data: {
  email: string
  businessName: string
  url: string
  keyword: string
  location: string
  overallScore: number
  categories: Record<string, number>
  checks: any[]
}) {
  const { email, businessName, url, keyword, location, overallScore, categories, checks } = data
  const color = getScoreColor(overallScore)
  const label = getScoreLabel(overallScore)
  const failedCount = checks.filter((c: any) => !c.passed).length
  const highImpactFails = checks.filter((c: any) => !c.passed && c.impact === 'high').length

  const content = `
    <h2 style="color:#f0f0f5;font-size:20px;font-weight:700;margin:0 0 4px;">New Lead — Free Audit</h2>
    <p style="color:#8888aa;font-size:13px;margin:0 0 20px;">Someone just ran their SEO score.</p>

    <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:16px;overflow:hidden;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        ${scoreRow('Business', businessName, true)}
        ${scoreRow('Email', email, true)}
        ${scoreRow('Website', url)}
        ${scoreRow('Keyword', keyword || '—')}
        ${scoreRow('Location', location || '—')}
      </table>
    </div>

    <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:16px;padding:20px;margin-bottom:16px;text-align:center;">
      <p style="color:#8888aa;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">SEO Score</p>
      <div style="font-size:56px;font-weight:900;color:${color};line-height:1;margin-bottom:6px;">${overallScore}</div>
      <div style="display:inline-block;background:${color}22;border:1px solid ${color}55;border-radius:100px;padding:3px 12px;">
        <span style="color:${color};font-size:12px;font-weight:700;">${label}</span>
      </div>
    </div>

    <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:16px;overflow:hidden;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        ${scoreRow('Technical SEO', `${categories.technical}/100`)}
        ${scoreRow('On-Page SEO', `${categories.onPage}/100`)}
        ${scoreRow('Local SEO', `${categories.localSeo}/100`)}
        ${scoreRow('Content Quality', `${categories.content}/100`)}
        ${scoreRow('Total Issues', `${failedCount} found`, true)}
        ${scoreRow('High Impact Issues', `${highImpactFails} critical`, true)}
      </table>
    </div>

    <div style="background:rgba(108,71,255,0.08);border:1px solid rgba(108,71,255,0.25);border-radius:12px;padding:14px 16px;">
      <p style="color:#a78bfa;font-size:13px;margin:0;">💡 This lead has not paid yet. They're seeing their score with fixes locked. Follow up at <a href="mailto:${email}" style="color:#6c47ff;">${email}</a> if they don't convert in 24hrs.</p>
    </div>`

  const resend = new Resend(process.env.RESEND_API_KEY)
  return resend.emails.send({
    from: 'ESMIAN Leads <onboarding@resend.dev>',
    replyTo: ADMIN_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🔍 New Lead: ${businessName} scored ${overallScore}/100 — ${failedCount} issues found`,
    html: baseTemplate(content, 'New Lead', '#6c47ff'),
  })
}

export async function notifyPayment(data: {
  email: string
  businessName: string
  url: string
  overallScore: number
  amountPaid: number
  stripeSessionId: string
}) {
  const { email, businessName, url, overallScore, amountPaid, stripeSessionId } = data
  const color = getScoreColor(overallScore)

  const content = `
    <h2 style="color:#f0f0f5;font-size:20px;font-weight:700;margin:0 0 4px;">💰 Payment Received — $${(amountPaid / 100).toFixed(2)}</h2>
    <p style="color:#8888aa;font-size:13px;margin:0 0 20px;">Someone just paid for their full SEO fix report. Report has been sent to their inbox automatically.</p>

    <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:16px;overflow:hidden;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        ${scoreRow('Business', businessName, true)}
        ${scoreRow('Email', email, true)}
        ${scoreRow('Website', url)}
        ${scoreRow('SEO Score', `${overallScore}/100`)}
        ${scoreRow('Amount Paid', `$${(amountPaid / 100).toFixed(2)}`, true)}
        ${scoreRow('Stripe Session', stripeSessionId.substring(0, 24) + '...')}
      </table>
    </div>

    <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:12px;padding:14px 16px;">
      <p style="color:#86efac;font-size:13px;margin:0;">✅ Full fix report was automatically emailed to ${email}. Their score is ${overallScore}/100 — they may be a strong candidate for your DFY monthly service. Consider following up in a few days.</p>
    </div>`

  const resend = new Resend(process.env.RESEND_API_KEY)
  return resend.emails.send({
    from: 'ESMIAN Leads <onboarding@resend.dev>',
    replyTo: ADMIN_EMAIL,
    to: ADMIN_EMAIL,
    subject: `💰 Payment: ${businessName} paid $${(amountPaid / 100).toFixed(2)} — report delivered`,
    html: baseTemplate(content, 'Paid', '#22c55e'),
  })
}
