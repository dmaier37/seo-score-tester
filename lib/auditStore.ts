// Temporary in-memory store that holds audit data between payment click and webhook
// Data expires after 2 hours so memory doesn't grow unbounded

interface StoredAudit {
  email: string
  businessName: string
  url: string
  keyword: string
  location: string
  overallScore: number
  categories: Record<string, number>
  checks: any[]
  storedAt: number
}

// Global store persists across requests in the same server instance
const store = new Map<string, StoredAudit>()

// Clean up entries older than 2 hours
function cleanup() {
  const TWO_HOURS = 2 * 60 * 60 * 1000
  const now = Date.now()
  for (const [key, val] of store.entries()) {
    if (now - val.storedAt > TWO_HOURS) store.delete(key)
  }
}

export function saveAudit(email: string, data: Omit<StoredAudit, 'storedAt'>) {
  cleanup()
  store.set(email.toLowerCase(), { ...data, storedAt: Date.now() })
}

export function getAudit(email: string): StoredAudit | null {
  return store.get(email.toLowerCase()) || null
}

export function deleteAudit(email: string) {
  store.delete(email.toLowerCase())
}
