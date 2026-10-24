// The boxing encounter's adaptations of the shared battle panel and command flow.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import type {BattleHooks} from '../../deltarune/rules';
import {lerp,round} from '../../gm/math';
export function gigaMenuHooks(object:(name:string)=>GmObjectDef):BattleHooks{
 const player=(rt:GmRuntime)=>{const c=rt.first(object('o_boxingcontroller'));if(!c)throw Error('GIGA Queen menu requires o_boxingcontroller');return c;};
 return {
  canSkipEndingText:(_s,rt)=>rt.first(object('o_boxingqueen'))?.final_sequence_red_state===1,
  onControllerCreate:(_s,c)=>{c.gigaqueencon=3;},
  hidesTensionBar:(_s,rt)=>{const panel=rt.first(object('obj_battlecontroller'));return !!panel&&panel.gigaqueencon!==0;},
  defeatedByDamage:false,
  soulReturnsTo:(_s,rt)=>{const c=player(rt);return [c.x,c.y-110];},
  battleOutcome:(_s,rt)=>{const hero=rt.first(object('obj_rocketpunch_bhero'));return hero&&'$rocketPunchComplete' in hero&&hero.$rocketPunchComplete===1?'victory':undefined;},
  blocksControllerStep:(_s,c,rt)=>c.gigaqueencon!==0||(player(rt).dead===1&&rt.globals.turntimer<0)||rt.exists(object('obj_boxing_loss_controller'))||rt.exists(object('o_bq_whitefade_persistent')),
  controllerHudOffset:(_s,c)=>{
   const mode=c.gigaqueencon;
   if(mode===3)c.gigaqueeny=200;
   if([1,2,4,5].includes(mode)){
    c.gigaqueentimer++;
    const from=mode===2?100:mode===4?200:0,to=mode===1?100:mode===5?200:0;
    c.gigaqueeny=lerp(from,to,c.gigaqueentimer/10);if(c.gigaqueentimer===10)c.gigaqueencon=0;
   }
   return c.gigaqueeny;
  },
  onCommandChosen:(_s,_panel,rt,command)=>{const c=player(rt);if(command==='defend'){c.defend=1;c.specialcon=8;}else c.specialcon=7;},
  takesFightBar:(_s,bar,rt)=>{const c=player(rt),points=bar.points[0];c.punchcon=1;c.damageoverride=round(rt.globals.battleat[0]*points/10);c.acttoenemytalktransition=1;if(points===150||points===300)c.tpoverride=5;if(points===0)c.damageoverride=1;return true;},
  partyHudHp:(_s,rt,_char,hp)=>player(rt).dead!==0?0:hp,
  drawPartyHead:(_s,_panel,rt,char,x,y)=>{
   if(char!==0)return false;
   const head=player(rt).headsprite,parts:Record<string,readonly [number,number,number]>={spr_bhero_head_a:[1,41,2],spr_bhero_head_b:[3,43,2],spr_bhero_head_c:[2,43,2],spr_bhero_head_d:[0,36,1.6]};
   const p=parts[head];if(p)rt.drawSprite('spr_headthrash',p[0],x+p[1],y+8,p[2],p[2]);rt.drawSprite('spr_bnamethrash',0,x+51,y+3);return true;
  },
 };
}
