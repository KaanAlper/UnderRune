import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {dmgWriter} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';
function fillNext(s:GmInstance,rt:GmRuntime,offset:number){
 s.pick=Math.floor(rt.random.random(6)+offset);
 for(s.i=0;s.i<2;s.i++){while(s.nexty[s.pick]!==-1)s.pick=Math.floor(rt.random.random(6)+offset);s.nexty[s.pick]=s.i;}
 for(s.j=offset;s.j<offset+6;s.j++)if(s.nexty[s.j]===-1)s.nexty[s.j]=rt.random.choose(0,1,2);
}
export function createBerdlyCoasterBird(object:(name:string)=>GmObjectDef):GmObjectDef{
 const get=(rt:GmRuntime,name:string)=>rt.first(object(name))!;
 return {...object('o_coaster_berdly'),events:{
  create:(s,rt)=>{
   const enemy=get(rt,'obj_berdlyb_enemy');Object.assign(s,{imageSpeed:0,mask:'spr_coaster_berdly',visible:false,damagecon:0,damagetimer:0,invincible:0,siner:0,imageXscale:2,imageYscale:2,xshake:0,yshake:0,shaketimer:0,smoketimer:0,smokestart:0,depth:enemy.depth+1,endscene:0,endscenetimer:0,movetimer:59,movethreshold:60,movebuffer:0,moveframes:6,movecon:-1,idealy:-900,kiss:1,forceypos:-1,calculated:0,premonition:0,drawpremonition:1});
   if(enemy.premonition>0){s.premonition=1;s.drawpremonition=1;}else s.drawpremonition=0;
   Object.assign(s,{knocked:0,knockedtimer:0,knockedhits:0,premy:s.y,ycount:0,nexty:[]});for(s.i=0;s.i<12;s.i++)s.nexty[s.i]=-1;
   fillNext(s,rt,0);fillNext(s,rt,6);Object.assign(s,{queenmode:0,init:0,mode:0});if(rt.globals.mercymod[enemy.myself]>50)s.mode=1;Object.assign(s,{modetimer:0,movetype:0,movesiner:0,xx:0});
  },
  step:(s,rt)=>{
   const enemy=get(rt,'obj_berdlyb_enemy'),c=get(rt,'o_coaster_controller'),g=rt.globals;
   if(g.mercymod[enemy.myself]>50||g.monsterhp[enemy.myself]<g.monstermaxhp[enemy.myself]*.5){
    if(s.smokestart===0){s.smokestart=1;snd(rt,'snd_bomb');for(let i=0;i<8;i++){const p=rt.create(object('obj_berdly_smoke'),s.x+90,s.y);s.smoke=p.id;p.direction=45*i;p.depth=s.depth-1;}const fx=rt.create(object('obj_animation'),s.x+90,s.y);fx.depth=s.depth-1;fx.sprite='spr_coaster_explosion';}
    s.smoketimer++;if(s.smoketimer>15){s.smoketimer=0;const p=rt.create(object('obj_berdly_smoke'),s.x+90,s.y);s.smoke=p.id;p.depth=s.depth+1;}
   }
   if(s.init===0){if(s.mode===0){s.movethreshold=60;s.moveframes=6;}if(s.mode===1){s.movethreshold=36;s.moveframes=12;}if(s.mode>=2){s.queenmode=1;s.sprite='spr_coaster_queen';}
    if(s.mode===2){s.movetype=1;s.moveframes=24;}if(s.mode===3||s.mode===4){s.movethreshold=40;s.moveframes=16;}if(s.mode===5){s.movetype=1;s.moveframes=8;}if(s.mode===6){s.movetype=1;s.moveframes=4;}s.init=1;
   }
   if(enemy.premonition>0&&c.actcon===1){s.premonition=1;s.drawpremonition=1;}else s.drawpremonition=0;
   if(s.y>178)s.depth=78;if(s.y>230)s.depth=73;s.siner+=.4;
   if(s.xshake!==0){s.shaketimer++;if(s.shaketimer>=2){s.shaketimer=0;s.xshake*=-.8;if(Math.abs(s.xshake)<=1)s.xshake=0;}}
   const scene=rt.first(object('obj_ch2_scene11a'));
   if(s.endscene===1&&scene){const a=rt.byId(scene.coaster_berdly)!,x=a.x+22+a.sinerx+a.coaster_offset_x,y=a.y+47+a.sinery+a.coaster_offset_y;if(s.endscenetimer<10)s.endscenetimer++;s.x+=(x-s.x)*s.endscenetimer/10;s.y+=(y-s.y)*s.endscenetimer/10;}
   if(s.damagecon===0){s.siner+=.4;if(s.endscene===0)s.x=s.xstart+Math.sin(s.siner/6)*3;s.damagetimer=0;}
   if(s.damagecon===1){s.damagetimer++;s.imageIndex=s.kiss===1?2:1;s.x=s.xstart+60-s.damagetimer*5;if(s.damagetimer>=10){s.xshake=0;s.yshake=0;s.x=s.xstart;s.damagetimer=0;s.damagecon=0;s.imageIndex=0;if(s.sprite==='spr_berdlyb_shocked_battle')s.sprite='spr_berdlyb_idle';}}
   if(c.actcon===1&&s.movecon===-1)s.movecon=0;
   if(c.actcon===0){s.movecon=-1;s.movetimer=59;if(s.y<s.ystart)s.y+=(s.ystart-s.y)/s.moveframes;if(s.y>s.ystart)s.y+=(s.ystart-s.y)/s.moveframes;}
   if(s.movecon===0){s.movebuffer=0;s.movetimer++;if(s.movetype===1)s.y=s.yspot[1]+Math.sin(s.movetimer/s.moveframes)*(s.yspot[2]-s.yspot[0])/2;
    if(s.movetimer>=s.movethreshold&&s.movetype===0){
     s.oldidealy=s.idealy;let actor=-1;if(enemy.ralseigo===1){s.forceypos=2;enemy.ralseigo=0;actor=2;}else if(enemy.susiego===1){s.forceypos=1;enemy.susiego=0;actor=1;}else if(enemy.krisgo===1){s.forceypos=0;enemy.krisgo=0;actor=0;}
     if(actor!==-1)for(const h of rt.all(object('o_coaster_hero')))if(h.HeroID===actor)h.bump=1;
     if(s.forceypos>=0&&s.forceypos<=2)s.idealy=s.yspot[s.forceypos];if(s.forceypos===-1)s.idealy=s.yspot[s.nexty[s.ycount]];
     s.yspeed=(s.idealy-s.y)/s.moveframes;s.movecon=1;s.movetimer=0;s.ycount++;
     if(s.ycount>=6){for(s.i=0;s.i<6;s.i++){s.nexty[s.i]=s.nexty[s.i+6];s.nexty[s.i+6]=-1;}s.ycount=0;fillNext(s,rt,6);}
    }
   }
   if(s.movecon===1){s.y+=s.yspeed;s.movetimer++;if(s.movetimer>=s.moveframes){if(s.movebuffer===0){s.movetimer=0;s.y=s.idealy;}s.movecon=0;}}
   if(s.mode===1){s.modetimer++;if(s.modetimer>=60){s.modetimer=-60;const y=s.yspot[rt.random.choose(0,1,2)],p=rt.create(object('o_coaster_jama'),s.x-40-20*s.queenmode,y);s.jama=p.id;}}
   if(s.mode===3){s.modetimer++;if(s.modetimer>=60){s.modetimer=-60;rt.create(object('o_coaster_lightning'),rt.view.x+330,s.yspot[rt.random.choose(0,1,2)]);}}
   if(s.mode===4){s.modetimer++;if(s.modetimer>=60){s.modetimer=-30;const p=rt.create(object('o_coaster_jama'),s.x-60,s.yspot[rt.random.choose(0,1,2)]);s.jama=p.id;p.bigcar=1;p.sprite='spr_coaster_car';}}
   if(s.mode===5){s.modetimer++;if(s.modetimer===40){s.nozoki=rt.random.choose(0,1,2);const p=rt.create(object('o_coaster_lightning'),rt.view.x+330,s.yspot[rt.random.choose(0,1,2)]);s.lit=p.id;p.waittime=20;p.litwaittime=20;}if(s.modetimer===80){const p=rt.create(object('o_coaster_jama'),s.x-60,s.yspot[rt.random.choose(0,1,2)]);s.jama=p.id;s.modetimer=0;}}
  },
  user0:(s,rt)=>{for(s.i=0;s.i<3;s.i++)for(const [lo,hi] of [[40,90],[40,45]]){const y=s.y-40+rt.random.randomRange(20,25),x=s.x+rt.random.randomRange(lo,hi),p=rt.create(object('o_berdly_coaster_feather'),x,y);s.o=p.id;p.direction=rt.random.random(360);p.speed=rt.random.randomRange(4,5);}},
  draw:(s,rt)=>{
   const e=get(rt,'obj_berdlyb_enemy');if(s.sprite!=='spr_berdlyb_shocked_battle'){s.sprite=e.sprite;s.imageIndex=e.imageIndex-1;}if(e.endcon===1)s.sprite='spr_berdlyb_shocked_battle';
   const yy=s.sprite==='spr_berdlyb_shocked_battle'?-18:0;s.xx=s.sprite==='spr_berdlyb_shocked_battle'?17:-8;
   if(s.queenmode===0){rt.drawSprite('spr_coaster_berdly_back',0,s.x+s.xshake,s.y+s.yshake+16,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
    if(!rt.exists(object('obj_berdlyb_spearblaster'))&&e.state!==3){const y=s.y+s.yshake-(rt.bank.get(s.sprite!)?.height??0)*2-11+20;rt.drawSprite(s.sprite!,s.imageIndex,s.x+s.xshake+s.xx,y+yy,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);if(e.flash===1)rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x+s.xshake+s.xx,y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,-Math.cos(e.fsiner/5)*.4+.6);}
    rt.drawSprite('spr_coaster_berdly',s.xshake===0?0:1,s.x+s.xshake,s.y+s.yshake+16,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
   }
   s.indsprite='spr_coaster_queen_indicator';if(s.movetype===0&&s.drawpremonition===1)for(s.i=0;s.i<s.premonition;s.i++){s.blendo=s.i===1?65535:s.i>=2?4235519:16776960;const slot=s.forceypos===-1?s.nexty[s.ycount+s.i]:s.forceypos;if(slot>=0&&slot<=2)rt.drawSprite(s.indsprite,s.imageIndex,s.x+s.i*30+40*s.queenmode,s.yspot[slot],s.imageXscale,s.imageYscale,0,s.blendo,.4+Math.sin(s.siner/4)*.1-s.i*.1);}
   if(s.queenmode===1)rt.drawSprite(s.sprite!,s.imageIndex,s.x+s.xshake,s.y+s.yshake,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
  },
 },collisions:[{target:object('o_coaster_hero'),run:(s,other,rt)=>{
  const e=get(rt,'obj_berdlyb_enemy'),c=get(rt,'o_coaster_controller');if(rt.globals.monstermaxhp[e.myself]!==rt.globals.monsterhp[e.myself])s.kiss=0;
  if(s.damagecon===0){s.damagecon=1;s.sprite='spr_berdlyb_shocked_battle';rt.userEvent(s,0);c.bumpmercy+=e.nitro===0?6:4;
   for(const w of rt.all(dmgWriter))w.depth=s.depth-1;if(s.movetype===0)s.movetimer=s.movethreshold;s.movebuffer=1;s.xshake=10;
   if(s.kiss===0){const y=s.y-8-rt.random.random(20),x=s.x+40+rt.random.random(80);s.particle=rt.create(object('obj_berdlyparticle'),x,y).id;}
   if(s.kiss===1){snd(rt,'snd_coaster_kiss');const p=rt.create(object('obj_berdlyparticle'),s.x+12,s.y-20);s.particle=p.id;p.hspeed=-1;p.sprite='spr_coaster_berdly_heart';p.imageAngle=0;p.gravity=-.2-rt.random.random(.1);}
  }snd(rt,'snd_bump');snd(rt,'snd_damage');other.damaged=1;
 }}]};
}
