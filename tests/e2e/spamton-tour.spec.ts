import {test,expect,type Page} from '@playwright/test';

// A player's tour of Spamton's battle (encounter 60, development entry) for visual review: his attacks, a DEAL with its
// choice box, and F1's helpers, each captured to test-results/spamton-tour-*.png. Development only.
async function openSpamton(page:Page){
 await page.goto((process.env.UNDERRUNE_DEV_URL??'/')+'?demo=1&dev=1&seed=11');
 await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 2',exact:true}).click();
 await page.locator('#boss-select').selectOption('ch2-60');await page.getByRole('button',{name:/^Battle .* ch2-60$/}).click();await page.getByRole('button',{name:'START BATTLE'}).click();
 await expect(page.locator('#status')).toContainText('Spamton / command',{timeout:20000});
}
test('Spamton battle tour',async({page})=>{
 test.setTimeout(300000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await openSpamton(page);
 const status=page.locator('#status');
 let n=0;const shot=async(name:string,wait=500)=>{await page.waitForTimeout(wait);await page.locator('#screen').screenshot({path:`test-results/spamton-tour-${String(++n).padStart(2,'0')}-${name}.png`});};
 const key=async(k:string,wait=160)=>{await page.keyboard.press(k);await page.waitForTimeout(wait);};
 // Keep Kris standing through every attack.
 await page.evaluate(()=>{const b=(window as any).__underrune.inspect(),step=b.step.bind(b);b.step=()=>{b.rt.globals.inv=999999;return step();};});
 await shot('command');
 // F1: his helpers.
 await key('F1',100);await shot('help',300);await shot('help-heal',1200);
 // Three turns of FIGHT, each attack captured as it goes.
 for(let turn=1;turn<=3;turn++){
  for(let i=0;i<60&&!(await status.textContent())?.includes('enemy attack');i++)await key('z',200);
  for(let i=0;i<5;i++)await shot(`attack${turn}-${i}`,1300);
  await expect(status).toContainText(`command / TURN ${turn+1}`,{timeout:30000});
 }
 // ACT, Spamton, Deal: his offer, then the choice box.
 await key('ArrowRight');await key('z');await key('z');await shot('act-menu');await key('ArrowRight');await key('z');
 for(let i=0;i<12;i++){await shot(`deal-${i}`,700);await key('z',200);}
 // The choice box reads held keys: hold left for a few frames.
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(250);await page.keyboard.up('ArrowLeft');await shot('choice',200);await key('z');
 for(let i=0;i<6;i++){await shot(`reply-${i}`,700);await key('z',200);}
 expect(errors).toEqual([]);
});
