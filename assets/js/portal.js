(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var user = window.RCCAuth && RCCAuth.user();
  var gate = $('#gate'), app = $('#app');
  if (!user) return; /* signed out: the public gate stays visible */
  gate.hidden = true; app.hidden = false;
  var store = function (k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem('rcc-' + k) || 'null'); localStorage.setItem('rcc-' + k, JSON.stringify(v)); } catch (e) { return null; } };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  $('#greet').innerHTML = 'Welcome back, <em>' + esc(user.first) + '.</em>';
  $('#uname').textContent = user.name; $('#uemail').textContent = user.email;
  $('#signout').addEventListener('click', function () { RCCAuth.logout(); location.href = 'index.html'; });

  /* tabs (hash-routed) */
  function show(tab) {
    if (!$('[data-panel="' + tab + '"]')) tab = 'feed';
    $$('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== tab; });
    $$('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === tab); });
  }
  $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { var t = b.getAttribute('data-tab'); history.replaceState(null, '', '#' + t); show(t); var top = $('.app').getBoundingClientRect().top + scrollY - 90; if (scrollY > top) scrollTo({ top: top, behavior: 'smooth' }); }); });
  show(location.hash.slice(1));
  addEventListener('hashchange', function () { show(location.hash.slice(1)); });

  /* feed (sample content) */
  $('#stats').innerHTML = [['Membership', 'Founding member'], ['Open opportunities', '3 (sample)'], ['Academy lessons done', '<span id="done-n">0</span>']].map(function (s) { return '<div><span class="sm">' + s[0] + '</span><strong>' + s[1] + '</strong></div>'; }).join('');
  var posts = [
    ['Welcome', 'Welcome to your member portal', 'This is a preview of the Radiant member portal. Your feed will show the latest updates from the Radiant team here.'],
    ['Opportunities', 'New opportunity briefings', 'When an opportunity is ready, its briefing and documentation appear under Investment Opportunities, so you can review it and decide.'],
    ['Events', 'Salons and masterclasses', 'Invitations to investor salons and masterclasses, and replays of past sessions, live under Events & Recordings.'],
    ['Academy', 'Learn at your own pace', 'Bite-sized courses, tools and resources are added to the Academy library.']
  ];
  $('#posts').innerHTML = posts.map(function (p, i) { return '<article class="post"><span class="tag">' + p[0] + '</span><span class="sample">Sample</span><h3>' + esc(p[1]) + '</h3><p>' + esc(p[2]) + '</p></article>'; }).join('');

  /* opportunities (sample) */
  var deals = [
    ['A', 'Residential development', 'Real estate', 'Open to commitments'],
    ['B', 'Payments platform', 'Fintech', 'Opening soon'],
    ['C', 'Boutique hotel', 'Hospitality', 'Closed']
  ];
  $('#deals').innerHTML = deals.map(function (d) {
    return '<article class="deal"><span class="sample">Sample</span><span class="num">' + d[0] + '</span><h3>' + d[1] + '</h3><dl><div><dt>Sector</dt><dd>' + d[2] + '</dd></div><div><dt>Structure</dt><dd>Special Purpose Vehicle (SPV)</dd></div><div><dt>Minimum</dt><dd>$10,000</dd></div><div><dt>Horizon</dt><dd>3–5 years, illiquid</dd></div><div><dt>Status</dt><dd>' + d[3] + '</dd></div></dl>'
      + '<details><summary>Documentation</summary><ul><li>Opportunity briefing</li><li>Shareholder agreement</li><li>Financial overview</li></ul><p class="sm">In the live portal, members receive full documentation for each opportunity and decide deal by deal.</p></details></article>';
  }).join('');

  /* events (sample) */
  var types = ['All', 'Workshop', 'Webinar', 'Networking Event', 'Guest Speaker', 'Replay'];
  var evs = [
    ['Webinar', 'Upcoming', 'Investing foundations for busy women', 'Date to be announced'],
    ['Networking Event', 'Upcoming', 'Investor salon', 'Date to be announced'],
    ['Workshop', 'Upcoming', 'Reading a deal, step by step', 'Date to be announced'],
    ['Guest Speaker', 'Upcoming', 'Conversation with a guest investor', 'Date to be announced'],
    ['Replay', 'Recording', 'Masterclass: understanding SPVs', 'Replay available to members'],
    ['Replay', 'Recording', 'Investor salon highlights', 'Replay available to members']
  ];
  $('#evfilters').innerHTML = types.map(function (t, i) { return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-f="' + t + '">' + t + '</button>'; }).join('');
  function drawEvents(f) {
    $('#events').innerHTML = evs.filter(function (e) { return f === 'All' || e[0] === f; }).map(function (e) { return '<article class="ev"><span class="sample">Sample</span><span class="tag">' + e[0] + '</span><h3>' + e[2] + '</h3><p class="sm">' + e[3] + '</p>' + (e[1] === 'Recording' ? '<span class="btn">Watch replay <span>→</span></span>' : '<span class="btn">Add to calendar <span>→</span></span>') + '</article>'; }).join('') || '<p class="sm">Nothing in this category yet.</p>';
  }
  drawEvents('All');
  $('#evfilters').addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; $$('#evfilters .chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b); }); drawEvents(b.getAttribute('data-f')); });

  /* academy: lessons with saved progress */
  var courses = [
    ['Investing foundations', ['What investing is, and isn’t', 'Risk and return', 'Building a simple plan', 'Common mistakes', 'Your first steps']],
    ['How to read a deal', ['The opportunity briefing', 'Questions to ask', 'Understanding the numbers', 'Making your decision']],
    ['Understanding SPVs', ['What an SPV is', 'Governance and documents', 'How returns are distributed']],
    ['Managing risk', ['Illiquidity and time horizons', 'Diversifying across deals', 'Due diligence checklist', 'Staying the course']]
  ];
  var prog = store('progress') || {};
  function draw() {
    var total = 0;
    $('#courses').innerHTML = courses.map(function (c, ci) {
      var done = c[1].filter(function (l, li) { return prog[ci + '-' + li]; }).length; total += done;
      return '<article class="course"><span class="sample">Sample</span><h3>' + c[0] + '</h3><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + c[1].length + '" aria-valuenow="' + done + '" aria-label="' + c[0] + ' progress"><i style="width:' + Math.round(done / c[1].length * 100) + '%"></i></div><p class="sm">' + done + ' of ' + c[1].length + ' lessons</p><ul>' + c[1].map(function (l, li) { var k = ci + '-' + li; return '<li><label class="opt"><input type="checkbox" data-k="' + k + '"' + (prog[k] ? ' checked' : '') + '> ' + l + '</label></li>'; }).join('') + '</ul></article>';
    }).join('');
    var n = $('#done-n'); if (n) n.textContent = total;
  }
  draw();
  $('#courses').addEventListener('change', function (e) { var k = e.target.getAttribute('data-k'); if (!k) return; if (e.target.checked) prog[k] = 1; else delete prog[k]; store('progress', prog); draw(); var again = $('[data-k="' + k + '"]'); if (again) again.focus(); });

  /* profile */
  var prof = store('profile') || { name: user.name, country: '', industry: '', linkedin: '' };
  $('#pf-name').value = prof.name; $('#pf-email').value = user.email; $('#pf-country').value = prof.country; $('#pf-ind').value = prof.industry; $('#pf-li').value = prof.linkedin;
  function who(n) { $('#uname').textContent = n; $('#ini').textContent = (n || 'D').charAt(0).toUpperCase(); $('#pic-ini').textContent = (n || 'D').charAt(0).toUpperCase(); }
  who(prof.name);
  $('#pform').addEventListener('submit', function (e) { e.preventDefault(); prof = { name: $('#pf-name').value.trim() || user.name, country: $('#pf-country').value, industry: $('#pf-ind').value, linkedin: $('#pf-li').value }; store('profile', prof); who(prof.name); var s = $('#saved'); s.hidden = false; setTimeout(function () { s.hidden = true; }, 2500); });
  function setPic(src) { $('#pic').style.backgroundImage = 'url(' + src + ')'; $('#pic').classList.add('has'); $('#avatar').src = src; $('#avatar').hidden = false; $('#ini').hidden = true; }
  var pic = store('pic'); if (pic) setPic(pic);
  $('#pic-file').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f || f.type.indexOf('image/') !== 0) return;
    var r = new FileReader(); r.onload = function () { setPic(r.result); try { store('pic', r.result.length < 900000 ? r.result : null); } catch (x) {} }; r.readAsDataURL(f);
  });
})();
