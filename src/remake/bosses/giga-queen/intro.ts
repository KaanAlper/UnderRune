import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C,makeColorHsv} from '../../gm/graphics';
import {eq,ge,gt,le,lt} from '../../gm/math';
import {snd} from '../../deltarune/sound';
import {speaker} from '../../deltarune/chapter2-enemy';
import {msgSet} from '../../deltarune/chapter2-battle';
import {sourceText} from '../../host/text';
import {createGigaIntroBanners} from './intro-banners';
import {createGigaIntroEffects} from './intro-effects';

/** Source intro scene: transition, falling hero and Queen's timed ring announcement. */
export function createGigaIntro(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const req=(rt:GmRuntime,n:string)=>{const i=rt.first(object(n));if(!i)throw Error(`GigaIntroRequires:${n}`);return i;};
 const after=(s:GmInstance,rt:GmRuntime,rate:number)=>{const a=rt.create(object('o_afterimage'),s.x,s.y);s.flash=a.id;a.sprite=s.sprite;a.imageIndex=s.imageIndex;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.imageBlend=C.white;a.imageSpeed=0;a.rate=rate;a.hasboss=0;a.depth=s.depth+1;a.boss=s.id;};
 const shake=(s:GmInstance,rt:GmRuntime)=>{const def=object('obj_shake');if(rt.exists(def)){s.d=196;for(const a of rt.withInstances(def)){a.shakex=2;a.shakey=2;}}else{const a=rt.create(def,0,0);s.d=a.id;a.shakex=2;a.shakey=2;}snd(rt,'snd_closet_impact');};
 const hero:GmObjectDef={name:'obj_thrash_intro',index:1086,sprite:'spr_bhero',events:{create:(s,rt)=>{
  s.f=2;s.state=0;s.timer=0;s.imageSpeed=0;s.imageXscale=-2;s.imageYscale=2;s.imageIndex=1;s.vspeed=80/s.f;s.depth=-10;req(rt,'obj_3d_bg_effect').slow_down=1;s.headsprite='spr_bhero_head_c';s.punchcon=0;s.punchtimer=0;s.basex=320;s.basey=390;s.siner=0;s.missnoise=0;s.miss_timer=0;s.shaketimer=4;s.movetime=0;
  const flag=rt.globals.flag;if(flag[220]===1)s.headsprite='spr_bhero_head_b';if(flag[220]===2)s.headsprite='spr_bhero_head_a';if(flag[220]===3)s.headsprite='spr_bhero_head_d';s.headcolor=makeColorHsv((flag[223]??0)*8,255,255);s.glow=0;
 },draw:(s,rt)=>{
  rt.drawSelf(s);rt.drawBlendMode('normal');rt.drawSprite(s.headsprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,0,C.white,s.imageAlpha);rt.drawBlendMode('add');rt.drawSprite(s.headsprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,0,s.headcolor,s.imageAlpha);rt.drawBlendMode('normal');
 },step:(s,rt)=>{
  if(s.state===0){after(s,rt,0.1);s.movetime++;if(lt(s.movetime,18))rt.view.y+=4;}
  if(s.state===0&&gt(s.y,310)){s.y=350;s.vspeed=0;s.state=1;s.imageIndex=1;shake(s,rt);}
  if(s.state===1){s.timer++;if(le(s.timer,20/s.f)){s.shaketimer-=0.2;rt.view.x=rt.view.x-s.shaketimer+rt.random.irandom(s.shaketimer*2);rt.view.y=rt.view.y-s.shaketimer+rt.random.irandom(s.shaketimer*2);}
   if(eq(s.timer,90/s.f))for(const a of rt.withInstances(object('obj_bqueen_intro')))a.con=1;
   if(eq(s.timer,110/s.f))s.timer=100/s.f;
   if(eq(s.timer,154/s.f)){const c=req(rt,'obj_battlecontroller');c.gigaqueencon=4;c.gigaqueentimer=0;}
   if(ge(s.timer,150/s.f)){rt.view.x=0;rt.view.y=0;s.imageIndex=0;if(ge(s.y,s.basey-35)){s.y+=(s.basey-35-s.y)*0.5;if(le(Math.abs(s.y-s.basey-35),2))s.y=s.basey-35;}else{s.siner++;s.y=s.basey-38+Math.sin(s.siner/2)*2;}if(ge(s.x,s.basex-70)){s.x+=(s.basex-70-s.x)*0.5;if(le(Math.abs(s.x-s.basex-70),2))s.x=s.basex-70;}}
   if(eq(s.timer,160/s.f)){
    req(rt,'obj_3d_bg_effect').slow_down=0;for(const a of rt.withInstances(object('obj_bqueen_intro')))rt.destroy(a);rt.destroy(s);
    s.initsongvar='mus/boxing_boss.ogg';const handle=rt.sourceAudio?.music('boxing_boss')??'boxing_boss';s._mystream=handle;const stream=rt.create(object('obj_astream'),0,0);s._astream=stream.id;stream.mystream=handle;stream.songname='boxing_boss.ogg';rt.globals.batmusic[0]=handle;
    rt.sourceAudio?.volume(handle,rt.globals.flag[16],0);rt.sourceAudio?.pitch?.(handle,1);rt.sourceAudio?.loop(handle);
   }
  }
 }}};
 const queen:GmObjectDef={name:'obj_bqueen_intro',index:1088,sprite:'spr_bqueen_idle',events:{create:s=>{s.imageXscale=2;s.imageYscale=2;s.imageSpeed=0;s.depth=999;s.timer=0;s.con=0;s.shaketimer=0;s.readycon=0;},draw:(s,rt)=>{rt.drawSelf(s);rt.drawState.alpha=1;rt.drawState.halign=0;},step:(s,rt)=>{
  if(s.con===1){s.timer++;if(ge(s.timer,45)){s.con=2;s.timer=0;rt.view.x+=28;speaker(s,rt,'queen');msgSet(rt,0,sourceText('obj_bqueen_intro_slash_Step_0_gml_13_0'));rt.create(object('obj_writer'),rt.view.x+30,rt.view.y+376);rt.view.x-=28;for(const w of rt.withInstances(object('obj_writer'))){w.rate=3;w.skippable=0;w.writingy=w.y-320;}}}
  if(s.con===2&&!rt.exists(object('obj_writer'))){s.con=3;s.y=-120;s.sprite='spr_bqueen_pirouette';s.imageSpeed=0.25;s.gravityDirection=270;s.gravity=2;}
  if(s.con===3&&lt(s.y,280)){s.timer++;if(lt(rt.view.y,0))rt.view.y+=7;else rt.view.y=0;for(const a of rt.withInstances(hero)){if(lt(a.y,390))a.y+=6;else a.y=390;}after(s,rt,0.2);}
  if(s.con===3&&gt(s.y,280)){speaker(s,rt,'no_name');rt.globals.typer=4;rt.globals.fc=0;rt.globals.fe=0;s.con=4;s.timer=0;s.sprite='spr_bqueen';s.imageIndex=21;s.imageSpeed=0;s.speed=0;s.gravity=0;s.y=300;shake(s,rt);}
  if(s.con===4){s.timer++;if(ge(s.timer,20)){s.con=5;s.timer=0;}}
  if(s.con===5){s.timer++;if(s.timer===1)rt.create(object('obj_gigaqueen_intro_round'),rt.view.x+rt.view.width/2,rt.view.y-220);if(s.timer===52){const r=req(rt,'obj_gigaqueen_intro_round');rt.create(object('obj_gigaqueen_intro_fight'),r.x+5,r.y);}if(s.timer===92){s.con=6;s.timer=0;s.readycon=0;}}
  if(s.con===6){s.timer++;if(s.timer===1||s.timer===10)snd(rt,'snd_bell');if(s.timer===22){s.con=8;s.timer=0;}}
  if(s.con===8){s.con=9;for(const a of rt.withInstances(hero))a.timer=150/a.f;}
 }}};
 const transition:GmObjectDef={name:'obj_thrash_transformation_transition',index:1085,sprite:'spr_whitepx',events:{create:(s,rt)=>{s.x-=200;s.y-=200;s.imageXscale=1280;s.imageYscale=960;s.imageBlend=C.black;s.imageAlpha=1.1;s.depth=-1000;rt.create(queen,320,-300);rt.view.y-=180;},step:(s,rt)=>{s.imageAlpha-=0.02;if(eq(s.imageAlpha,0))rt.create(hero,320,-260);if(lt(s.imageAlpha,0))rt.destroy(s);}}};
 return [transition,hero,queen,...createGigaIntroBanners(object),...createGigaIntroEffects()];
}
