// Jevil's body: floating and dancing (with shadow copies once badly hurt), the chained head that whips back when
// he is hit, shrinking away during box attacks, and his scythe metamorphosis. All of it runs in the Draw event.
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {battleController,heroParent} from '../../deltarune/battle';

export const jokerBody:GmObjectDef={name:'obj_joker_body',index:271,depth:15,sprite:'spr_joker_main',events:{
 create:s=>{
  s.siner=0;s.ji=0;s.maxchain=6;s.maxdist=0;s.size=2;s.floatsiner=0;s.floatsinerspeed=1;s.debug=0;s.sndcon=0;s.condition=0;s.timer=0;
  s.scythecon=0;s.spintimer=0;s.s_xscale=2;s.s_yscale=2;s.s_sprite='spr_joker_teleport';s.s_y=0;s.s_vspeed=0;s.xsiner=0;s.ysiner=0;s.rotsiner=0;
  s.imageSpeed=0.334;s.dance_side=0;s.fliptimer=0;s.dancelv=0;s.dancesiner=0;s.dancemade=0;s.fade=0;
  s.shadowx=new Array(7).fill(0);s.shadowy=new Array(7).fill(0);s.sfactor=new Array(7).fill(1);
 },
 draw:(s,rt)=>draw(s,rt),
}};

function draw(s:GmInstance,rt:GmRuntime){
 s.floatsiner+=s.floatsinerspeed;
 s.fly=Math.sin(s.floatsiner/8)*3*(s.floatsinerspeed*2-1);
 s.flyx=0;
 if(s.dancelv>=1)s.flyx=Math.cos(s.floatsiner/8)*3*(s.floatsinerspeed*2-1);
 if(s.dancelv===4){s.flyx=0;s.fly=0;}
 s.offx=s.x+20;s.offy=s.y+18;
 const ox=s.offx,oy=s.offy;
 if(s.condition===0){
  if(s.fade===0)s.fade_a=1;
  if(s.fade===1)s.fade_a=Math.abs(Math.sin(s.floatsiner/13));
  if(s.dancelv===0)rt.drawSprite('spr_joker_main',0,ox+s.flyx,oy+s.fly,2,2,0,C.white,s.fade_a);
  if(s.dancelv===1)rt.drawSprite('spr_joker_dance',s.floatsiner/3,ox+s.flyx,oy+s.fly,2,2,0,C.white,1);
  if(s.dancelv===2)rt.drawSprite('spr_joker_tired',0,ox+s.flyx,oy+s.fly,2,2,0,C.white,1);
  if(s.dancelv===3){
   s.dancesiner+=1;
   gmArray(s,'dalpha',()=>[]);
   for(let i=0;i<7;i++){
    if(i>=1){s.shadowx[i]+=Math.sin(i+s.floatsiner/5)*8*s.sfactor[i];s.shadowy[i]+=Math.cos(i+s.floatsiner/5)*4*s.sfactor[i];}
    s.dalpha[i]=Math.sin(i+s.dancesiner/9);
    if(s.dalpha[i]<0&&i>=1){s.shadowx[i]=60-rt.random.random(120);s.shadowy[i]=60-rt.random.random(120);s.sfactor[i]=1.5-rt.random.random(3);}
    rt.drawSprite('spr_joker_dance',s.dancesiner/2+i/4,s.x+s.shadowx[i],s.y+s.shadowy[i],2,2,0,s.imageBlend,s.dalpha[i]);
   }
  }
  if(s.dancelv===4)rt.drawSprite('spr_joker_teleport',1,ox+s.flyx,oy+s.fly,2,2,0,C.white,1);
 }
 if(s.condition===1){
  // Hit: the head swings out on its chain and settles back.
  if(s.maxdist>=150)s.maxdist=150;
  s.sinadd=Math.min(2,Math.max(0.8,0.8+s.maxdist/50));
  s.siner+=s.sinadd;
  s.sinx=Math.sin(s.siner/4)*s.maxdist;s.siny=-Math.abs(Math.sin(s.siner/4))*(s.maxdist*0.7);
  s.ji=0;
  if(s.sinx>s.maxdist/2&&s.maxdist>15)s.ji=1;
  if(s.sinx<-s.maxdist/2&&s.maxdist>15)s.ji=2;
  if(s.maxdist<4)s.ji=3;
  for(let i=0;i<s.maxchain-1;i++)rt.drawSprite('spr_jokerchain',s.ji,ox+s.sinx*(i/s.maxchain)-2,oy+6+(s.siny-32)*(i/s.maxchain)+s.fly,2,2,0,C.white,1);
  rt.drawSprite('spr_jokerbody',0,ox-42,oy+s.fly-2,2,2,0,C.white,1);
  rt.drawSprite('spr_jokerhead',s.ji,ox+s.sinx-2,oy+s.siny+s.fly-14,2,2,0,C.white,1);
  s.maxdist-=1;
  if(s.maxdist<=0){s.maxdist=0;s.condition=0;}
 }
 if(s.condition===2){
  // Shrinks away (and the party fades) while a box attack runs.
  for(const h of rt.all(heroParent))h.imageAlpha=h.imageAlpha-0.25;
  if(s.sndcon===0){rt.sound?.('snd_spearappear');s.sndcon=1;}
  rt.drawSprite('spr_joker_main',0,ox,oy+s.fly,s.size,2,0,C.white,1);
  s.size-=0.5;
  if(s.size<=0){for(const h of rt.all(heroParent))h.imageAlpha=0;s.sndcon=0;s.size=2;s.condition=4;}
 }
 if(s.condition===3){
  for(const h of rt.all(heroParent))h.imageAlpha=h.imageAlpha+0.25;
  if(s.sndcon===0){rt.sound?.('snd_spearappear');s.sndcon=1;}
  rt.drawSprite('spr_joker_main',0,ox,oy+s.fly,s.size,2,0,C.white,1);
  s.size+=0.5;
  if(s.size>=2){for(const h of rt.all(heroParent))h.imageAlpha=1;s.size=2;s.condition=0;s.sndcon=0;}
 }
 if(s.condition===4&&rt.globals.turntimer<=10){s.timer=0;s.condition=3;s.size=0;}
 if(s.condition===5){
  // Metamorphosis: squash, stretch, spin into a scythe and fly off.
  s.timer+=1;const t=s.timer;
  if(t===1){s.spintimer=0;s.s_xscale=2;s.s_yscale=2;s.s_sprite='spr_joker_teleport';s.s_y=0;s.s_vspeed=0;s.s_alpha=1;rt.sound?.('snd_joker_metamorphosis');}
  if(t>=1&&t<=3){s.s_xscale*=1.3;s.s_yscale*=0.7;}
  if(t>=5&&t<=15){s.s_xscale*=0.7;s.s_yscale*=1.3;}
  if(t>=15&&t<=30){
   s.spintimer+=1;s.s_xscale=Math.sin(s.spintimer/3)*2;s.s_sprite='spr_joker_scythebody';s.s_yscale*=0.7;
   if(s.s_xscale>=2)s.s_xscale=2;
   if(s.s_yscale<=2)s.s_yscale=2;
  }
  if(t>=30&&t<41){s.spintimer+=1;s.s_xscale=Math.sin(s.spintimer/3)*2;s.s_vspeed-=3;s.s_y+=s.s_vspeed;s.s_alpha-=0.1;}
  if(t>=41&&rt.exists(battleController)&&rt.globals.turntimer>10){s.timer=0;s.condition=4;}
  rt.drawSprite(s.s_sprite,0,ox,oy+s.s_y,s.s_xscale,s.s_yscale,0,s.imageBlend,s.s_alpha);
 }
 if((s.condition===0||s.condition===1)&&s.dancelv<=2){
  // His shadow on the floor.
  const d=rt.drawState,w=rt.spriteWidth(s);d.color=C.black;
  rt.drawRect(s.x+w/2-20-s.fly+s.flyx,s.y+80-s.fly/2,s.x+w/2+30+s.fly+s.flyx,s.y+85+s.fly/2);
 }
}
