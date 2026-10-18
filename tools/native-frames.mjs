// Screenshots of the original battle at chosen frames, for comparing the remake's drawing with it. Each frame is a
// separate run of the original engine with the same key script as the reference recordings; the per-frame trace tells
// when it reaches the frame, and the screenshot follows within a few frames (the engine keeps running).
// Requires the app dev server (npm run dev). Output: test-results/native/<id>-f<frame>.png
// Usage: node tools/native-frames.mjs ch3-115 249,642 [--seed=11] [--script=z] [--god]
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
const out=path.join(root,'test-results','native');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH??'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',args:['--enable-unsafe-swiftshader']});
try{
 for(const frame of frames){
  const page=await browser.newPage({viewport:{width:640,height:480}});
  await page.addInitScript(()=>{window.__ev=[];addEventListener('message',e=>{if(e.data?.source==='underrune-native')window.__ev.push(e.data.type);});});
  await page.goto(`http://127.0.0.1:5173/native/?oracle=1&seed=${seed}`);
  await page.waitForFunction(()=>window.__ev.includes('ready'));
  const inputs=SCRIPTS[scriptName](frame+600);
  const oracle={inputs:JSON.stringify(inputs),frames:frame+600,globals:'hp',dumps:[]};
  const ini=god?'[oracle]\ngod=1\n':'';
  await page.evaluate(([id,ini,oracle])=>postMessage({source:'underrune-host',type:'start',id,ini,oracle},location.origin),[id,ini,oracle]);
  await page.waitForFunction(f=>{try{return window.__runner.FS.readFile('/saves/trace.ndjson',{encoding:'utf8'}).trim().split('\n').length>=f;}catch{return false;}},frame,{timeout:frame/30*1000*4+120000,polling:250});
  const traced=await page.evaluate(()=>window.__runner.FS.readFile('/saves/trace.ndjson',{encoding:'utf8'}).trim().split('\n').length);
  const file=path.join(out,`${id}-f${frame}.png`);
  await page.locator('#canvas').screenshot({path:file});
  console.log(file,'(traced '+traced+' frames)');
  await page.close();
 }
}finally{await browser.close();}
