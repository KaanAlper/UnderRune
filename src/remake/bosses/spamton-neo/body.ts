// obj_spamton_neo_enemy's Draw: the puppet wires (eighteen in the back, six on the body and the main one), the eight
// body parts and the pose they lerp to (partmode), the wire hearts he makes during the heart attack, the dance
// that fires the big shots, the electrified and laughing poses, the fall, and the head hitbox that follows it all.
// The side-B route's poses are left out with the route itself.
import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {lengthdirX,lengthdirY,pointDirection} from '../../gm/math';
import {afterimage,afterimageGrow,darkMarker,heart,marker} from '../../deltarune/battle';
import {findController} from '../../deltarune/controller';
import {drawBodyPart,mergeColor,scriptDelayedOn,setVar,snd} from '../../deltarune/chapter2-battle';
import {bigLaser,dbulletController,heartAttack,pipisDestroyFx,sneoBulletController,sneoPhonecall,sneoVineCut,sneoVineTransition,spamtonShot,wireheart} from './pending';

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const DARK_WIRE=0x003300;

/** The wires he hangs from. Their line positions are also where cut wires start. */
function drawWires(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,d=rt.drawState,me=s.myself;
 const dc=rt.first(sneoBulletController),phoneHands=dc?.type===8.5;
 const hidebgvines=findController(rt)&&g.mercymod[me]>89?1:0;
 let bgvinecount=0;
 for(let ii=0;ii<18;ii++){
  if(s.partvisible_back[ii]===1)bgvinecount+=1;
  if(hidebgvines!==0)continue;
  if(s.partmode!==34)s.heartattackoffsetx=0;
  d.color=DARK_WIRE;s.partsiner_back[ii]+=0.5;
  if(phoneHands)d.alpha=s.imageAlpha;
  const line=()=>rt.drawLine(s.x+s.partx_back[ii]+s.partxoff_back[ii]+s.heartattackoffsetx+Math.sin(s.partsiner_back[ii]/30)*2,s.y+s.party_back[ii]+s.partyoff_back[ii],s.x+s.partx_back[ii]+s.heartattackoffsetx+s.partxoff_back[ii],-400,1);
  if(s.partvisible_back[ii]===1)line();
  d.alpha=1;
  if(s.violentendflash>0){d.color=C.white;d.alpha=s.violentendflash/10;if(s.partvisible_back[ii]===1)line();d.alpha=1;}
 }
 if(s.weakentimer>0){s.weakentimer+=1;if(s.weakenshakeamount>0)s.weakenshakeamount-=0.5;}
 const mainWire=(w:number)=>rt.drawLine(s.x+s.partx[4]+s.partxoff[4]/1.2+20+Math.sin(s.partsiner[4]/25)*1.8,s.y+s.party[4]-10+s.partyoff[4],s.x+s.partx[4]+s.partxoff[4]/1.5+32,-400,w);
 if(s.lastwirecon===0||s.lastwirecon===1){
  d.color=DARK_WIRE;if(phoneHands)d.alpha=s.imageAlpha;
  mainWire(1);d.alpha=1;
  if(s.violentendflash>0){d.color=C.white;d.alpha=s.violentendflash/10;mainWire(1);d.alpha=1;}
 }
 if(s.endcon===1&&s.lastwirecon===0)s.lastwirecon=1;
 if(s.lastwirecon===1){s.lastwiretimer+=1;if(s.lastwiretimer===30)s.lastwirecon=2;}
 if(s.lastwirecon===1||s.lastwirecon===2){d.alpha=s.lastwiretimer/30;d.color=C.green;mainWire(1+s.lastwiretimer/30);d.alpha=1;}
 const phone=rt.exists(sneoPhonecall);
 for(let i=0;i<6;i++){
  d.color=C.green;
  let shake2=0;
  if(s.partweakened[i]===1)shake2=s.weakenshakeamount-rt.random.random(s.weakenshakeamount)*2;
  if(s.partweakened[i]>0)d.color=C.orange;
  if(phoneHands)d.alpha=s.imageAlpha;
  const line=()=>rt.drawLine(s.x+s.partx[i]+s.partxoff[i]/1.2+i*5+Math.sin(s.partsiner[i]/30)*2+shake2,s.y+s.party[i]-10+s.partyoff[i]+shake2,s.x+s.partx[i]+s.partxoff[i]/1.5+i*8,-400,2);
  if(s.partvisible[i]===1)line();
  d.alpha=1;
  if(s.partweakened[i]===1&&s.weakentimer<11){d.color=C.white;d.alpha=11-s.weakentimer/10;if(phone)d.alpha=s.imageAlpha;line();d.alpha=1;}
  if(s.violentendflash>0){d.color=C.white;d.alpha=s.violentendflash/10;if(phone)d.alpha=s.imageAlpha;line();d.alpha=1;}
  if(s.partweakened[i]===1&&s.weakentimer===10)s.partweakened[i]=2;
 }
 // At 90 mercy the background wires go; the cut ones fade away.
 if(findController(rt)&&g.mercymod[me]>89&&bgvinecount>0&&!rt.exists(sneoVineTransition)&&!rt.exists(sneoVineCut))
  for(let i=0;i<6;i++)if(s.partvisible[i]===0){s.vineid=i;rt.create(sneoVineTransition,s.x,s.y);}
}

/** partmode 34, the heart attack: he leans back, holds his heart out, and makes the wire hearts. */
function makeWireHearts(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,at=g.monsterat[s.myself];
 const make=(type:number,extra?:(w:GmInstance)=>void)=>{
  const w=rt.create(wireheart,s.x+10,s.y+80);w.boss=s.id;w.bossx=s.x+10;w.bossy=s.y+80;w.type=type;w.target=3;
  extra?.(w);w.damage=Math.floor(at*5*0.6);return w;
 };
 const hellish=(w:GmInstance)=>{w.special=s.hellmode;};
 const ht=s.hearttype,mt=s.makehearttype;
 if(ht===0)make(0,hellish);
 else if(ht===1){make(0,hellish);make(1);make(1);}
 else if(ht===2)make(0,w=>{w.bighearttype=1;w.special=s.hellmode;});
 else if(ht===3||ht===4){
  if(mt===0)make(1);
  if(mt===0||mt===3){const w=make(ht);if(ht===3)w.altbiter=3;}
  if(mt===0||mt===4){const w=make(ht);if(ht===3)w.altbiter=4;}
 }
 for(let n=0;n<6;n++){
  const shard=rt.create(afterimage,s.x+10,s.y+80);shard.sprite='spr_bullet_laser_circle';
  shard.speed=10+rt.random.random(2);shard.direction=140+rt.random.randomRange(-40,40);shard.gravity=1;
  shard.imageXscale=0.5+rt.random.random(0.5);shard.imageYscale=shard.imageXscale;
 }
 s.makeheart=0;
}
const POSE_HEART_HOLD=[10,30,-50,-50,40,60,-30,30],POSE_HEART_RELEASE=[-40,90,50,50,-40,-100,30,-30],X_HEART_RELEASE=[4,0,0,0,0,15,0,4];
const POSE_DANCE_A=[-20,-120,-30,30,0,0,-230,0],POSE_DANCE_B=[-20,-250,30,-30,0,0,-120,-30];

/** The head's own animation while he poses (partmodes 1-12, the "normal" set). */
function headAnimate(s:GmInstance,i:number,f:number){
 s.partx[i]=lerp(s.partx[i],0,0.25*f);s.party[i]=lerp(s.party[i],0,0.25*f);s.partrot[i]-=10*f;
 const m=s.partmode;
 if(m===5||m===8||m===9){s.partrot[i]/=2;s.partrot[i]+=10*f;s.partframe[i]=1;}
 else if(m===6||m===7){s.partrot[i]/=2;if(m>6||s.partrot[1]<=-120)s.partframe[i]=0;}
 else if(m===11)s.partframe[i]+=0.2*f;
 else if(m===12)s.partframe[i]+=0.3*f;
 else s.partframe[i]+=0.05*f;
 if(s.partframe[i]>=3)s.partframe[i]=0;
 if(s.partframe[i]>=2)s.partrot[i]+=20*f;
}

function posePart(s:GmInstance,rt:GmRuntime,i:number){
 const g=rt.globals,f=s.f,m=s.partmode;
 if(m<20){
  if(m===0){
   s.partsiner[i]=0;s.partframe[i]=0;
   if(i===5){s.partrot[i]=lerp(s.partrot[i],30,0.25*f);s.partx[i]=lerp(s.partx[i],-10,0.25*f);s.party[i]=lerp(s.party[i],10,0.25*f);if(s.dead===1)s.partframe[i]=3;}
   else{
    s.partrot[i]=lerp(s.partrot[i],0,0.25*f);s.partx[i]=lerp(s.partx[i],0,0.25*f);s.party[i]=lerp(s.party[i],0,0.25*f);
    if(Math.abs(s.partrot[i])<1)s.partrot[i]=0;if(Math.abs(s.partx[i])<1)s.partx[i]=0;if(Math.abs(s.party[i])<1)s.party[i]=0;
   }
  }
  if(m===1||m===3||m>=5){
   if(m===1&&s.aimmode!==0)s.aimmode=0;
   if((m===3||(m>=9&&m<=13))&&i===1){
    const h=rt.first(heart);
    if(s.aimmode===2&&h&&m===3)s.armaim=pointDirection(s.x+s.partxoff[i],s.y+s.partyoff[i],h.x+8,h.y+8)+90;
    else if(s.aimmode!==1)s.armaim=-80;
    if(m<10)s.partrot[i]=lerp(s.partrot[i],s.armaim,0.25*f);
    if(m<9)s.partframe[i]=m===3?1:3;
    if(m===12)s.partframe[i]=1;
    if(m>=10)s.partrot[i]=s.partrot[i]===s.armaim?s.armaim+2:s.armaim;
   }else if(m>=6&&m<11&&i===1){
    s.partrot[i]=lerp(s.partrot[i],-160,0.25*f);
    if(s.partframe[i]!==2&&s.partrot[i]<=-90)s.partframe[i]=2;
   }else{
    if(i===1&&(m===5||m===1))s.partframe[i]=0;
    s.partsiner[i]+=(1+i/5)*f;s.partrot[i]=Math.sin(s.partsiner[i]/30)*15;
   }
   if(i===5)headAnimate(s,i,f);
  }
  if(m===2){
   s.partsiner[i]+=(1+i/5)*f;s.partx[i]=Math.sin(s.partsiner[i]/2*f);s.party[i]=Math.cos(s.partsiner[i]/2*f);
   if(s.shocker<0){s.partrot[i]=60-rt.random.random(120);if(i===5){s.partframe[i]+=f;if(s.partframe[i]>=3)s.partframe[i]=0;}}
  }
  if(m===4){
   s.idealrot=[-43,-180,-20,-10,-31,-60,-61,-56];
   if(s.shotanimtimer===0.125*f&&i===1){
    s.armendx=s.x+s.partx[1]+s.partxoff[1]+lengthdirX(s.armlength,s.partrot[1]-93);s.armendy=s.y+s.party[1]+s.partyoff[1]+lengthdirY(s.armlength,s.partrot[1]-93);
    if(rt.exists(heartAttack))s.aimmode=0;
   }
   s.shotanimtimer+=0.125*f;
   if(s.shotanimtimer<13){s.partframe[5]=2;s.partrot[i]=lerp(s.partrot[i],s.idealrot[i],0.3*f);s.lerper=0;}
   if(s.shotanimtimer>=13){
    s.partframe[5]=1;s.lerper+=0.015*f;
    if(i!==1)s.partrot[i]=lerp(s.partrot[i],Math.sin(s.partsiner[i]/30)*15,s.lerper);
    if(i===1)s.partrot[i]=lerp(s.partrot[i],s.armaim,s.lerper);
   }
   if(s.shotanimtimer>=24){s.shotanimtimer=0;s.partmode=3;}
  }
  if(s.partmode===6)s.shotanimtimer=0;
  if(s.partmode===7){s.partrot[5]+=Math.sin(s.shotanimtimer/5)*15;s.shotanimtimer+=0.2*f;if(s.shotanimtimer>60)s.partmode=6;}
  if(i===5){
   if(s.partmode>=15&&s.partmode<=18){
    if(s.partmode===15){s.partframe[5]=2;s.headsize=lerp(s.headsize,0.5,0.25);}
    if(s.partmode===16){s.partframe[5]=2;s.headsize=lerp(s.headsize,1,0.25);}
    if(s.partmode===17){s.partframe[5]=2;s.headsize=lerp(s.headsize,1.5,0.25);s.partrot[5]+=rt.random.random(20);}
   }else s.headsize=lerp(s.headsize,0,0.25);
  }
 }
 if(s.partmode>=21&&s.partmode<=30){
  const pm=s.partmode;
  if(pm===21||pm===23||pm===24||pm===25){
   s.idealrot??=new Array(8).fill(0);
   s.partsiner[i]+=0.1;s.partx[i]=lerp(s.partx[i],0,0.5);s.party[i]=lerp(s.party[i],0,0.5);
   s.idealrot[i]=Math.sin(s.partsiner[i]+i/8)*20;s.idealrot[1]=Math.sin(s.partsiner[2])*60;s.idealrot[2]=Math.sin(s.partsiner[2]-0.1)*60;
   s.idealrot[3]=-Math.sin(s.partsiner[2]+0.3)*60;s.idealrot[6]=-Math.sin(s.partsiner[2]+0.1)*60;
   s.partframe[5]=1;s.partrot[i]=lerp(s.partrot[i],s.idealrot[i],0.5);s.partrot[5]+=2;
   if(i===5){
    if(pm===23){s.partframe[5]=2;s.headsize=lerp(s.headsize,0.5,0.25);}
    if(pm===24){s.partframe[5]=2;s.headsize=lerp(s.headsize,1,0.25);}
    if(pm===25){s.partframe[5]=2;s.headsize=lerp(s.headsize,1.5,0.25);s.partrot[5]=-15;s.partx[i]=rt.random.random(2);s.party[i]=rt.random.random(2);}
   }
  }
  if(pm===22){
   s.partframe[5]=0;s.partrot[5]=Math.sin(s.partsiner[0]/2)*4;s.partsiner[0]+=0.1;
   if(s.partsiner[0]>=5){s.partx[i]=rt.random.random(2);s.party[i]=rt.random.random(2);}
  }
  if(pm===27){s.idealrot??=new Array(8).fill(0);s.partframe[5]=1;s.idealrot[i]=0;s.idealrot[2]=45;s.partframe[2]=1;s.partrot[i]=lerp(s.partrot[i],s.idealrot[i],0.5);}
 }
 if(s.partmode>=30)previewPoses(s,rt,i);
 if(s.partmode===34)heartAttackPose(s,rt,i);
 if(s.partmode===35)dancePose(s,rt,i);
 if(s.partmode===36)shootyDance(s,rt,i);
 if(s.partmode===40){
  if(i===0&&s.dontchangepose===0)s.shocktimer+=1;
  s.partsiner[i]+=(1+i/5)*f;s.partx[i]=Math.sin(s.partsiner[i]/2*f);s.party[i]=Math.cos(s.partsiner[i]/2*f);
  if((s.shockthreshold<=5&&s.hurttimer2===0&&i===0)||(s.smokethreshold>1&&i===0)){
   s.smoketimer+=1;
   if(s.smoketimer>=s.smokethreshold){smoke(s,rt,-1,-2);s.smoketimer=0;}
  }
  if(s.shockthreshold<=8&&s.hurttimer2===0&&g.flag[8]===0){s.fsiner=s.partsiner[i]/8;s.flash=1;}
  if(g.flag[8]===1)s.shockthreshold=Math.min(Math.max(s.shockthreshold,5),100);
  if(s.shocktimer>=s.shockthreshold){
   s.partrot[i]=60-rt.random.random(120);
   if(i===4)s.partrot[i]=40-rt.random.random(80);
   if(i===5){s.partframe[i]+=f;if(s.partframe[i]>=3)s.partframe[i]=0;}
   if(i===7)s.shocktimer=0;
  }
 }
 if(s.partmode===41)laughPose(s,rt,i);
 if(s.partmode===42)slumpPose(s,rt,i);
 if(s.partmode===43&&i===0)fallPose(s,rt);
}
/** Smoke puffs from his body (electrified, or the "funny cheat" overheat). */
function smoke(s:GmInstance,rt:GmRuntime,vlo:number,vhi:number,hhi=8){
 const sm=rt.create(afterimageGrow,s.x+50,s.y+80);sm.visible=false;scriptDelayedOn(sm,rt,setVar,1,'visible',true);
 sm.depth=s.depth+10;sm.imageAlpha=2.5;sm.sprite='spr_cakesmoke';sm.hspeed=rt.random.randomRange(2,hhi);sm.gravity=-0.5;sm.friction=0.2;sm.vspeed=rt.random.randomRange(vlo,vhi);
}
/** partmode 30-33: the head preview (the "[Specil] tour" intro pose). */
function previewPoses(s:GmInstance,rt:GmRuntime,i:number){
 if(s.partmode===30){
  s.headsize=0;s.partsprite[5]='spr_sneo_head_preview';if(s.partframe[5]===0)s.partframe[5]=1;s.partsprite[0]='spr_nothing';
  s.partsiner[i]+=1;
  if(s.shake_head===0){s.party[i]=Math.sin(s.partsiner[i]/15)*4;s.idealrot??=new Array(8).fill(0);s.idealrot[i]=Math.sin(s.partsiner[i]/20)*4;}
  else if(i===5){
   if(s.shake_head===1){s.partframe[5]+=1;snd(rt,'snd_swallow');}
   s.partrot[5]=Math.sin(s.shake_head*2)*8+rt.random.random(4);s.party[5]=rt.random.random(4);s.partx[5]=rt.random.random(4);
   s.shake_head+=1;if(s.shake_head>=6){s.shake_head=0;s.partrot[5]=0;}
  }
 }
 if(s.partmode===31&&i===5){
  snd(rt,'snd_weaponpull_fast');
  let n=0,shine!:GmInstance;
  for(let k=0;k<5;k++){
   shine=rt.create(afterimageGrow,n*8+s.x+s.partx[5]*s.facing+s.partxoff[5]*s.facing+s.lastxoff,s.y+s.party[5]+s.partyoff[5]);
   shine.sprite='spr_sneo_head_preview';shine.imageIndex=0;shine.imageSpeed=0;shine.imageXscale=-2-n/5;shine.imageYscale=2+n/5;shine.xrate=0;shine.yrate=0;shine.imageAlpha=1+n;n+=0.2;
  }
  shine.imageAngle=s.partrot[5]*s.facing;
  const mk=darkMarker(rt,s.x+s.partx[5]*s.facing+s.partxoff[5]*s.facing+s.lastxoff,s.y+s.party[5]+s.partyoff[5],'spr_sneo_head_preview');mk.imageXscale=-2;
  s.partmode=32;
 }
 if(s.partmode===33){
  for(const m of rt.all(marker))if(m.sprite==='spr_sneo_head_preview')rt.destroy(m);
  s.partsprite=['spr_sneo_wingl','spr_sneo_arml','spr_sneo_legl','spr_sneo_legr','spr_sneo_body','spr_sneo_head','spr_sneo_armr','spr_sneo_wingr'];
  s.partframe[5]=0;s.partmode=0;snd(rt,'snd_bump');
 }
}
function heartAttackPose(s:GmInstance,rt:GmRuntime,i:number){
 const g=rt.globals,f=s.f,d=s.difficulty;
 s.hearttype=d>=1&&d<=4?d:0;
 const flyx=s.heart_release_con===1?-20:0;
 s.idealx??=new Array(8).fill(0);s.idealrot??=new Array(8).fill(0);
 if(i===0){
  s.siner+=1;
  if(s.heart_release_con>=2)s.heart_release_con=0;
  if(s.heart_release_con===0){
   s.idealx=[0,0,0,0,0,0,0,0];s.idealrot=[...POSE_HEART_HOLD];
   if(s.hearttype>2&&rt.count(wireheart)<3&&s.makehearttimer<1&&g.turntimer>100&&s.makeheartinit===1){
    s.makehearttimer=80;s.makeheart=1;s.makehearttype=rt.random.choose(3,4);
    if(s.makeheartalt!==0){s.makehearttype=s.makeheartalt;s.makehearttimer=120;}
   }
  }
  if(s.heart_release_con===1){s.idealx=[...X_HEART_RELEASE];s.idealrot=[...POSE_HEART_RELEASE];}
  if(g.turntimer<20){s.idealx=[0,0,0,0,0,0,0,0];s.idealrot=[0,0,0,0,0,0,0,0];}
  if(s.makehearttimer>0)s.makehearttimer-=1;
  if(s.makeheart){
   if(s.makeheartinit===0){s.makeheartinit=1;s.makehearttype=0;}
   makeWireHearts(s,rt);
  }
 }
 if(g.turntimer<20){
  s.partrot[i]=lerp(s.partrot[i],0,0.14*f);s.partx[i]=lerp(s.partx[i],0,0.1*f);s.party[i]=lerp(0,s.party[i],0.06*f);
  s.heartattackoffsetx=lerp(s.heartattackoffsetx,0,0.06*f);s.x=lerp(s.x,s.xstart,0.1);
 }else{
  s.partrot[i]=lerp(s.partrot[i],s.idealrot[i]+rt.random.random(4),0.14*f);s.partx[i]=lerp(s.partx[i]+flyx,s.idealx[i],0.1*f);s.party[i]=lerp(s.party[i],0,0.06*f);
  if(s.heart_release_con===0)s.heartattackoffsetx=lerp(s.heartattackoffsetx,-10,0.01*f);
  if(s.heart_release_con===1)s.heartattackoffsetx=lerp(s.heartattackoffsetx,-60,0.01*f);
  s.x=lerp(s.x,s.xstart+60,0.1);
 }
}
function dancePose(s:GmInstance,rt:GmRuntime,i:number){
 const f=s.f;s.idealx??=new Array(8).fill(0);s.idealrot??=new Array(8).fill(0);
 if(i===0){
  s.siner+=1.3;s.dance_timer+=1;
  if(s.dance_timer>9){s.dance_timer=0;s.dance_con+=1;}
  if(s.dance_con>=2)s.dance_con=0;
  if(s.dance_con===0){s.idealx=[0,0,0,0,0,0,0,0];s.idealrot=[...POSE_DANCE_A];}
  if(s.dance_con===1){s.idealx=[...X_HEART_RELEASE];s.idealrot=[...POSE_DANCE_B];}
 }
 s.partrot[i]=lerp(s.partrot[i],s.idealrot[i]+rt.random.random(4),0.14*f);s.partx[i]=lerp(s.partx[i],s.idealx[i],0.1*f);s.party[i]=lerp(s.party[i],0,0.06*f);
 if(i===5){
  s.partx[i]=lerp(s.partx[i],0,0.25*f);s.party[i]=lerp(s.party[i],0,0.25*f);s.partrot[i]-=10*f;
  s.partframe[i]+=0.05*f;if(s.partframe[i]>=3)s.partframe[i]=0;if(s.partframe[i]>=2)s.partrot[i]+=20*f;
 }
 s.y=s.ystart+Math.sin(s.siner/6)*30;s.x=lerp(s.x,s.xstart+60,0.1);
}
/** partmode 36: he dances and fires two big shots at the soul, over and over (also his spared ending dance). */
function shootyDance(s:GmInstance,rt:GmRuntime,i:number){
 const fastshot=1;s.idealrot??=new Array(8).fill(0);
 if(s.shootydanceinit===0){s.shootydanceinit=1;s.shootydancex=s.x;s.shootydancey=s.y;}
 if(s.endcon>0){
  if(s.dancealtcon===1||s.dancealtcon===2)s.siner+=0.23;
  s.x=s.xstart+Math.sin(s.siner/20)*10;s.y=s.ystart+Math.sin(s.siner/6)*20;
 }else{s.x=s.shootydancex+Math.sin(s.siner/20)*10;s.y=s.shootydancey+Math.sin(s.siner/6)*20;}
 s.armendx=s.x+s.partx[1]+s.partxoff[1]+lengthdirX(s.armlength,s.partrot[1]-93);s.armendy=s.y+s.party[1]+s.partyoff[1]+lengthdirY(s.armlength,s.partrot[1]-93);
 if(s.dance_timer===0){const h=rt.first(heart);if(h)s.armangle=pointDirection(s.partxoff[1],s.partyoff[1],h.x,h.y);s.idealrot[5]=-15;}
 if(i!==1||s.endcon>0){
  s.partsiner[i]+=0.1;s.partx[i]=lerp(s.partx[i],0,0.5);s.party[i]=lerp(s.party[i],0,0.5);
  s.idealrot[i]=Math.sin(s.partsiner[i]+i/8)*20;s.idealrot[1]=Math.sin(s.partsiner[2])*60;s.idealrot[2]=Math.sin(s.partsiner[2]-0.1)*60;
  s.idealrot[3]=-Math.sin(s.partsiner[2]+0.3)*60;s.idealrot[6]=-Math.sin(s.partsiner[2]+0.1)*60;
  s.partrot[5]=-15-Math.abs(Math.sin(s.head_recoil_amount/60))*150;s.partframe[5]=2;
  s.head_recoil_amount=lerp(s.head_recoil_amount,0,0.03);s.partrot[i]=lerp(s.partrot[i],s.idealrot[i],0.5);
 }
 if(i===0&&s.endcon===0){
  s.siner+=1.3;s.dance_timer+=1;
  if(s.dance_timer===17-fastshot*10||s.dance_timer===52-fastshot*10){
   const l=rt.create(bigLaser,s.x,s.y);l.depth+=1;l._type=1;
   s.chargeshot_sound=rt.soundLoop?.('snd_chargeshot_charge');s.chargesfxtimer=1;
  }
  const fire=(turn:number)=>{
   for(const l of rt.all(bigLaser))rt.destroy(l);
   const shot=rt.create(spamtonShot,s.armendx,s.armendy);shot.target=s.mytarget;shot.damage=s.damage;
   s.armaim+=turn;s.head_recoil_amount=-170;rt.soundStop?.(s.chargeshot_sound);snd(rt,'snd_chargeshot_fire',0.5,0.6);
  };
  if(s.dance_timer===42-fastshot*10)fire(360);
  if(s.dance_timer===84-fastshot*20)fire(-360);
  if(s.dance_timer===85-fastshot*20)s.dance_timer=3;
  if(s.chargesfxtimer===1){s.chargepitch=0.1;rt.soundPitch?.(s.chargeshot_sound,s.chargepitch);rt.sourceAudio?.volume(s.chargeshot_sound,0,0);rt.sourceAudio?.volume(s.chargeshot_sound,0.8,20);}
  if(s.chargesfxtimer>0&&s.chargesfxtimer<=30){s.chargesfxtimer+=1;s.chargepitch+=0.03;rt.soundPitch?.(s.chargeshot_sound,s.chargepitch);}
 }
 if(i===1&&s.endcon===0){
  const shakebuster=rt.exists(bigLaser)?-4+rt.random.random(8):0;
  s.partrot[i]=lerp(s.partrot[i],s.armaim,0.12)+shakebuster;s.partframe[i]=1;
  for(const l of rt.all(bigLaser)){l.x=s.armendx;l.y=s.armendy;}
 }
}
function laughPose(s:GmInstance,rt:GmRuntime,i:number){
 const g=rt.globals,f=s.f;
 if(i===0)s.laughtimer+=1;
 if(i===5){
  const t=s.laughtimer;
  if(t===1)snd(rt,'snd_sneo_laugh_long');
  if(t>=1&&t<30){s.headsize=0;s.partframe[i]=0;s.headsize=rt.random.random(0.25);s.partrot[i]=30+rt.random.random(10);}
  if(t>=30&&t<48){s.partframe[i]=1;s.headsize=rt.random.random(0.25);s.partrot[i]=-40+rt.random.random(10);}
  if(t>=48&&t<60){s.partframe[i]=2;s.headsize=rt.random.random(0.25);s.partrot[i]=30;}
  if(t>=60){s.partframe[i]=3;s.headsize=rt.random.random(0.25);s.partrot[i]=-70+rt.random.random(10);}
  if(t>=80)s.headsize=0;
  if(s.partframe[i]>=3)s.partframe[i]=0;
 }
 s.partsiner[i]+=(1+i/5)*f;s.partx[i]=Math.sin(s.partsiner[i]/2*f);s.party[i]=Math.cos(s.partsiner[i]/2*f);
 if(g.flag[8]===1)s.shockthreshold=Math.min(Math.max(s.shockthreshold,5),100);
}
function slumpPose(s:GmInstance,rt:GmRuntime,i:number){
 const f=s.f,top=rt.view.y;
 s.partsiner[i]=0;s.partframe[i]=0;s.partframe[5]=7;
 if(i!==0)return;
 let fallen=0;
 if(s.y<top+130){s.fakegrav+=1;s.y+=s.fakegrav;}else fallen=1;
 if(fallen===1&&s.y<top+216){
  s.partrot[2]=lerp(s.partrot[2],-90,0.1);s.partrot[3]=lerp(s.partrot[3],90,0.1);s.partrot[5]=s.y-(top+120);
  if(s.y>top+216-30){s.partrot[1]=lerp(s.partrot[1],-30,0.1);s.partrot[6]=lerp(s.partrot[6],30,0.1);}
  s.y=lerp(s.y,top+216,0.1);
 }
 if(fallen===0){
  s.partrot[i]=lerp(s.partrot[i],0,0.25*f);s.partx[i]=lerp(s.partx[i],0,0.25*f);s.party[i]=lerp(s.party[i],0,0.25*f);
  if(Math.abs(s.partrot[i])<1)s.partrot[i]=0;if(Math.abs(s.partx[i])<1)s.partx[i]=0;if(Math.abs(s.party[i])<1)s.party[i]=0;
 }
}
/** partmode 43: he drops out of the sky and crashes (the spared ending). */
function fallPose(s:GmInstance,rt:GmRuntime){
 let fallen=0;s.falltimer+=1;
 if(s.y<rt.view.y+200){s.fallshake=10;s.fakegrav+=0.5+s.fakegrav/10;s.fakegrav=Math.min(Math.max(s.fakegrav,0),16.5);s.y+=s.fakegrav;}else fallen=1;
 const fg=s.fakegrav;
 s.partframe[5]=7;
 s.partrot[1]=-fg*6;s.partx[1]=fg*2;s.party[1]=fg*1.5;
 s.partrot[6]=-fg*6;s.partx[6]=fg*0.6;s.party[6]=fg*2;
 s.partrot[2]=-fg*6;s.partx[2]=-fg*1.6;s.party[2]=-fg*0.65;
 s.partrot[3]=-fg*6;s.partx[3]=-fg*2.5;s.party[3]=-fg*0.15;
 s.partrot[4]=-fg*6.25;s.partx[4]=fg*2;s.party[4]=fg/1.5;
 s.partrot[5]=-fg*8;s.partx[5]=fg*1.8;s.party[5]=fg*2;
 s.partrot[0]=-fg*4;s.party[0]=fg*3;s.partrot[7]=-fg*4;s.party[7]=fg*3;
 if(fallen!==0){
  if(s.fallshake===10)snd(rt,'snd_closet_impact');
  for(let ii=0;ii<7;ii++){s.party[ii]+=rt.random.randomRange(-s.fallshake,s.fallshake);s.partx[ii]+=rt.random.randomRange(-s.fallshake,s.fallshake);}
  if(s.fallshake>0)s.fallshake-=1;
 }
}

export function neoBodyDraw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself,f=s.f;
 if(s.partmode===10)s.partmode=9;
 if(!rt.exists(sneoPhonecall)&&s.imageAlpha<1)s.imageAlpha+=0.1;
 if(s.state===0)s.fsiner+=1;
 drawWires(s,rt);
 if(s.specialcon===1){
  s.specialcontimer+=1;
  for(let i=0;i<8;i++){s.partrot[i]=lerp(s.partrot[i],0,0.07*f);s.partx[i]=lerp(s.partx[i],0,0.05*f);s.party[i]=lerp(s.party[i],0,0.03*f);}
  s.flameframe=(s.specialcontimer/4)%2;s.flamealpha=s.specialcontimer/15;if(s.flamealpha>=0.9)s.flamealpha=0.9;
  if(s.specialcontimer>=15){s.flamealpha=1-s.specialcontimer/60;if(s.flamealpha<0)s.flamealpha=0;}
  if(s.specialcontimer>=60){s.specialcontimer=12;s.specialcon=0;s.imageIndex=0;}
  rt.drawSprite('spr_bhero',10+s.flameframe,s.x+75,s.y+177,-2,2.8+Math.abs(Math.sin(s.specialcontimer/4)/2),0,0xff0000,s.flamealpha);
  rt.drawSprite('spr_bhero',11-s.flameframe,s.x+75,s.y+177,-2,2.8,0,0x808000,s.flamealpha/1.4);
 }
 s.shocker-=f;
 for(let i=0;i<8;i++){
  posePart(s,rt,i);
  s.scalebonus=i===5?s.headsize:0;
  if(s.shadow_amount>=0)s.partblend[i]=mergeColor(C.white,C.black,s.shadow_amount);
  s.lastxoff=s.facing===-1?110:0;
  if(rt.exists(dbulletController)){s.partframe[5]=3;s.partblend[5]=s.blend;}
  else if(s.partblend[5]===s.blend)s.partblend[5]=0xffffff;
  let shakevar=0;
  if(i===0){
   if(s.hurttimer2>0)s.hurttimer2-=1;
   if(s.hurttimer2===1){
    if(s.endcon===0){s.shockthreshold=10;s.partmode=1;}
    if(s.didwejustdie===0&&findController(rt)&&g.monsterhp[g.chartarget[me]]<=0){s.partmode=99;s.dontchangepose=1;}
   }
  }
  if(s.hurttimer2>0)shakevar=rt.random.random(s.hurttimer2)/2-s.hurttimer2/4;
  if(s.headendcon===1){s.partrot[5]=-37+Math.sin(s.partsiner[4]/16);s.partframe[5]=1;s.partsprite[5]='spr_sneo_head';}
  if(s.headendcon===2){s.partrot[5]=15+Math.sin(s.partsiner[4]/16);s.partsprite[5]='spr_sneo_head_sad';}
  if(s.headendcon===3)s.partsprite[5]='spr_sneo_head';
  if(rt.exists(pipisDestroyFx)&&i===5)s.partrot[5]-=rt.random.random(60);
  if(s.headforceframe!==-1&&i===5)s.partframe[5]=s.headforceframe;
  if(s.funnycheat>5){
   if(s.funnycheattimer<28)s.funnycheattimer+=0.125;
   s.partblend[5]=mergeColor(C.white,C.red,s.funnycheattimer/30);
   if(s.funnycheattimer===24){snd(rt,'snd_carhonk');s.funnycheattimer3+=1;}
   if(s.funnycheattimer3>0&&s.funnycheattimer3<33&&i===5){
    s.funnycheattimer3+=1;const t=s.funnycheattimer3;
    if(t>0&&t<6)s.headexpand=lerp(s.headexpand,2,t/6);
    if(t>=8&&t<16)s.headexpand=lerp(s.headexpand,0,(t-8)/8);
    if(t>=16&&t<22)s.headexpand=lerp(s.headexpand,2,(t-16)/6);
    if(t>=24&&t<32)s.headexpand=lerp(s.headexpand,0,(t-24)/8);
    if((t>=4&&t<=10)||(t>=20&&t<=26))shakevar=-12+rt.random.random(24);
   }
   s.funnycheattimer2+=1;
   if(s.funnycheattimer2>=10&&s.imageAlpha>0.6){smoke(s,rt,-1,-2);s.funnycheattimer2=0;}
  }
  const expand=i===5?s.headexpand:0,sb=s.scalebonus;
  const px=s.x+s.partx[i]*s.facing+s.partxoff[i]*s.facing+s.lastxoff+shakevar,py=s.y+s.party[i]+s.partyoff[i]-shakevar;
  drawBodyPart(s,rt,s.partsprite[i],s.partframe[i],px,py,(2+sb)*s.facing+expand,2+sb+expand,s.partrot[i]*s.facing,s.partblend[i],s.imageAlpha);
  if(s.violentendflash>0)rt.drawSpriteFog(s.partsprite[i],s.partframe[i],px,py,(2+sb)*s.facing,2+sb,s.partrot[i]*s.facing,C.white,s.violentendflash/10);
 }
 if(s.shocker<0){s.shocker=s.shocker_threshold;if(s.shocker_threshold>2)s.shocker_threshold-=0.25*f;}
 if(s.partmode===13){
  s.partframe[1]=1;
  s.armendx=s.x+s.partx[1]*s.facing+s.partxoff[1]*s.facing+lengthdirX(s.armlength,s.partrot[1]-93)*s.facing+15;
  s.armendy=s.y+s.party[1]+s.partyoff[1]+lengthdirY(s.armlength,s.partrot[1]-93);
  s.partframe[5]=(s.partsiner[5]/6)%3;
  rt.drawState.color=C.white;rt.drawCircle(s.armendx+120,s.armendy+6,13+Math.sin(s.partrot[0]/2)*12,false);
 }
 rt.drawState.color=C.red;
 s.headx=s.x+s.partx[5]+s.partxoff[5];s.heady=s.y+s.party[5]+s.partyoff[5];
 const hd=rt.byId(s.hitdetector);
 if(hd){hd.x=s.headx;hd.y=s.heady;hd.imageAngle=s.partrot[5];hd.imageIndex=s.partframe[5];}
 if(s.hitcon===1||s.hitcon===-1){s.partblend[5]=0x40a0ff;s.hitcontimer=0;if(s.headhit<20)s.headhit+=6;s.hitcon=2;}
 if(s.hitcon===2){
  s.hitcontimer+=f;
  if(s.hitcontimer>=5)s.partblend[5]=mergeColor(s.partblend[5],C.white,0.15*f);
  if(s.hitcontimer>=15){s.hitcontimer=0;s.hitcon=0;s.partblend[5]=0xffffff;}
 }
 if(s.violentendflash>0)s.violentendflash+=1;
 if(s.becomeflash===0)s.flash=0;
 s.becomeflash=0;
}
void sneoVineCut;
