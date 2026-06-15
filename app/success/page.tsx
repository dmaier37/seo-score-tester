export default function SuccessPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <style>{`@keyframes pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }`}</style>

      <div style={{ animation: 'pop 0.5s ease forwards', marginBottom: '1.5rem', fontSize: '4rem' }}>✅</div>

      <div style={{ maxWidth: '480px' }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
          Your report is on its way!
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2rem' }}>
          We're sending your full SEO fix report to your email right now. Check your inbox in the next few minutes — including your spam folder just in case.
        </p>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your report includes:</p>
          {[
            'All your SEO issues prioritized by impact',
            'Step-by-step fix instructions for each issue',
            'What\'s already working on your site',
            'Score breakdown across all 4 categories',
          ].map(item => (
            <div key={item} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.15),rgba(108,71,255,0.05))', border: '1px solid rgba(108,71,255,0.3)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Rather have us handle it for you?</p>
            <div style={{ background: 'rgba(108,71,255,0.2)', border: '1px solid rgba(108,71,255,0.4)', borderRadius: '100px', padding: '0.2rem 0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 700 }}>$97/mo ongoing support</span>
            </div>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.55 }}>
            Got the report but feeling stuck? No problem — your $47 counts as a credit toward our full Done-For-You service.
          </p>
          <div style={{ background: 'rgba(108,71,255,0.1)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: '0.8rem', color: '#a78bfa', margin: 0, lineHeight: 1.5 }}>
              <strong>How it works:</strong> Book a free call → we review your report together → if you want us to handle it, just pay the remaining $50 ($97 total − your $47 credit).
            </p>
          </div>
          <a href="https://calendly.com/PLACEHOLDER"
            style={{ display: 'block', textAlign: 'center', background: 'var(--accent)', color: 'white', borderRadius: '10px', padding: '0.8rem', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif' }}>
            📅 Book My Free Strategy Call
          </a>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.75rem' }}>Need help? Reach out directly:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="mailto:contact@esmian.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem' }}>
              <span>📧</span> contact@esmian.com
            </a>
            <a href="tel:+16405002399" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem' }}>
              <span>📞</span> (640) 500-2399
            </a>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
            If your report doesn't arrive within 5 minutes, check your spam folder or email us and we'll send it manually right away.
          </p>
        </div>

        <a href="/" style={{ color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Test another website
        </a>
      </div>
    </div>
  )
}
