import './style.css';
import {loadAssets,AssetStore} from './game/assets';
import {Renderer} from './game/renderer';
import {Input} from './game/input';
import {FixedClock} from './game/clock';
import {BattleSession,COMMANDS} from './game/battle';
import {ActionSession} from './game/action';
import {catalog,getDefinition} from './bosses/registry';
import {AudioManager} from './game/audio';
import {loadPrefs,savePrefs,browserStore} from './game/storage';
import {NativeBattle,fetchNativeProfiles,type NativeEvent} from './game/native';
import {PreparationPanel} from './ui/preparation';
import {loadoutIni,type EquipmentCatalog,type Loadout} from './game/loadout';
import {assetUrl} from './game/url';
import {loadRemakeAssets} from './remake/host/assets';
import {createJevilPractice,JEVIL_PATTERNS,type JevilPractice} from './remake/host/practice';
import {SourceBattle} from './remake/host/battle';
import {sourceEncounter,developmentEncounter,availabilityLabel} from './remake/host/encounters';
// Local dev server only: ?dev=1 also opens ported encounters that are not public yet. Production builds drop this.
const devUnlock=import.meta.env.DEV&&new URLSearchParams(location.search).has('dev');
const playableEncounter=(id:string)=>devUnlock?developmentEncounter(id):sourceEncounter(id);
import {BattleView} from './remake/host/view';
import {CanvasGraphics} from './remake/host/canvas';
import {KEY} from './remake/deltarune/battle';
import type {EncounterRecord} from './game/types';
import {TheaterState,TheaterView,THEATER_HITS} from './game/theater';
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id)! as T;
const canvas=element<HTMLCanvasElement>('screen'),ctx=canvas.getContext('2d')!;
const overlay=element('interactions'),status=element('status'),loading=element('loading'),error=element('error');
const input=new Input(),clock=new FixedClock(),storage=browserStore(),prefs=loadPrefs(storage);
const publicMode=import.meta.env.MODE==='pages'||new URLSearchParams(location.search).has('demo');
let remake:JevilPractice|SourceBattle|null=null,remakeAssets:Awaited<ReturnType<typeof loadRemakeAssets>>|null=null,publicLoadout:Loadout|null=null,remakeTick=0,publicPractice=false,remakeView:BattleView|null=null;
let remakeConfirm=false,remakeCancel=false,remakeMenu=false,remakeMoveCooldown=0;
const remakeCanvas=document.createElement('canvas');remakeCanvas.width=640;remakeCanvas.height=480;const remakeCtx=remakeCanvas.getContext('2d')!;
let assets:AssetStore,renderer:Renderer,audio:AudioManager,battle:BattleSession|null=null;
// Original-bytecode battles run in an iframe; `battle` stays the browser adaptation (practice and unsupported encounters).
let native:NativeBattle|null=null,nativeRecord:EncounterRecord|null=null,nativeIds=new Set<string>(),equipment:EquipmentCatalog|null=null,prep:PreparationPanel|null=null;
// The theater opens the app; choosing DELTARUNE leads to the device intro.
const reducedMotion=()=>prefs.reducedEffects||matchMedia('(prefers-reduced-motion: reduce)').matches;
let theater=new TheaterState(reducedMotion()),theaterView:TheaterView|null=null;
let scene:'theater'|'intro'|'room'|'menu'|'battle'|'native'|'remake'='theater',chapter=1,selection=0,frame=0,last=0,raf=0,busy=false,sceneKey='',keyCooldown=0,sessionToken=0,victoryRecorded=false;
let remakeLoad:AbortController|null=null;
const empty={x:0,y:0,confirm:false,cancel:false,menu:false,restart:false,pause:false,slow:false,shoot:false};
const menuRecords=()=>catalog.filter(r=>r.chapter===chapter);
function updatePreferences(){document.body.classList.toggle('reduced',prefs.reducedEffects);element('mute').textContent=prefs.muted?'SOUND OFF':'SOUND ON';element('mute').setAttribute('aria-pressed',String(prefs.muted));element('effects').textContent=prefs.reducedEffects?'CRT OFF':'CRT ON';element('effects').setAttribute('aria-pressed',String(prefs.reducedEffects));savePrefs(storage,prefs);}
function closeBattle(){battle?.dispose();battle=null;native?.dispose();native=null;nativeRecord=null;remake=null;element('outcome').hidden=true;element('stage').classList.remove('battle-over');audio?.stop();input.clear();clock.reset();victoryRecorded=false;}
function goMenu(){sessionToken++;loading.hidden=true;busy=false;closeBattle();scene='menu';sceneKey='';selection=Math.min(selection,menuRecords().length-1);}
function openTheater(){sessionToken++;closeBattle();theater=new TheaterState(reducedMotion());scene='theater';sceneKey='';input.clear();}
function showError(cause:unknown){loading.hidden=true;busy=false;element('error-text').textContent=cause instanceof Error?cause.message:String(cause);error.hidden=false;}
function renderRemakeFrame(){if(!remake)return;remakeCtx.imageSmoothingEnabled=false;remakeCtx.fillStyle='#000';remakeCtx.fillRect(0,0,640,480);if(remake instanceof SourceBattle)remakeView?.background(remake);remake.rt.draw();if(remake instanceof SourceBattle)remakeView?.draw(remake);}
async function launchRemake(record:EncounterRecord,loadout:Loadout){
 const encounter=playableEncounter(record.id);if(!encounter)throw Error('This encounter is still in development. Your preparation is saved.');
 if(busy)return;busy=true;error.hidden=true;loading.hidden=false;loading.textContent='* CONNECTING '+record.name.toUpperCase()+'...';const token=++sessionToken;
 const pattern=Number(element<HTMLSelectElement>('attack-select').value)||0;
 const controller=new AbortController();remakeLoad?.abort();remakeLoad=controller;
 try{remakeAssets??=await loadRemakeAssets();if(token!==sessionToken)return;await audio.prepareEffects(remakeAssets.sounds,controller.signal);if(token!==sessionToken)return;closeBattle();publicLoadout=structuredClone(loadout);
  remake=publicPractice?createJevilPractice(remakeAssets.bank,equipment!.chapters[1],loadout,pattern):new SourceBattle(remakeAssets.bank,equipment!.chapters[1],loadout,record.id,11,{development:devUnlock});remake.rt.gfx=new CanvasGraphics(remakeCtx,remakeAssets.draw,remake.rt.view);
  remakeView=new BattleView(remakeCtx,assets,remakeAssets.draw);remakeConfirm=false;remakeCancel=false;remakeMoveCooldown=0;
  remake.rt.sound=(name,pitch,restart)=>audio.sourceEffect(name,pitch,restart);remake.rt.soundLoop=name=>audio.sourceLoop(name);remake.rt.soundStop=handle=>audio.sourceStop(handle);remake.rt.soundPitch=(handle,pitch)=>audio.sourcePitch(handle,pitch);remake.rt.stopAllSounds=()=>audio.stop();renderRemakeFrame();remakeTick=0;scene='remake';sceneKey='';audio.play(encounter.music);
 }catch(e){if(token===sessionToken)throw e;}finally{if(remakeLoad===controller)remakeLoad=null;if(token===sessionToken){busy=false;loading.hidden=true;input.clear();clock.reset();}}
}
async function launchNative(record:EncounterRecord,ini:string){
 if(busy)throw Error('Another battle is loading.');busy=true;error.hidden=true;loading.hidden=false;loading.textContent='* '+record.name.toUpperCase()+' / LOADING ORIGINAL ENGINE...';const token=++sessionToken;
 closeBattle();const frame=new NativeBattle(element('stage'),onNativeEvent);native=frame;nativeRecord=record;
 try{await frame.start(record.id,ini);}
 catch(e){if(native===frame)closeBattle();if(token===sessionToken){busy=false;loading.hidden=true;}throw e;}
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
 if(publicMode){const encounter=playableEncounter(record.id);publicPractice=practice&&!!encounter?.practice;const playable=!!encounter;if(prep)prep.open(record,{practiceOnly:publicPractice,available:playable,launchLabel:playable?publicPractice?'START PRACTICE':'START BATTLE':'IN DEVELOPMENT',notice:playable?publicPractice?'Single attack practice. Use START BATTLE from the encounter list for commands and continuous turns.':'Browser battle: commands, equipment stats and usable bag items. Visuals, sounds and special equipment effects are still being compared with the game.':'Browse equipment and save your loadout. This encounter is not playable in the public demo yet.'});else showError('Equipment could not load. Please retry.');return;}
 // Full battles use the original game code; the adaptation remains for practice and encounters without a native launcher.
 if(!practice&&nativeIds.has(record.id)){
  if(prep&&equipment?.chapters[record.chapter])prep.open(record);
  else void launchNative(record,'').catch(showError);
  return;
 }
 busy=true;error.hidden=true;loading.hidden=false;loading.textContent='* CONNECTING '+record.name.toUpperCase()+'...';const token=++sessionToken;
 try{await assets.preload(chapter);if(token!==sessionToken)return;const definition=getDefinition(record);const selected=Number(element<HTMLSelectElement>('attack-select').value)||0;closeBattle();battle=definition.special?new ActionSession(definition,20261005,practice,selected):new BattleSession(definition,20261005,practice,selected);scene='battle';sceneKey='';audio.play(definition.music);victoryRecorded=false;}
 catch(e){if(token===sessionToken)showError(e);return;}
 if(token===sessionToken){busy=false;loading.hidden=true;input.clear();clock.reset();}
}
function addHitbox(name:string,x:number,y:number,w:number,h:number,run:()=>void){const button=document.createElement('button');button.className='hitbox';button.setAttribute('aria-label',name);button.style.cssText=`left:${x/6.4}%;top:${y/4.8}%;width:${w/6.4}%;height:${h/4.8}%`;button.addEventListener('click',()=>{audio.unlock();run();sceneKey='';});overlay.append(button);}
function updateControls(){
 const sourceBattle=remake instanceof SourceBattle?remake:null;
 const key=[scene,theater?.active,theater?.selected,chapter,selection,battle?.phase,battle?.actor,battle?.cursor,battle?.paused,native?.paused,remake?.paused,remake?.outcome,sourceBattle?.phase,sourceBattle?.actor,sourceBattle?.cursor,sourceBattle?.turn,busy].join(':');
 if(key===sceneKey)return;sceneKey=key;overlay.replaceChildren();element('menu-tools').hidden=scene!=='menu';element('pause').hidden=scene!=='battle'&&scene!=='native'&&scene!=='remake';element('back').hidden=scene==='theater';
 if(scene==='native'&&nativeRecord)status.textContent=`${nativeRecord.name} / ORIGINAL ENGINE${native?.paused?' / paused':''}`;
 element('controls-hint').textContent=scene==='native'?'ARROWS · Z / ENTER CONFIRM · X / SHIFT CANCEL · P PAUSE':'ARROWS / WASD · Z CONFIRM · X BACK · R RESTART · P PAUSE';
 element('adaptation').textContent=scene==='native'?'FAN PROJECT · ORIGINAL GAME CODE':'FAN PROJECT · BROWSER ADAPTATION';
 if(publicMode)element('adaptation').textContent='FAN PROJECT · PUBLIC DEMO';
 if(scene==='remake'&&remake){status.textContent=sourceBattle?`${sourceBattle.name} / ${sourceBattle.paused?'paused':sourceBattle.phase} / TURN ${sourceBattle.turn+1}`:`JEVIL / ${remake.paused?'paused':remake.outcome??JEVIL_PATTERNS[remake.pattern].name} / PRACTICE`;element('controls-hint').textContent='ARROWS / WASD · Z / ENTER CONFIRM · X BACK / SLOW · R RESTART · P PAUSE';
  if(sourceBattle&&!sourceBattle.paused&&!sourceBattle.outcome){
   if(sourceBattle.phase==='command'){const chunk=sourceBattle.party.length===3?sourceBattle.actor*212:106+sourceBattle.actor*220;sourceBattle.choices.forEach((choice,i)=>{if(!choice.disabled)addHitbox(choice.name,chunk+15+i*35,330,33,31,()=>sourceBattle.select(i));});}
   else if(sourceBattle.choices.length){const start=Math.floor(sourceBattle.cursor/6)*6;sourceBattle.choices.slice(start,start+6).forEach((choice,i)=>{if(!choice.disabled)addHitbox(choice.name,25+(i%2)*290,371+Math.floor(i/2)*30,265,28,()=>sourceBattle.select(start+i));});addHitbox('Back to commands',550,454,80,22,()=>sourceBattle.cancel());if(sourceBattle.choices.length>6){addHitbox('Previous choices',25,454,90,22,()=>sourceBattle.cursor=Math.max(0,start-6));addHitbox('Next choices',130,454,90,22,()=>sourceBattle.cursor=start+6<sourceBattle.choices.length?start+6:0);}}
   else if(['message','enemyTalk','timing'].includes(sourceBattle.phase))addHitbox(sourceBattle.phase==='timing'?'Strike now':'Continue',20,367,600,108,()=>sourceBattle.confirm());
  }
 }
 if(scene==='theater'){
  const t=theater,H=THEATER_HITS;status.textContent=t.active==='undertale'?'UNDERTALE / COMING SOON':t.active==='deltarune'?'DELTARUNE / SIGNAL':'THEATER';
  addHitbox('UNDERTALE remote',H.undertale.x,H.undertale.y,H.undertale.w,H.undertale.h,()=>t.press('undertale'));
  addHitbox('DELTARUNE remote',H.deltarune.x,H.deltarune.y,H.deltarune.w,H.deltarune.h,()=>t.press('deltarune'));
  addHitbox(t.active==='deltarune'?'Connect DELTARUNE':'Television',H.tv.x,H.tv.y,H.tv.w,H.tv.h,()=>t.press(t.active??t.selected));
 }
 if(scene==='intro'){addHitbox('Connect device',70,60,500,360,()=>{scene='room';});status.textContent='LOCAL SIGNAL';}
 if(scene==='room'){
  for(let i=1;i<=5;i++)addHitbox('Chapter '+i,175,112+(i-1)*32,270,31,()=>{chapter=i;selection=0;scene='menu';});status.textContent='DEVICE_MENU';
 }
 if(scene==='menu'){
  const rows=menuRecords(),start=Math.floor(selection/8)*8;for(let i=0;i<8;i++){const record=rows[start+i];if(record)addHitbox(`Battle ${record.name} ${record.id}`,30,104+i*35,345,31,()=>{selection=start+i;void startBattle(false);});}
  if(rows.length>8){addHitbox('Previous encounters',410,402,84,27,()=>{selection=start===0?Math.floor((rows.length-1)/8)*8:start-8;});addHitbox('Next encounters',510,402,94,27,()=>{selection=start+8>=rows.length?0:start+8;});}
  const select=element<HTMLSelectElement>('attack-select');select.replaceChildren();for(const [i,a]of (publicMode?JEVIL_PATTERNS:getDefinition(rows[selection]).attacks).entries()){const opt=document.createElement('option');opt.value=String(i);opt.textContent=a.name;select.append(opt);}
  select.disabled=publicMode&&!sourceEncounter(rows[selection].id)?.practice;element<HTMLButtonElement>('practice').disabled=select.disabled;
  status.textContent=`CHAPTER ${chapter} / ${rows.length} ENCOUNTERS${publicMode?' / '+availabilityLabel(chapter):''}`;
 }
 if(scene==='battle'&&battle){
  const b=battle;status.textContent=`${b.definition.record.name} / ${b.paused?'paused':b.phase} / TURN ${b.turn+1}`;
  if(b.paused)return;
  if(b.phase==='command')for(let i=0;i<COMMANDS.length;i++)addHitbox(COMMANDS[i],18+i*102,439,95,29,()=>b.selectCommand(i));
  if(b.phase==='target'){let row=0;for(let i=0;i<b.enemies.length;i++){const e=b.enemies[i];if(e.hp<=0)continue;const index=row++;addHitbox('Target '+e.record.name+' '+i,35+(index%2)*285,307+Math.floor(index/2)*31,270,31,()=>{b.cursor=index;b.step({...empty,confirm:true});});}}
  if(['act','item','magic'].includes(b.phase)){
   const names=b.phase==='act'?b.actNames:b.phase==='item'?b.items.map(i=>i.name):b.magicChoices().map(i=>i.name),start=Math.floor(b.cursor/4)*4;
   for(let i=0;i<4;i++){const name=names[start+i];if(name)addHitbox(name,35+(i%2)*285,307+Math.floor(i/2)*31,270,31,()=>{b.cursor=start+i;b.step({...empty,confirm:true});});}
  }
  if(b.phase==='timing'||b.phase==='message')addHitbox(b.phase==='timing'?'Strike now':'Continue',24,305,590,69,()=>b.step({...empty,confirm:true}));
  if(b.phase==='victory'||b.phase==='defeat')addHitbox('Return to device menu',120,322,400,53,goMenu);
 }
}
function step(){
 frame++;if(busy)return;if(document.querySelector('dialog[open]')){input.clear();return;}const keys=input.read();
 if(scene==='theater'){if(theater.step(keys)==='enter-deltarune'){audio.unlock();scene='intro';sceneKey='';}}
 else if(scene==='intro'&&keys.confirm){audio.unlock();scene='room';sceneKey='';}
 else if(scene==='intro'&&keys.cancel){openTheater();}
 else if(scene==='room'){
  if(frame-keyCooldown>10&&(keys.y||keys.x)){chapter=(chapter-1+(keys.y||keys.x)+5)%5+1;keyCooldown=frame;sceneKey='';}
  if(keys.confirm){selection=0;scene='menu';sceneKey='';}
  if(keys.cancel){scene='intro';sceneKey='';}
 }else if(scene==='menu'){
  const rows=menuRecords();if(frame-keyCooldown>9&&keys.y){selection=(selection+keys.y+rows.length)%rows.length;keyCooldown=frame;sceneKey='';}
  if(frame-keyCooldown>10&&keys.x){chapter=(chapter-1+keys.x+5)%5+1;selection=0;keyCooldown=frame;sceneKey='';}
  if(keys.confirm)void startBattle();if(keys.cancel){scene='room';sceneKey='';}
 }else if(scene==='remake'&&remake){
  if(keys.pause){remake.paused=!remake.paused;audio.pause(remake.paused);sceneKey='';}
  if(keys.restart&&publicLoadout){void launchRemake(menuRecords()[selection],publicLoadout).catch(showError);return;}
  const held=remake.rt.input.held;held.clear();if(keys.x<0)held.add(KEY.left);if(keys.x>0)held.add(KEY.right);if(keys.y<0)held.add(KEY.up);if(keys.y>0)held.add(KEY.down);if(keys.slow)held.add(KEY.shift);
  if(remake.paused){remakeConfirm=false;remakeCancel=false;remakeMenu=false;}else{remakeConfirm||=keys.confirm;remakeCancel||=keys.cancel;remakeMenu||=keys.menu;}
  if(!remake.paused&&!remake.outcome&&++remakeTick%2===0){
   if(remake instanceof SourceBattle){if((keys.x||keys.y)&&remakeTick>=remakeMoveCooldown){remake.move(keys.x,keys.y);remakeMoveCooldown=remakeTick+10;}if(remakeCancel)remake.cancel();else if(remakeConfirm)remake.confirm();}
   // C reaches the game code as a key press on its next frame (button3_p), as the original reads it.
   if(remakeMenu)remake.rt.input.pressed.add(KEY.c);
   remakeConfirm=false;remakeCancel=false;remakeMenu=false;remake.step();renderRemakeFrame();
   if(remake.outcome){element('outcome-text').textContent=remake.outcome==='survived'?'* Pattern survived.':remake.outcome==='victory'?'* YOU WON!':'* The party fell.';element('outcome-again').textContent=remake instanceof SourceBattle?'BATTLE AGAIN':'PRACTICE AGAIN';element('outcome').hidden=false;audio.pause(true);if(remake.outcome==='victory'&&!prefs.completed.includes(menuRecords()[selection].id)){prefs.completed.push(menuRecords()[selection].id);savePrefs(storage,prefs);}}
  }
 }else if(scene==='battle'&&battle){
  if(keys.cancel&&(battle.paused||battle.phase==='victory'||battle.phase==='defeat')){goMenu();return;}
  battle.step(keys);audio.pause(battle.paused);
  for(const event of battle.events.splice(0))audio.effect(event);
  if(battle.phase==='victory'&&!battle.practice&&!victoryRecorded){victoryRecorded=true;if(!prefs.completed.includes(battle.definition.record.id)){prefs.completed.push(battle.definition.record.id);savePrefs(storage,prefs);}}
 }
 updateControls();
}
function loop(time:number){
 const dt=last?(time-last)/1000:0;last=time;clock.advance(dt,step);
 if(renderer){if(scene==='theater'&&theaterView)theaterView.draw(ctx,theater);else if(scene==='intro')renderer.intro(frame);else if(scene==='room')renderer.room(chapter,catalog.length);else if(scene==='menu')renderer.menu(menuRecords(),selection,chapter,frame,prefs.completed);else if(scene==='remake'&&remake){
  ctx.drawImage(remakeCanvas,0,0);if(!(remake instanceof SourceBattle)){assets.text(ctx,'JEVIL / ATTACK PRACTICE',320,12,1,'#b899ff','center');assets.text(ctx,JEVIL_PATTERNS[remake.pattern].name.toUpperCase(),320,306,1,'#c5bed2','center');
   const g=remake.rt.globals;for(let i=0;i<3;i++){const x=25+i*205;assets.text(ctx,['KRIS','SUSIE','RALSEI'][i],x,359,1,['#69bcff','#f68bd6','#82e4a3'][i]);assets.text(ctx,`HP ${Math.max(0,g.hp[i+1])} / ${g.maxhp[i+1]}`,x,385,1);assets.text(ctx,`DF ${g.battledf[i]}`,x,410,1,'#a7a0b5');}assets.text(ctx,`TP ${Math.floor(g.tension)}%`,320,442,1,'#ffb05e','center');
  }if(remake.paused){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,640,480);assets.text(ctx,'PAUSED',320,158,3,'#ffff00','center');}
 }else if(battle)renderer.battle(battle,prefs.reducedEffects);}
 raf=requestAnimationFrame(loop);
}
input.bind(window,()=>{if(battle)battle.pause(true);if(remake)remake.paused=true;audio?.pause(true);clock.reset();sceneKey='';});
document.addEventListener('visibilitychange',()=>{input.clear();clock.reset();last=0;if(document.hidden){if(battle)battle.pause(true);if(remake)remake.paused=true;audio?.pause(true);sceneKey='';}});
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||element<HTMLDialogElement>('about').open||(e.target instanceof HTMLElement&&e.target.closest('select,input,textarea,[contenteditable]')))return;audio?.unlock();if(e.key.toLowerCase()==='t'&&scene==='menu'){e.preventDefault();void startBattle(true);}});
window.addEventListener('pointerdown',()=>audio?.unlock(),{passive:true});
// When focus is on the page (header buttons, after a dialog) keys still reach the original battle.
const forwardNativeKey=(down:boolean)=>(e:KeyboardEvent)=>{if(scene!=='native'||!native||e.ctrlKey||e.metaKey||e.altKey||document.querySelector('dialog[open]')||(down&&e.repeat))return;if(native.key(e.key,down))e.preventDefault();};
window.addEventListener('keydown',forwardNativeKey(true));window.addEventListener('keyup',forwardNativeKey(false));
element('back').addEventListener('click',()=>{if(scene==='battle'||scene==='native'||scene==='remake')goMenu();else if(scene==='intro')openTheater();else{sessionToken++;busy=false;loading.hidden=true;scene='room';sceneKey='';input.clear();}});
element('pause').addEventListener('click',()=>{if(remake){remake.paused=!remake.paused;audio.pause(remake.paused);sceneKey='';}else if(native){const resuming=native.paused;native.pause(!resuming);if(resuming)native.focus();}else if(battle){battle.pause(!battle.paused);audio.pause(battle.paused);sceneKey='';}});
element('mute').addEventListener('click',()=>{prefs.muted=!prefs.muted;audio?.setMuted(prefs.muted);native?.mute(prefs.muted);updatePreferences();});
element('effects').addEventListener('click',()=>{prefs.reducedEffects=!prefs.reducedEffects;updatePreferences();});
element('practice').addEventListener('click',()=>void startBattle(true));
const dialog=element<HTMLDialogElement>('about');function about(){if(battle){battle.pause(true);audio.pause(true);}if(remake){remake.paused=true;audio.pause(true);}native?.pause(true);input.clear();element('source-summary').textContent=publicMode?'Public demo: theater, equipment preparation, Jevil, opening Lancer and Clover battles, plus separate Jevil attack practice. More encounters are in development.':`${catalog.length} encounters from 5 chapter packages. All game files load from this computer.`;element('difference-note').textContent=publicMode?'The public battles have shared commands and continuous turns. Attacks and numerical rules are ported from the game; complete visual, sound and equipment-ability parity is still being verified.':native?'This battle runs the original game code from your DELTARUNE install on the open-source Butterscotch engine; no attack was rewritten. Every encounter is checked to load and reach combat.':battle?.definition.differences.join(' ')??'Art and stats come from your local game files. Full battles run the original game code; practice mode uses browser adaptations of the attacks, which do not match the original exactly.';dialog.showModal();sceneKey='';}
element('credits').addEventListener('click',about);element('adaptation').addEventListener('click',about);element('close-about').addEventListener('click',()=>dialog.close());
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-key]')){
 const key=button.dataset.key!;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);button.classList.add('down');if(scene==='native'&&native)native.key(key,true);else input.press(key);});
 const release=()=>{button.classList.remove('down');native?.key(key,false);input.release(key);};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
}
element('outcome-menu').addEventListener('click',goMenu);
// The banner stays until a new battle actually launches (closeBattle), so dismissing preparation keeps a way back.
element('outcome-again').addEventListener('click',()=>{if(publicMode&&publicLoadout)void launchRemake(menuRecords()[selection],publicLoadout).catch(showError);else void startBattle(false);});
element('retry').addEventListener('click',()=>{error.hidden=true;if(renderer&&(!publicMode||equipment))void startBattle(false);else void initialize();});
async function initialize(){
 loading.hidden=false;error.hidden=true;try{
  assets=await loadAssets();await assets.preload(1);
  // Native battles and the equipment catalog are optional: without them every encounter keeps the browser adaptation.
  const [catalogJson,ids]=await Promise.all([fetch(assetUrl('/generated/equipment.json')).then(r=>r.ok?r.json() as Promise<EquipmentCatalog>:null).catch(()=>null),publicMode?Promise.resolve(new Set<string>()):fetchNativeProfiles()]);
  equipment=catalogJson;nativeIds=ids;
  if(publicMode&&!equipment?.chapters[1])throw Error('Equipment could not load. Please retry.');
  if(publicMode)await Promise.all([2,3,4,5].map(chapter=>assets.preload(chapter)));
  if(equipment&&!prep){const source=equipment;prep=new PreparationPanel(source,assets,storage,(record,loadout)=>publicMode?launchRemake(record,loadout):launchNative(record,loadoutIni(loadout,source.chapters[record.chapter])),()=>{input.clear();if(native)setTimeout(()=>native?.focus());});}
  // Optional local reference art for the device room; the drawn room is used when it is absent.
  if(!publicMode)await Promise.all(['bg','console','tvglow','vessel_d_0'].map(n=>assets.loadImage('/device-room/'+n+'.png').catch(()=>null)));
  theaterView=new TheaterView(assets);await Promise.all(theaterView.urls().map(u=>assets.loadImage(u).catch(()=>null)));
  renderer=new Renderer(ctx,assets,publicMode);audio=new AudioManager(prefs.muted,assets.manifest.music);if(publicMode){document.querySelector('.brand .dim')!.textContent='/ DEMO';dialog.querySelector('p')!.textContent='DELTARUNE browser boss battles, with a theater intro and equipment preparation.';}updatePreferences();loading.hidden=true;updateControls();if(!raf)raf=requestAnimationFrame(loop);
 }catch(e){showError(e);}
}
void initialize();
