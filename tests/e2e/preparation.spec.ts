import {test,expect,type Page} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
async function open(page:Page,chapter=1,id='ch1-25',name='JEVIL'){
 await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();
 await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();
 await page.getByRole('button',{name:`Chapter ${chapter}`,exact:true}).click();await page.locator('#boss-select').selectOption(id);
 await page.getByRole('button',{name:`Battle ${name} ${id}`,exact:true}).click();return page.getByRole('dialog',{name,exact:true});
}
test('Z equips the focused item and X returns to its slot before dismissing preparation',async({page})=>{
 const prep=await open(page);await prep.locator('.prep-entry').filter({hasText:'Dice Brace'}).focus();await page.keyboard.press('z');
 await expect(prep.locator('.prep-summary').filter({hasText:'DF 2'})).toHaveCount(1);
 await page.keyboard.press('x');await expect(prep.locator('.prep-slot[data-character="1"][data-slot="armor1"]')).toBeFocused();
 await page.keyboard.press('x');await expect(prep).toBeHidden();await expect(page.locator('#boss-select')).toBeVisible();
});
test('each character has independent slots and the shared bag preserves duplicate items',async({page})=>{
 const prep=await open(page);await expect(prep.locator('.prep-roster > .prep-hero')).toHaveCount(3);
 const kris=prep.locator('.prep-hero[data-character="1"]'),susie=prep.locator('.prep-hero[data-character="2"]');
 await susie.locator('[data-slot="armor2"]').click();await prep.locator('.prep-entry').filter({hasText:'IronShackle'}).click();
 await expect(susie.locator('[data-slot="armor2"]')).toContainText('IronShackle');await expect(kris.locator('[data-slot="armor2"]')).toContainText('Empty slot');
 await prep.getByRole('button',{name:'+ Add item',exact:true}).click();const candy=prep.locator('.prep-entry').filter({hasText:'Dark Candy'});
 await candy.focus();await page.keyboard.press('z');await page.keyboard.press('z');await expect(prep.locator('.prep-bagitem').filter({hasText:'Dark Candy'})).toHaveCount(2);
 await prep.locator('.prep-bagitem').filter({hasText:'Dark Candy'}).first().focus();await page.keyboard.press('z');
 await expect(prep.locator('.prep-bagitem').filter({hasText:'Dark Candy'})).toHaveCount(1);
 await prep.getByRole('button',{name:'Close preparation'}).click();await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();
 await expect(susie.locator('[data-slot="armor2"]')).toContainText('IronShackle');await expect(prep.locator('.prep-bag')).toContainText('Dark Candy');
});
test('search accepts z/x as text, and arrows navigate the equipment columns',async({page})=>{
 const prep=await open(page);await prep.locator('.prep-character[data-character="1"]').focus();await page.keyboard.press('ArrowRight');
 await expect(prep.locator('.prep-character[data-character="2"]')).toBeFocused();await page.keyboard.press('ArrowDown');
 await expect(prep.locator('.prep-slot[data-character="2"][data-slot="weapon"]')).toBeFocused();
 await prep.locator('.prep-slot[data-character="2"][data-slot="armor1"]').click();
 const search=prep.getByRole('searchbox');await search.fill('zx');await page.keyboard.press('z');await page.keyboard.press('x');await expect(search).toHaveValue('zxzx');await expect(prep).toBeVisible();
 await search.fill('Dice');await page.keyboard.press('ArrowDown');await expect(prep.locator('.prep-entry').filter({hasText:'Dice Brace'})).toBeFocused();
});
test('preparation fits mobile and keeps the start button visible with reduced motion',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});const prep=await open(page);
 await expect(prep.locator('.prep-roster > .prep-hero')).toHaveCount(3);
 expect(await prep.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await expect(prep.getByRole('button',{name:'START BATTLE',exact:true})).toBeInViewport();
 await prep.screenshot({path:'test-results/preparation-mobile.png'});
});

test('arrows reach the bag, add/remove items, clear equipment and start battle without Tab or pointer input',async({page})=>{
 const prep=await open(page);
 for(let i=0;i<4;i++)await page.keyboard.press('ArrowDown');
 const add=prep.getByRole('button',{name:'+ Add item',exact:true});await expect(add).toBeFocused();
 await page.keyboard.press('z');await expect(prep.locator('.prep-entry:not(:disabled)').first()).toBeFocused();
 await page.keyboard.press('z');await expect(prep.locator('.prep-bagitem:not(.is-empty)')).toHaveCount(1);
 await page.keyboard.press('x');await expect(add).toBeFocused();await page.keyboard.press('ArrowDown');
 await expect(prep.locator('.prep-bagitem').first()).toBeFocused();await page.keyboard.press('z');
 await expect(prep.locator('.prep-bagitem:not(.is-empty)')).toHaveCount(0);
 await page.keyboard.press('End');await page.keyboard.press('ArrowDown');
 const launch=prep.getByRole('button',{name:'START BATTLE',exact:true});await expect(launch).toBeFocused();
 await page.keyboard.press('ArrowLeft');await expect(prep.getByRole('button',{name:'Clear loadout'})).toBeFocused();
 await page.keyboard.press('z');await expect(prep.locator('.prep-feedback')).toContainText('cleared');
 await page.keyboard.press('ArrowRight');await expect(launch).toBeFocused();await page.keyboard.press('z');
 await expect(prep).toBeHidden();await expect(page.locator('#status')).toContainText('JEVIL / command');
});

for(const [width,columns] of [[1280,6],[900,4],[390,3]])test(`bag arrow rows use the visible ${columns} columns at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});const prep=await open(page);
 for(let i=0;i<5;i++)await page.keyboard.press('ArrowDown');
 const cells=prep.locator('.prep-bagitem');await expect(cells.first()).toBeFocused();
 await page.keyboard.press('ArrowDown');await expect(cells.nth(columns)).toBeFocused();
 await page.keyboard.press('ArrowUp');await expect(cells.first()).toBeFocused();
 await page.keyboard.press('ArrowUp');await expect(prep.getByRole('button',{name:'+ Add item'})).toBeFocused();
 await page.keyboard.press('ArrowUp');await expect(prep.locator('.prep-slot[data-character="1"][data-slot="armor2"]')).toBeFocused();
});

test('arrows connect inventory, search, footer and close controls even with an empty search',async({page})=>{
 const prep=await open(page);const count=await prep.locator('.prep-character').count();
 for(let i=0;i<count;i++)await page.keyboard.press('ArrowRight');
 await expect(prep.locator('.prep-entry:not(:disabled)').first()).toBeFocused();
 await page.keyboard.press('ArrowUp');const search=prep.getByRole('searchbox');await expect(search).toBeFocused();
 await search.fill('no-such-equipment');await page.keyboard.press('ArrowDown');
 await expect(prep.getByRole('button',{name:'START BATTLE',exact:true})).toBeFocused();
 await page.keyboard.press('ArrowDown');await expect(prep.getByRole('button',{name:'Close preparation'})).toBeFocused();
 await page.keyboard.press('z');await expect(prep).toBeHidden();
});
