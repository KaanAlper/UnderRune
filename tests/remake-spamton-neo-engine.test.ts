import {describe,it,expect,beforeEach} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installNeoHost} from '../src/remake/host/neo';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {findController} from '../src/remake/deltarune/controller';
import {heroParent,heart,KEY} from '../src/remake/deltarune/battle';
import {localizationDefaults} from '../tools/source-localization.mjs';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={armors:[gear],weapons:[gear],items:[],bagCapacity:12};
const hasArchive=fs.existsSync('extracted/chapter2_windows/sprites.json')&&fs.existsSync('extracted/chapter2_windows/code');
const sourceLines=hasArchive?Object.assign({},...fs.readdirSync('extracted/chapter2_windows/code').filter(f=>f.endsWith('.gml')).map(f=>localizationDefaults(fs.readFileSync('extracted/chapter2_windows/code/'+f,'utf8')))):{};
beforeEach(()=>setSourceText(sourceLines));
const create=()=>new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-61',11,{development:true,neoHost:installNeoHost});
function frame(b:EngineBattle,n=1){for(let i=0;i<n;i++){b.step();b.rt.draw();}}
function press(b:EngineBattle,key:number){b.rt.input.pressed.add(key);frame(b,4);}
describe.skipIf(!hasArchive)('integrated normal NEO battle',()=>{
 it('starts at the actual coaster snapshot with three heroes and the command panel',()=>{
  const b=create();frame(b,30);const rt=b.rt,g=rt.globals;
  expect(g.chapter).toBe(2);expect(rt.view.x).toBe(1640);expect(rt.count(heroParent)).toBe(3);
  expect(b.enemy?.object.index).toBe(702);expect(findController(rt)?.object.index).toBe(360);
  expect(findController(rt)?.depth).toBe(5);
  expect(rt.instances.filter(s=>s.live&&s.object.name==='o_coaster_hero_sneo')).toHaveLength(3);
  expect([g.myfight,g.mnfight,g.charturn]).toEqual([0,0,0]);expect(g.monsterhp[0]).toBe(4809);
 });
 it('lets all three heroes DEFEND, talks, shoots in yellow mode and returns to commands',()=>{
  const b=create();frame(b,30);const g=b.rt.globals;
  for(let slot=0;slot<3;slot++){for(let i=0;i<4;i++)press(b,KEY.right);press(b,KEY.z);}
  let sawAttack=false,sawSoul=false;
  for(let i=0;i<2200&&!b.outcome;i++){
   if(g.mnfight===1&&i%30===0)b.rt.input.pressed.add(KEY.c);
   frame(b);if(g.mnfight===2)sawAttack=true;
   const soul=b.rt.first(heart);if(soul&&soul.color===1){sawSoul=true;b.rt.input.held.add(KEY.z);}
   if(sawAttack&&g.myfight===0&&g.mnfight===0)break;
  }
  expect(sawAttack,JSON.stringify({phase:[g.myfight,g.mnfight,g.charturn,g.bmenuno],actions:g.charaction,enemy:b.enemy&&[b.enemy.talked,b.enemy.actcon],controller:findController(b.rt)?.alarm,coord:g.bmenucoord[0]})).toBe(true);expect(sawSoul).toBe(true);expect(b.turn).toBe(1);expect(b.outcome).toBeNull();
 });
 it.each([[6,0],[6,1],[2,0],[2,1],[2,2],[8,0],[8,1],[8,3],[8.5,0],[8.5,1],[8.5,2],[7,0],[9,0],[0,3]])('runs native attack rr%s difficulty%s through the full host',(rr,difficulty)=>{
  const b=create();frame(b,30);const g=b.rt.globals,e=b.enemy!;
  e.attackdebug=rr;e.difficultydebug=difficulty;g.myfight=-1;g.mnfight=1;
  let attacked=false;
  for(let i=0;i<2300&&!b.outcome;i++){
   if(g.mnfight===1&&i%30===0)b.rt.input.pressed.add(KEY.c);
   // Keep the test alive without suppressing source collision/damage calls.
   for(const c of g.char)g.hp[c]=g.maxhp[c];
   frame(b);if(g.mnfight===2)attacked=true;
   if(attacked&&g.mnfight===0&&g.myfight===0)break;
  }
  expect(attacked).toBe(true);expect(b.turn).toBe(1);expect(b.outcome).toBeNull();
 },20000);
 it.each(['violent','pacifist'])('completes the %s source ending at its real scene boundary',(ending)=>{
  const b=create();frame(b,30);const g=b.rt.globals,e=b.enemy!;
  g.myfight=-1;g.mnfight=1;if(ending==='violent')g.monsterhp[0]=0;else {g.mercymod[0]=100;e.endcon=1;}
  for(let i=0;i<2000&&!b.outcome;i++){if(i%30===0)b.rt.input.pressed.add(KEY.c);if(i%30===15)b.rt.input.pressed.add(KEY.z);frame(b);}
  expect(b.outcome,JSON.stringify({endcon:e.endcon,endtimer:e.endtimer,balloon:e.ballooncon})).toBe('victory');
 },20000);
 it.each([['SnapAll',1,3],['Supercharge',2,2],['FluffyGuard',3,2]] as const)('runs %s with its original ACT sprites through the host',(_name,char,act)=>{
  const b=create();frame(b,30);const g=b.rt.globals,e=b.enemy!;g.myfight=3;g.tension=250;
  e[char===1?'acting':char===2?'actingsus':'actingral']=act;
  if(char!==1)e[char===2?'actconsus':'actconral']=1;
  for(let i=0;i<150;i++){if(i%30===0)b.rt.input.pressed.add(KEY.z);frame(b);if(g.myfight!==3)break;}
  if(char===1)expect(g.mercymod[0]).toBe(7);if(char===2)expect(e.bigshotcount).toBe(20);if(char===3)expect(b.rt.instances.filter(s=>s.live&&s.object.name==='obj_sneo_tiny_ralsei')).toHaveLength(2);
 });
});
