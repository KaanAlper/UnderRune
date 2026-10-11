import {test,expect} from '@playwright/test';
test('native fog replaces RGB with a white silhouette while preserving transparency',async({page})=>{
 await page.route('**/remake-graphics-probe',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));await page.goto('/remake-graphics-probe');
 const pixels=await page.evaluate(async()=>{
  const path='/src/remake/host/canvas.ts';const {CanvasGraphics}=await import(/* @vite-ignore */ path);
  const atlas=document.createElement('canvas');atlas.width=2;atlas.height=2;const a=atlas.getContext('2d')!;
  a.fillStyle='#204060';a.fillRect(0,0,1,1);a.fillStyle='rgba(255,0,0,.5)';a.fillRect(1,0,1,1);
  const screen=document.createElement('canvas');screen.width=8;screen.height=8;const c=screen.getContext('2d')!;
  const sprite={originX:0,originY:0,width:2,height:2,frames:[{page:0,sx:0,sy:0,sw:2,sh:2,tx:0,ty:0,tw:2,th:2}]};
  const g=new CanvasGraphics(c,{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:10,y:20});
  g.spriteFog('spr_clubs_idle',0,11,21,1,1,0,0xffffff,1);
  const one=(x:number,y:number)=>Array.from(c.getImageData(x,y,1,1).data);
  return [one(1,1),one(2,1),one(1,2),one(0,0)];
 });
 // Canvas GPU readback may quantize a channel by one unit during premultiplication.
 for(const pixel of pixels.slice(0,2))for(const channel of pixel.slice(0,3))expect(channel).toBeGreaterThanOrEqual(254);
 expect(pixels[0][3]).toBe(255);expect(pixels[1][3]).toBeGreaterThanOrEqual(127);expect(pixels[1][3]).toBeLessThanOrEqual(128);
 expect(pixels[2][3]).toBe(0);expect(pixels[3][3]).toBe(0);
});
