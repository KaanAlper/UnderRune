// The battle HUD as the game draws it: obj_battlecontroller's Draw (bottom panel, menus, enemy and party lists),
// scr_charbox (party panels that rise for the character choosing), scr_selectionmatrix and obj_tensionbar.
// The menu contents come from the host's command state; positions, fonts, colours and sprites are the game's.
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {mergeColor} from './battle';

export type HudMenuKind='none'|'command'|'enemyTarget'|'act'|'spell'|'item'|'allyTarget';
export interface HudChoice{name:string;disabled?:boolean;cost?:number;desc?:string;
 /** Partners an ACT needs, drawn as head icons before its name (actactor 2/3/4). */
 partners?:('susie'|'ralsei')[];partnerDown?:boolean;
 /** Pacify glows when a foe is TIRED. */
 glow?:boolean}
export interface HudEnemy{name:string;hp:number;maxhp:number;tired:boolean;spareable:boolean;comment?:string;instance?:GmInstance}
export interface HudState{
 readonly party:readonly number[];
 /** Which party slot chooses now (-1 when nobody does), and whether menus are open (global.myfight == 0). */
 readonly charturn:number;readonly choosing:boolean;
 readonly menu:HudMenuKind;readonly cursor:number;readonly choices:readonly HudChoice[];
 readonly enemies:readonly HudEnemy[];
 /** 0 while the box slides in, 2 when it slides away after victory. */
 readonly faceaction:(slot:number)=>number;
 readonly heroInstance:(slot:number)=>GmInstance|undefined;
}
const HP_COLORS=[C.aqua,0xff00ff,C.lime];
const HEADS=['spr_headkris','spr_headsusie','spr_headralsei'],NAMES=['spr_bnamekris','spr_bnamesusie','spr_bnameralsei'];
const BCOLOR=mergeColor(mergeColor(C.purple,C.black,0.7),0x404040,0.5);
const CHARNAMES=['','Kris','Susie','Ralsei'];

/** Call from the battle controller's Draw (depth 5): writers, the soul and bullets draw above it, the scene below. */
export function drawBattleHud(s:GmInstance,rt:GmRuntime,h:HudState){
 const g=rt.globals,xx=rt.view.x,yy=rt.view.y,d=rt.drawState;
 s.bpy??=152;s.bp??=0;s.intro??=1;s.mmy??=[0,0,0];s.s_siner??=0;
 if(s.intro===1){if(s.bp<s.bpy-1){if(s.bpy-s.bp<40)s.bp+=Math.round((s.bpy-s.bp)/2.5);else s.bp+=30;}else s.bp=s.bpy;if(s.bp===s.bpy)s.intro=0;}
 if(s.intro===2){if(s.bp>0){if(Math.round((s.bpy-s.bp)/5)>15)s.bp-=Math.round((s.bpy-s.bp)/2.5);else s.bp-=30;}else s.bp=0;}
 const bp=s.bp,bpoff=-bp+s.bpy+yy;
 d.alpha=1;d.color=C.black;rt.drawRect(xx-10,481+yy,xx+700,480-bp+yy);
 d.color=BCOLOR;rt.drawRect(xx-10,480-bp-2+yy,xx+700,480-bp+yy);rt.drawRect(xx-10,480-bp+34+yy,xx+700,480-bp+36+yy);
 charBoxes(s,rt,h,bp,bpoff);
 if(!h.choosing)return;
 d.font='fnt_mainbig';d.halign=0;d.valign=0;
 const text=(x:number,y:number,str:string,color:number)=>{d.color=color;rt.drawText(x,y,str.replace(/#/g,'\n'));};
 const heart=(x:number,y:number)=>rt.drawSprite('spr_heart',0,x,y);
 const flash=(i:GmInstance|undefined)=>{if(i&&i.live){if(i.flash===0)i.fsiner=0;i.flash=1;i.becomeflash=1;}};
 const grid=(c:number,colx:number)=>({x:xx+(c%2===1?colx:10),y:yy+(c>3?445:c>1?415:385)});
 if(h.menu==='enemyTarget'){
  heart(xx+55,yy+385+h.cursor*30);
  h.enemies.forEach((e,i)=>{
   flash(h.enemies[h.cursor]?.instance);
   d.font='fnt_mainbig';const w=nameWidth(e.name);
   const aq=mergeColor(C.aqua,0xff0000,0.3);let color=C.white;
   if(e.tired){color=aq;rt.drawSprite('spr_tiredmark',0,xx+80+w+40,yy+385+i*30);}
   if(e.spareable){color=C.yellow;rt.drawSprite('spr_sparestar',0,xx+80+w+20,yy+385+i*30);}
   text(xx+80,yy+375+i*30,e.name,color);
   if(e.comment)text(xx+80+w+60,yy+375+i*30,e.comment,C.gray);
   d.color=0x000080;rt.drawRect(xx+510,yy+380+i*30,xx+590,yy+380+i*30+15);
   d.color=C.lime;rt.drawRect(xx+510,yy+380+i*30,xx+510+e.hp/e.maxhp*80,yy+380+i*30+15);
  });
 }
 if(h.menu==='act'){
  const c=grid(h.cursor,240);heart(c.x,c.y);
  h.choices.forEach((ch,i)=>{
   const xo=i%2===1?230:0,yo=i>3?60:i>1?30:0;
   let off=ch.partners?.length?36:0;if((ch.partners?.length??0)>1)off=Math.round(off*1.8);
   const blend=ch.partnerDown?C.gray:C.white;
   ch.partners?.forEach((p,k)=>rt.drawSprite(p==='susie'?'spr_headsusie':'spr_headralsei',0,xx+30+k*30+xo,yy+375+yo,1,1,0,blend,1));
   text(xx+30+off+xo,yy+375+yo,ch.name,ch.disabled?C.gray:C.white);
  });
  flash(h.enemies[0]?.instance);
  const sel=h.choices[h.cursor];
  if(sel?.desc)text(xx+500,yy+375,sel.desc,C.gray);
  if(g.tensionselect>0&&sel?.cost)text(xx+500,yy+440,`${Math.round(sel.cost/g.maxtension*100)}% TP`,0x40a0ff);
 }
 if(h.menu==='spell'||h.menu==='item'){
  const c=grid(h.cursor,230);heart(c.x,c.y);
  h.choices.forEach((ch,i)=>{
   const color=ch.disabled?C.gray:ch.glow?mergeColor(C.aqua,0xff0000,0.3):C.white;
   text(xx+(i%2===1?260:30),yy+375+Math.floor(i/2)*30,ch.name,color);
  });
  const sel=h.choices[h.cursor];
  if(sel?.desc)text(xx+500,yy+375,sel.desc,C.gray);
  if(h.menu==='spell'&&sel?.cost!==undefined)text(xx+500,yy+440,`${Math.round(sel.cost/g.maxtension*100)}% TP`,0x40a0ff);
 }
 if(h.menu==='allyTarget'){
  heart(xx+55,yy+385+h.cursor*30);flash(h.heroInstance(h.cursor));
  h.party.forEach((id,i)=>{
   text(xx+80,yy+375+i*30,CHARNAMES[id],C.white);
   d.color=0x000080;rt.drawRect(xx+400,yy+380+i*30,xx+500,yy+380+i*30+15);
   d.color=C.lime;rt.drawRect(xx+400,yy+380+i*30,xx+400+g.hp[id]/g.maxhp[id]*100,yy+380+i*30+15);
  });
 }
 d.color=C.white;
}
let measure:((s:string)=>number)|undefined;
/** string_width in fnt_mainbig, supplied by the host renderer; 16 px per character otherwise. */
export function setHudMeasure(fn:(s:string)=>number){measure=fn;}
const nameWidth=(s:string)=>measure?measure(s):s.length*16;

function charBoxes(s:GmInstance,rt:GmRuntime,h:HudState,bp:number,bpoff:number){
 const g=rt.globals,xx=rt.view.x,yy=rt.view.y,d=rt.drawState,total=h.party.length;
 for(let c=0;c<3;c++){
  const slot=h.party.indexOf(c+1);if(slot<0)continue;
  const charcolor=HP_COLORS[c];
  const xchunk=total===3?slot*212:total===2?[106,326][slot]:212;
  if(h.charturn===slot){
   if(h.choosing)selectionMatrix(s,rt,charcolor,xx+xchunk,480-bp+yy);
   if(s.mmy[c]>-32)s.mmy[c]-=2;if(s.mmy[c]>-24)s.mmy[c]-=4;if(s.mmy[c]>-16)s.mmy[c]-=6;if(s.mmy[c]>-8)s.mmy[c]-=8;if(s.mmy[c]<-32)s.mmy[c]=-64;
  }else if(s.mmy[c]<-14)s.mmy[c]+=15;else s.mmy[c]=0;
  const mmy=s.mmy[c],btc=[0,0,0,0,0];if(h.charturn===slot&&h.menu==='command')btc[h.cursor]=1;
  const spareGlow=h.enemies.some(e=>e.spareable),pacifyGlow=c===2&&h.enemies.some(e=>e.tired)&&g.tension>=40&&g.encounterno!==31;
  const by=485-bp+yy;
  rt.drawSprite('spr_btfight',btc[0],xx+xchunk+15,by);
  rt.drawSprite(c===0?'spr_btact':'spr_bttech',btc[1],xx+xchunk+50,by);
  rt.drawSprite('spr_btitem',btc[2],xx+xchunk+85,by);
  rt.drawSprite('spr_btspare',btc[3],xx+xchunk+120,by);
  rt.drawSprite('spr_btdefend',btc[4],xx+xchunk+155,by);
  const glow=0.4+Math.sin((g.time??rt.frame)/6)*0.4;
  if(spareGlow&&h.charturn===slot)rt.drawSprite('spr_btspare',2,xx+xchunk+120,by,1,1,0,C.white,glow);
  if(pacifyGlow&&h.charturn===slot)rt.drawSprite('spr_bttech',2,xx+xchunk+50,by,1,1,0,C.white,glow);
  d.color=h.charturn===slot?charcolor:BCOLOR;
  rt.drawRect(xx+xchunk,480-bp-2+yy+mmy,xx+xchunk+212,480-bp+yy);
  d.color=C.black;rt.drawRect(xx+xchunk+2,480-bp+yy+mmy,xx+xchunk+210,480-bp+yy+mmy+33);
  const bo=336;
  rt.drawSprite(HEADS[c],h.faceaction(slot),xx+13+xchunk,bpoff+bo+mmy);
  rt.drawSprite(NAMES[c],0,xx+51+xchunk,bpoff+bo+3+mmy);
  rt.drawSprite('spr_hpname',0,xx+109+xchunk,bpoff+bo+11+mmy);
  const hp=g.hp[c+1],max=g.maxhp[c+1];
  d.font='hpfont';d.color=hp<=0?C.red:hp/max<=0.25?C.yellow:C.white;d.halign=2;
  rt.drawText(xx+160+xchunk,bpoff+bo-2+mmy,String(hp));
  rt.drawSprite('spr_hpslash',0,xx+159+xchunk,bpoff+bo-4+mmy);
  d.color=C.white;rt.drawText(xx+205+xchunk,bpoff+bo-2+mmy,String(max));d.halign=0;
  d.color=0x000080;rt.drawRect(xx+128+xchunk,bpoff+bo+11+mmy,xx+203+xchunk,bpoff+bo+19+mmy);
  if(hp>0&&max>0){d.color=charcolor;rt.drawRect(xx+128+xchunk,bpoff+bo+11+mmy,xx+xchunk+128+Math.ceil(hp/max*75),bpoff+bo+19+mmy);}
 }
}
/** scr_selectionmatrix: the coloured frame with pulsing lines around the panel of whoever is choosing. */
function selectionMatrix(s:GmInstance,rt:GmRuntime,color:number,x:number,y:number){
 const d=rt.drawState;s.s_siner+=2;d.color=color;d.alpha=1;rt.drawRect(x,y,x+210,y+3);
 for(let i=0;i<12;i++){
  const m=s.s_siner+i*(10*Math.PI);d.alpha=Math.sin(m/60);
  rt.drawLine(x,y,x,y+33,2);rt.drawLine(x+210,y,x+210,y+33,2);
  if(Math.cos(m/60)<0){const o=Math.sin(m/60)*30;rt.drawLine(x-o+30,y,x-o+30,y+33,2);rt.drawLine(x+210+o-30,y,x+210+o-30,y+33,2);}
 }
 d.alpha=1;
}

/** obj_tensionbar: slides in from the left; the TP percentage in fnt_mainbig and a fill that eases toward TP. */
export const tensionBar:GmObjectDef={name:'obj_tensionbar',index:333,depth:1,sprite:'spr_tensionbar',events:{
 create:(s,rt)=>{
  const g=rt.globals;s.tsiner=0;g.tensionselect=0;s.apparent=g.tension;s.current=g.tension;s.change=0;s.changetimer=15;s.red=0;s.redtimer=0;
  s.y=rt.view.y+40;s.x=rt.view.x-40;s.hspeed=13;s.friction=1;s.flashsiner=0;
 },
 draw:(s,rt)=>{
  const g=rt.globals,d=rt.drawState,max=g.maxtension,sh=196,sw=25;
  rt.drawSprite('spr_tplogo',0,s.x-30,s.y+30);rt.drawSprite('spr_tensionbar',1,s.x,s.y);
  d.color=C.white;d.font='fnt_mainbig';d.halign=0;s.flashsiner+=1;
  const tamt=Math.floor(s.apparent/max*100);let maxed=0;
  if(tamt<100){rt.drawText(s.x-30,s.y+70,String(Math.floor(s.apparent/max*100)));rt.drawText(s.x-25,s.y+95,'%');}
  else{maxed=1;d.color=C.yellow;rt.drawText(s.x-28,s.y+70,'M');rt.drawText(s.x-24,s.y+90,'A');rt.drawText(s.x-20,s.y+110,'X');}
  if(Math.abs(s.apparent-g.tension)<20)s.apparent=g.tension;
  if(s.apparent<g.tension)s.apparent+=20;
  if(s.apparent>g.tension)s.apparent-=20;
  if(s.apparent!==s.current){
   s.changetimer+=1;
   if(s.changetimer>15){
    const diff=s.apparent-s.current;
    if(diff>0)s.current+=2;if(diff>10)s.current+=2;if(diff>25)s.current+=3;if(diff>50)s.current+=4;if(diff>100)s.current+=5;
    if(diff<0)s.current-=2;if(diff<-10)s.current-=2;if(diff<-25)s.current-=3;if(diff<-50)s.current-=4;if(diff<-100)s.current-=5;
    if(Math.abs(s.apparent-s.current)<3)s.current=s.apparent;
   }
  }
  const fill=(v:number,color:number)=>{d.color=color;rt.drawRect(s.x+3,s.y+sh-1,s.x+sw-1,s.y+sh-v/max*sh);};
  const orange=maxed===1?mergeColor(C.yellow,0x40a0ff,0.5):0x40a0ff;
  if(s.current>0){
   if(s.apparent<s.current){fill(s.current,C.red);fill(s.apparent,0x40a0ff);}
   if(s.apparent>s.current){fill(s.apparent,C.white);fill(s.current,orange);}
   if(s.apparent===s.current)fill(s.current,orange);
  }
  if(g.tensionselect>0){
   s.tsiner+=1;d.color=C.white;d.alpha=Math.abs(Math.sin(s.tsiner/8)*0.5)+0.2;
   const t1=s.y+sh-s.current/max*sh;let t2=t1+g.tensionselect/max*sh;
   if(t2>s.y+sh-1){t2=s.y+sh-1;d.color=0x404040;d.alpha=0.7;}
   rt.drawRect(s.x+3,t2,s.x+sw-1,t1);d.alpha=1;
  }
  if(s.apparent>20&&s.apparent<max)rt.drawSprite('spr_tensionmarker',0,s.x+3,s.y+sh-s.current/max*sh);
  rt.drawSprite('spr_tensionbar',0,s.x,s.y);
 },
}};
