// Opens every catalogued encounter in the native (original bytecode) player and
// records whether it loads, keeps running and reaches combat, plus engine diagnostics.
// Requires the app dev server (npm run dev) on 127.0.0.1:5173.
// Usage: node tools/native-census.mjs [--only=ch1-25,ch2-61] [--force]
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Outside test-results/: Playwright wipes that folder at the start of every run.
const out = path.join(root, '.tools', 'native-census');
const args = process.argv.slice(2);
const only = args.find(a => a.startsWith('--only='))?.slice(7).split(',');
const force = args.includes('--force');
// The app's Vite server serves /native/ (npm run dev); NATIVE_URL can point at tools/native-server.mjs instead.
const base = process.env.NATIVE_URL ?? 'http://127.0.0.1:5173/native/';
const catalog = JSON.parse(await fs.readFile(path.join(root, 'src/bosses/catalog.json'), 'utf8'));
const ids = catalog.map(r => r.id).filter(id => !only || only.includes(id));
await fs.mkdir(out, {recursive: true});
const summaryPath = path.join(out, 'summary.json');
// --force re-runs the selected encounters but keeps the others' results.
const summary = JSON.parse(await fs.readFile(summaryPath, 'utf8').catch(() => '{}'));

const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', args: ['--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required']});
const tap = async (page, key, ms = 90) => { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); };
try {
  for (const id of ids) {
    if (summary[id] && !force) continue;
    const started = Date.now();
    const context = await browser.newContext({viewport: {width: 640, height: 480}});
    const page = await context.newPage();
    const logs = [], pageErrors = [];
    page.on('console', m => logs.push(m.text()));
    page.on('pageerror', e => pageErrors.push(e.message));
    await page.addInitScript(() => {
      window.__events = [];
      window.addEventListener('message', e => { if (e.data?.source === 'underrune-native') window.__events.push(e.data); });
    });
    const result = {id, name: catalog.find(r => r.id === id).name};
    try {
      await page.goto(base);
      await page.waitForFunction(() => window.__events.some(e => e.type === 'ready'), null, {timeout: 15000});
      await page.evaluate(id => window.postMessage({source: 'underrune-host', type: 'start', id, ini: ''}, location.origin), id);
      await page.waitForFunction(() => window.__events.some(e => ['running', 'failed', 'ended'].includes(e.type)), null, {timeout: 180000});
      result.loadSeconds = Math.round((Date.now() - started) / 1000);
      await page.waitForTimeout(6000);
      await page.screenshot({path: path.join(out, id + '-1-intro.png')});
      // Confirm through intro text and the first command so the enemy turn starts.
      for (let i = 0; i < 24; i++) { await tap(page, 'z'); await page.waitForTimeout(330); }
      await page.screenshot({path: path.join(out, id + '-2-turn.png')});
      await page.waitForTimeout(4000);
      await page.screenshot({path: path.join(out, id + '-3-later.png')});
      result.events = await page.evaluate(() => window.__events.map(e => e.type + (e.message ? ':' + e.message : '') + (e.result !== undefined ? ':' + e.result : '')));
      result.state = await page.locator('#state').evaluate(n => n.hidden ? '' : n.textContent);
    } catch (error) {
      result.error = error.message.split('\n')[0];
      await page.screenshot({path: path.join(out, id + '-error.png')}).catch(() => {});
      result.events = await page.evaluate(() => window.__events?.map(e => e.type + (e.message ? ':' + e.message : ''))).catch(() => []);
    }
    result.running = !result.error && result.events?.includes('running') && !result.events.some(e => e.startsWith('ended') || e.startsWith('failed'));
    result.diagnostics = [...new Set(logs.filter(t => /Unknown function|Stubbed function|exception|fatal|error/i.test(t)).map(t => t.slice(0, 200)))].slice(0, 40);
    result.rooms = [...new Set(logs.map(t => t.match(/\broom_[A-Za-z0-9_]+/)?.[0]).filter(Boolean))].slice(0, 20);
    result.pageErrors = pageErrors;
    result.seconds = Math.round((Date.now() - started) / 1000);
    summary[id] = result;
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`${id.padEnd(10)} ${result.running ? 'RUNNING' : 'STOPPED'} ${result.seconds}s diag=${result.diagnostics.length}${result.error ? ' ERR ' + result.error : ''}${result.state ? ' STATE ' + result.state : ''}`);
    await context.close();
  }
} finally { await browser.close(); }
