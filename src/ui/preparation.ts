import {CHARACTERS,addItem,readLoadout,writeLoadout,validateLoadout,type EquipmentCatalog,type EquipmentSource,type Gear,type Loadout} from '../game/loadout';
import type {EncounterRecord} from '../game/types';
import type {AssetStore} from '../game/assets';
import './preparation.css';
import {assetUrl} from '../game/url';

type Slot='weapon'|'armor1'|'armor2'|'items';
const node=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string,className?:string)=>{
 const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;
};
export class PreparationPanel{
 readonly dialog=node('dialog',undefined,'prep');
 private source!:EquipmentSource;private loadout!:Loadout;private record!:EncounterRecord;
 private character=1;private slot:Slot='armor1';private query='';private opener:HTMLElement|null=null;
 private characterList=node('div',undefined,'prep-characters');private slots=node('div',undefined,'prep-slots');
 private list=node('div',undefined,'prep-list');private bag=node('div',undefined,'prep-bag');
 private heading=node('h1');private subtitle=node('p',undefined,'prep-eyebrow');private summary=node('p',undefined,'prep-summary');
 private intro=node('p','Equip your party and pack your bag.','prep-intro');
 private search=node('input');private feedback=node('p',undefined,'prep-feedback');private counter=node('span');
 private launch=node('button','START BATTLE','prep-launch');private isLaunching=false;private launchLabel='START BATTLE';private available=true;private practiceOnly=false;
 constructor(private catalog:EquipmentCatalog,private assets:AssetStore,private storage:Pick<Storage,'getItem'|'setItem'>,private onLaunch:(record:EncounterRecord,loadout:Loadout)=>Promise<void>,private onDismiss:()=>void){
  this.dialog.setAttribute('aria-labelledby','prep-title');this.heading.id='prep-title';
  const top=node('div',undefined,'prep-top'),close=node('button','×','prep-close');close.type='button';close.setAttribute('aria-label','Close preparation');close.onclick=()=>this.close();
  const title=node('div');title.append(this.subtitle,this.heading);top.append(title,close);
  this.characterList.setAttribute('role','tablist');this.characterList.setAttribute('aria-label','Character to equip');
  this.characterList.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
   const chars=CHARACTERS.filter(c=>c.id!==4||this.record.chapter>1),index=chars.findIndex(c=>c.id===this.character);
   this.character=chars[event.key==='Home'?0:event.key==='End'?chars.length-1:(index+(event.key==='ArrowLeft'?-1:1)+chars.length)%chars.length].id;
   this.slot=this.slot==='items'?'armor1':this.slot;this.render();this.characterList.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
  });
  const label=node('label','INVENTORY','prep-label');label.htmlFor='prep-search';this.search.id='prep-search';this.search.type='search';this.search.placeholder='Search names or descriptions…';this.search.autocomplete='off';
  this.search.oninput=()=>{this.query=this.search.value;this.renderList();};
  const searchBox=node('div',undefined,'prep-searchbox');searchBox.append(label,this.search);
  const inventory=node('section',undefined,'prep-inventory');inventory.setAttribute('aria-label','Game inventory');inventory.append(searchBox,this.list);
  const bagHeader=node('div',undefined,'prep-baghead'),bagTitle=node('h2','BAG'),add=node('button','+ Add item','prep-add');
  add.onclick=()=>{this.slot='items';this.query='';this.search.value='';this.render();this.search.focus();};bagHeader.append(bagTitle,this.counter,add);
  const bagSection=node('section',undefined,'prep-bagsection');bagSection.setAttribute('aria-label','Battle bag');bagSection.append(bagHeader,this.bag);
  const body=node('div',undefined,'prep-body');body.append(this.intro,this.characterList,this.slots,this.summary,inventory,bagSection);
  this.feedback.setAttribute('role','status');
  const foot=node('footer',undefined,'prep-footer'),reset=node('button','Clear','prep-reset');reset.onclick=()=>{this.loadout={...this.loadout,characters:Object.fromEntries(CHARACTERS.map(c=>[c.id,{weapon:0,armor:[0,0]}])),items:[]};this.persist();this.render();this.feedback.textContent='Equipment and bag cleared.';};
  this.launch.onclick=()=>void this.start();foot.append(this.feedback,reset,this.launch);
  this.dialog.append(top,body,foot);document.body.append(this.dialog);
  this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});
  this.dialog.addEventListener('click',event=>{if(event.target===this.dialog){const r=this.dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)this.close();}});
  this.dialog.addEventListener('close',()=>{this.onDismiss();this.opener?.focus();});
 }
 open(record:EncounterRecord,options:{available?:boolean;notice?:string;launchLabel?:string;practiceOnly?:boolean}={}){
  const source=this.catalog.chapters[record.chapter];if(!source)throw Error('No equipment catalog for this chapter.');
  this.record=record;this.source=source;this.loadout=readLoadout(this.storage,record.chapter,source);this.opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  this.available=options.available??true;this.launchLabel=options.launchLabel??'START BATTLE';this.launch.textContent=this.launchLabel;this.launch.disabled=!this.available;
  this.practiceOnly=options.practiceOnly??false;
  this.intro.textContent=options.notice??'Equip your party and pack your bag.';
  this.character=1;this.slot='armor1';this.query='';this.search.value='';this.feedback.textContent=options.notice??'Your choices for this chapter are saved on this device.';
  this.subtitle.textContent=`CHAPTER ${record.chapter} / BATTLE PREP`;this.heading.textContent=record.name;
  this.render();this.dialog.showModal();this.characterList.querySelector<HTMLButtonElement>('button')?.focus();
 }
 private close(){if(!this.isLaunching)this.dialog.close();}
 private persist(){writeLoadout(this.storage,this.record.chapter,this.loadout,this.source);}
 private render(){
  const color=CHARACTERS.find(c=>c.id===this.character)!.color;this.dialog.style.setProperty('--hero',color);
  this.characterList.replaceChildren();
  for(const char of CHARACTERS.filter(c=>c.id!==4||this.record.chapter>1)){
   const button=node('button',undefined,'prep-character');button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-selected',String(char.id===this.character));button.tabIndex=char.id===this.character?0:-1;button.style.setProperty('--char',char.color);
   const sprite=this.assets.getSprite(char.sprite,this.record.chapter);if(sprite){const img=node('img');img.src=assetUrl(sprite.frames[0].url);img.alt='';img.width=34;img.height=44;button.append(img);}else button.append(node('span',char.name[0],'prep-initial'));
   button.append(node('span',char.name));button.onclick=()=>{this.character=char.id;this.slot=this.slot==='items'?'armor1':this.slot;this.render();};this.characterList.append(button);
  }
  this.slots.replaceChildren();
  for(const [slot,label] of [['weapon','WEAPON'],['armor1','ARMOR 1'],['armor2','ARMOR 2']] as const){
   const id=slot==='weapon'?this.loadout.characters[this.character].weapon:this.loadout.characters[this.character].armor[slot==='armor1'?0:1];
   const gear=(slot==='weapon'?this.source.weapons:this.source.armors).find(g=>g.id===id)!;
   const button=node('button',undefined,'prep-slot');button.setAttribute('aria-pressed',String(this.slot===slot));button.append(node('span',label),node('strong',id===0?(slot==='weapon'?'Game default':'Empty slot'):gear.name));button.onclick=()=>{this.slot=slot;this.render();};this.slots.append(button);
  }
  const selected=this.loadout.characters[this.character],gears=[this.source.weapons.find(g=>g.id===selected.weapon)!,...selected.armor.map(id=>this.source.armors.find(g=>g.id===id)!)];
  this.summary.textContent=`EQUIPMENT TOTAL   AT ${gears.reduce((v,g)=>v+g.attack,0)}   DF ${gears.reduce((v,g)=>v+g.defense,0)}   MAGIC ${gears.reduce((v,g)=>v+g.magic,0)}`;
  this.counter.textContent=`${this.loadout.items.length} / ${this.source.bagCapacity}`;
  this.bag.replaceChildren();
  for(let i=0;i<this.source.bagCapacity;i++){
   const item=this.source.items.find(item=>item.id===this.loadout.items[i]);
   const button=node('button',undefined,'prep-bagitem');button.type='button';button.append(node('span',String(i+1).padStart(2,'0')),node('strong',item?.name??'—'));
   button.setAttribute('aria-label',item?`Slot ${i+1}: ${item.name}, remove from bag`:`Slot ${i+1} is empty, choose an item`);
   if(item){button.title=item.description;button.append(node('span','×','prep-remove'));button.onclick=()=>{this.loadout.items.splice(i,1);this.persist();this.render();this.feedback.textContent=item.name+' removed from the bag.';};}
   else button.onclick=()=>{this.slot='items';this.render();this.search.focus();};this.bag.append(button);
  }
  this.renderList();
 }
 private stats(gear:Gear){return `AT ${gear.attack>=0?'+':''}${gear.attack}   DF ${gear.defense>=0?'+':''}${gear.defense}   MAG ${gear.magic>=0?'+':''}${gear.magic}`;}
 private renderList(){
  this.list.replaceChildren();const query=this.query.trim().toLocaleLowerCase();
  const entries=(this.slot==='items'?this.source.items:this.slot==='weapon'?this.source.weapons:this.source.armors).filter(entry=>(entry.name+' '+entry.description).toLocaleLowerCase().includes(query)&& (entry.id!==0||this.slot!=='items'));
  const label=node('p',`${this.slot==='items'?'ITEMS':this.slot==='weapon'?'WEAPONS':'ARMOR'} · ${entries.length} IN THE GAME`,'prep-listlabel');this.list.append(label);
  if(!entries.length)this.list.append(node('p','Nothing matches this search.','prep-empty'));
  for(const entry of entries){
   const item=this.slot==='items',gear=entry as Gear,allowed=item||entry.id===0||gear.allowed.includes(this.character),full=item&&this.loadout.items.length>=this.source.bagCapacity;
   const button=node('button',undefined,'prep-entry');button.type='button';button.disabled=!allowed||full;
   const title=node('div',undefined,'prep-entrytitle');title.append(node('strong',entry.id===0?(this.slot==='weapon'?'Game default':'Empty slot'):entry.name));
   const current=this.loadout.characters[this.character],selected=!item&&(this.slot==='weapon'?current.weapon:current.armor[this.slot==='armor1'?0:1])===entry.id;
   title.append(node('span',selected?'EQUIPPED':item?'+ ADD':!allowed?"CAN'T EQUIP":'EQUIP','prep-entryaction'));button.append(title);
   if(entry.description)button.append(node('p',entry.description,'prep-description'));
   button.append(node('span',item?(this.practiceOnly?'Bag preview · item use in development':(entry as {usable:boolean}).usable?'Usable in battle':'Not usable in battle'):this.stats(gear),'prep-entrymeta'));
   if(!allowed)button.append(node('span',CHARACTERS.find(c=>c.id===this.character)!.name+" can't equip this.",'prep-incompatible'));
   button.setAttribute('aria-pressed',String(selected));button.onclick=()=>{
    try{if(item)this.loadout=addItem(this.loadout,entry.id,this.source);else if(this.slot==='weapon')current.weapon=entry.id;else current.armor[this.slot==='armor1'?0:1]=entry.id;
     this.persist();this.render();this.feedback.textContent=entry.id===0?'Slot emptied.':entry.name+(item?' added to the bag.':' equipped.');
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
