// "[Press F1 For] HELP": F1 sends a winged Spamton to each party member, and each heals half their max HP once in the
// battle. Objects and scripts: obj_spamton_cherub, scr_spamton_heal, and the F1 check in obj_spamton_enemy's Step.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lerp} from '../../gm/math';
import {C} from '../../gm/graphics';
import {dmgWriter} from '../../deltarune/battle';
import {heal,healShow} from '../../deltarune/party';
import {isPhase} from '../../deltarune/chapter2-battle';
import {writer} from '../../deltarune/writer';
import {KEY,pressed} from '../../deltarune/keys';
import {snd} from '../../deltarune/sound';

/** scr_spamton_heal: damage numbers still waiting go, then every party member heals (half, a fifth or 1 HP). */
function spamtonHeal(s:GmInstance,rt:GmRuntime,kind:number){
 const g=rt.globals;
 for(const w of rt.withInstances(dmgWriter))if(w.delaytimer>=1)w.killactive=1;
 for(s.i=0;s.i<3;s.i++){
  if(g.char[s.i]===0)continue;
  const who=g.char[s.i],power=Math.ceil(kind===0?g.maxhp[who]/2:kind===1?g.maxhp[who]/5:kind===2?1:0);
  heal(s,rt,s.i,power);
  const h=rt.byId(g.charinstance[s.i]);if(h)healShow(h,rt,power);
 }
 for(s.i=0;s.i<3;s.i++){const h=rt.byId(g.charinstance[s.i]);if(h)h.tu--;}
}
export function createSpamtonCherub(object:(name:string)=>GmObjectDef){
 const cherub:GmObjectDef={...object('obj_spamton_cherub'),events:{
  create:(s,rt)=>{
   s.timer=0;s.x+=200;s.y-=150;s.xspawn=s.x;s.yspawn=s.y;s.offset=rt.random.random(2*Math.PI);
   Object.assign(s,{healer:false,heal_state:0,imageXscale:2,imageYscale:2,imageSpeed:.5,xoff:-Math.cos(8+s.offset)*20,yoff:-Math.sin(8+s.offset)*20,target:0});
  },
  // Unseen itself: it flies down to its hero shedding green stars, shows its sprite once there, heals, and goes.
  draw:(s,rt)=>{
   if(s.timer===s.target){const h=snd(rt,'snd_sparkle_glock');if(h!==undefined)rt.soundPitch?.(h,1.1+s.target*.2);}
   s.timer++;
   if(s.timer>=24){
    s.x=s.xstart;s.y=s.ystart;
    if(s.timer===24){const d=rt.create(object('obj_animation'),s.x,s.y);d.sprite=s.sprite;d.imageYscale=2;d.imageXscale=2;}
    if(!s.healer)rt.destroy(s);
    else if(s.timer===48)spamtonHeal(s,rt,s.heal_state);
    else if(s.timer>=63)rt.destroy(s);
   }else if(s.timer>=0&&s.timer<=24){
    s.x=lerp(s.xspawn,s.xstart+s.xoff,Math.min(Math.max(s.timer/25,0),1));s.y=lerp(s.yspawn,s.ystart+s.yoff,Math.min(Math.max(s.timer/25,0),1));
    if(s.timer%2===0){
     const d=rt.create(object('obj_animation'),s.x+Math.cos(s.timer/3+s.offset)*20,s.y+Math.sin(s.timer/3+s.offset)*20);
     d.sprite='spr_sparestar_anim';d.imageSpeed=.5;d.imageBlend=C.lime;d.imageXscale=2;d.imageYscale=2;
    }
   }
  },
 }};
 /** obj_spamton_enemy's F1 check (in the menu or while he talks), once a battle: a cherub per party member. */
 function callHelp(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;
  if(!pressed(rt,KEY.f1)||s.party_heal||!(isPhase(rt,'menu',s)||isPhase(rt,'enemytalk',s)))return;
  if(isPhase(rt,'enemytalk',s)&&s.talktimer>15){s.talktimer=s.talkmax;for(const w of rt.withInstances(writer))rt.destroy(w);}
  for(s.i=0;s.i<3;s.i++){
   if(g.char[s.i]===0)continue;
   const h=rt.byId(g.charinstance[s.i]);if(!h)throw Error('Spamton\'s help needs party member '+s.i);
   const c=rt.create(cherub,h.x+16,h.y-38);c.healer=true;
  }
  s.party_heal=true;
 }
 return {cherub,callHelp};
}
