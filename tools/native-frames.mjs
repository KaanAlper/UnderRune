// Screenshots of the original battle at chosen frames, for comparing the remake's drawing with it (tools/remake-frames.mjs).
// One run of the original engine plays the same key script as the reference recordings; the per-frame trace tells
// when it reaches each frame, and the screenshot follows within a few frames (the engine keeps running; its own F8
// pause would draw its pause sign over the frame). The frame reached is printed: draw the remake's at that number.
// Requires the app dev server (npm run dev). Output: <out>/<id>-f<frame>.png (default test-results/native, which
// Playwright test runs empty: --out=.tools/... keeps them).
// Usage: node tools/native-frames.mjs ch3-115 249,642 [--seed=11] [--script=z] [--god] [--out=DIR]
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCRIPTS} from './oracle-scripts.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [id,frameList,...rest]=process.argv.slice(2);
if(!id||!frameList)throw Error('Usage: node tools/native-frames.mjs <encounter id> <frame,frame,...> [--seed=N] [--script=NAME] [--god]');
const seed=Number(rest.find(a=>a.startsWith('--seed='))?.split('=')[1]??11);
const scriptName=rest.find(a=>a.startsWith('--script='))?.split('=')[1]??'z';
if(!SCRIPTS[scriptName])throw Error('Unknown key script '+scriptName);
const god=rest.includes('--god');
const frames=frameList.split(',').map(Number);
if(!frames.every(f=>Number.isInteger(f)&&f>0))throw Error('Frames must be positive whole numbers');
const out=path.resolve(root,rest.find(a=>a.startsWith('--out='))?.split('=')[1]??path.join('test-results','native'));await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH??'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',args:['--enable-unsafe-swiftshader']});
try{
 // One run of the original engine to the last frame; each screenshot is taken as the trace passes its frame.
 const last=Math.max(...frames),page=await browser.newPage({viewport:{width:640,height:480}});
 await page.addInitScript(()=>{window.__ev=[];addEventListener('message',e=>{if(e.data?.source==='underrune-native')window.__ev.push(e.data.type);});});
 await page.goto(`http://127.0.0.1:5173/native/?oracle=1&seed=${seed}`);
 await page.waitForFunction(()=>window.__ev.includes('ready'));
 const inputs=SCRIPTS[scriptName](last+600);
 const oracle={inputs:JSON.stringify(inputs),frames:last+600,globals:'hp',dumps:[]};
 const ini=god?'[oracle]\ngod=1\n':'';
 await page.evaluate(([id,ini,oracle])=>postMessage({source:'underrune-host',type:'start',id,ini,oracle},location.origin),[id,ini,oracle]);
 for(const frame of [...frames].sort((a,b)=>a-b)){
  await page.waitForFunction(f=>{try{return window.__runner.FS.readFile('/saves/trace.ndjson',{encoding:'utf8'}).trim().split('\n').length>=f;}catch{return false;}},frame,{timeout:last/30*1000*4+120000,polling:100});
  const file=path.join(out,`${id}-f${frame}.png`);
  await page.locator('#canvas').screenshot({path:file});
  const traced=await page.evaluate(()=>window.__runner.FS.readFile('/saves/trace.ndjson',{encoding:'utf8'}).trim().split('\n').length);
  console.log(file,'(traced '+traced+' frames)');
 }
}finally{await browser.close();}
