import {test,expect,type Page} from '@playwright/test';
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();});
// The theater opens the app: press DELTARUNE's remote, then connect through the TV.
const connect=async(page:Page)=>{await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await expect(page.getByRole('button',{name:'Connect device'})).toBeVisible();};
// Without local launchers, only available faithful source encounters can run.
const withoutNative=async(page:Page)=>{await page.route('**/native/profiles',route=>route.fulfill({status:404,body:''}));await page.reload();await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();};
const choose=async(page:Page,id:string,name:string)=>{await page.locator('#boss-select').selectOption(id);const card=page.getByRole('button',{name:`Battle ${name} ${id}`,exact:true});await expect(card).toHaveAttribute('aria-current','true');return card;};
const boss=async(page:Page,id:string,name:string)=>{await (await choose(page,id,name)).click();};
const chapterMenu=async(page:Page,chapter=1)=>{await connect(page);await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter '+chapter,exact:true}).click();await expect(page.locator('#boss-select')).toBeVisible();};
const key=async(page:Page,k:string)=>{await page.keyboard.press(k);await page.waitForTimeout(180);};
test('theater: UNDERTALE is coming soon, DELTARUNE connects, and the device leads back',async({page})=>{
 await page.getByRole('button',{name:'UNDERTALE remote'}).click();
 await expect(page.locator('#status')).toHaveText('UNDERTALE / COMING SOON');
 await page.waitForTimeout(1200);await page.locator('#screen').screenshot({path:'test-results/e2e-theater-undertale.png'});
 await page.getByRole('button',{name:'Television'}).click();await expect(page.locator('#status')).toHaveText('UNDERTALE / COMING SOON');
 await page.keyboard.press('x');await expect(page.locator('#status')).toHaveText('THEATER');
 await connect(page);
 await page.getByRole('button',{name:'Device menu',exact:true}).click();await expect(page.locator('#status')).toHaveText('THEATER');
});
test('original Jevil opens through preparation, stays local and returns to the menu',async({page})=>{
 test.setTimeout(120000);
 const remote:string[]=[];page.on('request',r=>{if(!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))remote.push(r.url());});
 await connect(page);await page.getByRole('button',{name:'Connect device'}).click();
 await page.getByRole('button',{name:'Chapter 1'}).click();
 await boss(page,'ch1-25','JEVIL');
 const prep=page.getByRole('dialog',{name:'JEVIL'});await expect(prep).toBeVisible();
 await expect(prep.getByRole('button',{name:/Game default/})).toBeVisible();
 await prep.getByRole('button',{name:'START BATTLE'}).click();
 await expect(page.locator('#status')).toContainText('JEVIL / ORIGINAL ENGINE',{timeout:90000});
 await expect(page.locator('#native')).toBeVisible();await expect(prep).toBeHidden();
 await page.waitForTimeout(4000);await page.screenshot({path:'test-results/e2e-native-jevil.png'});
 await page.locator('#pause').click();await expect(page.locator('#status')).toContainText('ORIGINAL ENGINE / paused');
 await page.locator('#pause').click();await expect(page.locator('#status')).not.toContainText('paused');
 expect(remote).toEqual([]);
 await page.getByRole('button',{name:'Device menu',exact:true}).click();
 await expect(page.getByRole('button',{name:'Battle JEVIL ch1-25'})).toBeVisible();await expect(page.locator('#native')).toHaveCount(0);
});
test('winning an original battle shows the result and returns to the menu',async({page})=>{
 test.setTimeout(240000);
 await connect(page);await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 1'}).click();
 await boss(page,'ch1-2','Lancer');
 await page.getByRole('dialog',{name:'Lancer'}).getByRole('button',{name:'START BATTLE'}).click();
 await expect(page.locator('#status')).toContainText('Lancer / ORIGINAL ENGINE',{timeout:90000});
 // FIGHT every turn until the original battle ends.
 for(let i=0;i<500&&await page.locator('#outcome').isHidden();i++){await page.keyboard.press('z');await page.waitForTimeout(250);}
 await expect(page.locator('#outcome-text')).toContainText('Lancer was defeated');
 await page.getByRole('button',{name:'DEVICE_MENU',exact:true}).click();
 await expect(page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true})).toBeVisible();await expect(page.locator('#native')).toHaveCount(0);
});
test('no-native source battle uses preparation, real commands, pause, restart and saved equipment',async({page})=>{
 const failures:string[]=[],remote:string[]=[];page.on('pageerror',e=>failures.push(e.message));page.on('request',r=>{if(!['127.0.0.1','localhost'].includes(new URL(r.url()).hostname))remote.push(r.url());});
 await withoutNative(page);await chapterMenu(page);await boss(page,'ch1-25','JEVIL');
 const prep=page.getByRole('dialog',{name:'JEVIL'});await expect(prep).toBeVisible();await prep.getByRole('button',{name:/Dice Brace/}).click();await expect(prep.locator('.prep-summary')).toContainText('DF 2');
 await prep.getByRole('button',{name:'START BATTLE'}).click();await expect(prep).toBeHidden();await expect(page.locator('#status')).toContainText('JEVIL / command');await expect(page.locator('#native')).toHaveCount(0);
 for(let i=0;i<3;i++){await key(page,'ArrowLeft');await key(page,'z');}await expect(page.locator('#status')).toContainText('enemy talk');
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');await page.locator('#pause').click();await expect(page.locator('#status')).not.toContainText('paused');
 await page.keyboard.press('r');await expect(page.locator('#status')).toContainText('command / TURN 1');
 await page.locator('#credits').click();await expect(page.locator('#difference-note')).toContainText('source-ported');await page.locator('#close-about').click();await expect(page.locator('#status')).toContainText('paused');
 await page.locator('#effects').click();await expect(page.locator('#effects')).toHaveAttribute('aria-pressed','true');await page.locator('#mute').click();await expect(page.locator('#mute')).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('x');await expect(page.locator('#boss-select')).toBeVisible();await boss(page,'ch1-25','JEVIL');await expect(prep.locator('.prep-slots')).toContainText('Dice Brace');
 expect(failures).toEqual([]);expect(remote).toEqual([]);
});

test('local Jevil source practice uses equipment and rematches as practice',async({page})=>{
 await chapterMenu(page);await choose(page,'ch1-25','JEVIL');const select=page.locator('#attack-select');await expect(select).toBeEnabled();await expect(select.locator('option')).toHaveCount(16);await select.selectOption('1');
 await page.locator('#practice').click();const prep=page.getByRole('dialog',{name:'JEVIL'});await prep.getByRole('button',{name:/Dice Brace/}).click();await prep.getByRole('button',{name:'START PRACTICE'}).click();await expect(page.locator('#status')).toContainText('Diamond rain / PRACTICE');await expect(page.locator('#native')).toHaveCount(0);
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('Diamond rain');
 await page.keyboard.press('r');await expect(page.locator('#status')).toContainText('Diamond rain / PRACTICE');
 await expect(page.locator('#outcome')).toBeVisible({timeout:18000});await page.locator('#outcome-again').click();await expect(page.locator('#outcome')).toBeHidden();await expect(page.locator('#status')).toContainText('PRACTICE');
 await page.locator('#back').click();await (await choose(page,'ch1-2','Lancer')).focus();await expect(page.locator('#practice')).toBeDisabled();await page.keyboard.press('t');await expect(prep).toBeHidden();
});

test('no-native unsupported encounters offer truthful preparation without a fake fight',async({page})=>{
 await withoutNative(page);await chapterMenu(page,3);
 for(const [id,name] of [['ch3-115','Roaring Knight'],['ch3-mantle','Shadow Mantle']]){
  await boss(page,id,name);const prep=page.getByRole('dialog',{name,exact:true});await expect(prep.getByRole('button',{name:'IN DEVELOPMENT',exact:true})).toBeDisabled();await expect(prep.locator('.prep-intro')).toContainText('original engine is unavailable');await prep.getByRole('button',{name:'Close preparation'}).click();await expect(page.locator('#pause')).toBeHidden();await expect(page.locator('#practice')).toBeDisabled();await expect(page.locator('#native')).toHaveCount(0);
 }
});
test('retry recovers an interrupted initial sprite load',async({page})=>{
 let blocked=false;
 await page.route('**/generated/**/font.png',async route=>{if(!blocked){blocked=true;await route.abort();}else await route.continue();});
 await page.reload();
 await expect(page.locator('#error')).toBeVisible();
 await page.locator('#retry').click();
 await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();
});

test('about dialog does not allow keyboard navigation behind it',async({page})=>{
 await page.locator('#credits').click();
 await page.keyboard.press('z');
 await page.locator('#close-about').click();
 await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();
});

test('blocked localStorage getter does not prevent startup',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}}));
 await page.reload();await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();
});

test('no-native source asset failure stays in preparation and retries without losing loadout',async({page})=>{
 let failed=false;await withoutNative(page);await page.route('**/generated/remake/ch1/bundle.json',async route=>{if(!failed){failed=true;await route.abort();}else await route.continue();});
 await chapterMenu(page);await boss(page,'ch1-25','JEVIL');const prep=page.getByRole('dialog',{name:'JEVIL'});await prep.getByRole('button',{name:/Dice Brace/}).click();await prep.getByRole('button',{name:'START BATTLE'}).click();await expect(prep.locator('.prep-feedback')).toContainText('Failed to fetch');await expect(prep.getByRole('button',{name:'START BATTLE'})).toBeEnabled();await expect(prep.locator('.prep-slots')).toContainText('Dice Brace');
 await prep.getByRole('button',{name:'START BATTLE'}).click();await expect(prep).toBeHidden();await expect(page.locator('#status')).toContainText('JEVIL / command');
});

test('no-native battle pauses on blur and visibility loss without simulating hidden time',async({page})=>{
 await withoutNative(page);await chapterMenu(page);await boss(page,'ch1-2','Lancer');await page.getByRole('dialog',{name:'Lancer',exact:true}).getByRole('button',{name:'START BATTLE'}).click();await expect(page.locator('#status')).toContainText('Lancer / command');
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('#status')).toContainText('paused');await page.locator('#pause').click();await expect(page.locator('#status')).not.toContainText('paused');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#status')).toContainText('paused');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(300);await expect(page.locator('#status')).toContainText('paused');await page.locator('#pause').click();await expect(page.locator('#status')).toContainText('command / TURN 1');
});

test('local chapter load can be cancelled without reopening stale cards',async({page})=>{
 await withoutNative(page);await connect(page);await page.getByRole('button',{name:'Connect device'}).click();
 let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);await page.route('**/generated/sprites/3/**',async route=>{await gate;await route.continue();});
 await page.getByRole('button',{name:'Chapter 3',exact:true}).click();await expect(page.locator('#loading')).toBeVisible();await page.locator('#back').click();await expect(page.locator('#status')).toHaveText('DEVICE_MENU');release();await page.waitForTimeout(500);await expect(page.locator('#status')).toHaveText('DEVICE_MENU');await expect(page.locator('#boss-select')).toHaveCount(0);
 await page.getByRole('button',{name:'Chapter 1',exact:true}).click();await expect(page.locator('#boss-select')).toBeVisible();
});

test('local equipment failure retries initialization before opening a source battle',async({page})=>{
 let failed=false;await page.route('**/generated/equipment.json',async route=>{if(!failed){failed=true;await route.abort();}else await route.continue();});await page.reload();await expect(page.locator('#error')).toBeVisible();await page.locator('#retry').click();await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();await chapterMenu(page);await boss(page,'ch1-25','JEVIL');await expect(page.getByRole('dialog',{name:'JEVIL'})).toBeVisible();
});

test.describe('mobile controls',()=>{
 test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 test('no-native touch confirms source commands, pauses and returns to cards',async({page})=>{
  await withoutNative(page);await chapterMenu(page);await boss(page,'ch1-25','JEVIL');await page.getByRole('dialog',{name:'JEVIL'}).getByRole('button',{name:'START BATTLE'}).tap();await expect(page.locator('#status')).toContainText('command');await expect(page.locator('#touch')).toBeVisible();
  const canvas=await page.locator('#screen').boundingBox();expect(canvas!.x).toBeGreaterThanOrEqual(0);expect(canvas!.width).toBeLessThanOrEqual(390);
  // The original menus ignore another confirm for two source frames; queue FIGHT + target for each party member.
  await page.waitForTimeout(180);for(let i=0;i<6;i++){await page.getByRole('button',{name:'Confirm or shoot'}).tap();await page.waitForTimeout(180);}
  await expect(page.locator('#status')).toHaveText('JEVIL / attack / TURN 1');await page.locator('#pause').tap();await expect(page.locator('#status')).toContainText('paused');await page.locator('#pause').tap();await expect(page.locator('#status')).not.toContainText('paused');await page.locator('#back').tap();await expect(page.locator('#boss-select')).toBeVisible();
 });
});
