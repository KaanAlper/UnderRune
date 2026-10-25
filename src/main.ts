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
import {RoutePicker} from './ui/route-picker';
import {battleRoutes,isNeoEncounter,type BattleRoute} from './remake/host/routes';
import {LeaderboardPanel} from './ui/leaderboard';
import {LeaderboardApi,loadLeaderboardConfig} from './game/leaderboard-api';
import {loadoutIni,type EquipmentCatalog,type Loadout} from './game/loadout';
import {assetUrl} from './game/url';
import {loadRemakeAssets} from './remake/host/assets';
import {setSourceText} from './remake/host/text';
import {createPracticeBattle,practicePatterns,JEVIL_PATTERNS,type PracticeSession} from './remake/host/practice';
import {EngineBattle,type Session} from './remake/host/engine';
import {sourceEncounter,developmentEncounter,availabilityLabel,availableEncounters} from './remake/host/encounters';
// Local dev server only: ?dev=1 also opens ported encounters that are not public yet. Production builds drop this.
const devUnlock=import.meta.env.DEV&&new URLSearchParams(location.search).has('dev');
const playableEncounter=(id:string)=>devUnlock?developmentEncounter(id):sourceEncounter(id);
import {BattleView} from './remake/host/view';
import {CanvasGraphics} from './remake/host/canvas';
import {endCombat,findController,setHudMeasure} from './remake/deltarune/controller';
import {KEY,gameOver,heroKris} from './remake/deltarune/battle';
import type {EncounterRecord} from './game/types';
import {TheaterState,TheaterView,THEATER_HITS} from './game/theater';
import {GmInstance} from './remake/gm/runtime';
import {choiceAt,deviceChoice,pointChoice} from './remake/deltarune/battle-end';
import {VictoryCard,victoryLines} from './game/battle-result';
// During development, reading an instance variable nothing has set stops the battle with its name (as GameMaker does).
// Development builds check every variable read (a Proxy, which slows drawing); ?nostrict measures them as the site runs.
GmInstance.strict=import.meta.env.DEV&&!new URLSearchParams(location.search).has('nostrict');
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id)! as T;
const canvas=element<HTMLCanvasElement>('screen'),ctx=canvas.getContext('2d')!;
const overlay=element('interactions'),status=element('status'),loading=element('loading'),error=element('error');
const input=new Input(),clock=new FixedClock(),storage=browserStore(),prefs=loadPrefs(storage);
const publicMode=import.meta.env.MODE==='pages'||new URLSearchParams(location.search).has('demo');
const remakeCache=new Map<number,Awaited<ReturnType<typeof loadRemakeAssets>>>();
let remake:PracticeSession|EngineBattle|null=null,publicLoadout:Loadout|null=null,remakeTick=0,publicPractice=false,remakeView:BattleView|null=null,patternEncounterId='';
let remakeMenu=false;
// Engine battles read key presses like the game: every press since the last game frame reaches its next frame.
const remakePressed=new Set<number>();
const remakeReleased=new Set<number>();
const remakeCanvas=document.createElement('canvas');remakeCanvas.width=640;remakeCanvas.height=480;const remakeCtx=remakeCanvas.getContext('2d',{alpha:false})!;
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
let routePicker:RoutePicker|null=null,chosenRoute:BattleRoute|undefined,choosingRoute=false;
let leaderboard:LeaderboardPanel|null=null,leaderboardApi:LeaderboardApi|null=null;
/** The won battle's result screen; when the result appeared (Z waits a moment, so a pressed-through text does not
 * start the next battle); game overs so far per battle (global.tempflag[3], which outlives a retry). */
let victory:VictoryCard|null=null,outcomeShownAt=0,endingFaded=false;
const gameOvers=new Map<string,number>();
/** Per battle, what its retries keep (EngineBattle.session). */
const sessions=new Map<string,Session>();
/** UNDERTALE's game over theme plays on the failure screen in place of the chapter's own music, when it is installed. */
const GAME_OVER_THEME:Record<string,string>={AUDIO_DRONE:'mus_gameover',AUDIO_DEFEAT:'mus_gameover'};
function updatePreferences(){document.body.classList.toggle('reduced',prefs.reducedEffects);element('mute').textContent=prefs.muted?'SOUND OFF':'SOUND ON';element('mute').setAttribute('aria-pressed',String(prefs.muted));element('effects').textContent=prefs.reducedEffects?'CRT OFF':'CRT ON';element('effects').setAttribute('aria-pressed',String(prefs.reducedEffects));savePrefs(storage,prefs);}
function cancelLoad(){sessionToken++;remakeLoad?.abort();remakeLoad=null;failedChapter=null;loading.hidden=true;error.hidden=true;busy=false;}
function closeBattle(){victory=null;endingFaded=false;leaveArmedUntil=0;native?.dispose();native=null;nativeRecord=null;remake=null;remakeView=null;remakePressed.clear();remakeReleased.clear();remakeMenu=false;element('outcome').hidden=true;element('stage').classList.remove('battle-over');audio?.stop();input.setConfirmReleaseMode('logical');clock.reset();}
// Pausing: Z, Enter, P, Esc or a click on the screen continue; leaving a battle that is still on takes a second X (or a
// second DEVICE_MENU click) within a few seconds, so a reflexive Esc or one stray press never throws a battle away.
let leaveArmedUntil=0;
const battleOn=()=>!!remake&&!remake.outcome;
function setPaused(value:boolean){if(!remake)return;remake.paused=value;audio.pause(value);if(!value)leaveArmedUntil=0;sceneKey='';}
function askLeave(){if(performance.now()<leaveArmedUntil){goMenu();return;}setPaused(true);leaveArmedUntil=performance.now()+3000;sceneKey='';}
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
function renderRemakeFrame(){
 if(!remake)return;remakeCtx.imageSmoothingEnabled=false;remakeCtx.setTransform(1,0,0,1,0,0);remakeCtx.fillStyle='#000';remakeCtx.fillRect(0,0,640,480);
 if(remake instanceof EngineBattle&&remake.id==='ch1-25'&&remake.ending!=='defeat')remakeView?.background();
 // A room with a smaller view (the failure screen's 320x240) fills the screen, scaled up.
 const scale=640/remake.rt.view.width;remakeCtx.setTransform(scale,0,0,scale,0,0);remake.rt.draw();remakeCtx.setTransform(1,0,0,1,0,0);
}
async function launchRemake(record:EncounterRecord,loadout:Loadout){
 const encounter=playableEncounter(record.id);if(!encounter)throw Error('This encounter is still in development. Your preparation is saved.');
 if(busy)return;busy=true;error.hidden=true;loading.hidden=false;loading.textContent='* CONNECTING '+record.name.toUpperCase()+'...';const token=++sessionToken;
 const pattern=Number(element<HTMLSelectElement>('attack-select').value)||0;
 const controller=new AbortController();remakeLoad?.abort();remakeLoad=controller;
 try{const remakeAssets=remakeCache.get(record.chapter)??await loadRemakeAssets(record.chapter);if(token!==sessionToken)return;remakeCache.set(record.chapter,remakeAssets);await audio.prepareEffects(remakeAssets.sounds,controller.signal);const neoHost=isNeoEncounter(record.id)?(await import('./remake/host/neo')).installNeoHost:undefined;
  // Load each chapter's boss registry only when entering one of its battles.
  const chapterHost=record.chapter===3?(await import('./remake/host/chapter3-bosses')).installChapter3BossHost:record.chapter===2&&!isNeoEncounter(record.id)?(await import('./remake/host/chapter2-bosses')).installChapter2BossHost:undefined;if(token!==sessionToken)return;closeBattle();setSourceText(remakeAssets.text);publicLoadout=structuredClone(loadout);
  // The game calls randomize() when it starts: every battle gets its own random seed (tests and comparisons fix it).
  // ?seed=N repeats a run exactly (comparisons with the original's recordings).
  const fixedSeed=new URLSearchParams(location.search).get('seed'),seed=fixedSeed!==null?Number(fixedSeed)>>>0:crypto.getRandomValues(new Uint32Array(1))[0];
  remake=publicPractice?createPracticeBattle(remakeAssets.bank,equipment!.chapters[record.chapter],loadout,record.id,pattern,seed,{development:devUnlock,neoHost,chapterHost}):new EngineBattle(remakeAssets.bank,equipment!.chapters[record.chapter],loadout,record.id,seed,{development:devUnlock,neoHost,chapterHost,scoring:publicMode,rage:chosenRoute?.rage??false,gameOvers:gameOvers.get(record.id)??0,secretBossAttempts:prefs.fought.includes(record.id)?1:0,session:sessions.get(record.id)});input.setConfirmReleaseMode(chosenRoute?.confirmRelease??'logical');{const gfx=new CanvasGraphics(remakeCtx,remakeAssets.draw,remake.rt.view);remake.rt.gfx=gfx;setHudMeasure(text=>gfx.textWidth('fnt_mainbig',text));}remakePressed.clear();remakeReleased.clear();
  remakeView=new BattleView(remakeCtx,remakeAssets.draw);remakeMenu=false;
  remake.rt.sound=(name,pitch,restart)=>audio.sourceEffect(name,pitch,restart);remake.rt.soundLoop=name=>audio.sourceLoop(name);remake.rt.soundStop=handle=>audio.sourceStop(handle);remake.rt.soundPitch=(handle,pitch)=>audio.sourcePitch(handle,pitch);remake.rt.soundGetPitch=handle=>audio.sourceGetPitch(handle);remake.rt.stopAllSounds=()=>audio.stop();
  remake.rt.sourceAudio={pitch:(handle,value)=>audio.sourcePitch(handle,value),effect:(name,pitch,volume)=>audio.sourceEffect(name,pitch,false,volume),volume:(handle,value,frames)=>audio.sourceVolume(handle,value,frames),free:handle=>audio.sourceFree(handle),music:name=>{const theme=GAME_OVER_THEME[name],track=theme&&audio.has(theme)?theme:name;audio.play(track);return track;},loop:handle=>audio.sourceSetLoop(handle),pause:handle=>audio.sourceTrackPause(handle),resume:handle=>audio.sourceTrackResume(handle),position:(handle,seconds)=>audio.sourcePosition(handle,seconds),playing:handle=>audio.sourcePlaying(handle)};
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
 let record=menuRecords()[selection];if(!record||busy||choosingRoute)return;
 const encounter=playableEncounter(record.id);if(practice&&!encounter?.practice)return;publicPractice=practice;
 const routes=battleRoutes(record.id);let routeLabel:string|undefined;chosenRoute=routes[0];
 if(!practice&&routes.length>1&&routePicker){
  choosingRoute=true;let picked:BattleRoute|null;try{picked=await routePicker.choose(record.name,routes);}finally{choosingRoute=false;input.clear();}
  if(!picked||!picked.ready)return;chosenRoute=picked;routeLabel=picked.title;record={...record,id:picked.encounterId};
 }
 // Installed original battles remain the local full-battle path. Practice always uses the faithful source port.
 if(!publicMode&&!practice&&nativeIds.has(record.id)){
  if(prep&&equipment?.chapters[record.chapter])prep.open(record,{routeLabel});
  else void launchNative(record,'').catch(showError);
  return;
 }
 const playable=!!playableEncounter(record.id);
 if(prep&&equipment?.chapters[record.chapter])prep.open(record,{routeLabel,practiceOnly:practice,available:playable,launchLabel:playable?practice?'START PRACTICE':'START BATTLE':'IN DEVELOPMENT',notice:playable?practice?'Single attack practice. Use START BATTLE from the encounter list for commands and continuous turns.':'Browser battle: commands, equipment stats and usable bag items. Visuals, sounds and special equipment effects are still being compared with the game.':publicMode?'Browse equipment and save your loadout. This encounter is not playable in the public demo yet.':'Browse equipment and save your loadout. A source battle for this encounter is still in development; the local original engine is unavailable.'});
 else showError('Equipment could not load. Please retry.');
}
function addHitbox(name:string,x:number,y:number,w:number,h:number,run:()=>void){const button=document.createElement('button');button.className='hitbox';button.setAttribute('aria-label',name);button.style.cssText=`left:${x/6.4}%;top:${y/4.8}%;width:${w/6.4}%;height:${h/4.8}%`;button.addEventListener('click',()=>{audio.unlock();run();sceneKey='';});overlay.append(button);}
function updateControls(){
 const engineBattle=remake instanceof EngineBattle?remake:null;
 const leaving=performance.now()<leaveArmedUntil,key=[scene,theater?.active,theater?.selected,chapter,selection,native?.paused,remake?.paused,remake?.outcome,engineBattle?.phase,engineBattle?.turn,busy,leaving].join(':');
 if(key===sceneKey)return;sceneKey=key;
 // Quiet UNDERTALE music from the theater to the encounter menu, one track after another; battles bring their own.
 // Browsers start it at the first click or key press.
 if(audio&&(scene==='theater'||scene==='intro'||scene==='room'||scene==='menu'))audio.playMenu(assets.manifest.menuMusic??[]);else if(audio&&scene==='native')audio.stopMenu();if(scene!=='menu')overlay.replaceChildren();element('menu-tools').hidden=scene!=='menu';element('pause').hidden=scene!=='native'&&scene!=='remake';element('back').hidden=scene==='theater';
 if(scene==='native'&&nativeRecord)status.textContent=`${nativeRecord.name} / ORIGINAL ENGINE${native?.paused?' / paused':''}`;
 element('controls-hint').textContent=scene==='native'?'ARROWS · Z / ENTER CONFIRM · X / SHIFT CANCEL · P PAUSE':'ARROWS / WASD · Z CONFIRM · X BACK · R RESTART · P PAUSE';
 element('adaptation').textContent=scene==='native'?'FAN PROJECT · ORIGINAL GAME CODE':'FAN PROJECT · SOURCE PORT';
 if(publicMode)element('adaptation').textContent='FAN PROJECT · PUBLIC DEMO';
 if(scene==='remake'&&remake){status.textContent=remake instanceof EngineBattle?`${remake.name} / ${remake.paused?'paused':remake.phase} / TURN ${remake.turn+1}`:`${remake.name} / ${remake.paused?'paused':remake.outcome??remake.patternName} / PRACTICE`;if(leaving)status.textContent+=' / X OR DEVICE_MENU AGAIN TO LEAVE';element('controls-hint').textContent='ARROWS / WASD · Z / ENTER CONFIRM · X BACK / SLOW · R RESTART · P PAUSE';
 }
 if(scene==='theater'){
  const t=theater,H=THEATER_HITS;status.textContent=t.active==='undertale'?'UNDERTALE / COMING SOON':t.active==='deltarune'?'DELTARUNE / SIGNAL':'THEATER';
  addHitbox('UNDERTALE remote',H.undertale.x,H.undertale.y,H.undertale.w,H.undertale.h,()=>t.press('undertale'));
  addHitbox('DELTARUNE remote',H.deltarune.x,H.deltarune.y,H.deltarune.w,H.deltarune.h,()=>t.press('deltarune'));
  addHitbox(t.active==='deltarune'?'Connect DELTARUNE':'Television',H.tv.x,H.tv.y,H.tv.w,H.tv.h,()=>t.press(t.active??t.selected));
 }
 if(scene==='intro'){addHitbox('Connect device',70,60,500,360,()=>{scene='room';});status.textContent='LOCAL SIGNAL';}
 if(scene==='room'){
  for(let i=1;i<=5;i++)addHitbox('Chapter '+i,175,112+(i-1)*32,270,31,()=>void openChapter(i));overlay.children[chapter-1]?.setAttribute('aria-current','true');status.textContent='DEVICE_MENU';
 }
 if(scene==='menu'){
  const rows=menuRecords();if(bossDeck){const mounted=!overlay.contains(bossDeck.element);if(mounted)overlay.replaceChildren(bossDeck.element);bossDeck.update(rows,selection,chapter,prefs.completed,id=>publicMode?!!playableEncounter(id):nativeIds.has(id)||!!playableEncounter(id),index=>{selection=index;sceneKey='';},()=>{if(scene!=='menu')return;audio.unlock();void startBattle(false);});if(mounted)bossDeck.focusSelected();}
  const selectedId=rows[selection].id,patterns=practicePatterns(selectedId);
  const select=element<HTMLSelectElement>('attack-select'),previous=patternEncounterId===selectedId?select.value:'0';patternEncounterId=selectedId;select.replaceChildren();for(const [i,a]of patterns.entries()){const opt=document.createElement('option');opt.value=String(i);opt.textContent=a.name;select.append(opt);}select.value=Number(previous)<patterns.length?previous:'0';
  select.disabled=!playableEncounter(selectedId)?.practice||!patterns.length;element<HTMLButtonElement>('practice').disabled=select.disabled;
  const practiceLink=bossDeck?.element.querySelector<HTMLButtonElement>('.deck-practice');if(practiceLink)practiceLink.disabled=select.disabled;
  element('practice-boss').textContent=rows[selection].name;
  element('menu-tools').classList.toggle('practice-unavailable',select.disabled);
  status.textContent=`CHAPTER ${chapter} / ${rows.length} ENCOUNTERS${publicMode?' / '+availabilityLabel(chapter):''}`;
  element('controls-hint').textContent='LEFT / RIGHT CARDS · UP / DOWN ACTIONS · Z SELECT · X BACK';
 }
}
function activeRemakeRecord(){
 const record=menuRecords()[selection];
 return remake?{...record,id:remake.id}:record;
}
function showOutcome(){
 if(!remake?.outcome)return;
 const record=menuRecords()[selection];
 if(remake.outcome==='victory'&&!prefs.completed.includes(record.id)){prefs.completed.push(record.id);savePrefs(storage,prefs);}
 if(remake instanceof EngineBattle&&!prefs.fought.includes(record.id)){prefs.fought.push(record.id);savePrefs(storage,prefs);}
 // A game over ends with the player's own choice on the failure screen: try again, or back to the menu.
 if(remake instanceof EngineBattle&&remake.afterDefeat){
  gameOvers.set(remake.id,remake.rt.globals.tempflag[3]);sessions.set(remake.id,remake.session());
  if(remake.afterDefeat==='retry'&&publicLoadout)void launchRemake(activeRemakeRecord(),publicLoadout).catch(showError);else goMenu();
  return;
 }
 outcomeShownAt=performance.now();
 const battle=remake instanceof EngineBattle?remake:null,won=remake.outcome==='victory'&&!!battle;
 if(battle&&won){const card=new VictoryCard(battle.name,victoryLines(battle.turn,battle.result),!!battle.result&&!!leaderboardApi);victory=card;void placeRun(battle.result,card);}
 element('outcome-text').textContent=won?'':remake.outcome==='survived'?'* Pattern survived.':remake.outcome==='victory'?'* YOU WON!':'* The party fell.';element('outcome-text').hidden=won;
 element('outcome-again').textContent=(remake instanceof EngineBattle?'BATTLE AGAIN':'PRACTICE AGAIN')+' [Z / ENTER]';element('outcome-menu').textContent='DEVICE_MENU [X]';
 element('outcome-score').hidden=!(remake instanceof EngineBattle&&remake.result);element('outcome').hidden=false;
 if(!won)audio.pause(true);
}
/** The place the won run would take on the shared leaderboard (nothing is published until the player chooses to). */
async function placeRun(run:EngineBattle['result'],card:VictoryCard){
 const api=leaderboardApi;if(!run||!api){card.place(null);return;}
 try{await api.connect();card.place(api.configured?await api.rank(run):null);}catch{card.place(null);}
}
function step(){
 frame++;if(busy)return;if(document.querySelector('dialog[open]')){input.clear();return;}const keys=input.read();
 if(scene==='theater'){if(theater.step(keys)==='enter-deltarune'){audio.unlock();scene='intro';sceneKey='';}}
 else if(scene==='intro'&&keys.confirm){audio.unlock();scene='room';sceneKey='';}
 else if(scene==='intro'&&keys.cancel){openTheater();}
 else if(scene==='room'){
  const edge=keys.arrows?.[0],direction=edge?(['left','up'].includes(edge)?-1:1):keys.y||keys.x;
  if(direction&&(edge||frame-keyCooldown>10)){chapter=(chapter-1+direction+5)%5+1;keyCooldown=frame;sceneKey='';}
  if(keys.confirm)void openChapter(chapter);
  if(keys.cancel){scene='intro';sceneKey='';}
 }else if(scene==='menu'){
  const rows=menuRecords(),edge=keys.arrows?.find(k=>['left','right','up','down'].includes(k));
  const direction=edge?(['left','up'].includes(edge)?-1:1):keys.x||keys.y;
  if(direction&&(edge||frame-keyCooldown>9)){selection=(selection+direction+rows.length)%rows.length;keyCooldown=frame;sceneKey='';}
  if(keys.confirm)void startBattle();if(keys.cancel){scene='room';sceneKey='';}
 }else if(scene==='remake'&&remake){
  if(keys.cancel&&remake.outcome){goMenu();return;}
  if(keys.confirm&&remake.outcome&&performance.now()-outcomeShownAt>120){element('outcome-again').click();return;}
  if(remake.paused){
   if(keys.confirm||keys.pause||keys.escape)setPaused(false);
   // The second X leaves the battle: nothing of it is left to read keys this frame.
   else if(keys.cancel){askLeave();if(!remake)return;}
  }else if(keys.pause)setPaused(true);
  if(keys.restart&&publicLoadout){void launchRemake(activeRemakeRecord(),publicLoadout).catch(showError);return;}
  const held=remake.rt.input.held;held.clear();if(keys.x<0)held.add(KEY.left);if(keys.x>0)held.add(KEY.right);if(keys.y<0)held.add(KEY.up);if(keys.y>0)held.add(KEY.down);if(keys.slow)held.add(KEY.shift);
  if(remake.paused){remakeMenu=false;remakePressed.clear();remakeReleased.clear();}else{remakeMenu||=keys.menu;
   if(keys.shootReleased)remakeReleased.add(KEY.z);
   if(keys.confirm)remakePressed.add(KEY.z);if(keys.cancel)remakePressed.add(KEY.x);if(keys.menu)remakePressed.add(KEY.c);if(keys.help)remakePressed.add(KEY.f1);for(const a of keys.arrows??[])remakePressed.add(KEY[a]);}
  if(!remake.paused&&!remake.outcome&&++remakeTick%2===0){
   if(remake instanceof EngineBattle||remake.usesEngineHud){if(keys.shoot)held.add(KEY.z);for(const k of remakePressed)remake.rt.input.pressed.add(k);for(const k of remakeReleased)remake.rt.input.released.add(k);remakePressed.clear();remakeReleased.clear();remakeMenu=false;}
   // C reaches the game code as a key press on its next frame (button3_p), as the original reads it.
   if(remakeMenu)remake.rt.input.pressed.add(KEY.c);
   remakeMenu=false;remake.step();renderRemakeFrame();
   // The win's fade-out (obj_endbattle) takes the music with it.
   if(remake instanceof EngineBattle&&remake.ending==='victory'&&!endingFaded){endingFaded=true;audio.fadeOut(500);}
   if(remake.outcome){showOutcome();return;}
  }
 }
 updateControls();
}
function loop(time:number){
 const dt=last?(time-last)/1000:0;last=time;clock.advance(dt,step,scene==='remake'?2:5);
 if(renderer){if(scene==='theater'&&theaterView)theaterView.draw(ctx,theater);else if(scene==='intro')renderer.intro(frame);else if(scene==='room')renderer.room(chapter,catalog.length);else if(scene==='menu')renderer.clear();else if(scene==='remake'&&remake){
  ctx.drawImage(remakeCanvas,0,0);if(!(remake instanceof EngineBattle)&&!remake.usesEngineHud){assets.text(ctx,'JEVIL / ATTACK PRACTICE',320,12,1,'#b899ff','center');assets.text(ctx,JEVIL_PATTERNS[remake.pattern].name.toUpperCase(),320,306,1,'#c5bed2','center');
   const g=remake.rt.globals;for(let i=0;i<3;i++){const x=25+i*205;assets.text(ctx,['KRIS','SUSIE','RALSEI'][i],x,359,1,['#69bcff','#f68bd6','#82e4a3'][i]);assets.text(ctx,`HP ${Math.max(0,g.hp[i+1])} / ${g.maxhp[i+1]}`,x,385,1);assets.text(ctx,`DF ${g.battledf[i]}`,x,410,1,'#a7a0b5');}assets.text(ctx,`TP ${Math.floor(g.tension)}%`,320,442,1,'#ffb05e','center');
  }else if(!(remake instanceof EngineBattle)){assets.text(ctx,`${remake.name.toUpperCase()} / ${remake.patternName.toUpperCase()}`,320,12,1,'#b899ff','center');}if(victory&&remake.outcome==='victory')victory.draw(ctx,assets,performance.now(),reducedMotion());
  if(remake.paused){
   ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,640,480);assets.text(ctx,'PAUSED',320,150,3,'#ffff00','center');
   assets.text(ctx,'Z, ENTER, P, ESC OR CLICK: CONTINUE',320,250,1,'#ffffff','center');
   if(!remake.outcome)assets.text(ctx,performance.now()<leaveArmedUntil?'PRESS X AGAIN TO LEAVE THE BATTLE':'X TWICE: LEAVE THE BATTLE',320,290,1,performance.now()<leaveArmedUntil?'#ff6060':'#a7a0b5','center');
  }
 }}
 raf=requestAnimationFrame(loop);
}
input.bind(window,()=>{if(remake)remake.paused=true;audio?.pause(true);clock.reset();sceneKey='';});
document.addEventListener('visibilitychange',()=>{input.clear();clock.reset();last=0;if(document.hidden){if(remake)remake.paused=true;audio?.pause(true);sceneKey='';}});
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||element<HTMLDialogElement>('about').open||(e.target instanceof HTMLElement&&e.target.closest('select,input,textarea,[contenteditable]')))return;audio?.unlock();if(e.key.toLowerCase()==='t'&&scene==='menu'){e.preventDefault();void startBattle(true);}});
window.addEventListener('pointerdown',()=>audio?.unlock(),{passive:true});
// On the failure screen the pointer chooses too: hovering moves the soul, a click takes the choice.
const failureChoice=(e:PointerEvent)=>{
 if(scene!=='remake'||!(remake instanceof EngineBattle)||remake.ending!=='defeat'||remake.paused||remake.outcome)return null;
 const r=canvas.getBoundingClientRect(),v=remake.rt.view,choice=choiceAt(remake.rt,(e.clientX-r.left)/r.width*v.width,(e.clientY-r.top)/r.height*v.height);
 return choice===null?null:{rt:remake.rt,choice};
};
// The interactions layer lies over the canvas, so the stage hears the pointer.
const stage=element('stage');
stage.addEventListener('pointermove',e=>{const c=failureChoice(e);if(c)pointChoice(c.rt,c.choice,false);});
stage.addEventListener('pointerdown',e=>{if(scene==='remake'&&remake?.paused&&!(e.target instanceof HTMLButtonElement)){setPaused(false);return;}const c=failureChoice(e);if(c)pointChoice(c.rt,c.choice,true);});
// Closing the tab or going back in the browser during a battle asks first.
window.addEventListener('beforeunload',e=>{if((scene==='remake'&&battleOn())||scene==='native'){e.preventDefault();e.returnValue='';}});
// When focus is on the page (header buttons, after a dialog) keys still reach the original battle.
const forwardNativeKey=(down:boolean)=>(e:KeyboardEvent)=>{if(scene!=='native'||!native||e.ctrlKey||e.metaKey||e.altKey||document.querySelector('dialog[open]')||(down&&e.repeat))return;if(native.key(e.key,down))e.preventDefault();};
window.addEventListener('keydown',forwardNativeKey(true));window.addEventListener('keyup',forwardNativeKey(false));
element('back').addEventListener('click',()=>{if(scene==='remake'&&battleOn()){askLeave();return;}if(scene==='native'||scene==='remake'||native||remakeLoad)goMenu();else if(scene==='intro')openTheater();else{cancelLoad();scene='room';sceneKey='';input.clear();}});
element('pause').addEventListener('click',()=>{if(remake){setPaused(!remake.paused);}else if(native){const resuming=native.paused;native.pause(!resuming);if(resuming)native.focus();}});
element('mute').addEventListener('click',()=>{prefs.muted=!prefs.muted;audio?.setMuted(prefs.muted);native?.mute(prefs.muted);updatePreferences();});
element('effects').addEventListener('click',()=>{prefs.reducedEffects=!prefs.reducedEffects;updatePreferences();});
element('practice').addEventListener('click',()=>void startBattle(true));
function focusPractice(){const select=element<HTMLSelectElement>('attack-select');if(!select.disabled){input.clear();select.focus();}}
element('menu-tools').addEventListener('keydown',event=>{
 if(event.ctrlKey||event.metaKey||event.altKey)return;
 const select=element<HTMLSelectElement>('attack-select'),button=element<HTMLButtonElement>('practice'),onSelect=event.target===select,key=event.key.toLowerCase();
 if(!['z','enter','x','escape','arrowleft','arrowright','arrowup','arrowdown','t'].includes(key))return;
 event.stopPropagation();input.clear();
 if(key==='x'||key==='escape'){event.preventDefault();bossDeck?.focusSelected();}
 else if(key==='z'||key==='enter'||key==='t'){event.preventDefault();if(!event.repeat){if(onSelect&&key!=='t')button.focus();else void startBattle(true);}}
 else if(key==='arrowleft'){event.preventDefault();if(onSelect)bossDeck?.focusSelected();else select.focus();}
 else if(key==='arrowright'){event.preventDefault();if(onSelect)button.focus();else bossDeck?.focusSelected();}
 else if(!onSelect){event.preventDefault();if(key==='arrowup')select.focus();else bossDeck?.focusSelected();}
});
const dialog=element<HTMLDialogElement>('about');function about(){if(remake){remake.paused=true;audio.pause(true);}native?.pause(true);input.clear();const available=[...new Set([...new Set(catalog.map(record=>record.chapter))].flatMap(chapter=>availableEncounters(chapter).map(encounter=>encounter.name)))].join(', ');element('source-summary').textContent=publicMode?`Public demo: theater, equipment preparation and ${available} battles, with separate attack practice. More encounters are in development.`:`${catalog.length} encounters from 5 chapter packages. Available source battles: ${available}. Installed original battles stay on this computer.`;element('difference-note').textContent=native?'This battle runs the original game code from your DELTARUNE install on the open-source Butterscotch engine; no attack was rewritten. Every encounter is checked to load and reach combat.':'Browser battles and Jevil practice run source-ported GameMaker objects. Commands, attack selection and numerical rules come from the game; complete visual, sound and equipment-ability parity is still being verified. Encounters without an available source port remain in development.';dialog.showModal();sceneKey='';}
element('credits').addEventListener('click',about);element('adaptation').addEventListener('click',about);element('close-about').addEventListener('click',()=>dialog.close());
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-key]')){
 const key=button.dataset.key!;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);button.classList.add('down');if(scene==='native'&&native)native.key(key,true);else input.press(key);});
 const release=()=>{button.classList.remove('down');native?.key(key,false);input.release(key);};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
}
element('outcome-menu').addEventListener('click',goMenu);
element('outcome-score').addEventListener('click',()=>{if(remake instanceof EngineBattle&&remake.result)leaderboard?.offer(remake.result);});
// The banner stays until a new battle actually launches (closeBattle), so dismissing preparation keeps a way back.
element('outcome-again').addEventListener('click',()=>{if(remake&&publicLoadout)void launchRemake(activeRemakeRecord(),publicLoadout).catch(showError);else void startBattle(false);});
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
  if(!leaderboard){leaderboardApi=new LeaderboardApi(null,fetch,storage,loadLeaderboardConfig);leaderboard=new LeaderboardPanel(leaderboardApi,catalog,equipment,n=>{input.clear();void openChapter(n);});}
  routePicker??=new RoutePicker();
  // Optional local reference art for the device room; the drawn room is used when it is absent.
  if(!publicMode)await Promise.all(['bg','console','tvglow','vessel_d_0'].map(n=>assets.loadImage('/device-room/'+n+'.png').catch(()=>null)));
  theaterView=new TheaterView(assets);await Promise.all(theaterView.urls().map(u=>assets.loadImage(u).catch(()=>null)));
  renderer=new Renderer(ctx,assets,publicMode);bossDeck=new BossDeck(assets,record=>{input.clear();leaderboard?.open(record.id);},focusPractice);audio=new AudioManager(prefs.muted,assets.manifest.music);if(publicMode){document.querySelector('.brand .dim')!.textContent='/ DEMO';dialog.querySelector('p')!.textContent='DELTARUNE browser boss battles, with a theater intro and equipment preparation.';}updatePreferences();loading.hidden=true;updateControls();if(!raf)raf=requestAnimationFrame(loop);
 }catch(e){showError(e);}
}
// Development builds only (removed from the site): browser tests reach a battle's end without playing it through.
if(import.meta.env.DEV)(window as any).__underrune={
 inspect:()=>remake,
 // The soul falls where it stands beside Kris when no attack has placed it yet.
 lose:()=>{if(!remake)return;const g=remake.rt.globals,k=remake.rt.first(heroKris);if(g.heartx===undefined&&k){g.heartx=k.x+10;g.hearty=k.y+40;}gameOver(remake.rt);},
 win:()=>{const c=remake&&findController(remake.rt);if(remake&&c)endCombat(c,remake.rt);},
 choosing:()=>!!remake?.rt.exists(deviceChoice),
};
void initialize();
