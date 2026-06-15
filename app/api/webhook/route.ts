import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAudit, deleteAudit } from '@/lib/auditStore'
import { notifyPayment } from '@/lib/adminNotify'
import { sendScoreEmail } from '@/lib/reportEmail'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (e: any) {
    console.error('Webhook signature failed:', e.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    const email = session.customer_email || session.metadata?.email
    if (!email) {
      console.error('No email in session')
      return NextResponse.json({ error: 'No email' }, { status: 400 })
    }

    // Retrieve audit data saved before checkout
    const audit = getAudit(email)
    if (!audit) {
      console.error('No audit data found for:', email)
      // Still return 200 so Stripe doesn't retry — data may have expired
      return NextResponse.json({ received: true })
    }

    try {
      await sendScoreEmail({
        email: audit.email,
        businessName: audit.businessName,
        url: audit.url,
        keyword: audit.keyword,
        location: audit.location,
        overallScore: audit.overallScore,
        categories: audit.categories,
        checks: audit.checks,
      })
      deleteAudit(email)
      console.log(`✅ Full report sent to ${email}`)

      // Notify admin of payment
      notifyPayment({
        email: audit.email,
        businessName: audit.businessName,
        url: audit.url,
        overallScore: audit.overallScore,
        amountPaid: session.amount_total || 4700,
        stripeSessionId: session.id,
      }).catch(e => console.error('Admin payment notify failed:', e))
    } catch (e) {
      console.error('Failed to send report email:', e)
    }
  }

  return NextResponse.json({ received: true })
}
