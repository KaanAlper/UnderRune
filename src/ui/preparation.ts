import {CHARACTERS,addItem,readLoadout,writeLoadout,validateLoadout,type EquipmentCatalog,type EquipmentSource,type Gear,type Loadout} from '../game/loadout';
import type {EncounterRecord} from '../game/types';
import type {AssetStore} from '../game/assets';
import './preparation.css';

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
 private search=node('input');private feedback=node('p',undefined,'prep-feedback');private counter=node('span');
 private launch=node('button','SAVAŞA GİR →','prep-launch');private isLaunching=false;
 constructor(private catalog:EquipmentCatalog,private assets:AssetStore,private storage:Pick<Storage,'getItem'|'setItem'>,private onLaunch:(record:EncounterRecord,loadout:Loadout)=>Promise<void>,private onDismiss:()=>void){
  this.dialog.setAttribute('aria-labelledby','prep-title');this.heading.id='prep-title';
  const top=node('div',undefined,'prep-top'),close=node('button','×','prep-close');close.type='button';close.setAttribute('aria-label','Hazırlığı kapat');close.onclick=()=>this.close();
  const title=node('div');title.append(this.subtitle,this.heading);top.append(title,close);
  const intro=node('p','Karakterini hazırla. Çantanı doldur.','prep-intro');
  this.characterList.setAttribute('role','tablist');this.characterList.setAttribute('aria-label','Ekipman karakteri');
  this.characterList.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
   const chars=CHARACTERS.filter(c=>c.id!==4||this.record.chapter>1),index=chars.findIndex(c=>c.id===this.character);
   this.character=chars[event.key==='Home'?0:event.key==='End'?chars.length-1:(index+(event.key==='ArrowLeft'?-1:1)+chars.length)%chars.length].id;
   this.slot=this.slot==='items'?'armor1':this.slot;this.render();this.characterList.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
  });
  const label=node('label','ENVANTER','prep-label');label.htmlFor='prep-search';this.search.id='prep-search';this.search.type='search';this.search.placeholder='İsim veya açıklama ara…';this.search.autocomplete='off';
  this.search.oninput=()=>{this.query=this.search.value;this.renderList();};
  const searchBox=node('div',undefined,'prep-searchbox');searchBox.append(label,this.search);
  const inventory=node('section',undefined,'prep-inventory');inventory.setAttribute('aria-label','Kaynak oyun envanteri');inventory.append(searchBox,this.list);
  const bagHeader=node('div',undefined,'prep-baghead'),bagTitle=node('h2','ÇANTA'),add=node('button','+ Eşya ekle','prep-add');
  add.onclick=()=>{this.slot='items';this.query='';this.search.value='';this.render();this.search.focus();};bagHeader.append(bagTitle,this.counter,add);
  const bagSection=node('section',undefined,'prep-bagsection');bagSection.setAttribute('aria-label','Savaş çantası');bagSection.append(bagHeader,this.bag);
  const body=node('div',undefined,'prep-body');body.append(intro,this.characterList,this.slots,this.summary,inventory,bagSection);
  this.feedback.setAttribute('role','status');
  const foot=node('footer',undefined,'prep-footer'),reset=node('button','Temizle','prep-reset');reset.onclick=()=>{this.loadout={...this.loadout,characters:Object.fromEntries(CHARACTERS.map(c=>[c.id,{weapon:0,armor:[0,0]}])),items:[]};this.persist();this.render();this.feedback.textContent='Ekipmanlar ve çanta temizlendi.';};
  this.launch.onclick=()=>void this.start();foot.append(this.feedback,reset,this.launch);
  this.dialog.append(top,body,foot);document.body.append(this.dialog);
  this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});
  this.dialog.addEventListener('click',event=>{if(event.target===this.dialog){const r=this.dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)this.close();}});
  this.dialog.addEventListener('close',()=>{this.onDismiss();this.opener?.focus();});
 }
 open(record:EncounterRecord){
  const source=this.catalog.chapters[record.chapter];if(!source)throw Error('Bu bölümün ekipman kataloğu bulunamadı.');
  this.record=record;this.source=source;this.loadout=readLoadout(this.storage,record.chapter,source);this.opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  this.character=1;this.slot='armor1';this.query='';this.search.value='';this.feedback.textContent='Seçimlerin bu bölüm için cihazında saklanır.';
  this.subtitle.textContent=`BÖLÜM ${record.chapter} / SAVAŞ HAZIRLIĞI`;this.heading.textContent=record.name;
  this.render();this.dialog.showModal();this.characterList.querySelector<HTMLButtonElement>('button')?.focus();
 }
 private close(){if(!this.isLaunching)this.dialog.close();}
 private persist(){writeLoadout(this.storage,this.record.chapter,this.loadout,this.source);}
 private render(){
  const color=CHARACTERS.find(c=>c.id===this.character)!.color;this.dialog.style.setProperty('--hero',color);
  this.characterList.replaceChildren();
  for(const char of CHARACTERS.filter(c=>c.id!==4||this.record.chapter>1)){
   const button=node('button',undefined,'prep-character');button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-selected',String(char.id===this.character));button.tabIndex=char.id===this.character?0:-1;button.style.setProperty('--char',char.color);
   const sprite=this.assets.getSprite(char.sprite,this.record.chapter);if(sprite){const img=node('img');img.src=sprite.frames[0].url;img.alt='';img.width=34;img.height=44;button.append(img);}else button.append(node('span',char.name[0],'prep-initial'));
   button.append(node('span',char.name));button.onclick=()=>{this.character=char.id;this.slot=this.slot==='items'?'armor1':this.slot;this.render();};this.characterList.append(button);
  }
  this.slots.replaceChildren();
  for(const [slot,label] of [['weapon','SİLAH'],['armor1','ZIRH 01'],['armor2','ZIRH 02']] as const){
   const id=slot==='weapon'?this.loadout.characters[this.character].weapon:this.loadout.characters[this.character].armor[slot==='armor1'?0:1];
   const gear=(slot==='weapon'?this.source.weapons:this.source.armors).find(g=>g.id===id)!;
   const button=node('button',undefined,'prep-slot');button.setAttribute('aria-pressed',String(this.slot===slot));button.append(node('span',label),node('strong',id===0?(slot==='weapon'?'Oyunun varsayılanı':'Boş yuva'):gear.name));button.onclick=()=>{this.slot=slot;this.render();};this.slots.append(button);
  }
  const selected=this.loadout.characters[this.character],gears=[this.source.weapons.find(g=>g.id===selected.weapon)!,...selected.armor.map(id=>this.source.armors.find(g=>g.id===id)!)];
  this.summary.textContent=`EKİPMAN TOPLAMI   AT ${gears.reduce((v,g)=>v+g.attack,0)}   DF ${gears.reduce((v,g)=>v+g.defense,0)}   MAGIC ${gears.reduce((v,g)=>v+g.magic,0)}`;
  this.counter.textContent=`${this.loadout.items.length} / ${this.source.bagCapacity}`;
  this.bag.replaceChildren();
  for(let i=0;i<this.source.bagCapacity;i++){
   const item=this.source.items.find(item=>item.id===this.loadout.items[i]);
   const button=node('button',undefined,'prep-bagitem');button.type='button';button.append(node('span',String(i+1).padStart(2,'0')),node('strong',item?.name??'—'));
   button.setAttribute('aria-label',item?`${i+1}. yuva: ${item.name}, çantadan çıkar`:`${i+1}. boş yuva, eşya seç`);
   if(item){button.title=item.description;button.append(node('span','×','prep-remove'));button.onclick=()=>{this.loadout.items.splice(i,1);this.persist();this.render();this.feedback.textContent=item.name+' çantadan çıkarıldı.';};}
   else button.onclick=()=>{this.slot='items';this.render();this.search.focus();};this.bag.append(button);
  }
  this.renderList();
 }
 private stats(gear:Gear){return `AT ${gear.attack>=0?'+':''}${gear.attack}   DF ${gear.defense>=0?'+':''}${gear.defense}   MAG ${gear.magic>=0?'+':''}${gear.magic}`;}
 private renderList(){
  this.list.replaceChildren();const query=this.query.trim().toLocaleLowerCase();
  const entries=(this.slot==='items'?this.source.items:this.slot==='weapon'?this.source.weapons:this.source.armors).filter(entry=>(entry.name+' '+entry.description).toLocaleLowerCase().includes(query)&& (entry.id!==0||this.slot!=='items'));
  const label=node('p',`${this.slot==='items'?'EŞYALAR':this.slot==='weapon'?'SİLAHLAR':'ZIRHLAR'} · ${entries.length} KAYNAK KAYDI`,'prep-listlabel');this.list.append(label);
  if(!entries.length)this.list.append(node('p','Bu aramayla eşleşen eşya yok.','prep-empty'));
  for(const entry of entries){
   const item=this.slot==='items',gear=entry as Gear,allowed=item||entry.id===0||gear.allowed.includes(this.character),full=item&&this.loadout.items.length>=this.source.bagCapacity;
   const button=node('button',undefined,'prep-entry');button.type='button';button.disabled=!allowed||full;
   const title=node('div',undefined,'prep-entrytitle');title.append(node('strong',entry.id===0?(this.slot==='weapon'?'Oyunun varsayılanı':'Boş yuva'):entry.name));
   const current=this.loadout.characters[this.character],selected=!item&&(this.slot==='weapon'?current.weapon:current.armor[this.slot==='armor1'?0:1])===entry.id;
   title.append(node('span',selected?'GİYİLİ':item?'+ EKLE':!allowed?'UYUMSUZ':'KUŞAN','prep-entryaction'));button.append(title);
   if(entry.description)button.append(node('p',entry.description,'prep-description'));
   button.append(node('span',item?((entry as {usable:boolean}).usable?'Savaşta kullanılabilir':'Savaşta kullanılamaz'):this.stats(gear),'prep-entrymeta'));
   if(!allowed)button.append(node('span',CHARACTERS.find(c=>c.id===this.character)!.name+' bu ekipmanı kullanamaz.','prep-incompatible'));
   button.setAttribute('aria-pressed',String(selected));button.onclick=()=>{
    try{if(item)this.loadout=addItem(this.loadout,entry.id,this.source);else if(this.slot==='weapon')current.weapon=entry.id;else current.armor[this.slot==='armor1'?0:1]=entry.id;
     this.persist();this.render();this.feedback.textContent=entry.id===0?'Yuva boşaltıldı.':entry.name+(item?' çantaya eklendi.':' kuşanıldı.');
    }catch(error){this.feedback.textContent=error instanceof Error?error.message:String(error);}
   };this.list.append(button);
  }
 }
 private async start(){
  if(this.isLaunching)return;this.isLaunching=true;this.launch.disabled=true;this.launch.textContent='YÜKLENİYOR…';
  try{validateLoadout(this.loadout,this.source);await this.onLaunch(this.record,structuredClone(this.loadout));this.dialog.close();}
  catch(error){this.feedback.textContent=error instanceof Error?error.message:String(error);}
  finally{this.isLaunching=false;this.launch.disabled=false;this.launch.textContent='SAVAŞA GİR →';}
 }
}
