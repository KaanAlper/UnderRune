const state=document.querySelector('#state'),canvas=document.querySelector('#canvas'),issues=document.querySelector('#issues');
let runner,active=false,started=false,paused=false;const held=new Set();
const send=(type,data={})=>parent.postMessage({source:'underrune-native',type,...data},location.origin);
const release=()=>{if(runner)for(const key of held)runner._onKeyUp(key);held.clear();};
// Engine diagnostics stay in the console; the overlay is only shown with ?debug.
if(new URL(location.href).searchParams.has('debug'))issues.hidden=false;
const report=text=>{console.log(text);if(/Unknown function|Stubbed function|exception|fatal/i.test(text)&&!/Configured exception handler/.test(text)){const entry=document.createElement('div');entry.textContent=text;issues.append(entry);while(issues.children.length>12)issues.firstElementChild.remove();send('diagnostic',{message:text});}};
// Mute: every engine audio path ends at the AudioContext destination; route it through one master gain
// so muting never touches the game's own volume settings.
let muted=false;const masters=new Map(),connectNode=AudioNode.prototype.connect;
AudioNode.prototype.connect=function(target,...rest){
 if(!(target instanceof AudioDestinationNode))return connectNode.call(this,target,...rest);
 let gain=masters.get(target);if(!gain){gain=target.context.createGain();gain.gain.value=muted?0:1;connectNode.call(gain,target);masters.set(target,gain);}
 return connectNode.call(this,gain,...rest);
};
const setMuted=value=>{muted=value;for(const gain of masters.values())gain.gain.value=value?0:1;};
// Pause: the engine's own pause (F8 in its loop) also pauses all sounds. F8 never reaches it from the keyboard.
const F8=119;
function setPaused(value){
 if(!runner||!active||paused===value)return;release();paused=value;
 runner._onKeyDown(F8);setTimeout(()=>runner?._onKeyUp(F8),80);send('paused',{value:paused});
}
const fetchBytes=async url=>{const res=await fetch(url);if(!res.ok)throw Error('Kaynak dosya yüklenemedi: '+url);return new Uint8Array(await res.arrayBuffer());};
function mkdir(folder){const pieces=folder.split('/').filter(Boolean);let current='';for(const p of pieces){current+='/'+p;try{runner.FS.mkdir(current);}catch(error){if(error.errno!==20)try{runner.FS.stat(current);}catch{throw error;}}}}
async function start(id,ini){
 if(started)return;started=true;
 try{
  const response=await fetch('/native/config?id='+encodeURIComponent(id));if(!response.ok)throw Error('Bu karşılaşmanın native başlatıcısı henüz hazır değil.');const profile=await response.json();
  if(typeof ini!=='string'||ini.length>4096||!/^[\w\[\]=\n\r]*$/.test(ini))throw Error('Geçersiz ekipman hazırlığı.');
  const supportsJspi=typeof WebAssembly.Suspending==='function'&&typeof WebAssembly.promising==='function';
  state.textContent='* '+profile.name+' / ÖZGÜN OYUN MOTORU YÜKLENİYOR…';
  const {default:createRunner}=await import('/native/'+(supportsJspi?'browser':'portable')+'-engine/butterscotch.mjs');
  runner=await createRunner({canvas,print:report,printErr:report});mkdir('/saves');const packageName='chapter'+profile.chapter+'_windows';mkdir('/game/'+packageName);
  runner.FS.writeFile('/saves/UnderRune.ini',ini+`[battle]\nencounter=${profile.encounter}\nspecial=${profile.special}\nmusic=${profile.music}\n[party]\n1=${profile.party[1]}\n2=${profile.party[2]}\n`);
  let index=0,done=0;const names=profile.files;
  await Promise.all(Array.from({length:4},async()=>{while(index<names.length){const name=names[index++];if(!/^[\w./-]+$/.test(name)||name.includes('..'))throw Error('Geçersiz kaynak yolu');const target='/game/'+packageName+'/'+name;mkdir(target.slice(0,target.lastIndexOf('/')));runner.FS.writeFile(target,await fetchBytes(name==='data.win'?'/native/package/'+profile.chapter:'/native/game/'+packageName+'/'+name));done++;state.textContent='* '+profile.name+' / DOSYALAR '+done+' / '+names.length;}}));
  mkdir('/game/'+packageName+'/mus');for(const file of profile.musicFiles){const bytes=await fetchBytes('/native/game/mus/'+file);runner.FS.writeFile('/game/'+packageName+'/mus/'+file,bytes);}
  // The original game seeds randomly; ?seed= keeps a run reproducible for tests.
  const seed=new URL(location.href).searchParams.get('seed')??String(Math.floor(Math.random()*2147483647));
  const args=['/game/'+packageName+'/data.win','--save-folder','/saves','--disable-log-colours','--seed',/^\d+$/.test(seed)?seed:'20261011'];
  const argv=runner._malloc(args.length*4),pointers=args.map(arg=>runner.stringToNewUTF8(arg));pointers.forEach((pointer,i)=>runner.setValue(argv+i*4,pointer,'i32'));
  active=true;state.hidden=true;canvas.focus();send('running',{id});
  try{const result=await runner.ccall('startRunner','number',['number','number'],[args.length,argv],{async:true});if(active){state.textContent='Savaş motoru durdu: '+result;state.hidden=false;send('ended',{result});}}
  finally{release();active=false;pointers.forEach(p=>runner._free(p));runner._free(argv);}
 }catch(error){release();active=false;state.textContent=error.message;state.hidden=false;send('failed',{message:error.message});}
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||event.data?.source!=='underrune-host')return;
 const data=event.data;if(data.type==='start')void start(data.id,data.ini);
 if(data.type==='key'&&active&&!paused){if(data.down){held.add(data.key);runner._onKeyDown(data.key);}else{held.delete(data.key);runner._onKeyUp(data.key);}}
 if(data.type==='stop'){active=false;release();runner?._requestRunnerExit();}
 if(data.type==='pause')setPaused(!!data.value);
 if(data.type==='mute')setMuted(!!data.value);
});
const keys=new Set([13,16,27,32,37,38,39,40,67,88,90]);
window.addEventListener('keydown',event=>{if(event.keyCode===80&&active&&!event.repeat&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();setPaused(!paused);return;}if(!active||paused||event.ctrlKey||event.metaKey||event.altKey||!keys.has(event.keyCode))return;event.preventDefault();if(!held.has(event.keyCode)){held.add(event.keyCode);runner._onKeyDown(event.keyCode);}});
window.addEventListener('keyup',event=>{if(!active||!keys.has(event.keyCode))return;held.delete(event.keyCode);runner._onKeyUp(event.keyCode);});
window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)setPaused(true);});
send('ready');
