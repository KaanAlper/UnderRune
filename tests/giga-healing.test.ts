import {expect,it} from 'vitest';
import {GmRuntime,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {healAnim} from '../src/remake/deltarune/party';
import type {SpriteData} from '../src/remake/gm/sprites';
import {gigaHealingHooks} from '../src/remake/bosses/giga-queen/healing';
it('flashes both machine layers and emits source healing stars above its centered body',()=>{
 const sprite={name:'body',width:100,height:100,originX:0,originY:0,frames:10} as SpriteData;
 const rt=new GmRuntime({get:()=>sprite,collisionCompat:true,roomSpeed:30},{seed:11});
 const def={name:'o_boxingcontroller',index:1,hooks:gigaHealingHooks()} as GmObjectDef;
 const player=rt.restore(def,100001,100,200,{headsprite:'spr_bhero_head_a'});player.sprite='body';player.imageIndex=2;
 const effect=rt.create(healAnim,0,0);effect.target=player.id;resolveEvent(effect.object,'step')!(effect,rt);
 const flashes=rt.instances.filter(i=>i.live&&i.object.name==='obj_oflash');expect(flashes).toHaveLength(2);
 expect(flashes.map(i=>[i.sprite,i.imageXscale])).toEqual([['body',-2],['spr_bhero_head_a',-2]]);
 for(const p of rt.instances.filter(i=>i.live&&i.object.name==='obj_marker')){expect(p.x).toBeGreaterThanOrEqual(50);expect(p.x).toBeLessThan(150);expect(p.y).toBeGreaterThan(100);expect(p.y).toBeLessThanOrEqual(200);}
});
