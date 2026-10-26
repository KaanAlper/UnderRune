import {test,expect} from '@playwright/test';

test('development weather card runs its introduction, merged ACTs and first enemy turn',async({page})=>{
 test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?demo=1&dev=1&seed=11');
 for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device','Chapter 3'])await page.getByRole('button',{name,exact:true}).click();
 await page.locator('#boss-select').selectOption('ch3-113');await page.getByRole('button',{name:/^Battle .* ch3-113$/}).click();
 await page.getByRole('button',{name:'START BATTLE',exact:true}).click();
 await expect(page.locator('.prep-feedback')).not.toContainText(/Missing|not ported|not implemented|requires|failed|unknown|unavailable|never|needs/i,{timeout:20000});
 const status=page.locator('#status');await expect(status).toContainText('Lanino & Elnina',{timeout:20000});
 for(let i=0;i<55;i++){
  expect(await page.locator('#error-text').textContent()).toBe('');expect(errors).toEqual([]);
  const intro=await page.evaluate(()=>(window as any).__underrune.inspect()?.rt.instances.find((i:any)=>i.live&&i.object.name==='obj_elnina_lanino_controller')?.intro);
  if(intro===4)break;await page.keyboard.press('z');await page.waitForTimeout(150);
 }
 await expect.poll(()=>page.evaluate(()=>(window as any).__underrune.inspect()?.rt.instances.find((i:any)=>i.live&&i.object.name==='obj_elnina_lanino_controller')?.intro)).toBe(4);
 await expect(status).toContainText('command');await page.locator('#screen').screenshot({path:'test-results/weather-command.png'});
 const names=await page.evaluate(()=>(window as any).__underrune.inspect().rt.globals.battlespellname.map((row:string[])=>row[0]));expect(names[1]).toBe(names[2]);
 // Recording-only survival HP lets the first complete turn test real collisions without ending the test early.
 await page.evaluate(()=>{const g=(window as any).__underrune.inspect().rt.globals;for(const c of [1,2,3])g.hp[c]=g.maxhp[c]=99999;});
 for(let i=0;i<100&&!(await status.textContent())?.includes('enemy attack');i++){await page.keyboard.press('z');await page.waitForTimeout(120);}
 await expect(status).toContainText('enemy attack',{timeout:10000});await page.waitForTimeout(1500);
 await page.locator('#screen').screenshot({path:'test-results/weather-attack.png'});
 await expect.poll(()=>page.evaluate(()=>(window as any).__underrune.inspect()?.rt.globals.mnfight),{timeout:25000}).toBe(0);
 expect(await page.locator('#error-text').textContent()).toBe('');expect(errors).toEqual([]);
});
