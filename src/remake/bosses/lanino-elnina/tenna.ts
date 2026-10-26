import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lengthdirX,lengthdirY,ge,le} from '../../gm/math';
import {scrLerpvar} from '../../deltarune/shared-effects';
type Lookup=(name:string)=>GmObjectDef;
// Actor audit: all Create fields retained; weather uses ordinary Step motion/depth/siners/shake,
// Draw presets 0/2/7, bounce and quad deformation. Other minigame/podium presets are explicit boundaries.
export function createWeatherPresentation(_object:Lookup):GmObjectDef[]{return [{name:'obj_actor_tenna',index:157,sprite:'spr_tenna_point_up',depth:0,events:{
 create:(s,rt)=>{
  s.siner=0;s.siner2=0;s.depth=100000-(s.y*10+rt.spriteHeight(s)*10);
  Object.assign(s,{bounce:0,imageSpeed:0,walk:1,auto_walk:1,auto_facing:1,auto_depth:1,stopped:0,depthbonus:0,active:0,facing:'d',usprite:s.sprite,rsprite:s.sprite,dsprite:s.sprite,lsprite:s.sprite,name:'tenna',number:-1,spinspeed:0,spintimer:0,dz:2,imageXscale:2,imageYscale:2,fake_speed:0,fake_direction:0,animchangetimer:0,debug_killtimer:-1,specialspriteno:0});
  s.specialsprite=[];for(s.i=0;s.i<10;s.i++)s.specialsprite[s.i]=s.dsprite;
  Object.assign(s,{sprite_palette:-1,current_pal:0,color_blend:0xffffff,siner0:0,siner_add0:0,siner_amplitude0:0,siner_direction0:0,siner_type0:'sin',siner_visual0:1,siner1:0,siner_add1:0,siner_amplitude1:0,siner_direction1:270,siner_type1:'cos',siner_visual1:1,siner2:0,siner_add2:0,siner_amplitude2:0,siner_direction2:0,siner_type2:'sin',siner_visual2:1,sinerx:0,sinery:0,shakeamt:0,shaketime:1,shaketimer:0,shakex:0,shakey:0,stepsound:0,stepsound_count:0,wobblestate:0,wobbletime:4,wobbleamt:40,preset:0,reversal:0,drawtype:0,outline:false,xscale:2,yscale:2,speedscale:1,animchangetimer:0,changespeed:20,pointcon:0,dropshadow:0,dropdist:20,nose_bloom:false,nose_bloom_index:0,nose_bloom_scale_x:0,nose_bloom_scale_y:0,sprite1:s.sprite,sprite2:s.sprite,sprite3:s.sprite,sprite4:s.sprite,flash:0,flashsiner:0,nosehighlight:0,pinkflash:0,mad:false,frame:0,scaled_bounce:false,cur_xscale:2,cur_yscale:2,palette_sprite:'spr_tenna_palette',palette_index:0,golden_mode:false,_static:false,_staticindex:0,rosecon:0,rosetimer:0,rosetennasprite:0,wtime1:0,armlaugh:0,shtimer:0,rate:2,nose_sintimer:0,nose_magnitude:0,nose_rotation:0,threepartmode:false,lightemupcon:0,lightemuptimer:-70,lightemupmovecount:0,ligthemupmovefullcount:0,lightemuptargetx:0,lightemuptargety:0,changechanneltimer:0,changechanneltimermax:90,finishtransition:false,darkenalpha:0,pitchchange:0,geteasiertimer:0,_rate:0,pacetimer:0,startjump:false,hitflash:0,bullet_timer:100,bullet_count:0,animsiner:0,animsinerb:0,animtimer:0,fsiner:0,armshake:1,armshakesiner:0,fallgrav:0,fallspeed:0,lightemup_endingcon:0,communication:0,communicationtimer:0,create_defeat_tenna_text_timer:0});
 },
 step:(s,rt)=>{
  if(s.auto_walk!==1)return;
  if(s.walk===1){s.v_speed=0;if(s.fake_speed!==0)s.v_speed=s.fake_speed;if(s.speed!==0)s.v_speed=s.speed;}
  if(s.auto_facing===1){s.v_vspeed=0;s.v_hspeed=0;if(s.fake_speed!==0){s.v_vspeed=lengthdirY(s.fake_speed,s.fake_direction);s.v_hspeed=lengthdirX(s.fake_speed,s.fake_direction);}if(s.hspeed!==0)s.v_hspeed=s.hspeed;if(s.vspeed!==0)s.v_vspeed=s.vspeed;}
  if(s.spinspeed!==0){s.spintimer+=1/s.spinspeed;if(ge(s.spintimer,1)){s.facing=({d:'l',l:'u',u:'r',r:'d'} as Record<string,string>)[s.facing];s.spintimer=0;}if(le(s.spintimer,-1)){s.facing=({d:'r',l:'d',u:'l',r:'u'} as Record<string,string>)[s.facing];s.spintimer=0;}}else s.spintimer=0;
  if(s.debug_killtimer>0){s.debug_killtimer--;if(s.debug_killtimer<=0)rt.destroy(s);}
  if(s.auto_depth===1){const meta=s.sprite?rt.bank.get(s.sprite):undefined;s.depth=100000-(s.y*10+(rt.spriteHeight(s)-(meta?.originY??0)*s.imageYscale)*10);s.depth+=s.depthbonus;}
  s.sinerx=0;s.sinery=0;
  for(const n of [0,1])if(s[`siner_add${n}`]!==0){s[`siner${n}`]+=s[`siner_add${n}`];s.sinmove=(s[`siner_type${n}`]==='sin'?Math.sin:Math.cos)(s[`siner${n}`])*s[`siner_amplitude${n}`];const x=lengthdirX(s.sinmove,s[`siner_direction${n}`]),y=lengthdirY(s.sinmove,s[`siner_direction${n}`]);if(s[`siner_visual${n}`]===1){s.sinerx+=x;s.sinery+=y;}else{s.x+=x;s.y+=y;}}
  if(s.shakeamt>0){s.shaketimer--;if(s.shaketimer<=0){s.shakex=rt.random.randomRange(-s.shakeamt,s.shakeamt);s.shakey=rt.random.randomRange(-s.shakeamt,s.shakeamt);s.shaketimer=s.shaketime;}}else{s.shakex=0;s.shakey=0;}
 },
 draw:drawTenna,
}}];}
function drawTenna(s:GmInstance,rt:GmRuntime){
 if(s.golden_mode||s.threepartmode||s.communication>0)throw Error('obj_actor_tenna: non-weather presentation mode not ported');
 if(s.facing==='r')s.reversal=1;if(s.facing==='l')s.reversal=0;s.facing='d';s.siner+=s.speedscale;s.siner0+=s.speedscale;s.siner1+=s.speedscale;s.siner2+=s.speedscale;
 if(!s.scaled_bounce){
  if(s.bounce===1){s.imageYscale=2.5;s.imageXscale=s.imageXscale<0?-1.5:1.5;s.bounce=2;}
  if(s.bounce===2){const target=s.imageXscale<0?-2:2;scrLerpvar(s,rt,'image_xscale',s.imageXscale,target,16,-2,'out');scrLerpvar(s,rt,'image_yscale',s.imageYscale,2,16,-2,'out');s.bounce=3;}
  if(s.bounce===3&&le(s.imageYscale,2.01)){s.imageYscale=2;s.bounce=0;}
 }else{
  if(s.bounce===1){s.cur_xscale=s.imageXscale;s.cur_yscale=s.imageYscale;s.bounce=2;}
  if(s.bounce===2){s.imageYscale=s.cur_yscale*1.25;s.imageXscale=s.cur_xscale*0.75;s.bounce=3;}
  if(s.bounce===3){scrLerpvar(s,rt,'image_xscale',s.imageXscale,s.cur_xscale,16,-2,'out');scrLerpvar(s,rt,'image_yscale',s.imageYscale,s.cur_yscale,16,-2,'out');s.bounce=4;}
  if(s.bounce===4&&le(s.imageYscale,s.cur_yscale+0.1)){s.imageYscale=s.cur_yscale;s.bounce=0;}
 }
 if(s.preset!==-1){s.drawtype=0;
  if(s.preset===0){s.imageSpeed=0;s.wobblestate=0;s.wobbletime=0;s.wobbleamt=0;s.drawtype=1;}
  else if(s.preset===2){s.sprite='spr_tenna_point_up';s.wobblestate=1;s.wobbletime=4;s.wobbleamt=8;}
  else if(s.preset===7){s.sprite='spr_tenna_sad';s.wobblestate=6;s.wobbletime=12;s.wobbleamt=20;}
  else throw Error(`obj_actor_tenna: preset ${s.preset} not ported`);
  s.preset=-1;
 }
 const meta=s.sprite?rt.bank.get(s.sprite):undefined,ox=(meta?.originX??0)*s.imageXscale,oy=(meta?.originY??0)*s.imageYscale,w=rt.spriteWidth(s),h=rt.spriteHeight(s);
 Object.assign(s,{x1:s.x-ox,y1:s.y-oy,x2:s.x-ox+w,y2:s.y-oy,x3:s.x-ox+w,y3:s.y-oy+h,x4:s.x-ox,y4:s.y-oy+h});
 const sign=s.reversal===1?-1:1;
 if(s.wobblestate===1||s.wobblestate===6){const add=Math.abs(Math.sin(s.siner/s.wobbletime)*s.wobbleamt)-(s.wobblestate===6?s.wobbleamt:0);s.x1+=add*sign;s.x2+=add*sign;s.y1-=add;s.y2+=add/(s.wobblestate===6?2:1);}
 else if(s.wobblestate!==0)throw Error(`obj_actor_tenna: wobble ${s.wobblestate} not ported`);
 if(s.reversal===1){[s.x1,s.x2]=[s.x2,s.x1];[s.x3,s.x4]=[s.x4,s.x3];}
 if(s.drawtype===0){
  for(const n of [1,2,3,4]){if(s.xscale!==2)s[`x${n}`]=s.x+(s[`x${n}`]-s.x)*(s.xscale/2);if(s.yscale!==2)s[`y${n}`]=s.y+(s[`y${n}`]-s.y)*(s.yscale/2);if(s.shakex!==0)s[`x${n}`]+=s.shakex;if(s.shakey!==0)s[`y${n}`]+=s.shakey;}
  if(s.outline||s.dropshadow||s.flash||s.mad)throw Error('obj_actor_tenna: weather quad effects not ported');
  rt.drawSpritePos(s.sprite!,s.imageIndex,s.x1,s.y1,s.x2,s.y2,s.x3,s.y3,s.x4,s.y4,1);
 }else if(s.drawtype===1){
  if(s.dropshadow)rt.drawSprite(s.sprite!,s.imageIndex,s.x+s.dropdist,s.y+s.dropdist,s.imageXscale,s.imageYscale,s.imageAngle,0,s.imageAlpha);
  rt.drawSelf(s);if(s.flash){s.flashsiner++;rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,-Math.cos(s.flashsiner/5)*0.4+0.6);}
  if(s.darkenalpha>0){rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,0,s.darkenalpha);s.darkenalpha-=0.01;}
 }else throw Error(`obj_actor_tenna: draw type ${s.drawtype} not ported`);
 if(s.nose_bloom)rt.drawSprite('spr_tenna_blossom',s.nose_bloom_index,s.x1+(s.imageXscale<0?-36:36),s.y1+36,s.nose_bloom_scale_x,s.nose_bloom_scale_y,s.imageAngle,0xffffff,s.imageAlpha);
}
