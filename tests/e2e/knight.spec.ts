import {test,expect} from '@playwright/test';

// The Knight's card, through the development entry point (the public one is the same battle).
test('Roaring Knight card opens and plays out its first Stars turn',async({page})=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.UNDERRUNE_DEV_URL??'/')+'?demo=1&dev=1&seed=11');
 await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();
 await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 3',exact:true}).click();
 await page.locator('#boss-select').selectOption('ch3-115');
 await page.getByRole('button',{name:/^Battle .* ch3-115$/}).click();await page.getByRole('button',{name:'START BATTLE'}).click();
 const status=page.locator('#status');await expect(async()=>{
  expect(await page.locator('#error-text').textContent()).toBe('');expect(await page.locator('.prep-feedback').textContent()).not.toMatch(/failed|requires|not |undefined|unavailable|never|chapter|needs/i);expect(errors).toEqual([]);await expect(status).toContainText('Roaring Knight / command',{timeout:1000});
 }).toPass({timeout:20000});
 await page.locator('#screen').screenshot({path:'test-results/knight-command.png'});
 for(let i=0;i<80&&!(await status.textContent())?.includes('enemy attack');i++){await page.keyboard.press('z');await page.waitForTimeout(200);}
 await expect(status).toContainText('enemy attack',{timeout:5000});await page.waitForTimeout(1800);
 await page.locator('#screen').screenshot({path:'test-results/knight-stars.png'});
 // Standing still through the Stars can down the whole party (their fragments hit everyone): either ending will do.
 await expect(status).toHaveText(/command \/ TURN 2|defeat/,{timeout:40000});
 expect(errors).toEqual([]);
});
