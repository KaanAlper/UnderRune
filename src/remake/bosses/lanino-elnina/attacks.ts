// Encounter 113's paired weather mascots (bullet controller 130). The earlier weather IDs stored in the
// controller's forecasts are planning data; this encounter does not spawn the separate 68–71 patterns.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {eq,ge,gt,le,lt,clamp,pointDirection} from '../../gm/math';
import {bbox,rectangleMeets} from '../../gm/collision';
import {C,mergeColor} from '../../gm/graphics';
import {bulletInit,damage,damageAll,darkMarker,growtangle,heart,marker} from '../../deltarune/battle';
import {bulletInherit} from '../../deltarune/chapter3-scripts';
import {scrDoom,scrLerpvarInstance} from '../../deltarune/shared-effects';
import {snd,msgSet} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {destroyWriters} from '../../deltarune/writer';
import {sourceText} from '../../host/text';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';

const BS=['spr_ch3_bullet_raincloud','spr_ch3_bullet_ice','spr_ch3_bullet_heart','spr_ch3_bullet_sun','spr_ch3_bullet_moon','spr_ch3_bullet_raindrop'];
const BIDS=[429,3812,4151,4066,4418,1359];
const PATTERN_TEXT:Readonly<Record<number,string>>={
 2437:'obj_dbulletcontroller_slash_Step_0_gml_2437_0',2446:'obj_dbulletcontroller_slash_Step_0_gml_2446_0',
 2469:'obj_dbulletcontroller_slash_Step_0_gml_2469_0',2479:'obj_dbulletcontroller_slash_Step_0_gml_2479_0',
 2532:'obj_dbulletcontroller_slash_Step_0_gml_2532_0',2542:'obj_dbulletcontroller_slash_Step_0_gml_2542_0',
};
const MIDS=[[472,2176,3561,187,4197,2807,539,1126],[2069,4613,714,4574,4262,4394,266,2595]];
const MS=[['spr_ch3_mascot_moon_normal','spr_ch3_mascot_moon_kiss','spr_ch3_mascot_moon_large_smug','spr_ch3_mascot_moon_huge_gloat','spr_ch3_mascot_moon_scared','spr_ch3_mascot_moon_chase','spr_ch3_mascot_moon_chase_small','spr_ch3_mascot_moon_large_smug_sad'],
 ['spr_ch3_mascot_cloud_normal','spr_ch3_mascot_cloud_kiss','spr_ch3_mascot_cloud_large_smug','spr_ch3_mascot_cloud_huge_gloat','spr_ch3_mascot_cloud_scared','spr_ch3_mascot_cloud_chase','spr_ch3_mascot_cloud_chase_small','spr_ch3_mascot_cloud_large_smug_sad']];

const spriteOf=(id:number)=>{const b=BIDS.indexOf(id);if(b>=0)return BS[b];for(let i=0;i<2;i++){const n=MIDS[i].indexOf(id);if(n>=0)return MS[i][n];}throw Error('Unknown weather sprite '+id);};

export function createWeatherAttacks(object:(name:string)=>GmObjectDef){
 const named=(rt:GmRuntime,n:string)=>rt.first(object(n));
 const box=(rt:GmRuntime)=>{const b=rt.first(growtangle);if(!b)throw Error('Weather attacks need obj_growtangle');return b;};
 const mascotAt=(s:GmInstance,rt:GmRuntime,i:number)=>rt.byId(s.mascot[i]);
 const shrink=(s:GmInstance,rt:GmRuntime)=>{
  const m=rt.create(marker,s.x,s.y);s.thismarker=m.id;m.sprite='spr_ball_small';m.imageSpeed=0;m.depth=s.depth;m.imageBlend=C.gray;
  scrLerpvarInstance(s,rt,m.id,'image_xscale',s.imageXscale,0,8,-1);scrLerpvarInstance(s,rt,m.id,'image_yscale',s.imageYscale,0,8,-1);scrDoom(rt,m.id,8);return m;
 };
 const regular:GmObjectDef={...object('obj_regularbullet_elnina'),events:{
  create:s=>{bulletInit(s);Object.assign(s,{spin:0,spinspeed:0,imageAlpha:1,wall_destroy:1,bottomfade:0,damage:60,grazepoints:2,target:4});},
  user5:(s,rt)=>{if(eq(s.active,1)){if(!eq(s.target,3))damage(s,rt);if(eq(s.target,3))damageAll(s,rt);if(eq(s.destroyonhit,1))rt.destroy(s);}},
  step:(s,rt)=>{
   if(!rt.exists(heart))rt.destroy(s);
   if(eq(s.wall_destroy,1)){
    if(lt(s.x,rt.view.x-80))rt.destroy(s);if(gt(s.x,rt.view.x+760))rt.destroy(s);
    if(lt(s.y,rt.view.y-80))rt.destroy(s);if(gt(s.y,rt.view.y+580))rt.destroy(s);
   }
   if(eq(s.updateimageangle,1))s.imageAngle=s.direction;if(eq(s.spin,1))s.imageAngle+=s.spinspeed;
   if(!eq(s.bottomfade,0)&&gt(s.y,rt.view.y+s.bottomfade))s.imageAlpha*=0.8;
   const b=bbox(rt.bank,s);if(!b)return;
   // GML bbox_right/bottom are inclusive in compatibility mode; collision.ts uses exclusive edges internally.
   const edge=rt.bank.collisionCompat?1:0;
   const other=rt.all(regular).find(o=>o.id!==s.id&&rectangleMeets(rt.bank,o,b.left-s.imageXscale-2,b.top-s.imageYscale-1,b.right-edge+s.imageXscale+2,b.bottom-edge+s.imageYscale+1,true));
   if(!other||other.sprite===s.sprite||s.sprite==='spr_lanino_fire'||named(rt,'obj_elnina_rematch_enemy'))return;
   const c=named(rt,'obj_elnina_lanino_controller');
   if(c&&le(c.turns,2)){
    if(s.sprite!==BS[2]&&other.sprite!==BS[2]){
     s.sprite=BS[2];other.sprite=BS[2];snd(rt,'snd_coaster_kiss',1+rt.random.random(0.2),0.7);
     const pink=mergeColor(0xff00ff,C.white,0.8);s.imageBlend=pink;other.imageBlend=pink;
    }
   }else{
    rt.soundStop?.('snd_bump');snd(rt,'snd_bump');shrink(s,rt);shrink(other,rt);
    rt.destroy(s);rt.destroy(other);
   }
  },
  // Its own collision event deliberately shadows inherited bullet collisions without doing anything.
 },collisions:[]};
 regular.collisions=[{target:regular,run:()=>{}}];
 const mascot:GmObjectDef={...object('obj_elnina_mascotattack'),events:{
  create:(s,rt)=>{
   Object.assign(s,{attacktype:0,con:0,btimer:0,siner:0,type:0,laninobulletsprite:0,elninabullesprite:0,element:5,extrabulletrate:rt.globals.elninalosscount,
    facing:[1,-1],favored:0,shottimer:[0,0],dummy:false,encounterno:rt.globals.encounterno,bulletcount:0,firebulletcount:2000,bs:[...BIDS],ms:MIDS.map(row=>[...row])});
   const c=named(rt,'obj_elnina_lanino_controller');if(c&&lt(c.turns,7)){const f=c.forecasts[0];s.laninobulletsprite=f[1];s.elninabullesprite=f[2];}
  },
  cleanup:(s,rt)=>{for(const id of s.mascot??[]){const m=rt.byId(id);if(m)rt.destroy(m);}},
  draw:()=>{},
  step:(s,rt)=>{
   if(!rt.exists(growtangle)){rt.destroy(s);return;}
   if(le(rt.globals.turntimer,2)){mascotAt(s,rt,0)!.imageAlpha=0;mascotAt(s,rt,1)!.imageAlpha=0;return;}
   const b=box(rt),xx=b.x,yy=b.y;s.siner++;
   if(!ge(s.attacktype,0))return;
   if(eq(s.con,0)){
    s.mascot=[];
    if(s.dummy){s.mascot[0]=darkMarker(rt,s,xx+181,yy,spriteOf(s.ms[1][0])).id;s.mascot[1]=darkMarker(rt,s,xx+79,yy,spriteOf(s.ms[0][0])).id;for(let i=0;i<2;i++)mascotAt(s,rt,i)!.imageXscale*=-1;}
    else{s.mascot[0]=darkMarker(rt,s,xx+72,yy-116,spriteOf(s.ms[0][0])).id;s.mascot[1]=darkMarker(rt,s,xx-72,yy-116,spriteOf(s.ms[1][0])).id;}
    if(eq(s.attacktype,1)){const m=mascotAt(s,rt,s.favored)!;m.imageXscale=2.25;m.imageYscale=2.25;}
    if(eq(s.attacktype,3))s.chasecon=0;
    if(ge(s.attacktype,2)&&le(s.attacktype,4))for(let i=0;i<2;i++){
     const m=mascotAt(s,rt,i)!,fav=eq(s.favored,i);
     if(eq(s.attacktype,2)){m.imageXscale=fav?1.7:1.5;m.imageYscale=m.imageXscale;m.sprite=spriteOf(s.ms[i][fav?2:4]);m.y+=fav?-10:10;if(!fav)m.x-=30*s.facing[i];}
     if(eq(s.attacktype,3)){m.imageXscale=fav?2:1;m.imageYscale=m.imageXscale;m.sprite=spriteOf(s.ms[i][fav?2:4]);m.y+=fav?-16:20;if(!fav)m.imageXscale*=-1;m.direction=90+90*s.facing[s.favored];m.speed=fav?6:4.4;if(!fav)m.imageSpeed=0.5;}
     if(eq(s.attacktype,4)){m.imageXscale=fav?2:1;m.imageYscale=m.imageXscale;m.sprite=spriteOf(s.ms[i][fav?3:6]);m.y-=fav?16:20;if(!fav)m.imageXscale*=-1;m.direction=90+90*s.facing[s.favored];m.x=fav?xx:xx-120;if(!fav){m.speed=0;m.imageSpeed=0.5;}}
    }
    s.con=1;
   }
   if(!eq(s.con,1))return;
   for(let i=0;i<2;i++){
    const m=mascotAt(s,rt,i);if(!m)continue;
    if(eq(s.attacktype,0)||eq(s.attacktype,1)){
     if(!(eq(s.attacktype,1)&&eq(s.favored,i))){m.x-=Math.sin(s.siner/8)*s.facing[i];m.x-=s.facing[i]/10;if(eq(s.siner,162)&&eq(s.attacktype,0)&&!s.dummy)m.sprite=spriteOf(s.ms[i][1]);}
    }else if(eq(s.attacktype,2)){if(!eq(s.favored,i))m.x+=0.2*s.facing[i]+rt.random.randomRange(-1,1);else m.x+=Math.sin(s.siner/6)*3-0.3*s.facing[i];}
    else if(eq(s.attacktype,3)){const t=eq(i,s.favored)?140:110;if(lt(m.x,xx-t)||gt(m.x,xx+t)||lt(m.y,yy-t)||gt(m.y,yy+t)){m.x-=m.hspeed;m.y-=m.vspeed;m.imageAngle+=90*s.facing[s.favored];m.direction+=90*s.facing[s.favored];}}
    else if(eq(s.attacktype,4)&&gt(rt.globals.turntimer,250)&&eq(i,s.favored))m.x=xx+Math.sin(s.siner/3)*3+Math.cos(s.siner/7)*2;
   }
   if(eq(s.siner,168)&&eq(s.attacktype,0)&&!s.dummy){const m=darkMarker(rt,s,xx,yy-120,BS[2]);m.vspeed=-6;m.friction=0.334;scrDoom(rt,m.id,32);scrLerpvarInstance(s,rt,m.id,'image_alpha',3,0,32);}
   s.shotrate=[11,11];if(named(rt,'obj_elnina_rematch_enemy')&&!named(rt,'obj_bullet_blocker')&&!named(rt,'obj_elnina_umbrella'))s.shotrate=[8,8];
   let hs=2+rt.random.random(3),vs=1+rt.random.random(3.2);
   if(eq(s.attacktype,1))s.shotrate[s.favored]=11;
   if(eq(s.attacktype,2)){s.shotrate=[14+s.extrabulletrate,14+s.extrabulletrate];s.shotrate[s.favored]=8;hs+=0.2+rt.random.random(0.5);vs+=0.2+rt.random.random(0.5);}
   if(eq(s.attacktype,3)){s.shotrate=[13+s.extrabulletrate,13+s.extrabulletrate];s.shotrate[s.favored]=6+s.extrabulletrate;}
   if(eq(s.attacktype,4)){
    s.shotrate=[21+s.extrabulletrate,21+s.extrabulletrate];s.shotrate[s.favored]=7+s.extrabulletrate;if(ge(rt.globals.hp[1],rt.globals.maxhp[1]/2))s.shotrate[s.favored]=6+s.extrabulletrate;
    if(lt(rt.globals.turntimer,500)){s.shotrate[s.favored]=65+s.extrabulletrate-rt.globals.turntimer/10;if(le(rt.globals.turntimer,250))s.shotrate[s.favored]=9999;
     rt.sourceAudio?.volume(rt.globals.batmusic[0],rt.globals.turntimer/500-0.2,0);const m=mascotAt(s,rt,s.favored)!;m.imageSpeed=0;m.imageIndex=0;m.sprite=spriteOf(s.ms[s.favored][7]);if(lt(rt.globals.turntimer,350))m.imageIndex=1;if(lt(rt.globals.turntimer,200))m.imageIndex=2;
    }
   }
   s.shottimer[0]++;s.shottimer[1]++;
   for(let i=0;i<2;i++){
    const m=mascotAt(s,rt,i);if(!m||s.dummy||!ge(s.shottimer[i],s.shotrate[i]))continue;
    const p=rt.create(regular,m.x,m.y);p.hspeed=hs*s.facing[i];p.vspeed=vs;p.gravityDirection=90+90*s.facing[i];p.gravity=0.2;p.sprite=spriteOf(s.bs[3-i*2]);p.element=5;
    if(eq(s.attacktype,2)||eq(s.attacktype,3))p.grazepoints=3;const dc=named(rt,'obj_dbulletcontroller');if(dc)p.target=dc.target;
    const typed:Record<number,number>={1:5,2:1,3:4,4:3};if(typed[s.type]!==undefined)p.sprite=spriteOf(s.bs[typed[s.type]]);
    if(eq(i,0)){if(eq(s.laninobulletsprite,1474))p.sprite=spriteOf(s.bs[4]);if(eq(s.laninobulletsprite,783))p.sprite=spriteOf(s.bs[3]);}
    if(eq(i,1)){if(eq(s.elninabullesprite,4256))p.sprite=spriteOf(s.bs[5]);if(eq(s.elninabullesprite,1650))p.sprite=spriteOf(s.bs[1]);}
    let a=0;const umbrella=named(rt,'obj_elnina_umbrella');if(umbrella)a=umbrella.mercy*2;const lanino=named(rt,'obj_lanino_rematch_enemy');
    if(lanino){const mercy=rt.globals.mercymod[lanino.myself]+rt.globals.mercymod[named(rt,'obj_elnina_rematch_enemy')!.myself]+a;if(gt(mercy,100))s.firebulletcount=20;if(gt(mercy,198))s.firebulletcount=12;}
    s.bulletcount++;if(ge(s.bulletcount,s.firebulletcount)){p.sprite='spr_lanino_fire';p.imageBlend=C.red;p.imageXscale=2;p.imageYscale=2;}if(ge(s.bulletcount,s.firebulletcount+3))s.bulletcount=0;
    if(eq(s.attacktype,1)&&eq(s.favored,i)){p.imageXscale=1.25;p.imageYscale=1.25;}
    if(eq(s.attacktype,2)){p.imageXscale=eq(s.favored,i)?1.5:0.8;p.imageYscale=p.imageXscale;}
    if(eq(s.attacktype,3)){
     p.direction=m.imageAngle-80*s.facing[i]+rt.random.randomRange(-10,10);if(!eq(s.favored,i))p.direction=m.imageAngle+50*s.facing[i]+rt.random.randomRange(-10,10);if(eq(s.favored,1))p.direction+=180;
     p.speed=2.5;p.gravity=0.2;p.gravity=0;p.friction=-0.1;
     if(eq(s.favored,i)){p.imageXscale=2;p.imageYscale=2;p.speed=1;p.direction=pointDirection(p.x,p.y,xx,yy)+15*s.facing[i];}
     else{p.imageXscale=1;p.imageYscale=1;p.direction=pointDirection(p.x,p.y,xx,yy)+rt.random.randomRange(-35,35);}
    }
    if(eq(s.attacktype,4)){
     if(!eq(s.favored,i)){p.visible=false;rt.destroy(p);m.imageAlpha-=0.05;m.imageXscale-=0.05;m.imageYscale-=0.05;m.x+=rt.random.randomRange(-2,2);m.y+=rt.random.randomRange(-2,2);}
     else{let maxscale=3;if(gt(s.shotrate[i],5))maxscale=clamp(3-s.shotrate[i]/10,0.5,3);scrLerpvarInstance(s,rt,p.id,'image_xscale',1,maxscale,60,2,'out');scrLerpvarInstance(s,rt,p.id,'image_yscale',1,maxscale,60,2,'out');
      p.gravityDirection=rt.random.choose(0,180);p.gravity=0.2;p.direction=p.gravityDirection+180;p.speed=8;p.vspeed=0.5+rt.random.random(3);p.y+=10;scrDoom(rt,p.id,100);scrLerpvarInstance(p,rt,p.id,'image_alpha',8,0,100,0,'in');}
    }
    if(lt(s.attacktype,4)){scrDoom(rt,p.id,80);scrLerpvarInstance(s,rt,p.id,'image_alpha',8,0,70,0,'in');}s.shottimer[i]=0;
   }
  },
 }};
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(!eq(s.type,130))return false;
  if(!s.made){const b=box(rt),m=rt.create(mascot,b.x,b.y);m.attacktype=s.special;m.favored=s.side;m.type=s.difficulty;bulletInherit(s,m);s.made=true;}
  if(!eq(s.special,4))return true;
  const g=rt.globals;
  const talk=(n:number,head?:number)=>{
   g.typer=50;const el=eq(s.side,1),e=named(rt,el?'obj_elnina_enemy':'obj_lanino_enemy');
   // The last Elnina line is set by the controller itself, even if her instance no longer exists.
   if(n===2532)msgSet(rt,0,sourceText(PATTERN_TEXT[n]));
   if(!e)return;if(head!==undefined)e.head=head;if(n!==2532)msgSet(rt,0,sourceText(PATTERN_TEXT[n]));
   const ja=g.lang==='ja',late=n===2479||n===2542;
   const x=el?e.x+40:e.x+(late&&(!ja||n===2542)?-5:-60),y=g.monstery[e.myself]+(el?-70:70);
   const kind=el?13:n===2479?(ja?12.2:12.3):n===2542?(ja?12.4:12.3):(ja?12.1:12);
   enemyBlcon2(e,rt,x,y,kind);rt.byId(e.myblcon)!.depth=s.depth-100;
  };
  if(lt(g.turntimer,500)&&eq(s.init,1)){s.init=2;talk(eq(s.side,1)?2437:2446);}
  if(lt(g.turntimer,400)&&eq(s.init,2)){s.init=3;destroyWriters(rt);}
  if(lt(g.turntimer,350)&&eq(s.init,3)){s.init=4;talk(eq(s.side,1)?2469:2479,eq(s.side,1)?3799:4545);}
  if(lt(g.turntimer,250)&&eq(s.init,4)){s.init=5;destroyWriters(rt);}
  if(lt(g.turntimer,200)&&eq(s.init,5)){s.init=6;talk(eq(s.side,1)?2532:2542,eq(s.side,1)?4436:3264);}
  if(lt(g.turntimer,100)&&eq(s.init,6)){s.init=7;destroyWriters(rt);}return true;
 };
 return {objects:[regular,mascot],pattern};
}
