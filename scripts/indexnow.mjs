// IndexNow ping — notify Bing/Yandex/etc. that pages changed so AI engines (which
// pull fresh content) re-fetch. Run AFTER a prod deploy: `node scripts/indexnow.mjs`.
// Measured payoff (2026): pages updated in the last 3 months earn ~6 AI citations vs 3.6 stale.
//
// The key is also published at https://www.newlifesolutions.dev/<KEY>.txt (static file in
// public/) so IndexNow can verify ownership. Keep the two in sync.
const HOST = 'www.newlifesolutions.dev';
const KEY = 'c8e72311dc70cdf7b24ceaa13f58c8f2';
const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/en/`,
  `https://${HOST}/comparativa-traductor-planos`,
  `https://${HOST}/en/cad-translation-vs-generic-translator`,
  `https://${HOST}/traducir-planos-aleman`,
  `https://${HOST}/en/translate-drawings-to-german`,
  `https://${HOST}/como-traducir-plano-sin-romper-cotas`,
  `https://${HOST}/en/how-to-translate-a-drawing-without-breaking-dimensions`,
];

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: URLS,
};

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
// IndexNow returns 200 (accepted) or 202 (accepted, pending verification). 403 = key not
// found at keyLocation (deploy the key file first). 422 = URLs don't match host.
console.log(`IndexNow ping → HTTP ${res.status} ${res.statusText}`);
console.log(`  submitted: ${URLS.join(', ')}`);
if (!res.ok && res.status !== 202) {
  const txt = await res.text().catch(() => '');
  console.error(`  body: ${txt.slice(0, 300)}`);
  process.exit(1);
}
