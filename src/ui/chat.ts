import {type LeaderboardApi,type ChatRoom,type ChatMessage,type ChatSubmission} from '../game/leaderboard-api';
import {PlayerProfile,validPlayerName} from '../game/player-profile';
import './chat.css';
const node=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string,className?:string)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
type RoomState={draft:string;pending?:ChatSubmission;sending:boolean;feedback:string;failed:boolean};
const roomState=():RoomState=>({draft:'',sending:false,feedback:'',failed:false});

/** A bounded public room reader. Sending uses LeaderboardApi's existing anonymous identity. */
export class ChatPanel{
 readonly dialog=node('dialog',undefined,'general-chat');
 private room:ChatRoom='deltarune';private states:Record<ChatRoom,RoomState>={undertale:roomState(),deltarune:roomState()};
 private opener:HTMLElement|null=null;private revision=0;private abort?:AbortController;private loading=false;private timer?:ReturnType<typeof setTimeout>;
 private roomButtons=new Map<ChatRoom,HTMLButtonElement>();private heading=node('h2','General chat');
 private profileLine=node('span');private profileButton=node('button');private nameForm=node('form',undefined,'chat-name-form');private name=node('input');private nameStatus=node('p');
 private messages=node('ol',undefined,'chat-messages');private readStatus=node('p',undefined,'chat-status');private sendStatus=node('p',undefined,'chat-status');
 private composer=node('form',undefined,'chat-composer');private draft=node('textarea');private sendButton=node('button','Send');private count=node('span');
 private older=node('button','Older messages');private newer=node('button','Newer messages');private refreshButton=node('button','Refresh');
 private cursors:(number|undefined)[]=[undefined];private page=0;private rows:ChatMessage[]=[];
 constructor(private api:LeaderboardApi,private profile:PlayerProfile){
  this.dialog.setAttribute('aria-label','General chat');
  const header=node('header',undefined,'chat-header'),close=node('button','×','chat-close');close.type='button';close.setAttribute('aria-label','Close chat');close.onclick=()=>this.hide();header.append(this.heading,close);
  const rooms=node('nav',undefined,'chat-rooms');rooms.setAttribute('aria-label','Chat rooms');
  for(const room of ['undertale','deltarune'] as const){const button=node('button',room.toUpperCase());button.type='button';button.onclick=()=>this.switchRoom(room);this.roomButtons.set(room,button);rooms.append(button);}
  const profileBar=node('div',undefined,'chat-profile');this.profileButton.type='button';this.profileButton.onclick=()=>{this.nameForm.hidden=false;this.name.value=this.profile.name;this.name.focus();};profileBar.append(this.profileLine,this.profileButton);
  this.name.type='text';this.name.required=true;this.name.maxLength=48;this.name.setAttribute('autocomplete','nickname');this.name.setAttribute('aria-label','Display name');
  const label=node('label','Display name');label.append(this.name);const save=node('button','Save name');save.type='submit';const cancel=node('button','Cancel');cancel.type='button';cancel.onclick=()=>{this.nameForm.hidden=true;this.profileButton.focus();};this.nameStatus.setAttribute('role','status');this.nameForm.append(label,save,cancel,this.nameStatus);
  this.nameForm.onsubmit=event=>{event.preventDefault();if(!validPlayerName(this.name.value)){this.nameStatus.textContent='Use 1–24 characters without control characters.';return;}this.profile.setName(this.name.value);this.nameForm.hidden=true;this.nameStatus.textContent='';this.draft.focus();};
  this.readStatus.setAttribute('role','status');this.readStatus.setAttribute('aria-live','polite');this.sendStatus.setAttribute('role','status');this.sendStatus.setAttribute('aria-live','polite');this.messages.setAttribute('aria-label','Room messages');this.messages.tabIndex=0;
  const pages=node('div',undefined,'chat-pages');for(const button of [this.newer,this.older,this.refreshButton])button.type='button';
  this.older.onclick=()=>{if(this.loading||!this.rows.length)return;this.cursors[++this.page]=this.rows.at(-1)!.sequence;void this.load();};this.newer.onclick=()=>{if(this.page>0){this.page--;void this.load();}};this.refreshButton.onclick=()=>{this.page=0;this.cursors=[undefined];void this.load();};pages.append(this.newer,this.older,this.refreshButton);
  this.draft.rows=2;this.draft.maxLength=1000;this.draft.setAttribute('aria-label','Message');this.draft.placeholder='Say something…';this.draft.oninput=()=>{const state=this.states[this.room];state.draft=this.draft.value;if(state.pending&&state.pending.content!==state.draft.trim()){state.pending=undefined;state.failed=false;state.feedback='';}this.renderSend();};
  this.sendButton.type='submit';this.composer.onsubmit=event=>{event.preventDefault();void this.send();};const composerFooter=node('div',undefined,'chat-composer-footer');composerFooter.append(this.count,this.sendButton);this.composer.append(this.draft,node('p','Enter to send. Keep messages to one line.','chat-note'),composerFooter,this.sendStatus);
  this.dialog.append(header,rooms,node('p','Public rooms. Share only what you want everyone to see. Messages reset every Monday at 00:00 UTC.','chat-note'),profileBar,this.nameForm,this.readStatus,this.messages,pages,this.composer);
  this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.hide();});this.dialog.addEventListener('close',()=>{if(this.dialog.open)return;this.stopRead();if(document.activeElement===document.body||this.dialog.contains(document.activeElement))this.opener?.focus();});
  this.dialog.addEventListener('keydown',event=>this.keydown(event));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stopRead();else if(this.dialog.open)void this.load();});
  this.profile.subscribe(()=>this.renderProfile());this.renderProfile();this.renderRoom();
 }
 open(room:ChatRoom):void{
  if(!this.dialog.open)this.opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  if(!this.dialog.isConnected)document.body.append(this.dialog);this.switchRoom(room,false);if(!this.dialog.open)this.dialog.showModal();
  if(this.profile.name)this.draft.focus();else this.name.focus();void this.load();
 }
 hide():void{this.stopRead();if(this.dialog.open)this.dialog.close();}
 private stopRead(){clearTimeout(this.timer);this.timer=undefined;this.abort?.abort();this.revision++;this.loading=false;this.messages.removeAttribute('aria-busy');}
 private scheduleRefresh(){
  clearTimeout(this.timer);this.timer=undefined;if(!this.dialog.open||document.hidden||this.page!==0)return;
  this.timer=setTimeout(()=>{
   // Keep the current text in place while somebody is reading farther up the page.
   if(!this.dialog.open||document.hidden||this.page!==0)return;
   if(this.messages.scrollHeight-this.messages.scrollTop-this.messages.clientHeight>32){this.scheduleRefresh();return;}
   void this.load();
  },8000);
 }
 private switchRoom(room:ChatRoom,load=true){
  if(room!==this.room){this.stopRead();this.room=room;this.page=0;this.cursors=[undefined];this.rows=[];this.messages.replaceChildren();}
  this.renderRoom();if(load)void this.load();
 }
 private renderRoom(){for(const [room,button]of this.roomButtons)button.setAttribute('aria-pressed',String(room===this.room));this.heading.textContent=`General chat · ${this.room.toUpperCase()}`;this.draft.value=this.states[this.room].draft;this.renderSend();this.renderPages();}
 private renderProfile(){this.profileLine.textContent=this.profile.name?`Playing as ${this.profile.name}`:'Read freely. Choose a name to send.';this.profileButton.textContent=this.profile.name?'Change name':'Join chat';this.nameForm.hidden=!!this.profile.name;if(!this.profile.name)this.name.value='';this.renderSend();}
 private renderSend(){const state=this.states[this.room],length=[...this.draft.value.trim()].length;this.draft.disabled=state.sending;this.count.textContent=`${length}/500`;this.sendButton.textContent=state.sending?'Sending…':state.failed?'Retry send':'Send';this.sendButton.disabled=state.sending||!this.profile.name||length<1||length>500;this.sendStatus.textContent=state.feedback;}
 private renderPages(){this.newer.disabled=this.loading||this.page===0;this.older.disabled=this.loading||this.rows.length<50;this.refreshButton.disabled=this.loading;}
 private async load(){
  if(!this.dialog.open||document.hidden)return;clearTimeout(this.timer);this.timer=undefined;this.abort?.abort();const revision=++this.revision,room=this.room;this.abort=new AbortController();this.loading=true;this.renderPages();this.messages.setAttribute('aria-busy','true');this.readStatus.textContent='Loading messages…';
  try{
   await this.api.connect();if(revision!==this.revision||!this.dialog.open||document.hidden)return;
   if(!this.api.configured)throw Error('General chat is not connected yet.');
   const rows=await this.api.listChat(room,this.cursors[this.page],this.abort.signal);if(revision!==this.revision||!this.dialog.open||document.hidden)return;
   this.rows=rows;this.messages.replaceChildren();for(const message of [...rows].reverse()){
    const item=node('li'),line=node('div',undefined,'chat-message-header'),time=node('time');time.dateTime=message.created_at;time.textContent=new Date(message.created_at).toLocaleString();line.append(node('strong',message.player_name),time);item.append(line,node('p',message.content));this.messages.append(item);
   }
   this.readStatus.textContent=rows.length?`${room.toUpperCase()} · ${rows.length} messages · ${this.page?'Older page. Refresh for the latest.':'Latest page. Updates every 8 seconds while visible.'}`:'No messages on this page. Refresh to check the latest messages.';this.messages.scrollTop=this.messages.scrollHeight;this.scheduleRefresh();
  }catch(error){if(revision!==this.revision||!this.dialog.open||document.hidden)return;this.rows=[];this.messages.replaceChildren();this.readStatus.textContent=`Could not load messages. ${error instanceof Error?error.message:'Please retry.'} Refresh to retry.`;}
  finally{if(revision===this.revision){this.loading=false;this.messages.removeAttribute('aria-busy');this.renderPages();}}
 }
 private async send(){
  const room=this.room,state=this.states[room],content=state.draft.trim();if(state.sending||!this.profile.name||!content||[...content].length>500)return;
  if(/[\u0000-\u001f\u007f-\u009f]/.test(content)||new TextEncoder().encode(content).length>2000){state.feedback='Use 1–500 characters without line breaks or control characters.';this.renderSend();return;}
  const payload=state.pending??{id:crypto.randomUUID(),room,player_name:this.profile.name,content};state.pending=payload;state.sending=true;state.failed=false;state.feedback='Sending message…';this.renderSend();
  try{
   await this.api.connect();await this.api.sendChat(payload);state.feedback='Message sent.';state.failed=false;state.pending=undefined;state.draft='';
   if(this.room===room){this.draft.value='';this.page=0;this.cursors=[undefined];if(this.dialog.open&&!document.hidden)void this.load();}
  }catch(error){state.failed=true;state.feedback=`Send failed. ${error instanceof Error?error.message:'Please retry.'} Your draft is saved; retry uses the same message ID.`;}
  finally{state.sending=false;if(this.room===room)this.renderSend();}
 }
 private keydown(event:KeyboardEvent){
  const target=event.target;if(!(target instanceof HTMLElement)||event.ctrlKey||event.altKey||event.metaKey)return;
  // Preserve every editing key, including Z/X/arrows, and keep game shortcuts outside the dialog.
  if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement){if(target===this.draft&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();this.composer.requestSubmit();}event.stopPropagation();return;}
  const key=event.key.toLowerCase();if(key==='x'){event.preventDefault();event.stopPropagation();this.hide();return;}
  if(key==='z'&&target instanceof HTMLButtonElement){event.preventDefault();event.stopPropagation();if(!event.repeat)target.click();return;}
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
   if(target===this.messages)return;const controls=Array.from(this.dialog.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea')).filter(el=>!el.hidden&&el.getClientRects().length>0);const index=controls.indexOf(target);if(index<0)return;event.preventDefault();event.stopPropagation();controls[(index+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+controls.length)%controls.length]?.focus();
  }
 }
}
