import fs from 'node:fs';
import {it,expect} from 'vitest';
import {GmRuntime,resolveEvent} from '../src/remake/gm/runtime';
import {instancesMeet} from '../src/remake/gm/collision';
import {spriteBank,type SpriteBank} from '../src/remake/gm/sprites';
import {lengthdirX,lengthdirY} from '../src/remake/gm/math';
import {createChapterRegistry} from '../src/remake/host/chapter2';
import metadata from '../src/remake/host/chapter3-resources.json';
import {createTrackingSwords} from '../src/remake/bosses/roaring-knight/tracking-swords';
import {loadSprites} from './parity/reference';

function oneSlash(bank:SpriteBank,direction:number,dodge:boolean){
 const rt=new GmRuntime(bank,{seed:11});rt.globals={chapter:3,char:[1,2,3],chararmor1:[0,0,0,0],chararmor2:[0,0,0,0]};
 const registry=createChapterRegistry(rt,{chapter:3,metadata,room:'room_battletest'}),swords=createTrackingSwords(registry.object);registry.register(swords.objects);registry.finalize();
 const h=rt.restore(registry.object('obj_heart'),99990,310,160);
 const sword=rt.create(registry.object('obj_tracking_sword1'),0,0);sword.direction=direction;sword.imageAngle=direction+180;
 let lock=-1,hit=-1,touches=false;
 for(let frame=0;frame<45&&sword.live;frame++){
  // Source heart speed is four pixels/frame. Move perpendicular once the sword stops tracking.
  if(dodge&&sword.con>=2){h.x+=lengthdirX(4,direction+90);h.y+=lengthdirY(4,direction+90);}
  resolveEvent(sword.object,'step')!(sword,rt);if(lock<0&&sword.con>=2)lock=frame;
  for(const slash of rt.all(registry.object('obj_tracking_sword_slash'))){
   if(hit<0)hit=frame;touches||=instancesMeet(bank,h,slash);resolveEvent(slash.object,'draw')!(slash,rt);
  }
 }
 return {lock,hit,touches};
}

for(const direction of [0,45,90,135,180,225,270,315])it(`tracking slash ${direction}: has a dodge window and the packed mask matches the source`,()=>{
 const source=loadSprites(3),packed=spriteBank(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')));
 const standing=oneSlash(source,direction,false),moving=oneSlash(source,direction,true);
 expect(standing.touches).toBe(true);expect(moving.touches).toBe(false);expect(moving.hit-moving.lock).toBeGreaterThanOrEqual(4);
 expect(oneSlash(packed,direction,false)).toEqual(standing);expect(oneSlash(packed,direction,true)).toEqual(moving);
});
