'use client'

import { useState } from 'react'
import ScoreForm from '@/components/ScoreForm'
import ScoreResults from '@/components/ScoreResults'

export interface AuditData {
  url: string
  businessName: string
  keyword: string
  location: string
  email: string
}

export interface SEOCheck {
  name: string
  passed: boolean
  impact: 'high' | 'medium' | 'low'
  detail: string
  fix: string
  category: 'technical' | 'onPage' | 'localSeo' | 'content'
}

export interface ScoreResult {
  overallScore: number
  categories: {
    technical: number
    onPage: number
    localSeo: number
    content: number
  }
  checks: SEOCheck[]
  headline: string
  summary: string
  urgencyMessage: string
}

export default function Home() {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form')
  const [auditData, setAuditData] = useState<AuditData | null>(null)
  const [results, setResults] = useState<ScoreResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: AuditData) => {
    setAuditData(data)
    setStep('loading')
    setError(null)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Audit failed')
      const result = await res.json()
      setResults(result)
      setStep('results')
    } catch (e) {
      setError('Something went wrong. Please try again.')
      setStep('form')
    }
  }

  return (
    <main className="min-h-screen">
      {step === 'form' && <ScoreForm onSubmit={handleSubmit} error={error} />}
      {step === 'loading' && <LoadingScreen businessName={auditData?.businessName} />}
      {step === 'results' && results && auditData && (
        <ScoreResults results={results} auditData={auditData} onRetry={() => setStep('form')} />
      )}
    </main>
  )
}

function LoadingScreen({ businessName }: { businessName?: string }) {
  const steps = [
    'Fetching your website...',
    'Analyzing technical SEO...',
    'Checking on-page signals...',
    'Scoring local SEO...',
    'Auditing content quality...',
  ]
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
        <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Auditing {businessName || 'your site'}</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>We're crawling your live website and running 15+ SEO checks. Takes about 20 seconds.</p>
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.7 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
