import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

const categoryNames: Record<string, string> = {
  technical: 'Technical SEO',
  onPage: 'On-Page SEO',
  localSeo: 'Local SEO',
  content: 'Content Quality',
}

export async function sendScoreEmail(data: {
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
  const scoreColor = getScoreColor(overallScore)
  const scoreLabel = getScoreLabel(overallScore)
  const failedChecks = checks.filter(c => !c.passed)
  const passedChecks = checks.filter(c => c.passed)

  const passedHtml = passedChecks.map((check: any) => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #2a2a3a;">
      <span style="color:#22c55e;flex-shrink:0;">✓</span>
      <span style="color:#8888aa;font-size:13px;">${check.name}</span>
    </div>
  `).join('')

  const fixesHtml = failedChecks
    .sort((a: any, b: any) => ({ high: 3, medium: 2, low: 1 }[b.impact as string] as number) - ({ high: 3, medium: 2, low: 1 }[a.impact as string] as number))
    .map((check: any) => `
    <div style="background:#1c1c26;border:1px solid #2a2a3a;border-radius:12px;padding:20px;margin-bottom:12px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;gap:8px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="color:#ef4444;font-size:16px;flex-shrink:0;">✗</span>
          <span style="color:#f0f0f5;font-weight:600;font-size:14px;">${check.name}</span>
        </div>
        <span style="background:${check.impact === 'high' ? 'rgba(239,68,68,0.15)' : check.impact === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)'};color:${check.impact === 'high' ? '#fca5a5' : check.impact === 'medium' ? '#fcd34d' : '#a5b4fc'};border-radius:100px;padding:2px 10px;font-size:11px;font-weight:600;text-transform:uppercase;white-space:nowrap;flex-shrink:0;">${check.impact} impact</span>
      </div>
      <p style="color:#8888aa;font-size:13px;margin:0 0 10px 26px;line-height:1.5;">${check.detail}</p>
      <div style="background:#13131a;border-radius:8px;padding:12px;margin-left:26px;">
        <p style="color:#a78bfa;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">How to fix it:</p>
        <p style="color:#f0f0f5;font-size:13px;margin:0;line-height:1.5;">${check.fix}</p>
      </div>
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,Arial,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:40px;">
    <div style="margin-bottom:16px;">
      <div style="display:inline-block;width:40px;height:40px;background:#6c47ff;border-radius:10px;line-height:40px;text-align:center;">
        <span style="color:white;font-size:18px;font-weight:800;">E</span>
      </div>
    </div>
    <h1 style="color:#f0f0f5;font-size:26px;font-weight:800;margin:0 0 8px;letter-spacing:-0.03em;">Your Full SEO Fix Report</h1>
    <p style="color:#8888aa;font-size:14px;margin:0;">${businessName} · ${url}</p>
    ${keyword ? `<p style="color:#8888aa;font-size:12px;margin:4px 0 0;">Keyword: ${keyword}${location ? ` · ${location}` : ''}</p>` : ''}
  </div>

  <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:20px;padding:32px;text-align:center;margin-bottom:24px;">
    <p style="color:#8888aa;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;margin:0 0 12px;">Overall SEO Score</p>
    <div style="font-size:72px;font-weight:900;color:${scoreColor};line-height:1;margin-bottom:8px;">${overallScore}</div>
    <div style="font-size:13px;color:#8888aa;margin-bottom:16px;">out of 100</div>
    <div style="display:inline-block;background:${scoreColor}22;border:1px solid ${scoreColor}55;border-radius:100px;padding:4px 16px;">
      <span style="color:${scoreColor};font-size:13px;font-weight:700;">${scoreLabel}</span>
    </div>
  </div>

  <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:20px;padding:24px;margin-bottom:24px;">
    <h2 style="color:#f0f0f5;font-size:16px;font-weight:700;margin:0 0 20px;">Score Breakdown</h2>
    ${Object.entries(categories).map(([key, val]: [string, any]) => `
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:#f0f0f5;font-size:13px;">${categoryNames[key] || key}</span>
          <span style="color:${getScoreColor(val)};font-weight:700;font-size:13px;">${val}/100</span>
        </div>
        <div style="height:6px;background:#1c1c26;border-radius:100px;">
          <div style="height:100%;width:${val}%;background:${getScoreColor(val)};border-radius:100px;"></div>
        </div>
      </div>
    `).join('')}
  </div>

  <div style="margin-bottom:24px;">
    <h2 style="color:#f0f0f5;font-size:18px;font-weight:700;margin:0 0 6px;">Your ${failedChecks.length} SEO Issues — Fix These First</h2>
    <p style="color:#8888aa;font-size:13px;margin:0 0 16px;line-height:1.5;">Listed highest to lowest impact. Fix in this order for the fastest score improvement.</p>
    ${fixesHtml}
  </div>

  ${passedChecks.length > 0 ? `
  <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:20px;padding:24px;margin-bottom:24px;">
    <h2 style="color:#f0f0f5;font-size:16px;font-weight:700;margin:0 0 16px;">✅ Already Working (${passedChecks.length} checks passed)</h2>
    ${passedHtml}
  </div>` : ''}

  <div style="background:linear-gradient(135deg,rgba(108,71,255,0.2),rgba(108,71,255,0.05));border:1px solid rgba(108,71,255,0.4);border-radius:20px;padding:32px;text-align:center;margin-bottom:24px;">
    <h2 style="color:#f0f0f5;font-size:20px;font-weight:700;margin:0 0 10px;">Don't want to do this yourself?</h2>
    <p style="color:#8888aa;font-size:14px;margin:0 0 24px;line-height:1.6;">Book a free 30-minute call. I'll walk through your results, handle all the fixes for you, and improve your score every single month.</p>
    <a href="https://calendly.com/PLACEHOLDER" style="display:inline-block;background:#6c47ff;color:white;border-radius:12px;padding:14px 32px;font-size:15px;font-weight:700;text-decoration:none;">📅 Book My Free Strategy Call</a>
  </div>

  <div style="text-align:center;padding-top:24px;border-top:1px solid #2a2a3a;">
    <p style="color:#8888aa;font-size:12px;margin:0 0 4px;">ESMIAN Web Solutions · contact@esmian.com</p>
    <p style="color:#555566;font-size:11px;margin:0;">Report generated from a real-time crawl of your live website across ${checks.length} SEO signals.</p>
  </div>
</div>
</body>
</html>`

  return resend.emails.send({
    from: 'ESMIAN SEO <onboarding@resend.dev>',
    replyTo: 'contact@esmian.com',
    to: email,
    subject: `✅ Your Full SEO Fix Report — ${businessName} (${overallScore}/100)`,
    html,
  })
}

export async function sendScorePreviewEmail(data: {
  email: string
  businessName: string
  url: string
  overallScore: number
  categories: Record<string, number>
  checks: any[]
}) {
  const { email, businessName, url, overallScore, categories, checks } = data
  const scoreColor = getScoreColor(overallScore)
  const scoreLabel = getScoreLabel(overallScore)
  const failedCount = checks.filter(c => !c.passed).length

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:32px;">
    <div style="margin-bottom:16px;">
      <div style="display:inline-block;width:40px;height:40px;background:#6c47ff;border-radius:10px;line-height:40px;text-align:center;">
        <span style="color:white;font-size:18px;font-weight:800;">E</span>
      </div>
    </div>
    <h1 style="color:#f0f0f5;font-size:24px;font-weight:800;margin:0 0 8px;">Your SEO Score is Ready</h1>
    <p style="color:#8888aa;font-size:14px;margin:0;">${businessName} · ${url}</p>
  </div>

  <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:20px;padding:32px;text-align:center;margin-bottom:24px;">
    <p style="color:#8888aa;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;margin:0 0 12px;">Your SEO Score</p>
    <div style="font-size:72px;font-weight:900;color:${scoreColor};line-height:1;margin-bottom:8px;">${overallScore}</div>
    <div style="font-size:13px;color:#8888aa;margin-bottom:16px;">out of 100</div>
    <div style="display:inline-block;background:${scoreColor}22;border:1px solid ${scoreColor}55;border-radius:100px;padding:4px 16px;margin-bottom:20px;">
      <span style="color:${scoreColor};font-size:13px;font-weight:700;">${scoreLabel}</span>
    </div>
    <p style="color:#fca5a5;font-size:14px;margin:0;line-height:1.6;">We found <strong>${failedCount} SEO issues</strong> on your site. The fixes are waiting for you.</p>
  </div>

  <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:20px;padding:24px;margin-bottom:24px;">
    <h2 style="color:#f0f0f5;font-size:15px;font-weight:700;margin:0 0 16px;">Score Breakdown</h2>
    ${Object.entries(categories).map(([key, val]: [string, any]) => `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="color:#8888aa;font-size:13px;">${categoryNames[key] || key}</span>
          <span style="color:${getScoreColor(val)};font-weight:700;font-size:13px;">${val}/100</span>
        </div>
        <div style="height:5px;background:#1c1c26;border-radius:100px;">
          <div style="height:100%;width:${val}%;background:${getScoreColor(val)};border-radius:100px;"></div>
        </div>
      </div>
    `).join('')}
  </div>

  <div style="background:linear-gradient(135deg,rgba(108,71,255,0.2),rgba(108,71,255,0.05));border:1px solid rgba(108,71,255,0.4);border-radius:20px;padding:28px;text-align:center;margin-bottom:24px;">
    <h2 style="color:#f0f0f5;font-size:18px;font-weight:700;margin:0 0 10px;">See exactly how to fix it</h2>
    <p style="color:#8888aa;font-size:13px;margin:0 0 20px;line-height:1.6;">Unlock your full report with all ${failedCount} specific fixes, prioritized by impact — so you know exactly what to do first.</p>
    <a href="https://buy.stripe.com/PLACEHOLDER" style="display:inline-block;background:#6c47ff;color:white;border-radius:12px;padding:14px 32px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:12px;">Unlock Full Fix Report — $47</a>
    <p style="color:#555566;font-size:12px;margin:8px 0 0;">Or book a free call and I'll handle everything for you →<br><a href="https://calendly.com/PLACEHOLDER" style="color:#a78bfa;">Schedule a free strategy call</a></p>
  </div>

  <div style="text-align:center;padding-top:20px;border-top:1px solid #2a2a3a;">
    <p style="color:#8888aa;font-size:12px;margin:0;">ESMIAN Web Solutions · <a href="mailto:contact@esmian.com" style="color:#6c47ff;">contact@esmian.com</a></p>
  </div>
</div>
</body>
</html>`

  return resend.emails.send({
    from: 'ESMIAN SEO <onboarding@resend.dev>',
    replyTo: 'contact@esmian.com',
    to: email,
    subject: `Your SEO score: ${overallScore}/100 — ${failedCount} issues found`,
    html,
  })
}
