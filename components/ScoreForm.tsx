'use client'

import { useState } from 'react'
import { AuditData } from '@/app/page'

interface Props {
  onSubmit: (data: AuditData) => void
  error: string | null
}

export default function ScoreForm({ onSubmit, error }: Props) {
  const [form, setForm] = useState<AuditData>({ url: '', businessName: '', keyword: '', location: '' })
  const [loading, setLoading] = useState(false)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.url || !form.businessName) return
    setLoading(true)
    onSubmit(form)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>E</span>
          </div>
          <span className="font-display" style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>ESMIAN</span>
        </div>
        <a href="mailto:contact@esmian.com" style={{ fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none' }}>contact@esmian.com</a>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.3)', borderRadius: '100px', padding: '0.3rem 0.9rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6c47ff' }} />
            <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Free SEO Audit</span>
          </div>

          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Find out why your<br />
            <span style={{ color: 'var(--accent)' }}>competitors outrank you</span>
          </h1>

          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Enter your website below. We'll scan 40+ SEO signals and give you a real score in under 30 seconds — no signup required.
          </p>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website URL *</label>
                <input
                  name="url" value={form.url} onChange={handle} required
                  placeholder="https://yoursite.com"
                  style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Name *</label>
                <input
                  name="businessName" value={form.businessName} onChange={handle} required
                  placeholder="Acme Plumbing Co."
                  style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Keyword</label>
                <input
                  name="keyword" value={form.keyword} onChange={handle}
                  placeholder="e.g. plumber near me"
                  style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                <input
                  name="location" value={form.location} onChange={handle}
                  placeholder="e.g. Miami, FL"
                  style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {error && <p style={{ color: '#ff4757', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading || !form.url || !form.businessName}
              style={{
                marginTop: '0.5rem',
                background: loading ? 'var(--surface2)' : 'var(--accent)',
                color: 'white', border: 'none', borderRadius: '12px',
                padding: '1rem 2rem', fontSize: '1rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', letterSpacing: '-0.01em',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              {loading ? 'Running audit...' : '🔍 Get My Free SEO Score'}
            </button>
          </form>

          {/* Trust bar */}
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {['No signup required', 'Results in 30 seconds', '100% free'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: '#22c55e', fontSize: '0.75rem' }}>✓</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
