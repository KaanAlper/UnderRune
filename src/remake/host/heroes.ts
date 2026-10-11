import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
// Preserve the original Draw-driven idle, held attack frame, defense and hurt recoil.
export const heroSprites=[['spr_krisb_idle','spr_krisb_attackready','spr_krisb_attack','spr_krisb_hurt','spr_krisb_defend','spr_krisb_defeat'],['spr_susieb_idle','spr_susieb_attackready','spr_susieb_attack','spr_susieb_hurt','spr_susieb_defend','spr_susieb_defeat'],['spr_ralseib_idle','spr_ralseib_attackready','spr_ralseib_attack','spr_ralsei_shock','spr_ralseib_defend','spr_ralseib_defeat']];
const readySprites=[['spr_krisb_itemready','spr_krisb_actready','spr_krisb_actready'],['spr_susieb_itemready','spr_susieb_spellready','spr_susieb_actready'],['spr_ralseib_itemready','spr_ralseib_spellready','spr_ralseib_actready']];
export const heroSize=[[68,74],[70,82],[52,86]];
export function battleHero(base:GmObjectDef,onImpact:(h:GmInstance)=>void):GmObjectDef{
 return {...base,parent:base,events:{alarm1:h=>onImpact(h),draw:drawHero}};
}
function drawHero(h:GmInstance,rt:GmRuntime){
 const id=h.char,frames=heroSprites[id-1];let sprite=frames[0],index=0,x=h.x;
 if(rt.globals.hp[id]<=0){sprite=frames[5];h.hurt=0;h.hurttimer=0;}
 else{
  if(h.pose==='attack'){sprite=frames[2];index=Math.min(h.attacktimer,id===1?6:5);if(h.hurt!==1)h.attacktimer+=.5;}
  else if(h.faceaction===4){sprite=frames[4];index=h.defendtimer;if(h.hurt!==1)h.defendtimer=Math.min(id===3?6:5,h.defendtimer+.5);}
  else{sprite=h.faceaction===1?frames[1]:h.faceaction===3?readySprites[id-1][0]:h.faceaction===2?readySprites[id-1][1]:h.faceaction===6?readySprites[id-1][2]:frames[0];index=h.siner/5;h.defendtimer=0;}
  if(h.hurt!==1)h.siner++;
  if(h.hurt===1){const hurtindex=Math.min(2,h.hurttimer/2);sprite=h.faceaction===4?frames[4]:frames[3];index=h.faceaction===4?h.defendtimer:hurtindex;x=h.x-20+hurtindex*10;
   if(h.hurttimer>15){h.hurttimer=0;h.hurt=0;}h.hurttimer++;
  }
 }
 h.sprite=sprite;h.imageIndex=index;rt.drawSprite(sprite,index,x,h.y,2,2,0,h.imageBlend,h.imageAlpha);
}
