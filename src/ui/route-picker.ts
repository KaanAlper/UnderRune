import {CHARACTERS} from '../game/loadout';
import type {BattleRoute} from '../remake/host/routes';
import './route-picker.css';
const node=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string,className?:string)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;};

/** Route choice is a separate step before equipment. It never changes a battle's party to imitate an unported route. */
export class RoutePicker{
 readonly dialog=node('dialog',undefined,'route-picker');
 private heading=node('h1','Choose route');private boss=node('p',undefined,'route-boss');private choices=node('div',undefined,'route-choices');
 private selected:BattleRoute|null=null;private resolve?:((route:BattleRoute|null)=>void);private opener:HTMLElement|null=null;
 constructor(){
  this.heading.id='route-picker-title';this.dialog.setAttribute('aria-labelledby',this.heading.id);
  const close=node('button','×','route-close');close.type='button';close.setAttribute('aria-label','Close route selection');close.onclick=()=>this.dialog.close();
  const top=node('div',undefined,'route-top'),titles=node('div');titles.append(this.boss,this.heading);top.append(titles,close);
  this.dialog.append(top,node('p','Choose the route, then prepare its party and bag.','route-intro'),this.choices);
  this.dialog.addEventListener('close',()=>{const result=this.selected,resolve=this.resolve;this.selected=null;this.resolve=undefined;if(!result)this.opener?.focus();resolve?.(result);});
  this.dialog.addEventListener('click',event=>{if(event.target===this.dialog)this.dialog.close();});
  this.dialog.addEventListener('keydown',event=>{
   if(event.ctrlKey||event.altKey||event.metaKey)return;const key=event.key.toLowerCase();
   if(key==='x'){event.preventDefault();event.stopPropagation();this.dialog.close();return;}
   if(key==='z'&&event.target instanceof HTMLButtonElement){event.preventDefault();event.stopPropagation();event.target.click();return;}
   if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
   const buttons=Array.from(this.dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')),index=buttons.indexOf(document.activeElement as HTMLButtonElement);
   event.preventDefault();event.stopPropagation();const next=event.key==='Home'?1:event.key==='End'?0:(index+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+buttons.length)%buttons.length;buttons[next]?.focus();
  });document.body.append(this.dialog);
 }
 choose(name:string,routes:BattleRoute[]):Promise<BattleRoute|null>{
  if(this.dialog.open)return Promise.resolve(null);this.selected=null;this.opener=document.activeElement instanceof HTMLElement?document.activeElement:null;this.boss.textContent=name;this.choices.replaceChildren();
  for(const route of routes){
   const button=node('button',undefined,'route-option');button.type='button';button.disabled=!route.ready;button.setAttribute('aria-label',route.title);
   const title=node('strong',route.title),party=node('span',route.party.length===1?'Kris only':route.party.map(id=>CHARACTERS.find(c=>c.id===id)?.name??String(id)).join(' · '),'route-party');
   const state=node('span',route.ready?'Prepare party':'In development','route-state');button.append(title,party,node('span',route.description,'route-description'),state);
   button.onclick=()=>{if(!route.ready)return;this.selected=route;this.dialog.close();};this.choices.append(button);
  }
  const pending=new Promise<BattleRoute|null>(resolve=>{this.resolve=resolve;});this.dialog.showModal();this.choices.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();return pending;
 }
}
