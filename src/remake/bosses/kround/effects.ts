import type {GmObjectDef,GmInstance,GmRuntime} from '../../gm/runtime';
import {lt,le,ge} from '../../gm/math';
import {marker,heroKris,heroSusie,heroRalsei} from '../../deltarune/battle';
// Source provenance: Chapter 1 obj_oflash Create/Draw + scr_oflash, and
// obj_healanim Create/Step. These are reusable shared-effect candidates.
export const checkersFlash:GmObjectDef={name:'obj_oflash',index:302,events:{
 create:s=>{s.flashspeed=1;s.siner=0;s.target=43843843;s.imageSpeed=0;s.flashcolor=0xffffff;},
 draw:(s,rt)=>{const t=rt.byId(s.target);if(t){s.imageIndex=t.imageIndex;s.sprite=t.sprite;}s.siner+=s.flashspeed;
  if(s.sprite)rt.drawSpriteFog(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,0,s.flashcolor,Math.sin(s.siner/3));
  if(s.siner>4&&lt(Math.sin(s.siner/3),0))rt.destroy(s);
 },
}};
export function flashCheckers(s:GmInstance,rt:GmRuntime):GmInstance{
 const f=rt.create(checkersFlash,s.x,s.y);s._oflash=f.id;f.imageXscale=s.imageXscale;f.imageSpeed=0;f.imageIndex=s.imageIndex;f.imageYscale=s.imageYscale;f.sprite=s.sprite;f.depth=s.depth-1;f.target=s.id;return f;
}
export const checkersHealAnim:GmObjectDef={name:'obj_healanim',index:301,sprite:'spr_sparestar_anim',visible:false,events:{
 create:s=>{s.target=42894289;s.starcount=0;s.t=0;s.particlesprite='spr_sparestar_anim';s.particlecolor=0x00ff00;s.star=[];},
 step:(s,rt)=>{
  s.t+=1;const target=rt.byId(s.target);
  if(!target){for(const id of s.star){const star=rt.byId(id);if(star)rt.destroy(star);}rt.destroy(s);return;}
  if(s.t===1){s.x=target.x;s.y=target.y;s.imageXscale=target.imageXscale;s.imageYscale=target.imageYscale;s.sprite=target.sprite;s.sw=rt.spriteWidth(s);s.sh=rt.spriteHeight(s);s.herocheck=0;
   if([heroKris,heroSusie,heroRalsei].includes(target.object)){s.herocheck=1;s.sw=target.mywidth;s.sh=target.myheight;}flashCheckers(target,rt);
  }
  // instance_create(x + random(sw), y + random(sh), ...): the VM evaluates arguments right to left, Y first.
  if(s.t>=1&&s.t<=5){for(s.i=0;s.i<2;s.i+=1){const y=s.y+rt.random.random(s.sh),x=s.x+rt.random.random(s.sw);const star=rt.create(marker,x,y);s.star[s.starcount]=star.id;
   star.imageAngle=rt.random.random(360);star.depth=-10;star.imageXscale=2;star.imageYscale=2;star.imageAlpha=2;star.imageSpeed=.25;star.hspeed=2-rt.random.random(2);star.vspeed=-3-rt.random.random(2);star.friction=.2;
   star.sprite=s.particlesprite;star.imageBlend=s.particlecolor;s.starcount+=1;
  }}
  if(s.t>=5&&s.t<=30){for(s.i=0;s.i<s.starcount;s.i+=1){const star=rt.byId(s.star[s.i]);if(star){star.imageAngle-=10;star.imageAlpha-=.1;if(le(star.imageAlpha,0))rt.destroy(star);}}
   if(ge(s.t,30))rt.destroy(s);
  }
 },
}};
