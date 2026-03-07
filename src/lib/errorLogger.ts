export type ErrorLogOptions = {
  requestId: string
  route: string
  method: string
  userId?: string | null
  message: string
  stack?: string
  timestamp?: string
}

export function logError(opts: ErrorLogOptions) {
  const ts = opts.timestamp || new Date().toISOString()
  const user = opts.userId ? String(opts.userId) : 'anon'
  // One-line summary
  console.error(
    `[error] req=${opts.requestId} route=${opts.route} method=${opts.method} user=${user} message="${opts.message}" ${ts}`
  )
  // Optional stack trace for deeper inspection
  if (opts.stack) {
    console.error(opts.stack)
  }
}

