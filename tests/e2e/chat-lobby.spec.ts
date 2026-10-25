import {test,expect,type Page} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
async function fixture(page:Page){
 const sends:any[]=[];const reads:string[]=[];
 await page.route('**/auth/v1/signup',r=>r.fulfill({json:{access_token:'fixture-token',refresh_token:'fixture-refresh',expires_in:3600}}));
 await page.route('**/rest/v1/rpc/read_chat_messages',r=>{const room=r.request().postDataJSON().p_room;reads.push(room);return r.fulfill({json:[{id:room+'-fixture',sequence:10,room,player_name:'Reader',content:room==='undertale'?'Underground fixture':'Dark World fixture',created_at:'2026-10-26T00:00:00Z'}]});});
 await page.route('**/rest/v1/rpc/send_chat_message',r=>{sends.push(r.request().postDataJSON());return r.fulfill({status:204});});
 await page.route('**/rest/v1/leaderboard_runs?*',r=>r.fulfill({json:[]}));
 await page.goto(url);await expect(page.getByRole('button',{name:'General chat',exact:true})).toBeVisible();return{sends,reads};
}
test('lobby chat sits left of boards and shares one saved player name with leaderboard',async({page})=>{
 const {sends}=await fixture(page);const chat=page.getByRole('button',{name:'General chat',exact:true}),scores=page.getByRole('button',{name:'Game leaderboards',exact:true});
 const a=(await chat.boundingBox())!,b=(await scores.boundingBox())!;expect(a.x+a.width).toBeLessThanOrEqual(b.x);
 await chat.click();const dialog=page.getByRole('dialog',{name:'General chat',exact:true});await expect(dialog.getByText('Dark World fixture',{exact:true})).toBeVisible();await dialog.getByLabel('Display name',{exact:true}).fill('Shared Player');await dialog.getByRole('button',{name:'Save name',exact:true}).click();
 await dialog.getByLabel('Message',{exact:true}).fill('Mocked chat message');await dialog.getByRole('button',{name:'Send',exact:true}).click();await expect(dialog.getByRole('status').last()).toHaveText('Message sent.');expect(sends[0]).toMatchObject({p_room:'deltarune',p_player_name:'Shared Player',p_content:'Mocked chat message'});
 await dialog.getByRole('button',{name:'Close chat',exact:true}).click();await scores.click();const board=page.getByRole('dialog',{name:'Battle leaderboard',exact:true});await expect(board).toContainText('Playing as Shared Player');
 await board.getByRole('button',{name:'Change name',exact:true}).click();const profile=page.locator('dialog[open]').last();await profile.getByLabel('Display name',{exact:true}).fill('Renamed Player');await profile.getByRole('button',{name:'Save name',exact:true}).click();await expect(board).toContainText('Playing as Renamed Player');await page.keyboard.press('Escape');
 await chat.click();await expect(dialog).toContainText('Playing as Renamed Player');await expect(dialog.getByLabel('Display name',{exact:true})).toBeHidden();await dialog.getByRole('button',{name:'Close chat',exact:true}).click();
 await page.reload();await chat.click();await expect(dialog).toContainText('Playing as Renamed Player');
});
test('selected theater theme opens the correct room and keyboard returns without activating TV',async({page})=>{
 await fixture(page);await page.keyboard.press('ArrowDown');await expect(page.getByRole('button',{name:'Game leaderboards',exact:true})).toBeFocused();await page.keyboard.press('ArrowLeft');const opener=page.getByRole('button',{name:'General chat',exact:true});await expect(opener).toBeFocused();await page.keyboard.press('z');
 const dialog=page.getByRole('dialog',{name:'General chat',exact:true});await expect(dialog.getByRole('button',{name:'DELTARUNE',exact:true})).toHaveAttribute('aria-pressed','true');await page.keyboard.press('Escape');await expect(opener).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(page.getByRole('button',{name:'Game leaderboards',exact:true})).toBeFocused();await page.keyboard.press('ArrowUp');await page.getByRole('button',{name:'UNDERTALE remote',exact:true}).click();await opener.click();await expect(dialog.getByText('Underground fixture',{exact:true})).toBeVisible();await expect(dialog.getByRole('button',{name:'UNDERTALE',exact:true})).toHaveAttribute('aria-pressed','true');await expect(dialog.getByText('Dark World fixture',{exact:true})).toHaveCount(0);
});
test('mobile lobby and chat fit without covering controls, then chapter menu opens normally',async({page})=>{
 await page.setViewportSize({width:390,height:844});await fixture(page);await page.getByRole('button',{name:'General chat',exact:true}).click();const dialog=page.getByRole('dialog',{name:'General chat',exact:true});await expect(dialog).toBeVisible();expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.screenshot({path:'test-results/chat-lobby-mobile.png'});
 await dialog.getByRole('button',{name:'Close chat',exact:true}).click();for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device','Chapter 1'])await page.getByRole('button',{name,exact:true}).click();await expect(page.getByRole('heading',{name:'The Beginning',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'General chat',exact:true})).toBeHidden();
});
