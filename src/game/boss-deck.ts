import type {AssetStore} from './assets';
import type {EncounterRecord} from './types';

/** Launcher scr_init / get_chapter_title, from the installed game's source. */
export const CHAPTER_NAMES=['','The Beginning',"A Cyber's World",'Late Night','Prophecy','Festival Day'];
const COLORS=['#f2bd68','#97e184','#ef91b4','#be99f5','#80d8ed'];
/** A persistent card deck: changing selection repositions existing cards, so rapid navigation is interruptible. */
export class BossDeck{
 readonly element=document.createElement('section');
 private cards:HTMLButtonElement[]=[];
 private picker=document.createElement('select');
 private caption=document.createElement('span');
 private selected=0;private chapter=0;private records:EncounterRecord[]=[];
 private choose:(index:number)=>void=()=>{};private launch:()=>void=()=>{};
 constructor(private assets:AssetStore,private onLeaderboard?:(record:EncounterRecord)=>void){
  this.element.className='boss-deck';this.element.setAttribute('aria-label','Boss card deck');
  let startX=0,startY=0,suppressClick=false;
  this.element.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY;suppressClick=false;});
  this.element.addEventListener('pointerup',e=>{const dx=e.clientX-startX,dy=e.clientY-startY;if(e.pointerType!=='mouse'&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5){suppressClick=true;this.move(dx<0?1:-1);}});
  this.element.addEventListener('click',e=>{if(suppressClick&&e.detail>0){suppressClick=false;e.preventDefault();e.stopImmediatePropagation();}},true);
  this.element.addEventListener('keydown',event=>{
   if(event.ctrlKey||event.altKey||event.metaKey)return;
   const target=event.target;if(!(target instanceof HTMLElement))return;
   const key=event.key.toLowerCase(),card=target.classList.contains('boss-card');
   if(key==='x'&&!card){event.preventDefault();event.stopPropagation();this.focusSelected();return;}
   if(key==='z'){event.preventDefault();event.stopPropagation();if(!event.repeat){if(target===this.picker)this.launch();else if(target instanceof HTMLButtonElement)target.click();}return;}
   // Native select up/down chooses a boss; left/right leaves the picker.
   if(target===this.picker&&!['ArrowLeft','ArrowRight'].includes(event.key))return;
   if(target!==this.picker&&!['ArrowUp','ArrowDown'].includes(event.key))return;
   const stops=[this.cards[this.selected],...this.element.querySelectorAll<HTMLButtonElement>('.deck-actions button:not(:disabled)'),...this.element.querySelectorAll<HTMLButtonElement>('.deck-controls button:not(:disabled)'),this.picker];
   const index=stops.indexOf(target as HTMLButtonElement|HTMLSelectElement);if(index<0)return;
   event.preventDefault();event.stopPropagation();stops[(index+(['ArrowUp','ArrowLeft'].includes(event.key)?-1:1)+stops.length)%stops.length]?.focus();
  });
 }
 focusSelected(){this.cards[this.selected]?.focus({preventScroll:true});}
 private move(direction:number){if(this.records.length)this.choose((this.selected+direction+this.records.length)%this.records.length);}
 update(records:EncounterRecord[],selected:number,chapter:number,completed:string[],available:(id:string)=>boolean,choose:(index:number)=>void,launch:()=>void){
  const cardHadFocus=this.cards.some(card=>card===document.activeElement);
  this.choose=choose;this.launch=launch;this.selected=selected;
  if(this.chapter!==chapter){
   this.chapter=chapter;this.records=records;this.element.replaceChildren();this.cards=[];
   const header=document.createElement('header');header.className='deck-heading';
   const label=document.createElement('span');label.textContent=`Chapter ${chapter}`;
   const title=document.createElement('h1');title.textContent=CHAPTER_NAMES[chapter];header.append(label,title);this.element.append(header);
   const stack=document.createElement('div');stack.className='deck-stack';this.element.append(stack);
   records.forEach((record,index)=>{
    const card=document.createElement('button');card.className='boss-card';card.setAttribute('aria-label',`Battle ${record.name} ${record.id}`);
    const color=record.id==='ch1-25'?'#c3a0ff':COLORS[index%COLORS.length];card.style.setProperty('--card-ink',color);
    const corner=document.createElement('span');corner.className='card-corner';corner.textContent=record.kind==='secret'?'♠':record.kind==='main'?'♜':'♦';
    const art=document.createElement('canvas');art.width=260;art.height=270;art.className='card-art';art.setAttribute('aria-hidden','true');
    const c=art.getContext('2d')!;c.imageSmoothingEnabled=false;
    c.fillStyle=color;c.globalAlpha=.08;c.beginPath();c.arc(130,130,91,0,Math.PI*2);c.fill();c.globalAlpha=.18;c.strokeStyle=color;c.lineWidth=1;
    for(let size=45;size<=100;size+=18){c.strokeRect(130-size,130-size,size*2,size*2);}c.globalAlpha=1;
    record.enemies.forEach((enemy,i)=>{const sprite=this.assets.getSprite(enemy.sprite,chapter);if(!sprite)return;
     const scale=Math.min(3.2,(record.enemies.length>1?110:195)/sprite.width,(record.enemies.length>1?125:205)/sprite.height);
     const x=record.enemies.length>1?82+(i%2)*96:130,y=record.enemies.length>1?65+Math.floor(i/2)*100:Math.max(25,130-sprite.height*scale/2);
     this.assets.draw(c,enemy.sprite,chapter,x,y,scale);
    });
    const name=document.createElement('strong');name.className='card-name';name.textContent=record.name;
    const type=document.createElement('span');type.className='card-type';type.textContent=record.setting?`${record.setting} · ${record.encounter}`:record.kind==='secret'?'Secret encounter':record.kind==='main'?'Boss encounter':`Encounter ${record.encounter}`;
    const state=document.createElement('span');state.className='card-state';
    const stamp=document.createElement('span');stamp.className='card-development-stamp';stamp.textContent='IN DEVELOPMENT';stamp.setAttribute('aria-hidden','true');stamp.hidden=true;
    const bottom=corner.cloneNode(true) as HTMLElement;bottom.classList.add('card-corner-bottom');
    card.append(corner,art,type,name,state,bottom,stamp);card.addEventListener('click',()=>{if(index===this.selected)this.launch();else this.choose(index);});stack.append(card);this.cards.push(card);
   });
   const controls=document.createElement('div');controls.className='deck-controls';
   const prev=document.createElement('button');prev.textContent='←';prev.setAttribute('aria-label','Previous encounters');prev.addEventListener('click',()=>this.move(-1));
   const next=document.createElement('button');next.textContent='→';next.setAttribute('aria-label','Next encounters');next.addEventListener('click',()=>this.move(1));
   this.caption=document.createElement('span');this.caption.setAttribute('aria-live','polite');controls.append(prev,this.caption,next);this.element.append(controls);
   const footer=document.createElement('div');footer.className='deck-footer';const labelPicker=document.createElement('label');labelPicker.textContent='Find a boss';
   this.picker=document.createElement('select');this.picker.id='boss-select';labelPicker.htmlFor=this.picker.id;
   for(const record of records){const option=document.createElement('option');option.value=record.id;option.textContent=`${record.name} · ${record.encounter}`;this.picker.append(option);}
   this.picker.addEventListener('change',()=>this.choose(records.findIndex(r=>r.id===this.picker.value)));
   const prepare=document.createElement('button');prepare.className='deck-prepare';prepare.textContent='Prepare party';prepare.addEventListener('click',()=>this.launch());
   const actions=document.createElement('div');actions.className='deck-actions';
   if(this.onLeaderboard){const scores=document.createElement('button');scores.className='deck-leaderboard';scores.textContent='Leaderboard';scores.onclick=()=>this.onLeaderboard!(this.records[this.selected]);scores.onkeydown=event=>{if(event.key.toLowerCase()==='z'){event.preventDefault();event.stopPropagation();scores.click();}};actions.append(scores);}
   actions.append(prepare);footer.append(labelPicker,this.picker);this.element.append(footer,actions);
  }
  this.picker.value=records[selected].id;this.caption.textContent=`${selected+1} / ${records.length}`;
  const scores=this.element.querySelector<HTMLButtonElement>('.deck-leaderboard');if(scores)scores.disabled=!available(records[selected].id);
  this.cards.forEach((card,index)=>{
   let offset=(index-selected+records.length)%records.length;if(offset===records.length-1)offset=-1;
   const visible=offset>=-1&&offset<=3,active=offset===0;
   card.style.transform=`translateX(${offset<0?-57:offset*54}%) translateY(${Math.abs(offset)*3}%) rotate(${offset<0?-8:offset*6}deg) scale(${active?1:.92-Math.abs(offset)*.045})`;
   card.style.opacity=visible?String(active?1:offset<0?.18:Math.max(.08,.55-offset*.14)):'0';
   card.style.zIndex=String(active?10:6-Math.abs(offset));card.style.visibility=visible?'visible':'hidden';card.tabIndex=active?0:-1;card.setAttribute('aria-current',active?'true':'false');
   const ready=available(records[index].id),state=card.querySelector('.card-state')!;
   state.textContent=completed.includes(records[index].id)?'Cleared':ready?'Ready to play':'In development';card.classList.toggle('card-ready',ready);card.classList.toggle('card-development',!ready);
   (card.querySelector('.card-development-stamp') as HTMLElement).hidden=ready;
  });
  if(cardHadFocus)this.cards[selected].focus({preventScroll:true});
 }
}
