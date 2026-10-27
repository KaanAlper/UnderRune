import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmInstance,type GmObjectDef} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {initializeHammer} from '../src/remake/bosses/hammer-of-justice/init';
import {buildHammerPattern} from '../src/remake/bosses/hammer-of-justice/patterns';
import {stepHammer} from '../src/remake/bosses/hammer-of-justice/step';
import {type HammerSceneScripts,nativeSceneValue} from '../src/remake/bosses/hammer-of-justice/scene-context';
import {setSourceText} from '../src/remake/host/text';
import resources from '../src/remake/host/chapter4-resources.json';
const file='extracted/chapter4_windows/code/gml_Object_obj_hammer_of_justice_enemy_Step_0.gml',ready=fs.existsSync(file);
// The decompiler emits a function reference for scr_debug. Public builds have debug disabled.
const original=ready?fs.readFileSync(file,'utf8').replace('if (scr_debug &&','if (false &&'):'';
const names:Record<string,keyof HammerSceneScripts>={scr_spellmenu_setup:'spellMenu',scr_heroblcon:'heroBalloon',scr_enemyblcon:'enemyBalloon',scr_isphase:'phase',scr_randomtarget:'randomTarget',scr_moveheart:'moveHeart',scr_turntimer:'turnTimer',scr_speaker:'speaker',scr_shakeobj:'shakeObject',mus_volume:'musicVolume',mus_fade:'musicFade',snd_play:'play',snd_loop:'loop',snd_volume:'soundVolume',snd_stop:'stop',snd_play_x:'playAt',snd_pitch:'pitch',scr_terminate_writer:'terminateWriter',scr_nextact:'nextAct',scr_enemy_hurt:'hurt',scr_spearshot:'spearShot',scr_afterimage:'afterimage',scr_fadeout:'fade',scr_mnendturn:'endTurn',scr_battle_sprite_set:'battleSpriteSet',scr_wincombat:'win'};
function fixture(){
 const rt=new GmRuntime(loadSprites(4),{seed:23}),defs=new Map(resources.map(d=>[d.name,{...d,parent:undefined,sprite:d.sprite??undefined,mask:d.mask??undefined} as GmObjectDef]));
 for(const d of resources)if(d.parent)defs.get(d.name)!.parent=defs.get(d.parent);
 const object=(n:string)=>{const d=defs.get(n);if(!d)throw Error(n);return d;};
 const g:Record<string,any>=rt.globals={chapter:4,flag:Array(9999).fill(0),spell:[[],[],Array(12).fill(0)],invc:1,inv:30,mercymod:[0,0,0],sp:0,automiss:[0,0,0],canactsus:[[]],actnamesus:[[]],actsimulsus:[[]],actactorsus:[[]],actcostsus:[[]],battlespell:[[],[]],battleactcount:[0,0,0],battlespellname:[[],[]],battlespelldesc:[[],[]],monster:[1,0,0],monstery:[180],monsterx:[460],typer:0,mnfight:-1,myfight:-1,fc:0,hp:[0,200,230,180],maxhp:[0,200,230,180],battlemsg:Array(10).fill(''),turntimer:500,charturn:0,batmusic:[0,99],fighting:1,mag:[0,0,3,14],msg:Array(100).fill(''),msgno:0};
 rt.create(object('obj_battlecontroller'),0,0);rt.create(object('obj_herosusie'),108,149);
 const s=rt.create(object('obj_hammer_of_justice_enemy'),460,161);setSourceText(new Proxy({},{get:(_o,k)=>String(k)}));initializeHammer(s,rt,object);s.myself=0;
 const calls:any[]=[],scripts=Object.fromEntries(Object.values(names).map(name=>[name,(self:GmInstance,...args:any[])=>{
  calls.push([name,self.id,...args.map(nativeSceneValue)]);
  if(name==='phase')return ({enemytalk:1,bullets:2} as Record<string,number>)[args[0]]===g.mnfight;
  if(name==='heroBalloon'||name==='enemyBalloon'){
   rt.create(object('obj_writer'),0,0);return rt.create(object('obj_battleblcon'),name==='heroBalloon'?108:args[0],name==='heroBalloon'?149:args[1]).id;
  }
  if(name==='afterimage'){self.afterimage=rt.create(object('obj_afterimage'),self.x,self.y).id;return;}
  if(name==='fade'){rt.create(object('obj_fadeout'),0,0);return;}
  if(name==='terminateWriter')return 1;
  if(['play','loop','playAt'].includes(name))return 700;
 }])) as unknown as HammerSceneScripts;
 object('obj_hammer_of_justice_enemy').events={user0:(s,r)=>buildHammerPattern(s,r)};
 return {rt,g,s,object,scripts,calls};
}
const state=(run:ReturnType<typeof fixture>)=>({g:run.g,random:run.rt.random.snapshot(),calls:run.calls,instances:run.rt.instances.map(s=>Object.fromEntries(Object.entries(s).filter(([k])=>!['frameCount','layerEntry'].includes(k)).map(([k,v])=>[k,k==='object'?v.name:typeof v==='boolean'?Number(v):v])))});
function compare(prepare:(run:ReturnType<typeof fixture>)=>void,frames=1,expectedError?:RegExp){
 const a=fixture(),b=fixture();prepare(a);prepare(b);
 for(let f=0;f<frames;f++){
  const runA=()=>stepHammer(a.s,a.rt,a.object,a.scripts);
  const runB=()=>executeNeoSource(original,b.s,b.rt,{object:b.object,text:k=>k,call:(name,self,_rt,args)=>{if(name==='sprite_set_offset')return b.rt.setSpriteOffset(args[0],args[1],args[2]);const mapped=names[name];if(!mapped)throw Error(name);return (b.scripts[mapped] as any)(self,...args);}});
  if(expectedError){expect(runA).toThrow(expectedError);expect(runB).toThrow(expectedError);}else{runA();runB();}
  expect(state(a)).toEqual(state(b));
 }
 return a;
}
describe.skipIf(!ready)('Hammer source Step at explicit child-script boundaries',()=>{
 it('initializes command state and invulnerability cap',()=>{compare(()=>{});});
 for(const act of ['actcon','actconsus','actconral'])it(`ends ACT text for ${act}`,()=>{const a=compare(({s,g})=>{g.myfight=3;s[act]=20;});expect(a.s.actcon).toBe(1);expect(a.calls.map(c=>c[0])).toContain('nextAct');});
 it('delegates the source hurt timer to Step',()=>{const a=compare(({s})=>{s.state=3;});expect(a.calls.map(c=>c[0])).toContain('hurt');});
 for(const turn of Array.from({length:21},(_,i)=>i))for(const hit of [0,1])it(`starts turn ${turn}, prior hits ${hit}`,()=>{compare(({s,g})=>{s.turn=turn;s.trueturn=turn;s.gothitlastturn=hit;g.mnfight=1;},2);});
 for(const balloon of [0,1,2,2.5,2.8,2.9,3,4,10,10.1,10.2,11,11.5,...Array.from({length:32},(_,i)=>i+23)])it(`continues source dialogue ${balloon}`,()=>{
  // Source-only orphan dialogue states 31/32 refer to fields absent from Create. Normal turn selection skips them.
  compare(({s,g,rt,object})=>{s.talked=.6;s.ballooncon=balloon;s.talktimer=30;g.mnfight=1;rt.input.pressed.add(67);rt.create(object('obj_writer'),0,0);},balloon===31||balloon===32?1:2,balloon===31?/dialogue_string33/:balloon===32?/dialogue_string34/:undefined);
 });
 for(const field of ['justice_attacked_twice','justice_healed','justice_rudebuster','justice_item','progress25','progress50','progress75','default'])it(`bullet entry status ${field}`,()=>{
  compare(({s,g})=>{g.mnfight=2;s.rtimer=11;if(field==='justice_attacked_twice')g.justice_attacked_twice=2;else if(field.startsWith('progress'))s.progress=Number(field.slice(8));else if(field!=='default')s[field]=1;},2);
 });
 for(const con of [1,1.1,1.2,2])it(`Rude Buster response ${con}`,()=>{compare(({s,rt})=>{s.susiehitbyrudebustercon=con;s.talktimer=30;rt.input.pressed.add(67);},2);});
 for(const attackcon of [1,2,3])for(const blocked of [false,true])it(`queue state ${attackcon}, writer ${blocked}`,()=>{
  compare(({s,rt,object})=>{buildHammerPattern(s,rt);s.attackcon=attackcon;s.attackcount=attackcon===1?0:1;if(blocked)rt.create(object('obj_writer'),0,0);},12);
 });
 for(const side of [1,2])it(`pushes box and heart in direction ${side}`,()=>{compare(({s,rt,object})=>{s.hitbox_con=side;rt.create(object('obj_growtangle'),320,180);rt.create(object('obj_heart'),320,180);});});
 for(const event of [2,3,4,5])it(`progress stars in post-turn event ${event}`,()=>{compare(({s})=>{s.postenemyturnevent=event;},32);});
 it('laughs and restores idle pose',()=>{compare(({s})=>{s.mercylaughcon=1;s.mercylaughcount=8;},20);});
 for(const balloon of [0,1,2,3,4])it(`first lesson balloon ${balloon}`,()=>{compare(({s,g,rt})=>{s.introtalkcon=1;s.ballooncon=balloon;s.talktimer=30;g.mnfight=2;rt.input.pressed.add(67);},2);});
 it('original ending flags and fade',()=>{compare(({s})=>{s.endcon=1;s.end_cutscene_version=0;},65);});
 it('alternate ending awards source magic and victory flag',()=>{const a=compare(({s})=>{s.end_cutscene_version=1;s.endcon=5;s.endtimer=104;});expect(a.g.mag[2]).toBe(7);expect(a.g.flag[1569]).toBe(1);expect(a.calls.some(c=>c[0]==='win')).toBe(true);});
 for(const con of [1,2,3,4,5])it(`alternate ending ${con} preserves frame order and child contracts`,()=>{compare(({s})=>{s.end_cutscene_version=1;s.endcon=con;s.endtimer=0;},110);});
 for(const final of [false,true])for(const used of [false,true])it(`enemy turn expires, final ${final}, used ${used}`,()=>{compare(({s,g})=>{s.reachedendphase=Number(final);s.have_used_final_attack=used;s.attacked=1;g.mnfight=2;g.turntimer=0;});});
});
