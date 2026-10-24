// Native Dojo room presentation: the source room places obj_dojofx at (320, 0), before battle.
import {gmArray,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {darkMarker} from '../../deltarune/battle';
import {makeColorHsv} from '../../gm/graphics';
import {lt,gt,ge} from '../../gm/math';
type Objects=(name:string)=>GmObjectDef;
const requireInstance=(rt:GmRuntime,id:number)=>{const i=rt.byId(id);if(!i)throw Error(`Dojo presentation requires marker ${id}`);return i;};
export function createDojoPresentation(object:Objects):GmObjectDef[]{
 return [{...object('obj_dojofx'),events:{
  create:(s,rt)=>{s.siner=0;s.inbattle=0;const ball=darkMarker(rt,s,s.x,s.y,'spr_dojo_discoball');s.ball=ball.id;ball.depth=5000;ball.x=rt.room.width/2;ball.y=0;ball.imageSpeed=.18;s.ballback=darkMarker(rt,s,s.x,s.y,'spr_dojo_discoball_back').id;s.drawalpha=1;s.depth=1100000;s.bsiner=0;rt.create(object('obj_dojofx_front'),0,0);},
  draw:(s,rt)=>{
   const ball=requireInstance(rt,s.ball),back=requireInstance(rt,s.ballback),g=rt.globals;
   if(g.mnfight>0&&g.fighting===1){if(ge(ball.y,-200))ball.vspeed-=1;else ball.vspeed=0;}else if(lt(ball.y,-10))ball.y+=(0-ball.y)*.5;
   if(g.fighting)for(const b of rt.withInstances(object('obj_battleback')))b.bgtype=1;
   s.siner++;const color=makeColorHsv((s.siner/4)%256,255,220+Math.sin(s.siner/15)*30),d=rt.drawState;d.color=color;back.imageBlend=color;back.x=ball.x;back.y=ball.y;back.depth=6000;d.alpha=.5;
   for(s.i=0;s.i<16;s.i++){s.sino=Math.sin(s.i/2+s.siner/48);rt.drawCircle(ball.x+s.sino*200,ball.y+60+Math.sin(s.i/4)*20,16+Math.abs(s.sino)*12);}
   rt.drawTriangleColor(s.x,s.y+80,s.x-80,s.y+200,s.x+80,s.y+200,0xffffff,0,0);d.alpha=1;s.bsiner++;if(s.bsiner>=80)s.bsiner-=80;
   for(s.i=0;s.i<12;s.i++){rt.drawSprite('spr_cc_boombox',s.siner/8,4,-240+s.y+s.i*80-s.bsiner,2,2,0,color,s.imageAlpha);rt.drawSprite('spr_cc_boombox',s.siner/8,570,-240+s.y+s.i*80+s.bsiner,2,2,0,color,s.imageAlpha);}
  },
 }},{...object('obj_dojofx_front'),events:{
  create:s=>{s.depth=100;s.alpha=[];s.exists=[];s.width=[];s.myx=[];s.myy=[];for(s.i=0;s.i<6;s.i++){s.alpha[s.i]=0;s.exists[s.i]=0;s.width[s.i]=20;s.myx[s.i]=0;s.myy[s.i]=0;}s.init=0;s.depth=202;},
  draw:(s,rt)=>{
   const g=rt.globals;
   if(g.fighting===1){
    if(lt(s.imageAlpha,1))s.imageAlpha+=.02;
    const instances=gmArray<number>(s,'instance');
    for(s.i=0;s.i<6;s.i++){
     s.myy[s.i]=0;s.exists[s.i]=0;
     if(s.i<=2&&g.char[s.i]!==0){const h=rt.byId(g.charinstance[s.i]);if(h){s.exists[s.i]=1;instances[s.i]=h.id;s.width[s.i]=80;s.myy[s.i]=h.y+(rt.bank.get(h.idlesprite)?.height??0)*2;s.myx[s.i]=h.x+20;if(g.char[s.i]===2)s.myx[s.i]+=15;if(g.char[s.i]===3)s.myx[s.i]+=15;}}
     if(s.i>=3&&s.i<=6){const m=rt.byId(g.monsterinstance[s.i-3]);if(m)s.exists[s.i]=1;if(s.exists[s.i]){if(!m)throw Error('Dojo enemy spotlight owner disappeared');instances[s.i]=m.id;s.myx[s.i]=m.x+rt.spriteWidth(m)/2;s.myy[s.i]=m.y+rt.spriteHeight(m);s.width[s.i]=rt.spriteWidth(m);}}
     if(s.exists[s.i]&&rt.byId(instances[s.i])){
      if([90,91,92,93,94].includes(g.encounterno)&&s.i>2)continue;
      rt.drawSpritePos('spr_whitegradientdown_40',0,s.myx[s.i],s.myy[s.i]-280,s.myx[s.i],s.myy[s.i]-280,s.myx[s.i]-s.width[s.i]/2+2,s.myy[s.i]-2,s.myx[s.i]+s.width[s.i]/2,s.myy[s.i]-2,.25);
      rt.drawState.color=0x808080;rt.drawEllipse(s.myx[s.i]-s.width[s.i]/2,s.myy[s.i]+4,s.myx[s.i]+s.width[s.i]/2,s.myy[s.i]-10);
     }
    }
    rt.drawState.alpha=1;
   }else if(gt(s.imageAlpha,0))s.imageAlpha-=.02;
  },
 }}];
}
