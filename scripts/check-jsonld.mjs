// JSON-LD guard — runs over the BUILT dist/. For every page: the ld+json must parse, the
// @graph must carry Organization+WebSite+SoftwareApplication, FAQPage must be home-only, the
// SoftwareApplication.url must be the stable product anchor (regression guard for WARN-1), and
// no same-page fragment url may point at an id that doesn't exist in that page's HTML.
// Build first, then run: `npm run build && node scripts/check-jsonld.mjs`.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const SITE = 'https://www.newlifesolutions.dev';
const STABLE_APP_URL = `${SITE}/#cadlingua`;

if (!existsSync(dist)) {
  console.error('[jsonld] FAIL: dist/ not found — run `npm run build` first.');
  process.exit(2);
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name === 'index.html') out.push(full);
  }
  return out;
}

const pages = walk(dist);
let ok = true;
const fail = (p, m) => { ok = false; console.error(`[jsonld] FAIL ${p}: ${m}`); };

for (const file of pages) {
  const route = '/' + relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  const isHome = route === '/' || route === '/en/';
  const html = readFileSync(file, 'utf8');

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length !== 1) { fail(route, `expected 1 ld+json block, got ${blocks.length}`); continue; }

  let data;
  try { data = JSON.parse(blocks[0][1]); }
  catch (e) { fail(route, `ld+json does not parse: ${e.message}`); continue; }

  const graph = data['@graph'];
  if (!Array.isArray(graph)) { fail(route, 'no @graph array'); continue; }
  const types = graph.map((n) => n['@type']);

  for (const req of ['Organization', 'WebSite', 'SoftwareApplication']) {
    if (!types.includes(req)) fail(route, `missing ${req} node`);
  }
  const hasFaq = types.includes('FAQPage');
  if (isHome && !hasFaq) fail(route, 'home is missing FAQPage');
  if (!isHome && hasFaq) fail(route, 'content page must NOT carry FAQPage');

  const app = graph.find((n) => n['@type'] === 'SoftwareApplication');
  if (app && app.url !== STABLE_APP_URL) fail(route, `SoftwareApplication.url=${app.url} (expected ${STABLE_APP_URL})`);

  // dead-anchor guard: any node url that is a fragment on THIS page must resolve to an id here.
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  for (const n of graph) {
    const u = typeof n.url === 'string' ? n.url : null;
    if (u && canonical && u.startsWith(canonical + '#')) {
      const frag = u.slice((canonical + '#').length);
      if (frag && !new RegExp(`id=["']${frag}["']`).test(html))
        fail(route, `${n['@type']}.url points at #${frag} but no id="${frag}" exists on this page`);
    }
  }
}

if (ok) { console.log(`[jsonld] OK: ${pages.length} pages — all parse, required nodes present, FAQPage home-only, app url stable, no dead anchors.`); process.exit(0); }
process.exit(1);
