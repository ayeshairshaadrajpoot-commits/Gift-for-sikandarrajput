(function () {
  const $ = id => document.getElementById(id);
  const box = $('box'), env = $('env'), paper = $('paper'), hint = $('giftHint');
  paper.innerHTML = CONTENT.letter.map(t => '<p></p>').join('');
  [...paper.children].forEach((p, i) => p.textContent = CONTENT.letter[i]);
  function openBox() {
    if (box.classList.contains('open')) return;
    box.classList.add('open'); hint.textContent = 'Now open your letter.';
    setTimeout(() => { box.classList.add('gone'); env.hidden = false; requestAnimationFrame(() => env.classList.add('up')); }, 900);
  }
  function openEnv() {
    if (env.classList.contains('open')) return;
    env.classList.add('open'); hint.textContent = '';
    setTimeout(() => { env.classList.add('fade'); paper.hidden = false; requestAnimationFrame(() => paper.classList.add('show')); setTimeout(() => $('stage').style.display = 'none', 600); }, 1500);
  }
  [[box, openBox], [env, openEnv]].forEach(([el, fn]) => { el.onclick = fn; el.onkeydown = e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fn()); });
})();
