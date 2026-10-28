(function () {
  'use strict';
  /* Set this to a form-handling URL (Formspree, a serverless function, the portal API...) when integrating.
     While empty, forms validate but do NOT send anything, and tell the visitor so honestly. */
  var FORM_ENDPOINT = '';
  var LIVE_APPLY = 'https://rcc.africa/membership';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* year */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* reveal on scroll */
  var rv = $$('[data-r]');
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (e) { io.observe(e); });
  }

  /* menu: circular reveal from the button that opened it (Capsule motion, Folio sheet) */
  var sheet = $('#sheet'), lastBtn = null;
  function menu(open, btn) {
    if (!sheet) return;
    if (open && btn) {
      var r = btn.getBoundingClientRect();
      sheet.style.setProperty('--ox', Math.round(r.left + r.width / 2) + 'px');
      sheet.style.setProperty('--oy', Math.round(r.top + r.height / 2) + 'px');
      lastBtn = btn;
    }
    sheet.classList.toggle('open', open);
    sheet.setAttribute('aria-hidden', !open);
    $$('[data-menu]').forEach(function (b) { b.setAttribute('aria-expanded', open); });
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) setTimeout(function () { var c = $('#sheet-close'); if (c) c.focus(); }, 60);
    else if (lastBtn) lastBtn.focus({ preventScroll: true });
  }
  $$('[data-menu]').forEach(function (b) { b.addEventListener('click', function () { menu(true, b); }); });
  var sc = $('#sheet-close'); if (sc) sc.addEventListener('click', function () { menu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet && sheet.classList.contains('open')) menu(false); });
  if (sheet) sheet.addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });

  /* home header states */
  var cap = $('#cap'), logoL = $('#logo-l');
  if (cap) {
    var onScroll = function () { var s = scrollY > innerHeight * .7; cap.classList.toggle('sol', s); if (logoL) logoL.classList.toggle('hide', s); };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* sticky word-by-word statement */
  var state = $('#state');
  if (state) {
    var words = $$('.w', state);
    var tick = function () {
      var r = state.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight || 1)));
      var n = reduce ? words.length : Math.round(Math.min(1, p * 1.35) * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    };
    addEventListener('scroll', tick, { passive: true }); tick();
  }

  /* parallax on oversized images */
  if (!reduce) {
    var px = $$('[data-px]');
    var pt = function () {
      px.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
        el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) * -(+el.dataset.px || .08)).toFixed(1) + 'px,0)';
      });
    };
    if (px.length) { addEventListener('scroll', pt, { passive: true }); pt(); }
  }

  /* draggable carousel + progress */
  var car = $('#cards'), pg = $('#prog');
  if (car && pg) {
    var up = function () { var t = car.scrollWidth - car.clientWidth || 1, w = Math.max(18, car.clientWidth / car.scrollWidth * 100); pg.style.width = w + '%'; pg.style.transform = 'translateX(' + (car.scrollLeft / t * (100 / w * 100 - 100)) + '%)'; };
    car.addEventListener('scroll', up, { passive: true }); addEventListener('resize', up); up();
    var dn = false, sx = 0, sl = 0;
    car.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; dn = true; sx = e.clientX; sl = car.scrollLeft; car.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (dn) car.scrollLeft = sl - (e.clientX - sx); });
    addEventListener('pointerup', function () { dn = false; car.classList.remove('drag'); });
  }

  /* conditional fields in the application form */
  $$('[data-show-when]').forEach(function (box) {
    var cfg = box.getAttribute('data-show-when').split('='), name = cfg[0], val = cfg[1];
    $$('input[name="' + name + '"]').forEach(function (i) { i.addEventListener('change', function () { var on = $('input[name="' + name + '"]:checked'); box.classList.toggle('show', !!on && on.value === val); }); });
  });
  $$('[data-show-check]').forEach(function (box) {
    var c = $('input[name="' + box.getAttribute('data-show-check') + '"]');
    if (c) c.addEventListener('change', function () { box.classList.toggle('show', c.checked); });
  });

  /* forms: validate, then send only if an endpoint is configured */
  $$('form[data-form]').forEach(function (form) {
    var ok = $('.fmsg.ok', form.parentNode), err = $('.fmsg.err', form.parentNode);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      [ok, err].forEach(function (m) { if (m) m.classList.remove('show'); });
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var kind = form.getAttribute('data-form');
      if (kind === 'login') {
        var fd0 = new FormData(form);
        if (window.RCCAuth && RCCAuth.login(fd0.get('email'), fd0.get('password'), !!fd0.get('remember'))) { location.href = 'portal.html'; return; }
        if (err) { err.textContent = 'That email or password isn’t right. For the preview, use the demo details shown on this page.'; err.classList.add('show'); }
        return;
      }
      if (!FORM_ENDPOINT) {
        if (err) { err.innerHTML = 'This form isn’t connected yet, so nothing was sent. ' + (kind === 'apply' ? 'Please apply on <a href="' + LIVE_APPLY + '">rcc.africa/membership</a> for now.' : kind === 'login' ? 'Member login is being connected.' : 'Please email <a href="mailto:admin@radiantcollective.capital">admin@radiantcollective.capital</a> for now.'); err.classList.add('show'); }
        return;
      }
      var btn = $('[type=submit]', form), label = btn && (btn.value || btn.textContent);
      if (btn) { btn.disabled = true; btn.setAttribute('data-label', label); if (btn.tagName === 'INPUT') btn.value = 'Please wait…'; else btn.textContent = 'Please wait…'; }
      var fd = new FormData(form); fd.append('_form', kind);
      fetch(FORM_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); if (ok) ok.classList.add('show'); form.reset(); })
        .catch(function () { if (err) err.classList.add('show'); })
        .then(function () { if (btn) { btn.disabled = false; if (btn.tagName === 'INPUT') btn.value = label; else btn.textContent = label; } });
    });
  });
})();
