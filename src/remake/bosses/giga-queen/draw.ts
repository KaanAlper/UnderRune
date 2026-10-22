import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {ge,gt,le,lt} from '../../gm/math';
type Lookup=(name:string)=>GmObjectDef;
const requireInstance=(rt:GmRuntime,o:Lookup,n:string)=>{const i=rt.first(o(n));if(!i)throw Error(`GIGA Draw requires ${n}`);return i;};
function flameTimer(s:GmInstance){s.specialcontimer++;s.flameframe=(s.specialcontimer/4)%2;s.flamealpha=s.specialcontimer/15;if(ge(s.flamealpha,0.5))s.flamealpha=0.5;if(ge(s.specialcontimer,15))s.flamealpha=1-s.specialcontimer/30;if(ge(s.specialcontimer,30)){s.specialcontimer=0;s.specialcon=0;s.imageIndex=0;}}
/** Controller Draw changes gameplay state: special activation and healing occur here, after Step. */
export function drawGigaPlayer(s:GmInstance,rt:GmRuntime,object:Lookup){
 if(rt.exists(object('obj_thrash_intro'))||rt.exists(object('obj_thrash_transformation_transition')))return;
 if(s.jumping===1){rt.drawState.color=C.black;s.ht=(s.basey-s.y)/8;rt.drawEllipse(s.basex-62-s.ht*2,s.basey-40-s.ht/2,s.basex+38+s.ht*2,s.basey+s.ht/2);}
 const swordSlash=[12,13,14].includes(s.imageIndex)&&s.swordactive===1;
 if(s.wireframe_boxing===0&&gt(s.dead,0)){s.drawflip=0;s.imageIndex=7;}
 const xs=s.drawflip===0?s.imageXscale:-s.imageXscale;
 const sprite=(name:string|null,alpha=s.imageAlpha,color=s.imageBlend,fog=false)=>{if(name===null)return;if(fog)rt.drawSpriteFog(name,s.imageIndex,s.x,s.y,xs,s.imageYscale,0,color,alpha);else rt.drawSprite(name,s.imageIndex,s.x,s.y,xs,s.imageYscale,0,color,alpha);};
 const head=!swordSlash&&s.wireframe_boxing===0;
 sprite(s.sprite);
 if(head){
  // draw_sprite_ext_glow's white-color branch uses an additive fog pass and resets blend mode itself.
  const glow=(color:number)=>{if(lt(s.glow,1))sprite(s.headsprite,s.imageAlpha,color);if(gt(s.glow,0)){rt.drawBlendMode('add');sprite(s.headsprite,s.glow,C.white,true);rt.drawBlendMode('normal');}};
  rt.drawBlendMode('normal');glow(C.white);rt.drawBlendMode('add');glow(s.headcolor);rt.drawBlendMode('normal');
 }
 if(s.drawflip===0&&gt(s.laserpunchfadetimer,0)){s.laserpunchfadetimer--;if(head)sprite(s.headsprite,s.laserpunchfadetimer/10,C.white,true);}
 if(gt(s.color_fade_alpha,0)){s.c_extra=255|(90<<8)|(195<<16);s.color_fade_alpha-=0.1;sprite(s.sprite,s.color_fade_alpha,s.c_extra,true);if(head)sprite(s.headsprite,s.color_fade_alpha,s.c_extra,true);}
 if(gt(s.turboactive,0)){if(s.turbo_fade_state===0)s.turbo_fade_alpha+=0.04;if(s.turbo_fade_state===1)s.turbo_fade_alpha-=0.04;if(gt(s.turbo_fade_alpha,0.3))s.turbo_fade_state=1;if(lt(s.turbo_fade_alpha,0))s.turbo_fade_state=0;sprite(s.sprite,s.turbo_fade_alpha,C.white,true);if(head)sprite(s.headsprite,s.turbo_fade_alpha,C.white,true);}
 if(gt(s.swordactive,0)){if(s.sword_fade_state===0)s.sword_fade_alpha+=0.08;if(s.sword_fade_state===1)s.sword_fade_alpha-=0.08;if(gt(s.sword_fade_alpha,0.6))s.sword_fade_state=1;if(lt(s.sword_fade_alpha,0))s.sword_fade_state=0;if(head)sprite(s.headsprite,s.sword_fade_alpha,C.white,true);}
 // Keep independent conditions: resetting specialcon in one source block prevents all subsequent blocks.
 for(let mode=1;mode<=8;mode++)if(s.specialcon===mode&&s.wireframe_boxing===0){
  if(mode<=5){s[['','flameactive','swordactive','laseractive','duckactive','turboactive'][mode]]=1;if(mode<=3)s.damage_multiplier=[0,1.5,1.2,1.1][mode];if(mode===3)s.punch_speed_multiplier=1.3;
   if(s.specialcontimer===0){s.special_punch_count=mode===3?32:mode===5?999:16;s.special_punch_turns=3;if(mode>=2&&mode<=4&&!rt.exists(object('obj_rotating_sprites_controller'))){rt.create(object('obj_rotating_sprites_controller'),s.x,s.y);for(const a of rt.withInstances(object('obj_rotating_sprite')))a.sprite=`spr_rotating_sprite${mode-1}`;}}
  }
  if(mode===6){s.specialcontimer++;if(s.specialcontimer===1){const a=rt.create(object('obj_dmgwriter'),s.x-30,s.y-75);s.dmgwr=a.id;a.delay=8;a.type=3;a.damage=100;if(gt(rt.globals.hp[1]+100,rt.globals.maxhp[1]))a.damage=rt.globals.maxhp[1]-rt.globals.hp[1];s.health_count+=100;if(gt(s.health_count,s.health_count_max))s.health_count=s.health_count_max;rt.globals.hp[1]+=100;if(gt(rt.globals.hp[1],rt.globals.maxhp[1]))rt.globals.hp[1]=rt.globals.maxhp[1];rt.sound?.('snd_power');}s.specialcontimer--;}
  if(mode>=7){s.specialcontimer++;const name=mode===7?'spr_bhero_item':'spr_bhero_shield';if(gt(s.specialcontimer,0)&&lt(s.specialcontimer,5))rt.drawSprite(name,s.specialcontimer*2,s.x-12,s.y-161,2,2,0,C.white,1);else if(gt(s.specialcontimer,0))rt.drawSprite(name,9,s.x-12,s.y-161,2,2,0,C.white,1-(s.specialcontimer-10)/20);s.specialcontimer--;}
  flameTimer(s);
  if(mode===8&&rt.globals.boxingphase===2){s.specialcontimer=0;s.specialcon=0;s.imageIndex=0;}
  if(mode<=6){const colors=[[C.red,C.yellow],[0xff0000,0x808000],[C.white,C.yellow],[C.yellow,C.yellow],[C.white,C.orange],[C.green,C.lime]][mode-1];rt.drawSprite(s.sprite,9+s.flameframe,s.x,s.y,-s.imageXscale,s.imageYscale+Math.abs(Math.sin(s.specialcontimer/4)/2),0,colors[0],s.flamealpha);rt.drawSprite(s.sprite,10-s.flameframe,s.x,s.y,-s.imageXscale,s.imageYscale,0,colors[1],s.flamealpha/2);}
 }
}
export function drawGigaOpponent(s:GmInstance,rt:GmRuntime,object:Lookup){
 if(['obj_thrash_intro','obj_thrash_transformation_transition','obj_bqueen_missle_controller','obj_bqueen_breath_controller'].some(n=>rt.exists(object(n))))return;
 if(ge(s.nextdrawflip,0)){s.drawflip=s.nextdrawflip;s.nextdrawflip=-1;}
 const c=requireInstance(rt,object,'o_boxingcontroller');if(lt(s.health_count,s.health_count_max)&&c.wireframe_boxing===1){if(s.force_drawflip===0)s.drawflip=0;if(s.force_drawflip===1)s.drawflip=1;}
 if(s.specialcon===1||s.specialcon===2){flameTimer(s);const move=s.drawflip===1?-5:5;const px=s.x+(s.specialcon-1)*10+move;
  if(s.pirouette_amount===5){rt.drawSprite('spr_bhero',10+s.flameframe,px-8,s.y,1.7,2.4,0,C.red,s.flamealpha);rt.drawSprite('spr_bhero',11-s.flameframe,px-8,s.y,1.7,2.4,0,C.orange,s.flamealpha/2);}
  else{rt.drawSprite('spr_bhero',10+s.flameframe,px,s.y,-s.imageXscale*s.specialcon,s.imageYscale*s.specialcon+0.8+Math.abs(Math.sin(s.specialcontimer/4)/2),0,C.red,s.flamealpha);rt.drawSprite('spr_bhero',11-s.flameframe,px,s.y,-s.imageXscale*s.specialcon,s.imageYscale*s.specialcon+0.8,0,C.orange,s.flamealpha/2);}}
 const xs=s.drawflip===0?s.imageXscale:-s.imageXscale,draw=(frame:number,color=C.white,alpha=s.imageAlpha)=>rt.drawSprite(s.sprite,frame,s.x,s.y,xs,s.imageYscale,0,color,alpha);
 if(s.sprite==='spr_bqueen_punch'&&s.imageIndex===5){draw(0);draw(5,C.white,s.white_flash/100);s.white_flash-=20;}
 else if(s.drawflip===0&&s.sprite==='spr_bqueen_stomp'){draw(s.imageIndex);draw(s.imageIndex,C.red,s.stomp_speed*75/100);}
 else if(s.drawflip===0&&((s.sprite==='spr_bqueen'&&s.imageIndex===26&&s.final_sequence_red_state!==0)||s.sprite==='spr_queen_rocket_punch_pose')){draw(s.imageIndex);draw(s.imageIndex,C.red,s.final_sequence_red_alpha);}
 else{draw(s.imageIndex);if(s.sprite==='spr_bqueen_kick'&&s.imageIndex===0)draw(s.imageIndex,C.black,0.3);if(s.sprite==='spr_bqueen_splash'&&s.imageIndex===0)draw(s.imageIndex,C.black,0.15);}
 if(rt.globals.bmenuno===12&&rt.globals.bmenucoord[0][rt.globals.charturn]===3){s.fsiner++;if(s.drawflip===0||s.drawflip===1)rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x,s.y,s.drawflip===0?s.imageXscale:-2,s.imageYscale,0,C.white,-Math.cos(s.fsiner/5)*0.4+0.6);}
 rt.drawState.halign=0;
}
