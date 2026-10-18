// Queen's ultimate attack: the party fades while she "downloads" it, the download fails into a pile of error windows,
// and exploding heads fly in from the sides. Objects: obj_queen_ultimate_attack_controller, obj_queen_poppup_error and
// obj_hiddenheart.
import type {GmObjectDef} from '../../gm/runtime';
import {gt,lerp} from '../../gm/math';
import {C} from '../../gm/graphics';
import {dmgWriter} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';
import {type QueenObject,queenInstance} from './context';

/** Where each of the fourteen error windows opens, from the box's centre. */
const ERRORS:readonly (readonly [number,number])[]=[[60,-75],[20,-40],[-75,0],[90,-15],[45,-5],[0,13],[57,75],[15,99],[-20,65],[-50,85],[-83,50],[-25,-85],[-70,-40],[90,30]];
/** The exploding heads: [frame, x and y from the box's centre]. */
const HEADS:readonly (readonly [number,number,number])[]=[[24,-200,-100],[40,200,0],[56,-190,100],[72,200,-100],[88,-200,0],[104,190,100],[120,-200,-100],[136,200,0],[152,-190,100]];

export function createQueenUltimate(object:QueenObject):GmObjectDef[]{
 const heroes=()=>object('obj_heroparent');
 const error:GmObjectDef={...object('obj_queen_poppup_error'),events:{
  create:(s,rt)=>{
   s.state=-1;s.sprite=rt.random.choose('spr_queenscreen_error','spr_queenscreen_error2');
   Object.assign(s,{scale:0,blockstate:0,timer:0,mock:0,con:0,mocktimer:0});
   rt.soundStop?.('snd_won');snd(rt,'snd_won');
  },
  // Opens like the search windows.
  step:s=>{
   if(s.con===0){s.timer+=s.timer+1;s.imageXscale=lerp(4,1,s.timer/30);s.imageYscale=lerp(0,4,s.timer/30);if(s.timer>=30){s.con=1;s.timer=0;}}
   if(s.con===1){s.timer+=s.timer+1;s.imageXscale=lerp(1,2,s.timer/15);s.imageYscale=lerp(4,2,s.timer/15);if(s.timer>=15){s.timer=0;s.con=2;s.imageXscale=2;s.imageYscale=2;}}
   if(s.con===2&&s.imageIndex===9){s.tasquecon=1;s.con=99;}
  },
 }};
 const hidden:GmObjectDef={...object('obj_hiddenheart'),events:{
  create:(s,rt)=>{const h=rt.first(object('obj_heart'));if(h){s.x=h.x;s.y=h.y;}s.imageSpeed=0;},
  endStep:(s,rt)=>{const h=rt.first(object('obj_heart'));if(h){s.x=h.x;s.y=h.y;s.imageIndex=h.imageIndex;}else rt.destroy(s);},
 }};
 const controller:GmObjectDef={...object('obj_queen_ultimate_attack_controller'),events:{
  create:(s,rt)=>{
   const q=queenInstance(rt,object,'obj_queen_enemy');
   s.timer=0;s.con=0;s.variant=q.ultimateattackused===1?1:0;q.ultimateattackused=1;
   Object.assign(s,{dottimer:0,poppuptimer:0,poppupcount:0,barprogress:0});
   s.depth=queenInstance(rt,object,'obj_growtangle').depth+10;
  },
  destroy:(s,rt)=>{for(const h of rt.withInstances(heroes()))h.imageAlpha=1;for(const q of rt.withInstances(object('obj_queen_enemy')))q.imageAlpha=1;},
  step:(s,rt)=>{
   const fade=(amount:number)=>{
    for(const h of rt.withInstances(heroes()))if(amount>0||gt(h.imageAlpha,0))h.imageAlpha+=amount;
    for(const q of rt.withInstances(object('obj_queen_enemy')))if(amount>0||gt(q.imageAlpha,0))q.imageAlpha+=amount;
   };
   for(const w of rt.withInstances(dmgWriter))rt.destroy(w);
   // Downloading: everyone fades and the bar fills (faster the second time).
   if(s.con===0){
    s.timer++;
    if(s.timer<20)fade(-.1);
    if(s.timer<45&&s.variant===0)s.barprogress+=2;
    if(s.timer<15&&s.variant===1)s.barprogress+=6;
    if((s.timer>90&&s.variant===0)||(s.timer>30&&s.variant===1)){s.con=1;s.timer=0;}
   }
   // Failed: error windows pile up, and the heads come.
   if(s.con===1){
    s.timer++;const box=queenInstance(rt,object,'obj_growtangle'),xx=box.x,yy=box.y;
    s.poppuptimer++;
    if(s.poppuptimer===2){
     const at=ERRORS[s.poppupcount];
     if(at){const e=rt.create(error,xx+at[0],yy+at[1]);e.depth-=s.poppupcount;}
     s.poppuptimer=0;s.poppupcount++;
    }
    for(const [frame,dx,dy] of HEADS)if(s.timer===frame){const d=rt.create(object('obj_queen_explodinghead_intro'),xx+dx,yy+dy);s.d=d.id;d.ultimate=1;d.first=1;}
   }
   const g=rt.globals;
   if(g.turntimer<14){for(const e of rt.withInstances(error))e.imageAlpha-=.1;s.imageAlpha-=.1;}
   if(g.turntimer<11){for(const e of rt.withInstances(error))e.imageAlpha-=.1;s.imageAlpha-=.1;fade(.1);}
  },
  draw:(s,rt)=>{
   const d=rt.drawState,box=queenInstance(rt,object,'obj_growtangle');
   d.color=C.white;d.alpha=s.imageAlpha;
   if(s.con===0){
    let dots='...';
    if(s.timer<45&&s.variant===0)s.dottimer++;
    if(s.timer<15&&s.variant===1)s.dottimer++;
    if(s.dottimer>=5)dots='.';if(s.dottimer>=10)dots='..';if(s.dottimer>=15)s.dottimer=0;
    d.font='fnt_main';d.halign=1;
    rt.drawText(box.x,box.y-160,sourceText('obj_queen_ultimate_attack_controller_slash_Draw_0_gml_20_0'));
    rt.drawText(box.x,box.y-140,sourceText('obj_queen_ultimate_attack_controller_slash_Draw_0_gml_21_0')+dots);
   }
   if(s.con===1){
    d.font='fnt_main';d.halign=1;
    rt.drawText(box.x,box.y-160,sourceText('obj_queen_ultimate_attack_controller_slash_Draw_0_gml_29_0'));
    rt.drawText(box.x,box.y-140,sourceText('obj_queen_ultimate_attack_controller_slash_Draw_0_gml_30_0'));
   }
   d.halign=0;
   rt.drawRect(box.x-80,box.y-110,box.x+80,box.y-90,true);
   rt.drawRect(box.x-80,box.y-110,box.x-80+s.barprogress,box.y-90);
   d.alpha=1;
  },
 }};
 return [controller,error,hidden];
}
