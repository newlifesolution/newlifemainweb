import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = process.env.SMOKE_PORT || '4321';
const baseUrl = process.env.SMOKE_URL || `http://127.0.0.1:${port}`;
const headless = process.env.SMOKE_HEADLESS !== '0';
const astroPackage = JSON.parse(
  readFileSync(resolve(root, 'node_modules', 'astro', 'package.json'), 'utf8')
);
const astroBin = typeof astroPackage.bin === 'string' ? astroPackage.bin : astroPackage.bin.astro;
const astroCli = resolve(root, 'node_modules', 'astro', astroBin);

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
    });
    child.on('exit', (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
    child.on('error', rejectRun);
  });
}

async function importPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_MODULE,
    'playwright',
  ].filter(Boolean);

  const globalPath = 'C:/Users/ifranjo/.npm-global/node_modules/playwright/index.mjs';
  if (existsSync(globalPath)) {
    candidates.push(pathToFileURL(globalPath).href);
  }

  for (const candidate of candidates) {
    try {
      return await import(candidate);
    } catch {
      // Try the next configured location.
    }
  }
  throw new Error(
    'Playwright not found. Install it locally or set PLAYWRIGHT_MODULE to its module path.'
  );
}

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Preview may still be starting.
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function checkPage(page, path, expectedTitlePart, expectedH1Part) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  const title = await page.title();
  if (!title.includes(expectedTitlePart)) {
    throw new Error(`${path} title mismatch: ${title}`);
  }

  const h1 = await page.locator('h1').innerText({ timeout: 10_000 });
  if (!h1.includes(expectedH1Part)) {
    throw new Error(`${path} h1 mismatch: ${h1}`);
  }

  const ctaCount = await page.locator('a[href*="cadlingua.newlifesolutions.dev"]').count();
  if (ctaCount < 1) {
    throw new Error(`${path} missing CADlingua CTA`);
  }

  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (hasOverflow) {
    throw new Error(`${path} has horizontal overflow`);
  }

  if (errors.length) {
    throw new Error(`${path} console/page errors:\n${errors.join('\n')}`);
  }
}

let preview;
try {
  console.log('Smoke: building static site');
  await run(process.execPath, [astroCli, 'build']);
  console.log(`Smoke: starting preview on ${baseUrl}`);
  preview = spawn(
    process.execPath,
    [astroCli, 'preview', '--host', '127.0.0.1', '--port', port],
    { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
  );
  preview.stdout.on('data', (chunk) => process.stdout.write(chunk));
  preview.stderr.on('data', (chunk) => process.stderr.write(chunk));

  await waitForServer();
  console.log('Smoke: running browser checks');
  const { chromium } = await importPlaywright();
  const browser = await chromium.launch({ headless });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await checkPage(page, '/', 'newlife', 'Herramientas');
    await checkPage(page, '/en/', 'newlife', 'Tools');
  } finally {
    await browser.close();
  }
  console.log(`Smoke OK: ${baseUrl}/ and ${baseUrl}/en/`);
} finally {
  if (preview && !preview.killed) {
    preview.kill();
  }
}
