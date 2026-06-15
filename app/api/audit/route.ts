import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Redis } from '@upstash/redis'
import { notifyNewLead } from '@/lib/adminNotify'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface SEOCheck {
  name: string
  passed: boolean
  impact: 'high' | 'medium' | 'low'
  detail: string
  fix: string
  category: 'technical' | 'onPage' | 'localSeo' | 'content'
}

async function crawlSite(url: string): Promise<{ html: string; responseTime: number; isHttps: boolean; finalUrl: string }> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
  const isHttps = normalizedUrl.startsWith('https')
  const start = Date.now()

  const response = await fetch(normalizedUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ESMIANSEOBot/1.0)' },
    signal: AbortSignal.timeout(8000),
  })

  const responseTime = Date.now() - start
  const html = await response.text()
  return { html, responseTime, isHttps, finalUrl: response.url }
}

function runChecks(html: string, responseTime: number, isHttps: boolean, keyword: string, location: string, businessName: string): SEOCheck[] {
  const lower = html.toLowerCase()
  const kw = keyword.toLowerCase()
  const loc = location.toLowerCase()

  // Extract elements
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : ''

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i)
  const description = descMatch ? descMatch[1].trim() : ''

  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/gi)
  const h1s = h1Match ? h1Match.map(h => h.replace(/<[^>]+>/g, '').trim()) : []

  const h2Match = html.match(/<h2[^>]*>(.*?)<\/h2>/gi)
  const h2s = h2Match ? h2Match.map(h => h.replace(/<[^>]+>/g, '').trim()) : []

  const imgMatch = html.match(/<img[^>]*>/gi) || []
  const imgsWithoutAlt = imgMatch.filter(img => !img.includes('alt=') || img.includes('alt=""') || img.includes("alt=''"))

  const hasViewport = lower.includes('name="viewport"') || lower.includes("name='viewport'")
  const hasSchema = lower.includes('application/ld+json') || lower.includes('schema.org')
  const hasLocalSchema = lower.includes('"localBusiness"') || lower.includes('"localbusiness"') || lower.includes('"organization"')
  const hasCanonical = lower.includes('rel="canonical"') || lower.includes("rel='canonical'")
  const hasRobots = lower.includes('name="robots"') || lower.includes("name='robots'")

  const bodyText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
  const wordCount = bodyText.split(' ').filter(w => w.length > 3).length
  const kwCount = kw ? (bodyText.match(new RegExp(kw, 'g')) || []).length : 0
  const locCount = loc ? (bodyText.match(new RegExp(loc, 'g')) || []).length : 0

  const checks: SEOCheck[] = [
    // TECHNICAL
    {
      name: 'HTTPS / SSL',
      passed: isHttps,
      impact: 'high',
      category: 'technical',
      detail: isHttps ? 'Your site uses HTTPS — good for trust and rankings.' : 'Your site is not using HTTPS.',
      fix: 'Install an SSL certificate through your hosting provider. Most hosts offer free SSL via Let\'s Encrypt.',
    },
    {
      name: 'Page Load Speed',
      passed: responseTime < 3000,
      impact: 'high',
      category: 'technical',
      detail: `Your server responded in ${responseTime}ms. ${responseTime < 3000 ? 'Good response time.' : 'This is slow and hurts rankings.'}`,
      fix: 'Enable caching, compress images, use a CDN, and minimize JavaScript to improve load time.',
    },
    {
      name: 'Mobile Viewport Tag',
      passed: hasViewport,
      impact: 'high',
      category: 'technical',
      detail: hasViewport ? 'Mobile viewport meta tag is present.' : 'Missing mobile viewport tag — your site may not display correctly on phones.',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> inside your <head> tag.',
    },
    {
      name: 'Canonical Tag',
      passed: hasCanonical,
      impact: 'medium',
      category: 'technical',
      detail: hasCanonical ? 'Canonical tag found — good for preventing duplicate content.' : 'No canonical tag found.',
      fix: 'Add <link rel="canonical" href="https://yoursite.com/page"> to each page to prevent duplicate content issues.',
    },
    {
      name: 'Robots Meta Tag',
      passed: hasRobots,
      impact: 'low',
      category: 'technical',
      detail: hasRobots ? 'Robots meta tag is present.' : 'No robots meta tag found.',
      fix: 'Add <meta name="robots" content="index, follow"> to pages you want Google to index.',
    },

    // ON-PAGE
    {
      name: 'Title Tag Exists',
      passed: title.length > 0,
      impact: 'high',
      category: 'onPage',
      detail: title.length > 0 ? `Title found: "${title}"` : 'No title tag found — critical SEO issue.',
      fix: 'Add a unique <title> tag to every page. Include your main keyword and keep it under 60 characters.',
    },
    {
      name: 'Title Tag Length',
      passed: title.length >= 30 && title.length <= 60,
      impact: 'medium',
      category: 'onPage',
      detail: title.length === 0 ? 'No title tag.' : `Title is ${title.length} characters. ${title.length < 30 ? 'Too short.' : title.length > 60 ? 'Too long — Google may truncate it.' : 'Good length.'}`,
      fix: 'Rewrite your title to be between 30-60 characters. Include your main keyword near the beginning.',
    },
    {
      name: 'Keyword in Title',
      passed: kw ? title.toLowerCase().includes(kw) : true,
      impact: 'high',
      category: 'onPage',
      detail: !kw ? 'No keyword provided to check.' : title.toLowerCase().includes(kw) ? `Keyword "${keyword}" found in title tag.` : `Keyword "${keyword}" not found in title tag.`,
      fix: `Include the keyword "${keyword}" in your title tag, ideally near the beginning.`,
    },
    {
      name: 'Meta Description',
      passed: description.length > 0,
      impact: 'high',
      category: 'onPage',
      detail: description.length > 0 ? `Meta description found (${description.length} chars).` : 'No meta description found.',
      fix: 'Add a meta description tag between 120-160 characters that includes your keyword and a clear value proposition.',
    },
    {
      name: 'Meta Description Length',
      passed: description.length >= 120 && description.length <= 160,
      impact: 'medium',
      category: 'onPage',
      detail: description.length === 0 ? 'No meta description.' : `Description is ${description.length} characters. ${description.length < 120 ? 'Too short.' : description.length > 160 ? 'Too long — Google will truncate.' : 'Good length.'}`,
      fix: 'Rewrite your meta description to be between 120-160 characters with a clear call to action.',
    },
    {
      name: 'H1 Tag',
      passed: h1s.length === 1,
      impact: 'high',
      category: 'onPage',
      detail: h1s.length === 0 ? 'No H1 tag found.' : h1s.length === 1 ? `H1 found: "${h1s[0].substring(0, 60)}${h1s[0].length > 60 ? '...' : ''}"` : `${h1s.length} H1 tags found — should only have one per page.`,
      fix: 'Use exactly one H1 tag per page. It should include your main keyword and clearly describe the page.',
    },
    {
      name: 'H2 Subheadings',
      passed: h2s.length >= 2,
      impact: 'medium',
      category: 'onPage',
      detail: h2s.length === 0 ? 'No H2 subheadings found.' : `${h2s.length} H2 subheadings found.`,
      fix: 'Add at least 2-3 H2 subheadings to structure your content. Include secondary keywords where natural.',
    },
    {
      name: 'Image Alt Text',
      passed: imgsWithoutAlt.length === 0,
      impact: 'medium',
      category: 'onPage',
      detail: imgMatch.length === 0 ? 'No images found on page.' : imgsWithoutAlt.length === 0 ? `All ${imgMatch.length} images have alt text.` : `${imgsWithoutAlt.length} of ${imgMatch.length} images are missing alt text.`,
      fix: `Add descriptive alt text to all ${imgsWithoutAlt.length} images missing it. Include your keyword where relevant.`,
    },

    // LOCAL SEO
    {
      name: 'Local Business Schema',
      passed: hasLocalSchema,
      impact: 'high',
      category: 'localSeo',
      detail: hasLocalSchema ? 'Local business structured data found.' : 'No local business schema markup found.',
      fix: 'Add LocalBusiness JSON-LD schema markup to your homepage with your name, address, phone, and hours.',
    },
    {
      name: 'Location in Content',
      passed: loc ? locCount >= 2 : true,
      impact: 'high',
      category: 'localSeo',
      detail: !loc ? 'No location provided to check.' : locCount === 0 ? `Location "${location}" not found in page content.` : `Location "${location}" mentioned ${locCount} times.`,
      fix: `Mention "${location}" naturally throughout your content — in headings, body text, and your contact section.`,
    },
    {
      name: 'General Schema Markup',
      passed: hasSchema,
      impact: 'medium',
      category: 'localSeo',
      detail: hasSchema ? 'Schema.org structured data found on page.' : 'No schema markup found.',
      fix: 'Add structured data markup (JSON-LD) for your business type to help Google understand your content.',
    },

    // CONTENT
    {
      name: 'Content Length',
      passed: wordCount >= 300,
      impact: 'high',
      category: 'content',
      detail: `Page contains approximately ${wordCount} words. ${wordCount < 300 ? 'Too thin — Google prefers pages with more content.' : wordCount < 600 ? 'Acceptable but could be stronger.' : 'Good content length.'}`,
      fix: 'Expand your page content to at least 500-800 words. Cover your services, location, and common customer questions.',
    },
    {
      name: 'Keyword in Content',
      passed: kw ? kwCount >= 2 : true,
      impact: 'high',
      category: 'content',
      detail: !kw ? 'No keyword provided to check.' : kwCount === 0 ? `Keyword "${keyword}" not found in page content.` : `Keyword "${keyword}" appears ${kwCount} times.`,
      fix: `Include "${keyword}" naturally in your content 3-5 times. Add it to headings and the first paragraph.`,
    },
    {
      name: 'Keyword in H1',
      passed: kw && h1s.length > 0 ? h1s[0].toLowerCase().includes(kw) : true,
      impact: 'medium',
      category: 'content',
      detail: !kw || h1s.length === 0 ? 'Cannot check — no keyword or H1 found.' : h1s[0].toLowerCase().includes(kw) ? `Keyword found in H1.` : `Keyword "${keyword}" not in H1 tag.`,
      fix: `Rewrite your H1 to include "${keyword}" naturally.`,
    },
  ]

  return checks
}

function calculateScores(checks: SEOCheck[]) {
  const categoryChecks: Record<string, SEOCheck[]> = {
    technical: [], onPage: [], localSeo: [], content: [],
  }

  checks.forEach(c => categoryChecks[c.category].push(c))

  const weights = { high: 3, medium: 2, low: 1 }

  const scoreCategory = (cats: SEOCheck[]) => {
    if (cats.length === 0) return 50
    const total = cats.reduce((sum, c) => sum + weights[c.impact], 0)
    const passed = cats.filter(c => c.passed).reduce((sum, c) => sum + weights[c.impact], 0)
    return Math.round((passed / total) * 100)
  }

  const categories = {
    technical: scoreCategory(categoryChecks.technical),
    onPage: scoreCategory(categoryChecks.onPage),
    localSeo: scoreCategory(categoryChecks.localSeo),
    content: scoreCategory(categoryChecks.content),
  }

  const overallScore = Math.round(
    (categories.technical * 0.3 + categories.onPage * 0.3 + categories.localSeo * 0.2 + categories.content * 0.2)
  )

  return { overallScore, categories }
}

export async function POST(req: NextRequest) {
  try {
    const { url, businessName, keyword, location, email } = await req.json()
    if (!url || !businessName) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    // Crawl the site
    let crawlData
    try {
      crawlData = await crawlSite(url)
    } catch (e) {
      return NextResponse.json({ error: 'Could not reach your website. Please check the URL and try again.' }, { status: 400 })
    }

    // Run checks
    const checks = runChecks(crawlData.html, crawlData.responseTime, crawlData.isHttps, keyword || '', location || '', businessName)
    const { overallScore, categories } = calculateScores(checks)

    // Generate headline + summary with Claude
    const failedHighImpact = checks.filter(c => !c.passed && c.impact === 'high').length
    const prompt = `You are an SEO expert writing a results summary for a business owner who just got their SEO score.

Business: ${businessName}
Location: ${location || 'not specified'}
Keyword: ${keyword || 'not specified'}
Overall Score: ${overallScore}/100
Failed high-impact checks: ${failedHighImpact}
Category scores - Technical: ${categories.technical}, On-Page: ${categories.onPage}, Local SEO: ${categories.localSeo}, Content: ${categories.content}

Write a JSON response with:
- "headline": One punchy sentence about their SEO situation (specific to their business/location). Max 12 words.
- "summary": 2 sentences explaining their score honestly. Don't mention specific fixes. Be direct.
- "urgencyMessage": 1-2 sentences about the business cost — customers lost to competitors, revenue impact. Be specific to their industry and location.

Respond ONLY with valid JSON, no markdown.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }, { role: 'assistant', content: '{' }],
    })

    const raw = '{' + (message.content[0] as { type: string; text: string }).text
    const aiContent = JSON.parse(raw)

    const responseData = {
      overallScore,
      categories,
      checks,
      headline: aiContent.headline,
      summary: aiContent.summary,
      urgencyMessage: aiContent.urgencyMessage,
    }

    // Persist audit data to Redis so webhook can retrieve it after payment (24hr TTL)
    if (email) {
      try {
        const redis = Redis.fromEnv()
        await redis.set(`audit:${email}`, { email, businessName, url, keyword: keyword || '', location: location || '', overallScore, categories, checks }, { ex: 86400 })
      } catch (e) {
        console.error('Redis save failed (non-fatal):', e)
      }
    }

    // Fire admin notification in background (don't await — don't slow down response)
    notifyNewLead({
      email: email || '',
      businessName,
      url,
      keyword: keyword || '',
      location: location || '',
      overallScore,
      categories,
      checks,
    }).catch(e => console.error('Admin notify failed:', e))

    return NextResponse.json(responseData)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}