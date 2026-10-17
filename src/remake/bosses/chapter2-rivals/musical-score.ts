import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {growtangle} from '../../deltarune/battle';
import {MUSICAL_SCORE} from './musical-score-data';
/** The song is driven by Sweet's audio clock, including the source's skipped-frame correction. */
export function createMusicalScore(object:(name:string)=>GmObjectDef):GmObjectDef{
 const box=(rt:GmRuntime)=>rt.first(growtangle)!,sweet=(rt:GmRuntime)=>rt.first(object('obj_sweet_enemy'))!;
 const speakers=(rt:GmRuntime)=>rt.all(object('obj_musicenemy_boombox'));
 function play(s:GmInstance,rt:GmRuntime,event:number){
  let side=rt.random.choose(0,1);
  if(event===1){if(s.forcedir===1)side=1;if(s.forcedir===-1)side=0;}
  const x=s.x+(side===0?-200:200);
  // instance_nearest retains instance order on equal distances.
  const speaker=speakers(rt).reduce<GmInstance|undefined>((best,b)=>!best||Math.hypot(b.x-x,b.y-s.y)<Math.hypot(best.x-x,best.y-s.y)?b:best,undefined);
  if(!speaker)return;
  if(event===1)speaker.angleoffset=rt.random.random(25)*(side===0?1:-1);
  speaker.makebullet=event+1;
 }
 return {...object('obj_musicalbullet_controller'),events:{
  create:(s,rt)=>{const b=box(rt),sw=sweet(rt);Object.assign(s,{con:0,x1:b.x+90,y1:b.y+100,times:1,bullettimermax:1,forcedir:0,difficulty:sw.musical_bullet_difficulty,enemy_count:1,skip_bullet:0,skip_bullet_count:0,made:0,init:0,solotimerprevious:0});sw.musical_bullet_difficulty++;},
  step:(s,rt)=>{
   const b=box(rt),sw=sweet(rt);s.xx=b.x+rt.random.randomRange(-75,75);s.yy=b.y+rt.random.randomRange(-75,75);
   let beat=sw.solotimer;if(sw.solotimer-s.solotimerprevious===2)beat--;s.solotimerprevious=sw.solotimer;
   for(const [beats,event,changes] of MUSICAL_SCORE)if(beats.includes(beat)){
    const apply=(before:boolean)=>{for(const [key,value,early] of changes)if(early===before){if(key==='forcedir')s[key]=value;else for(const speaker of speakers(rt))speaker[key]=value;}};
    apply(true);play(s,rt,event);apply(false);
   }
  },
  user0:(s,rt)=>play(s,rt,0),user1:(s,rt)=>play(s,rt,1),user2:(s,rt)=>play(s,rt,2),
  draw:()=>{},destroy:()=>{},
 }};
}
