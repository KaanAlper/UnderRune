import {test,expect,type Page} from '@playwright/test';

async function prepareKnight(page:Page){
 for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device','Chapter 3'])await page.getByRole('button',{name,exact:true}).click();
 await page.locator('#boss-select').selectOption('ch3-115');
 await page.getByRole('button',{name:/^Battle .* ch3-115$/}).click();
 return page.getByRole('dialog',{name:'Roaring Knight',exact:true});
}

test('Knight PLAY offers an explicit reload after missing battle code and preserves preparation',async({page})=>{
 test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 let imports=0,documents=0;page.on('framenavigated',frame=>{if(frame===page.mainFrame())documents++;});
 // A stale tab keeps requesting its removed chunk until an explicit page reload gets current code.
 await page.route('**/chapter3-bosses*',route=>{imports++;return documents<2?route.fulfill({status:404,contentType:'text/plain',body:'Not found'}):route.continue();});
 await page.goto('/?demo=1&seed=11');
 let prep=await prepareKnight(page);
 await prep.getByRole('button',{name:/Dice Brace/}).click();
 const start=prep.getByRole('button',{name:'START BATTLE',exact:true});await start.focus();await page.keyboard.press('Enter');
 const reload=prep.getByRole('button',{name:'RELOAD GAME',exact:true});
 await expect(reload).toBeEnabled();
 expect(documents).toBe(1);
 await expect(prep.locator('.prep-feedback')).toContainText('Your preparation is saved');
 await expect(prep.locator('.prep-feedback')).not.toContainText(/dynamically|TypeError|https?:|chapter3-bosses/i);
 await expect(reload).toBeFocused();
 await page.keyboard.press('ArrowLeft');await expect(prep.getByRole('button',{name:'Clear loadout',exact:true})).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(reload).toBeFocused();
 // X still backs out; reopening can retry and exposes the same explicit recovery action.
 await page.keyboard.press('x');await expect(prep).toBeHidden();
 await page.getByRole('button',{name:/^Battle .* ch3-115$/}).click();
 await prep.getByRole('button',{name:'START BATTLE',exact:true}).click();await expect(reload).toBeEnabled();
 await expect(prep.locator('.prep-hero[data-character="1"] [data-slot="armor1"]')).toContainText('Dice Brace');
 await reload.focus();await Promise.all([page.waitForEvent('domcontentloaded'),page.keyboard.press('z')]);
 prep=await prepareKnight(page);
 await expect(prep.locator('.prep-hero[data-character="1"] [data-slot="armor1"]')).toContainText('Dice Brace');
 await expect(prep.getByRole('button',{name:'RELOAD GAME',exact:true})).toHaveCount(0);
 await prep.getByRole('button',{name:'START BATTLE',exact:true}).click();
 await expect(prep).toBeHidden({timeout:20000});await expect(page.locator('#status')).toContainText('Roaring Knight / command');
 expect(imports).toBeGreaterThanOrEqual(2);expect(errors).toEqual([]);
});
