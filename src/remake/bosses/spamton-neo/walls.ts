// NEO's wall attack: obj_sneo_wall_controller_new sends rows of seven bullets (a box on top, a car at the bottom,
// mail, crew that a shot breaks, red crew that breaks the whole row, bombs), by the pattern its difficulty picks;
// obj_sneo_wallbullet_new is a row piece, obj_sneo_rotatingwall_bomb a bomb a shot sets off, and
// obj_mettaton_bomb_hitbox the cross of its blast.
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {rectangleMeets,instancesMeet} from '../../gm/collision';
import {C,mergeColor} from '../../gm/graphics';
import {bulletInit,damage,damageAll} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';
import {scrAfterimageCut} from './support';

/** A scr_sneo_wall_create call: what the five middle slots hold (0 mail, 1 empty, 2 crew, 3 bomb, 4 red crew), the
 * frames before the row comes, and its speed curve (walltype). */
type Wall=[number,number,number,number,number,number,number];
/** The fixed patterns: a choose() draws a new pattern number; `when` rows run for that number; `wall` rows always. */
type PlanStep={choose:number[]}|{when:number;walls:Wall[]}|{wall:Wall};
const PLANS:Record<number,{typeAll:number|undefined;steps:PlanStep[]}>={
 0:{typeAll:1,steps:[
  {choose:[1,2,3]},
  {when:1,walls:[[0,0,0,2,0,1,1],[0,2,3,0,0,30,1],[0,3,0,2,0,30,1]]},
  {when:2,walls:[[0,2,0,3,0,1,1],[0,3,0,2,0,30,1],[0,2,0,3,0,30,1]]},
  {when:3,walls:[[0,0,0,0,2,1,1],[0,3,2,0,0,30,1],[0,2,3,0,0,30,1]]},
  {choose:[1,2,3]},
  {when:1,walls:[[0,1,1,0,0,40,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},
  {when:2,walls:[[0,0,0,1,1,40,1],[0,0,0,2,2,6,1],[0,0,0,2,2,6,1],[0,0,0,2,2,6,1]]},
  {when:3,walls:[[0,0,1,1,0,40,1],[0,0,2,1,0,6,1],[0,0,2,2,0,6,1],[0,0,2,2,0,6,1]]},
  {when:1,walls:[[0,0,0,0,2,30,1],[0,2,0,0,0,30,1],[0,3,0,2,0,30,1]]},
  {when:2,walls:[[0,2,0,0,0,30,1],[0,0,0,2,0,30,1],[0,2,0,3,0,30,1]]},
  {when:3,walls:[[2,0,0,0,0,30,1],[0,0,2,0,0,30,1],[0,2,3,0,0,30,1]]},
  {choose:[1,2,3]},
  {when:1,walls:[[0,1,1,0,0,40,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},
  {when:2,walls:[[0,1,1,0,0,40,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},
  {when:3,walls:[[0,1,1,0,0,40,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},
  {wall:[1,1,1,1,1,9999,0]},
 ]},
 1:{typeAll:1,steps:[
  {choose:[1,2,3,4]},
  {when:1,walls:[[3,0,0,2,0,1,1],[0,2,3,0,0,20,1],[0,3,0,2,0,20,1]]},
  {when:2,walls:[[0,2,0,3,0,1,1],[0,3,0,2,0,20,1],[0,2,0,3,0,20,1]]},
  {when:3,walls:[[0,0,0,3,2,1,1],[0,3,2,0,0,20,1],[0,2,3,0,0,20,1]]},
  {when:4,walls:[[2,3,0,0,0,1,1],[0,0,2,3,0,20,1],[0,0,3,2,0,20,1]]},
  {choose:[1,2,3,4]},
  {when:1,walls:[[3,0,0,2,0,20,1],[0,2,3,0,0,20,1],[0,3,0,2,0,20,1]]},
  {when:2,walls:[[0,2,0,3,0,20,1],[0,3,0,2,0,20,1],[0,2,0,3,0,20,1]]},
  {when:3,walls:[[0,0,0,3,2,20,1],[0,3,2,0,0,20,1],[0,2,3,0,0,20,1]]},
  {when:4,walls:[[2,3,0,0,0,20,1],[0,0,2,3,0,20,1],[0,0,3,2,0,20,1]]},
  {when:1,walls:[[0,1,1,0,0,32,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},
  {when:2,walls:[[0,0,0,1,1,32,1],[0,0,0,2,2,6,1],[0,0,0,2,2,6,1],[0,0,0,2,2,6,1]]},
  {when:3,walls:[[0,0,1,1,0,32,1],[0,0,2,2,0,6,1],[0,0,2,2,0,6,1],[0,0,2,2,0,6,1]]},
  {when:4,walls:[[1,1,0,0,0,32,1],[2,2,0,0,0,6,1],[2,2,0,0,0,6,1],[2,2,0,0,0,6,1]]},
  {when:1,walls:[[0,0,0,0,2,20,1],[0,2,0,0,0,20,1],[0,3,0,2,0,20,1]]},
  {when:2,walls:[[0,2,0,0,0,20,1],[0,0,0,2,0,20,1],[0,2,0,3,0,20,1]]},
  {when:3,walls:[[2,0,0,0,0,20,1],[0,2,0,0,0,20,1],[0,2,3,0,0,20,1]]},
  {when:4,walls:[[0,0,0,2,0,20,1],[2,0,0,0,0,20,1],[0,0,3,2,0,20,1]]},
  {choose:[1,2,3,4]},
  {when:1,walls:[[3,0,0,2,0,20,1],[0,2,3,0,0,20,1],[0,3,0,2,0,20,1]]},
  {when:2,walls:[[0,2,0,3,0,20,1],[0,3,0,2,0,20,1],[0,2,0,3,0,20,1]]},
  {when:3,walls:[[0,0,0,3,2,20,1],[0,3,2,0,0,20,1],[0,2,3,0,0,20,1]]},
  {when:4,walls:[[2,3,0,0,0,20,1],[0,0,2,3,0,20,1],[0,0,3,2,0,20,1]]},
  {wall:[1,1,1,1,1,9999,0]},
 ]},
 99:{typeAll:undefined,steps:[
  {choose:[1,2]},
  {when:1,walls:[[0,0,0,0,4,1,1],[1,0,0,0,0,7,1]]},
  {when:2,walls:[[4,0,0,0,0,1,1],[0,0,0,0,1,7,1]]},
  {choose:[1,2,3]},
  {when:1,walls:[[4,0,0,0,3,63,1]]},
  {when:2,walls:[[3,0,0,0,4,63,1]]},
  {when:3,walls:[[0,3,4,0,0,63,1]]},
  {wall:[0,0,1,0,4,60,0]},
  {wall:[4,2,1,0,0,7,0]},
  {wall:[0,2,3,1,0,7,0]},
  {wall:[0,2,3,1,0,7,0]},
  {wall:[0,4,1,3,1,50,0]},
  {wall:[3,1,1,4,2,7,0]},
  {wall:[3,4,0,3,1,7,0]},
  {wall:[2,1,0,1,2,7,0]},
  {wall:[2,4,2,0,4,7,0]},
  {wall:[2,1,2,0,0,7,0]},
  {wall:[1,4,2,0,3,50,0]},
  {wall:[4,2,0,0,2,7,0]},
  {wall:[0,2,1,1,1,7,0]},
  {wall:[3,1,2,1,3,7,0]},
  {wall:[1,1,4,0,0,7,0]},
  {wall:[4,2,2,0,1,7,0]},
  {wall:[3,2,3,4,2,50,0]},
  {wall:[2,2,1,2,4,7,0]},
  {wall:[3,1,1,1,4,7,0]},
  {wall:[2,2,1,1,3,7,0]},
  {wall:[3,4,1,1,1,7,0]},
  {wall:[3,0,0,4,2,7,0]},
  {wall:[0,0,0,0,0,9999,0]},
 ]},
};

/** The random rows of difficulties 2 and 3: each slot is a choose() from these kinds. */
const RANDOM_KINDS:Record<number,number[]>={2:[2,2,1,1,1,4,3,0],3:[2,2,1,1,1,3,0]};
const SLOTS=['emptyspot','breakspot','pipispot','redbreakspot'] as const;
/** Kind of a slot: 1 empty, 2 crew, 3 bomb, 4 red crew (0 mail sets nothing). */
const SLOT_OF:Record<number,(typeof SLOTS)[number]>={1:'emptyspot',2:'breakspot',3:'pipispot',4:'redbreakspot'};

export function createNeoWalls(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const controllerOf=(rt:GmRuntime)=>rt.first(object('obj_sneo_wall_controller_new'));
 const neo=(rt:GmRuntime)=>rt.first(object('obj_spamton_neo_enemy'));
 /** Damage from NEO's attack and the target of the attack controller (the bullets' shared Create lines). */
 const fromAttack=(s:GmInstance,rt:GmRuntime)=>{
  const n=neo(rt);if(n)s.damage=rt.globals.monsterat[n.myself]*5;
  const c=rt.first(object('obj_sneo_bulletcontroller'));if(c)s.target=c.target;
  s.grazepoints=2;
 };
 /** scr_sneo_wall_create, run by the controller: one row's slots, its delay and speed curve. */
 const wallCreate=(s:GmInstance,w:Wall)=>{
  for(let slot=0;slot<5;slot++){const kind=SLOT_OF[w[slot]];if(kind)s[kind+(slot+1)][s.wallsetupcount]=slot+1;}
  s.wallcreatetimer[s.wallsetupcount]=w[5];s.walltype[s.wallsetupcount]=w[6];s.wallsetupcount+=1;
 };
 /** A random row: the five slots' choose() calls run last argument first, as GML evaluates call arguments. */
 const randomRow=(s:GmInstance,rt:GmRuntime,kinds:number[],delay:number)=>{
  const a4=rt.random.choose(...kinds),a3=rt.random.choose(...kinds),a2=rt.random.choose(...kinds),a1=rt.random.choose(...kinds),a0=rt.random.choose(...kinds);
  wallCreate(s,[a0,a1,a2,a3,a4,delay,0]);
 };
 const controller:GmObjectDef={name:'obj_sneo_wall_controller_new',index:54,depth:0,events:{
  create:(s,rt)=>{
   Object.assign(s,{wallsize:7,wallcountmax:35,wallcount:0,wallsetupcount:0,timer:0,timer2:0,wallcreatetimermax:30,con:0});
   s.difficulty=neo(rt)!.difficulty;s.xx=rt.view.x;s.yy=rt.view.y;s.track1_x=rt.view.x;s.track2_x=rt.view.x+320;s.track3_x=rt.view.x+640;s.x=0;s.y=0;
   // Each slot table is made by writing its last entry (index wallcountmax): the others read as 0.
   for(const kind of ['breakspot','pipispot','emptyspot','redbreakspot'])for(let n=1;n<=5;n++){const a=new Array(s.wallcountmax+1).fill(0);a[s.wallcountmax]=-1;s[kind+n]=a;}
   s.wallcreatetimer=new Array(s.wallcountmax).fill(s.wallcreatetimermax);s.wallspeed=new Array(s.wallcountmax).fill(-7);s.walltype=new Array(s.wallcountmax).fill(0);
   const plan=PLANS[s.difficulty];
   if(plan){
    if(plan.typeAll!==undefined)s.walltype.fill(plan.typeAll);
    let rand=0;
    for(const step of plan.steps){
     if('choose' in step)rand=rt.random.choose(...step.choose);
     else if('when' in step){if(rand===step.when)for(const w of step.walls)wallCreate(s,w);}
     else wallCreate(s,step.wall);
    }
   }
   const kinds=RANDOM_KINDS[s.difficulty];
   if(kinds){
    for(let n=0;n<6;n++)randomRow(s,rt,kinds,7);
    randomRow(s,rt,kinds,63);
    for(let n=0;n<5;n++)randomRow(s,rt,kinds,7);
    randomRow(s,rt,kinds,63);
    for(let n=0;n<5;n++)randomRow(s,rt,kinds,7);
    wallCreate(s,[0,0,0,0,0,9999,0]);
   }
  },
  step:(s,rt)=>{
   s.timer+=1;
   if(rt.globals.turntimer<1)rt.destroy(s);
   if(s.wallcount<s.wallcountmax&&s.timer===s.wallcreatetimer[s.wallcount]){
    const right=rt.view.x+rt.view.width,top=s.yy+rt.view.height/2,c=s.wallcount;
    const has=(kind:string,i:number)=>[1,2,3,4,5].some(n=>s[kind+n][c]===i);
    const bullet=gmArray(s,'bullet');
    for(s.i=0;s.i<s.wallsize;s.i+=1){
     const i=s.i;
     if(i===0||i===s.wallsize-1){
      let b=rt.create(wallBullet,right,top+i*34-172);bullet[i]=b.id;
      b.sprite='spr_sneo_bullet_box';b.imageXscale=1.25;b.imageYscale=1.6;b.destroyable=0;b.imageBlend=C.white;b.wallnumber=c;
      if(i===0)b.wallcontroller=1;
      if(i===s.wallsize-1){
       b=rt.create(wallBullet,right-50,top+i*34-180);bullet[i]=b.id;
       b.sprite='spr_sneo_wall_car';b.imageXscale=1.25;b.imageYscale=1.6;b.destroyable=0;b.imageBlend=C.white;b.depth=s.depth-1;b.wallnumber=c;
      }
     }else if(has('emptyspot',i)){
      // An empty slot.
     }else if(has('pipispot',i)){
      const b=rt.create(bomb,right,top+i*34-170);bullet[i]=b.id;b.wallnumber=c;
     }else{
      const b=rt.create(wallBullet,right,top+i*34-172);bullet[i]=b.id;
      b.sprite='spr_sneo_mail';b.imageXscale=1.2;b.imageYscale=1.71;b.destroyable=0;b.wallnumber=c;
      if(has('breakspot',i)){b.destroyable=1;b.sprite='spr_sneo_crew';b.imageSpeed=0.5;b.imageYscale=1.2;}
      else if(has('redbreakspot',i)){b.destroyable=1;b.red=1;b.sprite='spr_sneo_crew';b.imageSpeed=0.5;b.imageYscale=1.2;b.imageBlend=C.red;}
      else b.imageBlend=C.white;
     }
    }
    s.timer=0;s.wallcount+=1;
   }
   s.timer2+=1;
  },
  draw:(s,rt)=>{
   const right=rt.view.x+rt.view.width,y=rt.view.y+rt.view.height-180;
   for(const k of ['track1_x','track2_x','track3_x']){s[k]+=4;if(s[k]>right)s[k]-=960;}
   for(const k of ['track1_x','track2_x','track3_x'])rt.drawSprite('spr_sneo_wall_track',0,s[k],y);
  },
 }};

 /** instance_place(x, y, obj): another instance of obj that this one would touch at (x, y). */
 const placeMeets=(s:GmInstance,rt:GmRuntime,x:number,y:number,def:GmObjectDef)=>{
  const at={...s,x,y,sprite:s.sprite,mask:s.mask,imageAngle:s.imageAngle,imageXscale:s.imageXscale,imageYscale:s.imageYscale,imageIndex:s.imageIndex};
  return rt.all(def).some(o=>o!==s&&instancesMeet(rt.bank,at,o));
 };
 /** instance_nearest(x, y, obj): the closest instance (the first of equally close ones). */
 const nearest=(rt:GmRuntime,x:number,y:number,def:GmObjectDef)=>{
  let best:GmInstance|undefined,bestSq=0;
  for(const o of rt.all(def)){const dx=o.x-x,dy=o.y-y,sq=dx*dx+dy*dy;if(!best||sq<bestSq){best=o;bestSq=sq;}}
  return best;
 };
 /** A BIG SHOT only breaks a mail row piece where the shot is level with it, unless mail is above or below on its side. */
 const glancing=(s:GmInstance,rt:GmRuntime,shot:GmInstance)=>{
  const mailAt=(dy:number)=>placeMeets(s,rt,s.x,s.y+dy,wallBullet)&&nearest(rt,s.x,s.y+dy,wallBullet)?.sprite==='spr_sneo_mail';
  if((shot.y<s.y&&mailAt(-40))||(shot.y>s.y&&mailAt(40)))return false;
  return Math.abs(shot.y-s.y)>12;
 };
 const shotBurst=(s:GmInstance,rt:GmRuntime)=>{
  const anim=rt.create(object('obj_yshot_anim'),s.x,s.y);s.anim=anim.id;
  anim.imageXscale=s.imageXscale;anim.imageYscale=s.imageYscale;anim.sprite='spr_yheart_shot_hit3';
 };
 const wallBullet:GmObjectDef={name:'obj_sneo_wallbullet_new',index:40,parent:object('obj_collidebullet'),sprite:'spr_sneo_crew',depth:0,
  events:{
   create:(s,rt)=>{
    bulletInit(s);s.element=6;s.destroyable=1;s.red=0;s.bighitbox=1;s.imageSpeed=0;
    s.imageBlend=mergeColor(0xe8a200,C.aqua,0.25+Math.sin(0)*0.25);
    fromAttack(s,rt);
    Object.assign(s,{wallcontroller:-1,wallspeed:-7,wallnumber:0,walltype:0,timer:0,hp:1});
   },
   step:(s,rt)=>{
    if(rt.globals.turntimer<1)rt.destroy(s);
    const c=controllerOf(rt);
    if(c)s.x+=c.wallspeed[s.wallnumber];
    if(s.wallcontroller>-1){
     const ctl=controllerOf(rt)!;
     // The row's first box sets the row's speed: walltype 0 slows to 6, walltype 1 brakes from 21 and speeds up again.
     if(ctl.walltype[s.wallnumber]===0){
      s.timer+=1;
      if(s.timer<9)ctl.wallspeed[s.wallnumber]=-16+(-6+16)*(s.timer/9);
      else if(s.timer<150)ctl.wallspeed[s.wallnumber]=-6;
     }
     if(ctl.walltype[s.wallnumber]===1){
      s.timer+=1;
      if(s.timer<16)ctl.wallspeed[s.wallnumber]=-21+(-5+21)*(s.timer/15);
      else if(s.timer<90)ctl.wallspeed[s.wallnumber]=-5+(-13+5)*((s.timer-15)/70);
     }
    }
    if(s.sprite==='spr_sneo_crew'){
     const shotDef=object('obj_yheart_shot');
     const hit=rt.all(shotDef).find(o=>rectangleMeets(rt.bank,o,s.x-18,s.y-22,s.x+19,s.y+22,true));
     s.hitshot=hit?hit.id:-4;
     if(hit){
      if(s.destroyable===0&&hit.big===1&&glancing(s,rt,hit))return;
      rt.userEvent(s,0);
      if(s.destroyable===1&&s.active===1){
       const shot=rt.byId(s.hitshot);
       if(shot&&shot.big===0)rt.userEvent(shot,0);
       snd(rt,'snd_bomb',1.1+rt.random.random(0.2));
       scrAfterimageCut(s,rt,object);
       shotBurst(s,rt);
       rt.destroy(s);
      }
     }
    }
   },
   draw:(s,rt)=>rt.drawSelf(s),
   // Event 0: a shot reaches it.
   user0:(s,rt)=>{
    if(s.sprite==='spr_sneo_bullet_box')return;
    const shot=rt.byId(s.hitshot);
    if(s.destroyable===1){
     if(shot&&shot.big===0)rt.userEvent(shot,0);
     if(s.red===1){
      // A red crew member takes its whole row with it.
      for(const o of rt.all(wallBullet))if(o.wallnumber===s.wallnumber){
       snd(rt,'snd_bomb',1.1+rt.random.random(0.2));
       scrAfterimageCut(o,rt,object).flash=true;
       rt.destroy(o);
      }
      for(const o of rt.all(object('obj_sneo_rotatingwall_pipis')))if(o.wallnumber===s.wallnumber){rt.userEvent(o,0);rt.destroy(o);}
     }
     shotBurst(s,rt);
    }else{
     if(shot)rt.userEvent(shot,0);
     snd(rt,'snd_bell');
    }
   },
  },
  collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
   if(s.destroyable===0&&shot.big===1&&glancing(s,rt,shot))return;
   s.hitshot=shot.id;
   rt.userEvent(s,0);
   if(s.destroyable===1&&s.active===1){
    const hs=rt.byId(s.hitshot);
    if(hs&&hs.big===0)rt.userEvent(hs,0);
    rt.sourceAudio?.volume('snd_bomb',0.7,0);snd(rt,'snd_bomb',1.1+rt.random.random(0.2),0.7);
    scrAfterimageCut(s,rt,object).flash=true;
    shotBurst(s,rt);
    rt.destroy(s);
   }
  }}],
 };

 const bomb:GmObjectDef={name:'obj_sneo_rotatingwall_bomb',index:38,parent:object('obj_collidebullet'),sprite:'spr_mettaton_bomb1',depth:0,
  events:{
   create:(s,rt)=>{
    bulletInit(s);Object.assign(s,{imageXscale:1,imageYscale:1,timer:0,con:0,element:6,destroyable:0,bighitbox:1,imageSpeed:0});
    fromAttack(s,rt);s.wallspeed=-7;s.wallnumber=0;
   },
   step:(s,rt)=>{
    if(rt.globals.turntimer<1)rt.destroy(s);
    const c=controllerOf(rt);
    if(s.timer===0&&c)s.x+=c.wallspeed[s.wallnumber];
    if(s.timer>0)s.timer+=1;
    if(s.timer===6){
     snd(rt,'snd_bomb');rt.soundStop?.(s.bomsfallsfx);
     s.sprite='spr_mettaton_bomb2';s.imageIndex=0;
     rt.create(object('obj_shake'),s.x,s.y);
     const h1=rt.create(blastHitbox,s.x,s.y);s.hitbox1=h1.id;h1.imageXscale=500;h1.imageYscale=0.5;
     const h2=rt.create(blastHitbox,s.x,s.y);s.hitbox2=h2.id;h2.imageXscale=0.2;h2.imageYscale=500;
    }
    if(s.timer===12)rt.destroy(s);
   },
   draw:(s,rt)=>{
    rt.drawSelf(s);
    if(s.sprite==='spr_mettaton_bomb2')for(let i=1;i<24;i++){
     rt.drawSprite('spr_mettaton_bomb3',s.imageIndex,s.x+24*i,s.y,s.imageXscale,s.imageYscale,90,C.white,s.imageAlpha);
     rt.drawSprite('spr_mettaton_bomb3',s.imageIndex,s.x-24*i,s.y,s.imageXscale,s.imageYscale,90,C.white,s.imageAlpha);
     rt.drawSprite('spr_mettaton_bomb3',s.imageIndex,s.x,s.y-24*i,s.imageXscale,s.imageYscale,0,C.white,s.imageAlpha);
     rt.drawSprite('spr_mettaton_bomb3',s.imageIndex,s.x,s.y+24*i,s.imageXscale,s.imageYscale,0,C.white,s.imageAlpha);
    }
   },
   // CleanUp: the falling whistle stops with it.
   destroy:(s,rt)=>{if(s.timer>0)rt.soundStop?.(s.bomsfallsfx);},
  },
  collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
   if(s.timer!==0)return;
   snd(rt,'snd_damage');
   if(shot.big===0)rt.userEvent(shot,0);
   s.timer=1;s.imageSpeed=1;s.bomsfallsfx=rt.soundLoop?.('snd_bombfall')??-1;
  }}],
 };

 const blastHitbox:GmObjectDef={name:'obj_mettaton_bomb_hitbox',index:9,parent:object('obj_regularbullet'),sprite:'spr_hitbox_10px_center',depth:0,visible:false,events:{
  create:(s,rt)=>{
   bulletInit(s);Object.assign(s,{wall_destroy:1,imageAlpha:1,sprite:'spr_hitbox_10px_center',imageXscale:1,imageYscale:1,destroyonhit:0,grazed:1,element:6});
   fromAttack(s,rt);s.timer=0;s.depth=-999999;s.creator=-1;
  },
  step:(s,rt)=>{
   s.timer+=1;if(s.timer===3)rt.destroy(s);
   const c=s.creator!==-1?rt.byId(s.creator):undefined;if(c){s.x=c.x;s.y=c.y;}
  },
  // Event 15: it hits the soul (the blast stays for its three frames).
  user5:(s,rt)=>{
   if(s.active!==1)return;
   if(s.target!==3)damage(s,rt);
   if(s.target===3)damageAll(s,rt);
   if(s.destroyonhit===1)rt.destroy(s);
  },
 }};
 return [controller,wallBullet,bomb,blastHitbox];
}
