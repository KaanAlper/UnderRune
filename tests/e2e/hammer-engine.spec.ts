import {test,expect} from '@playwright/test';
test('Hammer source actor graph renders box transformations and late attacks in the real host',async({page})=>{
 test.setTimeout(180000);
 await page.route('**/__hammer_engine',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0;background:black"><canvas id="probe" width="640" height="480"></canvas></body></html>'}));await page.goto('/__hammer_engine');
 const result=await page.evaluate(async()=>{
  const paths=['/src/remake/host/assets.ts','/src/remake/host/engine.ts','/src/remake/host/chapter4-bosses.ts','/src/remake/host/canvas.ts','/src/remake/host/text.ts','/src/game/loadout.ts','/src/remake/bosses/hammer-of-justice/patterns.ts'];
  const [{loadRemakeAssets},{EngineBattle},{installChapter4BossHost},{CanvasGraphics},{setSourceText},{defaultLoadout},{buildHammerPattern}]=await Promise.all(paths.map(p=>import(p)));
  const assets=await loadRemakeAssets(4);setSourceText(assets.text);const canvas=document.querySelector('#probe') as HTMLCanvasElement,ctx=canvas.getContext('2d',{alpha:false})!;ctx.imageSmoothingEnabled=false;
  const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]},equipment={weapons:[gear],armors:[gear],items:[],bagCapacity:12},missing:string[]=[],samples:any[]=[];
  for(const turn of [5,10,20]){
   let objects:any;const b=new EngineBattle(assets.bank,equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:(r:any,o:any)=>{const h=installChapter4BossHost(r,o);objects=h.objects;return h;}}),rt=b.rt,g=rt.globals,gfx=new CanvasGraphics(ctx,assets.draw,rt.view);rt.gfx=gfx;
   for(const method of ['drawSprite','drawSpriteFog'] as const){const draw=rt[method].bind(rt);rt[method]=(name:string,...args:any[])=>{if(name&&!gfx.assets.sprite(name)&&!missing.includes(name))missing.push(name);return draw(name,...args);};}
   for(let f=0;f<50;f++)b.step();const enemy=rt.instances.find((s:any)=>s.live&&s.object.name==='obj_hammer_of_justice_enemy');
   // Unscored actor fixture; source queue and native actor/renderer contracts are the subject of this test.
   Object.assign(enemy,{turn:0,trueturn:0,introtalkcon:-1,talked:1,attacked:1,attackcon:1});for(let i=0;i<=turn;i++)buildHammerPattern(enemy,rt);g.myfight=-1;g.mnfight=2;g.turntimer=9999;
   for(const w of rt.instances.filter((s:any)=>s.live&&s.object.name==='obj_writer'))rt.destroy(w);rt.create(objects.obj_growtangle,320,170);rt.create(objects.obj_heart,310,160);
   const times:number[]=[];let count=0;for(let f=0;f<950;f++){g.hp[2]=g.maxhp[2];rt.input.pressed=new Set(f%8===0?[90,67]:[]);rt.input.held=new Set([38]);ctx.fillStyle='black';ctx.fillRect(0,0,640,480);const t=performance.now();b.step();rt.draw();times.push(performance.now()-t);count=Math.max(count,enemy.attackcount);}
   times.sort((a,b)=>a-b);samples.push({turn,p95:times[Math.floor(times.length*.95)],count});
  }return {missing,samples};
 });
 await page.locator('#probe').screenshot({path:'test-results/hammer-engine.png'});expect(result.missing).toEqual([]);expect(result.samples.every((s:any)=>s.count>0)).toBe(true);console.log('Hammer graph rendering',JSON.stringify(result));
});
