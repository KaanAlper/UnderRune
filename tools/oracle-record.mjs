// Records a reference run of an original battle for parity testing: fixed seed, scripted keys,
// one trace line per frame (every object, the RNG state and chosen globals).
// Requires the app dev server (npm run dev). Output: .tools/oracle/<id>-s<seed>.ndjson
// Usage: node tools/oracle-record.mjs ch1-25 [--seed=11] [--frames=1800] [--dumps=683,700] [--god] [--script=z|menu]
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCRIPTS,zScript} from './oracle-scripts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [id, ...rest] = process.argv.slice(2);
if (!id) throw Error('Usage: node tools/oracle-record.mjs <encounter id> [--seed=N] [--frames=N]');
const option = (name, fallback) => Number(rest.find(a => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback);
const seed = option('seed', 11), frames = option('frames', 1800);
const dumps = (rest.find(a => a.startsWith('--dumps='))?.split('=')[1] ?? '').split(',').filter(Boolean).map(Number);
const god = rest.includes('--god');
const moving=rest.includes('--moving');
const jevilTurn=option('jevil-turn',-1);
if(!Number.isInteger(jevilTurn)||jevilTurn < -1||jevilTurn>19|| (jevilTurn>=0&&id!=='ch1-25'))throw Error('Invalid Jevil phase preset');
// Battle state worth comparing: party HP, TP, turn timer, battle phase flags, invincibility.
const GLOBALS = 'hp,maxhp,tension,turntimer,myfight,mnfight,inv,encounterno';

export {zScript};
// --script=NAME: the key script (tools/oracle-scripts.mjs); z by default.
const scriptName=rest.find(a=>a.startsWith('--script='))?.split('=')[1]??'z';
if(!SCRIPTS[scriptName])throw Error(`Unknown key script ${scriptName}`);

const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', args: ['--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage({viewport: {width: 640, height: 480}});
  await page.addInitScript(() => { window.__ev = []; addEventListener('message', e => { if (e.data?.source === 'underrune-native') window.__ev.push(e.data.type); }); });
  await page.goto(`http://127.0.0.1:5173/native/?oracle=1&seed=${seed}`);
  await page.waitForFunction(() => window.__ev.includes('ready'));
  const inputs=SCRIPTS[scriptName](frames);
  // Move through a square starting in the first attack, then test slow movement and diagonals.
  // Frame numbers are replay indices (input at index N affects the state traced at N+1).
  if(moving){
    for(const [f,press,release]of [[690,[37],[]],[710,[38],[37]],[730,[39],[38]],[750,[40],[39]],[770,[16,37,38],[40]],[810,[39,40],[37,38]],[850,[],[16,39,40]]]){
      if(f>=frames)continue;const entry=inputs[f]??={keysPressed:[],keysReleased:[]};entry.keysPressed.push(...press);entry.keysReleased.push(...release);
    }
  }
  const oracle = {inputs: JSON.stringify(inputs), frames, globals: GLOBALS, dumps};
  // --god: the game's debug no-damage switch, so one run covers many enemy turns.
  const ini = god||jevilTurn>=0 ? '[oracle]\n'+(god?'god=1\n':'')+(jevilTurn>=0?'jevil_turn='+jevilTurn+'\n':'') : '';
  await page.evaluate(([id, ini, oracle]) => postMessage({source: 'underrune-host', type: 'start', id, ini, oracle}, location.origin), [id, ini, oracle]);
  await page.waitForFunction(() => window.__ev.includes('ended') || window.__ev.includes('failed'), null, {timeout: frames / 30 * 1000 * 4 + 120000});
  const trace = await page.evaluate(() => window.__runner.FS.readFile('/saves/trace.ndjson', {encoding: 'utf8'}));
  const runName=`${id}-s${seed}${god ? '-god' : ''}${moving?'-moving':''}${jevilTurn>=0?'-j'+jevilTurn:''}${scriptName!=='z'?'-'+scriptName:''}`;
  const out = path.join(root, '.tools', 'oracle', runName+'.ndjson');
  await fs.mkdir(path.dirname(out), {recursive: true});
  await fs.writeFile(out, trace);
  await fs.writeFile(path.join(path.dirname(out),runName+'.inputs.json'),JSON.stringify(inputs));
  for (const f of dumps) {
    const dump = await page.evaluate(f => window.__runner.FS.readFile(`/saves/dump_${f}.json`, {encoding: 'utf8'}), f);
    await fs.writeFile(path.join(root, '.tools', 'oracle', `${runName}-f${f}.json`), dump);
  }
  const lines = trace.trim().split('\n').length;
  console.log(`${id} seed ${seed}: ${lines} frames -> ${path.relative(root, out)}`);
} finally { await browser.close(); }
