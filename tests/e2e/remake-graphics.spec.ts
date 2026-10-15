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

test('nine-slice borders keep their pixel width on screen and captured surfaces',async({page})=>{
 await page.route('**/remake-graphics-probe',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));await page.goto('/remake-graphics-probe');
 const result=await page.evaluate(async()=>{
  const path='/src/remake/host/canvas.ts';const {CanvasGraphics}=await import(/* @vite-ignore */ path);
  const atlas=document.createElement('canvas');atlas.width=10;atlas.height=10;const a=atlas.getContext('2d')!;
  a.fillStyle='white';a.fillRect(0,0,10,10);a.clearRect(2,2,6,6);
  const screen=document.createElement('canvas');screen.width=100;screen.height=100;const ctx=screen.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  const sprite={originX:5,originY:5,width:10,height:10,nineSlice:{enabled:true,left:2,top:2,right:2,bottom:2,tileModes:[0,0,0,0,0]},frames:[{page:0,sx:0,sy:0,sw:10,sh:10,tx:0,ty:0,tw:10,th:10}]};
  const g=new CanvasGraphics(ctx,{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:10,y:20});
  g.sprite('box',0,40,50,3,1,0,0xffffff,1);
  const pixel=(x:number,y:number)=>Array.from(ctx.getImageData(x,y,1,1).data);
  const screenPixels=[pixel(15,30),pixel(16,30),pixel(17,30),pixel(42,30),pixel(43,30),pixel(44,30)];
  // Capture a box made at x3/y1, then magnify it as the growth afterimages do.
  g.surfaceCreate(1,30,10);g.surfaceTarget(1);g.surfaceClear(0,0);g.sprite('box',0,15,5,3,1,0,0xffffff,1);
  g.surfaceSprite(1,'capture',0,0,30,10,15,5);g.surfaceTarget(null);g.surfaceFree(1);
  g.sprite('capture',0,40,80,2,2,0,0xffffff,1);
  const capturePixels=[pixel(0,60),pixel(3,60),pixel(4,60),pixel(55,60),pixel(56,60),pixel(59,60)];
  return {screenPixels,capturePixels};
 });
 expect(result.screenPixels.map(p=>p[3])).toEqual([255,255,0,0,255,255]);
 expect(result.capturePixels.map(p=>p[3])).toEqual([255,255,0,0,255,255]);
});

test('nine-slice keeps trimmed atlas regions, tint, alpha, rotation and mirrored scale',async({page})=>{
 await page.route('**/remake-graphics-probe',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));await page.goto('/remake-graphics-probe');
 const result=await page.evaluate(async()=>{
  const path='/src/remake/host/canvas.ts';const {CanvasGraphics}=await import(/* @vite-ignore */ path);
  const make=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const atlas=make(12,12),a=atlas.getContext('2d')!;a.fillStyle='white';a.fillRect(2,2,8,8);a.clearRect(3,3,6,6);
  const sprite={originX:5,originY:5,width:10,height:10,nineSlice:{enabled:true,left:2,top:2,right:2,bottom:2,tileModes:[0,0,0,0,0]},frames:[{page:0,sx:2,sy:2,sw:8,sh:8,tx:1,ty:1,tw:8,th:8}]};
  const failures:number[]=[];
  for(const xsign of [-1,1])for(const ysign of [-1,1]){
   const actual=make(80,80),expected=make(80,80),c=actual.getContext('2d')!,e=expected.getContext('2d')!;c.imageSmoothingEnabled=e.imageSmoothingEnabled=false;
   const g=new CanvasGraphics(c,{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:10,y:20});
   g.sprite('trimmed',0,50,60,3*xsign,2*ysign,90,0x0000ff,.5);
   e.translate(40,40);e.rotate(-Math.PI/2);e.scale(xsign,ysign);e.translate(-15,-10);e.globalAlpha=.5;e.fillStyle='red';
   e.fillRect(1,1,28,1);e.fillRect(1,18,28,1);e.fillRect(1,2,1,16);e.fillRect(28,2,1,16);
   const ap=c.getImageData(0,0,80,80).data,ep=e.getImageData(0,0,80,80).data;
   failures.push(ap.reduce((n,v,i)=>n+(Math.abs(v-ep[i])>1?1:0),0));
  }
  const screen=make(80,80),g=new CanvasGraphics(screen.getContext('2d')!,{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:0,y:0});
  sprite.nineSlice.tileModes[0]=1;let error='';try{g.sprite('tiled',0,40,40,3,2,0,0xffffff,1);}catch(e){error=String(e);}
  return {failures,error};
 });
 expect(result.failures).toEqual([0,0,0,0]);expect(result.error).toContain('Unsupported nine-slice tile mode: tiled');
});

test('undersized nine-slices clip corners using the source runner boundaries',async({page})=>{
 await page.route('**/remake-graphics-probe',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));await page.goto('/remake-graphics-probe');
 const result=await page.evaluate(async()=>{
  const path='/src/remake/host/canvas.ts';const {CanvasGraphics}=await import(/* @vite-ignore */ path);
  const atlas=document.createElement('canvas');atlas.width=10;atlas.height=10;const a=atlas.getContext('2d')!;
  for(let y=0;y<10;y++)for(let x=0;x<10;x++){a.fillStyle=`rgb(${x*20},${y*20},0)`;a.fillRect(x,y,1,1);}
  const sprite={originX:0,originY:0,width:10,height:10,nineSlice:{enabled:true,left:2,top:2,right:2,bottom:2,tileModes:[0,0,0,0,0]},frames:[{page:0,sx:0,sy:0,sw:10,sh:10,tx:0,ty:0,tw:10,th:10}]};
  const output=[];
  for(const size of [3,1]){
   const screen=document.createElement('canvas');screen.width=screen.height=10;const ctx=screen.getContext('2d')!;ctx.imageSmoothingEnabled=false;
   const g=new CanvasGraphics(ctx,{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:0,y:0});
   g.sprite('tiny',0,0,0,size/10,size/10,0,0xffffff,1);
   const pixels=[];for(let y=0;y<size;y++)for(let x=0;x<size;x++)pixels.push(Array.from(ctx.getImageData(x,y,1,1).data));
   output.push(pixels);
  }
  return output;
 });
 // At width 3 the runner keeps left=2, middle=6, clips right=1: source cuts 0,2,8,9.
 // At width 1 it clips left=1 and right=0: source cuts 0,1,7,7. Y follows the same rule.
 const samples=[0,1,8],expected=[samples.flatMap(y=>samples.map(x=>[x*20,y*20,0,255])),[[0,0,0,255]]];
 for(let size=0;size<2;size++)for(let pixel=0;pixel<expected[size].length;pixel++)for(let channel=0;channel<4;channel++)
  expect(Math.abs(result[size][pixel][channel]-expected[size][pixel][channel])).toBeLessThanOrEqual(channel===3?0:1);
});
