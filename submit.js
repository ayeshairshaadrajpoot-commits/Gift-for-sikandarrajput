const { json, parse, rpc, normalizePk } = require('./_lib');
exports.handler = async (event) => {
  const p = parse(event); if (p.err) return p.err;
  const mobile = normalizePk(p.body.mobile);
  if (!mobile) return json(400, { error: 'Please enter a valid Pakistani mobile number, e.g. 03001234567 or +923001234567.' });
  const { RESEND_API_KEY: key, RESEND_FROM: from, NOTIFY_EMAIL: to } = process.env;
  if (!key || !from || !to) return json(500, { error: 'Email is not configured on the server.' });
  let claimed = false;
  try {
    const c = await rpc('claim_submission', { p_hash: p.hash });
    if (c.status === 'already') return json(409, { error: 'already_completed' });
    if (c.status === 'incomplete') return json(400, { error: 'Please finish all three spins first.' });
    if (c.status === 'busy') return json(429, { error: 'Your submission is already being processed.' });
    claimed = true;
    const when = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'full', timeStyle: 'medium' }) + ' (PKT)';
    const [a, b, d] = c.results;
    const html = `<h2>Sikandar's birthday surprise is complete 🎂</h2><p><b>WhatsApp/Mobile:</b> ${mobile}</p><p>1st spin: ${a}<br>2nd spin: ${b}<br>3rd spin: ${d}</p><p><b>Submitted:</b> ${when}</p>`;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: `Birthday surprise completed - ${mobile}`, html })
    });
    if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()));
    await rpc('finish_submission', { p_hash: p.hash, p_mobile: mobile });
    return json(200, { ok: true });
  } catch (e) {
    console.error(e);
    if (claimed) { try { await rpc('release_claim', { p_hash: p.hash }); } catch {} }
    return json(502, { error: 'We could not send your submission. Please try again in a moment.' });
  }
};
