import {test,expect,type Page} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
async function menu(page:Page){
 await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();
 await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();
 await page.getByRole('button',{name:'Chapter 1',exact:true}).click();
}
test('public PLAY includes theater, working armor preparation, saved items and practice lifecycle',async({page})=>{
 const failures:string[]=[],native:string[]=[];page.on('pageerror',e=>failures.push(e.message));page.on('request',r=>{if(/\/native\/|data\.win|\.wasm/.test(r.url()))native.push(r.url());});
 await menu(page);await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();
 const prep=page.getByRole('dialog',{name:'JEVIL'});await expect(prep).toBeVisible();
 await prep.getByRole('button',{name:/Dice Brace/}).click();await expect(prep.locator('.prep-summary')).toContainText('DF 2');
 await prep.getByRole('button',{name:'+ Add item',exact:true}).click();await prep.locator('.prep-entry').filter({hasText:'Dark Candy'}).click();
 await expect(prep.locator('.prep-bag')).toContainText('Dark Candy');await prep.screenshot({path:'test-results/public-preparation.png'});
 await prep.getByRole('button',{name:'START PRACTICE'}).click();await expect(prep).toBeHidden();await expect(page.locator('#status')).toContainText('JEVIL /');
 await expect(page.locator('#status')).toContainText('PRACTICE');await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');
 await page.locator('#pause').click();await expect(page.locator('#status')).not.toContainText('paused');
 await page.keyboard.press('ArrowRight');await page.keyboard.press('r');await expect(page.locator('#outcome')).toBeHidden();
 await page.waitForTimeout(600);await page.locator('#screen').screenshot({path:'test-results/public-practice.png'});
 await page.getByRole('button',{name:'Device menu',exact:true}).click();await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();
 await expect(prep.locator('.prep-slots')).toContainText('Dice Brace');await expect(prep.locator('.prep-bag')).toContainText('Dark Candy');
 await prep.getByRole('button',{name:'Close preparation'}).click();await page.reload();await menu(page);
 await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();await expect(prep.locator('.prep-slots')).toContainText('Dice Brace');
 expect(failures).toEqual([]);expect(native).toEqual([]);
});
test('unavailable encounters still open equipment previews without launching a fake fight',async({page})=>{
 await menu(page);await page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true}).click();
 const prep=page.getByRole('dialog',{name:'Lancer'});await expect(prep).toBeVisible();await expect(prep.getByRole('button',{name:'IN DEVELOPMENT',exact:true})).toBeDisabled();
 await prep.getByRole('button',{name:'Close preparation'}).click();await expect(page.locator('#practice')).toBeDisabled();
});
test('mobile preparation fits the viewport and retains touch controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await menu(page);
 await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();const prep=page.getByRole('dialog',{name:'JEVIL'});await expect(prep).toBeVisible();
 const bounds=await prep.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.width).toBeLessThanOrEqual(390);
 await page.screenshot({path:'test-results/public-mobile.png'});await prep.getByRole('button',{name:'START PRACTICE'}).click();await expect(page.locator('#status')).toContainText('PRACTICE');
});
test('retry recovers a transient public equipment request failure',async({page})=>{
 let blocked=false;await page.route('**/generated/equipment.json',async route=>{if(!blocked){blocked=true;await route.abort();}else await route.continue();});
 await page.goto(url);await expect(page.locator('#error')).toBeVisible();await page.locator('#retry').click();
 await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();
 await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();
 await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 1',exact:true}).click();
 await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();await expect(page.getByRole('button',{name:'START PRACTICE'})).toBeEnabled();
});
test('chapter previews load and paused music stays paused after movement and mute changes',async({page})=>{
 await page.addInitScript(()=>{const NativeAudio=window.Audio;const tracks:HTMLAudioElement[]=[];(window as any).__tracks=tracks;window.Audio=class extends NativeAudio{constructor(src?:string){super(src);tracks.push(this);}};});
 const images:string[]=[];page.on('response',r=>{if(r.ok())images.push(r.url());});await menu(page);
 expect(images.some(url=>url.includes('/sprites/2/spr_tasque_idle_0.png'))).toBe(true);
 await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();await page.getByRole('button',{name:'START PRACTICE'}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__tracks.at(-1)?.paused)).toBe(false);
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');
 await page.keyboard.press('ArrowRight');await page.locator('#mute').click();await page.locator('#mute').click();
 expect(await page.evaluate(()=>(window as any).__tracks.at(-1).paused)).toBe(true);
});
