import { NextRequest, NextResponse } from 'next/server'
import { getRequestId } from '@/lib/requestId'
import { logError } from '@/lib/errorLogger'

type Handler<T = any> = (req: NextRequest, ctx?: T) => Promise<NextResponse> | NextResponse

export function withErrorHandling<T = any>(handler: Handler<T>): Handler<T> {
  return async (req: NextRequest, ctx?: T) => {
    try {
      return await handler(req, ctx as any)
    } catch (e: any) {
      const requestId = getRequestId(req.headers)
      const url = (() => {
        try {
          return new URL(req.url).pathname
        } catch {
          return req.url || ''
        }
      })()
      logError({
        requestId,
        route: url,
        method: req.method,
        userId: null,
        message: e?.message || 'internal_error',
        stack: e?.stack || undefined,
      })
      return NextResponse.json({ error: 'internal_error', requestId }, { status: 500 })
    }
  }
}

