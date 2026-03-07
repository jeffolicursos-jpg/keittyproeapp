import crypto from 'crypto'

export function generateRequestId() {
  try {
    return crypto.randomUUID()
  } catch {
    // Fallback very-low-collision id if randomUUID is not available
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }
}

export function getRequestId(
  headers: Headers | Record<string, string | string[] | undefined>
): string {
  const value =
    (headers as any)?.get?.('x-request-id') ??
    (Array.isArray((headers as any)['x-request-id'])
      ? (headers as any)['x-request-id'][0]
      : (headers as any)['x-request-id']) ??
    ''
  const id = String(value || '').trim()
  return id || generateRequestId()
}

