import {test,expect} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';

for(const uppercase of [false,true])test(`Z X and arrows navigate theater, chapters, cards, board, routes, bag and battle without a pointer or Tab${uppercase?' (uppercase)':''}`,async({page})=>{
 const press=(key:string)=>page.keyboard.press(uppercase&&/^[zx]$/.test(key)?key.toUpperCase():key);
 test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(url);await expect(page.locator('#loading')).toBeHidden();
 await press('z');await expect(page.getByRole('button',{name:'Connect DELTARUNE',exact:true})).toBeVisible();
 await press('z');await expect(page.getByRole('button',{name:'Connect device',exact:true})).toBeVisible();
 await press('z');await expect(page.getByRole('button',{name:'Chapter 2',exact:true})).toBeVisible();
 await press('ArrowDown');await press('z');await expect(page.locator('#status')).toContainText('CHAPTER 2');
 const card=page.locator('.boss-card[aria-current="true"]');await expect(card).toBeFocused();
 const first=await card.getAttribute('aria-label');await press('ArrowRight');await expect(card).not.toHaveAttribute('aria-label',first!);await press('ArrowLeft');await expect(card).toHaveAttribute('aria-label',first!);
 // Chapter 2 opens on a playable card (Tasque Manager): its Leaderboard comes before Prepare party.
 await press('ArrowDown');await expect(page.getByRole('button',{name:'Leaderboard',exact:true})).toBeFocused();
 await press('ArrowDown');await expect(page.getByRole('button',{name:'Prepare party',exact:true})).toBeFocused();
 await press('ArrowDown');await expect(page.getByRole('button',{name:'Previous encounters',exact:true})).toBeFocused();await press('z');await expect(card).not.toHaveAttribute('aria-label',first!);
 await press('ArrowDown');await expect(page.getByRole('button',{name:'Next encounters',exact:true})).toBeFocused();await press('z');await expect(card).toHaveAttribute('aria-label',first!);await press('x');await expect(card).toBeFocused();
 // Up reaches the native boss picker; its native arrows select encounters, X returns to the card.
 await press('ArrowUp');await expect(page.locator('#boss-select')).toBeFocused();
 for(let i=0;i<30&&await page.locator('#boss-select').inputValue()!=='ch2-61';i++)await press('ArrowDown');
 await expect(page.locator('#boss-select')).toHaveValue('ch2-61');await expect(card).toHaveAttribute('aria-label','Battle Spamton NEO ch2-61');await press('x');await expect(card).toBeFocused();
 await press('ArrowDown');await expect(page.getByRole('button',{name:'Leaderboard',exact:true})).toBeFocused();
 await press('z');const board=page.getByRole('dialog',{name:'Battle leaderboard',exact:true});await expect(board).toBeVisible();
 await press('x');await expect(board).toBeHidden();await press('x');await expect(card).toBeFocused();await press('z');
 const routes=page.getByRole('dialog',{name:'Choose route',exact:true});await expect(routes).toBeVisible();await press('z');
 const prep=page.getByRole('dialog',{name:'Spamton NEO',exact:true});await expect(prep).toBeVisible();
 for(let i=0;i<4;i++)await press('ArrowDown');await expect(prep.getByRole('button',{name:'+ Add item',exact:true})).toBeFocused();
 await press('z');await expect(prep.locator('.prep-entry:not(:disabled)').first()).toBeFocused();await press('z');
 await expect(prep.locator('.prep-bagitem:not(.is-empty)')).toHaveCount(1);await press('x');
 await press('ArrowDown');await expect(prep.locator('.prep-bagitem').first()).toBeFocused();await press('z');await expect(prep.locator('.prep-bagitem:not(.is-empty)')).toHaveCount(0);
 // Last bag row -> footer -> Start, all using directional navigation.
 for(let i=0;i<5&&!(await prep.getByRole('button',{name:'START BATTLE',exact:true}).evaluate(el=>el===document.activeElement));i++)await press('ArrowDown');
 await expect(prep.getByRole('button',{name:'START BATTLE',exact:true})).toBeFocused();await press('z');
 await expect(prep).toBeHidden();await expect(page.locator('#status')).toContainText('Spamton NEO / command',{timeout:20000});expect(errors).toEqual([]);
});
