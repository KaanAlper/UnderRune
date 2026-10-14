// Chapter 2's HUD/menu rendering part. Turn progression, heroes and damage stay in the shared controller.
import {gmArray,type GmInstance,type GmRuntime} from '../gm/runtime';
import {C,mergeColor} from '../gm/graphics';
import {round} from '../gm/math';
import {actorActs} from './chapter2';
import {withHook} from './rules';
import {sourceText} from '../host/text';

const nl=(v:unknown)=>String(v).replace(/#/g,'\n');
const heads=['spr_headkris','spr_headsusie','spr_headralsei','spr_headnoelle'];
const names=['spr_bnamekris','spr_bnamesusie','spr_bnameralsei','spr_bnamenoelle'];
const flash=(i:GmInstance|undefined)=>{if(i){if(i.flash===0)i.fsiner=0;i.flash=1;i.becomeflash=1;}};
function pacifyGlow(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.pacify_glow=0;
 for(s.sglowi=0;s.sglowi<3;s.sglowi++)if(g.monster[s.sglowi]===1&&g.monsterstatus[s.sglowi]===1&&!withHook(rt,'suppressesPacifyHighlight').some(([e,h])=>h(e,rt)))s.pacify_glow=1;
}
function selectionMatrix(s:GmInstance,rt:GmRuntime,x:number,y:number){
 const d=rt.drawState;s.slmxx=x;s.slmyy=y;s.s_siner+=2;d.color=s.charcolor;rt.drawRect(x,y,x+210,y+3);
 for(s.i=0;s.i<12;s.i++){
  s.myxx=s.s_siner+s.i*(10*Math.PI);d.alpha=Math.sin(s.myxx/60);
  rt.drawLine(x,y-3,x,y+33,2);rt.drawLine(x+211,y-3,x+211,y+33,2);
  if(Math.cos(s.myxx/60)<0){const o=Math.sin(s.myxx/60)*30;rt.drawLine(x-o+30,y,x-o+30,y+33,2);rt.drawLine(x+210+o-30,y,x+210+o-30,y+33,2);}
 }d.alpha=1;
}
function charBox(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,d=rt.drawState;
 for(s.c=0;s.c<4;s.c++){
  if(s.havechar[s.c]!==1)continue;
  const c=s.c;s.charcolor=s.hpcolor[c];s.gc=g.charturn;s.xchunk=0;
  const pos=s.charpos[c];
  if(s.chartotal===3)s.xchunk=[0,213,426][pos]??0;
  if(s.chartotal===2)s.xchunk=[108,322][pos]??0;
  if(s.chartotal===1&&pos===0)s.xchunk=213;
  if(s.gc===pos){
   if(g.myfight===0)selectionMatrix(s,rt,s.xx+s.xchunk,480-s.bp+s.yy);
   if(s.mmy[c]>-32)s.mmy[c]-=2;if(s.mmy[c]>-24)s.mmy[c]-=4;if(s.mmy[c]>-16)s.mmy[c]-=6;if(s.mmy[c]>-8)s.mmy[c]-=8;if(s.mmy[c]<-32)s.mmy[c]=-64;
  }else if(s.mmy[c]<-14)s.mmy[c]+=15;else s.mmy[c]=0;
  s.btc=[0,0,0,0,0];if(s.gc===pos)s.btc[g.bmenucoord[0][g.charturn]]=1;
  const x=s.xx+s.xchunk,y=480-s.bp+s.yy;
  if(g.fighting===1){
   s.spare_glow=0;for(s.sglowi=0;s.sglowi<3;s.sglowi++)if(g.monster[s.sglowi]===1&&g.mercymod[s.sglowi]>=100)s.spare_glow=1;
   s.pacify_glow=0;
   if(c===2||c===3){pacifyGlow(s,rt);if(g.tension<(c===3?80:40))s.pacify_glow=0;}
   rt.drawSprite('spr_btfight',s.btc[0],x+20,y+5);rt.drawSprite(c===0?'spr_btact':'spr_bttech',s.btc[1],x+55,y+5);
   rt.drawSprite('spr_btitem',s.btc[2],x+90,y+5);rt.drawSprite('spr_btspare',s.btc[3],x+125,y+5);rt.drawSprite('spr_btdefend',s.btc[4],x+160,y+5);
   const glow=0.4+Math.sin(g.time/6)*0.4;
   if(s.spare_glow===1&&s.gc===pos)rt.drawSprite('spr_btspare',2,x+125,y+5,1,1,0,C.white,glow);
   if(s.pacify_glow===1&&s.gc===pos)rt.drawSprite('spr_bttech',2,x+55,y+5,1,1,0,C.white,glow);
  }
  d.color=s.gc===pos?s.charcolor:s.bcolor;if(g.charselect===pos||g.charselect===3)d.color=s.charcolor;
  rt.drawRect(x,y-3+s.mmy[c],x+212,y-2);d.color=C.black;rt.drawRect(x+2,y-1+s.mmy[c],x+210,y+s.mmy[c]+33);
  s.b_offset=g.fighting===1?336:g.fighting===0?430:480;
  const by=s.bpoff+s.b_offset+s.mmy[c];
  const overridden=withHook(rt,'drawPartyHead').some(([e,h])=>h(e,s,rt,c,x,by));
  if(!overridden){rt.drawSprite(heads[c],g.faceaction[pos],x+13,by);rt.drawSprite(names[c],0,x+51,by+3);}
  rt.drawSprite('spr_hpname',0,x+109,by+11);
  let hp=g.hp[c+1];const max=g.maxhp[c+1];for(const [e,h] of withHook(rt,'partyHudHp'))hp=h(e,rt,c,hp);
  d.color=C.white;d.font='hpfont';if(g.hp[c+1]/max<=0.25)d.color=C.yellow;if(g.hp[c+1]<=0)d.color=C.red;
  d.halign=2;rt.drawText(x+160,by-2,String(hp));rt.drawSprite('spr_hpslash',0,x+159,by-4);rt.drawText(x+205,by-2,String(max));d.halign=0;
  d.color=0x000080;rt.drawRect(x+128,by+11,x+203,by+19);
  if(g.hp[c+1]>0&&max>0){d.color=s.charcolor;rt.drawRect(x+128,by+11,x+128+Math.ceil(hp/max*75),by+19);}
 }
}
/** scr_actinfo_temp writes the calling controller's tables; Draw also fills names/descriptions. */
export function actInfo2(s:GmInstance,rt:GmRuntime,enemy:number,includeText=false){
 const a=actorActs(rt,enemy);
 for(const key of ['canact','acttpcost','actsimul',...(includeText?['actname','actdesc']:[])])gmArray(s,key);
 for(s.__acti=0;s.__acti<6;s.__acti++){
  const i=s.__acti;s.canact[i]=a.can[i];s.acttpcost[i]=a.cost[i];s.actsimul[i]=a.simul[i];
  if(includeText){s.actname[i]=a.name[i];s.actdesc[i]=a.desc[i];}
 }
}
function cursor(s:GmInstance,rt:GmRuntime,value:number,right=230){
 s.icx=[1,3,5].includes(value)?right:10;s.icy=value>3?445:value>1?415:385;
 rt.drawSprite('spr_heart',0,s.xx+s.icx,s.yy+s.icy);rt.drawState.font='fnt_mainbig';
}
export function drawController2(s:GmInstance,rt:GmRuntime,width:(text:string)=>number){
 const g=rt.globals,d=rt.drawState;
 if(g.lang==='ja')throw Error('Chapter 2 controller Japanese HUD is not ported');
 s.xx=rt.view.x;s.yy=rt.view.y;for(const [e,h] of withHook(rt,'controllerHudOffset'))s.yy+=h(e,s,rt);
 s.tpoff=s.tp-s.tpy+s.yy;s.bpoff=-s.bp+s.bpy+s.yy;
 if(s.intro===1){if(s.bp<s.bpy-1){if(s.bpy-s.bp<40)s.bp+=round((s.bpy-s.bp)/2.5);else s.bp+=30;}else s.bp=s.bpy;if(s.bp===s.bpy)s.intro=0;}
 if(s.intro===2){if(s.bp>0){if(round((s.bpy-s.bp)/5)>15)s.bp-=round((s.bpy-s.bp)/2.5);else s.bp-=30;}else s.bp=0;}
 d.alpha=1;d.color=C.black;rt.drawRect(s.xx-10,481+s.yy,s.xx+700,480-s.bp+s.yy-4);
 d.color=s.bcolor;rt.drawRect(s.xx-10,480-s.bp-3+s.yy,s.xx+700,480-s.bp-2+s.yy);rt.drawRect(s.xx-10,514-s.bp+s.yy,s.xx+700,516-s.bp+s.yy);
 charBox(s,rt);
 const text=(x:number,y:number,v:unknown,xscale=1,yscale=1)=>rt.drawText(s.xx+x,s.yy+y,nl(v),xscale,yscale);
 const m=g.bmenuno,t=g.charturn,coord=g.bmenucoord;
 if([1,3,11,12,13].includes(m)&&g.myfight===0){
  rt.drawSprite('spr_heart',0,s.xx+55,s.yy+385+coord[m][t]*30);d.font='fnt_mainbig';s.namewidthb=g.monstername.slice(0,3).map((n:string)=>width(nl(n)));
  let namewidthmax=0;for(s.i=0;s.i<3;s.i++)namewidthmax=Math.max(namewidthmax,s.namewidthb[s.i]);
  for(s.i=0;s.i<3;s.i++){
   const i=s.i;flash(rt.byId(g.monsterinstance[coord[m][t]]));if(g.monster[i]!==1)continue;
   d.color=C.white;s.mercydraw=0;s.tireddraw=0;s.mnamecolor1=C.white;s.mnamecolor2=C.white;s.aqcolor=mergeColor(C.aqua,0xff0000,0.3);
   if(g.monsterstatus[i]===1)s.tireddraw=1;if(g.mercymod[i]>=g.mercymax[i])s.mercydraw=1;s.namewidth=width(nl(g.monstername[i]));
   if(s.tireddraw===1){if(!withHook(rt,'suppressesPacifyHighlight').some(([e,h])=>h(e,rt))){d.color=s.aqcolor;s.mnamecolor1=s.aqcolor;s.mnamecolor2=s.aqcolor;}rt.drawSprite('spr_tiredmark',0,s.xx+80+s.namewidth+40,s.yy+385+i*30);}
   if(s.mercydraw===1){d.color=C.yellow;s.mnamecolor1=C.yellow;if(s.tireddraw===0)s.mnamecolor2=C.yellow;if(s.hidemercy===0)rt.drawSprite('spr_sparestar',0,s.xx+80+s.namewidth+20,s.yy+385+i*30);}
   rt.drawTextColor(s.xx+80,s.yy+375+i*30,nl(g.monstername[i]),s.mnamecolor1,s.mnamecolor2,1);
   if(m!==13){
    d.color=C.gray;text(80+s.namewidth+60,375+i*30,g.monstercomment[i]);d.color=0x000080;rt.drawRect(s.xx+420,s.yy+380+i*30,s.xx+500,s.yy+395+i*30);
    d.color=C.lime;rt.drawRect(s.xx+420,s.yy+380+i*30,s.xx+420+g.monsterhp[i]/g.monstermaxhp[i]*80,s.yy+395+i*30);
    d.color=C.white;text(424,364,sourceText('obj_battlecontroller_slash_Draw_0_gml_173_0'),1,0.5);text(424,380+i*30,Math.ceil(g.monsterhp[i]/g.monstermaxhp[i]*100)+'%',1,0.5);
   }else{
    const standard=sourceText('obj_battlecontroller_slash_Draw_0_gml_172_0');let act=actorActs(rt,i).name[coord[2][t]];
    if(['S-Action','R-Action','N-Action'].includes(act))act=standard;
    d.color=s.hpcolorsoft[g.char[t]-1];
    // These labels have no spaces in the accepted recordings; wrap longer labels at the source width.
    text(80+namewidthmax+60,375+i*30,wrap(act,514-(80+namewidthmax+60),width));
   }
   s.mercyamt=Math.min(g.mercymod[i],100);
   if(s.hidemercy===0){
    const percent=Math.min(Math.ceil(g.mercymod[i]/g.mercymax[i]*100),100);d.color=mergeColor(C.orange,C.red,0.5);rt.drawRect(s.xx+520,s.yy+380+i*30,s.xx+600,s.yy+395+i*30);
    d.color=C.yellow;if(s.mercyamt>0&&s.cantspare[i]===0)rt.drawRect(s.xx+520,s.yy+380+i*30,s.xx+520+percent*0.8,s.yy+395+i*30);
    d.color=C.white;text(524,364,sourceText('obj_battlecontroller_slash_Draw_0_gml_208_0'),1,0.5);d.color=0x000080;
    if(s.cantspare[i]===0)text(524,380+i*30,percent+'%',1,0.5);
    if(s.cantspare[i]===1){rt.drawLine(s.xx+519,s.yy+380+i*30,s.xx+600,s.yy+395+i*30,2);rt.drawLine(s.xx+519,s.yy+395+i*30,s.xx+600,s.yy+380+i*30,2);}
   }
  }
 }
 if(m===2&&g.myfight===0){
  const merged=g.flag[34]===0;s.thischar=merged?t:g.char[t];s.spellcoord=coord[2][t];s.page=0;if(s.spellcoord>5){s.page=1;s.spellcoord-=6;}
  cursor(s,rt,s.spellcoord);const ch=s.thischar,sp=merged?g.battlespell[ch]:g.spell[ch],cost=merged?g.battlespellcost[ch]:g.spellcost[ch],names=merged?g.battlespellname[ch]:g.spellnameb[ch],desc=merged?g.battlespelldesc[ch]:g.spelldescb[ch];
  for(s.i=0;s.i<3;s.i++)for(let n=0;n<2;n++){
   const index=s.page*6+s.i*2+n;d.color=C.white;if(merged&&g.battlespellspecial[ch][index]>=1)d.color=s.hpcolorsoft[g.char[ch]-1];
   if(g.tension<cost[index])d.color=C.gray;
   else if((merged||n===0)&&(sp[index]===3||sp[index]===8)){pacifyGlow(s,rt);if(s.pacify_glow===1)d.color=mergeColor(C.aqua,0xff0000,0.3);}
   text(30+n*230,375+s.i*30,names[index]);
  }
  d.color=C.gray;text(500,375,desc[s.page*6+s.spellcoord]);s.thiscost=round(cost[s.page*6+s.spellcoord]/g.maxtension*100);d.color=C.orange;if(!merged||s.thiscost>0)text(500,440,s.thiscost+'% TP');
 }
 if(m===4&&g.myfight===0){
  s.itemcoord=coord[4][t];s.page=0;if(s.itemcoord>5){s.page=1;s.itemcoord-=6;}cursor(s,rt,s.itemcoord);
  for(s.i=0;s.i<3;s.i++)for(let n=0;n<2;n++){const value=nl(s.tempitemnameb[s.page*6+s.i*2+n][t]);d.color=C.white;text(30+n*230,375+s.i*30,value,Math.min(1,200/width(value)));}
  if(s.page===0&&g.item[6]!==0)rt.drawSprite('spr_morearrow',0,s.xx+470,s.yy+445+Math.sin(s.s_siner/10)*2);
  if(s.page===1)rt.drawSprite('spr_morearrow',0,s.xx+470,s.yy+395-Math.sin(s.s_siner/10)*2,1,-1,0,C.white,1);
  d.color=C.gray;text(500,375,s.tempitemdescb[s.page*6+s.itemcoord][t]);
 }
 if(m===9&&g.myfight===0){
  s.actcoord=coord[9][t];actInfo2(s,rt,s.thisenemy,true);s.page=0;cursor(s,rt,s.actcoord);
  for(s.i=0;s.i<6;s.i++){
   const i=s.i;s.cant=0;s.chartime=g.char[t]===1?g.actactor[coord[11][t]][i]:0;s.charoffset=0;s.xoffset=i%2===1?230:0;s.yoffset=i>3?60:i>1?30:0;
   s.drawsus=0;s.drawral=0;s.drawnoe=0;s.susblend=C.white;s.ralblend=C.white;s.noeblend=C.white;
   if(s.chartime===2||s.chartime===4){s.drawsus=1;if(s.havechar[1]===0||g.hp[2]<=0){s.susblend=C.gray;s.cant=1;}s.charoffset=30;}
   if(s.chartime===3||s.chartime===4){s.drawral=1;if(s.havechar[2]===0||g.hp[3]<=0){s.ralblend=C.gray;s.cant=1;}s.charoffset=30;}
   if(s.chartime===5){s.drawnoe=1;if(s.havechar[3]===0||g.hp[4]<=0){s.noeblend=C.gray;s.cant=1;}s.charoffset=30;}
   if(g.tension<s.acttpcost[i])s.cant=1;if(s.chartime===4)s.charoffset*=2;d.color=s.cant===1?C.gray:C.white;
   const x=s.xx+30+s.xoffset,y=s.yy+375+s.yoffset;
   if(s.chartime===2||s.chartime===4)rt.drawSprite('spr_headsusie',0,x,y,1,1,0,s.susblend,1);
   if(s.chartime===3||s.chartime===4)rt.drawSprite('spr_headralsei',0,x+(s.chartime===4?30:0),y,1,1,0,s.susblend,1);
   if(s.chartime===5)rt.drawSprite('spr_headnoelle',0,x,y,1,1,0,s.noeblend,1);
   for(const [e,h] of withHook(rt,'drawActOverlay'))h(e,s,rt);
   const value=nl(s.actname[i]),scale=Math.max(0.5,Math.min(1,(206-s.charoffset)/Math.max(1,width(value))));text(30+s.charoffset+s.xoffset,375+s.yoffset,value,scale);
  }
  d.color=C.gray;text(500,375,s.actdesc[s.actcoord]);if(g.tensionselect>0){s.thiscost=round(s.acttpcost[s.actcoord]/g.maxtension*100);d.color=C.orange;text(500,440,s.thiscost+'% TP');}
  flash(rt.byId(g.monsterinstance[coord[11][t]]));
 }
 if((m===7||m===8)&&g.myfight===0){
  rt.drawSprite('spr_heart',0,s.xx+55,s.yy+385+coord[m][t]*30);d.font='fnt_mainbig';
  for(s.i=0;s.i<3;s.i++)if(g.char[s.i]!==0){
   const i=s.i;flash(rt.byId(g.charinstance[coord[m][t]]));d.color=C.white;text(80,375+i*30,g.charname[g.char[i]]);
   d.color=0x000080;rt.drawRect(s.xx+400,s.yy+380+i*30,s.xx+500,s.yy+395+i*30);d.color=C.lime;rt.drawRect(s.xx+400,s.yy+380+i*30,s.xx+400+g.hp[g.char[i]]/g.maxhp[g.char[i]]*100,s.yy+395+i*30);
  }
 }
 if(rt.input.held.has(65)&&g.flag[34]===0&&g.myfight===0&&[11,13,2].includes(g.bmenuno))throw Error('Chapter 2 A-held ACT preview is not ported');
 d.color=C.white;d.alpha=1;
}
function wrap(value:string,max:number,width:(text:string)=>number){
 let result='',line='';for(const word of nl(value).split(' ')){const next=line?line+' '+word:word;if(line&&width(next)>max){result+=line+'\n';line=word;}else line=next;}return result+line;
}
