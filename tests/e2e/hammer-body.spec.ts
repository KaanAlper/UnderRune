import {test,expect} from '@playwright/test';
test('Hammer body layers and source Draw transitions render against Chapter 4 atlases',async({page})=>{
 test.setTimeout(60000);
 await page.route('**/__hammer_body',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0;background:black"><canvas id="probe" width="640" height="480"></canvas></body></html>'}));await page.goto('/__hammer_body');
 const result=await page.evaluate(async()=>{
  const paths=['/src/remake/host/assets.ts','/src/remake/gm/runtime.ts','/src/remake/host/canvas.ts','/src/remake/bosses/hammer-of-justice/init.ts','/src/remake/bosses/hammer-of-justice/draw.ts','/src/remake/host/chapter4-resources.json','/src/remake/host/text.ts'];
  const [{loadRemakeAssets},{GmRuntime},{CanvasGraphics},{initializeHammer},{drawHammer},meta,{setSourceText}]=await Promise.all(paths.map(p=>import(p)));
  const assets=await loadRemakeAssets(4);setSourceText(assets.text);
  const canvas=document.querySelector('#probe') as HTMLCanvasElement,ctx=canvas.getContext('2d')!,missing:string[]=[],times:number[]=[],samples:any[]=[];
  for(const state of [0,3,10,11,12,13,14]){
   const rt=new GmRuntime(assets.bank,{seed:45}),defs=new Map(meta.default.map((d:any)=>[d.name,{...d,parent:undefined,sprite:d.sprite??undefined,mask:d.mask??undefined}]));for(const d of meta.default)if(d.parent)(defs.get(d.name) as any).parent=defs.get(d.parent);
   const object=(name:string)=>defs.get(name) as any;
   rt.globals={chapter:4,invc:1,spell:[[],[],Array(12).fill(0)],flag:Array(9999).fill(0),mercymod:[0],mercymax:[100],turntimer:500,chartarget:[0],monsterx:[460],monstery:[161]};
   rt.create(object('obj_battlecontroller'),0,0);const s=rt.create(object('obj_hammer_of_justice_enemy'),460,161);initializeHammer(s,rt,object);Object.assign(s,{myself:0,state,flash:1,becomeflash:1,saverudebusterstarcount:8,motor_swing_down:99});
   const gfx=new CanvasGraphics(ctx,assets.draw,rt.view);rt.gfx=gfx;
   for(const method of ['drawSprite','drawSpriteFog'] as const){const draw=rt[method].bind(rt);rt[method]=(name:string,...args:any[])=>{if(name&&!gfx.assets.sprite(name)&&!missing.includes(name))missing.push(name);return draw(name,...args);};}
   // Isolated source Draw component: audio, shake and tension integrations are recorded boundaries.
   const calls:any[]=[],scripts={play:(_s:any,...a:any[])=>{calls.push(['play',...a]);return 3;},stop:(_s:any,...a:any[])=>{calls.push(['stop',...a]);},shakeObject:()=>calls.push(['shake']),tensionHeal:(_s:any,n:number)=>calls.push(['tension',n])};
   for(let f=0;f<75;f++){ctx.fillStyle='#000';ctx.fillRect(0,0,640,480);const start=performance.now();drawHammer(s,rt,object,scripts);times.push(performance.now()-start);}
   const data=ctx.getImageData(0,0,640,480).data;let visible=0;for(let i=0;i<data.length;i+=4)if(data[i]+data[i+1]+data[i+2]>0)visible++;
   samples.push({state,visible,finalState:s.state,spawned:rt.instances.length,calls:calls.length});
  }
  return {missing,samples,p95:times.sort((a,b)=>a-b)[Math.floor(times.length*.95)]};
 });
 await page.locator('#probe').screenshot({path:'test-results/hammer-body.png'});
 expect(result.missing).toEqual([]);expect(result.samples.every((s:any)=>s.visible>1000)).toBe(true);expect(result.samples.filter((s:any)=>[10,11,12,13,14].includes(s.state)).every((s:any)=>s.finalState===0)).toBe(true);expect(result.p95).toBeLessThan(50);console.log('Hammer body rendering',result);
});
