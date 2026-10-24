(function () {
  var R = window.RCC, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { if (sessionStorage.getItem('rcc-intro-' + document.title)) document.documentElement.classList.add('seen'); else sessionStorage.setItem('rcc-intro-' + document.title, 1); } catch (e) {}
  R.each = function (key, fn, host) {
    var list = key.split('.').reduce(function (o, k) { return o[k]; }, R);
    document.querySelectorAll(host || '[data-list="' + key + '"]').forEach(function (el) { el.innerHTML = list.map(fn).join(''); });
  };
  R.year = function () { document.querySelectorAll('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); }); };
  R.reveal = function () {
    var els = document.querySelectorAll('[data-r]');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  };
  /* sets --p (0..1) on a tall section as it scrolls through the viewport */
  R.progress = function (sel, fn) {
    var els = document.querySelectorAll(sel); if (!els.length) return;
    function tick() { els.forEach(function (el) { var r = el.getBoundingClientRect(), t = r.height - innerHeight, p = Math.min(1, Math.max(0, -r.top / (t || 1))); el.style.setProperty('--p', p.toFixed(4)); if (fn) fn(el, p); }); }
    addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); tick();
  };
  R.parallax = function (sel, k) {
    if (reduce) return; var els = document.querySelectorAll(sel);
    function tick() { els.forEach(function (el) { var r = el.parentElement.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return; el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) * -(+el.dataset.k || k || .12)).toFixed(1) + 'px,0)'; }); }
    addEventListener('scroll', tick, { passive: true }); tick();
  };
  document.addEventListener('DOMContentLoaded', function () { R.year(); R.reveal(); });
})();
