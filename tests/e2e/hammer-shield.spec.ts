import {test,expect} from '@playwright/test';
test('Chapter 4 green-soul shield renders with mutable origins and cleans up its diagonal transform',async({page})=>{
 test.setTimeout(60000);await page.route('**/__hammer_shield',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0;background:black"><canvas id="probe" width="640" height="480"></canvas></body></html>'}));await page.goto('/__hammer_shield');
 const result=await page.evaluate(async()=>{
  const assetPath='/src/remake/host/assets.ts',runtimePath='/src/remake/gm/runtime.ts',graphicsPath='/src/remake/host/canvas.ts',shieldPath='/src/remake/bosses/hammer-of-justice/shield.ts',battlePath='/src/remake/deltarune/battle.ts',metaPath='/src/remake/host/chapter4-resources.json';
  const [{loadRemakeAssets},{GmRuntime},{CanvasGraphics},{createHammerShield},{heart,grazebox},meta]=await Promise.all([import(assetPath),import(runtimePath),import(graphicsPath),import(shieldPath),import(battlePath),import(metaPath)]);
  const assets=await loadRemakeAssets(4),canvas=document.querySelector('#probe') as HTMLCanvasElement,ctx=canvas.getContext('2d')!,rt=new GmRuntime(assets.bank,{seed:11}),defs=new Map<string,any>([[heart.name,heart],[grazebox.name,grazebox]]);
  // Component fixture only: the boss/box test doubles supply source actor fields, not battle behavior.
  const object=(name:string)=>{if(!defs.has(name)){const m=meta.default.find((m:any)=>m.name===name);defs.set(name,{name,index:m.index,sprite:m.sprite??undefined,depth:m.depth});}return defs.get(name);};
  for(const d of createHammerShield(object))defs.set(d.name,d);
  const gfx=new CanvasGraphics(ctx,assets.draw,rt.view);rt.gfx=gfx;rt.globals={chapter:4,char:[2,0,0],chararmor1:[0,0,0,0],chararmor2:[0,0,0,0],flag:Array(9999).fill(0),inv:-1,invc:1,turntimer:500,tension:0,maxtension:250};
  const boss=rt.create({...object('obj_hammer_of_justice_enemy'),visible:false},460,161);boss.diagonal_enabled=0;boss.transformsfx=0;
  // Use the same object identity read by the source shield factory.
  defs.set('obj_hammer_of_justice_enemy',boss.object);
  const box=rt.create(object('obj_growtangle'),320,170),soul=rt.create(heart,310,160),shield=rt.create(object('obj_spearblocker'),320,170),missing:string[]=[],times:number[]=[];
  const draw=rt.drawSprite.bind(rt);rt.drawSprite=(name:string,...args:any[])=>{if(name&&!gfx.assets.sprite(name)&&!missing.includes(name))missing.push(name);return draw(name,...args);};
  for(let f=0;f<150;f++){
   rt.input.held.clear();rt.input.pressed.clear();const key=[38,39,40,37][Math.floor(f/12)%4];rt.input.held.add(key);if(f%12===0)rt.input.pressed.add(key);
   if(f===40)shield.diagonal_transform=1;if(f===80){shield.justflash=1;rt.userEvent(shield,1);}box.x=320+Math.sin(f/20)*20;
   ctx.fillStyle='#000';ctx.fillRect(0,0,640,480);const before=performance.now();rt.step();rt.draw();times.push(performance.now()-before);
  }
  const pixels=ctx.getImageData(0,0,640,480).data;let visible=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]+pixels[i+1]+pixels[i+2]>0)visible++;
  const transformed=[rt.bank.get('spr_spearblocker').originX,gfx.assets.sprite('spr_spearblocker').originX];rt.destroy(shield);
  return {missing,visible,transformed,restored:[rt.bank.get('spr_spearblocker').originX,gfx.assets.sprite('spr_spearblocker').originX],color:soul.color,p95:times.sort((a,b)=>a-b)[Math.floor(times.length*.95)]};
 });
 await page.locator('#probe').screenshot({path:'test-results/hammer-green-shield.png'});expect(result.missing).toEqual([]);expect(result.visible).toBeGreaterThan(300);expect(result.color).toBe(2);expect(result.transformed).toEqual([27,27]);expect(result.restored).toEqual([32,32]);expect(result.p95).toBeLessThan(50);console.log('Hammer shield rendering',result);
});
