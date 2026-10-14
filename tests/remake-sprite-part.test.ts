import {it,expect} from 'vitest';
import {CanvasGraphics,type DrawAssets} from '../src/remake/host/canvas';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
function setup(){
 const calls:{kind:string,args:any[]}[]=[];
 const ctx={save:()=>calls.push({kind:'save',args:[]}),restore:()=>calls.push({kind:'restore',args:[]}),translate:(...args:any[])=>calls.push({kind:'translate',args}),scale:(...args:any[])=>calls.push({kind:'scale',args}),drawImage:(...args:any[])=>calls.push({kind:'image',args}),globalAlpha:1} as unknown as CanvasRenderingContext2D;
 const page={} as CanvasImageSource;
 const assets:DrawAssets={pages:[page],sprite:()=>({width:100,height:80,originX:50,originY:50,frames:[{page:0,sx:100,sy:200,sw:40,sh:40,tx:20,ty:10,tw:40,th:40}]}),font:()=>undefined};
 return {gfx:new CanvasGraphics(ctx,assets,{x:5,y:6}),ctx,calls,page};
}
it('sprite parts clip against trimmed atlas bounds and ignore sprite origins',()=>{
 const {gfx,calls,page,ctx}=setup();gfx.spritePart('test',0,10,0,40,40,30,40,2,1,0xffffff,.5);
 expect(calls.find(c=>c.kind==='translate')!.args).toEqual([25,34]);expect(calls.find(c=>c.kind==='scale')!.args).toEqual([2,1]);
 expect(calls.find(c=>c.kind==='image')!.args).toEqual([page,100,200,30,30,10,10,30,30]);expect(ctx.globalAlpha).toBe(.5);
});
it('empty crops do not draw or alter canvas state',()=>{
 const {gfx,calls}=setup();gfx.spritePart('test',0,0,0,10,10,30,40,1,1,0xffffff,1);gfx.spritePart('test',0,20,10,0,10,30,40,1,1,0xffffff,1);
 expect(calls).toEqual([]);
});
it('runtime crop drawing requires a supported renderer and preserves all source arguments',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));
 const args:any[][]=[];rt.gfx={sprite:()=>{},spritePart:(...a)=>args.push(a),rect:()=>{},circle:()=>{},text:()=>{}};
 rt.drawSpritePart('test',2,1,2,3,4,5,6,7,8,9,.4);expect(args[0]).toEqual(['test',2,1,2,3,4,5,6,7,8,9,.4]);
 delete rt.gfx.spritePart;expect(()=>rt.drawSpritePart('test',0,0,0,1,1,0,0)).toThrow(/sprite parts/);
});
