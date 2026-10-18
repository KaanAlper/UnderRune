import {test,expect} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
// The Chapter 2 bosses that run on the Chapter 2 host open from their cards in the public demo and play a full turn.
// A turn can also end the battle: Spamton fights Kris alone (a soul that never moves can fall), and the Dojo's Tasque
// Manager ends it after her quiz (three strikes).
for(const [id,name,card,ending] of [['ch2-57','Tasque Manager','Tasque & Tasque Manager',''],['ch2-81','Werewerewire','Werewerewire',''],['ch2-83','Mauswheel','Mauswheel',''],['ch2-89','Tasque Manager','Tasque Manager','victory'],['ch2-60','Spamton','Spamton','game over']] as const){
 test(`${name} (${id}) opens and plays a full turn`,async({page})=>{
  test.setTimeout(90000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();
  await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:'Chapter 2',exact:true}).click();
  await page.locator('#boss-select').selectOption(id);await page.getByRole('button',{name:`Battle ${card} ${id}`,exact:true}).click();
  await page.getByRole('button',{name:'START BATTLE'}).click();
  const status=page.locator('#status');await expect(status).toContainText(`${name} / command`,{timeout:20000});
  await page.waitForTimeout(800);await page.locator('#screen').screenshot({path:`test-results/ch2-${id}-command.png`});
  for(let i=0;i<80&&!(await status.textContent())?.includes('enemy attack');i++){await page.keyboard.press('z');await page.waitForTimeout(200);}
  await expect(status).toContainText('enemy attack',{timeout:5000});await page.waitForTimeout(1500);
  await page.locator('#screen').screenshot({path:`test-results/ch2-${id}-attack.png`});
  await expect(status).toHaveText(new RegExp('command / TURN 2'+(ending?'|'+ending:'')),{timeout:30000});
  expect(errors).toEqual([]);
 });
}
