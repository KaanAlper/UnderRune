import type {GmObjectDef} from '../../gm/runtime';
import {afterimage,dmgWriter} from '../../deltarune/battle';
import {eq,lengthdirX,lengthdirY} from '../../gm/math';
import {snd} from '../../deltarune/sound';
import {type QueenObject,queenInstance} from './context';

/** Queen's scene actors and acid presentation dependencies; none is a substitute for an attack object. */
export function createQueenSupport(object:QueenObject):GmObjectDef[]{
 const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
 const bird:GmObjectDef={...object('obj_berdlyplug_enemy'),events:{
  create:(s,rt)=>{
   Object.assign(s,{timer:0,con:0,siner:0,fsiner:0,flash:0,shake:0,shake2:0,imageXscale:2,imageYscale:2,alphacon:0,xx:s.x,yy:s.y,bardlymercy:0,savex:s.xstart,savey:s.ystart,introtimer:0,outrotimer:-1,outrox:0,outroy:0});
   if(rt.room.name!=='room_dw_mansion_east_4f_d')s.introtimer=-1;
   else{const scene=queenInstance(rt,object,'obj_ch2_scene25'),wire=rt.byId(scene.berdly_wire);if(!wire)throw Error('Queen scene Berdly wire missing');s.outrox=wire.x;s.outroy=wire.y;}
  },
  step:(s,rt)=>{
   s.ystart+=s.gravity;
   if(s.introtimer>=0){s.introtimer++;s.x=s.xstart+(1112-s.xstart)*s.introtimer/10;s.y=s.ystart+(44-s.ystart)*s.introtimer/10;if(s.introtimer===10){s.introtimer=-1;s.xstart=s.x;s.ystart=s.y;}return;}
   if(s.outrotimer>=0){s.outrotimer++;s.x=s.xstart+(s.outrox-s.xstart)*s.outrotimer/10;s.y=s.ystart+(s.outroy-s.ystart)*s.outrotimer/10;if(s.outrotimer===10){rt.destroy(s);for(const scene of rt.withInstances(object('obj_ch2_scene25'))){const wire=rt.byId(scene.berdly_wire),actor=rt.byId(scene.be_actor);if(!wire||!actor)throw Error('Queen scene Berdly actor missing');wire.visible=true;actor.visible=true;}}return;}
   if(s.con===0){s.siner+=.4;s.y=s.ystart+Math.sin(s.siner/6)*3;}
   if(s.con===1){s.timer++;s.y=lerp(s.ystart+Math.sin(s.siner/6)*3,s.ystart-200,s.timer/10);if(s.timer===10){s.timer=0;s.con=99;}}
   if(s.con===2){s.timer++;s.y=lerp(s.ystart-200,s.ystart+Math.sin(s.siner/6)*3,s.timer/10);if(s.timer===10){s.timer=0;s.con=0;}}
   if(s.con===3){s.timer++;s.x=s.xx+(s.xstart-s.xx)*s.timer/10;s.y=s.yy+(s.ystart+Math.sin(s.siner/6)*3-s.yy)*s.timer/10;if(s.timer===10){s.timer=0;s.con=0;}}
   if(s.alphacon===1){if(s.imageAlpha>0)s.imageAlpha-=.05;if(rt.globals.turntimer<3)s.alphacon=2;}
   if(s.alphacon===2){s.imageAlpha+=.05;if(s.imageAlpha>=1)s.alphacon=0;}
  },
  // Alarm 0: the wires' mercy, shown over Berdly (Queen's own mercy for him stops at 100).
  alarm0:(s,rt)=>{
   const q=queenInstance(rt,object,'obj_queen_enemy');let mercy=Math.ceil(s.bardlymercy);
   if(mercy+q.bardlymercy>100)mercy=Math.ceil(100-q.bardlymercy);
   if(mercy!==0){const w=rt.create(dmgWriter,s.x+20,s.y+20-rt.globals.hittarget[0]*20);s.__mercydmgwriter=w.id;w.damage=mercy;w.type=5;}
   q.bardlymercy+=mercy;
   for(const w of rt.withInstances(dmgWriter)){w.x=s.x;w.y=s.y+20;w.depth=q.depth-1;}
   s.bardlymercy=0;
  },
  user0:(s,rt)=>{s.shake=10;snd(rt,'snd_pirouette');rt.sourceAudio?.volume('snd_pirouette',.4,0);},
  draw:(s,rt)=>{
   if(s.shake>0)s.shake-=.5;const z=rt.random.random(s.shake)*2-s.shake;
   if(s.shake2>0)s.shake2-=.5;const a=rt.random.random(s.shake2)*2-s.shake2;
   const draw=(sprite:string,frame:number,x:number,y:number)=>rt.drawSprite(sprite,frame,x,y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
   if(s.sprite==='spr_cutscene_25_berdly_grab_plug')draw('spr_cutscene_25_berdly_grab_plug',0,s.x+a,s.y+a);
   else{draw('spr_berdly_plug_queen_boss',1,s.x+a,s.y+a);draw('spr_berdly_plug_queen_boss',0,s.x+z,s.y+z);}
   s.fsiner++;if(s.flash===1)rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,-Math.cos(s.fsiner/5)*.4+.6);
   if(s.shake>4)rt.drawSpriteFog('spr_berdly_plug_queen_boss',0,s.x+z,s.y+z,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,1);
  },
 }};
 const battlePlug:GmObjectDef={...object('obj_queen_battle_plug'),events:{
  create:s=>Object.assign(s,{timer:0,con:0,type:0,imageXscale:2,imageYscale:2}),
  step:(s,rt)=>{if(s.con===0){s.timer++;s.y=s.ystart+140*s.timer/14;if(s.timer===14){s.con=1;s.timer=0;}}if(s.con===2){s.timer++;s.y=s.ystart+140-140*s.timer/7;if(s.timer===7)rt.destroy(s);}},
 }};
 const glass:GmObjectDef={...object('obj_queen_battlesolid_wine'),events:{
  create:(s,rt)=>Object.assign(s,{alpha2:1,nofill:0,fill_yscale:1,fill_yscale_gradual:1,depth:queenInstance(rt,object,'obj_queen_enemy').depth-1,imageSpeed:0,imageXscale:.4,imageYscale:.6,wine_bottom_xscale:.4,wine_bottom_yscale:.6,wine_bottom_yoffset:0}),
  endStep:(s,rt)=>{if(!eq(s.imageXscale,.4))return;const q=queenInstance(rt,object,'obj_queen_enemy');if(q.sprite==='spr_queen_throw_wineglass'){s.x=q.x+35;s.y=q.y+10;}if(q.sprite==='spr_queen_chair_1_old'){s.x=q.x+28;s.y=q.y+28;}},
  animationEnd:s=>{s.imageIndex=0;s.imageSpeed=0;},
  draw:(s,rt)=>{
   const q=queenInstance(rt,object,'obj_queen_enemy');s.fill_yscale=q.shieldacthp/q.shieldactmaxhp;if(s.fill_yscale_gradual>s.fill_yscale)s.fill_yscale_gradual-=.02;
   if(s.alpha2<1)s.alpha2+=.04;else s.alpha2=1;if(q.imageAlpha<1){s.alpha2=q.imageAlpha;s.imageAlpha=q.imageAlpha;}if(eq(q.imageAlpha,1)&&eq(s.imageAlpha,.9)){s.alpha2=1;s.imageAlpha=1;}
   if(s.fill_yscale_gradual<.02){if(s.wine_bottom_xscale>0)s.wine_bottom_xscale-=.02;if(s.wine_bottom_yscale>0)s.wine_bottom_yscale-=.02;s.wine_bottom_yoffset+=.5;}
   if(s.nofill===0)for(const [color,alpha] of [[0xffffff,s.imageAlpha],[0x00ff00,s.alpha2]]){
    rt.drawSprite('spr_queen_wine_fill',0,s.x+lengthdirX(9*s.imageXscale,s.imageAngle+270),s.y+lengthdirY(9*s.imageYscale,s.imageAngle+270),s.imageXscale,s.imageYscale*s.fill_yscale_gradual,s.imageAngle,color,alpha);
    rt.drawSprite('spr_queen_wine_fill',1,s.x+lengthdirX((s.wine_bottom_yoffset+8)*s.imageXscale,s.imageAngle+270),s.y+lengthdirY((s.wine_bottom_yoffset+8)*s.imageYscale,s.imageAngle+270),s.wine_bottom_xscale,s.wine_bottom_yscale,s.imageAngle,color,alpha);
   }
   rt.drawSelf(s);
  },
 }};
 const intro:GmObjectDef={...object('obj_queenshield_intro'),events:{
  create:(s,rt)=>{const q=queenInstance(rt,object,'obj_queen_enemy');Object.assign(s,{imageXscale:2,imageYscale:2,imageSpeed:0,imageBlend:0xffffff,depth:-50,winetimer:0,con:0,siner:0,introtimer:0,timer:0,angle_speed:0,_remx:q.x+29,_remy:q.y+50,_idealx:s.x,_idealy:s.y,fill_yscale:1,fill_yscale_gradual:1});q.sprite='spr_queen_throw_wineglass';},
  step:(s,rt)=>{
   const q=queenInstance(rt,object,'obj_queen_enemy');s.winetimer++;s._remx=q.x+29;s._remy=q.y+10;
   if(s.winetimer<=15){const a=rt.create(afterimage,s.x,s.y);s.after=a.id;Object.assign(a,{x:s.x,y:s.y,imageSpeed:0,imageXscale:s.imageXscale,imageYscale:s.imageYscale,sprite:s.sprite,depth:s.depth+1,imageBlend:0x00ff00});s.x=s._idealx+(s._remx-s._idealx)*s.winetimer/15;s.y=s._idealy+(s._remy-s._idealy)*s.winetimer/15;s.imageXscale=2-1.6*s.winetimer/15;s.imageYscale=2-1.4*s.winetimer/15;}
   if(s.winetimer===15)s.imageSpeed=1;if(s.winetimer>=15){s.x=s._remx;s.y=s._remy;}
   if(s.winetimer===23){s.imageSpeed=0;q.wineglasscon=0;const sh=rt.create(object('obj_queenshield_enemy'),q.x-82,q.y-100);s.shield=sh.id;sh.appearcon=1;const w=rt.create(object('obj_queen_battlesolid_wine'),s.x,s.y);s.wine=w.id;w.alpha2=0;rt.destroy(s);}
  },
  draw:(s,rt)=>{
   const q=queenInstance(rt,object,'obj_queen_enemy');s.fill_yscale=q.shieldacthp/q.shieldactmaxhp;if(s.fill_yscale_gradual>s.fill_yscale)s.fill_yscale_gradual-=.005;
   for(const [frame,offset,scale] of [[0,9,s.imageYscale*s.fill_yscale_gradual],[1,8,s.imageYscale]])rt.drawSprite('spr_queen_wine_fill',frame,s.x+lengthdirX(offset*s.imageXscale,s.imageAngle+270),s.y+lengthdirY(offset*s.imageYscale,s.imageAngle+270),s.imageXscale,scale,s.imageAngle,0xffffff,s.imageAlpha);rt.drawSelf(s);
  },
 }};
 const shine:GmObjectDef={...object('obj_queen_wine_shine'),events:{
  create:(s,rt)=>{const w=queenInstance(rt,object,'obj_queen_battlesolid_wine');Object.assign(s,{timer:0,con:0,imageIndex:1,imageXscale:2,imageYscale:2,x:w.x-8,y:w.y-15});},
  step:(s,rt)=>{const w=queenInstance(rt,object,'obj_queen_battlesolid_wine');s.x=w.x-8;s.y=w.y-15;s.timer++;s.imageAngle+=3;if(s.con===0){s.imageAlpha+=.07;s.imageXscale+=.05;s.imageYscale+=.05;if(s.imageAlpha>1.1)s.con=1;}if(s.con===1){s.imageAlpha-=.07;s.imageXscale-=.05;s.imageYscale-=.05;if(s.imageAlpha<0)rt.destroy(s);}},
 }};
 const droplet:GmObjectDef={...object('obj_queen_drink_droplet'),events:{
  create:(s,rt)=>{const q=queenInstance(rt,object,'obj_queen_enemy');Object.assign(s,{imageBlend:0x00ff00,imageAlpha:1.2,imageXscale:.16,imageYscale:.16,sprite:'spr_sneo_bigcircle',depth:q.depth-1,timer:0,offset:0});s.path=rt.paths.add();rt.paths.setKind(s.path,1);rt.paths.setClosed(s.path,false);rt.paths.addPoint(s.path,s.x,s.y,100);rt.paths.addPoint(s.path,s.x+lengthdirX(63,70),s.y+lengthdirY(63,70),100);rt.paths.addPoint(s.path,q.x+72,q.y+75,100);rt.paths.start(s,s.path,4,0,true);},
  step:(s,rt)=>{s.timer++;s.path_position=s.timer/15;s.path_position+=s.offset;if(s.path_position>.99)rt.destroy(s);if(s.y>queenInstance(rt,object,'obj_queen_enemy').y+46)rt.destroy(s);},
  pathEnd:(s,rt)=>{if(rt.paths.exists(s.path))rt.paths.delete(s.path);},
 }};
 const explosion:GmObjectDef={...object('obj_queen_vector_explosion'),events:{create:(s,rt)=>{s.imageSpeed=.1333;s.alarm[0]=27;s.imageXscale=1;s.imageYscale=1;rt.soundStop?.('snd_explosion_8bit');snd(rt,'snd_explosion_8bit');},alarm0:(s,rt)=>rt.destroy(s)}};
 const buffer:GmObjectDef={...object('obj_queen_buffercontroller'),events:{
  create:s=>Object.assign(s,{buffering:0,bufferbar:0,songtime:0,bufferdelay:90,bufferduration:75}),
  step:(s,rt)=>{const music=rt.globals.batmusic[1];if(s.buffering===0){s.bufferbar++;if(s.bufferbar===s.bufferdelay-15){const position=rt.sourceAudio?.position(music);s.songtime=typeof position==='number'?position:0;}if(s.bufferbar===s.bufferdelay){s.bufferbar=0;s.buffering=1;}}else if(s.buffering===1){if(s.bufferbar%15===0)rt.sourceAudio?.position(music,s.songtime);s.bufferbar++;if(s.bufferbar===s.bufferduration)s.buffering=2;}},
  draw:(s,rt)=>{if(s.buffering!==1)return;const b=queenInstance(rt,object,'obj_growtangle'),right=-65+130*s.bufferbar/s.bufferduration;rt.drawState.color=0x808080;rt.drawRect(b.x-65,b.y-100,b.x+65,b.y-90,false);rt.drawState.color=0xffffff;rt.drawState.halign=0;rt.drawText(b.x-65,b.y-160,'Buffering...');rt.drawRect(b.x-65,b.y-100,b.x+right,b.y-90,false);},
 }};
 return [bird,battlePlug,glass,intro,shine,droplet,explosion,buffer];
}
