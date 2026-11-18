(function () {
  const g = document.getElementById('grid');
  CONTENT.photos.forEach((p, i) => {
    const f = document.createElement('figure'); f.className = 'ph p' + (i + 1);
    f.innerHTML = '<img loading="lazy" alt=""><figcaption></figcaption>';
    f.querySelector('img').src = p.src; f.querySelector('img').alt = p.caption; f.querySelector('figcaption').textContent = p.caption;
    g.appendChild(f);
  });
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: .15 });
  g.querySelectorAll('.ph').forEach(f => io.observe(f));
})();
