import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmInstance,type GmObjectDef,type GmEvent} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import metadata from '../src/remake/host/chapter4-resources.json';
import {createHammerShield} from '../src/remake/bosses/hammer-of-justice/shield';
const dir='extracted/chapter4_windows/code/',ready=fs.existsSync(dir+'gml_Object_obj_spearblocker_Create_0.gml');
const state=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k,v])=>!['frameCount','layerEntry'].includes(k)&&!(Array.isArray(v)&&!v.length)).map(([k,v])=>[k,k==='object'?v.name:typeof v==='boolean'?Number(v):v]));
function fixture(original:boolean,diagonal:boolean,sound:boolean,bounce:boolean){
 const rt=new GmRuntime(loadSprites(4),{seed:11}),objects=new Map<string,GmObjectDef>();
 const object=(name:string)=>{if(!objects.has(name)){const meta=metadata.find(o=>o.name===name)!;objects.set(name,{name,index:meta.index,sprite:meta.sprite??undefined,depth:meta.depth});}return objects.get(name)!;};
 const definitions=createHammerShield(object);for(const d of definitions)objects.set(d.name,d);
 if(original)for(const d of definitions){d.events={};for(const [event,part] of Object.entries({create:'Create_0',step:'Step_0',draw:'Draw_0',cleanup:'CleanUp_0',user0:'Other_10',user1:'Other_11',user2:'Other_12'})){
  const path=dir+`gml_Object_${d.name}_${part}.gml`;if(fs.existsSync(path))d.events[event as GmEvent]=(s,r)=>executeNeoSource(fs.readFileSync(path,'utf8'),s,r,{object,text:k=>k,scripts:{scr_wrap:fs.readFileSync(dir+'gml_GlobalScript_scr_wrap.gml','utf8')},call:(name,_s,r,a)=>{
   if(name==='sprite_set_offset'){r.setSpriteOffset(a[0],a[1],a[2]);return;}
   if(name==='angle_difference')return (((a[0]-a[1])%360+540)%360)-180;
   const key=({left:37,up:38,right:39,down:40} as Record<string,number>)[name.split('_')[0]];if(key)return name.endsWith('_p')?r.input.pressed.has(key):r.input.held.has(key);
   if(name==='audio_is_playing')return false;if(name==='snd_play')return a[0];if(name==='snd_volume')return;
   if(name==='d_line'){r.drawLine(a[0],a[1],a[2],a[3]);return;}if(name==='d_circle'){r.drawCircle(a[0],a[1],a[2],!!a[3]);return;}
   throw Error(name);
  }},undefined,event as GmEvent);
 }}
 rt.globals={chapter:4,turntimer:500};const heart=rt.create(object('obj_heart'),310,160);heart.color=0;
 const enemy=rt.create(object(sound?'obj_sound_of_justice_enemy':'obj_hammer_of_justice_enemy'),460,161);enemy.diagonal_enabled=diagonal?1:0;enemy.transformsfx=0;
 for(let i=0;i<3;i++){const spear=rt.create(object('obj_spearshot'),100+i*20,100);Object.assign(spear,{bouncespearcon:bounce?1:0,bouncespeartimer:0,bouncespear:i===2?1:0,longspear:i===1?1:0,len:80+i*30,fakespeed:3+i,fadespear:0});}
 const shield=rt.create(object('obj_spearblocker'),320,170);return {rt,shield,object,heart};
}
describe.skipIf(!ready)('Hammer green-soul shield source events',()=>{
 for(const diagonal of [false,true])for(const sound of [false,true])for(const bounce of [false,true])it(`draw movement: diagonal ${diagonal}, alternate ${sound}, bounce ${bounce}`,()=>{
  const a=fixture(false,diagonal,sound,bounce),b=fixture(true,diagonal,sound,bounce),keys=[[],[38],[39],[40],[37],[38,39],[40,37],[40,39],[37,38]];
  for(let f=0;f<150;f++){
   const key=keys[Math.floor(f/8)%keys.length];
   for(const run of [a,b]){run.rt.input.held=new Set(key);run.rt.input.pressed=new Set(f%8===0?key:[]);
    if(f===10||f===40)run.rt.userEvent(run.shield,1);if(f===20)run.rt.userEvent(run.shield,0);
    if(f===30){run.shield.shake=4;run.shield.fadealpha=.5;run.shield.parryflashtimer=8;run.shield.justflash=1;}
    if(f===60)run.shield.frozentimer=4;if(f===70)run.shield.parryflashtimer=1.5;if(f===80)Object.assign(run.shield,{shadowpowerstart:0,shadowpowertarget:.85,shadowpowertimermax:5,shadowpowercon:1});if(f===120)run.shield.vanish=1;
    for(const s of run.rt.all(run.object('obj_spearshot')))s.bouncespeartimer=f;
    run.rt.step();run.rt.draw();
   }
   expect(a.rt.instances.map(state),`frame ${f}`).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect(a.rt.drawState).toEqual(b.rt.drawState);
   expect(a.rt.bank.get('spr_spearblocker')!.originX).toBe(b.rt.bank.get('spr_spearblocker')!.originX);
  }
  expect(a.shield.live).toBe(false);expect(a.rt.bank.get('spr_spearblocker')!.originX).toBe(32);
 });
});
