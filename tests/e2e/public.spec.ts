import {test,expect,type Page} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
/** One key press, then time for the game (30 frames a second) to read it; the menus ignore a second press within two frames. */
async function key(page:Page,k:string,wait=180){await page.keyboard.press(k);await page.waitForTimeout(wait);}
/** DEFEND: from FIGHT, left wraps to the last button. */
async function defend(page:Page){await key(page,'ArrowLeft');await key(page,'z');}
async function boss(page:Page,id:string,name:string){await page.locator('#boss-select').selectOption(id);const card=page.getByRole('button',{name:`Battle ${name} ${id}`,exact:true});await expect(card).toHaveAttribute('aria-current','true');await card.click();}
async function menu(page:Page){
 await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();
 await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();
 await page.getByRole('button',{name:'Chapter 1',exact:true}).click();
}
test('public PLAY opens commands with the party, equipment and continuous battle turns',async({page})=>{
 const failures:string[]=[],native:string[]=[];page.on('pageerror',e=>failures.push(e.message));page.on('request',r=>{if(/\/native\/|data\.win|\.wasm/.test(r.url()))native.push(r.url());});
 await menu(page);await boss(page,"ch1-25","JEVIL");
 const prep=page.getByRole('dialog',{name:'JEVIL'});await expect(prep).toBeVisible();
 await prep.getByRole('button',{name:/Dice Brace/}).click();await expect(prep.locator('.prep-summary')).toContainText('DF 2');
 await prep.getByRole('button',{name:'+ Add item',exact:true}).click();await prep.locator('.prep-entry').filter({hasText:'Dark Candy'}).click();
 await expect(prep.locator('.prep-bag')).toContainText('Dark Candy');await prep.screenshot({path:'test-results/public-preparation.png'});
 await prep.getByRole('button',{name:'START BATTLE'}).click();await expect(prep).toBeHidden();await expect(page.locator('#status')).toContainText('JEVIL / command');
 await page.waitForTimeout(600);await page.locator('#screen').screenshot({path:'test-results/public-battle.png'});
 for(let i=0;i<3;i++)await defend(page);await expect(page.locator('#status')).toContainText('enemy talk');
 await page.waitForTimeout(700);await key(page,'z');await expect(page.locator('#status')).toContainText('JEVIL / enemy attack');
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');
 await page.locator('#pause').click();await expect(page.locator('#status')).not.toContainText('paused');
 await expect(page.locator('#status')).toContainText('JEVIL / command / TURN 2',{timeout:16000});await expect(page.locator('#outcome')).toBeHidden();
 await page.keyboard.press('ArrowRight');await page.keyboard.press('r');await expect(page.locator('#outcome')).toBeHidden();
 await page.waitForTimeout(600);await page.locator('#screen').screenshot({path:'test-results/public-practice.png'});
 await page.getByRole('button',{name:'Device menu',exact:true}).click();await boss(page,"ch1-25","JEVIL");
 await expect(prep.locator('.prep-slots')).toContainText('Dice Brace');await expect(prep.locator('.prep-bag')).toContainText('Dark Candy');
 await prep.getByRole('button',{name:'Close preparation'}).click();await page.reload();await menu(page);
 await boss(page,"ch1-25","JEVIL");await expect(prep.locator('.prep-slots')).toContainText('Dice Brace');
 expect(failures).toEqual([]);expect(native).toEqual([]);
});
test('unavailable encounters still open equipment previews without launching a fake fight',async({page})=>{
 await menu(page);await boss(page,"ch1-40","King");
 const prep=page.getByRole('dialog',{name:'King',exact:true});await expect(prep).toBeVisible();await expect(prep.getByRole('button',{name:'IN DEVELOPMENT',exact:true})).toBeDisabled();
 await prep.getByRole('button',{name:'Close preparation'}).click();await expect(page.locator('#practice')).toBeDisabled();
});
test('mobile preparation fits the viewport and retains touch controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await menu(page);
 await boss(page,"ch1-25","JEVIL");const prep=page.getByRole('dialog',{name:'JEVIL'});await expect(prep).toBeVisible();
 const bounds=await prep.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.width).toBeLessThanOrEqual(390);
 await page.screenshot({path:'test-results/public-mobile.png'});await prep.getByRole('button',{name:'START BATTLE'}).click();await expect(page.locator('#status')).toContainText('command');
});
test('retry recovers a transient public equipment request failure',async({page})=>{
 let blocked=false;await page.route('**/generated/equipment.json',async route=>{if(!blocked){blocked=true;await route.abort();}else await route.continue();});
 await page.goto(url);await expect(page.locator('#error')).toBeVisible();await page.locator('#retry').click();
 await expect(page.getByRole('button',{name:'DELTARUNE remote'})).toBeVisible();
 await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();
 await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 1',exact:true}).click();
 await boss(page,"ch1-25","JEVIL");await expect(page.getByRole('button',{name:'START BATTLE'})).toBeEnabled();
});
test('chapter previews load and paused music stays paused after movement and mute changes',async({page})=>{
 await page.addInitScript(()=>{const NativeAudio=window.Audio;const tracks:HTMLAudioElement[]=[];(window as any).__tracks=tracks;window.Audio=class extends NativeAudio{constructor(src?:string){super(src);tracks.push(this);}};});
 const images:string[]=[];page.on('response',r=>{if(r.ok())images.push(r.url());});await menu(page);
 expect(images.some(url=>url.includes('/sprites/2/spr_tasque_idle_0.png'))).toBe(true);
 await boss(page,"ch1-25","JEVIL");await page.getByRole('button',{name:'START BATTLE'}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__tracks.at(-1)?.paused)).toBe(false);
 await page.keyboard.press('p');await expect(page.locator('#status')).toContainText('paused');
 await page.keyboard.press('ArrowRight');await page.locator('#mute').click();await page.locator('#mute').click();
 expect(await page.evaluate(()=>(window as any).__tracks.at(-1).paused)).toBe(true);
});
test('Lancer launches after preparation and returns to commands after his bike race',async({page})=>{
 await menu(page);await boss(page,"ch1-2","Lancer");await page.getByRole('button',{name:'START BATTLE'}).click();
 await expect(page.locator('#status')).toContainText('Lancer / command');await page.waitForTimeout(600);await defend(page);
 await expect(page.locator('#status')).toContainText('enemy talk',{timeout:8000});await page.waitForTimeout(700);await key(page,'z');
 await expect(page.locator('#status')).toContainText('Lancer / enemy attack');await expect(page.locator('#status')).toContainText('Lancer / command / TURN 2',{timeout:16000});
 await expect(page.locator('#outcome')).toBeHidden();
});
test('Lancer FIGHT includes the delayed automatic Susie swing and keeps game frames evenly paced',async({page})=>{
 await page.addInitScript(()=>{(window as any).__pitches=[];(window as any).__frameTimes=[];const make=AudioContext.prototype.createBufferSource;AudioContext.prototype.createBufferSource=function(){const voice=make.call(this),start=voice.start.bind(voice);voice.start=(...args:Parameters<AudioBufferSourceNode['start']>)=>{(window as any).__pitches.push(voice.playbackRate.value);start(...args);};return voice;};const fill=CanvasRenderingContext2D.prototype.fillRect;CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){if(!this.canvas.id&&this.canvas.width===640&&this.canvas.height===480&&x===0&&y===0&&w===640&&h===480)(window as any).__frameTimes.push(performance.now());return fill.call(this,x,y,w,h);};});
 await menu(page);await boss(page,"ch1-2","Lancer");await page.getByRole('button',{name:'START BATTLE'}).click();await expect(page.locator('#status')).toContainText('Lancer / command');
 await page.waitForTimeout(600);await key(page,'z');await key(page,'z');await expect(page.locator('#status')).toContainText('attack');await page.waitForTimeout(650);await page.keyboard.press('z');
 await expect.poll(()=>page.evaluate(()=>(window as any).__pitches.some((p:number)=>Math.abs(p-.9)<.001))).toBe(true);await page.waitForTimeout(350);await page.locator('#screen').screenshot({path:'test-results/lancer-auto-susie.png'});console.log('Source sound pitches:',await page.evaluate(()=>(window as any).__pitches));
 await expect(page.locator('#status')).toContainText('enemy talk',{timeout:8000});const times=await page.evaluate(()=>(window as any).__frameTimes as number[]);const gaps=times.slice(1).map((t,i)=>t-times[i]).filter(n=>n>0).sort((a,b)=>a-b);expect(gaps.length).toBeGreaterThan(50);const median=gaps[Math.floor(gaps.length*.5)],p95=gaps[Math.floor(gaps.length*.95)];console.log('Game frame gaps (ms):',{median,p95});expect(median).toBeGreaterThan(25);expect(median).toBeLessThan(42);expect(p95).toBeLessThan(70);
});
test('single-pattern Jevil practice remains a separate explicit launch',async({page})=>{
 await menu(page);await boss(page,"ch1-25","JEVIL");await page.getByRole('button',{name:'Close preparation'}).click();
 await page.getByRole('button',{name:'Practice selected boss'}).click();await page.getByRole('button',{name:'START PRACTICE'}).click();await expect(page.locator('#status')).toContainText('PRACTICE');
});

test('FIGHT shows source timing lanes, plays original samples and continues after swings',async({page})=>{
 await page.addInitScript(()=>{(window as any).__sampleStarts=0;const create=AudioContext.prototype.createBufferSource;AudioContext.prototype.createBufferSource=function(){const voice=create.call(this),start=voice.start.bind(voice);voice.start=(...args:Parameters<AudioBufferSourceNode['start']>)=>{(window as any).__sampleStarts++;start(...args);};return voice;};});
 const failures:string[]=[],sounds:string[]=[];page.on('pageerror',e=>failures.push(e.message));page.on('request',r=>{if(r.url().includes('/remake/ch1/sounds/'))sounds.push(r.url());});
 await menu(page);await boss(page,"ch1-25","JEVIL");await page.getByRole('button',{name:'START BATTLE',exact:true}).click();
 await page.waitForTimeout(600);for(let i=0;i<3;i++){await key(page,'z');await key(page,'z');}
 await expect(page.locator('#status')).toContainText('JEVIL / attack');await page.waitForTimeout(650);await page.locator('#screen').screenshot({path:'test-results/public-timing.png'});
 await page.keyboard.press('z');await expect.poll(()=>page.evaluate(()=>(window as any).__sampleStarts)).toBeGreaterThan(0);
 await page.waitForTimeout(700);await page.locator('#screen').screenshot({path:'test-results/public-hit.png'});
 await expect(page.locator('#status')).toContainText('JEVIL / enemy talk',{timeout:8000});await expect(page.locator('#outcome')).toBeHidden();
 expect(sounds.some(s=>s.endsWith('/snd_laz_c.wav'))).toBe(true);expect(sounds.some(s=>s.endsWith('/snd_hurt1.wav'))).toBe(true);expect(failures).toEqual([]);
});
test('Clover launches with Kris and Ralsei, runs a Check turn and her own attack, and returns to commands',async({page})=>{
 const failures:string[]=[];page.on('pageerror',e=>failures.push(e.message));
 await menu(page);await boss(page,"ch1-8","Clover");await page.getByRole('button',{name:'START BATTLE'}).click();
 await expect(page.locator('#status')).toContainText('Clover / command');
 // ACT, Clover, Check; then Ralsei DEFENDs. Z then moves the Check text and Clover's speech along.
 await page.waitForTimeout(600);await key(page,'ArrowRight');await key(page,'z');await key(page,'z');await key(page,'z');await defend(page);
 for(let i=0;i<40&&!(await page.locator('#status').textContent())?.includes('Clover / enemy attack');i++){await page.keyboard.press('z');await page.waitForTimeout(250);}
 await expect(page.locator('#status')).toContainText('Clover / enemy attack');await page.locator('#screen').screenshot({path:'test-results/public-clover.png'});
 await expect(page.locator('#status')).toContainText('Clover / command / TURN 2',{timeout:16000});await expect(page.locator('#outcome')).toBeHidden();
 expect(failures).toEqual([]);
});
