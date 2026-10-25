import {test,expect,type Page} from '@playwright/test';

async function room(page:Page){
 await page.goto('/?demo=1');
 for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name,exact:true}).click();
}
async function keysTogether(page:Page,...keys:string[]){
 await page.locator('#screen').focus();
 await page.evaluate(keys=>{for(const key of keys)window.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));},keys);
}

test('chapter cancellation wins a simultaneous confirm and returns focus to its scene',async({page})=>{
 await room(page);await keysTogether(page,'z','x');
 await expect(page.getByRole('button',{name:'Connect device',exact:true})).toBeVisible();
 await expect(page.locator('.boss-deck')).toBeHidden();await expect(page.locator('#screen')).toBeFocused();
});

test('menu cancellation cannot open preparation behind the chapter scene',async({page})=>{
 await room(page);await page.getByRole('button',{name:'Chapter 1',exact:true}).click();
 await keysTogether(page,'z','x');await expect(page.getByRole('button',{name:'Chapter 1',exact:true})).toBeVisible();
 await expect(page.locator('dialog[open]')).toHaveCount(0);await expect(page.locator('#screen')).toBeFocused();
});

test('practice shortcut does not reopen preparation from a leaderboard modal',async({page})=>{
 await room(page);await page.getByRole('button',{name:'Chapter 1',exact:true}).click();
 await page.locator('#boss-select').selectOption('ch1-25');await page.getByRole('button',{name:'Leaderboard',exact:true}).click();
 await page.keyboard.press('t');await expect(page.locator('dialog[open]')).toHaveCount(1);
 await expect(page.getByRole('dialog',{name:'Battle leaderboard',exact:true})).toBeVisible();
});

test('a canceled chapter preload cannot reenter the boss menu after its image resolves',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);let requested=false;
 // Add one isolated chapter image without delaying the app's initial chapter-one preload.
 await page.route('**/generated/manifest.json',async route=>{
  const response=await route.fetch(),manifest=await response.json();
  manifest.sprites['2:scene_test']={name:'scene_test',width:1,height:1,originX:0,originY:0,frames:[{url:'/scene-lifecycle-test.png',width:1,height:1,x:0,y:0,targetWidth:1,targetHeight:1}]};
  await route.fulfill({json:manifest});
 });
 await page.route('**/scene-lifecycle-test.png',async route=>{requested=true;await gate;await route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jBqkAAAAASUVORK5CYII=','base64')});});
 await page.goto('/');for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'Chapter 2',exact:true}).click();await expect.poll(()=>requested).toBe(true);
 await page.locator('#back').click();await expect(page.locator('#loading')).toBeHidden();
 release();await page.waitForTimeout(250);await expect(page.getByRole('button',{name:'Chapter 2',exact:true})).toBeVisible();
 await expect(page.locator('#menu-tools')).toBeHidden();await expect(page.locator('#screen')).toBeFocused();
});
test('menu audio resumes after focus returns',async({page})=>{
 await page.addInitScript(()=>{
  (window as any).__menuPlays=0;
  HTMLMediaElement.prototype.play=function(){if(this.src.includes('/generated/music/'))(window as any).__menuPlays++;return Promise.resolve();};
 });
 await room(page);const before=await page.evaluate(()=>(window as any).__menuPlays);expect(before).toBeGreaterThan(0);
 await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});
 await expect.poll(()=>page.evaluate(()=>(window as any).__menuPlays)).toBeGreaterThan(before);
});
test('a delayed original-battle result cannot decorate a replacement using the same encounter',async({page})=>{
 await page.route('**/native/profiles',route=>route.fulfill({json:['ch1-2']}));
 await page.route('**/native/',route=>route.fulfill({contentType:'text/html',body:`<script>
 const post=event=>parent.postMessage({source:'underrune-native',...event},location.origin);
 addEventListener('message',event=>{if(event.data?.type!=='start')return;
  post({type:'running'});const count=Number(sessionStorage.getItem('native-starts')||0)+1;sessionStorage.setItem('native-starts',String(count));
  if(count===1)post({type:'outcome',outcome:'victory'});
 });post({type:'ready'});
 </script>`}));
 await page.goto('/');for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device','Chapter 1'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true}).click();const prep=page.getByRole('dialog',{name:'Lancer',exact:true});
 await prep.getByRole('button',{name:'START BATTLE',exact:true}).click();await expect(page.locator('#status')).toContainText('ORIGINAL ENGINE');
 // Use the existing retry action before the delayed banner is due. The catalog record identity is reused.
 await page.evaluate(()=>document.getElementById('outcome-again')!.click());await expect(prep).toBeVisible();
 await prep.getByRole('button',{name:'START BATTLE',exact:true}).click();await expect(prep).toBeHidden();
 await expect(page.locator('#status')).toContainText('ORIGINAL ENGINE');await page.waitForTimeout(1700);
 await expect(page.locator('#outcome')).toBeHidden();await expect(page.locator('#stage')).not.toHaveClass(/battle-over/);
});
