/* eslint-disable no-console */
// Quick QA script for Dieta-Treino SaaS
// Usage: SAAS_URL=http://localhost:3000 node scripts/testSaaS.js

const BASE = process.env.SAAS_URL || process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@seusistema.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function ts() { return new Date().toISOString(); }

function getSetCookies(headers) {
  // Node 18+ (undici) supports getSetCookie()
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie();
  }
  const sc = headers.get('set-cookie');
  if (!sc) return [];
  // Fallback naive split on comma that are followed by space and a token (handles most cases)
  // This is not perfect but works for common Set-Cookie patterns without commas in attributes
  return sc.split(/,(?=\s*\w+=)/);
}

class CookieJar {
  constructor() { this.cookies = {}; }
  addFromResponse(res) {
    const setCookies = getSetCookies(res.headers);
    for (const c of setCookies) {
      const [pair] = c.split(';');
      const [k, v] = pair.split('=');
      if (k && v !== undefined) this.cookies[k.trim()] = v.trim();
    }
  }
  header() {
    const pairs = Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`);
    return pairs.join('; ');
  }
}

async function http(method, path, { headers = {}, body } = {}, jar) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const h = { ...headers };
  if (jar && Object.keys(jar.cookies).length > 0) {
    h.cookie = jar.header();
  }
  const init = { method, headers: h };
  if (body !== undefined) {
    if (typeof body === 'string') {
      init.body = body;
      h['content-type'] = h['content-type'] || 'text/plain';
    } else {
      init.body = JSON.stringify(body);
      h['content-type'] = h['content-type'] || 'application/json';
    }
  }
  const res = await fetch(url, init);
  if (jar) jar.addFromResponse(res);
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, ok: res.ok, json, headers: res.headers };
}

function print(ok, name, extra = '') {
  const mark = ok ? '✅' : '❌';
  console.log(`${mark} ${name}${extra ? ' — ' + extra : ''}`);
}

async function run() {
  console.log(`[info] Base URL: ${BASE}`);
  const jar = new CookieJar();
  const summary = { ok: 0, fail: 0, details: [] };
  const record = (name, ok, note) => {
    if (ok) summary.ok += 1; else summary.fail += 1;
    summary.details.push({ name, ok, note });
    print(ok, name, note || '');
  };

  // 1) Health check
  try {
    const r = await http('GET', '/api/health', {}, jar);
    record('Health check (/api/health)', r.ok && r.status === 200, `status=${r.status}`);
  } catch (e) {
    record('Health check (/api/health)', false, e.message);
  }

  // 2) Protected route without login
  try {
    const r = await http('GET', '/api/auth/soft-guard', {}, new CookieJar());
    const ok = r.status === 401 || r.status === 403;
    record('Protected route without login (/api/auth/soft-guard)', ok, `status=${r.status}`);
  } catch (e) {
    record('Protected route without login (/api/auth/soft-guard)', false, e.message);
  }

  // 3) Admin route without login
  try {
    const r = await http('GET', '/api/admin/users/list', {}, new CookieJar());
    const ok = r.status === 401 || r.status === 403;
    record('Admin route without login (/api/admin/users/list)', ok, `status=${r.status}`);
  } catch (e) {
    record('Admin route without login (/api/admin/users/list)', false, e.message);
  }

  // 4) Login (admin)
  try {
    const r = await http('POST', '/api/auth/login', { body: { email: ADMIN_EMAIL, senha: ADMIN_PASSWORD } }, jar);
    record('Login (admin)', r.ok && r.status === 200, `status=${r.status}`);
  } catch (e) {
    record('Login (admin)', false, e.message);
  }

  // 5) Admin route with valid JWT
  try {
    const r = await http('GET', '/api/admin/users/list', {}, jar);
    record('Admin route with JWT (/api/admin/users/list)', r.ok && r.status === 200, `status=${r.status}`);
  } catch (e) {
    record('Admin route with JWT (/api/admin/users/list)', false, e.message);
  }

  // 5a) Admin route with INVALID JWT
  try {
    const badJar = new CookieJar();
    badJar.cookies = { ...jar.cookies, access: 'invalid.token.here' };
    const r = await http('GET', '/api/admin/users/list', {}, badJar);
    const ok = r.status === 401 || r.status === 403;
    record('Admin route with INVALID JWT (/api/admin/users/list)', ok, `status=${r.status}`);
  } catch (e) {
    record('Admin route with INVALID JWT (/api/admin/users/list)', false, e.message);
  }

  // 6) Read-only checks (no DB modifications)
  try {
    const r1 = await http('GET', '/api/receitas', {}, jar);
    record('Receitas list (/api/receitas)', r1.ok && r1.status === 200, `status=${r1.status}`);
  } catch (e) {
    record('Receitas list (/api/receitas)', false, e.message);
  }
  try {
    const r2 = await http('GET', '/api/training/days', {}, jar);
    record('Training days list (/api/training/days)', r2.ok && r2.status === 200, `status=${r2.status}`);
  } catch (e) {
    record('Training days list (/api/training/days)', false, e.message);
  }

  // 7) Subscription read (no modification)
  try {
    const r = await http('GET', '/api/subscriptions/me', {}, jar);
    const ok = r.status === 200 || r.status === 404 || r.status === 204;
    record('Subscription read (/api/subscriptions/me)', ok, `status=${r.status}`);
  } catch (e) {
    record('Subscription read (/api/subscriptions/me)', false, e.message);
  }

  // 8) Simulate invalid admin change-plan (expect 400 or 500)
  try {
    const r = await http('POST', '/api/admin/analytics/change-plan', { body: { user_id: '', plano: '' } }, jar);
    const ok = r.status === 400 || r.status === 500;
    record('Invalid admin action (/api/admin/analytics/change-plan)', ok, `status=${r.status}`);
  } catch (e) {
    record('Invalid admin action (/api/admin/analytics/change-plan)', false, e.message);
  }

  // 9) Logs note (manual check)
  console.log('[note] Verifique os logs no Vercel: chamadas ao /api/health e erros devem aparecer nos logs.');

  // Summary
  console.log('\n========= SUMMARY =========');
  console.log(`OK: ${summary.ok} | FAIL: ${summary.fail}`);
  for (const it of summary.details) {
    console.log(`- ${it.ok ? 'OK' : 'FAIL'} ${it.name} ${it.note ? `(${it.note})` : ''}`);
  }
  console.log('===========================');
  process.exitCode = summary.fail > 0 ? 1 : 0;
}

run().catch(err => {
  console.error('[fatal]', err);
  process.exit(1);
});
