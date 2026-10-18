import {test,expect,type Page} from '@playwright/test';

async function openKnight(page:Page){
 await page.goto((process.env.UNDERRUNE_DEV_URL??'/')+'?demo=1&seed=11');
 await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 3',exact:true}).click();
 await page.locator('#boss-select').selectOption('ch3-115');await page.getByRole('button',{name:/^Battle .* ch3-115$/}).click();await page.getByRole('button',{name:'START BATTLE'}).click();
 const status=page.locator('#status');await expect(status).toContainText('Roaring Knight / command',{timeout:20000});
}
test('Knight renders four attacks with every referenced sprite present',async({page})=>{
 test.setTimeout(150000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await openKnight(page);const status=page.locator('#status');
 await page.waitForTimeout(1000);await page.locator('#screen').screenshot({path:'test-results/knight-english-command.png'});
 await page.evaluate(()=>{
  const b=(window as any).__underrune.inspect(),rt=b.rt,draw=rt.drawSprite.bind(rt);(window as any).knightAssets={missing:[],shown:[]};
  rt.drawSprite=(name:string,...args:any[])=>{if(name){const log=(window as any).knightAssets;log.shown.push(name);if(!rt.gfx.assets.sprite(name))log.missing.push(name);}return draw(name,...args);};
  // This is a visual acceptance run; prevent a wipe so all four patterns can be inspected.
  const step=b.step.bind(b);(window as any).knightOriginalStep=step;
  b.step=()=>{rt.globals.inv=999999;const result=step();rt.globals.inv=999999;return result;};
 });
 for(let turn=1;turn<=4;turn++){
  await page.evaluate(()=>{(window as any).knightAssets.shown=[];});
  for(let i=0;i<100&&!(await status.textContent())?.includes('enemy attack');i++){await page.keyboard.press('z');await page.waitForTimeout(150);}
  await expect(status).toContainText('enemy attack',{timeout:10000});await page.waitForTimeout(2500);
  await page.locator('#screen').screenshot({path:`test-results/knight-attack-${turn}.png`});
  const assets=await page.evaluate(()=>(window as any).knightAssets);expect(assets.missing).toEqual([]);
  if(turn===1)expect(assets.shown).toContain('spr_knight_bullet_flow');
  if(turn===2)expect(assets.shown).toContain('spr_roaringknight_sword_ol');
  if(turn===3)expect(assets.shown.some((name:string)=>name.startsWith('spr_rk_quickslash_'))).toBe(true);
  await expect(status).toContainText(`command / TURN ${turn+1}`,{timeout:45000});
 }
 expect(errors).toEqual([]);
});

test('Knight first loss and special advice remain readable and retry correctly',async({page})=>{
 test.setTimeout(100000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await openKnight(page);const status=page.locator('#status');
 for(const screen of ['first-loss','knight-advice']){
  await page.evaluate(()=>(window as any).__underrune.lose());
  // Soul animation must finish without Z: repeated presses there intentionally skip straight to retry.
  await page.waitForTimeout(5500);
  for(let i=0;i<220&&!await page.evaluate(()=>(window as any).__underrune.choosing());i++){await page.keyboard.press('z');await page.waitForTimeout(150);}
  const detail=await page.evaluate(()=>{const b=(window as any).__underrune.inspect();return b.rt.instances.filter((i:any)=>i.live&&(i.object.name==='DEVICE_FAILURE'||i.object.name==='obj_writer')).map((i:any)=>({object:i.object.name,...Object.fromEntries(["knight_mode_con","EVENT","pos","halt","length","knight_mode"].filter(k=>k in i).map(k=>[k,i[k]]))}));});
  await page.locator('#screen').screenshot({path:`test-results/knight-${screen}-before-choice.png`});
  expect(await page.evaluate(()=>(window as any).__underrune.choosing()),JSON.stringify(detail)).toBe(true);
  await page.waitForTimeout(1000);await page.locator('#screen').screenshot({path:`test-results/knight-${screen}.png`});
  await page.keyboard.press('ArrowLeft');await page.waitForTimeout(400);await page.keyboard.press('z');
  await expect(status).toContainText('Roaring Knight / command / TURN 1',{timeout:15000});
 }
 expect(errors).toEqual([]);
});


