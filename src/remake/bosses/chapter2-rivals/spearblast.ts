import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {bulletInit,collideBullet,regularBullet,growtangle,heart} from '../../deltarune/battle';
import {monsterPop} from '../../deltarune/controller';
import {lengthdirX,lengthdirY,pointDirection,gt,ge,lt} from '../../gm/math';
import {mergeColor} from '../../gm/graphics';
import {snd} from '../../deltarune/sound';
import {rivalRoutePhase} from './berdly-rematch';
function bullet(s:GmInstance,rt:GmRuntime,def:GmObjectDef,x:number,y:number,child=false){
 const p=rt.create(def,x,y);
 if(child){for(const key of ['damage','grazepoints','timepoints','inv','target','grazed','grazetimer'])if(s[key]!==-1)p[key]=s[key];p.element=s.element;}
 else{p.damage=s.damage;p.target=s.target;if('element' in s)p.element=s.element;}
 return p;
}
export function createBerdlySpearblast(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const trail:GmObjectDef={...object('obj_berdlyb_spearblast_trail'),parent:collideBullet,events:{create:s=>bulletInit(s),animationEnd:(s,rt)=>rt.destroy(s)}};
 const mini:GmObjectDef={...object('obj_berdlyb_spearblast_mini'),parent:regularBullet,events:{
  create:(s,rt)=>{regularBullet.events!.create!(s,rt);s.alarm[0]=30;s.imageSpeed=0;s.imageXscale=.5;s.imageYscale=.5;s.depth++;},
  step:(s,rt)=>{regularBullet.events!.step!(s,rt);const b=rt.first(growtangle)!;if(gt(s.speed,1)&&(s.y<b.y-rt.spriteHeight(b)/2-40||s.y>b.y+rt.spriteHeight(b)/2+40))s.imageAlpha-=.1;if(s.imageAlpha<=0)rt.destroy(s);},
  alarm0:s=>{s.speed=.5;s.friction=-.4;},
 }};
 const projectile:GmObjectDef={...object('obj_berdlyb_spearblast_bullet'),parent:collideBullet,events:{
  create:(s,rt)=>{bulletInit(s);s.imageAlpha=1;if(!rt.exists(heart))rt.destroy(s);Object.assign(s,{wall_destroy:1,init:0,bulletPath:0,spawnrate:-1,spawntimer:0,spawnchild:0,timer:4,childOffset:rt.random.choose(90,-90)});},
  step:(s,rt)=>{
   if(s.init===0){rt.soundStop?.('snd_rocket');snd(rt,'snd_rocket');s.init=1;s.timer=2;rt.paths.start(s,s.bulletPath,21,0,false);}
   if(s.spawnrate>=0){if(s.spawntimer===s.spawnrate){const d=bullet(s,rt,trail,s.x,s.y,true);s.d=d.id;d.grazepoints=s.childgraze;d.imageAngle=s.direction;s.spawntimer=0;}else s.spawntimer++;}
   if(s.spawnchild>=1){s.timer--;if(s.timer<=0)for(s.i=0;s.i<s.spawnchild;s.i++){const d=bullet(s,rt,mini,s.x,s.y,true);s.d=d.id;d.grazepoints=s.childgraze;d.direction=s.direction+s.childOffset;if(s.spawnchild===2){d.x+=lengthdirX(3,d.direction);d.y+=lengthdirY(3,d.direction);}d.imageAngle=s.direction+s.childOffset;d.updateimageangle=1;s.timer=2;if(s.i===0)s.childOffset*=-1;}}
   s.imageAngle=s.direction;
  },destroy:(s,rt)=>rt.paths.end(s),
 }};
 const owner:GmObjectDef={...object('obj_berdlyb_spearblast'),events:{
  create:(s,rt)=>{s.mypath=rt.paths.add();Object.assign(s,{init:false,damage:10,target:0,shootSpeed:1,timer:1,firedShots:0,bulletCount:10,progressLoop:0,pathLifetime:1,fadeSpeed:.2,special:0,grazepoints:4,childgraze:4,aim_at_player:false});snd(rt,'snd_spearappear');},
  step:(s,rt)=>{if(s.init)return;s.init=true;const path=s.mypath;rt.paths.setKind(path,1);rt.paths.setPrecision(path,4);rt.paths.setClosed(path,false);let relativeY=0;rt.paths.addPoint(path,s.x,s.y,100);rt.paths.addPoint(path,s.x-30,s.y,100);const boxy=rt.first(growtangle)!.y;
   for(s.i=1;s.i<5;s.i++){const x=s.x-150*s.i;
    if(s.aim_at_player&&monsterPop(rt)===1&&relativeY===0&&x-(rt.first(heart)!.x+10)<=150){relativeY=rt.random.randomRange(-80*s.i,80*s.i)+boxy;rt.paths.addPoint(path,x,relativeY,100);const h=rt.first(heart)!;relativeY=(h.y+10-relativeY)/Math.abs(h.x+10-x);}
    else if(s.aim_at_player&&monsterPop(rt)===1&&relativeY!==0){const h=rt.first(heart)!;relativeY=h.y+10+relativeY*Math.abs(h.x+10-x);rt.paths.addPoint(path,x,Math.max(boxy-80*s.i,Math.min(boxy+80*s.i,relativeY)),100);relativeY=0;}
    else rt.paths.addPoint(path,x,rt.random.randomRange(-80*s.i,80*s.i)+boxy,100);
   }
  },
  draw:(s,rt)=>{
   if(s.firedShots>=s.bulletCount)return;
   if(gt(s.progressLoop,s.pathLifetime+1)){
    if(ge(s.timer,s.shootSpeed)){
     if(s.firedShots===0){const f=bullet(s,rt,trail,s.x-21,s.y);f.imageAngle=180;f.depth-=2;}
     const d=bullet(s,rt,projectile,s.x,s.y);s.d=d.id;d.grazepoints=s.grazepoints;d.childgraze=s.childgraze;d.direction=pointDirection(s.x,s.y,rt.paths.getX(s.mypath,.02),rt.paths.getY(s.mypath,.02));s.timer=0;d.bulletPath=s.mypath;if(s.special>=1&&s.firedShots===1)d.spawnchild=s.special;s.firedShots++;
    }else s.timer++;return;
   }
   rt.drawState.alpha=lt(s.progressLoop,s.pathLifetime)?1:s.pathLifetime+1-s.progressLoop;s.loopStart=gt(s.progressLoop,1)?1:s.progressLoop;s.colorProgress=gt(s.progressLoop,1)?(gt(s.progressLoop,2)?1:s.progressLoop-1):0;
   s.i=s.loopStart;
   while(gt(s.i,0)){
    s.firstColor=mergeColor(0xffffff,0x0000ff,s.colorProgress);if(lt(s.colorProgress,1))s.colorProgress+=.05;s.secondColor=mergeColor(0xffffff,0x0000ff,s.colorProgress);
    s.x1=rt.paths.getX(s.mypath,s.i);s.y1=rt.paths.getY(s.mypath,s.i);s.x2=rt.paths.getX(s.mypath,s.i-.0125);s.y2=rt.paths.getY(s.mypath,s.i-.0125);
    // Host implements the source's two-color line without changing the global drawing color.
    const drawLine=(rt as GmRuntime&{drawLineColor?:(x1:number,y1:number,x2:number,y2:number,a:number,b:number)=>void}).drawLineColor;
    if(drawLine)drawLine.call(rt,s.x1,s.y1,s.x2,s.y2,s.firstColor,s.secondColor);else if(rt.gfx)throw Error('SpearBlast requires drawLineColor');
    s.i-=.0125;
   }
   s.progressLoop+=ge(s.progressLoop,s.pathLifetime)?s.fadeSpeed:.1;rt.drawState.alpha=1;
  },cleanup:(s,rt)=>{if(rt.paths.exists(s.mypath))rt.paths.delete(s.mypath);},roomEnd:(s,rt)=>{if(rt.paths.exists(s.mypath))rt.paths.delete(s.mypath);},
 }};
 const actor:GmObjectDef={...object('obj_berdlyb_spearblaster'),events:{
  create:(s,rt)=>{s.imageIndex=1;s.imageAlpha=1;s.creator=0;if(rivalRoutePhase(rt)>0)s.sprite='spr_berdlyb_super_jump_serious';s.con=0;s.loop=false;},
  step:(s,rt)=>{if(s.con===0&&ge(s.imageIndex,3.5)){rt.sourceAudio?.volume('snd_jump',1,0);snd(rt,'snd_jump');s.con=1;}if(s.con===1&&ge(s.imageIndex,9.5)){const a=snd(rt,'snd_bell',.6),b=snd(rt,'snd_bell',.8);if(a!==undefined)rt.sourceAudio?.volume(a,.5,0);if(b!==undefined)rt.sourceAudio?.volume(b,.5,0);s.con=2;}if(s.con===2&&ge(s.imageIndex,14.5)){snd(rt,'snd_criticalswing');s.con=3;}},
  animationEnd:(s,rt)=>{if(!s.loop){s.sprite=rivalRoutePhase(rt)>0?'spr_berdlyb_super_jump_loop_serious':'spr_berdlyb_super_jump_loop';s.loop=true;s.imageIndex=0;}},
  destroy:(s,rt)=>{rt.byId(rt.globals.monsterinstance[s.creator])!.visible=true;},
 }};
 return [trail,mini,projectile,owner,actor];
}
/** obj_dbulletcontroller's SpearBlast branch, after its shared prelude. */
export function runBerdlySpearblastController(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef):boolean{
 if(s.type!==9)return false;
 if(s.init===1){const actor=rt.create(object('obj_berdlyb_spearblaster'),s.x-18,s.y-114);s.berdly=actor.id;rt.byId(rt.globals.monsterinstance[s.creator])!.visible=false;actor.creator=s.creator;s.init=2;s.special=rt.random.choose(0,1);}
 if(gt(s.btimer,(s.difficulty>=1?50:30)*s.ratio)&&s.made<6){const d=rt.create(object('obj_berdlyb_spearblast'),s.x+24,s.y+30);s.d=d.id;Object.assign(d,{grazepoints:2,childgraze:1,timepoints:.5,damage:s.damage,target:s.target,pathLifetime:2});s.btimer=10;if(s.difficulty===2||s.made%2===s.special)d.aim_at_player=true;d.special=s.difficulty;s.made++;}
 return true;
}
