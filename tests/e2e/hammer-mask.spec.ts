import {test,expect} from '@playwright/test';
test('source alpha masks preserve presentation RGB and linear-alpha sparks use texture alpha',async({page})=>{
 await page.route('**/__hammer_mask',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));await page.goto('/__hammer_mask');
 const result=await page.evaluate(async()=>{
  const p='/src/remake/host/canvas.ts';const {CanvasGraphics}=await import(p);
  const atlas=document.createElement('canvas');atlas.width=2;atlas.height=1;const a=atlas.getContext('2d')!;a.putImageData(new ImageData(new Uint8ClampedArray([128,64,32,255,128,64,32,128]),2,1),0,0);
  const canvas=document.createElement('canvas');canvas.width=4;canvas.height=2;const ctx=canvas.getContext('2d',{alpha:false})!;ctx.imageSmoothingEnabled=false;ctx.fillStyle='rgb(20,40,60)';ctx.fillRect(0,0,4,2);
  const sprite={originX:0,originY:0,width:2,height:1,frames:[{page:0,sx:0,sy:0,sw:2,sh:1,tx:0,ty:0,tw:2,th:1}]};const gfx=new CanvasGraphics(ctx,{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:10,y:20});
  gfx.alphaMaskRect(10,20,13,21,0);gfx.alphaMaskRect(11,20,11,20,.5);gfx.blendMode('dest-alpha-inverse');gfx.alphaTest(true);gfx.sprite('test',0,10,20,1,1,0,0xffffff,1);gfx.blendMode('normal');gfx.alphaTest(false);
  const mask=Array.from(ctx.getImageData(0,0,4,1).data);ctx.fillStyle='black';ctx.fillRect(0,0,4,2);gfx.blendMode('add');gfx.linearAlpha(true);gfx.sprite('test',0,10,21,1,1,0,0xffffff,.5);gfx.linearAlpha(false);const linear=Array.from(ctx.getImageData(0,1,2,1).data);return {mask,linear};
 });
 // Canvas atlas readback can round a colour channel by one byte.
 const near=(actual:number[],expected:number[])=>actual.forEach((n,i)=>expect(Math.abs(n-expected[i])).toBeLessThanOrEqual(1));
 near(result.mask.slice(0,4),[20,40,60,255]);near(result.mask.slice(4,8),[74,52,46,255]);near(result.mask.slice(8,12),[20,40,60,255]);
 near(result.linear.slice(0,4),[64,32,16,255]);expect(result.linear[4]).toBeLessThanOrEqual(1);
});
