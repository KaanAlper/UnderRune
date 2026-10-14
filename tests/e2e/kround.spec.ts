import {test,expect,type Page} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
async function key(page:Page,k:string){await page.keyboard.press(k);await page.waitForTimeout(180);}
async function selectBattle(page:Page,id:string){
 await page.locator('#boss-select').selectOption(id);
 const card=page.getByRole('button',{name:`Battle K.Round ${id}`,exact:true});
 await expect(card).toHaveAttribute('aria-current','true');await card.click();
}
for(const id of ['ch1-12','ch1-27'])test(`${id}: public source-engine Bow ACT, attack and next command turn`,async({page})=>{
 test.setTimeout(60000);
 const failures:string[]=[],native:string[]=[],music:string[]=[];
 page.on('pageerror',e=>failures.push(e.message));
 page.on('request',r=>{if(/\/native\/|data\.win|\.wasm/.test(r.url()))native.push(r.url());});
 page.on('response',r=>{if(r.ok()&&r.url().includes('/generated/music/'))music.push(r.url());});
 await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();
 await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();
 await page.getByRole('button',{name:'Chapter 1',exact:true}).click();await selectBattle(page,id);
 const prep=page.getByRole('dialog',{name:'K.Round'});await expect(prep).toBeVisible();
 await expect(prep.getByRole('region',{name:'Party equipment'})).toContainText('Kris');await expect(prep.getByRole('region',{name:'Party equipment'})).toContainText('Susie');await expect(prep.getByRole('region',{name:'Party equipment'})).toContainText('Ralsei');
 await prep.getByRole('button',{name:'START BATTLE',exact:true}).click();await expect(page.locator('#status')).toContainText('K.Round / command');
 await page.waitForTimeout(600);
 // Kris: ACT -> target -> Bow. First encounter: Ralsei DEFEND, automatic Susie; rematch: two DEFENDs.
 await key(page,'ArrowRight');await key(page,'z');await key(page,'z');await key(page,'ArrowRight');await key(page,'z');
 for(let i=0;i<(id==='ch1-12'?1:2);i++){await key(page,'ArrowLeft');await key(page,'z');}
 await expect(page.locator('#status')).toContainText('K.Round / act');
 await page.locator('#screen').screenshot({path:`test-results/${id}-bow-act.png`});
 for(let i=0;i<60&&!(await page.locator('#status').textContent())?.includes('enemy attack');i++){await page.keyboard.press('z');await page.waitForTimeout(250);}
 await expect(page.locator('#status')).toContainText('K.Round / enemy attack');
 await page.locator('#screen').screenshot({path:`test-results/${id}-enemy-attack.png`});
 await expect(page.locator('#status')).toContainText('K.Round / command / TURN 2',{timeout:20000});
 await expect(page.locator('#outcome')).toBeHidden();
 expect(music.some(s=>s.endsWith('/checkers.ogg'))).toBe(true);expect(failures).toEqual([]);expect(native).toEqual([]);
});
