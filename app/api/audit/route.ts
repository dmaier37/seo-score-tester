import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { url, businessName, keyword, location } = await req.json()

  if (!url || !businessName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const prompt = `You are an expert SEO auditor. Analyze this business's SEO presence and generate a realistic, honest score.

Business: ${businessName}
Website: ${url}
Target Keyword: ${keyword || 'general business keywords'}
Location: ${location || 'not specified'}

Generate a realistic SEO score assessment. Most small business websites score between 25-65 — be honest and lean toward realistic scores that reflect common SEO issues. Don't be too generous.

Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "overallScore": <number 20-75, weighted average of categories>,
  "categories": {
    "technical": <number 15-80>,
    "onPage": <number 15-80>,
    "localSeo": <number 10-75>,
    "content": <number 15-80>
  },
  "headline": "<one punchy sentence about their SEO situation, specific to their business type>",
  "summary": "<2 sentences explaining their score. Be specific about their industry/location. Don't mention specific fixes — those are locked behind paywall. Keep it honest and slightly urgent.>",
  "urgencyMessage": "<1-2 sentences about the business cost of poor SEO — e.g. how many customers they're losing to competitors, or how long it takes to rank. Be specific to their industry/location. No fluff.>"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 600,
    messages: [
      { role: 'user', content: prompt },
      { role: 'assistant', content: '{' },
    ],
  })

  const raw = '{' + (message.content[0] as { type: string; text: string }).text
  const parsed = JSON.parse(raw)

  return NextResponse.json(parsed)
}
