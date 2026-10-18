import {test,expect} from '@playwright/test';

test('Rouxls opens with Kris and Ralsei, accepts a house and plays all three attacks',async({page})=>{
 test.setTimeout(200000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.UNDERRUNE_DEV_URL??'/')+'?demo=1&dev=1&seed=11');
 for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'Chapter 2',exact:true}).click();await page.locator('#boss-select').selectOption('ch2-63');
 await page.getByRole('button',{name:/^Battle .* ch2-63$/}).click();await page.getByRole('button',{name:'START BATTLE'}).click();
 const status=page.locator('#status');await expect(status).toContainText('Rouxls / command',{timeout:20000});
 await expect.poll(()=>page.evaluate(()=>(window as any).__underrune.inspect().rt.instances.find((i:any)=>i.live&&i.object.name==='obj_battlecontroller')?.intro),{timeout:5000}).toBe(0);
 const key=async(k:string)=>{await page.keyboard.press(k);await page.waitForTimeout(180);};
 const town=()=>page.evaluate(()=>{const rt=(window as any).__underrune.inspect().rt,t=rt.instances.find((i:any)=>i.live&&i.object.name==='obj_rouxls_simtown');return t?{turn:t.MyTurn,x:t.CursorX,y:t.CursorY,tiles:t.TileYouCanBuild,houses:t.TileHasHouse.flat().filter((v:number)=>v===1).length}:null;});
 await page.evaluate(()=>{
  const b=(window as any).__underrune.inspect(),rt=b.rt,step=b.step.bind(b),draw=rt.drawSprite.bind(rt);(window as any).rouxlsMissing=[];
  // Visual tour: keep the party standing without modifying the enemy, board, source timers or damage code.
  b.step=()=>{rt.globals.inv=999999;const out=step();rt.globals.inv=999999;return out;};
  rt.drawSprite=(name:string,...args:any[])=>{if(name&&!rt.gfx.assets.sprite(name))(window as any).rouxlsMissing.push(name);return draw(name,...args);};
 });
 await page.locator('#screen').screenshot({path:'test-results/rouxls-command.png'});
 expect(await page.evaluate(()=>(window as any).__underrune.inspect().party)).toEqual([1,3]);
 const initialHouses=(await town())!.houses;
 const choices:unknown[]=[];
 for(const k of ['ArrowRight','z','z','ArrowRight','z','ArrowLeft','z','z']){
  await key(k);choices.push(await page.evaluate(()=>{const g=(window as any).__underrune.inspect().rt.globals;return {menu:g.bmenuno,turn:g.charturn,cursor:g.bmenucoord[0],act:g.bmenucoord[9],acting:g.actingchoice,myfight:g.myfight};}));
 }
 for(let i=0;i<100&&(await town())?.turn!==1&&(await town())!.houses===initialHouses;i++)await key('z');
 const before=(await town())!;
 expect(before.turn===1||before.houses>initialHouses,JSON.stringify({choices,town:before})).toBe(true);
 await page.locator('#screen').screenshot({path:'test-results/rouxls-board.png'});
 if(before.turn===1){
  let target:{x:number;y:number}|undefined;
  for(let x=0;x<16&&!target;x++)for(let y=0;y<6&&!target;y++)if(before.tiles[x][y]===1)target={x,y};
  expect(target).toBeDefined();
  while((await town())!.x<target!.x)await key('ArrowRight');while((await town())!.x>target!.x)await key('ArrowLeft');
  while((await town())!.y<target!.y)await key('ArrowDown');while((await town())!.y>target!.y)await key('ArrowUp');await key('z');
 }
 expect((await town())!.houses).toBeGreaterThan(initialHouses);
 for(let turn=1;turn<=3;turn++){
  for(let i=0;i<120&&!(await status.textContent())?.includes('enemy attack');i++)await key('z');
  await expect(status).toContainText('enemy attack',{timeout:10000});await page.waitForTimeout(2600);
  await page.locator('#screen').screenshot({path:`test-results/rouxls-attack-${turn}.png`});
  await expect(status).toContainText(`command / TURN ${turn+1}`,{timeout:40000});
 }
 expect(await page.evaluate(()=>(window as any).rouxlsMissing)).toEqual([]);expect(errors).toEqual([]);
});
