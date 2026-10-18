import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chromium} from '@playwright/test';
import {createServer} from 'vite';

test('multiline failure choices draw with the same native glyph stride as their measured bounds',async()=>{
 const result=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const atlas=document.createElement('canvas');atlas.width=1;atlas.height=4;atlas.getContext('2d').fillRect(0,0,1,4);
  const canvas=document.createElement('canvas');canvas.width=4;canvas.height=12;const ctx=canvas.getContext('2d');
  const font={kind:'bitmap',page:0,sx:0,sy:0,size:2,glyphs:{65:{x:0,y:0,w:1,h:4,shift:1,offset:0}}};
  const g=new CanvasGraphics(ctx,{pages:[atlas],sprite:()=>undefined,font:()=>font},{x:0,y:0});g.text(0,6,'A\nA',{font:'main',color:0xffffff,alpha:1,halign:0,valign:1,xscale:1,yscale:1,angle:0});
  return {height:g.textHeight('main','A\nA'),alpha:Array.from(ctx.getImageData(0,0,1,12).data).filter((_,i)=>i%4===3)};
 });assert.equal(result.height,8);assert.deepEqual(result.alpha,[0,0,255,255,255,255,255,255,255,255,0,0]);
});

test('opaque screen composites surfaces with the GPU while retaining native visible colors',async()=>{
 const result=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const outputs=[];
  for(const mode of ['normal','add']){
   const canvas=document.createElement('canvas');canvas.width=4;canvas.height=2;const ctx=canvas.getContext('2d',{alpha:false});
   const g=new CanvasGraphics(ctx,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:10,y:20});g.surfaceClear(0x101010,1);g.surfaceCreate(1,2,2);g.surfaceTarget(1);g.surfaceClear(0x808080,.5);g.surfaceTarget(null);g.blendMode(mode);
   let reads=0;const read=ctx.getImageData.bind(ctx);ctx.getImageData=(...args)=>{reads++;return read(...args);};
   g.surfaceDraw(1,11,20,1);const pixel=Array.from(read(1,0,1,1).data);outputs.push({mode,reads,pixel,outside:Array.from(read(0,0,1,1).data)});
  }return outputs;
 });
 for(const r of result){assert.equal(r.reads,0,'surface display must not read the entire screen back');const expected=r.mode==='normal'?72:80;for(const v of r.pixel.slice(0,3))assert.ok(Math.abs(v-expected)<=1);assert.equal(r.pixel[3],255);assert.deepEqual(r.outside,[16,16,16,255]);}
});

let server,browser,page;
test('offscreen drawing batches transfers until presentation and flushes captures and context reads',async()=>{
 const actual=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');
  const canvas=document.createElement('canvas');canvas.width=24;canvas.height=2;const ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=false;
  const g=new CanvasGraphics(ctx,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:0,y:0});g.surfaceCreate(1,24,2);g.surfaceTarget(1);
  const off=g.ctx,put=off.putImageData.bind(off);let uploads=0;off.putImageData=(...args)=>{uploads++;return put(...args);};
  g.surfaceClear(0,0);for(let x=0;x<20;x++)g.rect(x,0,x,0,0xffffff,1);
  const before=uploads;g.surfaceTarget(null);g.blendMode('add');g.surfaceDraw(1,0,0,1);const after=uploads,pixels=Array.from(ctx.getImageData(0,0,24,1).data);
  g.surfaceTarget(1);g.blendMode('normal');g.rect(21,0,21,0,0x0000ff,1);g.surfaceSprite(1,'capture',0,0,24,2,0,0);
  g.surfaceTarget(null);g.sprite('capture',0,0,1,1,1,0,0xffffff,1);const capture=Array.from(ctx.getImageData(21,1,1,1).data);
  g.surfaceTarget(1);g.rect(22,0,22,0,0x00ff00,1);const read=Array.from(g.ctx.getImageData(22,0,1,1).data);
  return {before,after,pixels,capture,read};
 });
 assert.equal(actual.before,0,'drawing a surface must not upload it after every primitive');assert.equal(actual.after,1);
 assert.deepEqual(actual.pixels,Array.from({length:24},(_,x)=>x<20?[255,255,255,255]:[0,0,0,255]).flat());
 assert.deepEqual(actual.capture,[255,0,0,255]);assert.deepEqual(actual.read,[0,255,0,255]);
});
test('surface clears reuse the RGBA buffer without retaining old colors or alpha',async()=>{
 const result=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');
  const g=new CanvasGraphics(canvas.getContext('2d'),{pages:[],sprite:()=>undefined,font:()=>undefined},{x:0,y:0});g.surfaceCreate(1,2,2);g.surfaceTarget(1);
  const c=g.ctx,create=c.createImageData.bind(c);let allocations=0;c.createImageData=(...args)=>{allocations++;return create(...args);};
  g.surfaceClear(0x604020,.5);g.surfaceClear(0,0);const transparent=Array.from(g.ctx.getImageData(0,0,2,2).data);
  g.surfaceClear(0x204080,1);return {allocations,transparent,colored:Array.from(g.ctx.getImageData(0,0,2,2).data)};
 });
 assert.equal(result.allocations,1);assert.deepEqual(result.transparent,Array(16).fill(0));assert.deepEqual(result.colored,Array(4).fill([128,64,32,255]).flat());
});
test('effect-surface triangles rasterize without temporary canvases and preserve shared-edge blending',async()=>{
 const result=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;
  const g=new CanvasGraphics(canvas.getContext('2d'),{pages:[],sprite:()=>undefined,font:()=>undefined},{x:0,y:0});g.surfaceCreate(1,4,4);g.surfaceTarget(1);g.surfaceClear(0,1);g.blendMode('add');
  const create=document.createElement.bind(document);let canvases=0;document.createElement=(name,...args)=>{if(name==='canvas')canvases++;return create(name,...args);};
  try{g.triangle(0,0,4,0,0,4,0x404040,1,false);g.triangleColor(4,0,0,4,4,4,0x404040,0x404040,0x404040,1);}finally{document.createElement=create;}
  return {canvases,pixels:Array.from(g.ctx.getImageData(0,0,4,4).data)};
 });
 assert.equal(result.canvases,0);assert.deepEqual(result.pixels,Array.from({length:16},()=>[64,64,64,255]).flat());
});
test('direct surface triangles preserve vertex-color interpolation and native alpha blending',async()=>{
 const pixels=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');
  const g=new CanvasGraphics(canvas.getContext('2d'),{pages:[],sprite:()=>undefined,font:()=>undefined},{x:100,y:200});
  g.surfaceCreate(1,40,40);g.surfaceTarget(1);g.surfaceClear(0,1);g.triangleColor(2,2,32,5,9,32,0x0000ff,0x00ff00,0xff0000,.5);
  return [[4,4],[25,6],[9,24]].map(([x,y])=>Array.from(g.ctx.getImageData(x,y,1,1).data));
 });
 for(const [i,[x,y]] of [[4,4],[25,6],[9,24]].entries()){
  const b=((x+.5-2)*30-(y+.5-2)*7)/879,c=(30*(y+.5-2)-3*(x+.5-2))/879,a=1-b-c;
  for(const [ch,w] of [a,b,c].entries())assert.ok(Math.abs(pixels[i][ch]-Math.round(Math.round(w*255)*128/255))<=1,`${i}/${ch}: ${pixels[i]}`);
  assert.ok(Math.abs(pixels[i][3]-191)<=1);
 }
});
before(async()=>{
 server=await createServer({configFile:false,root:process.cwd(),optimizeDeps:{noDiscovery:true,entries:[]},server:{host:'127.0.0.1',port:0,watch:{ignored:['**/.tools/**','**/extracted/**','**/public/**']}}});await server.listen();
 const executablePath=process.env.PLAYWRIGHT_EXECUTABLE_PATH||['C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--disable-features=BraveFingerprintingV2,BraveFarbling']});page=await browser.newPage();
 await page.route('**/graphics-probe',r=>r.fulfill({contentType:'text/html',body:'<!doctype html>'}));
 await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/graphics-probe`);
});
after(async()=>{await browser?.close();await server?.close();});

test('three vertex colors interpolate barycentrically on a skew triangle',async()=>{
 const pixels=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');
  const canvas=document.createElement('canvas');canvas.width=40;canvas.height=40;const ctx=canvas.getContext('2d');
  const g=new CanvasGraphics(ctx,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:10,y:20});
  g.triangleColor(12,22,42,25,19,52,0x0000ff,0x00ff00,0xff0000,1);
  return [[4,4],[25,6],[9,24]].map(([x,y])=>Array.from(ctx.getImageData(x,y,1,1).data));
 });
 // Independent analytic weights at pixel centers for screen vertices (2,2), (32,5), (9,32).
 for(const [i,[x,y]] of [[4,4],[25,6],[9,24]].entries()){
  const b=((x+.5-2)*30-(y+.5-2)*7)/879,c=(30*(y+.5-2)-3*(x+.5-2))/879,a=1-b-c;
  for(const [ch,w] of [a,b,c].entries())assert.ok(Math.abs(pixels[i][ch]-Math.round(w*255))<=1,`${i}/${ch}: ${pixels[i]}`);
  assert.equal(pixels[i][3],255);
 }
});

test('native subtract multiplies destination by inverse source color and alpha',async()=>{
 const actual=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');
  const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;const ctx=canvas.getContext('2d');
  const g=new CanvasGraphics(ctx,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:0,y:0});
  g.surfaceClear(0x806040,1);g.alphaTest(true);g.blendMode('subtract');g.rect(0,0,0,0,0x204080,.5);
  return Array.from(ctx.getImageData(0,0,1,1).data);
 });
 for(const [i,value] of [32,72,112,127].entries())assert.ok(Math.abs(actual[i]-value)<=2,`${actual}`);
});

test('separate alpha modes have distinct RGB equations and alpha-test preserves holes',async()=>{
 const actual=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');
  const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;const ctx=canvas.getContext('2d');
  const g=new CanvasGraphics(ctx,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:0,y:0});const results=[];
  g.alphaTest(true);
  for(const mode of ['add-preserve-alpha','normal-preserve-alpha']){
   g.surfaceClear(0x604020,1);g.blendMode(mode);g.rect(0,0,0,0,0x204080,.5);results.push(Array.from(ctx.getImageData(0,0,1,1).data));
  }
  g.alphaTest(true);g.rect(0,0,0,0,0xffffff,0);results.push(Array.from(ctx.getImageData(0,0,1,1).data));
  g.alphaTest(false);try{g.rect(0,0,0,0,0xffffff,0);}catch(error){results.push(String(error));}
  return results;
 });
 const pixels=actual;
 for(const [i,expected] of [[96,96,112,128],[80,64,64,128]].entries())for(let c=0;c<4;c++)assert.ok(Math.abs(pixels[i][c]-expected[c])<=2,`${i}: ${pixels[i]}`);
 assert.deepEqual(pixels[2],pixels[1]);assert.match(pixels[3],/requires alpha testing/);
});

test('surfaces retain native RGB and squared source alpha across target switches and clear/free/recreate',async()=>{
 const pixels=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');
  const canvas=document.createElement('canvas');canvas.width=8;canvas.height=8;const ctx=canvas.getContext('2d');
  const g=new CanvasGraphics(ctx,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:30,y:40});
  g.surfaceClear(0,1);g.surfaceCreate(1,8,8);g.surfaceTarget(1);g.surfaceClear(0,0);g.rect(1,1,1,1,0xffffff,.5);
  const first=Array.from(g.ctx.getImageData(1,1,1,1).data);
  g.alphaTest(true);g.blendMode('add-preserve-alpha');g.surfaceTarget(null);g.surfaceTarget(1);g.rect(1,1,1,1,0x000040,1);
  const second=Array.from(g.ctx.getImageData(1,1,1,1).data);
  g.blendMode('add');g.surfaceTarget(null);g.surfaceDraw(1,30,40,1);
  const screen=Array.from(ctx.getImageData(1,1,1,1).data);
  g.surfaceTarget(1);g.surfaceClear(0xff0000,0);g.blendMode('normal');g.rect(1,1,1,1,0x0000ff,.5);
  const hidden=Array.from(g.ctx.getImageData(1,1,1,1).data);
  g.surfaceTarget(null);g.surfaceFree(1);g.surfaceCreate(1,8,8);g.surfaceTarget(1);g.blendMode('normal');g.rect(1,1,1,1,0xffffff,1);
  return [first,second,screen,hidden,Array.from(g.ctx.getImageData(1,1,1,1).data)];
 });
 for(const [i,expected] of [[128,128,128,64],[192,128,128,64],[48,32,32,255],[128,0,128,64],[255,255,255,255]].entries())for(let ch=0;ch<4;ch++)assert.ok(Math.abs(pixels[i][ch]-expected[ch])<=2,`${i}: ${pixels[i]}`);
});

test('sprite flow, inverse-color soul cutout, alpha grate and masked star surface compose in native order',async()=>{
 const pixels=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');
  const atlas=document.createElement('canvas');atlas.width=2;atlas.height=1;const a=atlas.getContext('2d');a.fillStyle='rgb(64,64,64)';a.fillRect(0,0,1,1);a.fillStyle='white';a.fillRect(1,0,1,1);
  const canvas=document.createElement('canvas');canvas.width=4;canvas.height=1;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  const sprite=name=>({originX:0,originY:0,width:1,height:1,frames:[{page:0,sx:name==='flow'?0:1,sy:0,sw:1,sh:1,tx:0,ty:0,tw:1,th:1}]});
  const g=new CanvasGraphics(ctx,{pages:[atlas],sprite,font:()=>undefined},{x:30,y:40});g.surfaceClear(0,1);
  g.surfaceCreate(1,4,1);g.surfaceCreate(2,4,1);g.surfaceTarget(1);g.surfaceClear(0,0);g.rect(0,0,2,0,0x202020,1);
  g.alphaTest(true);g.blendMode('add-preserve-alpha');g.sprite('flow',0,0,0,4,1,0,0xffffff,1);
  g.blendMode('subtract');g.sprite('white',0,0,0,1,1,0,0xffffff,1);
  g.surfaceTarget(2);g.surfaceClear(0,0);g.blendMode('normal');g.sprite('white',0,1,0,1,1,0,0xffffff,1);g.sprite('white',0,3,0,1,1,0,0xffffff,1);
  g.blendMode('subtract');g.sprite('white',0,1,0,1,1,0,0,1);
  g.blendMode('normal');g.sprite('white',0,2,0,1,1,0,0xffffff,1);
  g.surfaceTarget(1);g.blendMode('normal-preserve-alpha');g.surfaceDraw(2,0,0,1);
  g.alphaTest(false);g.blendMode('add');g.surfaceTarget(null);g.surfaceDraw(1,30,40,1);
  return Array.from(ctx.getImageData(0,0,4,1).data);
 });
 assert.deepEqual(pixels,[0,0,0,255,96,96,96,255,255,255,255,255,0,0,0,255]);
});

test('triangle winding, pixel-center coverage and shared edges leave no seam or double blend',async()=>{
 const pixels=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');
  const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;const ctx=canvas.getContext('2d');
  const g=new CanvasGraphics(ctx,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:0,y:0});g.surfaceClear(0,1);g.blendMode('add');
  g.triangleColor(0,0,4,0,0,4,0x404040,0x404040,0x404040,1);
  // Opposite winding; a shared diagonal crosses four pixel centers.
  g.triangleColor(4,0,0,4,4,4,0x404040,0x404040,0x404040,1);
  return Array.from(ctx.getImageData(0,0,4,4).data);
 });
 assert.deepEqual(pixels,Array.from({length:16},()=>[64,64,64,255]).flat());
});

test('surface copies preserve hidden RGB independently of blend mode and active target',async()=>{
 const result=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;
  const g=new CanvasGraphics(canvas.getContext('2d'),{pages:[],sprite:()=>undefined,font:()=>undefined},{x:50,y:60});
  g.surfaceClear(0x302010,1);g.surfaceCreate(1,4,4);g.surfaceCreate(2,4,4);g.surfaceTarget(1);g.surfaceClear(0xff0000,0);
  g.blendMode('subtract');g.surfaceCopy(2,0,0,1);g.surfaceTarget(2);g.blendMode('normal');g.rect(0,0,0,0,0x0000ff,.5);
  const hidden=Array.from(g.ctx.getImageData(0,0,1,1).data);
  g.surfaceCopy(1,1,1,null);g.surfaceTarget(1);return [hidden,Array.from(g.ctx.getImageData(1,1,1,1).data)];
 });
 for(let c=0;c<4;c++)assert.ok(Math.abs(result[0][c]-[128,0,128,64][c])<=2);assert.deepEqual(result[1],[16,32,48,255]);
});

test('surface part samples raw pixels with crop, mirror, tint and screen coordinates',async()=>{
 const actual=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');canvas.width=4;canvas.height=2;const ctx=canvas.getContext('2d');
  const g=new CanvasGraphics(ctx,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:50,y:60});g.surfaceClear(0,1);g.surfaceCreate(1,3,1);g.surfaceTarget(1);g.surfaceClear(0,0);
  g.rect(0,0,0,0,0x0000ff,1);g.rect(1,0,1,0,0x00ff00,1);g.rect(2,0,2,0,0xffffff,1);
  g.surfaceTarget(null);g.surfacePart(1,1,0,2,1,52,60,-1,1,0x808080,1);g.surfaceDraw(1,50,61,1,0x0000ff);
  return Array.from(ctx.getImageData(0,0,4,2).data);
 });
 assert.deepEqual(actual,[128,128,128,255,0,128,0,255,0,0,0,255,0,0,0,255,255,0,0,255,0,0,0,255,255,0,0,255,0,0,0,255]);
});

test('destination-alpha factors and opaque subtract triangles work without alpha testing',async()=>{
 const actual=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;const ctx=canvas.getContext('2d');
  const g=new CanvasGraphics(ctx,{pages:[],sprite:()=>undefined,font:()=>undefined},{x:0,y:0}),out=[];
  for(const mode of ['dest-alpha-add','dest-alpha-copy']){g.surfaceClear(0x202020,.5);g.blendMode(mode);g.rect(0,0,0,0,0x404040,1);out.push(Array.from(ctx.getImageData(0,0,1,1).data));}
  g.surfaceClear(0xffffff,1);g.blendMode('subtract');g.triangle(0,0,4,0,0,4,0xffffff,1,false);out.push(Array.from(ctx.getImageData(0,0,1,1).data));out.push(Array.from(ctx.getImageData(3,3,1,1).data));return out;
 });
 for(const [i,expected] of [[48,48,48,192],[32,32,32,128],[0,0,0,0],[255,255,255,255]].entries())for(let c=0;c<4;c++)assert.ok(Math.abs(actual[i][c]-expected[c])<=2,`${i}: ${actual[i]}`);
});

test('small offscreen draws rasterize clipped bounds instead of reading the full target each time',async()=>{
 const actual=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;
  const atlas=document.createElement('canvas');atlas.width=atlas.height=32;const a=atlas.getContext('2d');a.fillStyle='white';a.fillRect(0,0,32,32);
  const sprite={originX:16,originY:16,width:32,height:32,frames:[{page:0,sx:0,sy:0,sw:32,sh:32,tx:0,ty:0,tw:32,th:32}]};const g=new CanvasGraphics(canvas.getContext('2d'),{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:0,y:0});
  g.surfaceCreate(1,640,480);g.surfaceTarget(1);g.surfaceClear(0,0);g.sprite('star',0,100,200,1,1,0,0xffffff,1);return [g.scratch?.width??0,g.scratch?.height??0,Array.from(g.ctx.getImageData(100,200,1,1).data)];
 });
 assert.ok(actual[0]<=34&&actual[1]<=34,`${actual}`);assert.deepEqual(actual[2],[255,255,255,255]);
});

test('tiled sprites retain frame zero by default and allow explicit frame two',async()=>{
 const result=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');canvas.width=canvas.height=4;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  const atlas=document.createElement('canvas');atlas.width=3;atlas.height=1;const a=atlas.getContext('2d');for(const [i,color] of ['red','green','blue'].entries()){a.fillStyle=color;a.fillRect(i,0,1,1);}
  const sprite={originX:0,originY:0,width:1,height:1,frames:[0,1,2].map(sx=>({page:0,sx,sy:0,sw:1,sh:1,tx:0,ty:0,tw:1,th:1}))};const g=new CanvasGraphics(ctx,{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:0,y:0});
  g.spriteTiled('flow',0,0,1,1,0xffffff,1);const first=Array.from(ctx.getImageData(0,0,1,1).data);g.spriteTiled('flow',0,0,1,1,0xffffff,1,2);return [first,Array.from(ctx.getImageData(0,0,1,1).data)];
 });assert.deepEqual(result,[[255,0,0,255],[0,0,255,255]]);
});

test('direct point-sampled sprite blending preserves trimmed origins, mirrored and fractional scales, tint and alpha',async()=>{
 const actual=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');canvas.width=8;canvas.height=8;
  const atlas=document.createElement('canvas');atlas.width=4;atlas.height=2;const a=atlas.getContext('2d');for(const [x,y,color] of [[1,0,'red'],[2,0,'lime'],[1,1,'blue'],[2,1,'white']]){a.fillStyle=color;a.fillRect(x,y,1,1);}
  const sprite={originX:2,originY:2,width:4,height:4,frames:[{page:0,sx:1,sy:0,sw:2,sh:2,tx:1,ty:1,tw:2,th:2}]};const g=new CanvasGraphics(canvas.getContext('2d'),{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:70,y:80});
  g.surfaceCreate(1,8,8);g.surfaceTarget(1);g.surfaceClear(0,0);g.sprite('trimmed',0,4,4,-2,1.5,0,0x808080,.5);return Array.from(g.ctx.getImageData(2,2,4,3).data);
 });
 const row=[0,64,0,64,0,64,0,64,64,0,0,64,64,0,0,64],last=[64,64,64,64,64,64,64,64,0,0,64,64,0,0,64,64];
 const expected=[...row,...row,...last];for(let i=0;i<expected.length;i++)assert.ok(Math.abs(actual[i]-expected[i])<=1,`${i}: ${actual[i]}`);
});

test('verified transparent black texels retain tiled coverage for destination-alpha blending; unverified data is rejected',async()=>{
 const result=await page.evaluate(async()=>{
  const {CanvasGraphics}=await import('/src/remake/host/canvas.ts');const canvas=document.createElement('canvas');canvas.width=4;canvas.height=1;
  const atlas=document.createElement('canvas');atlas.width=2;atlas.height=1;const a=atlas.getContext('2d');a.fillStyle='white';a.fillRect(0,0,1,1);
  const frame={page:0,sx:0,sy:0,sw:2,sh:1,tx:0,ty:0,tw:2,th:1,alphaZeroRgb:'black'},sprite={originX:0,originY:0,width:2,height:1,frames:[frame]};
  const g=new CanvasGraphics(canvas.getContext('2d'),{pages:[atlas],sprite:()=>sprite,font:()=>undefined},{x:0,y:0});g.surfaceCreate(1,4,1);g.surfaceTarget(1);g.surfaceClear(0x808080,.5);g.blendMode('dest-alpha-add');g.spriteTiled('flow',0,0,1,1,0xffffff,1);
  const pixels=Array.from(g.ctx.getImageData(0,0,4,1).data);delete frame.alphaZeroRgb;let error='';try{g.spriteTiled('flow',0,0,1,1,0xffffff,1);}catch(e){error=String(e);}return {pixels,error};
 });
 const expected=[192,192,192,192,64,64,64,64,192,192,192,192,64,64,64,64];for(let i=0;i<expected.length;i++)assert.ok(Math.abs(result.pixels[i]-expected[i])<=2,`${i}: ${result.pixels[i]}`);assert.match(result.error,/verified raw atlas RGB/);
});
