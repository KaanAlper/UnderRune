import {describe,it,expect} from 'vitest';
import {spriteBank} from '../src/remake/gm/sprites';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {SourceBattle} from '../src/remake/host/battle';
import {heart,heroParent,damage} from '../src/remake/deltarune/battle';
import {BattleView} from '../src/remake/host/view';
import type {AssetStore} from '../src/game/assets';
import type {DrawAssets} from '../src/remake/host/canvas';
const empty={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3,4]};
const source:EquipmentSource={armors:[empty],weapons:[empty],items:[{id:2,name:'ReviveMint',description:'',usable:true,target:1},{id:9,name:'ChocDiamond',description:'',usable:true,target:1}],bagCapacity:12};
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
const create=(id='ch1-25')=>new SourceBattle(bank,source,defaultLoadout(),id);
const advance=(b:SourceBattle,n:number)=>{for(let i=0;i<n;i++){b.step();b.rt.draw();}};
describe('shared source battle flow',()=>{
 it('opens with the party and commands, without an active enemy attack',()=>{
  const b=create();expect(b.phase).toBe('intro');expect(b.rt.count(heroParent)).toBe(3);expect(b.rt.count(heart)).toBe(0);
  advance(b,30);expect(b.phase).toBe('command');expect(b.actor).toBe(0);expect(b.choices.map(c=>c.name)).toEqual(['FIGHT','ACT','ITEM','SPARE','DEFEND']);
 });
 it('returns to commands after defending through a pattern instead of declaring victory',()=>{
  const b=create();advance(b,30);for(let i=0;i<3;i++)b.select(4);
  expect(b.phase).toBe('enemyTalk');b.confirm();advance(b,20);expect(b.phase).toBe('enemy');b.rt.globals.chemg_god_mode=true;
  advance(b,270);expect(b.outcome).toBe(null);expect(b.phase).toBe('command');expect(b.turn).toBe(1);expect(b.rt.count(heart)).toBe(0);
 });
 it('starts the swing immediately but applies damage ten game frames later',()=>{
  const b=create();advance(b,30);for(let i=0;i<3;i++){b.select(0);b.confirm();}
  expect(b.phase).toBe('timing');advance(b,b.bolts[0].frame);const before=b.enemyHp;b.confirm();expect(b.enemyHp).toBe(before);
  expect(b.phase).toBe('timing');expect(b.bolts.some(x=>x.alive)).toBe(true);
  advance(b,9);expect(b.enemyHp).toBe(before);advance(b,1);expect(b.enemyHp).toBeLessThan(before);
 });
 it('Lancer equipment confirmation leads to a real two-person battle and bike attack',()=>{
  const b=create('ch1-2');advance(b,30);expect(b.party).toEqual([1,2]);b.select(4);advance(b,90);b.confirm();advance(b,20);
  expect(b.phase).toBe('enemy');expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_lancerbike')).toBe(true);
 });
 it('uses a prepared battle item once with the game battle healing amount',()=>{
  const l=defaultLoadout();l.items=[9];const b=new SourceBattle(bank,source,l,'ch1-25');advance(b,30);b.rt.globals.hp[1]=10;
  b.select(2);b.select(0);b.select(0);b.select(4);b.select(4);
  expect(b.rt.globals.hp[1]).toBe(60);expect(b.bag).toEqual([]);
 });
 it('navigates the two-column ACT grid spatially',()=>{
  const b=create();advance(b,30);b.rt.globals.tension=250;b.select(1);b.confirm();b.move(0,1);expect(b.cursor).toBe(2);
 });
 it('uses each attacker bolt score for TP rather than Lancer auto-Susie points',()=>{
  const b=create('ch1-2');advance(b,30);b.select(0);b.confirm();const tp=b.rt.globals.tension;advance(b,b.bolts[0].frame);b.confirm();advance(b,10);expect(b.rt.globals.tension-tp).toBe(15);
 });
 it('cancels a previous defender choice and restores reserved TP',()=>{
  const b=create();advance(b,30);b.select(4);expect(b.actor).toBe(1);expect(b.rt.globals.tension).toBe(40);b.cancel();expect(b.actor).toBe(0);expect(b.rt.globals.tension).toBe(0);expect(b.actions[0]).toBeNull();expect(b.heroes[0].faceaction).toBe(0);
 });
 it('battle ReviveMint fully revives a downed member and makes them targetable',()=>{
  const l=defaultLoadout();l.items=[2];const b=new SourceBattle(bank,source,l,'ch1-25');advance(b,30);b.rt.globals.hp[2]=-55;b.rt.globals.charcantarget[1]=0;b.rt.globals.chardead[1]=1;
  b.select(2);b.select(0);b.select(1);b.select(4);expect(b.rt.globals.hp[2]).toBe(110);expect(b.rt.globals.charcantarget[1]).toBe(1);expect(b.rt.globals.chardead[1]).toBe(0);
 });
});

describe('source hit timing and damage feedback',()=>{
 const fight=()=>{const b=create();advance(b,30);for(let i=0;i<3;i++){b.select(0);b.confirm();}return b;};
 const capture=(b:SourceBattle)=>{const sprites:{name:string;frame:number;x:number;y:number;xs:number}[]=[];b.rt.gfx={sprite:(name,frame,x,y,xs)=>sprites.push({name,frame,x,y,xs}),rect:()=>{},circle:()=>{},text:()=>{}};return sprites;};
 it('places the timing target at the original x=82, y=365 lane origin',()=>{
  const b=fight(),sprites=capture(b),c={fillRect:()=>{},strokeRect:()=>{}} as unknown as CanvasRenderingContext2D;
  const assets={text:()=>{},textWidth:()=>0} as unknown as AssetStore,draw={sprite:()=>undefined} as unknown as DrawAssets;
  new BattleView(c,assets,draw).draw(b);expect(sprites.filter(s=>s.name==='spr_pressspot').map(s=>[s.x,s.y])).toEqual([[82,365],[82,403],[82,441]]);
 });
 it.each([[0,150],[1,120],[2,110],[3,94],[14,72],[-4,92]])('scores a displayed bolt at gap %i as %i', (gap,points)=>{
  const b=fight(),bolt=b.bolts[0];b.boltTick=bolt.frame-gap;b.confirm();expect(bolt.points).toBe(points);
 });
 it('shows a yellow burst and three critical swing sparkles for a perfect hit',()=>{
  const b=fight();b.boltTick=b.bolts[0].frame;b.confirm();const burst=b.rt.instances.find(i=>i.object.name==='obj_burstbolt');expect(burst?.imageBlend).toBe(0xffff);expect(burst?.mag).toBe(.2);
  expect(b.rt.instances.filter(i=>i.sprite==='spr_lightfairy')).toHaveLength(3);advance(b,10);expect(b.rt.instances.some(i=>i.object.name==='obj_basicattack'&&i.imageXscale===2.5)).toBe(true);
 });
 it('swings on a miss but causes no damage, TP or enemy hit effect',()=>{
  const b=fight();for(const bolt of b.bolts)bolt.frame=0;advance(b,16);expect(b.enemyHp).toBe(3500);expect(b.tp).toBe(0);
  expect(b.rt.instances.some(i=>i.object.name==='obj_basicattack')).toBe(false);expect(b.rt.instances.some(i=>i.object.name==='obj_dmgwriter'&&i.damage===0&&i.delay===2)).toBe(true);
 });
 it('keeps a wounded hero recoil for the source sixteen frames and restores idle',()=>{
  const b=create();advance(b,30);const sprites=capture(b),bullet=b.rt.create({name:'test',index:999},0,0);Object.assign(bullet,{target:0,damage:20});damage(bullet,b.rt);
  b.rt.draw();expect(sprites.find(s=>s.name==='spr_krisb_hurt')?.x).toBe(60);expect(b.heroes[0].hurt).toBe(1);
  advance(b,15);expect(b.heroes[0].hurt).toBe(1);advance(b,1);expect(b.heroes[0].hurt).toBe(0);advance(b,1);expect(b.heroes[0].sprite).toBe('spr_krisb_idle');
 });
 it('a defender recoils in the defense pose and invulnerability prevents another HP loss',()=>{
  const b=create();advance(b,30);for(let i=0;i<3;i++)b.select(4);const sprites=capture(b),bullet=b.rt.create({name:'test',index:999},0,0);Object.assign(bullet,{target:0,damage:20});damage(bullet,b.rt);b.rt.draw();
  expect(b.rt.globals.hp[1]).toBe(80);expect(sprites.some(s=>s.name==='spr_krisb_defend'&&s.x===60)).toBe(true);damage(bullet,b.rt);expect(b.rt.globals.hp[1]).toBe(80);expect(b.rt.globals.inv).toBe(40);
 });
 it('pausing during the swing freezes the damage alarm',()=>{
  const b=fight();b.boltTick=b.bolts[0].frame;b.confirm();b.paused=true;for(let i=0;i<30;i++)b.step();expect(b.enemyHp).toBe(3500);b.paused=false;advance(b,10);expect(b.enemyHp).toBeLessThan(3500);
 });
 it('lets the lethal damage number and slash finish before showing the outcome',()=>{
  const b=fight();b.enemyHp=1;b.boltTick=b.bolts[0].frame;b.confirm();advance(b,10);
  expect(b.phase).toBe('victory');expect(b.outcome).toBeNull();expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_dmgwriter')).toBe(true);
  advance(b,8);expect(b.outcome).toBeNull();advance(b,90);expect(b.outcome).toBe('victory');expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_dmgwriter')).toBe(false);
 });
 it('stacks tied damage numbers at the source twenty-pixel vertical spacing',()=>{
  const b=fight();for(const bolt of b.bolts)bolt.frame=30;b.boltTick=30;b.confirm();advance(b,10);
  const numbers=b.rt.instances.filter(i=>i.live&&i.object.name==='obj_dmgwriter');expect(numbers.map(n=>n.ystart)).toEqual([200,180]);expect(new Set(numbers.map(n=>n.type)).size).toBe(2);
 });
 it('shakes Lancer in his original hurt sprite after a successful impact',()=>{
  const b=create('ch1-2');advance(b,30);b.select(0);b.confirm();const sprites=capture(b);b.boltTick=b.bolts[0].frame;b.confirm();advance(b,10);
  expect(sprites.some(s=>s.name==='spr_lancerbike_hurt')).toBe(true);expect(b.body.hurttimer).toBe(29);advance(b,2);expect(b.body.shakex).toBe(-8);
 });
 it('Lancer auto-Susie waits for Kris timing, swings sixteen frames later and lands ten frames after that',()=>{
  const b=create('ch1-2');advance(b,30);b.select(0);b.confirm();const sounds:{name:string;pitch:number|undefined}[]=[];b.rt.sound=(name,pitch)=>sounds.push({name,pitch});b.boltTick=b.bolts[0].frame;b.confirm();advance(b,10);const afterKris=b.enemyHp;
  expect(b.heroes[1].pose).toBe('idle');advance(b,5);expect(b.heroes[1].pose).toBe('idle');advance(b,1);expect(b.heroes[1].pose).toBe('attack');expect(b.enemyHp).toBe(afterKris);
  advance(b,10);expect(b.enemyHp).toBe(afterKris-109);expect(sounds.some(s=>s.name==='snd_laz_c'&&s.pitch===.9)).toBe(true);expect(b.heroes[1].sprite).toBe('spr_susieb_attack');
 });
 it('fades the party for Jevil box attacks and restores it for the following diamond attack',()=>{
  const b=create();b.rt.globals.chemg_god_mode=true;advance(b,30);for(let i=0;i<3;i++)b.select(4);b.confirm();advance(b,25);
  expect(b.pattern).toBe(0);expect(b.heroes.map(h=>h.imageAlpha)).toEqual([0,0,0]);advance(b,270);expect(b.heroes.map(h=>h.imageAlpha)).toEqual([1,1,1]);
  for(let i=0;i<3;i++)b.select(4);b.confirm();advance(b,25);expect(b.pattern).toBe(1);expect(b.heroes.map(h=>h.imageAlpha)).toEqual([1,1,1]);
 });
});
