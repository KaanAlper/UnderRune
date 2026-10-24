import {test,expect} from '@playwright/test';
const url=process.env.UNDERRUNE_PUBLIC_URL??'http://127.0.0.1:5173/?demo=1';
test('Dojo Clover (71) opens publicly, displays the timed Topic clock and plays a full turn',async({page})=>{
 test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.routeWebSocket('**',ws=>ws.close());
 await page.goto(url);await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE',exact:true}).click();await page.getByRole('button',{name:'Connect device',exact:true}).click();await page.getByRole('button',{name:'Chapter 2',exact:true}).click();
 await page.locator('#boss-select').selectOption('ch2-71');await page.getByRole('button',{name:'Battle Clover ch2-71',exact:true}).click();await page.getByRole('button',{name:'START BATTLE',exact:true}).click();
 const status=page.locator('#status');await expect(status).toContainText('Clover / command',{timeout:20000});await page.waitForTimeout(700);
 const tap=async(key:string)=>{await page.keyboard.press(key);await page.waitForTimeout(160);};
 for(const key of ['ArrowRight','z','z','ArrowRight','z','ArrowLeft','z','ArrowLeft','z'])await tap(key);
 await expect(status).toContainText('Clover / act');await page.waitForTimeout(700);
 // The source clock uses the original red TIME label near (320,290), plus the white dial around the disco ball.
 const clock=await page.locator('#screen').evaluate((canvas:HTMLCanvasElement)=>{const ctx=canvas.getContext('2d')!;const count=(x:number,y:number,w:number,h:number,white:boolean)=>{const p=ctx.getImageData(x,y,w,h).data;let total=0;for(let n=0;n<p.length;n+=4)if(white?p[n]>220&&p[n+1]>220&&p[n+2]>220:p[n]>220&&p[n+1]<40&&p[n+2]<40)total++;return total;};return {label:count(240,280,160,42,false),dial:count(250,0,140,130,true)};});
 expect(clock.label).toBeGreaterThan(100);expect(clock.dial).toBeGreaterThan(100);
 await page.locator('#screen').screenshot({path:'test-results/clover-dojo-topic-clock.png'});
 for(let n=0;n<100&&!(await status.textContent())?.includes('enemy attack');n++)await tap('z');await expect(status).toContainText('enemy attack',{timeout:10000});await expect(status).toContainText('command / TURN 2',{timeout:30000});expect(errors).toEqual([]);
});
