import {test,expect,type Page} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
async function menu(page:Page,chapter=1){
 await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();
 // Chapter navigation remains intact; the leaderboard is accessed only after selecting one.
 await expect(page.getByRole('button',{name:'Leaderboard',exact:true})).toHaveCount(0);await page.getByRole('button',{name:`Chapter ${chapter}`,exact:true}).click();
}
test('selected boss opens its own shared board, team rage is hidden and one name works across chapters',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await menu(page,2);await page.locator('#boss-select').selectOption('ch2-61');
 await expect(page.getByRole('button',{name:'Leaderboard',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Leaderboard',exact:true}).focus();await page.keyboard.press('z');const board=page.locator('.leaderboard-browser');await expect(board).toBeVisible();
 await expect(board.getByLabel('Boss',{exact:true})).toHaveValue('ch2-61');await expect(board.getByRole('status')).not.toContainText('Could not load',{timeout:15000});
 await expect.poll(()=>board.getByRole('status').textContent()).not.toMatch(/Loading/);
 await expect(board.getByRole('status')).not.toContainText('Could not load');
 await expect(board.getByLabel('NEO mode')).toBeHidden();
 await board.getByRole('button',{name:'Join leaderboard',exact:true}).click();const join=page.getByRole('dialog',{name:'Join leaderboard',exact:true});await join.getByLabel('Display name').fill('Browser Player');await join.getByRole('button',{name:'Save name'}).click();
 await expect(board).toContainText('Playing as Browser Player');await page.keyboard.press('Escape');await expect(board).toBeHidden();
 await page.keyboard.press('x');await expect(page.locator('.boss-card[aria-current="true"]')).toBeFocused();await page.keyboard.press('x');await page.getByRole('button',{name:'Chapter 1',exact:true}).click();await page.locator('#boss-select').selectOption('ch1-2');await page.getByRole('button',{name:'Leaderboard',exact:true}).click();
 await expect(board.getByLabel('Boss',{exact:true})).toHaveValue('ch1-2');await expect(board.getByLabel('NEO mode')).toBeHidden();await expect(board).toContainText('Playing as Browser Player');
 await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});const prepare=page.getByRole('button',{name:'Prepare party'}),scores=page.getByRole('button',{name:'Leaderboard',exact:true});
 const a=(await prepare.boundingBox())!,b=(await scores.boundingBox())!;expect(b.y+b.height).toBeLessThanOrEqual(a.y);await page.screenshot({path:'test-results/leaderboard-boss-deck.png'});expect(errors).toEqual([]);
});

test('a real completed Lancer run can publish once and is visible to an independent anonymous reader',async({page,browser})=>{
 test.skip(process.env.UNDERRUNE_LIVE_SUBMIT!=='1','Explicit opt-in: this publishes one genuine automated QA run.');test.setTimeout(150000);
 await menu(page);await page.locator('#boss-select').selectOption('ch1-2');await page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true}).click();await page.getByRole('button',{name:'START BATTLE',exact:true}).click();
 for(let turn=0;turn<4;turn++){
  await expect(page.locator('#status')).toContainText('Lancer / command',{timeout:24000});
  for(let i=0;i<4;i++){await page.keyboard.press('ArrowRight');await page.waitForTimeout(140);}await page.keyboard.press('z');
  await expect(page.locator('#status')).toContainText('enemy talk',{timeout:8000});
  for(let i=0;i<20&&!((await page.locator('#status').textContent())??'').includes('enemy attack');i++){await page.waitForTimeout(400);await page.keyboard.press('z');}
  await expect(page.locator('#status')).toContainText('enemy attack');
 }
 for(let i=0;i<130&&!await page.getByRole('button',{name:'Share score',exact:true}).isVisible();i++){await page.waitForTimeout(400);await page.keyboard.press('z');}
 await expect(page.locator('#outcome-text')).toContainText('YOU WON');await page.getByRole('button',{name:'Share score',exact:true}).click();const publish=page.getByRole('dialog',{name:'Publish your score'});
 await publish.getByLabel('Display name').fill('UnderRune QA');let run:any;
 page.on('request',request=>{if(request.url().endsWith('/rpc/submit_leaderboard_run'))run=request.postDataJSON().p_run;});
 await publish.getByRole('button',{name:'Publish score',exact:true}).click();await expect(publish.getByRole('status')).toContainText('Score published',{timeout:20000});expect(run.duration_ms).toBeGreaterThan(1000);expect(run.encounter_id).toBe('ch1-2');expect(run.equipment.map((c:any)=>c.character)).toEqual([1,2]);
 const reader=await browser.newContext();const independent=await reader.newPage();await independent.goto(url);
 const rows=await independent.evaluate(async id=>{const config=await (await fetch(new URL('./leaderboard-config.json',location.href))).json();return (await fetch(`${config.url}/rest/v1/leaderboard_runs?id=eq.${id}`,{headers:{apikey:config.key}})).json();},run.id);
 expect(rows).toHaveLength(1);expect(rows[0]).toMatchObject({...run,player_name:'UnderRune QA'});await reader.close();console.log('Published genuine Lancer QA run',run.id,run.damage,run.duration_ms);
});

test('a transient configuration failure is visible and Apply filters retries it without reloading the game',async({page})=>{
 let attempt=0;await page.route('**/leaderboard-config.json',route=>++attempt===1?route.abort('failed'):route.continue());
 await menu(page);await page.getByRole('button',{name:'Leaderboard',exact:true}).click();const board=page.locator('.leaderboard-browser');
 await expect(board.getByRole('status')).toContainText('Could not load scores');await board.getByRole('button',{name:'Apply filters',exact:true}).click();
 await expect.poll(()=>board.getByRole('status').textContent()).not.toMatch(/Loading|Could not load/);expect(attempt).toBe(2);
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Prepare party'})).toBeEnabled();
});
