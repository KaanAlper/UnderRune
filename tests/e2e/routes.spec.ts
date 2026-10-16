import {test,expect,type Page} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
async function boss(page:Page,chapter:number,id:string,name:string){
 await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:`Chapter ${chapter}`,exact:true}).click();
 await page.locator('#boss-select').selectOption(id);await page.getByRole('button',{name:`Battle ${name} ${id}`,exact:true}).click();
}
test('NEO routes are chosen before equipment and unfinished Weird cannot launch a substitute battle',async({page})=>{
 await boss(page,2,'ch2-61','Spamton NEO');const routes=page.getByRole('dialog',{name:'Choose route',exact:true});await expect(routes).toBeVisible();
 await expect(page.getByRole('dialog',{name:'Spamton NEO',exact:true})).toBeHidden();await expect(routes.getByRole('button',{name:'Normal route',exact:true})).toBeEnabled();
 await expect(routes.getByRole('button',{name:'Weird / Snowgrave route',exact:true})).toBeDisabled();await expect(routes).toContainText('Kris only');await expect(routes).toContainText('In development');
 await routes.getByRole('button',{name:'Normal route',exact:true}).click();const prep=page.getByRole('dialog',{name:'Spamton NEO',exact:true});await expect(prep).toBeVisible();await expect(routes).toBeHidden();await expect(prep.locator('.prep-hero')).toHaveCount(3);await expect(prep.locator('.prep-eyebrow')).toContainText('Normal route');
});
test('single-route bosses still open equipment directly',async({page})=>{
 await boss(page,1,'ch1-2','Lancer');await expect(page.getByRole('dialog',{name:'Choose route',exact:true})).toBeHidden();await expect(page.getByRole('dialog',{name:'Lancer',exact:true})).toBeVisible();
});
test('route selection fits mobile and supports X cancel, arrows and Z confirmation with correct focus',async({page})=>{
 await page.setViewportSize({width:390,height:844});await boss(page,2,'ch2-61','Spamton NEO');const routes=page.getByRole('dialog',{name:'Choose route',exact:true}),normal=routes.getByRole('button',{name:'Normal route',exact:true});
 await expect(normal).toBeFocused();expect(await routes.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.screenshot({path:'test-results/neo-route-selection.png'});
 await page.keyboard.press('x');await expect(routes).toBeHidden();const card=page.getByRole('button',{name:'Battle Spamton NEO ch2-61',exact:true});await expect(card).toBeFocused();
 await page.keyboard.press('z');await expect(routes).toBeVisible();await page.keyboard.press('ArrowRight');await expect(routes.getByRole('button',{name:'Close route selection'})).toBeFocused();await page.keyboard.press('ArrowLeft');await expect(normal).toBeFocused();
 await page.keyboard.press('z');const prep=page.getByRole('dialog',{name:'Spamton NEO',exact:true});await expect(prep).toBeVisible();await expect(prep.locator('[data-focus="char:1"]')).toBeFocused();
});
