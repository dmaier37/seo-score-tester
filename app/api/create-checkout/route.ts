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

    // Save audit data so webhook can retrieve it after payment
    saveAudit(email, { email, businessName, url, keyword, location, overallScore, categories, checks })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo-score-tester.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SEO Fix Report — ${businessName}`,
              description: `Full prioritized fix report for ${url}. Score: ${overallScore}/100. Delivered instantly to ${email}.`,
            },
            unit_amount: 4700, // $47.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        email,
        businessName,
        url,
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error('Checkout error:', e)
    return NextResponse.json({ error: e.message || 'Failed to create checkout' }, { status: 500 })
  }
}
