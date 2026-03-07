export type LogRequestParams = {
  method: string
  path: string
  status: number
  ip?: string
  userId?: string | null
  timestamp?: string
}

export function extractIp(headers: Headers | Record<string, string | string[] | undefined>) {
  const raw =
    (headers as any)?.get?.('x-forwarded-for') ??
    (Array.isArray((headers as any)['x-forwarded-for'])
      ? (headers as any)['x-forwarded-for'][0]
      : (headers as any)['x-forwarded-for']) ??
    'unknown'
  const str = String(raw || 'unknown')
  return str.split(',')[0].trim() || 'unknown'
}

export function logRequest(params: LogRequestParams) {
  const ts = params.timestamp || new Date().toISOString()
  const ip = params.ip || 'unknown'
  const user = params.userId ? String(params.userId) : 'anon'
  // Example: [api] GET /api/health status=200 ip=1.2.3.4 user=abc123 2026-01-01T00:00:00.000Z
  console.log(
    `[api] ${params.method.toUpperCase()} ${params.path} status=${params.status} ip=${ip} user=${user} ${ts}`
  )
}

