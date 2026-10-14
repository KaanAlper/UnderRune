import {it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {installSourceSurfaces} from '../src/remake/host/surfaces';
it('captures source surface geometry in headless runs without mutating the shared chapter bank',()=>{
 const bank=spriteBank({atLeast2022_1:true,optionsInfo:0,sprites:[]}),rt=new GmRuntime(bank);installSourceSurfaces(rt);const surfaces=rt.sourceSurfaces!;
 const id=surfaces.create(120,75);surfaces.target(id);surfaces.clear(0,0);const name=surfaces.capture(id,0,0,120,75,60,38);surfaces.target(null);surfaces.free(id);
 expect(rt.bank.get(name)).toMatchObject({width:120,height:75,originX:60,originY:38,frames:1});expect(bank.get(name)).toBeUndefined();surfaces.deleteSprite(name);expect(rt.bank.get(name)).toBeUndefined();
 expect(()=>surfaces.target(id)).toThrow('Missing');
});
