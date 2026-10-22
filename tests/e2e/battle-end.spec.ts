import {test,expect,type Page} from '@playwright/test';
// How a browser battle ends: a loss breaks the soul and asks whether to try again (keyboard or pointer); a win
// fades the battle out and shows the result. The development hook only brings the battle to its end.
const status=(page:Page)=>page.locator('#status');
async function jevil(page:Page){
 await page.route('**/native/profiles',route=>route.fulfill({status:404,body:''}));
 await page.goto('/');await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();
 await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 1',exact:true}).click();
 await page.locator('#boss-select').selectOption('ch1-25');await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();
 await page.getByRole('dialog',{name:'JEVIL'}).getByRole('button',{name:'START BATTLE'}).click();await expect(status(page)).toContainText('JEVIL / command');
}

test('a lost battle breaks the soul, asks to try again, and YES starts the battle again',async({page})=>{
 test.setTimeout(60000);
 const failures:string[]=[];page.on('pageerror',e=>failures.push(e.message));
 await jevil(page);
 await page.evaluate(()=>(window as any).__underrune.lose());
 await expect(status(page)).toContainText('game over');
 await page.waitForTimeout(2000);await page.locator('#screen').screenshot({path:'test-results/battle-end-soul.png'});
 // No Z while the soul breaks (four presses there retry at once); then the voice speaks and the choice appears.
 await page.waitForTimeout(3500);
 for(let i=0;i<40;i++){await page.keyboard.press('z');await page.waitForTimeout(250);if(i===6)await page.locator('#screen').screenshot({path:'test-results/battle-end-failure.png'});}
 await page.keyboard.press('ArrowLeft');await page.waitForTimeout(300);await page.locator('#screen').screenshot({path:'test-results/battle-end-choice.png'});
 await page.keyboard.press('z');
 await expect(status(page)).toContainText('JEVIL / command / TURN 1',{timeout:15000});
 expect(failures).toEqual([]);
});

test('NO on the failure screen, taken with the pointer, returns to the menu',async({page})=>{
 test.setTimeout(60000);
 await jevil(page);
 await page.evaluate(()=>(window as any).__underrune.lose());
 await page.waitForTimeout(5500);
 for(let i=0;i<80&&!(await page.evaluate(()=>(window as any).__underrune.choosing()));i++){await page.keyboard.press('z');await page.waitForTimeout(250);}
 await page.waitForTimeout(600);
 // NO stands right of centre at (190, 180) in the failure screen's 320x240 view.
 const box=(await page.locator('#screen').boundingBox())!;
 await page.mouse.click(box.x+box.width*(196/320),box.y+box.height*(186/240));
 await page.waitForTimeout(400);await page.locator('#screen').screenshot({path:'test-results/battle-end-no.png'});
 for(let i=0;i<40&&!(await page.locator('#boss-select').isVisible());i++){await page.keyboard.press('z');await page.waitForTimeout(300);}
 await expect(page.locator('#boss-select')).toBeVisible({timeout:15000});
});

test('a won battle fades out and shows the result',async({page})=>{
 await jevil(page);
 await page.evaluate(()=>(window as any).__underrune.win());
 await expect(page.locator('#outcome')).toBeVisible();await expect(page.locator('#outcome-again')).toContainText('BATTLE AGAIN');
 await page.waitForTimeout(1200);await page.locator('#screen').screenshot({path:'test-results/battle-end-victory.png'});
 await page.keyboard.press('x');await expect(page.locator('#boss-select')).toBeVisible();
});

test('Enter skips the victory text and a fresh press restarts immediately',async({page})=>{
 const failures:string[]=[];page.on('pageerror',e=>failures.push(e.message));
 await jevil(page);
 await page.evaluate(()=>(window as any).__underrune.win());
 await page.keyboard.press('Enter');
 await expect(page.locator('#outcome')).toBeVisible({timeout:2000});
 await expect(page.locator('#outcome-again')).toContainText('Z / ENTER');
 await page.waitForTimeout(160);await page.keyboard.press('Enter');
 await expect(page.locator('#outcome')).toBeHidden();
 await expect(status(page)).toContainText('JEVIL / command / TURN 1');
 expect(failures).toEqual([]);
});

test('pause continues with Z and leaving takes a second X',async({page})=>{
 await jevil(page);
 await page.keyboard.press('p');await expect(status(page)).toContainText('paused');
 await page.locator('#screen').screenshot({path:'test-results/battle-end-pause.png'});
 await page.keyboard.press('z');await expect(status(page)).not.toContainText('paused');
 await page.keyboard.press('p');await expect(status(page)).toContainText('paused');
 await page.locator('#stage').click();await expect(status(page)).not.toContainText('paused');
 await page.locator('#back').click();await expect(status(page)).toContainText('AGAIN TO LEAVE');
 await page.keyboard.press('Escape');await expect(status(page)).not.toContainText('paused');
});
