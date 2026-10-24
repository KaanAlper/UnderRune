import {test,expect} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
for(const [id,name] of [['ch2-71','Clover'],['ch2-62',"Sweet & K_K & Cap'n"],['ch2-84','GIGA Queen']]){
 test(`public ${name} opens from its card and accepts battle preparation`,async({page})=>{
  test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);for(const label of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name:label,exact:true}).click();
  await page.getByRole('button',{name:'Chapter 2',exact:true}).click();await page.locator('#boss-select').selectOption(id);
  await page.getByRole('button',{name:new RegExp(`^Battle .* ${id}$`)}).click();
  const start=page.getByRole('button',{name:'START BATTLE',exact:true});await expect(start).toBeEnabled();await start.click();
  await expect(page.locator('#status')).toContainText(name,{timeout:20000});await expect(page.locator('#loading')).toBeHidden();
  await page.waitForTimeout(2500);await expect(page.locator('#error')).toBeHidden();expect(errors).toEqual([]);
 });
}
