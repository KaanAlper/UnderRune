import {test,expect,type Page} from '@playwright/test';

// A player's tour of the Knight's battle for visual review: every menu, an ACT, Susie's and Ralsei's spells, an item,
// FIGHT, the enemy's speech and an attack, each captured to test-results/knight-tour-*.png. Development only.
async function openKnight(page:Page){
 await page.goto((process.env.UNDERRUNE_DEV_URL??'/')+'?demo=1&seed=11');
 await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 3',exact:true}).click();
 await page.locator('#boss-select').selectOption('ch3-115');await page.getByRole('button',{name:/^Battle .* ch3-115$/}).click();await page.getByRole('button',{name:'START BATTLE'}).click();
 await expect(page.locator('#status')).toContainText('Roaring Knight / command',{timeout:20000});
}
test('Knight battle tour',async({page})=>{
 test.setTimeout(240000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await openKnight(page);
 let n=0;const shot=async(name:string,wait=600)=>{await page.waitForTimeout(wait);await page.locator('#screen').screenshot({path:`test-results/knight-tour-${String(++n).padStart(2,'0')}-${name}.png`});};
 const key=async(k:string,wait=180)=>{await page.keyboard.press(k);await page.waitForTimeout(wait);};
 await shot('command');
 // Turn 1: Kris ACT Check, Susie Rude Buster, Ralsei DEFEND.
 await key('ArrowRight');await key('z');await shot('act-target');await key('z');await shot('act-menu');await key('z');
 await shot('susie-turn');await key('ArrowRight');await key('z');await shot('susie-spells');await key('ArrowRight');await key('z');await shot('susie-target');await key('z');
 await shot('ralsei-turn');await key('ArrowLeft');await key('z');
 for(let i=0;i<16;i++){await shot(`turn1-${i}`,450);await key('z',250);}
 // Turn 2: FIGHT with everyone.
 for(let i=0;i<40&&!(await page.locator('#status').textContent())?.includes('command / TURN 2');i++)await key('z',300);
 await shot('turn2-command');await key('z');await key('z');await key('z');await key('z');await key('z');await key('z');
 for(let i=0;i<14;i++){await shot(`turn2-${i}`,400);await key('z',250);}
 expect(errors).toEqual([]);
});
