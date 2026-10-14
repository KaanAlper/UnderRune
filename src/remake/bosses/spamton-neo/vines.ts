// NEO's wires as they are cut and grow back: obj_sneo_vine_cut (a wire snapping: the cut line flashes, then the two
// ends spring apart or fall), obj_sneo_vine_transition (a back wire swinging over to replace a cut body wire) and
// obj_sneo_vine_weak (the slash where a wire is weakened). Their Draw events also run their logic.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {lengthdirX,lengthdirY} from '../../gm/math';
import {spamtonNeo} from './neo';

const DARK_WIRE=0x003300;
const neo=(rt:GmRuntime)=>rt.first(spamtonNeo)!;

/** obj_sneo_vine_cut: type 0 snaps a body wire (the ends pull apart), type 1 cuts it at an angle (both halves fly off). */
export const vineCut:GmObjectDef={name:'obj_sneo_vine_cut',index:693,depth:0,events:{
 create:s=>{
  Object.assign(s,{timer:0,shakeamount:10,type:0,vineid:-1,hide:0,x1:s.x,x2:s.x,y1:s.y,y2:s.y,x3:s.x,x4:s.x,y3:s.y,y4:s.y,alpha:1,lineangle:0,anglecutspeed:3,bottomlinevisible:1});
 },
 draw:(s,rt)=>{
  s.timer+=1;
  if(s.shakeamount>0)s.shakeamount-=1;
  const shake2=s.shakeamount-rt.random.random(s.shakeamount*2),n=neo(rt);
  s.y1=n.y+n.party[s.vineid]-10+n.partyoff[s.vineid];
  if(s.type===0){
   if(s.timer===11){s.x3=s.x1;s.x4=s.x2;s.y3=s.y1-130;s.y4=s.y2;s.y2=s.y1-130;}
   if(s.timer>11){if(s.y4<s.y3)s.y3-=4;if(s.y1>s.y2)s.y2+=4;}
   if(s.timer===60)rt.destroy(s);
  }
  if(s.type===1){
   if(s.timer>1&&s.timer<17){
    s.x3+=lengthdirX(s.anglecutspeed,s.lineangle+23);s.y3+=lengthdirY(s.anglecutspeed,s.lineangle+23);
    s.x2+=lengthdirX(s.anglecutspeed,s.lineangle-157);s.y2+=lengthdirY(s.anglecutspeed,s.lineangle-157);
    s.anglecutspeed-=0.2;
   }
   if(s.timer>11)s.alpha-=0.1;
   if(s.timer===60||s.alpha<0.1)rt.destroy(s);
  }
  if(Math.abs(s.y1-s.y2)<16||s.y2>s.y1)s.bottomlinevisible=0;
  const d=rt.drawState;d.alpha=s.alpha;d.color=C.orange;
  if((s.timer>=11&&s.type===0&&s.hide===0)||(s.type===1&&s.hide===0))rt.drawLine(s.x3,s.y3,s.x4,s.y4,2);
  if(s.bottomlinevisible===1&&s.hide===0)rt.drawLine(s.x1+shake2,s.y1+shake2,s.x2+shake2,s.y2+shake2,2);
  if(s.timer<11&&s.hide===0){d.color=C.white;d.alpha=11-s.timer/10;rt.drawLine(s.x1,s.y1,s.x2,s.y2,2);d.alpha=1;}
  d.alpha=1;
 },
}};

/** Where a back wire meets NEO's body. */
function backWireX(n:GmInstance,a:number){return n.x+n.partx_back[a]+n.partxoff_back[a]+Math.sin(n.partsiner_back[a]/30)*2;}
/** Where the cut body wire (NEO's vineid) hangs from. */
function bodyWire(n:GmInstance,v:number):[number,number]{
 return [n.x+n.partx[v]+n.partxoff[v]/1.2+v*5+Math.sin(n.partsiner[v]/30)*2,n.x+n.partx[v]+n.partxoff[v]/1.5+v*8];
}
/** obj_sneo_vine_transition: a random visible back wire leaves the background and swings over to the cut body wire
 * (NEO's vineid); after 31 frames that wire is whole again, and wires he still has spare return to the back. */
export const vineTransition:GmObjectDef={name:'obj_sneo_vine_transition',index:694,depth:0,events:{
 create:(s,rt)=>{
  const n=neo(rt);
  Object.assign(s,{timer:0,width:1,vineid:n.vineid,hide:0,x1:s.x,x2:s.x,y1:s.y,y2:s.y,x3:s.x,x4:s.x,y3:s.y,y4:s.y});
  s.depth=n.depth+5;s.a=0;s.selected_vine=0;
  let c=rt.random.irandom(17),found=false,tries=0;
  while(!found){
   if(n.partvisible_back[c]===1){
    s.a=c;n.partvisible_back[c]=0;s.selected_vine=c;
    s.x1=backWireX(n,s.a);s.x2=n.x+n.partx_back[s.a]+n.partxoff_back[s.a];
    s.y1=n.y+n.party_back[s.a]+n.partyoff_back[s.a];s.y2=-400;found=true;
   }else{
    c+=1;if(c>17)c=0;
    tries+=1;if(tries>18){rt.destroy(s);return;}
   }
  }
  [s.x3,s.x4]=bodyWire(n,s.vineid);
  s.y3=n.y+n.party[s.vineid]-10+n.partyoff[s.vineid];s.y4=-400;
 },
 draw:(s,rt)=>{
  const g=rt.globals,n=neo(rt);
  s.timer+=1;s.width+=1/30;
  [s.x3,s.x4]=bodyWire(n,s.vineid);
  if(g.myfight!==3&&g.monsterattackname[n.myself]==='UnspecifiedSneoAttack')s.x1=backWireX(n,s.a);
  s.y1=n.y+n.party_back[s.a]+n.partyoff_back[s.a];
  for(let i=0;i<2;i++){
   if(s.x1<s.x3-1)s.x1+=1;
   if(s.x2<s.x3-1)s.x2+=1;
   if(s.x1>s.x3+1)s.x1-=1;
   if(s.x2>s.x3+1)s.x2-=1;
  }
  if(s.timer>=31){
   n.partvisible[s.vineid]=1;n.partweakened[s.vineid]=0;
   if(n.extra_vines>0)for(s.ii=0;s.ii<18;s.ii+=1)if(n.partvisible_back[s.ii]===0&&n.extra_vines>0){n.extra_vines-=1;n.partvisible_back[s.ii]=1;n.vinebgcount+=1;}
   rt.destroy(s);
  }
  if(s.hide===1)return;
  const d=rt.drawState;
  d.color=C.green;rt.drawLine(s.x1,s.y1,s.x2,s.y2,s.width);
  d.alpha=(31-s.timer)/30;d.color=DARK_WIRE;rt.drawLine(s.x1,s.y1,s.x2,s.y2,s.width);
  d.alpha=1;
 },
}};

/** obj_sneo_vine_weak: the slash on a weakened wire. */
export const vineWeak:GmObjectDef={name:'obj_sneo_vine_weak',index:695,depth:0,sprite:'spr_attack_cut1',events:{
 create:s=>{s.imageSpeed=0.25;},
 step:(s,rt)=>{if(s.imageIndex>3)rt.destroy(s);},
}};
