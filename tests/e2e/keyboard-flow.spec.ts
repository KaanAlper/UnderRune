import {test,expect} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';

test('Z X and arrows navigate theater, chapters, cards, board, routes, bag and battle without a pointer or Tab',async({page})=>{
 test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(url);await expect(page.locator('#loading')).toBeHidden();
 await page.keyboard.press('z');await expect(page.getByRole('button',{name:'Connect DELTARUNE',exact:true})).toBeVisible();
 await page.keyboard.press('z');await expect(page.getByRole('button',{name:'Connect device',exact:true})).toBeVisible();
 await page.keyboard.press('z');await expect(page.getByRole('button',{name:'Chapter 2',exact:true})).toBeVisible();
 await page.keyboard.press('ArrowDown');await page.keyboard.press('z');await expect(page.locator('#status')).toContainText('CHAPTER 2');
 const card=page.locator('.boss-card[aria-current="true"]');await expect(card).toBeFocused();
 const first=await card.getAttribute('aria-label');await page.keyboard.press('ArrowRight');await expect(card).not.toHaveAttribute('aria-label',first!);await page.keyboard.press('ArrowLeft');await expect(card).toHaveAttribute('aria-label',first!);
 await page.keyboard.press('ArrowDown');await expect(page.getByRole('button',{name:'Prepare party',exact:true})).toBeFocused();
 await page.keyboard.press('ArrowDown');await expect(page.getByRole('button',{name:'Previous encounters',exact:true})).toBeFocused();await page.keyboard.press('z');await expect(card).not.toHaveAttribute('aria-label',first!);
 await page.keyboard.press('ArrowDown');await expect(page.getByRole('button',{name:'Next encounters',exact:true})).toBeFocused();await page.keyboard.press('z');await expect(card).toHaveAttribute('aria-label',first!);await page.keyboard.press('x');await expect(card).toBeFocused();
 // Up reaches the native boss picker; its native arrows select encounters, X returns to the card.
 await page.keyboard.press('ArrowUp');await expect(page.locator('#boss-select')).toBeFocused();
 for(let i=0;i<30&&await page.locator('#boss-select').inputValue()!=='ch2-61';i++)await page.keyboard.press('ArrowDown');
 await expect(page.locator('#boss-select')).toHaveValue('ch2-61');await expect(card).toHaveAttribute('aria-label','Battle Spamton NEO ch2-61');await page.keyboard.press('x');await expect(card).toBeFocused();
 await page.keyboard.press('ArrowDown');await expect(page.getByRole('button',{name:'Leaderboard',exact:true})).toBeFocused();
 await page.keyboard.press('z');const board=page.getByRole('dialog',{name:'Battle leaderboard',exact:true});await expect(board).toBeVisible();
 await page.keyboard.press('x');await expect(board).toBeHidden();await page.keyboard.press('x');await expect(card).toBeFocused();await page.keyboard.press('z');
 const routes=page.getByRole('dialog',{name:'Choose route',exact:true});await expect(routes).toBeVisible();await page.keyboard.press('z');
 const prep=page.getByRole('dialog',{name:'Spamton NEO',exact:true});await expect(prep).toBeVisible();
 for(let i=0;i<4;i++)await page.keyboard.press('ArrowDown');await expect(prep.getByRole('button',{name:'+ Add item',exact:true})).toBeFocused();
 await page.keyboard.press('z');await expect(prep.locator('.prep-entry:not(:disabled)').first()).toBeFocused();await page.keyboard.press('z');
 await expect(prep.locator('.prep-bagitem:not(.is-empty)')).toHaveCount(1);await page.keyboard.press('x');
 await page.keyboard.press('ArrowDown');await expect(prep.locator('.prep-bagitem').first()).toBeFocused();await page.keyboard.press('z');await expect(prep.locator('.prep-bagitem:not(.is-empty)')).toHaveCount(0);
 // Last bag row -> footer -> Start, all using directional navigation.
 for(let i=0;i<5&&!(await prep.getByRole('button',{name:'START BATTLE',exact:true}).evaluate(el=>el===document.activeElement));i++)await page.keyboard.press('ArrowDown');
 await expect(prep.getByRole('button',{name:'START BATTLE',exact:true})).toBeFocused();await page.keyboard.press('z');
 await expect(prep).toBeHidden();await expect(page.locator('#status')).toContainText('Spamton NEO / command',{timeout:20000});expect(errors).toEqual([]);
});
