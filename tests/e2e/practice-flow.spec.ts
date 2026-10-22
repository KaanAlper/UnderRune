import {test,expect,type Page} from '@playwright/test';

async function menu(page:Page){
 await page.goto('/?demo=1');
 for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device','Chapter 1'])await page.getByRole('button',{name,exact:true}).click();
 await page.locator('#boss-select').selectOption('ch1-25');
}

test('practice is prominent, keyboard accessible and restarts the selected attack',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await menu(page);
 const panel=page.getByRole('region',{name:'Attack practice'}),select=page.locator('#attack-select');
 await expect(panel).toBeVisible();await expect(page.locator('#practice-boss')).toHaveText('JEVIL');
 const bounds=await panel.boundingBox(),stage=await page.locator('#stage').boundingBox();
 expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(stage!.y);
 expect(bounds!.y).toBeGreaterThanOrEqual(0);
 await page.waitForTimeout(250);await page.screenshot({path:'test-results/practice-desktop.png'});
 await page.getByRole('button',{name:'Attack practice',exact:true}).focus();await page.keyboard.press('z');
 await expect(select).toBeFocused();await page.keyboard.press('ArrowDown');await expect(select).toHaveValue('1');
 await page.keyboard.press('x');await expect(page.locator('.boss-card[aria-current=true]')).toBeFocused();
 await page.getByRole('button',{name:'Attack practice',exact:true}).focus();await page.keyboard.press('z');
 await page.keyboard.press('ArrowRight');await expect(page.locator('#practice')).toBeFocused();await page.keyboard.press('Enter');
 const prep=page.getByRole('dialog',{name:'JEVIL',exact:true});await expect(prep).toBeVisible();
 await prep.getByRole('button',{name:'START PRACTICE',exact:true}).click();
 await expect(page.locator('#status')).toContainText('Diamond rain / PRACTICE');
 await page.keyboard.press('r');await expect(page.locator('#status')).toContainText('Diamond rain / PRACTICE');
 await expect(panel).toBeHidden();expect(errors).toEqual([]);
});

for(const [id,name,party] of [
 ['ch2-59','Queen',3],['ch2-58','Berdly',3],['ch2-82','Berdly',2],
] as const)test(`public ${id} renders its party and enters an original enemy attack`,async({page})=>{
 test.setTimeout(45000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?demo=1');
 for(const button of ['DELTARUNE remote','Connect DELTARUNE','Connect device','Chapter 2'])await page.getByRole('button',{name:button,exact:true}).click();
 await page.locator('#boss-select').selectOption(id);await page.getByRole('button',{name:`Battle ${name} ${id}`,exact:true}).click();
 const prep=page.getByRole('dialog',{name,exact:true});await expect(prep.locator('.prep-hero')).toHaveCount(party);
 await prep.getByRole('button',{name:'START BATTLE',exact:true}).click();
 const status=page.locator('#status');await expect(status).toContainText('command',{timeout:20000});
 await page.waitForTimeout(200);
 for(let i=0;i<party;i++){
  await page.keyboard.press('ArrowLeft');await page.waitForTimeout(180);
  await page.keyboard.press('z');await page.waitForTimeout(180);
 }
 for(let i=0;i<40&&!(await status.textContent())?.includes('enemy attack');i++){await page.keyboard.press('z');await page.waitForTimeout(150);}
 await expect(status).toContainText('enemy attack');await page.waitForTimeout(1500);
 await expect(page.locator('#error')).toBeHidden();expect(errors).toEqual([]);
});

test('practice panel and boss actions fit on a narrow screen',async({page})=>{
 await page.setViewportSize({width:390,height:844});await menu(page);
 const panel=await page.locator('#menu-tools').boundingBox(),select=await page.locator('#attack-select').boundingBox(),button=await page.locator('#practice').boundingBox();
 for(const r of [panel,select,button]){expect(r!.x).toBeGreaterThanOrEqual(0);expect(r!.x+r!.width).toBeLessThanOrEqual(390);}
 expect(select!.x+select!.width).toBeLessThanOrEqual(button!.x);
 const practice=page.getByRole('button',{name:'Attack practice',exact:true});
 await expect(practice).toBeVisible();await practice.click();await expect(page.locator('#attack-select')).toBeFocused();
 await page.screenshot({path:'test-results/practice-mobile.png',fullPage:true});
});
