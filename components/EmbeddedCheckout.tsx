'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  auditData: {
    email: string
    businessName: string
    url: string
    keyword: string
    location: string
    overallScore: number
    categories: Record<string, number>
    checks: any[]
  }
  onClose: () => void
}

export default function EmbeddedCheckoutModal({ auditData, onClose }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditData),
    })
      .then(r => r.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setError(data.error || 'Could not load checkout. Please try again.')
        }
      })
      .catch(() => setError('Could not load checkout. Please try again.'))
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '20px', width: '100%', maxWidth: '480px',
        maxHeight: '90vh', overflow: 'auto', position: 'relative',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 2px' }}>Unlock Full Report</p>
            <p className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>SEO Fix Report — $47</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '4px' }}>✕</button>
        </div>

        {/* What they get */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
          {['All issues with step-by-step fix instructions', 'Prioritized by impact — fix in the right order', 'Specific to your actual site', 'Delivered instantly to your email'].map(item => (
            <div key={item} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ color: '#22c55e', fontSize: '0.8rem', flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>{error}</p>
            </div>
          )}
          {!clientSecret && !error && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Loading secure checkout...</p>
            </div>
          )}
          {clientSecret && (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </div>
    </div>
  )
}
