// Chapter 2 command selection. It delegates consumption and turn changes to the shared controller.
import {gmArray,type GmInstance,type GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {heroParent,tensionHeal} from './battle';
import {round} from '../gm/math';
import {writer} from './writer';
import {healAnim,spellPhase} from './party';
import {actSelectChapter2,actorActs} from './chapter2';
import {actInfo2} from './controller-chapter2';
import {withHook} from './rules';
import {button1_p,button2_p,left_p,right_p,up_p,down_p,commandMenu,writerDepth,spellInfo,spellConsume,itemInfo,itemConsume,itemShiftTemp,nextHero,mnEndTurn,monsterPop,winCombat} from './controller';

/** Two columns, source caller fields and the original navigation order. */
function navigate(s:GmInstance,rt:GmRuntime,field:string,menu:number,values:number[],act=false){
 const g=rt.globals,t=g.charturn,coord=g.bmenucoord[menu],cur=()=>coord[t] as number;
 if(right_p(rt)||(!act&&left_p(rt))){
  s.cango=1;s[field]=cur();const v=s[field];
  if(v<(act?5:11)){if(values[cur()+1]===0){s.cango=0;if(v%2===1&&v>0)coord[t]-=1;}}
  else{coord[t]-=1;s.cango=0;}
  if(s.cango===1)coord[t]+=v%2===0?1:-1;
 }
 if(act&&left_p(rt)){s.cango=1;s[field]=cur();if(s[field]%2===0){if(values[s[field]+1]!==0)coord[t]+=1;}else coord[t]-=1;}
 if(down_p(rt)){
  s[field]=cur();s.cango=1;const v=s[field];
  if(v>=(act?4:10))s.cango=0;
  else{if(values[v+2]===0)s.cango=0;if(!act&&v===5&&values[6]!==0&&values[7]===0)s.cango=2;}
  if(s.cango===1)coord[t]+=2;if(s.cango===2)coord[t]=6;
 }
 if(up_p(rt)){s[field]=cur();s.cango=1;if(s[field]<=1)s.cango=0;if(s.cango===1)coord[t]-=2;}
}
export function stepControllerMenus2(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,t=()=>g.charturn as number,coord=g.bmenucoord;
 commandMenu(s,rt);
 if(g.bmenuno===2){
  writerDepth(s,rt,10,true);const merged=g.flag[34]===0;s.thischar=merged?t():g.char[t()];
  const sp=merged?g.battlespell[s.thischar]:g.spell[s.thischar],cost=merged?g.battlespellcost[s.thischar]:g.spellcost[s.thischar];
  navigate(s,rt,'spellcoord',2,sp);g.tensionselect=cost[coord[2][t()]];
  if(button1_p(rt)&&sp[coord[2][t()]]!==0&&s.onebuffer<0&&cost[coord[2][t()]]<=g.tension){
   s.onebuffer=2;g.bmenuno=0;s.selnoise=1;
   if(merged&&sp[coord[2][t()]]===-1)g.bmenuno=13;
   else{spellInfo(s,rt,sp[coord[2][t()]]);if(s.spelltarget===0)spellConsume(s,rt);if(s.spelltarget===1)g.bmenuno=8;if(s.spelltarget===2)g.bmenuno=3;if(merged&&s.spelltarget===3)g.bmenuno=99;}
  }
  if(button2_p(rt)&&s.onebuffer<0){g.tensionselect=0;s.twobuffer=1;g.bmenuno=0;s.movenoise=1;}
 }
 if(g.bmenuno===4){
  writerDepth(s,rt,10,true);const cur=()=>coord[4][t()] as number;
  if(s.tempitem[cur()][t()]===0)coord[4][t()]-=1;
  const items=s.tempitem.map((row:number[])=>row[t()]);
  // Items retain the Chapter 1 left-key rule; right/up/down use the same source grid as spells.
  navigateItems(s,rt,items);
  if(s.tempitem[cur()][t()]===0)coord[4][t()]-=1;
  if(button1_p(rt)&&s.tempitem[cur()][t()]!==0&&s.onebuffer<0){
   s.onebuffer=2;g.bmenuno=0;s.selnoise=1;itemInfo(s,s.tempitem[cur()][t()],rt);
   if(s.itemtarget===0||s.itemtarget===2){
    const item=s.tempitem[cur()][t()];
    if(item>=27&&item<=29&&!withHook(rt,'takesImmediateItem').some(([e,h])=>h(e,s,rt,item))){
     tensionHeal(rt,item===27?80:item===28?Math.ceil(g.maxtension/2):Math.ceil(g.maxtension));
     const host=g.onChapter2TensionItemSound as ((name:string,pitch:number,volume:number)=>void)|undefined;
     if(host)host('snd_cardrive',1.4,0.8);else if(rt.sourceAudio)rt.sourceAudio.effect('snd_cardrive',1.4,0.8);else rt.sound?.('snd_cardrive',1.4);
     const h=rt.byId(g.charinstance[t()]);if(h){h.ha=rt.create(healAnim,h.x,h.y).id;const a=rt.byId(h.ha)!;a.target=h.id;a.particlecolor=C.orange;}
     itemShiftTemp(s,cur(),t());nextHero(s,rt);
    }else itemConsume(s,rt);
   }
   if(s.itemtarget===1)g.bmenuno=7;
  }
  if(button2_p(rt)&&s.onebuffer<0){s.twobuffer=1;g.bmenuno=0;s.movenoise=1;}
 }
 if(g.bmenuno===9){
  s.thisenemy=coord[11][t()];actInfo2(s,rt,s.thisenemy);navigate(s,rt,'actcoord',9,s.canact,true);
  const cur=()=>coord[9][t()] as number;g.tensionselect=s.acttpcost[cur()];s.canpress=1;
  if(g.char[t()]===1){const actor=g.actactor[s.thisenemy][cur()];
   if((actor===2||actor===4)&&(s.havechar[1]===0||g.hp[2]<=0))s.canpress=0;
   if((actor===3||actor===4)&&(s.havechar[2]===0||g.hp[3]<=0))s.canpress=0;
   if(actor===5&&(s.havechar[3]===0||g.hp[4]<=0))s.canpress=0;
  }
  if(s.canpress===1&&button1_p(rt)&&g.canact[s.thisenemy][cur()]===1&&g.tension>=g.tensionselect&&s.onebuffer<0){
   s.onebuffer=2;g.bmenuno=0;s.selnoise=1;g.actingchoice[t()]=cur();g.tension-=s.acttpcost[cur()];g.tensionselect=0;
   actSelectChapter2(s,rt,s.thisenemy,cur());coord[9][t()]=0;nextHero(s,rt);
  }
  if(button2_p(rt)&&s.onebuffer<0){coord[9][t()]=0;g.tensionselect=0;s.twobuffer=1;g.bmenuno=11;s.movenoise=1;}
 }
 const target=()=>[7,1,8,3,11,12,13].includes(g.bmenuno);
 if(target()){
  writerDepth(s,rt,10,true);
  if(button2_p(rt)&&s.onebuffer<0){s.twobuffer=1;if([1,11,12].includes(g.bmenuno))g.bmenuno=0;if(g.bmenuno===7)g.bmenuno=4;if([8,3,13].includes(g.bmenuno))g.bmenuno=2;s.movenoise=1;}
  if(target()){
   const m=g.bmenuno;gmArray(s,'ht');for(s.i=0;s.i<3;s.i++)s.ht[s.i]=(m===7||m===8)?(g.char[s.i]>0?1:0):g.monster[s.i];
   const cur=()=>coord[g.bmenuno][t()] as number,set=(v:number)=>{coord[g.bmenuno][t()]=v;};
   if(cur()===2&&s.ht[2]===0)set(0);if(cur()===0&&s.ht[0]===0)set(1);if(cur()===1&&s.ht[1]===0)set(0);if(cur()===0&&s.ht[0]===0)set(2);
   const move=(order:number[])=>{for(const n of order)if(s.ht[n]===1){s.movenoise=1;set(n);return;}};
   if(down_p(rt)){if(cur()===0)move([1,2]);else if(cur()===1)move([2,0]);else if(cur()===2)move([0,1]);}
   if(up_p(rt)){if(cur()===0)move([2,1]);else if(cur()===1)move([0,2]);else if(cur()===2)move([1,0]);}
   if(button1_p(rt)&&s.onebuffer<0){
    s.onebuffer=1;s.selnoise=1;
    if(g.bmenuno===1){g.chartarget[t()]=cur();g.faceaction[t()]=1;g.charaction[t()]=1;nextHero(s,rt);}
    if(g.bmenuno===7){g.chartarget[t()]=cur();itemConsume(s,rt);for(const [e,h] of withHook(rt,'onCommandChosen'))h(e,s,rt,'item');}
    if(g.bmenuno===8||g.bmenuno===3){g.chartarget[t()]=cur();spellConsume(s,rt);}
    if(g.bmenuno===11){
     g.bmenuno=9;s.actcoord=coord[9][t()];s.thisenemy=coord[11][t()];const a=actorActs(rt,s.thisenemy);
     for(s.i=0;s.i<6;s.i++)if(a.can[s.actcoord]===0&&s.actcoord>0)coord[9][t()]-=1;
     s.onebuffer=1;
    }
    if(g.bmenuno===12){g.faceaction[t()]=10;g.chartarget[t()]=cur();g.charaction[t()]=2;g.charspecial[t()]=100;nextHero(s,rt);}
    if(g.bmenuno===13){
     s.onebuffer=2;g.bmenuno=0;s.selnoise=1;g.actingchoice[t()]=coord[2][t()];g.tension-=g.battlespellcost[s.thischar][coord[2][t()]];g.tensionselect=0;
     actInfo2(s,rt,coord[13][t()]);actSelectChapter2(s,rt,coord[13][t()],coord[2][t()]);nextHero(s,rt);
    }
   }
  }
 }
}
function navigateItems(s:GmInstance,rt:GmRuntime,items:number[]){
 const g=rt.globals,c=g.bmenucoord[4],t=g.charturn;
 if(right_p(rt)){s.cango=1;s.itemcoord=c[t];const v=s.itemcoord;if(v<11){if(items[c[t]+1]===0){s.cango=0;if(v%2===1&&v>0)c[t]-=1;}}else{c[t]-=1;s.cango=0;}if(s.cango===1)c[t]+=v%2===0?1:-1;}
 if(left_p(rt)){s.cango=1;s.itemcoord=c[t];if(items[1]!==0)c[t]+=s.itemcoord%2===0?1:-1;}
 if(down_p(rt)){s.itemcoord=c[t];s.cango=1;if(s.itemcoord>=10)s.cango=0;else{if(items[s.itemcoord+2]===0)s.cango=0;if(s.itemcoord===5&&items[6]!==0&&items[7]===0)s.cango=2;}if(s.cango===1)c[t]+=2;if(s.cango===2)c[t]=6;}
 if(up_p(rt)){s.itemcoord=c[t];s.cango=1;if(s.itemcoord<=1)s.cango=0;if(s.cango===1)c[t]-=2;}
}
/** Additional Chapter 2 states run after common buffers and enemy-turn timing. */
export function controllerTail2(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(g.myfight===3&&monsterPop(rt)===0&&!rt.exists(writer))winCombat(rt,s);
 if(g.myfight===5){
  s.myfightreturntimer--;if(s.myfightreturntimer<=0){
   mnEndTurn(s,rt);g.spelldelay=10;
   for(const h of rt.all(heroParent)){Object.assign(h,{attacktimer:0,imageIndex:0,index:0,itemed:0,acttimer:0,defendtimer:0,state:0,flash:0,siner:0,fsiner:0});h.alarm[4]=-1;}
   for(const p of rt.all(spellPhase)){const w=rt.byId(p.spellwriter);if(w)rt.destroy(w);rt.destroy(p);}
  }
 }
 if(g.charweapon[4]===13&&s.t_siner%6===0&&g.hp[4]>round(g.maxhp[4]/3))g.hp[4]--;
 s.t_siner++;
}
