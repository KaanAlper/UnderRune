import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {heart,growtangle,regularBullet,afterimage,battleSolid,heroKris,heroSusie,heroRalsei} from '../src/remake/deltarune/battle';
import {cloverBulletController,clubsBullet,clubsBulletDark,createCloverEnemy,type CloverHooks} from '../src/remake/bosses/clover';
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
function scene(){const rt=new GmRuntime(bank,{seed:11});rt.globals={monster:[1,0,0],monsterat:[6],monsterhp:[200],monstermaxhp:[270],monsterstatus:[0],monstercomment:[' '],mercymod:[0],mercymax:[100],mnfight:2,myfight:0,msg:[],battlemsg:[],flag:[],charcantarget:[1,1,1],targeted:[]};rt.restore(heart,999,312,162);return rt;}
const hooks=(overrides:Partial<CloverHooks>={}):CloverHooks=>({text:key=>key,writerExists:()=>false,enemySpeech:()=>{},battleText:()=>{},attackPhase:()=>{},defeat:()=>{},monsterSetup:()=>{},...overrides});
const step=(rt:GmRuntime,s:ReturnType<GmRuntime['create']>)=>resolveEvent(s.object,'step')!(s,rt);
describe('Clover original attack objects',()=>{
 it('captures box bounds once and scales spawn pacing with living enemy population',()=>{
  const rt=scene();rt.globals.monster=[1,1,0];const box=rt.create(growtangle,320,170);rt.spriteHeight=()=>130;
  const c=rt.create(cloverBulletController,500,100);expect([c.miny,c.maxy,c.ratio]).toEqual([105,235,1.6]);
  c.type=2;step(rt,c);expect(rt.count(clubsBullet)).toBe(1);expect(rt.first(clubsBullet)?.x).toBe(660);expect(c.btimer).toBe(0);
  box.y=240;for(let i=0;i<31;i++)step(rt,c);expect(rt.count(clubsBullet)).toBe(1);step(rt,c);expect(rt.count(clubsBullet)).toBe(2);expect(c.miny).toBe(105);
 });
 it('consumes exactly one random value for the side attack and keeps its source direction',()=>{
  const rt=scene(),expected=scene().random;const y=150+expected.random(130);const c=rt.create(cloverBulletController,0,0);c.type=2;c.damage=30;c.target=2;step(rt,c);
  const b=rt.first(clubsBullet)!;expect(b.y).toBe(Math.fround(y));expect([b.speed,b.direction,b.imageAngle,b.damage,b.target]).toEqual([12,180,180,30,2]);expect(rt.random.snapshot()).toEqual(expected.snapshot());
 });
 it('splits on the battle box in b/c/a creation order with distinct speed and spread',()=>{
  const rt=scene(),b=rt.create(clubsBullet,390,170);b.speed=12;b.direction=180;b.imageAngle=180;b.damage=30;b.target=2;
  clubsBullet.collisions!.find(c=>c.target===battleSolid)!.run(b,rt.create(battleSolid,320,170),rt);
  expect(b.live).toBe(false);expect(rt.all(regularBullet).map(s=>[s.sprite,s.speed,s.direction,s.imageAngle,s.damage,s.target,s.grazepoints,s.timepoints])).toEqual([
   ['spr_clubsball_b',6,180,180,30,2,3,2],['spr_clubsball_c',4,155,180,30,2,3,2],['spr_clubsball_a',4,205,180,30,2,3,2],
  ]);
 });
 it('alternates dark spawn diagonals without consuming RNG and fires at 15/19/23 only',()=>{
  const rt=scene(),rng=rt.random.snapshot(),c=rt.create(cloverBulletController,0,0);c.type=4;c.damage=30;c.target=1;step(rt,c);
  const d=rt.first(clubsBulletDark)!;expect([d.direction,d.speed,d.friction,d.imageAngle,c.side]).toEqual([135,20,1,135,-1]);
  for(let i=0;i<14;i++)step(rt,d);expect(rt.count(regularBullet)).toBe(0);step(rt,d);expect(rt.count(regularBullet)).toBe(3);
  for(let i=0;i<10;i++)step(rt,d);expect(rt.count(regularBullet)).toBe(9);expect(d.live).toBe(false);expect(rt.count(afterimage)).toBe(1);expect(rt.random.snapshot()).toEqual(rng);
  for(let i=0;i<30;i++)step(rt,c);expect(rt.first(clubsBulletDark)?.direction).toBe(45);
 });
 it('selects its own controller on frame 12, then consumes the battle-message roll',()=>{
  const rt=scene(),expected=scene().random,type=expected.choose(0,1)===0?2:4,message=expected.choose(0,1,2,3,4,5);const enemy=rt.create(createCloverEnemy(hooks()),480,90);enemy.myself=0;enemy.rtimer=0;enemy.mytarget=2;
  for(let i=0;i<11;i++)step(rt,enemy);expect(rt.count(cloverBulletController)).toBe(0);expect(rt.globals.turntimer).toBe(150);step(rt,enemy);
  expect([rt.first(cloverBulletController)?.type,rt.first(cloverBulletController)?.damage,enemy.turns,enemy.attacked]).toEqual([type,30,1,1]);expect(rt.globals.battlemsg[0]).toContain(`_${134+message}_0`);expect(rt.random.snapshot()).toEqual(expected.snapshot());
 });
 it('decelerates the dark club until its first volley and keeps the incoming sprite angle',()=>{
  const rt=scene(),d=rt.create(clubsBulletDark,500,170);d.direction=180;d.speed=20;d.friction=1;d.imageAngle=180;
  for(let i=0;i<14;i++){step(rt,d);d.move();}expect(d.x).toBe(325);expect(d.speed).toBe(6);
  step(rt,d);d.move();expect([d.x,d.y,d.speed,d.imageAngle]).toEqual([325,170,0,180]);
  expect(rt.all(regularBullet).map(b=>[b.speed,b.grazepoints,b.timepoints])).toEqual([[4,2,1],[4,2,1],[4,2,1]]);
 });
 it('split bullets apply inherited soul damage to their source target with party defense',()=>{
  const rt=scene();Object.assign(rt.globals,{char:[1,2,3],hp:[0,90,110,70],maxhp:[0,90,110,70],battledf:[1,2,3],charaction:[0,0,0],inv:-1,invc:1,charinstance:[1000,1001,1002]});
  [heroKris,heroSusie,heroRalsei].forEach((o,i)=>rt.restore(o,1000+i,50,100+i*80,{myheight:40}));
  const b=rt.create(clubsBullet,390,170);b.damage=30;b.target=2;b.speed=12;
  clubsBullet.collisions![0].run(b,rt.create(battleSolid,320,170),rt);const split=rt.first(regularBullet)!;
  rt.userEvent(split,5);expect(rt.globals.hp).toEqual([0,90,110,49]);expect(rt.globals.inv).toBe(40);expect(split.live).toBe(false);
 });
 it('draw advances hurt state and selects the spared sprite while preserving flash timing',()=>{
  const rt=scene(),enemy=rt.create(createCloverEnemy(hooks()),400,120);enemy.myself=0;enemy.state=3;enemy.hurttimer=0;rt.globals.monsterhp[0]=130;
  resolveEvent(enemy.object,'draw')!(enemy,rt);expect(enemy.state).toBe(0);expect(rt.globals.monsterstatus[0]).toBe(1);expect(enemy.siner).toBe(1);
  rt.globals.mercymod[0]=100;enemy.flash=1;enemy.becomeflash=1;resolveEvent(enemy.object,'draw')!(enemy,rt);
  expect([enemy.thissprite,enemy.flash,enemy.becomeflash,enemy.fsiner]).toEqual(['spr_clubs_spared',1,0,1]);
  resolveEvent(enemy.object,'draw')!(enemy,rt);expect(enemy.flash).toBe(0);expect(enemy.fsiner).toBe(2);
 });
 it('awards each successful topic once and makes Clover tired after three disagreements',()=>{
  let writer=false,completed=0;const rt=scene(),enemy=rt.create(createCloverEnemy(hooks({writerExists:()=>writer,battleText:()=>{writer=true;},enemySpeech:()=>{writer=true;},attackPhase:()=>{completed++;rt.globals.myfight=0;}})),480,90);enemy.myself=0;
  for(const act of [3,4,6,6]){rt.globals.myfight=3;enemy.acting=act;step(rt,enemy);writer=false;step(rt,enemy);writer=false;step(rt,enemy);writer=false;step(rt,enemy);}
  expect(rt.globals.mercymod[0]).toBe(120);expect(rt.globals.monsterstatus[0]).toBe(1);expect(completed).toBe(4);
 });
 it('rejects unrelated controller types instead of silently substituting an attack',()=>{const rt=scene(),c=rt.create(cloverBulletController,0,0);c.type=77;expect(()=>step(rt,c)).toThrow(/unsupported.*77/i);});
});
