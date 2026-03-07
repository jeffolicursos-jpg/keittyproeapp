// Lightweight wrapper using jsonwebtoken via dynamic require to avoid type issues during build
// HS256 tokens; access 15m, refresh 30d
import { ENV } from '@/lib/env';
import crypto from 'crypto';

type JWTPayload = { sub: string; typ?: 'access' | 'refresh' };

function getJwt() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jwt = require('jsonwebtoken');
  return jwt as any;
}

export function issueAccess(sub: string) {
  const jwt = getJwt();
  return jwt.sign({ sub, typ: 'access' } as JWTPayload, ENV.JWT_SECRET, { expiresIn: '15m' });
}
export function issueRefresh(sub: string) {
  const jwt = getJwt();
  return jwt.sign({ sub, typ: 'refresh' } as JWTPayload, ENV.JWT_SECRET, { expiresIn: '30d' });
}
export function issueRefreshWithJti(sub: string) {
  const jwt = getJwt();
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign({ sub, typ: 'refresh', jti } as any, ENV.JWT_SECRET, { expiresIn: '30d' });
  return { token, jti };
}
export function verifyAccess(token: string): JWTPayload | null {
  try {
    const jwt = getJwt();
    const data = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
    if (data.typ !== 'access') return null;
    return data;
  } catch { return null; }
}
export function verifyRefresh(token: string): JWTPayload | null {
  try {
    const jwt = getJwt();
    const data = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
    if (data.typ !== 'refresh') return null;
    return data;
  } catch { return null; }
}
