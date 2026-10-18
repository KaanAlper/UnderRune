import {test,expect} from '@playwright/test';

test('fragments emitted by the first Stars explosion damage the party in the browser',async({page})=>{
 test.setTimeout(80000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.UNDERRUNE_DEV_URL??'/')+'?demo=1&seed=11');
 for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'Chapter 3',exact:true}).click();await page.locator('#boss-select').selectOption('ch3-115');
 await page.getByRole('button',{name:/^Battle .* ch3-115$/}).click();await page.getByRole('button',{name:'START BATTLE',exact:true}).click();
 const status=page.locator('#status');await expect(status).toContainText('Roaring Knight / command',{timeout:20000});
 await page.evaluate(()=>{
  const b=(window as any).__underrune.inspect(),rt=b.rt,step=b.step.bind(b),event=rt.userEvent.bind(rt);
  (window as any).fragmentContact={positioned:false,contacts:[]};
  rt.userEvent=(s:any,n:number)=>{
   const log=(window as any).fragmentContact,record=n===5&&s.object.name==='obj_knight_pointing_starchild'&&log.positioned;
   const before=record?rt.globals.hp.slice():null;const result=event(s,n);
   if(record)log.contacts.push({before,after:rt.globals.hp.slice(),active:s.active,inv:rt.globals.inv});return result;
  };
  b.step=()=>{
   const log=(window as any).fragmentContact,g=rt.globals,h=rt.instances.find((i:any)=>i.live&&i.object.name==='obj_heart'),box=rt.instances.find((i:any)=>i.live&&i.object.name==='obj_growtangle');
   // Move only the soul, inside the actual arena, into a live emitted fragment. The original collision,
   // precision test, invulnerability and damage dispatch all still execute in their normal frame order.
   if(!log.positioned&&h&&box&&g.inv<0){
    const child=rt.instances.find((i:any)=>i.live&&i.object.name==='obj_knight_pointing_starchild'&&i.active===1&&i.x>box.x-rt.spriteWidth(box)/2+28&&i.x<box.x+rt.spriteWidth(box)/2-28&&i.y>box.y-rt.spriteHeight(box)/2+28&&i.y<box.y+rt.spriteHeight(box)/2-28);
    if(child){h.x=child.x-10;h.y=child.y-10;log.positioned=true;}
   }
   return step();
  };
 });
 for(let i=0;i<100&&!(await status.textContent())?.includes('enemy attack');i++){await page.keyboard.press('z');await page.waitForTimeout(150);}
 await expect(status).toContainText('enemy attack',{timeout:10000});
 await expect.poll(()=>page.evaluate(()=>(window as any).fragmentContact.contacts.some((c:any)=>[1,2,3].every(i=>c.after[i]<c.before[i]))),{timeout:20000}).toBe(true);
 expect(errors).toEqual([]);
});
