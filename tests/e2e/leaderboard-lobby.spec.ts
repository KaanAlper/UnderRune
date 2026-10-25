import {test,expect,type Page} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
async function fixture(page:Page){
 const queries:string[]=[];await page.route('**/rest/v1/leaderboard_runs?*',r=>{queries.push(r.request().url());return r.fulfill({json:[]});});
 await page.goto(url);await expect(page.getByRole('button',{name:'Game leaderboards',exact:true})).toBeVisible();return queries;
}
test('theater keyboard opens the game board and returns focus without switching the selected game',async({page})=>{
 const queries=await fixture(page);await page.keyboard.press('ArrowDown');const opener=page.getByRole('button',{name:'Game leaderboards',exact:true});await expect(opener).toBeFocused();await page.keyboard.press('z');
 const board=page.getByRole('dialog',{name:'Battle leaderboard',exact:true});await expect(board).toBeVisible();await expect(board.locator('.lb-game')).toHaveText('DELTARUNE');
 const boss=board.getByLabel('Boss',{exact:true});await expect(boss).toBeVisible();await expect(boss).toBeFocused();await boss.selectOption('ch2-61');await expect(board.getByLabel('NEO route')).toBeVisible();
 await expect.poll(()=>queries.some(q=>new URL(q).searchParams.get('encounter_id')==='eq.ch2-61')).toBe(true);
 await page.keyboard.press('x');await expect(board).toBeHidden();await expect(opener).toBeFocused();await page.keyboard.press('ArrowUp');await expect(page.locator('#screen')).toBeFocused();
 await expect(page.locator('#status')).toHaveText('THEATER');
});
test('UNDERTALE board never mixes in DELTARUNE scores or offers unavailable battles',async({page})=>{
 const queries=await fixture(page);await page.getByRole('button',{name:'UNDERTALE remote',exact:true}).click();await page.getByRole('button',{name:'Game leaderboards',exact:true}).click();
 const board=page.getByRole('dialog',{name:'Battle leaderboard',exact:true});await expect(board.locator('.lb-game')).toHaveText('UNDERTALE');await expect(board.getByRole('status')).toContainText('UNDERTALE battles are not available yet');
 await expect(board.getByLabel('Boss',{exact:true})).toBeHidden();expect(queries).toEqual([]);await page.keyboard.press('Escape');await expect(board).toBeHidden();
});
test('chapter hub keeps its five chapters and opens a centered board with a battle selector on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});await fixture(page);for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name,exact:true}).click();
 await expect(page.getByRole('button',{name:/^Chapter [1-5]$/})).toHaveCount(5);await page.getByRole('button',{name:'Game leaderboards',exact:true}).click();
 const board=page.getByRole('dialog',{name:'Battle leaderboard',exact:true});await expect(board.getByLabel('Boss',{exact:true})).toBeVisible();const box=(await board.boundingBox())!;
 expect(box.x).toBeGreaterThanOrEqual(12);expect(box.y).toBeGreaterThanOrEqual(12);expect(box.width).toBeLessThan(390);expect(box.height).toBeLessThan(820);
 expect(await board.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.screenshot({path:'test-results/leaderboard-lobby-mobile.png'});
 await page.keyboard.press('x');await page.getByRole('button',{name:'Chapter 2',exact:true}).click();await expect(page.getByRole('button',{name:'Game leaderboards',exact:true})).toBeHidden();
 await page.getByRole('button',{name:'Leaderboard',exact:true}).click();await expect(board.getByLabel('Boss',{exact:true})).toBeHidden();
});


test('WASD can enter and leave lobby focus without activating the TV',async({page})=>{
 await fixture(page);await page.keyboard.press('s');const opener=page.getByRole('button',{name:'Game leaderboards',exact:true});await expect(opener).toBeFocused();await page.keyboard.press('w');await expect(page.locator('#screen')).toBeFocused();await expect(page.locator('#status')).toHaveText('THEATER');
});


test('chapter arrows reach the lobby board and return to chapter selection without Tab',async({page})=>{
 await fixture(page);for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name,exact:true}).click();
 await page.keyboard.press('ArrowUp');await expect(page.getByRole('button',{name:'Game leaderboards',exact:true})).toBeFocused();await page.keyboard.press('z');
 const board=page.getByRole('dialog',{name:'Battle leaderboard',exact:true});await expect(board).toBeVisible();await page.keyboard.press('x');await expect(board).toBeHidden();
 await page.keyboard.press('ArrowDown');await expect(page.locator('#screen')).toBeFocused();await page.keyboard.press('z');await expect(page.getByRole('heading',{name:'The Beginning',exact:true})).toBeVisible();
});
