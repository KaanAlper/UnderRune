import {test,expect,type Page} from '@playwright/test';
async function fixture(page:Page,configured=true){
 await page.route('**/__leaderboard_fixture',r=>r.fulfill({contentType:'text/html',body:'<html><body style="margin:0"><main id="fixture" style="height:660px"></main></body></html>'}));
 await page.goto('/__leaderboard_fixture');
 await page.evaluate(async configured=>{
  const {LeaderboardPanel}=await import('/src/ui/leaderboard.ts');
  const state=window as any;state.queries=[];state.submissions=[];
  const gear=(id:number,name:string)=>({id,name,allowed:[1],attack:0,defense:0,magic:0,description:''});
  const run={id:'run-1',encounter_id:'ch2-61',rules_version:'test',duration_ms:65123,damage:12,equipment:[{character:1,weapon:1,armor:[2,0]}],bag:[3,3],used_items:[3],no_armor:false,no_item:false};state.run=run;
  const api={configured,list:async(filters:any)=>{state.queries.push({...filters});return [{...run,player_name:'<script>name</script>',created_at:'2026-10-16T00:00:00Z'}]},submit:async(run:any,name:string)=>{state.submissions.push({run,name})}};
  state.api=api;const catalog=[{id:'ch2-61',chapter:2,name:'Spamton NEO',encounter:61},{id:'ch1-25',chapter:1,name:'JEVIL',encounter:25},{id:'ch2-82',chapter:2,name:'Berdly',encounter:82},{id:'ch2-999',chapter:2,name:'Unfinished',encounter:999}];
  const source={weapons:[gear(1,'Wood Blade')],armors:[gear(2,'Iron Shackle')],items:[{id:3,name:'Dark Candy'}],bagCapacity:12};
  state.board=new LeaderboardPanel(api,catalog,{version:1,chapters:{1:source,2:source}},(chapter:number)=>{state.chapter=chapter});
  document.querySelector('#fixture')!.append(state.board.element);state.board.show('ch2-61');
 },configured);
}
test('NEO has separate team, solo and solo-enraged boards',async({page})=>{
 await fixture(page);await expect(page.getByLabel('NEO route')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>(window as any).queries.at(-1).encounterId)).toBe('ch2-61');
 await page.getByLabel('NEO route').selectOption('weird');await expect.poll(()=>page.evaluate(()=>(window as any).queries.at(-1).encounterId)).toBe('ch2-61-weird');
 await page.getByLabel('NEO route').selectOption('enraged');await expect.poll(()=>page.evaluate(()=>(window as any).queries.at(-1).encounterId)).toBe('ch2-61-weird-enraged');
 await page.getByLabel('Boss',{exact:true}).selectOption('ch1-25');await expect(page.getByLabel('NEO route')).toBeHidden();
});
test('Berdly normal and Weird boards remain separate without an invented enraged variant',async({page})=>{
 await fixture(page);await page.getByLabel('Boss',{exact:true}).selectOption('ch2-82');const route=page.getByLabel('Berdly route');
 await expect(route).toBeVisible();await expect(route.locator('option')).toHaveCount(2);
 await route.selectOption('weird');await expect.poll(()=>page.evaluate(()=>(window as any).queries.at(-1).encounterId)).toBe('ch2-82-weird');
 await page.evaluate(()=>(window as any).board.show('ch2-82-weird'));await expect(route).toHaveValue('weird');
 await route.selectOption('normal');await expect.poll(()=>page.evaluate(()=>(window as any).queries.at(-1).encounterId)).toBe('ch2-82');
});

test('arrows leave native selectors and open filters with Z without using Tab',async({page})=>{
 await fixture(page);await page.getByRole('button',{name:'Join leaderboard',exact:true}).focus();
 await page.keyboard.press('ArrowDown');await expect(page.getByLabel('Boss',{exact:true})).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(page.getByLabel('Order',{exact:true})).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(page.getByLabel('NEO route')).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(page.getByText('Filters: damage, time and equipment',{exact:true})).toBeFocused();
 await page.keyboard.press('z');await expect(page.getByLabel('Minimum damage')).toBeVisible();
 await page.keyboard.press('ArrowDown');await expect(page.getByLabel('Minimum damage')).toBeFocused();
 await page.keyboard.press('ArrowDown');await expect(page.getByLabel('Maximum damage')).toBeFocused();
});

test('a queued dialog close never steals focus after the player already moved back to a card',async({page})=>{
 await fixture(page);await page.evaluate(()=>{
  const state=window as any,opener=document.createElement('button'),card=document.createElement('button');opener.textContent='Board opener';card.textContent='Return card';document.body.append(opener,card);
  opener.focus();state.board.open('ch2-61');state.board.browser.close();card.focus();
 });
 await expect(page.getByRole('button',{name:'Return card',exact:true})).toBeFocused();await page.waitForTimeout(100);await expect(page.getByRole('button',{name:'Return card',exact:true})).toBeFocused();
});

test('combined challenge, range and equipment filters reach the API and show actual equipment quantities',async({page})=>{
 await fixture(page);await expect(page.getByText('<script>name</script>',{exact:true})).toBeVisible();
 await expect(page.getByRole('option',{name:/Unfinished/})).toHaveCount(0);await page.getByText('Filters: damage, time and equipment',{exact:true}).click();
 await page.getByLabel('Minimum damage').fill('0');await page.getByLabel('Maximum damage').fill('20');
 await page.getByLabel('Maximum seconds').fill('90');await page.getByLabel('No item',{exact:true}).check();await page.getByLabel('No armor',{exact:true}).check();
 await page.getByLabel('Weapon',{exact:true}).selectOption('1');await page.getByLabel('Armor',{exact:true}).selectOption('2');
 await page.getByLabel('Starting bag item').selectOption('3');await page.getByLabel('Used item',{exact:true}).selectOption('3');
 await page.getByLabel('Order').selectOption('time');await page.getByRole('button',{name:'Apply filters'}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).queries.at(-1))).toMatchObject({encounterId:'ch2-61',order:'time',minDamage:0,maxDamage:20,maxSeconds:90,noItem:true,noArmor:true,weapon:1,armor:2,bagItem:3,usedItem:3,offset:0});
 await page.getByText('Equipment and items',{exact:true}).click();await expect(page.getByText('Dark Candy × 2',{exact:true})).toBeVisible();
 await expect(page.getByText('Kris',{exact:true})).toBeVisible();
});
test('unconfigured storage is honest and never publishes a false success',async({page})=>{
 await fixture(page,false);await expect(page.getByRole('status')).toContainText('not connected');
 await page.evaluate(()=>(window as any).board.offer((window as any).run));
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByRole('button',{name:'Publish score',exact:true})).toBeDisabled();
 await expect(dialog).toContainText('not connected');await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
});
test('voluntary publish retains the run and renders successful submission only after the API resolves',async({page})=>{
 await fixture(page);await page.evaluate(()=>(window as any).board.offer((window as any).run));
 const dialog=page.getByRole('dialog');await dialog.getByLabel('Display name').fill('Kris');await dialog.getByRole('button',{name:'Publish score',exact:true}).click();
 await expect(dialog.getByRole('status')).toContainText('Score published');expect(await page.evaluate(()=>(window as any).submissions.length)).toBe(1);
});
test('mobile board fits its container and native controls remain keyboard accessible',async({page})=>{
 await page.setViewportSize({width:390,height:844});await fixture(page);const panel=page.locator('.leaderboard');
 expect(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.getByLabel('Boss',{exact:true}).focus();await page.keyboard.press('Tab');await expect(page.getByLabel('Order')).toBeFocused();await page.screenshot({path:'test-results/leaderboard-mobile.png'});
});


test('stale responses cannot replace the latest filtered results',async({page})=>{
 await fixture(page);await page.evaluate(()=>{
  const state=window as any;state.pendingQueries=[];state.api.list=(filters:any)=>new Promise(resolve=>state.pendingQueries.push({filters,resolve}));
 });
 await page.getByRole('button',{name:'Apply filters'}).click();await page.getByLabel('Order').selectOption('time');await page.getByRole('button',{name:'Apply filters'}).click();
 await page.evaluate(()=>{const state=window as any;state.pendingQueries[1].resolve([{...state.run,player_name:'Latest',created_at:''}]);});await expect(page.getByText('Latest',{exact:true})).toBeVisible();
 await page.evaluate(()=>{const state=window as any;state.pendingQueries[0].resolve([{...state.run,player_name:'Stale',created_at:''}]);});await expect(page.getByText('Stale',{exact:true})).toHaveCount(0);
 await page.evaluate(()=>(window as any).board.hide());await expect(page.locator('.leaderboard')).toBeHidden();
});
test('failed publication keeps the same run for an explicit retry',async({page})=>{
 await fixture(page);await page.evaluate(()=>{const state=window as any;state.api.submit=async(run:any,name:string)=>{state.submissions.push({run,name});if(state.submissions.length===1)throw Error('Connection interrupted.');};state.board.offer(state.run);});
 const dialog=page.getByRole('dialog'),publish=dialog.getByRole('button',{name:'Publish score',exact:true});await dialog.getByLabel('Display name').fill('Kris');await publish.click();
 await expect(dialog.getByRole('status')).toContainText('Score was not published');await expect(publish).toBeEnabled();await publish.click();await expect(dialog.getByRole('status')).toContainText('Score published');
 expect(await page.evaluate(()=>{const attempts=(window as any).submissions;return attempts.length===2&&attempts[0].run.id===attempts[1].run.id;})).toBe(true);
});


test('boss context opens in a modal and Escape restores the opener focus',async({page})=>{
 await fixture(page);await page.evaluate(()=>{(window as any).board.hide();const button=document.createElement('button');button.textContent='Boss scores';button.onclick=()=>(window as any).board.open('ch1-25');document.body.append(button);});
 const opener=page.getByRole('button',{name:'Boss scores'});await opener.click();const dialog=page.getByRole('dialog',{name:'Battle leaderboard',exact:true});await expect(dialog).toBeVisible();
 // Opened for one battle: only that battle, no Boss choice.
 await expect(dialog.getByLabel('Boss',{exact:true})).toBeHidden();await expect(dialog.locator('.lb-boss')).toHaveText('JEVIL · Chapter 1');
 await expect.poll(()=>page.evaluate(()=>(window as any).queries.at(-1).encounterId)).toBe('ch1-25');
 await expect(dialog.getByLabel('Order')).toBeFocused();await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(opener).toBeFocused();
 await opener.click();await dialog.getByRole('button',{name:'Close leaderboard'}).focus();await page.keyboard.press('z');await expect(dialog).toBeHidden();await expect(opener).toBeFocused();
});
test('time formatting does not round into a sixty second remainder',async({page})=>{
 await fixture(page);await page.evaluate(()=>{const state=window as any;state.api.list=async()=>[{...state.run,duration_ms:59999,player_name:'Timer',created_at:''}];state.board.show();});await expect(page.getByText('0:59.99',{exact:true})).toBeVisible();
});

test('joining once remembers the player across boss boards and a new panel instance',async({page})=>{
 await fixture(page);await page.getByRole('button',{name:'Join leaderboard',exact:true}).click();const join=page.getByRole('dialog',{name:'Join leaderboard',exact:true});await join.getByLabel('Display name').fill('  Player One  ');await join.getByRole('button',{name:'Save name'}).click();await expect(join).toBeHidden();await expect(page.getByText('Playing as Player One',{exact:true})).toBeVisible();
 await page.getByLabel('Boss',{exact:true}).selectOption('ch1-25');await expect(page.getByRole('button',{name:'Join leaderboard',exact:true})).toHaveCount(0);
 await fixture(page);await expect(page.getByText('Playing as Player One',{exact:true})).toBeVisible();await page.evaluate(()=>(window as any).board.offer((window as any).run));const publish=page.getByRole('dialog',{name:'Publish your score'});await expect(publish.getByLabel('Display name')).toBeHidden();await expect(publish).toContainText('Playing as Player One');await publish.getByRole('button',{name:'Publish score',exact:true}).click();await expect(publish.getByRole('status')).toContainText('Score published');expect(await page.evaluate(()=>(window as any).submissions[0].name)).toBe('Player One');
});
test('control characters cannot be saved as a shared player name',async({page})=>{
 await fixture(page);await page.getByRole('button',{name:'Join leaderboard',exact:true}).click();const join=page.getByRole('dialog',{name:'Join leaderboard',exact:true}),input=join.getByLabel('Display name');await input.fill('Bad\u0001name');await join.getByRole('button',{name:'Save name'}).click();await expect(join).toBeVisible();expect(await input.evaluate((el:HTMLInputElement)=>el.checkValidity())).toBe(false);await input.fill('Valid');await join.getByRole('button',{name:'Save name'}).click();await expect(join).toBeHidden();
});


test('a late DELTARUNE publication cannot populate an open UNDERTALE board',async({page})=>{
 await fixture(page);await page.evaluate(()=>{const s=window as any;s.api.submit=()=>new Promise(resolve=>s.finishPublish=resolve);s.board.offer(s.run);});
 const publish=page.getByRole('dialog',{name:'Publish your score',exact:true});await publish.getByLabel('Display name').fill('Kris');await publish.getByRole('button',{name:'Publish score',exact:true}).click();await expect(publish.getByRole('status')).toContainText('Publishing');
 await page.keyboard.press('Escape');await page.evaluate(()=>(window as any).board.openGame('undertale'));const board=page.locator('.leaderboard-browser');await expect(board.getByRole('status')).toContainText('UNDERTALE battles are not available yet');
 const count=await page.evaluate(()=>(window as any).queries.length);await page.evaluate(()=>(window as any).finishPublish());
 await expect(page.getByRole('dialog',{name:'Publish your score',exact:true,includeHidden:true}).getByRole('status',{includeHidden:true})).toHaveText('Score published.');
 await expect(board.getByRole('status')).toContainText('UNDERTALE battles are not available yet');expect(await page.evaluate(()=>(window as any).queries.length)).toBe(count);
 await page.evaluate(()=>(window as any).board.open('ch1-25'));await expect(board.locator('.lb-game')).toHaveText('DELTARUNE');await expect(board.getByRole('status')).not.toContainText('UNDERTALE');
});
