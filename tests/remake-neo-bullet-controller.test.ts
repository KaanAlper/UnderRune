import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {installNeoHost} from '../src/remake/host/neo';
import {createSneoBulletController} from '../src/remake/bosses/spamton-neo/bullet-controller';
import {createFlyingHeads,flyingHeadPathEnd} from '../src/remake/bosses/spamton-neo/flying-heads';

function synthetic(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));
 rt.globals={chapter:2,hp:[0,120,140,100],monster:[1,0,0],monsterat:[13],monsterattackname:['Heads','',''],mercymod:[0],turntimer:500,tension:0,maxtension:250};
 const defs:Record<string,GmObjectDef>={};const object=(name:string)=>defs[name]??(defs[name]={name,index:1000+Object.keys(defs).length});
 const n=rt.restore(object('obj_spamton_neo_enemy'),99999,460,80,{myself:0,difficulty:0,hellmode:0,partxoff:[0,5],partyoff:[0,7],partframe:[0,3],vinex:0,___myrememberx:460,___myremembery:80,facebroken:0,faceattackcount:1,eyeshp:16,nosehp:16,mouthhp:16});
 rt.restore(object('obj_growtangle'),99998,300,160);
 defs.obj_sneo_bulletcontroller=createSneoBulletController(object);
 const c=rt.create(defs.obj_sneo_bulletcontroller,0,0);
 const step=()=>resolveEvent(c.object,'step')!(c,rt);
 return {rt,n,c,object,step,defs};
}
function flying(){const s=synthetic();for(const d of createFlyingHeads(s.object))s.defs[d.name]=d;s.c.target=4;return s;}

describe('hand-ported NEO bullet controller',()=>{
 it('preserves caller counters and leaves minx unset until the first box lookup',()=>{
  const {c,step}=synthetic();expect('minx' in c).toBe(false);step();expect([c.__sameattack,c._sameattacki,c.sameattack,c.minx,c.maxx]).toEqual([1,3,1,300,300]);
 });
 it('uses the source fifth-power exit slide and remembers the enemy Y',()=>{
  const {rt,n,c,step}=synthetic();c.type=1;c.init=2;c.atimer=25;rt.globals.turntimer=6;n.y=100;step();
  expect(n.vinex).toBe(48.4375);expect(n.x).toBeCloseTo(596.71875);expect(n.y).toBe(95);
 });
 it('runs normal FlyingHeads difficulty 2 laser timing and Destroy resets',()=>{
  const {rt,n,c,object,step}=synthetic();c.type=0;c.difficulty=2;c.init=2;c.btimer=39;c.damage=65;c.target=4;step();
  const laser=rt.first(object('obj_sneo_biglaser'))!;expect([c.d,laser.damage,laser.target,n.partmode]).toEqual([laser.id,130,4,3]);
  c.btimer=89;step();expect([laser.firecon,laser.active,n.partmode]).toEqual([1,1,12]);rt.destroy(c);expect([n.partframe[1],n.partmode,n.heart_release_con,n.x]).toEqual([0,1,0,460]);
 });
 it('records phonehand damage and caps accumulated mercy at 99 on Destroy',()=>{
  const {rt,n,c}=synthetic();c.type=8.5;rt.globals.hp[2]-=1;c.mercyaccumulated=20;rt.globals.mercymod[0]=90;rt.destroy(c);
  expect(n.nothitduringphonehands).toBe(0);expect(rt.globals.mercymod[0]).toBe(99);
 });
 it('shortens a full-mercy turn before the attack timer runs and rejects unused routes',()=>{
  const {rt,c,step}=synthetic();c.type=1.5;rt.globals.mercymod[0]=100;step();expect([rt.globals.turntimer,c.btimer,c.hearttargettimer]).toEqual([1,100,-1]);
  c.type=2;expect(step).toThrow(/outside the NORMAL source route/);
 });
 it('keeps archived child lookups bound to the migrated controller',()=>{
  const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals={chapter:2,hp:[0,120,140,100],monsterat:[13]};
  const {objects}=installNeoHost(rt);rt.restore(objects.obj_spamton_neo_enemy,99999,460,80,{myself:0,difficulty:0,hellmode:0,partxoff:[0,0],partyoff:[0,0]});
  const c=rt.create(objects.obj_sneo_bulletcontroller,0,0);c.target=4;
  const child=rt.create(objects.obj_sneo_wallbullet_new,400,160);expect(child.target).toBe(4);
 });
 it('uses explicit events and participates in full-state comparisons',()=>{
  const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals.chapter=2;
  const {objects}=installNeoHost(rt),def=objects.obj_sneo_bulletcontroller;
  expect((def as {archived?:boolean}).archived).not.toBe(true);
  for(const event of ['create','step','destroy'] as const)expect(resolveEvent(def,event)).toBeTypeOf('function');
  expect(def.parent?.name).toBe('obj_bulletgenparent');expect(def.visible).toBe(false);
 });
 it('registers all three flying-head objects without archived own events',()=>{
  const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals.chapter=2;
  const {objects}=installNeoHost(rt);
  for(const name of ['obj_sneo_guymaker','obj_sneo_lilguy','obj_sneo_lilguy_bullet'])expect((objects[name] as {archived?:boolean}).archived,name).not.toBe(true);
 });
 it('adjusts face siblings created during user0 before deciding their remaining timers',()=>{
  const {rt,n,c,object,step}=synthetic();c.type=12;c.atimer=19;n.eyeshp=0;n.nosehp=0;
  object('obj_sneo_faceattack').events={create:s=>{s.type=0;s.timer=10;s.init=0;},user0:(_s,r)=>{const f=r.create(object('obj_sneo_faceattack'),0,0);f.type=1;}};
  step();expect(rt.all(object('obj_sneo_faceattack')).map(f=>f.timer)).toEqual([60,30]);expect(c.facetimeincrease).toBe(2);
 });
 it('preserves finale transitions and all seven dollar sizes',()=>{
  const {rt,c,object,step}=synthetic();c.type=9;rt.restore(object('obj_sneo_hitdetector'),99997,0,0,{active:true});step();expect([rt.globals.turntimer,c.btimer,c.special]).toEqual([1200,0,1]);
  c.btimer=44;step();const form=rt.first(object('obj_sneo_final_forme'))!;expect([form.intro,form.speed,form.direction,c.btimer]).toEqual([-1,16.75,180,0]);
  rt.restore(object('obj_sneo_final_forme_hitbox'),99996,0,0);c.btimer=69;step();expect([c.special,form.destroyable,rt.first(object('obj_sneo_warped_box'))!.state]).toEqual([3,1,1]);
  for(let i=0;i<6;i++){c.btimer=9;step();}
  expect(rt.all(object('obj_sneo_dollar')).map(d=>d.startscale)).toEqual([1,1,1.5,1,1,1.5,2]);expect(c.sneodollarcount).toBe(0);
 });
});

describe('hand-ported NEO flying-head events',()=>{
 it('keeps paired-row handles/counters and the asymmetric row-six shooting alarms',()=>{
  for(const row of [3,6]){
   const {rt,object}=flying(),m=rt.create(object('obj_sneo_guymaker'),0,0);m.row=row;m.timer=4;m.firstspawn=1;resolveEvent(m.object,'step')!(m,rt);
   const heads=rt.all(object('obj_sneo_lilguy'));expect(heads).toHaveLength(row===3?2:4);expect(heads.map(h=>h.target)).toEqual(row===3?[4,4]:[4,4,4,4]);
   if(row===3){expect(m.guyi).toBe(2);expect(m.guy).toEqual(heads.map(h=>h.id));}
   else expect(heads.map(h=>h.alarm[1])).toEqual([30,40,30,40]);
  }
 });
 it('shoots at the soul in Alarm 1, then freezes the completed animation and handles path end',()=>{
  const {rt,object}=flying();rt.restore(object('obj_heart'),99997,200,150);const h=rt.create(object('obj_sneo_lilguy'),100,160);h.depth=-7;
  resolveEvent(h.object,'alarm1')!(h,rt);const b=rt.byId(h.bullet)!;expect([h.imageIndex,h.imageSpeed,b.depth,b.bulletspeed]).toEqual([2,1,-8,8]);expect(b.hspeed).toBeGreaterThan(0);expect(b.vspeed).toBeLessThan(0);
  resolveEvent(h.object,'animationEnd')!(h,rt);expect(h.imageSpeed).toBe(0);flyingHeadPathEnd(h,rt);expect(h.live).toBe(false);
 });
 it('continues bullet rotation after an outside-room Destroy',()=>{
  const {rt,object}=flying(),b=rt.create(object('obj_sneo_lilguy_bullet'),-100,0);resolveEvent(b.object,'step')!(b,rt);expect([b.live,b.imageAngle]).toEqual([false,36]);
 });
 it('preserves a charged shot, exposes the cut-effect caller field, and awards source TP',()=>{
  const {rt,object}=flying(),h=rt.create(object('obj_sneo_lilguy'),100,160),shot=rt.restore(object('obj_yheart_shot'),99997,100,160,{big:1});h.destroyable=1;
  h.object.collisions![0].run(h,shot,rt);const a=rt.byId(h.afterimage)!;expect([h.live,shot.live,a.flash,h.hitshot]).toEqual([false,true,true,shot.id]);expect(rt.globals.tension).toBe(1.3);
 });
});
