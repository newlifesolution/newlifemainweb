// i18n key-parity guard — fails if src/i18n/ui.ts has a key in one locale but not the
// other (or a duplicate within a locale). Closes the silent-fallback gap in
// src/i18n/utils.ts:11 (`ui[lang][key] ?? ui[defaultLang][key]`), which would otherwise
// render a missing EN string as ES with no error. Run: `node scripts/check-i18n-parity.mjs`.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(resolve(root, 'src/i18n/ui.ts'), 'utf8');

// Brace-match the `<lang>: { ... }` object and pull the top-level keys (entries are
// `'key': "value"` — values are always strings, so anchoring on the opening quote of the
// value avoids matching `:` inside a value).
function localeKeys(lang) {
  const head = new RegExp(`\\b${lang}\\s*:\\s*\\{`).exec(src);
  if (!head) return null;
  const start = src.indexOf('{', head.index);
  let depth = 0, end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { if (--depth === 0) { end = i; break; } }
  }
  const block = src.slice(start, end);
  const keys = [];
  const re = /(?:^|[,{])\s*['"]?([A-Za-z0-9_.]+)['"]?\s*:\s*['"`]/g;
  let m;
  while ((m = re.exec(block))) keys.push(m[1]);
  return keys;
}

const es = localeKeys('es');
const en = localeKeys('en');
if (!es || !en) {
  console.error('[i18n] FAIL: could not parse es/en blocks in src/i18n/ui.ts');
  process.exit(2);
}

const sEs = new Set(es), sEn = new Set(en);
const missingEn = [...sEs].filter((k) => !sEn.has(k)).sort();
const missingEs = [...sEn].filter((k) => !sEs.has(k)).sort();
const dup = (arr) => {
  const seen = new Set(), d = new Set();
  for (const k of arr) (seen.has(k) ? d : seen).add(k);
  return [...d].sort();
};
const dupEs = dup(es), dupEn = dup(en);

let ok = true;
const fail = (msg) => { ok = false; console.error('[i18n] FAIL: ' + msg); };
if (missingEn.length) fail(`keys in ES but missing from EN: ${missingEn.join(', ')}`);
if (missingEs.length) fail(`keys in EN but missing from ES: ${missingEs.join(', ')}`);
if (dupEs.length) fail(`duplicate keys in ES: ${dupEs.join(', ')}`);
if (dupEn.length) fail(`duplicate keys in EN: ${dupEn.join(', ')}`);

if (ok) {
  console.log(`[i18n] OK: ES ${sEs.size} keys = EN ${sEn.size} keys, no missing, no duplicates.`);
  process.exit(0);
}
process.exit(1);
