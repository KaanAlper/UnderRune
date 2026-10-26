import {test,expect} from '@playwright/test';
test('Snowgrave renders its source assets and reaches its ending in the browser',async({page})=>{
 test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?demo=1&seed=11');for(const name of ['DELTARUNE remote','Connect DELTARUNE','Connect device'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'Chapter 2',exact:true}).click();await page.locator('#boss-select').selectOption('ch2-82');await page.getByRole('button',{name:'Battle Berdly ch2-82',exact:true}).click();
 await page.getByRole('button',{name:'Weird / Snowgrave route',exact:true}).click();await page.getByRole('button',{name:'START BATTLE',exact:true}).click();await expect(page.locator('#status')).toContainText('Berdly / command',{timeout:20000});
 await page.evaluate(()=>{
  const w=window as any,b=w.__underrune.inspect(),rt=b.rt;w.snowTour={missing:[],times:[],frames:0};for(const c of b.party)rt.globals.hp[c]=rt.globals.maxhp[c]=99999;
  const draw=rt.drawSprite.bind(rt);rt.drawSprite=(name:string,...args:any[])=>{if(name&&!rt.gfx.assets.sprite(name)&&!w.snowTour.missing.includes(name))w.snowTour.missing.push(name);return draw(name,...args);};
  w.advanceSnow=(middle:boolean)=>{
   const tour=w.snowTour;
   for(let n=0;n<9000&&!b.outcome;n++){
    const g=rt.globals,t=g.charturn,m=g.bmenuno,c=g.bmenucoord;let key=90;
    if(g.myfight===0&&g.mnfight===0){g.tension=g.maxtension;if(m===0&&c[0][t]!== (t===0?4:1))key=39;
     if(m===2){const target=g.battlespell[t].indexOf(10),at=c[2][t];key=at===target?90:at%2!==target%2?39:at<target?40:38;}}
    rt.input.held.clear();if(tour.frames++%8===0){rt.input.pressed.add(key);rt.input.held.add(key);}
    const ctx=rt.gfx.ctx;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,640,480);
    const before=performance.now();b.step();rt.draw();const spell=rt.instances.find((i:any)=>i.live&&i.object.name==='obj_spell_snowgrave');
    if(spell&&spell.timer>=0)tour.times.push(performance.now()-before);
    if(middle&&spell?.timer>=55)break;
   }
   (document.querySelector('#screen') as HTMLCanvasElement).getContext('2d')!.drawImage(rt.gfx.ctx.canvas,0,0);
   return {outcome:b.outcome,flag:rt.globals.flag[915],missing:tour.missing,max:Math.max(0,...tour.times),p95:[...tour.times].sort((a:number,b:number)=>a-b)[Math.floor(tour.times.length*.95)]};
  };
  w.advanceSnow(true);
 });
 await page.locator('#screen').screenshot({path:'test-results/berdly-snowgrave.png'});
 const result=await page.evaluate(()=>(window as any).advanceSnow(false));expect(result.outcome).toBe('victory');expect(result.flag).toBe(6);expect(result.missing).toEqual([]);expect(result.p95).toBeLessThan(100);
 console.log('Snowgrave render timing',result);expect(errors).toEqual([]);
});
