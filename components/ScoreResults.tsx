'use client'

import { ScoreResult, AuditData } from '@/app/page'

interface Props {
  results: ScoreResult
  auditData: AuditData
  onRetry: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical SEO',
  onPage: 'On-Page SEO',
  localSeo: 'Local SEO',
  content: 'Content Quality',
}

const CATEGORY_ICONS: Record<string, string> = {
  technical: '⚙️',
  onPage: '📄',
  localSeo: '📍',
  content: '✍️',
}

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

function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const radius = size / 2 - 12
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="font-display" style={{ fontSize: size > 100 ? '2.25rem' : '1.4rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>/ 100</span>
      </div>
    </div>
  )
}

export default function ScoreResults({ results, auditData, onRetry }: Props) {
  const score = results.overallScore
  const scoreColor = getScoreColor(score)
  const scoreLabel = getScoreLabel(score)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>E</span>
          </div>
          <span className="font-display" style={{ fontWeight: 700, fontSize: '0.95rem' }}>ESMIAN</span>
        </div>
        <button onClick={onRetry} style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Test another site
        </button>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Score Hero */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            SEO Score for {auditData.businessName}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
            <ScoreRing score={score} size={160} />
          </div>

          <div style={{ display: 'inline-block', background: `${scoreColor}22`, border: `1px solid ${scoreColor}55`, borderRadius: '100px', padding: '0.3rem 1rem', marginBottom: '1rem' }}>
            <span style={{ color: scoreColor, fontSize: '0.8rem', fontWeight: 700 }}>{scoreLabel}</span>
          </div>

          <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>
            {results.headline}
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.65, fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto' }}>
            {results.summary}
          </p>
        </div>

        {/* Category Scores — Locked */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 className="font-display" style={{ fontWeight: 700, fontSize: '1rem' }}>Score Breakdown</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.25)', borderRadius: '100px', padding: '0.25rem 0.75rem' }}>
              <span style={{ fontSize: '0.7rem' }}>🔒</span>
              <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 600 }}>Fixes locked</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(results.categories).map(([key, val]) => {
              const color = getScoreColor(val)
              return (
                <div key={key}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem' }}>{CATEGORY_ICONS[key]}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{CATEGORY_LABELS[key]}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{val}/100</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--surface2)', borderRadius: '6px', padding: '0.2rem 0.5rem' }}>
                        <span style={{ fontSize: '0.65rem' }}>🔒</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Unlock fixes</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: '100px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Blurred fix preview */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface2)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: 600 }}>YOUR TOP FIXES:</p>
              {['Fix missing meta descriptions on 7 pages', 'Add structured data markup for local business', 'Improve page load speed (currently 4.2s)', 'Build citations on 12 key directories', 'Optimize H1 tags for target keyword'].map((fix, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>✗</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{fix}</span>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(1px)' }}>
              <span style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🔒</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Unlock to see your fixes</span>
            </div>
          </div>
        </div>

        {/* Urgency message */}
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: '0.875rem', color: '#fca5a5', lineHeight: 1.55 }}>{results.urgencyMessage}</p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* DIY */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>DIY Fix</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <span className="font-display" style={{ fontSize: '2rem', fontWeight: 800 }}>$47</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>one-time</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.55 }}>Get the full fix list with step-by-step instructions. You handle it at your own pace.</p>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', flex: 1 }}>
              {['Full fix list for all categories', 'Step-by-step instructions', 'Priority ranked by impact', 'Instant PDF report'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <a
              href="https://buy.stripe.com/PLACEHOLDER"
              style={{ display: 'block', textAlign: 'center', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '0.8rem', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', fontFamily: 'Space Grotesk, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              Unlock Full Report — $47
            </a>
          </div>

          {/* DFY */}
          <div style={{ background: 'linear-gradient(135deg, rgba(108,71,255,0.15), rgba(108,71,255,0.05))', border: '1px solid rgba(108,71,255,0.4)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', borderRadius: '0 0 8px 8px', padding: '0.2rem 0.75rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>MOST POPULAR</span>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>Done For You</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <span className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>Free</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>strategy call</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.55 }}>Book a free 30-min call. I'll review your score, explain the fixes, and we'll build a plan together.</p>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', flex: 1 }}>
              {['Free 30-min strategy call', 'I handle all the fixes for you', 'Monthly score improvements', 'Monthly reports so you see progress'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <span style={{ color: '#a78bfa', flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <a
              href="https://calendly.com/PLACEHOLDER"
              style={{ display: 'block', textAlign: 'center', background: 'var(--accent)', color: 'white', borderRadius: '10px', padding: '0.8rem', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s', fontFamily: 'Space Grotesk, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              📅 Book My Free Call
            </a>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          Questions? Email us at <a href="mailto:contact@esmian.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>contact@esmian.com</a>
        </p>
      </div>
    </div>
  )
}
