import './style.css';
import './boss-deck.css';
import {BossDeck} from './game/boss-deck';
import {loadAssets,AssetStore} from './game/assets';
import {Renderer} from './game/renderer';
import {Input} from './game/input';
import {FixedClock} from './game/clock';
import {catalog} from './bosses/catalog';
import {AudioManager} from './game/audio';
import {loadPrefs,savePrefs,browserStore} from './game/storage';
import {NativeBattle,fetchNativeProfiles,type NativeEvent} from './game/native';
import {PreparationPanel} from './ui/preparation';
import {loadoutIni,type EquipmentCatalog,type Loadout} from './game/loadout';
import {assetUrl} from './game/url';
import {loadRemakeAssets} from './remake/host/assets';
import {setSourceText} from './remake/host/text';
import {createJevilPractice,JEVIL_PATTERNS,type JevilPractice} from './remake/host/practice';
import {EngineBattle} from './remake/host/engine';
import {sourceEncounter,developmentEncounter,availabilityLabel,availableEncounters} from './remake/host/encounters';
// Local dev server only: ?dev=1 also opens ported encounters that are not public yet. Production builds drop this.
const devUnlock=import.meta.env.DEV&&new URLSearchParams(location.search).has('dev');
const playableEncounter=(id:string)=>devUnlock?developmentEncounter(id):sourceEncounter(id);
import {BattleView} from './remake/host/view';
import {CanvasGraphics} from './remake/host/canvas';
import {setHudMeasure} from './remake/deltarune/controller';
import {KEY} from './remake/deltarune/battle';
import type {EncounterRecord} from './game/types';
import {TheaterState,TheaterView,THEATER_HITS} from './game/theater';
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id)! as T;
const canvas=element<HTMLCanvasElement>('screen'),ctx=canvas.getContext('2d')!;
const overlay=element('interactions'),status=element('status'),loading=element('loading'),error=element('error');
const input=new Input(),clock=new FixedClock(),storage=browserStore(),prefs=loadPrefs(storage);
const publicMode=import.meta.env.MODE==='pages'||new URLSearchParams(location.search).has('demo');
const remakeCache=new Map<number,Awaited<ReturnType<typeof loadRemakeAssets>>>();
let remake:JevilPractice|EngineBattle|null=null,publicLoadout:Loadout|null=null,remakeTick=0,publicPractice=false,remakeView:BattleView|null=null;
let remakeMenu=false;
// Engine battles read key presses like the game: every press since the last game frame reaches its next frame.
const remakePressed=new Set<number>();
const remakeCanvas=document.createElement('canvas');remakeCanvas.width=640;remakeCanvas.height=480;const remakeCtx=remakeCanvas.getContext('2d')!;
let assets:AssetStore,renderer:Renderer,audio:AudioManager;
// Local original-bytecode battles run in an iframe; source ports also work without a native install.
let native:NativeBattle|null=null,nativeRecord:EncounterRecord|null=null,nativeIds=new Set<string>(),equipment:EquipmentCatalog|null=null,prep:PreparationPanel|null=null;
// The theater opens the app; choosing DELTARUNE leads to the device intro.
const reducedMotion=()=>prefs.reducedEffects||matchMedia('(prefers-reduced-motion: reduce)').matches;
let theater=new TheaterState(reducedMotion()),theaterView:TheaterView|null=null;
let scene:'theater'|'intro'|'room'|'menu'|'native'|'remake'='theater',chapter=1,selection=0,frame=0,last=0,raf=0,busy=false,sceneKey='',keyCooldown=0,sessionToken=0;
let remakeLoad:AbortController|null=null;
let failedChapter:number|null=null;
const menuRecords=()=>catalog.filter(r=>r.chapter===chapter);
let bossDeck:BossDeck|null=null;
function updatePreferences(){document.body.classList.toggle('reduced',prefs.reducedEffects);element('mute').textContent=prefs.muted?'SOUND OFF':'SOUND ON';element('mute').setAttribute('aria-pressed',String(prefs.muted));element('effects').textContent=prefs.reducedEffects?'CRT OFF':'CRT ON';element('effects').setAttribute('aria-pressed',String(prefs.reducedEffects));savePrefs(storage,prefs);}
function cancelLoad(){sessionToken++;remakeLoad?.abort();remakeLoad=null;failedChapter=null;loading.hidden=true;error.hidden=true;busy=false;}
function closeBattle(){native?.dispose();native=null;nativeRecord=null;remake=null;remakeView=null;remakePressed.clear();remakeMenu=false;element('outcome').hidden=true;element('stage').classList.remove('battle-over');audio?.stop();input.clear();clock.reset();}
function goMenu(){cancelLoad();closeBattle();scene='menu';sceneKey='';selection=Math.min(selection,menuRecords().length-1);}
function openTheater(){cancelLoad();closeBattle();theater=new TheaterState(reducedMotion());scene='theater';sceneKey='';input.clear();}
function showError(cause:unknown){loading.hidden=true;busy=false;element('error-text').textContent=cause instanceof Error?cause.message:String(cause);error.hidden=false;}
async function openChapter(next:number){
 if(busy)return;chapter=next;selection=0;failedChapter=null;error.hidden=true;
 if(publicMode){scene='menu';sceneKey='';return;}
 busy=true;loading.hidden=false;loading.textContent='* LOADING CHAPTER '+next+'...';const token=++sessionToken;
 try{await assets.preload(next);if(token!==sessionToken)return;scene='menu';sceneKey='';}
 catch(e){if(token===sessionToken){failedChapter=next;showError(e);}}
 finally{if(token===sessionToken){busy=false;loading.hidden=true;input.clear();clock.reset();}}
}
function renderRemakeFrame(){if(!remake)return;remakeCtx.imageSmoothingEnabled=false;remakeCtx.fillStyle='#000';remakeCtx.fillRect(0,0,640,480);if(remake instanceof EngineBattle&&remake.id==='ch1-25')remakeView?.background();remake.rt.draw();}
async function launchRemake(record:EncounterRecord,loadout:Loadout){
 const encounter=playableEncounter(record.id);if(!encounter)throw Error('This encounter is still in development. Your preparation is saved.');
 if(busy)return;busy=true;error.hidden=true;loading.hidden=false;loading.textContent='* CONNECTING '+record.name.toUpperCase()+'...';const token=++sessionToken;
 const pattern=Number(element<HTMLSelectElement>('attack-select').value)||0;
 const controller=new AbortController();remakeLoad?.abort();remakeLoad=controller;
 try{const remakeAssets=remakeCache.get(record.chapter)??await loadRemakeAssets(record.chapter);if(token!==sessionToken)return;remakeCache.set(record.chapter,remakeAssets);await audio.prepareEffects(remakeAssets.sounds,controller.signal);const neoHost=record.id==='ch2-61'?(await import('./remake/host/neo')).installNeoHost:undefined;if(token!==sessionToken)return;closeBattle();setSourceText(remakeAssets.text);publicLoadout=structuredClone(loadout);
  // The game calls randomize() when it starts: every battle gets its own random seed (tests and comparisons fix it).
  // ?seed=N repeats a run exactly (comparisons with the original's recordings).
  const fixedSeed=new URLSearchParams(location.search).get('seed'),seed=fixedSeed!==null?Number(fixedSeed)>>>0:crypto.getRandomValues(new Uint32Array(1))[0];
  remake=publicPractice?createJevilPractice(remakeAssets.bank,equipment!.chapters[1],loadout,pattern,seed):new EngineBattle(remakeAssets.bank,equipment!.chapters[record.chapter],loadout,record.id,seed,{development:devUnlock,neoHost});{const gfx=new CanvasGraphics(remakeCtx,remakeAssets.draw,remake.rt.view);remake.rt.gfx=gfx;setHudMeasure(text=>gfx.textWidth('fnt_mainbig',text));}remakePressed.clear();
  remakeView=new BattleView(remakeCtx,remakeAssets.draw);remakeMenu=false;
  remake.rt.sound=(name,pitch,restart)=>audio.sourceEffect(name,pitch,restart);remake.rt.soundLoop=name=>audio.sourceLoop(name);remake.rt.soundStop=handle=>audio.sourceStop(handle);remake.rt.soundPitch=(handle,pitch)=>audio.sourcePitch(handle,pitch);remake.rt.stopAllSounds=()=>audio.stop();
  remake.rt.sourceAudio={effect:(name,pitch,volume)=>audio.sourceEffect(name,pitch,false,volume),volume:(handle,value,frames)=>audio.sourceVolume(handle,value,frames),free:handle=>audio.sourceFree(handle),music:name=>{audio.play(name);return name;},loop:handle=>audio.sourceSetLoop(handle),pause:handle=>audio.sourceTrackPause(handle),resume:handle=>audio.sourceTrackResume(handle),position:(handle,seconds)=>audio.sourcePosition(handle,seconds),playing:handle=>audio.sourcePlaying(handle)};
  remake.rt.globals.onChapter2TensionItemSound=(name:string,pitch:number,volume:number)=>audio.sourceEffect(name,pitch,false,volume);
  renderRemakeFrame();remakeTick=0;scene='remake';sceneKey='';audio.play(encounter.music);
 }catch(e){if(token===sessionToken)throw e;}finally{if(remakeLoad===controller)remakeLoad=null;if(token===sessionToken){busy=false;loading.hidden=true;input.clear();clock.reset();}}
}
async function launchNative(record:EncounterRecord,ini:string){
 if(busy)throw Error('Another battle is loading.');busy=true;error.hidden=true;loading.hidden=false;loading.textContent='* '+record.name.toUpperCase()+' / LOADING ORIGINAL ENGINE...';const token=++sessionToken;
 closeBattle();const frame=new NativeBattle(element('stage'),onNativeEvent);native=frame;nativeRecord=record;
 try{await frame.start(record.id,ini);}
 catch(e){if(native===frame)closeBattle();if(token!==sessionToken)return;busy=false;loading.hidden=true;throw e;}
 if(token!==sessionToken||native!==frame)return;
 busy=false;loading.hidden=true;scene='native';sceneKey='';frame.mute(prefs.muted);frame.focus();
}
function onNativeEvent(event:NativeEvent){
 if(event.type==='diagnostic'){console.debug('[native]',event.message);return;}
 if(event.type==='paused')sceneKey='';
 if(event.type==='outcome'&&scene==='native'&&nativeRecord){
  const record=nativeRecord,won=event.outcome==='victory';
  if(won&&!prefs.completed.includes(record.id)){prefs.completed.push(record.id);savePrefs(storage,prefs);}
  // Let the original victory text or game-over screen play before offering the way back.
  setTimeout(()=>{if(nativeRecord!==record)return;element('outcome-text').textContent=won?`* ${record.name} was defeated.`:'* The party fell.';element('outcome').hidden=false;element('stage').classList.add('battle-over');},won?1500:3000);
 }
 if(scene==='native'&&(event.type==='ended'||event.type==='failed'))showError(event.type==='ended'?'* The original battle engine stopped. RETRY prepares the battle again; DEVICE_MENU returns to the menu.':event.message??'The original battle stopped.');
}
async function startBattle(practice=false){
 const record=menuRecords()[selection];if(!record||busy)return;
 const encounter=playableEncounter(record.id);if(practice&&!encounter?.practice)return;publicPractice=practice;
 // Installed original battles remain the local full-battle path. Practice always uses the faithful source port.
 if(!publicMode&&!practice&&nativeIds.has(record.id)){
  if(prep&&equipment?.chapters[record.chapter])prep.open(record);
  else void launchNative(record,'').catch(showError);
  return;
 }
 const playable=!!encounter;
 if(prep&&equipment?.chapters[record.chapter])prep.open(record,{practiceOnly:practice,available:playable,launchLabel:playable?practice?'START PRACTICE':'START BATTLE':'IN DEVELOPMENT',notice:playable?practice?'Single attack practice. Use START BATTLE from the encounter list for commands and continuous turns.':'Browser battle: commands, equipment stats and usable bag items. Visuals, sounds and special equipment effects are still being compared with the game.':publicMode?'Browse equipment and save your loadout. This encounter is not playable in the public demo yet.':'Browse equipment and save your loadout. A source battle for this encounter is still in development; the local original engine is unavailable.'});
 else showError('Equipment could not load. Please retry.');
}
function addHitbox(name:string,x:number,y:number,w:number,h:number,run:()=>void){const button=document.createElement('button');button.className='hitbox';button.setAttribute('aria-label',name);button.style.cssText=`left:${x/6.4}%;top:${y/4.8}%;width:${w/6.4}%;height:${h/4.8}%`;button.addEventListener('click',()=>{audio.unlock();run();sceneKey='';});overlay.append(button);}
function updateControls(){
 const engineBattle=remake instanceof EngineBattle?remake:null;
 const key=[scene,theater?.active,theater?.selected,chapter,selection,native?.paused,remake?.paused,remake?.outcome,engineBattle?.phase,engineBattle?.turn,busy].join(':');
 if(key===sceneKey)return;sceneKey=key;if(scene!=='menu')overlay.replaceChildren();element('menu-tools').hidden=scene!=='menu';element('pause').hidden=scene!=='native'&&scene!=='remake';element('back').hidden=scene==='theater';
 if(scene==='native'&&nativeRecord)status.textContent=`${nativeRecord.name} / ORIGINAL ENGINE${native?.paused?' / paused':''}`;
 element('controls-hint').textContent=scene==='native'?'ARROWS · Z / ENTER CONFIRM · X / SHIFT CANCEL · P PAUSE':'ARROWS / WASD · Z CONFIRM · X BACK · R RESTART · P PAUSE';
 element('adaptation').textContent=scene==='native'?'FAN PROJECT · ORIGINAL GAME CODE':'FAN PROJECT · SOURCE PORT';
 if(publicMode)element('adaptation').textContent='FAN PROJECT · PUBLIC DEMO';
 if(scene==='remake'&&remake){status.textContent=engineBattle?`${engineBattle.name} / ${engineBattle.paused?'paused':engineBattle.phase} / TURN ${engineBattle.turn+1}`:`JEVIL / ${remake.paused?'paused':remake.outcome??JEVIL_PATTERNS[(remake as JevilPractice).pattern].name} / PRACTICE`;element('controls-hint').textContent='ARROWS / WASD · Z / ENTER CONFIRM · X BACK / SLOW · R RESTART · P PAUSE';
 }
 if(scene==='theater'){
  const t=theater,H=THEATER_HITS;status.textContent=t.active==='undertale'?'UNDERTALE / COMING SOON':t.active==='deltarune'?'DELTARUNE / SIGNAL':'THEATER';
  addHitbox('UNDERTALE remote',H.undertale.x,H.undertale.y,H.undertale.w,H.undertale.h,()=>t.press('undertale'));
  addHitbox('DELTARUNE remote',H.deltarune.x,H.deltarune.y,H.deltarune.w,H.deltarune.h,()=>t.press('deltarune'));
  addHitbox(t.active==='deltarune'?'Connect DELTARUNE':'Television',H.tv.x,H.tv.y,H.tv.w,H.tv.h,()=>t.press(t.active??t.selected));
 }
 if(scene==='intro'){addHitbox('Connect device',70,60,500,360,()=>{scene='room';});status.textContent='LOCAL SIGNAL';}
 if(scene==='room'){
  for(let i=1;i<=5;i++)addHitbox('Chapter '+i,175,112+(i-1)*32,270,31,()=>void openChapter(i));status.textContent='DEVICE_MENU';
 }
 if(scene==='menu'){
  const rows=menuRecords();if(bossDeck){if(!overlay.contains(bossDeck.element))overlay.replaceChildren(bossDeck.element);bossDeck.update(rows,selection,chapter,prefs.completed,id=>publicMode?!!playableEncounter(id):nativeIds.has(id)||!!playableEncounter(id),index=>{selection=index;sceneKey='';},()=>{audio.unlock();void startBattle(false);});}
  const select=element<HTMLSelectElement>('attack-select'),previous=select.value;select.replaceChildren();for(const [i,a]of JEVIL_PATTERNS.entries()){const opt=document.createElement('option');opt.value=String(i);opt.textContent=a.name;select.append(opt);}select.value=previous||'0';
  select.disabled=!playableEncounter(rows[selection].id)?.practice;element<HTMLButtonElement>('practice').disabled=select.disabled;
  status.textContent=`CHAPTER ${chapter} / ${rows.length} ENCOUNTERS${publicMode?' / '+availabilityLabel(chapter):''}`;
  element('controls-hint').textContent='LEFT / RIGHT · CHANGE CARD · Z PREPARE · X CHAPTERS';
 }
}
function step(){
 frame++;if(busy)return;if(document.querySelector('dialog[open]')){input.clear();return;}const keys=input.read();
 if(scene==='theater'){if(theater.step(keys)==='enter-deltarune'){audio.unlock();scene='intro';sceneKey='';}}
 else if(scene==='intro'&&keys.confirm){audio.unlock();scene='room';sceneKey='';}
 else if(scene==='intro'&&keys.cancel){openTheater();}
 else if(scene==='room'){
  if(frame-keyCooldown>10&&(keys.y||keys.x)){chapter=(chapter-1+(keys.y||keys.x)+5)%5+1;keyCooldown=frame;sceneKey='';}
  if(keys.confirm)void openChapter(chapter);
  if(keys.cancel){scene='intro';sceneKey='';}
 }else if(scene==='menu'){
  const rows=menuRecords(),edge=keys.arrows?.find(k=>['left','right','up','down'].includes(k));
  const direction=edge?(['left','up'].includes(edge)?-1:1):keys.x||keys.y;
  if(direction&&(edge||frame-keyCooldown>9)){selection=(selection+direction+rows.length)%rows.length;keyCooldown=frame;sceneKey='';}
  if(keys.confirm)void startBattle();if(keys.cancel){scene='room';sceneKey='';}
 }else if(scene==='remake'&&remake){
  if(keys.cancel&&(remake.paused||remake.outcome)){goMenu();return;}
  if(keys.pause){remake.paused=!remake.paused;audio.pause(remake.paused);sceneKey='';}
  if(keys.restart&&publicLoadout){void launchRemake(menuRecords()[selection],publicLoadout).catch(showError);return;}
  const held=remake.rt.input.held;held.clear();if(keys.x<0)held.add(KEY.left);if(keys.x>0)held.add(KEY.right);if(keys.y<0)held.add(KEY.up);if(keys.y>0)held.add(KEY.down);if(keys.slow)held.add(KEY.shift);
  if(remake.paused){remakeMenu=false;remakePressed.clear();}else{remakeMenu||=keys.menu;
   if(keys.confirm)remakePressed.add(KEY.z);if(keys.cancel)remakePressed.add(KEY.x);if(keys.menu)remakePressed.add(KEY.c);for(const a of keys.arrows??[])remakePressed.add(KEY[a]);}
  if(!remake.paused&&!remake.outcome&&++remakeTick%2===0){
   if(remake instanceof EngineBattle){if(keys.shoot)held.add(KEY.z);for(const k of remakePressed)remake.rt.input.pressed.add(k);remakePressed.clear();remakeMenu=false;}
   // C reaches the game code as a key press on its next frame (button3_p), as the original reads it.
   if(remakeMenu)remake.rt.input.pressed.add(KEY.c);
   remakeMenu=false;remake.step();renderRemakeFrame();
   if(remake.outcome){element('outcome-text').textContent=remake.outcome==='survived'?'* Pattern survived.':remake.outcome==='victory'?'* YOU WON!':'* The party fell.';element('outcome-again').textContent=remake instanceof EngineBattle?'BATTLE AGAIN':'PRACTICE AGAIN';element('outcome').hidden=false;audio.pause(true);if(remake.outcome==='victory'&&!prefs.completed.includes(menuRecords()[selection].id)){prefs.completed.push(menuRecords()[selection].id);savePrefs(storage,prefs);}}
  }
 }
 updateControls();
}
function loop(time:number){
 const dt=last?(time-last)/1000:0;last=time;clock.advance(dt,step);
 if(renderer){if(scene==='theater'&&theaterView)theaterView.draw(ctx,theater);else if(scene==='intro')renderer.intro(frame);else if(scene==='room')renderer.room(chapter,catalog.length);else if(scene==='menu')renderer.clear();else if(scene==='remake'&&remake){
  ctx.drawImage(remakeCanvas,0,0);if(!(remake instanceof EngineBattle)){assets.text(ctx,'JEVIL / ATTACK PRACTICE',320,12,1,'#b899ff','center');assets.text(ctx,JEVIL_PATTERNS[remake.pattern].name.toUpperCase(),320,306,1,'#c5bed2','center');
   const g=remake.rt.globals;for(let i=0;i<3;i++){const x=25+i*205;assets.text(ctx,['KRIS','SUSIE','RALSEI'][i],x,359,1,['#69bcff','#f68bd6','#82e4a3'][i]);assets.text(ctx,`HP ${Math.max(0,g.hp[i+1])} / ${g.maxhp[i+1]}`,x,385,1);assets.text(ctx,`DF ${g.battledf[i]}`,x,410,1,'#a7a0b5');}assets.text(ctx,`TP ${Math.floor(g.tension)}%`,320,442,1,'#ffb05e','center');
  }if(remake.paused){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,640,480);assets.text(ctx,'PAUSED',320,158,3,'#ffff00','center');}
 }}
 raf=requestAnimationFrame(loop);
}
input.bind(window,()=>{if(remake)remake.paused=true;audio?.pause(true);clock.reset();sceneKey='';});
document.addEventListener('visibilitychange',()=>{input.clear();clock.reset();last=0;if(document.hidden){if(remake)remake.paused=true;audio?.pause(true);sceneKey='';}});
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||element<HTMLDialogElement>('about').open||(e.target instanceof HTMLElement&&e.target.closest('select,input,textarea,[contenteditable]')))return;audio?.unlock();if(e.key.toLowerCase()==='t'&&scene==='menu'){e.preventDefault();void startBattle(true);}});
window.addEventListener('pointerdown',()=>audio?.unlock(),{passive:true});
// When focus is on the page (header buttons, after a dialog) keys still reach the original battle.
const forwardNativeKey=(down:boolean)=>(e:KeyboardEvent)=>{if(scene!=='native'||!native||e.ctrlKey||e.metaKey||e.altKey||document.querySelector('dialog[open]')||(down&&e.repeat))return;if(native.key(e.key,down))e.preventDefault();};
window.addEventListener('keydown',forwardNativeKey(true));window.addEventListener('keyup',forwardNativeKey(false));
element('back').addEventListener('click',()=>{if(scene==='native'||scene==='remake'||native||remakeLoad)goMenu();else if(scene==='intro')openTheater();else{cancelLoad();scene='room';sceneKey='';input.clear();}});
element('pause').addEventListener('click',()=>{if(remake){remake.paused=!remake.paused;audio.pause(remake.paused);sceneKey='';}else if(native){const resuming=native.paused;native.pause(!resuming);if(resuming)native.focus();}});
element('mute').addEventListener('click',()=>{prefs.muted=!prefs.muted;audio?.setMuted(prefs.muted);native?.mute(prefs.muted);updatePreferences();});
element('effects').addEventListener('click',()=>{prefs.reducedEffects=!prefs.reducedEffects;updatePreferences();});
element('practice').addEventListener('click',()=>void startBattle(true));
const dialog=element<HTMLDialogElement>('about');function about(){if(remake){remake.paused=true;audio.pause(true);}native?.pause(true);input.clear();const available=availableEncounters(1).map(encounter=>encounter.name).join(', ');element('source-summary').textContent=publicMode?`Public demo: theater, equipment preparation and ${available} battles, plus separate Jevil attack practice. More encounters are in development.`:`${catalog.length} encounters from 5 chapter packages. Available source battles: ${available}. Installed original battles stay on this computer.`;element('difference-note').textContent=native?'This battle runs the original game code from your DELTARUNE install on the open-source Butterscotch engine; no attack was rewritten. Every encounter is checked to load and reach combat.':'Browser battles and Jevil practice run source-ported GameMaker objects. Commands, attack selection and numerical rules come from the game; complete visual, sound and equipment-ability parity is still being verified. Encounters without an available source port remain in development.';dialog.showModal();sceneKey='';}
element('credits').addEventListener('click',about);element('adaptation').addEventListener('click',about);element('close-about').addEventListener('click',()=>dialog.close());
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-key]')){
 const key=button.dataset.key!;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);button.classList.add('down');if(scene==='native'&&native)native.key(key,true);else input.press(key);});
 const release=()=>{button.classList.remove('down');native?.key(key,false);input.release(key);};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
}
element('outcome-menu').addEventListener('click',goMenu);
// The banner stays until a new battle actually launches (closeBattle), so dismissing preparation keeps a way back.
element('outcome-again').addEventListener('click',()=>{if(remake&&publicLoadout)void launchRemake(menuRecords()[selection],publicLoadout).catch(showError);else void startBattle(false);});
element('retry').addEventListener('click',()=>{error.hidden=true;if(failedChapter!==null)void openChapter(failedChapter);else if(renderer&&equipment)void startBattle(false);else void initialize();});
async function initialize(){
 loading.hidden=false;error.hidden=true;try{
  assets=await loadAssets();await assets.preload(1);
  // Native is optional. Without a profile, only available source ports can launch a battle.
  const [catalogJson,ids]=await Promise.all([fetch(assetUrl('/generated/equipment.json')).then(r=>r.ok?r.json() as Promise<EquipmentCatalog>:null).catch(()=>null),publicMode?Promise.resolve(new Set<string>()):fetchNativeProfiles()]);
  equipment=catalogJson;nativeIds=ids;
  if(!equipment?.chapters[1])throw Error('Equipment could not load. Please retry.');
  if(publicMode)await Promise.all([2,3,4,5].map(chapter=>assets.preload(chapter)));
  if(equipment&&!prep){const source=equipment;prep=new PreparationPanel(source,assets,storage,(record,loadout)=>!publicMode&&!publicPractice&&nativeIds.has(record.id)?launchNative(record,loadoutIni(loadout,source.chapters[record.chapter])):launchRemake(record,loadout),()=>{input.clear();if(native)setTimeout(()=>native?.focus());});}
  // Optional local reference art for the device room; the drawn room is used when it is absent.
  if(!publicMode)await Promise.all(['bg','console','tvglow','vessel_d_0'].map(n=>assets.loadImage('/device-room/'+n+'.png').catch(()=>null)));
  theaterView=new TheaterView(assets);await Promise.all(theaterView.urls().map(u=>assets.loadImage(u).catch(()=>null)));
  renderer=new Renderer(ctx,assets,publicMode);bossDeck=new BossDeck(assets);audio=new AudioManager(prefs.muted,assets.manifest.music);if(publicMode){document.querySelector('.brand .dim')!.textContent='/ DEMO';dialog.querySelector('p')!.textContent='DELTARUNE browser boss battles, with a theater intro and equipment preparation.';}updatePreferences();loading.hidden=true;updateControls();if(!raf)raf=requestAnimationFrame(loop);
 }catch(e){showError(e);}
}
void initialize();
