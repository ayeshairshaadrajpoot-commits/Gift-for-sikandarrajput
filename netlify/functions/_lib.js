const crypto = require('crypto');
const H = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const json = (status, body) => ({ statusCode: status, headers: H, body: JSON.stringify(body) });

function parse(event) {
  if (event.httpMethod !== 'POST') return { err: json(405, { error: 'Method not allowed' }) };
  let b; try { b = JSON.parse(event.body || '{}'); } catch { return { err: json(400, { error: 'Invalid request' }) }; }
  if (typeof b.token !== 'string' || !/^[A-Za-z0-9-]{20,64}$/.test(b.token)) return { err: json(400, { error: 'Invalid visitor token' }) };
  const hash = crypto.createHash('sha256').update((process.env.TOKEN_SALT || '') + b.token).digest('hex');
  return { body: b, hash };
}

async function rpc(name, args) {
  const { SUPABASE_URL: u, SUPABASE_SERVICE_ROLE_KEY: k } = process.env;
  if (!u || !k) throw new Error('Supabase is not configured');
  const r = await fetch(`${u}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: k, Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args)
  });
  if (!r.ok) throw new Error(`Database error ${r.status}`);
  const t = await r.text(); return t ? JSON.parse(t) : null;
}

// Pakistani mobile: 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX, 00923XXXXXXXXX
function normalizePk(raw) {
  const s = String(raw || '').replace(/[\s\-()]/g, '');
  const m = s.match(/^(?:\+92|0092|92|0)(3\d{9})$/);
  return m ? '+92' + m[1] : null;
}
module.exports = { json, parse, rpc, normalizePk };
