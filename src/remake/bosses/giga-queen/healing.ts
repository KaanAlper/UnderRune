import type {BattleHooks} from '../../deltarune/rules';
import {oflash} from '../../deltarune/party';
/** obj_healanim's boxing branch: a mirrored body/head flash and stars above the centered machine. */
export function gigaHealingHooks():BattleHooks{return {
 showsHeals:()=>true,teaHeals:()=>100,
 onHealFlash:(target,s,rt)=>{
  for(const f of rt.withInstances(oflash))f.imageXscale=-2;
  const f=rt.create(oflash,s.x,s.y);s._oflash=f.id;f.imageSpeed=0;f.imageIndex=target.imageIndex;f.imageXscale=-2;f.imageYscale=2;f.sprite=target.headsprite;f.depth=s.depth-1;
 },
 healParticlePosition:(_target,s,rt)=>{const y=s.y-rt.random.random(s.sh),x=s.x-s.sw/2+rt.random.random(s.sw);return [x,y];},
};}
