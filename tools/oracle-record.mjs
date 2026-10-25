// Records a reference run of an original battle for parity testing: fixed seed, scripted keys,
// one trace line per frame (every object, the RNG state and chosen globals).
// Requires the app dev server (npm run dev). Output: .tools/oracle/<id>-s<seed>.ndjson
// Usage: node tools/oracle-record.mjs ch1-25 [--seed=11] [--frames=1800] [--dumps=683,700] [--god] [--script=z|menu]
// --inputs=FILE --label=NAME replays previously generated legal keys under a separate recording name.
// --policy=band --label=NAME observes native menus and records its legal keys and actual solo clock.
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
const neoWeird=rest.includes('--neo-weird');
if(neoWeird&&id!=='ch2-61')throw Error('The solo NEO preset requires encounter ch2-61');
const layerProbe=rest.includes('--layer-probe');
if(layerProbe&&id!=='ch2-71')throw Error('Layer probe is scoped to the Clover recording');
const policy=rest.find(a=>a.startsWith('--policy='))?.slice('--policy='.length);
if(policy!==undefined&&!((policy==='band'&&id==='ch2-62')||(policy==='neo-ending'&&id==='ch2-61'&&neoWeird)))throw Error('Unsupported oracle policy');
const moving=rest.includes('--moving');
const jevilTurn=option('jevil-turn',-1);
if(!Number.isInteger(jevilTurn)||jevilTurn < -1||jevilTurn>19|| (jevilTurn>=0&&id!=='ch1-25'))throw Error('Invalid Jevil phase preset');
// Battle state worth comparing: party HP, TP, turn timer, battle phase flags, invincibility.
const GLOBALS = 'hp,maxhp,tension,turntimer,myfight,mnfight,inv,encounterno,time';

export {zScript};
// --script=NAME: the key script (tools/oracle-scripts.mjs); z by default.
const scriptName=rest.find(a=>a.startsWith('--script='))?.split('=')[1]??'z';
if(!SCRIPTS[scriptName])throw Error(`Unknown key script ${scriptName}`);
const inputFile=rest.find(a=>a.startsWith('--inputs='))?.slice('--inputs='.length);
const label=rest.find(a=>a.startsWith('--label='))?.slice('--label='.length)??scriptName;
if(!/^[a-z][a-z0-9-]*$/.test(label))throw Error('Invalid recording label');
if((inputFile||policy)&&!rest.some(a=>a.startsWith('--label=')))throw Error('Custom inputs and policies need a separate --label');
if(policy&&(inputFile||moving||jevilTurn>=0))throw Error('Oracle policies cannot be combined with another input source or phase preset');

const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', args: ['--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage({viewport: {width: 640, height: 480}});
  await page.addInitScript(() => { window.__ev = []; addEventListener('message', e => { if (e.data?.source === 'underrune-native') window.__ev.push(e.data.type); }); });
  await page.goto(`http://127.0.0.1:5173/native/?oracle=1&seed=${seed}`);
  await page.waitForFunction(() => window.__ev.includes('ready'));
  const inputs=policy?{}:inputFile?JSON.parse(await fs.readFile(path.resolve(root,inputFile),'utf8')):SCRIPTS[scriptName](frames);
  // Move through a square starting in the first attack, then test slow movement and diagonals.
  // Frame numbers are replay indices (input at index N affects the state traced at N+1).
  if(moving){
    for(const [f,press,release]of [[690,[37],[]],[710,[38],[37]],[730,[39],[38]],[750,[40],[39]],[770,[16,37,38],[40]],[810,[39,40],[37,38]],[850,[],[16,39,40]]]){
      if(f>=frames)continue;const entry=inputs[f]??={keysPressed:[],keysReleased:[]};entry.keysPressed.push(...press);entry.keysReleased.push(...release);
    }
  }
  const oracle = {inputs: JSON.stringify(inputs), frames, globals: GLOBALS, dumps};
  // --god: the game's debug no-damage switch, so one run covers many enemy turns.
  const ini = god||jevilTurn>=0||policy||layerProbe||neoWeird ? '[oracle]\n'+(neoWeird?'neo_weird=1\n':'')+(layerProbe?'layer_probe=1\n':'')+(policy==='band'?'band_policy=1\n':policy==='neo-ending'?'neo_ending=1\n':'')+(god?'god=1\n':'')+(jevilTurn>=0?'jevil_turn='+jevilTurn+'\n':'') : '';
  await page.evaluate(([id, ini, oracle]) => postMessage({source: 'underrune-host', type: 'start', id, ini, oracle}, location.origin), [id, ini, oracle]);
  await page.waitForFunction(() => window.__ev.includes('ended') || window.__ev.includes('failed'), null, {timeout: frames / 30 * 1000 * 4 + 120000});
  const trace = await page.evaluate(() => window.__runner.FS.readFile('/saves/trace.ndjson', {encoding: 'utf8'}));
  const runName=`${id}-s${seed}${god ? '-god' : ''}${neoWeird?'-weird':''}${moving?'-moving':''}${jevilTurn>=0?'-j'+jevilTurn:''}${label!=='z'?'-'+label:''}`;
  const out = path.join(root, '.tools', 'oracle', runName+'.ndjson');
  await fs.mkdir(path.dirname(out), {recursive: true});
  await fs.writeFile(out, trace);
  if(layerProbe){
    const raw=await page.evaluate(()=>{
      const fs=window.__runner.FS;
      for(const p of ['/saves/layer-probe.txt','/game/chapter2_windows/layer-probe.txt','/layer-probe.txt'])try{return fs.readFile(p,{encoding:'utf8'});}catch{}
      throw Error('Layer probe log absent');
    });
    await fs.writeFile(path.join(path.dirname(out),runName+'.layers.txt'),raw);
  }
  for (const f of dumps) {
    const dump = await page.evaluate(f => window.__runner.FS.readFile(`/saves/dump_${f}.json`, {encoding: 'utf8'}), f);
    await fs.writeFile(path.join(root, '.tools', 'oracle', `${runName}-f${f}.json`), dump);
  }
  if(policy){
    const raw=await page.evaluate(policy=>{
      const fs=window.__runner.FS;
      const file=policy==='band'?'band-policy.csv':'neo-policy.csv';
      for(const p of ['/saves/'+file,'/game/chapter2_windows/'+file,'/'+file])try{return fs.readFile(p,{encoding:'utf8'});}catch{}
      throw Error('Policy log absent; saves: '+fs.readdir('/saves').join(',')+'; cwd: '+fs.cwd());
    },policy);
    const observations=new Map(raw.trim().split('\n').map(line=>{const [time,pressed,released,solo]=line.split(',').map(Number);return [time,{pressed,released,solo}];}));
    const audio={};
    for(const line of trace.trim().split('\n')){
      const state=JSON.parse(line),o=observations.get(state.g.time);
      if(!o)continue;
      inputs[state.f-1]={keysPressed:o.pressed<0?[]:[o.pressed],keysReleased:o.released<0?[]:[o.released]};
      audio[state.f]=o.solo;
    }
    if(policy==='band')await fs.writeFile(path.join(path.dirname(out),runName+'.solo.json'),JSON.stringify(audio));
    await fs.writeFile(path.join(path.dirname(out),runName+'.policy.csv'),raw);
  }
  await fs.writeFile(path.join(path.dirname(out),runName+'.inputs.json'),JSON.stringify(inputs));
  const lines = trace.trim().split('\n').length;
  console.log(`${id} seed ${seed}: ${lines} frames -> ${path.relative(root, out)}`);
} finally { await browser.close(); }
