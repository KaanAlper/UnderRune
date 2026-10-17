import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {damageEnemy,oflashOf} from './party';
import {monsterDefeat} from './controller';

export const iceHexagon:GmObjectDef={name:'obj_icespell_hexagon',index:392,sprite:'spr_icespell_snowflake',events:{
 create:s=>{Object.assign(s,{rotspeed:4,timer:0,con:0,imageXscale:1.5,imageYscale:1.5});},
 step:(s,rt)=>{if(s.con===1){s.imageAngle+=s.rotspeed*2;s.direction+=s.rotspeed*3;s.timer++;if(s.timer>=10)s.imageAlpha-=0.1;if(s.imageAlpha<=0)rt.destroy(s);}},
}};
export const iceSpell:GmObjectDef={name:'obj_icespell',index:391,sprite:'spr_icespell_snowflake',events:{
 create:s=>{s.timer=0;s.star=0;s.damage=0;},
 draw:(s,rt)=>{
  s.timer++;if(s.timer===1)rt.sound?.('snd_icespell');
  const initial=(slot:number,x:number,y:number)=>{gmArray(s,'hex')[slot]=rt.create(iceHexagon,x,y).id;};
  if(s.timer===1)initial(0,s.x-25,s.y-20);if(s.timer===4)initial(1,s.x+25,s.y-20);if(s.timer===7)initial(2,s.x,s.y+20);
  if(s.timer===10)for(s.i=0;s.i<3;s.i++){
   const h=rt.byId(s.hex[s.i]);if(h)for(h.j=0;h.j<6;h.j++){
    const child=rt.create(iceHexagon,h.x,h.y);gmArray(h,'hexhex')[h.j]=child.id;Object.assign(child,{imageXscale:0.75,imageYscale:0.75,con:1,direction:60*h.j,speed:8,friction:0.2});
   }
  }
  if(s.timer===11)for(let i=0;i<3;i++){const h=rt.byId(s.hex[i]);if(h)rt.destroy(h);}
  const g=rt.globals;if(s.timer===15&&g.fighting===1){
   g.hittarget[s.star]=0;const target=rt.byId(g.monsterinstance[s.star]);if(s.damage>=g.monsterhp[s.star]&&target?.freezable===1)g.flag[51+s.star]=6;
   damageEnemy(s,rt,s.star,s.damage);if(g.monster[s.star]===1){const t=rt.byId(s.target);if(t){const flash=oflashOf(t,rt);t.__of=flash.id;}}
  }
  if(s.timer>=10&&s.timer<=30){rt.drawState.alpha=2.2-s.timer/10;rt.drawState.color=C.white;for(let r=60;r<=62;r++)rt.drawCircle(s.x,s.y,r-s.timer*6,true);rt.drawState.alpha=1;}
  if(s.timer===60)rt.destroy(s);
 },
}};
export const sleepMist:GmObjectDef={name:'obj_spell_mist',index:387,sprite:'spr_icespell_mist',events:{
 create:s=>{Object.assign(s,{siner:0,amp:0,imageXscale:3,imageYscale:2,stimer:0,initdelay:0,myself:-1,target:-1,success:0,init:0});},
 draw:(s,rt)=>{
  const g=rt.globals;if(s.init===0&&s.myself>=0&&g.monster[s.myself]===1&&g.monsterstatus[s.myself]===1)s.success=1;
  if(s.initdelay===0){rt.sound?.('snd_ghostappear');if(s.success===1)rt.sound?.('snd_spell_pacify');}s.initdelay--;
  if(s.initdelay<=0){
   s.siner++;s.imageAlpha=Math.sin(s.siner/9)-0.3+s.success*0.3;s.amp=Math.sin(s.siner/9)*30;
   const x=Math.sin(s.siner/6)*s.amp,y=Math.cos(s.siner/6)*s.amp/2;
   rt.drawSprite(s.sprite,s.imageIndex,s.x+x,s.y+y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha*0.8);
   rt.drawSprite(s.sprite,s.imageIndex,s.x-x,s.y-y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha*0.8);s.stimer++;
   if(s.siner===12&&s.success===1){const target=rt.byId(s.target);if(target){g.flag[51+target.myself]=3;rt.userEvent(target,10);monsterDefeat(target,rt);}}
   if(s.stimer>=3&&s.siner<=24){s.stimer=0;if(s.success===1){const h=rt.spriteHeight(s),w=rt.spriteWidth(s),y=s.y-h/2+rt.random.random(h),x=s.x-w/2+rt.random.random(w);const hex=rt.create(iceHexagon,x,y);s.hex=hex.id;Object.assign(hex,{imageXscale:0.5,imageYscale:0.5,con:1,rotspeed:rt.random.random(5),sprite:'spr_icespell_snowflake'});}}
   if(s.siner>=40)rt.destroy(s);
  }
 },
}};
export function castSleepMist(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;let count=0;
 for(s._spelli=0;s._spelli<3;s._spelli++)if(g.monster[s._spelli]===1){const m=rt.byId(g.monsterinstance[s._spelli]);if(m){const mist=rt.create(sleepMist,g.monsterx[m.myself],g.monstery[m.myself]);m._icemist=mist.id;mist.target=m.id;mist.myself=m.myself;mist.initdelay=count*10;count++;}}
 g.spelldelay=20+count*10;
}
export function castIceShock(s:GmInstance,rt:GmRuntime,retarget:()=>void){
 const g=rt.globals;s.cancelattack=0;g.spelldelay=30;if(g.monster[s.star]===0)retarget();
 if(s.cancelattack===0){g.flag[925]++;const magic=Math.max(1,Math.min(999,g.battlemag[s.caster]-10));g.spelldelay=40;s.damage=Math.ceil(magic*30+90+rt.random.random(10));
  const attack=rt.create(iceSpell,g.monsterx[s.star],g.monstery[s.star]);s.attack=attack.id;Object.assign(attack,{damage:s.damage,star:s.star,caster:s.caster,target:g.monsterinstance[s.star]});
 }
}
