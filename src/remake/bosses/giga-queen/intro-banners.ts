import {gmArray,type GmObjectDef} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {eq,ge,gt,le,lt} from '../../gm/math';
import {easeOut,lerpEaseIn} from '../../deltarune/ease';
import {snd} from '../../deltarune/sound';

/** Round banners run their complete animation in Draw, including sound and destruction. */
export function createGigaIntroBanners(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const round:GmObjectDef={name:'obj_gigaqueen_intro_round',index:1089,sprite:'spr_gigaqueen_intro_round1',events:{create:(s,rt)=>{
  s.timer=0;s.depth=-99999;s.imageXscale=1;s.imageYscale=1;s.imageSpeed=0;const x=gmArray(s,'xoffset'),y=gmArray(s,'yoffset');for(let i=0;i<=4;i++){x[i]=0;y[i]=0;}
  if(rt.first(object('o_boxingcontroller'))?.wireframe_boxing===1){s.imageXscale=0.5;s.imageYscale=0.5;}
 },draw:(s,rt)=>{
  s.timer++;if(s.timer===8){for(const n of [1,2,3])if(s.sprite===`spr_gigaqueen_intro_round${n}`)snd(rt,`snd_boxing_round${n}`);}
  if(le(s.timer,30)){const wire=rt.first(object('o_boxingcontroller'))?.wireframe_boxing===1;s.y=s.ystart+(wire?60:100)+(wire?s.ystart+60:rt.view.y+200)*easeOut(s.timer/30,-3);}
  if(lt(s.timer,52))rt.drawSelf(s);else{
   s.imageAlpha-=0.1;if(lt(s.imageAlpha,0))rt.destroy(s);s.xoffset[0]-=3;s.yoffset[0]-=4;s.xoffset[1]+=3;s.yoffset[1]-=4;s.xoffset[2]+=3;s.yoffset[2]+=4;s.xoffset[3]-=3;s.yoffset[3]+=4;
   for(s.i=0;s.i<4;s.i++)rt.drawSprite(s.sprite,1+s.i,s.x+s.xoffset[s.i],s.y+s.yoffset[s.i],s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.imageAlpha);
  }
 }}};
 const fight:GmObjectDef={name:'obj_gigaqueen_intro_fight',index:11,sprite:'spr_gigaqueen_intro_fight',events:{create:(s,rt)=>{s.timer=0;const x=gmArray(s,'xoffset');for(let i=0;i<=5;i++)x[i]=0;s.depth=-99999;s.letterspeed1=5;s.letterspeed2=2.5;s.imageXscale=0;s.imageYscale=0;snd(rt,'snd_boxing_fight');if(rt.first(object('o_boxingcontroller'))?.wireframe_boxing===1){s.letterspeed1=4;s.letterspeed2=2;}},draw:(s,rt)=>{
  s.timer++;s.depth=-99999;const max=rt.first(object('o_boxingcontroller'))?.wireframe_boxing===1?0.4:1;
  if(le(s.timer,20)){s.imageXscale=lerpEaseIn(s.imageXscale,max,s.timer/45,0);s.imageYscale=lerpEaseIn(s.imageYscale,max,s.timer/45,0);}
  if(ge(s.timer,9)){if(ge(s.timer,19))s.imageAlpha-=0.05;s.xoffset[0]-=s.letterspeed1;s.xoffset[1]-=s.letterspeed2;s.xoffset[3]+=s.letterspeed2;s.xoffset[4]+=s.letterspeed1;s.letterspeed1-=0.25;s.letterspeed2-=0.125;if(lt(s.letterspeed1,0))s.letterspeed1=0;if(lt(s.letterspeed2,0))s.letterspeed2=0;}
  if(eq(s.timer,39))rt.destroy(s);for(s.i=0;s.i<5;s.i++)rt.drawSprite(s.sprite,s.i,s.x+s.xoffset[s.i],s.y,s.imageXscale,s.imageYscale,0,C.white,s.imageAlpha);
 }}};
 return [round,fight];
}
