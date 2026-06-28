// Route-consistency guard — the page set is hand-maintained in THREE places (Astro
// src/pages, public/sitemap.xml, scripts/indexnow.mjs). Adding a page is "FOUR hand-edits"
// (see CLAUDE.md); this fails if the three lists drift. Run: `node scripts/check-routes.mjs`.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// trailingSlash:'ignore' in astro.config → '/x' and '/x/' are the same route. Normalize to
// no trailing slash, except the site root which stays '/'.
const norm = (p) => {
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\/+$/, '');
  return p === '' ? '/' : p;
};
const fmt = (s) => [...s].sort().join('\n  ') || '(none)';

// 1) Astro routes from src/pages/**/*.astro
function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith('.astro')) out.push(full);
  }
  return out;
}
const pagesDir = resolve(root, 'src/pages');
const astro = new Set(
  walk(pagesDir).map((f) => {
    let rel = relative(pagesDir, f).replace(/\\/g, '/').replace(/\.astro$/, '');
    rel = rel.replace(/(^|\/)index$/, '$1'); // index -> dir root
    return norm('/' + rel);
  })
);

// 2) sitemap.xml <loc> (strip host -> path)
const sitemapXml = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
const sitemap = new Set(
  [...sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) =>
    norm(new URL(m[1]).pathname)
  )
);

// 3) indexnow.mjs URLS array (parse as text — importing would fire its fetch). Entries are
// `https://${HOST}<path>`; capture the path after ${HOST}.
const indexnowSrc = readFileSync(resolve(root, 'scripts/indexnow.mjs'), 'utf8');
const urlsBlock = /const URLS\s*=\s*\[([\s\S]*?)\]/.exec(indexnowSrc)?.[1] ?? '';
const indexnow = new Set(
  [...urlsBlock.matchAll(/`https:\/\/\$\{HOST\}([^`]*)`/g)].map((m) => norm(m[1]))
);

const diff = (a, b) => [...a].filter((x) => !b.has(x));
let ok = true;
const fail = (m) => { ok = false; console.error('[routes] FAIL: ' + m); };

if (diff(astro, sitemap).length) fail(`in Astro pages but missing from sitemap.xml: ${diff(astro, sitemap).join(', ')}`);
if (diff(sitemap, astro).length) fail(`in sitemap.xml but no Astro page: ${diff(sitemap, astro).join(', ')}`);
if (diff(astro, indexnow).length) fail(`in Astro pages but missing from indexnow.mjs: ${diff(astro, indexnow).join(', ')}`);
if (diff(indexnow, astro).length) fail(`in indexnow.mjs but no Astro page: ${diff(indexnow, astro).join(', ')}`);

if (ok) {
  console.log(`[routes] OK: ${astro.size} routes agree across pages / sitemap.xml / indexnow.mjs:\n  ${fmt(astro)}`);
  process.exit(0);
}
console.error(`\n  Astro:    ${fmt(astro)}\n  sitemap:  ${fmt(sitemap)}\n  indexnow: ${fmt(indexnow)}`);
process.exit(1);
