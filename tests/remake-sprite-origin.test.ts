import {it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import type {SpriteData,SpriteBank} from '../src/remake/gm/sprites';
import {CanvasGraphics} from '../src/remake/host/canvas';
it('keeps source sprite offset changes local to the battle and truncates native integer offsets',()=>{
 const sprite={name:'shield',originX:32,originY:32} as SpriteData,bank:SpriteBank={get:n=>n==='shield'?sprite:undefined,collisionCompat:false,roomSpeed:30};
 const a=new GmRuntime(bank),b=new GmRuntime(bank);a.setSpriteOffset('shield',27.9,31.6);
 expect([a.bank.get('shield')!.originX,a.bank.get('shield')!.originY]).toEqual([27,31]);expect(b.bank.get('shield')!.originX).toBe(32);expect(sprite.originX).toBe(32);
 a.setSpriteOffset('shield',32,32);expect(a.bank.get('shield')!.originX).toBe(32);
});
it('updates renderer metadata without mutating shared atlas frames or origins',()=>{
 const sprite={originX:32,originY:32,width:64,height:64,frames:[]},g=new CanvasGraphics({} as CanvasRenderingContext2D,{pages:[],sprite:()=>sprite,font:()=>undefined},{x:0,y:0});
 g.spriteOffset('shield',27,32);expect(g.assets.sprite('shield')!.originX).toBe(27);expect(sprite.originX).toBe(32);expect(g.assets.sprite('shield')!.frames).toBe(sprite.frames);
});
