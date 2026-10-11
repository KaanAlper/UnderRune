import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent} from '../src/remake/gm/runtime';
import {GmRandom} from '../src/remake/gm/random';
import {spriteBank,type RawSprite} from '../src/remake/gm/sprites';
import {heart,growtangle,regularBullet,afterimage,heroKris,heroRalsei,heroSusie} from '../src/remake/deltarune/battle';
import {checkersLeap,checkersEnemy,startCheckersAttack,bowCrown} from '../src/remake/bosses/kround/attacks';
import {throwTarget,throwRalsei,ralseiThrown} from '../src/remake/bosses/kround/throw';
import {checkersStep} from '../src/remake/bosses/kround/controller';
import {checkersFlash,checkersHealAnim,flashCheckers} from '../src/remake/bosses/kround/effects';

const sprite=(name:string,width=60,height=80,frames=8):RawSprite=>({name,width,height,frames,originX:0,originY:0,bboxMode:1,left:0,right:width-1,top:0,bottom:height-1,sepMasks:0,special:false,playbackSpeed:1,playbackType:0});
const setup=()=>{
 const sprites=['spr_checkers_idle','spr_checkers_crouch','spr_checkers_leap','spr_checkers_magnificent','spr_checkers_leg'].map(n=>sprite(n));
 sprites.push(sprite('spr_battlebg_0',100,100),sprite('spr_checkershrapnel',8,8),sprite('spr_dodgeheart',16,16),sprite('spr_dodgeheartmask',16,16));
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites}),{seed:11});
 rt.globals={flag:[],hp:[0,90,110,70],maxhp:[0,90,110,70],char:[1,3,2],charinstance:[],battledf:[0,0,0],charaction:[0,0,0],faceaction:[0,0,0],charcantarget:[1,1,1],targeted:[],monster:[1],monstertype:[10],monsterat:[7.5],monsterx:[500],monstery:[120],inv:-1,invc:1,turntimer:999,tension:0,maxtension:250,kroundThrowHost:{text:()=>{},clearWriters:()=>{}}};
 rt.create(heart,302,160);const box=rt.create(growtangle,320,170);box.imageXscale=2;box.imageYscale=2;box.imageSpeed=0;
 const boss=rt.create(checkersEnemy,480,70);boss.myself=0;
 return {rt,boss,leap:rt.create(checkersLeap,480,70)};
};
const step=(rt:GmRuntime,n=1)=>{for(let i=0;i<n;i++)rt.step();};
const eventStep=(rt:GmRuntime,i:ReturnType<GmRuntime['create']>)=>resolveEvent(i.object,'step')!(i,rt);

describe('K.Round source attack events',()=>{
 it('crouches for nineteen frames, then jumps with the first-jump velocity and gravity',()=>{
  const {rt,leap}=setup();step(rt,19);expect(leap.jumpcon).toBe(0);expect(leap.y).toBe(70);
  step(rt);expect(leap.jumpcon).toBe(1);expect(leap.vspeed).toBe(-16);expect(leap.y).toBe(54);expect(leap.gravity).toBe(1);
  expect(leap.hspeed).toBeCloseTo((310-60-480)/28,5);
 });
 it('lands a plunge, creates its afterimage before six shrapnel, and consumes both random values per shard',()=>{
  const {rt,leap}=setup();Object.assign(leap,{leapmode:1,jumpcon:3,damage:37.5,target:2,y:200,sprite:'spr_checkers_leap'});
  const rng=GmRandom.restore(rt.random.snapshot());const expected=Array.from({length:6},(_,i)=>({direction:Math.fround(130-rng.random(10)-70*i/5),speed:Math.fround(6+rng.random(1))}));
  eventStep(rt,leap);const shards=rt.all(regularBullet);expect(shards).toHaveLength(6);expect(rt.count(afterimage)).toBe(1);
  expect(rt.first(afterimage)!.id).toBeLessThan(shards[0].id);
  shards.forEach((b,i)=>{expect(b.direction).toBe(expected[i].direction);expect(b.speed).toBe(expected[i].speed);expect(b.damage).toBe(37.5);expect(b.target).toBe(2);expect(b.gravity).toBe(.25);});
  expect(rt.random.snapshot()).toEqual(rng.snapshot());expect(leap.jumpcon).toBe(0);expect(leap.y).toBe(110);
 });
 it('consumes the falling-shard gravity RNG even when the seventh shard aims at the soul',()=>{
  const {rt,leap}=setup();Object.assign(leap,{leapmode:2,jumpcon:2,siner:0,s_timer:23,magamt:6,sprite:'spr_checkers_magnificent'});
  const rng=GmRandom.restore(rt.random.snapshot());rng.random(60);rng.random(180);eventStep(rt,leap);
  const b=rt.first(regularBullet)!;expect(b.gravity).toBe(0);expect(b.speed).toBe(3);expect(leap.magamt).toBe(7);expect(leap.s_timer).toBe(21);expect(rt.random.snapshot()).toEqual(rng.snapshot());
 });
 it('emits the leg kick only on image three, including random(0), with four original shards',()=>{
  const {rt,leap}=setup();Object.assign(leap,{leapmode:3,jumpcon:1,imageIndex:3,damage:40,target:1});
  const rng=GmRandom.restore(rt.random.snapshot());for(let i=0;i<4;i++){rng.random(i*20);rng.random(1.8);}eventStep(rt,leap);
  expect(rt.count(regularBullet)).toBe(4);expect(rt.random.snapshot()).toEqual(rng.snapshot());
  eventStep(rt,leap);expect(rt.count(regularBullet)).toBe(8); // event runs twice if animation is deliberately held at frame 3
 });
 it('fades the kick bullets only after the final pause and restores the enemy at frame thirty',()=>{
  const {rt,boss,leap}=setup();boss.visible=false;Object.assign(leap,{leapmode:3,jumpcon:3,jumptimer:18});const b=rt.create(regularBullet,320,170);
  eventStep(rt,leap);expect(b.active).toBe(1);eventStep(rt,leap);expect(b.active).toBe(0);expect(b.imageAlpha).toBeCloseTo(.9);
  for(let i=0;i<10;i++)eventStep(rt,leap);expect(leap.live).toBe(false);expect(boss.visible).toBe(true);expect(rt.globals.turntimer).toBe(-1);
 });
 it('retains the unused native mode4 return jump without selecting it from the normal cycle',()=>{
  const {rt,leap}=setup();Object.assign(leap,{leapmode:4,amt:3,jumptimer:15,x:300});eventStep(rt,leap);
  expect(leap.jumpcon).toBe(3);expect(leap.active).toBe(0);expect(leap.hspeed).toBe(15);expect(leap.gravity).toBe(2);
 });
 it('selects 0,3,1,2, copies AT*5 and refuses to duplicate a live attack',()=>{
  const {rt,boss,leap}=setup();rt.destroy(leap);boss.mytarget=1;
  const modes=[];for(let i=0;i<4;i++){const a=startCheckersAttack(boss,rt)!;modes.push(a.leapmode);expect(a.damage).toBe(37.5);expect(a.target).toBe(1);expect(startCheckersAttack(boss,rt)).toBeUndefined();rt.destroy(a);}
  expect(modes).toEqual([0,3,1,2]);expect(boss.attacktype).toBe(0);
 });
 it('keeps the giant on soul contact and uses its own active switch',()=>{
  const {rt,leap}=setup();leap.target=3;leap.damage=20;rt.userEvent(leap,5);expect(rt.globals.hp.slice(1)).toEqual([70,90,50]);expect(leap.live).toBe(true);
  rt.globals.inv=-1;leap.active=0;const hp=[...rt.globals.hp];rt.userEvent(leap,5);expect(rt.globals.hp).toEqual(hp);
 });
 it('applies single bow amounts per variant and only allows deep bow on the first encounter',()=>{
  const {boss}=setup();expect(bowCrown(boss,false)).toBe(15);expect(bowCrown(boss,true)).toBe(35);
  boss.secondtime=1;expect(bowCrown(boss,false)).toBe(53);expect(()=>bowCrown(boss,true)).toThrow(/throw/i);
 });
 it('dispatches inherited collide-bullet contact through the runtime without removing the giant',()=>{
  const {rt,leap}=setup();const kris=rt.create(heroKris,50,100);kris.myheight=60;rt.globals.charinstance[0]=kris.id;
  Object.assign(leap,{x:302,y:160,jumptimer:0,target:0,damage:20});step(rt);
  expect(rt.globals.hp[1]).toBe(70);expect(leap.live).toBe(true);expect(rt.globals.inv).toBe(40);
 });
 it('resets the giant graze flag after ten frames and does not shorten the turn on external destruction',()=>{
  const {rt,boss,leap}=setup();leap.grazed=1;for(let i=0;i<9;i++)eventStep(rt,leap);expect(leap.grazed).toBe(1);
  eventStep(rt,leap);expect(leap.grazed).toBe(0);expect(leap.grazetimer).toBe(0);
  boss.visible=false;rt.destroy(leap);expect(rt.globals.turntimer).toBe(999);expect(boss.visible).toBe(false);
 });
});

describe('K.Round source throw objects',()=>{
 it('creates the crown target before its crownless body, and a single hit awards crown progress once',()=>{
  const {rt,boss}=setup();const crown=rt.create(throwTarget,480,70);expect(rt.all(throwTarget).map(t=>[t.good,t.sprite])).toEqual([[1,'spr_checkers_crown'],[0,'spr_checkers_idle_crownless']]);
  const ral=rt.create(ralseiThrown,300,100);const collision=ralseiThrown.collisions![0].run;
  collision(ral,crown,rt);collision(ral,rt.all(throwTarget)[1],rt);expect(boss.crown).toBe(35);expect(crown.con).toBe(5);expect(ral.collided).toBe(1);
 });
 it('awards twenty for a body hit and sends Ralsei back with the source rebound motion',()=>{
  const {rt,boss}=setup();rt.create(throwTarget,480,70);const body=rt.all(throwTarget)[1];const ral=rt.create(ralseiThrown,300,100);
  ralseiThrown.collisions![0].run(ral,body,rt);expect(boss.crown).toBe(20);expect(ral.hspeed).toBe(-12);expect(ral.vspeed).toBe(-4);expect(ral.gravity).toBe(.5);expect(ral.con).toBe(2);
 });
 it('requires an angle press and visible power preview before a second press throws',()=>{
  const {rt}=setup();rt.create(heroSusie,50,180);rt.create(heroRalsei,50,240);rt.create(heroKris,50,100);const sus=rt.create(throwRalsei,50,180);
  rt.input.pressed.add(67);eventStep(rt,sus);expect(sus.throwready).toBe(1);expect(sus.angle).toBe(2);expect(sus.mypower).toBe(15.6);expect(rt.count(ralseiThrown)).toBe(0);
  rt.input.pressed.clear();for(let i=0;i<8;i++)rt.draw();expect(sus.throwalpha).toBe(1);
  rt.input.pressed.add(67);eventStep(rt,sus);expect(rt.count(ralseiThrown)).toBe(1);const ral=rt.first(ralseiThrown)!;expect(ral.speed).toBeCloseTo(15.6);expect(ral.direction).toBe(2);expect(ral.gravity).toBe(1);expect(sus.angledraw).toBe(0);
 });
 it('rejects a missing dialogue adapter and restores all hidden actors when Ralsei returns',()=>{
  const {rt,boss}=setup();const sus=rt.create(throwRalsei,50,180);delete rt.globals.kroundThrowHost;rt.input.pressed.add(67);
  expect(()=>eventStep(rt,sus)).toThrow(/dialogue callbacks/);rt.input.pressed.clear();
  rt.globals.kroundThrowHost={text:()=>{},line:()=>{}};const ralHero=rt.create(heroRalsei,50,240),susHero=rt.create(heroSusie,50,180);
  ralHero.visible=false;susHero.visible=false;boss.visible=false;rt.create(throwTarget,480,70);
  const ral=rt.create(ralseiThrown,40,240);ral.con=10;ral.collided=1;eventStep(rt,ral);
  expect(ralHero.visible).toBe(true);expect(susHero.visible).toBe(true);expect(boss.actcon).toBe(1);expect(boss.visible).toBe(true);
  expect(rt.count(throwTarget)).toBe(0);expect(rt.count(throwRalsei)).toBe(0);expect(ral.live).toBe(false);
 });
 it('draws twelve source preview circles/segments and advances alpha in Draw, independently of Step',()=>{
  const {rt}=setup();const segments:number[][]=[];rt.drawLine=(x1,y1,x2,y2,width)=>segments.push([x1,y1,x2,y2,width!,rt.drawState.color,rt.drawState.alpha]);
  const sus=rt.create(throwRalsei,50,180);eventStep(rt,sus);sus.throwready=1;rt.draw();
  expect(segments).toHaveLength(12);expect(segments[0].slice(0,5)).toEqual([120,191,120+sus.lx*2,210+sus.ly*2+sus.ralyoff[2]-20,2]);
  expect(sus.throwalpha).toBe(.125);expect(segments[0][6]).toBe(.125);
 });
 it('dismisses the power writer on the second press before creating the projectile',()=>{
  const {rt}=setup();const sus=rt.create(throwRalsei,50,180);sus.throwready=1;sus.throwalpha=1;let cleared=0;
  rt.globals.kroundThrowHost.clearWriters=()=>{cleared++;expect(rt.count(ralseiThrown)).toBe(0);};rt.input.pressed.add(67);eventStep(rt,sus);
  expect(cleared).toBe(1);expect(rt.count(ralseiThrown)).toBe(1);
 });
});

describe('K.Round source enemy Step',()=>{
 const turn=()=>{const x=setup();x.rt.destroy(x.leap);x.rt.create(heroKris,50,100);x.rt.create(heroRalsei,50,240);x.rt.create(heroSusie,50,180);Object.assign(x.rt.globals,{monster:[1,0,0],monstertype:[10],monsterhp:[1300],monstermaxhp:[1300],monsterstatus:[0],mercymod:[0],mercymax:[100],battlemsg:[],msg:[],actname:[[]],myfight:-1,mnfight:1});
  const calls:string[]=[];x.rt.globals.kroundHost={lang:(id:string)=>id,writerExists:()=>false,clearWriters:()=>{},battleText:(def:boolean)=>calls.push('text:'+def),face:()=>{},inputName:()=> 'C',attackPhase:()=>calls.push('attack'),flash:()=>{},healAnimation:{name:'heal-test',index:301},checkerTransform:{name:'transform-test',index:262},monsterSetup:()=>{},roomName:()=>''};return {...x,calls};};
 it('selects the native random target and only creates a leap on preparation frame twelve',()=>{
  const {rt,boss}=turn();const rng=GmRandom.restore(rt.random.snapshot());const target=rng.choose(0,1,2);
  for(let i=0;i<11;i++)checkersStep(boss,rt);expect(rt.count(checkersLeap)).toBe(0);expect(rt.globals.turntimer).toBe(120);expect(boss.mytarget).toBe(target);
  checkersStep(boss,rt);rng.choose(0);expect(rt.count(checkersLeap)).toBe(1);expect(rt.globals.turntimer).toBe(999);expect(rt.random.snapshot()).toEqual(rng.snapshot());
 });
 it('uses first-milk threshold1000, heals300 at the source milk frame, and grows AT by half',()=>{
  const {rt,boss,calls}=turn();rt.globals.monsterhp[0]=1000;for(let i=0;i<12;i++)checkersStep(boss,rt);
  expect(rt.count(checkersLeap)).toBe(0);expect(boss.scon).toBe(2);expect(calls).toEqual(['text:true','text:true']);
  for(let i=0;i<42;i++)checkersStep(boss,rt);
  expect(rt.globals.monsterhp[0]).toBe(1300);expect(rt.globals.monsterat[0]).toBe(8);expect(boss.milkheal).toBe(300);
 });
 it('runs the second-encounter bow arithmetic and turns crown100 into a mandatory transform factory',()=>{
  const {rt,boss}=turn();rt.globals.monstertype[0]=21;rt.globals.myfight=3;rt.globals.mnfight=0;boss.acting=2;boss.crown=82;
  checkersStep(boss,rt);expect(boss.crown).toBe(100);expect(boss.actcon).toBe(51);expect(rt.globals.mercymod[0]).toBe(999);
  expect(rt.instances.some(i=>i.object.name==='transform-test'&&i.type===1)).toBe(true);
 });
});

describe('K.Round source effects',()=>{
 it('follows its source frame through fog and dies on Draw ten',()=>{
  const {rt,boss}=setup();boss.imageIndex=3;const f=flashCheckers(boss,rt);const draws:unknown[][]=[];rt.drawSpriteFog=(...a)=>draws.push(a);
  for(let i=0;i<9;i++)checkersFlash.events!.draw!(f,rt);expect(f.live).toBe(true);expect(f.imageIndex).toBe(3);expect(draws).toHaveLength(9);
  checkersFlash.events!.draw!(f,rt);expect(f.live).toBe(false);expect(f.depth).toBe(boss.depth-1);
 });
 it('creates two source stars per frame and consumes all ten random draws before the fifth-frame fade',()=>{
  const {rt,boss}=setup();const heal=rt.create(checkersHealAnim,boss.x,boss.y);heal.target=boss.id;
  const rng=GmRandom.restore(rt.random.snapshot());for(let i=0;i<5;i++){for(let k=0;k<10;k++)rng.next();eventStep(rt,heal);}
  expect(heal.starcount).toBe(10);expect(rt.count(checkersFlash)).toBe(1);expect(rt.random.snapshot()).toEqual(rng.snapshot());
  const last=rt.byId(heal.star[9])!;expect(last.imageAlpha).toBeCloseTo(1.9);expect(last.imageSpeed).toBe(.25);expect(last.depth).toBe(-10);
  rt.destroy(boss);eventStep(rt,heal);expect(heal.live).toBe(false);expect(heal.star.every((id:number)=>!rt.byId(id))).toBe(true);
 });
 it('evaluates the native instance-create coordinate arguments right to left, Y before X',()=>{
  const {rt,boss}=setup();const heal=rt.create(checkersHealAnim,boss.x,boss.y);heal.target=boss.id;
  const rng=GmRandom.restore(rt.random.snapshot()),y=boss.y+rng.random(160),x=boss.x+rng.random(120);eventStep(rt,heal);
  const star=rt.byId(heal.star[0])!;expect(star.x).toBe(Math.fround(x));expect(star.y).toBe(Math.fround(y));
 });
});
