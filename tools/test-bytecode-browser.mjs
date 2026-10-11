import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const engine = process.env.BYTECODE_TEST_ENGINE ?? 'browser';
assert.ok(['browser', 'portable', 'diagnostic'].includes(engine));
const browser = await chromium.launch({headless:true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', args:['--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage();
  const engineRequests = [];
  page.on('request', request => { if (/\/.*engine\/butterscotch\.mjs/.test(request.url())) engineRequests.push(request.url()); });
  if (engine === 'portable') await page.addInitScript(() => {
    Object.defineProperty(WebAssembly, 'Suspending', {value:undefined, configurable:true});
    Object.defineProperty(WebAssembly, 'promising', {value:undefined, configurable:true});
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5184/?mode=api-test&engine=' + engine);
  await page.locator('#start').click();
  await page.waitForFunction(() => /sona erdi|failed/.test(document.querySelector('#state').textContent), null, {timeout:20000});
  const logs = await page.locator('#logs').textContent();
  assert.match(logs, /API_PASS spatial voice/);
  assert.match(logs, /API_PASS texture mode 0/);
  assert.match(logs, /API_PASS texture mode 1/);
  assert.doesNotMatch(logs, /API_FAIL/);
  assert.equal(await page.locator('#start').isEnabled(), true);
  assert.equal(await page.locator('#start').textContent(), 'Yeniden yükle');
  await page.locator('#start').click();
  await page.waitForFunction(() => document.querySelector('#state').textContent === 'Ready');
  const playUrl = 'http://127.0.0.1:5184/';
  await page.goto(playUrl);
  await page.locator('#start').click();
  await page.waitForFunction(() => document.querySelector('#state').textContent.startsWith('Running original battle'));
  // Regression: the old default exits after 120 frames, about four seconds.
  await page.waitForTimeout(6500);
  assert.match(await page.locator('#state').textContent(), /^Running original battle/);
  for (let character = 0; character < 3; character++) {
    await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(120); await page.keyboard.up('ArrowLeft');
    await page.waitForTimeout(80);
    await page.keyboard.down('z'); await page.waitForTimeout(120); await page.keyboard.up('z');
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(2000);
  assert.match(await page.locator('#logs').textContent(), /room_cc_joker/);
  assert.match(await page.locator('#state').textContent(), /^Running original battle/);
  assert.deepEqual(errors, []);
  assert.ok(engineRequests.at(-1).includes(engine === 'portable' ? '/portable-engine/' : '/browser-engine/'));
  const output = path.join(root, 'test-results', 'bytecode-' + engine + '.png');
  await fs.mkdir(path.dirname(output), {recursive:true});
  await page.screenshot({path:output});
  console.log(JSON.stringify({engine, apiFixture:'passed', defaultJevil:'running beyond old frame limit', restart:'passed', screenshot:output}));
} finally { await browser.close(); }
