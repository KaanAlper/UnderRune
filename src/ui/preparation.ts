import {CHARACTERS,addItem,readLoadout,writeLoadout,validateLoadout,type EquipmentCatalog,type EquipmentSource,type Gear,type Loadout} from '../game/loadout';
import type {EncounterRecord} from '../game/types';
import type {AssetStore} from '../game/assets';
import './preparation.css';
import {assetUrl} from '../game/url';
import {preparationParty} from '../game/preparation-party';

type Slot='weapon'|'armor1'|'armor2'|'items';
const node=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string,className?:string)=>{
 const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;
};
export class PreparationPanel{
 readonly dialog=node('dialog',undefined,'prep');
 private source!:EquipmentSource;private loadout!:Loadout;private record!:EncounterRecord;
 private character=1;private slot:Slot='armor1';private query='';private opener:HTMLElement|null=null;
 private members:number[]=[];private automatic:number[]=[];
 private characterList=node('section',undefined,'prep-roster');
 private list=node('div',undefined,'prep-list');private bag=node('div',undefined,'prep-bag');
 private heading=node('h1');private subtitle=node('p',undefined,'prep-eyebrow');private context=node('h2',undefined,'prep-context');
 private intro=node('p','Equip your party and pack your bag.','prep-intro');
 private search=node('input');private feedback=node('p',undefined,'prep-feedback');private counter=node('span');
 private launch=node('button','START BATTLE','prep-launch');private isLaunching=false;private launchLabel='START BATTLE';private available=true;private practiceOnly=false;
 constructor(private catalog:EquipmentCatalog,private assets:AssetStore,private storage:Pick<Storage,'getItem'|'setItem'>,private onLaunch:(record:EncounterRecord,loadout:Loadout)=>Promise<void>,private onDismiss:()=>void){
  this.dialog.setAttribute('aria-labelledby','prep-title');this.heading.id='prep-title';
  const top=node('div',undefined,'prep-top'),close=node('button','×','prep-close');close.type='button';close.setAttribute('aria-label','Close preparation');close.onclick=()=>this.close();
  close.dataset.focus='close';this.launch.dataset.focus='launch';this.search.dataset.focus='search';
  const title=node('div');title.append(this.subtitle,this.heading);top.append(title,close);
  this.characterList.setAttribute('aria-label','Party equipment');
  const label=node('label','Search','prep-label');label.htmlFor='prep-search';this.search.id='prep-search';this.search.type='search';this.search.placeholder='Search inventory…';this.search.autocomplete='off';
  this.search.oninput=()=>{this.query=this.search.value;this.renderList();};
  const searchBox=node('div',undefined,'prep-searchbox');searchBox.append(label,this.search);
  const inventory=node('section',undefined,'prep-inventory');inventory.setAttribute('aria-label','Game inventory');inventory.append(this.context,searchBox,this.list);
  const bagHeader=node('div',undefined,'prep-baghead'),bagTitle=node('h2','Bag'),add=node('button','+ Add item','prep-add');
  add.dataset.focus='add';add.onclick=()=>this.openItems();bagHeader.append(bagTitle,this.counter,add);
  const bagSection=node('section',undefined,'prep-bagsection');bagSection.setAttribute('aria-label','Battle bag');bagSection.append(bagHeader,this.bag);
  const party=node('div',undefined,'prep-party');party.append(this.characterList,bagSection);
  const body=node('div',undefined,'prep-body');body.append(this.intro,party,inventory);
  this.feedback.setAttribute('role','status');
  const foot=node('footer',undefined,'prep-footer'),reset=node('button','Clear loadout','prep-reset');reset.onclick=()=>{for(const id of this.members)this.loadout.characters[id]={weapon:0,armor:[0,0]};this.loadout.items=[];this.persist();this.render();this.feedback.textContent='Party equipment and bag cleared.';};
  reset.dataset.focus='reset';
  const keys=node('p',undefined,'prep-shortcuts');keys.innerHTML='<kbd>↑↓←→</kbd> Move <kbd>Z</kbd> Choose <kbd>X</kbd> Back';
  this.launch.onclick=()=>void this.start();foot.append(keys,this.feedback,reset,this.launch);
  this.dialog.append(top,body,foot);document.body.append(this.dialog);
  this.dialog.addEventListener('keydown',event=>this.keydown(event));
  this.dialog.addEventListener('pointerdown',()=>this.dialog.classList.remove('using-keyboard'));
  this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});
  this.dialog.addEventListener('click',event=>{if(event.target===this.dialog){const r=this.dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)this.close();}});
  this.dialog.addEventListener('close',()=>{this.onDismiss();this.opener?.focus();});
 }
 open(record:EncounterRecord,options:{available?:boolean;notice?:string;launchLabel?:string;practiceOnly?:boolean}={}){
  const source=this.catalog.chapters[record.chapter];if(!source)throw Error('No equipment catalog for this chapter.');
  const party=preparationParty(record.id);this.members=party.members.filter(id=>!party.locked.includes(id));this.automatic=party.auto;
  this.record=record;this.source=source;this.loadout=readLoadout(this.storage,record.chapter,source);this.opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  this.available=options.available??true;this.launchLabel=options.launchLabel??'START BATTLE';this.launch.textContent=this.launchLabel;this.launch.disabled=!this.available;
  this.practiceOnly=options.practiceOnly??false;
  this.intro.textContent=options.notice??'Equip your party and pack your bag.';
  this.character=this.members[0]??party.members[0];this.slot=this.members.length?'armor1':'items';this.query='';this.search.value='';this.feedback.textContent='';
  this.subtitle.textContent=`Chapter ${record.chapter}`;this.heading.textContent=record.name;
  const soul=this.assets.getSprite('spr_heart',1);if(soul)this.dialog.style.setProperty('--soul',`url("${assetUrl(soul.frames[0].url)}")`);
  this.render();this.dialog.showModal();this.focus(this.members.length?`char:${this.character}`:'add');
 }
 private close(){if(!this.isLaunching)this.dialog.close();}
 private persist(){writeLoadout(this.storage,this.record.chapter,this.loadout,this.source);}
 private focus(key:string){this.dialog.querySelector<HTMLElement>(`[data-focus="${key}"]:not(:disabled)`)?.focus();}
 private focusEntries(){(this.list.querySelector<HTMLButtonElement>('button:not(:disabled)')??this.search).focus();}
 private returnToSlot(){this.focus(this.slot==='items'?'add':`slot:${this.character}:${this.slot}`);}
 private focusFooter(){this.focus(this.launch.disabled?'reset':'launch');}
 private openItems(search=false){this.slot='items';this.query='';this.search.value='';this.render();if(search)this.search.focus();else this.focusEntries();}
 private focusCharacter(column:number,row:number){
  if(!this.members.length){this.focus('add');return;}
  this.character=this.members[column];if(row>0)this.slot=(['weapon','armor1','armor2'] as const)[row-1];else if(this.slot==='items')this.slot='armor1';
  this.query='';this.search.value='';this.render();this.focus(row===0?`char:${this.character}`:`slot:${this.character}:${this.slot}`);
 }
 private keydown(event:KeyboardEvent){
  if(event.ctrlKey||event.metaKey||event.altKey)return;this.dialog.classList.add('using-keyboard');
  const target=event.target as HTMLElement,key=event.key.toLowerCase();
  if(this.isLaunching){event.preventDefault();event.stopPropagation();return;}
  if(target instanceof HTMLInputElement){
   if(event.key==='ArrowDown'){event.preventDefault();const entry=this.list.querySelector<HTMLButtonElement>('button:not(:disabled)');if(entry)entry.focus();else this.focusFooter();}
   else if(event.key==='ArrowUp'||event.key==='Escape'){event.preventDefault();event.stopPropagation();this.returnToSlot();}return;
  }
  if(key==='z'||key==='x'){
   event.preventDefault();event.stopPropagation();if(event.repeat)return;
   if(key==='z'){if(target instanceof HTMLButtonElement&&!target.disabled)target.click();}
   else if(target.closest('.prep-inventory'))this.returnToSlot();else this.close();return;
  }
  if(!event.key.startsWith('Arrow')&&!['Home','End'].includes(event.key))return;
  event.preventDefault();event.stopPropagation();const direction=event.key;
  if(this.characterList.contains(target)){
   const columns=this.members,id=Number(target.dataset.character),row=Number(target.dataset.row),index=columns.indexOf(id);
   if(direction==='ArrowDown'&&row===3){this.focus('add');return;}
   if(direction==='ArrowUp'&&row===0){this.focus('close');return;}
   if(direction==='ArrowRight'&&index===columns.length-1){this.focusEntries();return;}
   const col=event.key==='Home'?0:event.key==='End'?columns.length-1:(index+(event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0)+columns.length)%columns.length;
   this.focusCharacter(col,Math.max(0,Math.min(3,row+(direction==='ArrowUp'?-1:direction==='ArrowDown'?1:0))));
  }else if(target.closest('.prep-bag')){
   const buttons=Array.from(this.bag.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')),index=buttons.indexOf(target as HTMLButtonElement);
   const columns=Math.max(1,getComputedStyle(this.bag).gridTemplateColumns.split(/\s+/).length);
   if(direction==='ArrowUp'&&index<columns||direction==='ArrowLeft'&&index===0){this.focus('add');return;}
   if(direction==='ArrowDown'&&index+columns>=buttons.length){this.focusFooter();return;}
   if(direction==='ArrowRight'&&index===buttons.length-1){this.openItems();return;}
   const delta=direction==='ArrowUp'||direction==='ArrowDown'?columns:1;
   const next=direction==='Home'?0:direction==='End'?buttons.length-1:index+(direction==='ArrowUp'||direction==='ArrowLeft'?-delta:delta);
   buttons[Math.max(0,Math.min(buttons.length-1,next))]?.focus();
  }else if(target.closest('.prep-list')){
   const buttons=Array.from(this.list.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')),index=buttons.indexOf(target as HTMLButtonElement);
   if(direction==='ArrowLeft'){this.returnToSlot();return;}
   if(direction==='ArrowRight'||direction==='ArrowDown'&&index===buttons.length-1){this.focusFooter();return;}
   if(direction==='ArrowUp'&&index===0){this.search.focus();return;}
   const next=direction==='Home'?0:direction==='End'?buttons.length-1:index+(direction==='ArrowUp'?-1:1);
   buttons[Math.max(0,Math.min(buttons.length-1,next))]?.focus();
  }else if(target.dataset.focus==='add'){
   if(direction==='ArrowDown'){const first=this.bag.querySelector<HTMLButtonElement>('button');if(first)first.focus();else this.focusFooter();}
   else if(direction==='ArrowRight')this.openItems(true);
   else if(direction==='End')this.focusFooter();
   else if(this.members.length)this.focusCharacter(Math.max(0,this.members.indexOf(this.character)),3);else this.focus('close');
  }else if(target.closest('.prep-footer')){
   if(direction==='ArrowUp'){const cells=this.bag.querySelectorAll<HTMLButtonElement>('button');if(cells.length)cells[cells.length-1].focus();else this.focus('add');}
   else if(direction==='ArrowDown')this.focus('close');
   else{const buttons=Array.from(this.dialog.querySelectorAll<HTMLButtonElement>('.prep-footer button:not(:disabled)')),index=buttons.indexOf(target as HTMLButtonElement);
    const next=direction==='Home'?0:direction==='End'?buttons.length-1:(index+(direction==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;buttons[next]?.focus();}
  }else if(target.dataset.focus==='close'){
   if(direction==='ArrowDown'||direction==='Home')this.focusCharacter(0,0);
   else if(direction==='ArrowRight')this.search.focus();else this.focusFooter();
  }
 }
 private render(){
  const focused=document.activeElement instanceof HTMLElement?document.activeElement.dataset.focus:undefined;
  const color=CHARACTERS.find(c=>c.id===this.character)!.color;this.dialog.style.setProperty('--hero',color);
  this.characterList.style.setProperty('--members',String(Math.max(1,this.members.length)));
  this.characterList.replaceChildren();
  for(const id of this.members){
   const char=CHARACTERS.find(c=>c.id===id)!,card=node('article',undefined,'prep-hero');card.dataset.character=String(id);card.style.setProperty('--char',char.color);
   const button=node('button',undefined,'prep-character');button.type='button';button.dataset.character=String(id);button.dataset.row='0';button.dataset.focus=`char:${id}`;button.setAttribute('aria-pressed',String(id===this.character));button.setAttribute('aria-label',char.name+' equipment');
   const sprite=this.assets.getSprite(id===3&&this.record.chapter>1?'spr_ralsei_idle':char.sprite,this.record.chapter)??this.assets.getSprite(char.sprite,this.record.chapter);
   if(sprite){const img=node('img');img.src=assetUrl(sprite.frames[0].url);img.alt='';img.width=68;img.height=88;button.append(img);}else button.append(node('span',char.name[0],'prep-initial'));
   const who=node('span',undefined,'prep-who');who.append(node('span',char.name,'prep-name'),node('span',this.automatic.includes(id)?'Attacks automatically':'You choose commands','prep-hero-note'));button.append(who);
   button.onclick=()=>{this.character=id;this.slot=this.slot==='items'?'armor1':this.slot;this.render();};card.append(button);
   const slots=node('div',undefined,'prep-slots'),equipped=this.loadout.characters[id];
   for(const [row,[slot,label]] of ([['weapon','Weapon'],['armor1','Armor 1'],['armor2','Armor 2']] as const).entries()){
    const gearId=slot==='weapon'?equipped.weapon:equipped.armor[slot==='armor1'?0:1],gear=(slot==='weapon'?this.source.weapons:this.source.armors).find(g=>g.id===gearId)!;
    const button=node('button',undefined,'prep-slot');button.type='button';button.dataset.character=String(id);button.dataset.slot=slot;button.dataset.row=String(row+1);button.dataset.focus=`slot:${id}:${slot}`;
    button.setAttribute('aria-pressed',String(this.character===id&&this.slot===slot));button.append(node('span',label),node('strong',gearId===0?(slot==='weapon'?'Game default':'Empty slot'):gear.name));button.setAttribute('aria-label',`${char.name}, ${label}: ${button.querySelector('strong')!.textContent}`);
    button.onclick=()=>{this.character=id;this.slot=slot;this.query='';this.search.value='';this.render();this.focusEntries();};slots.append(button);
   }
   const gears=[this.source.weapons.find(g=>g.id===equipped.weapon)!,...equipped.armor.map(armor=>this.source.armors.find(g=>g.id===armor)!)];
   const summary=node('p',`AT ${gears.reduce((v,g)=>v+g.attack,0)}  DF ${gears.reduce((v,g)=>v+g.defense,0)}  MAG ${gears.reduce((v,g)=>v+g.magic,0)}`,'prep-summary');
   summary.setAttribute('aria-label','Equipment bonuses: '+summary.textContent);card.append(slots,summary);this.characterList.append(card);
  }
  if(!this.members.length)this.characterList.append(node('p','Equipment is fixed for this encounter.','prep-empty'));
  this.counter.textContent=`${this.loadout.items.length} / ${this.source.bagCapacity}`;
  this.bag.replaceChildren();
  for(let i=0;i<this.source.bagCapacity;i++){
   const item=this.source.items.find(item=>item.id===this.loadout.items[i]);
   const button=node('button',undefined,'prep-bagitem');button.type='button';button.dataset.focus=`bag:${i}`;if(!item)button.classList.add('is-empty');button.append(node('strong',item?.name??'—'));
   button.setAttribute('aria-label',item?`Slot ${i+1}: ${item.name}, remove from bag`:`Slot ${i+1} is empty, choose an item`);
   if(item){button.title=item.description;button.append(node('span','×','prep-remove'));button.onclick=()=>{this.loadout.items.splice(i,1);this.persist();this.render();this.feedback.textContent=item.name+' removed from the bag.';};}
   else button.onclick=()=>{this.slot='items';this.render();this.focusEntries();};this.bag.append(button);
  }
  this.context.textContent=this.slot==='items'?'Items for the bag':`${this.slot==='weapon'?'Weapon':this.slot==='armor1'?'Armor 1':'Armor 2'} for ${CHARACTERS.find(c=>c.id===this.character)!.name}`;
  this.renderList();if(focused)this.focus(focused);
 }
 /** The name that just changed glows yellow, the game's highlight colour, then settles. */
 private flash(target:HTMLElement|null){if(!target)return;target.classList.remove('is-new');void target.offsetWidth;target.classList.add('is-new');setTimeout(()=>target.classList.remove('is-new'),500);}
 private stats(gear:Gear){return `AT ${gear.attack>=0?'+':''}${gear.attack}   DF ${gear.defense>=0?'+':''}${gear.defense}   MAG ${gear.magic>=0?'+':''}${gear.magic}`;}
 private renderList(){
  this.list.replaceChildren();const query=this.query.trim().toLocaleLowerCase();
  const entries=(this.slot==='items'?this.source.items:this.slot==='weapon'?this.source.weapons:this.source.armors).filter(entry=>(entry.name+' '+entry.description).toLocaleLowerCase().includes(query)&& (entry.id!==0||this.slot!=='items'));
  const label=node('p',`${entries.length} ${this.slot==='items'?'items':this.slot==='weapon'?'weapons':'armors'} in Chapter ${this.record.chapter}`,'prep-listlabel');this.list.append(label);
  if(!entries.length)this.list.append(node('p','Nothing matches this search.','prep-empty'));
  for(const entry of entries){
   const item=this.slot==='items',gear=entry as Gear,allowed=item||entry.id===0||gear.allowed.includes(this.character),full=item&&this.loadout.items.length>=this.source.bagCapacity;
   const button=node('button',undefined,'prep-entry');button.type='button';button.dataset.focus=`entry:${entry.id}`;button.disabled=!allowed||full;
   const title=node('div',undefined,'prep-entrytitle');title.append(node('strong',entry.id===0?(this.slot==='weapon'?'Game default':'Empty slot'):entry.name));
   const current=this.loadout.characters[this.character],selected=!item&&(this.slot==='weapon'?current.weapon:current.armor[this.slot==='armor1'?0:1])===entry.id;
   title.append(node('span',selected?'Equipped':item?'Add':!allowed?"Can't equip":'Equip','prep-entryaction'));button.append(title);
   if(entry.description)button.append(node('p',entry.description,'prep-description'));
   button.append(node('span',item?(this.practiceOnly?'Bag preview; items are not used in practice':(entry as {usable:boolean}).usable?'Usable in battle':'Not usable in battle'):this.stats(gear),'prep-entrymeta'));
   if(!allowed)button.append(node('span',CHARACTERS.find(c=>c.id===this.character)!.name+" can't equip this.",'prep-incompatible'));
   button.setAttribute('aria-pressed',String(selected));button.onclick=()=>{
    try{if(item)this.loadout=addItem(this.loadout,entry.id,this.source);else if(this.slot==='weapon')current.weapon=entry.id;else current.armor[this.slot==='armor1'?0:1]=entry.id;
     this.persist();this.render();this.feedback.textContent=entry.id===0?'Slot emptied.':entry.name+(item?' added to the bag.':' equipped.');
     this.flash(item?this.bag.querySelector<HTMLElement>(`[data-focus="bag:${this.loadout.items.length-1}"]`):this.dialog.querySelector<HTMLElement>(`[data-focus="slot:${this.character}:${this.slot}"]`));
    }catch(error){this.feedback.textContent=error instanceof Error?error.message:String(error);}
   };this.list.append(button);
  }
 }
 private async start(){
  if(this.isLaunching||!this.available)return;this.isLaunching=true;this.launch.disabled=true;this.launch.textContent='LOADING…';
  try{validateLoadout(this.loadout,this.source);await this.onLaunch(this.record,structuredClone(this.loadout));this.dialog.close();}
  catch(error){this.feedback.textContent=error instanceof Error?error.message:String(error);}
  finally{this.isLaunching=false;this.launch.disabled=!this.available;this.launch.textContent=this.launchLabel;}
 }
}
