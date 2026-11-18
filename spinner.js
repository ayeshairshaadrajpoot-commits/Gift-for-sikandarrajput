(function () {
  const N = 9, SEG = 360 / N, P = CONTENT.prizes, wheel = document.getElementById('wheel');
  const cols = ['#1d4ed8', '#7dd3fc', '#1e3a8a'], txt = ['#fff', '#0b2a6b', '#fff'];
  const pt = (a, r) => { const t = (a - 90) * Math.PI / 180; return (200 + r * Math.cos(t)).toFixed(2) + ' ' + (200 + r * Math.sin(t)).toFixed(2); };
  let s = '<svg viewBox="0 0 400 400" role="img" aria-label="Prize wheel"><circle cx="200" cy="200" r="198" fill="#e5edf7"/>';
  P.forEach((name, i) => {
    const a0 = i * SEG, a1 = a0 + SEG, c = i % 3;
    s += `<path d="M200 200 L${pt(a0, 190)} A190 190 0 0 1 ${pt(a1, 190)} Z" fill="${cols[c]}" stroke="#fff" stroke-width="2"/>`;
    s += `<text transform="rotate(${a0 + SEG / 2 - 90} 200 200)" x="365" y="200" text-anchor="end" dominant-baseline="middle" font-family="Manrope,sans-serif" font-weight="700" font-size="${name.length > 7 ? 21 : 24}" fill="${txt[c]}">${name}</text>`;
  });
  wheel.innerHTML = s + '</svg>';
  let rot = 0;
  // Segment i is centred at (i*40+20)deg clockwise from the top; the pointer is fixed at the top.
  window.spinTo = function (index) {
    return new Promise(res => {
      const need = (((-(index * SEG + SEG / 2) - rot) % 360) + 360) % 360;
      rot += 360 * 6 + need;
      wheel.style.transition = 'transform 5.2s cubic-bezier(.12,.62,.08,1)'; wheel.style.transform = `rotate(${rot}deg)`;
      let done = false; const f = () => { if (!done) { done = true; res(); } };
      wheel.addEventListener('transitionend', f, { once: true }); setTimeout(f, 5600);
    });
  };
  window.setWheel = index => { if (index >= 0) { rot = -(index * SEG + SEG / 2) + 360 * 6; wheel.style.transition = 'none'; wheel.style.transform = `rotate(${rot}deg)`; } };
})();
