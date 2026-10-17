// Source helpers used by Queen's attack objects. These carry caller state and can be moved to the shared engine.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {dmgWriter} from '../../deltarune/battle';
import {heal,healAnim} from '../../deltarune/party';
import {snd} from '../../deltarune/sound';

export function getBoxBounds(s:GmInstance,rt:GmRuntime,box:GmObjectDef){
 const b=rt.first(box);if(b){s.minx=b.x-rt.spriteWidth(b)/2;s.maxx=b.x+rt.spriteWidth(b)/2;s.miny=b.y-rt.spriteHeight(b)/2;s.maxy=b.y+rt.spriteHeight(b)/2;}
 else{s.minx=999;s.maxx=999;s.miny=999;s.maxy=999;}
}
export function drawInBox(s:GmInstance,rt:GmRuntime,x:number,y:number,width:number,height:number){
 const sprite=s.sprite&&rt.bank.get(s.sprite);if(!sprite)throw Error(`Queen clipping needs sprite ${s.sprite}`);
 const left=x-width/2,top=y-height/2,xx=left-(s.x-sprite.originX)+1,yy=top-(s.y-sprite.originY)+1;
 rt.drawSpritePart(s.sprite!,s.imageIndex,xx,yy,width,height,left+1,top+1,Math.sign(s.imageXscale),Math.sign(s.imageYscale),s.imageBlend,s.imageAlpha);
}
export function drawInBulletBox(s:GmInstance,rt:GmRuntime,box:GmObjectDef){
 const b=rt.first(box);if(!b)throw Error('Queen clipping needs obj_growtangle');drawInBox(s,rt,b.x,b.y,rt.spriteWidth(b)-8,rt.spriteHeight(b)-8);
}
export function customAfterimage(s:GmInstance,rt:GmRuntime,object:GmObjectDef){
 const a=rt.create(object,s.x,s.y);s.afterimage=a.id;a.sprite=s.sprite;a.imageIndex=s.imageIndex;a.imageBlend=s.imageBlend;a.imageSpeed=0;a.depth=s.depth+1;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.imageAngle=s.imageAngle;return a;
}
export function randomTargetOld(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.abletotarget=1;if(g.charcantarget[0]===0&&g.charcantarget[1]===0&&g.charcantarget[2]===0)s.abletotarget=0;
 s.mytarget=rt.random.choose(0,1,2);if(s.abletotarget===1){while(g.charcantarget[s.mytarget]===0)s.mytarget=rt.random.choose(0,1,2);}else s.mytarget=3;g.targeted[s.mytarget]=1;
}
export function bulletHeal(s:GmInstance,rt:GmRuntime,amount:number){
 const g=rt.globals;
 for(const w of rt.withInstances(dmgWriter))if(w.delaytimer>=1)w.killactive=1;
 if(s.target===4){randomTargetOld(s,rt);s.target=s.mytarget;}
 if(s.target<3&&g.hp[g.char[s.target]]<=0){randomTargetOld(s,rt);s.target=s.mytarget;const h=rt.byId(g.charinstance[s.target]);if(h){h.imageBlend=0xffffff;h.darkify=0;}}
 heal(s,rt,s.target,amount);
 const h=rt.byId(g.charinstance[s.target]);if(h){
  const a=rt.create(healAnim,h.x,h.y);h.ha=a.id;a.target=h.id;const w=rt.create(dmgWriter,h.x,h.y+h.myheight-24-h.tu*20);h.dmgwr=w.id;w.delay=8;w.type=3;w.damage=amount;
  if(g.hp[g.char[h.myself]]>=g.maxhp[g.char[h.myself]])w.specialmessage=3;h.tu++;
 }
 rt.soundStop?.('snd_power');snd(rt,'snd_power');
}
export function healAll(s:GmInstance,rt:GmRuntime,amount:number){for(s.i=0;s.i<3;s.i++)if(rt.globals.char[s.i]!==0)heal(s,rt,s.i,amount);}
