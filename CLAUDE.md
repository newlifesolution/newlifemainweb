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
```

No test runner is configured. Visual changes are verified with **ad-hoc Playwright screenshots**
(see "Visual verification" below), not a test suite.

## Architecture

**Static Astro 4 with built-in i18n.** Output is plain HTML in `dist/` — Vercel serves it as-is,
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

- **JSON-LD is generated, not hardcoded.** `Layout.astro` builds a `@graph`
  (`Organization` + `WebSite` + `SoftwareApplication` for CADlingua) in `<head>` **from the
  `t()` strings**. So the structured-data facts (CADlingua features, descriptions) stay true and
  per-locale for free — change the copy in `ui.ts` and the JSON-LD follows. Never inline facts
  that contradict the page; that would mislead the models the JSON-LD exists to inform.
- Full Open Graph + Twitter cards reference `public/og.png` (1200×630, brand card; regenerate
  with a Playwright screenshot of an HTML template if the tagline changes). Layout also emits
  `og:locale`/alternate and a `robots` meta per page.
- `public/{sitemap.xml,robots.txt,llms.txt}` are **hand-maintained** static files copied verbatim
  to the site root at build. `robots.txt` explicitly allows AI crawlers and points to the sitemap;
  `llms.txt` is the GEO summary of newlife + CADlingua.
- **Sitemap gotcha:** `@astrojs/sitemap` is intentionally NOT used — it crashes with this Astro
  version. The sitemap is therefore manual. **Adding a page = two hand-edits:** add its `<url>`
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
Pattern: `npm run build`, serve `dist/` (`python -m http.server 4321 --directory dist`), then a
Playwright script that captures frames/screenshots. To screenshot the site past the intro,
remove `#intro` in the page and clear `documentElement.style.overflow` before shooting. Measure
the actual rendered output rather than trusting the code — a silent canvas error (e.g. assigning
read-only `clientWidth`) shows up only as a blank background in a screenshot.
