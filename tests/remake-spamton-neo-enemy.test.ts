import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {GmRuntime,resolveEvent,type GmEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {createNeoEnemy,createNeoEnemyEffects} from '../src/remake/bosses/spamton-neo/enemy';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
import {neoEnemySourceData,neoEnemyUtilityScriptSources} from '../src/remake/bosses/spamton-neo/enemy-source-data';
import {attackScriptSources} from '../src/remake/bosses/spamton-neo/attack-script-source';
import {createNeoAttackObjects} from '../src/remake/bosses/spamton-neo/controller';
import {parseGml} from '../src/source-runtime/gml';
const hasArchive=fs.existsSync('extracted/chapter2_windows/sprites.json')&&fs.existsSync('extracted/chapter2_windows/object-parents.json');

// External host operations are explicit spies, allowing source event tests to verify call order.
// They are not production object definitions or battle substitutes.
function setup(){
 const rt=new GmRuntime(loadSprites(2),{seed:11});
 const metadata=JSON.parse(fs.readFileSync('extracted/chapter2_windows/object-parents.json','utf8'));
 const objects:Record<string,GmObjectDef>=Object.fromEntries(metadata.map((m:any)=>[m.name,{name:m.name,index:m.index,sprite:m.sprite??undefined,depth:m.depth,visible:m.visible}]));
 const calls:{name:string;self:number;args:any[]}[]=[],textKeys:string[]=[];
 const host:NeoSourceHost={
  object:name=>{const def=objects[name];if(!def)throw Error(`Missing canonical ${name}`);return def;},
  text:key=>{textKeys.push(key);return key;},scripts:{...neoEnemyUtilityScriptSources,...attackScriptSources},
  call:(name,s,_rt,args)=>{
   calls.push({name,self:s.id,args});
   if(name==='audio_is_playing')return false;
   if(name.startsWith('snd_')||name.startsWith('mus_')||name==='audio_stop_sound')return 123;
   if(name==='scr_battletext_default'){if(!rt.exists(objects.obj_writer))rt.create(objects.obj_writer,0,0);return;}
   if(['scr_monstersetup','scr_nextact','scr_spellmenu_setup','scr_wincombat','scr_damage_sneo_final_attack','scr_randomtarget','scr_heartcolor','scr_moveheart'].includes(name))return;
   throw Error(`Unexpected host operation ${name}`);
  },
 };
 Object.assign(objects,createNeoEnemyEffects(host));objects.obj_spamton_neo_enemy=createNeoEnemy(host);Object.assign(objects,createNeoAttackObjects(host));
 rt.globals={chapter:2,fighting:0,flag:Array(1000).fill(0),tempflag:Array(100).fill(0),sp:4,
  monster:[1,0,0],monsterhp:[4809,0,0],monstermaxhp:[4809,0,0],monsterat:[13,0,0],monsterdf:[0,0,0],mercymod:[0,0,0],monsterx:[460,0,0],monstery:[80,0,0],hittarget:[0,0,0],
  monsterattackname:['UnspecifiedSneoAttack','',''],monsterstatus:[0,0,0],monstercomment:[' ',' ',' '],monstergold:[0,0,0,0],monsterexp:[0,0,0,0],
  myfight:0,mnfight:0,turntimer:850,typer:72,fc:0,invc:1,inv:-1,
  char:[1,2,3],hp:[0,120,140,100,0],maxhp:[0,120,140,100,0],msg:Array(100).fill(' '),msgno:0,battlemsg:Array(100).fill(' '),targeted:[0,0,0],currentsong:[123,123],batmusic:[123,123],
  canact:[Array(20).fill(0)],actactor:[Array(20).fill(0)],actname:[Array(20).fill('')],actdesc:[Array(20).fill('')],actcost:[Array(20).fill(0)],
 };
 const enemy=rt.create(objects.obj_spamton_neo_enemy,460,80);rt.globals.fighting=1;
 const event=(ev:GmEvent='step')=>resolveEvent(enemy.object,ev)!(enemy,rt);
 return {rt,host,objects,enemy,calls,textKeys,event};
}

describe.skipIf(!hasArchive)('exact NEO enemy archive and strict execution',()=>{
 it('retains every non-debug enemy event and all effect sources byte-for-byte',()=>{
  for(const [name,record] of Object.entries(neoEnemySourceData))for(const [event,source] of Object.entries(record.sources)){
   const archived=fs.readFileSync(`extracted/chapter2_windows/code/gml_Object_${name}_${event}.gml`,'utf8');
   expect(source).toBe(archived);expect(createHash('sha256').update(archived).digest('hex')).toBe((record.hashes as any)[event]);
   expect(()=>parseGml(source)).not.toThrow();
  }
  expect(Object.keys(neoEnemySourceData.obj_spamton_neo_enemy.sources).sort()).toEqual(['Alarm_4','Alarm_6','CleanUp_0','Create_0','Draw_0','Other_10','Other_11','Other_12','Other_13','Other_14','Other_22','Step_0','Step_2'].sort());
 });
 it('creates all native battle state, eight origin anchors and eighteen background strings',()=>{
  const {enemy:s,rt}=setup();
  expect([s.phase,s.turn,s.phaseturn,s.bigshot,s.bigshotcount,s.hellmode,s.f,s.custom_draw]).toEqual([1,0,0,1,0,0,2,1]);
  expect(s.partsprite).toEqual(['spr_sneo_wingl','spr_sneo_arml','spr_sneo_legl','spr_sneo_legr','spr_sneo_body','spr_sneo_head','spr_sneo_armr','spr_sneo_wingr']);
  for(let i=0;i<8;i++){const sp=rt.bank.get(s.partsprite[i])!;expect([s.partxoff[i],s.partyoff[i],s.partvisible[i],s.partweakened[i]]).toEqual([sp.originX*2,sp.originY*2,1,0]);}
  expect(s.partvisible_back).toEqual(Array(18).fill(1));expect(rt.byId(s.hitdetector)?.object.name).toBe('obj_sneo_hitdetector');
  expect([s.resumeinterval,s.songplaying,s.maxvinecount,s.vinebgcount,s.extra_vines]).toEqual([1.715,1,6,18,26]);
 });
 it('executes the complete idle Draw and renders all eight actual parts',()=>{
  const {enemy,rt,event}=setup(),draws:string[]=[],lines:(number|undefined)[][]=[];
  rt.gfx={sprite:n=>draws.push(n),spriteFog:n=>draws.push(n),rect:()=>{},circle:()=>{},text:()=>{},line:(...a)=>lines.push(a)};
  for(let i=0;i<60;i++)event('draw');
  for(const name of enemy.partsprite)expect(draws).toContain(name);
  expect(draws).not.toContain('spr_sneo_example');expect(lines.length).toBeGreaterThan(1000);
  expect(enemy.partblend).toEqual(Array(8).fill(0xffffff));
  expect(enemy.partrot.every(Number.isFinite)).toBe(true);
 });
 it('uses canonical lazy lookup and refuses missing fields, scripts and objects',()=>{
  const {enemy,rt,host}=setup();
  expect(()=>executeNeoSource('missing_value += 1;',enemy,rt,host)).toThrow('Unknown GML variable missing_value');
  expect(()=>executeNeoSource('scr_nonexistent();',enemy,rt,host)).toThrow('Unexpected host operation scr_nonexistent');
  expect(()=>executeNeoSource('instance_create(0, 0, obj_nonexistent);',enemy,rt,host)).toThrow('Missing canonical obj_nonexistent');
  executeNeoSource('alias = id; alias.image_alpha = 0.4; msgsetloc(0, "unused", "test"); msgnextloc("unused", "next");',enemy,rt,host);
  expect(enemy.imageAlpha).toBeCloseTo(.4);expect([rt.globals.msgno,...rt.globals.msg.slice(0,2)]).toEqual([1,'test','next']);
  executeNeoSource('arr[3] = 12; low = arr[0];',enemy,rt,host);expect(enemy.arr).toEqual([0,0,0,12]);expect(enemy.low).toBe(0);
  expect(()=>executeNeoSource('missing = arr[4];',enemy,rt,host)).toThrow('Unknown GML member 4');
 });
 it('returns exact phase helpers and stages first normal talk with the tested chooser',()=>{
  const {enemy,rt,event,objects}=setup();rt.globals.mnfight=1;
  event();expect([enemy.rr,enemy.difficulty,enemy.turn,enemy.phaseturn,enemy.talked]).toEqual([0,1,1,1,.7]);expect(rt.count(objects.obj_battleblcon)).toBe(2);
  expect(enemy.alarm[6]).toBe(1);event('alarm6');expect(enemy.talked).toBe(1);
  event();expect(rt.globals.mnfight).toBe(2);expect(rt.first(objects.obj_growtangle)?.maxxscale).toBe(3.2);
 });
 it.each([[0,1,[0],0],[1,3,[0,1,1],0],[2,1,[0],1]] as const)('releases difficulty%i wireheart from full Draw with source damage/owners', (difficulty,count,types,big)=>{
  const {enemy,rt,event,objects}=setup();enemy.partmode=34;enemy.makeheart=1;enemy.difficulty=difficulty;
  event('draw');const hearts=rt.all(objects.obj_sneo_wireheart);expect(hearts).toHaveLength(count);expect(hearts.map(h=>h.type)).toEqual(types);
  expect(hearts.every(h=>h.boss===enemy.id&&h.target===3&&h.damage===39)).toBe(true);expect(hearts[0].bighearttype).toBe(big);expect(enemy.makeheart).toBe(0);
 });
 it('creates the native monster position and calls setup on Other22, not Other12',()=>{
  const {enemy,rt,event,calls}=setup();event('user12');
  expect(calls.at(-1)?.name).toBe('scr_monstersetup');
  expect(rt.globals.monsterx[0]).toBe(enemy.x+rt.spriteWidth(enemy)/3);expect(rt.globals.monstery[0]).toBe(enemy.y+rt.spriteHeight(enemy)/2);
 });
 it('applies finale proportional damage only to alive present actors and restores target',()=>{
  const {enemy:s,rt,event,calls}=setup();s.target=3;s.damage=65;rt.globals.hp=[0,120,40,-10];rt.globals.inv=-1;event('user2');
  expect(calls.filter(c=>c.name==='scr_damage_sneo_final_attack')).toHaveLength(2);
  expect([s.damage,s.target,rt.globals.inv,s.remdamage]).toEqual([-1,3,40,65]);
 });
 it('replaces finale ACT menu and calls the actual spell menu refresh',()=>{
  const {rt,event,calls}=setup();event('user1');
  expect(rt.globals.canact[0].slice(0,3)).toEqual([1,0,0]);expect(rt.globals.actactor[0][0]).toBe(1);expect(rt.globals.actname[0][0]).toContain('Other_11_gml_7_0');
  expect(calls.at(-1)?.name).toBe('scr_spellmenu_setup');
 });
 it('stops overpower/rumble and restores source soul speed on destruction',()=>{
  const {enemy,rt,calls,host}=setup();host.call=(n,s,r,a)=>{calls.push({name:n,self:s.id,args:a});return n==='audio_is_playing'?true:undefined;};
  // The object captures its strict host call, so change the original function's spy result through a new definition.
  const enemy2=rt.create(createNeoEnemy(host),460,80);rt.destroy(enemy2);
  expect(rt.globals.sp).toBe(4);expect(calls.slice(-4).map(c=>c.name)).toEqual(['audio_is_playing','snd_stop','snd_stop','snd_volume']);expect(enemy.live).toBe(true);
 });
 it('rejects side-B globals before normal-route mutation',()=>{
  const {event,rt}=setup();rt.globals.flag[915]=1;expect(()=>event()).toThrow('side-B source is unavailable');
 });
});

describe.skipIf(!hasArchive)('source normal ACT and ending responsibilities',()=>{
 it('runs Snap for two mercy and source single actor wording',()=>{
  const {enemy,rt,event,textKeys}=setup();rt.globals.myfight=3;enemy.acting=2;event();
  expect(rt.globals.mercymod[0]).toBe(2);expect(enemy.acting).toBe(0);expect(enemy.alarm[4]).toBe(30);expect(textKeys).toContain('obj_spamton_neo_enemy_slash_Step_0_gml_275_1');
 });
 it('runs SnapAll for seven mercy and desperate Snap for four',()=>{
  const all=setup();all.rt.globals.myfight=3;all.enemy.acting=3;all.event();expect(all.rt.globals.mercymod[0]).toBe(7);
  const desperate=setup();desperate.rt.globals.myfight=3;desperate.rt.globals.hp[2]=0;desperate.rt.globals.hp[3]=0;desperate.enemy.acting=2;desperate.event();expect(desperate.rt.globals.mercymod[0]).toBe(4);
 });
 it('stages exactly twenty supercharged shots and native two/four guards',()=>{
  const {enemy,rt,event,objects}=setup();rt.globals.myfight=3;enemy.actingsus=2;enemy.actconsus=1;event();expect([enemy.bigshotcount,enemy.actingsus]).toEqual([20,0]);
  enemy.actingral=2;enemy.actconral=1;event();expect(rt.count(objects.obj_sneo_tiny_ralsei)).toBe(2);expect(rt.all(objects.obj_sneo_tiny_ralsei).map(i=>i.place)).toEqual([0,270]);
  enemy.actingral=2;enemy.actconral=1;event();expect(rt.count(objects.obj_sneo_tiny_ralsei)).toBe(4);expect(rt.all(objects.obj_sneo_tiny_ralsei).map(i=>i.place)).toEqual([0,90,180,270]);
  enemy.actingral=2;enemy.actconral=1;event();expect(rt.count(objects.obj_sneo_tiny_ralsei)).toBe(4);
 });
 it('cuts and transitions strings through EndStep without inventing an early victory',()=>{
  const {enemy,rt,event,objects,calls}=setup();event('draw');rt.globals.mercymod[0]=2;event('endStep');
  expect(rt.count(objects.obj_sneo_vine_cut)).toBe(1);expect(rt.count(objects.obj_sneo_vine_transition)).toBe(1);expect(enemy.prevmercy).toBe(2);expect(enemy.weakentimer).toBe(1);
  expect(calls.some(c=>c.name==='scr_wincombat')).toBe(false);
 });
 it('keeps 99 mercy unavailable as generic victory and ends only at native endcon10',()=>{
  const {enemy,rt,event,calls,objects}=setup();rt.create(objects.obj_battlecontroller,0,0);rt.globals.mercymod[0]=99;event();expect(calls.some(c=>c.name==='scr_wincombat')).toBe(false);
  enemy.endcon=10;event();expect(enemy.endcon).toBe(11);expect(calls.filter(c=>c.name==='scr_wincombat')).toHaveLength(1);expect(rt.first(objects.obj_battlecontroller)?.skipvictory).toBe(1);
 });
 it.each([[0,331,311],[1,450,450]] as const)('runs full normal ending type%i to the source postbattle boundary at timer%i',(version,boundary,frames)=>{
  const {enemy,rt,event,objects,calls}=setup();
  const scene=rt.create(objects.obj_ch2_sceneex2,0,0);Object.assign(scene,{shop_spamton_bg_con:3,trackspeed:-15,cityscape_speed_max:5,cityscape_speed:5,forcend:0,con:12});
  enemy.sneo_defeat_cutscene_version=version;enemy.endcon=4;enemy.ballooncon=0;enemy.talktimer=16;
  rt.globals.hp=[0,-3,0,-2,0];
  for(let n=1;n<frames;n++){event();event('draw');expect(scene.forcend).toBe(0);}
  event();event('draw');expect(enemy.endtimer).toBe(boundary);expect(scene.forcend).toBe(1);expect(scene.con).toBe(13);expect(rt.globals.hp.slice(1,4)).toEqual([1,1,1]);
  expect(calls.some(c=>c.name==='scr_wincombat')).toBe(false);
 });
});
