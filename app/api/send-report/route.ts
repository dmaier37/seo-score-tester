import { NextRequest, NextResponse } from 'next/server'
import { sendScorePreviewEmail } from '@/lib/reportEmail'

export async function POST(req: NextRequest) {
  try {
    const { email, businessName, url, keyword, location, overallScore, categories, checks } = await req.json()
    await sendScorePreviewEmail({ email, businessName, url, overallScore, categories, checks })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to send preview email' }, { status: 500 })
  }
}
