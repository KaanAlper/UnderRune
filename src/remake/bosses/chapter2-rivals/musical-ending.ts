// The band battle's ending (obj_musical_battle_end): once everyone dances, the screen goes black and a short music
// video plays to its own song: pairs dancing on a stage, the dancers, a circle, a jump and "BATTLE WON!". Its actors
// (obj_sweet_npc, obj_kk_npc, obj_hatguy_npc, obj_musicenemy_dancer_end), the fade out, and the exclamation balloon
// a bandmate shows when they snap out of a dance (obj_excblcon).
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {C,mergeColor} from '../../gm/graphics';
import {afterimage,darkMarker,sndFreeAll} from '../../deltarune/battle';
import {drawBodyPart} from '../../deltarune/chapter2-battle';
import {button3_h} from '../../deltarune/keys';
import {scrDoom} from '../../deltarune/shared-effects';
import {sourceText} from '../../host/text';

/** The floating note a dancer gives off every 14 frames (dx from the left edge, dy down). */
function note(s:GmInstance,rt:GmRuntime,x:number,y:number){
 const a=rt.create(afterimage,x,y);s.anim=a.id;
 a.sprite='spr_musicalbattlenote1';a.depth=s.depth-5;a.imageXscale=2;a.imageYscale=2;a.direction=270;a.gravity=-.2;a.hspeed=rt.random.randomRange(.1,.8)*rt.random.choose(1,-1);
}
/** draw_monster_body_part: the part with the instance's own scale, angle, blend and alpha. */
const bodyPart=(s:GmInstance,rt:GmRuntime,sprite:string,frame:number,x:number,y:number)=>drawBodyPart(s,rt,sprite,frame,x,y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
/** The stage's actors, in marker order (Kris, Susie and Ralsei are plain markers). */
const NPC_COUNT=9;

export function createMusicalEnding(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const sweetNpc:GmObjectDef={...object('obj_sweet_npc'),events:{
  create:s=>{Object.assign(s,{imageSpeed:1/6,imageXscale:2,imageYscale:2,thissprite:'spr_sweet_idle',state:0,flash:0,fsiner:0,siner:0,dancing:false,musicalnotetimer:0,dancetimer:0,dance_index:0,updatetimer:0});},
  draw:(s,rt)=>{
   if(s.state!==0)return;
   if(!s.dancing){s.siner+=1/6;bodyPart(s,rt,s.thissprite,s.siner,s.x,s.y);return;}
   s.updatetimer++;if(s.updatetimer>=2){s.siner+=2;s.updatetimer=0;}
   if(s.flash===1)s.fsiner++;
   for(const [frame,dx,dy] of [[8-s.dance_index,Math.sin(s.siner/4)*3+2,0],[3-s.dance_index,Math.sin(s.siner/3)*3,Math.cos(s.siner/2)*4],[4,Math.sin(s.siner/2)*2,Math.cos(s.siner/2)*3],
    [1,Math.sin(s.siner/2)*6-4,Math.cos(s.siner/2)*6],[5+s.dance_index,Math.sin(s.siner/3)*3,Math.cos(s.siner/2)*4]])drawBodyPart(s,rt,'spr_sweet_dance_pieces',frame,s.x+dx,s.y+dy,2,2,0,C.white,s.imageAlpha);
   s.dancetimer++;s.dance_index=Math.sin(s.siner/4)>0?1:0;
   s.musicalnotetimer++;if(s.musicalnotetimer===14){s.musicalnotetimer=0;note(s,rt,s.x+rt.spriteWidth(s)/2-10+rt.random.random(40),s.y);}
  },
 }};
 const KK_PARTS=['s_kkSpine','s_kkArmL','s_kkArmR','s_kkFeet','s_kkFootR','s_kkLegs','s_kkHandR','s_kkHandL','s_kkChest','s_kkHead'];
 const kkNpc:GmObjectDef={...object('obj_kk_npc'),events:{
  create:s=>{Object.assign(s,{state:0,flash:0,fsiner:0,siner:0,imageSpeed:1/6,timer:0,timerB:0,down:0,dancing:0,musicalnotetimer:0,dancetimer:0,dance_index:4,updatetimer:0});s.gml_sprite=[...KK_PARTS];},
  alarm4:s=>{s.con+=1;},
  draw:(s,rt)=>{
   if(s.state!==0)return;
   if(s.flash===1&&s.dancing!==1)s.fsiner++;
   if(s.dancing===1){
    if(s.flash===1)s.fsiner++;
    s.updatetimer++;if(s.updatetimer>=2){s.siner+=2;s.updatetimer=0;}
    const w=C.white;
    drawBodyPart(s,rt,'spr_kk_dance',s.dance_index,s.x+Math.sin(s.siner/4)*14,s.y+Math.abs(Math.cos(s.siner/4))*4-4,2,2,0,w,1);
    drawBodyPart(s,rt,'spr_kk_dance',3,s.x-Math.sin(s.siner/4)*8,s.y+Math.cos(s.siner/2)*3,2,2,0,w,1);
    drawBodyPart(s,rt,'spr_kk_dance',2,s.x+Math.sin(s.siner/3)*3,s.y+Math.cos(s.siner/2)*4,2,2,0,w,1);
    drawBodyPart(s,rt,'spr_kk_dance',1,s.x+Math.sin(s.siner/2)*2,s.y+Math.cos(s.siner/2)*6,2,2,0,w,1);
    drawBodyPart(s,rt,'spr_kk_dance',6,s.x+Math.sin(s.siner/2)*2+Math.sin(s.siner/4)*4,s.y+Math.cos(s.siner/2)*6,2,2,0,w,1);
    s.dancetimer++;s.dance_index=Math.sin(s.siner/4)>0?4:5;
    s.musicalnotetimer++;if(s.musicalnotetimer===14){s.musicalnotetimer=0;note(s,rt,s.x+rt.spriteWidth(s)/2-10+rt.random.random(40),s.y+20);}
    return;
   }
   s.timer+=2;if(s.timer>8){s.timerB+=1;s.timer=0;}
   if(Math.cos(s.timerB)>.8)s.down=1;if(Math.cos(s.timerB)<-.8)s.down=0;
   const p=s.gml_sprite as string[],b=s.timerB,w=C.white;
   drawBodyPart(s,rt,p[0],0,s.x,s.y,2,2,0,w,1);
   drawBodyPart(s,rt,p[1],0,s.x,s.y+Math.cos(b)*2,2,2,0,w,1);
   drawBodyPart(s,rt,p[2],0,s.x,s.y+Math.cos(b)*2,2,2,0,w,1);
   drawBodyPart(s,rt,p[3],s.down,s.x,s.y,2,2,0,w,1);
   drawBodyPart(s,rt,p[5],s.down,s.x,s.y+Math.cos(b)*2,2,2,0,w,1);
   drawBodyPart(s,rt,p[6],0,s.x-Math.sin(b)*4,s.y+Math.cos(b)*2,2,2,0,w,1);
   drawBodyPart(s,rt,p[7],0,s.x-Math.sin(b)*4,s.y+Math.cos(b)*2,2,2,0,w,1);
   drawBodyPart(s,rt,p[8],0,s.x-Math.sin(b)*2,s.y+Math.cos(b),2,2,0,w,1);
   drawBodyPart(s,rt,p[9],0,s.x-Math.sin(b*1.2)*6,s.y+Math.cos(b*2)*2,2,2,0,w,1);
  },
 }};
 const capnNpc:GmObjectDef={...object('obj_hatguy_npc'),events:{
  create:s=>{Object.assign(s,{imageSpeed:1/6,imageXscale:2,imageYscale:2,state:0,dancing:0,flash:0,fsiner:0,thissprite:'spr_hatguy_idle',siner:0,musicalnotetimer:0});},
  alarm4:s=>{s.actcon+=1;},
  draw:(s,rt)=>{
   if(s.state!==0)return;
   s.siner+=1/6;
   if(!s.dancing){bodyPart(s,rt,s.thissprite,s.siner,s.x,s.y);return;}
   bodyPart(s,rt,'spr_hatguy_dance',s.siner,s.x,s.y);
   s.musicalnotetimer++;if(s.musicalnotetimer===14){s.musicalnotetimer=0;note(s,rt,s.x+rt.spriteWidth(s)/2-20+rt.random.random(40),s.y);}
  },
 }};
 const dancerEnd:GmObjectDef={...object('obj_musicenemy_dancer_end'),events:{
  create:(s,rt)=>{
   Object.assign(s,{imageXscale:2,imageYscale:2,siner:0,frame:0,timer:0,bodyflip:1,headimage:2,headframe:0,active:0});
   const all=rt.all(object('obj_musicenemy_dancer_end'));if(all[1]===s)s.headimage=5;if(all[2]===s)s.headimage=8;
   s.shoottimer=-s.headimage*4;
  },
  draw:(s,rt)=>{
   rt.drawSprite(s.sprite!,1,s.x,s.y,s.imageXscale*s.bodyflip,s.imageYscale,0,C.white,s.imageAlpha);
   rt.drawSprite(s.sprite!,s.headimage+s.headframe,s.x+Math.sin(s.siner/3)*2,s.y,s.imageXscale,s.imageYscale,0,C.white,s.imageAlpha);
   s.siner++;s.x+=Math.sin(s.siner/8)*3;
   s.timer++;if(s.timer>=11){s.frame=1;s.timer=0;}
   if(s.frame===1){s.bodyflip*=-1;s.frame=0;}
   if(s.shoottimer>=22){s.active=1;s.shoottimer-=22;}
   if(s.active===1){
    if(s.headframe===0){note(s,rt,s.x-40+rt.random.random(80),s.y-106);s.headframe=1;}
    s.headframe+=.5;if(s.headframe>=2.5)s.active=0;
   }else s.headframe=0;
  },
 }};
 const fadeOut:GmObjectDef={...object('obj_musical_battle_end_fade_out'),events:{
  create:s=>{Object.assign(s,{con:0,x:0,y:0,imageXscale:9999,imageYscale:9999,imageAlpha:0,imageBlend:C.black});s.depth=-999;},
  step:(s,rt)=>{
   if(s.con===0){s.imageAlpha+=.05;if(s.imageAlpha>2)s.con=1;}
   if(s.con===1){s.imageAlpha-=.05;if(s.imageAlpha<0)rt.destroy(s);}
  },
 }};
 /** When the party is done with a bandmate, the "!" over them; C holds it on screen two more frames. */
 const excBlcon:GmObjectDef={...object('obj_excblcon'),events:{
  create:(s,rt)=>{s.alarm[0]=20;s.imageSpeed=.1;if(rt.globals.darkzone===1){s.imageXscale=2;s.imageYscale=2;}},
  alarm0:(s,rt)=>rt.destroy(s),
  step:(s,rt)=>{
   if(!button3_h(rt))return;
   const m=rt.create(object('obj_marker'),s.x,s.y);s.onesec=m.id;m.sprite=s.sprite;
   m.imageXscale=s.imageXscale;m.imageYscale=s.imageYscale;m.depth=s.depth;m.imageIndex=s.imageIndex;m.imageSpeed=s.imageSpeed;
   scrDoom(rt,m.id,2);rt.destroy(s);
  },
 }};
 const BEAT_FRAMES=new Set([237,246,252,259,270,276,432,439,442,448,454]);
 const ending:GmObjectDef={...object('obj_musical_battle_end'),events:{
  create:(s,rt)=>{Object.assign(s,{con:0,init:0,drawground:0,siner:0});sndFreeAll(rt);s.depth=-100;s.xx=rt.view.x;s.yy=rt.view.y;s.cx=rt.view.x+320;s.cy=rt.view.y+240;},
  draw:(s,rt)=>{
   const g=rt.globals,d=rt.drawState;
   s.xx=rt.view.x;s.yy=rt.view.y;s.cx=rt.view.x+320;s.cy=rt.view.y+240;
   d.color=C.black;rt.drawRect(s.xx-10,s.yy-10,s.xx+999,s.yy+999,false);
   const m=(i:number)=>{const inst=rt.byId(s.marker[i]);if(!inst)throw Error('obj_musical_battle_end lost actor '+i);return inst;};
   if(s.con===0){
    s.drawground=0;s.auto=1;
    // snd_init owns a stream holder and writes its caller before mus_play starts the song.
    s.initsongvar='mus/cyber_battle_end.ogg';s._mystream=rt.sourceAudio?.music('cyber_battle_end')??'cyber_battle_end';
    const stream=rt.create(object('obj_astream'),0,0);s._astream=stream.id;stream.mystream=s._mystream;stream.songname='cyber_battle_end.ogg';
    s.song1=s._mystream;s._xsndinstance=rt.sourceAudio?s._mystream:-1;s.song2=s._xsndinstance;rt.sourceAudio?.volume(s.song2,g.flag[16],0);
    const markers:number[]=[];
    const kris=darkMarker(rt,s,s.xx,s.yy-200,'spr_kris_dance');markers[0]=kris.id;if(g.hp[1]<1){kris.sprite='spr_kris_fallen_dark';kris.y-=2;}
    markers[1]=darkMarker(rt,s,s.xx,s.yy-200,'spr_susie_dance').id;markers[2]=darkMarker(rt,s,s.xx,s.yy-200,'spr_ralsei_dance').id;
    for(const [i,def] of [[3,sweetNpc],[4,kkNpc],[5,capnNpc]] as const){const n=rt.create(def,s.xx,s.yy-200);n.dancing=1;markers[i]=n.id;}
    for(const i of [6,7,8])markers[i]=rt.create(dancerEnd,s.xx,s.yy-80).id;
    s.marker=markers;s.markeroffsety=Array(NPC_COUNT).fill(0);s.markeroffsetx=Array(NPC_COUNT).fill(0);
    for(s.i=0;s.i<NPC_COUNT;s.i++){
     const a=m(s.i);a.depth=s.depth-500;a.imageSpeed=.24000000000000002;
     // The source scales the ending itself here, not the dancer (image_xscale outside a with).
     if(s.i>=6){s.imageXscale=4;s.imageYscale=4;}
    }
    s.markeroffsetx[0]=6;s.markeroffsety[0]=24;if(g.hp[1]<0)s.markeroffsety[0]=12;
    s.markeroffsety[4]=-36;s.markeroffsetx[4]=-40;s.markeroffsetx[5]=-12;s.framecount=0;s.con=9;
   }
   // Pairs on the stage: Kris and Sweet, Susie and K_K, Ralsei and Cap'n.
   if(s.con===10||s.con===11||s.con===12){
    s.drawground=1;for(s.i=0;s.i<NPC_COUNT;s.i++)m(s.i).y=-200;
    const k=s.con-10,a=m(k),b=m(k+3);
    a.y=s.cy+s.markeroffsety[k];a.x=s.cx-140+Math.sin(s.siner/8)*10+s.markeroffsetx[k];
    if(g.hp[1]<0&&s.con===10)a.x=s.cx-140+s.markeroffsetx[k];
    b.y=s.cy+s.markeroffsety[k+3];b.x=s.cx+80+Math.sin(s.siner/8)*10+s.markeroffsetx[k+3];
   }
   if(s.con===13||s.con===15){
    s.drawground=0;for(s.i=0;s.i<6;s.i++)m(s.i).y=-200;
    for(s.i=6;s.i<9;s.i++){const a=m(s.i);a.x=s.cx-100+100*(s.i-6);a.y=s.cy;}
   }
   if(s.con===14){
    s.drawground=0;for(s.i=0;s.i<NPC_COUNT;s.i++)m(s.i).y=-100;
    for(s.i=0;s.i<6;s.i++){const a=m(s.i);a.x=s.cx+Math.sin(s.i*3.14/3+s.siner/20)*200-50+s.markeroffsetx[s.i];a.y=s.cy+Math.cos(s.i*3.14/3+s.siner/20)*100+s.markeroffsety[s.i];a.depth=-200-a.y;}
   }
   if(s.con===16){
    for(const dancer of rt.withInstances(dancerEnd))dancer.visible=false;
    s.drawground=0;s.jumptimer=0;s.mx=0;s.jumped=[];
    for(s.i=0;s.i<NPC_COUNT;s.i++){
     const a=m(s.i);a.y=s.yy+500+s.markeroffsety[s.i];a.x=s.xx+s.mx+40;s.jumped[s.i]=0;a.speed=0;a.gravity=0;s.mx+=80;if(s.i===4)s.mx+=80;
    }
   }
   if(s.con===17){
    s.jumptimer++;
    for(s.i=0;s.i<6;s.i++){
     const a=m(s.i);
     if(s.jumptimer>s.i*2&&s.jumped[s.i]===0){a.vspeed=-30;a.gravity=2;s.jumped[s.i]=1;}
     // The source marks the actor (not the ending) as landed, so this repeats every frame once it has.
     if(a.vspeed>=4&&s.jumped[s.i]===1){a.vspeed=0;a.gravity=0;gmArray(a,'jumped',()=>Array(s.i+1).fill(0))[s.i]=2;}
    }
   }
   const stopBand=()=>{for(const i of [3,4,5]){const a=m(i);a.updatetimer=0;a.dancetimer=0;a.siner=0;a.musicalnotetimer=0;}};
   if(s.con===18){
    if(s.jumped[0]<3){
     if(g.hp[1]>0){const k=m(0);k.sprite='spr_kris_pose';k.y-=18;}
     m(1).sprite='spr_susie_pose';m(2).sprite='spr_ralsei_pose';
     for(s.i=0;s.i<20;s.i++){
      // GML evaluates instance_create arguments from right to left: the y roll precedes x.
      const ny=s.cy-50+rt.random.randomRange(-50,50),nx=s.cx+rt.random.randomRange(-100,100);
      const n=rt.create(afterimage,nx,ny);s.note=n.id;
      n.sprite='spr_musical_notes';n.gravity=.4+rt.random.random(.2);n.vspeed=-2-rt.random.random(5);n.hspeed=rt.random.randomRange(-4,4);n.depth=-500;n.imageAlpha=2;
     }
     s.jumped[0]=3;
    }
    stopBand();
    s.battlewonstring=sourceText('obj_musical_battle_end_slash_Draw_0_gml_205_0');
    d.font='fnt_mainbig';d.color=C.white;d.halign=1;rt.drawText(s.cx,s.cy-100,s.battlewonstring,2,3,0);d.halign=0;d.valign=0;
   }
   if(s.con>=19){
    stopBand();
    if(g.hp[1]>0)m(0).sprite='spr_kris_pose';m(1).sprite='spr_susie_pose';m(2).sprite='spr_ralsei_pose';
   }
   if(s.con===19){s.con=20;rt.create(fadeOut,s.x,s.y);}
   if(s.con===21){
    for(const e of rt.withInstances(object('obj_sweet_enemy')))e.endcon=4;
    for(let a=0;a<NPC_COUNT;a++){const inst=rt.byId(s.marker[a]);if(inst)rt.destroy(inst);}
    rt.destroy(s);
   }
   if(s.drawground){d.color=mergeColor(0x800000,C.ltgray,.5);rt.drawEllipse(s.cx-200,s.cy+100,s.cx+200,s.cy+40,false);}
   if(s.auto===1){
    const cue:Readonly<Record<number,number>>={57:10,115:11,172:12,236:13,288:14,432:15,460:16,461:17,518:18,620:19,642:21};
    if(cue[s.framecount]!==undefined)s.con=cue[s.framecount];
   }
   if(BEAT_FRAMES.has(s.framecount))for(const dancer of rt.withInstances(dancerEnd))dancer.active=1;
   s.framecount++;s.siner++;
  },
 }};
 return [sweetNpc,kkNpc,capnNpc,dancerEnd,fadeOut,excBlcon,ending];
}
