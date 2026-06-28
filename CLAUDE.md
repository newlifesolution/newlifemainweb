# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The **newlife** hub — the marketing/landing site for **newlifesolutions.dev**, framed as a
studio of technical tools with **CADlingua** (a CAD-aware DXF/DWG translator) as the featured
flagship. Static Astro site, no backend. Deployed on Vercel (team `nlife`).

GitHub repo: `newlifesolution/newlifemainweb`, remote **`origin`** (the only remote). A leftover
`personal` remote → `ifranjo/PAPIRO_WEB` (the pre-migration personal repo) was **removed 2026-06-22**:
New Life is kept independent of the personal `ifranjo` account. See the property-wide **Independence
rule** in `../CLAUDE.md`.

## Commands

```bash
npm install          # deps: astro + three
npm run dev          # local dev server (hot reload)
npm run build        # static build -> dist/
npm run preview      # serve the built dist/ locally
npm run smoke        # build + preview + Playwright smoke for / and /en/
```

No unit test runner is configured. `npm run smoke` is the lightweight browser gate;
visual changes still use **ad-hoc Playwright screenshots** when screenshots matter.

## Architecture

**Static Astro 7 with built-in i18n.** Output is plain HTML in `dist/` — Vercel serves it as-is,
no SSR. Two locales configured in `astro.config.mjs`: **`es` is the default at `/`**, **`en`
lives at `/en/`** (`prefixDefaultLocale: false`).

Page/content structure (the key pattern — read these together):
- `src/pages/index.astro` (es) and `src/pages/en/index.astro` (en) are **thin wrappers**. Each
  just sets `lang` and renders the shared `Home` component inside `Layout`. They are the *only*
  per-locale duplication.
- `src/components/Home.astro` is the **entire page body**, locale-agnostic — it takes `lang` and
  pulls every string through `t()`. Edit page content/markup here once; both locales update.
- `src/i18n/ui.ts` holds **all copy** as `ui.es` / `ui.en` keyed objects. `src/i18n/utils.ts`
  exposes `useTranslations(lang)` → `t(key)`, `getLangFromUrl`, `localizedPath`.
- `src/layouts/Layout.astro` owns `<head>` (SEO, **hreflang es/en/x-default**, Google Fonts:
  Space Grotesk display + Inter body + JetBrains Mono), all global CSS tokens (`:root` vars),
  the film-grain overlay, and the scroll-reveal IntersectionObserver.

**To add or change a string:** add the key to BOTH `ui.es` and `ui.en` in `src/i18n/ui.ts`,
then reference it via `t('your.key')` in `Home.astro`. Keep the two locales in sync — `t()`
falls back to the default locale if a key is missing, which silently hides untranslated EN copy.

**Multi-route content pages (added 2026-06-24 — the site is no longer home-only).** `Layout.astro`
takes `pathEs`/`pathEn` (per-locale path after the locale root; `''` = home) to emit a per-page
`canonical` + `hreflang`, `chrome` (`'full'` = home with Intro+Scene3D; `'minimal'` = content page,
**no intro, no 3D** — deliberately light because measured mobile CWV is poor with the 3D), and
`extraJsonLd` (page-specific `@graph` nodes). The home's FAQPage/SoftwareApplication only render when
`chrome==='full'`. Pattern per content page = a locale-agnostic component (e.g. `Comparison.astro`)
+ two thin route wrappers (`src/pages/<es-slug>.astro` and `src/pages/en/<en-slug>.astro`) that set
`lang`, the paths, `chrome="minimal"` and build their own `extraJsonLd`. Live content pages (bilingual):
comparison (`/comparativa-traductor-planos`), use-case (`/traducir-planos-aleman`), how-to
(`/como-traducir-plano-sin-romper-cotas`), pricing (`/precios`), **contact (`/contacto`)** + their
`/en/` twins.
**Adding a content page = FOUR hand-edits:** (1) strings in BOTH locales in `ui.ts`; (2) the two route
wrappers; (3) its 2 URLs (with hreflang alternates) in `public/sitemap.xml`; (4) its 2 URLs in
`scripts/indexnow.mjs`. Then build, deploy, `node scripts/indexnow.mjs`. Gate is `npm run verify`
(`check-i18n-parity` enforces both locales carry the same keys; `check-routes` enforces pages == sitemap
== indexnow) — it FAILS the build if any of the four drift, so you can't forget one silently.

**The contact form is the only page that talks to a backend** (the site is otherwise static). `Contact.astro`
POSTs cross-origin to `accounts.newlifesolutions.dev/api/contact` (→ a CRM Lead). Two non-obvious
constraints: (a) the accounts CORS allowlist must include the hub origin (it does — `www.newlifesolutions.dev`);
(b) **the hub's own CSP `connect-src` in `vercel.json` must list `https://accounts.newlifesolutions.dev`** or
the browser silently blocks the fetch. This was a real bug — **`curl` bypasses CSP so it passed; only a
live-browser submit caught it.** Any future page that fetches accounts (or any cross-origin host) needs the
same `connect-src` entry. Verify form changes with a real Playwright submit, not curl.

**Background + intro layers** (both pure client `<script>` in their `.astro` file, both honor
`prefers-reduced-motion`):
- `src/components/Intro.astro` — full-screen intro overlay shown **once per session**
  (`sessionStorage 'nl_intro_seen'`): CRT-TV static → power-off collapse → two-phase hyperspace
  tunnel ("old solutions" → "newlifesolutions") → white flash → reveal. Has a 9s safety
  auto-enter. Dispatches `intro:done` on the document (Layout re-arms scroll-reveal on it).
- `src/components/Scene3D.astro` — fixed Three.js wireframe background (technical parts incl. a
  TorusKnot, floating CAD callouts). Pauses on tab hide.

**Z-index contract:** the 3D canvas is `position: fixed; z-index: 0`. Page content
(`header/main/footer`) is forced to `z-index: 1` in Layout so it sits above the canvas. Sections
that must hide the background use an opaque/`--bg` background; the hero is transparent so the 3D
shows through. The intro overlay is `z-index: 9999`.

## SEO / GEO (keep in sync when adding pages or copy)

Static SSG means all content + metadata ship in the HTML, so search and AI crawlers see
everything without running JS. The site is tuned for both classic search and generative-engine
citation (ChatGPT / Claude / Perplexity).

- **Bing Webmaster Tools: VERIFIED (2026-06-24)** for the `www` property (XML method —
  `public/BingSiteAuth.xml` + a `msvalidate.01` meta in `Layout.astro`; **keep both, removing
  either un-verifies**). Sitemap submitted. ChatGPT search uses Bing's index, so this is what makes
  the site eligible there. Gotcha that cost two failed attempts: register the **`www`** property,
  NOT the apex — the apex 307-redirects with a text/plain body (no `<head>`/no XML), so Bing's
  fetch finds nothing on it.
- **IndexNow** (`scripts/indexnow.mjs` + the `public/<key>.txt` key file): run `node
  scripts/indexnow.mjs` after every prod deploy to ping Bing/Yandex with the changed URLs (keeps
  AI engines on the fresh version). Last ping returns 200/202.
- **`llms.txt` is decorative for citation** (measured: AI bots almost never fetch it) — keep it as
  documentation for a future CADlingua public API, do NOT expect it to move AI citations.
- **JSON-LD is generated, not hardcoded.** `Layout.astro` builds a `@graph`
  (`Organization` + `WebSite` + `SoftwareApplication` for CADlingua + a home **FAQPage** of 5 niche
  Q&A) in `<head>` **from the `t()` strings**; content pages add their own `Article`/`HowTo`/
  `BreadcrumbList` via `extraJsonLd`. So the structured-data facts stay true and per-locale for free —
  change the copy in `ui.ts` and the JSON-LD follows. Never inline facts that contradict the page,
  and **never invent stats** (the only quantitative claim used is the real "validated against 7
  production drawings") — fabricated numbers are the failure mode the groundable-content play exists
  to avoid.
- Full Open Graph + Twitter cards reference `public/og.png` (1200×630, brand card; regenerate
  with a Playwright screenshot of an HTML template if the tagline changes). Layout also emits
  `og:locale`/alternate and a `robots` meta per page.
- `public/{sitemap.xml,robots.txt,llms.txt}` are **hand-maintained** static files copied verbatim
  to the site root at build. `robots.txt` explicitly allows AI crawlers and points to the sitemap;
  `llms.txt` is the GEO summary of newlife + CADlingua.
- `vercel.json` owns production headers: immutable cache for `/_astro/*`, short cache for `og.png`,
  and security headers/CSP for pages. Keep it compatible with the current inline Astro scripts
  unless those scripts are moved to external modules.
- **Sitemap gotcha:** `@astrojs/sitemap` is intentionally NOT configured; the sitemap is manual.
  If you add the integration, verify it on this Astro version before deleting the hand-maintained
  file. **Adding a page = two hand-edits:** add its `<url>`
  (with `hreflang` alternates) to `public/sitemap.xml`, and add its strings to BOTH locales in
  `ui.ts`. Forgetting either silently drops the page from search/indexing or from one language.
- All canonical/SEO/`og:image` URLs are absolute on `https://www.newlifesolutions.dev` (the apex
  redirects to `www`); the `og:image` only resolves once deployed.

## Branches (this repo carries several on purpose)

- `main` — production. **Pushing here triggers a deploy** (see below). Currently the simple
  pre-rework landing.
- `hub-v1` — the in-progress Astro hub rework (intro + 3D + i18n). **Active work branch.**
  Promote to production by merging/fast-forwarding into `main` once approved.
- `astro-grimorio` — the previous full Astro site, kept as history.
- `placeholder-imanol` — backup of the original personal landing.

## Deploy (non-obvious — read before touching CI or pushing)

Auto-deploy runs via **GitHub Actions** (`.github/workflows/deploy.yml`), NOT Vercel's native
Git integration. On push to `main`, the workflow runs `vercel pull/build/deploy --prod` against
the `nlife` project using repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

Why Actions instead of native: the Vercel GitHub App is not linked to the `newlifesolution`
GitHub account in a way the CLI/dashboard could connect, so `vercel git connect` fails. The
token-based workflow sidesteps that entirely. If the native integration is ever wired up, delete
this workflow to avoid double deploys.

**Git account (binding):** operate as `newlifesolution` only — it owns the org repo. Pushes must
use it (`gh auth switch --user newlifesolution`). **NEVER** push as `ifranjo`/`amzgoalsadmin`
(read-only on the org → breaks pushes); New Life is kept independent of the personal account.
Pushing files under `.github/workflows/` requires the `workflow` OAuth scope on the active account.

**Preview vs production:** `vercel deploy` (no `--prod`) makes a preview deployment that does NOT
touch the live domain — use it to review. Preview URLs sit behind Vercel deployment protection
(401 to anonymous curl; open in a browser logged into Vercel). Production domains
(`www.newlifesolutions.dev`, apex, `nlife.vercel.app`) are public.

## Visual verification (the workflow used here)

Playwright is installed **globally** (`~/.npm-global`), not as a project dep. Scripts import it
by absolute file URL (`file:///C:/Users/ifranjo/.npm-global/node_modules/playwright/index.mjs`).
Smoke pattern: `npm run smoke` builds, starts `astro preview` on `127.0.0.1:4321`, checks `/`
and `/en/`, then stops the preview process. Screenshot pattern: `npm run build`, serve `dist/`
(`python -m http.server 4321 --directory dist`), then a Playwright script that captures frames/screenshots.
To screenshot the site past the intro,
remove `#intro` in the page and clear `documentElement.style.overflow` before shooting. Measure
the actual rendered output rather than trusting the code — a silent canvas error (e.g. assigning
read-only `clientWidth`) shows up only as a blank background in a screenshot.
