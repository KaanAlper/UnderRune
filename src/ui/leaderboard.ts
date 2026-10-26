import type {EncounterRecord} from '../game/types';
import {CHARACTERS,type EquipmentCatalog} from '../game/loadout';
import {sourceEncounter} from '../remake/host/encounters';
import type {LeaderboardApi,LeaderboardFilters,LeaderboardRow} from '../game/leaderboard-api';
import {scoreBoss,type RunRecord} from '../game/battle-run';
import './leaderboard.css';
import {PlayerProfile,validPlayerName} from '../game/player-profile';

const node=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string,className?:string)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
const option=(value:string,text:string)=>{const el=node('option',text);el.value=value;return el;};
const seconds=(ms:number)=>{const centiseconds=Math.floor(ms/10);return `${Math.floor(centiseconds/6000)}:${(centiseconds%6000/100).toFixed(2).padStart(5,'0')}`;};
const PAGE_SIZE=25;

/** A public score sheet. Controls remain stable while only the results refresh. */
export class LeaderboardPanel{
 readonly element=node('section',undefined,'leaderboard');
 readonly dialog=node('dialog',undefined,'leaderboard-publish');
 readonly browser=node('dialog',undefined,'leaderboard-browser');
 private browserOpener:HTMLElement|null=null;
 private boss=node('select');private order=node('select');private form=node('form',undefined,'lb-filters');
 private mode=node('select');private modeField!:HTMLElement;
 private status=node('p',undefined,'lb-status');private results=node('div',undefined,'lb-results');
 private previous=node('button','Previous page');private next=node('button','Next page');private position=node('span');
 private controls=new Map<string,HTMLInputElement|HTMLSelectElement>();
 private abort?:AbortController;private revision=0;private offset=0;private active=false;private opener:HTMLElement|null=null;
 private get playerName(){return this.playerProfile.name;}private playerProfile:PlayerProfile;private profile=node('div',undefined,'lb-profile');private profileDialog=node('dialog',undefined,'leaderboard-publish');
 private pending?:RunRecord;private publishing=false;private publishRevision=0;
 private name=node('input');private publish=node('button','Publish score');private publishStatus=node('p');private summary=node('div',undefined,'lb-run-summary');
 private readonly encounters:EncounterRecord[];
 /** The battle's name when the board was opened for one battle (its card's button), in place of the Boss choice. */
 private bossTitle=node('p',undefined,'lb-boss');
 private gameTitle=node('p','DELTARUNE','lb-game');
 private game:'deltarune'|'undertale'='deltarune';
 constructor(private api:LeaderboardApi,catalog:EncounterRecord[],private equipment:EquipmentCatalog,_onChapter:(n:number)=>void,storage?:Pick<Storage,'getItem'|'setItem'>,profile?:PlayerProfile){
  this.playerProfile=profile??new PlayerProfile(storage);this.playerProfile.subscribe(()=>this.renderProfile());
  this.encounters=catalog.filter(record=>!!sourceEncounter(record.id));
  this.element.hidden=true;this.element.setAttribute('aria-label','Battle leaderboard');
  const header=node('header',undefined,'lb-header'),title=node('div');title.append(node('h1','Leaderboard'),this.bossTitle,node('p','Finish a battle. Leave your mark.'));this.bossTitle.hidden=true;
  title.prepend(this.gameTitle);header.append(title,this.profile);this.element.append(header);this.setupProfile();
  for(const record of this.encounters)this.boss.append(option(record.id,`${record.name} · Chapter ${record.chapter} · ${record.encounter}`));
  this.order.append(option('damage','Least damage, then fastest'),option('time','Fastest, then least damage'));
  this.field('Boss',this.boss);this.field('Order',this.order);
  this.mode.append(option('normal','Normal · team'),option('weird','Weird · Kris only'),option('enraged','Weird · Enraged'));this.field('NEO route',this.mode);this.modeField=this.mode.parentElement!;
  this.mode.onchange=()=>{this.offset=0;void this.refresh();};
  this.boss.onchange=()=>{this.offset=0;this.mode.value='normal';this.gearOptions();void this.refresh();};
  const details=node('details',undefined,'lb-advanced');details.append(node('summary','Filters: damage, time and equipment'));
  const filters=node('div',undefined,'lb-filter-grid');details.append(filters);
  for(const [key,label]of [['minDamage','Minimum damage'],['maxDamage','Maximum damage'],['minSeconds','Minimum seconds'],['maxSeconds','Maximum seconds']]){
   const input=node('input');input.type='number';input.min='0';input.step=key.includes('Seconds')?'0.01':'1';this.controls.set(key,input);this.field(label,input,filters);
  }
  for(const [key,label]of [['weapon','Weapon'],['armor','Armor'],['bagItem','Starting bag item'],['usedItem','Used item']]){const select=node('select');this.controls.set(key,select);this.field(label,select,filters);}
  for(const [key,label]of [['noItem','No item'],['noArmor','No armor']]){const input=node('input');input.type='checkbox';this.controls.set(key,input);this.field(label,input,filters);}
  this.form.append(details);const actions=node('div',undefined,'lb-filter-actions'),apply=node('button','Apply filters'),reset=node('button','Reset filters');apply.type='submit';reset.type='button';
  reset.onclick=()=>{for(const control of this.controls.values()){if(control instanceof HTMLInputElement&&control.type==='checkbox')control.checked=false;else control.value='';}this.order.value='damage';this.offset=0;void this.refresh();};
  actions.append(apply,reset);this.form.append(actions);this.form.onsubmit=event=>{event.preventDefault();this.offset=0;void this.refresh();};
  this.status.setAttribute('role','status');this.status.setAttribute('aria-live','polite');this.results.setAttribute('aria-label','Scores');
  const pages=node('div',undefined,'lb-pages');this.previous.type=this.next.type='button';this.previous.disabled=this.next.disabled=true;
  this.previous.onclick=()=>{this.offset=Math.max(0,this.offset-PAGE_SIZE);void this.refresh();};this.next.onclick=()=>{this.offset+=PAGE_SIZE;void this.refresh();};pages.append(this.previous,this.position,this.next);
  const note=node('p','Player-submitted runs. Gameplay is not verified by a server. Time excludes pauses. No item means no items used; an unused packed bag is allowed.','lb-note');
  this.element.append(this.form,this.status,this.results,pages,note);this.gearOptions();this.setupPublish();
  const close=node('button','×','lb-browser-close');close.type='button';close.setAttribute('aria-label','Close leaderboard');close.onclick=()=>this.browser.close();
  this.browser.setAttribute('aria-label','Battle leaderboard');this.browser.append(close);
  this.browser.addEventListener('close',()=>{this.hide();if(document.activeElement===document.body||this.browser.contains(document.activeElement))this.browserOpener?.focus();});
  this.browser.addEventListener('keydown',event=>{if(event.key.toLowerCase()==='x'&&!(event.target instanceof HTMLInputElement)){event.preventDefault();event.stopPropagation();this.browser.close();}else if(event.key.toLowerCase()==='z'&&event.target===close){event.preventDefault();event.stopPropagation();close.click();}});
  for(const root of [this.element,this.dialog,this.profileDialog])root.addEventListener('keydown',event=>{
   const target=event.target;if(!(target instanceof HTMLElement)||event.altKey||event.ctrlKey||event.metaKey)return;
   const text=target instanceof HTMLInputElement&&target.type!=='checkbox';
   if(event.key.toLowerCase()==='x'&&!text&&root instanceof HTMLDialogElement){event.preventDefault();event.stopPropagation();root.close();return;}
   if(event.key.toLowerCase()==='z'&&(target instanceof HTMLButtonElement||target.tagName==='SUMMARY'||target instanceof HTMLInputElement&&target.type==='checkbox')){event.preventDefault();event.stopPropagation();if(!event.repeat)target.click();return;}
   if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
   // Select up/down remains native; left/right moves to another field. Text fields keep cursor movement.
   if(target instanceof HTMLSelectElement&&['ArrowUp','ArrowDown'].includes(event.key)||text&&['ArrowLeft','ArrowRight'].includes(event.key))return;
   const controls=Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled),select,input,summary')).filter(el=>el.getClientRects().length>0);
   const index=controls.indexOf(target);if(index<0)return;event.preventDefault();event.stopPropagation();controls[(index+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+controls.length)%controls.length]?.focus();
  });
 }
 private field(label:string,control:HTMLElement,parent:HTMLElement=this.form){control.setAttribute('aria-label',label);const wrapper=node('label',undefined,'lb-field');wrapper.append(node('span',label),control);parent.append(wrapper);}
 private gearOptions(){
  const berdly=this.boss.value==='ch2-82',previous=this.mode.value;
  this.mode.replaceChildren(option('normal',berdly?'Normal · Kris and Noelle':'Normal · team'),option('weird',berdly?'Weird · Snowgrave':'Weird · Kris only'));
  if(!berdly)this.mode.append(option('enraged','Weird · Enraged'));
  this.mode.value=previous==='enraged'&&berdly?'normal':previous||'normal';
  const routeLabel=berdly?'Berdly route':'NEO route';this.mode.setAttribute('aria-label',routeLabel);this.modeField.querySelector('span')!.textContent=routeLabel;
  this.modeField.hidden=!['ch2-61','ch2-82'].includes(this.boss.value);
  const chapter=this.encounters.find(record=>record.id===this.boss.value)?.chapter??1,source=this.equipment.chapters[chapter];
  for(const [key,entries]of [['weapon',source?.weapons],['armor',source?.armors],['bagItem',source?.items],['usedItem',source?.items]] as const){
   const select=this.controls.get(key) as HTMLSelectElement;select.replaceChildren(option('','Any'));for(const entry of entries??[])if(entry.id!==0)select.append(option(String(entry.id),entry.name));
  }
 }
 show(encounterId?:string,game:'deltarune'|'undertale'='deltarune'){
  this.game=game;this.gameTitle.textContent=game.toUpperCase();this.form.hidden=game==='undertale';
  const base=encounterId?scoreBoss(encounterId).replace(/-weird$/,''):undefined;
  if(base&&this.encounters.some(record=>record.id===base)){this.boss.value=base;this.mode.value=encounterId!.endsWith('-enraged')?'enraged':encounterId!.includes('-weird')?'weird':'normal';this.gearOptions();this.offset=0;}
  this.boss.parentElement!.hidden=false;this.bossTitle.hidden=true;
  this.active=true;this.element.hidden=false;
  void this.refresh();
 }
 /** Opened for one battle (a boss card's button), the board shows only that battle: the Boss choice is hidden and the
  * battle's name heads the board. Opened without one, the Boss choice picks the battle. */
 open(encounterId?:string,game:'deltarune'|'undertale'='deltarune'){
  this.browserOpener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  if(this.element.parentElement!==this.browser)this.browser.append(this.element);if(!this.browser.isConnected)document.body.append(this.browser);
  this.show(encounterId,game);
  const record=encounterId?this.encounters.find(r=>r.id===scoreBoss(encounterId).replace(/-weird$/,'')):undefined;
  this.boss.parentElement!.hidden=!!record;this.bossTitle.hidden=!record;this.bossTitle.textContent=record?`${record.name} · Chapter ${record.chapter}`:'';
  if(!this.browser.open)this.browser.showModal();(game==='undertale'?this.browser.querySelector<HTMLElement>('.lb-browser-close'):record?this.order:this.boss)?.focus();
 }
 openGame(game:'deltarune'|'undertale'){this.open(undefined,game);}
 hide(){this.active=false;this.element.hidden=true;this.abort?.abort();this.revision++;if(this.browser.open)this.browser.close();}
 private filters():LeaderboardFilters{
  const filters:LeaderboardFilters={encounterId:this.boss.value+(['ch2-61','ch2-82'].includes(this.boss.value)&&this.mode.value!=='normal'?'-weird'+(this.mode.value==='enraged'?'-enraged':''):''),order:this.order.value as 'damage'|'time',offset:this.offset};
  for(const [key,control]of this.controls){if(control instanceof HTMLInputElement&&control.type==='checkbox'){if(control.checked)(filters as any)[key]=true;}else if(control.value!=='')(filters as any)[key]=Number(control.value);}
  for(const [min,max,label]of [['minDamage','maxDamage','Damage'],['minSeconds','maxSeconds','Time']] as const){if(filters[min]!==undefined&&filters[max]!==undefined&&filters[min]!>filters[max]!)throw Error(`${label} minimum must not exceed the maximum.`);}
  return filters;
 }
 private async refresh(){
  this.abort?.abort();const revision=++this.revision;this.abort=new AbortController();this.previous.disabled=this.next.disabled=true;
  if(this.game==='undertale'){
   this.results.replaceChildren();this.results.removeAttribute('aria-busy');this.position.textContent='';
   this.status.textContent='UNDERTALE battles are not available yet. Their leaderboards will appear here.';return;
  }
  let filters:LeaderboardFilters;try{filters=this.filters();}catch(error){this.status.textContent=error instanceof Error?error.message:String(error);return;}
  this.status.textContent='Loading scores…';this.results.setAttribute('aria-busy','true');
  try{
   await this.api.connect?.();if(!this.active||revision!==this.revision)return;
   if(!this.api.configured){this.status.textContent='Shared leaderboard is not connected yet. You can still play.';this.results.replaceChildren();this.position.textContent='';return;}
   const rows=await this.api.list(filters,this.abort.signal);if(!this.active||revision!==this.revision)return;
   this.renderRows(rows);this.status.textContent=rows.length?`${rows.length} scores on this page.`:(this.bossTitle.hidden?'No scores match these filters. Try another boss or widen the filters.':'No scores match these filters yet. Widen the filters, or be the first.');
   this.position.textContent=rows.length?`Filtered positions ${this.offset+1}–${this.offset+rows.length}`:'No results';this.previous.disabled=this.offset===0;this.next.disabled=rows.length===PAGE_SIZE;
  }catch(error){if(revision!==this.revision||!this.active)return;this.status.textContent=`Could not load scores. ${error instanceof Error?error.message:'Try again.'} Apply filters to retry.`;this.results.replaceChildren();this.position.textContent='';this.previous.disabled=this.offset===0;}
  finally{if(revision===this.revision)this.results.removeAttribute('aria-busy');}
 }
 private renderRows(rows:LeaderboardRow[]){
  this.results.replaceChildren();for(const [index,row]of rows.entries()){
   const card=node('article',undefined,'lb-score'),line=node('div',undefined,'lb-score-line');card.dataset.rank=String(this.offset+index+1);line.append(node('span',String(this.offset+index+1),'lb-rank'),node('strong',row.player_name),node('span',`${row.damage} damage`,'lb-metric'),node('span',seconds(row.duration_ms),'lb-metric'));
   const badges=node('div',undefined,'lb-badges');if(row.no_item)badges.append(node('span','No item'));if(row.no_armor)badges.append(node('span','No armor'));
   const detail=node('details');detail.append(node('summary','Equipment and items'),this.runDetails(row));card.append(line,badges,detail);this.results.append(card);
  }
 }
 private runDetails(run:RunRecord){
  const wrapper=node('div',undefined,'lb-equipment'),chapter=this.encounters.find(record=>record.id===scoreBoss(run.encounter_id).replace(/-weird$/,''))?.chapter??1,source=this.equipment.chapters[chapter];
  const name=(id:number,kind:'weapons'|'armors'|'items')=>id===0?'None':source?.[kind].find(entry=>entry.id===id)?.name??`${kind==='items'?'Item':'Equipment'} #${id}`;
  const party=node('div',undefined,'lb-party');for(const member of run.equipment){const character=node('div');character.append(node('strong',CHARACTERS.find(c=>c.id===member.character)?.name??`Character ${member.character}`),node('p',`Weapon: ${name(member.weapon,'weapons')}`),node('p',`Armor: ${member.armor.map(id=>name(id,'armors')).join(' / ')}`));party.append(character);}wrapper.append(party);
  for(const [heading,items]of [['Starting bag',run.bag],['Items used',run.used_items]] as const){const section=node('section');section.append(node('h3',heading));const counts=new Map<number,number>();for(const id of items)counts.set(id,(counts.get(id)??0)+1);if(!counts.size)section.append(node('p','None'));for(const [id,count]of counts)section.append(node('p',`${name(id,'items')} × ${count}`));wrapper.append(section);}
  return wrapper;
 }
 private validName(name:unknown):name is string{return validPlayerName(name);}
 private saveName(name:string){this.playerProfile.setName(name);}
 private renderProfile(){
  const button=node('button',this.playerName?'Change name':'Join leaderboard');button.type='button';button.onclick=()=>{if(!this.profileDialog.isConnected)document.body.append(this.profileDialog);const input=this.profileDialog.querySelector('input')!;input.value=this.playerName;input.setCustomValidity('');this.profileDialog.showModal();input.focus();};
  this.profile.replaceChildren();if(this.playerName)this.profile.append(node('span',`Playing as ${this.playerName}`));this.profile.append(button);
 }
 private setupProfile(){
  const heading=node('h2','Join leaderboard');heading.id='leaderboard-profile-title';this.profileDialog.setAttribute('aria-labelledby',heading.id);const form=node('form'),input=node('input'),status=node('p');input.type='text';input.required=true;input.maxLength=24;input.setAttribute('autocomplete','nickname');this.field('Display name',input,form);
  const actions=node('div',undefined,'lb-filter-actions'),cancel=node('button','Cancel'),save=node('button','Save name');cancel.type='button';cancel.onclick=()=>this.profileDialog.close();save.type='submit';actions.append(cancel,save);form.append(actions);status.setAttribute('role','status');form.onsubmit=event=>{event.preventDefault();if(!this.validName(input.value)){input.setCustomValidity('Use 1–24 characters without control characters.');input.reportValidity();return;}this.saveName(input.value);this.profileDialog.close();};input.oninput=()=>input.setCustomValidity('');this.profileDialog.append(heading,node('p','Choose your name once for all boss leaderboards on this browser. Scores are published only when you choose to share a completed run.'),form,status);this.profileDialog.addEventListener('close',()=>this.profile.querySelector('button')?.focus());this.renderProfile();
 }
 private setupPublish(){
  const heading=node('h2','Publish your score');heading.id='leaderboard-publish-title';this.dialog.setAttribute('aria-labelledby',heading.id);this.name.type='text';this.name.required=true;this.name.minLength=1;this.name.maxLength=24;this.name.setAttribute('autocomplete','nickname');
  const form=node('form');this.field('Display name',this.name,form);const actions=node('div',undefined,'lb-filter-actions'),close=node('button','Keep playing');close.type='button';close.onclick=()=>this.dialog.close();this.publish.type='submit';actions.append(close,this.publish);form.append(actions);
  this.publishStatus.setAttribute('role','status');form.onsubmit=event=>{event.preventDefault();void this.submit();};this.dialog.append(heading,this.summary,node('p','Your name, score and equipment will be public. Runs are player-submitted.'),form,this.publishStatus);
  this.dialog.addEventListener('close',()=>{this.opener?.focus();});
 }
 offer(run:RunRecord){
  this.pending=structuredClone(run);this.publishRevision++;this.publishing=false;this.opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  this.summary.replaceChildren(node('strong',(this.encounters.find(record=>record.id===scoreBoss(run.encounter_id).replace(/-weird$/,''))?.name??run.encounter_id)+(run.encounter_id.includes('-weird')?' · Weird':'' )+(run.encounter_id.endsWith('-enraged')?' · Enraged':'')),node('p',`${run.damage} damage · ${seconds(run.duration_ms)}`),this.runDetails(run));
  this.publish.disabled=!this.api.configured;this.publish.textContent='Publish score';this.name.disabled=!!this.playerName;this.name.required=!this.playerName;this.name.value=this.playerName;this.name.parentElement!.hidden=!!this.playerName;if(this.playerName)this.summary.prepend(node('p',`Playing as ${this.playerName}`));this.publishStatus.textContent=this.api.configured?'Choose a name to publish, or keep playing without publishing.':'Shared leaderboard is not connected yet. This score has not been published.';
  if(!this.dialog.isConnected)document.body.append(this.dialog);if(!this.dialog.open)this.dialog.showModal();if(this.playerName)this.publish.focus();else this.name.focus();
  if(this.api.connect){const revision=this.publishRevision;this.publish.disabled=true;this.publishStatus.textContent='Connecting to leaderboard…';
   void this.api.connect().then(()=>{if(revision!==this.publishRevision)return;this.publish.disabled=!this.api.configured;this.publishStatus.textContent=this.api.configured?'Publish this completed run or keep playing.':'Shared leaderboard is not connected yet. This score has not been published.';})
    .catch(error=>{if(revision!==this.publishRevision)return;this.publish.disabled=false;this.publishStatus.textContent=`Could not connect. ${error instanceof Error?error.message:''} Publish score to retry.`;});
  }
 }
 private async submit(){
  if(this.publishing||!this.pending)return;const name=this.playerName||this.name.value.trim();if(!this.validName(name)){this.name.setCustomValidity('Use 1–24 characters without control characters.');this.name.reportValidity();this.name.oninput=()=>this.name.setCustomValidity('');return;}
  this.saveName(name);const revision=this.publishRevision;this.publishing=true;this.publish.disabled=true;this.name.disabled=true;this.publishStatus.textContent='Publishing score…';
  try{await this.api.connect?.();await this.api.submit(this.pending,name);if(revision!==this.publishRevision)return;this.publishStatus.textContent='Score published.';this.publish.textContent='Published';this.pending=undefined;if(this.active)void this.refresh();}
  catch(error){if(revision!==this.publishRevision)return;this.publishStatus.textContent=`Score was not published. ${error instanceof Error?error.message:'Try again.'}`;this.publish.textContent='Publish score';this.publish.disabled=false;this.name.disabled=!!this.playerName;this.name.required=!this.playerName;this.name.parentElement!.hidden=!!this.playerName;}
  finally{if(revision===this.publishRevision)this.publishing=false;}
 }
}





