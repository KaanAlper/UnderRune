import {test,expect} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
async function menu(page:import('@playwright/test').Page){await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 1',exact:true}).click();}
test('card deck changes bosses with arrows and opens the selected preparation',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await menu(page);
 await expect(page.getByRole('heading',{name:'The Beginning'})).toBeVisible();
 const lancer=page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true});await expect(lancer).toHaveAttribute('aria-current','true');
 await lancer.focus();await page.keyboard.press('ArrowRight');const clover=page.getByRole('button',{name:'Battle Clover ch1-8',exact:true});await expect(clover).toHaveAttribute('aria-current','true');await expect(clover).toBeFocused();
 await expect(clover).toContainText('Ready to play');await page.waitForTimeout(220);await page.locator('#stage').screenshot({path:'test-results/boss-deck-desktop.png'});
 await page.keyboard.press('Enter');await expect(page.getByRole('dialog',{name:'Clover',exact:true})).toBeVisible();await page.getByRole('button',{name:'Close preparation'}).click();
 await page.locator('#boss-select').selectOption('ch1-25');await expect(page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true})).toHaveAttribute('aria-current','true');
 const previous=page.getByRole('button',{name:'Previous encounters'});await previous.focus();await page.keyboard.press('Enter');await expect(page.locator('#boss-select')).toHaveValue('ch1-20');await expect(page.locator('dialog[open]')).toHaveCount(0);
 await page.keyboard.press('Space');await expect(page.locator('#boss-select')).toHaveValue('ch1-12');await expect(page.locator('#boss-select option[value="ch1-15"]')).toHaveCount(0);await page.keyboard.press('x');await expect(page.getByRole('button',{name:'Chapter 2',exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});
test('mobile deck retains swipe navigation, focus and reduced motion',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await menu(page);
 const deck=page.locator('.boss-deck');await expect(deck).toBeVisible();const box=(await deck.boundingBox())!;expect(box.width).toBeLessThanOrEqual(390);
 await deck.dispatchEvent('pointerdown',{clientX:250,clientY:200,pointerType:'touch'});await deck.dispatchEvent('pointerup',{clientX:100,clientY:205,pointerType:'touch'});
 await page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true}).dispatchEvent('click',{detail:1});await expect(page.locator('dialog[open]')).toHaveCount(0);
 await expect(page.locator('#boss-select')).toHaveValue('ch1-8');await expect(page.getByRole('button',{name:'Battle Clover ch1-8',exact:true})).toHaveCSS('transition-duration','0s');
 const selected=(await page.getByRole('button',{name:'Battle Clover ch1-8',exact:true}).boundingBox())!;
 const controls=(await page.locator('.deck-controls').boundingBox())!,prepare=(await page.getByRole('button',{name:'Prepare party',exact:true}).boundingBox())!;
 expect(controls.y-(selected.y+selected.height)).toBeGreaterThan(15);expect(prepare.y-(selected.y+selected.height)).toBeGreaterThan(15);
 expect(prepare.x).toBeGreaterThan(controls.x+controls.width+10);
 await page.locator('#stage').screenshot({path:'test-results/boss-deck-mobile.png'});await page.getByRole('button',{name:'Prepare party',exact:true}).click();await expect(page.getByRole('dialog',{name:'Clover',exact:true})).toBeVisible();
});
