(function () {
  const $ = id => document.getElementById(id);
  const PREVIEW = location.protocol === 'file:'; // opened by double-click: no backend, demo only
  const KEY = 'sikandar_visitor_token';
  let token = null; try { token = localStorage.getItem(KEY); } catch (e) {}
  if (!token) { token = (crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(16) + Math.random().toString(16).slice(2) + 'abcdef0123456789')).replace(/[^A-Za-z0-9-]/g, ''); try { localStorage.setItem(KEY, token); } catch (e) {} }
  const SEQ = [0, 5, 8], mem = { results: [], submitted: false };
  const normalizePk = v => { const m = String(v || '').replace(/[\s\-()]/g, '').match(/^(?:\+92|0092|92|0)(3\d{9})$/); return m ? '+92' + m[1] : null; };

  async function api(name, extra) {
    if (PREVIEW) { // local demo only, nothing is saved or emailed
      if (name === 'state') return { results: mem.results, submitted: mem.submitted };
      if (name === 'spin') { const i = mem.results.length; mem.results.push(CONTENT.prizes[SEQ[i]]); return { index: SEQ[i], prize: mem.results[i], results: mem.results, remaining: 2 - i }; }
      mem.submitted = true; return { ok: true };
    }
    const r = await fetch('/.netlify/functions/' + name, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, ...extra }) });
    const d = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(d.error || 'Something went wrong'); e.code = d.error; throw e; } return d;
  }
  let results = [], busy = false;
  function render(submitted) {
    const left = 3 - results.length;
    $('count').textContent = left + (left === 1 ? ' Spin Remaining' : ' Spins Remaining');
    $('chips').innerHTML = results.map((r, i) => `<span>Spin ${i + 1}: ${r}</span>`).join('');
    $('spinBtn').disabled = busy || left === 0;
    if (submitted) { $('game').hidden = true; $('done').hidden = true; $('locked').hidden = false; return; }
    $('done').hidden = left > 0;
  }
  $('spinBtn').onclick = async () => {
    if (busy) return; busy = true; $('spinBtn').disabled = true;
    try {
      const d = await api('spin'); await window.spinTo(d.index); results = d.results;
      $('prize').textContent = d.prize; $('modal').hidden = false; $('cont').focus();
    } catch (e) { if (e.code === 'already_completed') return render(true); alert(e.message); }
    busy = false; render(false);
  };
  $('cont').onclick = () => { $('modal').hidden = true; if (results.length === 3) $('done').scrollIntoView({ behavior: 'smooth' }); };
  $('form').onsubmit = async ev => {
    ev.preventDefault(); if (busy) return; const err = $('err'); err.textContent = '';
    const v = $('mobile').value.trim();
    if (!v) return err.textContent = 'Please enter your mobile number.';
    if (!normalizePk(v)) return err.textContent = 'That number looks invalid. Try 03001234567 or +923001234567.';
    busy = true; const b = $('subBtn'); b.disabled = true; b.classList.add('load'); b.textContent = 'Sending…';
    try { await api('submit', { mobile: v }); $('form').hidden = true; $('thanks').hidden = false; }
    catch (e) { if (e.code === 'already_completed') return render(true); err.textContent = e.message; b.disabled = false; b.classList.remove('load'); b.textContent = 'Submit'; }
    busy = false;
  };
  (async () => {
    if (PREVIEW) { const n = document.createElement('p'); n.className = 'hint'; n.textContent = 'Preview mode: backend and email are off. Run run.bat for the real thing.'; $('spinner').prepend(n); }
    try { const s = await api('state'); results = s.results || []; setWheel(results.length ? SEQ[results.length - 1] : -1); render(s.submitted); }
    catch (e) { $('count').textContent = 'Could not reach the server. Please refresh.'; $('spinBtn').disabled = true; }
  })();

  // floating particles
  const c = $('particles'), x = c.getContext('2d'); let W, H; const ps = Array.from({ length: 45 }, () => ({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2.5, v: .0002 + Math.random() * .0004 }));
  const size = () => { W = c.width = innerWidth; H = c.height = innerHeight; }; size(); addEventListener('resize', size);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) (function t() { x.clearRect(0, 0, W, H); ps.forEach(p => { p.y -= p.v; if (p.y < 0) p.y = 1; x.beginPath(); x.arc(p.x * W, p.y * H, p.r, 0, 7); x.fillStyle = 'rgba(255,255,255,.7)'; x.fill(); }); requestAnimationFrame(t); })();
})();
