import {test,expect} from '@playwright/test';
test('green shield blocks live source spears and unblocked spears reach the damage integration',async({page})=>{
 test.setTimeout(60000);await page.route('**/__hammer_spear',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0;background:black"><canvas id="probe" width="640" height="480"></canvas></body></html>'}));await page.goto('/__hammer_spear');
 const result=await page.evaluate(async()=>{
  const paths=['/src/remake/host/assets.ts','/src/remake/gm/runtime.ts','/src/remake/host/canvas.ts','/src/remake/bosses/hammer-of-justice/shield.ts','/src/remake/bosses/hammer-of-justice/projectile.ts','/src/remake/bosses/hammer-of-justice/spear-shot.ts','/src/remake/host/chapter4-resources.json'];
  const [{loadRemakeAssets},{GmRuntime},{CanvasGraphics},{createHammerShield},{createHammerProjectile},{spawnHammerSpear},meta]=await Promise.all(paths.map(p=>import(p)));
  const assets=await loadRemakeAssets(4),canvas=document.querySelector('#probe') as HTMLCanvasElement,ctx=canvas.getContext('2d')!,missing:string[]=[],cases:any[]=[];
  for(const input of [38,40]){
   const rt=new GmRuntime(assets.bank,{seed:14}),defs=new Map(meta.default.map((d:any)=>[d.name,{...d,parent:undefined,sprite:d.sprite??undefined,mask:d.mask??undefined}]));for(const d of meta.default)if(d.parent)(defs.get(d.name) as any).parent=defs.get(d.parent);
   for(const n of ['obj_heart','obj_growtangle','obj_battlecontroller','obj_hammer_of_justice_enemy'])(defs.get(n) as any).visible=false;
   const object=(n:string)=>defs.get(n) as any,calls:any[]=[],scripts={play:()=>3,playAt:()=>4,playPitch:()=>5,stop:()=>{},shakeObject:()=>{},tensionHeal:(_s:any,n:number)=>calls.push(['tp',n]),damage:(s:any)=>calls.push(['damage',s.damage,s.target]),triggerEvent:()=>{throw Error('Unexpected event manager call in ordinary spear test');},afterimage:(s:any)=>rt.create(object('obj_afterimage'),s.x,s.y).id};
   for(const d of createHammerShield(object))defs.set(d.name,d);const spear=createHammerProjectile(object,scripts);defs.set(spear.name,spear);
   rt.globals={chapter:4,hp:[0,0,230],turntimer:500,inv:0,monsterat:[14],monsterattackname:['']};
   rt.create(object('obj_heart'),310,160);rt.create(object('obj_growtangle'),320,170);const owner=rt.create(object('obj_hammer_of_justice_enemy'),460,161);Object.assign(owner,{myself:0,mytarget:1,diagonal_enabled:0,transformsfx:0});rt.create(object('obj_spearblocker'),320,170);
   rt.gfx=new CanvasGraphics(ctx,assets.draw,rt.view);for(const method of ['drawSprite','drawSpriteFog'] as const){const draw=rt[method].bind(rt);rt[method]=(name:string,...args:any[])=>{if(name&&!rt.gfx.assets.sprite(name)&&!missing.includes(name))missing.push(name);return draw(name,...args);};}
   spawnHammerSpear(owner,rt,object,scripts,270,5,30,0);rt.input.held.add(input);rt.input.pressed.add(input);const times:number[]=[];
   for(let f=0;f<55;f++){ctx.fillStyle='#000';ctx.fillRect(0,0,640,480);const start=performance.now();rt.step();rt.draw();times.push(performance.now()-start);rt.input.pressed.clear();}
   cases.push({input,damage:calls.filter(c=>c[0]==='damage'),tp:calls.filter(c=>c[0]==='tp'),remaining:rt.all(spear).length,p95:times.sort((a,b)=>a-b)[Math.floor(times.length*.95)]});
  }
  return {missing,cases};
 });
 expect(result.missing).toEqual([]);expect(result.cases[0].damage).toEqual([]);expect(result.cases[0].tp.length).toBeGreaterThan(0);expect(result.cases[1].damage.length).toBe(1);expect(result.cases.every((c:any)=>c.remaining===0&&c.p95<50)).toBe(true);console.log('Hammer live spear component',result);
});
