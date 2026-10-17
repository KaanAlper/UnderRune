// The shield animates in Draw in the original. Moving these updates to Step changes its ordering and RNG.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {le,lt,gt} from '../../gm/math';
import {snd} from '../../deltarune/sound';
import {type QueenObject,queenInstance} from './context';
const ease=(a:number,b:number,t:number,p:number)=>a+(b-a)*(p===1?Math.sin(t*Math.PI/2):-t*(t-2));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

export function createQueenShield(object:QueenObject):GmObjectDef{
 const queen=(rt:GmRuntime)=>queenInstance(rt,object,'obj_queen_enemy');
 const sort=(s:GmInstance)=>{
  for(s.i=0;s.i<14;s.i++)s.shieldpiece_y_save[s.i]=s.shieldpiece_y[s.i];
  let c=0;while(c<14){const min=Math.min(...s.shieldpiece_y.slice(0,14));for(s.i=0;s.i<14;s.i++)if(s.shieldpiece_y[s.i]===min){s.depthorder[c]=s.i;c++;s.shieldpiece_y[s.i]=9999;}}
  for(s.i=0;s.i<14;s.i++)s.shieldpiece_y[s.i]=s.shieldpiece_y_save[s.i];
 };
 const def:GmObjectDef={...object('obj_queenshield_enemy'),events:{
  create:(s,rt)=>{
   Object.assign(s,{depth:queen(rt).depth-1,imageBlend:0x008000,imageAlpha:.9,imageXscale:2,imageYscale:2,imageAngle:0,imageSpeed:0,appeartimer:0,hurtsfxtimer:0,hurtsfxcon:0,siner:0,con:0,createeffect:0,timer:0,turn:0,shieldsiner:0,shieldstate:0,shieldtimer:0,appearcon:0,queenhandx:510,queenhandy:115,idealx:s.x,shieldhurt:0,shieldhurttimer:0,shieldx:0,shieldy:0,shieldalpha:1,shieldheight:rt.bank.get(s.sprite!)!.height,shieldhpgradual:0,imabouttobreak:0,imabouttobreak_alpha:.4,imabouttobreak_siner:0,shaketimer:0,movetimer:0,movetype:0,movecon:0,movepiece:0,destroycon:0,destroytimer:0,shieldsize:queen(rt).shieldsize});
   const values:Record<string,any>={shieldpiece_x_origin:s.x+39,shieldpiece_y_origin:s.y+135,shieldpiece_x:s.x+39,shieldpiece_y:s.y+135,shieldpiece_y_save:s.y+135,shieldpiece_visible:1,shieldpiece_xscale:2,shieldpiece_yscale:2,shieldpiece_alpha:1,shieldpiece_sprite_index:'spr_queenshield_pieces',shieldpiece_image_index:0,shieldpiece_fadetimer:0,shieldpiece_fadecon:0,depthorder:0};
   for(const [name,value] of Object.entries(values))s[name]=Array(14).fill(value);for(s.i=0;s.i<14;s.i++){}
   s.moveorder=(s.shieldsize===7?[4,3,2,5,6,1,0]:s.shieldsize===10?[4,3,2,5,6,1,7,0,8,9]:[4,3,2,5,6,1,7,0,8,9,10,11]);
   for(let i=s.shieldsize;i<14;i++)s.shieldpiece_sprite_index[i]='spr_nothing';
   for(let i=0;i<s.shieldsize;i++)s.shieldpiece_image_index[i]=i===0?0:i===s.shieldsize-1?2:1;
  },
  user0:(s,rt)=>{s.hurtsfxcon=1;s.shieldhurt=1;s.shieldhurttimer=6;snd(rt,'snd_swallow');},
  user1:(s,rt)=>{const a=rt.create(object('obj_queen_vector_explosion'),s.x+40,s.y+120);s.anim=a.id;a.imageXscale=2;a.imageYscale=2;},
  user2:s=>sort(s),
  draw:(s,rt)=>{
   const q=queen(rt);s.depth=q.depth-1;s.shieldsiner++;s.y+=Math.sin(s.shieldsiner/6)*.5;
   if(s.shaketimer>0){s.x=s.xstart+s.shaketimer;s.y=s.ystart+s.shaketimer;s.shaketimer--;}
   if(s.hurtsfxcon===1){s.hurtsfxtimer++;if(!rt.sourceAudio?.playing('snd_swallow'))snd(rt,'snd_swallow');if(s.hurtsfxtimer===10){s.hurtsfxcon=0;s.hurtsfxtimer=0;}}
   const a=le(q.shieldhp/q.shieldmaxhp,q.shieldacthp/q.shieldactmaxhp)?q.shieldhp/q.shieldmaxhp:q.shieldacthp/q.shieldactmaxhp;
   for(let i=0;i<s.shieldsize;i++)s.shieldpiece_sprite_index[i]=(i===s.shieldsize-1?le(a,0):lt(a,(s.shieldsize-i-1)/s.shieldsize))?'spr_queenshield_pieces_hurt':'spr_queenshield_pieces';
   if(gt(s.shieldpiece_yscale[0],.1)){
    if(s.movecon===15&&s.shieldalpha>0)s.shieldalpha-=.1;if(s.movecon!==15&&s.shieldalpha<1)s.shieldalpha+=.1;
    const idle=q.sprite==='spr_queen_chair_1_battle'||q.sprite==='spr_queen_chair_1_old',x1=idle?10:17,y1=idle?5:23,x2=idle?10:17,y2=idle?22:0;
    rt.drawState.alpha=s.shieldalpha*.8;rt.drawState.color=0x00ff00;
    rt.drawLine(s.queenhandx+x1,s.queenhandy-y1,s.x+14,s.shieldpiece_y[0]+s.y-48);
    rt.drawLine(s.queenhandx+x2,s.queenhandy+y2,s.x+81,s.shieldpiece_y[s.shieldsize-1]+s.y+33-(s.appearcon===3?(16-16*s.shieldpiece_yscale[0]/2)*2:0));
   }
   const draw=(i:number,sprite=s.shieldpiece_sprite_index[i],alpha=s.shieldpiece_alpha[i],fog=false)=>{
    (fog?rt.drawSpriteFog.bind(rt):rt.drawSprite.bind(rt))(sprite,s.shieldpiece_image_index[i],s.shieldpiece_x[i],s.shieldpiece_y[i]+s.y,s.shieldpiece_xscale[i],s.shieldpiece_yscale[i],0,0xffffff,alpha);
   };
   if(s.shieldhurt===0)for(s.i=0;s.i<14;s.i++){
    const ii=s.depthorder[13-s.i];draw(ii);
    if(s.shieldpiece_fadecon[ii]===1){if(s.shieldpiece_fadetimer[ii]<10)s.shieldpiece_fadetimer[ii]++;draw(ii,'spr_queenshield_pieces_hurt',s.shieldpiece_fadetimer[ii]/10);}
    if(s.shieldpiece_fadecon[ii]===2){s.shieldpiece_fadetimer[ii]--;if(s.shieldpiece_fadetimer[ii]===0)s.shieldpiece_fadecon[ii]=0;draw(ii,'spr_queenshield_pieces_hurt',s.shieldpiece_fadetimer[ii]/10);}
    if(q.shieldhp<=5||q.shieldacthp<1){s.imabouttobreak_siner+=.5;s.imabouttobreak_alpha=.1+Math.sin(s.imabouttobreak_siner)/6;if(s.shieldpiece_sprite_index[ii]!=='spr_nothing')draw(ii,'spr_queenshield_pieces',s.imabouttobreak_alpha,true);}
   }
   for(let repeat=0;repeat<3;repeat++){
    if(s.appearcon===1){
     const origins=s.shieldsize===7?[70,95,115,135,155,175,200]:s.shieldsize===10?[50,75,95,115,135,155,175,195,215,240]:[20,45,65,85,105,125,145,165,185,205,225,250];
     for(let i=0;i<origins.length;i++)s.shieldpiece_y_origin[i]=origins[i];for(s.i=0;s.i<14;s.i++){s.shieldpiece_yscale[s.i]=2;s.shieldpiece_alpha[s.i]=0;}
     s.appearcon=0;s.movetype=0;s.movetimer=0;s.movecon=1;
    }
    if(s.movecon===1){s.movecon=2;s.shieldpiece_fadecon[s.moveorder[s.movepiece]]=1;}
    if(s.movecon===2){const i=s.moveorder[s.movepiece];s.movetimer+=2;s.shieldpiece_x[i]=ease(s.shieldpiece_x_origin[i],s.shieldpiece_x_origin[i]+15,s.movetimer/10,2);s.shieldpiece_alpha[i]=s.movetimer/10;if(s.movetimer===10){s.movetimer=0;s.movecon=3;}}
    if(s.movecon===3){const i=s.moveorder[s.movepiece];s.movetimer+=2;s.shieldpiece_y[i]=lerp(s.shieldpiece_y[i],s.shieldpiece_y_origin[i],s.movetimer/10);if(s.movetimer===10){s.movetimer=0;s.movecon=4;s.shieldpiece_fadecon[i]=2;}sort(s);}
    if(s.movecon===4){const i=s.moveorder[s.movepiece];s.movetimer+=2;s.shieldpiece_x[i]=ease(s.shieldpiece_x_origin[i]+15,s.shieldpiece_x_origin[i],s.movetimer/10,1);if(s.movetimer===10){s.movetimer=0;s.movecon=5;}}
    if(s.movecon===5){if(s.movepiece===s.shieldsize-1){s.movecon=0;s.movepiece=0;}else{s.movepiece++;s.movecon=1;}}
   }
   for(let repeat=0;repeat<5;repeat++){
    if(s.appearcon===2){s.appearcon=0;s.movetype=0;s.movetimer=0;s.movecon=10;}
    if(s.movecon===10){s.movecon=11;s.shieldpiece_fadecon[s.moveorder[s.movepiece]]=1;}
    if(s.movecon===11){const i=s.moveorder[s.movepiece];s.movetimer+=2;s.shieldpiece_x[i]=ease(s.shieldpiece_x_origin[i],s.shieldpiece_x_origin[i]+15,s.movetimer/10,1);if(s.movetimer===10){s.movetimer=0;s.movecon=12;}}
    if(s.movecon===12){const i=s.moveorder[s.movepiece];s.movetimer+=2;s.shieldpiece_y[i]=lerp(s.shieldpiece_y_origin[i],s.ystart+135,s.movetimer/10);if(s.movetimer===10){s.movetimer=0;s.movecon=13;s.shieldpiece_fadecon[i]=2;}sort(s);}
    if(s.movecon===13){const i=s.moveorder[s.movepiece];s.movetimer+=2;s.shieldpiece_x[i]=ease(s.shieldpiece_x_origin[i]+15,s.shieldpiece_x_origin[i],s.movetimer/10,2);if(s.movetimer===10){s.movetimer=0;s.movecon=14;}}
    if(s.movecon===14){if(s.movepiece===s.shieldsize-1){s.movecon=15;s.movepiece=0;}else{s.movepiece++;s.movecon=10;}}
    if(s.movecon===15){if(s.movetimer<50)s.movetimer++;for(s.i=0;s.i<12;s.i++)s.shieldpiece_alpha[s.i]=1-s.movetimer/50;}
   }
   if(s.shieldhurt===1){s.shieldx=(rt.random.random(s.shieldhurttimer)-rt.random.random(s.shieldhurttimer))*2;s.shieldhurttimer--;if(s.shieldhurttimer<=0)s.shieldhurt=0;
    for(s.i=0;s.i<12;s.i++){s.shieldpiece_x[s.i]=s.x+33+rt.random.irandom(12);draw(s.i);if(s.shieldhurt===0)s.shieldpiece_x[s.i]=s.x+39;}
   }
   if(s.shieldhurt===2){rt.userEvent(s,1);rt.destroy(s);}
   if(s.destroycon===1){s.destroytimer++;if(s.destroytimer===4||s.destroytimer===8){const a=rt.create(object('obj_queen_vector_explosion'),s.x,s.y);s.anim=a.id;a.imageXscale=1;a.imageYscale=1;}if(s.destroytimer===12)s.destroycon=0;}
   rt.drawState.alpha=1;
  },
 }};return def;
}
