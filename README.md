# Radiant Collective Capital website

Static site (no framework). Folio is the base design; the home hero and menu motion come from Capsule; the home statement, photo collage and handwritten note come from Nightfall.

- `*.html` — built pages (served as-is by Vercel, clean URLs on)
- `src/pages/*.html` — page source; `src/build.py` wraps them in the shared header, menu and footer. After editing: `python3 src/build.py`
- `assets/` — css, js, fonts, images
- `concepts/` — the four original concept designs, kept for reference (served at `/concepts/`)

## Still to integrate
- Forms (membership application, contact, newsletter, login): set `FORM_ENDPOINT` at the top of `assets/js/site.js`. Until then forms validate but say honestly that nothing was sent.
- Member portal and login: the pages are placeholders; no authentication yet.
- `terms.html` is a placeholder; the privacy page links to the existing iubenda policy.

## Image sources
RCC photos and team portraits come from rcc.africa. Stock images (`s-*.jpg`) are from Unsplash.
