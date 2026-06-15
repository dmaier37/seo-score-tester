import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAudit, deleteAudit } from '@/lib/auditStore'
import { notifyPayment } from '@/lib/adminNotify'
import { sendScoreEmail } from '@/lib/reportEmail'

function auditFromMetadata(metadata: Record<string, string>) {
  const count = parseInt(metadata.ac || '0')
  if (!count) return null
  let json = ''
  for (let i = 0; i < count; i++) json += metadata[`a${i}`] || ''
  try { return JSON.parse(json) } catch { return null }
}

async function fulfillOrder(email: string, amountPaid: number, stripeId: string, audit: any) {
  if (!audit) {
    // Fall back to in-memory store (works when checkout and webhook hit the same instance)
    audit = getAudit(email)
  }

  if (!audit) {
    console.error('No audit data available for:', email)
    return
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

    notifyPayment({
      email: audit.email,
      businessName: audit.businessName,
      url: audit.url,
      overallScore: audit.overallScore,
      amountPaid,
      stripeSessionId: stripeId,
    }).catch(e => console.error('Admin payment notify failed:', e))
  } catch (e) {
    console.error('Failed to send report email:', e)
  }
}

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
      console.error('No email in checkout session')
      return NextResponse.json({ received: true })
    }
    const audit = auditFromMetadata(session.metadata || {})
    await fulfillOrder(email, session.amount_total || 4700, session.id, audit)
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as any

    // Payment links fire payment_intent.succeeded — email and audit live on the Checkout Session
    const sessions = await stripe.checkout.sessions.list({ payment_intent: intent.id, limit: 1 })
    const session = sessions.data[0]

    const email = session?.customer_email
      || session?.customer_details?.email
      || session?.metadata?.email
      || intent.receipt_email
      || intent.metadata?.email

    if (!email) {
      console.error('No email found for payment_intent:', intent.id)
      return NextResponse.json({ received: true })
    }

    const audit = auditFromMetadata(session?.metadata || {})
    await fulfillOrder(email, intent.amount || 4700, intent.id, audit)
  }

  return NextResponse.json({ received: true })
}
