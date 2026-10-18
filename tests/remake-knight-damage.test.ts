import fs from 'node:fs';
import {it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {heart} from '../src/remake/deltarune/battle';
import {spriteBank} from '../src/remake/gm/sprites';
import {loadSprites} from './parity/reference';
import {GmInstance,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {instancesMeet} from '../src/remake/gm/collision';
import {preciseHit} from '../src/remake/deltarune/chapter3-scripts';
import {setSourceText} from '../src/remake/host/text';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
GmInstance.strict=true;
function fixture(packed:boolean){
 setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
 const bank=packed?spriteBank(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8'))):loadSprites(3);
 let objects!:Record<string,GmObjectDef>;
 const b=new EngineBattle(bank,equipment,defaultLoadout(),'ch3-115',11,{development:true,chapterHost:(r,o)=>{const host=installChapter3BossHost(r,o);objects=host.objects;return host;}}),rt=b.rt,g=rt.globals;
 for(let i=0;i<45;i++){b.step();rt.draw();}
 return {b,rt,g,objects,bank};
}
for(const packed of [false,true])it(`Knight exploding star children hurt the party through actual collision dispatch (${packed?'browser':'source'} assets)`,()=>{
 const {b,rt,g,objects,bank}=fixture(packed);
 const h=rt.create(heart,310,160),child=rt.create(objects.obj_knight_pointing_starchild,h.x+10,h.y+10);
 child.imageSpeed=0;child.imageIndex=0;child.imageAngle=0;child.imageXscale=1;child.imageYscale=1;g.inv=-1;
 expect(instancesMeet(bank,h,child)).toBe(true);expect(preciseHit(child,rt,5)).toBe(true);
 const before=g.hp.slice();(rt as any).collide();
 expect(b.party.every(c=>g.hp[c]<before[c]),JSON.stringify({before,after:g.hp,active:child.active})).toBe(true);
 expect(child.live).toBe(false);
});
for(const packed of [false,true])for(const scale of [.35,.57,.95])it(`first Stars explosion emits six damaging fragments at scale ${scale} (${packed?'browser':'source'})`,()=>{
 const {b,rt,g,objects,bank}=fixture(packed),h=rt.create(heart,310,160);
 const parent=rt.create(objects.obj_knight_pointing_star,h.x+10,h.y+10);
 Object.assign(parent,{con:3,timer:2,growstart:scale*2-1,difficulty:0});resolveEvent(parent.object,'step')!(parent,rt);
 const children=rt.all(objects.obj_knight_pointing_starchild);expect(children).toHaveLength(6);expect(parent.active).toBe(0);
 expect(children.map(c=>c.direction)).toEqual([90,156,204,270,336,24]);
 for(const child of children){child.x=600;child.y=400;}
 for(const [index,child] of children.entries()){
  child.x=h.x+10;child.y=h.y+10;g.inv=-1;for(const c of b.party)g.hp[c]=g.maxhp[c];
  expect(child.active).toBe(1);expect(child.lifetime).toBe(index%2===1?30:60);
  expect(child.imageXscale).toBeCloseTo(scale,5);expect(instancesMeet(bank,h,child)).toBe(true);expect(preciseHit(child,rt,5)).toBe(true);
  const before=g.hp.slice();(rt as any).collide();expect(b.party.every(c=>g.hp[c]<before[c])).toBe(true);expect(child.live).toBe(false);
 }
});
