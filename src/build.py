#!/usr/bin/env python3
"""Static site builder. Reads src/pages/*.html (front matter + body), wraps each in the shared layout,
and writes the finished pages to the repo root. Run: python3 src/build.py"""
import os, re, sys, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = os.path.join(ROOT, 'src', 'pages')
SITE = 'Radiant Collective Capital'

NAV_LEFT = [('Home', 'index.html'), ('About Us', 'about.html'), ('Membership', 'membership.html'),
            ('Opportunities', 'opportunities.html'), ('Academy', 'academy.html')]
NAV_RIGHT = [('Events &amp; Recordings', 'events.html'), ('Member Portal', 'portal.html'), ('Apply', 'membership.html#apply')]
INSTAGRAM = 'https://www.instagram.com/radiantcollectivecapital/'
LINKEDIN = 'https://www.linkedin.com/company/radiantcollectivecapital'
MAIL = 'mailto:admin@radiantcollective.capital'
STRIP = ['Pan-African investments &amp; community for women leaders', 'Founding members’ rate: $500 a year', 'Real estate · fintech · hospitality · AI', 'Small checks, big impact']

def intro():
    letters = ''.join('<span style="--i:%d">%s</span>' % (i, c) for i, c in enumerate('Radiant'))
    return ('<div class="intro" aria-hidden="true"><div class="w">%s</div>'
            '<div class="s"><span>Pan-African investments &amp; community</span><span>for women leaders</span></div></div>' % letters)

def header_home():
    mq = ''.join('<span>%s</span>' % t for t in STRIP * 2)
    return ('<div class="strip" aria-label="Announcement"><div>%s</div></div>'
            '<a class="logo-l" id="logo-l" href="index.html" aria-label="%s, home"><img src="assets/img/logo-cream.png" alt="%s" width="168" height="45"></a>'
            '<div class="cap" id="cap"><a class="m" href="membership.html#apply">Apply</a>'
            '<button class="m menu" data-menu aria-expanded="false" aria-controls="sheet">Menu</button>'
            '<button class="dot" data-menu aria-expanded="false" aria-controls="sheet" aria-label="Open menu"><i></i></button></div>' % (mq, SITE, SITE))

def header_inner():
    return ('<header class="hd"><button class="mbox" data-menu aria-expanded="false" aria-controls="sheet" aria-label="Open menu"><span>Menu</span><span>＋</span><span>Index</span><span>01—08</span></button>'
            '<a class="mbrand" href="index.html" aria-label="%s, home"><img src="assets/img/logo-ink.png" alt="%s" width="190" height="50"></a>'
            '<div class="hlinks"><a href="about.html">About Us</a><a class="keep" href="membership.html#apply">Apply</a></div></header>' % (SITE, SITE))

def menu():
    def col(items, start):
        return ''.join('<a href="%s"><span style="--i:%d">%s</span></a>' % (h, start + i, n) for i, (n, h) in enumerate(items))
    return ('<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">'
            '<div class="tp"><img src="assets/img/logo-cream.png" alt="%s" width="190" height="50"><button class="x" id="sheet-close">Close <i>✕</i></button></div>'
            '<nav aria-label="Main"><div class="col">%s</div><div class="col">%s</div></nav>'
            '<div><div class="bt"><div class="l"><a href="%s">Contact Support</a><a href="%s" rel="noopener" target="_blank">Instagram</a><a href="%s" rel="noopener" target="_blank">LinkedIn</a><a href="contact.html">Speak to our team</a></div>'
            '<a class="login" href="login.html" data-auth="link">Login</a></div><div class="pattern"></div></div></div>'
            % (SITE, col(NAV_LEFT, 0), col(NAV_RIGHT, len(NAV_LEFT)), MAIL, INSTAGRAM, LINKEDIN))

def footer():
    return '''<footer>
  <div class="top">
    <div class="news"><img src="assets/img/logo-cream.png" alt="%(site)s" width="190" height="50" style="margin-bottom:1.4rem">
      <p>Keep up with us. By subscribing, you agree to our <a href="privacy.html" style="text-decoration:underline">Privacy Policy</a> and consent to updates.</p>
      <div><form data-form="newsletter" novalidate><label class="sr" for="nl-email">Email address</label><input id="nl-email" name="email" type="email" required placeholder="Your email here" autocomplete="email"><button type="submit">Subscribe →</button></form>
      <div class="fmsg ok" role="status">Thank you! Your submission has been received!</div><div class="fmsg err" role="alert">Oops! Something went wrong while submitting the form.</div></div></div>
    <div><h4>Company</h4><ul><li><a href="about.html">About Us</a></li><li><a href="membership.html">Membership Info</a></li><li><a href="events.html">Upcoming Events</a></li><li><a href="login.html" data-auth="link">Login</a></li><li><a href="%(mail)s">Contact Support</a></li></ul></div>
    <div><h4>Member Portal</h4><ul><li><a href="portal.html">Member Portal</a></li><li><a href="opportunities.html">Opportunities</a></li><li><a href="academy.html">Academy</a></li></ul></div>
    <div><h4>Follow Us</h4><ul><li><a href="%(ig)s" target="_blank" rel="noopener">Instagram</a></li><li><a href="%(li)s" target="_blank" rel="noopener">LinkedIn</a></li></ul></div>
  </div>
  <div class="wm" aria-hidden="true">Radiant</div>
  <div class="legal"><span>© <span data-year>2025</span> Radiant Collective Capital. All rights reserved.</span><nav aria-label="Legal"><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms</a></nav></div>
</footer>''' % {'site': SITE, 'mail': MAIL, 'ig': INSTAGRAM, 'li': LINKEDIN}

LAYOUT = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
<meta name="theme-color" content="#f1ebdd">
%(robots)s
<meta property="og:type" content="website"><meta property="og:site_name" content="Radiant Collective Capital">
<meta property="og:title" content="%(title)s"><meta property="og:description" content="%(desc)s"><meta property="og:image" content="assets/img/p1.jpg">
<link rel="icon" href="assets/img/logo-mark.png">
<link rel="preload" href="assets/fonts/%(preload)s" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/site.css">
<script>try{if(sessionStorage.getItem('rcc-intro'))document.documentElement.classList.add('seen');else sessionStorage.setItem('rcc-intro','1')}catch(e){}</script>
</head>
<body class="%(cls)s">
<a class="skip" href="#main">Skip to content</a>
%(intro)s
%(header)s
%(menu)s
<main id="main">
%(body)s
</main>
%(footer)s
<script src="assets/js/auth.js"></script>
<script src="assets/js/site.js" defer></script>%(extra)s
</body>
</html>
'''

def parse(path):
    raw = open(path, encoding='utf-8').read()
    head, body = raw.split('\n---\n', 1)
    meta = dict(re.findall(r'^(\w+):\s*(.*)$', head, re.M))
    return meta, body.strip()

def main():
    fonts = sorted(f for f in os.listdir(os.path.join(ROOT, 'assets', 'fonts')))
    built = []
    for fn in sorted(os.listdir(PAGES)):
        if not fn.endswith('.html'): continue
        meta, body = parse(os.path.join(PAGES, fn))
        home = meta.get('header') == 'home'
        title = meta['title'] if home else '%s | %s' % (meta['title'], SITE)
        html = LAYOUT % dict(title=title, desc=meta['desc'], cls=meta.get('cls', 'inner'),
                             preload='Iurb6YFw84WUY4NJiBak.woff2',
                             intro=intro() if home else '', header=header_home() if home else header_inner(),
                             menu=menu(), body=body, footer=footer(),
                             robots='<meta name="robots" content="noindex">' if meta.get('robots') == 'noindex' else '',
                             extra=('\n<script src="assets/js/%s" defer></script>' % meta['script']) if meta.get('script') else '')
        open(os.path.join(ROOT, fn), 'w', encoding='utf-8').write(html)
        built.append(fn)
    pages = [f for f in built if f not in ('404.html', 'portal.html', 'login.html')]
    base = 'https://radiantcollectivecapital.vercel.app/'
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for f in pages: sm.append('<url><loc>%s%s</loc></url>' % (base, '' if f == 'index.html' else f[:-5]))
    sm.append('</urlset>')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write('\n'.join(sm) + '\n')
    open(os.path.join(ROOT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\nSitemap: %ssitemap.xml\n' % base)
    print('built', len(built), 'pages:', ', '.join(built))

if __name__ == '__main__':
    main()
