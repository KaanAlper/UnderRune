import {test,expect} from '@playwright/test';

test('public weather battle loads its source music and reaches a visible attack without development hooks',async({page})=>{
 test.setTimeout(90000);const errors:string[]=[],missing:string[]=[],tracks=new Set<string>();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().includes('/generated/')&&r.status()>=400)missing.push(r.url());if(r.url().includes('/music/'))tracks.add(r.url());});
 await page.goto((process.env.UNDERRUNE_RELEASE_URL??'/')+'?demo=1&seed=11');
 for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device','Chapter 3'])await page.getByRole('button',{name,exact:true}).click();
 await page.locator('#boss-select').selectOption('ch3-113');await page.getByRole('button',{name:/^Battle .* ch3-113$/}).click();
 await page.getByRole('button',{name:'START BATTLE',exact:true}).click();
 const status=page.locator('#status');await expect(status).toContainText('Lanino & Elnina',{timeout:20000});
 for(let i=0;i<160&&!(await status.textContent())?.includes('enemy attack');i++){
  expect(errors).toEqual([]);expect(await page.locator('#error-text').textContent()).toBe('');
  await page.keyboard.press('z');await page.waitForTimeout(120);
 }
 await expect(status).toContainText('enemy attack');await page.waitForTimeout(1700);
 await page.locator('#screen').screenshot({path:'test-results/weather-public-attack.png'});
 expect([...tracks].some(url=>url.includes('rudebuster_boss.ogg'))).toBe(true);expect(missing).toEqual([]);expect(errors).toEqual([]);
});
