/** Chapter 2's Snowgrave spell and its scene actors, from the original Create/Step/Draw events. */
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {round,eq,ge,le,lt,gt} from '../../gm/math';
import {afterimageGrow,darkMarker,dmgWriter} from '../../deltarune/battle';
import {oflashOf} from '../../deltarune/party';
import {monsterPop} from '../../deltarune/chapter2-enemy';

export function castBerdlySnowgrave(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const g=rt.globals;s.cancelattack=0;g.spelldelay=30;
 if(monsterPop(rt)===0)s.cancelattack=1;
 if(s.cancelattack===0){
  s.damage=Math.ceil(g.battlemag[s.caster]*40+600);
  const a=rt.create(object('obj_spell_snowgrave'),s.x,s.y);s.attack=a.id;a.caster=s.caster;a.damage=s.damage;
  g.spelldelay=999999;a.textwait=1;
 }
}
/** scr_losechar at the battle/world boundary. The battle host has no overworld controller. */
export function snowgraveLoseChar(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const g=rt.globals;g.char[2]=0;g.char[1]=0;
 for(const c of rt.all(object('obj_darkcontroller'))){
  c.chartotal=0;c.havechar=[0,0,0,0];
  for(c.i=0;c.i<3;c.i++){g.faceaction[c.i]=0;const id=g.char[c.i];if(id!==0)c.chartotal++;if(id>=1&&id<=4){c.havechar[id-1]=1;gmArray(c,'charpos')[id-1]=c.i;}}
 }
 g.submenu=0;g.charselect=-1;g.submenucoord??=[];
 for(s.i=0;s.i<36;s.i++)g.submenucoord[s.i]=0;
}
export function createSnowgraveObjects(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const shake:GmObjectDef={...object('obj_shakeobj'),events:{
  create:(s,rt)=>Object.assign(s,{active:0,target:0,shakeamt:rt.globals.darkzone===0?5:10,shakereduct:rt.globals.darkzone===0?1:2,shakespeed:1,nowx:0,nowy:0,on:1,timer:0}),
  user0:(s,rt)=>{const t=rt.byId(s.target);if(t){s.active=1;s.nowx=t.x;s.nowy=t.y;}else rt.destroy(s);},
  step:(s,rt)=>{if(s.active===0)rt.destroy(s);if(s.active===1){const t=rt.byId(s.target);if(t){s.shakeamt-=s.shakereduct;s.on*=-1;t.x=s.nowx+s.shakeamt*s.on;if(le(s.shakeamt,0))rt.destroy(s);}else rt.destroy(s);}},
 }};
 const flake:GmObjectDef={...object('obj_spell_snowgrave_snowflake'),events:{
  create:s=>Object.assign(s,{imageXscale:2,imageYscale:2,siner:0,timer:0}),
  step:(s,rt)=>{s.imageAlpha=1;s.imageXscale=Math.sin(s.siner)*2;s.siner++;s.timer++;if(ge(s.timer,30))rt.destroy(s);},
  draw:(s,rt)=>{rt.drawSelf(s);for(const dir of [1,-1])rt.drawSprite(s.sprite,s.imageIndex,s.x+dir*Math.sin(s.siner/3)*30,s.y,Math.sin(s.siner/3)*2,2,0,0xffffff,s.imageAlpha);},
 }};
 const spell:GmObjectDef={...object('obj_spell_snowgrave'),events:{
  create:(s,rt)=>{Object.assign(s,{bgalpha:0,timer:0,snowspeed:0,stimer:0,caster:0,damage:0,altpath:rt.globals.encounterno===82?1:0,init:0,fncon:0,con:0});if(s.altpath!==1)throw Error('Snowgrave outside Berdly needs its separate source ending');},
  draw:(s,rt)=>{
   const g=rt.globals;s.xx=rt.view.x;s.yy=rt.view.y;
   if(s.init===0){s.init=1;s.fncon=0;s.siner=0;s.timer=-270;
    const n=rt.first(object('obj_heronoelle'))!;n.visible=false;const fn=darkMarker(rt,s,n.x,n.y,'spr_noelleb_spell');s.fn=fn.id;fn.depth=n.depth;fn.imageIndex=0;s.fncon=0;
   }
   s.timer++;const fn=rt.byId(s.fn)!;
   if(eq(s.fncon,0)){fn.imageIndex+=.25;if(ge(fn.imageIndex,8)){s.fntimer=0;s.fncon=.5;rt.sourceAudio?.volume(g.batmusic[1],0,90);}}
   if(eq(s.fncon,.5)){s.fntimer++;if(ge(s.fntimer,120)){
    oflashOf(fn,rt);fn.sprite='spr_noelleb_spell_special';fn.imageSpeed=.5;s.fncon=.8;s.fntimer=0;s.amplitude=0;
    const enemy=rt.first(object('obj_berdlyb2_enemy'))!;enemy.visible=false;const fb=darkMarker(rt,s,enemy.x,enemy.y,'spr_berdlyb_idle_shocked');s.fb=fb.id;fb.depth=enemy.depth;
   }}
   if(eq(s.fncon,.8)){s.fntimer++;if(ge(s.fntimer,30)){s.fntimer=0;s.fncon=1;}}
   if(eq(s.fncon,1)||eq(s.fncon,2)){
    if(lt(s.amplitude,1))s.amplitude+=.03;
    if(gt(fn.y,fn.ystart-70)){fn.y-=s.amplitude;fn.x+=s.amplitude*2.94;}
    fn.x+=Math.sin(s.timer/3)*s.amplitude;fn.y+=Math.cos(s.timer/3)*s.amplitude;
    if(s.timer%4===0&&s.timer<70){
     s.dustsnd=rt.sourceAudio?.effect('snd_bell')??-1;rt.sourceAudio?.volume(s.dustsnd,.5,0);const pitch=.5+rt.random.random(.3);rt.sourceAudio?.pitch?.(s.dustsnd,pitch);
     const d=rt.create(afterimageGrow,fn.x+50,fn.y+20);s.dust=d.id;d.speed=rt.random.random(2)+1;d.direction=rt.random.randomRange(0,180);d.gravity=.2+rt.random.random(.3);d.gravityDirection=rt.random.randomRange(70,110);Object.assign(d,{imageXscale:1,imageYscale:1,sprite:'spr_shine',imageSpeed:.5,imageAlpha:3});
    }
    if(ge(s.timer,210)){fn.sprite='spr_noelleb_spell';fn.imageIndex=2;fn.imageSpeed=0;fn.gravity=1;s.fncon=3;}
   }
   if(eq(s.fncon,3)&&ge(fn.y,s.ystart-6)){
    fn.y=s.ystart;fn.sprite='spr_noelleb_defeat';fn.speed=0;fn.gravity=0;const sh=rt.create(shake,fn.x,fn.y);fn.shakeobj=sh.id;sh.target=fn.id;rt.userEvent(sh,0);s.fncon=4;
   }
   if(s.timer>0){rt.drawState.alpha=s.bgalpha;const x=s.xx-10,y=s.yy-10,r=s.xx+700,b=s.yy+500;
    // Equivalent vertex order keeps both triangles on the renderer's native gradient path.
    rt.drawTriangleColor(r,b,x,y,r,y,0xff0000,0xffffff,0xffffff);rt.drawTriangleColor(x,y,r,b,x,b,0xffffff,0xff0000,0xff0000);
   }
   rt.drawSpriteTiled('bg_snowfall',s.snowspeed/1.5,s.timer*6,2,2,0xffffff,s.bgalpha);
   rt.drawSpriteTiled('bg_snowfall',s.snowspeed,s.timer*8,2,2,0xffffff,s.bgalpha*2);
   if(le(s.timer,10)&&ge(s.timer,0)&&lt(s.bgalpha,.5))s.bgalpha+=.05;
   if(ge(s.timer,0))s.snowspeed+=20+s.timer/5;
   if(eq(s.timer,1))rt.sound?.('snd_snowgrave');
   if(ge(s.timer,20)&&le(s.timer,105)){
    s.stimer++;for(const [i,[x,y]] of [[455,560],[500,600],[545,520]].entries())gmArray(s,'snowflake')[i]=rt.create(flake,s.xx+x,s.yy+y).id;
    for(s.i=0;s.i<3;s.i++){const f=rt.byId(s.snowflake[s.i])!;f.gravity=-2;f.vspeed=Math.sin(s.timer/2)*.5;f.siner=s.timer/2;}
    if(ge(s.stimer,8))s.stimer=0;
   }
   if(eq(s.timer,70)){const fb=rt.byId(s.fb)!;fb.sprite='spr_berdly_ice';fb.x-=22;fb.y-=48;}
   if(eq(s.timer,125)&&s.damage>0&&g.fighting===1){for(s.i=0;s.i<3;s.i++)if(g.monster[s.i]){const enemy=rt.byId(g.monsterinstance[s.i]);if(enemy){
    g.hittarget[s.i]=0;enemy.fatal=1;g.hittarget[s.i]=0;const dm=rt.create(dmgWriter,g.monsterx[s.i],g.monstery[s.i]+20-g.hittarget[s.i]*20);s.dm=dm.id;dm.damage=s.damage+round(rt.random.random(100));dm.type=6;oflashOf(rt.byId(s.fb)!,rt);
   }}}
   if(ge(s.timer,120))s.bgalpha-=.005;
   if(eq(s.timer,270)){const enemy=rt.first(object('obj_berdlyb2_enemy'))!;enemy.sidebcon=1;enemy.fn=s.fn;enemy.fb=s.fb;rt.destroy(s);}
  },
 }};
 // Only the frozen battle prop is used here; overworld interaction is outside the battle host.
 const sign:GmObjectDef={...object('obj_npc_sign'),events:{create:(s,rt)=>{Object.assign(s,{myinteract:0,mydialoguer:0,imageSpeed:0,setdepth:1,read:0,depthbonus:0,skip:0,extflag:0,doafter:0,docon:0});if(rt.globals.darkzone===1){s.imageXscale=2;s.imageYscale=2;}s.depth=-s.y;}}};
 const victory:GmObjectDef={...object('obj_noellevictory_example'),events:{
  create:(s,rt)=>{s.siner=0;s.orbsurface=rt.sourceSurfaces!.create(120,136);s.afactor=0;},
  draw:(s,rt)=>{
   Object.assign(s,{imageXscale:2,imageYscale:2,imageSpeed:.2,xoff:35,yoff:8,nxoff:35,nyoff:6});
   s.afactor=Math.sin(s.siner/24);s.siner++;if(s.afactor<-.2&&s.siner>=8)s.siner--;
   if(rt.globals.fighting===0)rt.destroy(s);
   const sf=rt.sourceSurfaces!;if(!sf.exists(s.orbsurface))s.orbsurface=sf.create(120,136);sf.target(s.orbsurface);sf.clear(0,1);
   const x=s.nxoff-s.xoff,y=s.nyoff-s.yoff;
   rt.drawSprite('spr_noelleb_orb',0,x,y,2,2,0,0xffffff,.6*s.afactor);
   s.snowangle=-20+s.siner/2;s.snowoff=s.siner/2;
   for(const d of [1,-1])rt.drawSprite('spr_noelleb_orb',2,x+d*s.snowoff,y+d*s.siner/2,2,2,d*s.snowangle,0xffffff,.5*s.afactor);
   rt.drawSprite(s.sprite,s.imageIndex,s.nxoff,s.nyoff,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
   rt.drawSprite('spr_noelleb_orb',1,x,y,2,2,0,0xff0000,.2*s.afactor);
   rt.drawBlendMode('add');rt.drawSprite('spr_noelleb_orb',1,x,y,2,2,0,0xff0000,.6*s.afactor);
   rt.drawBlendMode('normal');rt.drawBlendMode('subtract');rt.drawSprite('spr_noelleb_orb',3,x,y,2,2,0,0xffffff,1);
   rt.drawBlendMode('normal');sf.target(null);sf.draw(s.orbsurface,s.x-s.nxoff,s.y-s.nyoff);
  },
  cleanup:(s,rt)=>{if(rt.sourceSurfaces?.exists(s.orbsurface))rt.sourceSurfaces.free(s.orbsurface);},
 }};
 return [shake,flake,spell,sign,victory];
}
