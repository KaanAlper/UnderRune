// scr_damage_maxhp: a share of maximum HP, optional defend bypass and nonlethal clamp.
// Boss-specific targeting, armor cuts and knockout handling stay in BattleHooks.
import type {GmInstance,GmRuntime} from '../gm/runtime';
import {eq,ge,gt,le,lt,round} from '../gm/math';
import {C} from '../gm/graphics';
import {damageCalculation,damageCheck,dead,dmgWriter,elementReduction,gameOver,heart,partyHpAverage,randomTarget,shake} from './battle';
import {withHook} from './rules';

export function damageMaxHp(s:GmInstance,rt:GmRuntime,ratio=1,bypassDefend=false,nonlethal=false){
 const g=rt.globals;if(!lt(g.inv,0))return;
 const before=[0,1,2].map(i=>g.hp[g.char[i]]);g.damage_cache=[...before];
 const element='element' in s&&typeof s.element==='number'?s.element:0;
 const unshade=()=>{const h=rt.byId(g.charinstance[s.target]);if(h){h.imageBlend=C.white;h.darkify=0;}};
 if(lt(s.target,3)&&le(g.hp[g.char[s.target]],0)){randomTarget(s,rt);s.target=s.mytarget;unshade();}
 let remtarget=-1;
 if(eq(s.target,4)){
  remtarget=4;randomTarget(s,rt);s.target=s.mytarget;
  const share=()=>g.hp[g.char[s.target]]/g.maxhp[g.char[s.target]];
  if(lt(share(),partyHpAverage(rt)/2)){randomTarget(s,rt);s.target=s.mytarget;}
  if(lt(share(),partyHpAverage(rt)/2)){randomTarget(s,rt);s.target=s.mytarget;}
  if(eq(s.target,0)&&lt(share(),.35)){randomTarget(s,rt);s.target=s.mytarget;}unshade();
 }
 s.chartarget=3;
 for(const [e,h] of withHook(rt,'redirectsMaxHpHit'))h(e,s,rt);
 for(const [e,h] of withHook(rt,'scalesMaxHpRatio'))ratio=h(e,s,rt,ratio);
 s.chartarget=g.char[s.target];s.tdamage=Math.ceil(g.maxhp[s.chartarget]*ratio);
 if(eq(g.charaction[s.target],10)&&!bypassDefend)s.tdamage=Math.ceil(s.tdamage/1.5);
 if(nonlethal)s.tdamage=Math.min(Math.max(s.tdamage,1),g.hp[s.chartarget]-1);
 if(!rt.exists(shake))rt.create(shake,0,0);
 const hero=rt.byId(g.charinstance[s.target]);if(hero){hero.hurt=1;hero.hurttimer=0;}
 s.hpdiff=s.tdamage;
 for(const w of rt.withInstances(dmgWriter))if(ge(w.delaytimer,1))w.killactive=1;
 s.doomtype=-1;for(const h of rt.withInstances(heart))h.dmgnoise=1;
 if(lt(s.target,3)){
  const ct=s.chartarget;
  if(le(g.hp[ct],0)){s.doomtype=4;g.hp[ct]-=round(s.tdamage/4);s.hpdiff=round(s.tdamage/4);}
  else{
   g.hp[ct]-=s.tdamage;
   if(le(g.hp[ct],0)&&!withHook(rt,'catchesMaxHpKnockout').some(([e,h])=>h(e,s,rt))){
    s.hpdiff=Math.abs(g.hp[ct]-g.maxhp[ct]/2);s.doomtype=4;g.hp[ct]=round(-g.maxhp[ct]/2);dead(rt,s.target);
   }
  }
  const h=rt.byId(g.charinstance[s.target]);if(!h)throw Error('Maximum-HP damage needs its target hero');
  const w=rt.create(dmgWriter,h.x,h.y+h.myheight-24);s.dmgwriter=w.id;w.damage=s.hpdiff;w.type=s.doomtype;
 }
 if(eq(s.target,3))for(s.hpi=0;lt(s.hpi,3);s.hpi++){
  s.chartarget=g.char[s.hpi];const ct=s.chartarget;
  if(ge(g.hp[ct],0)){
   s.tdamage=damageCalculation(rt,s.tdamage,s.hpi);s.tdamage=Math.ceil(s.tdamage*elementReduction(rt,element,ct));
   g.hp[ct]-=eq(g.charaction[s.hpi],10)?Math.ceil(3*s.tdamage/4):s.tdamage;
   if(le(g.hp[ct],0))g.hp[ct]=round(-g.maxhp[0]/2);
  }
 }
 g.inv=g.invc*30;damageCheck(rt,before);s.gameover=1;
 for(let i=0;i<3;i++)if(!eq(g.char[i],0)&&gt(g.hp[g.char[i]],0))s.gameover=0;
 if(eq(s.gameover,1))gameOver(rt);
 if(!eq(remtarget,-1))s.target=remtarget;
}
