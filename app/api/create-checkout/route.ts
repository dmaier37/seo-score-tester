import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { saveAudit } from '@/lib/auditStore'

const CHUNK = 490

function auditToMetadata(audit: object): Record<string, string> {
  const json = JSON.stringify(audit)
  const count = Math.ceil(json.length / CHUNK)
  const chunks: Record<string, string> = { ac: String(count) }
  for (let i = 0; i < count; i++) {
    chunks[`a${i}`] = json.slice(i * CHUNK, (i + 1) * CHUNK)
  }
  return chunks
}

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const { email, businessName, url, keyword, location, overallScore, categories, checks } = await req.json()

    if (!email || !overallScore) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const audit = { email, businessName, url, keyword, location, overallScore, categories, checks }
    saveAudit(email, audit)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo-score-tester.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      ui_mode: 'embedded_page' as any,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SEO Fix Report — ${businessName}`,
              description: `Full prioritized fix report for ${url}. Score: ${overallScore}/100.`,
            },
            unit_amount: 4700,
          },
          quantity: 1,
        },
      ],
      metadata: { email, businessName, url, ...auditToMetadata(audit) },
      return_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    })

    console.log('Session created:', session.id, 'client_secret exists:', !!session.client_secret)

    if (!session.client_secret) {
      console.error('No client_secret in session — embedded mode may not be enabled')
      return NextResponse.json({ error: 'Stripe embedded checkout not available' }, { status: 500 })
    }

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (e: any) {
    console.error('Checkout error full:', e?.message, e?.type, e?.code)
    return NextResponse.json({ error: e?.message || 'Failed to create checkout' }, { status: 500 })
  }
}
