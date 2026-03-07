const url = 'https://keittyproeapp.vercel.app/api/auth/signup';
const payload = { email: 'teste@proe.com' };
async function main() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const txt = await res.text();
    console.log('status:', res.status);
    console.log('body:', txt);
  } catch (e) {
    console.log('error:', e?.message || String(e));
  }
}
main();

