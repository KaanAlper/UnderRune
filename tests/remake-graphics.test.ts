import {it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {CanvasGraphics} from '../src/remake/host/canvas';
import {C,type GmGraphics} from '../src/remake/gm/graphics';
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
it('forwards a source warning line with the current draw color and alpha',()=>{
 const rt=new GmRuntime(bank),lines:unknown[][]=[];rt.gfx={line:(...args:unknown[])=>lines.push(args)} as unknown as GmGraphics;rt.drawState.color=C.red;rt.drawState.alpha=.5;rt.drawLine(100,-40,100,960);expect(lines).toEqual([[100,-40,100,960,C.red,.5]]);
});
it('Canvas warning lines use room coordinates, camera offsets and preserved drawing state',()=>{
 const calls:unknown[][]=[];const c={save:()=>calls.push(['save']),restore:()=>calls.push(['restore']),beginPath:()=>calls.push(['begin']),moveTo:(...a:unknown[])=>calls.push(['move',...a]),lineTo:(...a:unknown[])=>calls.push(['line',...a]),stroke:()=>calls.push(['stroke']),globalAlpha:1,strokeStyle:'',lineWidth:0};
 const g=new CanvasGraphics(c as unknown as CanvasRenderingContext2D,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:10,y:20});g.line(100,-40,100,960,C.red,.5);expect(calls).toEqual([['save'],['begin'],['move',90,-60],['line',90,940],['stroke'],['restore']]);expect(c.globalAlpha).toBe(.5);expect(c.strokeStyle).toBe('rgb(255,0,0)');
});
it('reports an unsupported drawing backend instead of silently omitting attack warnings',()=>{
 const rt=new GmRuntime(bank);rt.gfx={} as GmGraphics;expect(()=>rt.drawLine(0,0,10,10)).toThrow('line drawing');
});
it('forwards the native throwing trajectory line width to the drawing backend',()=>{
 const rt=new GmRuntime(bank),lines:unknown[][]=[];rt.gfx={line:(...args:unknown[])=>lines.push(args)} as unknown as GmGraphics;
 rt.drawLine(1,2,3,4,3);expect(lines).toEqual([[1,2,3,4,0xffffff,1,3]]);
});
it('forwards fog sprites to a silhouette backend and rejects a multiply-only backend',()=>{
 const rt=new GmRuntime(bank),calls:unknown[][]=[];rt.gfx={spriteFog:(...args:unknown[])=>calls.push(args)} as unknown as GmGraphics;
 rt.drawSpriteFog('spr_clubs_idle',2,400,120,2,2,0,0xffffff,.2);expect(calls).toEqual([['spr_clubs_idle',2,400,120,2,2,0,0xffffff,.2]]);
 rt.gfx={} as GmGraphics;expect(()=>rt.drawSpriteFog('spr_clubs_idle',0,0,0)).toThrow('fog');
});
