import {readFileSync} from 'node:fs';
import {test,expect} from '@playwright/test';
test('the preceding published index can still lazy-load Knight after deployment',async({page})=>{
 test.skip(!process.env.UNDERRUNE_OLD_INDEX,'An actual preceding release index is required');test.setTimeout(60000);
 const url=process.env.UNDERRUNE_PUBLIC_URL!;const html=readFileSync(process.env.UNDERRUNE_OLD_INDEX!,'utf8'),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(url.replace(/\?.*$/,''),r=>r.fulfill({contentType:'text/html',body:html}));await page.goto(url.replace(/\?.*$/,''));
 for(const label of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name:label,exact:true}).click();await page.getByRole('button',{name:'Chapter 3',exact:true}).click();await page.locator('#boss-select').selectOption('ch3-115');await page.getByRole('button',{name:/^Battle .* ch3-115$/}).click();await page.getByRole('button',{name:'START BATTLE',exact:true}).click();await expect(page.locator('#status')).toContainText('Roaring Knight',{timeout:25000});await expect(page.locator('#loading')).toBeHidden();await expect(page.locator('#error')).toBeHidden();expect(errors).toEqual([]);
});
