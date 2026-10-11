import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const game=path.resolve(process.env.DELTARUNE_DIR??'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE');
const engine=path.join(root,'.tools','butterscotch-web');
const diagnosticEngine=path.join(root,'.tools','butterscotch-diagnostic-build');
const browserEngine=path.join(root,'.tools','butterscotch-browser-current-build');
const portableEngine=path.join(root,'.tools','butterscotch-portable-build');
async function files(folder,prefix=''){const result=[];for(const entry of await fs.readdir(folder,{withFileTypes:true})){const name=prefix+entry.name;if(entry.isDirectory())result.push(...await files(path.join(folder,entry.name),name+'/'));else result.push(name);}return result;}
const chapterFiles=await files(path.join(game,'chapter1_windows'));
const html=`<!doctype html><html><head><meta charset="utf-8"><title>Original bytecode compatibility probe</title><style>body{background:#111;color:#eee;font:14px monospace}canvas{width:640px;max-width:100%;image-rendering:pixelated}pre{white-space:pre-wrap}button{padding:12px}</style></head><body><h1>Original bytecode compatibility probe</h1><p>This is a compatibility experiment, not a completed boss port.</p><button id="start">Run original Chapter 1 bytecode</button><p id="state">Ready</p><canvas id="canvas" width="640" height="480" tabindex="0"></canvas><h2>Persistent runtime diagnostics</h2><div id="diagnostics"></div><pre id="logs"></pre><script type="module">
import {probeOptions,probeEngine} from '/probe-options.mjs';
const supportsJspi=typeof WebAssembly.Suspending==='function'&&typeof WebAssembly.promising==='function';
const options=probeOptions(location.search),engineKind=probeEngine(options,supportsJspi);
const enginePrefix=engineKind==='diagnostic'?'/diagnostic-engine/':engineKind==='browser'?'/browser-engine/':engineKind==='portable'?'/portable-engine/':'/engine/';
const state=document.querySelector('#state'),logs=document.querySelector('#logs'),button=document.querySelector('#start');
const report=(text)=>{logs.textContent=(logs.textContent+text+'\\n').slice(-14000);if(/Unknown function|Stubbed function|exception|fatal|error/i.test(text)){const entry=document.createElement('div');entry.textContent=text;document.querySelector('#diagnostics').append(entry);}};let runner;
button.textContent=options.mode==='jevil-room'||options.mode==='jevil'?'Orijinal Jevil savaşını başlat':'Denemeyi başlat';
let active=false;const heldKeys=new Set();
const releaseKeys=()=>{if(runner)for(const key of heldKeys)runner._onKeyUp(key);heldKeys.clear();};
button.onclick=async()=>{button.disabled=true;try{
 if(engineKind!=='portable'&&!supportsJspi)throw Error('This browser lacks JSPI required by this experimental runner. Remove the engine query to use the portable runtime.');
 state.textContent='Loading runner';const {default:createRunner}=await import(enginePrefix+'butterscotch.mjs');runner=await createRunner({canvas:document.querySelector('#canvas'),print:report,printErr:report});
 runner.FS.mkdir('/game');runner.FS.mkdir('/game/chapter1_windows');runner.FS.mkdir('/game/chapter1_windows/lang');runner.FS.mkdir('/saves');
 runner.FS.mkdir('/game/chapter1_windows/mus');
 const {mode,chapter}=options,isJevil=mode==='jevil'||mode==='jevil-room',apiTest=mode==='api-test';
 const census=mode==='census';
 const packageName='chapter'+chapter+'_windows';
 if(chapter!==1)runner.FS.mkdir('/game/'+packageName);
 if(census){const response=await fetch('/game/'+packageName+'/data.win');if(!response.ok)throw Error('Missing source package');runner.FS.writeFile('/game/'+packageName+'/data.win',new Uint8Array(await response.arrayBuffer()));}
 else{
 const names=${JSON.stringify(chapterFiles)};let index=0;
 await Promise.all(Array.from({length:4},async()=>{while(index<names.length){const name=names[index++];const response=await fetch((isJevil||apiTest)&&name==='data.win'?'/probe-data/'+(apiTest?'ch1-api-test':mode==='jevil-room'?'ch1-jevil-room':'ch1-jevil'):'/game/chapter1_windows/'+name);if(!response.ok)throw Error('Missing source file '+name);runner.FS.writeFile('/game/chapter1_windows/'+name,new Uint8Array(await response.arrayBuffer()));}}));
 for(const name of ['joker.ogg','AUDIO_DRONE.ogg']){const response=await fetch('/game/mus/'+name);if(!response.ok)throw Error('Missing source music '+name);runner.FS.writeFile('/game/chapter1_windows/mus/'+name,new Uint8Array(await response.arrayBuffer()));}
 }
 state.textContent=census?'Scanning referenced native APIs':'Running original battle bytecode; launcher modified';
 const args=options.args;
 const argv=runner._malloc(args.length*4),pointers=args.map(arg=>runner.stringToNewUTF8(arg));pointers.forEach((pointer,index)=>runner.setValue(argv+index*4,pointer,'i32'));
 active=true;document.querySelector('#canvas').focus();
 try{const result=await runner.ccall('startRunner','number',['number','number'],[args.length,argv],{async:true});state.textContent='Deneme sona erdi: '+result;}finally{releaseKeys();active=false;pointers.forEach(pointer=>runner._free(pointer));runner._free(argv);}
}catch(error){active=false;releaseKeys();state.textContent='Probe failed: '+error.message;report(error.stack??String(error));}finally{button.disabled=false;button.textContent='Yeniden yükle';button.onclick=()=>location.reload();}};
const gameKeys=new Set([13,16,27,32,37,38,39,40,67,88,90]);
window.addEventListener('keydown',event=>{if(active&&gameKeys.has(event.keyCode)){event.preventDefault();heldKeys.add(event.keyCode);runner._onKeyDown(event.keyCode);}});
window.addEventListener('keyup',event=>{if(active&&gameKeys.has(event.keyCode)){event.preventDefault();heldKeys.delete(event.keyCode);runner._onKeyUp(event.keyCode);}});
window.addEventListener('blur',releaseKeys);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseKeys();});
</script></body></html>`;
const types={'.mjs':'text/javascript; charset=utf-8','.wasm':'application/wasm','.json':'application/json; charset=utf-8','.ogg':'audio/ogg'};
http.createServer(async(request,response)=>{
 try{
  const url=new URL(request.url,'http://127.0.0.1:5184');
  if(url.pathname==='/'){response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});response.end(html);return;}
  if(url.pathname==='/probe-options.mjs'){response.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8'});response.end(await fs.readFile(path.join(root,'tools/probe-options.mjs')));return;}
  if(['/probe-data/ch1-jevil','/probe-data/ch1-jevil-room','/probe-data/ch1-api-test'].includes(url.pathname)){const contents=await fs.readFile(path.join(root,'.tools/source-probe',path.basename(url.pathname)+'.win'));response.writeHead(200,{'Content-Type':'application/octet-stream'});response.end(contents);return;}
  const base=url.pathname.startsWith('/engine/')?engine:url.pathname.startsWith('/diagnostic-engine/')?diagnosticEngine:url.pathname.startsWith('/browser-engine/')?browserEngine:url.pathname.startsWith('/portable-engine/')?portableEngine:url.pathname.startsWith('/game/')?game:null;
  if(!base){response.writeHead(404);response.end();return;}
  const relative=decodeURIComponent(url.pathname.replace(/^\/(engine|diagnostic-engine|browser-engine|portable-engine|game)\//,''));const target=path.resolve(base,relative);
  if(!target.startsWith(base+path.sep)){response.writeHead(403);response.end();return;}
  const contents=await fs.readFile(target);response.writeHead(200,{'Content-Type':types[path.extname(target)]??'application/octet-stream','Cache-Control':'no-store'});response.end(contents);
 }catch{response.writeHead(404);response.end('File unavailable');}
}).listen(5184,'127.0.0.1',()=>console.log('Read-only original bytecode probe: http://127.0.0.1:5184/'));
