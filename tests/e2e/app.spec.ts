import {test,expect,type Page} from '@playwright/test';
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();});
// The theater opens the app: press DELTARUNE's remote, then connect through the TV.
const connect=async(page:Page)=>{await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await expect(page.getByRole('button',{name:'Connect device'})).toBeVisible();};
// Without the native runtime (no local launchers) every encounter keeps the browser adaptation.
const withoutNative=async(page:Page)=>{await page.route('**/native/profiles',route=>route.fulfill({status:404,body:''}));await page.reload();await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();};
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
 await page.getByRole('button',{name:'Battle JEVIL ch1-25'}).click();
 const prep=page.getByRole('dialog',{name:'JEVIL'});await expect(prep).toBeVisible();
 await expect(prep.getByRole('button',{name:/Oyunun varsayılanı/})).toBeVisible();
 await prep.getByRole('button',{name:'SAVAŞA GİR →'}).click();
 await expect(page.locator('#status')).toContainText('JEVIL / ÖZGÜN MOTOR',{timeout:90000});
 await expect(page.locator('#native')).toBeVisible();await expect(prep).toBeHidden();
 await page.waitForTimeout(4000);await page.screenshot({path:'test-results/e2e-native-jevil.png'});
 await page.locator('#pause').click();await expect(page.locator('#status')).toContainText('ÖZGÜN MOTOR / paused');
 await page.locator('#pause').click();await expect(page.locator('#status')).not.toContainText('paused');
 expect(remote).toEqual([]);
 await page.getByRole('button',{name:'Device menu',exact:true}).click();
 await expect(page.getByRole('button',{name:'Battle JEVIL ch1-25'})).toBeVisible();await expect(page.locator('#native')).toHaveCount(0);
});
test('winning an original battle shows the result and returns to the menu',async({page})=>{
 test.setTimeout(240000);
 await connect(page);await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 1'}).click();
 await page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true}).click();
 await page.getByRole('dialog',{name:'Lancer'}).getByRole('button',{name:'SAVAŞA GİR →'}).click();
 await expect(page.locator('#status')).toContainText('Lancer / ÖZGÜN MOTOR',{timeout:90000});
 // FIGHT every turn until the original battle ends.
 for(let i=0;i<500&&await page.locator('#outcome').isHidden();i++){await page.keyboard.press('z');await page.waitForTimeout(250);}
 await expect(page.locator('#outcome-text')).toContainText('Lancer yenildi');
 await page.getByRole('button',{name:'DEVICE_MENU',exact:true}).click();
 await expect(page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true})).toBeVisible();await expect(page.locator('#native')).toHaveCount(0);
});
test('adaptation: connect, select a source boss, fight, reset and return',async({page})=>{
 await withoutNative(page);
 await connect(page);await page.getByRole('button',{name:'Connect device'}).click();
 await page.getByRole('button',{name:'Chapter 1'}).click();
 await page.getByRole('button',{name:'Battle JEVIL ch1-25'}).click();
 await expect(page.locator('#status')).toContainText('JEVIL');
 await page.getByRole('button',{name:'FIGHT',exact:true}).click();
 await page.getByRole('button',{name:'Target JEVIL 0'}).click();
 await page.keyboard.press('z');
 await page.keyboard.press('r');
 await expect(page.locator('#status')).toContainText('command');
 await page.getByRole('button',{name:'Device menu',exact:true}).click();
 await expect(page.getByRole('button',{name:'Battle JEVIL ch1-25'})).toBeVisible();
});
test('practice reaches defense and pauses without capturing browser shortcuts',async({page})=>{
 await connect(page);await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 1'}).click();
 await page.getByRole('button',{name:'Practice selected boss'}).click();
 await expect(page.locator('#status')).toContainText('defense');
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('defense');
});
test('adaptation is self-contained and does not contact remote servers',async({page})=>{
 const remote:string[]=[];page.on('request',r=>{if(!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))remote.push(r.url());});
 await withoutNative(page);await connect(page);await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 3'}).click();
 await page.getByRole('button',{name:'Battle Roaring Knight ch3-115'}).click();
 await expect(page.locator('#status')).toContainText('Roaring Knight');expect(remote).toEqual([]);
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

test('native practice selector receives arrows and Enter without starting a battle',async({page})=>{
 await connect(page);await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 1'}).click();
 const select=page.locator('#attack-select');await expect(select.locator('option')).toHaveCount(3);await select.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
 await expect(select).toHaveValue('1');await expect(page.locator('#status')).toContainText('CHAPTER 1');
});

test('adaptation: Shadow Mantle action battle is reachable by pointer and resets',async({page})=>{
 await withoutNative(page);await connect(page);await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 3'}).click();
 await page.getByRole('button',{name:'Next encounters'}).click();
 await page.getByRole('button',{name:'Battle Shadow Mantle ch3-mantle'}).click();
 await expect(page.locator('#status')).toContainText('Shadow Mantle / defense');
 await expect(page.getByRole('button',{name:'FIGHT',exact:true})).toHaveCount(0);
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');
 await page.keyboard.press('r');await expect(page.locator('#status')).toContainText('defense');
});
test.describe('mobile controls',()=>{
 test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 test('touch navigation, command selection and pausing remain reachable',async({page})=>{
  await withoutNative(page);
  await connect(page);await page.getByRole('button',{name:'Connect device'}).tap();
  await page.getByRole('button',{name:'Chapter 1'}).tap();
  await page.getByRole('button',{name:'Battle JEVIL ch1-25'}).tap();
  await expect(page.locator('#touch')).toBeVisible();
  const canvas=await page.locator('#screen').boundingBox();expect(canvas).not.toBeNull();expect(canvas!.x).toBeGreaterThanOrEqual(0);expect(canvas!.width).toBeLessThanOrEqual(390);
  await page.getByRole('button',{name:'FIGHT',exact:true}).tap();
  await page.getByRole('button',{name:'Target JEVIL 0'}).tap();
  await page.locator('#pause').tap();await expect(page.locator('#status')).toContainText('paused');
  await expect(page.getByRole('button',{name:'Strike now'})).toHaveCount(0);
  await page.locator('#pause').tap();await expect(page.getByRole('button',{name:'Strike now'})).toBeVisible();
  await page.locator('#back').tap();await expect(page.getByRole('button',{name:'Battle JEVIL ch1-25'})).toBeVisible();
 });
});
