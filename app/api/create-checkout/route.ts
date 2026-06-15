import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { saveAudit } from '@/lib/auditStore'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
  try {
    const { email, businessName, url, keyword, location, overallScore, categories, checks } = await req.json()

    if (!email || !overallScore) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    saveAudit(email, { email, businessName, url, keyword, location, overallScore, categories, checks })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo-score-tester.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      ui_mode: 'embedded' as any,
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
      metadata: { email, businessName, url },
      return_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (e: any) {
    console.error('Checkout error:', e)
    return NextResponse.json({ error: e.message || 'Failed to create checkout' }, { status: 500 })
  }
}
