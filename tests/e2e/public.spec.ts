import {test,expect,type Page} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
async function menu(page:Page){
 await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();
 await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();
 await page.getByRole('button',{name:'Chapter 1',exact:true}).click();
}
test('public PLAY opens commands with the party, equipment and continuous battle turns',async({page})=>{
 const failures:string[]=[],native:string[]=[];page.on('pageerror',e=>failures.push(e.message));page.on('request',r=>{if(/\/native\/|data\.win|\.wasm/.test(r.url()))native.push(r.url());});
 await menu(page);await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();
 const prep=page.getByRole('dialog',{name:'JEVIL'});await expect(prep).toBeVisible();
 await prep.getByRole('button',{name:/Dice Brace/}).click();await expect(prep.locator('.prep-summary')).toContainText('DF 2');
 await prep.getByRole('button',{name:'+ Add item',exact:true}).click();await prep.locator('.prep-entry').filter({hasText:'Dark Candy'}).click();
 await expect(prep.locator('.prep-bag')).toContainText('Dark Candy');await prep.screenshot({path:'test-results/public-preparation.png'});
 await prep.getByRole('button',{name:'START BATTLE'}).click();await expect(prep).toBeHidden();await expect(page.locator('#status')).toContainText('JEVIL / command');
 await expect(page.getByRole('button',{name:'FIGHT',exact:true})).toBeVisible();await page.locator('#screen').screenshot({path:'test-results/public-battle.png'});
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'DEFEND',exact:true}).click();await expect(page.locator('#status')).toContainText('enemyTalk');
 await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.locator('#status')).toContainText('JEVIL / enemy /');
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');
 await page.locator('#pause').click();await expect(page.locator('#status')).not.toContainText('paused');
 await expect(page.locator('#status')).toContainText('JEVIL / command / TURN 2',{timeout:14000});await expect(page.locator('#outcome')).toBeHidden();
 await page.keyboard.press('ArrowRight');await page.keyboard.press('r');await expect(page.locator('#outcome')).toBeHidden();
 await page.waitForTimeout(600);await page.locator('#screen').screenshot({path:'test-results/public-practice.png'});
 await page.getByRole('button',{name:'Device menu',exact:true}).click();await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();
 await expect(prep.locator('.prep-slots')).toContainText('Dice Brace');await expect(prep.locator('.prep-bag')).toContainText('Dark Candy');
 await prep.getByRole('button',{name:'Close preparation'}).click();await page.reload();await menu(page);
 await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();await expect(prep.locator('.prep-slots')).toContainText('Dice Brace');
 expect(failures).toEqual([]);expect(native).toEqual([]);
});
test('unavailable encounters still open equipment previews without launching a fake fight',async({page})=>{
 await menu(page);await page.getByRole('button',{name:'Battle Clover ch1-8',exact:true}).click();
 const prep=page.getByRole('dialog',{name:'Clover'});await expect(prep).toBeVisible();await expect(prep.getByRole('button',{name:'IN DEVELOPMENT',exact:true})).toBeDisabled();
 await prep.getByRole('button',{name:'Close preparation'}).click();await expect(page.locator('#practice')).toBeDisabled();
});
test('mobile preparation fits the viewport and retains touch controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await menu(page);
 await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();const prep=page.getByRole('dialog',{name:'JEVIL'});await expect(prep).toBeVisible();
 const bounds=await prep.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.width).toBeLessThanOrEqual(390);
 await page.screenshot({path:'test-results/public-mobile.png'});await prep.getByRole('button',{name:'START BATTLE'}).click();await expect(page.locator('#status')).toContainText('command');
});
test('retry recovers a transient public equipment request failure',async({page})=>{
 let blocked=false;await page.route('**/generated/equipment.json',async route=>{if(!blocked){blocked=true;await route.abort();}else await route.continue();});
 await page.goto(url);await expect(page.locator('#error')).toBeVisible();await page.locator('#retry').click();
 await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();
 await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();
 await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 1',exact:true}).click();
 await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();await expect(page.getByRole('button',{name:'START BATTLE'})).toBeEnabled();
});
test('chapter previews load and paused music stays paused after movement and mute changes',async({page})=>{
 await page.addInitScript(()=>{const NativeAudio=window.Audio;const tracks:HTMLAudioElement[]=[];(window as any).__tracks=tracks;window.Audio=class extends NativeAudio{constructor(src?:string){super(src);tracks.push(this);}};});
 const images:string[]=[];page.on('response',r=>{if(r.ok())images.push(r.url());});await menu(page);
 expect(images.some(url=>url.includes('/sprites/2/spr_tasque_idle_0.png'))).toBe(true);
 await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();await page.getByRole('button',{name:'START BATTLE'}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__tracks.at(-1)?.paused)).toBe(false);
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');
 await page.keyboard.press('ArrowRight');await page.locator('#mute').click();await page.locator('#mute').click();
 expect(await page.evaluate(()=>(window as any).__tracks.at(-1).paused)).toBe(true);
});
test('Lancer launches after preparation and returns to commands after his bike race',async({page})=>{
 await menu(page);await page.getByRole('button',{name:'Battle Lancer ch1-2',exact:true}).click();await page.getByRole('button',{name:'START BATTLE'}).click();
 await expect(page.locator('#status')).toContainText('Lancer / command');await page.getByRole('button',{name:'DEFEND',exact:true}).click();
 await expect(page.locator('#status')).toContainText('enemyTalk');await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect(page.locator('#status')).toContainText('Lancer / enemy /');await expect(page.locator('#status')).toContainText('Lancer / command / TURN 2',{timeout:12000});
 await expect(page.locator('#outcome')).toBeHidden();
});
test('single-pattern Jevil practice remains a separate explicit launch',async({page})=>{
 await menu(page);await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();await page.getByRole('button',{name:'Close preparation'}).click();
 await page.getByRole('button',{name:'Practice selected boss'}).click();await page.getByRole('button',{name:'START PRACTICE'}).click();await expect(page.locator('#status')).toContainText('PRACTICE');
});

test('FIGHT shows source timing lanes, plays original samples and continues after swings',async({page})=>{
 await page.addInitScript(()=>{(window as any).__sampleStarts=0;const create=AudioContext.prototype.createBufferSource;AudioContext.prototype.createBufferSource=function(){const voice=create.call(this),start=voice.start.bind(voice);voice.start=(...args:Parameters<AudioBufferSourceNode['start']>)=>{(window as any).__sampleStarts++;start(...args);};return voice;};});
 const failures:string[]=[],sounds:string[]=[];page.on('pageerror',e=>failures.push(e.message));page.on('request',r=>{if(r.url().includes('/remake/ch1/sounds/'))sounds.push(r.url());});
 await menu(page);await page.getByRole('button',{name:'Battle JEVIL ch1-25',exact:true}).click();await page.getByRole('button',{name:'START BATTLE',exact:true}).click();
 for(let i=0;i<3;i++){await page.getByRole('button',{name:'FIGHT',exact:true}).click();await page.getByRole('button',{name:'JEVIL',exact:true}).click();}
 await expect(page.locator('#status')).toContainText('JEVIL / timing');await page.waitForTimeout(650);await page.locator('#screen').screenshot({path:'test-results/public-timing.png'});
 await page.keyboard.press('z');await expect.poll(()=>page.evaluate(()=>(window as any).__sampleStarts)).toBeGreaterThan(0);
 await page.waitForTimeout(700);await page.locator('#screen').screenshot({path:'test-results/public-hit.png'});
 await expect(page.locator('#status')).toContainText('JEVIL / enemyTalk',{timeout:8000});await expect(page.locator('#outcome')).toBeHidden();
 expect(sounds.some(s=>s.endsWith('/snd_laz_c.wav'))).toBe(true);expect(sounds.some(s=>s.endsWith('/snd_hurt1.wav'))).toBe(true);expect(failures).toEqual([]);
});
