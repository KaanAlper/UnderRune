import {test,expect} from '@playwright/test';

test('Band accepts legal dance commands, teaches ACT and plays its complete ending',async({page})=>{
 test.setTimeout(220000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.UNDERRUNE_DEV_URL??'/')+'?demo=1&dev=1&seed=11');
 for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'Chapter 2',exact:true}).click();await page.locator('#boss-select').selectOption('ch2-62');
 await page.getByRole('button',{name:/^Battle .* ch2-62$/}).click();await page.getByRole('button',{name:'START BATTLE'}).click();
 const status=page.locator('#status');await expect(status).toContainText('Sweet',{timeout:20000});
 await page.evaluate(()=>{
  const b=(window as any).__underrune.inspect(),rt=b.rt,step=b.step.bind(b),draw=rt.drawSprite.bind(rt);
  (window as any).bandTour={learned:false,video:false,missing:[]};
  // Match the reference recording's survival condition; commands and all enemy state remain source-owned.
  for(const c of b.party)rt.globals.hp[c]=rt.globals.maxhp[c]=99999;
  b.step=()=>{
   const out=step(),tour=(window as any).bandTour;
   tour.learned||=rt.instances.some((i:any)=>i.live&&i.object.name==='obj_sweet_enemy'&&i.learnedAct);
   tour.video||=rt.instances.some((i:any)=>i.live&&i.object.name==='obj_musical_battle_end');return out;
  };
  rt.drawSprite=(name:string,...args:any[])=>{if(name&&!rt.gfx.assets.sprite(name)&&!(window as any).bandTour.missing.includes(name))(window as any).bandTour.missing.push(name);return draw(name,...args);};
 });
 await page.locator('#screen').screenshot({path:'test-results/band-command.png'});
 let lesson=false,video=false;
 for(let n=0;n<1000;n++){
  const state=await page.evaluate(()=>{
   const b=(window as any).__underrune.inspect(),rt=b.rt,g=rt.globals,s=rt.instances.find((i:any)=>i.live&&i.object.name==='obj_sweet_enemy'),tour=(window as any).bandTour;
   let key='z';const t=g.charturn,m=g.bmenuno,c=g.bmenucoord;
   if(s&&g.myfight===0&&g.mnfight===0){
    if(m===0){const target=t===0||s.learnedAct?1:4;if(c[0][t]!==target)key='ArrowRight';}
    if(m===11||m===13){if(c[m][t]!== (s.learnedAct?t:0))key='ArrowDown';}
    if(m===9&&c[9][t]!==1)key='ArrowRight';if(m===2&&c[2][t]!==0)key='ArrowUp';
   }
   return {key,outcome:b.outcome,learned:tour.learned,video:tour.video};
  });
  if(state.learned&&!lesson){lesson=true;await page.locator('#screen').screenshot({path:'test-results/band-lesson.png'});}
  if(state.video&&!video){video=true;await page.waitForTimeout(1500);await page.locator('#screen').screenshot({path:'test-results/band-video.png'});}
  if(state.outcome==='victory')break;
  await page.keyboard.press(state.key);await page.waitForTimeout(170);
 }
 expect(lesson).toBe(true);expect(video).toBe(true);await expect(status).toContainText('victory',{timeout:10000});
 expect(await page.evaluate(()=>(window as any).bandTour.missing)).toEqual([]);expect(errors).toEqual([]);
});
