// Records a reference run of an original battle for parity testing: fixed seed, scripted keys,
// one trace line per frame (every object, the RNG state and chosen globals).
// Requires the app dev server (npm run dev). Output: .tools/oracle/<id>-s<seed>.ndjson
// Usage: node tools/oracle-record.mjs ch1-25 [--seed=11] [--frames=1800]
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [id, ...rest] = process.argv.slice(2);
if (!id) throw Error('Usage: node tools/oracle-record.mjs <encounter id> [--seed=N] [--frames=N]');
const option = (name, fallback) => Number(rest.find(a => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback);
const seed = option('seed', 11), frames = option('frames', 1800);
// Battle state worth comparing: party HP, TP, turn timer, battle phase flags, invincibility.
const GLOBALS = 'hp,maxhp,tension,turntimer,myfight,mnfight,inv,encounterno';

// Z is pressed for one frame every 8 frames: dialogue advances, FIGHT is chosen, the soul never moves.
export function zScript(totalFrames, every = 8) {
  const script = {};
  for (let f = 30; f < totalFrames; f += every) { script[f] = {keysPressed: [90], keysReleased: []}; script[f + 1] = {keysPressed: [], keysReleased: [90]}; }
  return script;
}

const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', args: ['--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage({viewport: {width: 640, height: 480}});
  await page.addInitScript(() => { window.__ev = []; addEventListener('message', e => { if (e.data?.source === 'underrune-native') window.__ev.push(e.data.type); }); });
  await page.goto(`http://127.0.0.1:5173/native/?oracle=1&seed=${seed}`);
  await page.waitForFunction(() => window.__ev.includes('ready'));
  const oracle = {inputs: JSON.stringify(zScript(frames)), frames, globals: GLOBALS};
  await page.evaluate(([id, oracle]) => postMessage({source: 'underrune-host', type: 'start', id, ini: '', oracle}, location.origin), [id, oracle]);
  await page.waitForFunction(() => window.__ev.includes('ended') || window.__ev.includes('failed'), null, {timeout: frames / 30 * 1000 * 4 + 120000});
  const trace = await page.evaluate(() => window.__runner.FS.readFile('/saves/trace.ndjson', {encoding: 'utf8'}));
  const out = path.join(root, '.tools', 'oracle', `${id}-s${seed}.ndjson`);
  await fs.mkdir(path.dirname(out), {recursive: true});
  await fs.writeFile(out, trace);
  const lines = trace.trim().split('\n').length;
  console.log(`${id} seed ${seed}: ${lines} frames -> ${path.relative(root, out)}`);
} finally { await browser.close(); }
