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
  function go(t) { history.replaceState(null, '', '#' + t); show(t); var top = $('.app').getBoundingClientRect().top + scrollY - 90; if (scrollY > top) scrollTo({ top: top, behavior: 'smooth' }); }
  $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-tab')); }); });
  show(location.hash.slice(1));
  addEventListener('hashchange', function () { show(location.hash.slice(1)); });

  /* ---------- sample data (replace with real data when the portal is connected) ---------- */
  var STATUS = { open: 'Now open', closing: 'Closing soon', closed: 'Window closed' };
  var pipeline = [
    { t: 'Residential development', sector: 'Real estate', st: 'closed', vis: 'public', w: 'Investment window shut' },
    { t: 'Payments platform', sector: 'Fintech', st: 'closing', vis: 'public', w: 'Final days to commit' },
    { t: 'Boutique hotel', sector: 'Hospitality', st: 'open', vis: 'public', w: 'Open to commitments' },
    { t: 'Banking opportunity', sector: 'Banking', st: 'open', vis: 'private', w: 'Open to commitments' },
    { t: 'Commercial property', sector: 'Real estate', st: 'open', vis: 'private', w: 'Open to commitments' },
    { t: 'AI-enabled services company', sector: 'AI', st: 'open', vis: 'private', w: 'Open to commitments' },
    { t: 'Mixed-use development', sector: 'Real estate', st: 'open', vis: 'private', w: 'Open to commitments' }
  ];
  var members = [['Lagos', 'Nigeria'], ['Abuja', 'Nigeria'], ['Accra', 'Ghana'], ['Nairobi', 'Kenya'], ['Kigali', 'Rwanda'], ['Johannesburg', 'South Africa'], ['Cape Town', 'South Africa'], ['Dakar', 'Senegal'], ['Addis Ababa', 'Ethiopia'], ['London', 'United Kingdom'], ['Houston', 'United States'], ['Toronto', 'Canada'], ['Dubai', 'United Arab Emirates'], ['Paris', 'France']];
  var reports = [8, 7, 6, 5, 4, 3, 2, 1];
  var lounges = [['Upcoming', 'Quarterly investment lounge', 'Date to be announced', 'Add to calendar'], ['Past', 'Previous investment lounge', 'Recording available to members', 'Watch recording'], ['Past', 'Earlier investment lounge', 'Recording available to members', 'Watch recording']];

  /* ---------- feed ---------- */
  $('#stats').innerHTML = [['Pipeline', pipeline.length + ' opportunities (sample)'], ['Latest market report', 'This week (sample)'], ['Members in the network', (members.length + 1) + ' (sample)']].map(function (s) { return '<div><span class="sm">' + s[0] + '</span><strong>' + s[1] + '</strong></div>'; }).join('');
  var posts = [
    ['Market report', 'This week’s RCC market report is in', 'A five-minute read from our CIO: what’s moving across Pan-African markets and what to pay attention to. Also in your inbox.', 'reports'],
    ['Opportunities', 'An opportunity is closing soon', 'The investment window is about to shut on one opportunity. Review the briefing and decide.', 'opportunities'],
    ['Opportunities', 'New opportunities are open', 'New opportunities have opened, including some that are for members only.', 'opportunities'],
    ['Lounges', 'Your next quarterly investment lounge', 'Lounges are educational, and are also where opportunities are reviewed.', 'lounges']
  ];
  $('#posts').innerHTML = posts.map(function (p) { return '<article class="post"><span class="tag">' + p[0] + '</span><span class="sample">Sample</span><h3>' + esc(p[1]) + '</h3><p>' + esc(p[2]) + '</p><a class="btn" href="#' + p[3] + '" data-go="' + p[3] + '" style="margin-top:.6rem">Open <span>→</span></a></article>'; }).join('');
  $('#posts').addEventListener('click', function (e) { var a = e.target.closest('[data-go]'); if (!a) return; e.preventDefault(); go(a.getAttribute('data-go')); });

  /* ---------- opportunities ---------- */
  var oppF = [['all', 'All'], ['open', 'Now open'], ['closing', 'Closing soon'], ['closed', 'Window closed'], ['private', 'Members only'], ['public', 'Public']];
  $('#oppfilters').innerHTML = oppF.map(function (f, i) { return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-f="' + f[0] + '">' + f[1] + '</button>'; }).join('');
  function drawDeals(f) {
    var list = pipeline.map(function (d, i) { d.n = i + 1; return d; }).filter(function (d) { return f === 'all' || d.st === f || d.vis === f; });
    $('#deals').innerHTML = list.map(function (d) {
      return '<article class="deal' + (d.st === 'closed' ? ' is-closed' : '') + '"><span class="sample">Sample</span><div class="badges"><span class="status ' + d.st + '">' + STATUS[d.st] + '</span><span class="status ' + (d.vis === 'private' ? 'priv' : 'pub') + '">' + (d.vis === 'private' ? 'Members only' : 'Public') + '</span></div>'
        + '<span class="num">' + String(d.n).padStart(2, '0') + '</span><h3>' + d.t + '</h3><dl><div><dt>Sector</dt><dd>' + d.sector + '</dd></div><div><dt>Structure</dt><dd>Special Purpose Vehicle (SPV)</dd></div><div><dt>Minimum</dt><dd>$10,000</dd></div><div><dt>Horizon</dt><dd>3–5 years, illiquid</dd></div><div><dt>Window</dt><dd>' + d.w + '</dd></div></dl>'
        + '<details><summary>Documentation</summary><ul><li>Opportunity briefing</li><li>Shareholder agreement</li><li>' + (d.st === 'closed' ? 'Updates and reports' : 'Financial overview') + '</li></ul><p class="sm">In the live portal, members receive full documentation for each opportunity and decide deal by deal.</p></details></article>';
    }).join('') || '<p class="sm">Nothing matches that filter.</p>';
  }
  drawDeals('all');
  $('#oppfilters').addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; $$('#oppfilters .chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b); }); drawDeals(b.getAttribute('data-f')); });

  /* ---------- profile (also feeds the directory) ---------- */
  var prof = Object.assign({ name: user.name, city: 'Lagos', country: 'Nigeria', industry: '', linkedin: '' }, store('profile') || {});
  var picData = store('pic');
  function initial(n) { return (n || 'D').trim().charAt(0).toUpperCase(); }
  function who() { $('#uname').textContent = prof.name; $('#ini').textContent = initial(prof.name); $('#pic-ini').textContent = initial(prof.name); }
  $('#pf-name').value = prof.name; $('#pf-email').value = user.email; $('#pf-city').value = prof.city; $('#pf-country').value = prof.country; $('#pf-ind').value = prof.industry; $('#pf-li').value = prof.linkedin;
  who();

  /* ---------- network directory: every member sees every member ---------- */
  function directory() {
    var q = ($('#dir-q').value || '').trim().toLowerCase(), c = $('#dir-c').value;
    var all = [{ name: prof.name, city: prof.city, country: prof.country, you: true }].concat(members.map(function (m, i) { return { name: 'Sample Member ' + String(i + 1).padStart(2, '0'), city: m[0], country: m[1] }; }));
    var shown = all.filter(function (m) { return (!c || m.country === c) && (!q || (m.name + ' ' + m.city + ' ' + m.country).toLowerCase().indexOf(q) > -1); });
    $('#dir').innerHTML = shown.map(function (m) {
      var av = m.you && picData ? '<span class="av" style="background-image:url(' + picData + ')"></span>' : '<span class="av">' + (m.you ? initial(m.name) : m.name.slice(-2)) + '</span>';
      return '<div class="mem-card">' + av + '<div><strong>' + esc(m.name) + '</strong><span class="loc">' + esc([m.city, m.country].filter(Boolean).join(', ') || 'Location not set') + '</span></div>' + (m.you ? '<span class="you">You</span>' : '') + '</div>';
    }).join('') || '<p class="sm">No members match.</p>';
    $('#dir-count').textContent = shown.length + ' of ' + all.length + ' members (sample directory)';
  }
  var countries = Array.from(new Set(members.map(function (m) { return m[1]; }).concat([prof.country]).filter(Boolean))).sort();
  $('#dir-c').innerHTML = '<option value="">All countries</option>' + countries.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
  $('#dir-q').addEventListener('input', directory); $('#dir-c').addEventListener('change', directory);
  directory();

  /* ---------- market reports (weekly) ---------- */
  $('#rep-latest').innerHTML = '<span class="sample">Sample</span><span class="tag">Latest · weekly</span><h3>Weekly RCC market report</h3><p>A Pan-African wealth lens on what is happening in the market, what to pay attention to, and how it relates to our investment thesis.</p><span class="btn">Read report · 5 min <span>→</span></span>';
  $('#reports').innerHTML = reports.map(function (n) { return '<div class="rep"><b>Weekly</b><h4>RCC market report · sample ' + String(n).padStart(2, '0') + '</h4><span class="sm">5-min read</span></div>'; }).join('');

  /* ---------- lounges ---------- */
  $('#lounges').innerHTML = lounges.map(function (l) { return '<article class="ev"><span class="sample">Sample</span><span class="tag">' + l[0] + '</span><h3>' + l[1] + '</h3><p class="sm">' + l[2] + '</p><span class="btn">' + l[3] + ' <span>→</span></span></article>'; }).join('');

  /* ---------- profile save / picture ---------- */
  $('#pform').addEventListener('submit', function (e) {
    e.preventDefault();
    prof = { name: $('#pf-name').value.trim() || user.name, city: $('#pf-city').value.trim(), country: $('#pf-country').value.trim(), industry: $('#pf-ind').value, linkedin: $('#pf-li').value };
    store('profile', prof); who(); directory();
    var s = $('#saved'); s.hidden = false; setTimeout(function () { s.hidden = true; }, 2500);
  });
  function setPic(src) { picData = src; $('#pic').style.backgroundImage = 'url(' + src + ')'; $('#pic').classList.add('has'); $('#avatar').src = src; $('#avatar').hidden = false; $('#ini').hidden = true; directory(); }
  if (picData) setPic(picData);
  $('#pic-file').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f || f.type.indexOf('image/') !== 0) return;
    var r = new FileReader(); r.onload = function () { setPic(r.result); try { store('pic', r.result.length < 900000 ? r.result : null); } catch (x) {} }; r.readAsDataURL(f);
  });
})();
