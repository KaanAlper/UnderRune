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
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id)! as T;
const canvas=element<HTMLCanvasElement>('screen'),ctx=canvas.getContext('2d')!;
const overlay=element('interactions'),status=element('status'),loading=element('loading'),error=element('error');
const input=new Input(),clock=new FixedClock(),storage=browserStore(),prefs=loadPrefs(storage);
let assets:AssetStore,renderer:Renderer,audio:AudioManager,battle:BattleSession|null=null;
let scene:'intro'|'room'|'menu'|'battle'='intro',chapter=1,selection=0,frame=0,last=0,raf=0,busy=false,sceneKey='',keyCooldown=0,sessionToken=0,victoryRecorded=false;
const empty={x:0,y:0,confirm:false,cancel:false,restart:false,pause:false,slow:false,shoot:false};
const menuRecords=()=>catalog.filter(r=>r.chapter===chapter);
function updatePreferences(){document.body.classList.toggle('reduced',prefs.reducedEffects);element('mute').textContent=prefs.muted?'SOUND OFF':'SOUND ON';element('mute').setAttribute('aria-pressed',String(prefs.muted));element('effects').textContent=prefs.reducedEffects?'CRT OFF':'CRT ON';element('effects').setAttribute('aria-pressed',String(prefs.reducedEffects));savePrefs(storage,prefs);}
function closeBattle(){battle?.dispose();battle=null;audio?.stop();input.clear();clock.reset();victoryRecorded=false;}
function goMenu(){sessionToken++;loading.hidden=true;busy=false;closeBattle();scene='menu';sceneKey='';selection=Math.min(selection,menuRecords().length-1);}
function showError(cause:unknown){loading.hidden=true;busy=false;element('error-text').textContent=cause instanceof Error?cause.message:String(cause);error.hidden=false;}
async function startBattle(practice=false){
 const record=menuRecords()[selection];if(!record||busy)return;busy=true;error.hidden=true;loading.hidden=false;loading.textContent='* CONNECTING '+record.name.toUpperCase()+'...';const token=++sessionToken;
 try{await assets.preload(chapter);if(token!==sessionToken)return;const definition=getDefinition(record);const selected=Number(element<HTMLSelectElement>('attack-select').value)||0;closeBattle();battle=definition.special?new ActionSession(definition,20261005,practice,selected):new BattleSession(definition,20261005,practice,selected);scene='battle';sceneKey='';audio.play(definition.music);victoryRecorded=false;}
 catch(e){if(token===sessionToken)showError(e);return;}
 if(token===sessionToken){busy=false;loading.hidden=true;input.clear();clock.reset();}
}
function addHitbox(name:string,x:number,y:number,w:number,h:number,run:()=>void){const button=document.createElement('button');button.className='hitbox';button.setAttribute('aria-label',name);button.style.cssText=`left:${x/6.4}%;top:${y/4.8}%;width:${w/6.4}%;height:${h/4.8}%`;button.addEventListener('click',()=>{audio.unlock();run();sceneKey='';});overlay.append(button);}
function updateControls(){
 const key=[scene,chapter,selection,battle?.phase,battle?.actor,battle?.cursor,battle?.paused,busy].join(':');
 if(key===sceneKey)return;sceneKey=key;overlay.replaceChildren();element('menu-tools').hidden=scene!=='menu';element('pause').hidden=scene!=='battle';element('back').hidden=scene==='intro';
 if(scene==='intro'){addHitbox('Connect device',70,60,500,360,()=>{scene='room';});status.textContent='LOCAL SIGNAL';}
 if(scene==='room'){
  for(let i=1;i<=5;i++)addHitbox('Chapter '+i,175,112+(i-1)*32,270,31,()=>{chapter=i;selection=0;scene='menu';});status.textContent='DEVICE_MENU';
 }
 if(scene==='menu'){
  const rows=menuRecords(),start=Math.floor(selection/8)*8;for(let i=0;i<8;i++){const record=rows[start+i];if(record)addHitbox(`Battle ${record.name} ${record.id}`,30,104+i*35,345,31,()=>{selection=start+i;void startBattle(false);});}
  if(rows.length>8){addHitbox('Previous encounters',410,402,84,27,()=>{selection=start===0?Math.floor((rows.length-1)/8)*8:start-8;});addHitbox('Next encounters',510,402,94,27,()=>{selection=start+8>=rows.length?0:start+8;});}
  const select=element<HTMLSelectElement>('attack-select');select.replaceChildren();for(const [i,a]of getDefinition(rows[selection]).attacks.entries()){const opt=document.createElement('option');opt.value=String(i);opt.textContent=a.name;select.append(opt);}
  status.textContent=`CHAPTER ${chapter} / ${rows.length} ENCOUNTERS`;
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
 frame++;if(busy)return;if(element<HTMLDialogElement>('about').open){input.clear();return;}const keys=input.read();
 if(scene==='intro'&&keys.confirm){audio.unlock();scene='room';sceneKey='';}
 else if(scene==='room'){
  if(frame-keyCooldown>10&&(keys.y||keys.x)){chapter=(chapter-1+(keys.y||keys.x)+5)%5+1;keyCooldown=frame;sceneKey='';}
  if(keys.confirm){selection=0;scene='menu';sceneKey='';}
  if(keys.cancel){scene='intro';sceneKey='';}
 }else if(scene==='menu'){
  const rows=menuRecords();if(frame-keyCooldown>9&&keys.y){selection=(selection+keys.y+rows.length)%rows.length;keyCooldown=frame;sceneKey='';}
  if(frame-keyCooldown>10&&keys.x){chapter=(chapter-1+keys.x+5)%5+1;selection=0;keyCooldown=frame;sceneKey='';}
  if(keys.confirm)void startBattle();if(keys.cancel){scene='room';sceneKey='';}
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
 if(renderer){if(scene==='intro')renderer.intro(frame);else if(scene==='room')renderer.room(chapter,catalog.length);else if(scene==='menu')renderer.menu(menuRecords(),selection,chapter,frame,prefs.completed);else if(battle)renderer.battle(battle,prefs.reducedEffects);}
 raf=requestAnimationFrame(loop);
}
input.bind(window,()=>{if(battle){battle.pause(true);audio.pause(true);}clock.reset();sceneKey='';});
document.addEventListener('visibilitychange',()=>{input.clear();clock.reset();last=0;if(document.hidden&&battle){battle.pause(true);audio.pause(true);sceneKey='';}});
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||element<HTMLDialogElement>('about').open||(e.target instanceof HTMLElement&&e.target.closest('select,input,textarea,[contenteditable]')))return;audio?.unlock();if(e.key.toLowerCase()==='t'&&scene==='menu'){e.preventDefault();void startBattle(true);}});
window.addEventListener('pointerdown',()=>audio?.unlock(),{passive:true});
element('back').addEventListener('click',()=>{if(scene==='battle')goMenu();else{sessionToken++;scene='room';sceneKey='';input.clear();}});
element('pause').addEventListener('click',()=>{if(battle){battle.pause(!battle.paused);audio.pause(battle.paused);sceneKey='';}});
element('mute').addEventListener('click',()=>{prefs.muted=!prefs.muted;audio?.setMuted(prefs.muted);updatePreferences();});
element('effects').addEventListener('click',()=>{prefs.reducedEffects=!prefs.reducedEffects;updatePreferences();});
element('practice').addEventListener('click',()=>void startBattle(true));
const dialog=element<HTMLDialogElement>('about');function about(){if(battle){battle.pause(true);audio.pause(true);}input.clear();element('source-summary').textContent=`${catalog.length} kaynak karşılaşma kaydı · 5 bölüm paketi · tüm oyun varlıkları bu bilgisayardan yüklenir.`;element('difference-note').textContent=battle?.definition.differences.join(' ')??'Görseller ve istatistikler yerel oyun dosyalarından çıkarıldı. Saldırılar bosslara özel tarayıcı uyarlamalarıdır; tüm faz ve mekanikler için orijinal oynanışla birebir doğrulama tamamlanmadı.';dialog.showModal();sceneKey='';}
element('credits').addEventListener('click',about);element('adaptation').addEventListener('click',about);element('close-about').addEventListener('click',()=>dialog.close());
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-key]')){
 const key=button.dataset.key!;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);button.classList.add('down');input.press(key);});
 const release=()=>{button.classList.remove('down');input.release(key);};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
}
element('retry').addEventListener('click',()=>{error.hidden=true;if(renderer)void startBattle(false);else void initialize();});
async function initialize(){
 loading.hidden=false;error.hidden=true;try{
  assets=await loadAssets();await assets.preload(1);await Promise.all(['bg','console','tvglow','vessel_d_0'].map(n=>assets.loadImage('/device-room/'+n+'.png')));renderer=new Renderer(ctx,assets);audio=new AudioManager(prefs.muted,assets.manifest.music);updatePreferences();loading.hidden=true;updateControls();if(!raf)raf=requestAnimationFrame(loop);
 }catch(e){showError(e);}
}
void initialize();
