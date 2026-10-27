import {test,expect} from '@playwright/test';
test('public Hammer card launches solo Susie through preparation and keyboard combat',async({page})=>{
 test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1');for(const label of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name:label,exact:true}).click();
 await page.getByRole('button',{name:'Chapter 4',exact:true}).click();await page.locator('#boss-select').selectOption('ch4-160');await page.getByRole('button',{name:/^Battle .* ch4-160$/}).click();
 const start=page.getByRole('button',{name:'START BATTLE',exact:true});await expect(start).toBeEnabled();await start.click();await expect(page.locator('#status')).toContainText('Hammer of Justice',{timeout:25000});await expect(page.locator('#loading')).toBeHidden();
 for(let i=0;i<12;i++){await page.keyboard.press('z');await page.waitForTimeout(140);}
 await expect(page.locator('#error')).toBeHidden();await expect(page.locator('#status')).toContainText(/attack|enemy|battle/i);expect(errors).toEqual([]);await page.locator('#screen').screenshot({path:'test-results/hammer-release.png'});
});
