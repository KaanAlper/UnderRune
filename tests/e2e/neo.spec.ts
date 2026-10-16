import {test,expect} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1&seed=11';
test('NEO opens the coaster battle, takes a complete yellow-soul turn, and can switch chapters',async({page})=>{
 test.setTimeout(90000);const errors:string[]=[],native:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/native\/|\.wasm|data\.win/.test(r.url()))native.push(r.url());});
 await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 2',exact:true}).click();
 await page.locator('#boss-select').selectOption('ch2-61');await page.getByRole('button',{name:'Battle Spamton NEO ch2-61',exact:true}).click();
 await page.getByRole('dialog',{name:'Choose route',exact:true}).getByRole('button',{name:'Normal route',exact:true}).click();
 const prep=page.getByRole('dialog',{name:'Spamton NEO'});await expect(prep).toBeVisible();await prep.getByRole('button',{name:'START BATTLE',exact:true}).click();
 await expect.poll(async()=>JSON.stringify({status:await page.locator('#status').textContent(),errors,error:await page.locator('#error').textContent(),feedback:await page.locator('.prep-feedback').textContent()}),{timeout:20000}).toContain('Spamton NEO / command');await page.waitForTimeout(700);
 await page.locator('#screen').screenshot({path:'test-results/neo-commands.png'});
 for(let slot=0;slot<3;slot++){await page.keyboard.press('ArrowLeft');await page.waitForTimeout(180);await page.keyboard.press('z');await page.waitForTimeout(180);}
 await expect(page.locator('#status')).toContainText('enemy talk');
 for(let i=0;i<15&&!((await page.locator('#status').textContent())??'').includes('enemy attack');i++){await page.waitForTimeout(650);await page.keyboard.press('c');}
 await expect(page.locator('#status')).toContainText('enemy attack');await page.waitForTimeout(600);
 // Observe the actual atlas frame drawn by the public app, rather than injecting runtime release events.
 await page.evaluate(async()=>{
  const bundle=await (await fetch(new URL('./generated/remake/ch2/bundle.json',location.href))).json();
  for(const [name,border] of [['spr_battlebg_stretch',2],['spr_battlebg_stretch_hitbox',4]] as const){
   const slice=bundle.sprites.find((s:any)=>s.name===name)?.nineSlice;
   if(!slice?.enabled||['left','top','right','bottom'].some(k=>slice[k]!==border)||slice.tileModes.some((m:number)=>m!==0))
    throw Error(`Original nine-slice metadata is absent from the public bundle: ${name}`);
  }
  const sprite=bundle.sprites.find((s:any)=>s.name==='spr_yheart_bigshot');
  if(!sprite?.frameRects?.some(Boolean))throw Error('BIG SHOT sprite is absent from the public bundle');
  const frames=sprite.frameRects.filter(Boolean),draw=CanvasRenderingContext2D.prototype.drawImage;
  (window as any).__bigShotDraws=0;
  CanvasRenderingContext2D.prototype.drawImage=function(...args:any[]){
   if(args.length===9&&args[0] instanceof HTMLImageElement&&frames.some((f:any)=>args[1]===f.sx&&args[2]===f.sy&&args[3]===f.sw&&args[4]===f.sh))
    (window as any).__bigShotDraws+=1;
   return (draw as any).apply(this,args);
  } as typeof draw;
 });
 await page.keyboard.down('z');await page.waitForTimeout(900);
 expect(await page.evaluate(()=>(window as any).__bigShotDraws)).toBe(0);
 // Public Normal route uses one logical shoot action; the independent-release exploit is staged for Weird.
 await page.keyboard.down('Enter');await page.waitForTimeout(100);await page.keyboard.up('Enter');
 await page.waitForTimeout(100);expect(await page.evaluate(()=>(window as any).__bigShotDraws)).toBe(0);
 await page.keyboard.up('z');
 await expect.poll(()=>page.evaluate(()=>(window as any).__bigShotDraws),{timeout:1500}).toBeGreaterThan(0);
 await page.locator('#screen').screenshot({path:'test-results/neo-yellow-soul.png'});
 await expect(page.locator('#status')).toContainText('Spamton NEO / command / TURN 2',{timeout:34000});await expect(page.locator('#outcome')).toBeHidden();
 await page.getByRole('button',{name:'Device menu',exact:true}).click();await page.keyboard.press('x');await page.getByRole('button',{name:'Chapter 1',exact:true}).click();await page.locator('#boss-select').selectOption('ch1-2');await page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true}).click();await page.getByRole('button',{name:'START BATTLE',exact:true}).click();await expect(page.locator('#status')).toContainText('Lancer / command');
 expect(errors).toEqual([]);expect(native).toEqual([]);
});
