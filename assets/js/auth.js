/* PREVIEW AUTH. This is a front-end demo only: it checks a hard-coded demo account in the browser and
   stores a flag in sessionStorage. It is NOT real security. Replace with the real member login
   (and server-side session checks) when the portal is integrated. */
(function () {
  'use strict';
  var KEY = 'rcc-demo-session';
  var DEMO = { email: 'member@radiant.demo', password: 'Radiant-Preview-2026', name: 'Demo Member', first: 'Demo' };
  function get() { try { return JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  window.RCCAuth = {
    demo: { email: DEMO.email, password: DEMO.password },
    user: get,
    login: function (email, password, remember) {
      if (String(email).trim().toLowerCase() !== DEMO.email || password !== DEMO.password) return false;
      var s = JSON.stringify({ email: DEMO.email, name: DEMO.name, first: DEMO.first, at: Date.now() });
      try { (remember ? localStorage : sessionStorage).setItem(KEY, s); } catch (e) { return false; }
      return true;
    },
    logout: function () { try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {} }
  };
  document.addEventListener('DOMContentLoaded', function () {
    if (!get()) return;
    [].forEach.call(document.querySelectorAll('[data-auth="link"]'), function (a) {
      var s = a.querySelector('span');
      if (s) s.textContent = 'Member area'; else a.textContent = 'Member area';
      a.setAttribute('href', 'portal.html');
    });
  });
})();
