import { NextRequest, NextResponse } from 'next/server'
import { withTimeout } from '@/lib/withTimeout'
import { getRequestId } from '@/lib/requestId'

type Handler<T = any> = (req: NextRequest, ctx?: T) => Promise<NextResponse> | NextResponse

export function withTimeoutHandler<T = any>(handler: Handler<T>, ms = 10_000): Handler<T> {
  return async (req: NextRequest, ctx?: T) => {
    try {
      const p = Promise.resolve(handler(req, ctx as any))
      return await withTimeout(p, ms)
    } catch (e: any) {
      if (e && e.message === 'request_timeout') {
        const requestId = getRequestId(req.headers)
        const path = (() => {
          try {
            return new URL(req.url).pathname
          } catch {
            return req.url || ''
          }
        })()
        console.error(`[timeout] route=${path} requestId=${requestId}`)
        return NextResponse.json({ error: 'request_timeout' }, { status: 504 })
      }
      throw e
    }
  }
}
