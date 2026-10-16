import{$ as e,A as t,At as n,B as r,Bt as i,C as a,Ct as o,D as s,Dt as c,E as l,Et as u,F as d,Ft as f,G as p,H as m,Ht as h,I as g,It as _,J as v,K as y,L as b,Lt as x,M as S,Mt as C,N as w,Nt as T,O as E,Ot as D,P as ee,Pt as O,Q as k,R as te,Rt as A,S as j,St as M,T as N,Tt as P,U as ne,Ut as F,V as I,Vt as L,W as re,Wt as ie,X as ae,Y as oe,Z as se,_ as ce,_t as R,a as le,at as ue,b as de,bt as fe,c as pe,ct as me,d as he,dt as ge,et as _e,f as ve,ft as ye,g as be,gt as xe,h as Se,ht as Ce,i as we,it as Te,j as z,jt as Ee,k as De,kt as Oe,l as ke,lt as Ae,m as je,mt as Me,n as Ne,nt as Pe,o as Fe,ot as Ie,p as Le,pt as Re,q as B,r as ze,rt as Be,s as Ve,st as He,t as Ue,tt as We,u as Ge,ut as Ke,v as qe,vt as V,w as Je,wt as Ye,x as Xe,xt as Ze,y as Qe,yt as $e,z as H,zt as U}from"./index-BtYCAm34.js";function et(e){let t=[],n=0;for(;n<e.length;){let r=e.slice(n),i=r.match(/^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/);if(i){n+=i[0].length;continue}let a=r.match(/^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/),o=r.match(/^(?:#[\da-f]{6}(?![\da-f])|0x[\da-f]+|\$[\da-f]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)/i),s=r.match(/^[a-zA-Z_][a-zA-Z_\d]*/),c=r.match(/^(?:\+\+|--|\+=|-=|\*=|\/=|%=|==|!=|<>|<=|>=|&&|\|\||<<|>>|[{}()[\];,.?:+\-*\/%=!<>~&|^])/),l=(a??o??s??c)?.[0];if(!l)throw Error(`Unsupported token at ${n}: ${r.slice(0,16)}`);t.push({value:l,offset:n,kind:a?`string`:o?`number`:s?`word`:`operator`}),n+=l.length}return t.push({value:`<eof>`,offset:n,kind:`eof`}),t}var tt={"=":1,"+=":1,"-=":1,"*=":1,"/=":1,"%=":1,"||":2,or:2,"&&":3,and:3,"|":4,"^":5,"&":6,"==":7,"!=":7,"<>":7,"<":8,">":8,"<=":8,">=":8,"<<":9,">>":9,"+":10,"-":10,"*":11,"/":11,"%":11,mod:11,div:11},nt=class{tokens;index=0;constructor(e){this.tokens=e}peek(){return this.tokens[this.index].value}take(e){let t=this.tokens[this.index++];if(e&&t.value!==e)throw Error(`Expected ${e}, got ${t.value} at ${t.offset}`);return t}match(e){return this.peek()===e&&(this.take(),!0)}program(){let e=[];for(;this.peek()!==`<eof>`;)e.push(this.statement());return{statements:e}}statement(){let e=this.peek();if(this.match(`;`))return{kind:`block`,body:[]};if(this.match(`{`)){let e=[];for(;this.peek()!==`}`;){if(this.peek()===`<eof>`)throw Error(`Unclosed block`);e.push(this.statement())}return this.take(`}`),{kind:`block`,body:e}}if(this.match(`if`)){this.take(`(`);let e=this.expression();return this.take(`)`),{kind:`if`,condition:e,yes:this.statement(),no:this.match(`else`)?this.statement():void 0}}if(this.match(`switch`)){this.take(`(`);let e=this.expression();this.take(`)`),this.take(`{`);let t=[];for(;this.peek()!==`}`;){let e;if(this.match(`case`))e=this.expression();else if(!this.match(`default`))throw Error(`Expected switch label`);this.take(`:`);let n=[];for(;![`case`,`default`,`}`].includes(this.peek());){if(this.peek()===`<eof>`)throw Error(`Unclosed switch`);n.push(this.statement())}if(!e&&t.some(e=>!e.test))throw Error(`Duplicate default label`);t.push({kind:`case`,test:e,body:n})}return this.take(`}`),{kind:`switch`,value:e,cases:t}}if(this.match(`with`)){this.take(`(`);let e=this.expression();return this.take(`)`),{kind:`with`,target:e,body:this.statement()}}if(this.match(`while`)){this.take(`(`);let e=this.expression();return this.take(`)`),{kind:`while`,condition:e,body:this.statement()}}if(this.match(`repeat`)){this.take(`(`);let e=this.expression();return this.take(`)`),{kind:`repeat`,count:e,body:this.statement()}}if(this.match(`for`)){this.take(`(`);let e=this.match(`;`)?void 0:this.peek()===`var`?this.variable():this.expressionStatement(),t=this.peek()===`;`?void 0:this.expression();this.take(`;`);let n=this.peek()===`)`?void 0:this.expression();return this.take(`)`),{kind:`for`,init:e,condition:t,increment:n,body:this.statement()}}if(e===`var`)return this.variable();if(this.match(`enum`)){let e=this.take();if(e.kind!==`word`)throw Error(`Expected enum name`);this.take(`{`);let t=[];for(;this.peek()!==`}`;){let e=this.take();if(e.kind!==`word`)throw Error(`Expected enum member`);if(t.push({name:e.value,value:this.match(`=`)?this.expression(2):void 0}),!this.match(`,`))break}return this.take(`}`),this.match(`;`),{kind:`enum`,name:e.value,members:t}}if(this.match(`function`)){let e=this.take();if(e.kind!==`word`)throw Error(`Expected function name`);this.take(`(`);let t=[];if(this.peek()!==`)`)do{let e=this.take();if(e.kind!==`word`)throw Error(`Expected parameter name`);t.push(e.value)}while(this.match(`,`));this.take(`)`);let n=this.statement();if(n.kind!==`block`)throw Error(`Expected function body`);return{kind:`function`,name:e.value,parameters:t,body:n}}if([`exit`,`break`,`continue`,`return`].includes(e)){this.take();let t=e===`return`&&this.peek()!==`;`?this.expression():void 0;return this.match(`;`),{kind:e,value:t}}if([`do`,`try`,`new`,`static`,`globalvar`].includes(e))throw Error(`Unsupported statement ${e} at ${this.tokens[this.index].offset}`);return this.expressionStatement()}variable(){this.take(`var`);let e=[];do{let t=this.take();if(t.kind!==`word`)throw Error(`Expected variable name`);let n=this.match(`=`)?this.expression(2):void 0;e.push({name:t.value,value:n})}while(this.match(`,`));return this.take(`;`),{kind:`var`,declarations:e}}expressionStatement(){let e=this.expression();return this.take(`;`),{kind:`expression`,expression:e}}expression(e=1){let t=this.prefix();for(;;){if(this.match(`.`)){t={kind:`member`,object:t,key:{kind:`literal`,value:this.take().value}};continue}if(this.match(`[`)){do{let e=this.expression();t={kind:`member`,object:t,key:e}}while(this.match(`,`));this.take(`]`);continue}if(this.match(`(`)){let e=[];if(this.peek()!==`)`)do e.push(this.expression());while(this.match(`,`));this.take(`)`),t={kind:`call`,callee:t,args:e};continue}if([`++`,`--`].includes(this.peek())){t={kind:`update`,operand:t,operator:this.take().value,postfix:!0};continue}let n=this.peek(),r=tt[n];if(!r||r<e)break;this.take();let i=r===1,a=this.expression(i?r:r+1);t={kind:i?`assign`:`binary`,operator:n,left:t,right:a}}if(e<=2&&this.match(`?`)){let e=this.expression();this.take(`:`),t={kind:`conditional`,condition:t,yes:e,no:this.expression()}}return t}prefix(){let e=this.take();if(e.value===`(`){let e=this.expression();return this.take(`)`),e}if(e.value===`[`){let e=[];if(this.peek()!==`]`)do e.push(this.expression());while(this.match(`,`));return this.take(`]`),{kind:`array`,values:e}}if([`!`,`not`,`-`,`+`,`~`,`++`,`--`].includes(e.value))return{kind:e.value===`++`||e.value===`--`?`update`:`unary`,operator:e.value,operand:this.expression(12),postfix:!1};if(e.kind===`number`){let t=e.value,n=t.startsWith(`$`)?parseInt(t.slice(1),16):Number(t);if(t.startsWith(`#`)){let e=parseInt(t.slice(1),16);n=(e&255)<<16|e&65280|e>>>16}return{kind:`literal`,value:n}}if(e.kind===`string`){let t=e.value.slice(1,-1),n={n:`
`,r:`\r`,t:`	`};return{kind:`literal`,value:t.replace(/\\([\\'"nrt])/g,(e,t)=>n[t]??t)}}if(e.value===`true`||e.value===`false`)return{kind:`literal`,value:e.value===`true`};if(e.kind===`word`)return{kind:`identifier`,name:e.value};throw Error(`Unsupported expression ${e.value} at ${e.offset}`)}};function rt(e){return new nt(et(e)).program()}var it=class{kind;value;constructor(e,t){this.kind=e,this.value=t}};function at(e,t,n){switch(e){case`+`:return t+n;case`-`:return t-n;case`*`:return t*n;case`/`:return t/n;case`%`:case`mod`:return t%n;case`div`:return Math.trunc(t/n);case`==`:return t===n;case`!=`:case`<>`:return t!==n;case`<`:return t<n;case`>`:return t>n;case`<=`:return t<=n;case`>=`:return t>=n;case`&`:return t&n;case`|`:return t|n;case`^`:return t^n;case`<<`:return t<<n;case`>>`:return t>>n;default:throw Error(`Unsupported operator `+e)}}function ot(e,t,n,r={}){let i=r.budget??1e5,a=()=>{if(--i<0)throw Error(`GML execution budget exhausted`)},o={self:t,other:r.other??t,locals:new Map},s=r.truth??(e=>{if(typeof e==`boolean`)return e;if(typeof e==`number`)return e>.5;if(e===void 0)return!1;throw Error(`GML boolean conversion requires native runtime for this type`)}),c=(e,t,n)=>{let i=r.operators?.[e];return i?i(t,n):at(e,t,n)},l=new Map,u=new Map;for(let t of e.statements)t.kind===`function`&&l.set(t.name,t);let d=(e,t)=>{if(e===`self`)return t.self;if(e===`other`)return t.other;if(t.locals.has(e))return t.locals.get(e);if(u.has(e))return u.get(e);if(e in t.self)return t.self[e];if(e in n)return n[e];throw Error(`Unknown GML variable `+e)},f=(e,t)=>{if(e.kind===`identifier`)return{get:()=>d(e.name,t),set:n=>{t.locals.has(e.name)?t.locals.set(e.name,n):t.self[e.name]=n}};if(e.kind===`member`){let n=p(e.object,t),i=r.member?r.member(n):n,a=p(e.key,t);if(typeof i!=`object`||!i)throw Error(`GML member target is not an instance/array`);return{get:()=>{if(!(a in i))throw Error(`Unknown GML member `+a);return i[a]},set:e=>{i[a]=e}}}throw Error(`Invalid GML assignment target`)},p=(e,t)=>{switch(a(),e.kind){case`literal`:return e.value;case`array`:return e.values.map(e=>p(e,t));case`identifier`:return d(e.name,t);case`member`:return f(e,t).get();case`assign`:{let n=f(e.left,t),r=p(e.right,t),i=e.operator===`=`?r:c(e.operator[0],n.get(),r);return n.set(i),i}case`update`:{let n=f(e.operand,t),r=n.get(),i=r+(e.operator===`++`?1:-1);return n.set(i),e.postfix?r:i}case`unary`:{let n=p(e.operand,t);switch(e.operator){case`!`:case`not`:return!s(n);case`-`:return-n;case`+`:return+n;case`~`:return~n}throw Error(`Unsupported unary`)}case`binary`:{let n=p(e.left,t);return e.operator===`&&`||e.operator===`and`?s(n)&&s(p(e.right,t)):e.operator===`||`||e.operator===`or`?s(n)||s(p(e.right,t)):c(e.operator,n,p(e.right,t))}case`conditional`:return s(p(e.condition,t))?p(e.yes,t):p(e.no,t);case`call`:{let n=Array(e.args.length);if(r.argumentOrder===`right-to-left`)for(let r=e.args.length-1;r>=0;r--)n[r]=p(e.args[r],t);else for(let r=0;r<e.args.length;r++)n[r]=p(e.args[r],t);if(e.callee.kind!==`identifier`)throw Error(`Unsupported GML method call`);let i=e.callee.name,a=l.get(i);if(a){let e=new Map;a.parameters.forEach((t,r)=>e.set(t,n[r])),e.set(`argument`,n),e.set(`argument_count`,n.length),n.forEach((t,n)=>e.set(`argument`+n,t));try{h(a.body,{self:t.self,other:t.other,locals:e})}catch(e){if(e instanceof it&&(e.kind===`return`||e.kind===`exit`))return e.value;throw e}return}let o=r.calls?.[i];if(!o)throw Error(`Unsupported GML call `+i);return o(t.self,...n)}default:throw Error(`Unsupported GML expression `+e.kind)}},m=(e,t)=>{try{return h(e,t),!0}catch(e){if(e instanceof it&&e.kind===`break`)return!1;if(e instanceof it&&e.kind===`continue`)return!0;throw e}},h=(e,t)=>{switch(a(),e.kind){case`block`:for(let n of e.body)h(n,t);return;case`expression`:p(e.expression,t);return;case`var`:for(let n of e.declarations)t.locals.set(n.name,n.value?p(n.value,t):void 0);return;case`function`:if(!l.has(e.name)||l.get(e.name)!==e)throw Error(`Unsupported nested GML function`);return;case`enum`:if(!u.has(e.name))throw Error(`Unsupported nested GML enum`);return;case`if`:s(p(e.condition,t))?h(e.yes,t):e.no&&h(e.no,t);return;case`switch`:{let n=p(e.value,t),r=-1,i=-1;for(let a=0;a<e.cases.length;a++){let o=e.cases[a];if(!o.test){i=a;continue}if(s(c(`==`,n,p(o.test,t)))){r=a;break}}if(r<0&&(r=i),r<0)return;try{for(let n=r;n<e.cases.length;n++)for(let r of e.cases[n].body)h(r,t)}catch(e){if(!(e instanceof it&&e.kind===`break`))throw e}return}case`while`:for(;s(p(e.condition,t))&&(a(),m(e.body,t)););return;case`repeat`:{let n=p(e.count,t);if(typeof n!=`number`||!Number.isFinite(n))throw Error(`Unsupported GML repeat count`);let r=C(n);for(let n=0;n<r&&(a(),m(e.body,t));n++);return}case`for`:for(e.init&&h(e.init,t);(!e.condition||s(p(e.condition,t)))&&(a(),m(e.body,t));)e.increment&&p(e.increment,t);return;case`with`:{let n=p(e.target,t),i=r.targets?r.targets(n):Array.isArray(n)?n:[n];for(let n of i){if(!n||typeof n!=`object`)throw Error(`Invalid GML with target`);h(e.body,{self:n,other:t.self,locals:t.locals})}return}case`exit`:case`break`:case`continue`:case`return`:throw new it(e.kind,e.value?p(e.value,t):void 0);default:throw Error(`Unsupported GML statement `+e.kind)}};for(let t of e.statements)if(t.kind===`enum`){let e={},n=0;for(let r of t.members){let t=r.value?p(r.value,o):n;if(typeof t!=`number`||!Number.isFinite(t))throw Error(`Unsupported GML enum value`);e[r.name]=t,n=t+1}u.set(t.name,e)}try{for(let t of e.statements)h(t,o)}catch(e){if(e instanceof it&&(e.kind===`exit`||e.kind===`return`))return e.value;throw e}}var st=new Map;function ct(e){let t=st.get(e);if(t)return t;let n=rt(e),r=new Set,i=new Set,a=new Set,o=e=>{if(e&&typeof e==`object`){e.kind===`assign`&&e.left.kind===`member`&&e.left.object.kind===`identifier`&&(e.left.key.kind!==`literal`||typeof e.left.key.value==`number`)&&r.add(e.left.object.name),e.kind===`assign`&&e.left.kind===`member`&&e.left.object.kind===`member`&&e.left.object.key.kind===`literal`&&typeof e.left.object.key.value==`string`&&i.add(e.left.object.key.value),e.kind===`call`&&e.callee.kind===`identifier`&&a.add(e.callee.name);for(let t of Object.values(e))Array.isArray(t)?t.forEach(o):t&&typeof t==`object`&&o(t)}};return o(n),t={program:n,arrays:r,memberArrays:i,calls:a},st.set(e,t),t}var lt={sprite_index:`sprite`,mask_index:`mask`,object_index:`object`,image_index:`imageIndex`,image_speed:`imageSpeed`,image_xscale:`imageXscale`,image_yscale:`imageYscale`,image_angle:`imageAngle`,image_alpha:`imageAlpha`,image_blend:`imageBlend`,gravity_direction:`gravityDirection`},ut=new WeakMap,W=e=>typeof e==`object`&&e?ut.get(e)?.id??(`events`in e||`index`in e&&`name`in e?e.index:e):e,dt=(e,t)=>typeof W(e)==`number`&&typeof W(t)==`number`?T(W(e),W(t)):W(e)===W(t),ft={"==":dt,"!=":(e,t)=>!dt(e,t),"<>":(e,t)=>!dt(e,t),"<":(e,t)=>U(W(e),W(t)),">":(e,t)=>f(W(e),W(t)),"<=":(e,t)=>_(W(e),W(t)),">=":(e,t)=>O(W(e),W(t))},pt=e=>!!e&&typeof e==`object`&&typeof e.name==`string`&&typeof e.index==`number`,mt=(e,t)=>e.replace(/~(\d+)/g,(e,n)=>String(t[Number(n)-1]));function ht(e,t,r,a,s,l,u,d){let f=ct(e),p=new WeakMap,m=new WeakMap,g=new Map(r.instances.filter(e=>e.live).map(e=>[e.id,e]));g.set(t.id,t),s&&g.set(s.id,s);let _=e=>{let t=m.get(e);return t||(t=new Proxy(e,{set:(e,t,n)=>{if(typeof t==`string`&&/^\d+$/.test(t)){let n=Number(t);if(n>1e6)throw Error(`NEO source array exceeds native adapter limit`);for(let t=e.length;t<n;t++)e[t]=0}return Reflect.set(e,t,n)}}),m.set(e,t),t)},v=e=>{let t=e&&typeof e==`object`?ut.get(e):void 0;if(t)return t.live?[t]:[];if(e instanceof Ye)return e.live?[e]:[];if(pt(e))return r.all(e);if(typeof e==`number`){let t=e>=0&&e<1e5?a.objectIndex?.(e):void 0;if(t)return r.all(t);let n=r.byId(e);return n?[n]:[]}if(e==null)return[];throw Error(`NEO invalid instance target ${String(e)}`)},y=e=>{let t=(e&&typeof e==`object`?ut.get(e):void 0)??(e instanceof Ye?e:v(e)[0]??(typeof e==`number`?g.get(e):void 0));if(!t)throw Error(`NEO source requires live instance ${pt(e)?e.name:String(e)}`);return t},b=e=>{let t=p.get(e);return t||(t=new Proxy(e,{has:(e,t)=>typeof t==`string`?t in e||t in lt||f.memberArrays.has(t)||[`sprite_width`,`sprite_height`,`image_number`,`bbox_left`,`bbox_right`,`bbox_top`,`bbox_bottom`].includes(t):t in e,get:(e,t)=>{if(typeof t==`string`&&f.memberArrays.has(t)&&!(t in e)&&(e[t]=[]),t===Symbol.toPrimitive)return()=>e.id;if(t===`sprite_width`)return r.spriteWidth(e);if(t===`sprite_height`)return r.spriteHeight(e);if(t===`image_number`){if(!e.sprite)return 0;let t=r.bank.get(e.sprite);if(!t)throw Error(`NEO missing sprite ${e.sprite}`);return t.frames}if(typeof t==`string`&&t.startsWith(`bbox_`)){let n=e.mask?r.bank.get(e.mask):e.sprite?r.bank.get(e.sprite):void 0;if(!n)throw Error(`NEO missing collision sprite ${e.mask??e.sprite}`);let i=e.x+(n.left-n.originX)*e.imageXscale,a=e.x+(n.right-n.originX)*e.imageXscale,o=e.y+(n.top-n.originY)*e.imageYscale,s=e.y+(n.bottom-n.originY)*e.imageYscale;return t===`bbox_left`?Math.min(i,a):t===`bbox_right`?Math.max(i,a):t===`bbox_top`?Math.min(o,s):Math.max(o,s)}let n=typeof t==`string`?lt[t]??t:t,i=Reflect.get(e,n,e);return(t===`sprite_index`||t===`mask_index`)&&i===null?-1:i},set:(e,t,n)=>{let r=typeof t==`string`?lt[t]??t:t;return Reflect.set(e,r,(r===`sprite`||r===`mask`)&&n===-1?null:ut.get(n)?.id??n,e)}}),p.set(e,t),ut.set(t,e),t)};for(let e of f.arrays)!(e in t)&&![`global`,`argument`].includes(e)&&(t[e]=[]);let S=e=>{let t=r.bank.get(e);if(!t)throw Error(`NEO missing source sprite ${e}`);return t},C,w=(e,t,n,i,a,o,s,c,l)=>{e!==null&&e!==-1&&(C===void 0?r.drawSprite(e,t,n,i,a,o,s,c,l):r.drawSpriteFog(e,t,n,i,a,o,s,C,l))},E={abs:(e,t)=>Math.abs(t),sin:(e,t)=>Math.sin(t),cos:(e,t)=>Math.cos(t),floor:(e,t)=>Math.floor(t),ceil:(e,t)=>Math.ceil(t),round:(e,t)=>h(t),min:(e,...t)=>Math.min(...t),max:(e,...t)=>Math.max(...t),clamp:(e,t,n,r)=>Math.max(n,Math.min(r,t)),lerp:(e,t,n,r)=>t+(n-t)*r,sqrt:(e,t)=>Math.sqrt(t),power:(e,t,n)=>t**n,sign:(e,t)=>Math.sign(t),degtorad:(e,t)=>t*Math.PI/180,random:(e,t)=>r.random.random(t),random_range:(e,t,n)=>r.random.randomRange(t,n),irandom:(e,t)=>r.random.irandom(t),irandom_range:(e,t,n)=>r.random.irandomRange(t,n),choose:(e,...t)=>r.random.choose(...t),point_direction:(e,t,n,r,a)=>i(t,n,r,a),point_distance:(e,t,n,r,i)=>L(t,n,r,i),lengthdir_x:(e,t,n)=>x(t,n),lengthdir_y:(e,t,n)=>A(t,n),distance_to_point:(e,t,n)=>L(e.x,e.y,t,n),move_towards_point:(e,t,n,r)=>c(y(e),t,n,r),arcsin:(e,t)=>Math.asin(t),string:(e,t)=>String(W(t)),ord:(e,t)=>String(t).charCodeAt(0),make_colour_rgb:(e,t,n,r)=>t&255|(n&255)<<8|(r&255)<<16,make_color_rgb:(e,t,n,r)=>t&255|(n&255)<<8|(r&255)<<16,merge_color:(e,t,n,r)=>o(t,n,r),sprite_get_xoffset:(e,t)=>S(t).originX,sprite_get_yoffset:(e,t)=>S(t).originY,sprite_get_width:(e,t)=>S(t).width,sprite_get_height:(e,t)=>S(t).height,sprite_get_number:(e,t)=>S(t).frames,sprite_exists:(e,t)=>!!r.bank.get(t),ds_map_find_value:(e,t,n)=>{if(t instanceof Map){if(!t.has(n))throw Error(`Missing source resource map key ${n}`);return t.get(n)}if(!(n in t))throw Error(`Missing source resource map key ${n}`);return t[n]},instance_create:(e,t,n,i)=>{if(!pt(i))throw Error(`NEO instance_create requires canonical object`);return r.create(i,t,n).id},instance_create_depth:(e,t,n,i,a)=>{if(!pt(a))throw Error(`NEO instance_create_depth requires canonical object`);let o=r.create(a,t,n);return o.depth=i,o.id},instance_exists:(e,t)=>v(t).length>0,i_ex:(e,t)=>v(t).length>0,instance_number:(e,t)=>v(t).length,instance_find:(e,t,n)=>v(t)[n]?.id??-4,instance_destroy:(e,t)=>{for(let n of v(t??ut.get(e)))r.destroy(n)},place_meeting:(e,t,n,i)=>{if(!pt(i))throw Error(`NEO place_meeting requires a source object`);return r.placeMeeting(y(e),t,n,i)},instance_place:(e,t,i,a)=>{let o=y(e);return v(a).find(e=>n(r.bank,{...o,x:t,y:i,sprite:o.sprite,mask:o.mask,imageAngle:o.imageAngle,imageXscale:o.imageXscale,imageYscale:o.imageYscale,imageIndex:o.imageIndex},e))?.id??-4},instance_nearest:(e,t,n,r)=>v(r).reduce((e,r)=>!e||L(t,n,r.x,r.y)<L(t,n,e.x,e.y)?r:e,void 0)?.id??-4,collision_rectangle:(e,t,n,i,a,o,s,c)=>v(o).find(o=>(!c||o!==y(e))&&Ee(r.bank,o,t,n,i,a,!!s))?.id??-4,left_h:()=>r.input.held.has(37),right_h:()=>r.input.held.has(39),up_h:()=>r.input.held.has(38),down_h:()=>r.input.held.has(40),event_user:(e,t)=>{let n=y(e),i=D(n.object,`user${t}`);if(!i)throw Error(`${n.object.name} missing source user${t}`);i(n,r)},event_inherited:e=>{if(!l)throw Error(`NEO inherited event lacks dispatch context`);let t=y(e);(t.object.parent&&D(t.object.parent,l))?.(t,r)},keyboard_check_pressed:(e,t)=>r.input.pressed.has(t),keyboard_check_released:(e,t)=>r.input.released.has(t),keyboard_check:(e,t)=>r.input.held.has(t),button1_p:()=>r.input.pressed.has(90)||r.input.pressed.has(13),button2_p:()=>r.input.pressed.has(88)||r.input.pressed.has(16),button3_p:()=>r.input.pressed.has(67)||r.input.pressed.has(17),button1_h:()=>r.input.held.has(90)||r.input.held.has(13),button1_r:()=>r.input.released.has(90)||r.input.released.has(13),button2_h:()=>r.input.held.has(88)||r.input.held.has(16),button3_h:()=>r.input.held.has(67)||r.input.held.has(17),surface_create:(e,t,n)=>r.sourceSurfaces.create(t,n),surface_set_target:(e,t)=>r.sourceSurfaces.target(t),surface_reset_target:()=>r.sourceSurfaces.target(null),surface_free:(e,t)=>r.sourceSurfaces.free(t),draw_clear_alpha:(e,t,n)=>r.sourceSurfaces.clear(t,n),sprite_create_from_surface:(e,t,n,i,a,o,s,c,l,u)=>r.sourceSurfaces.capture(t,n,i,a,o,l,u),sprite_delete:(e,t)=>r.sourceSurfaces.deleteSprite(t),gamepad_button_check_pressed:(e,t,n)=>r.input.pressed.has(n),camerax:()=>r.view.x,cameray:()=>r.view.y,camerawidth:()=>r.view.width,cameraheight:()=>r.view.height,__view_get:(e,t)=>t===0?r.view.x:t===1?r.view.y:t===2?r.view.width:t===3?r.view.height:(()=>{throw Error(`NEO unsupported view field ${t}`)})(),draw_set_color:(e,t)=>{r.drawState.color=t},draw_set_colour:(e,t)=>{r.drawState.color=t},draw_set_alpha:(e,t)=>{r.drawState.alpha=t},draw_set_font:(e,t)=>{r.drawState.font=t},draw_set_halign:(e,t)=>{r.drawState.halign=t},draw_set_valign:(e,t)=>{r.drawState.valign=t},draw_get_alpha:()=>r.drawState.alpha,draw_get_color:()=>r.drawState.color,draw_triangle:(e,t,n,i,a,o,s,c)=>r.drawTriangle(t,n,i,a,o,s,!!c),d3d_set_fog:(e,t,n)=>{C=t?n:void 0},draw_sprite_ext:(e,...t)=>w(...t),draw_self:e=>r.drawSelf(y(e)),draw_line_width:(e,t,n,i,a,o)=>r.drawLine(t,n,i,a,o),draw_line:(e,t,n,i,a)=>r.drawLine(t,n,i,a),draw_circle:(e,t,n,i,a)=>r.drawCircle(t,n,i,!!a),draw_rectangle:(e,t,n,i,a,o)=>r.drawRect(t,n,i,a,!!o),draw_sprite:(e,t,n,r,i)=>w(t,n,r,i,1,1,0,M.white,1),draw_text:(e,t,n,i)=>r.drawText(t,n,String(i)),draw_sprite_part_ext:(e,...t)=>r.drawSpritePart(...t),draw_monster_body_part_ext:(e,...t)=>{w(...t),T(e.flash,1)&&r.drawSpriteFog(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],-Math.cos(e.fsiner/5)*.4+.6)},draw_sprite_ext_flash:(e,...t)=>r.drawSpriteFog(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8]),stringsetloc:(e,t,n)=>a.text(n),stringsetsubloc:(e,t,...n)=>mt(a.text(n.pop()),n),msgset:(e,t,n)=>{r.globals.msgno=t,r.globals.msg[t]=n},msgsetloc:(e,t,n,i)=>{r.globals.msgno=t,r.globals.msg[t]=a.text(i)},msgsetsubloc:(e,t,n,...i)=>{r.globals.msgno=t,r.globals.msg[t]=mt(a.text(i.pop()),i)},msgnextloc:(e,t,n)=>{let i=r.globals;i.msgno++,i.msg[i.msgno]=a.text(n)},scr_sideb_get_phase:()=>{if((r.globals.flag?.[915]??0)>0||(r.globals.flag?.[916]??0)>0)throw Error(`Spamton NEO side-B source is unavailable`);return 0},variable_instance_set:(e,t,n,r)=>{b(y(t))[n]=r},variable_instance_get:(e,t,n)=>{let r=b(y(t));if(!(n in r))throw Error(`Unknown GML member ${n}`);return r[n]},is_string:(e,t)=>typeof t==`string`,is_real:(e,t)=>typeof t==`number`},ee=(e,t,...n)=>{if(E[e])return E[e](t,...n);let i=a.scripts?.[e];return i?ht(i,y(t),r,a,s,l,n,e):a.call(e,y(t),r,n)};E.script_execute=(e,t,...n)=>ee(t,e,...n);let O=new Proxy({},{get:(e,t)=>typeof t==`string`?(e,...n)=>ee(t,e,...n):void 0}),k={global:r.globals,room:a.room??`room_dw_mansion_b_east`,room_width:r.room.width,room_height:r.room.height,room_speed:r.bank.roomSpeed,view_wport:[r.view.width],view_hport:[r.view.height],e__VW:{XView:0,YView:1,WView:2,HView:3},noone:-4,all:-3,c_white:M.white,c_black:M.black,c_green:M.green,c_lime:M.lime,c_purple:M.purple,c_orange:M.orange,c_red:M.red,c_blue:16711680,c_yellow:M.yellow,c_aqua:M.aqua,c_gray:M.gray,c_ltgray:M.ltgray,c_teal:8421376,c_silver:12632256,c_fuchsia:16711935,c_maroon:128,c_navy:8388608,c_olive:32896,vk_f1:112,gp_stickr:32780,vk_enter:13,vk_shift:16,vk_control:17,vk_space:32,vk_left:37,vk_up:38,vk_right:39,vk_down:40,pi:Math.PI},te=new Proxy(k,{has:(e,t)=>typeof t==`string`&&(t in k||/^(obj_|o_|spr_|bg_|snd_|room_|scr_|mus_)/.test(t)),get:(e,t)=>typeof t==`string`?t in e?e[t]:/^(obj_|o_)/.test(t)?a.object(t):/^(spr_|bg_|snd_|room_|scr_|mus_)/.test(t)?t:void 0:void 0}),j=f.program;if(u){let e=j.statements.find(e=>e.kind===`function`&&(!d||e.name===d));if(!e)throw Error(`NEO script has no declared function ${d??``}`);j={statements:[...j.statements,{kind:`return`,value:{kind:`call`,callee:{kind:`identifier`,name:e.name},args:u.map(e=>({kind:`literal`,value:e}))}}]}}try{return ot(j,b(t),te,{calls:O,operators:ft,argumentOrder:`right-to-left`,other:s?b(s):void 0,targets:e=>v(e).map(b),member:e=>Array.isArray(e)?_(e):e instanceof Ye?b(e):pt(e)||typeof e==`number`?b(y(e)):e})}catch(e){throw Error(`${t.object.name} ${l??`source`}: ${e instanceof Error?e.message:String(e)}`,{cause:e})}}function G(e,t,n){let r={name:t.name,index:t.index,depth:t.depth,visible:t.visible,sprite:t.sprite??void 0,mask:t.mask??void 0,events:{}};Object.defineProperty(r,"archived",{value:Object.keys(n).length>0}),t.parent&&Object.defineProperty(r,"parent",{get:()=>e.object(t.parent),configurable:!0});let i=e=>e===`Create_0`?`create`:e===`Step_0`?`step`:e===`Step_1`?`beginStep`:e===`Step_2`?`endStep`:e===`Draw_0`?`draw`:e===`Other_7`?`animationEnd`:e.startsWith(`Alarm_`)?`alarm${Number(e.slice(6))}`:e.startsWith(`Other_`)&&Number(e.slice(6))>=10?`user${Number(e.slice(6))-10}`:void 0;for(let[t,a]of Object.entries(n)){let n=i(t);n&&(r.events[n]=(t,r)=>ht(a,t,r,e,void 0,n))}(n.Destroy_0||n.CleanUp_0)&&(r.events.destroy=(t,r)=>{n.Destroy_0&&ht(n.Destroy_0,t,r,e,void 0,`destroy`),n.CleanUp_0&&ht(n.CleanUp_0,t,r,e,void 0,`destroy`)});let a=Object.entries(n).filter(([e])=>e.startsWith(`Collision_`));return a.length&&Object.defineProperty(r,"collisions",{get:()=>a.map(([t,n])=>({target:e.object(t.slice(10)),run:(t,r,i)=>ht(n,t,i,e,r)})),configurable:!0}),r}function gt(e,t){let n=t.globals,r=e.myself;(f(n.mercymod[r],25)&&T(e.phase,1)||U(n.monsterhp[r],n.monstermaxhp[r]*.75)&&T(e.phase,1))&&(e.phase=2),(f(n.mercymod[r],50)&&T(e.phase,2)||U(n.monsterhp[r],n.monstermaxhp[r]*.5)&&T(e.phase,2))&&(e.phase=3),(f(n.mercymod[r],70)&&T(e.phase,3)||U(n.monsterhp[r],n.monstermaxhp[r]*.3)&&T(e.phase,3))&&(e.phaseturn=0,e.phase=4),e.turn++,e.phaseturn++,T(e.phaseturn,1)&&(e.rr=0,e.difficulty=1),T(e.phaseturn,2)&&(e.rr=6,e.difficulty=0),T(e.phaseturn,3)&&(e.rr=2,e.difficulty=0),T(e.phaseturn,4)&&(e.rr=8,e.difficulty=0),T(e.phaseturn,5)&&(e.rr=8.5,e.difficulty=0,T(e.hellmode,1)&&(e.difficulty=2)),T(e.phaseturn,6)&&(e.rr=7,e.difficulty=0),T(e.phaseturn,7)&&(e.rr=2,e.difficulty=2),T(e.phaseturn,8)&&(e.rr=0,e.difficulty=3),T(e.phaseturn,9)&&(e.rr=7,e.difficulty=0),T(e.phaseturn,10)&&(e.rr=8.5,e.difficulty=2,(T(e.nothitduringphonehands,1)||T(e.hellmode,1))&&(e.rr=8.5,e.difficulty=1)),T(e.phaseturn,11)&&(e.rr=8,e.difficulty=1),T(e.phaseturn,12)&&(e.rr=6,e.difficulty=1,e.phaseturn=7),T(e.phase,4)&&(T(e.phaseturn,1)&&(e.rr=2,e.difficulty=1),T(e.phaseturn,2)&&(e.rr=8,e.difficulty=3),T(e.phaseturn,3)&&(e.rr=9,e.difficulty=0,e.haveusedfinalattack=1),T(e.phaseturn,4)&&(e.rr=2,e.difficulty=1),T(e.phaseturn,5)&&(e.rr=7,e.difficulty=0),T(e.phaseturn,6)&&(e.rr=9,e.difficulty=0,e.phaseturn=3)),(U(n.monsterhp[r],n.monstermaxhp[r]*.1)&&T(e.haveusedfinalattack,0)||f(n.mercymod[r],90)&&T(e.haveusedfinalattack,0))&&(e.rr=9,e.difficulty=0,e.haveusedfinalattack=1,e.phaseturn=3),f(e.weirdpathendcon,0)&&(e.rr=5)}var _t={obj_spamton_neo_enemy:{metadata:{index:702,name:`obj_spamton_neo_enemy`,parent:`obj_monsterparent`,sprite:`spr_sneo_example`,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_4:`actcon += 1;
`,Alarm_6:`if (endcon > 0)
{
    if (balloonend == 1)
    {
        endcon = 4;
    }
    else
    {
        endcon = 2;
        talktimer = 0;
    }
}
else if (balloonend == 1)
{
    talked = 1;
}
else
{
    talked = 0.6;
    talktimer = 0;
}
`,CleanUp_0:`if (audio_is_playing(snd_sneo_overpower))
{
    snd_stop(snd_sneo_overpower);
}
global.sp = 4;
snd_stop(snd_rumble);
snd_volume(snd_rumble, 1, 0);
`,Create_0:`scr_enemy_object_init();
if (global.fighting == 0)
{
    myself = 0;
    global.mercymod[myself] = 0;
}
heart_attack_count = 10;
heart_health = 25;
heart_speed_scaling = 2;
heart_1st_wave_timer = 6;
heart_2nd_wave_timer = 11;
heart_3rd_wave_timer = 16;
heart_variant_arm_shoot_timer = 90;
heart_turntimer = 1200;
heart_hurt_timer_reduction = 27;
heart_hurt_timer_reduction_bigshot = 108;
heart_bullet_image_scale = 1.1;
heart_bullet_speed_1st_wave = 0.1;
heart_bullet_friction_1st_wave = 0.1;
heart_bullet_speed_2nd_wave = 0.1;
heart_bullet_friction_2nd_wave = 0.09;
heart_bullet_speed_3rd_wave = 0.1;
heart_bullet_friction_3rd_wave = 0.08;
heart_bullet_gravity_acceleration = 1.075;
crusher_start_hspeed = -3;
crusher_start_hacceleration = 0.4;
crusher_turret_speed = 15;
crusher_turret_distance = 44;
crusher_x_origin = 220;
crusher_turret_bullet_speed = -0.5;
crusher_turret_bullet_gravity = 0.5;
upgrade = 0;
bigshot = 1;
bigshotused = 0;
bigshotcount = 0;
tinyralsei = 0;
weakentimer = 0;
weakenshakeamount = 0;
maxvinecount = 6;
vinecuttimer = 0;
vinebgcount = 18;
vineid = -1;
snapallcount = 0;
endcon = 0;
weirdpathendcon = 0;
weirdpathendtimer = 0;
endtimer = 0;
dancealtcon = 0;
cantspareinit = 0;
savemeactcon = 0;
usedact = 0;
difficulty = 0;
turn = 0;
phaseturn = 0;
phase = 1;
firstheartattack = 0;
fireslasers = 0;
haveusedfinalattack = 0;
phonejokeplayerdied = 0;
newcrushermovement = 1;
sneomacaronihandscon = 0;
flyingheadsbseen = 0;
singleshotmercy = 0;
prevmercy = 0;
prevhearttack = 0;
facebroken = 0;
correct_answer = -1;
hurttimer2 = 0;
faceattackcount = 0;
nothitduringphonehands = 1;
sneo_defeat_cutscene_version = 0;
targetbgspeed = 0;
smoketimer = 0;
smokethreshold = 1;
didwejustdie = 0;
dontchangepose = 0;
lastwirecon = 0;
lastwiretimer = 0;
headendcon = 0;
finalattackconversationcon = 0;
funnycheat = 0;
funnycheattimer = 0;
funnycheattimer2 = 0;
funnycheattimer3 = 0;
headexpand = 0;
hellmode = 0;
laserflash = irandom(3);
talkmax = 90;
image_speed = 0.16666666666666666;
idlesprite = spr_sneo_example;
hurtsprite = spr_sneo_example;
sparedsprite = spr_sneo_example;
custom_draw = 1;
f = 2;
image_xscale = 2;
image_yscale = 2;
sinerb = 0;
lerper = 0;
shocker = 0;
dead = 0;
checkcount = 0;
shake_head = 0;
heart_release_con = 0;
shocker_threshold = 10;
shotanimtimer = 0;
shocktimer = 0;
shockthreshold = 10;
laughtimer = 0;
fakegrav = 0;
falltimer = 0;
fallshake = 10;
aim = 1;
hitcon = 0;
hitdetector = instance_create(x, y, obj_sneo_hitdetector);
stoprumblesfx = 0;
chargepitch = 0.1;
chargesfxtimer = 0;
dance_con = 0;
dance_timer = 0;
partfocus = 0;
blend = merge_color(c_white, c_black, 0.15);
shootydanceinit = 0;
shootydancex = x;
shootydancey = y;
partsprite[0] = spr_sneo_wingl;
partsprite[1] = spr_sneo_arml;
partsprite[2] = spr_sneo_legl;
partsprite[3] = spr_sneo_legr;
partsprite[4] = spr_sneo_body;
partsprite[5] = spr_sneo_head;
partsprite[6] = spr_sneo_armr;
partsprite[7] = spr_sneo_wingr;
for (i = 0; i < 8; i += 1)
{
    partframe[i] = 0;
    partsiner[i] = 0;
    partrot[i] = 0;
    partblend[i] = 16777215;
    partx[i] = 0;
    party[i] = 0;
    partxoff[i] = sprite_get_xoffset(partsprite[i]) * 2;
    partyoff[i] = sprite_get_yoffset(partsprite[i]) * 2;
    partvisible[i] = 1;
    partweakened[i] = 0;
}
for (ii = 0; ii < 18; ii += 1)
{
    partsiner_back[ii] = 0;
    partx_back[ii] = 0;
    party_back[ii] = 0;
    partxoff_back[ii] = sprite_get_xoffset(partsprite[0]) * (1.8 + (ii / 9));
    partyoff_back[ii] = sprite_get_yoffset(partsprite[0]) * 2;
    partvisible_back[ii] = 1;
}
heartattackoffsetx = 0;
extra_vines = 26;
armlength = point_distance(partxoff[1], partyoff[1], 36, 146);
partmode = 1;
songtime = 0;
songplaying = 1;
resumeinterval = 1.715;
drawaimer = 0;
phoneevent = 0;
headmode = 0;
vinex = 0;
attackdebug = -1;
difficultydebug = -1;
musicdebug = 0;
party_heal = false;
makeheart = 0;
makeheartinit = 0;
makehearttype = 0;
makehearttimer = 0;
makeheartalt = 0;
violentendflash = 0;
head_recoil_amount = 0;
shadow_amount = 0;
facing = 1;
headhit = 0;
headsize = 1;
headforceframe = -1;
aimmode = 0;
armaim = -80;
hitcontimer = 0;
balloonorder = 0;
ballooncon = 0;
balloonend = 1;
talkedcon = 0;
init = 0;
statustextorder = 0;
statustextalt = 0;
statustextalt2 = 0;
statustextupdate = 0;
joke = 0;
eyeshp = 16;
nosehp = 16;
mouthhp = 16;
specialcontimer = 0;
specialcon = 0;
flameframe = 0;
flamealpha = 0;
`,Draw_0:`if (partmode == 10)
{
    partmode = 9;
}
if (room != room_dw_mansion_b_east_a)
{
    if (!instance_exists(obj_sneo_phonecall) && obj_spamton_neo_enemy.image_alpha < 1)
    {
        obj_spamton_neo_enemy.image_alpha += 0.1;
    }
}
if (state == 0)
{
    fsiner++;
}
var hidebgvines = 0;
if (i_ex(obj_battlecontroller) && global.mercymod[myself] > 89)
{
    hidebgvines = 1;
}
var bgvinecount = 0;
for (var ii = 0; ii < 18; ii += 1)
{
    if (partvisible_back[ii] == 1)
    {
        bgvinecount++;
    }
    if (hidebgvines == 0)
    {
        if (partmode != 34)
        {
            heartattackoffsetx = 0;
        }
        draw_set_color(make_colour_rgb(0, 51, 0));
        partsiner_back[ii] += 0.5;
        if (instance_exists(obj_sneo_bulletcontroller) && obj_sneo_bulletcontroller.type == 8.5)
        {
            draw_set_alpha(image_alpha);
        }
        if (partvisible_back[ii] == 1)
        {
            draw_line_width(x + partx_back[ii] + partxoff_back[ii] + heartattackoffsetx + (sin(partsiner_back[ii] / 30) * 2), y + party_back[ii] + partyoff_back[ii], x + partx_back[ii] + heartattackoffsetx + partxoff_back[ii], -400, 1);
        }
        draw_set_alpha(1);
        if (violentendflash > 0)
        {
            draw_set_color(c_white);
            draw_set_alpha(violentendflash / 10);
            if (partvisible_back[ii] == 1)
            {
                draw_line_width(x + partx_back[ii] + partxoff_back[ii] + heartattackoffsetx + (sin(partsiner_back[ii] / 30) * 2), y + party_back[ii] + partyoff_back[ii], x + partx_back[ii] + heartattackoffsetx + partxoff_back[ii], -400, 1);
            }
            draw_set_alpha(1);
        }
    }
}
if (weakentimer > 0)
{
    weakentimer++;
    if (weakenshakeamount > 0)
    {
        weakenshakeamount -= 0.5;
    }
}
if (lastwirecon == 0 || lastwirecon == 1)
{
    draw_set_color(make_colour_rgb(0, 51, 0));
    if (instance_exists(obj_sneo_bulletcontroller) && obj_sneo_bulletcontroller.type == 8.5)
    {
        draw_set_alpha(image_alpha);
    }
    draw_line_width(x + partx[4] + (partxoff[4] / 1.2) + 20 + (sin(partsiner[4] / 25) * 1.8), ((y + party[4]) - 10) + partyoff[4], x + partx[4] + (partxoff[4] / 1.5) + 32, -400, 1);
    draw_set_alpha(1);
    if (violentendflash > 0)
    {
        draw_set_color(c_white);
        draw_set_alpha(violentendflash / 10);
        draw_line_width(x + partx[4] + (partxoff[4] / 1.2) + 20 + (sin(partsiner[4] / 25) * 1.8), ((y + party[4]) - 10) + partyoff[4], x + partx[4] + (partxoff[4] / 1.5) + 32, -400, 1);
        draw_set_alpha(1);
    }
}
if (endcon == 1 && lastwirecon == 0)
{
    lastwirecon = 1;
}
if (lastwirecon == 1)
{
    lastwiretimer++;
    if (lastwiretimer == 30)
    {
        lastwirecon = 2;
    }
}
if (lastwirecon == 1 || lastwirecon == 2)
{
    draw_set_alpha(lastwiretimer / 30);
    draw_set_color(c_green);
    draw_line_width(x + partx[4] + (partxoff[4] / 1.2) + 20 + (sin(partsiner[4] / 25) * 1.8), ((y + party[4]) - 10) + partyoff[4], x + partx[4] + (partxoff[4] / 1.5) + 32, -400, 1 + (lastwiretimer / 30));
    draw_set_alpha(1);
}
var fgvinecount = 0;
for (var i = 0; i < 6; i += 1)
{
    draw_set_color(c_green);
    var weakenshakeamount2 = 0;
    if (partweakened[i] == 1)
    {
        weakenshakeamount2 = weakenshakeamount - (random(weakenshakeamount) * 2);
    }
    if (partweakened[i] > 0)
    {
        draw_set_color(c_orange);
    }
    if (instance_exists(obj_sneo_bulletcontroller) && obj_sneo_bulletcontroller.type == 8.5)
    {
        draw_set_alpha(image_alpha);
    }
    if (partvisible[i] == 1)
    {
        draw_line_width(x + partx[i] + (partxoff[i] / 1.2) + (i * 5) + (sin(partsiner[i] / 30) * 2) + weakenshakeamount2, ((y + party[i]) - 10) + partyoff[i] + weakenshakeamount2, x + partx[i] + (partxoff[i] / 1.5) + (i * 8), -400, 2);
        fgvinecount++;
    }
    draw_set_alpha(1);
    if (partweakened[i] == 1 && weakentimer < 11)
    {
        draw_set_color(c_white);
        draw_set_alpha(11 - (weakentimer / 10));
        if (instance_exists(obj_sneo_phonecall))
        {
            draw_set_alpha(image_alpha);
        }
        draw_line_width(x + partx[i] + (partxoff[i] / 1.2) + (i * 5) + (sin(partsiner[i] / 30) * 2) + weakenshakeamount2, ((y + party[i]) - 10) + partyoff[i] + weakenshakeamount2, x + partx[i] + (partxoff[i] / 1.5) + (i * 8), -400, 2);
        draw_set_alpha(1);
    }
    if (violentendflash > 0)
    {
        draw_set_color(c_white);
        draw_set_alpha(violentendflash / 10);
        if (instance_exists(obj_sneo_phonecall))
        {
            draw_set_alpha(image_alpha);
        }
        draw_line_width(x + partx[i] + (partxoff[i] / 1.2) + (i * 5) + (sin(partsiner[i] / 30) * 2) + weakenshakeamount2, ((y + party[i]) - 10) + partyoff[i] + weakenshakeamount2, x + partx[i] + (partxoff[i] / 1.5) + (i * 8), -400, 2);
        draw_set_alpha(1);
    }
    if (partweakened[i] == 1 && weakentimer == 10)
    {
        partweakened[i] = 2;
    }
}
if (i_ex(obj_battlecontroller) && global.mercymod[myself] > 89 && bgvinecount > 0 && !i_ex(obj_sneo_vine_transition) && !i_ex(obj_sneo_vine_cut))
{
    for (var i = 0; i < 6; i += 1)
    {
        if (obj_spamton_neo_enemy.partvisible[i] == 0)
        {
            obj_spamton_neo_enemy.vineid = i;
            vine = instance_create(x, y, obj_sneo_vine_transition);
        }
    }
}
if (specialcon == 1)
{
    specialcontimer++;
    for (var i = 0; i < 8; i += 1)
    {
        partrot[i] = lerp(partrot[i], 0, 0.07 * f);
        partx[i] = lerp(partx[i], 0, 0.05 * f);
        party[i] = lerp(party[i], 0, 0.03 * f);
    }
    flameframe = (specialcontimer / 4) % 2;
    flamealpha = specialcontimer / 15;
    if (flamealpha >= 0.9)
    {
        flamealpha = 0.9;
    }
    if (specialcontimer >= 15)
    {
        flamealpha = 1 - (specialcontimer / 60);
        if (flamealpha < 0)
        {
            flamealpha = 0;
        }
    }
    if (specialcontimer >= 60)
    {
        specialcontimer = 12;
        specialcon = 0;
        image_index = 0;
    }
    draw_sprite_ext(spr_bhero, 10 + flameframe, x + 75, y + 177, -2, 2.8 + abs(sin(specialcontimer / 4) / 2), 0, c_blue, flamealpha);
    draw_sprite_ext(spr_bhero, 11 - flameframe, x + 75, y + 177, -2, 2.8, 0, c_teal, flamealpha / 1.4);
}
shocker -= (1 * f);
for (var i = 0; i < 8; i += 1)
{
    if (partmode < 20)
    {
        if (partmode == 0)
        {
            partsiner[i] = 0;
            partframe[i] = 0;
            if (i == 5)
            {
                partrot[i] = lerp(partrot[i], 30, 0.25 * f);
                partx[i] = lerp(partx[i], -10, 0.25 * f);
                party[i] = lerp(party[i], 10, 0.25 * f);
                if (dead == 1)
                {
                    partframe[i] = 3;
                }
            }
            else
            {
                partrot[i] = lerp(partrot[i], 0, 0.25 * f);
                partx[i] = lerp(partx[i], 0, 0.25 * f);
                party[i] = lerp(party[i], 0, 0.25 * f);
                if (abs(partrot[i]) < 1)
                {
                    partrot[i] = 0;
                }
                if (abs(partx[i]) < 1)
                {
                    partx[i] = 0;
                }
                if (abs(party[i]) < 1)
                {
                    party[i] = 0;
                }
            }
        }
        if (partmode == 1 || partmode == 3 || partmode >= 5)
        {
            if (partmode == 1 && aimmode != 0)
            {
                aimmode = 0;
            }
            if ((partmode == 3 || (partmode >= 9 && partmode <= 13)) && i == 1)
            {
                if (aimmode == 2 && instance_exists(obj_heart) && partmode == 3)
                {
                    armaim = point_direction(x + partxoff[i], y + partyoff[i], obj_heart.x + 8, obj_heart.y + 8) + 90;
                }
                else if (aimmode != 1)
                {
                    armaim = -80;
                }
                if (partmode < 10)
                {
                    partrot[i] = lerp(partrot[i], armaim, 0.25 * f);
                }
                if (partmode < 9)
                {
                    partframe[i] = (partmode == 3) ? 1 : 3;
                }
                if (partmode == 12)
                {
                    partframe[i] = 1;
                }
                if (partmode >= 10)
                {
                    if (partrot[i] == armaim)
                    {
                        partrot[i] = armaim + 2;
                    }
                    else
                    {
                        partrot[i] = armaim;
                    }
                }
            }
            else if (partmode >= 6 && partmode < 11 && i == 1)
            {
                partrot[i] = lerp(partrot[i], -160, 0.25 * f);
                if (partframe[i] != 2 && partrot[i] <= -90)
                {
                    partframe[i] = 2;
                }
            }
            else
            {
                if (i == 1)
                {
                    if (partmode == 5 || partmode == 1)
                    {
                        partframe[i] = 0;
                    }
                }
                partsiner[i] += (1 + (i / 5)) * f;
                partrot[i] = sin(partsiner[i] / 30) * 15;
            }
            if (i == 5)
            {
                partx[i] = lerp(partx[i], 0, 0.25 * f);
                party[i] = lerp(party[i], 0, 0.25 * f);
                partrot[i] -= 10 * f;
                if (partmode == 5 || partmode == 8 || partmode == 9)
                {
                    partrot[i] /= 2;
                    partrot[i] += 10 * f;
                    partframe[i] = 1;
                }
                else if (partmode == 6 || partmode == 7)
                {
                    partrot[i] /= 2;
                    if (partmode > 6 || partrot[1] <= -120)
                    {
                        partframe[i] = 0;
                    }
                }
                else if (partmode == 11)
                {
                    partframe[i] += 0.2 * f;
                }
                else if (partmode == 12)
                {
                    partframe[i] += 0.3 * f;
                }
                else
                {
                    partframe[i] += 0.05 * f;
                }
                if (partframe[i] >= 3)
                {
                    partframe[i] = 0;
                }
                if (partframe[i] >= 2)
                {
                    partrot[i] += 20 * f;
                }
            }
        }
        if (partmode == 2)
        {
            partsiner[i] += (1 + (i / 5)) * f;
            partx[i] = sin((partsiner[i] / 2) * f);
            party[i] = cos((partsiner[i] / 2) * f);
            if (shocker < 0)
            {
                partrot[i] = 60 - random(120);
                if (i == 5)
                {
                    partframe[i] += 1 * f;
                    if (partframe[i] >= 3)
                    {
                        partframe[i] = 0;
                    }
                }
            }
        }
        if (partmode == 4)
        {
            idealrot[0] = -43;
            idealrot[1] = -180;
            idealrot[2] = -20;
            idealrot[3] = -10;
            idealrot[4] = -31;
            idealrot[5] = -60;
            idealrot[6] = -61;
            idealrot[7] = -56;
            if (shotanimtimer == (0.125 * f) && i == 1)
            {
                armendx = x + partx[1] + partxoff[1] + lengthdir_x(armlength, partrot[1] - 93);
                armendy = y + party[1] + partyoff[1] + lengthdir_y(armlength, partrot[1] - 93);
                if (instance_exists(obj_sneo_heartattack))
                {
                    aimmode = 0;
                }
            }
            shotanimtimer += (0.125 * f);
            if (shotanimtimer < 13)
            {
                partframe[5] = 2;
                partrot[i] = lerp(partrot[i], idealrot[i], 0.3 * f);
                lerper = 0;
            }
            if (shotanimtimer >= 13)
            {
                partframe[5] = 1;
                lerper += (0.015 * f);
                if (i != 1)
                {
                    partrot[i] = lerp(partrot[i], sin(partsiner[i] / 30) * 15, lerper);
                }
                if (i == 1)
                {
                    partrot[i] = lerp(partrot[i], armaim, lerper);
                }
            }
            if (shotanimtimer >= 24)
            {
                shotanimtimer = 0;
                partmode = 3;
            }
        }
        if (partmode == 6)
        {
            shotanimtimer = 0;
        }
        if (partmode == 7)
        {
            partrot[5] += sin(shotanimtimer / 5) * 15;
            shotanimtimer += (0.2 * f);
            if (shotanimtimer > 60)
            {
                partmode = 6;
            }
        }
        if (partmode == 20)
        {
            partrot[0] = -96 + random(3);
            partrot[1] = -143 + random(3);
            partrot[2] = -81 + random(3);
            partrot[3] = -1 + random(3);
            partrot[4] = -67 + random(3);
            partrot[5] = -45 + random(3);
            partframe[5] = 2;
            partrot[6] = 127 + random(3);
            partrot[7] = -43 + random(3);
        }
        if (i == 5)
        {
            if (partmode >= 15 && partmode <= 18)
            {
                if (partmode == 15)
                {
                    partframe[5] = 2;
                    headsize = lerp(headsize, 0.5, 0.25);
                }
                if (partmode == 16)
                {
                    partframe[5] = 2;
                    headsize = lerp(headsize, 1, 0.25);
                }
                if (partmode == 17)
                {
                    partframe[5] = 2;
                    headsize = lerp(headsize, 1.5, 0.25);
                    partrot[5] += random(20);
                }
            }
            else
            {
                headsize = lerp(headsize, 0, 0.25);
            }
        }
    }
    if (partmode >= 21 && partmode <= 30)
    {
        if (partmode == 21 || partmode == 23 || partmode == 24 || partmode == 25)
        {
            partsiner[i] += 0.1;
            partx[i] = lerp(partx[i], 0, 0.5);
            party[i] = lerp(party[i], 0, 0.5);
            idealrot[i] = sin(partsiner[i] + (i / 8)) * 20;
            idealrot[1] = sin(partsiner[2]) * 60;
            idealrot[2] = sin(partsiner[2] - 0.1) * 60;
            idealrot[3] = -sin(partsiner[2] + 0.3) * 60;
            idealrot[6] = -sin(partsiner[2] + 0.1) * 60;
            partframe[5] = 1;
            partrot[i] = lerp(partrot[i], idealrot[i], 0.5);
            partrot[5] += 2;
            if (i == 5)
            {
                if (partmode == 23)
                {
                    partframe[5] = 2;
                    headsize = lerp(headsize, 0.5, 0.25);
                }
                if (partmode == 24)
                {
                    partframe[5] = 2;
                    headsize = lerp(headsize, 1, 0.25);
                }
                if (partmode == 25)
                {
                    partframe[5] = 2;
                    headsize = lerp(headsize, 1.5, 0.25);
                    partrot[5] = -15;
                    partx[i] = random(2);
                    party[i] = random(2);
                }
            }
        }
        if (partmode == 22)
        {
            partframe[5] = 0;
            partrot[5] = sin(partsiner[0] / 2) * 4;
            partsiner[0] += 0.1;
            if (partsiner[0] >= 5)
            {
                partx[i] = random(2);
                party[i] = random(2);
                if (i == 8)
                {
                    partsiner[0] = 0;
                }
            }
        }
        if (partmode == 27)
        {
            partframe[5] = 1;
            idealrot[i] = 0;
            idealrot[2] = 45;
            partframe[2] = 1;
            partrot[i] = lerp(partrot[i], idealrot[i], 0.5);
        }
    }
    if (partmode >= 30)
    {
        if (scr_debug())
        {
            if (keyboard_check_pressed(ord("D")) && i == 5)
            {
                partmode++;
            }
        }
        if (partmode == 30)
        {
            headsize = 0;
            if (scr_debug())
            {
                if (keyboard_check_pressed(ord("A")) && i == 5)
                {
                    shake_head = 1;
                }
            }
            partsprite[5] = spr_sneo_head_preview;
            if (partframe[5] == 0)
            {
                partframe[5] = 1;
            }
            partsprite[0] = spr_nothing;
            partsiner[i] += 1;
            if (shake_head == 0)
            {
                party[i] = sin(partsiner[i] / 15) * 4;
                idealrot[i] = sin(partsiner[i] / 20) * 4;
            }
            else if (i == 5)
            {
                if (shake_head == 1)
                {
                    partframe[5]++;
                    snd_play(snd_swallow);
                }
                partrot[5] = (sin(shake_head * 2) * 8) + random(4);
                party[5] = random(4);
                partx[5] = random(4);
                shake_head++;
                if (shake_head >= 6)
                {
                    shake_head = 0;
                    partrot[5] = 0;
                }
            }
        }
        if (partmode == 31 && partmode < 34)
        {
            if (i == 5)
            {
                snd_play(snd_weaponpull_fast);
                var _n = 0;
                var eyeshine;
                repeat (5)
                {
                    eyeshine = instance_create((_n * 8) + x + (partx[5] * facing) + (partxoff[5] * facing) + lastxoff, y + party[5] + partyoff[5], obj_afterimage_grow);
                    eyeshine.sprite_index = spr_sneo_head_preview;
                    eyeshine.image_index = 0;
                    eyeshine.image_speed = 0;
                    eyeshine.image_xscale = -2 - (_n / 5);
                    eyeshine.image_yscale = 2 + (_n / 5);
                    eyeshine.xrate = 0;
                    eyeshine.yrate = 0;
                    eyeshine.image_alpha = 1 + _n;
                    _n += 0.2;
                }
                eyeshine.image_angle = partrot[5] * facing;
                eyeshine = scr_dark_marker(x + (partx[5] * facing) + (partxoff[5] * facing) + lastxoff, y + party[5] + partyoff[5], spr_sneo_head_preview);
                eyeshine.image_xscale = -2;
                partmode = 32;
            }
        }
        if (partmode == 33)
        {
            with (obj_marker)
            {
                if (sprite_index == spr_sneo_head_preview)
                {
                    instance_destroy();
                }
            }
            partsprite[0] = spr_sneo_wingl;
            partsprite[1] = spr_sneo_arml;
            partsprite[2] = spr_sneo_legl;
            partsprite[3] = spr_sneo_legr;
            partsprite[4] = spr_sneo_body;
            partsprite[5] = spr_sneo_head;
            partsprite[6] = spr_sneo_armr;
            partsprite[7] = spr_sneo_wingr;
            partframe[5] = 0;
            partmode = 0;
            snd_play(snd_bump);
        }
    }
    if (partmode == 34)
    {
        hearttype = 0;
        if (obj_spamton_neo_enemy.difficulty == 1)
        {
            hearttype = 1;
        }
        if (obj_spamton_neo_enemy.difficulty == 2)
        {
            hearttype = 2;
        }
        if (obj_spamton_neo_enemy.difficulty == 3)
        {
            hearttype = 3;
        }
        if (obj_spamton_neo_enemy.difficulty == 4)
        {
            hearttype = 4;
        }
        var flyx = 0;
        if (heart_release_con == 1)
        {
            flyx = -20;
        }
        if (heart_release_con == 0)
        {
            flyx = 0;
        }
        if (i == 0)
        {
            siner++;
            if (heart_release_con >= 2)
            {
                heart_release_con = 0;
            }
            if (heart_release_con == 0)
            {
                idealx[0] = 0;
                idealx[1] = 0;
                idealx[2] = 0;
                idealx[3] = 0;
                idealx[4] = 0;
                idealx[5] = 0;
                idealx[6] = 0;
                idealx[7] = 0;
                idealrot[0] = 10;
                idealrot[1] = 30;
                idealrot[2] = -50;
                idealrot[3] = -50;
                idealrot[4] = 40;
                idealrot[5] = 60;
                idealrot[6] = -30;
                idealrot[7] = 30;
                if (hearttype > 2 && instance_number(obj_sneo_wireheart) < 3 && makehearttimer < 1 && global.turntimer > 100 && makeheartinit == 1)
                {
                    makehearttimer = 80;
                    makeheart = 1;
                    makehearttype = choose(3, 4);
                    if (makeheartalt != 0)
                    {
                        makehearttype = makeheartalt;
                        makehearttimer = 120;
                    }
                }
            }
            if (heart_release_con == 1)
            {
                idealx[0] = 4;
                idealx[1] = 0;
                idealx[2] = 0;
                idealx[3] = 0;
                idealx[4] = 0;
                idealx[5] = 15;
                idealx[6] = 0;
                idealx[7] = 4;
                idealrot[0] = -40;
                idealrot[1] = 90;
                idealrot[2] = 50;
                idealrot[3] = 50;
                idealrot[4] = -40;
                idealrot[5] = -100;
                idealrot[6] = 30;
                idealrot[7] = -30;
            }
            if (global.turntimer < 20)
            {
                idealx[0] = 0;
                idealx[1] = 0;
                idealx[2] = 0;
                idealx[3] = 0;
                idealx[4] = 0;
                idealx[5] = 0;
                idealx[6] = 0;
                idealx[7] = 0;
                idealrot[0] = 0;
                idealrot[1] = 0;
                idealrot[2] = 0;
                idealrot[3] = 0;
                idealrot[4] = 0;
                idealrot[5] = 0;
                idealrot[6] = 0;
                idealrot[7] = 0;
            }
            if (makehearttimer > 0)
            {
                makehearttimer--;
            }
            if (makeheart)
            {
                if (makeheartinit == 0)
                {
                    makeheartinit = 1;
                    makehearttype = 0;
                }
                if (hearttype == 0)
                {
                    wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                    wireheart.boss = id;
                    wireheart.bossx = x + 10;
                    wireheart.bossy = y + 80;
                    wireheart.type = 0;
                    wireheart.target = 3;
                    wireheart.special = hellmode;
                    if (scr_sideb_get_phase() > 2)
                    {
                        wireheart.target = obj_sneo_bulletcontroller.target;
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                    }
                    else
                    {
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                    }
                }
                else if (hearttype == 1)
                {
                    wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                    wireheart.boss = id;
                    wireheart.bossx = x + 10;
                    wireheart.bossy = y + 80;
                    wireheart.type = 0;
                    wireheart.target = 3;
                    wireheart.special = hellmode;
                    if (scr_sideb_get_phase() > 2)
                    {
                        wireheart.target = obj_sneo_bulletcontroller.target;
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                    }
                    else
                    {
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                    }
                    wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                    wireheart.boss = id;
                    wireheart.bossx = x + 10;
                    wireheart.bossy = y + 80;
                    wireheart.type = 1;
                    wireheart.target = 3;
                    if (scr_sideb_get_phase() > 2)
                    {
                        wireheart.target = obj_sneo_bulletcontroller.target;
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                    }
                    else
                    {
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                    }
                    wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                    wireheart.boss = id;
                    wireheart.bossx = x + 10;
                    wireheart.bossy = y + 80;
                    wireheart.type = 1;
                    wireheart.target = 3;
                    if (scr_sideb_get_phase() > 2)
                    {
                        wireheart.target = obj_sneo_bulletcontroller.target;
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                    }
                    else
                    {
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                    }
                }
                else if (hearttype == 2)
                {
                    wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                    wireheart.boss = id;
                    wireheart.bossx = x + 10;
                    wireheart.bossy = y + 80;
                    wireheart.type = 0;
                    wireheart.bighearttype = 1;
                    wireheart.target = 3;
                    wireheart.special = hellmode;
                    if (scr_sideb_get_phase() > 2)
                    {
                        wireheart.target = obj_sneo_bulletcontroller.target;
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                    }
                    else
                    {
                        wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                    }
                }
                else if (hearttype == 3)
                {
                    if (makehearttype == 0)
                    {
                        wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                        wireheart.boss = id;
                        wireheart.bossx = x + 10;
                        wireheart.bossy = y + 80;
                        wireheart.type = 1;
                        wireheart.target = 3;
                        if (scr_sideb_get_phase() > 2)
                        {
                            wireheart.target = obj_sneo_bulletcontroller.target;
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                        }
                        else
                        {
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                        }
                    }
                    if (makehearttype == 0 || makehearttype == 3)
                    {
                        wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                        wireheart.boss = id;
                        wireheart.bossx = x + 10;
                        wireheart.bossy = y + 80;
                        wireheart.type = 3;
                        wireheart.target = 3;
                        if (scr_sideb_get_phase() > 2)
                        {
                            wireheart.target = obj_sneo_bulletcontroller.target;
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                        }
                        else
                        {
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                        }
                        wireheart.altbiter = 3;
                    }
                    if (makehearttype == 0 || makehearttype == 4)
                    {
                        wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                        wireheart.boss = id;
                        wireheart.bossx = x + 10;
                        wireheart.bossy = y + 80;
                        wireheart.type = 3;
                        wireheart.target = 3;
                        if (scr_sideb_get_phase() > 2)
                        {
                            wireheart.target = obj_sneo_bulletcontroller.target;
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                        }
                        else
                        {
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                        }
                        wireheart.altbiter = 4;
                    }
                }
                else if (hearttype == 4)
                {
                    if (makehearttype == 0)
                    {
                        wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                        wireheart.boss = id;
                        wireheart.bossx = x + 10;
                        wireheart.bossy = y + 80;
                        wireheart.type = 1;
                        wireheart.target = 3;
                        if (scr_sideb_get_phase() > 2)
                        {
                            wireheart.target = obj_sneo_bulletcontroller.target;
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                        }
                        else
                        {
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                        }
                    }
                    if (makehearttype == 0 || makehearttype == 3)
                    {
                        wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                        wireheart.boss = id;
                        wireheart.bossx = x + 10;
                        wireheart.bossy = y + 80;
                        wireheart.type = 4;
                        wireheart.target = 3;
                        if (scr_sideb_get_phase() > 2)
                        {
                            wireheart.target = obj_sneo_bulletcontroller.target;
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                        }
                        else
                        {
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                        }
                    }
                    if (makehearttype == 0 || makehearttype == 4)
                    {
                        wireheart = instance_create(x + 10, y + 80, obj_sneo_wireheart);
                        wireheart.boss = id;
                        wireheart.bossx = x + 10;
                        wireheart.bossy = y + 80;
                        wireheart.type = 4;
                        wireheart.target = 3;
                        if (scr_sideb_get_phase() > 2)
                        {
                            wireheart.target = obj_sneo_bulletcontroller.target;
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.8);
                        }
                        else
                        {
                            wireheart.damage = floor(global.monsterat[obj_spamton_neo_enemy.myself] * 5 * 0.6);
                        }
                    }
                }
                for (var _n = 0; _n < 6; _n++)
                {
                    var shard = instance_create(x + 10, y + 80, obj_afterimage);
                    shard.sprite_index = spr_bullet_laser_circle;
                    shard.speed = 10 + random(2);
                    shard.direction = 140 + random_range(-40, 40);
                    shard.gravity = 1;
                    shard.image_xscale = 0.5 + random(0.5);
                    shard.image_yscale = shard.image_xscale;
                }
                makeheart = 0;
            }
        }
        if (global.turntimer < 20)
        {
            partrot[i] = lerp(partrot[i], 0, 0.14 * f);
            partx[i] = lerp(partx[i], 0, 0.1 * f);
            party[i] = lerp(0, party[i], 0.06 * f);
            heartattackoffsetx = lerp(heartattackoffsetx, 0, 0.06 * f);
            x = lerp(x, xstart, 0.1);
        }
        else
        {
            partrot[i] = lerp(partrot[i], idealrot[i] + random(4), 0.14 * f);
            partx[i] = lerp(partx[i] + flyx, idealx[i], 0.1 * f);
            party[i] = lerp(party[i], 0, 0.06 * f);
            if (heart_release_con == 0)
            {
                heartattackoffsetx = lerp(heartattackoffsetx, -10, 0.01 * f);
            }
            if (heart_release_con == 1)
            {
                heartattackoffsetx = lerp(heartattackoffsetx, -60, 0.01 * f);
            }
            x = lerp(x, xstart + 60, 0.1);
        }
    }
    if (partmode == 35)
    {
        var flyx = 0;
        if (dance_con == 1)
        {
            flyx = 0;
        }
        if (dance_con == 0)
        {
            flyx = 0;
        }
        if (i == 0)
        {
            siner += 1.3;
            dance_timer++;
            if (dance_timer > 9)
            {
                dance_timer = 0;
                dance_con++;
            }
            if (dance_con >= 2)
            {
                dance_con = 0;
            }
            if (dance_con == 0)
            {
                idealx[0] = 0;
                idealx[1] = 0;
                idealx[2] = 0;
                idealx[3] = 0;
                idealx[4] = 0;
                idealx[5] = 0;
                idealx[6] = 0;
                idealx[7] = 0;
                idealrot[0] = -20;
                idealrot[1] = -120;
                idealrot[2] = -30;
                idealrot[3] = 30;
                idealrot[4] = 0;
                idealrot[5] = 0;
                idealrot[6] = -230;
                idealrot[7] = 0;
            }
            if (dance_con == 1)
            {
                idealx[0] = 4;
                idealx[1] = 0;
                idealx[2] = 0;
                idealx[3] = 0;
                idealx[4] = 0;
                idealx[5] = 15;
                idealx[6] = 0;
                idealx[7] = 4;
                idealrot[0] = -20;
                idealrot[1] = -250;
                idealrot[2] = 30;
                idealrot[3] = -30;
                idealrot[4] = 0;
                idealrot[5] = 0;
                idealrot[6] = -120;
                idealrot[7] = -30;
            }
        }
        partrot[i] = lerp(partrot[i], idealrot[i] + random(4), 0.14 * f);
        partx[i] = lerp(partx[i] + flyx, idealx[i], 0.1 * f);
        party[i] = lerp(party[i], 0, 0.06 * f);
        if (i == 5)
        {
            partx[i] = lerp(partx[i], 0, 0.25 * f);
            party[i] = lerp(party[i], 0, 0.25 * f);
            partrot[i] -= 10 * f;
            if (partmode == 5)
            {
                partrot[i] /= 2;
                partrot[i] += 10 * f;
                partframe[i] = 1;
            }
            else if (partmode == 6)
            {
                partrot[i] /= 2;
                if (partmode > 6 || partrot[1] <= -120)
                {
                    partframe[i] = 0;
                }
            }
            else if (partmode == 11)
            {
                partframe[i] += 0.2 * f;
            }
            else if (partmode == 12)
            {
                partframe[i] += 0.3 * f;
            }
            else
            {
                partframe[i] += 0.05 * f;
            }
            if (partframe[i] >= 3)
            {
                partframe[i] = 0;
            }
            if (partframe[i] >= 2)
            {
                partrot[i] += 20 * f;
            }
        }
        y = ystart + (sin(siner / 6) * 30);
        x = lerp(x, xstart + 60, 0.1);
    }
    if (partmode == 36)
    {
        var fastshot = 1;
        if (shootydanceinit == 0)
        {
            shootydanceinit = 1;
            shootydancex = x;
            shootydancey = y;
        }
        if (endcon > 0)
        {
            if (dancealtcon == 1)
            {
                siner += 0.23;
            }
            if (dancealtcon == 2)
            {
                siner += 0.23;
            }
            x = xstart + (sin(siner / 20) * 10);
            y = ystart + (sin(siner / 6) * 20);
        }
        else
        {
            x = shootydancex + (sin(siner / 20) * 10);
            y = shootydancey + (sin(siner / 6) * 20);
        }
        armendx = x + partx[1] + partxoff[1] + lengthdir_x(armlength, partrot[1] - 93);
        armendy = y + party[1] + partyoff[1] + lengthdir_y(armlength, partrot[1] - 93);
        if (dance_timer == 0)
        {
            if (i_ex(obj_heart))
            {
                armangle = point_direction(partxoff[1], partyoff[1], obj_heart.x, obj_heart.y);
            }
            idealrot[5] = -15;
        }
        if (i != 1 || endcon > 0)
        {
            partsiner[i] += 0.1;
            partx[i] = lerp(partx[i], 0, 0.5);
            party[i] = lerp(party[i], 0, 0.5);
            idealrot[i] = sin(partsiner[i] + (i / 8)) * 20;
            idealrot[1] = sin(partsiner[2]) * 60;
            idealrot[2] = sin(partsiner[2] - 0.1) * 60;
            idealrot[3] = -sin(partsiner[2] + 0.3) * 60;
            idealrot[6] = -sin(partsiner[2] + 0.1) * 60;
            partrot[5] = -15 - (abs(sin(head_recoil_amount / 60)) * 150);
            partframe[5] = 2;
            head_recoil_amount = lerp(head_recoil_amount, 0, 0.03);
            partrot[i] = lerp(partrot[i], idealrot[i], 0.5);
        }
        if (i == 0 && endcon == 0)
        {
            siner += 1.3;
            dance_timer++;
            if (dance_timer == (17 - (fastshot * 10)) || dance_timer == (52 - (fastshot * 10)))
            {
                d = instance_create(x, y, obj_sneo_biglaser);
                d.depth += 1;
                d._type = 1;
                chargeshot_sound = snd_loop(snd_chargeshot_charge);
                chargesfxtimer = 1;
            }
            if (dance_timer == (42 - (fastshot * 10)))
            {
                with (obj_sneo_biglaser)
                {
                    instance_destroy();
                }
                shot = instance_create(armendx, armendy, obj_spamtonshot);
                shot.target = mytarget;
                shot.damage = damage;
                armaim += 360;
                head_recoil_amount = -170;
                snd_stop(chargeshot_sound);
                snd_play_x(snd_chargeshot_fire, 0.6, 0.5);
            }
            if (dance_timer == (84 - (fastshot * 20)))
            {
                with (obj_sneo_biglaser)
                {
                    instance_destroy();
                }
                shot = instance_create(armendx, armendy, obj_spamtonshot);
                shot.target = mytarget;
                shot.damage = damage;
                armaim -= 360;
                head_recoil_amount = -170;
                snd_stop(chargeshot_sound);
                snd_play_x(snd_chargeshot_fire, 0.6, 0.5);
            }
            if (dance_timer == (85 - (fastshot * 20)))
            {
                dance_timer = 3;
            }
            if (chargesfxtimer == 1)
            {
                chargepitch = 0.1;
                snd_pitch(chargeshot_sound, chargepitch);
                snd_volume(chargeshot_sound, 0, 0);
                snd_volume(chargeshot_sound, 0.8, 20);
            }
            if (chargesfxtimer > 0 && chargesfxtimer <= 30)
            {
                chargesfxtimer++;
                chargepitch += 0.03;
                snd_pitch(chargeshot_sound, chargepitch);
            }
        }
        if (i == 1 && endcon == 0)
        {
            var shakebuster = 0;
            if (instance_exists(obj_sneo_biglaser))
            {
                shakebuster = -4 + random(8);
            }
            partrot[i] = lerp(partrot[i], armaim, 0.12) + shakebuster;
            partframe[i] = 1;
            with (obj_sneo_biglaser)
            {
                x = obj_spamton_neo_enemy.armendx;
                y = obj_spamton_neo_enemy.armendy;
            }
        }
    }
    if (partmode == 40)
    {
        if (i == 0 && dontchangepose == 0)
        {
            shocktimer++;
        }
        partsiner[i] += (1 + (i / 5)) * f;
        partx[i] = sin((partsiner[i] / 2) * f);
        party[i] = cos((partsiner[i] / 2) * f);
        if ((shockthreshold <= 5 && hurttimer2 == 0 && i == 0) || (smokethreshold > 1 && i == 0))
        {
            smoketimer++;
            if (smoketimer >= smokethreshold)
            {
                var smokey = instance_create(x + 50, y + 80, obj_afterimage_grow);
                smokey.visible = 0;
                with (smokey)
                {
                    scr_script_delayed(scr_var, 1, "visible", 1);
                }
                smokey.depth = depth + 10;
                smokey.image_alpha = 2.5;
                smokey.sprite_index = spr_cakesmoke;
                smokey.hspeed = random_range(2, 8);
                smokey.gravity = -0.5;
                smokey.friction = 0.2;
                smokey.vspeed = random_range(-1, -2);
                smoketimer = 0;
            }
        }
        if (shockthreshold <= 8 && hurttimer2 == 0 && global.flag[8] == 0)
        {
            fsiner = partsiner[i] / 8;
            flash = 1;
        }
        if (global.flag[8] == 1)
        {
            shockthreshold = clamp(shockthreshold, 5, 100);
        }
        if (shocktimer >= shockthreshold)
        {
            partrot[i] = 60 - random(120);
            if (i == 4)
            {
                partrot[i] = 40 - random(80);
            }
            if (i == 5)
            {
                partframe[i] += 1 * f;
                if (partframe[i] >= 3)
                {
                    partframe[i] = 0;
                }
            }
            if (i == 7)
            {
                shocktimer = 0;
            }
        }
    }
    if (i == 0)
    {
        if (keyboard_check_released(ord("O")) && scr_debug())
        {
            partmode = 43;
            y = ystart;
            fakegrav = 0;
            for (i = 0; i < 7; i++)
            {
                partrot[i] = 0;
            }
        }
    }
    if (partmode == 41)
    {
        if (i == 0)
        {
            laughtimer++;
        }
        if (i == 5)
        {
            if (laughtimer == 1)
            {
                snd_play(snd_sneo_laugh_long);
            }
            if (laughtimer >= 1 && laughtimer < 30)
            {
                headsize = 0;
                partframe[i] = 0;
                headsize = random(0.25);
                partrot[i] = 30 + random(10);
            }
            if (laughtimer >= 30 && laughtimer < 48)
            {
                partframe[i] = 1;
                headsize = random(0.25);
                partrot[i] = -40 + random(10);
            }
            if (laughtimer >= 48 && laughtimer < 60)
            {
                partframe[i] = 2;
                headsize = random(0.25);
                partrot[i] = 30;
            }
            if (laughtimer >= 60)
            {
                partframe[i] = 3;
                headsize = random(0.25);
                partrot[i] = -70 + random(10);
            }
            if (laughtimer >= 80)
            {
                headsize = 0;
            }
            if (partframe[i] >= 3)
            {
                partframe[i] = 0;
            }
        }
        partsiner[i] += (1 + (i / 5)) * f;
        partx[i] = sin((partsiner[i] / 2) * f);
        party[i] = cos((partsiner[i] / 2) * f);
        if (global.flag[8] == 1)
        {
            shockthreshold = clamp(shockthreshold, 5, 100);
        }
    }
    if (partmode == 42)
    {
        partsiner[i] = 0;
        partframe[i] = 0;
        partframe[5] = 7;
        if (i == 0)
        {
            var fallen = 0;
            if (y < (cameray() + 130))
            {
                fakegrav += 1;
                y += fakegrav;
            }
            else
            {
                fallen = 1;
            }
            if (fallen == 1)
            {
                if (y < (cameray() + 216))
                {
                    partrot[2] = lerp(partrot[2], -90, 0.1);
                    partrot[3] = lerp(partrot[3], 90, 0.1);
                    partrot[5] = y - (cameray() + 120);
                    if (y > ((cameray() + 216) - 30))
                    {
                        partrot[1] = lerp(partrot[1], -30, 0.1);
                        partrot[6] = lerp(partrot[6], 30, 0.1);
                    }
                    y = lerp(y, cameray() + 216, 0.1);
                }
            }
            if (fallen == 0)
            {
                if (i == 5)
                {
                    partrot[i] = lerp(partrot[i], 30, 0.25 * f);
                    partx[i] = lerp(partx[i], -10, 0.25 * f);
                    party[i] = lerp(party[i], 10, 0.25 * f);
                    if (dead == 1)
                    {
                        partframe[i] = 3;
                    }
                }
                else
                {
                    partrot[i] = lerp(partrot[i], 0, 0.25 * f);
                    partx[i] = lerp(partx[i], 0, 0.25 * f);
                    party[i] = lerp(party[i], 0, 0.25 * f);
                    if (abs(partrot[i]) < 1)
                    {
                        partrot[i] = 0;
                    }
                    if (abs(partx[i]) < 1)
                    {
                        partx[i] = 0;
                    }
                    if (abs(party[i]) < 1)
                    {
                        party[i] = 0;
                    }
                }
            }
        }
    }
    if (partmode == 43 && i == 0)
    {
        var fallen = 0;
        falltimer++;
        if (y < (cameray() + 200))
        {
            fallshake = 10;
            fakegrav += (0.5 + (fakegrav / 10));
            fakegrav = clamp(fakegrav, 0, 16.5);
            y += fakegrav;
        }
        else
        {
            fallen = 1;
        }
        partframe[5] = 7;
        partrot[1] = -fakegrav * 6;
        partx[1] = fakegrav * 2;
        party[1] = fakegrav * 1.5;
        partrot[6] = -fakegrav * 6;
        partx[6] = fakegrav * 0.6;
        party[6] = fakegrav * 2;
        partrot[2] = -fakegrav * 6;
        partx[2] = -fakegrav * 1.6;
        party[2] = -fakegrav * 0.65;
        partrot[3] = -fakegrav * 6;
        partx[3] = -fakegrav * 2.5;
        party[3] = -fakegrav * 0.15;
        partrot[4] = -fakegrav * 6.25;
        partx[4] = fakegrav * 2;
        party[4] = fakegrav / 1.5;
        partrot[5] = -fakegrav * 8;
        partx[5] = fakegrav * 1.8;
        party[5] = fakegrav * 2;
        partrot[0] = -fakegrav * 4;
        party[0] = fakegrav * 3;
        partrot[7] = -fakegrav * 4;
        party[7] = fakegrav * 3;
        if (fallen != 0)
        {
            if (fallshake == 10)
            {
                snd_play(snd_closet_impact);
            }
            for (var ii = 0; ii < 7; ii++)
            {
                party[ii] += random_range(-fallshake, fallshake);
                partx[ii] += random_range(-fallshake, fallshake);
            }
            if (fallshake > 0)
            {
                fallshake--;
            }
        }
    }
    scalebonus = 0;
    if (i == 5)
    {
        scalebonus = headsize;
    }
    if (shadow_amount >= 0)
    {
        partblend[i] = merge_color(c_white, c_black, shadow_amount);
    }
    if (facing == -1)
    {
        lastxoff = 110;
    }
    else
    {
        lastxoff = 0;
    }
    if (instance_exists(obj_dbulletcontroller))
    {
        partframe[5] = 3;
        partblend[5] = blend;
    }
    else if (partblend[5] == blend)
    {
        partblend[5] = 16777215;
    }
    var shakevar = 0;
    if (i == 0)
    {
        if (hurttimer2 > 0)
        {
            hurttimer2--;
        }
        if (hurttimer2 == 1)
        {
            if (endcon == 0)
            {
                shockthreshold = 10;
                partmode = 1;
            }
            if ((didwejustdie == 0 && i_ex(obj_battlecontroller) && global.monsterhp[global.chartarget[myself]] <= 0) || (didwejustdie == 0 && i_ex(obj_battlecontroller) && global.monsterhp[myself] <= (global.monstermaxhp[myself] * 0.1) && scr_sideb_get_phase() > 2 && weirdpathendcon == 0))
            {
                partmode = 99;
                dontchangepose = 1;
            }
        }
    }
    if (hurttimer2 > 0)
    {
        shakevar = (random(hurttimer2) / 2) - (hurttimer2 / 4);
    }
    if (headendcon == 1)
    {
        partrot[5] = -37 + sin(partsiner[4] / 16);
        partframe[5] = 1;
        partsprite[5] = spr_sneo_head;
    }
    if (headendcon == 2)
    {
        partrot[5] = 15 + sin(partsiner[4] / 16);
        partsprite[5] = spr_sneo_head_sad;
    }
    if (headendcon == 3)
    {
        partsprite[5] = spr_sneo_head;
    }
    if (instance_exists(obj_pipis_destroy_fx) && i == 5)
    {
        partrot[5] -= random(60);
    }
    if (headforceframe != -1 && i == 5)
    {
        partframe[5] = headforceframe;
    }
    if (funnycheat > 5)
    {
        if (funnycheattimer < 28)
        {
            funnycheattimer += 0.125;
        }
        partblend[5] = merge_color(c_white, c_red, funnycheattimer / 30);
        if (funnycheattimer == 24)
        {
            snd_play(snd_carhonk);
            funnycheattimer3++;
        }
        if (funnycheattimer3 > 0 && funnycheattimer3 < 33 && i == 5)
        {
            funnycheattimer3++;
            if (funnycheattimer3 > 0 && funnycheattimer3 < 6)
            {
                headexpand = lerp(headexpand, 2, funnycheattimer3 / 6);
            }
            if (funnycheattimer3 >= 8 && funnycheattimer3 < 16)
            {
                headexpand = lerp(headexpand, 0, (funnycheattimer3 - 8) / 8);
            }
            if (funnycheattimer3 >= 16 && funnycheattimer3 < 22)
            {
                headexpand = lerp(headexpand, 2, (funnycheattimer3 - 16) / 6);
            }
            if (funnycheattimer3 >= 24 && funnycheattimer3 < 32)
            {
                headexpand = lerp(headexpand, 0, (funnycheattimer3 - 24) / 8);
            }
            if ((funnycheattimer3 >= 4 && funnycheattimer3 <= 10) || (funnycheattimer3 >= 20 && funnycheattimer3 <= 26))
            {
                shakevar = -12 + random(24);
            }
        }
        funnycheattimer2++;
        if (funnycheattimer2 >= 10 && image_alpha > 0.6)
        {
            var smokey = instance_create(x + 50, y + 80, obj_afterimage_grow);
            smokey.visible = 0;
            with (smokey)
            {
                scr_script_delayed(scr_var, 1, "visible", 1);
            }
            smokey.depth = depth + 10;
            smokey.image_alpha = 2.5;
            smokey.sprite_index = spr_cakesmoke;
            smokey.hspeed = random_range(2, 8);
            smokey.gravity = -0.5;
            smokey.friction = 0.2;
            smokey.vspeed = random_range(-1, -2);
            funnycheattimer2 = 0;
        }
    }
    var expand = 0;
    if (i == 5)
    {
        expand = headexpand;
    }
    draw_monster_body_part_ext(partsprite[i], partframe[i], x + (partx[i] * facing) + (partxoff[i] * facing) + lastxoff + shakevar, (y + party[i] + partyoff[i]) - shakevar, ((2 + scalebonus) * facing) + expand, 2 + scalebonus + expand, partrot[i] * facing, partblend[i], image_alpha);
    if (violentendflash > 0)
    {
        d3d_set_fog(true, c_white, 0, 1);
        draw_monster_body_part_ext(partsprite[i], partframe[i], x + (partx[i] * facing) + (partxoff[i] * facing) + lastxoff + shakevar, (y + party[i] + partyoff[i]) - shakevar, (2 + scalebonus) * facing, 2 + scalebonus, partrot[i] * facing, partblend[i], violentendflash / 10);
        d3d_set_fog(false, c_black, 0, 0);
    }
}
if (shocker < 0)
{
    shocker = shocker_threshold;
    if (shocker_threshold > 2)
    {
        shocker_threshold -= (0.25 * f);
    }
}
if (partmode == 13)
{
    partframe[1] = 1;
    armendx = x + (partx[1] * facing) + (partxoff[1] * facing) + (lengthdir_x(armlength, partrot[1] - 93) * facing) + 15;
    armendy = y + party[1] + partyoff[1] + lengthdir_y(armlength, partrot[1] - 93);
    partframe[5] = (partsiner[5] / 6) % 3;
    draw_set_color(c_white);
    draw_circle(armendx + 120, armendy + 6, 13 + (sin(partrot[0] / 2) * 12), false);
}
draw_set_color(c_red);
headx = x + partx[5] + partxoff[5];
heady = y + party[5] + partyoff[5];
hitdetector.x = headx;
hitdetector.y = heady;
hitdetector.image_angle = partrot[5];
hitdetector.image_index = partframe[5];
if (hitcon == 1 || hitcon == -1)
{
    partblend[5] = 4235519;
    hitcontimer = 0;
    if (headhit < 20)
    {
        headhit += 6;
    }
    hitcon = 2;
}
if (hitcon == 2)
{
    hitcontimer += (1 * f);
    if (hitcontimer >= 5)
    {
        partblend[5] = merge_color(partblend[5], c_white, 0.15 * f);
    }
    if (hitcontimer >= 15)
    {
        hitcontimer = 0;
        hitcon = 0;
        partblend[5] = 16777215;
    }
}
if (scr_debug())
{
}
if (violentendflash > 0)
{
    violentendflash++;
}
if (becomeflash == 0)
{
    flash = 0;
}
becomeflash = 0;
`,Other_10:`if ((global.mercymod[myself] > 25 && phase == 1) || (global.monsterhp[myself] < (global.monstermaxhp[myself] * 0.75) && phase == 1))
{
    phase = 2;
}
if ((global.mercymod[myself] > 50 && phase == 2) || (global.monsterhp[myself] < (global.monstermaxhp[myself] * 0.5) && phase == 2))
{
    phase = 3;
}
if ((global.mercymod[myself] > 70 && phase == 3) || (global.monsterhp[myself] < (global.monstermaxhp[myself] * 0.3) && phase == 3))
{
    phaseturn = 0;
    phase = 4;
}
turn++;
phaseturn++;
if (phaseturn == 1)
{
    rr = 0;
    difficulty = 1;
}
if (phaseturn == 2)
{
    rr = 6;
    difficulty = 0;
}
if (phaseturn == 3)
{
    rr = 2;
    difficulty = 0;
}
if (phaseturn == 4)
{
    rr = 8;
    difficulty = 0;
}
if (phaseturn == 5)
{
    rr = 8.5;
    difficulty = 0;
    if (hellmode == 1)
    {
        difficulty = 2;
    }
}
if (phaseturn == 6)
{
    rr = 7;
    difficulty = 0;
}
if (phaseturn == 7)
{
    rr = 2;
    difficulty = 2;
}
if (phaseturn == 8)
{
    rr = 0;
    difficulty = 3;
}
if (phaseturn == 9)
{
    rr = 7;
    difficulty = 0;
}
if (phaseturn == 10)
{
    rr = 8.5;
    difficulty = 2;
    if (nothitduringphonehands == 1 || hellmode == 1)
    {
        rr = 8.5;
        difficulty = 1;
    }
}
if (phaseturn == 11)
{
    rr = 8;
    difficulty = 1;
}
if (phaseturn == 12)
{
    rr = 6;
    difficulty = 1;
    phaseturn = 7;
}
if (phase == 4)
{
    if (phaseturn == 1)
    {
        rr = 2;
        difficulty = 1;
    }
    if (phaseturn == 2)
    {
        rr = 8;
        difficulty = 3;
    }
    if (phaseturn == 3)
    {
        rr = 9;
        difficulty = 0;
        haveusedfinalattack = 1;
    }
    if (phaseturn == 4)
    {
        rr = 2;
        difficulty = 1;
    }
    if (phaseturn == 5)
    {
        rr = 7;
        difficulty = 0;
    }
    if (phaseturn == 6)
    {
        rr = 9;
        difficulty = 0;
        phaseturn = 3;
    }
}
if ((global.monsterhp[myself] < (global.monstermaxhp[myself] * 0.1) && haveusedfinalattack == 0) || (global.mercymod[myself] > 90 && haveusedfinalattack == 0))
{
    rr = 9;
    difficulty = 0;
    haveusedfinalattack = 1;
    phaseturn = 3;
}
if (weirdpathendcon > 0)
{
    rr = 5;
}
`,Other_11:`global.canact[myself][0] = 1;
global.actactor[myself][0] = 1;
global.actname[myself][0] = stringsetloc("", "obj_spamton_neo_enemy_slash_Other_11_gml_7_0");
global.actdesc[myself][0] = "";
global.actcost[myself][0] = 0;
global.canact[myself][1] = 0;
global.actactor[myself][1] = 0;
global.actname[myself][1] = "";
global.actdesc[myself][1] = "";
global.actcost[myself][1] = 0;
global.canact[myself][2] = 0;
global.actactor[myself][2] = 0;
global.actname[myself][2] = "";
global.actdesc[myself][2] = "";
global.actcost[myself][2] = 0;
scr_spellmenu_setup();
`,Other_12:`if (global.inv < 0)
{
    remdamage = damage;
    _temptarget = target;
    for (ti = 0; ti < 3; ti += 1)
    {
        global.inv = -1;
        if (global.hp[global.char[ti]] > (global.maxhp[global.char[ti]] * 0.5))
        {
            damage = floor(global.hp[global.char[ti]] / 5);
        }
        else if (global.hp[global.char[ti]] >= (global.maxhp[global.char[ti]] * 0.15))
        {
            damage = floor(global.hp[global.char[ti]] / 10);
        }
        else if (global.hp[global.char[ti]] < (global.maxhp[global.char[ti]] * 0.15))
        {
            damage = floor(global.hp[global.char[ti]] / 20);
        }
        target = ti;
        if (global.hp[global.char[ti]] > 0 && global.char[ti] != 0)
        {
            scr_damage_sneo_final_attack();
        }
    }
    global.inv = global.invc * 40;
    target = _temptarget;
}
`,Other_13:`global.monstergold[3] += global.monstergold[myself];
global.monsterexp[3] += global.monsterexp[myself];
if (global.flag[51 + myself] == 0)
{
    global.flag[51 + myself] = 2;
    if (global.monsterhp[myself] <= 0)
    {
        global.flag[51 + myself] = 1;
    }
}
if (global.flag[51 + myself] == 1)
{
    global.flag[40] += 1;
    if (fatal == 1)
    {
        global.flag[44]++;
    }
}
if (global.flag[51 + myself] == 2)
{
    global.flag[41] += 1;
}
if (global.flag[51 + myself] == 3)
{
    global.flag[42] += 1;
}
if (global.flag[51 + myself] == 5)
{
    global.flag[43] += 1;
}
if (global.flag[51 + myself] == 6)
{
    global.flag[45] += 1;
    global.monstergold[3] += 24;
}
_amt_add = 0;
_frozened = 0;
_violenced = 0;
_spared = 0;
_pacified = 0;
for (d_i = 0; d_i < 3; d_i += 1)
{
    if (global.flag[51 + d_i] != 0)
    {
        _amt_add += 1;
    }
    if (global.flag[51 + d_i] == 1)
    {
        _violenced += 1;
    }
    if (global.flag[51 + d_i] == 2)
    {
        _spared += 1;
    }
    if (global.flag[51 + d_i] == 3)
    {
        _pacified += 1;
    }
    if (global.flag[51 + d_i] == 6)
    {
        _frozened += 1;
    }
}
if (_frozened > 0)
{
    global.flag[50] = 6;
}
if (_pacified > 0)
{
    global.flag[50] = 3;
}
if (_spared > 0)
{
    global.flag[50] = 2;
}
if (_violenced > 0)
{
    global.flag[50] = 1;
}
if (global.flag[50] == 6)
{
    global.flag[926]++;
}
if (global.flag[54] != 0)
{
    global.flag[global.flag[54]] = global.flag[50];
    global.flag[54] = 0;
}
`,Other_14:`funnycheat += 1;
if (funnycheat > 5)
{
    if (global.tempflag[37] < 2)
    {
        if (global.monsterat[myself] < 26)
        {
            global.monsterat[myself] += 0.5;
        }
        else
        {
            global.monsterat[myself] = 26;
        }
        hellmode = 1;
    }
    else if (global.tempflag[37] < 4)
    {
        if (global.monsterat[myself] < 22)
        {
            global.monsterat[myself] += 0.25;
        }
        else
        {
            global.monsterat[myself] = 22;
        }
        hellmode = 1;
    }
    else if (global.tempflag[37] < 6)
    {
        if (global.monsterat[myself] < 18)
        {
            global.monsterat[myself] += 0.1;
        }
        else
        {
            global.monsterat[myself] = 18;
        }
    }
    else if (global.tempflag[37] < 10)
    {
        if (global.monsterat[myself] < 15)
        {
            global.monsterat[myself] += 0.04;
        }
        else
        {
            global.monsterat[myself] = 15;
        }
    }
    else if (global.tempflag[37] >= 10)
    {
    }
}
`,Other_22:`global.monsterx[myself] = x + (sprite_width / 3);
global.monstery[myself] = y + (sprite_height / 2);
scr_monstersetup();
`,Step_0:`if (bigshot == 1)
{
    global.sp = 5;
}
if (cantspareinit == 0 && scr_sideb_get_phase() > 2 && i_ex(obj_battlecontroller))
{
    obj_battlecontroller.cantspare[0] = 1;
    cantspareinit = 1;
}
if (scr_sideb_get_phase() > 2)
{
    global.mercymod[myself] = 0;
}
if (global.fighting == 1)
{
    if (global.monster[myself] == 1)
    {
        if ((scr_isphase("enemytalk") && talked == 0 && global.monsterhp[myself] <= 0 && scr_sideb_get_phase() <= 2) || (endcon == 1 && scr_sideb_get_phase() <= 2))
        {
            talked = -1;
            endcon = 1;
        }
        if (global.monsterhp[myself] <= 1 && scr_sideb_get_phase() > 2)
        {
            global.monsterhp[myself] = 1;
        }
        if ((scr_isphase("enemytalk") && global.monsterhp[myself] <= (global.monstermaxhp[myself] * 0.1) && scr_sideb_get_phase() > 2 && weirdpathendcon == 0) || (talked == -1 && weirdpathendcon == 0 && scr_sideb_get_phase() > 2))
        {
            weirdpathendtimer++;
            if (weirdpathendtimer == 1)
            {
                talked = -1;
                partmode = 99;
                mus_volume(global.batmusic[1], 0, 30);
            }
            if (weirdpathendtimer == 91)
            {
                talked = 0;
                weirdpathendcon = 1;
            }
        }
        if (scr_isphase("enemytalk") && talked == 0)
        {
            scr_randomtarget();
            if (!instance_exists(obj_darkener))
            {
                instance_create(0, 0, obj_darkener);
            }
            if (scr_isphase("enemytalk") && talked == 0 && turn > 14 && weirdpathendcon == 0)
            {
                if (global.monsterdf[myself] > -10)
                {
                    global.monsterdf[myself] -= 3;
                }
            }
            ballooncon = 0;
            balloonsubcon = 0;
            balloonend = 1;
            talkedcon = 0;
            statustextupdate = 0;
            with (obj_sneo_susie_act)
            {
                turnsleft -= 1;
            }
            global.typer = 72;
            rr = -1;
            event_user(0);
            if (attackdebug >= 0)
            {
                rr = attackdebug;
            }
            if (difficultydebug >= 0)
            {
                difficulty = difficultydebug;
            }
            var final = haveusedfinalattack;
            var weirdside = 0;
            if (scr_sideb_get_phase() > 2)
            {
                weirdside = 1;
            }
            if (scr_sideb_get_phase() > 2 && weirdpathendcon > 0)
            {
                if (weirdpathendcon == 1)
                {
                    msgsetloc(0, "MY ESTEEM CUSTOMER I&SEE YOU ARE ATTEMPTING&TO DEPLETE MY HP!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_86_0_b");
                    ballooncon = 28;
                    balloonend = 0;
                    weirdpathendcon = 2;
                }
                else if (usedact == 0)
                {
                    msgsetloc(0, "ENJOY THE FIREWORKS,&KID!!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_87_0_b");
                    ballooncon = 0;
                    balloonend = 1;
                    weirdpathendcon = 2;
                }
                else if (savemeactcon == 2)
                {
                    msgsetloc(0, "WHAT!? YOU'RE&CALLING FRIENDS!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_88_0");
                    ballooncon = 35;
                    balloonend = 0;
                    weirdpathendcon = 3;
                }
                else if (savemeactcon == 3)
                {
                    msgsetloc(0, "GO AHEAD AND&[Scream] INTO THE&[Receiver]./%", "obj_spamton_neo_enemy_slash_Step_0_gml_89_0");
                    ballooncon = 38;
                    balloonend = 0;
                    weirdpathendcon = 4;
                }
                else if (savemeactcon == 4)
                {
                    msgsetloc(0, "THERE WILL BE NO&MORE [Miracles]&NO MORE [Magic]./%", "obj_spamton_neo_enemy_slash_Step_0_gml_90_0");
                    ballooncon = 41;
                    balloonend = 0;
                    weirdpathendcon = 5;
                }
                else if (savemeactcon == 5)
                {
                    msgsetloc(0, "YOU MAKE ME [Sick]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_91_0");
                    ballooncon = 43;
                    balloonend = 0;
                    weirdpathendcon = 6;
                    shockthreshold = 10;
                    hurttimer2 = 10;
                    partmode = 40;
                }
            }
            else if (weirdside && balloonorder < 10 && !final)
            {
                if (balloonorder == 0)
                {
                    msgsetloc(0, "I REMEMBER WHEN&YOU WERE JUST&A LOST [Little Sponge]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_64_0_c");
                    ballooncon = 16;
                    balloonend = 0;
                }
                else if (balloonorder == 1)
                {
                    msgsetloc(0, "I GAVE YOU&EVERYTHING I HAD!&MY LIFE&ADVICE!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_65_0_b");
                    ballooncon = 17;
                    balloonend = 0;
                }
                else if (balloonorder == 2)
                {
                    msgsetloc(0, "I GAVE YOU MY&[Commemorative Ring]&FOR THE PRICE OF&[My Favorite Year]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_66_0_b");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (balloonorder == 3)
                {
                    msgsetloc(0, "AND THIS IS HOW&YOU [Repay] ME!?&TREATING ME LIKE&[DLC]!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_67_0_b");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (balloonorder == 4)
                {
                    msgsetloc(0, "NO, I GET IT!&IT'S YOU AND&THAT [Hochi Mama]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_68_0_b");
                    ballooncon = 18;
                    balloonend = 0;
                }
                else if (balloonorder == 5)
                {
                    msgsetloc(0, "YOU'VE BEEN&MAKING&[Hyperlink Blocked]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_69_0_c");
                    ballooncon = 19;
                    balloonend = 0;
                }
                else if (balloonorder == 6)
                {
                    msgsetloc(0, "I WAS TOO [Trusting]&TOO [Honest]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_70_0_c");
                    ballooncon = 20;
                    balloonend = 0;
                }
                else if (balloonorder == 7)
                {
                    msgsetloc(0, "I SHOULD HAVE&KNOWN YOU WOULD&HAVE USED MY [Ring]&FOR [Evil].../%", "obj_spamton_neo_enemy_slash_Step_0_gml_71_0_b");
                    ballooncon = 21;
                    balloonend = 0;
                }
                else if (balloonorder == 8)
                {
                    msgsetloc(0, "YOU THINK MAKING&[Frozen Chicken]&WITH YOUR&[Side Chick]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_72_0_b");
                    ballooncon = 22;
                    balloonend = 0;
                }
                else if (balloonorder == 9)
                {
                    msgsetloc(0, "WELL, YOU'RE&[$!$!] RIGHT!&BUT DON'T BLAME&ME/%", "obj_spamton_neo_enemy_slash_Step_0_gml_73_0_b");
                    ballooncon = 23;
                    balloonend = 0;
                }
                balloonorder++;
            }
            else if (rr == 0 && difficulty == 1 && !weirdside && !final)
            {
                msgsetloc(0, "KRIS! ISN'T THIS&[Body] JUST [Heaven]LY!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_56_0");
                ballooncon = 1;
                balloonend = 0;
            }
            else if (rr == 6 && difficulty == 0 && !weirdside && !final)
            {
                msgsetloc(0, "WE'LL TURN THOSE&[Schmoes] AND [Daves]&INTO [Rosen Graves]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_57_0");
                ballooncon = 2;
                balloonend = 0;
            }
            else if (rr == 8 && difficulty == 0 && !weirdside && !final)
            {
                msgsetloc(0, "ALL YOU GOTTA&DO IS [Big]./%", "obj_spamton_neo_enemy_slash_Step_0_gml_58_0_b");
                ballooncon = 3;
                balloonend = 0;
            }
            else if (rr == 2 && difficulty == 0 && !weirdside && !final)
            {
                msgsetloc(0, "KRIS, DON'T YOU&WANNA BE [Part]&OF MY BEAUTIFUL [Heart]?!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_59_0_b");
                ballooncon = 4;
                balloonend = 0;
            }
            else if (rr == 8.5 && difficulty == 0 && !weirdside && !final)
            {
                msgsetloc(0, "IT'S CALLING, KRIS...&MY [Heart]...&MY [Hands].../%", "obj_spamton_neo_enemy_slash_Step_0_gml_60_0");
                ballooncon = 0;
                balloonend = 1;
            }
            else if (rr == 7 && faceattackcount == 0 && !weirdside && !final)
            {
                msgsetloc(0, "KRIS!&CAN YOU REALLY&LOOK IN MY [Eyes]&AND SAY NO!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_61_0");
                ballooncon = 5;
                balloonend = 0;
            }
            else if (rr == 0 && difficulty == 3 && !weirdside && !final)
            {
                msgsetloc(0, "KRIS, I'LL EVEN&GIVE YOU A&[Free Value]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_62_0");
                ballooncon = 6;
                balloonend = 0;
            }
            else if (rr == 2 && difficulty == 2 && !weirdside && !final)
            {
                msgsetloc(0, "I CAN'T STAND IT!!!&I THINK I'M GONNA&HAVE A [HeartAttack]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_63_0_b");
                ballooncon = 0;
                balloonend = 1;
            }
            else if (rr == 8 && difficulty == 1 && !weirdside && !final)
            {
                msgsetloc(0, "DON'T YOU&WANNA HELP YOUR&OLD PAL SPAMTON?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_64_0_b");
                ballooncon = 7;
                balloonend = 0;
            }
            else if (rr == 8.5 && difficulty == 2 && !weirdside && !final)
            {
                msgsetloc(0, "[Friends]!? KRIS!?&WHAT ARE YOU&TALKING ABOUT!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_65_0");
                ballooncon = 8;
                balloonend = 0;
            }
            else if (rr == 7 && faceattackcount == 1 && !weirdside && !final)
            {
                msgsetloc(0, "KRIS. IF YOU GIVE&ME THAT [Soul] I&WILL GIVE YOU&EVERYTHING I HAVE./%", "obj_spamton_neo_enemy_slash_Step_0_gml_66_0");
                ballooncon = 10;
                balloonend = 0;
            }
            else if (rr == 6 && difficulty == 1 && !weirdside && !final)
            {
                msgsetloc(0, "BUT KRIS, IF YOU&REFUSE. THAT'S YOUR&CHOICE. I CAN'T&FORCE YOU./%", "obj_spamton_neo_enemy_slash_Step_0_gml_67_0");
                ballooncon = 11;
                balloonend = 0;
            }
            else if (rr == 2 && difficulty == 1 && !weirdside && !final)
            {
                msgsetloc(0, "KRIS!!! TAKE THE&DEAL!!! TAKE IT!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_69_0_b");
                ballooncon = 12;
                balloonend = 0;
            }
            else if (rr == 8 && difficulty == 3 && !weirdside && !final)
            {
                msgsetloc(0, "OR...&DID YOU WANT&TO BE.../%", "obj_spamton_neo_enemy_slash_Step_0_gml_121_0");
                ballooncon = 13;
                balloonend = 0;
            }
            else if (rr == 9 && finalattackconversationcon == 0 && !weirdside)
            {
                msgsetloc(0, "KRIS...&I WON'T FORCE YOU.&I CAN'T.&I CAN'T FORCE YOU./%", "obj_spamton_neo_enemy_slash_Step_0_gml_93_0");
                ballooncon = 25;
                balloonend = 0;
                finalattackconversationcon = 1;
            }
            else
            {
                var rrr = choose(0, 1, 2, 3);
                if (rrr == 0)
                {
                    if (statustextalt2 == 0)
                    {
                        msgsetloc(0, "CAN A [Little&Sponge] DO THIS?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_86_0");
                        ballooncon = 15;
                        balloonend = 0;
                    }
                    if (statustextalt2 == 1)
                    {
                        msgsetloc(0, "[BreaKing] and&[CracKing]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_87_0");
                        balloonend = 1;
                    }
                    statustextalt2++;
                    if (statustextalt2 > 1)
                    {
                        statustextalt2 = 0;
                    }
                }
                if (rrr == 1)
                {
                    if (statustextalt == 0)
                    {
                        msgsetloc(0, "[The Smooth&Taste Of] NEO/%", "obj_spamton_neo_enemy_slash_Step_0_gml_58_0");
                    }
                    if (statustextalt == 1)
                    {
                        msgsetloc(0, "THE [@$@!] TASTE&OF SPAMTON/%", "obj_spamton_neo_enemy_slash_Step_0_gml_59_0");
                    }
                    statustextalt++;
                    if (statustextalt > 1)
                    {
                        statustextalt = 0;
                    }
                }
                if (rrr == 2)
                {
                    msgsetloc(0, "DON'T YOU&WANNA BE A&BIG SHOT?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_63_0");
                }
                if (rrr == 3)
                {
                    msgsetloc(0, "[Clown]!? NO!!!&I FEEL SICK!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_64_0");
                }
            }
            usedact = 0;
            if (correct_answer != 1)
            {
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
            }
            correct_answer = -1;
            if (ballooncon == 0)
            {
                talked = 1;
                talktimer = 0;
            }
            else
            {
                talked = 0.6;
                talktimer = 0;
            }
        }
        if (talked == 0.6)
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                with (obj_writer)
                {
                    instance_destroy();
                }
                if (ballooncon == 1)
                {
                    msgsetloc(0, "3X THE [Fire]POWER.&2X THE [Water]POWER.&AND BEST OF ALL,&FLYING [Heads]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_136_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 2)
                {
                    msgsetloc(0, "THOSE [Cathode Screens]&INTO [Cathode Screams]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_137_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 3)
                {
                    msgsetloc(0, "THEN WE'LL BE&THE ONES MAKING&THE [Calls], KRIS!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_138_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 4)
                {
                    msgsetloc(0, "OR... DID YOU NEED&A LITTLE&[Specil Tour]?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_139_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 5)
                {
                    msgsetloc(0, "LOOK IN MY [Eyes]&LOOK IN MY [Nose]&LOOK IN MY [Mouth]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_140_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 6)
                {
                    msgsetloc(0, "[Die Now] AND I'LL&THROW IN [50]&[Bullets] FOR FREE!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_141_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 7)
                {
                    msgsetloc(0, "KRIS!! THINK!!&WHAT ARE MY&[Eggs] GOING TO DO!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_142_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 8)
                {
                    msgsetloc(0, "YOU DON'T NEED [Friends]!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_143_0");
                    ballooncon = 9;
                    balloonend = 0;
                }
                else if (ballooncon == 9)
                {
                    msgsetloc(0, "I CAN MAKE MY&HANDS INTO&PHONES!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_144_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 10)
                {
                    msgsetloc(0, "I WILL GIVE YOU&[3 Easy Payments&of $9.99!]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_145_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 11)
                {
                    msgsetloc(0, "I CAN ONLY [Kill]&YOU [50-percent faster&than similar products]&OR [No Money Back!]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_146_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 12)
                {
                    msgsetloc(0, "DO YOU WANNA BE&A [Heart] ON A [Chain]&YOUR WHOLE LIFE!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_147_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 13)
                {
                    msgsetloc(0, "Did you wanna&be.../%", "obj_spamton_neo_enemy_slash_Step_0_gml_163_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 15)
                {
                    msgsetloc(0, "GO [Ga-Ga]&AND [Die]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_173_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 16)
                {
                    msgsetloc(0, "SLEEPING AT&THE BOTTOM OF&A DUMPSTER!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_174_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 17)
                {
                    msgsetloc(0, "I TOLD YOU&[4 Left]&AND ASKED YOU&[Buy] OR [Don't Buy]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_175_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 18)
                {
                    msgsetloc(0, "YOU'VE BEEN&[Making],&HAVEN'T YOU!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_176_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 19)
                {
                    msgsetloc(0, "AND NOW THAT&YOU HAVE YOUR&OWN SUPPLY,&YOU DON'T NEED ME!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_177_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 20)
                {
                    msgsetloc(0, "I'VE ALWAYS BEEN&A MAN OF THE [PIPIS].&A REAL [PIPIS]&PERSON!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_178_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 21)
                {
                    msgsetloc(0, "OH, [Right].&THAT'S WHY I SOLD&IT TO YOU/%", "obj_spamton_neo_enemy_slash_Step_0_gml_179_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 22)
                {
                    msgsetloc(0, "IS GONNA LET&YOU DRINK UP&THAT [Sweet, Sweet]&[Freedom Sauce]?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_180_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 23)
                {
                    msgsetloc(0, "WHEN YOU'RE [Crying]&IN A [Broken Home]&WISHING YOU LET&YOUR OLD PAL&SPAMTON/%", "obj_spamton_neo_enemy_slash_Step_0_gml_181_0");
                    ballooncon = 24;
                    balloonend = 0;
                }
                else if (ballooncon == 24)
                {
                    msgsetloc(0, "[Kill You]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_182_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 25)
                {
                    msgsetloc(0, "BUT JUST LOOK, KRIS.&LOOK AT THE [Power of&NEO] AND ASK YOURSELF.../%", "obj_spamton_neo_enemy_slash_Step_0_gml_207_0");
                    ballooncon = 26;
                    balloonend = 0;
                }
                else if (ballooncon == 26)
                {
                    msgsetloc(0, "WELL, DON'T YOU?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_208_0");
                    ballooncon = 27;
                    balloonend = 0;
                }
                else if (ballooncon == 27)
                {
                    msgsetloc(0, "DON'T YOU WANNA&BE A [Big Shot]!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_209_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 28)
                {
                    msgsetloc(0, "I'LL ADMIT YOU'VE&GOT SOME [Guts]&KID!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_211_0");
                    ballooncon = 29;
                    balloonend = 0;
                }
                else if (ballooncon == 29)
                {
                    msgsetloc(0, "BUT IN A [1 for 1]&BATTLE,  NEO&NEVER LOSES!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_212_0");
                    ballooncon = 30;
                    balloonend = 0;
                }
                else if (ballooncon == 30)
                {
                    msgsetloc(0, "IT'S TIME FOR A&LITTLE [Bluelight Specil]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_213_0");
                    ballooncon = 31;
                    balloonend = 0;
                }
                else if (ballooncon == 31)
                {
                    msgsetloc(0, "* Spamton Neo's ATTACK dropped!&* Spamton Neo's DEFENSE rose greatly!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_214_0");
                    ballooncon = 32;
                    balloonend = 0;
                    specialcon = 1;
                    snd_play(snd_cardrive);
                }
                else if (ballooncon == 32)
                {
                    msgsetloc(0, "DIDN'T YOU KNOW&[Neo] IS FAMOUS FOR&ITS HIGH DEFENSE!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_217_0");
                    ballooncon = 33;
                    balloonend = 0;
                    partmode = 1;
                    snd_free(global.currentsong[1]);
                    global.currentsong[0] = snd_init("spamton_neo_meeting.ogg");
                    global.currentsong[1] = mus_play(global.currentsong[0]);
                    mus_loop(global.currentsong[0]);
                    snd_pitch(global.currentsong[0], 1.8);
                }
                else if (ballooncon == 33)
                {
                    msgsetloc(0, "NOW... ENJ0Y THE&FIR3WORKS, KID!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_225_0");
                    ballooncon = 0;
                    balloonend = 1;
                    savemeactcon = 1;
                    event_user(1);
                }
                else if (ballooncon == 35)
                {
                    msgsetloc(0, "YOU THINK YOU&CAN BEAT ME WITH&YOUR FRIENDS' [Magic]!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_227_0");
                    ballooncon = 36;
                    balloonend = 0;
                }
                else if (ballooncon == 36)
                {
                    msgsetloc(0, "GO AHEAD, [Kid]...&CALL ALL YOU WANT!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_228_0");
                    ballooncon = 37;
                    balloonend = 0;
                }
                else if (ballooncon == 37)
                {
                    msgsetloc(0, "NO ONE WILL&EVER PICK UP/%", "obj_spamton_neo_enemy_slash_Step_0_gml_229_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 38)
                {
                    msgsetloc(0, "THE [Voice] RUNS&OUT EVENTUALLY/%", "obj_spamton_neo_enemy_slash_Step_0_gml_231_0");
                    ballooncon = 39;
                    balloonend = 0;
                }
                else if (ballooncon == 39)
                {
                    msgsetloc(0, "YOUR [Voice]&THEIR [Voice]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_232_0");
                    ballooncon = 40;
                    balloonend = 0;
                }
                else if (ballooncon == 40)
                {
                    msgsetloc(0, "UNTIL YOU REALIZE&YOU ARE ALL ALONE/%", "obj_spamton_neo_enemy_slash_Step_0_gml_233_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 41)
                {
                    msgsetloc(0, "YOU LOST IT WHEN&YOU TRIED TO SEE&TOO FAR..../%", "obj_spamton_neo_enemy_slash_Step_0_gml_235_0");
                    ballooncon = 42;
                    balloonend = 0;
                }
                else if (ballooncon == 42)
                {
                    msgsetloc(0, "... YOU LOST IT.../%", "obj_spamton_neo_enemy_slash_Step_0_gml_236_0");
                    ballooncon = 0;
                    balloonend = 1;
                }
                else if (ballooncon == 43)
                {
                    msgsetloc(0, "MUTTERING YOUR&[Lost Friends] NAMES&AT THE BOTTOM OF&A [Dumpster]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_238_0");
                    ballooncon = 44;
                    balloonend = 0;
                    partmode = 40;
                }
                else if (ballooncon == 44)
                {
                    msgsetloc(0, "NO ONE'S GONNA&HELP YOU!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_239_0");
                    ballooncon = 45;
                    balloonend = 0;
                }
                else if (ballooncon == 45)
                {
                    msgsetloc(0, "GET THAT THROUGH&YOUR [Beautiful Head],&YOU LITTLE [Worm]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_240_0");
                    ballooncon = 0;
                    balloonend = 1;
                    weirdpathendcon = 7;
                }
                talked = 0.7;
                talktimer = 0;
                if (correct_answer != 1)
                {
                    if (ballooncon == 32)
                    {
                        scr_battletext_default();
                    }
                    else
                    {
                        global.typer = 72;
                        scr_enemyblcon(x - 10, global.monstery[myself], 10);
                    }
                }
                correct_answer = -1;
                alarm[6] = 1;
            }
        }
        if (talked == 1 && scr_isphase("enemytalk") && !i_ex(obj_choicer_neo))
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                with (obj_writer)
                {
                    instance_destroy();
                }
                talkedcon = 1;
            }
            if (talkedcon == 1)
            {
                if (partmode == 40)
                {
                    partmode = 1;
                    shockthreshold = 0;
                    hurttimer2 = 0;
                }
                rtimer = 0;
                if (!instance_exists(obj_spamton_cherub))
                {
                    scr_blconskip(-1);
                }
                else
                {
                    talktimer += 1;
                }
                if (scr_isphase("bullets"))
                {
                    if (attackdebug >= 0)
                    {
                        rr = attackdebug;
                    }
                    if (difficultydebug >= 0)
                    {
                        difficulty = difficultydebug;
                    }
                    if (!instance_exists(obj_growtangle))
                    {
                        instance_create(__view_get(e__VW.XView, 0) + 245, __view_get(e__VW.YView, 0) + 170, obj_growtangle);
                        if (rr == 0)
                        {
                            obj_growtangle.x += 54;
                            obj_growtangle.maxxscale = 3.2;
                            obj_growtangle.maxyscale = 1.5;
                            chargesfxtimer = 0;
                            dance_timer = 0;
                            armaim = -80;
                            if (difficulty == 3)
                            {
                                scr_rememberxy();
                                scr_move_to_point_over_time(x + 50, y, 8);
                                with (obj_sneo_vine_cut)
                                {
                                    hide = 1;
                                }
                                with (obj_sneo_vine_transition)
                                {
                                    hide = 1;
                                }
                            }
                        }
                        if (rr == 3)
                        {
                            obj_growtangle.x += 44;
                            obj_growtangle.y += 54;
                            obj_growtangle.maxxscale = 2;
                            obj_growtangle.maxyscale = 2;
                        }
                        if (rr == 5)
                        {
                            scr_rememberxy();
                            scr_move_to_point_over_time(x + 200, y, 8);
                            with (obj_sneo_vine_cut)
                            {
                                hide = 1;
                            }
                            with (obj_sneo_vine_transition)
                            {
                                hide = 1;
                            }
                        }
                        if (rr == 7)
                        {
                            obj_growtangle.x += 15;
                            obj_growtangle.maxxscale = 2;
                            obj_growtangle.maxyscale = 2;
                            scr_rememberxy();
                        }
                        else if (rr == 8)
                        {
                            scr_rememberxy();
                            scr_move_to_point_over_time(x, cameray() + 20, 8);
                            with (obj_sneo_vine_cut)
                            {
                                hide = 1;
                            }
                            with (obj_sneo_vine_transition)
                            {
                                hide = 1;
                            }
                        }
                        else if (rr == 8.5 || rr == 4)
                        {
                            obj_growtangle.x += 64;
                            obj_growtangle.y += 8;
                            obj_growtangle.maxxscale = 3.2;
                            obj_growtangle.maxyscale = 1.5;
                        }
                        else if (rr == 6)
                        {
                            obj_growtangle.x += 58;
                            obj_growtangle.maxxscale = 3.3333333333333335;
                            obj_growtangle.maxyscale = 2.3;
                            scr_rememberxy();
                            scr_move_to_point_over_time(x + 200, y, 16);
                            with (obj_sneo_vine_cut)
                            {
                                hide = 1;
                            }
                            with (obj_sneo_vine_transition)
                            {
                                hide = 1;
                            }
                        }
                        else if (rr == 9)
                        {
                            obj_growtangle.y += 10;
                            obj_growtangle.maxyscale = 1.9;
                            obj_growtangle.maxxscale = 2.5;
                        }
                    }
                    if (!instance_exists(obj_moveheart) && !instance_exists(obj_heart))
                    {
                        scr_moveheart();
                    }
                }
            }
        }
        if (scr_isphase("bullets") && attacked == 0)
        {
            rtimer += 1;
            if (rtimer == 15)
            {
                if (rr == 0)
                {
                    global.monsterattackname[myself] = "FlyingHeads";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = 0;
                }
                else if (rr == 1)
                {
                    global.monsterattackname[myself] = "FootballPipis";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = 1;
                }
                else if (rr == 2)
                {
                    global.monsterattackname[myself] = "HeartAttackNeo";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = 1.5;
                    dc.special = hellmode;
                }
                else if (rr == 3)
                {
                    global.monsterattackname[myself] = "FootballPipis";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = 1;
                }
                else if (rr == 4)
                {
                    global.monsterattackname[myself] = "Phonehands";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = 8.5;
                }
                else if (rr == 5)
                {
                    global.monsterattackname[myself] = "PipisExplosion";
                    dc = scr_bulletspawner(x, y, obj_dbulletcontroller);
                    dc.type = 51;
                    dc.damage = 3;
                    dc.btimer = 35 - random(30);
                }
                else if (rr == 6)
                {
                    global.monsterattackname[myself] = "RECREWColumns";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = 6;
                }
                else if (rr == 7)
                {
                    global.monsterattackname[myself] = "SneoFaceAttack";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = 12;
                    dc.special = hellmode;
                    faceattackcount++;
                }
                else if (rr == 8)
                {
                    global.monsterattackname[myself] = "Phonecall";
                    dc = instance_create(x - 10, y + 20, obj_sneo_phonecall);
                    dc.isattack = 1;
                    dc.target = mytarget;
                    if (difficulty == 3)
                    {
                        phoneevent = 2;
                    }
                    else
                    {
                        if (phoneevent >= 1)
                        {
                            dc.skipintro = 1;
                        }
                        phoneevent++;
                    }
                }
                else if (rr == 8.5)
                {
                    global.monsterattackname[myself] = "Phonehands";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = 8.5;
                }
                else if (rr == 9)
                {
                    global.monsterattackname[myself] = "NeoFinale";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = 9;
                    dc.target = 3;
                }
                else if (rr == 10)
                {
                    global.monsterattackname[myself] = "diamonds";
                    dc = scr_bulletspawner(x, y, obj_dbulletcontroller);
                    dc.type = 1;
                    dc.target = 3;
                    partframe[5] = 3;
                }
                else
                {
                    global.monsterattackname[myself] = "UnspecifiedSneoAttack";
                    dc = scr_bulletspawner(x, y, obj_sneo_bulletcontroller);
                    dc.type = rr;
                }
                scr_heartcolor("yellow");
                obj_heart.wspeed = global.sp;
                scr_turntimer(260);
                if (rr == 1)
                {
                    scr_turntimer(300);
                }
                if (rr == 2)
                {
                    scr_turntimer(750 + (hellmode * 450));
                }
                if (rr == 2 && difficulty == 1)
                {
                    scr_turntimer(850 + (hellmode * 450));
                }
                if (rr == 2 && difficulty == 6)
                {
                    scr_turntimer(150);
                }
                if (rr == 6)
                {
                    scr_turntimer(330);
                }
                if (rr == 7)
                {
                    scr_turntimer(300);
                }
                if (rr == 5)
                {
                    scr_turntimer(90);
                }
                turns += 1;
                global.typer = 6;
                global.fc = 0;
                rr = choose(0, 1, 2, 3);
                if (rr == 0)
                {
                    global.battlemsg[0] = stringsetloc("* The stage lights are shattered.", "obj_spamton_neo_enemy_slash_Step_0_gml_294_0");
                }
                if (rr == 1)
                {
                    global.battlemsg[0] = stringsetloc("* It pulls the strings and makes them ring.", "obj_spamton_neo_enemy_slash_Step_0_gml_295_0");
                }
                if (rr == 2)
                {
                    global.battlemsg[0] = stringsetloc("* The air crackles with freedom.", "obj_spamton_neo_enemy_slash_Step_0_gml_296_0");
                }
                if (rr == 3)
                {
                    global.battlemsg[0] = stringsetloc("* Smells like rotten glass.", "obj_spamton_neo_enemy_slash_Step_0_gml_297_0");
                }
                attacked = 1;
            }
            else
            {
                scr_turntimer(120);
            }
        }
        if (i_ex(obj_returnheart) && statustextupdate == 0)
        {
            statustextupdate = 1;
            if (weirdpathendcon > 0)
            {
                if (global.monsterhp[myself] < (global.monstermaxhp[myself] * 0.06))
                {
                    global.battlemsg[0] = stringsetloc("* Spamton NEO recovered HP with Pipis!", "obj_spamton_neo_enemy_slash_Step_0_gml_526_0");
                    global.monsterhp[myself] = global.monstermaxhp[myself] * 0.06;
                }
                else
                {
                    global.battlemsg[0] = stringsetloc("* Spamton NEO's DEFENSE is towering.", "obj_spamton_neo_enemy_slash_Step_0_gml_527_0");
                }
            }
            else if (global.monsterhp[myself] < (global.monstermaxhp[myself] * 0.1) && haveusedfinalattack == 0)
            {
                global.battlemsg[0] = stringsetloc("* Spamton looks to the heavens.", "obj_spamton_neo_enemy_slash_Step_0_gml_312_0");
            }
            else if (bigshot == 1 && bigshotused == 0 && global.monsterhp[myself] > (global.monstermaxhp[myself] * 0.7))
            {
                global.battlemsg[0] = stringsetsubloc("* Hold and release ~1 to fire a BIG SHOT!", scr_get_input_name(4), "obj_spamton_neo_enemy_slash_Step_0_gml_313_0");
            }
            else if (bigshot == 1 && bigshotused == 1)
            {
                if (statustextorder == 0)
                {
                    global.battlemsg[0] = stringsetloc("* Spamton turns to the audience and laughs.", "obj_spamton_neo_enemy_slash_Step_0_gml_316_0");
                }
                if (statustextorder == 1)
                {
                    global.battlemsg[0] = stringsetloc("* Spamton appeals to the audience with a festive jig!", "obj_spamton_neo_enemy_slash_Step_0_gml_317_0");
                }
                if (statustextorder == 2)
                {
                    global.battlemsg[0] = stringsetloc("* Spamton begs to the audience, Spamton prays to the audience.", "obj_spamton_neo_enemy_slash_Step_0_gml_318_0");
                }
                if (statustextorder == 3)
                {
                    global.battlemsg[0] = stringsetloc("* There is no audience.", "obj_spamton_neo_enemy_slash_Step_0_gml_319_0");
                }
                if (statustextorder == 6)
                {
                    global.battlemsg[0] = stringsetloc("* Spamton begs the audience to stop taking the furniture out of his room.", "obj_spamton_neo_enemy_slash_Step_0_gml_320_0");
                }
                if (statustextorder == 9)
                {
                    global.battlemsg[0] = stringsetloc("* Spamton feels the sweet breeze as he takes a ride around town.", "obj_spamton_neo_enemy_slash_Step_0_gml_321_0");
                }
                statustextorder++;
            }
        }
        if ((keyboard_check_pressed(vk_f1) || gamepad_button_check_pressed(0, gp_stickr) || gamepad_button_check_pressed(1, gp_stickr) || gamepad_button_check_pressed(2, gp_stickr)) && party_heal == false && (scr_isphase("menu") || scr_isphase("enemytalk")))
        {
            if (scr_isphase("enemytalk") && talktimer > 15)
            {
                talktimer = talkmax;
                with (obj_writer)
                {
                    instance_destroy();
                }
            }
            var heal_buffer = 0;
            for (var i = 0; i < 3; i++)
            {
                if (global.char[i] == 0)
                {
                    continue;
                }
                var _hltarget = global.charinstance[i];
                var _xx = 16;
                var _yy = -38;
                if (i == 1)
                {
                    _xx = 34;
                    _yy = -32;
                }
                else if (i == 2)
                {
                    _xx = 34;
                    _yy = -20;
                }
                var _cherub = instance_create(_hltarget.x + _xx, _hltarget.y + _yy, obj_spamton_cherub);
                if (i == 0 && global.char[1] == 0)
                {
                    _cherub.healer = true;
                }
                else
                {
                    _cherub.heal_state = party_heal;
                    _cherub.timer = -5 * i;
                    _cherub.target = i;
                    if (i == 2 || global.char[i + 1] == 0)
                    {
                        _cherub.healer = true;
                    }
                }
            }
            party_heal = true;
        }
    }
    if (global.myfight == 3)
    {
        xx = __view_get(e__VW.XView, 0);
        yy = __view_get(e__VW.YView, 0);
        if (acting == 1 && actcon == 0 && savemeactcon == 0)
        {
            actcon = 1;
            if (checkcount == 0)
            {
                msgsetloc(0, "* SPAMTON NEO - YOU WON'T FIND HIGHER ATTACK AND DEFENSE ANYWHERE ELSE!!!/", "obj_spamton_neo_enemy_slash_Step_0_gml_375_0");
                msgnextloc("* THE SMOOTH TASTE OF NEO \\"WAKE UP AND TASTE THE \\\\cRPAIN\\\\cW\\"./%", "obj_spamton_neo_enemy_slash_Step_0_gml_376_0");
                msgnextloc("* [[note: pain is in red.]] ./%", "obj_spamton_neo_enemy_slash_Step_0_gml_377_0");
            }
            else
            {
                msgsetloc(0, "* Spamton Neo - He is his own worst invention./%", "obj_spamton_neo_enemy_slash_Step_0_gml_381_0");
            }
            scr_battletext_default();
            checkcount++;
        }
        if (acting == 1 && actcon == 0 && savemeactcon > 0)
        {
            actcon = 1;
            if (savemeactcon < 5)
            {
                msgsetloc(0, "* Kris called for help.../", "obj_spamton_neo_enemy_slash_Step_0_gml_617_0");
                msgnextloc("* ... but nobody came./%", "obj_spamton_neo_enemy_slash_Step_0_gml_618_0");
                scr_battletext_default();
            }
            else
            {
                msgsetloc(0, "* You whispered Noelle's name.../%", "obj_spamton_neo_enemy_slash_Step_0_gml_623_0");
                scr_battletext_default();
                talktimer = 0;
                actcon = 95;
                alarm[4] = 1;
            }
            savemeactcon++;
        }
        if (actcon == 96 && !i_ex(obj_writer))
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                msgsetloc(0, "... HER?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_637_0");
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
                talktimer = 0;
                actcon = 97;
                alarm[4] = 1;
            }
        }
        if (actcon == 98 && !i_ex(obj_writer))
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                msgsetloc(0, "YOU'RE STILL TRYING&TO [Use] HER!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_651_0");
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
                actcon = 99;
                alarm[4] = 1;
            }
        }
        if (actcon == 100 && !i_ex(obj_writer))
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                msgsetloc(0, "HA HA HA HA!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_667_0");
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
                snd_play(snd_sneo_laugh_long);
                laughtimer = 0;
                talktimer = 0;
                actcon = 101;
                alarm[4] = 1;
            }
        }
        if (actcon == 102 && !i_ex(obj_writer))
        {
            talktimer++;
            if (talktimer == 10)
            {
                snd_stop(snd_sneo_laugh_long);
            }
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                msgsetloc(0, "YOU THINK SHE CAN&[Hear] YOU NOW,&MUTTERING HER NAME!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_685_0");
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
                snd_stop(snd_sneo_laugh_long);
                partmode = 1;
                talktimer = 0;
                actcon = 103;
                alarm[4] = 15;
            }
        }
        if (actcon == 104 && !i_ex(obj_writer))
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                msgsetloc(0, "WHAT'S SHE GONNA&DO, MAKE ME AN&[Ice Cream]!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_701_0");
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
                talktimer = 0;
                actcon = 105;
                alarm[4] = 15;
            }
        }
        if (actcon == 106 && !i_ex(obj_writer))
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                partmode = 41;
                actcon = 107;
                laughtimer = 0;
                alarm[4] = 120;
                snd_free(global.currentsong[0]);
            }
        }
        if (actcon == 107 && alarm[4] < 62)
        {
            headforceframe = 2;
            partrot[5] = 30;
            partmode = 99;
            snd_stop(snd_sneo_laugh_long);
        }
        if (actcon == 108 && !i_ex(obj_writer))
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                partmode = 99;
                headforceframe = 2;
                msgsetloc(0, "HEY, IS IT COLD&IN HERE OR IS IT&JUST ME?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_739_0");
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
                talktimer = 0;
                actcon = 109;
                alarm[4] = 40;
            }
        }
        if (actcon == 110)
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                actcon = 111;
                snd_play(snd_noise);
                with (obj_writer)
                {
                    instance_destroy();
                }
                with (obj_fountainkris_ch2_sideb)
                {
                    blackall = scr_dark_marker(-10, -10, spr_pixel_white);
                    blackall.image_xscale = 999;
                    blackall.image_yscale = 999;
                    blackall.depth = 0;
                    blackall.image_alpha = 1;
                    blackall.image_blend = c_black;
                    blackall.depth = -99999;
                }
                alarm[4] = 60;
            }
        }
        if (actcon == 112)
        {
            actcon = 113;
            snd_play(snd_icespell);
            alarm[4] = 12;
        }
        if (actcon == 114)
        {
            actcon = 115;
            snd_play(snd_damage);
            dmgwriter = instance_create(x + 64, y + 62, obj_dmgwriter);
            dmgwriter.damage = 684 + irandom(20);
            dmgwriter.type = 6;
            dmgwriter.depth = -999999;
            alarm[4] = 3;
        }
        if (actcon == 116)
        {
            actcon = 117;
            snd_stop(snd_damage);
            snd_play(snd_damage);
            dmgwriter = instance_create(x + 84, y + 90, obj_dmgwriter);
            dmgwriter.damage = 684 + irandom(20);
            dmgwriter.type = 6;
            dmgwriter.depth = -999999;
            alarm[4] = 3;
        }
        if (actcon == 118)
        {
            actcon = 119;
            snd_stop(snd_damage);
            snd_play(snd_damage);
            dmgwriter = instance_create(x + 66, y + 119, obj_dmgwriter);
            dmgwriter.damage = 684 + irandom(20);
            dmgwriter.type = 6;
            dmgwriter.depth = -999999;
            alarm[4] = 1;
        }
        if (actcon == 120)
        {
            event_user(3);
            obj_battlecontroller.skipvictory = 1;
            global.fighting = 0;
            if (i_ex(obj_fountainkris_ch2_sideb))
            {
                obj_fountainkris_ch2_sideb.forcend = 1;
            }
            if (i_ex(obj_fountainkris_ch2_sideb))
            {
                obj_fountainkris_ch2_sideb.con = 21;
            }
            scr_wincombat();
        }
        if (scr_sideb_get_phase() > 2)
        {
            if (acting == 2 && actcon == 0)
            {
                msgsetloc(0, "* Kris used X-Slash!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_531_0");
                scr_battletext_default();
                acting = 0;
                actcon = 21;
                krs = scr_act_charsprite("kris", spr_krisb_attack, 0.25, 1);
                krs.depth = obj_herokris.depth + 1;
                alarm[4] = 14;
                snd_pitch(snd_play(snd_scytheburst), 1.2);
                att = instance_create(x + 57, y + 76, obj_basicattack);
                att.image_xscale = 2;
                att.image_yscale = 2;
                caster = 0;
                global.hittarget[0] = 0;
                partmode = 40;
                shockthreshold = 15;
                shocktimer = 9999;
                hurttimer2 = 10;
                var dam = round((((global.battleat[obj_herokris.myself] * 150) / 20) - (global.monsterdf[myself] * 3)) * 1.25);
                scr_damage_enemy(0, dam);
            }
            if (actcon == 22)
            {
                actcon = 23;
                scr_act_charsprite_end();
                krs = scr_act_charsprite("kris", spr_krisb_attack, 0.25, 1);
                krs.depth = obj_herokris.depth + 1;
                alarm[4] = 14;
                snd_pitch(snd_play(snd_scytheburst), 0.8);
                att = instance_create(x + 57, y + 76, obj_basicattack);
                att.image_xscale = -2;
                att.image_yscale = 2;
                caster = 0;
                global.hittarget[11] = 0;
                partmode = 40;
                shockthreshold = 15;
                shocktimer = 9999;
                hurttimer2 = 10;
                var dam = round((((global.battleat[obj_herokris.myself] * 150) / 20) - (global.monsterdf[myself] * 3)) * 1.25);
                scr_damage_enemy(0, dam);
            }
            if (actcon == 24)
            {
                scr_act_charsprite_end();
                actcon = 1;
            }
            if (acting == 3 && actcon == 0)
            {
                var n = irandom_range(42, 5555);
                var small_text = stringsetloc(" Liked this!", "obj_spamton_neo_enemy_slash_Step_0_gml_928_0");
                scr_smallface(0, "none", 6, "rightmid", "bottom", string("" + string([n]) + small_text));
                msgset(0, stringsetloc("* RECOVERED HP with pipis!\\\\f0 /%", "obj_spamton_neo_enemy_slash_Step_0_gml_581_0"));
                scr_battletext_default();
                acting = 0;
                actcon = 31;
                instance_create(obj_herokris.x + 105, obj_herokris.y + 50, obj_sneo_friedpipis);
            }
            if (actcon == 31 && !i_ex(obj_writer) && !instance_exists(obj_sneo_friedpipis))
            {
                actcon = 1;
            }
        }
        else
        {
            if ((acting == 2 && actcon == 0) || (acting == 3 && actcon == 0))
            {
                var a = 0;
                var maxv = 0;
                for (var i = 0; i < 6; i++)
                {
                    if (partvisible[i] == 1 && partweakened[i] > 0)
                    {
                        a++;
                    }
                    if (partvisible[i] == 1)
                    {
                        maxv++;
                    }
                }
                if (vinebgcount < 1)
                {
                    maxvinecount = maxv;
                }
                var multicut = 1;
                if (global.hp[2] <= 0 && global.hp[3] <= 0 && acting == 2)
                {
                    var mercyset = 4;
                    if ((global.mercymod[myself] + mercyset) > 100)
                    {
                        mercyset = 100 - global.mercymod[myself];
                    }
                    scr_mercyadd(myself, mercyset);
                    if (mercyset == 0)
                    {
                        with (obj_dmgwriter)
                        {
                            if (type == 5)
                            {
                                instance_destroy();
                            }
                        }
                        msgsetloc(0, "* You tried to snap a wire... but it failed!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_946_0");
                    }
                    else
                    {
                        msgsetloc(0, "* You snapped desperately!/", "obj_spamton_neo_enemy_slash_Step_0_gml_949_0");
                        msgnextloc("* Broke 2 wires!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_950_0");
                    }
                    multicut = 2;
                }
                else if (acting == 3)
                {
                    snapallcount++;
                    if (snapallcount == 2)
                    {
                        snapallcount = 0;
                    }
                    var mercyset = 7;
                    if ((global.mercymod[myself] + mercyset) > 100)
                    {
                        mercyset = 100 - global.mercymod[myself];
                    }
                    scr_mercyadd(myself, mercyset);
                    if (mercyset == 0)
                    {
                        with (obj_dmgwriter)
                        {
                            if (type == 5)
                            {
                                instance_destroy();
                            }
                        }
                        msgsetloc(0, "* Everyone tried to snap wires... but it failed!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_961_0");
                    }
                    else
                    {
                        msgsetloc(0, "* Everyone snapped wires!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_964_0");
                    }
                }
                else
                {
                    var simultext = (simultotal == 1) ? stringsetloc("* You snapped a wire!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_275_0") : stringsetloc("* You snapped a wire!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_275_1");
                    var mercyset = 2;
                    if ((global.mercymod[myself] + mercyset) > 100)
                    {
                        mercyset = 100 - global.mercymod[myself];
                    }
                    scr_mercyadd(myself, mercyset);
                    if (mercyset == 0)
                    {
                        with (obj_dmgwriter)
                        {
                            if (type == 5)
                            {
                                instance_destroy();
                            }
                        }
                        msgsetloc(0, "* You tried to snap a wire... but it failed!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_973_0");
                    }
                    else
                    {
                        msgset(0, simultext);
                    }
                }
                scr_battletext_default();
                if (acting == 2)
                {
                    alarm[4] = 30;
                }
                else
                {
                    actcon = 1;
                }
                acting = 0;
            }
            if (acting == 5 && actcon == 0)
            {
                actcon = 12;
                acting = 0;
                alarm[4] = 15;
                instance_create(x, y, obj_sneo_throwkris_vine_controller);
                scr_rememberxy();
                scr_move_to_point_over_time(x - 40, cameray() + 195, 8);
            }
        }
        if (actcon == 13)
        {
            msgsetsubloc(0, "* Press ~1 to throw, aim for the weakpoint!", scr_get_input_name(6), "obj_spamton_neo_enemy_slash_Step_0_gml_534_0");
            with (obj_herokris)
            {
                visible = 0;
            }
            with (obj_herosusie)
            {
                visible = 0;
            }
            throwsus = instance_create(obj_herosusie.x, obj_herosusie.y, obj_sneo_throwkris);
            scr_battletext_default();
            actcon = 14;
        }
        if (actcon == 15)
        {
            with (obj_sneo_throwkris_vine_controller)
            {
                con = 2;
            }
            scr_move_to_rememberxy(8);
            actcon = 16;
            alarm[4] = 15;
        }
        if (actcon == 17)
        {
            actcon = 1;
        }
        if (actingsus == 1 && actconsus == 1)
        {
            var i = irandom(5);
            var a = -1;
            var maxv = 0;
            repeat (6)
            {
                if (partvisible[i] == 1 && partweakened[i] > 0)
                {
                    a = i;
                    break;
                }
                i++;
                if (i > 5)
                {
                    i = 0;
                }
                if (partvisible[i] == 1)
                {
                    maxv++;
                }
            }
            if (vinebgcount < 1)
            {
                maxvinecount = maxv;
            }
            var multicut = 1;
            if (global.hp[1] <= 0 && global.hp[3] <= 0)
            {
                var mercyset = 4;
                if ((global.mercymod[myself] + mercyset) > 100)
                {
                    mercyset = 100 - global.mercymod[myself];
                }
                scr_mercyadd(myself, mercyset);
                if (mercyset == 0)
                {
                    with (obj_dmgwriter)
                    {
                        if (type == 5)
                        {
                            instance_destroy();
                        }
                    }
                    msgsetloc(0, "* Susie tried to snap a wire... but it failed!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1127_0");
                }
                else
                {
                    msgsetloc(0, "* Susie snapped desperately!/", "obj_spamton_neo_enemy_slash_Step_0_gml_1130_0");
                    msgnextloc("* Broke 2 wires!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1131_0");
                }
                multicut = 2;
            }
            else
            {
                var mercyset = 2;
                if ((global.mercymod[myself] + mercyset) > 100)
                {
                    mercyset = 100 - global.mercymod[myself];
                }
                scr_mercyadd(myself, mercyset);
                if (mercyset == 0)
                {
                    with (obj_dmgwriter)
                    {
                        if (type == 5)
                        {
                            instance_destroy();
                        }
                    }
                    msgsetloc(0, "* Susie tried to snap a wire... but it failed!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1140_0");
                }
                else
                {
                    msgsetloc(0, "* Susie snapped a wire!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1141_0");
                }
            }
            scr_battletext_default();
            actconsus = 0;
            actingsus = 0;
            alarm[4] = 30;
        }
        if (actingsus == 2 && actconsus == 1)
        {
            actingsus = 0;
            actcon = 1;
            bigshotcount = 20;
            msgsetloc(0, "* You Super Charged! Can charge bullets faster! Lasts 20 shots./%", "obj_spamton_neo_enemy_slash_Step_0_gml_898_0");
            scr_battletext_default();
        }
        if (actingral == 1 && actconral == 1)
        {
            var i = irandom(5);
            var a = -1;
            var maxv = 0;
            repeat (6)
            {
                if (partvisible[i] == 1 && partweakened[i] > 0)
                {
                    a = i;
                    break;
                }
                i++;
                if (i > 5)
                {
                    i = 0;
                }
                if (partvisible[i] == 1)
                {
                    maxv++;
                }
            }
            if (vinebgcount < 1)
            {
                maxvinecount = maxv;
            }
            var multicut = 1;
            if (global.hp[1] <= 0 && global.hp[2] <= 0)
            {
                multicut = 2;
                var mercyset = 4;
                if ((global.mercymod[myself] + mercyset) > 100)
                {
                    mercyset = 100 - global.mercymod[myself];
                }
                scr_mercyadd(myself, mercyset);
                if (mercyset == 0)
                {
                    with (obj_dmgwriter)
                    {
                        if (type == 5)
                        {
                            instance_destroy();
                        }
                    }
                    msgsetloc(0, "* Ralsei tried to snap a wire... but it failed!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1273_0");
                }
                else
                {
                    msgsetloc(0, "* Ralsei snapped desperately!/", "obj_spamton_neo_enemy_slash_Step_0_gml_1276_0");
                    msgnextloc("* Broke 2 wires!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1277_0");
                }
            }
            else
            {
                var mercyset = 2;
                if ((global.mercymod[myself] + mercyset) > 100)
                {
                    mercyset = 100 - global.mercymod[myself];
                }
                scr_mercyadd(myself, mercyset);
                if (mercyset == 0)
                {
                    with (obj_dmgwriter)
                    {
                        if (type == 5)
                        {
                            instance_destroy();
                        }
                    }
                    msgsetloc(0, "* Ralsei tried to snap a wire... but it failed!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1285_0");
                }
                else
                {
                    msgsetloc(0, "* Ralsei snapped a wire!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1288_0");
                }
            }
            scr_battletext_default();
            actconral = 0;
            actingral = 0;
            actcon = 1;
        }
        if (actingral == 2 && actconral == 1)
        {
            actconral = 0;
            actingral = 0;
            actcon = 1;
            if (instance_number(obj_sneo_tiny_ralsei) < 4)
            {
                var simultext = (simultotal == 1) ? stringsetloc("* The power Ralsei's fluffy warmth surrounds you!./%", "obj_spamton_neo_enemy_slash_Step_0_gml_643_0") : stringsetloc("* Ralsei defended you!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_643_1");
                msgset(0, simultext);
                scr_battletext_default();
                var aa = 0;
                for (var i = 0; i < instance_number(obj_sneo_tiny_ralsei); i++)
                {
                    fluff[i] = instance_find(obj_sneo_tiny_ralsei, i);
                    fluff[i].place = aa * 90;
                    aa++;
                }
                repeat (2)
                {
                    instance_create(x, y, obj_sneo_tiny_ralsei);
                    var a = 0;
                    if (instance_number(obj_sneo_tiny_ralsei) == 4)
                    {
                        for (var i = 0; i < instance_number(obj_sneo_tiny_ralsei); i += 1)
                        {
                            enemy[i] = instance_find(obj_sneo_tiny_ralsei, i);
                            enemy[i].place = a;
                            a += 90;
                        }
                    }
                    if (instance_number(obj_sneo_tiny_ralsei) == 3)
                    {
                        for (var i = 0; i < instance_number(obj_sneo_tiny_ralsei); i += 1)
                        {
                            enemy[i] = instance_find(obj_sneo_tiny_ralsei, i);
                            enemy[i].place = a;
                            a += 180;
                        }
                    }
                    if (instance_number(obj_sneo_tiny_ralsei) == 2)
                    {
                        for (var i = 0; i < instance_number(obj_sneo_tiny_ralsei); i += 1)
                        {
                            enemy[i] = instance_find(obj_sneo_tiny_ralsei, i);
                            enemy[i].place = a;
                            a += 270;
                        }
                    }
                }
            }
            else
            {
                msgsetloc(0, "* Too many fluff balls!&* Can't make any more!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_679_0");
                scr_battletext_default();
                var a = 2;
                if (global.hp[2] < global.hp[3])
                {
                    a = 2;
                }
                if (global.hp[2] < global.hp[4])
                {
                    a = 2;
                }
                if (global.hp[3] < global.hp[2])
                {
                    a = 3;
                }
                if (global.hp[3] < global.hp[4])
                {
                    a = 3;
                }
                if (global.hp[4] < global.hp[2])
                {
                    a = 4;
                }
                if (global.hp[4] < global.hp[3])
                {
                    a = 4;
                }
                global.hp[a] += 10;
                snd_play(snd_boost);
            }
        }
        if ((actcon == 1 && !instance_exists(obj_writer)) || actconsus == 20 || actconral == 20)
        {
            usedact = 1;
            if (global.mercymod[myself] > 99 && endcon == 0)
            {
                endcon = 1;
            }
            else if (endcon == 0)
            {
                scr_nextact();
            }
        }
    }
    if (endcon == 1)
    {
        endtimer++;
        if (endtimer == 1)
        {
            snd_free(global.batmusic[0]);
            event_user(3);
        }
        if (endtimer > 0 && endtimer < 91)
        {
            if (i_ex(obj_ch2_sceneex2))
            {
                obj_ch2_sceneex2.trackspeed = lerp(-15, 0, endtimer / 90);
                obj_ch2_sceneex2.cityscape_speed_max = lerp(5, 0, endtimer / 90);
            }
        }
        if (endtimer == 91)
        {
            didwejustdie = 1;
            if (global.mercymod[myself] > 99)
            {
                sneo_defeat_cutscene_version = 1;
            }
            if (scr_sideb_get_phase() > 2)
            {
                sneo_defeat_cutscene_version = 2;
            }
            if (sneo_defeat_cutscene_version == 0)
            {
            }
            if (sneo_defeat_cutscene_version == 2)
            {
                msgsetloc(0, "My esteem customer&I see you are attempting to deplete my HP!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1492_0");
                partmode = 99;
                endcon = 2;
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
            }
            else
            {
                msgsetloc(0, "WAIT!!&[$!?!] THE PRESSES!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1009_0");
                partmode = 99;
                endcon = 2;
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
            }
            endtimer = 0;
            endcon = 2;
            talktimer = 0;
            ballooncon = 1;
            balloonend = 0;
        }
    }
    if (sneo_defeat_cutscene_version == 0)
    {
        if (endcon == 2)
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                with (obj_writer)
                {
                    instance_destroy();
                }
                if (ballooncon == 1)
                {
                    msgsetloc(0, "HAHAHA... KRIS!!!&YOU THINK DEPLETING&MY [8000 Life Points]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1034_0");
                    ballooncon = 2;
                    balloonend = 0;
                    shocktimer = 9999;
                    hurttimer2 = 10;
                    partmode = 40;
                }
                else if (ballooncon == 2)
                {
                    msgsetloc(0, "MEANS YOU'VE WON&[A Free Meal] TO&[Winning]?!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1038_0");
                    ballooncon = 3;
                    balloonend = 0;
                    shocktimer = 9999;
                    hurttimer2 = 10;
                }
                else if (ballooncon == 3)
                {
                    msgsetloc(0, "NO!!! NO!!! NE-O!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1042_0");
                    ballooncon = 4;
                    balloonend = 0;
                    shocktimer = 9999;
                    hurttimer2 = 10;
                }
                else if (ballooncon == 4)
                {
                    msgsetloc(0, "KRIS!!&YOUR [Deal] HAS FAILED!!&[NEO] NEVER LOSES!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1046_0");
                    ballooncon = 5;
                    balloonend = 0;
                    shocktimer = 9999;
                    hurttimer2 = 10;
                }
                else if (ballooncon == 5)
                {
                    msgsetloc(0, "THIS IS [Victory Smoke]!!&IT MEANS IT'S TIME&FOR MY [Second Form]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1052_0");
                    ballooncon = 6;
                    balloonend = 0;
                    shockthreshold = 10;
                    hurttimer2 = 20;
                    snd_play(snd_damage);
                    dontchangepose = 0;
                    smokethreshold = 10;
                    partmode = 40;
                    repeat (6)
                    {
                        var smokey = instance_create(x + 50, y + 80, obj_afterimage_grow);
                        smokey.visible = 0;
                        with (smokey)
                        {
                            scr_script_delayed(scr_var, 1, "visible", 1);
                        }
                        smokey.depth = depth + 10;
                        smokey.image_alpha = 2.5;
                        smokey.sprite_index = spr_cakesmoke;
                        smokey.hspeed = random_range(2, 10);
                        smokey.gravity = -0.5;
                        smokey.friction = 0.2;
                        smokey.vspeed = random_range(-1, -8);
                    }
                }
                else if (ballooncon == 6)
                {
                    msgsetloc(0, "ARE YOU READY KRIS!?&FOR MY [Next Trick]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1058_0");
                    ballooncon = 7;
                    balloonend = 0;
                }
                else if (ballooncon == 7)
                {
                    msgsetloc(0, "I WILL FILL MY [Body]&WITH [Electricaty] AND BECOME&SPAMTON [EX]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1062_0");
                    ballooncon = 8;
                    balloonend = 0;
                }
                else if (ballooncon == 8)
                {
                    if (i_ex(obj_ch2_sceneex2))
                    {
                        obj_ch2_sceneex2.trackspeed = 20;
                    }
                    msgsetloc(0, "ARE YOU READY [Kids]!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1068_0");
                    ballooncon = 9;
                    balloonend = 0;
                    shockthreshold = 10;
                    hurttimer2 = 10;
                    snd_play(snd_sneo_overpower);
                    snd_loop(snd_sneo_overpower);
                    snd_pitch(snd_sneo_overpower, 0.3);
                    targetbgspeed = -5;
                }
                else if (ballooncon == 9)
                {
                    msgsetloc(0, "[Turn Up The JUICE!]&[Turn Up The JUICE!]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1076_0");
                    ballooncon = 10;
                    balloonend = 0;
                    shockthreshold = 5;
                    snd_pitch(snd_sneo_overpower, 0.5);
                    targetbgspeed = -9;
                    smokethreshold = 1;
                }
                else if (ballooncon == 10)
                {
                    msgsetloc(0, "[Make Sure You Don't&Get It On Your Shoese!]/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1083_0");
                    ballooncon = 11;
                    balloonend = 0;
                    shockthreshold = 3;
                    snd_pitch(snd_sneo_overpower, 0.7);
                    targetbgspeed = -13;
                }
                else if (ballooncon == 11)
                {
                    msgsetloc(0, "ARE YOU GETTING&ALL THIS [Mike]!?&I'M FINALLY/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1089_0");
                    ballooncon = 12;
                    balloonend = 0;
                    shockthreshold = 2;
                    snd_pitch(snd_sneo_overpower, 0.9);
                    targetbgspeed = -17;
                }
                else if (ballooncon == 12)
                {
                    msgsetloc(0, "I'M FINALLY GONNA&BE A BIG SHOT!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1095_0");
                    ballooncon = 13;
                    balloonend = 0;
                    shockthreshold = 1;
                    snd_pitch(snd_sneo_overpower, 1.1);
                    targetbgspeed = -21;
                }
                else if (ballooncon == 13)
                {
                    msgsetloc(0, "HERE I GO!!!!&WATCH ME FLY,&[MAMA]!!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1101_0");
                    ballooncon = 0;
                    balloonend = 1;
                    shocktimer = 1;
                    snd_pitch(snd_sneo_overpower, 1.3);
                    targetbgspeed = -25;
                }
                endcon = 3;
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
                if (ballooncon >= 8)
                {
                    with (obj_writer)
                    {
                        shake = 2;
                    }
                }
                if (ballooncon == 0)
                {
                    with (obj_writer)
                    {
                        shake = 3;
                        rate = 3;
                    }
                }
                alarm[6] = 1;
            }
            if (i_ex(obj_ch2_sceneex2))
            {
                obj_ch2_sceneex2.trackspeed = lerp(obj_ch2_sceneex2.trackspeed, targetbgspeed * 6, 0.1);
            }
            if (i_ex(obj_ch2_sceneex2))
            {
                obj_ch2_sceneex2.cityscape_speed_max = lerp(obj_ch2_sceneex2.cityscape_speed_max, targetbgspeed, 0.1);
            }
        }
        if (endcon == 4)
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                endtimer++;
                if (endtimer <= 90)
                {
                    snd_pitch(snd_sneo_overpower, lerp(1.3, 2, endtimer / 90));
                }
                if (endtimer == 120)
                {
                    violentendflash = 1;
                    endtimer = 140;
                }
                if (endtimer == 151)
                {
                    audio_stop_sound(snd_sneo_overpower);
                    with (obj_afterimage_grow)
                    {
                        instance_destroy();
                    }
                    snd_play(snd_explosion);
                    whiteall = scr_dark_marker(-10, -10, spr_pixel_white);
                    whiteall.image_xscale = 999;
                    whiteall.image_yscale = 999;
                    whiteall.depth = 0;
                    whiteall.image_alpha = 0;
                }
                if (endtimer > 150 && endtimer < 162)
                {
                    whiteall.image_alpha = lerp(0, 1, (endtimer - 150) / 11);
                }
                if (endtimer == 300)
                {
                    blackall = scr_dark_marker(-10, -10, spr_pixel_white);
                    blackall.image_xscale = 999;
                    blackall.image_yscale = 999;
                    blackall.depth = -1;
                    blackall.image_alpha = 0;
                    blackall.image_blend = c_black;
                }
                if (endtimer > 300 && endtimer < 331)
                {
                    blackall.image_alpha = lerp(0, 1, (endtimer - 300) / 30);
                }
                if (endtimer == 331)
                {
                    with (whiteall)
                    {
                        if (global.hp[1] < 1)
                        {
                            global.hp[1] = 1;
                        }
                        if (global.hp[2] < 1)
                        {
                            global.hp[2] = 1;
                        }
                        if (global.hp[3] < 1)
                        {
                            global.hp[3] = 1;
                        }
                        if (i_ex(obj_ch2_sceneex2))
                        {
                            obj_ch2_sceneex2.forcend = 1;
                        }
                        if (i_ex(obj_ch2_sceneex2))
                        {
                            obj_ch2_sceneex2.con = 13;
                        }
                    }
                }
            }
        }
    }
    if (sneo_defeat_cutscene_version == 1)
    {
        if (endcon == 2)
        {
            var aa = 0;
            if (instance_exists(obj_ch2_sceneex2) && obj_ch2_sceneex2.shop_spamton_bg_con > 0 && obj_ch2_sceneex2.shop_spamton_bg_con < 3)
            {
                aa = 1;
            }
            talktimer++;
            if ((button3_p() && talktimer > 15 && aa == 0) || (!i_ex(obj_writer) && aa == 0))
            {
                if (ballooncon == 7 && instance_exists(obj_ch2_sceneex2) && obj_ch2_sceneex2.shop_spamton_bg_con < 3)
                {
                    obj_ch2_sceneex2.shop_spamton_bg_con = 1;
                    aa = 1;
                }
            }
            if ((button3_p() && talktimer > 15 && aa == 0) || (!i_ex(obj_writer) && aa == 0))
            {
                with (obj_writer)
                {
                    instance_destroy();
                }
                if (ballooncon == 1)
                {
                    headendcon = 1;
                    msgsetloc(0, "MY... MY [Wires]...&THEY'RE ALMOST [Gone]!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1172_0");
                    ballooncon = 2;
                    balloonend = 0;
                    partmode = 1;
                }
                else if (ballooncon == 2)
                {
                    msgsetloc(0, "KRIS... YOU...&YOU'RE [Gifting] ME&MY [Freedom]?!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1176_0");
                    ballooncon = 3;
                    balloonend = 0;
                }
                else if (ballooncon == 3)
                {
                    headendcon = 2;
                    msgsetloc(0, "KRIS... AFTER EVERYTHING&I DID TO YOU...!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1181_0");
                    ballooncon = 4;
                    balloonend = 0;
                    partmode = 1;
                }
                else if (ballooncon == 4)
                {
                    headendcon = 3;
                    msgsetloc(0, "AFTER ALL THE&[Unforgettable D3als]&[Free KROMER] I&GAVE YOU/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1186_0");
                    ballooncon = 5;
                    balloonend = 0;
                    partmode = 1;
                }
                else if (ballooncon == 5)
                {
                    msgsetloc(0, "YOU'RE FINALLY&REPAYING MY&[Genorisity]!?/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1190_0");
                    ballooncon = 6;
                    balloonend = 0;
                }
                else if (ballooncon == 6)
                {
                    headendcon = 2;
                    msgsetloc(0, "KRIS!!! I UNDERSTAND&NOW!! THE GREATEST&DEAL OF ALL!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1195_0");
                    ballooncon = 7;
                    balloonend = 0;
                    partmode = 99;
                }
                else if (ballooncon == 7)
                {
                    headendcon = 3;
                    global.currentsong[0] = snd_init("spamton_happy.ogg");
                    global.currentsong[1] = mus_play(global.currentsong[0]);
                    mus_loop(global.currentsong[0]);
                    msgsetloc(0, "[Friendship]!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1202_0");
                    ballooncon = 8;
                    balloonend = 0;
                    partmode = 36;
                }
                else if (ballooncon == 8)
                {
                    msgsetloc(0, "KRIS!!! MY DAYS AS&A [Long-Nosed Doll]&ARE OVER!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1208_0");
                    ballooncon = 9;
                    balloonend = 0;
                }
                else if (ballooncon == 9)
                {
                    msgsetloc(0, "CUT THAT&[Wire] AND MAKE&ME A [Real Boy]!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1212_0");
                    ballooncon = 10;
                    balloonend = 0;
                }
                else if (ballooncon == 10)
                {
                    msgsetloc(0, "ARE YOU WATCHING,&[Heaven]!? IT'S&TIME FOR SPAMTON'S&[Comeback Special]!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1216_0");
                    ballooncon = 11;
                    balloonend = 0;
                }
                else if (ballooncon == 11)
                {
                    msgsetloc(0, "AND THIS TIME...&I LIVE FOR MYSELF!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1220_0");
                    ballooncon = 12;
                    balloonend = 0;
                }
                else if (ballooncon == 12)
                {
                    msgsetloc(0, "NO... MYSELF AND&MY [Friend(s)]!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1225_0");
                    ballooncon = 13;
                    balloonend = 0;
                    partmode = 36;
                }
                else if (ballooncon == 13)
                {
                    msgsetloc(0, "HERE I GO!!!!&WATCH ME FLY,&[MAMA]!!!!/%", "obj_spamton_neo_enemy_slash_Step_0_gml_1229_0");
                    ballooncon = 0;
                    balloonend = 1;
                    partmode = 36;
                    dancealtcon = 2;
                }
                endcon = 3;
                global.typer = 72;
                scr_enemyblcon(x - 10, global.monstery[myself], 10);
                if (ballooncon >= 8)
                {
                    with (obj_writer)
                    {
                        shake = 2;
                    }
                }
                if (ballooncon == 13 || ballooncon == 0)
                {
                    with (obj_writer)
                    {
                        shake = 3;
                        rate = 3;
                    }
                }
                alarm[6] = 1;
            }
            if (i_ex(obj_ch2_sceneex2))
            {
                obj_ch2_sceneex2.trackspeed = lerp(obj_ch2_sceneex2.trackspeed, targetbgspeed * 6, 0.1);
            }
            if (i_ex(obj_ch2_sceneex2))
            {
                obj_ch2_sceneex2.cityscape_speed_max = lerp(obj_ch2_sceneex2.cityscape_speed_max, targetbgspeed, 0.1);
            }
            if (ballooncon == 13)
            {
                siner += 2;
                for (var i = 0; i < 8; i += 1)
                {
                    partsiner[i] += 0.6;
                }
            }
        }
        if (endcon == 4)
        {
            talktimer++;
            if ((button3_p() && talktimer > 15) || !i_ex(obj_writer))
            {
                endtimer++;
                if (endtimer == 1)
                {
                    snd_free(global.currentsong[0]);
                    snd_play(snd_noise);
                    snd_play(snd_damage);
                    blackall4 = scr_dark_marker(-10, -10, spr_pixel_white);
                    blackall4.image_xscale = 999;
                    blackall4.image_yscale = 999;
                    blackall4.depth = obj_ch2_sceneex2.depth - 1;
                    blackall4.image_alpha = 0.5;
                    blackall4.image_blend = c_black;
                    vine = instance_create(x, y, obj_sneo_vine_cut);
                    vine.x1 = x + partx[4] + (partxoff[4] / 1.2) + 20 + (sin(partsiner[4] / 25) * 1.8);
                    vine.x2 = x + partx[4] + (partxoff[4] / 1.5) + 32;
                    vine.y1 = ((y + party[4]) - 10) + partyoff[4];
                    vine.y2 = -400;
                    vine.depth = depth + 1;
                    vine.vineid = 4;
                    vfx = instance_create(x + partx[4] + (partxoff[4] / 1.2) + 16, y - 35, obj_sneo_vine_weak);
                    vfx.depth = depth - 5;
                    lastwirecon = 3;
                    partmode = 99;
                    if (i_ex(obj_ch2_sceneex2))
                    {
                        obj_ch2_sceneex2.cityscape_speed_max = 0;
                        obj_ch2_sceneex2.cityscape_speed = 0;
                        obj_ch2_sceneex2.trackspeed = 0;
                    }
                }
                if (endtimer == 91)
                {
                    depth = -99999;
                    blackall = scr_dark_marker(-10, -10, spr_pixel_white);
                    blackall.image_xscale = 999;
                    blackall.image_yscale = 999;
                    blackall.depth = 0;
                    blackall.image_alpha = 1;
                    blackall.image_blend = c_black;
                    partmode = 43;
                }
                if (endtimer == 330)
                {
                    blackall2 = scr_dark_marker(-10, -10, spr_pixel_white);
                    blackall2.image_xscale = 999;
                    blackall2.image_yscale = 999;
                    blackall2.depth = 0;
                    blackall2.image_alpha = 1;
                    blackall2.image_blend = c_black;
                    blackall2.depth = -999999;
                }
                if (endtimer == 450)
                {
                    with (blackall2)
                    {
                        if (global.hp[1] < 1)
                        {
                            global.hp[1] = 1;
                        }
                        if (global.hp[2] < 1)
                        {
                            global.hp[2] = 1;
                        }
                        if (global.hp[3] < 1)
                        {
                            global.hp[3] = 1;
                        }
                        if (i_ex(obj_ch2_sceneex2))
                        {
                            obj_ch2_sceneex2.forcend = 1;
                        }
                        if (i_ex(obj_ch2_sceneex2))
                        {
                            obj_ch2_sceneex2.con = 13;
                        }
                    }
                }
            }
            if (ballooncon == 0 && endtimer == 0)
            {
                siner += 3;
                for (var i = 0; i < 8; i += 1)
                {
                    partsiner[i] += 0.9;
                }
            }
        }
    }
    if (endcon == 10)
    {
        endcon = 11;
        obj_battlecontroller.skipvictory = 1;
        scr_wincombat();
    }
    if (weirdpathendcon == 6)
    {
        partmode = 40;
        dontchangepose = 0;
    }
    if (stoprumblesfx > 0)
    {
        stoprumblesfx--;
    }
    if (stoprumblesfx == 1)
    {
        audio_stop_sound(snd_rumble);
    }
    if (scr_debug())
    {
    }
}

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`,Step_2:`if (obj_spamton_neo_enemy.singleshotmercy > 9)
{
    with (obj_spamton_neo_enemy)
    {
        if (instance_exists(obj_sneo_bulletcontroller) && obj_sneo_bulletcontroller.type == 1.5)
        {
            obj_sneo_bulletcontroller.mercyaccumulated += 1;
            __mercydmgwriter = instance_create(global.monsterx[myself], (global.monstery[myself] + 20) - (global.hittarget[myself] * 20), obj_dmgwriter);
            __mercydmgwriter.damage = 1;
            __mercydmgwriter.type = 5;
            global.hittarget[myself]++;
        }
        else
        {
            scr_mercyadd(myself, 1);
        }
        singleshotmercy = 0;
    }
}
if (!instance_exists(obj_sneo_bulletcontroller))
{
    idealx[5] = 0;
    idealrot[5] = 0;
    partsiner[5] = 0;
    partrot[5] = 0;
    partx[5] = 0;
    party[5] = 0;
    partxoff[5] = sprite_get_xoffset(partsprite[5]) * 2;
    partyoff[5] = sprite_get_yoffset(partsprite[5]) * 2;
}
if (global.fighting == 1)
{
    if (prevmercy != global.mercymod[myself])
    {
        var mercygainedthisturn = global.mercymod[myself] - prevmercy;
        repeat (mercygainedthisturn)
        {
            prevmercy++;
            if ((prevmercy % 2) == 0)
            {
                var i = irandom(5);
                var a = -1;
                var maxv = 0;
                repeat (6)
                {
                    if (partvisible[i] == 1 && partweakened[i] > 0)
                    {
                        a = i;
                        break;
                    }
                    i++;
                    if (i > 5)
                    {
                        i = 0;
                    }
                    if (partvisible[i] == 1)
                    {
                        maxv++;
                    }
                }
                if (vinebgcount < 1)
                {
                    maxvinecount = maxv;
                }
                var multicut = 1;
                var c = irandom(5);
                var d = 0;
                var maxvines = 0;
                while (d == 0)
                {
                    if (x == x)
                    {
                        if (partvisible[c] == 1)
                        {
                            partvisible[c] = 0;
                            vine = instance_create(x, y, obj_sneo_vine_cut);
                            vine.x1 = x + partx[c] + (partxoff[c] / 1.2) + (c * 5) + (sin(partsiner[c] / 30) * 2);
                            vine.x2 = x + partx[c] + (partxoff[c] / 1.5) + (c * 8);
                            vine.y1 = ((y + party[c]) - 10) + partyoff[c];
                            vine.y2 = -400;
                            vine.depth = depth + 1;
                            vine.vineid = c;
                            vfx = instance_create(x + partx[c] + (partxoff[c] / 1.2) + (c * 5), y - 20, obj_sneo_vine_weak);
                            vfx.depth = depth - 5;
                            if (!audio_is_playing(snd_damage))
                            {
                                snd_play(snd_damage);
                            }
                            c = irandom(5);
                            maxvines++;
                            a--;
                            if (maxvines >= multicut)
                            {
                                d = 1;
                            }
                            obj_spamton_neo_enemy.vinebgcount -= 1;
                        }
                        else
                        {
                            c++;
                            if (c > 5)
                            {
                                c = 0;
                            }
                        }
                    }
                    else if (partweakened[c] == 0)
                    {
                        partweakened[c] = 1;
                        vfx = instance_create(x + partx[c] + (partxoff[c] / 1.2) + (c * 5), y - 20, obj_sneo_vine_weak);
                        vfx.depth = depth - 5;
                        if (!audio_is_playing(snd_damage))
                        {
                            snd_play(snd_damage);
                        }
                        c = irandom(5);
                        maxvines++;
                        a++;
                        if (maxvines >= multicut)
                        {
                            d = 1;
                        }
                    }
                    else
                    {
                        c++;
                        if (c > 5)
                        {
                            c = 0;
                        }
                    }
                    var max_break = 0;
                    i = 0;
                    repeat (6)
                    {
                        if (partvisible[i] == 1)
                        {
                            max_break = 1;
                        }
                        i++;
                    }
                    if (max_break == 0)
                    {
                        d = 1;
                    }
                }
            }
        }
        if (obj_spamton_neo_enemy.vinebgcount > -2 && !instance_exists(obj_sneo_throwkris_vine_controller))
        {
            for (var i = 0; i < 6; i += 1)
            {
                if (obj_spamton_neo_enemy.partvisible[i] == 0)
                {
                    obj_spamton_neo_enemy.vineid = i;
                    vine = instance_create(x, y, obj_sneo_vine_transition);
                }
            }
        }
        weakentimer = 1;
        weakenshakeamount = 10;
    }
}
if (global.fighting == 1)
{
    prevmercy = global.mercymod[myself];
}
`},hashes:{Alarm_4:`ccdcf429527aedb7dab909360f3de8e351741cfce016702d5ebadc7226e37717`,Alarm_6:`194ea20044941c062cd2a94c25270b2e14abe9fb59baedc020a3906cf3d1c3cf`,CleanUp_0:`d05d41e90cae63366a9dc089ca2329b2888631d0b095278aa5aace9e894533ef`,Create_0:`e306702f34ad044b8b60158d6c30afda6048b776858f538489e9a926739de1ca`,Draw_0:`5e22df7b90e6ac5c95fc6910ba0282b5a0e1b94378a1dcf3b62cad12ead3a7de`,Other_10:`cee973f3e87c96ed7261dea7ebb8f36b691f39a578e4ac5d79b9be54e43945c5`,Other_11:`aac290b3ba154cf1fc542b364c906391596bc4ed76598d4d5e5f574a116c69e0`,Other_12:`89152487bcd998822ec2817f334095f7fb1a701a5a4f4de9880a51ba9209ad7e`,Other_13:`ea25d8442e7102188f7dab97eaf1ce025a6d605491f2288f0e193f367ddf7739`,Other_14:`40f8a5989316248e14e203282b80a615268184d06f2b72507e750d8ecd2d169b`,Other_22:`d451afc434316d504a4dfa0d00b7759d935f8574832d5cfca7ba574c5fd07d06`,Step_0:`d1c8074ca68c3e9523de842b4dd75e4e43ec180a37343022646cf2517298ab73`,Step_2:`9a35624614f96049da9567bf232f740a0413931aac2a6c5009d0e5c47454fbc9`}},obj_sneo_hitdetector:{metadata:{index:601,name:`obj_sneo_hitdetector`,parent:null,sprite:`spr_sneo_head_sad`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_sneo_phonebullet:`with (obj_spamton_neo_enemy)
{
    hitcon = 1;
}
with (other)
{
    event_user(0);
}
`,Collision_obj_yheart_shot:`exit;
if (!active)
{
    exit;
}
if (instance_exists(obj_pipis_controller))
{
    exit;
}
if (instance_exists(obj_sneo_phonecall))
{
    exit;
}
if (instance_exists(obj_sneo_bulletcontroller) && obj_sneo_bulletcontroller.type == 1)
{
    exit;
}
if (instance_exists(obj_sneo_bulletcontroller) && obj_sneo_bulletcontroller.type == 8)
{
    exit;
}
with (obj_spamton_neo_enemy)
{
    if (instance_exists(obj_sneo_bulletcontroller) && obj_sneo_bulletcontroller.type != 1.5)
    {
        hitcon = 1;
    }
}
var a = random(45);
repeat (8)
{
    part = instance_create(other.x, other.y, obj_yheart_sneo_particle);
    part.direction = a + random(15);
    part.speed = 8;
    part.friction = 0.8;
    a += 45;
}
if (global.monsterhp[obj_spamton_neo_enemy.myself] == global.monstermaxhp[obj_spamton_neo_enemy.myself])
{
    if (other.big == 1)
    {
        with (obj_spamton_neo_enemy)
        {
            if (instance_exists(obj_sneo_bulletcontroller) && obj_sneo_bulletcontroller.type == 1.5)
            {
                obj_sneo_bulletcontroller.mercyaccumulated += 1;
                __mercydmgwriter = instance_create(global.monsterx[myself], (global.monstery[myself] + 20) - (global.hittarget[myself] * 20), obj_dmgwriter);
                __mercydmgwriter.damage = 1;
                __mercydmgwriter.type = 5;
                global.hittarget[myself]++;
            }
            else
            {
                scr_mercyadd(myself, 1);
            }
        }
    }
    else
    {
        with (obj_spamton_neo_enemy)
        {
            singleshotmercy += 1;
        }
    }
}
else
{
    var dmg = 0;
    if (other.big == 1)
    {
        dmg = ceil(global.monstermaxhp[obj_spamton_neo_enemy.myself] * 0.01);
    }
    else
    {
        dmg = ceil(global.monstermaxhp[obj_spamton_neo_enemy.myself] * 0.002);
    }
    if ((global.monsterhp[obj_spamton_neo_enemy.myself] - dmg) < 1)
    {
        global.monsterhp[obj_spamton_neo_enemy.myself] = 1;
    }
    else
    {
        global.monsterhp[obj_spamton_neo_enemy.myself] -= dmg;
    }
    if (dmg != 0)
    {
        dm = instance_create(global.monsterx[global.chartarget[obj_spamton_neo_enemy.myself]], (global.monstery[global.chartarget[obj_spamton_neo_enemy.myself]] - (global.hittarget[global.chartarget[obj_spamton_neo_enemy.myself]] * 20)) + 20, obj_dmgwriter);
        dm.type = 1;
        dm.delay = 8;
        dm.damage = dmg;
    }
}
snd_play(snd_damage);
with (other)
{
    event_user(0);
}
`,Create_0:`image_speed = 0;
image_xscale = 2;
image_yscale = 2;
image_alpha = 0.2;
image_blend = c_black;
visible = 0;
active = true;
`},hashes:{Collision_obj_sneo_phonebullet:`625752d2bb90b345150583556e6dd51baec85ef8473cd704376d640b53160845`,Collision_obj_yheart_shot:`bfc9faadc8fe689c331d6d18c602b541cb750fc68591aa18ba5ac0898d35f144`,Create_0:`76a572d5ce7f115d0af1b27253fd54ff6be72d03f6d4218f9de2fc1a7d87b3c7`}},obj_sneo_tiny_ralsei:{metadata:{index:639,name:`obj_sneo_tiny_ralsei`,parent:null,sprite:`spr_fluffy_guard_new`,mask:null,solid:!1,depth:0,visible:!1},sources:{Alarm_0:`exit;
`,Collision_obj_basicbullet_sneo:`if (active == 0)
{
    exit;
}
if (alarm[0] > 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_collidebullet:`if (active == 0)
{
    exit;
}
with (other)
{
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
if (other.sprite_index == spr_spamtonneo_faceAttack_nose_bullet || other.sprite_index == spr_spamtonneo_faceAttack_wisp || other.sprite_index == spr_bullet_laser_square)
{
    hp -= 4;
}
else if (other.sprite_index == spr_bullet_laser_square)
{
    hp -= 2;
}
else
{
    hp -= 10;
}
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_pipis_bullet:`if (active == 0)
{
    exit;
}
with (other)
{
    event_user(1);
}
if (alarm[0] > 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
sn = snd_play(snd_hurt1);
`,Collision_obj_pipis_egg_bullet:`if (active == 0)
{
    exit;
}
with (other)
{
    snd_play_pitch(snd_bomb, 1.1 + random(0.2));
    instance_destroy();
    event_user(0);
}
if (alarm[0] > 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_regularbullet:`if (active == 0)
{
    exit;
}
with (other)
{
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
if (other.sprite_index == spr_spamtonneo_faceAttack_nose_bullet || other.sprite_index == spr_spamtonneo_faceAttack_wisp || other.sprite_index == spr_bullet_laser_square)
{
    hp -= 3;
}
else
{
    hp -= 10;
}
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_biglaser:`if (active == 0)
{
    exit;
}
if (alarm[0] > 0)
{
    exit;
}
if (!other.active)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_bigshot:`if (active == 0)
{
    exit;
}
if (alarm[0] > 0)
{
    exit;
}
if (!other.active)
{
    exit;
}
snd_play(snd_hurt1);
hp = 0;
`,Collision_obj_sneo_heartattack:`if (active == 0)
{
    exit;
}
if (frametype == 0)
{
    frametype = 1;
    other.heart_health -= 4;
}
else if (frametype == 1)
{
    frametype = 0;
    hp -= 10;
    alarm[0] = 10;
    if (!audio_is_playing(snd_hurt1))
    {
        snd_play(snd_hurt1);
    }
}
`,Collision_obj_sneo_heatattack_bullet:`if (active == 0)
{
    exit;
}
with (other)
{
    scr_afterimage_cut();
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_laser_bullet:`if (active == 0)
{
    exit;
}
if (alarm[0] > 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_lilguy:`if (active == 0)
{
    exit;
}
with (other)
{
    snd_play_pitch(snd_bomb, 1.1 + random(0.2));
    scr_afterimage_cut();
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
snd_play(snd_damage);
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_lilguy_bullet:`if (active == 0)
{
    exit;
}
with (other)
{
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_mmx_spreadshot:`if (active == 0)
{
    exit;
}
with (other)
{
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
if (other.active == 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_rotatingwall_bomb:`if (active == 0)
{
    exit;
}
with (other)
{
    scr_afterimage_cut();
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
if (other.active == 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_staticwall:`if (active == 0)
{
    exit;
}
with (other)
{
    scr_afterimage_cut();
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
if (other.active == 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_wallbullet:`if (active == 0)
{
    exit;
}
with (other)
{
    scr_afterimage_cut();
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
if (other.active == 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_wallbullet_new:`if (active == 0)
{
    exit;
}
with (other)
{
    scr_afterimage_cut();
    instance_destroy();
}
if (alarm[0] > 0)
{
    exit;
}
if (other.active == 0)
{
    exit;
}
hp -= 3;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Collision_obj_sneo_wireheart:`if (active == 0)
{
    exit;
}
if (frametype == 0)
{
    frametype = 1;
    other.hp -= 4;
}
else if (frametype == 1)
{
    frametype = 0;
    hp -= 10;
    alarm[0] = 10;
    if (!audio_is_playing(snd_hurt1))
    {
        snd_play(snd_hurt1);
    }
}
`,Collision_obj_spamtonshot:`if (active == 0)
{
    exit;
}
if (alarm[0] > 0)
{
    exit;
}
hp -= 10;
alarm[0] = 10;
snd_play(snd_hurt1);
`,Create_0:`timer = 0;
con = 0;
hpmax = 30;
hp = hpmax;
active = 1;
destroytimer = 0;
frametype = 0;
myspeed = 6;
length = 27;
place = 0;
xhold = 0;
image_index = 12;
image_xscale = 1;
image_yscale = 1;
image_speed = 0;
`,Step_2:`image_blend = merge_color(c_red, c_white, hp / hpmax);
if (hp < 1)
{
    if (active == 1)
    {
        snd_play(snd_dtrans_flip);
    }
    active = 0;
    image_alpha -= 0.05;
    if (image_alpha < 0.01)
    {
        instance_destroy();
    }
    exit;
}
if (instance_exists(obj_heart))
{
    rotator_target = obj_heart;
    depth = obj_heart.depth - 1;
    if (button2_h() && xhold < 9)
    {
        xhold++;
    }
    else if (xhold > 0)
    {
        xhold--;
    }
    var extra_speed = xhold;
    if (extra_speed > 8)
    {
        extra_speed = 8;
    }
    myspeed = 8 - extra_speed;
    x = rotator_target.x + 10 + lengthdir_x(length, place);
    y = rotator_target.y + 10 + lengthdir_y(length, place);
    place += myspeed;
}
if (!instance_exists(obj_heart))
{
    visible = false;
}
if (instance_exists(obj_heart))
{
    if (alarm[0] == 9)
    {
        visible = false;
    }
    else if (alarm[0] == 8)
    {
        visible = false;
    }
    else if (alarm[0] == 5)
    {
        visible = false;
    }
    else if (alarm[0] == 4)
    {
        visible = false;
    }
    else if (alarm[0] == 1)
    {
        visible = false;
    }
    else if (alarm[0] == 0)
    {
        visible = false;
    }
    else
    {
        visible = true;
    }
}
`},hashes:{Alarm_0:`729164ba3b62266d609e614e2e990d3529d0497cf9780904ba46244c441336bf`,Collision_obj_basicbullet_sneo:`4451b7ca0822a115c509b65a824f2490d8645797a139d8807f4065a4baa13bba`,Collision_obj_collidebullet:`338cf168528723be17909a0e4e1b0db744534ad1ea46835b8dd99a2a6c3bbc64`,Collision_obj_pipis_bullet:`330881ad7e1b2a00314dfcc77ba8c1bf828efc87d2925f1022a72cb274af3ee5`,Collision_obj_pipis_egg_bullet:`f456ff1687dbf9145a56e73e603e9f67938fd538ca6385430c842528faa2b564`,Collision_obj_regularbullet:`6ecad955f14ebf26ba42ae97ecda6c65a2e20609fcea5920e9a01c2bf5e118c5`,Collision_obj_sneo_biglaser:`2f2e27fdeae815968f38fbf4770f6e5dfd620199b8479ce6a82ba38be0df09fc`,Collision_obj_sneo_bigshot:`74bf84f8b79707e194e234ddef4fb8617c88f34cbf47901b5dce1c1559804cf2`,Collision_obj_sneo_heartattack:`92286c11878fa246ff5f1e1f354f8fb538cf258cfefcf6aab9510e81c986e6ba`,Collision_obj_sneo_heatattack_bullet:`7e48a4702699ce272e3c5575720e6dce471801711f445881c349d73f9a0b61c4`,Collision_obj_sneo_laser_bullet:`4451b7ca0822a115c509b65a824f2490d8645797a139d8807f4065a4baa13bba`,Collision_obj_sneo_lilguy:`54f96a2a602b880d128caaa55baa89911e5c5392fd0bc3abf8a4b30a70eb95c2`,Collision_obj_sneo_lilguy_bullet:`79f683d0847d852a690cdaee749b1ae62f567f34979342ca5fc7b19d2b93fd28`,Collision_obj_sneo_mmx_spreadshot:`efee3da93accce2ea12d5681433654a41aff5bf2c9391c05dc7b1c1715e2e143`,Collision_obj_sneo_rotatingwall_bomb:`d7e8bf8000815520683384322fe649cef1706c0096b441274d7211c3b69a3cf7`,Collision_obj_sneo_staticwall:`d7e8bf8000815520683384322fe649cef1706c0096b441274d7211c3b69a3cf7`,Collision_obj_sneo_wallbullet:`d7e8bf8000815520683384322fe649cef1706c0096b441274d7211c3b69a3cf7`,Collision_obj_sneo_wallbullet_new:`d752794683b31dcefd4eb0693d1bb28983b22893e84748a8214510da1c9cf189`,Collision_obj_sneo_wireheart:`da62cc592678638e1c32ebc6486f2eaebb81dedbb6c6ca788bebe42487df46e6`,Collision_obj_spamtonshot:`4451b7ca0822a115c509b65a824f2490d8645797a139d8807f4065a4baa13bba`,Create_0:`4d256dc1bdebf79f0227bac95d02b6e222827ceac7a8e490c4829e802f66e7c5`,Step_2:`93bab75668b6a438c184fd99a1bbc9a4939d7fafb079625ab624570a302eef56`}},obj_sneo_vine_cut:{metadata:{index:693,name:`obj_sneo_vine_cut`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`timer = 0;
shakeamount = 10;
type = 0;
vineid = -1;
hide = 0;
x1 = x;
x2 = x;
y1 = y;
y2 = y;
x3 = x;
x4 = x;
y3 = y;
y4 = y;
alpha = 1;
lineangle = 0;
anglecutspeed = 3;
bottomlinevisible = 1;
`,Draw_0:`timer++;
if (shakeamount > 0)
{
    shakeamount--;
}
var shakeamount2 = shakeamount - random(shakeamount * 2);
y1 = ((obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party[vineid]) - 10) + obj_spamton_neo_enemy.partyoff[vineid];
if (type == 0)
{
    if (timer == 11)
    {
        x3 = x1;
        x4 = x2;
        y3 = y1 - 130;
        y4 = y2;
        y2 = y1 - 130;
    }
    if (timer > 11)
    {
        if (y4 < y3)
        {
            y3 -= 4;
        }
        if (y1 > y2)
        {
            y2 += 4;
        }
    }
    if (timer == 60)
    {
        instance_destroy();
    }
}
if (type == 1)
{
    if (timer > 1 && timer < 17)
    {
        x3 += lengthdir_x(anglecutspeed, lineangle + 23);
        y3 += lengthdir_y(anglecutspeed, lineangle + 23);
        x2 += lengthdir_x(anglecutspeed, lineangle - 157);
        y2 += lengthdir_y(anglecutspeed, lineangle - 157);
        anglecutspeed -= 0.2;
    }
    if (timer > 11)
    {
        alpha -= 0.1;
    }
    if (timer > 21)
    {
    }
    if (timer == 60 || alpha < 0.1)
    {
        instance_destroy();
    }
}
if (abs(y1 - y2) < 16 || y2 > y1)
{
    bottomlinevisible = 0;
}
draw_set_alpha(alpha);
draw_set_color(c_orange);
if ((timer >= 11 && type == 0 && hide == 0) || (type == 1 && hide == 0))
{
    draw_line_width(x3, y3, x4, y4, 2);
}
if (bottomlinevisible == 1 && hide == 0)
{
    draw_line_width(x1 + shakeamount2, y1 + shakeamount2, x2 + shakeamount2, y2 + shakeamount2, 2);
}
if (timer < 11 && hide == 0)
{
    draw_set_color(c_white);
    draw_set_alpha(11 - (timer / 10));
    draw_line_width(x1, y1, x2, y2, 2);
    draw_set_alpha(1);
}
draw_set_alpha(1);
`},hashes:{Create_0:`5b5f2ed1ae14d5087aa5372dd82e476c32db27e8da418c8817e76e4bf6044f30`,Draw_0:`03753e5e085b48f0d930ee3ac19f2a0f6ff632d603896f8d63ef5fa9a7622372`}},obj_sneo_vine_transition:{metadata:{index:694,name:`obj_sneo_vine_transition`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`timer = 0;
width = 1;
vineid = obj_spamton_neo_enemy.vineid;
hide = 0;
x1 = x;
x2 = x;
y1 = y;
y2 = y;
x3 = x;
x4 = x;
y3 = y;
y4 = y;
depth = obj_spamton_neo_enemy.depth + 5;
a = 0;
selected_vine = 0;
var c = irandom(17);
var d = 0;
var e = 0;
while (d == 0)
{
    if (obj_spamton_neo_enemy.partvisible_back[c] == 1)
    {
        a = c;
        obj_spamton_neo_enemy.partvisible_back[c] = 0;
        selected_vine = c;
        x1 = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx_back[a] + obj_spamton_neo_enemy.partxoff_back[a] + (sin(obj_spamton_neo_enemy.partsiner_back[a] / 30) * 2);
        x2 = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx_back[a] + obj_spamton_neo_enemy.partxoff_back[a];
        y1 = obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party_back[a] + obj_spamton_neo_enemy.partyoff_back[a];
        y2 = -400;
        d = 1;
    }
    else
    {
        c++;
        if (c > 17)
        {
            c = 0;
        }
        e++;
        if (e > 18)
        {
            instance_destroy();
            exit;
        }
    }
}
x3 = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[vineid] + (obj_spamton_neo_enemy.partxoff[vineid] / 1.2) + (vineid * 5) + (sin(obj_spamton_neo_enemy.partsiner[vineid] / 30) * 2);
x4 = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[vineid] + (obj_spamton_neo_enemy.partxoff[vineid] / 1.5) + (vineid * 8);
y3 = ((obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party[vineid]) - 10) + obj_spamton_neo_enemy.partyoff[vineid];
y4 = -400;
`,Draw_0:`timer++;
width += (1/30);
x3 = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[vineid] + (obj_spamton_neo_enemy.partxoff[vineid] / 1.2) + (vineid * 5) + (sin(obj_spamton_neo_enemy.partsiner[vineid] / 30) * 2);
x4 = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[vineid] + (obj_spamton_neo_enemy.partxoff[vineid] / 1.5) + (vineid * 8);
if (global.myfight != 3 && global.monsterattackname[obj_spamton_neo_enemy.myself] == "UnspecifiedSneoAttack")
{
    x1 = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx_back[a] + obj_spamton_neo_enemy.partxoff_back[a] + (sin(obj_spamton_neo_enemy.partsiner_back[a] / 30) * 2);
}
y1 = obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party_back[a] + obj_spamton_neo_enemy.partyoff_back[a];
repeat (2)
{
    if (x1 < (x3 - 1))
    {
        x1 += 1;
    }
    if (x2 < (x3 - 1))
    {
        x2 += 1;
    }
    if (x1 > (x3 + 1))
    {
        x1 -= 1;
    }
    if (x2 > (x3 + 1))
    {
        x2 -= 1;
    }
}
if (timer >= 31)
{
    obj_spamton_neo_enemy.partvisible[vineid] = 1;
    obj_spamton_neo_enemy.partweakened[vineid] = 0;
    if (obj_spamton_neo_enemy.extra_vines > 0)
    {
        for (ii = 0; ii < 18; ii += 1)
        {
            if (obj_spamton_neo_enemy.partvisible_back[ii] == 0 && obj_spamton_neo_enemy.extra_vines > 0)
            {
                obj_spamton_neo_enemy.extra_vines--;
                obj_spamton_neo_enemy.partvisible_back[ii] = 1;
                obj_spamton_neo_enemy.vinebgcount++;
            }
        }
    }
    instance_destroy();
}
if (hide == 1)
{
    exit;
}
draw_set_color(c_green);
draw_line_width(x1, y1, x2, y2, width);
draw_set_alpha((31 - timer) / 30);
draw_set_color(make_colour_rgb(0, 51, 0));
draw_line_width(x1, y1, x2, y2, width);
draw_set_alpha(1);
`},hashes:{Create_0:`5ecfaadcf752c9ac7c48d6a8e51328e090f564a9c456da90582c9a38104e5c8f`,Draw_0:`f61eb9a66c92b9ffae3fbff66b273073345745bf257354c70ab659773d50b587`}},obj_sneo_vine_weak:{metadata:{index:695,name:`obj_sneo_vine_weak`,parent:null,sprite:`spr_attack_cut1`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_speed = 0.25;
`,Step_0:`if (image_index > 3)
{
    instance_destroy();
}
`},hashes:{Create_0:`b33df4a25b913e058cd2bad35e0c1eff408a33a5c53fb98ce9273594c90dd86d`,Step_0:`59539b0b13b599299632beb16f8d41398ce259d6f3a158309805f3b4d059f06e`}},obj_sneo_throwkris:{metadata:{index:690,name:`obj_sneo_throwkris`,parent:null,sprite:`spr_susieb_throwkrisready`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`angle = 0;
throwcon = 1;
angledraw = 1;
image_xscale = 2;
image_yscale = 2;
radius = 300;
anglespeed = 2;
kx = 184 + camerax();
ky = 170 + cameray();
lx = camerax();
ly = cameray();
krisyoff[999] = 0;
krisgrav = 1;
fro = 0;
mypower = 15;
maxpower = 30;
mypower = maxpower;
minpower = 15;
powerdir = 1;
powerspeed = 0.6;
throwready = 0;
throwalpha = 0;
activatethrow = 0;
`,Draw_0:`draw_self();
if (angledraw == 0)
{
    throwalpha = 0;
}
if (angledraw == 1)
{
    if (throwalpha < 1)
    {
        throwalpha += 0.125;
    }
    draw_set_alpha(throwalpha);
    draw_set_color(merge_color(c_blue, c_white, 0.5));
    for (i = 0; i < 12; i += 1)
    {
        fr = 2;
        draw_circle(kx + (lx * ((i * fr) + fro)), ky + (ly * ((i * fr) + fro)) + krisyoff[(i * fr) + fro], 4, 0);
        draw_line_width(kx + (lx * ((i * fr) + fro)), ky + (ly * ((i * fr) + fro)) + krisyoff[(i * fr) + fro], kx + (lx * (((i + 1) * fr) + fro)), ky + (ly * (((i + 1) * fr) + fro)) + krisyoff[((i + 1) * fr) + fro], 2);
        draw_sprite_ext(spr_werewire_throwarrow, 0, kx, ky, 2, 2, angle, c_red, 1);
    }
    draw_set_alpha(1);
}
`,Step_0:`if (throwcon == 1)
{
    if (throwready == 0)
    {
        angle += anglespeed;
    }
    if (angle >= 42)
    {
        anglespeed = -2;
    }
    if (angle <= -2)
    {
        anglespeed = 2;
    }
    if (button3_p())
    {
        activatethrow = 1;
        with (obj_writer)
        {
            instance_destroy();
        }
    }
    if (activatethrow == 1)
    {
        throwready = 1;
        activatethrow = 0;
        image_index = 0;
        image_speed = 0.5;
        sprite_index = spr_susieb_attack_unarmed;
        angledraw = 0;
        throwcon = 2;
        snd_play(snd_ultraswing);
        kris = instance_create(kx, ky, obj_sneo_kristhrown);
        kris.speed = mypower;
        kris.mypower = mypower;
        kris.image_xscale = 2;
        kris.image_yscale = 2;
        kris.direction = angle;
        kris.image_angle = angle;
        kris.gravity = krisgrav;
    }
}
if (throwcon == 2)
{
    if (image_index >= 5)
    {
        image_speed = 0;
    }
}
if (angledraw == 1)
{
    lx = lengthdir_x(mypower, angle);
    ly = lengthdir_y(mypower, angle);
    for (i = 0; i < 42; i += 1)
    {
        krisyadd = krisgrav + (krisgrav * i);
        if (i > 0)
        {
            krisyoff[i] = krisyoff[i - 1] + krisyadd;
        }
        else
        {
            krisyoff[0] = krisyadd;
        }
    }
}
`,vine_controller_Create_0:`state = 1;
timer = 0;
con = 0;
variant = 0;
depth = obj_spamton_neo_enemy.depth + 1;
for (i = 0; i < 6; i += 1)
{
    x1[i] = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[i] + (obj_spamton_neo_enemy.partxoff[i] / 1.2) + (i * 5) + (sin(obj_spamton_neo_enemy.partsiner[i] / 30) * 2);
    x2[i] = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[i] + (obj_spamton_neo_enemy.partxoff[i] / 1.5) + (i * 8);
    y1[i] = ((obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party[i]) - 10) + obj_spamton_neo_enemy.partyoff[i];
    y2[i] = -400;
    x2_target[i] = x2[i];
    x2_origin[i] = x2[i];
    visiblevine[i] = obj_spamton_neo_enemy.partvisible[i];
    weakened[i] = obj_spamton_neo_enemy.partweakened[i];
    obj_spamton_neo_enemy.partvisible[i] = 0;
}
if (variant == 0)
{
    for (i = 0; i < 6; i += 1)
    {
        x2_target[i] = (obj_spamton_neo_enemy.x - 300) + (i * 130);
    }
}
var a = x2_target[3];
x2_target[3] = x2_target[4];
x2_target[4] = a;
`,vine_controller_Draw_0:`for (i = 0; i < 6; i += 1)
{
    x1[i] = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[i] + (obj_spamton_neo_enemy.partxoff[i] / 1.2) + (i * 5) + (sin(obj_spamton_neo_enemy.partsiner[i] / 30) * 2);
    y1[i] = ((obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party[i]) - 10) + obj_spamton_neo_enemy.partyoff[i];
}
if (con == 0)
{
    timer++;
    for (i = 0; i < 6; i += 1)
    {
        x2[i] = lerp(x2[i], x2_target[i], timer / 20);
    }
    if (timer == 20)
    {
        con = 1;
        for (i = 0; i < 6; i += 1)
        {
            if (weakened[i] != 0 && visiblevine[i] == 1)
            {
                target = instance_create(x, y, obj_sneo_throwtarget);
                target.maker = id;
                target.x1 = x1[i];
                target.x2 = x2[i];
                target.y1 = y1[i];
                target.y2 = y2[i];
                target.vineid = i;
                with (target)
                {
                    path = path_add();
                    path_set_kind(path, 0);
                    path_set_closed(path, false);
                    path_add_point(path, x1, y1, 100);
                    path_add_point(path, x2 - 3, y2, 100);
                    path_start(path, 4, path_action_stop, true);
                }
                target.image_angle = point_direction(x1[i], y1[i], x2[i], y2[i]) + 282;
            }
        }
        timer = 0;
    }
}
if (con == 2)
{
    timer++;
    if (timer < 11)
    {
        for (i = 0; i < 6; i += 1)
        {
            x2[i] = lerp(x2[i], x2_origin[i], timer / 10);
        }
    }
    if (timer == 20)
    {
        for (i = 0; i < 6; i += 1)
        {
            if (visiblevine[i] == 1)
            {
                obj_spamton_neo_enemy.partvisible[i] = 1;
            }
        }
        instance_destroy();
        if (obj_spamton_neo_enemy.vinebgcount > 0)
        {
            for (i = 0; i < 6; i += 1)
            {
                if (obj_spamton_neo_enemy.partvisible[i] == 0)
                {
                    obj_spamton_neo_enemy.vineid = i;
                    vine = instance_create(x, y, obj_sneo_vine_transition);
                }
            }
        }
    }
}
`},hashes:{Create_0:`54aebdb45691c94b18c07ad3b899b0bc401ce4c179fdb526314475633235808b`,Draw_0:`91555eb5759ca07bbc28198e5b6bc4daa4fd7f55f2b9f15d07af5a46b181a770`,Step_0:`5dc5ab0826547694f3bf5d97fe9864aae051f04ec79e57d2950e688b11108294`,vine_controller_Create_0:`6b9ccad6f339f162432dfa8e8b1765e34090fce8f27e460f7cacd9cf875588c6`,vine_controller_Draw_0:`c2c729a7edd29c2b644b9caab8ffd7e855c3a324e3072cd43a2ca4dbcadff28d`}},obj_sneo_throwkris_vine_controller:{metadata:{index:696,name:`obj_sneo_throwkris_vine_controller`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`state = 1;
timer = 0;
con = 0;
variant = 0;
depth = obj_spamton_neo_enemy.depth + 1;
for (i = 0; i < 6; i += 1)
{
    x1[i] = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[i] + (obj_spamton_neo_enemy.partxoff[i] / 1.2) + (i * 5) + (sin(obj_spamton_neo_enemy.partsiner[i] / 30) * 2);
    x2[i] = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[i] + (obj_spamton_neo_enemy.partxoff[i] / 1.5) + (i * 8);
    y1[i] = ((obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party[i]) - 10) + obj_spamton_neo_enemy.partyoff[i];
    y2[i] = -400;
    x2_target[i] = x2[i];
    x2_origin[i] = x2[i];
    visiblevine[i] = obj_spamton_neo_enemy.partvisible[i];
    weakened[i] = obj_spamton_neo_enemy.partweakened[i];
    obj_spamton_neo_enemy.partvisible[i] = 0;
}
if (variant == 0)
{
    for (i = 0; i < 6; i += 1)
    {
        x2_target[i] = (obj_spamton_neo_enemy.x - 300) + (i * 130);
    }
}
var a = x2_target[3];
x2_target[3] = x2_target[4];
x2_target[4] = a;
`,Draw_0:`for (i = 0; i < 6; i += 1)
{
    x1[i] = obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[i] + (obj_spamton_neo_enemy.partxoff[i] / 1.2) + (i * 5) + (sin(obj_spamton_neo_enemy.partsiner[i] / 30) * 2);
    y1[i] = ((obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party[i]) - 10) + obj_spamton_neo_enemy.partyoff[i];
}
if (con == 0)
{
    timer++;
    for (i = 0; i < 6; i += 1)
    {
        x2[i] = lerp(x2[i], x2_target[i], timer / 20);
    }
    if (timer == 20)
    {
        con = 1;
        for (i = 0; i < 6; i += 1)
        {
            if (weakened[i] != 0 && visiblevine[i] == 1)
            {
                target = instance_create(x, y, obj_sneo_throwtarget);
                target.maker = id;
                target.x1 = x1[i];
                target.x2 = x2[i];
                target.y1 = y1[i];
                target.y2 = y2[i];
                target.vineid = i;
                with (target)
                {
                    path = path_add();
                    path_set_kind(path, 0);
                    path_set_closed(path, false);
                    path_add_point(path, x1, y1, 100);
                    path_add_point(path, x2 - 3, y2, 100);
                    path_start(path, 4, path_action_stop, true);
                }
                target.image_angle = point_direction(x1[i], y1[i], x2[i], y2[i]) + 282;
            }
        }
        timer = 0;
    }
}
if (con == 2)
{
    timer++;
    if (timer < 11)
    {
        for (i = 0; i < 6; i += 1)
        {
            x2[i] = lerp(x2[i], x2_origin[i], timer / 10);
        }
    }
    if (timer == 20)
    {
        for (i = 0; i < 6; i += 1)
        {
            if (visiblevine[i] == 1)
            {
                obj_spamton_neo_enemy.partvisible[i] = 1;
            }
        }
        instance_destroy();
        if (obj_spamton_neo_enemy.vinebgcount > 0)
        {
            for (i = 0; i < 6; i += 1)
            {
                if (obj_spamton_neo_enemy.partvisible[i] == 0)
                {
                    obj_spamton_neo_enemy.vineid = i;
                    vine = instance_create(x, y, obj_sneo_vine_transition);
                }
            }
        }
    }
}
`},hashes:{Create_0:`6b9ccad6f339f162432dfa8e8b1765e34090fce8f27e460f7cacd9cf875588c6`,Draw_0:`c2c729a7edd29c2b644b9caab8ffd7e855c3a324e3072cd43a2ca4dbcadff28d`}},obj_sneo_susie_act:{metadata:{index:697,name:`obj_sneo_susie_act`,parent:null,sprite:`spr_dodgeheart_centered_white`,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`exit;
`,Create_0:`image_angle = 90;
image_blend = c_purple;
visible = true;
image_xscale = 2;
image_yscale = 2;
image_alpha = 0.5;
turnsleft = 3;
timer = 0;
siner = 0;
axe_timer = 0;
init = 0;
frametype = 0;
x = -9999;
y = -9999;
if (instance_number(obj_sneo_tiny_susie) == 2)
{
    instance_destroy();
}
`,Draw_0:`timer++;
var scale = abs(sin(timer / 10));
draw_sprite_ext(sprite_index, 0, x, y, 1 + scale, 1 + scale, image_angle, image_blend, 0.5);
scale = abs(sin(timer / 14));
draw_sprite_ext(sprite_index, 0, x, y, 1.2 + scale, 1.2 + scale, image_angle, image_blend, 0.5);
`,Step_2:`if (turnsleft < 1)
{
    instance_destroy();
}
if (instance_exists(obj_heart))
{
    if (init == 0)
    {
        init = 1;
        x = obj_heart.x - 30;
        y = obj_heart.y;
    }
    depth = obj_heart.depth + 1;
    x = obj_heart.x + 10;
    y = obj_heart.y + 10;
    if (instance_exists(obj_sneo_fakeheart))
    {
        x = -9999;
        y = -9999;
    }
}
axe_timer++;
if (axe_timer > 8 && visible == true)
{
    axe_timer = 0;
    instance_create(x, y, obj_sneo_tiny_susie_axe);
}
if (!instance_exists(obj_heart))
{
    visible = false;
}
if (instance_exists(obj_heart))
{
    if (alarm[0] == 9)
    {
        visible = false;
    }
    else if (alarm[0] == 8)
    {
        visible = false;
    }
    else if (alarm[0] == 5)
    {
        visible = false;
    }
    else if (alarm[0] == 4)
    {
        visible = false;
    }
    else if (alarm[0] == 1)
    {
        visible = false;
    }
    else if (alarm[0] == 0)
    {
        visible = false;
    }
    else
    {
        visible = true;
    }
}
`},hashes:{Alarm_0:`729164ba3b62266d609e614e2e990d3529d0497cf9780904ba46244c441336bf`,Create_0:`ec9f5b5f47300628ad4b3a36d0e4f7706087ca503246943828a96e4e43774495`,Draw_0:`0241c0ddfd9ad231452842a38f623f01c06e02006e6633d6c977bb2d57ebf570`,Step_2:`946c4a7dcd6bd35dc9563c25ddf5f721ca5fc8ac0d28cfab4eb60decb2c54946`}},obj_sneo_smoke:{metadata:{index:4,name:`obj_sneo_smoke`,parent:null,sprite:`spr_sneo_smoke`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`timer = 0;
`,Draw_0:`var _scale_a = lerp(2, 2.15, timer / 75);
image_xscale = _scale_a;
image_yscale = _scale_a;
image_alpha = lerp(1, 0, timer / 75);
timer++;
draw_self();
if (timer > 75)
{
    instance_destroy();
}
`},hashes:{Create_0:`5f7855fa5ae48b9fdd81786106113fb7c5e5a95171c9cf74161c2a583ac187c1`,Draw_0:`49fc723f7ddcb64d6462c7aabe404079481b421a6ca77482b14ceaecd0dcc8f9`}},obj_move_to_point:{metadata:{index:928,name:`obj_move_to_point`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`target = obj_move_to_point;
moved = 0;
movetimer = 0;
movex = 0;
movey = 0;
movemax = 10;
charmarker = 0;
`,Step_0:`if (i_ex(target))
{
    if (moved == 0)
    {
        x = target.x;
        y = target.y;
        dist = distance_to_point(movex, movey);
        dir = point_direction(x, y, movex, movey);
        amt = dist / movemax;
        xadd = lengthdir_x(amt, dir);
        yadd = lengthdir_y(amt, dir);
        moved = 1;
    }
    target.x += xadd;
    target.y += yadd;
    if (target.object_index == obj_actor)
    {
        target.fake_speed = amt;
        target.fake_direction = dir;
    }
    movetimer += 1;
    target.x = lerp(x, movex, movetimer / movemax);
    target.y = lerp(y, movey, movetimer / movemax);
    if (movetimer >= movemax)
    {
        if (target.object_index == obj_actor)
        {
            target.fake_speed = 0;
        }
        if (charmarker == 1)
        {
            target.fun = 0;
        }
        if (charmarker == 2)
        {
            with (target)
            {
                follow = 1;
                fun = 0;
                scr_caterpillar_interpolate();
            }
        }
        instance_destroy();
    }
    if (target == obj_move_to_point)
    {
        instance_destroy();
    }
}
else
{
    instance_destroy();
}
`},hashes:{Create_0:`15abdc6176450d1f9dd056c08af026822930788cd3829feddee2cb34116ad555`,Step_0:`9e3c48fb239315e47db8976b9fa8aae1f1706bfc5d39133ac50a856d458242f8`}},obj_sneo_tiny_susie_axe:{metadata:{index:635,name:`obj_sneo_tiny_susie_axe`,parent:null,sprite:`spr_rudebuster_sneo_act`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_pipis_bullet:`instance_destroy();
with (other)
{
    shake = 8;
    hp -= 0.5;
    if (image_index < 3)
    {
        image_index += 0.5;
    }
    snd_play(snd_damage);
    if (hp < 1)
    {
        fx = instance_create(x, y, obj_pipis_destroy_fx);
        fx.image_xscale = 1.5;
        fx.image_yscale = 1.5;
        repeat (3)
        {
            fx = instance_create(x, y, obj_pipis_egg_bullet_piece);
            fx.image_xscale = 2;
            fx.image_yscale = 2;
        }
        instance_destroy();
    }
    else
    {
        fx = instance_create(x, y, obj_pipis_egg_bullet_piece);
        fx.image_index = image_index;
    }
}
`,Collision_obj_pipis_egg_bullet:`instance_destroy();
snd_play(snd_damage);
with (other)
{
    hp -= 0.5;
    if (image_index < 3)
    {
        image_index += 0.5;
    }
    snd_play(snd_damage);
    if (hp < 1)
    {
        fx = instance_create(x, y, obj_pipis_destroy_fx);
        fx.image_xscale = 1.5;
        fx.image_yscale = 1.5;
        repeat (3)
        {
            fx = instance_create(x, y, obj_pipis_egg_bullet_piece);
            fx.image_xscale = 2;
            fx.image_yscale = 2;
        }
        instance_destroy();
    }
    else
    {
        fx = instance_create(x, y, obj_pipis_egg_bullet_piece);
        fx.image_index = image_index;
    }
}
`,Collision_obj_regularbullet:`with (other)
{
    instance_destroy();
}
instance_destroy();
`,Collision_obj_sneo_crusher:`instance_destroy();
other.hp -= 0.5;
snd_play(snd_damage);
`,Collision_obj_sneo_elevator_electric_ball:`with (other)
{
    sprite_index = spr_sneo_electric_orb_destroy;
    image_index = 0;
    alarm[0] = 99;
    image_speed = 0.5;
}
`,Collision_obj_sneo_faceattack:`if (other.type == 0 || other.image_alpha < 0.9)
{
    exit;
}
if (other.broken == 1)
{
    instance_destroy();
    exit;
}
other.shake = 6;
if (other.type == 1)
{
    obj_spamton_neo_enemy.eyeshp -= 1;
}
if (other.type == 2)
{
    obj_spamton_neo_enemy.nosehp -= 1;
}
if (other.type == 3)
{
    obj_spamton_neo_enemy.mouthhp -= 1;
}
snd_play(snd_damage);
other.invincibilitytimer = 10;
other.hurtflashtimer = 3;
if ((other.type == 1 && obj_spamton_neo_enemy.eyeshp <= 0) || (other.type == 2 && obj_spamton_neo_enemy.nosehp <= 0) || (other.type == 3 && obj_spamton_neo_enemy.mouthhp <= 0))
{
    other.broken = 1;
    other.image_index = 2;
    snd_play(snd_rocket);
    other.explodetimer = 16;
}
instance_destroy();
`,Collision_obj_sneo_heartattack:`instance_destroy();
other.heart_health -= 0.5;
snd_play(snd_damage);
`,Collision_obj_sneo_heatattack_bullet:`with (other)
{
    instance_destroy();
}
instance_destroy();
`,Collision_obj_sneo_hitdetector:`exit;
`,Collision_obj_sneo_laser_bullet:`instance_destroy();
`,Collision_obj_sneo_lilguy:`instance_destroy();
with (other)
{
    snd_play_pitch(snd_bomb, 1.1 + random(0.2));
    scr_afterimage_cut();
    instance_destroy();
}
snd_play(snd_damage);
`,Collision_obj_sneo_lilguy_bullet:`instance_destroy();
with (other)
{
    instance_destroy();
}
snd_play(snd_damage);
`,Collision_obj_sneo_orb_shot:`exit;
`,Collision_obj_sneo_phonecall:`instance_destroy();
`,Collision_obj_sneo_staticwall:`if (other.active == 0)
{
    exit;
}
`,Collision_obj_sneo_wallbullet:`if (other.active == 0)
{
    exit;
}
if (other.destroyable == 1)
{
    instance_destroy();
    snd_play(snd_damage);
    with (other)
    {
        instance_destroy();
    }
}
`,Collision_obj_spamtonshot:`instance_destroy();
`,Create_0:`image_index = 1;
image_blend = c_yellow;
image_alpha = 0.5;
image_xscale = 0.4;
image_yscale = 0.4;
target = obj_spamton_neo_enemy;
var dist = 9999;
if (instance_exists(obj_pipis_bullet))
{
    if (distance_to_object(instance_nearest(x, y, obj_pipis_bullet)) < dist)
    {
        target = instance_nearest(x, y, obj_pipis_bullet);
    }
}
if (instance_exists(obj_pipis_egg_bullet))
{
    if (distance_to_object(instance_nearest(x, y, obj_pipis_egg_bullet)) < dist)
    {
        target = instance_nearest(x, y, obj_pipis_egg_bullet);
    }
}
if (instance_exists(obj_sneo_heartattack))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_heartattack)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_heartattack);
    }
}
if (instance_exists(obj_sneo_heatattack_bullet))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_heatattack_bullet)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_heatattack_bullet);
    }
}
if (instance_exists(obj_sneo_lilguy))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_lilguy)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_lilguy);
    }
}
if (instance_exists(obj_sneo_lilguy_bullet))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_lilguy_bullet)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_lilguy_bullet);
    }
}
if (instance_exists(obj_sneo_wireheart))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_wireheart)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_wireheart);
    }
}
if (instance_exists(obj_sneo_faceattack_target))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_faceattack_target)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_faceattack_target);
    }
}
if (instance_exists(obj_regularbullet))
{
    if (distance_to_object(instance_nearest(x, y, obj_regularbullet)) < dist)
    {
        target = instance_nearest(x, y, obj_regularbullet);
    }
}
`,Destroy_0:`if (global.turntimer > 1)
{
    myanim = instance_create(x, y, obj_yshot_anim);
    with (myanim)
    {
        image_xscale = 2;
        image_yscale = 2;
        sprite_index = spr_yheart_shot_hit3;
    }
}
`,Other_0:`with (other)
{
    instance_destroy();
}
instance_destroy();
`,Step_0:`if (!instance_exists(obj_heart))
{
    instance_destroy();
    exit;
}
if (!i_ex(target))
{
    move_towards_point(x + 150, y, 22);
    image_angle = direction;
    exit;
}
if (target == obj_spamton_neo_enemy)
{
    move_towards_point(x + 150, y, 22);
    image_angle = direction;
    exit;
}
move_towards_point(target.x, target.y, 22);
image_angle = direction;
target = obj_spamton_neo_enemy;
var dist = 9999;
if (instance_exists(obj_pipis_bullet))
{
    if (distance_to_object(instance_nearest(x, y, obj_pipis_bullet)) < dist)
    {
        target = instance_nearest(x, y, obj_pipis_bullet);
    }
}
if (instance_exists(obj_pipis_egg_bullet))
{
    if (distance_to_object(instance_nearest(x, y, obj_pipis_egg_bullet)) < dist)
    {
        target = instance_nearest(x, y, obj_pipis_egg_bullet);
    }
}
if (instance_exists(obj_sneo_heartattack))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_heartattack)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_heartattack);
    }
}
if (instance_exists(obj_sneo_heatattack_bullet))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_heatattack_bullet)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_heatattack_bullet);
    }
}
if (instance_exists(obj_sneo_lilguy))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_lilguy)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_lilguy);
    }
}
if (instance_exists(obj_sneo_lilguy_bullet))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_lilguy_bullet)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_lilguy_bullet);
    }
}
if (instance_exists(obj_sneo_wireheart))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_wireheart)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_wireheart);
    }
}
if (instance_exists(obj_sneo_faceattack_target))
{
    if (distance_to_object(instance_nearest(x, y, obj_sneo_faceattack_target)) < dist)
    {
        target = instance_nearest(x, y, obj_sneo_faceattack_target);
    }
}
if (x >= (camerax() + 500) && x < (camerax() + 530) && instance_exists(obj_sneo_faceattack) && obj_sneo_faceattack.init == 1)
{
    instance_destroy();
}
`},hashes:{Collision_obj_pipis_bullet:`5c77e51d52c2c642b4fdd8d4488609b87a5759921455bac561207c3730c45261`,Collision_obj_pipis_egg_bullet:`815b922577a6e45f4ddc8fd65334482baf3cc32b23ebf41bca6dabbc8d6a4f6c`,Collision_obj_regularbullet:`6aa50d3050e2ca407d589c585abaee78048c69406bdcf8efb9a09409e226bd71`,Collision_obj_sneo_crusher:`c68034d0b3027979e852cf615630430166cfbb84951a5f42ca973bdc32f490c3`,Collision_obj_sneo_elevator_electric_ball:`12f6a9e4e2afdc2bb4707ad62c7171f1c392cf560a2123c05dc6cbf6c4907d35`,Collision_obj_sneo_faceattack:`b19c2f11c1099b5e0322df00e233b3267d3240929b8bd597348ab1ebc97c8e8e`,Collision_obj_sneo_heartattack:`fbe25c70d547d8776892daee780c5fb8c0f07aba297a0167286f978a849f603f`,Collision_obj_sneo_heatattack_bullet:`6aa50d3050e2ca407d589c585abaee78048c69406bdcf8efb9a09409e226bd71`,Collision_obj_sneo_hitdetector:`729164ba3b62266d609e614e2e990d3529d0497cf9780904ba46244c441336bf`,Collision_obj_sneo_laser_bullet:`119f34bd7be574f48af27ceacc370067754150dc7ca916f5e3c2aa22e0ee0c1a`,Collision_obj_sneo_lilguy:`a4e05f4723c44e03cbbe04b171b6850072efbd10f93a29a32d71683b83be5133`,Collision_obj_sneo_lilguy_bullet:`971a4b4c69d1c3c01fd9a6f99d3fcfd4c4c12b6afd2bdeac4efa4e9b0c9b94c1`,Collision_obj_sneo_orb_shot:`729164ba3b62266d609e614e2e990d3529d0497cf9780904ba46244c441336bf`,Collision_obj_sneo_phonecall:`119f34bd7be574f48af27ceacc370067754150dc7ca916f5e3c2aa22e0ee0c1a`,Collision_obj_sneo_staticwall:`4e9badb17c6d247ff516f0801cfba9df675ca9b4f23696ffc1eb079db67f66fb`,Collision_obj_sneo_wallbullet:`7767c283b8224fc663597cf73256da32e9d99048bcc8b0bcd4ef0751679cef05`,Collision_obj_spamtonshot:`119f34bd7be574f48af27ceacc370067754150dc7ca916f5e3c2aa22e0ee0c1a`,Create_0:`a017083de72ce46bfdff27d9e3e36ddbefe665e671e4fc2628e47e6f72e6f613`,Destroy_0:`39aa9d31db4a45f12881a194e2d5a6b44220586086264e0d592ea8387969c70c`,Other_0:`6aa50d3050e2ca407d589c585abaee78048c69406bdcf8efb9a09409e226bd71`,Step_0:`308346bcb005d72df77233882c82b105ef9c5ec11ee4e0b27c1459e234a1418c`}}},vt={scr_enemy_object_init:`function scr_enemy_object_init()
{
    becomeflash = 0;
    flash = 0;
    turnt = 0;
    turns = 0;
    talktimer = 0;
    state = 0;
    siner = 0;
    fsiner = 0;
    talked = 0;
    attacked = 0;
    hurt = 0;
    hurttimer = 0;
    hurtshake = 0;
    shakex = 0;
    acting = 0;
    actcon = 0;
    mywriter = 343249823;
    acttimer = 0;
    con = 0;
    dodgetimer = 0;
    fatal = 0;
    candodge = 0;
    mytarget = 0;
    ambushed = 0;
    firststrike = 0;
    damage = -1;
    grazepoints = -1;
    timepoints = -1;
    inv = -1;
    target = -1;
    grazed = -1;
    grazetimer = -1;
    element = "none";
    acting = 0;
    actingsus = 0;
    actingnoe = 0;
    actingral = 0;
    actconsus = 0;
    actconral = 0;
    actconnoe = 0;
    simulorderkri = -1;
    simulordersus = -1;
    simulorderral = -1;
    simulordernoe = -1;
    simultotal = 0;
    simulboss = -1;
    talkmax = 90;
    mercymod = 0;
    maxmercy = 100;
    recruitable = 1;
    freezable = 1;
    recruitcount = 1;
    sactionboxx = 0;
    sactionboxy = 0;
    hurtspriteoffx = 0;
    hurtspriteoffy = 0;
    image_xscale = 2;
    image_yscale = 2;
    image_speed = 0.2;
    idlesprite = spr_diamond_knight_overworld;
    hurtsprite = spr_diamond_knight_hurt;
    sparedsprite = spr_diamond_knight_spared;
    custombody = 0;
    for (i = 0; i < 10; i++)
    {
        _charactsprite[i] = 382938298329;
    }
    depth = 90 - ((y - cameray()) / 50);
}
`,scr_isphase:`function scr_isphase(arg0)
{
    __isphase = 0;
    if (arg0 == "menu" && global.myfight == 0)
    {
        __isphase = 1;
    }
    if (arg0 == "acting" && global.myfight == 3)
    {
        __isphase = 1;
    }
    if (arg0 == "victory" && global.myfight == 7)
    {
        __isphase = 1;
    }
    if (arg0 == "attack" || arg0 == "fight")
    {
        if (global.myfight == 1)
        {
            __isphase = 1;
        }
    }
    if (arg0 == "spell" || arg0 == "item")
    {
        if (global.myfight == 4)
        {
            __isphase = 1;
        }
    }
    if (arg0 == "enemytalk" || arg0 == "balloon")
    {
        if (global.mnfight == 1)
        {
            __isphase = 1;
        }
    }
    if (arg0 == "enemyattack" || arg0 == "bullets")
    {
        if (global.mnfight == 2)
        {
            __isphase = 1;
        }
    }
    return __isphase;
}
`,scr_mercyadd:`function scr_mercyadd(arg0, arg1)
{
    global.mercymod[arg0] += arg1;
    if (global.mercymod[arg0] < 0)
    {
        global.mercymod[arg0] = 0;
    }
    if (global.mercymod[arg0] >= 100)
    {
        global.mercymod[arg0] = 100;
    }
    var _playsound = 1;
    if (arg1 <= 0)
    {
        _playsound = 0;
    }
    if (i_ex(obj_dmgwriter))
    {
        with (obj_dmgwriter)
        {
            if (type == 5)
            {
                _playsound = 0;
            }
        }
    }
    if (_playsound)
    {
        var _pitch = 0.8;
        if (arg1 < 99)
        {
            _pitch = 1;
        }
        if (arg1 <= 50)
        {
            _pitch = 1.2;
        }
        if (arg1 <= 25)
        {
            _pitch = 1.4;
        }
        snd_play_x(snd_mercyadd, 0.8, _pitch);
    }
    __mercydmgwriter = instance_create(global.monsterx[arg0], (global.monstery[arg0] + 20) - (global.hittarget[arg0] * 20), obj_dmgwriter);
    __mercydmgwriter.damage = arg1;
    __mercydmgwriter.type = 5;
    global.hittarget[arg0]++;
}
`,scr_turntimer:`function scr_turntimer(arg0)
{
    if (global.turntimer < arg0)
    {
        global.turntimer = arg0;
    }
}
`,scr_bulletspawner:`function scr_bulletspawner(arg0, arg1, arg2)
{
    __dc = instance_create(arg0, arg1, arg2);
    __dc.creator = myself;
    __dc.target = mytarget;
    __dc.damage = global.monsterat[myself] * 5;
    return __dc;
}
`,scr_rememberxy:`function scr_rememberxy()
{
    ___myrememberx = x;
    ___myremembery = y;
}
`,scr_move_to_point_over_time:`function scr_move_to_point_over_time(arg0, arg1, arg2)
{
    _mmm = instance_create(x, y, obj_move_to_point);
    _mmm.target = id;
    _mmm.movex = arg0;
    _mmm.movey = arg1;
    _mmm.movemax = arg2;
    return _mmm;
}
`,scr_move_to_rememberxy:`function scr_move_to_rememberxy(arg0)
{
    scr_move_to_point_over_time(___myrememberx, ___myremembery, arg0);
}
`,scr_enemyblcon:`function scr_enemyblcon(arg0, arg1, arg2)
{
    if (arg2 == 0)
    {
        mywriter = instance_create(arg0, arg1, obj_writer);
        return mywriter;
    }
    if (arg2 == 1)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        return myblcon;
    }
    if (arg2 == 2)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_v;
        return myblcon;
    }
    if (arg2 == 3)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_long;
        return myblcon;
    }
    if (arg2 == 4)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_clubs;
        myblcon.image_index = 0;
        myblcon.image_speed = 0;
        return myblcon;
    }
    if (arg2 == 5)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_clubs;
        myblcon.image_index = 1;
        myblcon.image_speed = 0;
        return myblcon;
    }
    if (arg2 == 6)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_clubs;
        myblcon.image_index = 2;
        myblcon.image_speed = 0;
        return myblcon;
    }
    if (arg2 == 7)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_long_r;
        myblcon.image_index = 2;
        myblcon.image_speed = 0;
        return myblcon;
    }
    if (arg2 == 8)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_long_tall;
        return myblcon;
    }
    if (arg2 == 10)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_long;
        myblcon.auto_length = 1;
        return myblcon;
    }
}
`,scr_blconskip:`function scr_blconskip(arg0)
{
    if (arg0 >= 0)
    {
        if (button1_p() && talktimer > arg0)
        {
            talktimer = talkmax;
        }
        talktimer += 1;
        if (talktimer >= talkmax)
        {
            with (obj_writer)
            {
                instance_destroy();
            }
            global.mnfight = 2;
        }
    }
    else if (arg0 == -1)
    {
        if (instance_exists(obj_writer) == false)
        {
            global.mnfight = 2;
        }
    }
    else if (arg0 == -2)
    {
        talktimer += 1;
        if (talktimer > 15)
        {
            talktimer = talkmax;
        }
        if (talktimer >= talkmax)
        {
            with (obj_writer)
            {
                instance_destroy();
            }
            global.mnfight = 2;
        }
    }
}
`,scr_var:`function scr_var(arg0, arg1)
{
    variable_instance_set(id, arg0, arg1);
}
`},yt=`function scr_debug()
{
    return 0;
}
`,bt=`function scr_dark_marker(arg0, arg1, arg2)
{
    thismarker = instance_create(arg0, arg1, obj_marker);
    with (thismarker)
    {
        sprite_index = arg2;
        image_speed = 0;
        image_xscale = 2;
        image_yscale = 2;
    }
    return thismarker;
}
`,xt={...vt,scr_debug:yt,scr_dark_marker:bt};function St(e){let t={...e,scripts:{...xt,...e.scripts}},n=_t.obj_spamton_neo_enemy,r=G(t,n.metadata,n.sources);return r.events.user0=gt,r}function Ct(e){let t={...e,scripts:{...xt,...e.scripts}},n={};for(let[e,r]of Object.entries(_t))e!==`obj_spamton_neo_enemy`&&(n[e]=G(t,r.metadata,r.sources));return n}var wt=[{metadata:{index:636,name:`obj_heart`,parent:null,sprite:`spr_dodgeheart`,mask:`spr_dodgeheartmask`,solid:!1,depth:0,visible:!0},sources:{CleanUp_0:`if (snd_is_playing(snd_chargeshot_charge))
{
    snd_stop(snd_chargeshot_charge);
}
`,Collision_obj_collidebullet:`with (other)
{
    event_user(5);
}
`,Create_0:`global.sp = 4;
wspeed = global.sp;
image_speed = 0;
fly = 0;
darken = 1;
darkamt = 0;
dmgnoise = 0;
chargeshot_sound = -1;
canmove = 1;
instance_create(x + 10, y + 10, obj_grazebox);
boundaryup = 0;
color = 0;
z_hold = 0;
siner = 0;
z_charge = 0;
f = 2;
z_hold_f = 0;
chargeshot_delay = 0;
superchargetimer = 0;
chargeshotcount = 0;
disableslow = 0;
if (button2_h())
{
    disableslow = 1;
}
remove_slow_z_buffer = 40;
`,Draw_0:`if (color == 1)
{
    z_charge_nolimit = z_hold - 35;
    if (z_charge_nolimit >= 0)
    {
        var scale = abs(sin(z_charge_nolimit / 10));
        draw_sprite_ext(sprite_index, 0, x - (scale * 10), y - (scale * 10), 1 + scale, 1 + scale, image_angle, image_blend, 0.3);
        scale = abs(sin(z_charge_nolimit / 14));
        draw_sprite_ext(sprite_index, 0, x - 2 - (scale * 10), y - 2 - (scale * 10), 1.2 + scale, 1.2 + scale, image_angle, image_blend, 0.3);
    }
    if (z_hold >= 15)
    {
        z_charge = z_hold - 15;
        if (z_charge >= 35)
        {
            z_charge = 35;
        }
        for (i = 0; i < 4; i += 1)
        {
            rotx = (i * 90) + (z_charge * 5);
            xx = sin(degtorad(rotx)) * (35 - z_charge);
            yy = cos(degtorad(rotx)) * (35 - z_charge);
            draw_sprite_ext(spr_yheart_charge, 0, (x + 9) - xx, (y + 10) - yy, 4 - ((z_charge * 2) / 35), 4 - ((z_charge * 2) / 35), 0, c_white, z_charge / 5);
        }
    }
    if (global.chapter == 2 && instance_exists(obj_spamton_neo_enemy) && obj_spamton_neo_enemy.bigshotcount > 0)
    {
        superchargetimer++;
        var scale = abs(sin(superchargetimer / 10));
        draw_sprite_ext(sprite_index, 0, x - (scale * 10), y - (scale * 10), 1 + scale, 1 + scale, image_angle, c_orange, 0.5);
        scale = abs(sin(z_charge_nolimit / 14));
        draw_sprite_ext(sprite_index, 0, x - 2 - (scale * 10), y - 2 - (scale * 10), 1.2 + scale, 1.2 + scale, image_angle, c_orange, 0.5);
    }
}
draw_self();
`,Step_0:`wallcheck = 0;
press_l = 0;
press_r = 0;
press_d = 0;
press_u = 0;
bkx = 0;
bky = 0;
bkxy = 0;
jelly = 2;
if (left_h())
{
    press_l = 1;
}
if (right_h())
{
    press_r = 1;
}
if (up_h())
{
    press_u = 1;
}
if (down_h())
{
    press_d = 1;
}
px = 0;
py = 0;
if (canmove)
{
    if (press_r == 1)
    {
        px = wspeed;
    }
    if (press_l == 1)
    {
        px = -wspeed;
    }
    if (press_d == 1)
    {
        py = wspeed;
    }
    if (press_u == 1)
    {
        py = -wspeed;
    }
    if (button2_h() && global.flag[22] == 0)
    {
        if (disableslow == 0)
        {
            px = ceil(px * 0.5);
            py = ceil(py * 0.5);
        }
    }
    else
    {
        disableslow = 0;
    }
}
if (color == 0)
{
    remove_slow_z_buffer += 0.5;
}
xmeet = 0;
ymeet = 0;
xymeet = 0;
if (place_meeting(x + px, y + py, obj_battlesolid))
{
    xymeet = 1;
}
if (place_meeting(x + px, y, obj_battlesolid))
{
    if (place_meeting(x + px, y, obj_battlesolid))
    {
        for (g = wspeed; g > 0; g -= 1)
        {
            mvd = 0;
            if (press_d == 0 && !place_meeting(x + px, y - g, obj_battlesolid))
            {
                y -= g;
                py = 0;
                break;
                mvd = 1;
            }
            if (press_u == 0 && mvd == 0 && !place_meeting(x + px, y + g, obj_battlesolid))
            {
                y += g;
                py = 0;
                break;
            }
        }
    }
    xmeet = 1;
    bkx = 0;
    if (px > 0)
    {
        for (i = px; i >= 0; i -= 1)
        {
            if (!place_meeting(x + i, y, obj_battlesolid))
            {
                px = i;
                bkx = 1;
                break;
            }
        }
    }
    if (px < 0)
    {
        for (i = px; i <= 0; i += 1)
        {
            if (!place_meeting(x + i, y, obj_battlesolid))
            {
                px = i;
                bkx = 1;
                break;
            }
        }
    }
    if (bkx == 0)
    {
        px = 0;
    }
}
if (place_meeting(x, y + py, obj_battlesolid))
{
    ymeet = 1;
    bky = 0;
    if (place_meeting(x, y + py, obj_battlesolid))
    {
        for (g = wspeed; g > 0; g -= 1)
        {
            mvd = 0;
            if (press_r == 0 && !place_meeting(x - g, y + py, obj_battlesolid))
            {
                x -= g;
                px = 0;
                break;
                mvd = 1;
            }
            if (mvd == 0 && press_l == 0 && !place_meeting(x + g, y + py, obj_battlesolid))
            {
                x += g;
                px = 0;
                break;
            }
        }
    }
    if (py > 0)
    {
        for (i = py; i >= 0; i -= 1)
        {
            if (!place_meeting(x, y + i, obj_battlesolid))
            {
                py = i;
                bky = 1;
                break;
            }
        }
    }
    if (py < 0)
    {
        for (i = py; i <= 0; i += 1)
        {
            if (!place_meeting(x, y + i, obj_battlesolid))
            {
                py = i;
                bky = 1;
                break;
            }
        }
    }
    if (bky == 0)
    {
        py = 0;
    }
}
if (place_meeting(x + px, y + py, obj_battlesolid))
{
    xymeet = 1;
    bkxy = 0;
    i = px;
    j = py;
    while (j != 0 || i != 0)
    {
        if (!place_meeting(x + i, y + j, obj_battlesolid))
        {
            px = i;
            py = j;
            bkxy = 1;
            break;
        }
        if (abs(j) >= 1)
        {
            if (j > 0)
            {
                j -= 1;
            }
            if (j < 0)
            {
                j += 1;
            }
        }
        else
        {
            j = 0;
        }
        if (abs(i) >= 1)
        {
            if (i > 0)
            {
                i -= 1;
            }
            if (i < 0)
            {
                i += 1;
            }
        }
        else
        {
            i = 0;
        }
    }
    if (bkxy == 0)
    {
        px = 0;
        py = 0;
    }
}
if ((x + px) >= ((__view_get(e__VW.XView, 0) + 640) - sprite_width))
{
    px = (__view_get(e__VW.XView, 0) + 640) - sprite_width - x;
}
if ((x + px) <= 0)
{
    px = -x;
}
if ((y + py) <= 0)
{
    py = -y;
}
if ((y + py) >= (((__view_get(e__VW.YView, 0) + 320) - sprite_height) + boundaryup))
{
    py = ((__view_get(e__VW.YView, 0) + 320) - sprite_height - y) + boundaryup;
}
x += px;
y += py;
if (dmgnoise == 1)
{
    dmgnoise = 0;
    snd_stop(snd_hurt1);
    snd_play(snd_hurt1);
}
global.inv -= 1;
if (global.inv > 0)
{
    image_speed = 0.25;
}
else
{
    image_speed = 0;
    image_index = 0;
}
global.heartx = (x + 2) - __view_get(e__VW.XView, 0);
global.hearty = (y + 2) - __view_get(e__VW.YView, 0);
if (color == 1)
{
    wspeed = 5;
    if (chargeshot_delay > 0)
    {
        chargeshot_delay--;
    }
    if (button1_p() || (z_hold >= 10 && z_hold <= 39 && button1_r()))
    {
        if (instance_number(obj_yheart_shot) < 3 && chargeshot_delay == 0)
        {
            instance_create(x + 10, y + 10, obj_yheart_shot);
            snd_play(snd_heartshot_dr_b);
        }
    }
    if (z_hold == 20)
    {
        chargeshot_sound = snd_loop(snd_chargeshot_charge);
        snd_pitch(chargeshot_sound, 0.1);
        snd_volume(chargeshot_sound, 0, 0);
        snd_volume(chargeshot_sound, 0.3, 20);
    }
    if (z_hold >= 20 && z_hold < 40)
    {
        snd_pitch(chargeshot_sound, 0.1 + ((z_hold - 20) / 20));
    }
    if (z_hold >= 40)
    {
        image_index = 2;
    }
    if (z_charge < 15)
    {
        chargeshotcount = 0;
    }
    if (z_hold >= 40 && button1_r())
    {
        snd_stop(chargeshot_sound);
        snd_play(snd_chargeshot_fire);
        bigshot = instance_create(x + 10, y + 10, obj_yheart_shot);
        bigshot.big = 1;
        bigshot.sprite_index = spr_yheart_bigshot;
        bigshot.hspeed = 4 * f;
        bigshot.friction = -0.2 * f;
        bigshot.image_alpha = 0.5;
        bigshot.image_xscale = 0.1;
        bigshot.image_yscale = 2;
        z_hold = 0;
        chargeshot_delay = 5;
        image_index = 0;
        chargeshotcount++;
        if (chargeshotcount > 1)
        {
            with (obj_spamton_neo_enemy)
            {
                event_user(4);
            }
        }
        if (global.chapter == 2 && instance_exists(obj_spamton_neo_enemy))
        {
            obj_spamton_neo_enemy.bigshotused = 1;
        }
        if (global.chapter == 2 && instance_exists(obj_spamton_neo_enemy) && obj_spamton_neo_enemy.bigshotcount > 0)
        {
            bigshot.hspeed = 10 * f;
            bigshot.trail = 1;
            obj_spamton_neo_enemy.bigshotcount--;
            if (obj_spamton_neo_enemy.bigshotcount == 0)
            {
                instance_create(x, y, obj_supercharge_end);
                snd_play(snd_stardrop);
                var a = random(45);
                repeat (8)
                {
                    part = instance_create(other.x + 10, other.y + 10, obj_yheart_sneo_particle);
                    part.direction = a + random(15);
                    part.image_xscale = 2 + random(2);
                    part.image_yscale = 2 + random(2);
                    part.speed = 16;
                    part.friction = 0.8;
                    a += 45;
                }
            }
            else
            {
                var a = random(45);
                repeat (8)
                {
                    part = instance_create(other.x + 10, other.y + 10, obj_yheart_sneo_particle);
                    part.direction = a + random(15);
                    part.speed = 8;
                    part.friction = 0.8;
                    a += 45;
                }
            }
        }
    }
    if (button1_h())
    {
        if (global.chapter == 2 && instance_exists(obj_spamton_neo_enemy) && obj_spamton_neo_enemy.bigshotcount > 0)
        {
            z_hold_f += 1;
        }
        z_hold_f += 1;
    }
    else
    {
        z_hold_f = 0;
        snd_stop(chargeshot_sound);
    }
    z_hold = z_hold_f * 2;
}

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`},sha256:{CleanUp_0:`7e914d57f6f3572dc61d9bb8920aae6a7d54f1ddf98e1507e38a7ac4a1095854`,Collision_obj_collidebullet:`80e2460fd5c7502f6067991b01e3a1a2b30fe913f41d562b5c3b01c1e80782fc`,Create_0:`07421aa8a436a02f4cc1f8bb135beb9a40395d1c4325b15d0a652d7fd001cf39`,Draw_0:`42e192009f355c8222f901c856049d8b71a5b19436dc61bcdaf904f47223db93`,Step_0:`1b48d2c7d053db4e326c786d9eb5c81fd3b61a0d10a7157983a318fe8c74dbb8`}},{metadata:{index:367,name:`obj_grazebox`,parent:null,sprite:`spr_grazeappear`,mask:`spr_grazemask`,solid:!1,depth:0,visible:!0},sources:{Collision_obj_collidebullet:`if (!other.active)
{
    exit;
}
var _grazetpfactor = grazetpfactor;
var _grazetimefactor = grazetimefactor;
with (other)
{
    if (global.inv < 0)
    {
        if (grazed == 1)
        {
            scr_tensionheal((grazepoints / 30) * _grazetpfactor);
            if (global.turntimer >= 10)
            {
                global.turntimer -= ((timepoints / 30) * _grazetimefactor);
            }
            with (obj_grazebox)
            {
                if (grazetimer >= 0 && grazetimer < 4)
                {
                    grazetimer = 3;
                }
                if (grazetimer < 2)
                {
                    grazetimer = 2;
                }
            }
        }
        if (grazed == 0)
        {
            grazed = 1;
            scr_tensionheal(grazepoints * _grazetpfactor);
            if (global.turntimer >= 10)
            {
                global.turntimer -= (timepoints * _grazetimefactor);
            }
            with (obj_battlecontroller)
            {
                grazenoise = 1;
            }
            with (obj_grazebox)
            {
                grazetimer = 10;
            }
        }
    }
}
`,Create_0:`grazetimer = 0;
grazetpfactor = 1;
grazetimefactor = 1;
grazesizefactor = 1;
grazetpfactor += (scr_armorcheck_equipped_party(15) * 0.1);
grazetimefactor += (scr_armorcheck_equipped_party(14) * 0.1);
grazesizefactor += (scr_armorcheck_equipped_party(3) * 0.2);
grazesizefactor += (scr_armorcheck_equipped_party(9) * 0.25);
if (grazetimefactor > 3)
{
    grazetimefactor = 3;
}
if (grazetpfactor > 3)
{
    grazetpfactor = 3;
}
if (grazesizefactor > 3)
{
    grazesizefactor = 3;
}
image_xscale = grazesizefactor;
image_yscale = grazesizefactor;
if (instance_exists(obj_heart))
{
    sizexoff = 0;
    sizeyoff = 0;
    x = obj_heart.x + 10 + sizexoff;
    y = obj_heart.y + 10 + sizeyoff;
}
`,Draw_0:`if (grazetimer > 0)
{
    draw_sprite_ext(sprite_index, 0, x, y, 1, 1, 0, c_white, grazetimer / 6);
    draw_sprite_ext(sprite_index, 3, x, y, 1, 1, 0, c_white, (grazetimer / 6) - 0.2);
    if (image_xscale > 1)
    {
        draw_sprite_ext(sprite_index, 0, x, y, image_xscale, image_yscale, 0, c_white, grazetimer / 6);
        draw_sprite_ext(sprite_index, 3, x, y, image_xscale, image_yscale, 0, c_white, (grazetimer / 6) - 0.2);
    }
}
grazetimer -= 1;
`,Step_2:`if (instance_exists(obj_heart))
{
    sizexoff = 0;
    sizeyoff = 0;
    x = obj_heart.x + 10 + sizexoff;
    y = obj_heart.y + 10 + sizeyoff;
}
else
{
    instance_destroy();
}
`},sha256:{Collision_obj_collidebullet:`50b7b3fa14bde1294a152dfe0fea65d33ebb09576803ecfcdb864f5327d40b4b`,Create_0:`9334fea02ed54bb8398e52fbfdc1cf576bc1fcf47fe59c4239ca40a14c5671f6`,Draw_0:`6bd5d0b7f4092d0f8b22f149f0c33c5454f5bccef3de527b31dffce5e1bb52ad`,Step_2:`495ddadf0cf56ceaa408b9a989e1f7f9a30b2d1ca70353b279106cecc0f10d7c`}},{metadata:{index:610,name:`obj_yheart_sneo_particle`,parent:null,sprite:`spr_yheart_charge`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_xscale = 1 + random(2);
image_yscale = 1 + random(2);
timer = 0;
`,Step_0:`timer++;
image_xscale = lerp(image_xscale, 0, timer / 20);
image_yscale = lerp(image_yscale, 0, timer / 20);
if (timer == 20)
{
    instance_destroy();
}
`},sha256:{Create_0:`f85e3931b6ab63ccec68ee57cf79ee54de87b5034b5e2b9a85d2a586aaa96340`,Step_0:`69662d813c81af3d5f54c6b13f337aa0ccbdab7c8ba9f32dd3f78c175c58f9b4`}},{metadata:{index:611,name:`obj_supercharge_end`,parent:null,sprite:`spr_supercharge_end`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_speed = 0.5;
timer = 0;
image_xscale = 1.5;
image_yscale = 1.5;
`,Draw_0:`timer++;
if (timer == 16)
{
    instance_destroy();
}
if (timer >= 96)
{
    instance_destroy();
}
`,Other_7:`exit;
`},sha256:{Create_0:`d98eea2003ff623f48788f657d08f84db0187d0eeda3111700916e0b91f5a46d`,Draw_0:`81c1793d30bc991827e0361053277f99341f38c32c0d43e542879a6e90de3e15`,Other_7:`729164ba3b62266d609e614e2e990d3529d0497cf9780904ba46244c441336bf`}}];function Tt(e){let t={},n={...e,object:n=>t[n]??e.object(n)};for(let e of wt)t[e.metadata.name]=G(n,e.metadata,e.sources);return t}var Et=(e,t)=>{let n=e.first(t);if(!n)throw Error(`Spamton NEO source requires ${t.name}`);return n};function Dt(e,t,n){let r=D(e.object,`user${n}`);if(!r)throw Error(`${e.object.name} requires source user${n}`);r(e,t)}function Ot(e){for(let t of[`neo`,`heart`,`faceAttack`,`finalForm`,`wireheart`])if(!e[t])throw Error(`Spamton NEO projectiles require ${t}`);let t={name:`obj_yshot_anim`,index:602,sprite:`spr_yheart_shot_hit`,events:{create:e=>{e.f=2,e.imageSpeed=.25*e.f},step:(e,t)=>{f(e.imageIndex,(e.sprite?t.bank.get(e.sprite)?.frames??0:0)-1)&&t.destroy(e)}}},n={name:`obj_yheart_shot_afterimage`,index:609,events:{step:(e,t)=>{e.imageAlpha-=.1,U(e.imageAlpha,0)&&t.destroy(e)}}};return{shot:{name:`obj_yheart_shot`,index:596,sprite:`spr_yheart_shot`,events:{create:(t,n)=>{Object.assign(t,{f:2,makeanim:1,big:0,damage:1,sucked:0,trail:0,trail_timer:0}),t.hspeed=8*t.f;let r=n.first(e.neo);r&&f(r.upgrade,0)&&(t.big=1,t.sprite=`spr_yheart_bigshot`,t.hspeed=9,t.friction=-.4,t.imageAlpha=.5,t.imageXscale=.1,t.imageYscale=2,t.imageIndex=0,t.damage=4,T(n.globals.chapter,2)&&n.exists(e.neo)&&(r.bigshotused=1))},step:(t,r)=>{T(t.big,1)&&(t.damage=4,t.imageAlpha+=.1*t.f,U(t.imageXscale,1)&&(t.imageXscale+=.1*t.f),f(t.imageYscale,1)&&(t.imageYscale-=.1*t.f)),O(t.x,r.view.x+700)&&r.destroy(t),O(t.y,r.view.y+520)&&r.destroy(t),_(t.y,r.view.y-40)&&r.destroy(t);let a=r.first(e.faceAttack);O(t.x,r.view.x+500)&&U(t.x,r.view.x+530)&&a&&T(a.init,1)&&(r.userEvent(t,0),r.sound?.(`snd_bell`));let o=r.first(e.finalForm);if(T(t.sucked,1)&&o&&(U(t.y,o.y+146)&&t.y++,f(t.y,o.y+146)&&t.y--,t.direction=i(t.x,t.y,o.x+122,o.y+146),t.gravityDirection=i(t.x,t.y,o.x+122,o.y+146)),T(t.trail,1)&&(t.trail_timer++,T(t.trail_timer,2))){t.trail_timer=0;let e=r.create(n,t.x-10,t.y);t.after=e.id,e.imageSpeed=0,e.sprite=`spr_yheart_bigshot_trail`,e.imageXscale=.8,e.imageYscale=.5,e.imageIndex=t.imageIndex,e.speed=0,e.friction=0,e.depth=t.depth,e.direction=180}},user0:(n,r)=>{if(n.makeanim){let i=r.create(t,n.x,n.y);n.myanim=i.id,i.sprite=`spr_yheart_shot_hit`,T(n.big,1)&&(i.imageXscale=3,i.imageYscale=3);let a=r.first(e.heart);a&&(i.depth=a.depth-100)}r.destroy(n)},user1:(e,n)=>{let r=n.create(t,e.x,e.y);e.myanim=r.id,r.sprite=`spr_yheart_shot_hit_noeffect`,n.destroy(e)},user2:(t,n)=>{if(T(t.sucked,0)){t.sucked=1;let r=Et(n,e.finalForm);t.direction=i(t.x,t.y,r.x+122,r.y+146),t.gravityDirection=i(t.x,t.y,r.x+122,r.y+146),t.hspeed=0,t.speed=3.5,t.friction=0,t.gravity=.3}}}},impact:t,trail:n,collisions:{basicBullet:(e,n,r)=>{if(T(e.destroyable,1)){T(n.big,0)&&r.userEvent(n,0);let i=r.create(t,e.x,e.y);e.anim=i.id,i.imageXscale=e.imageXscale,i.imageYscale=e.imageYscale,i.sprite=`spr_yheart_shot_hit3`,r.destroy(e)}else T(e.destroyable,-1)&&r.userEvent(n,0)},flyingHead:(t,n,r)=>{t.hitshot=n.id,Dt(t,r,0);let i=r.globals;i.tension+=T(Et(r,e.neo).difficulty,3)?1:1.3,f(i.tension,i.maxtension)&&(i.tension=i.maxtension)},wireheart:(t,n,r)=>{if(f(t.invincibility_timer,0)&&T(n.big,0)){r.destroy(n);return}t.invincibility_timer=10;let i=r.globals;if(U(i.turntimer,150)){if(t.hp=0,T(t.type,0)||T(t.type,1)&&f(Et(r,e.neo).difficulty,2)&&f(i.turntimer,20)){i.turntimer=20;for(let t of r.all(e.wireheart))t.hp=0,t.destroyed=1}}else T(t.type,0)||T(t.type,1)&&f(Et(r,e.neo).difficulty,2)?T(n.big,1)?(i.turntimer-=80-t.chargeshothitcount*10,U(t.chargeshothitcount,3)&&t.chargeshothitcount++):(i.turntimer-=20-t.normalshothitcount,U(t.normalshothitcount,10)&&t.normalshothitcount++):T(n.big,1)?t.hp-=5:t.hp--;r.destroy(n),t.damagetimer=5,r.sound?.(`snd_damage`),_(t.hp,0)&&(t.destroyed=1)},facePart:(t,n,r)=>{if(T(t.type,0)||U(t.imageAlpha,.9))return;if(T(t.broken,1)){r.sound?.(`snd_bell`),r.userEvent(n,0);return}if(f(t.invincibilitytimer,0)&&T(n.big,0)){r.destroy(n);return}t.shake=6;let i=Et(r,e.neo),a=T(n.big,0)?1:T(i.hellmode,1)?2:4;T(t.type,1)&&(i.eyeshp-=a),T(t.type,2)&&(i.nosehp-=a),T(t.type,3)&&(i.mouthhp-=a),r.sound?.(`snd_damage`),t.invincibilitytimer=10,t.hurtflashtimer=3,(T(t.type,1)&&_(i.eyeshp,0)||T(t.type,2)&&_(i.nosehp,0)||T(t.type,3)&&_(i.mouthhp,0))&&(t.broken=1,t.imageIndex=2,r.sound?.(`snd_rocket`),t.explodetimer=16),r.userEvent(n,0)},hitDetector:()=>{}}}}var kt=[{metadata:{index:603,name:`obj_sneo_guymaker`,parent:`obj_bulletparent`,sprite:`spr_sneo_bullet_crew`,mask:null,solid:!1,depth:0,visible:!1},sources:{Alarm_0:`instance_destroy();
`,Create_0:`type = 4;
if (obj_spamton_neo_enemy.difficulty == 0)
{
    type = 1;
}
if (obj_spamton_neo_enemy.difficulty == 1)
{
    type = 2;
}
if (obj_spamton_neo_enemy.difficulty == 2)
{
    type = 3;
}
if (obj_spamton_neo_enemy.difficulty == 3)
{
    type = 4;
}
if (instance_exists(obj_sneo_heartattack))
{
    type = 5;
}
if (obj_spamton_neo_enemy.difficulty == 6)
{
    type = 6;
}
if (obj_spamton_neo_enemy.difficulty == 7)
{
    type = 7;
}
timer = 0;
prevrow = 0;
row = 0;
prevrowy = 0;
spawncount = 0;
firstspawn = 0;
`,Step_0:`xx = __view_get(e__VW.XView, 0);
yy = __view_get(e__VW.YView, 0);
timer++;
if (type == 1 || type == 2 || type == 3 || type == 4 || type == 5 || type == 6 || type == 7)
{
    if (timer == 1)
    {
        if (type == 1)
        {
            row = choose(0, 1);
            if (prevrow == 2)
            {
                row = choose(0, 1);
            }
        }
        if (type == 2)
        {
            var aa = choose(0, 1, 2);
            if (prevrowy == 0)
            {
                aa = choose(1, 2);
            }
            if (prevrowy == 1)
            {
                aa = choose(0, 2);
            }
            if (prevrowy == 2)
            {
                aa = choose(0, 1);
            }
            rowy = (yy + 210) - (46 * aa);
            prevrowy = aa;
            row = 2;
        }
        if (type == 3 || type == 4)
        {
            rowy = (yy + 210) - (40 * choose(0, 1));
            row = choose(0, 1, 3, 6);
            if (prevrow == 2)
            {
                row = choose(0, 1, 3, 6);
            }
            if (prevrow == 3)
            {
                row = choose(0, 1);
            }
            if (row == 3 && firstspawn == 0)
            {
                row = choose(0, 1);
            }
            firstspawn = 1;
        }
        if (type == 5)
        {
            rowy = (yy + 210) - (40 * choose(0, 1, 2));
            row = choose(0, 1, 2, 2, 3, 6);
            if (prevrow == 2)
            {
                row = choose(0, 1, 3, 6);
            }
            if (prevrow == 3)
            {
                row = choose(0, 1, 2);
            }
        }
        if (type == 6)
        {
            row = 6;
        }
        if (type == 7)
        {
            row = 7;
        }
    }
    if (timer == 5 || timer == 10 || timer == 15 || timer == 20)
    {
        if (row == 0 || row == 1 || row == 2)
        {
            guy = instance_create(xx + 700, yy + 280, obj_sneo_lilguy);
            guy.hspeed = -18;
            guy.friction = -0.1;
            guy.vspeed = -2;
            guy.alarm[0] = 44;
            guy.alarm[1] = 40;
            guy.alarm[2] = 32;
            guy.gravity = 0.5;
            guy.gravity_direction = 0;
            guy.destroyable = 1;
            guy.image_blend = #00A2E8;
            guy.changedirection = 0;
            guy.altdirection = 0;
            guy.altspeed = 4;
            guy.altfriction = -0.2;
            guy.altgravity = 0;
            if (type == 2)
            {
                guy.alarm[0] = 44;
            }
            if (row == 1)
            {
                guy.y -= 240;
                guy.vspeed = -guy.vspeed;
            }
            if (row == 2)
            {
                guy.y -= 120;
                guy.vspeed = 0;
                guy.hspeed = -21;
            }
            if (row == 2 && type == 2)
            {
                guy.hspeed = -21;
                guy.gravity = 0;
                guy.friction = 0.5;
                guy.alarm[0] = 36;
                guy.changedirection = 1;
                guy.altdirection = guy.direction;
            }
            if ((type == 2 || type == 3 || type == 4 || type == 5) && row == 2)
            {
                guy.y = rowy;
            }
        }
        if (row == 3 && timer != 20)
        {
            for (guyi = 0; guyi < 2; guyi++)
            {
                guy[guyi] = instance_create(xx + 300, (yy - 40) + (400 * guyi), obj_sneo_lilguy);
                guy[guyi].vspeed = 18 - (36 * guyi);
                guy[guyi].alarm[0] = 44;
                guy[guyi].alarm[1] = 40;
                guy[guyi].alarm[2] = 32;
                guy[guyi].gravity = 0.8 - (1.6 * guyi);
                guy[guyi].gravity_direction = 90;
                guy[guyi].destroyable = 1;
            }
        }
        if (row == 6 && timer == 5)
        {
            spawncount = 2;
            var a = 0;
            repeat (spawncount)
            {
                guy = instance_create(xx + 410 + (a * 70), (yy - 20) + 0, obj_sneo_lilguy);
                guy.vspeed = 15;
                guy.alarm[0] = 44;
                guy.alarm[1] = 30;
                guy.alarm[2] = 32;
                guy.gravity = 0.53;
                guy.gravity_direction = 90;
                guy.destroyable = 1;
                guy = instance_create(xx + 445 + (a * 70), (yy - 20) + 400, obj_sneo_lilguy);
                guy.vspeed = -15;
                guy.alarm[0] = 44;
                guy.alarm[1] = 40;
                guy.alarm[2] = 32;
                guy.gravity = -0.53;
                guy.gravity_direction = 90;
                guy.destroyable = 1;
                a++;
            }
        }
        if (row == 7 && timer != 20)
        {
            guy = instance_create(xx + 630, yy + 100, obj_sneo_lilguy);
            guy.alarm[0] = 44;
            guy.alarm[1] = 40;
            guy.alarm[2] = 32;
            guy.destroyable = 1;
            with (guy)
            {
                path_start(path_sneo_head_path1, 11, path_action_stop, 0);
            }
        }
    }
    if (type == 2 && timer >= 41)
    {
        timer = 0;
    }
    if (type == 3 && timer >= 69)
    {
        timer = 0;
    }
    if (type == 6 && timer >= 69)
    {
        timer = 0;
    }
    if (type == 4 && timer >= 50)
    {
        timer = 0;
    }
    if (type == 5 && timer >= 69)
    {
        timer = 0;
    }
    if (timer >= 50)
    {
        timer = 0;
    }
    if (timer == 0)
    {
        prevrow = row;
    }
}

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`}},{metadata:{index:607,name:`obj_sneo_lilguy`,parent:`obj_collidebullet`,sprite:`spr_sneo_crew`,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`if (changedirection)
{
    direction = altdirection;
    gravity = altgravity;
    friction = altfriction;
    speed = altspeed;
}
`,Alarm_1:`if (instance_exists(obj_heart))
{
    bullet = instance_create(x, y + 12, obj_sneo_lilguy_bullet);
    bullet.bulletspeed = bulletspeed;
    bullet.depth = depth - 1;
    with (bullet)
    {
        move_towards_point(obj_heart.x + 8, obj_heart.y + 8, bulletspeed);
    }
}
image_index = 2;
image_speed = 1;
`,Alarm_2:`image_index = 1;
`,Collision_obj_yheart_shot:`hitshot = other;
event_user(0);
if (obj_spamton_neo_enemy.difficulty == 3)
{
    scr_tensionheal(1);
}
else
{
    scr_tensionheal(1.3);
}
`,Create_0:`scr_bullet_init();
element = 6;
f = 2;
destroyable = 0;
angle_speed = 0;
yellowsiner = 0;
loop = 0;
loopy1 = 90;
loopy2 = 240;
falsevspeed = 0;
bighitbox = 0;
bighead = 0;
angleadjust = 0;
active = 1;
altdir = 0;
altspeed = 0;
altfriction = 0;
altgravity = 0;
changedirection = 0;
bulletspeed = 8;
image_speed = 0;
cutscene = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
`,Draw_0:`draw_self();
`,Other_10:`if (destroyable == 1)
{
    if (bighead && hitshot.big == 0)
    {
        snd_play_x(snd_bell, 0.8, 0.7 + random(0.1));
        with (hitshot)
        {
            x -= abs(hspeed);
            hspeed = -8;
            vspeed = choose(-8, 8, 10, -10);
            scr_doom(id, 90);
        }
    }
    else
    {
        if (hitshot.big == 0)
        {
            with (hitshot)
            {
                event_user(0);
            }
        }
        snd_volume(snd_bomb, 0.7, 0);
        snd_play_x(snd_bomb, 0.7, 1.1 + random(0.2));
        var _cut = scr_afterimage_cut();
        _cut.flash = true;
        instance_destroy();
    }
}
`,Other_7:`if (cutscene == 0)
{
    image_speed = 0;
}
`,Other_8:`instance_destroy();
`,Step_0:`if (cutscene == 0)
{
    if (x >= (camerax() + 1000) || x <= (camerax() - 200) || y >= (cameray() + 600) || y <= (cameray() - 200))
    {
        instance_destroy();
    }
}
direction += angle_speed;
if (angleadjust == 1)
{
    image_angle = direction;
}
if (destroyable == 1)
{
    yellowsiner++;
    image_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(yellowsiner / 3) * 0.25));
}
if (loop == 1)
{
    if (y < loopy1)
    {
        y = loopy2 - (loopy1 - y);
    }
    if (y > loopy2)
    {
        y = loopy1 + (y - loopy2);
    }
}
y += falsevspeed;
if (bighitbox == 1)
{
    hitshot = collision_rectangle(x, y, x + sprite_width, y + sprite_height, obj_yheart_shot, true, false);
    if (hitshot != -4)
    {
        event_user(0);
    }
}
`}},{metadata:{index:623,name:`obj_sneo_lilguy_bullet`,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_crew_bullet`,mask:null,solid:!1,depth:0,visible:!0},sources:{Step_0:`if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)
{
    instance_destroy();
}
image_angle += 36;
`}},{metadata:{index:637,name:`obj_sneo_biglaser`,parent:`obj_collidebullet`,sprite:`spr_sneo_laser`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_heart:`exit;
`,Collision_obj_sneo_lilguy:`exit;
`,Create_0:`scr_bullet_init();
element = 6;
destroyonhit = 0;
active = 0;
image_yscale = 0.05;
image_xscale = 0;
mask_index = spr_nothing;
firecon = 0;
effecttimer = 0;
siner = 0;
orbsize = 0;
instance_create(x, y, obj_sneo_biglaser_friendlyhitbox);
instance_create(x, y, obj_sneo_arm_laser_telegraph);
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 10;
grazed = 1;
_type = 0;
`,Destroy_0:`with (obj_sneo_arm_laser_telegraph)
{
    instance_destroy();
}
`,Draw_0:`if (firecon == 0)
{
    image_yscale = 0.001;
    image_xscale = 2;
    if (effecttimer <= 42 && (effecttimer % 6) == 0)
    {
        if (_type == 1)
        {
            for (i = 0; i < 3; i++)
            {
                d = instance_create(x, y, obj_rouxls_power_up_orb);
                d.direction = irandom(120) + (i * 120);
                d.lifetime = 16;
                d.depth = depth + 1;
                d.image_blend = image_blend;
                d.parenttarget = id;
                d._type = _type;
            }
        }
        else
        {
            for (i = 0; i < 6; i++)
            {
                d = instance_create(x, y, obj_rouxls_power_up_orb);
                d.direction = irandom(60) + (i * 60);
                d.lifetime = 16;
                d.depth = depth + 1;
                d.image_blend = image_blend;
                d.parenttarget = id;
                d._type = _type;
            }
        }
    }
    if (effecttimer > 50)
    {
        orbsize -= 4;
    }
    else
    {
        orbsize++;
    }
    draw_set_color(c_white);
    draw_circle(x, y, max(2, (orbsize / 2) + (sin(siner / 2) * 2)), 0);
    effecttimer++;
    siner++;
}
else if (firecon == 1)
{
    active = true;
    mask_index = spr_sneo_laser;
    if (image_yscale < 0.5)
    {
        image_yscale = scr_movetowards(image_yscale, 0.5, 0.1);
    }
    else
    {
        image_yscale -= 0.05;
    }
    draw_set_color(c_white);
    draw_circle(x, y, image_yscale * 100, 0);
    draw_self();
}
else if (firecon == 2)
{
    draw_set_color(c_white);
    active = 0;
    mask_index = spr_nothing;
    if (image_yscale <= 0.01)
    {
        image_yscale -= 0.0025;
    }
    else
    {
        image_yscale = scr_movetowards(image_yscale, 0.01, 0.1);
    }
    if (image_yscale <= 0)
    {
        instance_destroy();
    }
    draw_circle(x, y, image_yscale * 100, 0);
    draw_self();
}
`,Step_0:`if (obj_spamton_neo_enemy.difficulty == 2)
{
    with (obj_sneo_lilguy)
    {
        if (collision_line(obj_sneo_biglaser.x, obj_sneo_biglaser.y, obj_sneo_biglaser.x + lengthdir_x(10, obj_sneo_biglaser.direction), obj_sneo_biglaser.y + lengthdir_y(10, obj_sneo_biglaser.direction), obj_sneo_lilguy, true, false))
        {
        }
    }
}
`}},{metadata:{index:684,name:`obj_sneo_biglaser_friendlyhitbox`,parent:`obj_bulletparent`,sprite:`spr_sneo_laser_friendly`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_sneo_lilguy:`exit;
if (image_yscale <= 0)
{
    exit;
}
if (collision_line(x, y, x + lengthdir_x(600, image_angle), obj_sneo_biglaser.y + lengthdir_y(600, image_angle), obj_sneo_lilguy, true, false))
{
    d = instance_create(other.x, other.y, obj_sneo_crew_dissolve);
    d.direction = direction;
    d.depth = depth - 2;
    instance_destroy(other);
}
`,Create_0:`source = obj_sneo_biglaser;
image_blend = c_red;
depth = -99999999;
visible = false;
`,Step_2:`if (!i_ex(source))
{
    instance_destroy();
}
else
{
    x = source.x;
    y = source.y;
    image_xscale = source.image_xscale;
    image_yscale = max(source.image_yscale - 0.25, 0);
    image_angle = source.image_angle;
    direction = source.direction;
}
`}},{metadata:{index:671,name:`obj_sneo_arm_laser_telegraph`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`laserflash = 0;
`,Draw_0:`exit;
`,Step_0:`if (obj_spamton_neo_enemy.partmode != 3)
{
    instance_destroy();
}
if (instance_exists(obj_sneo_biglaser))
{
    depth = obj_sneo_biglaser.depth + 1;
}
if (instance_exists(obj_heart))
{
    depth = obj_heart.depth + 1;
}
`}},{metadata:{index:608,name:`obj_sneo_crew_dissolve`,parent:`obj_bulletparent`,sprite:`spr_sneo_crew_dissolve`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_blend = c_black;
speed = 2;
`,Step_0:`if (image_index >= 7)
{
    instance_destroy();
}
d = scr_afterimage();
d.image_index = image_index + 8;
d.direction = direction;
d.speed = 4;
`}}],At=[{metadata:{index:668,name:`obj_sneo_wall_controller`,parent:`obj_bulletparent`,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`if (turnaroundcon == 0)
{
    if (timer >= 3)
    {
        sinetargetspeed = -1.1;
    }
    alarm[0] = 98;
}
if (turnaroundcon == 1)
{
    if (timer >= 3)
    {
        sinetargetspeed = 1.2;
    }
}
turnaroundcon++;
`,Create_0:`siner = 0;
xx = __view_get(e__VW.XView, 0);
yy = __view_get(e__VW.YView, 0);
wallsize = 4;
sinespeed = 0;
sinetargetspeed = 1.2;
spawncount = 5;
alarm[0] = 172;
made = 0;
waittime = 125.66370614359172 / spawncount;
timer = waittime;
type = 3;
global.turntimer += 33;
brake = 0;
init = 0;
breakspotconsecutive = 1 + irandom(6);
breakspotpreviouscon = 0;
introtimer = 0;
turnaroundcon = 0;
difficulty = obj_spamton_neo_enemy.difficulty;
lilguytimer = -91;

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`,Other_10:`if (type < 3)
{
    timer++;
}
else
{
    timer += sinespeed;
}
if (sinespeed != sinetargetspeed)
{
    sinespeed = scr_movetowards(sinespeed, sinetargetspeed, 0.05);
}
if (sinetargetspeed < 0)
{
    exit;
}
if (type == 0)
{
    if (timer >= 25)
    {
        wallsize = 4;
        breakspot = floor(random(wallsize));
        wallamt = 1;
        if (floor(random(6)) == 0)
        {
            wallamt = 4;
        }
        for (j = 0; j < wallamt; j++)
        {
            for (i = 0; i < wallsize; i++)
            {
                bullet[i] = instance_create(xx + 470 + (25 * j), (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 25)) - 100, obj_basicbullet_sneo);
                bullet[i].sprite_index = spr_sneo_bullet_box;
                bullet[i].image_xscale = 1;
                bullet[i].image_yscale = 1.2;
                bullet[i].hspeed = -1;
                bullet[i].friction = -0.1;
                if (breakspot == i)
                {
                    bullet[i].destroyable = 1;
                    bullet[i].sprite_index = spr_sneo_crew;
                    bullet[i].image_speed = 0.5;
                    bullet[i].image_yscale = 1;
                }
            }
        }
        timer = 0 - ((wallamt - 1) * 8);
    }
}
if (type == 1)
{
    if (timer >= 25)
    {
        breakspot1 = choose(1, 2, 3);
        breakspot2 = choose(0, 4, 5);
        wallsize = 6;
        wallamt = 1;
        vspeed = choose(1.2, 0, 0, -2, -1.2, 2);
        if (floor(random(6)) == 0)
        {
            wallamt = 2;
            if (vspeed == 0)
            {
                wallamt = 3;
            }
        }
        for (j = 0; j < wallamt; j++)
        {
            for (i = 0; i < wallsize; i++)
            {
                bullet[i] = instance_create(xx + 470 + (25 * j), (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 25)) - 100 - 25, obj_sneo_wallbullet);
                bullet[i].sprite_index = spr_sneo_bullet_box;
                bullet[i].image_xscale = 1;
                bullet[i].image_yscale = 1.2;
                bullet[i].hspeed = -1;
                bullet[i].falsevspeed = vspeed;
                bullet[i].loop = 1;
                bullet[i].friction = -0.1;
                if (breakspot1 == i || breakspot2 == i)
                {
                    bullet[i].destroyable = 1;
                    bullet[i].image_blend = #00A2E8;
                    bullet[i].sprite_index = spr_sneo_crew;
                    bullet[i].image_speed = 0.5;
                    bullet[i].image_yscale = 1;
                }
            }
        }
        timer = 0 - ((wallamt - 1) * 8);
    }
}
if (type == 2)
{
    if (timer >= 25)
    {
        breakspot1 = choose(1, 2, 3);
        breakspot2 = choose(0, 4);
        wallsize = 5;
        wallamt = 1;
        vspeed = choose(1.2, 0, 0, -2, -1.2, 2);
        if (floor(random(6)) == 0)
        {
            wallamt = 2;
            if (vspeed == 0)
            {
                wallamt = 3;
            }
        }
        for (j = 0; j < wallamt; j++)
        {
            for (i = 0; i < wallsize; i++)
            {
                bullet[i] = instance_create(xx + 470 + (25 * j), (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 30)) - 100 - 30, obj_sneo_wallbullet);
                bullet[i].sprite_index = spr_sneo_bullet_box;
                bullet[i].image_xscale = 1;
                bullet[i].image_yscale = 1.5;
                bullet[i].hspeed = -1;
                bullet[i].falsevspeed = vspeed;
                bullet[i].loop = 1;
                bullet[i].friction = -0.1;
                if (breakspot1 == i || breakspot2 == i)
                {
                    bullet[i].destroyable = 1;
                    bullet[i].image_blend = #00A2E8;
                    bullet[i].sprite_index = spr_sneo_crew;
                    bullet[i].image_speed = 0.5;
                    bullet[i].image_yscale = 1;
                }
            }
        }
        timer = 0 - ((wallamt - 1) * 8);
    }
}
if (init == 0 && type == 3)
{
    for (j = 0; j < spawncount; j++)
    {
        for (i = 0; i < 2; i++)
        {
            bullet[i] = instance_create(obj_growtangle.x + 150, (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 5 * 40)) - 170, obj_sneo_staticwall);
            bullet[i].sprite_index = spr_sneo_bullet_box;
            bullet[i].image_xscale = 1.25;
            bullet[i].image_yscale = 1.6;
            bullet[i].siner = waittime * j;
        }
    }
    init = 1;
}
if (type == 3)
{
    if (timer >= waittime && made < spawncount)
    {
        if (breakspotpreviouscon > 3)
        {
            breakspotpreviouscon = 0;
        }
        if (breakspotpreviouscon == 0 || breakspotpreviouscon == 1)
        {
            breakspotconsecutive = 2 + irandom(2);
            if (breakspotpreviouscon == 0)
            {
                vspeed = -1.5;
                breakspot1 = breakspotconsecutive - 1;
                breakspot2 = breakspotconsecutive;
                breakspot3 = breakspotconsecutive + 2;
                breakspot4 = breakspotconsecutive + 3;
            }
            if (breakspotpreviouscon == 1)
            {
                vspeed = 2;
                breakspotconsecutive = irandom(2);
                breakspot1 = breakspotconsecutive;
                breakspot2 = breakspotconsecutive + 1;
                breakspot3 = breakspotconsecutive + 3;
                breakspot4 = breakspotconsecutive + 4;
            }
        }
        if (breakspotpreviouscon == 2 || breakspotpreviouscon == 3)
        {
            breakspotconsecutive = 1 + irandom(4);
            vspeed = 0;
            var a = irandom(1);
            breakspot1 = 1 + a;
            breakspot2 = 2 + a;
            breakspot3 = 3 + a;
            breakspot4 = 2 + a;
            if (breakspotpreviouscon == 3)
            {
                breakspot1 = 3 + a;
                breakspot2 = 4 + a;
                breakspot3 = 5 + a;
                breakspot4 = 4 + a;
            }
        }
        breakspotpreviouscon++;
        breakspotpreviouscon++;
        wallsize = 7;
        wallamt = 1;
        if (irandom(5) == 0)
        {
            wallamt = 2;
            if (vspeed == 1)
            {
                wallamt = 3;
            }
        }
        var sineroffset = (timer - waittime) + scr_movetowards(sinespeed, sinetargetspeed, 0.05);
        for (i = 0; i < wallsize; i++)
        {
            bullet[i] = instance_create(obj_growtangle.x + 150, (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 30)) - 100 - 60, obj_sneo_wallbullet);
            bullet[i].sprite_index = spr_sneo_mail;
            bullet[i].image_xscale = 1;
            bullet[i].image_yscale = 1.5;
            bullet[i].falsevspeed = vspeed;
            bullet[i].loop = 1;
            bullet[i].siner = sineroffset;
            if (breakspot1 == i || breakspot2 == i || breakspot3 == i || breakspot4 == i)
            {
                bullet[i].destroyable = 1;
                bullet[i].sprite_index = spr_sneo_crew_ez_hitbox;
                bullet[i].image_speed = 0.5;
                bullet[i].image_yscale = 1;
            }
        }
        timer -= waittime;
        made++;
    }
    if (difficulty == 2)
    {
        lilguytimer++;
        if (lilguytimer == 55)
        {
            instance_create(x, y, obj_sneo_guymaker);
            obj_sneo_guymaker.alarm[0] = 30;
        }
    }
}
if (type == 4)
{
    for (j = 0; j < spawncount; j++)
    {
        breakspot1 = choose(1, 2, 3);
        breakspot2 = choose(0, 4);
        wallsize = 5;
        wallamt = 1;
        vspeed = choose(1.2, 0, -2, -1.2, 2);
        if (irandom(5) == 0)
        {
            wallamt = 2;
            if (vspeed == 1)
            {
                wallamt = 3;
            }
        }
        for (i = 0; i < wallsize; i++)
        {
            bullet[i] = instance_create(obj_growtangle.x + 150, (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 30)) - 100 - 30, obj_sneo_wallbullet);
            bullet[i].sprite_index = spr_sneo_bullet_box;
            bullet[i].image_xscale = 1;
            bullet[i].image_yscale = 1.5;
            bullet[i].falsevspeed = vspeed;
            bullet[i].siner = (j / spawncount) * 2 * pi * 20;
            bullet[i].loop = 1;
            if (breakspot1 == i || breakspot2 == i)
            {
                bullet[i].destroyable = 1;
                bullet[i].sprite_index = spr_sneo_crew;
                bullet[i].image_speed = 0.5;
                bullet[i].image_yscale = 1;
                bullet[i].image_blend = #00A2E8;
            }
        }
        type = 99;
    }
}

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`,Step_0:`if (introtimer > 24)
{
    if (type < 3)
    {
        timer++;
    }
    else
    {
        timer += sinespeed;
    }
    if (sinespeed != sinetargetspeed)
    {
        sinespeed = scr_movetowards(sinespeed, sinetargetspeed, 0.05);
    }
}
else
{
    introtimer++;
}
if (difficulty == 2)
{
    lilguytimer++;
    if (lilguytimer == 76)
    {
        instance_create(x, y, obj_sneo_guymaker);
        obj_sneo_guymaker.alarm[0] = 30;
    }
    if (lilguytimer == 172)
    {
        instance_create(x, y, obj_sneo_guymaker);
        obj_sneo_guymaker.alarm[0] = 30;
    }
}
if (sinetargetspeed < 0)
{
    exit;
}
if (init == 0 && type == 3)
{
    for (j = 0; j < spawncount; j++)
    {
        for (i = 0; i < 2; i++)
        {
            bullet[i] = instance_create(obj_growtangle.x + 150, (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 5 * 40)) - 170, obj_sneo_staticwall);
            bullet[i].sprite_index = spr_sneo_bullet_box;
            bullet[i].image_xscale = 1.25;
            bullet[i].image_yscale = 1.6;
            bullet[i].siner = waittime * j;
        }
    }
    init = 1;
}
if (type == 3)
{
    if (timer >= waittime && made < spawncount)
    {
        for (j = 0; j < spawncount; j++)
        {
            if (breakspotpreviouscon > 3)
            {
                breakspotpreviouscon = 0;
            }
            if (breakspotpreviouscon == 0 || breakspotpreviouscon == 1)
            {
                breakspotconsecutive = 2 + irandom(1);
                if (breakspotpreviouscon == 0)
                {
                    vspeed = -1.5;
                    breakspot1 = breakspotconsecutive - 1;
                    breakspot2 = breakspotconsecutive;
                    breakspot3 = breakspotconsecutive + 2;
                    breakspot4 = breakspotconsecutive + 3;
                }
                if (breakspotpreviouscon == 1)
                {
                    vspeed = 2;
                    breakspotconsecutive = 1;
                    breakspot1 = breakspotconsecutive;
                    breakspot2 = breakspotconsecutive + 1;
                    breakspot3 = breakspotconsecutive + 3;
                    breakspot4 = breakspotconsecutive + 4;
                }
            }
            if (breakspotpreviouscon == 2 || breakspotpreviouscon == 3)
            {
                breakspotconsecutive = 1 + irandom(4);
                vspeed = 0;
                var a = irandom(1);
                breakspot1 = 1 + a;
                breakspot2 = 2 + a;
                breakspot3 = 3 + a;
                breakspot4 = 2 + a;
                if (breakspotpreviouscon == 3)
                {
                    breakspot1 = 3 + a;
                    breakspot2 = 4 + a;
                    breakspot3 = 5 + a;
                    breakspot4 = 4 + a;
                }
            }
            breakspotpreviouscon++;
            breakspotpreviouscon++;
            wallsize = 7;
            var sineroffset = (timer - waittime) + scr_movetowards(sinespeed, sinetargetspeed, 0.05);
            for (i = 0; i < wallsize; i++)
            {
                bullet[i] = instance_create(obj_growtangle.x + 150, (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 30)) - 100 - 60, obj_sneo_wallbullet);
                bullet[i].sprite_index = spr_sneo_mail;
                bullet[i].image_xscale = 1;
                bullet[i].image_yscale = 1.5;
                bullet[i].falsevspeed = vspeed;
                bullet[i].loop = 1;
                bullet[i].siner = sineroffset;
                bullet[i].siner = waittime * j;
                if (breakspot1 == i || breakspot2 == i || breakspot3 == i || breakspot4 == i)
                {
                    bullet[i].destroyable = 1;
                    bullet[i].sprite_index = spr_sneo_crew_ez_hitbox;
                    bullet[i].image_speed = 0.5;
                    bullet[i].image_yscale = 1;
                    bullet[i].image_alpha = 0;
                }
            }
            timer -= waittime;
            made++;
        }
    }
}

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`}},{metadata:{index:54,name:`obj_sneo_wall_controller_new`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`wallsize = 7;
wallcountmax = 35;
wallcount = 0;
wallsetupcount = 0;
timer = 0;
timer2 = 0;
wallcreatetimermax = 30;
con = 0;
difficulty = obj_spamton_neo_enemy.difficulty;
xx = camerax();
yy = cameray();
track1_x = camerax();
track2_x = camerax() + 320;
track3_x = camerax() + 640;
x = 0;
y = 0;
breakspot1[wallcountmax] = -1;
breakspot2[wallcountmax] = -1;
breakspot3[wallcountmax] = -1;
breakspot4[wallcountmax] = -1;
breakspot5[wallcountmax] = -1;
pipispot1[wallcountmax] = -1;
pipispot2[wallcountmax] = -1;
pipispot3[wallcountmax] = -1;
pipispot4[wallcountmax] = -1;
pipispot5[wallcountmax] = -1;
emptyspot1[wallcountmax] = -1;
emptyspot2[wallcountmax] = -1;
emptyspot3[wallcountmax] = -1;
emptyspot4[wallcountmax] = -1;
emptyspot5[wallcountmax] = -1;
redbreakspot1[wallcountmax] = -1;
redbreakspot2[wallcountmax] = -1;
redbreakspot3[wallcountmax] = -1;
redbreakspot4[wallcountmax] = -1;
redbreakspot5[wallcountmax] = -1;
var a = 0;
repeat (wallcountmax)
{
    wallcreatetimer[a] = wallcreatetimermax;
    a++;
}
a = 0;
repeat (wallcountmax)
{
    wallspeed[a] = -7;
    a++;
}
a = 0;
repeat (wallcountmax)
{
    walltype[a] = 0;
    a++;
}
if (difficulty == 0)
{
    a = 0;
    repeat (wallcountmax)
    {
        walltype[a] = 1;
        a++;
    }
    var rand = choose(1, 2, 3);
    if (rand == 1)
    {
        scr_sneo_wall_create(0, 0, 0, 2, 0, 1, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 30, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 30, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(0, 2, 0, 3, 0, 1, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 30, 1);
        scr_sneo_wall_create(0, 2, 0, 3, 0, 30, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(0, 0, 0, 0, 2, 1, 1);
        scr_sneo_wall_create(0, 3, 2, 0, 0, 30, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 30, 1);
    }
    rand = choose(1, 2, 3);
    if (rand == 1)
    {
        scr_sneo_wall_create(0, 1, 1, 0, 0, 40, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(0, 0, 0, 1, 1, 40, 1);
        scr_sneo_wall_create(0, 0, 0, 2, 2, 6, 1);
        scr_sneo_wall_create(0, 0, 0, 2, 2, 6, 1);
        scr_sneo_wall_create(0, 0, 0, 2, 2, 6, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(0, 0, 1, 1, 0, 40, 1);
        scr_sneo_wall_create(0, 0, 2, 1, 0, 6, 1);
        scr_sneo_wall_create(0, 0, 2, 2, 0, 6, 1);
        scr_sneo_wall_create(0, 0, 2, 2, 0, 6, 1);
    }
    if (rand == 1)
    {
        scr_sneo_wall_create(0, 0, 0, 0, 2, 30, 1);
        scr_sneo_wall_create(0, 2, 0, 0, 0, 30, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 30, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(0, 2, 0, 0, 0, 30, 1);
        scr_sneo_wall_create(0, 0, 0, 2, 0, 30, 1);
        scr_sneo_wall_create(0, 2, 0, 3, 0, 30, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(2, 0, 0, 0, 0, 30, 1);
        scr_sneo_wall_create(0, 0, 2, 0, 0, 30, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 30, 1);
    }
    rand = choose(1, 2, 3);
    if (rand == 1)
    {
        scr_sneo_wall_create(0, 1, 1, 0, 0, 40, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(0, 1, 1, 0, 0, 40, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(0, 1, 1, 0, 0, 40, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
    }
    scr_sneo_wall_create(1, 1, 1, 1, 1, 9999, 0);
}
if (difficulty == 1)
{
    a = 0;
    repeat (wallcountmax)
    {
        walltype[a] = 1;
        a++;
    }
    var rand = choose(1, 2, 3, 4);
    if (rand == 1)
    {
        scr_sneo_wall_create(3, 0, 0, 2, 0, 1, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 20, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(0, 2, 0, 3, 0, 1, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 0, 3, 0, 20, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(0, 0, 0, 3, 2, 1, 1);
        scr_sneo_wall_create(0, 3, 2, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 20, 1);
    }
    if (rand == 4)
    {
        scr_sneo_wall_create(2, 3, 0, 0, 0, 1, 1);
        scr_sneo_wall_create(0, 0, 2, 3, 0, 20, 1);
        scr_sneo_wall_create(0, 0, 3, 2, 0, 20, 1);
    }
    rand = choose(1, 2, 3, 4);
    if (rand == 1)
    {
        scr_sneo_wall_create(3, 0, 0, 2, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 20, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(0, 2, 0, 3, 0, 20, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 0, 3, 0, 20, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(0, 0, 0, 3, 2, 20, 1);
        scr_sneo_wall_create(0, 3, 2, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 20, 1);
    }
    if (rand == 4)
    {
        scr_sneo_wall_create(2, 3, 0, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 0, 2, 3, 0, 20, 1);
        scr_sneo_wall_create(0, 0, 3, 2, 0, 20, 1);
    }
    if (rand == 1)
    {
        scr_sneo_wall_create(0, 1, 1, 0, 0, 32, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
        scr_sneo_wall_create(0, 2, 2, 0, 0, 6, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(0, 0, 0, 1, 1, 32, 1);
        scr_sneo_wall_create(0, 0, 0, 2, 2, 6, 1);
        scr_sneo_wall_create(0, 0, 0, 2, 2, 6, 1);
        scr_sneo_wall_create(0, 0, 0, 2, 2, 6, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(0, 0, 1, 1, 0, 32, 1);
        scr_sneo_wall_create(0, 0, 2, 2, 0, 6, 1);
        scr_sneo_wall_create(0, 0, 2, 2, 0, 6, 1);
        scr_sneo_wall_create(0, 0, 2, 2, 0, 6, 1);
    }
    if (rand == 4)
    {
        scr_sneo_wall_create(1, 1, 0, 0, 0, 32, 1);
        scr_sneo_wall_create(2, 2, 0, 0, 0, 6, 1);
        scr_sneo_wall_create(2, 2, 0, 0, 0, 6, 1);
        scr_sneo_wall_create(2, 2, 0, 0, 0, 6, 1);
    }
    if (rand == 1)
    {
        scr_sneo_wall_create(0, 0, 0, 0, 2, 20, 1);
        scr_sneo_wall_create(0, 2, 0, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 20, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(0, 2, 0, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 0, 0, 2, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 0, 3, 0, 20, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(2, 0, 0, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 0, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 20, 1);
    }
    if (rand == 4)
    {
        scr_sneo_wall_create(0, 0, 0, 2, 0, 20, 1);
        scr_sneo_wall_create(2, 0, 0, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 0, 3, 2, 0, 20, 1);
    }
    rand = choose(1, 2, 3, 4);
    if (rand == 1)
    {
        scr_sneo_wall_create(3, 0, 0, 2, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 20, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(0, 2, 0, 3, 0, 20, 1);
        scr_sneo_wall_create(0, 3, 0, 2, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 0, 3, 0, 20, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(0, 0, 0, 3, 2, 20, 1);
        scr_sneo_wall_create(0, 3, 2, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 2, 3, 0, 0, 20, 1);
    }
    if (rand == 4)
    {
        scr_sneo_wall_create(2, 3, 0, 0, 0, 20, 1);
        scr_sneo_wall_create(0, 0, 2, 3, 0, 20, 1);
        scr_sneo_wall_create(0, 0, 3, 2, 0, 20, 1);
    }
    scr_sneo_wall_create(1, 1, 1, 1, 1, 9999, 0);
}
if (difficulty == 99)
{
    var rand = choose(1, 2);
    if (rand == 1)
    {
        scr_sneo_wall_create(0, 0, 0, 0, 4, 1, 1);
        scr_sneo_wall_create(1, 0, 0, 0, 0, 7, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(4, 0, 0, 0, 0, 1, 1);
        scr_sneo_wall_create(0, 0, 0, 0, 1, 7, 1);
    }
    rand = choose(1, 2, 3);
    if (rand == 1)
    {
        scr_sneo_wall_create(4, 0, 0, 0, 3, 63, 1);
    }
    if (rand == 2)
    {
        scr_sneo_wall_create(3, 0, 0, 0, 4, 63, 1);
    }
    if (rand == 3)
    {
        scr_sneo_wall_create(0, 3, 4, 0, 0, 63, 1);
    }
    scr_sneo_wall_create(0, 0, 1, 0, 4, 60, 0);
    scr_sneo_wall_create(4, 2, 1, 0, 0, 7, 0);
    scr_sneo_wall_create(0, 2, 3, 1, 0, 7, 0);
    scr_sneo_wall_create(0, 2, 3, 1, 0, 7, 0);
    scr_sneo_wall_create(0, 4, 1, 3, 1, 50, 0);
    scr_sneo_wall_create(3, 1, 1, 4, 2, 7, 0);
    scr_sneo_wall_create(3, 4, 0, 3, 1, 7, 0);
    scr_sneo_wall_create(2, 1, 0, 1, 2, 7, 0);
    scr_sneo_wall_create(2, 4, 2, 0, 4, 7, 0);
    scr_sneo_wall_create(2, 1, 2, 0, 0, 7, 0);
    scr_sneo_wall_create(1, 4, 2, 0, 3, 50, 0);
    scr_sneo_wall_create(4, 2, 0, 0, 2, 7, 0);
    scr_sneo_wall_create(0, 2, 1, 1, 1, 7, 0);
    scr_sneo_wall_create(3, 1, 2, 1, 3, 7, 0);
    scr_sneo_wall_create(1, 1, 4, 0, 0, 7, 0);
    scr_sneo_wall_create(4, 2, 2, 0, 1, 7, 0);
    scr_sneo_wall_create(3, 2, 3, 4, 2, 50, 0);
    scr_sneo_wall_create(2, 2, 1, 2, 4, 7, 0);
    scr_sneo_wall_create(3, 1, 1, 1, 4, 7, 0);
    scr_sneo_wall_create(2, 2, 1, 1, 3, 7, 0);
    scr_sneo_wall_create(3, 4, 1, 1, 1, 7, 0);
    scr_sneo_wall_create(3, 0, 0, 4, 2, 7, 0);
    scr_sneo_wall_create(0, 0, 0, 0, 0, 9999, 0);
}
if (difficulty == 2)
{
    repeat (6)
    {
        scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), 7, 0);
    }
    scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), 63, 0);
    repeat (5)
    {
        scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), 7, 0);
    }
    scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), 63, 0);
    repeat (5)
    {
        scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), choose(2, 2, 1, 1, 1, 4, 3, 0), 7, 0);
    }
    scr_sneo_wall_create(0, 0, 0, 0, 0, 9999, 0);
}
if (difficulty == 3)
{
    repeat (6)
    {
        scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), 7, 0);
    }
    scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), 63, 0);
    repeat (5)
    {
        scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), 7, 0);
    }
    scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), 63, 0);
    repeat (5)
    {
        scr_sneo_wall_create(choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), choose(2, 2, 1, 1, 1, 3, 0), 7, 0);
    }
    scr_sneo_wall_create(0, 0, 0, 0, 0, 9999, 0);
}
`,Draw_0:`track1_x += 4;
track2_x += 4;
track3_x += 4;
if (track1_x > (camerax() + camerawidth()))
{
    track1_x -= 960;
}
if (track2_x > (camerax() + camerawidth()))
{
    track2_x -= 960;
}
if (track3_x > (camerax() + camerawidth()))
{
    track3_x -= 960;
}
draw_sprite(spr_sneo_wall_track, 0, track1_x, (cameray() + cameraheight()) - 180);
draw_sprite(spr_sneo_wall_track, 0, track2_x, (cameray() + cameraheight()) - 180);
draw_sprite(spr_sneo_wall_track, 0, track3_x, (cameray() + cameraheight()) - 180);
`,Step_0:`timer++;
if (global.turntimer < 1)
{
    instance_destroy();
}
if (wallcount < wallcountmax && timer == wallcreatetimer[wallcount])
{
    for (i = 0; i < wallsize; i++)
    {
        if (i == 0 || i == (wallsize - 1))
        {
            bullet[i] = instance_create(camerax() + camerawidth(), (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 34)) - 172, obj_sneo_wallbullet_new);
            bullet[i].sprite_index = spr_sneo_bullet_box;
            bullet[i].image_xscale = 1.25;
            bullet[i].image_yscale = 1.6;
            bullet[i].destroyable = 0;
            bullet[i].image_blend = c_white;
            bullet[i].wallnumber = wallcount;
            if (i == 0)
            {
                bullet[i].wallcontroller = 1;
            }
            if (i == (wallsize - 1))
            {
                bullet[i] = instance_create((camerax() + camerawidth()) - 50, (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 34)) - 180, obj_sneo_wallbullet_new);
                bullet[i].sprite_index = spr_sneo_wall_car;
                bullet[i].image_xscale = 1.25;
                bullet[i].image_yscale = 1.6;
                bullet[i].destroyable = 0;
                bullet[i].image_blend = c_white;
                bullet[i].depth = depth - 1;
                bullet[i].wallnumber = wallcount;
            }
        }
        else if (emptyspot1[wallcount] == i || emptyspot2[wallcount] == i || emptyspot3[wallcount] == i || emptyspot4[wallcount] == i || emptyspot5[wallcount] == i)
        {
        }
        else if (pipispot1[wallcount] == i || pipispot2[wallcount] == i || pipispot3[wallcount] == i || pipispot4[wallcount] == i || pipispot5[wallcount] == i)
        {
            bullet[i] = instance_create(camerax() + camerawidth(), (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 34)) - 170, obj_sneo_rotatingwall_bomb);
            bullet[i].wallnumber = wallcount;
        }
        else
        {
            bullet[i] = instance_create(camerax() + camerawidth(), (yy + (__view_get(e__VW.HView, 0) / 2) + (i * 34)) - 172, obj_sneo_wallbullet_new);
            bullet[i].sprite_index = spr_sneo_mail;
            bullet[i].image_xscale = 1.2;
            bullet[i].image_yscale = 1.71;
            bullet[i].destroyable = 0;
            bullet[i].wallnumber = wallcount;
            if (breakspot1[wallcount] == i || breakspot2[wallcount] == i || breakspot3[wallcount] == i || breakspot4[wallcount] == i || breakspot5[wallcount] == i)
            {
                bullet[i].destroyable = 1;
                bullet[i].sprite_index = spr_sneo_crew;
                bullet[i].image_speed = 0.5;
                bullet[i].image_yscale = 1.2;
            }
            else if (redbreakspot1[wallcount] == i || redbreakspot2[wallcount] == i || redbreakspot3[wallcount] == i || redbreakspot4[wallcount] == i || redbreakspot5[wallcount] == i)
            {
                bullet[i].destroyable = 1;
                bullet[i].red = 1;
                bullet[i].sprite_index = spr_sneo_crew;
                bullet[i].image_speed = 0.5;
                bullet[i].image_yscale = 1.2;
                bullet[i].image_blend = c_red;
            }
            else
            {
                bullet[i].image_blend = c_white;
            }
        }
    }
    timer = 0;
    wallcount++;
}
timer2++;
if (difficulty == 0)
{
}
if (difficulty == 1)
{
}

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`}},{metadata:{index:625,name:`obj_sneo_wallbullet`,parent:`obj_collidebullet`,sprite:`spr_sneo_mail`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`if (y < (cameray() + 110))
{
    exit;
}
if (y > (cameray() + 233))
{
    exit;
}
if (image_alpha < 0.5)
{
    exit;
}
hitshot = other;
event_user(0);
`,Create_0:`scr_bullet_init();
element = 6;
f = 2;
destroyable = 0;
angle_speed = 0;
flashsiner = 0;
loop = 0;
loopy1 = 60;
loopy2 = 270;
falsevspeed = 0;
bighitbox = 1;
angleadjust = 0;
active = 1;
siner = 0;
altdir = 0;
altspeed = 0;
altfriction = 0;
altgravity = 0;
changedirection = 0;
bulletspeed = 8;
hspeed = 0;
friction = 0;
image_speed = 0;
xx = obj_growtangle.x;
xdist = xstart - xx;
init = 0;
startdepth = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
image_alpha = 0;
`,Draw_0:`draw_self();
`,Other_10:`if (y < (cameray() + 110))
{
    exit;
}
if (y > (cameray() + 233))
{
    exit;
}
if (image_alpha < 0.5)
{
    exit;
}
if (destroyable == 1 && active == 1)
{
    if (hitshot.big == 0)
    {
        with (hitshot)
        {
            event_user(0);
        }
    }
    snd_play_pitch(snd_bomb, 1.1 + random(0.2));
    scr_afterimage_cut();
    anim = instance_create(x, y, obj_yshot_anim);
    anim.image_xscale = image_xscale;
    anim.image_yscale = image_yscale;
    with (anim)
    {
        sprite_index = spr_yheart_shot_hit3;
    }
    instance_destroy();
}
else if (destroyable == 0 && active == 1)
{
    with (hitshot)
    {
        event_user(0);
    }
    snd_play(snd_bell);
}
`,Step_0:`if (image_alpha < 1)
{
    image_alpha += 0.04;
}
if (init == 0)
{
    startdepth = obj_growtangle.depth + depth;
    init = 1;
}
if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)
{
    instance_destroy();
}
direction += angle_speed;
if (angleadjust == 1)
{
    image_angle = direction;
}
if (destroyable == 1)
{
    flashsiner++;
    image_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(flashsiner / 3) * 0.25));
}
sinespeed = obj_sneo_wall_controller.sinespeed;
siner += sinespeed;
x = xx + (cos(-siner / 20) * xdist);
var _falsedepth = sin(siner / 20);
active = _falsedepth >= 0;
var _depthblend = clamp(_falsedepth + 0.5, 0, 1);
if (destroyable)
{
    image_blend = merge_color(merge_color(c_black, image_blend, 0.5), image_blend, _depthblend);
}
else
{
    image_blend = merge_color(c_gray, c_white, _depthblend);
}
depth = obj_growtangle.depth - (_falsedepth * startdepth);
if (destroyable == 1)
{
    if (active == 1)
    {
        depth = obj_heart.depth - 100;
    }
    if (y < (cameray() + 110))
    {
        image_xscale = (y - cameray() - 90) / 20;
        image_yscale = (y - cameray() - 90) / 20;
        if (obj_sneo_wall_controller.introtimer > 24)
        {
            image_alpha = (y - cameray() - 90) / 20;
        }
    }
    else if (y > (cameray() + 233))
    {
        image_xscale = (20 - (y - cameray() - 233)) / 20;
        image_yscale = (20 - (y - cameray() - 233)) / 20;
        if (obj_sneo_wall_controller.introtimer > 24)
        {
            image_alpha = (20 - (y - cameray() - 233)) / 20;
        }
    }
    else
    {
        image_xscale = 1;
        image_yscale = 1;
        if (obj_sneo_wall_controller.introtimer > 24)
        {
            image_alpha = 1;
        }
    }
}
if (loop == 1)
{
    if (y < loopy1)
    {
        y = loopy2 - (loopy1 - y);
    }
    if (y > loopy2)
    {
        y = loopy1 + (y - loopy2);
    }
}
y += (falsevspeed * sinespeed);
if (bighitbox == 1)
{
    hitshot = collision_rectangle(x, y, x + sprite_width, y + sprite_height, obj_yheart_shot, true, false);
    if (hitshot != -4)
    {
        event_user(0);
    }
}
`}},{metadata:{index:40,name:`obj_sneo_wallbullet_new`,parent:`obj_collidebullet`,sprite:`spr_sneo_crew`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`if (destroyable == 0 && other.big == 1)
{
    if ((other.y < y && instance_place(x, y - 40, obj_sneo_wallbullet_new) && instance_nearest(x, y - 40, obj_sneo_wallbullet_new).sprite_index == spr_sneo_mail) || (other.y > y && instance_place(x, y + 40, obj_sneo_wallbullet_new) && instance_nearest(x, y + 40, obj_sneo_wallbullet_new).sprite_index == spr_sneo_mail))
    {
    }
    else if (abs(other.y - y) > 12)
    {
        exit;
    }
}
hitshot = other;
event_user(0);
if (destroyable == 1 && active == 1)
{
    if (hitshot.big == 0)
    {
        with (hitshot)
        {
            event_user(0);
        }
    }
    snd_volume(snd_bomb, 0.7, 0);
    snd_play_x(snd_bomb, 0.7, 1.1 + random(0.2));
    var _cut = scr_afterimage_cut();
    _cut.flash = true;
    anim = instance_create(x, y, obj_yshot_anim);
    anim.image_xscale = image_xscale;
    anim.image_yscale = image_yscale;
    with (anim)
    {
        sprite_index = spr_yheart_shot_hit3;
    }
    instance_destroy();
}
`,Create_0:`scr_bullet_init();
element = 6;
destroyable = 1;
red = 0;
bighitbox = 1;
image_speed = 0;
image_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(0) * 0.25));
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
wallcontroller = -1;
wallspeed = -7;
wallnumber = 0;
walltype = 0;
timer = 0;
hp = 1;
`,Draw_0:`draw_self();
`,Other_10:`if (sprite_index == spr_sneo_bullet_box)
{
    exit;
}
if (destroyable == 1)
{
    if (hitshot.big == 0)
    {
        with (hitshot)
        {
            event_user(0);
        }
    }
    if (red == 1)
    {
        with (obj_sneo_wallbullet_new)
        {
            if (wallnumber == other.wallnumber)
            {
                snd_play_pitch(snd_bomb, 1.1 + random(0.2));
                var _cut = scr_afterimage_cut();
                _cut.flash = true;
                instance_destroy();
            }
        }
        with (obj_sneo_rotatingwall_pipis)
        {
            if (wallnumber == other.wallnumber)
            {
                event_user(0);
                instance_destroy();
            }
        }
    }
    anim = instance_create(x, y, obj_yshot_anim);
    anim.image_xscale = image_xscale;
    anim.image_yscale = image_yscale;
    with (anim)
    {
        sprite_index = spr_yheart_shot_hit3;
    }
}
else
{
    with (hitshot)
    {
        event_user(0);
    }
    snd_play(snd_bell);
}
`,Step_0:`if (global.turntimer < 1)
{
    instance_destroy();
}
if (i_ex(obj_sneo_wall_controller_new))
{
    x += obj_sneo_wall_controller_new.wallspeed[wallnumber];
}
if (wallcontroller > -1)
{
    if (obj_sneo_wall_controller_new.walltype[wallnumber] == 0)
    {
        timer++;
        if (timer < 9)
        {
            obj_sneo_wall_controller_new.wallspeed[wallnumber] = lerp(-16, -6, timer / 9);
        }
        else if (timer < 150)
        {
            obj_sneo_wall_controller_new.wallspeed[wallnumber] = lerp(-6, -6, (timer - 9) / 130);
        }
    }
    if (obj_sneo_wall_controller_new.walltype[wallnumber] == 1)
    {
        timer++;
        if (timer < 16)
        {
            obj_sneo_wall_controller_new.wallspeed[wallnumber] = lerp(-21, -5, timer / 15);
        }
        else if (timer < 90)
        {
            obj_sneo_wall_controller_new.wallspeed[wallnumber] = lerp(-5, -13, (timer - 15) / 70);
        }
    }
}
if (sprite_index == spr_sneo_crew)
{
    hitshot = collision_rectangle(x - 18, y - 22, x + 19, y + 22, obj_yheart_shot, true, false);
    if (hitshot != -4)
    {
        if (destroyable == 0 && hitshot.big == 1)
        {
            if ((hitshot.y < y && instance_place(x, y - 40, obj_sneo_wallbullet_new) && instance_nearest(x, y - 40, obj_sneo_wallbullet_new).sprite_index == spr_sneo_mail) || (hitshot.y > y && instance_place(x, y + 40, obj_sneo_wallbullet_new) && instance_nearest(x, y + 40, obj_sneo_wallbullet_new).sprite_index == spr_sneo_mail))
            {
            }
            else if (abs(hitshot.y - y) > 12)
            {
                exit;
            }
        }
        event_user(0);
        if (destroyable == 1 && active == 1)
        {
            if (instance_exists(hitshot))
            {
                if (hitshot.big == 0)
                {
                    with (hitshot)
                    {
                        event_user(0);
                    }
                }
            }
            snd_play_pitch(snd_bomb, 1.1 + random(0.2));
            scr_afterimage_cut();
            anim = instance_create(x, y, obj_yshot_anim);
            anim.image_xscale = image_xscale;
            anim.image_yscale = image_yscale;
            with (anim)
            {
                sprite_index = spr_yheart_shot_hit3;
            }
            instance_destroy();
        }
    }
}
`}},{metadata:{index:626,name:`obj_sneo_staticwall`,parent:`obj_collidebullet`,sprite:`spr_sneo_mail`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`hitshot = other;
event_user(0);
`,Create_0:`scr_bullet_init();
element = 6;
f = 2;
destroyable = 0;
angle_speed = 0;
yellowsiner = 0;
loop = 0;
loopy1 = 90;
loopy2 = 240;
falsevspeed = 0;
bighitbox = 1;
angleadjust = 0;
active = 0;
siner = 0;
altdir = 0;
altspeed = 0;
altfriction = 0;
altgravity = 0;
changedirection = 0;
bulletspeed = 8;
hspeed = 0;
friction = 0;
image_speed = 0;
xx = obj_growtangle.x;
xdist = xstart - xx;
init = 0;
startdepth = 0;
image_xscale = 1.2;
image_yscale = 1.2;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
image_alpha = 0;
`,Draw_0:`draw_self();
`,Other_10:`if (destroyable == 1 && active == 1)
{
    if (hitshot.big == 0)
    {
        with (hitshot)
        {
            event_user(0);
        }
    }
    snd_play(snd_damage);
    anim = instance_create(x, y, obj_yshot_anim);
    anim.image_xscale = image_xscale;
    anim.image_yscale = image_yscale;
    with (anim)
    {
        sprite_index = spr_yheart_shot_hit3;
    }
    instance_destroy();
}
else if (hitshot.big == 0)
{
    with (hitshot)
    {
        event_user(0);
    }
}
`,Step_0:`if (image_alpha < 1)
{
    image_alpha += 0.04;
}
if (init == 0)
{
    startdepth = obj_growtangle.depth + depth;
    init = 1;
}
if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)
{
    instance_destroy();
}
direction += angle_speed;
if (angleadjust == 1)
{
    image_angle = direction;
}
if (destroyable == 1)
{
    yellowsiner++;
    image_blend = merge_color(c_yellow, c_orange, 0.25 + (sin(yellowsiner / 3) * 0.25));
}
sinespeed = obj_sneo_wall_controller.sinespeed;
siner += sinespeed;
x = xx + (cos(-siner / 20) * xdist);
var _falsedepth = sin(siner / 20);
active = _falsedepth >= 0;
var _depthblend = clamp(_falsedepth + 0.5, 0, 1);
image_blend = merge_color(c_gray, c_white, _depthblend);
depth = obj_growtangle.depth - (_falsedepth * startdepth) - 3;
if (bighitbox == 1)
{
    hitshot = collision_rectangle(x, y, x + sprite_width, y + sprite_height, obj_yheart_shot, true, false);
    if (hitshot != -4)
    {
        event_user(0);
    }
}
`}},{metadata:{index:37,name:`obj_sneo_staticwall_new`,parent:`obj_collidebullet`,sprite:`spr_sneo_mail`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`hitshot = other;
event_user(0);
`,Create_0:`scr_bullet_init();
element = 6;
destroyable = 0;
bighitbox = 1;
image_speed = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
hspeed = -3;
`,Other_10:`if (destroyable == 1 && active == 1)
{
    if (hitshot.big == 0)
    {
        with (hitshot)
        {
            event_user(0);
        }
    }
    snd_play(snd_damage);
    anim = instance_create(x, y, obj_yshot_anim);
    anim.image_xscale = image_xscale;
    anim.image_yscale = image_yscale;
    with (anim)
    {
        sprite_index = spr_yheart_shot_hit3;
    }
    instance_destroy();
}
else
{
    with (hitshot)
    {
        event_user(0);
    }
}
`,Step_0:`if (x < camerax() || global.turntimer < 1)
{
    instance_destroy();
}
if (i_ex(obj_sneo_wall_controller_new))
{
    x += obj_sneo_wall_controller_new.wallspeed;
}
`}},{metadata:{index:38,name:`obj_sneo_rotatingwall_bomb`,parent:`obj_collidebullet`,sprite:`spr_mettaton_bomb1`,mask:null,solid:!1,depth:0,visible:!0},sources:{CleanUp_0:`if (timer > 0)
{
    snd_stop(bomsfallsfx);
}
`,Collision_obj_yheart_shot:`if (timer == 0)
{
    snd_play(snd_damage);
    if (other.big == 0)
    {
        with (other)
        {
            event_user(0);
        }
    }
    timer = 1;
    image_speed = 1;
    bomsfallsfx = snd_loop(snd_bombfall);
}
`,Create_0:`scr_bullet_init();
image_xscale = 1;
image_yscale = 1;
timer = 0;
con = 0;
element = 6;
destroyable = 0;
bighitbox = 1;
image_speed = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
wallspeed = -7;
wallnumber = 0;
`,Draw_0:`draw_self();
if (sprite_index == spr_mettaton_bomb2)
{
    for (var i = 1; i < 24; i++)
    {
        draw_sprite_ext(spr_mettaton_bomb3, image_index, x + (24 * i), y, image_xscale, image_yscale, 90, c_white, image_alpha);
        draw_sprite_ext(spr_mettaton_bomb3, image_index, x - (24 * i), y, image_xscale, image_yscale, 90, c_white, image_alpha);
        draw_sprite_ext(spr_mettaton_bomb3, image_index, x, y - (24 * i), image_xscale, image_yscale, 0, c_white, image_alpha);
        draw_sprite_ext(spr_mettaton_bomb3, image_index, x, y + (24 * i), image_xscale, image_yscale, 0, c_white, image_alpha);
    }
}
`,Step_0:`if (global.turntimer < 1)
{
    instance_destroy();
}
if (timer == 0 && i_ex(obj_sneo_wall_controller_new))
{
    x += obj_sneo_wall_controller_new.wallspeed[wallnumber];
}
if (timer > 0)
{
    timer++;
}
if (timer == 6)
{
    snd_play(snd_bomb);
    snd_stop(bomsfallsfx);
    sprite_index = spr_mettaton_bomb2;
    image_index = 0;
    instance_create(x, y, obj_shake);
    hitbox1 = instance_create(x, y, obj_mettaton_bomb_hitbox);
    hitbox1.image_xscale = 500;
    hitbox1.image_yscale = 0.5;
    hitbox2 = instance_create(x, y, obj_mettaton_bomb_hitbox);
    hitbox2.image_xscale = 0.2;
    hitbox2.image_yscale = 500;
}
if (timer == 12)
{
    instance_destroy();
}
`}},{metadata:{index:23,name:`obj_sneo_rotatingwall_pipis`,parent:`obj_collidebullet`,sprite:`spr_pipis_egg`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`if (timer == 0)
{
    snd_play(snd_damage);
    if (other.big == 0)
    {
        with (other)
        {
            event_user(0);
        }
    }
    timer = 1;
    x += (3 - random(6));
    y += (3 - random(6));
    image_angle = choose(-30, 30, -40, 40);
    image_index = 3;
    fx = instance_create(x, y, obj_pipis_egg_bullet_piece);
    fx.image_index = random(3);
    fx.image_xscale = 2;
    fx.image_yscale = 2;
    fx.direction = 45 + random(90);
}
`,Create_0:`scr_bullet_init();
image_xscale = 2;
image_yscale = 2;
timer = 0;
con = 0;
element = 6;
destroyable = 0;
bighitbox = 1;
image_speed = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
wallspeed = -7;
wallnumber = 0;
`,Other_10:`exit;
`,Step_0:`if (global.turntimer < 1)
{
    instance_destroy();
}
if (timer > 0)
{
    timer++;
    x += (3 - random(6));
    y += (3 - random(6));
}
else if (i_ex(obj_sneo_wall_controller_new))
{
    x += obj_sneo_wall_controller_new.wallspeed[wallnumber];
}
if (timer == 8)
{
    snd_play(snd_bomb);
    instance_destroy();
    fx = instance_create(x, y, obj_pipis_destroy_fx);
    fx.image_xscale = 1.5;
    fx.image_yscale = 1.5;
    for (i = 0; i < 12; i++)
    {
        radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);
        with (radialshot)
        {
            scr_bullet_init();
        }
        radialshot.sprite_index = spr_diamondbullet;
        radialshot.dir = ((i * 30) + random(28)) - 14;
        radialshot.active = 1;
        radialshot.depth = depth - 1;
        radialshot.target = target;
        radialshot.damage = damage;
        radialshot.grazed = 0;
        radialshot.element = 6;
    }
    radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);
    with (radialshot)
    {
        scr_bullet_init();
    }
    radialshot.sprite_index = spr_diamondbullet;
    radialshot.dir = (point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10) - 5) + random(10);
    radialshot.active = 1;
    radialshot.depth = depth - 1;
    radialshot.target = target;
    radialshot.damage = damage;
    radialshot.grazed = 0;
    radialshot.element = 6;
}
`}},{metadata:{index:9,name:`obj_mettaton_bomb_hitbox`,parent:`obj_regularbullet`,sprite:`spr_hitbox_10px_center`,mask:null,solid:!1,depth:0,visible:!1},sources:{Create_0:`scr_bullet_init();
wall_destroy = 1;
image_alpha = 1;
sprite_index = spr_hitbox_10px_center;
image_xscale = 1;
image_yscale = 1;
destroyonhit = 0;
grazed = 1;
element = 6;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
timer = 0;
depth = -999999;
creator = -1;
`,Other_15:`if (active == 1)
{
    if (target != 3)
    {
        scr_damage();
    }
    if (target == 3)
    {
        scr_damage_all();
    }
    if (destroyonhit == 1)
    {
        instance_destroy();
    }
}
`,Step_0:`timer++;
if (timer == 3)
{
    instance_destroy();
}
if (creator != -1 && i_ex(creator))
{
    x = creator.x;
    y = creator.y;
}
`}}],jt=[{metadata:{index:640,name:`obj_sneo_wireheart`,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_wireheart`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_sneo_tiny_ralsei:`if (other.active == 0)
{
    exit;
}
if (invincibility_timer > 0)
{
    exit;
}
invincibility_timer = 10;
if (global.turntimer < 150)
{
    hp = 0;
    if (type == 0 || (type == 1 && obj_spamton_neo_enemy.difficulty > 2 && global.turntimer > 20))
    {
        global.turntimer = 20;
        with (obj_sneo_wireheart)
        {
            hp = 0;
            destroyed = 1;
        }
    }
}
else if (type == 0 || (type == 1 && obj_spamton_neo_enemy.difficulty > 2))
{
    global.turntimer -= 80;
}
else
{
    hp -= 5;
    other.hp -= 10;
    other.alarm[0] = 10;
    if (!audio_is_playing(snd_hurt1))
    {
        snd_play(snd_hurt1);
    }
}
damagetimer = 5;
snd_play(snd_damage);
if (hp <= 0)
{
    destroyed = 1;
}
`,Collision_obj_sneo_tiny_susie_axe:`if (global.turntimer < 150)
{
    hp = 0;
    if (type == 0 || (type == 1 && obj_spamton_neo_enemy.difficulty > 2 && global.turntimer > 20))
    {
        global.turntimer = 20;
        with (obj_sneo_wireheart)
        {
            hp = 0;
            destroyed = 1;
        }
    }
}
else if (type == 0 || (type == 1 && obj_spamton_neo_enemy.difficulty > 2))
{
    global.turntimer -= 5;
}
else
{
    hp -= 0.25;
}
with (other)
{
    instance_destroy();
}
damagetimer = 5;
snd_play(snd_damage);
if (hp <= 0)
{
    destroyed = 1;
}
`,Collision_obj_yheart_shot:`if (invincibility_timer > 0 && other.big == 0)
{
    with (other)
    {
        instance_destroy();
    }
    exit;
}
invincibility_timer = 10;
if (global.turntimer < 150)
{
    hp = 0;
    if (type == 0 || (type == 1 && obj_spamton_neo_enemy.difficulty > 2 && global.turntimer > 20))
    {
        global.turntimer = 20;
        with (obj_sneo_wireheart)
        {
            hp = 0;
            destroyed = 1;
        }
    }
}
else
{
    if (type == 0 || (type == 1 && obj_spamton_neo_enemy.difficulty > 2))
    {
        if (other.big == 1)
        {
            global.turntimer -= (80 - (chargeshothitcount * 10));
            if (chargeshothitcount < 3)
            {
                chargeshothitcount++;
            }
        }
        else
        {
            global.turntimer -= (20 - normalshothitcount);
            if (normalshothitcount < 10)
            {
                normalshothitcount++;
            }
        }
    }
    else if (other.big == 1)
    {
        hp -= 5;
    }
    else
    {
        hp--;
    }
    if (scr_debug())
    {
    }
}
with (other)
{
    instance_destroy();
}
damagetimer = 5;
snd_play(snd_damage);
if (hp <= 0)
{
    destroyed = 1;
}
`,Create_0:`scr_bullet_init();
element = 6;
hp = 300;
damagetimer = 0;
defeated = 0;
active = 1;
destroyonhit = 0;
target = 0;
damage = 1;
animtimer = 0;
firedtimer = 0;
destroyed = 0;
rembossx = 0;
rembossy = 0;
invincibility_timer = 2;
chargeshothitcount = 0;
normalshothitcount = 0;
image_xscale = 0;
image_yscale = 0;
bossx = xstart;
bossy = ystart;
boss = -1;
image_index = 0;
image_speed = 0;
init = 0;
con = 1;
timer = 0;
moveframes = 30;
targetx = 0;
type = 0;
shottype = 0;
bighearttype = 0;
special = 0;
preset = -1;
altbiter = 1;
hpos = 5 + random(1.5);
`,Draw_0:`if (i_ex(boss))
{
    var xx = 50 - (boss.heart_release_con * 100);
    if (global.turntimer < 20)
    {
        xx = 0;
    }
    rembossx = lerp(rembossx, boss.x + xx, 0.16);
    rembossy = boss.y + 80;
}
if (destroyed == 1)
{
    invincibility_timer = 0;
}
var hidesprite = 0;
if (invincibility_timer > 0)
{
    if (invincibility_timer == 10 || invincibility_timer == 9 || invincibility_timer == 6 || invincibility_timer == 5 || invincibility_timer == 3 || invincibility_timer == 2)
    {
        hidesprite = 1;
    }
    invincibility_timer--;
}
if (hidesprite == 0)
{
    if (type == 3 && altbiter > 0 && altbiter < 3)
    {
        if (altbiter == 1)
        {
            for (i = 6; i >= 0; i--)
            {
                draw_sprite_ext(spr_sneo_wireheart, 5, lerp(x, rembossx, i / 5), lerp(y, rembossy, i / hpos), 0.75, 0.75, 0, image_blend, image_alpha);
            }
        }
        else
        {
            for (i = 6; i >= 0; i--)
            {
                draw_sprite_ext(spr_sneo_wireheart, 5, lerp(x, rembossx, i / 6), lerp(y, rembossy, i / hpos), 0.75, 0.75, 0, image_blend, image_alpha);
            }
        }
    }
    else
    {
        for (i = 10; i >= 0; i--)
        {
            draw_sprite_ext(spr_sneo_wireheart, 4, lerp(x, rembossx, i / 9), lerp(y, rembossy, i / 9), image_xscale, image_yscale, 0, image_blend, image_alpha);
        }
    }
    animtimer++;
    firedtimer--;
    image_index = 0;
    if (animtimer >= 5)
    {
        image_index = 1;
    }
    if (animtimer >= 10)
    {
        animtimer = 0;
    }
    if (firedtimer > 4)
    {
        image_index = 3;
    }
    draw_self();
    if (damagetimer > 0)
    {
        draw_sprite_ext(sprite_index, 2, x, y, image_xscale, image_yscale, image_angle, image_blend, damagetimer / 5);
        damagetimer -= 1;
    }
}
if (destroyed == 1)
{
    snd_play(snd_bomb);
    if (type == 4 && global.turntimer > 20)
    {
        bomb = instance_create(x, y, obj_sneo_heart_bomb_explode);
        bomb.depth = depth - 2;
    }
    else
    {
        scr_afterimage_cut();
    }
    for (i = 10; i >= 0; i--)
    {
        piece = scr_marker(lerp(x, rembossx, i / 9), lerp(y, rembossy, i / 9), spr_sneo_wireheart);
        piece.image_index = 4;
        piece.i = i;
        piece.depth = depth + 1;
        with (piece)
        {
            scr_script_delayed(scr_afterimage_cut, i * 2);
            scr_script_delayed(snd_play, i * 2, snd_bomb);
            scr_script_delayed(snd_volume, i * 2, 142, 0.5, 0);
            scr_doom(id, (i * 2) + 1);
        }
    }
    if (altbiter == 1 || altbiter == 2)
    {
        obj_spamton_neo_enemy.makeheartalt = altbiter + 2;
    }
    if (type == 0 || (type == 1 && obj_spamton_neo_enemy.difficulty > 2))
    {
        with (obj_spamton_neo_enemy)
        {
            if (global.monsterhp[myself] == global.monstermaxhp[myself] && scr_sideb_get_phase() < 3)
            {
                obj_sneo_bulletcontroller.mercyaccumulated += 3;
                with (obj_spamton_neo_enemy)
                {
                    __mercydmgwriter = instance_create(global.monsterx[myself], (global.monstery[myself] + 20) - (global.hittarget[myself] * 20), obj_dmgwriter);
                    __mercydmgwriter.damage = 3;
                    __mercydmgwriter.type = 5;
                    global.hittarget[myself]++;
                }
            }
            else
            {
                global.monsterhp[0] -= ceil(global.monstermaxhp[0] * 0.03);
                if (global.monsterhp[0] < 0)
                {
                    global.monsterhp[0] = 1;
                }
            }
        }
    }
    instance_destroy();
}
`,Step_0:`if (init == 0)
{
    image_xscale = 0.5;
    image_yscale = 0.5;
    destroyed = 0;
    shotcount = 0;
    bouncecount = 0;
    shottype = 0;
    shottimer = 0;
    init = 1;
    con = 1;
    if (i_ex(boss))
    {
        rembossx = boss.x;
        rembossy = boss.y;
    }
    else
    {
        rembossx = bossx;
        rembossy = bossy;
    }
    var xscale = 1;
    var yscale = 1;
    if (type == 1)
    {
        xscale = 1;
        yscale = 1;
        sprite_index = spr_sneo_wireheart_smaller;
        moveframes *= 0.8;
        hp = 10;
    }
    scr_lerpvar("image_xscale", 0.5, xscale, 20, -1, "out");
    scr_lerpvar("image_yscale", 0.5, yscale, 20, -1, "out");
    if (type == 3)
    {
        sprite_index = spr_sneo_wireheart_biter;
        hp = 3;
        moveframes = 12;
    }
    if (type == 4)
    {
        sprite_index = spr_sneo_wireheart_bomb;
        hp = 1;
    }
}
if (con == 1)
{
    if (bighearttype == 1)
    {
        moveframes = 16;
    }
    targetx = camerax() + 300 + random(70);
    targety = cameray() + 145 + random_range(-70, 70);
    if (type == 3)
    {
        if (altbiter > 0 && altbiter < 3)
        {
            targetx = camerax() + 150;
            if (altbiter == 1)
            {
                targety = cameray() + 240;
            }
            else
            {
                targety = cameray() + 75;
            }
        }
        else
        {
            targetx = camerax() + 170 + random(70);
            targety = cameray() + 145 + random_range(-60, 60);
        }
        if (altbiter == 3)
        {
            targetx = camerax() + 350;
            targety = cameray() + 130 + random_range(-45, 0);
        }
        if (altbiter == 4)
        {
            targetx = camerax() + 350;
            targety = cameray() + 160 + random_range(45, 0);
        }
    }
    if (i_ex(obj_heart) && obj_sneo_bulletcontroller.hearttargettimer < 1 && type != 3)
    {
        if (choose(0, 1, 2) == 0)
        {
            targety = obj_heart.y + 10;
            obj_sneo_bulletcontroller.hearttargettimer = 6;
        }
    }
    movetimer = 0;
    con = 2;
    if (type == 0 || type == 1)
    {
        with (boss)
        {
            heart_release_con = 1;
        }
    }
}
if (con == 2)
{
    movetimer += (1 / moveframes);
    x = lerp_ease_out(bossx, targetx, movetimer, 2);
    y = lerp_ease_out(bossy, targety, movetimer, 2);
    if (movetimer >= 1)
    {
        movetimer = 0;
        con = 3;
    }
}
if (con == 3)
{
    if (type == 3 && altbiter > 0 && altbiter < 3)
    {
        movetimer++;
        if (altbiter == 1)
        {
            y = lerp(cameray() + 240, cameray() + 75, movetimer / 21);
        }
        if (altbiter == 2)
        {
            y = lerp(cameray() + 75, cameray() + 240, movetimer / 21);
        }
        if (movetimer >= 20)
        {
            movetimer = 0;
            con = 10;
            targety = y;
        }
    }
    if (type == 3 && altbiter > 2)
    {
        movetimer++;
        if (movetimer == 1)
        {
            instance_create(x, y, obj_sneo_heart_laser);
        }
        if (movetimer >= 16)
        {
            movetimer = 0;
            con = 10;
        }
    }
    else
    {
        con = 10;
        movetimer = 0;
    }
}
if (con == 10)
{
    movetimer += (1 / moveframes);
    x = lerp_ease_in(targetx, bossx, movetimer, 2);
    y = lerp_ease_in(targety, bossy, movetimer, 2);
    if ((movetimer > 0.5 && type == 0) || (movetimer > 0.5 && type == 1 && obj_spamton_neo_enemy.difficulty > 2))
    {
        with (boss)
        {
            heart_release_con = 0;
        }
    }
    if (movetimer >= 1)
    {
        movetimer = 0;
        shottimer = 0;
        con = 1;
    }
}
if (con == 2 || con == 3 || con == 10)
{
    var radial = 5;
    if (abs((x - targetx) / (targetx - bossx)) < 0.2)
    {
        shottimer--;
        if (shottimer <= 0)
        {
            if (type == 0)
            {
                firedtimer = 4;
                var dir = 0;
                if (bighearttype == 1 && y < obj_growtangle.y)
                {
                    dir = 25 + random(10);
                }
                if (bighearttype == 1 && y > obj_growtangle.y)
                {
                    dir = (random(10) * -1) - 25;
                }
                for (i = 0; i < radial; i++)
                {
                    radialshot = instance_create(x, y, obj_collidebullet);
                    with (radialshot)
                    {
                        scr_bullet_init();
                    }
                    radialshot.sprite_index = spr_diamondbullet;
                    radialshot.direction = ((i / radial) * 180) + 110 + dir;
                    if (special == 1)
                    {
                        radialshot.direction += random_range(-10, 10);
                    }
                    radialshot.image_angle = radialshot.direction;
                    radialshot.active = 1;
                    radialshot.speed = 1;
                    radialshot.friction = -0.3;
                    if (bighearttype == 1)
                    {
                        radialshot.speed = 1;
                        radialshot.friction = -0.23;
                    }
                    radialshot.depth = depth - 1;
                    radialshot.target = target;
                    radialshot.damage = damage;
                    radialshot.grazed = 0;
                    radialshot.element = 6;
                    if (obj_spamton_neo_enemy.difficulty == 0)
                    {
                        radialshot.grazepoints = 3;
                    }
                    if (obj_spamton_neo_enemy.difficulty == 2)
                    {
                        radialshot.grazepoints = 2;
                    }
                }
                shottimer = 10;
                if (bighearttype == 1)
                {
                    shottimer = 6;
                }
            }
            else if (type == 1)
            {
                firedtimer = 4;
                for (i = 0; i < radial; i++)
                {
                    radialshot = instance_create(x, y, obj_collidebullet);
                    with (radialshot)
                    {
                        scr_bullet_init();
                    }
                    radialshot.sprite_index = spr_diamondbullet;
                    radialshot.direction = point_direction(radialshot.x, radialshot.y, obj_heart.x + 10, obj_heart.y + 10);
                    radialshot.image_angle = radialshot.direction;
                    radialshot.image_xscale = 0.5;
                    radialshot.image_yscale = 0.5;
                    radialshot.active = 1;
                    radialshot.speed = 3;
                    radialshot.friction = -0.2;
                    radialshot.depth = depth - 1;
                    radialshot.target = target;
                    radialshot.damage = damage;
                    radialshot.grazed = 0;
                    radialshot.element = 6;
                }
                shottimer = 6;
            }
        }
    }
}
`}},{metadata:{index:245,name:`obj_sneo_heart_laser`,parent:null,sprite:`spr_sneo_bullet1`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`timer = 0;
siner = 0;
con = 0;
con2 = 0;
scr_bullet_init();
image_speed = 0.25;
image_xscale = 0.1;
image_yscale = 0.1;
destroyonhit = 0;
image_angle = point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10) + random_range(-20, 20);
`,Draw_0:`draw_set_color(c_red);
draw_sprite_ext(spr_lasergun_laser_telegraph, 0, x, y, 999, 0.7, image_angle, c_white, 0.3);
siner++;
draw_sprite_ext(sprite_index, image_index, x, y, image_xscale + (sin(siner) / 20), image_yscale + (sin(siner) / 20), 0, c_white, image_alpha);
`,Step_0:`timer++;
if (timer > 0 && timer < 8)
{
    d = instance_create(x, y, obj_rouxls_power_up_orb);
    d.direction = irandom(360);
    d.lifetime = 12;
    d.depth = depth + 1;
    d.image_blend = image_blend;
}
if (timer > 0 && timer < 14)
{
    image_xscale += 0.025;
    image_yscale += 0.025;
}
if (timer == 14)
{
    snd_play(snd_wallclaw);
    laser = instance_create(x, y, obj_queen_laser);
    laser.image_angle = image_angle;
    laser.direction = image_angle;
    laser.image_yscale = 1;
    instance_destroy();
}
`}},{metadata:{index:641,name:`obj_sneo_heart_bomb_explode`,parent:null,sprite:`spr_sneo_wireheart_bomb`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`timer = 0;
con = 0;
siner = 0;
target = 0;
damage = 0;
image_speed = 0;
image_index = 1;
`,Step_0:`timer++;
if (timer == 3 && image_index == 0)
{
    image_index = 1;
    timer = 0;
}
else if (timer == 3 && image_index == 1)
{
    image_index = 0;
    timer = 0;
}
siner += 4;
image_xscale = 2 + (sin(siner / 6) * 0.5);
image_yscale = 2 + (sin(siner / 6) * 0.5);
if (siner == 96)
{
    snd_play(snd_rocket);
    var a = random(44);
    repeat (8)
    {
        radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);
        with (radialshot)
        {
            scr_bullet_init();
        }
        radialshot.sprite_index = spr_diamondbullet;
        radialshot.direction = a;
        radialshot.image_angle = a;
        radialshot.active = 1;
        radialshot.speed = 1;
        radialshot.friction = -0.34;
        radialshot.depth = depth - 1;
        radialshot.target = target;
        radialshot.damage = damage;
        radialshot.grazed = 0;
        radialshot.newtype = 1;
        radialshot.element = 6;
        radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);
        with (radialshot)
        {
            scr_bullet_init();
        }
        radialshot.sprite_index = spr_diamondbullet;
        radialshot.direction = a + 10;
        radialshot.image_angle = a + 10;
        radialshot.active = 1;
        radialshot.speed = 1;
        radialshot.friction = -0.1;
        radialshot.depth = depth - 1;
        radialshot.target = target;
        radialshot.damage = damage;
        radialshot.grazed = 0;
        radialshot.newtype = 1;
        radialshot.element = 6;
        a += 45;
    }
    instance_destroy();
}
`}},{metadata:{index:615,name:`obj_sneo_heatattack_bullet`,parent:`obj_basicbullet_sneo`,sprite:`spr_neo_heart_bullet`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`scr_bullet_init();
element = 6;
f = 1;
destroyable = 0;
angle_speed = 0;
destroypoints = 1;
dir = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
newtype = 0;
timer = 0;
`,Other_10:`if (difficulty == 0)
{
    breakspot1[0] = 4;
    pipispot1[0] = 1;
    wallcreatetimer[0] = 1;
    breakspot1[1] = 2;
    pipispot1[1] = 3;
    breakspot1[2] = 4;
    breakspot1[3] = 4;
    wallcreatetimer[3] = 6;
    breakspot1[4] = 4;
    wallcreatetimer[4] = 6;
    breakspot1[5] = 4;
    wallcreatetimer[5] = 6;
    breakspot1[6] = 4;
    wallcreatetimer[6] = 6;
    breakspot1[7] = 4;
    wallcreatetimer[7] = 6;
    breakspot1[8] = 1;
    pipispot1[8] = 3;
    wallcreatetimer[8] = 20;
    pipispot1[9] = 1;
    breakspot1[9] = 4;
    wallcreatetimer[9] = 20;
    breakspot1[10] = 2;
    wallcreatetimer[10] = 30;
    pipispot1[11] = 2;
    breakspot1[11] = 3;
    emptyspot1[11] = 4;
    wallcreatetimer[11] = 1;
    breakspot1[12] = 2;
    pipispot1[12] = 3;
    emptyspot1[12] = 4;
    wallcreatetimer[12] = 6;
    breakspot1[13] = 2;
    breakspot2[13] = 3;
    emptyspot1[13] = 4;
    wallcreatetimer[13] = 6;
    breakspot1[14] = 2;
    breakspot2[14] = 3;
    wallcreatetimer[14] = 6;
    emptyspot1[15] = 3;
    pipispot1[15] = 4;
    breakspot1[15] = 5;
    wallcreatetimer[15] = 80;
    emptyspot1[16] = 3;
    breakspot1[16] = 4;
    pipispot1[16] = 5;
    wallcreatetimer[16] = 6;
    emptyspot1[17] = 3;
    pipispot1[17] = 4;
    breakspot1[17] = 5;
    wallcreatetimer[17] = 6;
    breakspot1[18] = 4;
    pipispot1[18] = 5;
    wallcreatetimer[18] = 6;
    wallcreatetimer[19] = 999;
}
if (difficulty == 1)
{
    wallspeed = -6;
    breakspot1[0] = 2;
    breakspot2[0] = 3;
    breakspot1[1] = 2;
    breakspot2[1] = 3;
    pipispot1[1] = 4;
    wallcreatetimer[1] = 8;
    emptyspot1[2] = 1;
    breakspot1[2] = 2;
    breakspot2[2] = 3;
    wallcreatetimer[2] = 8;
    breakspot1[3] = 1;
    emptyspot1[3] = 2;
    emptyspot2[3] = 3;
    emptyspot3[3] = 4;
    wallcreatetimer[3] = 8;
    emptyspot1[4] = 1;
    breakspot2[4] = 4;
    wallcreatetimer[4] = 8;
    breakspot1[5] = 1;
    emptyspot1[5] = 2;
    breakspot2[5] = 3;
    breakspot3[5] = 4;
    wallcreatetimer[5] = 8;
    pipispot1[6] = 1;
    breakspot1[6] = 2;
    pipispot2[6] = 3;
    breakspot2[6] = 4;
    wallcreatetimer[6] = 8;
    emptyspot1[7] = 1;
    emptyspot2[7] = 2;
    emptyspot3[7] = 3;
    pipispot1[7] = 4;
    wallcreatetimer[7] = 8;
    wallcreatetimer[8] = 999;
}
if (difficulty == 2)
{
    wallspeed = -6;
    breakspot1[0] = 2;
    breakspot2[0] = 3;
    breakspot1[1] = 2;
    breakspot2[1] = 3;
    pipispot1[1] = 4;
    wallcreatetimer[1] = 8;
    emptyspot1[2] = 1;
    breakspot1[2] = 2;
    breakspot2[2] = 3;
    wallcreatetimer[2] = 8;
    breakspot1[3] = 1;
    emptyspot1[3] = 2;
    emptyspot2[3] = 3;
    emptyspot3[3] = 4;
    wallcreatetimer[3] = 8;
    emptyspot1[4] = 1;
    breakspot2[4] = 4;
    wallcreatetimer[4] = 8;
    breakspot1[5] = 1;
    emptyspot1[5] = 2;
    breakspot2[5] = 3;
    breakspot3[5] = 4;
    wallcreatetimer[5] = 8;
    pipispot1[6] = 1;
    breakspot1[6] = 2;
    pipispot2[6] = 3;
    breakspot2[6] = 4;
    wallcreatetimer[6] = 8;
    emptyspot1[7] = 1;
    emptyspot2[7] = 2;
    emptyspot3[7] = 3;
    pipispot1[7] = 4;
    wallcreatetimer[7] = 8;
    wallcreatetimer[8] = 999;
}
if (difficulty == 3)
{
    wallspeed = -10;
    breakspot1[0] = 4;
    breakspot1[1] = 4;
    wallcreatetimer[1] = 4;
    breakspot1[2] = 4;
    wallcreatetimer[2] = 4;
    breakspot1[3] = 4;
    wallcreatetimer[3] = 4;
    breakspot1[4] = 4;
    wallcreatetimer[4] = 4;
    breakspot1[5] = 2;
    wallcreatetimer[5] = 25;
    breakspot1[6] = 2;
    wallcreatetimer[6] = 4;
    breakspot1[7] = 2;
    wallcreatetimer[7] = 4;
    breakspot1[8] = 2;
    wallcreatetimer[8] = 4;
    breakspot1[9] = 2;
    wallcreatetimer[9] = 4;
    pipispot1[10] = 2;
    breakspot1[10] = 4;
    wallcreatetimer[10] = 25;
    breakspot1[11] = 4;
    wallcreatetimer[11] = 4;
    breakspot1[12] = 4;
    wallcreatetimer[12] = 4;
    breakspot1[13] = 4;
    wallcreatetimer[13] = 4;
    breakspot1[14] = 4;
    wallcreatetimer[14] = 4;
}
`,Step_0:`image_angle = dir;
f += 1.4;
x += lengthdir_x(f, dir);
y += lengthdir_y(f, dir);
if (global.turntimer < 1)
{
    instance_destroy();
}
`}},{metadata:{index:561,name:`obj_queen_laser`,parent:`obj_collidebullet`,sprite:`spr_lasergun_laser`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`scr_bullet_init();
destroyonhit = 1;
timer = 0;
image_xscale = 0;
image_yscale = 1;
active = 1;
if (instance_exists(obj_queen_enemy))
{
    damage = global.monsterat[obj_queen_enemy.myself] * 5;
}
if (instance_exists(obj_queen_bulletcontroller))
{
    target = obj_queen_bulletcontroller.target;
}
grazepoints = 4;
`,Step_0:`if (image_xscale < 10)
{
    image_xscale += 0.5;
}
if (image_xscale >= 6)
{
    speed += 4;
    if (speed >= 20)
    {
        active = 0;
        if (image_yscale >= 1)
        {
            image_yscale += 0.2;
        }
        image_alpha -= 0.2;
        if (image_alpha <= 0)
        {
            instance_destroy();
        }
    }
}
`}}],Mt=[{metadata:{index:629,name:`obj_sneo_phonecall`,parent:`obj_bulletparent`,sprite:`spr_sneo_phone`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`exit;
`,Create_0:`timer = 0;
seen = 0;
writeline = false;
state = 0;
talktimer = -15;
talking = false;
talkmax = 45;
songtime = 0;
secondtime = 0;
skipintro = 0;
resumeinterval = 1.715;
sneo = obj_spamton_neo_enemy;
isattack = 0;
target = 0;
peeking = 0;
siner = 0;
init = 0;
visible = false;
ydrop = 0;
ringtimer = 0;
damage = -1;
target = -1;
fadealpha = 1;
textboxdistance = 20;
textboxoffsetx = 0;
textboxoffsety = 0;
`,Destroy_0:`sneo.partmode = 1;
with (obj_spamton_neo_enemy)
{
    scr_move_to_rememberxy(8);
}
`,Draw_0:`draw_set_alpha(fadealpha);
draw_set_color(c_white);
if (state == 0 || (state == 1 && sneo.partframe[1] == 0))
{
    siner++;
    draw_self();
    draw_line_width(x, y, obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[5], -20, 2);
    image_angle = sin(siner / 20) * 10;
    if (ringtimer > 0)
    {
        image_angle += (((ringtimer % 2) == 0) ? 1 : -1);
        ringtimer--;
        if (ringtimer <= 6)
        {
            sneo.partmode = 5;
        }
    }
    x = xstart + (sin((siner + 0) / 20) * 10);
    if (ydrop < 1)
    {
        ydrop += 0.02;
    }
    y = lerp(-30, ystart, scr_ease_out(ydrop, -2));
}
else
{
    xx = scr_orbitx(0, 0, 20, 50, sneo.partrot[1]) + sneo.x + sneo.partx[1] + sneo.partxoff[1];
    yy = scr_orbity(0, 0, 20, 50, sneo.partrot[1]) + sneo.y + sneo.party[1] + sneo.partyoff[1];
    draw_line_width(xx, yy, obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[5], -20, 2);
}
draw_set_alpha(1);
`,Step_0:`if (init == 0)
{
    y = -30;
    visible = true;
    init = 1;
}
if (state < 7)
{
    global.turntimer = 430;
    if (obj_spamton_neo_enemy.difficulty == 3)
    {
        global.turntimer = 100;
    }
}
if (talking)
{
    talktimer++;
    var aa = 0;
    if (obj_spamton_neo_enemy.difficulty == 3 && state >= 5)
    {
        aa = 1;
    }
    if (button1_p() && talktimer > 5 && aa == 0)
    {
        talktimer = talkmax;
    }
    if (button3_h() && talktimer > 1 && aa == 0)
    {
        talktimer = talkmax;
    }
    if (talktimer >= talkmax)
    {
        sneo.talktimer = sneo.talkmax;
        with (obj_writer)
        {
            instance_destroy();
        }
        talking = false;
        talktimer = -10;
        state++;
    }
    exit;
}
if (state == 6)
{
    if (scr_isphase("bullets") || isattack)
    {
        if (!secondtime)
        {
            songtime = (songtime + resumeinterval) - (songtime % resumeinterval);
            if (songtime > 140)
            {
                songtime = 0;
            }
        }
        if (isattack)
        {
            if (obj_spamton_neo_enemy.difficulty == 3)
            {
                instance_create(obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[5], obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party[5] + 60, obj_sneo_phonecall_pipis_stream);
            }
            else
            {
                with (obj_sneo_bulletcontroller)
                {
                    instance_destroy();
                }
                var xx = scr_orbitx(0, 0, -26, secondtime ? 30 : 70, sneo.partrot[1]) + sneo.x + sneo.partx[1] + sneo.partxoff[1];
                var yy = scr_orbity(0, 0, -26, secondtime ? 30 : 70, sneo.partrot[1]) + sneo.y + sneo.party[1] + sneo.partyoff[1];
                global.monsterattackname[obj_spamton_neo_enemy.myself] = "FootballPipis";
                d = instance_create(xx, yy, obj_sneo_bulletcontroller);
                d.type = 1;
                d.damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
                d.target = target;
            }
        }
        state = 7;
    }
    exit;
}
if (talktimer < 0)
{
    talktimer++;
}
else if (state == 0)
{
    if (!secondtime)
    {
    }
    ringtimer = 12;
    sndphone = snd_play(snd_phone);
    snd_volume(sndphone, 0.7, 0);
    talktimer = -10;
    state++;
}
else if (state == 1)
{
    talktimer = -10;
    state++;
    sneo.partmode = 6;
    if (skipintro == 1)
    {
        state = 5;
    }
}
else if (state == 2)
{
    if (obj_spamton_neo_enemy.difficulty == 3)
    {
        msgsetloc(0, "WHAT!?", "obj_sneo_phonecall_slash_Step_0_gml_89_0");
    }
    else
    {
        msgsetloc(0, "WHAT!?", "obj_sneo_phonecall_slash_Step_0_gml_96_0");
        sneo.partmode = 7;
    }
    writeline = true;
}
else if (state == 3)
{
    if (obj_spamton_neo_enemy.difficulty == 3)
    {
        state = 5;
    }
    else
    {
        msgsetloc(0, "WHAT? ARE&YOU SERIOUS!?", "obj_sneo_phonecall_slash_Step_0_gml_136_0");
        sneo.partmode = 7;
        writeline = true;
    }
}
else if (state == 4)
{
    state = 5;
}
else if (state == 5)
{
    if (scr_isphase("bullets") && skipintro == 0)
    {
        textboxoffsetx = 10;
        textboxoffsety = 20;
        if (obj_spamton_neo_enemy.difficulty == 3)
        {
            msgsetloc(0, "IT'S FOR&ME!?", "obj_sneo_phonecall_slash_Step_0_gml_176_0");
        }
        else
        {
            msgsetloc(0, "... IT'S&FOR YOU.", "obj_sneo_phonecall_slash_Step_0_gml_138_0");
            sneo.partframe[1] = 3;
        }
        textboxdistance = 40;
        writeline = true;
    }
    else
    {
        state = 6;
    }
    with (sneo)
    {
        if (obj_spamton_neo_enemy.difficulty != 3)
        {
            partmode = 9;
            partrot[1] = -180;
            partframe[1] = 3;
        }
        else
        {
            partmode = 9;
            partframe[1] = 4;
        }
    }
}
if (writeline)
{
    writeline = false;
    with (obj_spamton_neo_enemy)
    {
        global.typer = 72;
        scr_enemyblcon(((x - obj_sneo_phonecall.textboxdistance) + 22) - obj_sneo_phonecall.textboxoffsetx, y + 60 + obj_sneo_phonecall.textboxoffsety, 10);
    }
    talktimer = 0;
    talking = true;
}
`}},{metadata:{index:667,name:`obj_sneo_phonecall_pipis_stream`,parent:`obj_collidebullet`,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`timer = 0;
`,Step_0:`part = instance_create((x - 4) + random(8), (y - 4) + random(8), obj_sneo_phonecall_sneohead);
part.direction = -5 + random(38);
part.speed = 7 + random(13);
part.image_angle = direction - 180;
`}},{metadata:{index:665,name:`obj_sneo_phonecall_sneohead`,parent:null,sprite:`spr_sneo_crew`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_xscale = 0.5;
image_yscale = -0.5;
timer = 0;
con = 0;
homingfactor = 0;
maxhomingfactor = 2;
`,Step_0:`if (global.turntimer < 3)
{
    instance_destroy();
}
image_angle = direction - 180;
timer++;
if (timer >= (4 + irandom(1)))
{
    instance_destroy();
    fx = instance_create(x, y, obj_pipis_destroy_fx);
    fx.image_xscale = 2;
    fx.image_yscale = 2;
    fx.image_speed = 1;
    snd_play(snd_rocket_sneo);
    snd_volume(snd_rocket_sneo, 0.1, 0);
    obj_spamton_neo_enemy.partx[5] = random(8);
    obj_spamton_neo_enemy.party[5] = random(8);
}
`}},{metadata:{index:660,name:`obj_pipis_controller`,parent:null,sprite:`spr_sneo_arml`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`con = 0;
timer = 0;
con2 = 0;
timer2 = 0;
timer3 = 0;
variant = 2;
eggcount = 20;
savex = 0;
firstshot = 1;
siner = irandom(100);
timervariance = 30;
pipiscount = 0;
speedvar = 2;
movecon = 0;
movetimer = 0;
image_angle = -170;
image_xscale = 2;
angle_final = -170;
damage = 0;
target = 0;
sprite_index = spr_sneo_arml_egg;
maxpipis = 10;
`,Draw_0:`siner += 0.25;
var xx = (camerax() + camerawidth()) - 10;
var yy = ((cameray() + cameraheight()) - 230) + (sin(siner / 6) * 21);
var shake = 0;
if (sprite_index == spr_sneo_arml_egg)
{
    shake = -4 + random(8);
}
if (movecon == 0)
{
    movetimer++;
    xx = lerp(camerax() + camerawidth() + 70, (camerax() + camerawidth()) - 10, movetimer / 10);
    if (movetimer == 10)
    {
        movetimer = 0;
        movecon = 1;
    }
}
if (global.turntimer < 16)
{
    movecon = 2;
}
if (movecon == 2)
{
    movetimer++;
    xx = lerp((camerax() + camerawidth()) - 10, camerax() + camerawidth() + 70, movetimer / 10);
    if (movetimer == 10)
    {
        instance_destroy();
    }
}
if (variant == 3 && movecon == 1)
{
    if (con == 0)
    {
        timer++;
        if (timer >= 1)
        {
            if (!instance_exists(obj_pipis_wall))
            {
                wall = instance_create(obj_growtangle.x + 200, obj_growtangle.y + (obj_growtangle.sprite_height / 2) + 60, obj_pipis_wall);
                wall.image_xscale = 2.5;
            }
            con = 1;
            timer = 0;
        }
    }
    if (con == 1)
    {
        repeat (3)
        {
            if (irandom(10) < 6)
            {
                bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_sneo_pipis_bomb);
                bul.gravity = 0.2 + (random(3) / 100);
                bul.vspeed = -6 - random(2);
                bul.hspeed = -1.8 - random(1.5);
                bul.target = target;
                bul.damage = damage;
                bul.depth = depth - 1;
                bul.directhit = 1;
            }
            else
            {
                bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);
                bul.type = 3;
                bul.gravity = 0.2 + (random(3) / 100);
                bul.vspeed = -6 - random(2);
                bul.hspeed = -1.6 - random(3);
                bul.target = target;
                bul.damage = damage;
                bul.depth = depth - 1;
                bul.directhit = 1;
            }
        }
        sprite_index = spr_sneo_arml;
        angle_final = -180 + random(50);
        repeat (3)
        {
            bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_sneo_armcannon_smoke);
            bul.depth = depth - 2;
        }
        con = 2;
    }
    if (con == 2)
    {
        timer++;
        if (timer < 11)
        {
            image_angle = lerp(image_angle, angle_final, timer / 10);
        }
        if (timer < (timervariance - 15) && eggcount > 0.4)
        {
            image_xscale = lerp(1.8, 2.5, timer / (timervariance - 15));
        }
        if (timer == (timervariance - 15) && eggcount > 0.4)
        {
            sprite_index = spr_sneo_arml_egg;
            image_xscale = 2;
        }
        if (timer >= timervariance)
        {
            eggcount -= 0.4;
            timervariance = 60 + irandom(15);
            con = 1;
            timer = 0;
        }
    }
}
if (variant == 2 && movecon == 1)
{
    if (con == 0)
    {
        timer++;
        if (timer >= 1)
        {
            if (!instance_exists(obj_pipis_wall))
            {
                wall = instance_create(obj_growtangle.x + 200, obj_growtangle.y + (obj_growtangle.sprite_height / 2), obj_pipis_wall);
                wall.image_xscale = 2.9;
            }
            con = 1;
            timer = 0;
        }
    }
    if (con == 1)
    {
        var aa = 1;
        pipiscount++;
        if (pipiscount == 3 || pipiscount == 5 || pipiscount == 9)
        {
            aa = 0;
        }
        if (pipiscount == 0 || pipiscount == 4 || pipiscount == 8 || pipiscount == 11)
        {
            aa = 1;
        }
        if (obj_spamton_neo_enemy.difficulty == 0)
        {
            var rand = 0.8;
            if (global.turntimer > 380)
            {
                rand = 0.5;
            }
            var rr = 0;
            if (instance_number(obj_pipis_egg_bullet) < 2 && global.turntimer < 250)
            {
                rr = 1;
            }
            if (instance_number(obj_pipis_egg_bullet) < 3 && pipiscount < maxpipis)
            {
                if (aa == 1)
                {
                    bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);
                    bul.type = 2;
                    bul.gravity = 0.5 + (random(10) / 100);
                    bul.vspeed = -14;
                    bul.hspeed = -1.55 - rr - random(rand);
                    bul.target = target;
                    bul.damage = damage;
                    bul.depth = depth - 1;
                }
                else
                {
                    bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);
                    bul.type = 2;
                    bul.gravity = 0.063 + (random(4) / 100);
                    bul.vspeed = -4.25;
                    bul.hspeed = -4;
                    bul.target = target;
                    bul.damage = damage;
                    bul.depth = depth - 1;
                    bul.directhit = 1;
                }
            }
        }
        else
        {
            var rr = 0;
            if (instance_number(obj_pipis_egg_bullet) < 2 && global.turntimer < 250)
            {
                rr = 1;
            }
            if (instance_number(obj_pipis_egg_bullet) < 3)
            {
                var a = -1.6 - random(0.6);
                if (aa == 1)
                {
                    repeat (2)
                    {
                        bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);
                        bul.type = 2;
                        bul.gravity = 0.5 + (random(10) / 100);
                        bul.vspeed = -14;
                        bul.hspeed = -1.55 - rr - random(0.8);
                        bul.target = target;
                        bul.damage = damage;
                        bul.depth = depth - 1;
                        a = -2.2 - random(0.6);
                    }
                }
                else
                {
                    bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);
                    bul.type = 2;
                    bul.gravity = 0.063 + (random(4) / 100);
                    bul.vspeed = -4.25;
                    bul.hspeed = -4;
                    bul.target = target;
                    bul.damage = damage;
                    bul.depth = depth - 1;
                    bul.directhit = 1;
                    bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);
                    bul.type = 2;
                    bul.gravity = 0.5 + (random(10) / 100);
                    bul.vspeed = -14;
                    bul.hspeed = -1.4 - random(0.4);
                    bul.target = target;
                    bul.damage = damage;
                    bul.depth = depth - 1;
                    a = -2.2 - random(0.6);
                }
            }
        }
        sprite_index = spr_sneo_arml;
        angle_final = -180 + random(50);
        repeat (3)
        {
            bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_sneo_armcannon_smoke);
            bul.depth = depth - 2;
        }
        con = 2;
    }
    var r = 1;
    if (instance_number(obj_pipis_egg_bullet) < 1)
    {
        r = 3;
    }
    repeat (r)
    {
        if (con == 2)
        {
            timer++;
            if (timer < 11)
            {
                image_angle = lerp(image_angle, angle_final, timer / 10);
            }
            if (timer < (timervariance - 15) && eggcount > 0.4)
            {
                image_xscale = lerp(1.8, 2.5, timer / (timervariance - 15));
            }
            if (timer == (timervariance - 15) && eggcount > 0.4 && pipiscount < maxpipis)
            {
                sprite_index = spr_sneo_arml_egg;
                image_xscale = 2;
            }
            if (timer >= timervariance)
            {
                eggcount -= 0.4;
                timervariance = 30 + irandom(15);
                if (eggcount > 0)
                {
                    con = 0;
                    timer = 0;
                }
                else
                {
                    instance_destroy();
                }
            }
        }
    }
}
draw_sprite_ext(spr_sneo_wingl, 0, xx, yy + 20, 2, 2, 20, c_white, 1);
draw_sprite_ext(sprite_index, 1, xx, yy + 11 + (shake / 2), image_xscale, 2, image_angle + shake, c_white, 1);
draw_sprite_ext(spr_sneo_body, 0, xx, yy + 20, 2, 2, 0, c_white, 1);
draw_sprite_ext(spr_sneo_head, 1, xx + 26, yy, 2, 2, 0, c_white, 1);
if (pipiscount >= maxpipis && global.turntimer > 10 && !instance_exists(obj_pipis_egg_bullet))
{
    global.turntimer = 10;
}
if (global.turntimer < 1)
{
    instance_destroy();
}
if (variant == 0)
{
    if (con == 0)
    {
        timer++;
        if (timer == 1)
        {
            savex = ((obj_growtangle.x + 220) - 80) + random(160);
            instance_create(savex, (obj_growtangle.y - random(30)) + (obj_growtangle.sprite_height / 2), obj_pipis_wall);
        }
        if (timer >= 10)
        {
            con = 1;
            timer = 0;
        }
    }
    if (con == 1)
    {
        bul = instance_create(savex, cameray() - 20, obj_pipis_egg_bullet);
        bul.gravity = 0.2 + (random(10) / 100);
        bul.target = target;
        bul.damage = damage;
        con = 2;
    }
    if (con == 2)
    {
        timer++;
        if (timer >= 50)
        {
            eggcount--;
            if (eggcount > 0)
            {
                con = 0;
                timer = 0;
                with (obj_pipis_wall)
                {
                    con = 1;
                }
            }
            else
            {
                instance_destroy();
            }
        }
    }
}
if (variant == 1)
{
    if (con == 0)
    {
        timer++;
        if (timer == 1)
        {
            wall = instance_create(((obj_growtangle.x + 190) - 50) + random(100), obj_growtangle.y + (obj_growtangle.sprite_height / 2), obj_pipis_wall);
            wall.type = 1;
        }
        if (timer >= 10)
        {
            con = 1;
            timer = 0;
        }
    }
    if (con == 1)
    {
        bul = instance_create(wall.x, cameray() - 20, obj_pipis_egg_bullet);
        bul.gravity = 0.2 + (random(10) / 100);
        bul.type = 1;
        bul.parent = wall.id;
        bul.target = target;
        bul.damage = damage;
        con = 2;
    }
    if (con == 2)
    {
        timer++;
        if (timer >= 50)
        {
            eggcount--;
            if (eggcount > 0)
            {
                con = 0;
                timer = -40;
                with (wall)
                {
                    con = 1;
                }
            }
            else
            {
                instance_destroy();
            }
        }
    }
    if (con2 == 0)
    {
        timer2++;
        if (timer2 == 40)
        {
            wall2 = instance_create(((obj_growtangle.x + 280) - 50) + random(100), obj_growtangle.y - (obj_growtangle.sprite_height / 2), obj_pipis_wall);
            wall2.type = 1;
        }
        if (timer2 >= 50)
        {
            con2 = 1;
            timer2 = 0;
        }
    }
    if (con2 == 1)
    {
        bul = instance_create(wall2.x, cameray() + cameraheight() + 20, obj_pipis_egg_bullet);
        bul.gravity = 0.2 + (random(10) / 100);
        bul.gravity_direction = 90;
        bul.type = 1;
        bul.parent = wall2.id;
        bul.target = target;
        bul.damage = damage;
        con2 = 2;
    }
    if (con2 == 2)
    {
        timer2++;
        if (timer2 >= 50)
        {
            eggcount--;
            if (eggcount > 0)
            {
                con2 = 0;
                timer2 = 0;
                with (wall2)
                {
                    con = 1;
                }
            }
            else
            {
                instance_destroy();
            }
        }
    }
    timer3++;
    if (timer3 == 150)
    {
        bul = instance_create(camerax() + camerawidth(), obj_growtangle.y, obj_pipis_egg_bullet);
        bul.gravity = 0.6 + (random(10) / 100);
        bul.gravity_direction = 180;
        bul.target = target;
        bul.damage = damage;
    }
}
`}},{metadata:{index:631,name:`obj_pipis_egg_bullet`,parent:`obj_collidebullet`,sprite:`spr_pipis_egg`,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`exit;
`,Collision_obj_mettaton_bomb_hitbox:`shake = 8;
hp -= 3;
if (image_index < 3)
{
    image_index += 1;
}
snd_play(snd_damage);
fx = instance_create(x, y, obj_pipis_destroy_fx);
fx.image_xscale = 1.5;
fx.image_yscale = 1.5;
repeat (3)
{
    fx = instance_create(x, y, obj_pipis_egg_bullet_piece);
    fx.image_xscale = 2;
    fx.image_yscale = 2;
}
instance_destroy();
if (obj_spamton_neo_enemy.difficulty == 1)
{
    scr_tensionheal(3);
}
else
{
    scr_tensionheal(1.5);
}
`,Collision_obj_pipis_wall:`if (type != 2 && type != 3)
{
    event_user(0);
}
`,Collision_obj_yheart_shot:`shake = 8;
hp -= other.damage;
if (image_index < 3)
{
    image_index += 1;
}
snd_play(snd_damage);
if (other.big == 0)
{
    with (other)
    {
        event_user(0);
    }
}
if (hp < 1)
{
    fx = instance_create(x, y, obj_pipis_destroy_fx);
    fx.image_xscale = 1.5;
    fx.image_yscale = 1.5;
    repeat (3)
    {
        fx = instance_create(x, y, obj_pipis_egg_bullet_piece);
        fx.image_xscale = 2;
        fx.image_yscale = 2;
    }
    instance_destroy();
    if (obj_spamton_neo_enemy.difficulty == 1)
    {
        scr_tensionheal(2);
    }
    else
    {
        scr_tensionheal(3);
    }
}
else
{
    fx = instance_create(x, y, obj_pipis_egg_bullet_piece);
    fx.image_index = image_index;
    if (x < (camerax() + 500))
    {
        hspeed /= 1.05;
    }
}
`,Create_0:`scr_bullet_init();
hp = 3;
con = 0;
timer = 0;
type = 0;
shake = 0;
parent = -1;
image_speed = 0;
image_xscale = 2;
image_yscale = 2;
image_angle = random(360);
target = 0;
damage = 1;
directhit = 0;
element = 6;
bluesiner = 0;
image_blend2 = merge_color(#00A2E8, c_aqua, 0.25 + (sin(bluesiner / 3) * 0.25));
hitstun = 0;
hitstunenabled = 0;
bouncespeed = -5 - random(3);
drawlabel = 0;
grazepoints = 2;
`,Draw_0:`if (drawlabel == 1)
{
    var lang = 0;
    if (global.lang == "ja")
    {
        lang = 1;
    }
    draw_sprite_ext(spr_pipissign, lang, (x - 4) + random_range(0, 1), y + (sprite_height / 2) + 12 + random_range(0, 1), 1, 1, 0, c_white, 1);
}
if (type == 3)
{
    if (x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 10) && y > ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 10))
    {
        event_user(0);
        snd_play(snd_bomb);
    }
    if (y > ((obj_growtangle.y - 20) + obj_growtangle.sprite_height))
    {
        event_user(0);
        snd_play(snd_bomb);
    }
    image_angle += 10;
}
else if (type == 2)
{
    image_angle += 45;
    if (con == 0)
    {
        if (y > ((obj_growtangle.y - 20) + (obj_growtangle.sprite_height / 2)) && vspeed > 0)
        {
            con = 1;
        }
    }
    if (con == 1)
    {
        snd_play(snd_bump);
        image_angle = -30 - random(30);
        gravity = 0.24;
        vspeed = bouncespeed;
        con = 2;
        alarm[0] = 10;
    }
    if (x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 10) && y > ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 10))
    {
        event_user(0);
        snd_play(snd_bomb);
    }
    if (y > ((obj_growtangle.y - 20) + (obj_growtangle.sprite_height / 2)) && vspeed > 0 && con == 2 && alarm[0] < 1)
    {
        con = 1;
    }
}
else
{
    if (type == 1)
    {
        x = parent.x;
    }
    image_angle += 4;
    if (gravity_direction == 180)
    {
        if (x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 10))
        {
            event_user(0);
            snd_play(snd_bomb);
        }
    }
}
var x_shake = 0;
var y_shake = 0;
if (shake > 0)
{
    shake--;
    x_shake = 4 - random(8);
    y_shake = 4 - random(8);
}
draw_sprite_ext(sprite_index, image_index, x + x_shake, y + y_shake, image_xscale, image_yscale, image_angle, c_white, image_alpha);
if (type == 2)
{
    if ((con == 2 && y < ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 0) && x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 80)) || (directhit == 1 && y < ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 0)))
    {
        gravity += 0.01;
    }
}
`,Other_10:`fx = instance_create(x, y, obj_pipis_destroy_fx);
fx.image_xscale = 1.5;
fx.image_yscale = 1.5;
if (obj_spamton_neo_enemy.difficulty != 4)
{
    if (type == 2)
    {
        for (i = 0; i < 10; i++)
        {
            hed = instance_create(x, y, obj_pipis_bullet_cone);
            hed.direction = (point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10) - 25) + random(50);
            hed.speed = 15 + random(5);
            hed.depth = depth - 100;
            hed.sprite_index = spr_sneo_crew;
            hed.image_xscale = 0.5;
            hed.image_yscale = 0.5;
            hed.target = target;
            hed.damage = damage;
            hed.grazed = 0;
            hed.element = 6;
        }
    }
    else if (type == 3)
    {
        for (i = 0; i < 10; i++)
        {
            hed = instance_create(x, y, obj_pipis_bullet_cone);
            hed.direction = (point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10) - 20) + random(40);
            hed.speed = 15 + random(5);
            hed.depth = depth - 100;
            hed.target = target;
            hed.damage = damage;
            hed.grazed = 0;
            hed.element = 6;
        }
    }
    else
    {
        center = instance_create(x, y, obj_pipis_center);
        center.target = target;
        center.damage = damage;
    }
}
if (obj_spamton_neo_enemy.difficulty == 4)
{
    for (i = 0; i < 15; i++)
    {
        radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);
        with (radialshot)
        {
            scr_bullet_init();
        }
        radialshot.sprite_index = spr_diamondbullet;
        radialshot.dir = ((i * 24) + random(14)) - 7;
        radialshot.active = 1;
        radialshot.depth = depth - 100;
        radialshot.target = target;
        radialshot.damage = damage;
        radialshot.grazed = 0;
        radialshot.element = 6;
    }
    radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);
    with (radialshot)
    {
        scr_bullet_init();
    }
    radialshot.sprite_index = spr_diamondbullet;
    radialshot.dir = point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10);
    radialshot.active = 1;
    radialshot.depth = depth - 100;
    radialshot.target = target;
    radialshot.damage = damage;
    radialshot.grazed = 0;
    radialshot.element = 6;
    radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);
    with (radialshot)
    {
        scr_bullet_init();
    }
    radialshot.sprite_index = spr_diamondbullet;
    radialshot.dir = point_direction(x, y, obj_heart.x + 10, (obj_heart.y + 10) - 40);
    radialshot.active = 1;
    radialshot.depth = depth - 100;
    radialshot.target = target;
    radialshot.damage = damage;
    radialshot.grazed = 0;
    radialshot.element = 6;
    radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);
    with (radialshot)
    {
        scr_bullet_init();
    }
    radialshot.sprite_index = spr_diamondbullet;
    radialshot.dir = point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10 + 40);
    radialshot.active = 1;
    radialshot.depth = depth - 100;
    radialshot.target = target;
    radialshot.damage = damage;
    radialshot.grazed = 0;
    radialshot.element = 6;
}
repeat (3)
{
    fx = instance_create(x, y, obj_pipis_egg_bullet_piece);
    fx.image_index = random(3);
    fx.image_xscale = 2;
    fx.image_yscale = 2;
    fx.direction = 45 + random(90);
}
instance_destroy();
`}},{metadata:{index:632,name:`obj_pipis_bullet`,parent:`obj_collidebullet`,sprite:`spr_sneo_crew`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`if (obj_spamton_neo_enemy.difficulty == 2)
{
    with (other)
    {
        event_user(0);
    }
}
else if (other.big == 0)
{
    with (other)
    {
        event_user(0);
    }
}
event_user(1);
`,Create_0:`scr_bullet_init();
element = 6;
timer = 0;
con = 0;
type = 0;
target = 0;
damage = 1;
hp = 0.5;
image_xscale = 0.5;
image_yscale = 0.5;
length = 0;
place = 0;
parent = -1;
`,Destroy_0:`exit;
`,Other_11:`snd_play_pitch(snd_bomb, 1.1 + random(0.2));
scr_afterimage_cut();
instance_destroy();
`,Step_0:`if (!i_ex(parent))
{
    instance_destroy();
    exit;
}
if (length < 36)
{
    length += 2;
}
x = parent.x + lengthdir_x(length, place);
y = parent.y + lengthdir_y(length, place);
if (hp == 0)
{
    event_user(1);
}
`}},{metadata:{index:1,name:`obj_pipis_bullet_cone`,parent:`obj_collidebullet`,sprite:`spr_sneo_crew`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`exit;
if (obj_spamton_neo_enemy.difficulty == 2)
{
    with (other)
    {
        event_user(0);
    }
}
else if (other.big == 0)
{
    with (other)
    {
        event_user(0);
    }
}
event_user(1);
`,Create_0:`scr_bullet_init();
element = 6;
timer = 0;
con = 0;
type = 0;
target = 0;
damage = 1;
hp = 0.5;
image_xscale = 0.4;
image_yscale = 0.4;
length = 0;
place = 0;
parent = -1;
grazepoints = 1;
`,Destroy_0:`exit;
`,Other_11:`snd_play_pitch(snd_bomb, 1.1 + random(0.2));
scr_afterimage_cut();
instance_destroy();
`,Step_0:`if (hp == 0)
{
    event_user(1);
}
`}},{metadata:{index:662,name:`obj_pipis_center`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`timer = 0;
con = 0;
maxlength = 36;
if (instance_exists(obj_pipis_controller))
{
}
init = 0;
homingfactor = 0;
maxhomingfactor = 5;
`,Step_0:`if (!instance_exists(obj_heart))
{
    instance_destroy();
    exit;
}
if (init == 0)
{
    init = 1;
    b1 = instance_create(x, y, obj_pipis_bullet);
    b1.place = 60 + random(15);
    b1.parent = id;
    b1.damage = damage;
    b1.target = target;
    b2 = instance_create(x, y, obj_pipis_bullet);
    b2.place = 120 + random(15);
    b2.parent = id;
    b2.damage = damage;
    b2.target = target;
    b3 = instance_create(x, y, obj_pipis_bullet);
    b3.place = 180 + random(15);
    b3.parent = id;
    b3.damage = damage;
    b3.target = target;
    b4 = instance_create(x, y, obj_pipis_bullet);
    b4.place = 240 + random(15);
    b4.parent = id;
    b4.damage = damage;
    b4.target = target;
    b5 = instance_create(x, y, obj_pipis_bullet);
    b5.place = 300 + random(15);
    b5.parent = id;
    b5.damage = damage;
    b5.target = target;
    b6 = instance_create(x, y, obj_pipis_bullet);
    b6.place = 360 + random(15);
    b6.parent = id;
    b6.damage = damage;
    b6.target = target;
}
if (con == 0)
{
    timer++;
    if (timer == 15)
    {
        con = 1;
        timer = 0;
    }
}
if (con == 1 || (con > 1 && con < 6))
{
    move_towards_point(obj_heart.x, obj_heart.y, 13);
    con++;
    if (distance_to_object(obj_heart) < 30)
    {
        con = 6;
    }
}
if (x < (camerax() - 50))
{
    instance_destroy();
}
`}},{metadata:{index:663,name:`obj_pipis_destroy_fx`,parent:null,sprite:`spr_boxing_crescent`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_speed = 0.25;
`,Other_7:`instance_destroy();
`,Step_0:`if (global.turntimer < 1)
{
    instance_destroy();
}
`}},{metadata:{index:630,name:`obj_pipis_wall`,parent:null,sprite:`spr_pipis_wall`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_alpha = 0;
image_blend = c_lime;
image_xscale = 1;
con = 0;
timer = 0;
type = 0;
siner = random(100);
`,Step_0:`if (con == 0)
{
    if (image_alpha < 1)
    {
        image_alpha += 0.1;
    }
}
if (con == 1)
{
    if (image_alpha > 0)
    {
        image_alpha -= 0.1;
    }
    else
    {
        instance_destroy();
    }
}
if (type == 1)
{
    siner += 0.5;
    x = xstart + (sin(siner / 6) * 48);
}
if (global.turntimer < 1)
{
    instance_destroy();
}
`}},{metadata:{index:661,name:`obj_pipis_egg_bullet_piece`,parent:null,sprite:`spr_pipis_egg_piece`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`timer = 0;
con = 0;
grav = 0;
image_angle = random(360);
direction = random(360);
speed = 3 + random(7);
image_alpha = 2.9;
if (instance_exists(obj_heart))
{
    depth = obj_heart.depth - 100;
}
else
{
    instance_destroy();
}
`,Step_0:`image_alpha -= 0.1;
grav += 0.3;
y += grav;
if (y > (cameray() + cameraheight() + 10))
{
    instance_destroy();
}
if (global.turntimer < 1)
{
    instance_destroy();
}
`}},{metadata:{index:46,name:`obj_sneo_pipis_bomb`,parent:`obj_collidebullet`,sprite:`spr_mettaton_bomb1`,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`exit;
`,Alarm_1:`exit;
`,CleanUp_0:`if (timer > 0)
{
    snd_stop(bomsfallsfx);
}
`,Collision_obj_yheart_shot:`if (timer == 0 && spawninvincibilitytimer > 11)
{
    snd_play(snd_damage);
    if (other.big == 0)
    {
        with (other)
        {
            event_user(0);
        }
    }
    timer = 1;
    image_speed = 1;
    bomsfallsfx = snd_loop(snd_bombfall);
}
`,Create_0:`scr_bullet_init();
image_xscale = 1;
image_yscale = 1;
timer = 0;
con = 0;
element = 6;
destroyable = 0;
bighitbox = 1;
image_speed = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 2;
wallspeed = -7;
wallnumber = 0;
spawninvincibilitytimer = 0;
`,Draw_0:`draw_self();
if (sprite_index == spr_mettaton_bomb2)
{
    for (var i = 1; i < 24; i++)
    {
        draw_sprite_ext(spr_mettaton_bomb3, image_index, x + (24 * i), y, image_xscale, image_yscale, 90, c_white, image_alpha);
        draw_sprite_ext(spr_mettaton_bomb3, image_index, x - (24 * i), y, image_xscale, image_yscale, 90, c_white, image_alpha);
        draw_sprite_ext(spr_mettaton_bomb3, image_index, x, y - (24 * i), image_xscale, image_yscale, 0, c_white, image_alpha);
        draw_sprite_ext(spr_mettaton_bomb3, image_index, x, y + (24 * i), image_xscale, image_yscale, 0, c_white, image_alpha);
    }
}
`,Step_0:`if (global.turntimer < 1)
{
    instance_destroy();
}
if (timer > 0)
{
    timer++;
}
spawninvincibilitytimer++;
if (timer == 6)
{
    snd_play(snd_bomb);
    snd_stop(bomsfallsfx);
    sprite_index = spr_mettaton_bomb2;
    image_index = 0;
    instance_create(x, y, obj_shake);
    hitbox1 = instance_create(x, y, obj_mettaton_bomb_hitbox);
    hitbox1.image_xscale = 5000;
    hitbox1.image_yscale = 0.5;
    hitbox1.creator = id;
    hitbox2 = instance_create(x, y, obj_mettaton_bomb_hitbox);
    hitbox2.image_xscale = 0.2;
    hitbox2.image_yscale = 5000;
    hitbox2.creator = id;
}
if (timer == 12)
{
    instance_destroy();
}
if (y > ((obj_growtangle.y - 81) + obj_growtangle.sprite_height))
{
    if (alarm[0] < 1)
    {
        snd_play(snd_bump);
        gravity = 0.24;
        vspeed = -5.5 - random(3);
        con = 2;
        alarm[0] = 10;
    }
}
if (x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 10) && y > ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 10))
{
    if (timer == 0)
    {
        snd_play(snd_damage);
        gravity = 0;
        speed = 0;
        timer = 1;
        image_speed = 1;
        bomsfallsfx = snd_loop(snd_bombfall);
    }
}
`}},{metadata:{index:664,name:`obj_sneo_armcannon_smoke`,parent:null,sprite:`spr_boxing_smoke`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_xscale = 1;
image_yscale = 1;
speed = 4;
friction = 0.2;
direction = 70 + random(80);
image_speed = 0;
image_angle = 70 + random(80);
timer = 0;
`,Step_0:`image_alpha -= 0.05;
if (image_alpha < 0)
{
    instance_destroy();
}
if (global.turntimer < 1)
{
    instance_destroy();
}
`}}],Nt=[{metadata:{index:653,name:`obj_sneo_phonehand_master`,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_head_sad`,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`sprite_index = spr_sneo_head;
`,Collision_obj_yheart_shot:`hp--;
if (x <= (camerax() + 480))
{
    friction = 0.5;
    if (other.big == 1)
    {
        hspeed += 8;
    }
    else
    {
        hspeed += 4;
    }
    var rembig = other.big;
    with (obj_sneo_phonehand)
    {
        friction = 0.5;
        hspeed += 2;
        if (rembig)
        {
            hspeed += 4;
        }
    }
}
snd_play(snd_damage);
if (x >= (camerax() + 480))
{
    x = camerax() + 480;
}
with (other)
{
    event_user(0);
}
`,Create_0:`event_inherited();
destroyonhit = 0;
image_speed = 0;
image_xscale = 2;
image_yscale = 2;
siner = 0;
element = 6;
xdist = 70;
phonehand_top = instance_create(x - xdist, y - 70, obj_sneo_phonehand);
phonehand_top.orientation = "top";
phonehand_top.boss = id;
phonehand_top.target = obj_sneo_bulletcontroller.target;
phonehand_bottom = instance_create(x - xdist, y + 60, obj_sneo_phonehand);
phonehand_bottom.orientation = "bottom";
phonehand_bottom.boss = id;
phonehand_bottom.target = obj_sneo_bulletcontroller.target;
movedx = 0;
hp = 200;
difficulty = 0;
difficulty = obj_spamton_neo_enemy.difficulty;
btimer = 0;
init = 0;
visibiliytimer = 0;
image_alpha = 0;
bluesiner = 0;
image_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(bluesiner / 3) * 0.25));
`,Destroy_0:`exit;
`,Draw_0:`visibiliytimer++;
if (visibiliytimer < 2)
{
    exit;
}
if (image_alpha < 1)
{
    image_alpha += 0.1;
}
draw_set_alpha(image_alpha);
draw_self();
draw_set_alpha(1);
`,Step_0:`siner++;
bluesiner++;
image_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(bluesiner / 3) * 0.25));
if (x >= (camerax() + 480))
{
    x = camerax() + 480;
}
if (grazed == 1)
{
    grazetimer += 1;
    if (grazetimer >= 3)
    {
        grazetimer = 0;
        grazed = 0;
    }
}
if (instance_exists(obj_heart))
{
    if (obj_heart.x > (obj_sneo_phonehand_master.x - 36))
    {
        obj_heart.x = obj_sneo_phonehand_master.x - 36;
    }
}
if (init == 0)
{
    if (difficulty == 2)
    {
        with (obj_sneo_phonehand)
        {
            alt = 1;
        }
    }
    phonehand_top.target = target;
    phonehand_bottom.target = target;
    init = 1;
}
if (difficulty == 0)
{
    y = ystart + (sin(siner / 8) * 40);
}
if (difficulty == 1 || difficulty == 2)
{
    y = ystart + (sin(siner / 10) * 60);
}
if (i_ex(phonehand_top))
{
    if (difficulty < 2)
    {
        x = lerp(x, phonehand_top.x + xdist, 0.2);
    }
    else
    {
        x -= 1;
    }
}
if (difficulty == 0 || difficulty == 1 || difficulty == 2)
{
    btimer++;
    threshold = 20;
    if (difficulty == 1)
    {
        threshold = 15;
    }
    if (difficulty == 2)
    {
        threshold = 30;
    }
    if (btimer >= threshold && image_alpha >= 1)
    {
        btimer = 0;
        if (difficulty < 2)
        {
            shot = instance_create(x, y, obj_sneo_mmx_spreadshot);
        }
        else
        {
            shot = instance_create(x, y, obj_basicbullet_sneo);
        }
        shot.speed = 12;
        shot.image_xscale = 3;
        shot.image_yscale = 3;
        if (difficulty < 2)
        {
            shot.friction = 1;
        }
        else
        {
            shot.speed = 10;
        }
        shot.alarm[0] = 25;
        shot.direction = 180 + random_range(-5, 5);
        shot.depth = depth - 1;
        shot.target = target;
        sprite_index = spr_sneo_head_open;
        alarm[0] = 10;
    }
}
`}},{metadata:{index:655,name:`obj_sneo_phonehand`,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_phonehand`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`event_inherited();
destroyonhit = 0;
siner = 0;
crawlsiner = 0;
jointx = 999;
jointy = 999;
remjointy = jointy;
boss = -1;
element = 6;
amplitude = 4;
period = 5;
orientation = "top";
init = 0;
difficulty = 0;
btimer = 0;
moving = 0;
wasmoving = 0;
alt = 0;
visibiliytimer = 0;
image_alpha = 0;
`,Draw_0:`visibiliytimer++;
if (visibiliytimer < 2)
{
    exit;
}
if (image_alpha < 1)
{
    image_alpha += 0.1;
}
draw_set_alpha(image_alpha);
draw_set_color(c_green);
draw_line_width(x, y, jointx, jointy, 4);
if (i_ex(boss))
{
    draw_line_width(jointx, jointy, boss.x, boss.y, 4);
    for (i = 0; i < 4; i++)
    {
        draw_sprite_ext(spr_sneo_bullet0, 0, lerp(x, jointx, i / 4), lerp(y, jointy, i / 4), 2, 2, 0, c_green, 1);
        draw_sprite_ext(spr_sneo_bullet0, 0, lerp(jointx, boss.x, i / 4), lerp(jointy, boss.y, i / 4), 2, 2, 0, c_green, 1);
    }
}
draw_self();
draw_set_alpha(1);
`,Step_0:`if (init == 0)
{
    if (i_ex(boss))
    {
        if (orientation == "top")
        {
            jointx = boss.x - 10;
            jointy = y - 30;
        }
        if (orientation == "bottom")
        {
            image_yscale = -1;
            jointx = boss.x - 10;
            jointy = y + 30;
        }
        remjointy = jointy;
        init = 1;
    }
}
if (btimer == 13)
{
    if (image_yscale > 0)
    {
        image_yscale = 2;
    }
    if (image_yscale < 0)
    {
        image_yscale = -2;
    }
}
if (image_yscale > 1)
{
    image_yscale -= 0.2;
}
if (image_yscale < -1)
{
    image_yscale += 0.2;
}
movingcheck = 0;
if (alt == 0)
{
    crawlsiner++;
    if (orientation == "top")
    {
        if (sin(crawlsiner / period) < 0)
        {
            wasmoving = 1;
            movingcheck = 1;
            y += (cos(crawlsiner / period) * amplitude * 2);
            x += (sin(crawlsiner / period) * amplitude);
        }
    }
    if (orientation == "bottom")
    {
        if (cos((crawlsiner / period) + 1.5707963267948966) < 0)
        {
            wasmoving = 1;
            movingcheck = 1;
            y += (sin((crawlsiner / period) + 1.5707963267948966) * amplitude * 2);
            x += (cos((crawlsiner / period) + 1.5707963267948966) * amplitude);
        }
    }
    if (i_ex(boss))
    {
        jointx = (x + boss.x) / 2;
        jointy = (remjointy + y) / 2;
    }
}
if (alt == 1 && i_ex(boss))
{
    if (orientation == "top")
    {
        crawlsiner++;
    }
    else
    {
        crawlsiner--;
    }
    xx = camerax() + 200;
    endx = boss.x - 20;
    x = xx + ((endx - xx) / 2) + (sin(crawlsiner / 12) * ((endx - xx) / 2));
    btimer++;
    threshold = 18;
    if (orientation == "top")
    {
        threshold = 28;
    }
    if (btimer >= threshold)
    {
        shot = instance_create(x, y, obj_basicbullet_sneo);
        if (orientation == "top")
        {
            shot.direction = 270 + random_range(-2, 2);
        }
        if (orientation == "bottom")
        {
            shot.direction = 90 + random_range(-2, 2);
        }
        shot.speed = 3;
        shot.sprite_index = spr_sneo_soundbullet;
        shot.image_angle = shot.direction;
        shot.grazepoints = 3;
        shot.target = target;
        btimer = 0;
        if (orientation == "top")
        {
            btimer = 10;
        }
        else
        {
            btimer = 0;
        }
    }
    if (i_ex(boss))
    {
        jointx = (x + boss.x) / 2;
        jointy = (remjointy + y) / 2;
    }
}
if (difficulty == 99)
{
    if (movingcheck == 0 && wasmoving == 1)
    {
        wasmoving = 0;
        repeat (3)
        {
            shot = instance_create(x, y, obj_basicbullet_sneo);
            if (orientation == "top")
            {
                shot.direction = 270 + random_range(-10, 10);
            }
            if (orientation == "bottom")
            {
                shot.direction = 90 + random_range(-10, 10);
            }
            shot.speed = 8;
            shot.sprite_index = spr_sneo_soundbullet;
            shot.image_angle = shot.direction;
            shot.target = target;
            shot.grazepoints = 3;
        }
    }
}
if (difficulty == 99)
{
    if (btimer >= 6)
    {
        shot = instance_create(x, y, obj_basicbullet_sneo);
        if (orientation == "top")
        {
            shot.direction = 270 + random_range(-4, 4);
        }
        if (orientation == "bottom")
        {
            shot.direction = 90 + random_range(-4, 4);
        }
        shot.speed = 4;
        shot.sprite_index = spr_sneo_soundbullet;
        shot.image_angle = shot.direction;
        shot.target = target;
        shot.grazepoints = 3;
        btimer = 0;
    }
}
`}},{metadata:{index:654,name:`obj_sneo_phonehand_master_hurtbox`,parent:`obj_regularbullet`,sprite:`spr_hitbox_10px`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`scr_bullet_init();
wall_destroy = 1;
image_alpha = 1;
sprite_index = spr_hitbox_10px;
image_xscale = 4;
image_yscale = 20;
visible = true;
destroyonhit = 0;
grazed = 1;
element = 6;
`,Other_15:`if (active == 1)
{
    if (target != 3)
    {
        scr_damage();
    }
    if (target == 3)
    {
        scr_damage_all();
    }
    if (destroyonhit == 1)
    {
        instance_destroy();
    }
}
`,Step_2:`exit;
`}},{metadata:{index:656,name:`obj_sneo_mmx_spreadshot`,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_bullet0`,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`for (i = 0; i < 3; i++)
{
    shot = instance_create(x, y, obj_regularbullet);
    if (i_ex(shot))
    {
        shot.direction = 120 + (i * 60);
        shot.speed = 2;
        shot.friction = -0.6;
        shot.sprite_index = spr_sneo_soundbullet;
        shot.image_angle = shot.direction;
        shot.depth = obj_sneo_phonehand_master.depth - 1;
        shot.grazepoints = 7;
        shot.element = 6;
    }
    scr_bullet_inherit(shot);
}
instance_destroy();
`,Create_0:`event_inherited();
element = 6;
flashtimer = 0;
grazed = 0;
grazepoints = 2;
timepoints = 1;
target = -1;
grazetimer = 0;
element = 6;
dont = 1;
inv = 120;
if (instance_exists(obj_clubsenemy))
{
    damage = global.monsterat[obj_clubsenemy.myself] * 5;
}
`,Draw_0:`draw_self();
if (flashtimer > 0)
{
    flashtimer--;
}
d3d_set_fog(true, c_yellow, 0, 1);
draw_sprite_ext(sprite_index, image_index, x - 2, y - 2, image_xscale, image_yscale, 0, c_yellow, flashtimer / 5);
d3d_set_fog(false, c_black, 0, 0);
`,Step_0:`if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)
{
    instance_destroy();
}
direction += angle_speed;
image_angle = direction;
if (alarm[0] == 8 || alarm[0] == 16)
{
    flashtimer = 5;
}
`}}],Pt=[{metadata:{index:634,name:`obj_sneo_faceattack`,parent:`obj_basicbullet_sneo`,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`if (type == 0 || image_alpha < 0.9)
{
    exit;
}
if (broken == 1)
{
    snd_play(snd_bell);
    with (other)
    {
        event_user(0);
    }
    exit;
}
if (invincibilitytimer > 0 && other.big == 0)
{
    with (other)
    {
        instance_destroy();
    }
    exit;
}
shake = 6;
if (other.big == 0)
{
    if (type == 1)
    {
        obj_spamton_neo_enemy.eyeshp -= 1;
    }
    if (type == 2)
    {
        obj_spamton_neo_enemy.nosehp -= 1;
    }
    if (type == 3)
    {
        obj_spamton_neo_enemy.mouthhp -= 1;
    }
}
else
{
    var takedamageamount = 4;
    if (obj_spamton_neo_enemy.hellmode == 1)
    {
        takedamageamount = 2;
    }
    if (type == 1)
    {
        obj_spamton_neo_enemy.eyeshp -= takedamageamount;
    }
    if (type == 2)
    {
        obj_spamton_neo_enemy.nosehp -= takedamageamount;
    }
    if (type == 3)
    {
        obj_spamton_neo_enemy.mouthhp -= takedamageamount;
    }
}
snd_play(snd_damage);
invincibilitytimer = 10;
hurtflashtimer = 3;
if ((type == 1 && obj_spamton_neo_enemy.eyeshp <= 0) || (type == 2 && obj_spamton_neo_enemy.nosehp <= 0) || (type == 3 && obj_spamton_neo_enemy.mouthhp <= 0))
{
    broken = 1;
    image_index = 2;
    snd_play(snd_rocket);
    explodetimer = 16;
}
with (other)
{
    event_user(0);
}
`,Create_0:`scr_bullet_init();
element = 6;
type = 0;
timer = 0;
hp = 16;
init = 0;
image_speed = 0;
image_index = 0;
image_alpha = 0;
broken = 0;
scr_darksize(id);
blend = merge_color(c_green, c_lime, 0.5);
invincibilitytimer = 0;
hurtflashtimer = 0;
shootflashtimer = 0;
explodetimer = 0;
laserinit = 0;
noseinit = 0;
eyesinit = 0;
boss = 1;
destroytarget = 0;
blue_col = merge_color(#00A2E8, c_aqua, 0.25);
intro_timer = 0;
first_time = false;
smashspeed = 25;
growtangle_x = 0;
heart_recoil = 0;
special = 0;
`,Destroy_0:`if (boss == 1)
{
    if (obj_spamton_neo_enemy.eyeshp <= 0 && obj_spamton_neo_enemy.nosehp <= 0 && obj_spamton_neo_enemy.mouthhp <= 0 && i_ex(obj_spamton_neo_enemy))
    {
        with (obj_spamton_neo_enemy)
        {
            eyeshp = 16;
            nosehp = 16;
            mouthhp = 16;
            facebroken = 2;
        }
    }
}
with (obj_sneo_faceattack_target)
{
    instance_destroy();
}
`,Draw_0:`if (init == 1)
{
    if (type == 1 && obj_spamton_neo_enemy.eyeshp > 0)
    {
        image_blend = merge_color(c_purple, blue_col, obj_spamton_neo_enemy.eyeshp / 16);
    }
    if (type == 2 && obj_spamton_neo_enemy.nosehp > 0)
    {
        image_blend = merge_color(c_purple, blue_col, obj_spamton_neo_enemy.nosehp / 16);
    }
    if (type == 3 && obj_spamton_neo_enemy.mouthhp > 0)
    {
        image_blend = merge_color(c_purple, blue_col, obj_spamton_neo_enemy.mouthhp / 16);
    }
    if ((type == 1 && obj_spamton_neo_enemy.eyeshp < 1) || (type == 1 && image_index == 2))
    {
        image_blend = c_white;
    }
    if ((type == 2 && obj_spamton_neo_enemy.nosehp < 1) || (type == 2 && image_index == 2))
    {
        image_blend = c_white;
    }
    if ((type == 3 && obj_spamton_neo_enemy.mouthhp < 1) || (type == 3 && image_index == 4))
    {
        image_blend = c_white;
    }
    if (shootflashtimer > 0)
    {
        image_blend = c_yellow;
        shootflashtimer--;
    }
    if (hurtflashtimer > 0)
    {
        image_blend = c_red;
        hurtflashtimer--;
    }
    var hidesprite = 0;
    if (invincibilitytimer > 0)
    {
        if (invincibilitytimer == 10 || invincibilitytimer == 9 || invincibilitytimer == 6 || invincibilitytimer == 5 || invincibilitytimer == 3 || invincibilitytimer == 2)
        {
            hidesprite = 1;
        }
        invincibilitytimer--;
        image_blend = c_red;
    }
    if (hidesprite == 0)
    {
        draw_self();
    }
    draw_sprite_ext(spr_battlebg_0, 0, x - 3, y + 70, 2.4, 2, 0, blend, 1);
}
`,Other_10:`if (id == instance_find(obj_sneo_faceattack, 0))
{
    boss = 1;
    if (i_ex(obj_spamton_neo_enemy))
    {
        eyeshp = obj_spamton_neo_enemy.eyeshp;
        nosehp = obj_spamton_neo_enemy.nosehp;
        mouthhp = obj_spamton_neo_enemy.mouthhp;
        if (obj_spamton_neo_enemy.facebroken == 1)
        {
            eyeshp = -1;
            nosehp = -1;
            mouthhp = -1;
        }
    }
    else
    {
        eyeshp = 16;
        nosehp = 16;
        mouthhp = 16;
    }
    eyes = instance_create(x, y, obj_sneo_faceattack);
    eyes.hp = eyeshp;
    eyes.type = 1;
    eyes.target = target;
    eyes.damage = damage;
    eyes.first_time = first_time;
    nose = instance_create(x, y, obj_sneo_faceattack);
    nose.hp = nosehp;
    nose.type = 2;
    nose.target = target;
    nose.damage = damage;
    nose.first_time = first_time;
    mouth = instance_create(x, y, obj_sneo_faceattack);
    mouth.hp = mouthhp;
    mouth.type = 3;
    mouth.target = target;
    mouth.damage = damage;
    mouth.first_time = first_time;
}
else
{
    boss = 0;
}
`,Other_12:`var xx = 0;
var yy = 0;
if (type == 1)
{
    xx = 62;
    yy = 32;
}
if (type == 2)
{
    xx = 34;
    yy = 64;
}
if (type == 3)
{
    xx = 52;
    yy = 102;
}
if (type != 0)
{
    targ = instance_create(x + xx, y + yy, obj_sneo_faceattack_target);
    targ.depth = depth - 999;
}
`,Step_0:`if (init == 0)
{
    if (type == 0)
    {
        sprite_index = spr_spamtonneo_faceAttack_face;
    }
    if (type == 1)
    {
        sprite_index = spr_spamtonneo_faceAttack_eyes;
    }
    if (type == 2)
    {
        sprite_index = spr_spamtonneo_faceAttack_nose;
    }
    if (type == 3)
    {
        sprite_index = spr_spamtonneo_faceAttack_mouth;
    }
    if (!first_time)
    {
        event_user(2);
    }
    if (type >= 1)
    {
        image_index = 1;
        if (hp <= 0)
        {
            broken = 1;
            image_index = 2;
        }
    }
    if (type == 0)
    {
        depth += 10;
    }
    init = 1;
    if (first_time)
    {
        image_alpha = 1;
        xstart = x;
        growtangle_x = obj_growtangle.x;
        x = camerax() + 730;
    }
}
if (first_time)
{
    if (intro_timer == 0)
    {
        x -= smashspeed;
        smashspeed += 0.5;
        if (x < xstart)
        {
            intro_timer = 15;
            if (type == 0)
            {
                scr_shakescreen();
                snd_play(snd_closet_impact);
            }
        }
    }
    if (intro_timer > 0)
    {
        intro_timer--;
        if (intro_timer == 0)
        {
            first_time = false;
            x = xstart;
            if (type == 0)
            {
                intro_timer = -1;
                with (obj_growtangle)
                {
                    x = other.growtangle_x;
                }
            }
            event_user(2);
        }
        else
        {
            x = xstart - (sin(pi * (intro_timer / 15)) * 20);
            if (type == 0)
            {
                with (obj_growtangle)
                {
                    x = other.growtangle_x - (sin(pi * (other.intro_timer / 15)) * 20);
                }
            }
        }
    }
    if (first_time)
    {
        exit;
    }
}
if (broken == 1 && type != 0 && destroytarget == 0)
{
    with (targ)
    {
        instance_destroy();
    }
    destroytarget = 1;
}
timer++;
if (image_alpha < 1 && global.turntimer > 21)
{
    image_alpha += 0.1;
}
if (explodetimer > 0)
{
    var xx = 0;
    var yy = 0;
    if (type == 1)
    {
        xx = 58;
        yy = 32;
    }
    if (type == 2)
    {
        xx = 30;
        yy = 64;
    }
    if (type == 3)
    {
        xx = 48;
        yy = 102;
    }
    if ((explodetimer % 2) == 0)
    {
        cres = instance_create(((x + xx) - 25) + random(50), ((y + yy) - 25) + random(50), obj_boxing_crescent);
        cres.depth = depth - 100;
    }
    explodetimer--;
}
var brokencounter = 0;
with (obj_sneo_faceattack)
{
    if (broken == 1)
    {
        brokencounter++;
    }
}
if (type == 1 && broken == 0)
{
    if (timer == 30 || laserinit == 0)
    {
        brokenmod = brokencounter;
        lasex = -10 + x + 56;
        lasey = y + 32;
        laserdir = point_direction(lasex, lasey, obj_heart.x + 10, obj_heart.y + 10);
        laserinit = 1;
    }
    if (timer >= 30 && (timer % 3) == 0)
    {
        if (global.turntimer > 21)
        {
            laser = instance_create(lasex, lasey, obj_werewire_bullet_lasercircle);
            scr_bullet_inherit(laser);
            laser.my_angle = laserdir;
            if (brokenmod == 2)
            {
                laser.my_angle = laserdir + (brokenmod * random_range(-8, 8));
            }
            laser.my_speed = 7;
            laser.my_accel = 0 + (brokenmod * 0.25);
            laser.image_yscale = 2;
            laser.my_angle_change = 0;
            laser.target = target;
            laser.damage = damage;
            laser.element = 6;
            shootflashtimer = 3;
        }
    }
    if (timer == 50)
    {
        timer = 0 + (brokenmod * 5);
    }
}
if (type == 2 && broken == 0)
{
    if (timer >= 70 && noseinit == 0)
    {
        brokenmod = brokencounter;
        noseinit = 1;
    }
    if (timer >= 80 && (timer % 5) == 0)
    {
        var randomvspeed = random_range(-2, 2);
        for (var i = 0; i < 3; i++)
        {
            bullet = instance_create(x, y, obj_regularbullet);
            scr_bullet_inherit(bullet);
            bullet.sprite_index = spr_spamtonneo_faceAttack_nose_bullet;
            bullet.mask_index = spr_spamtonneo_faceAttack_nose_bullet_mask;
            scr_darksize(bullet);
            bullet.gravity = 0.6;
            bullet.gravity_direction = 180;
            bullet.friction = 0.4;
            bullet.vspeed = -4 + (i * 4.5);
            if (brokenmod == 2)
            {
                bullet.vspeed += randomvspeed;
            }
            bullet.hspeed = -3;
            bullet.target = target;
            bullet.damage = damage;
            bullet.element = 6;
            shootflashtimer = 3;
        }
    }
    if (timer == 90)
    {
        timer = 26 + (brokenmod * 10);
    }
}
if (type == 3 && broken == 0)
{
    if (timer >= 10 && eyesinit == 0)
    {
        eyesinit = 1;
        brokenmod = brokencounter;
    }
    if (timer >= 10)
    {
        image_index = 3;
    }
    if (timer >= 10 && (timer % 6) == 0)
    {
        bullet = instance_create(x + 30, y + 98, obj_regularbullet);
        bullet.sprite_index = spr_spamtonneo_faceAttack_wisp;
        scr_bullet_inherit(bullet);
        bullet.hspeed = random_range(-4, -7);
        bullet.vspeed = random_range(6, -2);
        if (obj_heart.y >= obj_growtangle.y)
        {
            bullet.vspeed += 1;
        }
        bullet.gravity = -0.2;
        bullet.target = target;
        bullet.damage = damage;
        bullet.element = 6;
        shootflashtimer = 3;
    }
    if (timer == 42)
    {
        image_index = 1;
        timer = -40 + (brokenmod * 20);
    }
}
if (scr_debug())
{
    if (keyboard_check_pressed(ord("U")))
    {
        if (type == 1)
        {
            broken = true;
        }
    }
    if (keyboard_check_pressed(ord("I")))
    {
        if (type == 2)
        {
            broken = true;
        }
    }
    if (keyboard_check_pressed(ord("O")))
    {
        if (type == 3)
        {
            broken = true;
        }
    }
}
if ((type == 1 || type == 2) && broken == 1)
{
    image_index = 2;
}
if (type == 3 && broken == 1)
{
    image_index = 4;
}
`,Step_2:`if (type != 0 || (intro_timer == 0 && heart_recoil == 0))
{
    exit;
}
if (intro_timer == -1)
{
    if (obj_heart.x <= ((obj_growtangle.x - (obj_growtangle.sprite_width / 2)) + 4))
    {
        heart_recoil = 10;
    }
    intro_timer = 0;
}
else if (intro_timer > 0)
{
    if (heart_recoil == 0 && intro_timer > 7 && obj_heart.x >= ((obj_growtangle.x + (obj_growtangle.sprite_width / 2)) - 24))
    {
        heart_recoil = scr_remapvalue(8, 15, intro_timer, 0, -10);
    }
}
if (heart_recoil != 0)
{
    obj_heart.x += heart_recoil;
    heart_recoil = scr_movetowards(heart_recoil, 0, 1);
}
obj_heart.x = clamp(obj_heart.x, (obj_growtangle.x - (obj_growtangle.sprite_width / 2)) + 2, (obj_growtangle.x + (obj_growtangle.sprite_width / 2)) - 24);
`}},{metadata:{index:675,name:`obj_sneo_faceattack_target`,parent:null,sprite:`spr_boxing_crescent`,mask:null,solid:!1,depth:0,visible:!1},sources:{Create_0:`image_speed = 0;
image_xscale = 0.4;
image_yscale = 0.4;
image_blend = c_red;
`}},{metadata:{index:837,name:`obj_boxing_crescent`,parent:null,sprite:`spr_boxing_crescent`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_speed = 0.5;
image_xscale = 2;
image_yscale = 2;
timer = 0;
`,Step_0:`if (image_index >= 3)
{
    instance_destroy();
}
`}},{metadata:{index:479,name:`obj_werewire_bullet_lasercircle`,parent:`obj_regularbullet`,sprite:`spr_bullet_laser_circle`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`scr_bullet_init();
grazepoints = 3;
destroyonhit = 0;
image_xscale = 0;
image_yscale = 0;
timer = 0;
tri = 1;
tri_angle = 20;
my_angle = 180;
my_speed = 4;
my_accel = 0;
my_length = 1;
my_angle_change = 0;
part_count = 0;
siner = 0;
m = 2;
parent = -1;
`,Step_0:`if (parent != -1 && i_ex(parent))
{
    x = parent.x - 32;
    y = parent.y;
}
siner += 0.5;
timer += 1;
if (timer <= (6 / m))
{
    image_xscale += (0.4 * m);
    image_yscale += (0.4 * m);
}
if (timer > (6 / m) && timer <= (my_length + 3))
{
    laser = instance_create(x, y, obj_werewire_bullet_lasersquare);
    scr_bullet_inherit(laser);
    image_xscale -= (sin(siner * 1.3 * m) * 0.2);
    image_yscale -= (sin(siner * 1.3 * m) * 0.2);
    laser.image_angle = my_angle;
    laser.speed = my_speed;
    laser.direction = my_angle;
    laser.friction = -my_accel;
    laser.image_yscale = 1;
    laser.my_angle_change = my_angle_change;
    if (i_ex(obj_spamton_neo_enemy))
    {
        laser.sprite_index = spr_bullet_laser_square_sneo;
    }
    else
    {
        laser.sprite_index = spr_bullet_laser_square;
    }
    if (timer == 3)
    {
        if (i_ex(obj_spamton_neo_enemy))
        {
            laser.sprite_index = spr_bullet_laser_front_sneo;
        }
        else
        {
            laser.sprite_index = spr_bullet_laser_front;
        }
    }
    if (timer == (my_length + 3))
    {
        if (i_ex(obj_spamton_neo_enemy))
        {
            laser.sprite_index = spr_bullet_laser_front_sneo;
        }
        else
        {
            laser.sprite_index = spr_bullet_laser_front;
        }
        laser.image_index = 1;
    }
}
else
{
    image_xscale -= (0.1 * m);
    image_yscale -= (0.1 * m);
    if (image_xscale <= 0 && image_yscale <= 0)
    {
        instance_destroy();
    }
}
`}},{metadata:{index:478,name:`obj_werewire_bullet_lasersquare`,parent:`obj_regularbullet`,sprite:`spr_bullet_laser_square`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`scr_bullet_init();
destroyonhit = 0;
grazepoints = 2;
init_con = 0;
init_timer = 0;
circle_size = 1;
image_xscale = 2;
image_yscale = 3;
image_speed = 0;
my_angle_change = 0;
m = 2;
stretch = 1;
`,Step_0:`if (stretch == 1)
{
    image_xscale = 2 + (speed / (10 * m));
}
if (x <= -100)
{
    instance_destroy();
}
direction += my_angle_change;
image_angle = direction;
`}}],Ft=[{metadata:{index:652,name:`obj_finale_growtangle`,parent:`obj_bulletparent`,sprite:`spr_battlebg_0`,mask:`spr_battlebg_0`,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_xscale = 0;
image_yscale = 0;
image_alpha = 0.3;
maxtimer = 15;
timeincrease = 1;
timer = maxtimer - timeincrease;
growcon = 1;
image_speed = 0;
image_blend = merge_color(c_green, c_lime, 0.5);
target_angle = 0;
fullgrow = 0;
keep = 0;
megakeep = 0;
maxxscale = obj_growtangle.maxxscale;
maxyscale = obj_growtangle.maxyscale;
sprite_index = obj_growtangle.spr_custom_box;
obj_growtangle.depth -= 2;
depth = obj_growtangle.depth + 1;
`,Draw_0:`draw_sprite_ext(spr_battlebg_stretch, 1, x, y, image_xscale, image_yscale, image_angle, image_blend, image_alpha);
draw_sprite_ext(sprite_index, 0, x, y, image_xscale / (maxxscale / 2), image_yscale / (maxyscale / 2), image_angle, image_blend, image_alpha);
`,Step_0:`growth = 0;
if (timer < (maxtimer * 5) && growcon == 1)
{
    growth = 1;
}
if (timer > 0 && growcon == 3)
{
    growth = 1;
}
if (growth == 1)
{
    if (growcon == 1)
    {
        timer += timeincrease;
    }
    timeincrease += 0.025;
    if (growcon == 3)
    {
        timer -= 1;
    }
    image_xscale = maxxscale * (timer / maxtimer);
    image_yscale = maxyscale * (timer / maxtimer);
    image_angle = 180 + (180 * (timer / maxtimer)) + target_angle;
    image_alpha = min(1, 0.5 + ((timer / maxtimer) * 0.5));
    d = instance_create(x, y, obj_afterimage);
    d.sprite_index = sprite_index;
    d.image_xscale = image_xscale / (maxxscale / 2);
    d.image_yscale = image_yscale / (maxyscale / 2);
    d.image_angle = image_angle;
    d.depth = depth - 3;
    if (growcon == 1 && timer == maxtimer)
    {
        d.image_xscale = image_xscale;
        d.image_yscale = image_yscale;
        d.sprite_index = obj_growtangle.sprite_index;
        d.image_blend = c_white;
        d.depth--;
        d.image_alpha = 1;
    }
    else
    {
        d.image_blend = image_blend;
        d.image_alpha = ((1 - (timer / (maxtimer * 5))) * 0.5) + 0.1;
    }
    d.image_speed = 0;
    if (timer >= (maxtimer * 5) && growcon == 1)
    {
        growcon = 2;
        image_angle = target_angle;
    }
    if (growcon == 3 && timer <= maxtimer)
    {
        global.turntimer = 0;
        instance_destroy();
    }
}
`}},{metadata:{index:612,name:`obj_sneo_warped_box`,parent:`obj_bulletparent`,sprite:`spr_battlebg_0`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`depth = obj_growtangle.depth;
obj_growtangle.image_alpha = 0;
minx = obj_growtangle.x - (obj_growtangle.sprite_width / 2);
maxx = obj_growtangle.x + (obj_growtangle.sprite_width / 2);
miny = obj_growtangle.y - (obj_growtangle.sprite_height / 2);
maxy = obj_growtangle.y + (obj_growtangle.sprite_height / 2);
suckx = obj_growtangle.x + 100;
upper_sucky = obj_growtangle.y - 40;
lower_sucky = obj_growtangle.y + 40;
suckpower = 0;
timer = 0;
snapback = 0;
target = 0;
state = 0;
inhale = 0;
inhalespeed = 0;
obj_battlesolid.image_xscale = 3;
obj_battlesolid.image_yscale = 3;
intro = 0;
stopthesucc = 0;
`,Destroy_0:`obj_growtangle.image_alpha = 1;
obj_growtangle.keep = 1;
obj_battlesolid.image_xscale = 2;
obj_battlesolid.image_yscale = 2;
`,Draw_0:`var colo = draw_get_color();
if (inhalespeed > 0 && inhale < 1)
{
    inhale = clamp(inhale + inhalespeed, 0, 1);
}
var _minx = lerp(minx, lerp(maxx, suckx, suckpower) - 8, inhale);
var _maxy = lerp(maxy, lerp(maxy, lower_sucky, suckpower) + 8, inhale);
var _miny = lerp(miny, lerp(miny, upper_sucky, suckpower) - 8, inhale);
draw_set_colour(#00C000);
draw_set_alpha(image_alpha);
draw_triangle(_minx, _miny, lerp(maxx, suckx, suckpower), lerp(_miny, upper_sucky, suckpower), lerp(maxx, suckx, suckpower), lerp(_maxy, lower_sucky, suckpower), 0);
draw_triangle(_minx, _miny, _minx, _maxy, lerp(maxx, suckx, suckpower), lerp(_maxy, lower_sucky, suckpower), 0);
draw_set_colour(c_black);
draw_triangle(_minx + 4, _miny + 4, lerp(maxx - 4, suckx - 4, suckpower), lerp(_miny + 4, upper_sucky + 3, suckpower), lerp(maxx - 4, suckx - 4, suckpower), lerp(_maxy - 4, lower_sucky - 3, suckpower), 0);
draw_triangle(_minx + 4, _miny + 4, _minx + 4, _maxy - 4, lerp(maxx - 4, suckx - 4, suckpower), lerp(_maxy - 4, lower_sucky - 3, suckpower), 0);
draw_set_colour(colo);
draw_set_alpha(1);
if (state == 1)
{
    if (timer >= 60)
    {
        timer--;
    }
    if (timer >= 59)
    {
        suckpower = timer / 60;
    }
    else
    {
        suckpower = scr_ease_in(timer / 60, 3);
    }
}
else if (state == 2)
{
    if (timer > 30)
    {
        timer = 30;
    }
    if (snapback == 0)
    {
        snapback = -1;
    }
    if (timer > 0)
    {
        timer--;
    }
    suckpower = scr_ease_in(timer / 30, -2);
}
`,Other_5:`obj_growtangle.image_alpha = 1;
`,Step_2:`if (instance_exists(obj_heart))
{
    if (state == 0)
    {
        if (obj_heart.x < (minx + 3))
        {
            obj_heart.x = minx + 3;
        }
        if (obj_heart.y < (miny + 3))
        {
            obj_heart.y = miny + 3;
        }
        if (obj_heart.y > (maxy - 20))
        {
            obj_heart.y = maxy - 20;
        }
        if (obj_heart.x > (maxx - 20))
        {
            obj_heart.x = maxx - 20;
        }
        exit;
    }
    rborder = lerp(maxx, suckx, suckpower);
    uborder = miny;
    dborder = maxy;
    if (snapback == 0)
    {
        if (stopthesucc == 0)
        {
            obj_heart.x += suckpower;
        }
    }
    if (snapback <= 0 && global.turntimer <= 30 && obj_heart.x >= (rborder - 22))
    {
        snapback = suckpower;
        if (suckpower > 0.5)
        {
            if (!instance_exists(obj_shake))
            {
                d = instance_create(0, 0, obj_shake);
                d.shakex = ceil(suckpower * 4);
                d.shakey = ceil(suckpower * 4);
            }
        }
    }
    if (snapback > 0)
    {
        obj_heart.x -= (20 * scr_ease_in(snapback, 2));
        snapback -= 0.1;
    }
    if (obj_heart.x < (minx + 3))
    {
        obj_heart.x = minx + 3;
    }
    if (obj_heart.x > (rborder - 20))
    {
        obj_heart.x = rborder - 20;
    }
    var xoffset = (obj_heart.x - (minx + 3)) / (rborder - 20 - (minx + 3));
    var uppersuckoffset = (upper_sucky - miny) * xoffset * suckpower;
    var lowersuckoffset = (maxy - lower_sucky) * xoffset * suckpower;
    if (obj_heart.y < (uborder + 3 + uppersuckoffset))
    {
        obj_heart.y = uborder + 3 + uppersuckoffset;
    }
    if (obj_heart.y > (dborder - 20 - lowersuckoffset))
    {
        obj_heart.y = dborder - 20 - lowersuckoffset;
    }
    if (obj_heart.y < (uborder + 3))
    {
        obj_heart.y = uborder + 3;
    }
    if (obj_heart.y > (dborder - 20))
    {
        obj_heart.y = dborder - 20;
    }
}
`}},{metadata:{index:643,name:`obj_sneo_final_forme`,parent:`obj_basicbullet_sneo_finale`,sprite:`spr_sneo_final_forme`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`with (other)
{
    event_user(0);
}
with (obj_sneo_final_forme)
{
    hurtalpha = 1;
}
if (instance_exists(obj_sneo_final_forme))
{
    if ((obj_sneo_final_forme.destroyable && obj_sneo_final_forme.state == 0) || (obj_sneo_final_forme.state == 1 && obj_sneo_final_forme.formtimer < 30))
    {
    }
    else
    {
        exit;
    }
}
snd_play(snd_damage);
if (instance_exists(obj_sneo_final_forme))
{
    with (obj_sneo_final_forme)
    {
        hurtalpha = 1;
    }
    if (destroyable == 1)
    {
        if (other.big == 0)
        {
            x += 6;
            formtimer += 4;
        }
        else
        {
            pushback = 10;
            formtimer += 10;
        }
    }
}
`,Create_0:`event_inherited();
element = 6;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = floor((global.monsterat[obj_spamton_neo_enemy.myself] * 5) / 3);
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 4;
steptimer = 0;
stepping = true;
pushback = 0;
advancespeed = 3;
image_speed = 0;
mouthopen = false;
destroyonhit = 0;
introtimer = 0;
intro = 0;
mouthx = 90;
mouthy = 142;
instance_create(x, y, obj_sneo_final_forme_hitbox);
state = 0;
formtimer = 0;
stepdir = -1;
made = 0;
fakeheart = -4;
fakeheart_speed = 0;
effecttimer = 0;
lerptimer = 0;
inhalesfx = 0;
hurtalpha = 0;
bullet_suck_x1 = 20;
bullet_suck_x2 = 130;
bullet_suck_y1 = 100;
bullet_suck_y2 = 190;
movetimer = 0;
moveframes = 12;
movecon = 0;
timer2 = 0;
timer3 = 0;
headoffset_x = 0;
headoffset_y = 0;
dmgcon = 0;
back = instance_create(x, y, obj_sneo_final_forme_mouth_back);
back.depth = depth + 1;
if (i_ex(obj_heart))
{
    back.depth = obj_heart.depth + 1;
}
hidemouthback = 0;
playback_sprite = scr_84_get_sprite("spr_sneo_playback");
`,Destroy_0:`obj_sneo_hitdetector.active = true;
with (obj_sneo_final_forme_mouth_back)
{
    instance_destroy();
}
`,Draw_0:`if (image_index == 5 && hidemouthback == 0)
{
    with (obj_sneo_final_forme_mouth_back)
    {
        image_index = 7;
        x = obj_sneo_final_forme.x + obj_sneo_final_forme.headoffset_x;
        y = obj_sneo_final_forme.y + obj_sneo_final_forme.headoffset_y;
        visible = true;
    }
}
else
{
    with (obj_sneo_final_forme_mouth_back)
    {
        visible = false;
    }
}
draw_sprite_ext(sprite_index, 3, x, ystart - abs(sin(steptimer + ((state < 2) ? 0.15 : 0.05)) * 40), 1, 1, 0, image_blend, 1);
if (image_angle != 0)
{
    draw_sprite_ext(spr_sneo_final_forme_head_rotate_origin, image_index, x + 138 + headoffset_x, y + 135 + headoffset_y, image_xscale, image_yscale, image_angle, c_white, 1);
}
else if ((state >= 2 && state < 10) || (state == 11 && formtimer >= 30 && formtimer <= 70))
{
    var _shake = (state == 3) ? 2 : 1;
    draw_sprite(sprite_index, image_index, x + random_range(-_shake, _shake), ystart - abs((sin(steptimer + ((state < 2) ? 0.15 : 0.05)) * 40) + random_range(-_shake, _shake)));
}
else
{
    draw_sprite_ext(sprite_index, image_index, x + headoffset_x, y + headoffset_y, image_xscale, image_yscale, image_angle, image_blend, image_alpha);
}
if ((destroyable && state == 0) || (state == 1 && formtimer < 30))
{
    if (hurtalpha > 0)
    {
        hurtalpha -= 0.1;
    }
    draw_sprite_ext(sprite_index, image_index, x, y, 1, 1, 0, c_yellow, hurtalpha);
}
if (intro != 0)
{
    image_index = 4;
    introtimer++;
    image_blend = merge_color(c_black, c_white, clamp(((introtimer / 30) - 0.5) / 1.5, 0, 1));
    draw_sprite_ext(sprite_index, 2, x, y, 1, 1, 0, (intro == 1) ? merge_color(c_black, c_white, clamp(introtimer / 30, 0, 1)) : c_white, 1);
    if (introtimer >= 68)
    {
        intro = 0;
        image_index = 4;
        image_alpha = 1;
        image_blend = c_white;
    }
}
`,Other_15:`if (active == 1)
{
    with (obj_spamton_neo_enemy)
    {
        event_user(2);
    }
    if (destroyonhit == 1)
    {
        instance_destroy();
    }
}
`,Step_0:`if (!instance_exists(obj_sneo_final_forme_hitbox))
{
    instance_create(x, y, obj_sneo_final_forme_hitbox);
}
if (intro == 1)
{
    exit;
}
formtimer++;
if (grazed == 1)
{
    grazetimer += 1;
    if (grazetimer >= 30)
    {
        grazetimer = 0;
        grazed = 0;
    }
}
if (state < 2)
{
    if (state == 0)
    {
        stepdir = -1;
    }
    if (state == 0 && formtimer >= 25)
    {
        steptimer += 0.05;
    }
    if (steptimer >= pi)
    {
        if (state == 0 && formtimer < 25)
        {
        }
        steptimer -= pi;
        d = instance_exists(obj_shake) ? 196 : instance_create(0, 0, obj_shake);
        d.shakex = ceil(2);
        d.shakey = ceil(2);
        snd_play(snd_screenshake);
        if (state == 1)
        {
            stepdir = 1;
        }
    }
    if (state == 11 && formtimer >= 65)
    {
    }
    else
    {
        y = ystart - (sin(steptimer) * 40);
    }
    if (state == 0 && formtimer < 25)
    {
    }
    else
    {
        x += (1.6 * stepdir);
    }
    if ((destroyable && state == 0 && x > (obj_growtangle.x + 140)) || (state == 1 && formtimer < 30 && x > (obj_growtangle.x + 140)))
    {
        x += (4 * stepdir);
        pushback = 0;
    }
    if (destroyable)
    {
        var _box = obj_sneo_warped_box;
        _box.suckx = min(obj_growtangle.x + 150, x + 106);
        _box.timer = scr_movetowards(_box.timer, clamp(scr_inverselerp(520, obj_growtangle.x + 100, x), 0, 1) * 60, 2);
        _box.upper_sucky = y + 129;
        _box.lower_sucky = y + 159;
    }
    if (pushback > 0)
    {
        x += (pushback * (2/3));
        if (x > (camerax() + 520))
        {
            pushback--;
        }
        else
        {
            pushback--;
        }
    }
    if ((destroyable && state == 0) || (state == 1 && formtimer < 30))
    {
        if (inhalesfx == 0)
        {
            inhalesfx = 1;
            snd_loop(snd_sneo_overpower);
            snd_pitch(snd_sneo_overpower, 0.1);
            snd_pitch_time(snd_sneo_overpower, 1, 90);
            snd_volume(snd_sneo_overpower, 0.75, 0);
            wreck = instance_create(x, y, obj_wreckpausespew);
            wreck.depth = depth - 1;
        }
        effecttimer++;
        if ((effecttimer % 6) == 0)
        {
            for (i = 0; i < 3; i++)
            {
                d = instance_create(x + mouthx, y + mouthy, obj_rouxls_power_up_orb);
                d.direction = irandom(40) + (i * 40) + 120;
                d.lifetime = 12;
                d.depth = depth + 1;
                d.image_blend = image_blend;
            }
        }
    }
    if ((state == 0 && x < (obj_growtangle.x - (obj_growtangle.sprite_width / 2.5))) || (state == 0 && obj_heart.x > (x + 70)))
    {
        state = 10;
        formtimer = 0;
        obj_sneo_bulletcontroller.special++;
        fakeheart = instance_create(obj_heart.x, obj_heart.y, obj_sneo_fakeheart);
    }
    else if (state == 0 && formtimer >= 320)
    {
        obj_sneo_bulletcontroller.special++;
        state++;
        formtimer = 45;
    }
    else if (state == 1 && formtimer >= 45)
    {
        with (obj_wreckpausespew)
        {
            image_index = 1;
        }
        with (obj_sneo_dollar)
        {
            fade = 1;
        }
        state++;
        formtimer = 45;
        if (x > (obj_growtangle.x + 70))
        {
            obj_sneo_warped_box.state = 2;
        }
        image_index = 4;
        image_angle = 1;
        snd_stop(snd_sneo_overpower);
        obj_sneo_warped_box.stopthesucc = 1;
    }
}
else if (state == 2 && formtimer >= 45)
{
    state++;
    image_index = 5;
    formtimer = 0;
    steptimer = pi - steptimer;
    obj_sneo_final_forme_hitbox.destroyable = false;
    global.turntimer = 360;
}
else if (state == 3)
{
    if (movecon == 0)
    {
        movetimer += (1 / moveframes);
        image_angle = lerp_ease_in(image_angle, 25, movetimer, 2);
        if (movetimer == 1)
        {
            movetimer = 0;
            movecon = 1;
        }
    }
    if (movecon == 2)
    {
        timer3++;
        if (timer3 > 20)
        {
            movetimer += (1 / moveframes);
            image_angle = lerp_ease_in(image_angle, -1, movetimer, 2);
            headoffset_x = lerp(0, -12, movetimer);
            headoffset_y = lerp(0, 2, movetimer);
        }
    }
    if (timer2 < 100)
    {
        timer2++;
    }
    x = lerp(x, camerax() + 439, timer2 / 100);
    if (x > (obj_growtangle.x + 70))
    {
        obj_sneo_warped_box.state = 2;
    }
    else
    {
        var _box = obj_sneo_warped_box;
        _box.suckx = min(obj_growtangle.x + 150, x + 106);
        _box.timer = clamp(scr_inverselerp(camerax() + 520, obj_growtangle.x + 100, x), 0, 1) * 60;
        _box.upper_sucky = y + 129;
        _box.lower_sucky = y + 159;
    }
    if (x > (camerax() + 438))
    {
        x = camerax() + 438;
        movecon = 2;
        if (movecon == 2 && movetimer == 1)
        {
            instance_destroy();
            aa = instance_create(x, ystart - abs(sin(steptimer + 0.15) * 40), obj_sneo_lastattack);
            with (aa)
            {
                yspot[0] = (obj_growtangle.y - (obj_growtangle.sprite_height / 2) - y_offset) + 40;
                yspot[1] = (obj_growtangle.y + (obj_growtangle.sprite_height / 2)) - y_offset - 40;
            }
            global.turntimer = 300;
        }
    }
}
else if (state == 4 && formtimer >= 25)
{
    formtimer = 0;
    state = 5;
    instance_create(x + mouthx, y + mouthy, obj_sneo_final_orb);
    image_index = 5;
}
else if (state == 10)
{
    fakeheart_speed = scr_movetowards(fakeheart_speed, 10, 1);
    with (fakeheart)
    {
        var _targetx = obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx + 5;
        if (x > (_targetx - 10))
        {
            _targetx += 20;
        }
        move_towards_point(_targetx, obj_sneo_final_forme.y + obj_sneo_final_forme.mouthy, obj_sneo_final_forme.fakeheart_speed);
    }
    obj_sneo_warped_box.inhalespeed += 0.01;
    if (x > (x + mouthx + 10))
    {
        image_index = 4;
        snd_stop(snd_sneo_overpower);
    }
    if (formtimer > 45)
    {
        fakeheart.speed = 0;
        fakeheart.direction = 0;
        state = 11;
        formtimer = 0;
        image_index = 4;
        hidemouthback = 1;
        snd_stop(snd_sneo_overpower);
        obj_sneo_warped_box.image_alpha = 0;
        obj_sneo_warped_box.timer = 0;
        fakeheart.state = 1;
        with (obj_sneo_dollar)
        {
            fade = 1;
        }
    }
}
else if (state == 11)
{
    if (formtimer < 15)
    {
        exit;
    }
    if (x < (camerax() + 438))
    {
        x += 4;
    }
    if (x > (camerax() + 438) && formtimer < 65)
    {
        formtimer = 65;
    }
    if ((formtimer % 5) == 0 && formtimer >= 30 && formtimer <= 65)
    {
        var _hearthurt = snd_play(snd_hurt1);
        snd_pitch(_hearthurt, random_range(1.4, 2));
        d = instance_exists(obj_shake) ? 196 : instance_create(0, 0, obj_shake);
        d.shakex = ceil(1);
        d.shakey = ceil(1);
        if (dmgcon == 0)
        {
            dmgcon = 1;
            global.inv = -1;
            with (obj_spamton_neo_enemy)
            {
                event_user(2);
            }
        }
    }
    if (formtimer == 50)
    {
        obj_growtangle.timer = 0;
        obj_growtangle.growcon = 1;
        obj_growtangle.image_alpha = 1;
    }
    if (formtimer == 65)
    {
        obj_sneo_warped_box.inhale = 0;
        obj_sneo_warped_box.inhalespeed = 0;
        obj_sneo_warped_box.image_alpha = 1;
        obj_growtangle.image_alpha = 0;
    }
    if (x > (camerax() + 438))
    {
        if (formtimer < 50)
        {
            obj_growtangle.timer = 0;
            obj_growtangle.growcon = 1;
            obj_growtangle.image_alpha = 1;
        }
        formtimer = 0;
        state = 12;
        fakeheart.x = x + mouthx;
        fakeheart.y = y + mouthy;
        fakeheart.state = 2;
        image_index = 5;
    }
}
else if (state == 12)
{
    with (obj_wreckpausespew)
    {
        image_index = 1;
    }
    if (movetimer < 1)
    {
        movetimer += (1 / moveframes);
        headoffset_x = lerp(0, -12, movetimer);
        headoffset_y = lerp(0, 2, movetimer);
    }
    if (formtimer >= 30 && movetimer >= 1)
    {
        state = 2;
        formtimer = 0;
        image_index = 4;
        instance_destroy();
        instance_create(x, ystart - abs(sin(steptimer + 0.15) * 40), obj_sneo_lastattack);
    }
}
if (state >= 11)
{
    steptimer += 0.05;
    if (steptimer >= pi)
    {
        steptimer -= pi;
        d = instance_exists(obj_shake) ? 196 : instance_create(0, 0, obj_shake);
        d.shakex = ceil(2);
        d.shakey = ceil(2);
        snd_play(snd_screenshake);
    }
    y = ystart - (sin(steptimer) * 40);
}
`}},{metadata:{index:644,name:`obj_sneo_final_forme_hitbox`,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_final_forme_hitbox`,mask:null,solid:!1,depth:0,visible:!1},sources:{Collision_obj_yheart_shot:`with (other)
{
    event_user(0);
}
if (instance_exists(obj_sneo_final_forme))
{
    if ((obj_sneo_final_forme.destroyable && obj_sneo_final_forme.state == 0) || (obj_sneo_final_forme.state == 1 && obj_sneo_final_forme.formtimer < 30))
    {
    }
    else
    {
        exit;
    }
}
snd_play(snd_damage);
if (instance_exists(obj_sneo_final_forme))
{
    with (obj_sneo_final_forme)
    {
        hurtalpha = 1;
    }
    if (destroyable == 1)
    {
        if (other.big == 0)
        {
            parent.x += 7;
            parent.formtimer += 5;
        }
        else
        {
            parent.pushback = 13;
            parent.formtimer += 13;
        }
    }
}
`,Create_0:`event_inherited();
destroyonhit = false;
parent = obj_sneo_final_forme;
`,Step_2:`if (instance_exists(obj_sneo_final_forme))
{
    parent = obj_sneo_final_forme;
    x = parent.x;
    y = parent.y;
}
if (instance_exists(obj_sneo_lastattack))
{
    instance_destroy();
}
`}},{metadata:{index:41,name:`obj_sneo_final_forme_mouth_back`,parent:null,sprite:`spr_sneo_final_forme`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_index = 7;
`,Step_2:`if (i_ex(obj_sneo_final_forme))
{
    x = obj_sneo_final_forme.x + obj_sneo_final_forme.headoffset_x;
    y = obj_sneo_final_forme.y + obj_sneo_final_forme.headoffset_y;
}
`}},{metadata:{index:645,name:`obj_sneo_dollar`,parent:`obj_regularbullet`,sprite:`spr_spamton_dollar`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`event_inherited();
element = 6;
image_alpha = 0;
startscale = 1;
destroyable = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = floor((global.monsterat[obj_spamton_neo_enemy.myself] * 5) / 3);
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 4;
fade = 0;
`,Draw_0:`if (image_alpha < 1 && fade == 0)
{
    image_alpha += 0.1;
}
draw_self();
`,Other_15:`if (fade == 1)
{
    exit;
}
if (active == 1)
{
    with (obj_spamton_neo_enemy)
    {
        event_user(2);
    }
    if (destroyonhit == 1)
    {
        instance_destroy();
    }
}
`,Step_0:`if (fade == 1)
{
    image_alpha -= 0.1;
    speed = 0;
    if (image_alpha <= 0)
    {
        instance_destroy();
    }
}
event_inherited();
if (!instance_exists(obj_sneo_final_forme))
{
    exit;
}
if (x > ((obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx) - 50))
{
    y += clamp((obj_sneo_final_forme.y + obj_sneo_final_forme.mouthy) - y, -5, 5);
}
if (x < ((obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx) - 10))
{
    direction = point_direction(x, y, obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx, obj_sneo_final_forme.y + obj_sneo_final_forme.mouthy);
    friction = -0.1;
}
var _mouthrelative = obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx;
var _scalesize = lerp(startscale, 1, clamp(scr_inverselerp(_mouthrelative - 200, _mouthrelative - 50, x), 0, 1));
image_xscale = _scalesize;
image_yscale = _scalesize;
if (x > (obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx + 50))
{
    instance_destroy();
    snd_play(snd_swallow);
}
`}},{metadata:{index:646,name:`obj_sneo_fakeheart`,parent:`obj_bulletparent`,sprite:`spr_yellowheart`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`depth = obj_heart.depth;
obj_heart.image_alpha = 0;
global.inv = 300;
state = 0;
heartspeed = 14;
obj_heart.color = 0;
startangle = 0;
`,Destroy_0:`if (global.turntimer <= 0)
{
    global.inv = -1;
}
if (instance_exists(obj_heart))
{
    obj_heart.image_alpha = 1;
    obj_heart.x = x;
    obj_heart.y = y;
    obj_heart.color = 1;
}
`,Draw_0:`xx = scr_orbitx(x + 9, y + 9, x, y, image_angle);
yy = scr_orbity(x + 9, y + 9, x, y, image_angle);
if (image_xscale != 1 || image_yscale != 1)
{
    draw_sprite_ext_centerscale(sprite_index, obj_heart.image_index, x, y, image_xscale, image_yscale, image_angle, 16777215, image_alpha);
}
else
{
    draw_sprite_ext(sprite_index, obj_heart.image_index, xx, yy, image_xscale, image_yscale, image_angle, c_white, image_alpha);
}
`,Step_2:`if (state == 0)
{
    image_angle -= (speed * 2);
}
else if (state == 1)
{
    image_alpha = 0;
    image_angle = 0;
    x = obj_growtangle.x + 400;
    speed = 0;
    direction = 0;
}
else if (state == 2)
{
    image_angle += 60;
    image_alpha = 1;
    x -= 20;
    var _minx = (obj_growtangle.x - (obj_growtangle.sprite_width / 2)) + 4;
    if (x <= (_minx + 20))
    {
        x = _minx;
        obj_heart.x = x;
        obj_heart.y = y;
        state = 3;
        global.inv = -1;
        with (obj_spamton_neo_enemy)
        {
            event_user(2);
        }
        with (obj_dmgwriter)
        {
            depth = obj_sneo_fakeheart.depth - 2;
            x = obj_heroparent.x;
            y = obj_heroparent.y;
        }
        obj_heart.color = 1;
        image_angle %= 360;
        if (image_angle < 180)
        {
            image_angle += 360;
        }
        startangle = image_angle;
        heartspeed = 8;
    }
}
else if (state == 3)
{
    obj_heart.x += heartspeed;
    x = obj_heart.x;
    heartspeed -= 1.5;
    image_angle = scr_remapvalue(8, 0, heartspeed, startangle, 0);
    if (heartspeed <= 0)
    {
        obj_heart.color = 1;
        obj_heart.image_alpha = 1;
        instance_destroy();
    }
}
`}},{metadata:{index:648,name:`obj_sneo_lastattack`,parent:null,sprite:`spr_sneo_lastattack_head`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`x_offset = 66;
y_offset = 135;
skip_1st_part_hp = 12;
skip_2nd_part_hp = 17;
yspot[0] = obj_growtangle.y - (obj_growtangle.sprite_height / 2) - y_offset;
yspot[1] = (obj_growtangle.y + (obj_growtangle.sprite_height / 2)) - y_offset;
yspot[2] = y;
lastshoty = y;
rand = 80;
ycurrent = 1;
con = 0;
movetimer = 0;
shottimer = 0;
timer = 0;
count = 0;
mouthtopy = 0;
mouthbottomy = 0;
shotmouthopen = 0;
shotmouthopentimer = 0;
mouthangle = 0;
init = 0;
remx = x;
hurtalpha = 0;
instance_create(x, y, obj_sneo_lastattack_hitbox);
endattack = 0;
with (obj_wreckpausespew)
{
    image_index = 2;
}
`,Destroy_0:`with (obj_wreckpausespew)
{
    instance_destroy();
}
`,Draw_0:`if (hurtalpha > 0)
{
    hurtalpha -= 0.1;
}
draw_sprite(spr_sneo_final_forme, 3, x, y);
draw_sprite_ext(spr_sneo_lastattack_head_top, 0, x + 60 + (mouthbottomy / 2) + x_offset, y + mouthtopy + y_offset, 1, 1, mouthangle, c_white, 1);
draw_sprite(sprite_index, 1, x + (mouthbottomy / 2) + x_offset, y + mouthbottomy + y_offset);
draw_sprite_ext(spr_sneo_lastattack_head_top, 0, x + 60 + (mouthbottomy / 2) + x_offset, y + mouthtopy + y_offset, 1, 1, mouthangle, c_yellow, hurtalpha);
draw_sprite_ext(sprite_index, 1, x + (mouthbottomy / 2) + x_offset, y + mouthbottomy + y_offset, 1, 1, 0, c_yellow, hurtalpha);
`,Step_0:`if (init == 0)
{
    remx = x;
    movetimer++;
    init = 1;
}
if (con == 0)
{
    movetimer++;
    if (movetimer <= 14)
    {
        y = lerp(y, yspot[ycurrent], 0.122);
    }
    else
    {
        movetimer = 0;
        count++;
        ycurrent++;
        if (ycurrent >= 2)
        {
            ycurrent = 0;
        }
    }
    shottimer++;
    if (shottimer >= choose(15))
    {
        lastshoty = y;
        bigshot = instance_create(x + 100, y + y_offset, obj_sneo_bigshot);
        bigshot.hspeed = -6;
        bigshot.friction = -0.25;
        shottimer = 0 + (count / 4);
        shotmouthopen = 1;
        shotmouthopentimer = 0;
        rand = 70 + irandom(5);
        snd_play_x(snd_chargeshot_fire, 0.75, 0.7);
    }
    if (count == 10 || endattack == 1)
    {
        con = 1;
        timer = 0;
        endattack = 1;
    }
}
if (shotmouthopen == 1)
{
    shotmouthopentimer++;
    mouthtopy = -sin(shotmouthopentimer / 3) * 30;
    mouthbottomy = -mouthtopy;
    mouthangle = mouthtopy;
    if (mouthbottomy < 0)
    {
        mouthangle = 0;
        mouthtopy = 0;
        mouthbottomy = 0;
        shotmouthopentimer = 0;
        shotmouthopen = 0;
    }
}
if (con == 1)
{
    timer++;
    y = lerp(y, (yspot[0] + yspot[1]) / 2, 0.1);
    if (timer < 10)
    {
        mouthbottomy = lerp(mouthbottomy, 0, 0.2);
        mouthtopy = lerp(mouthtopy, 20, 0.2);
    }
    if (timer >= 10 && timer < 25)
    {
        mouthbottomy = lerp(mouthbottomy, 120, 0.04);
        mouthtopy = lerp(mouthtopy, -100, 0.04);
        mouthangle = lerp(mouthangle, -45, 0.05);
    }
    if (timer >= 10)
    {
        mouthtopy += (sin(timer * 2) * 4);
        mouthbottomy -= (sin(timer * 2) * 4);
        mouthangle -= (sin(timer) * 5);
        x += random_range(-1, 1);
        y += random_range(-1, 1);
    }
    if (timer == 11)
    {
        bigshot = instance_create(x + 131, y + y_offset, obj_sneo_bigshot);
        bigshot.image_xscale = 0;
        bigshot.image_yscale = 0;
        bigshot.sprite_index = spr_sneo_bigshot_l;
        shottimer = 0;
        snd_play_x(snd_chargeshot_fire, 0.7, 0.4);
        snd_play_x(snd_chargeshot_fire, 0.7, 0.6);
        snd_play_x(snd_chargeshot_fire, 0.7, 0.8);
        snd_play_x(snd_chargeshot_fire, 0.7, 0.9);
    }
}
`}},{metadata:{index:649,name:`obj_sneo_lastattack_hitbox`,parent:null,sprite:`spr_whitepx_10`,mask:null,solid:!1,depth:0,visible:!1},sources:{Collision_obj_yheart_shot:`with (other)
{
    event_user(0);
}
if (obj_sneo_lastattack.endattack != 2)
{
    snd_play(snd_damage);
    if (instance_exists(obj_sneo_lastattack))
    {
        with (obj_sneo_lastattack)
        {
            hurtalpha = 1;
        }
    }
    if (obj_sneo_lastattack.endattack == 0)
    {
        obj_sneo_lastattack.skip_1st_part_hp -= other.damage;
    }
    if (obj_sneo_lastattack.skip_1st_part_hp < 1 && obj_sneo_lastattack.endattack == 0)
    {
        obj_sneo_lastattack.endattack = 1;
    }
    if (obj_sneo_lastattack.skip_2nd_part_hp < 1 && obj_sneo_lastattack.endattack == 1)
    {
        with (obj_sneo_bigshot)
        {
            playerhit = 1;
            damage = 0;
            event_user(0);
        }
        obj_sneo_lastattack.endattack = 2;
    }
}
`,Create_0:`event_inherited();
destroyonhit = false;
parent = obj_sneo_lastattack;
x = parent.x + parent.x_offset + 30;
y = (parent.y + parent.y_offset) - 40;
image_xscale = 4;
image_yscale = 6;
`,Step_2:`if (instance_exists(obj_sneo_lastattack))
{
    parent = obj_sneo_lastattack;
    x = parent.x + parent.x_offset + 30;
    y = (parent.y + parent.y_offset) - 40;
}
`}},{metadata:{index:642,name:`obj_sneo_final_orb`,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_neobuster`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`if (destroyable == 1)
{
    if (other.big == 0)
    {
        hp--;
        speed = 3;
    }
    else
    {
        hp -= 3;
        speed = 0;
    }
    if (hp <= 0)
    {
        event_user(0);
        snd_play(snd_badexplosion);
        speed = 0;
    }
    else
    {
        timer = -1;
        snd_play(snd_damage);
    }
}
with (other)
{
    event_user(0);
}
`,Create_0:`event_inherited();
destroyable = 1;
destroyonhit = 0;
image_xscale = 4;
image_yscale = 4;
hp = 12;
timer = 0;
direction = 180;
speed = 3;
playerhit = 0;
global.turntimer = 300;
flashsiner = 0;
`,Draw_0:`flashsiner++;
var blend_color = merge_color(#00A2E8, c_aqua, 0.25 + (sin(flashsiner / 3) * 0.25));
draw_self();
image_angle += (10 + (timer * 2));
if (timer > 0)
{
    draw_sprite_ext(spr_sneo_bigcircle, 0, x, y, image_xscale + (timer * 2), image_yscale + timer, 0, c_white, 1);
    draw_sprite_ext(spr_pixel_white, 0, camerax() - 20, cameray() - 20, 220, 220, 0, c_white, clamp(timer / 15, 0, 1));
}
draw_set_alpha(0.5);
draw_set_color(c_white);
i = max(0, hp);
while (i < 12)
{
    var _conewidth = ((((i - 1) % 3) == 0) ? 14 : 4) / 2;
    var _x2 = lengthdir_x(999, ((sin(i) + 1) * 180) - _conewidth);
    var _y2 = lengthdir_y(999, ((sin(i) + 1) * 180) - _conewidth);
    var _x3 = lengthdir_x(999, ((sin(i) + 1) * 180) + _conewidth);
    var _y3 = lengthdir_y(999, ((sin(i) + 1) * 180) + _conewidth);
    draw_triangle(x, y, _x2, _y2, _x3, _y3, 0);
    i++;
}
draw_set_alpha(1);
`,Other_10:`if (timer > 0)
{
    exit;
}
timer = 1;
destroyable = 0;
depth -= 40;
d = instance_create(x, y, obj_fadeout);
d.image_blend = c_white;
`,Other_15:`if (destroyable == 1)
{
    playerhit = 1;
    event_user(0);
}
`,Step_0:`if (timer != 0)
{
    timer++;
}
else if (timer == 0)
{
    if (speed < 3)
    {
        speed += 0.25;
    }
}
if (timer > 60)
{
    d = instance_create(camerax(), cameray(), obj_fadein);
    with (obj_fadeout)
    {
        instance_destroy();
    }
    d.image_blend = c_white;
    d.fadespeed = -0.01;
    if (playerhit)
    {
        scr_damage_all();
    }
    global.turntimer = 1;
    instance_destroy();
}
`}},{metadata:{index:638,name:`obj_sneo_bigshot`,parent:`obj_collidebullet`,sprite:`spr_sneo_bigshot_s`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`scr_bullet_init();
element = 6;
destroyonhit = 0;
f = 2;
destroyable = 1;
angle_speed = 0;
destroypoints = 1;
attackisdone = 0;
damage = 50;
image_xscale = 1;
image_yscale = 2;
timer = 0;
playerhit = 0;
flashsiner = 0;
depth = obj_heart.depth - 5;
explosion_alpha = 1;
explosion_hide = 0;
xx = x;
yy = y;
grazepoints = 4;
timer2 = 0;
explodesfx = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = floor((global.monsterat[obj_spamton_neo_enemy.myself] * 5) / 3);
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
`,Destroy_0:`d = instance_create(camerax(), cameray(), obj_fadein);
with (obj_fadeout)
{
    instance_destroy();
}
d.image_blend = c_white;
d.fadespeed = -0.034;
global.turntimer = 1;
with (obj_sneo_lastattack)
{
    instance_destroy();
}
with (obj_sneo_lastattack_hitbox)
{
    instance_destroy();
}
if (sprite_index == spr_sneo_bigshot_l)
{
    with (obj_spamton_neo_enemy)
    {
        if (global.monsterhp[myself] == global.monstermaxhp[myself] && scr_sideb_get_phase() < 3)
        {
            obj_sneo_bulletcontroller.mercyaccumulated += 5;
            with (obj_spamton_neo_enemy)
            {
                __mercydmgwriter = instance_create(global.monsterx[myself], (global.monstery[myself] + 20) - (global.hittarget[myself] * 20), obj_dmgwriter);
                __mercydmgwriter.damage = 5;
                __mercydmgwriter.type = 5;
                global.hittarget[myself]++;
            }
        }
        else
        {
            global.monsterhp[0] -= ceil(global.monstermaxhp[0] * 0.05);
            if (global.monsterhp[0] < 0)
            {
                global.monsterhp[0] = 1;
            }
        }
    }
}
`,Draw_0:`if (explosion_hide == 0)
{
    draw_self();
}
if (timer > 0)
{
    obj_sneo_lastattack.endattack = 3;
    if (obj_sneo_lastattack.endattack == 2)
    {
        if (timer >= 7)
        {
            explosion_alpha -= 0.1;
        }
        draw_sprite_ext(spr_pixel_white, 0, camerax() - 20, cameray() - 20, 220, 220, 0, c_white, clamp(timer / 60, 0, 1));
    }
    else
    {
        if (explodesfx == 0)
        {
            explodesfx = 1;
            snd_loop(snd_rumble);
            snd_play_x(snd_explosion, 0.6, 1);
        }
        draw_sprite_ext(spr_sneo_bigcircle, 0, x - 50, y, image_xscale + (timer * 2), image_yscale + timer, 0, c_white, 1);
        draw_sprite_ext(spr_pixel_white, 0, camerax() - 20, cameray() - 20, 220, 220, 0, c_white, clamp(timer / 12, 0, 1));
    }
}
`,Other_10:`if (playerhit)
{
    if (timer > 0)
    {
        exit;
    }
    timer = 1;
    destroyable = 0;
    attackisdone = 1;
    depth -= 40;
    hspeed = 0;
    if (obj_sneo_lastattack.skip_2nd_part_hp > 0)
    {
    }
    obj_sneo_lastattack.endattack = 3;
    xx = x;
    yy = y;
}
else
{
}
`,Other_15:`if (sprite_index == spr_sneo_bigshot_l)
{
    playerhit = 1;
    event_user(0);
    with (obj_spamton_neo_enemy)
    {
        event_user(2);
    }
}
else if (sprite_index == spr_sneo_bigshot_s)
{
    if (active == 1)
    {
        with (obj_spamton_neo_enemy)
        {
            event_user(2);
        }
        if (destroyonhit == 1)
        {
            instance_destroy();
        }
    }
}
`,Step_0:`if (sprite_index == spr_sneo_bigshot_l)
{
    timer2++;
    if (timer2 < 11)
    {
        if (instance_exists(obj_sneo_lastattack))
        {
            depth = obj_sneo_lastattack.depth + 1;
        }
    }
    else if (instance_exists(obj_sneo_lastattack))
    {
        depth = obj_sneo_lastattack.depth - 1;
    }
    if (timer2 < 16)
    {
        image_xscale = lerp(0, 2, timer2 / 15);
        image_yscale = lerp(0, 2, timer2 / 15);
    }
    if (timer2 == 15)
    {
        hspeed = -1;
        friction = -0.05;
    }
    x += random_range(-1, 1);
    y = ystart + random_range(-4, 4);
    if (x < (camerax() + 400))
    {
        event_user(0);
        playerhit = 1;
        damage = 0;
        if (instance_exists(obj_sneo_lastattack))
        {
            obj_sneo_lastattack.endattack = 2;
        }
    }
}
else
{
    image_xscale = lerp(image_xscale, 2, 0.2);
}
if (timer != 0)
{
    timer++;
}
if (timer > 13)
{
    instance_create(camerax() + 320, cameray() + 240, obj_sneo_smoke);
    instance_destroy();
    snd_volume(snd_rumble, 0, 70);
    obj_spamton_neo_enemy.stoprumblesfx = 70;
}
`}},{metadata:{index:647,name:`obj_sneo_finale_bullet`,parent:`obj_basicbullet_sneo_finale`,sprite:`spr_sneo_crew_bullet`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`event_inherited();
flashsiner = 0;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 4;
`,Step_0:`if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)
{
    instance_destroy();
}
image_angle += 36;
if (destroyable == 1)
{
    flashsiner++;
    image_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(flashsiner / 3) * 0.25));
}
`}},{metadata:{index:565,name:`obj_wreckpausespew`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`playback_sprite = scr_84_get_sprite("spr_sneo_playback");
image_speed = 0;
`,Draw_0:`draw_sprite(playback_sprite, image_index, camerax() + 20, cameray() + 400);
`}},{metadata:{index:758,name:`obj_rouxls_power_up_orb`,parent:null,sprite:`spr_bullet_laser_circle`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`init = 0;
image_alpha = 0;
lifetime = 30;
xx = x;
yy = y;
timer = 0;
radius = 5;
parenttarget = -1;
thin = 0;
_type = 0;
track_target = -4;
xoff = 0;
yoff = 0;
max_radius = 6;
distance_multiplier = 1;
`,Draw_0:`if (parenttarget != -1 && !i_ex(parenttarget))
{
    instance_destroy();
    exit;
}
if (parenttarget != -1 && i_ex(parenttarget))
{
    xstart = parenttarget.x;
    ystart = parenttarget.y;
}
if (init == 0)
{
    init = 1;
    if (thin)
    {
        lifetime /= 2;
    }
    if (track_target != -4)
    {
        xstart = 0;
        ystart = 0;
    }
    var _distance = random_range(70, 90) * distance_multiplier;
    if (_type == 1)
    {
        _distance = random_range(40, 45);
    }
    xx = xstart + lengthdir_x(_distance, direction);
    x = xx;
    yy = ystart + lengthdir_y(_distance, direction);
    y = yy;
}
if (track_target != -4)
{
    xoff = track_target.x;
    yoff = track_target.y;
}
timer++;
if (timer > lifetime)
{
    instance_destroy();
    exit;
}
var _progress = timer / lifetime;
image_alpha = 1;
if (thin)
{
    image_blend = c_white;
    image_yscale = 0.25;
    image_angle = direction;
    draw_self();
    x = lerp(xx, xstart, scr_ease_in(_progress, 2)) + xoff;
    y = lerp(yy, ystart, scr_ease_in(_progress, 2)) + yoff;
}
else
{
    var _drawalpha = draw_get_alpha();
    draw_set_color(image_blend);
    draw_circle(x, y, radius - 2, 0);
    draw_set_alpha(image_alpha);
    x = lerp(xx, xstart, scr_ease_in(_progress, 2)) + xoff;
    y = lerp(yy, ystart, scr_ease_in(_progress, 2)) + yoff;
    draw_circle(x, y, radius, 0);
    if ((radius - 3) > 0)
    {
        draw_set_color(c_white);
        draw_circle(x, y, radius - 2, 0);
    }
    draw_set_alpha(_drawalpha);
    radius = lerp(max_radius, 1, _progress);
}
`}}],It=[{metadata:{index:597,name:`obj_basicbullet_sneo`,parent:`obj_collidebullet`,sprite:`spr_sneo_bullet0`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`if (destroyable == 1)
{
    if (other.big == 0)
    {
        with (other)
        {
            event_user(0);
        }
    }
    anim = instance_create(x, y, obj_yshot_anim);
    anim.image_xscale = image_xscale;
    anim.image_yscale = image_yscale;
    with (anim)
    {
        sprite_index = spr_yheart_shot_hit3;
    }
    instance_destroy();
}
else if (destroyable == -1)
{
    with (other)
    {
        event_user(0);
    }
}
`,Create_0:`scr_bullet_init();
element = 6;
fluffyguarddestroysthis = 1;
f = 2;
destroyable = 0;
angle_speed = 0;
destroypoints = 1;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
grazepoints = 3;
`,Step_0:`if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)
{
    instance_destroy();
}
direction += angle_speed;
image_angle = direction;
`}},{metadata:{index:599,name:`obj_basicbullet_sneo_finale`,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_bullet0`,mask:null,solid:!1,depth:0,visible:!0},sources:{Collision_obj_yheart_shot:`if (destroyable == 1)
{
    if (other.big == 0)
    {
        with (other)
        {
            event_user(0);
        }
    }
    anim = instance_create(x, y, obj_yshot_anim);
    anim.image_xscale = image_xscale;
    anim.image_yscale = image_yscale;
    with (anim)
    {
        sprite_index = spr_yheart_shot_hit3;
    }
    instance_destroy();
}
else if (destroyable == -1)
{
    with (other)
    {
        event_user(0);
    }
}
`,Create_0:`scr_bullet_init();
element = 6;
f = 2;
destroyable = 0;
angle_speed = 0;
destroypoints = 1;
if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
grazepoints = 4;
`,Other_15:`if (active == 1)
{
    if (target != 3)
    {
        scr_damage_proportional();
    }
    if (target == 3)
    {
        scr_damage_all();
    }
    if (destroyonhit == 1)
    {
        instance_destroy();
    }
}
`,Step_0:`if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)
{
    instance_destroy();
}
direction += angle_speed;
image_angle = direction;
`}},{metadata:{index:929,name:`obj_lerpvar`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`variable = 0;
varname = "variable";
pointa = 0;
pointb = 0;
time = 0;
maxtime = 30;
target = -1;
init = 0;
easetype = 0;
easeinout = "out";
`,Step_0:`if (i_ex(target))
{
    if (init == 0)
    {
        if (is_string(pointa))
        {
            pointa = variable_instance_get(target, varname);
        }
        init = 1;
    }
    time++;
    if (easetype == 0)
    {
        variable_instance_set(target, varname, lerp(pointa, pointb, time / maxtime));
    }
    else
    {
        if (easeinout == "out")
        {
            variable_instance_set(target, varname, lerp_ease_out(pointa, pointb, time / maxtime, easetype));
        }
        if (easeinout == "in")
        {
            variable_instance_set(target, varname, lerp_ease_in(pointa, pointb, time / maxtime, easetype));
        }
        if (easeinout == "inout")
        {
            variable_instance_set(target, varname, lerp_ease_inout(pointa, pointb, time / maxtime, easetype));
        }
    }
    if (time >= maxtime)
    {
        instance_destroy();
    }
}
else
{
    instance_destroy();
}
`}},{metadata:{index:932,name:`obj_script_delayed`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`event_user(0);
instance_destroy();
`,Create_0:`script = -1;
target = -1;
rate = 1;
alarm[0] = 1;
for (i = 0; i < 13; i++)
{
    script_arg[i] = 0;
}
arg_count = 0;
constant = 0;
max_time = 0;
timer = 999;
totaltimer = 0;
`,Other_10:`if (i_ex(target))
{
    target.__scipt = script;
    for (i = 0; i < 10; i++)
    {
        target.__scipt_arg[i] = script_arg[i];
    }
    if (arg_count == 0)
    {
        with (target)
        {
            script_execute(__scipt);
        }
    }
    if (arg_count == 1)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0]);
        }
    }
    if (arg_count == 2)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1]);
        }
    }
    if (arg_count == 3)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2]);
        }
    }
    if (arg_count == 4)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3]);
        }
    }
    if (arg_count == 5)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4]);
        }
    }
    if (arg_count == 6)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5]);
        }
    }
    if (arg_count == 7)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6]);
        }
    }
    if (arg_count == 8)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6], __scipt_arg[7]);
        }
    }
    if (arg_count == 9)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6], __scipt_arg[7], __scipt_arg[8]);
        }
    }
    if (arg_count == 10)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6], __scipt_arg[7], __scipt_arg[8], __scipt_arg[9]);
        }
    }
}
`,Step_0:`if (constant == 1)
{
    if (max_time == -1)
    {
        totaltimer = -10;
    }
    timer++;
    if (timer >= rate)
    {
        if (i_ex(target) && totaltimer < max_time)
        {
            event_user(0);
            timer = 0;
        }
        else
        {
            instance_destroy();
        }
    }
    totaltimer++;
}
`}},{metadata:{index:1101,name:`obj_doom`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!1},sources:{Alarm_0:`with (target)
{
    instance_destroy();
}
instance_destroy();
`}},{metadata:{index:211,name:`obj_afterimage_cut`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`faderate = 0.1;
siner = 0;
sprite_index = spr_whitepx;
image_speed = 0;
event_user(0);
flash = false;
`,Draw_0:`if (flash)
{
    d3d_set_fog(true, c_white, 0, 1);
    draw_self();
    d3d_set_fog(false, c_black, 0, 0);
    flash = false;
    exit;
}
siner++;
var hw = width / 2;
var hh = height / 2;
var m = lerp_ease_out(0, sprite_height / 2, (siner + 2) / 10, 1);
image_alpha -= faderate;
draw_sprite_part_ext(sprite_index, image_index, 0, 0, hw, hh, x - m - ((xo * image_xscale) / 2), y - m - ((yo * image_yscale) / 2), image_xscale, image_yscale, image_blend, image_alpha);
draw_sprite_part_ext(sprite_index, image_index, hw, 0, hw, hh, (x + m) - ((xo * image_xscale) / 2), y - m - ((yo * image_yscale) / 2), image_xscale, image_yscale, image_blend, image_alpha);
draw_sprite_part_ext(sprite_index, image_index, 0, hh, hw, hh, x - m - ((xo * image_xscale) / 2), (y + m) - ((yo * image_yscale) / 2), image_xscale, image_yscale, image_blend, image_alpha);
draw_sprite_part_ext(sprite_index, image_index, hw, hh, hw, hh, (x + m) - ((xo * image_xscale) / 2), (y + m) - ((yo * image_yscale) / 2), image_xscale, image_yscale, image_blend, image_alpha);
if (image_alpha < 0)
{
    instance_destroy();
}
`,Other_10:`width = sprite_get_width(sprite_index);
height = sprite_get_width(sprite_index);
xo = sprite_get_xoffset(sprite_index);
yo = sprite_get_yoffset(sprite_index);
`}}],Lt={metadata:{index:703,name:`obj_sneo_bulletcontroller`,parent:`obj_bulletgenparent`,sprite:`spr_sneo_c_weakpoint_hit`,mask:null,solid:!1,depth:0,visible:!1},sources:{Create_0:`type = 1;
btimer = 99;
atimer = 0;
timermax = 12;
damage = -1;
grazepoints = -1;
timepoints = -1;
inv = -1;
grazed = -1;
grazetimer = -1;
element = 6;
target = -1;
side = 1;
difficulty = obj_spamton_neo_enemy.difficulty;
made = 0;
hellmode = obj_spamton_neo_enemy.hellmode;
init = 0;
sameattack = 0;
sameattacker = 0;
miny = 999;
maxy = 999;
maxx = 999;
miny = 999;
creator = 0;
sneo = obj_spamton_neo_enemy;
hideshooty = 1;
lastType = 0;
sneoarm_x = sneo.x + sneo.partxoff[1];
sneoarm_y = sneo.y + sneo.partyoff[1];
elevatororb = 2;
doubleelevatorattack = 0;
arm1 = -1;
arm2 = -1;
arm3 = -1;
sneodollarcount = 0;
mercyaccumulated = 0;
hearttargettimer = 0;
facetimeincrease = 0;
krishp = global.hp[1];
sushp = global.hp[2];
ralhp = global.hp[3];
`,Destroy_0:`if (hideshooty)
{
    sneo.partframe[1] = 0;
}
with (obj_spamton_neo_enemy)
{
    makeheartinit = 0;
    makeheartalt = 0;
    partmode = 1;
    heart_release_con = 0;
}
if (type == 0 && difficulty == 3)
{
    with (obj_spamton_neo_enemy)
    {
        scr_move_to_rememberxy(4);
    }
}
else
{
    sneo.x = sneo.xstart;
}
if (type == 8.5)
{
    if (krishp != global.hp[1] || sushp != global.hp[2] || ralhp != global.hp[3])
    {
        obj_spamton_neo_enemy.nothitduringphonehands = 0;
    }
}
if (mercyaccumulated > 0)
{
    with (obj_spamton_neo_enemy)
    {
        global.mercymod[myself] += obj_sneo_bulletcontroller.mercyaccumulated;
        if (global.mercymod[myself] < 0)
        {
            global.mercymod[myself] = 0;
        }
        if (global.mercymod[myself] >= 99)
        {
            global.mercymod[myself] = 99;
        }
    }
}
`,Step_0:`if (global.mercymod[obj_spamton_neo_enemy.myself] > 99 && global.turntimer > 1)
{
    global.turntimer = 1;
}
if (init == 0)
{
    sameattack = scr_monsterattacknamecount(global.monsterattackname[creator]);
    if (sameattack > 1)
    {
        if (creator == 2)
        {
            sameattacker = sameattack - 1;
        }
        else if (creator == 1)
        {
            sameattacker = (sameattack == 3) ? creator : (global.monsterattackname[0] == global.monsterattackname[1]);
        }
    }
    if (instance_exists(obj_growtangle))
    {
        miny = obj_growtangle.y - (obj_growtangle.sprite_height / 2);
        maxy = obj_growtangle.y + (obj_growtangle.sprite_height / 2);
        minx = obj_growtangle.x - (obj_growtangle.sprite_width / 2);
        maxx = obj_growtangle.x + (obj_growtangle.sprite_width / 2);
    }
    init = 1;
}
btimer += 1;
if (type == 0)
{
    if (init == 1)
    {
        btimer = 0;
        instance_create(0, 0, obj_sneo_guymaker);
        init = 2;
        global.turntimer = 240;
        if (difficulty == 2)
        {
            global.turntimer = 360;
        }
        if (difficulty == 3)
        {
            global.turntimer = 300;
        }
    }
    else if (difficulty == 2)
    {
        if (btimer == 40 || btimer == 150 || btimer == 260)
        {
            sneoarm_x = sneo.x + sneo.partxoff[1];
            sneoarm_y = sneo.y + sneo.partyoff[1];
            armangle = -68 - random(32);
            side = armangle;
            d = instance_create(sneoarm_x + lengthdir_x(60, armangle - 90), sneoarm_y + lengthdir_y(60, armangle - 90), obj_sneo_biglaser);
            d.direction = armangle - 90;
            d.image_angle = armangle - 90;
            d.depth += 1;
            d.damage = damage * 2;
            d.target = target;
            sneo.aimmode = 1;
            sneo.armaim = armangle;
            sneo.partmode = 3;
        }
        else if (btimer == 90 || btimer == 200 || btimer == 310)
        {
            with (obj_sneo_biglaser)
            {
                firecon = 1;
                active = 1;
                image_blend = c_white;
            }
            sneo.partmode = 12;
        }
        else if ((btimer >= 90 && btimer < 120) || (btimer >= 200 && btimer < 230) || (btimer >= 310 && btimer < 340))
        {
            var otherside = (side == -110) ? -85 : -90;
            obj_sneo_biglaser.x = sneoarm_x + lengthdir_x(60, armangle - 90);
            obj_sneo_biglaser.y = sneoarm_y + lengthdir_y(60, armangle - 90);
            obj_sneo_biglaser.direction = armangle - 90;
            obj_sneo_biglaser.image_angle = armangle - 90;
            sneo.armaim = armangle;
        }
        else if (btimer == 130 || btimer == 240 || btimer == 350)
        {
            obj_sneo_biglaser.firecon = 2;
            sneo.partmode = 4;
        }
    }
    else if (difficulty == 3)
    {
        if (btimer == 1)
        {
            sneo.partmode = 36;
        }
    }
}
if (type == 1)
{
    atimer++;
    if (atimer == 1)
    {
        btimer = 0;
    }
    if (atimer == 6)
    {
        bul = instance_create(obj_spamton_neo_enemy.x + 4, obj_spamton_neo_enemy.y + 60, obj_pipis_egg_bullet);
        bul.type = 2;
        bul.drawlabel = 1;
        bul.depth = obj_spamton_neo_enemy.depth;
        bul.gravity = 0.2 + (random(10) / 100);
        bul.vspeed = 0;
        bul.hspeed = -1.55;
        bul.target = target;
        bul.damage = damage;
    }
    if (atimer < 20)
    {
        obj_spamton_neo_enemy.x += 10;
        sneo.vinex = scr_ease_in(min(10, atimer) / 10, 5) * 300;
        sneo.x = sneo.xstart + (scr_ease_in(atimer / 20, 2) * 300);
    }
    if (atimer == 20 && init == 1)
    {
        sneo.x = sneo.xstart + 300;
        sneo.vinex *= -1;
        pipis = instance_create(x, y, obj_pipis_controller);
        pipis.damage = damage;
        pipis.target = target;
        init = 2;
    }
    if (global.turntimer < 21 && global.turntimer > 1)
    {
        obj_spamton_neo_enemy.partmode = 1;
        with (obj_sneo_phonecall)
        {
            fadealpha = 0;
        }
        obj_spamton_neo_enemy.x -= 10;
        var _slidetimer = global.turntimer - 1;
        sneo.vinex = scr_ease_out(min(10, _slidetimer) / 10, 5) * 50;
        sneo.x = sneo.xstart + (scr_ease_out(_slidetimer / 20, 4) * 200);
        sneo.y = lerp(sneo.y, sneo.___myremembery, _slidetimer / 20);
    }
    if (global.turntimer == 1)
    {
        obj_spamton_neo_enemy.x = obj_spamton_neo_enemy.xstart;
    }
}
if (type == 1.5)
{
    hearttargettimer--;
    if (init == 1)
    {
        with (obj_spamton_neo_enemy)
        {
            partmode = 34;
        }
        init = 2;
        btimer = 100;
    }
    if (btimer == 110)
    {
        with (obj_spamton_neo_enemy)
        {
            heart_release_con++;
            if (heart_release_con == 1)
            {
                makeheart = 1;
            }
        }
    }
}
// Source type 2 is not reachable from the NORMAL chooser.

// Source type 3 is not reachable from the NORMAL chooser.

// Source type 4 is not reachable from the NORMAL chooser.

// Source type 5 is not reachable from the NORMAL chooser.

if (type == 6)
{
    if (init == 1)
    {
        if (difficulty == 9)
        {
            instance_create(0, 0, obj_sneo_wall_controller);
        }
        else
        {
            instance_create(0, 0, obj_sneo_wall_controller_new);
        }
        init = 2;
    }
    if (global.turntimer <= 10 && global.turntimer > 9)
    {
        with (obj_spamton_neo_enemy)
        {
            scr_move_to_rememberxy(8);
        }
        global.turntime = 9;
    }
}
// Source type 7 is not reachable from the NORMAL chooser.

// Source type 8 is not reachable from the NORMAL chooser.

if (type == 8.5)
{
    if (init == 1)
    {
        init = 2;
        made = 60;
    }
    if (btimer >= 1)
    {
        if (global.turntimer > 11 && obj_spamton_neo_enemy.image_alpha > -0.2)
        {
            obj_spamton_neo_enemy.image_alpha -= 0.2;
        }
        if (btimer == 115)
        {
            d = instance_create(obj_growtangle.x + 40 + (obj_growtangle.sprite_width / 2), obj_growtangle.y, obj_sneo_phonehand_master);
            d.target = target;
        }
    }
}
if (type == 9)
{
    if (init == 1)
    {
        global.turntimer = 1200;
        instance_create(obj_growtangle.x, obj_growtangle.y, obj_finale_growtangle);
        init = 2;
        special = 1;
        btimer = 0;
        obj_sneo_hitdetector.active = false;
    }
    if (special == 1 && btimer == 45)
    {
        special = 2;
        d = instance_create(obj_growtangle.x, obj_growtangle.y, obj_sneo_warped_box);
        d = instance_create(camerax() + 680, sneo.y, obj_sneo_final_forme);
        d.intro = -1;
        d.damage = damage;
        d.target = target;
        d.speed = 16.75;
        d.direction = 180;
        d.friction = 0.5;
        btimer = 0;
    }
    if (special == 2 && btimer == 70)
    {
        obj_sneo_warped_box.state = 1;
        obj_sneo_final_forme_hitbox.destroyable = 1;
        obj_sneo_final_forme.destroyable = 1;
        obj_sneo_final_forme.image_index++;
        special = 3;
    }
    if (special == 3 && btimer >= 10)
    {
        if (sneodollarcount == 0)
        {
            xx = minx - random(30) - 40;
            yy = (obj_growtangle.y - random(100)) + 100;
            d = instance_create(xx, yy, obj_sneo_dollar);
            d.startscale = 1;
            sneodollarcount = 1;
        }
        else if (sneodollarcount == 1)
        {
            xx = minx - random(30) - 40;
            yy = (obj_growtangle.y - random(100)) + 200;
            d = instance_create(xx, yy, obj_sneo_dollar);
            d.startscale = 1;
            sneodollarcount = 2;
        }
        else if (sneodollarcount == 2)
        {
            xx = minx - random(30) - 40;
            yy = (obj_growtangle.y - random(200)) + 100;
            d = instance_create(xx, yy, obj_sneo_dollar);
            d.startscale = 1.5;
            sneodollarcount = 3;
        }
        else if (sneodollarcount == 3)
        {
            xx = minx - random(30) - 40;
            yy = (obj_growtangle.y - random(100)) + 100;
            d = instance_create(xx, yy, obj_sneo_dollar);
            d.startscale = 1;
            sneodollarcount = 4;
        }
        else if (sneodollarcount == 4)
        {
            xx = minx - random(30) - 40;
            yy = (obj_growtangle.y - random(100)) + 200;
            d = instance_create(xx, yy, obj_sneo_dollar);
            d.startscale = 1;
            sneodollarcount = 5;
        }
        else if (sneodollarcount == 5)
        {
            xx = minx - random(30) - 40;
            yy = (obj_growtangle.y - random(200)) + 100;
            d = instance_create(xx, yy, obj_sneo_dollar);
            d.startscale = 1.5;
            sneodollarcount = 6;
        }
        else if (sneodollarcount == 6)
        {
            xx = minx - random(30) - 40;
            yy = (obj_growtangle.y - random(200)) + 100;
            d = instance_create(xx, yy, obj_sneo_dollar);
            d.startscale = 2;
            sneodollarcount = 0;
        }
        btimer = 3;
        d.speed = 0.1;
    }
}
// Source type 10 is not reachable from the NORMAL chooser.

// Source type 11 is not reachable from the NORMAL chooser.

if (type == 12)
{
    atimer++;
    if (atimer == 1)
    {
        if (obj_spamton_neo_enemy.facebroken == 2)
        {
            global.turntimer = 170;
            obj_spamton_neo_enemy.facebroken = 1;
        }
    }
    if (atimer < 20)
    {
        obj_spamton_neo_enemy.x += 10;
        sneo.vinex = scr_ease_in(min(10, atimer) / 10, 5) * 300;
        sneo.x = sneo.xstart + (scr_ease_in(atimer / 20, 2) * 300);
    }
    if (atimer == 20)
    {
        face = instance_create(camerax() + 424, cameray() + 100, obj_sneo_faceattack);
        face.target = target;
        face.damage = damage;
        face.special = hellmode;
        if (obj_spamton_neo_enemy.faceattackcount == 1)
        {
            face.first_time = true;
        }
        with (face)
        {
            event_user(0);
        }
        obj_sneo_bulletcontroller.facetimeincrease = 0;
        if (obj_spamton_neo_enemy.eyeshp <= 0)
        {
            obj_sneo_bulletcontroller.facetimeincrease++;
        }
        if (obj_spamton_neo_enemy.nosehp <= 0)
        {
            obj_sneo_bulletcontroller.facetimeincrease++;
        }
        if (obj_spamton_neo_enemy.mouthhp <= 0)
        {
            obj_sneo_bulletcontroller.facetimeincrease++;
        }
        with (obj_sneo_faceattack)
        {
            if (type != 1)
            {
                if (obj_sneo_bulletcontroller.facetimeincrease == 1)
                {
                    timer += 20;
                }
                if (obj_sneo_bulletcontroller.facetimeincrease == 2 || obj_sneo_bulletcontroller.facetimeincrease == 3)
                {
                    timer += 50;
                }
            }
            if (type == 1)
            {
                if (obj_sneo_bulletcontroller.facetimeincrease == 1)
                {
                    timer += 20;
                }
                if (obj_sneo_bulletcontroller.facetimeincrease == 2 || obj_sneo_bulletcontroller.facetimeincrease == 3)
                {
                    timer += 20;
                }
            }
        }
    }
    if (global.turntimer > 80 && instance_exists(obj_sneo_faceattack) && obj_sneo_faceattack.init == 1 && obj_spamton_neo_enemy.facebroken == 0)
    {
        var a = 0;
        for (var i = 0; i < instance_number(obj_sneo_faceattack); i++)
        {
            enemy[i] = instance_find(obj_sneo_faceattack, i);
            if (enemy[i].type != 0 && enemy[i].broken == 0)
            {
                a = 1;
            }
        }
        if (a == 0)
        {
            global.turntimer = 80;
        }
    }
    if (global.turntimer < 21 && global.turntimer > 1)
    {
        with (obj_sneo_faceattack)
        {
            image_alpha -= 0.1;
            if (image_alpha < 0)
            {
                instance_destroy();
            }
        }
        obj_spamton_neo_enemy.x -= 10;
        var _slidetimer = global.turntimer - 1;
        sneo.vinex = scr_ease_out(min(10, _slidetimer) / 10, 5) * 50;
        sneo.x = sneo.xstart + (scr_ease_out(_slidetimer / 20, 4) * 200);
        sneo.y = lerp(sneo.y, sneo.___myremembery, _slidetimer / 20);
    }
    if (global.turntimer == 1)
    {
        if (obj_spamton_neo_enemy.facebroken == 1)
        {
            obj_spamton_neo_enemy.facebroken = 0;
        }
        obj_spamton_neo_enemy.x = obj_spamton_neo_enemy.xstart;
    }
}
`}},Rt={scr_tensionheal:`function scr_tensionheal(arg0)
{
    global.tension += arg0;
    if (global.tension > global.maxtension)
    {
        global.tension = global.maxtension;
    }
}
`,scr_bullet_init:`function scr_bullet_init()
{
    grazed = 0;
    grazetimer = 0;
    destroyonhit = 1;
    target = 0;
    inv = 60;
    damage = 10;
    element = 0;
    grazepoints = 1;
    timepoints = 1;
    active = 1;
    updateimageangle = 0;
}
`,scr_doom:`function scr_doom(arg0, arg1)
{
    with (instance_create_depth(0, 0, 0, obj_doom))
    {
        alarm[0] = arg1;
        target = arg0;
    }
}
`,scr_afterimage_cut:`function scr_afterimage_cut()
{
    afterimage = instance_create(x, y, obj_afterimage_cut);
    afterimage.sprite_index = sprite_index;
    afterimage.image_index = image_index;
    afterimage.image_blend = image_blend;
    afterimage.image_speed = 0;
    afterimage.depth = depth;
    afterimage.image_xscale = image_xscale;
    afterimage.image_yscale = image_yscale;
    afterimage.image_angle = image_angle;
    with (afterimage)
    {
        event_user(0);
    }
    return afterimage;
}
`,scr_movetowards:`function scr_movetowards(arg0, arg1, arg2)
{
    if (arg0 == arg1)
    {
        return arg0;
    }
    else if (arg0 > arg1)
    {
        return max(arg0 - arg2, arg1);
    }
    else
    {
        return min(arg0 + arg2, arg1);
    }
}
`,scr_afterimage:`function scr_afterimage()
{
    afterimage = instance_create(x, y, obj_afterimage);
    afterimage.sprite_index = sprite_index;
    afterimage.image_index = image_index;
    afterimage.image_blend = image_blend;
    afterimage.image_speed = 0;
    afterimage.depth = depth;
    afterimage.image_xscale = image_xscale;
    afterimage.image_yscale = image_yscale;
    afterimage.image_angle = image_angle;
    return afterimage;
}
`,scr_sneo_wall_create:`function scr_sneo_wall_create(arg0, arg1, arg2, arg3, arg4, arg5, arg6)
{
    if (arg0 == 0)
    {
    }
    if (arg0 == 1)
    {
        emptyspot1[wallsetupcount] = 1;
    }
    if (arg0 == 2)
    {
        breakspot1[wallsetupcount] = 1;
    }
    if (arg0 == 3)
    {
        pipispot1[wallsetupcount] = 1;
    }
    if (arg0 == 4)
    {
        redbreakspot1[wallsetupcount] = 1;
    }
    if (arg1 == 0)
    {
    }
    if (arg1 == 1)
    {
        emptyspot2[wallsetupcount] = 2;
    }
    if (arg1 == 2)
    {
        breakspot2[wallsetupcount] = 2;
    }
    if (arg1 == 3)
    {
        pipispot2[wallsetupcount] = 2;
    }
    if (arg1 == 4)
    {
        redbreakspot2[wallsetupcount] = 2;
    }
    if (arg2 == 0)
    {
    }
    if (arg2 == 1)
    {
        emptyspot3[wallsetupcount] = 3;
    }
    if (arg2 == 2)
    {
        breakspot3[wallsetupcount] = 3;
    }
    if (arg2 == 3)
    {
        pipispot3[wallsetupcount] = 3;
    }
    if (arg2 == 4)
    {
        redbreakspot3[wallsetupcount] = 3;
    }
    if (arg3 == 0)
    {
    }
    if (arg3 == 1)
    {
        emptyspot4[wallsetupcount] = 4;
    }
    if (arg3 == 2)
    {
        breakspot4[wallsetupcount] = 4;
    }
    if (arg3 == 3)
    {
        pipispot4[wallsetupcount] = 4;
    }
    if (arg3 == 4)
    {
        redbreakspot4[wallsetupcount] = 4;
    }
    if (arg4 == 0)
    {
    }
    if (arg4 == 1)
    {
        emptyspot5[wallsetupcount] = 5;
    }
    if (arg4 == 2)
    {
        breakspot5[wallsetupcount] = 5;
    }
    if (arg4 == 3)
    {
        pipispot5[wallsetupcount] = 5;
    }
    if (arg4 == 4)
    {
        redbreakspot5[wallsetupcount] = 5;
    }
    wallcreatetimer[wallsetupcount] = arg5;
    walltype[wallsetupcount] = arg6;
    wallsetupcount++;
}
`,scr_damage:`function scr_damage()
{
    if (global.inv < 0)
    {
        scr_damage_cache();
        var __element = 0;
        if (variable_instance_exists(id, "element"))
        {
            if (is_real(element))
            {
                __element = element;
            }
        }
        if (target < 3)
        {
            if (global.hp[global.char[target]] <= 0)
            {
                scr_randomtarget_old();
                target = mytarget;
                with (global.charinstance[target])
                {
                    image_blend = c_white;
                    darkify = 0;
                }
            }
        }
        var __remtarget = -1;
        if (target == 4)
        {
            __remtarget = 4;
            scr_randomtarget_old();
            target = mytarget;
            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))
            {
                scr_randomtarget_old();
                target = mytarget;
            }
            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))
            {
                scr_randomtarget_old();
                target = mytarget;
            }
            if (target == 0 && (global.hp[global.char[target]] / global.maxhp[global.char[target]]) < 0.35)
            {
                scr_randomtarget_old();
                target = mytarget;
            }
            with (global.charinstance[target])
            {
                image_blend = c_white;
                darkify = 0;
            }
        }
        chartarget = 3;
        tdamage = damage;
        var oldcalculation = 0;
        if (target < 3)
        {
            if (oldcalculation)
            {
                tdamage = ceil(tdamage - (global.battledf[target] * 3));
            }
            else
            {
                tdamage = scr_damage_calculation(tdamage, target);
            }
            chartarget = global.char[target];
            if (global.charaction[target] == 10)
            {
                tdamage = ceil((2 * tdamage) / 3);
            }
            tdamage = ceil(tdamage * scr_element_damage_reduction(__element, global.char[target]));
            if (tdamage < 1)
            {
                tdamage = 1;
            }
        }
        if (!instance_exists(obj_shake))
        {
            instance_create(0, 0, obj_shake);
        }
        with (global.charinstance[target])
        {
            hurt = 1;
            hurttimer = 0;
        }
        hpdiff = tdamage;
        with (obj_dmgwriter)
        {
            if (delaytimer >= 1)
            {
                killactive = 1;
            }
        }
        doomtype = -1;
        with (obj_heart)
        {
            dmgnoise = 1;
        }
        if (target < 3)
        {
            if (global.hp[chartarget] <= 0)
            {
                doomtype = 4;
                global.hp[chartarget] -= round(tdamage / 4);
                hpdiff = round(tdamage / 4);
            }
            else
            {
                global.hp[chartarget] -= tdamage;
                if (global.chapter == 2 && instance_exists(obj_gigaqueen_enemy) && global.hp[chartarget] <= 0)
                {
                    global.hp[chartarget] = 1;
                    with (o_boxingcontroller)
                    {
                        event_user(3);
                    }
                }
                if (global.hp[chartarget] <= 0)
                {
                    hpdiff = abs(global.hp[chartarget] - (global.maxhp[chartarget] / 2));
                    doomtype = 4;
                    global.hp[chartarget] = round(-global.maxhp[chartarget] / 2);
                    scr_dead(target);
                }
            }
            dmgwriter = instance_create(global.charinstance[target].x, (global.charinstance[target].y + global.charinstance[target].myheight) - 24, obj_dmgwriter);
            dmgwriter.damage = hpdiff;
            dmgwriter.type = doomtype;
        }
        if (target == 3)
        {
            for (hpi = 0; hpi < 3; hpi += 1)
            {
                chartarget = global.char[hpi];
                if (global.hp[chartarget] >= 0)
                {
                    if (oldcalculation)
                    {
                        tdamage = ceil(tdamage - (global.battledf[hpi] * 3));
                    }
                    else
                    {
                        tdamage = scr_damage_calculation(tdamage, hpi);
                    }
                    tdamage = ceil(tdamage * scr_element_damage_reduction(__element, chartarget));
                    if (global.charaction[hpi] == 10)
                    {
                        global.hp[chartarget] -= ceil((3 * tdamage) / 4);
                    }
                    else
                    {
                        global.hp[chartarget] -= tdamage;
                    }
                    if (global.hp[chartarget] <= 0)
                    {
                        global.hp[chartarget] = round(-global.maxhp[0] / 2);
                    }
                }
            }
        }
        global.inv = global.invc * 40;
        scr_damage_check();
        gameover = 1;
        if (global.char[0] != 0 && global.hp[global.char[0]] > 0)
        {
            gameover = 0;
        }
        if (global.char[1] != 0 && global.hp[global.char[1]] > 0)
        {
            gameover = 0;
        }
        if (global.char[2] != 0 && global.hp[global.char[2]] > 0)
        {
            gameover = 0;
        }
        if (gameover == 1)
        {
            scr_gameover();
        }
        if (__remtarget != -1)
        {
            target = __remtarget;
        }
    }
}
`,scr_damage_all:`function scr_damage_all()
{
    if (global.inv < 0)
    {
        scr_damage_cache();
        remdamage = damage;
        _temptarget = target;
        for (ti = 0; ti < 3; ti += 1)
        {
            global.inv = -1;
            damage = remdamage;
            target = ti;
            if (global.hp[global.char[ti]] > 0 && global.char[ti] != 0)
            {
                scr_damage();
            }
        }
        global.inv = global.invc * 40;
        target = _temptarget;
        scr_damage_check();
    }
}
`,scr_debug:`function scr_debug()
{
    return 0;
}
`,scr_marker:`function scr_marker(arg0, arg1, arg2)
{
    thismarker = instance_create(arg0, arg1, obj_marker);
    with (thismarker)
    {
        sprite_index = arg2;
        image_speed = 0;
    }
    return thismarker;
}
`,scr_script_delayed:`function scr_script_delayed()
{
    var __scriptdelay = instance_create(0, 0, obj_script_delayed);
    __scriptdelay.script = argument[0];
    __scriptdelay.alarm[0] = argument[1];
    __scriptdelay.target = id;
    for (var __i = 0; __i < (argument_count - 2); __i++)
    {
        __scriptdelay.script_arg[__i] = argument[__i + 2];
    }
    __scriptdelay.arg_count = argument_count - 2;
    return __scriptdelay;
}
`,scr_sideb_get_phase:`function scr_sideb_get_phase()
{
    var phase = 0;
    if (global.flag[916] == 0)
    {
        if (global.flag[915] > 0 && global.flag[915] < 4)
        {
            phase = 1;
        }
        if (global.flag[915] >= 4 && global.flag[915] < 7)
        {
            phase = 2;
        }
        if (global.flag[915] >= 7 && global.flag[915] < 20)
        {
            phase = 3;
        }
        if (global.flag[915] >= 20)
        {
            phase = 4;
        }
    }
    return phase;
}
`,scr_lerpvar:`function scr_lerpvar()
{
    if (argument_count < 6)
    {
        ___lerpvar = scr_lerpvar_instance(id, argument[0], argument[1], argument[2], argument[3]);
    }
    else
    {
        ___lerpvar = scr_lerpvar_instance(id, argument[0], argument[1], argument[2], argument[3], argument[4], argument[5]);
    }
    return ___lerpvar;
}
`,lerp_ease_out:`function lerp_ease_out(arg0, arg1, arg2, arg3)
{
    return lerp(arg0, arg1, scr_ease_out(arg2, arg3));
}
`,lerp_ease_in:`function lerp_ease_in(arg0, arg1, arg2, arg3)
{
    return lerp(arg0, arg1, scr_ease_in(arg2, arg3));
}
`,scr_move_to_rememberxy:`function scr_move_to_rememberxy(arg0)
{
    scr_move_to_point_over_time(___myrememberx, ___myremembery, arg0);
}
`,scr_ease_out:`function scr_ease_out(arg0, arg1)
{
    if (arg1 < -3 || arg1 > 7)
    {
        return arg0;
    }
    switch (arg1)
    {
        case -3:
            return ease_out_bounce(arg0, 0, 1, 1);
        case -2:
            return ease_out_elastic(arg0, 0, 1, 1);
        case -1:
            return ease_out_back(arg0, 0, 1, 1);
        case 0:
            return arg0;
        case 1:
            return sin(arg0 * 1.5707963267948966);
        case 2:
            return -arg0 * (arg0 - 2);
        case 6:
            return -power(2, -10 * arg0) + 1;
        case 7:
            arg0--;
            return sqrt(1 - (arg0 * arg0));
        default:
            arg0--;
            if (arg1 == 4)
            {
                return -1 * (power(arg0, arg1) - 1);
                break;
            }
            return power(arg0, arg1) + 1;
    }
}
`,scr_orbitx:`function scr_orbitx(arg0, arg1, arg2, arg3, arg4)
{
    if (arg4 == 0)
    {
        return arg2;
    }
    var __theta = point_direction(arg0, arg1, arg2, arg3);
    var __radius = point_distance(arg0, arg1, arg2, arg3);
    __theta += arg4;
    return arg0 + lengthdir_x(__radius, __theta);
}
`,scr_orbity:`function scr_orbity(arg0, arg1, arg2, arg3, arg4)
{
    if (arg4 == 0)
    {
        return arg3;
    }
    var __theta = point_direction(arg0, arg1, arg2, arg3);
    var __radius = point_distance(arg0, arg1, arg2, arg3);
    __theta += arg4;
    return arg1 + lengthdir_y(__radius, __theta);
}
`,scr_isphase:`function scr_isphase(arg0)
{
    __isphase = 0;
    if (arg0 == "menu" && global.myfight == 0)
    {
        __isphase = 1;
    }
    if (arg0 == "acting" && global.myfight == 3)
    {
        __isphase = 1;
    }
    if (arg0 == "victory" && global.myfight == 7)
    {
        __isphase = 1;
    }
    if (arg0 == "attack" || arg0 == "fight")
    {
        if (global.myfight == 1)
        {
            __isphase = 1;
        }
    }
    if (arg0 == "spell" || arg0 == "item")
    {
        if (global.myfight == 4)
        {
            __isphase = 1;
        }
    }
    if (arg0 == "enemytalk" || arg0 == "balloon")
    {
        if (global.mnfight == 1)
        {
            __isphase = 1;
        }
    }
    if (arg0 == "enemyattack" || arg0 == "bullets")
    {
        if (global.mnfight == 2)
        {
            __isphase = 1;
        }
    }
    return __isphase;
}
`,scr_enemyblcon:`function scr_enemyblcon(arg0, arg1, arg2)
{
    if (arg2 == 0)
    {
        mywriter = instance_create(arg0, arg1, obj_writer);
        return mywriter;
    }
    if (arg2 == 1)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        return myblcon;
    }
    if (arg2 == 2)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_v;
        return myblcon;
    }
    if (arg2 == 3)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_long;
        return myblcon;
    }
    if (arg2 == 4)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_clubs;
        myblcon.image_index = 0;
        myblcon.image_speed = 0;
        return myblcon;
    }
    if (arg2 == 5)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_clubs;
        myblcon.image_index = 1;
        myblcon.image_speed = 0;
        return myblcon;
    }
    if (arg2 == 6)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_clubs;
        myblcon.image_index = 2;
        myblcon.image_speed = 0;
        return myblcon;
    }
    if (arg2 == 7)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_long_r;
        myblcon.image_index = 2;
        myblcon.image_speed = 0;
        return myblcon;
    }
    if (arg2 == 8)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_long_tall;
        return myblcon;
    }
    if (arg2 == 10)
    {
        myblcon = instance_create(arg0, arg1, obj_battleblcon);
        myblcon.sprite_index = spr_battleblcon_long;
        myblcon.auto_length = 1;
        return myblcon;
    }
}
`,scr_bullet_inherit:`function scr_bullet_inherit(arg0)
{
    if (i_ex(arg0))
    {
        if (damage != -1)
        {
            arg0.damage = damage;
        }
        if (grazepoints != -1)
        {
            arg0.grazepoints = grazepoints;
        }
        if (timepoints != -1)
        {
            arg0.timepoints = timepoints;
        }
        if (inv != -1)
        {
            arg0.inv = inv;
        }
        if (target != -1)
        {
            arg0.target = target;
        }
        if (grazed != -1)
        {
            arg0.grazed = 0;
        }
        if (grazetimer != -1)
        {
            arg0.grazetimer = 0;
        }
        arg0.element = element;
    }
}
`,scr_darksize:`function scr_darksize(arg0)
{
    inst = arg0;
    inst.image_xscale = 2;
    inst.image_yscale = 2;
}
`,scr_shakescreen:`function scr_shakescreen()
{
    instance_create(x, y, obj_shake);
}
`,scr_remapvalue:`function scr_remapvalue(arg0, arg1, arg2, arg3, arg4)
{
    if (arg1 == arg0)
    {
        return arg3;
    }
    var __invLerp = (arg2 - arg0) / (arg1 - arg0);
    return lerp(arg3, arg4, __invLerp);
}

function remap(arg0, arg1, arg2, arg3, arg4)
{
    var __invLerp = scr_inverselerp(arg1, arg2, arg0);
    return lerp(arg3, arg4, __invLerp);
}

function remap_clamped(arg0, arg1, arg2, arg3, arg4)
{
    var __remapped_value = remap(arg0, arg1, arg2, arg3, arg4);
    return clamp(__remapped_value, arg3, arg4);
}
`,scr_ease_in:`function scr_ease_in(arg0, arg1)
{
    if (arg1 < -3 || arg1 > 7)
    {
        return arg0;
    }
    switch (arg1)
    {
        case -3:
            return ease_in_bounce(arg0, 0, 1, 1);
        case -2:
            return ease_in_elastic(arg0, 0, 1, 1);
        case -1:
            var _s = 1.70158;
            return arg0 * arg0 * (((_s + 1) * arg0) - _s);
        case 0:
            return arg0;
        case 1:
            return -cos(arg0 * 1.5707963267948966) + 1;
        case 6:
            return power(2, 10 * (arg0 - 1));
        case 7:
            return -(sqrt(1 - sqr(arg0)) - 1);
        default:
            return power(arg0, arg1);
    }
}
`,scr_84_get_sprite:`function scr_84_get_sprite(arg0)
{
    return ds_map_find_value(global.chemg_sprite_map, arg0);
}
`,scr_inverselerp:`function scr_inverselerp(arg0, arg1, arg2)
{
    if (arg1 == arg0)
    {
        return 0;
    }
    return (arg2 - arg0) / (arg1 - arg0);
}
`,scr_damage_proportional:`function scr_damage_proportional()
{
    if (global.inv < 0)
    {
        scr_damage_cache();
        if (target == 4)
        {
            scr_randomtarget_old();
            target = mytarget;
        }
        if (target < 3)
        {
            if (global.hp[global.char[target]] <= 0)
            {
                scr_randomtarget_old();
                target = mytarget;
                with (global.charinstance[target])
                {
                    image_blend = c_white;
                    darkify = 0;
                }
            }
        }
        chartarget = 3;
        var _targetChar = global.char[target];
        if (global.hp[_targetChar] > (global.maxhp[_targetChar] / 2))
        {
            tdamage = ceil(global.maxhp[_targetChar] / 5);
        }
        else if (global.hp[_targetChar] > (global.maxhp[_targetChar] / 5))
        {
            tdamage = ceil(global.maxhp[_targetChar] / 10);
        }
        else if (global.hp[_targetChar] > (global.maxhp[_targetChar] / 20))
        {
            tdamage = ceil(global.maxhp[_targetChar] / 25);
        }
        else if (global.hp[_targetChar] > 1)
        {
            tdamage = global.hp[_targetChar] - 1;
        }
        else
        {
            tdamage = 25;
        }
        if (target < 3)
        {
            tdamage = ceil(tdamage - (global.battledf[target] * 3));
            chartarget = global.char[target];
            if (global.charaction[target] == 10)
            {
                tdamage = ceil((2 * tdamage) / 3);
            }
            if (tdamage < 1)
            {
                tdamage = 1;
            }
        }
        if (!instance_exists(obj_shake))
        {
            instance_create(0, 0, obj_shake);
        }
        with (global.charinstance[target])
        {
            hurt = 1;
            hurttimer = 0;
        }
        hpdiff = tdamage;
        with (obj_dmgwriter)
        {
            if (delaytimer >= 1)
            {
                killactive = 1;
            }
        }
        doomtype = -1;
        with (obj_heart)
        {
            dmgnoise = 1;
        }
        if (target < 3)
        {
            if (global.hp[chartarget] <= 0)
            {
                doomtype = 4;
                global.hp[chartarget] -= round(tdamage / 4);
                hpdiff = round(tdamage / 4);
            }
            else
            {
                global.hp[chartarget] -= tdamage;
                if (global.hp[chartarget] <= 0)
                {
                    hpdiff = abs(global.hp[chartarget] - (global.maxhp[chartarget] / 2));
                    doomtype = 4;
                    global.hp[chartarget] = round(-global.maxhp[chartarget] / 2);
                    scr_dead(target);
                }
            }
            dmgwriter = instance_create(global.charinstance[target].x, (global.charinstance[target].y + global.charinstance[target].myheight) - 24, obj_dmgwriter);
            dmgwriter.damage = hpdiff;
            dmgwriter.type = doomtype;
        }
        if (target == 3)
        {
            for (hpi = 0; hpi < 3; hpi += 1)
            {
                chartarget = global.char[hpi];
                if (global.hp[chartarget] >= 0)
                {
                    if (global.charaction[hpi] == 10)
                    {
                        global.hp[chartarget] -= ceil(tdamage / 2);
                    }
                    else
                    {
                        global.hp[chartarget] -= tdamage;
                    }
                    if (global.hp[chartarget] <= 0)
                    {
                        global.hp[chartarget] = round(-global.maxhp[0] / 2);
                    }
                }
            }
        }
        global.inv = global.invc * 40;
        scr_damage_check();
        gameover = 1;
        if (global.char[0] != 0 && global.hp[global.char[0]] > 0)
        {
            gameover = 0;
        }
        if (global.char[1] != 0 && global.hp[global.char[1]] > 0)
        {
            gameover = 0;
        }
        if (global.char[2] != 0 && global.hp[global.char[2]] > 0)
        {
            gameover = 0;
        }
        if (gameover == 1)
        {
            scr_gameover();
        }
    }
}
`,lerp_ease_inout:`function lerp_ease_inout(arg0, arg1, arg2, arg3)
{
    return lerp(arg0, arg1, scr_ease_inout(arg2, arg3));
}
`,scr_monsterattacknamecount:`function scr_monsterattacknamecount(arg0)
{
    __sameattack = 0;
    for (_sameattacki = 0; _sameattacki < 3; _sameattacki++)
    {
        if (global.monsterattackname[_sameattacki] == arg0 && global.monster[_sameattacki] == 1)
        {
            __sameattack++;
        }
    }
    return __sameattack;
}
`,scr_lerpvar_instance:`function scr_lerpvar_instance()
{
    __lerpvar = instance_create(0, 0, obj_lerpvar);
    __lerpvar.target = argument[0];
    __lerpvar.varname = argument[1];
    __lerpvar.pointa = argument[2];
    __lerpvar.pointb = argument[3];
    __lerpvar.maxtime = argument[4];
    if (argument_count >= 6)
    {
        __lerpvar.easetype = argument[5];
    }
    if (argument_count >= 7)
    {
        __lerpvar.easeinout = argument[6];
    }
    return __lerpvar;
}
`,scr_ease_inout:`function scr_ease_inout(arg0, arg1)
{
    if (arg1 < -3 || arg1 > 7)
    {
        return arg0;
    }
    if (arg1 == -3)
    {
        return ease_inout_bounce(arg0, 0, 1, 1);
    }
    else if (arg1 == -2)
    {
        return ease_inout_elastic(arg0, 0, 1, 1);
    }
    else if (arg1 == -1)
    {
        return ease_inout_back(arg0, 0, 1, 1);
    }
    else if (arg1 == 1)
    {
        return -0.5 * cos((pi * arg0) - 1);
    }
    else if (arg1 == 0)
    {
        return arg0;
    }
    arg0 *= 2;
    if (arg0 < 1)
    {
        return 0.5 * scr_ease_in(arg0, arg1);
    }
    else
    {
        arg0--;
        return 0.5 * (scr_ease_out(arg0, arg1) + 1);
    }
}
`,ease_out_back:`function ease_out_back(arg0, arg1, arg2, arg3)
{
    var _s = 1.70158;
    arg0 = (arg0 / arg3) - 1;
    return (arg2 * ((arg0 * arg0 * (((_s + 1) * arg0) + _s)) + 1)) + arg1;
}
`,ease_in_back:`function ease_in_back(arg0, arg1, arg2, arg3)
{
    var _s = 1.70158;
    arg0 /= arg3;
    return (arg2 * arg0 * arg0 * (((_s + 1) * arg0) - _s)) + arg1;
}
`,scr_damage_cache:`function scr_damage_cache()
{
    global.damage_cache = [];
    for (var i = 0; i < 3; i++)
    {
        global.damage_cache[array_length(global.damage_cache)] = global.hp[global.char[i]];
    }
}

function scr_damage_check()
{
    if (!variable_global_exists("damage_cache"))
    {
        global.damage_cache = [];
    }
    var took_damage = false;
    for (var i = 0; i < array_length(global.damage_cache); i++)
    {
        var hp_cache = global.damage_cache[i];
        if (global.hp[global.char[i]] < hp_cache)
        {
            took_damage = true;
            break;
        }
    }
    if (took_damage)
    {
        with (obj_event_manager)
        {
            trigger_event(UnknownEnum.Value_1);
        }
    }
}

enum UnknownEnum
{
    Value_1 = 1
}
`};function zt(e,t,n,r){return e/=r,e<.36363636363636365?n*(7.5625*e*e)+t:e<.7272727272727273?(e-=.5454545454545454,n*(7.5625*e*e+.75)+t):e<.9090909090909091?(e-=.8181818181818182,n*(7.5625*e*e+.9375)+t):(e-=.9545454545454546,n*(7.5625*e*e+.984375)+t)}function Bt(e,t,n,r){return n-zt(r-e,0,n,r)+t}function Vt(e,t,n,r){return e<r*.5?Bt(e*2,0,n,r)*.5+t:zt(e*2-r,0,n,r)*.5+n*.5+t}function Ht(e,t,n,r){let i,a=0,o=n;return e===0||o===0?t:(e/=r,e===1?t+n:(a||=r*.3,o<Math.abs(n)?(o=n,i=a*.25):i=a/(2*Math.PI)*Math.asin(n/o),o*2**(-10*e)*Math.sin((e*r-i)*(2*Math.PI)/a)+n+t))}function Ut(e,t,n,r){let i,a=0,o=n;return e===0||o===0?t:(e/=r,e===1?t+n:(a===0&&(a=r*.3),o<Math.abs(n)?(o=n,i=a*.25):i=a/(2*Math.PI)*Math.asin(n/o),--e,-(o*2**(10*e)*Math.sin((e*r-i)*(2*Math.PI)/a))+t))}function Wt(e,t,n,r){let i,a=0,o=n;return e===0||o===0?t:(e/=r*.5,e===2?t+n:(a||=r*.44999999999999996,o<Math.abs(n)?(o=n,i=a*.25):i=a/(2*Math.PI)*Math.asin(n/o),e<1?(--e,-.5*(o*2**(10*e)*Math.sin((e*r-i)*(2*Math.PI)/a))+t):(--e,o*2**(-10*e)*Math.sin((e*r-i)*(2*Math.PI)/a)*.5+n+t)))}function Gt(e,t,n,r){return e=e/r-1,n*(e*e*(2.70158*e+1.70158)+1)+t}function Kt(e,t,n,r){let i=1.70158;return e/=r,e*=2,e<1?(i*=1.525,n*.5*(e*e*((i+1)*e-i))+t):(e-=2,i*=1.525,n*.5*(e*e*((i+1)*e+i)+2)+t)}function qt(e,t){if(t<-3||t>7)return e;switch(t){case-3:return zt(e,0,1,1);case-2:return Ht(e,0,1,1);case-1:return Gt(e,0,1,1);case 0:return e;case 1:return Math.sin(e*1.5707963267948966);case 2:return-e*(e-2);case 6:return-(2**(-10*e))+1;case 7:return--e,Math.sqrt(1-e*e);default:return--e,t===4?-1*(e**+t-1):e**+t+1}}function K(e,t){if(t<-3||t>7)return e;switch(t){case-3:return Bt(e,0,1,1);case-2:return Ut(e,0,1,1);case-1:return e*e*(2.70158*e-1.70158);case 0:return e;case 1:return-Math.cos(e*1.5707963267948966)+1;case 6:return 2**(10*(e-1));case 7:return-(Math.sqrt(1-e*e)-1);default:return e**+t}}function Jt(e,t){return t<-3||t>7?e:t===-3?Vt(e,0,1,1):t===-2?Wt(e,0,1,1):t===-1?Kt(e,0,1,1):t===1?-.5*Math.cos(Math.PI*e-1):t===0?e:(e*=2,e<1?.5*K(e,t):(--e,.5*(qt(e,t)+1)))}var Yt=(e,t,n)=>e+(t-e)*n,Xt=(e,t,n,r)=>Yt(e,t,qt(n,r)),Zt=(e,t,n,r)=>Yt(e,t,K(n,r)),Qt=(e,t,n,r)=>Yt(e,t,Jt(n,r));function $t(e){return[{name:`obj_doom`,index:1101,depth:0,visible:!1,events:{alarm0:(e,t)=>{let n=t.byId(e.target);n&&t.destroy(n),t.destroy(e)}}},{name:`obj_afterimage_cut`,index:211,depth:0,events:{create:(e,t)=>{e.faderate=.1,e.siner=0,e.sprite=`spr_whitepx`,e.imageSpeed=0,t.userEvent(e,0),e.flash=!1},user0:(e,t)=>{let n=t.bank.get(e.sprite);e.width=n?.width??0,e.height=n?.width??0,e.xo=n?.originX??0,e.yo=n?.originY??0},draw:(e,t)=>{if(e.flash){t.drawSpriteFog(e.sprite,e.imageIndex,e.x,e.y,e.imageXscale,e.imageYscale,e.imageAngle,M.white,e.imageAlpha),e.flash=!1;return}e.siner+=1;let n=e.width/2,r=e.height/2,i=Xt(0,t.spriteHeight(e)/2,(e.siner+2)/10,1);e.imageAlpha-=e.faderate;let a=e.xo*e.imageXscale/2,o=e.yo*e.imageYscale/2,s=(i,s,c,l)=>t.drawSpritePart(e.sprite,e.imageIndex,i,s,n,r,e.x+c-a,e.y+l-o,e.imageXscale,e.imageYscale,e.imageBlend,e.imageAlpha);s(0,0,-i,-i),s(n,0,i,-i),s(0,r,-i,i),s(n,r,i,i),U(e.imageAlpha,0)&&t.destroy(e)}}},{name:`obj_lerpvar`,index:929,depth:0,events:{create:e=>{Object.assign(e,{variable:0,varname:`variable`,pointa:0,pointb:0,time:0,maxtime:30,target:-1,init:0,easetype:0,easeinout:`out`})},step:(e,t)=>{let n=t.byId(e.target);if(!n){t.destroy(e);return}let r=u(e.varname);e.init===0&&(typeof e.pointa==`string`&&(e.pointa=n[r]),e.init=1),e.time+=1;let i=e.time/e.maxtime;e.easetype===0?n[r]=e.pointa+(e.pointb-e.pointa)*i:(e.easeinout===`out`&&(n[r]=Xt(e.pointa,e.pointb,i,e.easetype)),e.easeinout===`in`&&(n[r]=Zt(e.pointa,e.pointb,i,e.easetype)),e.easeinout===`inout`&&(n[r]=Qt(e.pointa,e.pointb,i,e.easetype))),O(e.time,e.maxtime)&&t.destroy(e)}}},{name:`obj_basicbullet_sneo`,index:597,parent:e(`obj_collidebullet`),sprite:`spr_sneo_bullet0`,depth:0,events:{create:(t,n)=>{B(t),t.element=6,t.fluffyguarddestroysthis=1,t.f=2,t.destroyable=0,t.angle_speed=0,t.destroypoints=1;let r=n.first(e(`obj_spamton_neo_enemy`));r&&(t.damage=n.globals.monsterat[r.myself]*5),t.grazepoints=3},step:(e,t)=>{(O(e.x,t.room.width+100)||_(e.x,-100)||O(e.y,t.room.height+100)||_(e.y,-100))&&t.destroy(e),e.direction+=e.angle_speed,e.imageAngle=e.direction}},collisions:[{target:e(`obj_yheart_shot`),run:(t,n,r)=>{if(t.destroyable===1){n.big===0&&r.userEvent(n,0);let i=r.create(e(`obj_yshot_anim`),t.x,t.y);t.anim=i.id,i.imageXscale=t.imageXscale,i.imageYscale=t.imageYscale,i.sprite=`spr_yheart_shot_hit3`,r.destroy(t)}else t.destroyable===-1&&r.userEvent(n,0)}}]}]}function en(e,t,n,r){let i=e.create(t(`obj_doom`),0,0);return i.depth=0,i.alarm[0]=r,i.target=n,i}function q(e,t,n){let r=t.create(n(`obj_afterimage_cut`),e.x,e.y);return e.afterimage=r.id,r.sprite=e.sprite,r.imageIndex=e.imageIndex,r.imageBlend=e.imageBlend,r.imageSpeed=0,r.depth=e.depth,r.imageXscale=e.imageXscale,r.imageYscale=e.imageYscale,r.imageAngle=e.imageAngle,t.userEvent(r,0),r}function tn(e,t,n,r,i,a,o,s,c){let l=t.create(n(`obj_lerpvar`),0,0);return e.__lerpvar=l.id,l.target=e.id,l.varname=r,l.pointa=i,l.pointb=a,l.maxtime=o,s!==void 0&&(l.easetype=s),c!==void 0&&(l.easeinout=c),e.___lerpvar=l.id,l}function nn(e){let t=(t,n)=>t.first(e(n));function n(t,n){if(t.destroyable!==1)return;let r=n.byId(t.hitshot);if(!r)throw Error(`NEO flying head requires its hitshot`);t.bighead&&r.big===0?(R(n,`snd_bell`,.7+n.random.random(.1),.8),r.x-=Math.abs(r.hspeed),r.hspeed=-8,r.vspeed=n.random.choose(-8,8,10,-10),en(n,e,r.id,90)):(r.big===0&&n.userEvent(r,0),n.sourceAudio?.volume(`snd_bomb`,.7,0),R(n,`snd_bomb`,1.1+n.random.random(.2),.7),q(t,n,e).flash=!0,n.destroy(t))}let r={name:`obj_sneo_lilguy`,index:607,parent:e(`obj_collidebullet`),sprite:`spr_sneo_crew`,depth:0,events:{create:(e,n)=>{B(e),Object.assign(e,{element:6,f:2,destroyable:0,angle_speed:0,yellowsiner:0,loop:0,loopy1:90,loopy2:240,falsevspeed:0,bighitbox:0,bighead:0,angleadjust:0,active:1,altdir:0,altspeed:0,altfriction:0,altgravity:0,changedirection:0,bulletspeed:8,imageSpeed:0,cutscene:0});let r=t(n,`obj_spamton_neo_enemy`);r&&(e.damage=n.globals.monsterat[r.myself]*5);let i=t(n,`obj_sneo_bulletcontroller`);i&&(e.target=i.target),e.grazepoints=2},step:(t,n)=>{t.cutscene===0&&(O(t.x,n.view.x+1e3)||_(t.x,n.view.x-200)||O(t.y,n.view.y+600)||_(t.y,n.view.y-200))&&n.destroy(t),t.direction+=t.angle_speed,t.angleadjust===1&&(t.imageAngle=t.direction),t.destroyable===1&&(t.yellowsiner++,t.imageBlend=o(15245824,M.aqua,.25+Math.sin(t.yellowsiner/3)*.25)),t.loop===1&&(U(t.y,t.loopy1)&&(t.y=t.loopy2-(t.loopy1-t.y)),t.y>t.loopy2&&(t.y=t.loopy1+(t.y-t.loopy2))),t.y+=t.falsevspeed,t.bighitbox===1&&(t.hitshot=n.all(e(`obj_yheart_shot`)).find(e=>Ee(n.bank,e,t.x,t.y,t.x+n.spriteWidth(t),t.y+n.spriteHeight(t),!0))?.id??-4,t.hitshot!==-4&&n.userEvent(t,0))},draw:(e,t)=>t.drawSelf(e),alarm0:e=>{e.changedirection&&(e.direction=e.altdirection,e.gravity=e.altgravity,e.friction=e.altfriction,e.speed=e.altspeed)},alarm1:(n,r)=>{let i=t(r,`obj_heart`);if(i){let t=r.create(e(`obj_sneo_lilguy_bullet`),n.x,n.y+12);n.bullet=t.id,t.bulletspeed=n.bulletspeed,t.depth=n.depth-1,c(t,i.x+8,i.y+8,t.bulletspeed)}n.imageIndex=2,n.imageSpeed=1},alarm2:e=>{e.imageIndex=1},animationEnd:e=>{e.cutscene===0&&(e.imageSpeed=0)},user0:n},collisions:[{target:e(`obj_yheart_shot`),run:(e,n,r)=>{e.hitshot=n.id,r.userEvent(e,0);let i=t(r,`obj_spamton_neo_enemy`);if(!i)throw Error(`NEO flying head collision requires its enemy`);ge(r,i.difficulty===3?1:1.3)}}]};function i(e,t){e.alarm[0]=44,e.alarm[1]=40,e.alarm[2]=32,e.destroyable=1,t&&(e.gravityDirection=90)}return[{name:`obj_sneo_guymaker`,index:603,parent:e(`obj_bulletparent`),sprite:`spr_sneo_bullet_crew`,depth:0,visible:!1,events:{create:(n,r)=>{let i=t(r,`obj_spamton_neo_enemy`);if(!i)throw Error(`NEO head maker requires its enemy`);n.type=[1,2,3,4][i.difficulty]??4,r.exists(e(`obj_sneo_heartattack`))&&(n.type=5),i.difficulty===6&&(n.type=6),i.difficulty===7&&(n.type=7),Object.assign(n,{timer:0,prevrow:0,row:0,prevrowy:0,spawncount:0,firstspawn:0})},alarm0:(e,t)=>t.destroy(e),step:(t,n)=>{if(t.xx=n.view.x,t.yy=n.view.y,t.timer++,[1,2,3,4,5,6,7].includes(t.type)){if(t.timer===1){if(t.type===1&&(t.row=n.random.choose(0,1),t.prevrow===2&&(t.row=n.random.choose(0,1))),t.type===2){let e=n.random.choose(0,1,2);t.prevrowy===0&&(e=n.random.choose(1,2)),t.prevrowy===1&&(e=n.random.choose(0,2)),t.prevrowy===2&&(e=n.random.choose(0,1)),t.rowy=t.yy+210-46*e,t.prevrowy=e,t.row=2}(t.type===3||t.type===4)&&(t.rowy=t.yy+210-40*n.random.choose(0,1),t.row=n.random.choose(0,1,3,6),t.prevrow===2&&(t.row=n.random.choose(0,1,3,6)),t.prevrow===3&&(t.row=n.random.choose(0,1)),t.row===3&&t.firstspawn===0&&(t.row=n.random.choose(0,1)),t.firstspawn=1),t.type===5&&(t.rowy=t.yy+210-40*n.random.choose(0,1,2),t.row=n.random.choose(0,1,2,2,3,6),t.prevrow===2&&(t.row=n.random.choose(0,1,3,6)),t.prevrow===3&&(t.row=n.random.choose(0,1,2))),t.type===6&&(t.row=6),t.type===7&&(t.row=7)}if([5,10,15,20].includes(t.timer)){if([0,1,2].includes(t.row)){let r=n.create(e(`obj_sneo_lilguy`),t.xx+700,t.yy+280);t.guy=r.id,r.hspeed=-18,r.friction=-.1,r.vspeed=-2,i(r,!1),r.gravity=.5,r.gravityDirection=0,Object.assign(r,{imageBlend:15245824,changedirection:0,altdirection:0,altspeed:4,altfriction:-.2,altgravity:0}),t.row===1&&(r.y-=240,r.vspeed=-r.vspeed),t.row===2&&(r.y-=120,r.vspeed=0,r.hspeed=-21),t.row===2&&t.type===2&&(r.hspeed=-21,r.gravity=0,r.friction=.5,r.alarm[0]=36,r.changedirection=1,r.altdirection=r.direction),[2,3,4,5].includes(t.type)&&t.row===2&&(r.y=t.rowy)}if(t.row===3&&t.timer!==20)for((!(`guy`in t)||!Array.isArray(t.guy))&&(t.guy=[]),t.guyi=0;t.guyi<2;t.guyi++){let r=t.guyi,a=n.create(e(`obj_sneo_lilguy`),t.xx+300,t.yy-40+400*r);t.guy[r]=a.id,a.vspeed=18-36*r,i(a,!0),a.gravity=.8-1.6*r}if(t.row===6&&t.timer===5){t.spawncount=2;for(let r=0;r<t.spawncount;r++){let a=n.create(e(`obj_sneo_lilguy`),t.xx+410+r*70,t.yy-20);t.guy=a.id,a.vspeed=15,i(a,!0),a.alarm[1]=30,a.gravity=.53;let o=n.create(e(`obj_sneo_lilguy`),t.xx+445+r*70,t.yy+380);t.guy=o.id,o.vspeed=-15,i(o,!0),o.gravity=-.53}}if(t.row===7&&t.timer!==20)throw Error(`NEO flying head developer path_sneo_head_path1 is not ported`)}t.type===2&&t.timer>=41&&(t.timer=0),[3,5,6].includes(t.type)&&t.timer>=69&&(t.timer=0),t.type===4&&t.timer>=50&&(t.timer=0),t.timer>=50&&(t.timer=0),t.timer===0&&(t.prevrow=t.row)}}}},r,{name:`obj_sneo_lilguy_bullet`,index:623,parent:e(`obj_basicbullet_sneo`),sprite:`spr_sneo_crew_bullet`,depth:0,events:{step:(e,t)=>{(O(e.x,t.room.width+100)||_(e.x,-100)||O(e.y,t.room.height+100)||_(e.y,-100))&&t.destroy(e),e.imageAngle+=36}}}]}var rn=[...kt,...At,...jt,...Mt,...Nt,...Pt,...Ft,...It,Lt],an=[0,1,1.5,6,8.5,9,12];function on(e){let t={},n={...e,scripts:{...Rt,...e.scripts},object:n=>t[n]??e.object(n)};for(let e of rn)t[e.metadata.name]=G(n,e.metadata,e.sources);let r=Ot({get neo(){return n.object(`obj_spamton_neo_enemy`)},get heart(){return n.object(`obj_heart`)},faceAttack:t.obj_sneo_faceattack,finalForm:t.obj_sneo_final_forme,wireheart:t.obj_sneo_wireheart}).collisions,i={obj_basicbullet_sneo:r.basicBullet,obj_basicbullet_sneo_finale:r.basicBullet,obj_sneo_lilguy:r.flyingHead,obj_sneo_wireheart:r.wireheart,obj_sneo_faceattack:r.facePart};for(let[e,r]of Object.entries(i)){let i=t[e],a=Object.getOwnPropertyDescriptor(i,`collisions`)?.get;Object.defineProperty(i,"collisions",{configurable:!0,get:()=>{let e=a?.call(i)??[],t=n.object(`obj_yheart_shot`);return[...e.filter(e=>e.target!==t),{target:t,run:r}]}})}let a=t.obj_sneo_bulletcontroller,o=a.events.step;return a.events.step=(e,t)=>{if(!an.includes(e.type))throw Error(`Spamton NEO controller type ${e.type} is outside the NORMAL source route`);o(e,t)},t}var sn={obj_ch2_sceneex2:{metadata:{index:1004,name:`obj_ch2_sceneex2`,parent:null,sprite:`spr_event`,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`con++;
`,Create_0:`drawblack = 2;
drawtrack = 1;
trackx = 0;
tracky0 = 180;
tracky1 = 240;
tracky2 = 300;
fightmode = 0;
trackspeed = 0;
trackaccel = 0;
trackspeedmax = 0;
cityscapefade = 0;
cityscape_active = false;
cityscape_speed = 0;
cityscape_alpha = 0;
init = 0;
con = -1;
customcon = 0;
timer = 0;
sneo_x_save = 0;
sneo_y_save = 0;
shortened = false;
special_scene = false;
rudebuster = false;
sneo_fly = false;
sneo_release = false;
forcend = 0;
shop_spamton_bg_con = 0;
shop_spamton_bg_timer = 0;
cityscape_speed_max = 5;
if (global.chapter != 2 || global.flag[309] < 8)
{
}
else
{
    if (global.tempflag[32] == 1)
    {
        shortened = true;
    }
    start_xpos = shortened ? (x + 100) : x;
    con = 1;
    scr_losechar();
    if (instance_exists(obj_caterpillarchara))
    {
        instance_destroy(obj_caterpillarchara);
    }
    coaster_marker_kris = scr_dark_marker(0, cameray() - 500, spr_sneo_car_empty);
    with (coaster_marker_kris)
    {
        scr_depth();
    }
    coaster_marker_ra = scr_dark_marker(0, cameray() - 500, spr_sneo_car_empty);
    with (coaster_marker_ra)
    {
        scr_depth();
    }
    coaster_marker_su = scr_dark_marker(0, cameray() - 500, spr_sneo_car_empty);
    with (coaster_marker_su)
    {
        scr_depth();
    }
    coaster_kris = instance_create(0, cameray() - 500, obj_coaster);
    coaster_kris.depth = 90000;
    coaster_kris.visible = 0;
    coaster_susie = instance_create(0, cameray() - 500, obj_coaster);
    coaster_susie.type = 1;
    coaster_susie.depth = 80000;
    coaster_susie.character_sprite = spr_susie_shock;
    coaster_susie.visible = 0;
    coaster_ralsei = instance_create(0, cameray() - 500, obj_coaster);
    coaster_ralsei.type = 2;
    coaster_ralsei.depth = 70000;
    coaster_ralsei.character_sprite = spr_ralsei_hurt_fixed;
    coaster_ralsei.visible = 0;
    loop_tiles = false;
    bg_loop = layer_get_id("BG_Loop");
    whiteall = scr_dark_marker(-10, -10, spr_pixel_white);
    whiteall.image_xscale = 999;
    whiteall.image_yscale = 999;
    whiteall.depth = 0;
    whiteall.image_alpha = 0;
}
`,Draw_0:`depth = 99000;
if (i_ex(obj_encounterbasic))
{
    fightmode = 1;
}
if (drawblack == 1 && fightmode == 0)
{
    draw_set_color(c_black);
    draw_rectangle(1630, -10, 2500, 500, false);
}
if (drawtrack == 1)
{
    trackx += trackspeed;
    if ((trackx + 640) < camerax())
    {
        trackx += 640;
    }
    if ((trackx - 640) > camerax())
    {
        trackx -= 640;
    }
    draw_sprite_ext(spr_sneo_track, 0, trackx - 640, tracky0, 2, 2, 0, c_white, image_alpha);
    draw_sprite_ext(spr_sneo_track, 0, trackx, tracky0, 2, 2, 0, c_white, image_alpha);
    draw_sprite_ext(spr_sneo_track, 0, trackx + 640, tracky0, 2, 2, 0, c_white, image_alpha);
    draw_sprite_ext(spr_sneo_track, 0, trackx - 640, tracky1, 2, 2, 0, c_white, image_alpha);
    draw_sprite_ext(spr_sneo_track, 0, trackx, tracky1, 2, 2, 0, c_white, image_alpha);
    draw_sprite_ext(spr_sneo_track, 0, trackx + 640, tracky1, 2, 2, 0, c_white, image_alpha);
    draw_sprite_ext(spr_sneo_track, 0, trackx - 640, tracky2, 2, 2, 0, c_white, image_alpha);
    draw_sprite_ext(spr_sneo_track, 0, trackx, tracky2, 2, 2, 0, c_white, image_alpha);
    draw_sprite_ext(spr_sneo_track, 0, trackx + 640, tracky2, 2, 2, 0, c_white, image_alpha);
    if (scr_debug())
    {
    }
    draw_set_color(c_black);
    draw_rectangle(0, 200, 80, 420, false);
}
if (drawblack == 2 && fightmode == 0)
{
    draw_set_color(c_black);
    draw_rectangle(1640, -10, 2500, 500, false);
}
if (cityscape_active)
{
    if (cityscape_alpha < 1)
    {
        cityscape_alpha = lerp(cityscape_alpha, 1, 0.2);
    }
    if (cityscapefade == 1)
    {
        cityscape_alpha = 0;
    }
    cityscape_speed -= cityscape_speed_max;
    if (cityscape_speed_max < 0 && cityscape_speed > -398)
    {
        cityscape_speed -= 398;
    }
    scr_draw_sprite_tiled_area(bg_dw_mansion_basement_cityscape_background, 0, camerax() + cityscape_speed, cameray(), camerax() + cityscape_speed, cameray(), camerax() + view_wport[0], cameray() + (sprite_get_height(bg_dw_mansion_basement_cityscape_background) * 2), 2, 2, c_white, cityscape_alpha);
    scr_draw_sprite_tiled_area(bg_dw_mansion_basement_cityscape_midground, 0, camerax() + (cityscape_speed * 1.1), cameray(), camerax() + (cityscape_speed * 1.1), cameray(), camerax() + view_wport[0], cameray() + (sprite_get_height(bg_dw_mansion_basement_cityscape_midground) * 2), 2, 2, c_white, cityscape_alpha);
    scr_draw_sprite_tiled_area(bg_dw_mansion_basement_cityscape_foreground, 0, camerax() + (cityscape_speed * 1.2), cameray(), camerax() + (cityscape_speed * 1.2), cameray(), camerax() + view_wport[0], cameray() + (sprite_get_height(bg_dw_mansion_basement_cityscape_foreground) * 2), 2, 2, c_white, cityscape_alpha);
    if (shop_spamton_bg_con > 1)
    {
        if (cityscapefade == 1)
        {
            cityscape_alpha = 0.15;
        }
        scr_draw_sprite_tiled_area(spr_shop_spamton_bg_battle, 0, camerax() + cityscape_speed, cameray(), camerax() + cityscape_speed, cameray(), camerax() + view_wport[0], cameray() + (sprite_get_height(bg_dw_mansion_basement_cityscape) * 2), 1.6708, 1.195, c_white, cityscape_alpha);
    }
    if (shop_spamton_bg_con == 1 && !i_ex(obj_writer) && !i_ex(obj_battleblcon))
    {
        shop_spamton_bg_timer++;
        if (shop_spamton_bg_timer == 1)
        {
            snd_play(snd_petrify);
        }
        if (shop_spamton_bg_timer == 23)
        {
            shop_spamton_bg_con = 2;
        }
    }
    if (shop_spamton_bg_con == 2)
    {
        shop_spamton_bg_timer--;
        if (shop_spamton_bg_timer == 0)
        {
            shop_spamton_bg_con = 3;
            with (obj_spamton_neo_enemy)
            {
                targetbgspeed = 5;
            }
        }
    }
    if (shop_spamton_bg_con > 0 && shop_spamton_bg_con < 3)
    {
        scr_draw_sprite_tiled_area(spr_whitepixel, 0, camerax() + cityscape_speed, cameray(), camerax() + cityscape_speed, cameray() - 2, camerax() + view_wport[0], (cameray() - 2) + (sprite_get_height(bg_dw_mansion_basement_cityscape) * 2), 396, 8, c_white, shop_spamton_bg_timer / 20);
    }
}
`,mus_Alarm_0:`con++;
`,mus_Create_0:`con = -1;
customcon = 0;
if (global.chapter != 2 || global.flag[309] >= 8 || scr_keyitemcheck(11) == 0)
{
    instance_destroy();
}
else if (!snd_is_playing(global.currentsong[1]))
{
    global.currentsong[0] = snd_init("spamton_neo_meeting.ogg");
    global.currentsong[1] = mus_loop_ext(global.currentsong[0], 1, 1);
    audio_sound_gain(global.currentsong[0], 0.5, 0);
}
`,mus_Step_0:`if (con == -1)
{
    var offset = 0;
    if (obj_mainchara.press_l == 1)
    {
        offset = -0.003;
    }
    else if (obj_mainchara.press_r == 1)
    {
        offset = 0.003;
    }
    if (offset != 0)
    {
        var gain = clamp(audio_sound_get_gain(global.currentsong[0]) + offset, 0.5, 1);
        audio_sound_gain(global.currentsong[0], gain, 0);
    }
}
if (con == 10)
{
    con = 99;
    alarm[0] = 10;
    snd_play(snd_noise);
    snd_free(global.currentsong[0]);
}
if (con == 100)
{
    con = 111;
    audio_stop_all();
    snd_free_all();
}
`,special_Alarm_4:`con++;
`,special_Create_0:`con = 1;
init = 0;
`,special_Draw_0:`if (init == 1)
{
    init = 2;
    input_timer = 0;
}
if (instance_exists(obj_heart))
{
    var presstext;
    if (obj_heart.color == 1)
    {
        if (con < 19)
        {
            presstext = stringsetloc("PRESS ", "obj_ch2_sceneex2_special_slash_Draw_0_gml_16_0");
            if (!i_ex(obj_yheart_shot))
            {
                input_timer++;
            }
            else
            {
                input_timer = 0;
            }
        }
        if (con >= 19)
        {
            presstext = stringsetloc("HOLD  ", "obj_ch2_sceneex2_special_slash_Draw_0_gml_23_0");
            var bigcheck = 0;
            with (obj_yheart_shot)
            {
                if (big == 1)
                {
                    bigcheck = 1;
                }
            }
            if (obj_heart.z_hold >= 40)
            {
                presstext = stringsetloc("RELEASE ", "obj_ch2_sceneex2_special_slash_Draw_0_gml_27_0");
            }
            if (bigcheck == 0)
            {
                input_timer++;
            }
            else
            {
                input_timer = 0;
            }
        }
    }
    if (input_timer >= 240)
    {
        draw_set_color(c_white);
        scr_84_set_draw_font("main");
        if (global.is_console || obj_gamecontroller.gamepad_active)
        {
            if (global.lang == "en")
            {
                draw_set_alpha((sin(input_timer / 8) * 0.1) + 0.8);
                draw_sprite_ext(scr_getbuttonsprite(global.input_g[4], false), 0, obj_heart.x + 26, obj_heart.y - 26, 2, 2, 0, c_white, 1);
                draw_text(obj_heart.x - 30, obj_heart.y - 20, presstext);
            }
            else
            {
                draw_set_alpha((sin(input_timer / 8) * 0.1) + 0.8);
                draw_sprite_ext(scr_getbuttonsprite(global.input_g[4], false), 0, obj_heart.x - 26, obj_heart.y - 32, 2, 2, 0, c_white, 1);
                draw_text(obj_heart.x + 8, obj_heart.y - 26, presstext);
            }
        }
        else
        {
            var buttontext = stringsetsubloc("~1", scr_get_input_name(4), "obj_ch2_sceneex2_special_slash_Draw_0_gml_39_0");
            draw_set_alpha((sin(input_timer / 8) * 0.1) + 0.8);
            draw_text(obj_heart.x - 30, obj_heart.y - 20, presstext + buttontext);
        }
        draw_set_alpha(1);
    }
}
`,special_Step_0:`if (init == 0)
{
    if (scr_debug())
    {
        global.interact = 1;
    }
    init = 1;
    input_timer = 0;
}
if (con == 1)
{
    snd_play(snd_spamton_laugh);
    snd_play_pitch(snd_spamton_laugh, 0.8);
    for (i = 0; i < 3; i++)
    {
        enemyrow[0][i] = instance_create(camerax() + 760 + (60 * i), cameray() + 100, obj_sneo_lilguy);
        enemyrow[0][i].mei = i;
    }
    for (i = 0; i < 9; i++)
    {
        enemyrow[1][i] = instance_create(camerax() + 840 + (40 * i), cameray() + 180, obj_sneo_lilguy);
        enemyrow[1][i].mei = i;
    }
    for (i = 0; i < 3; i++)
    {
        enemyrow[2][i] = instance_create(camerax() + 760 + (60 * i), cameray() + 280, obj_sneo_lilguy);
        enemyrow[2][i].mei = i;
    }
    with (obj_sneo_lilguy)
    {
        destroyable = 1;
        cutscene = 1;
        image_speed = 2;
        hspeed = -20;
        _cutsceneremy = y;
    }
    with (enemyrow[1][0])
    {
        image_xscale *= 2;
        image_yscale *= 2;
        x -= 40;
        bighead = 1;
    }
    con = 2;
}
if (con == 2)
{
    if (enemyrow[0][0].x < (camerax() + 570))
    {
        with (obj_sneo_lilguy)
        {
            if (hspeed < -2)
            {
                hspeed += 1;
            }
            y = _cutsceneremy + random_range(-2, 2);
        }
    }
    if (enemyrow[0][0].x <= (camerax() + 240))
    {
        with (obj_sneo_lilguy)
        {
            speed = 0;
            friction = 0;
            image_speed = 0;
            image_index = 0;
            y = _cutsceneremy;
        }
        snd_play(snd_noise);
        blackall = scr_dark_marker(camerax(), cameray(), spr_whitepx_10);
        blackall.image_xscale = 70;
        blackall.image_yscale = 70;
        blackall.image_blend = c_black;
        blackall.depth = 100000;
        with (obj_marker)
        {
            visible = 0;
        }
        with (obj_actor)
        {
            image_alpha = 0.5;
        }
        with (obj_ch2_sceneex2)
        {
            drawtrack = 0;
        }
        con = 3;
        alarm[4] = 1;
    }
}
if (con == 4)
{
    var heartx = camerax() + 88;
    var hearty = cameray() + 95;
    heart = instance_create(heartx, hearty, obj_heart);
    heart.sprite_index = spr_dodgeheart_centered_white;
    heart.image_blend = c_red;
    heart.depth = -10;
    with (heart)
    {
        scr_oflash();
    }
    heart.canmove = 0;
    con = 5;
    alarm[4] = 60;
}
if (con == 6)
{
    tracknoise = snd_play(snd_spearrise);
    snd_pitch(tracknoise, 0.9);
    scr_lerpvar_instance(heart, "image_angle", 0, 90, 10, -1, "out");
    con = 7;
    alarm[4] = 20;
}
if (con == 8)
{
    snd_stop(tracknoise);
    con = 9;
    alarm[4] = 4;
}
if (con == 10)
{
    heart.image_blend = c_yellow;
    with (heart)
    {
        for (i = 0; i < 3; i++)
        {
            afterimage = instance_create(x, y, obj_afterimage_grow);
            afterimage.sprite_index = sprite_index;
            afterimage.image_blend = image_blend;
            afterimage.image_angle = image_angle;
            afterimage.xrate = 0.2 * i;
            afterimage.yrate = 0.2 * i;
            afterimage.image_alpha = 1 * i;
            afterimage.depth = depth + 1;
        }
        sprite_index = spr_yellowheart;
        image_blend = c_white;
        image_angle = 0;
        x -= 10;
        y -= 10;
        scr_oflash();
    }
    heart.canmove = 0;
    con = 11;
    alarm[4] = 60;
    snd_play_pitch(snd_great_shine, 0.8);
    snd_play_pitch(snd_great_shine, 1);
    snd_play_pitch(snd_closet_impact, 1.5);
    instance_create(0, 0, obj_shake);
}
if (con == 12)
{
    snd_play_pitch(snd_swing, 0.5);
    var goenemy = enemyrow[0][0];
    with (heart)
    {
        scr_move_to_point_over_time(goenemy.x - 80, goenemy.y - 10, 10);
    }
    con = 13;
    alarm[4] = 10;
}
if (con == 13)
{
    with (heart)
    {
        scr_afterimage();
    }
}
if (con == 14)
{
    snd_play(snd_impact);
    with (heart)
    {
        color = 1;
    }
    con = 15;
}
if (con == 15)
{
    if (!i_ex(enemyrow[0][2]))
    {
        con = 16;
        with (heart)
        {
            color = 0;
        }
        snd_play_pitch(snd_swing, 0.5);
        var goenemy = enemyrow[2][0];
        with (heart)
        {
            scr_move_to_point_over_time(goenemy.x - 80, goenemy.y - 10, 10);
        }
        alarm[4] = 10;
    }
}
if (con == 16)
{
    with (heart)
    {
        scr_afterimage();
    }
}
if (con == 17)
{
    snd_play(snd_impact);
    with (heart)
    {
        color = 1;
    }
    con = 18;
}
if (con == 18)
{
    if (!i_ex(enemyrow[2][2]))
    {
        con = 19;
        with (heart)
        {
            color = 0;
        }
        snd_play_pitch(snd_swing, 0.5);
        var goenemy = enemyrow[1][0];
        with (heart)
        {
            scr_move_to_point_over_time(goenemy.x - 110, goenemy.y - 10, 10);
        }
        alarm[4] = 10;
    }
}
if (con == 19)
{
    with (heart)
    {
        scr_afterimage();
    }
}
if (con == 20)
{
    snd_play(snd_impact);
    with (heart)
    {
        color = 1;
    }
    con = 22;
}
if (con == 22)
{
    if (!i_ex(obj_sneo_lilguy))
    {
        alarm[4] = 15;
        con = 29;
        with (heart)
        {
            color = 0;
        }
    }
}
if (con == 30)
{
    with (obj_spamton_neo_enemy)
    {
        x = camerax() + 400;
        y = cameray() + 80;
        partmode = 1;
        facing = 1;
        headforceframe = 1;
        gravity = 0;
        speed = 0;
    }
    snd_play(snd_noise);
    with (heart)
    {
        instance_destroy();
    }
    with (obj_yheart_shot)
    {
        instance_destroy();
    }
    with (blackall)
    {
        instance_destroy();
    }
    with (obj_ch2_sceneex2)
    {
        drawtrack = 1;
    }
    con = 40;
    instance_destroy();
}
`,Step_0:`if (init == 0)
{
    trackx = 0;
    init = 1;
}
if (con == 1 && obj_mainchara.x <= start_xpos)
{
    if (!shortened)
    {
        snd_play_pitch(snd_swing, 0.4);
        snd_play_pitch(snd_swing, 0.6);
        snd_play_pitch(snd_swing, 0.8);
    }
    con = 2;
    global.interact = 1;
    global.facing = 3;
    sneo = instance_create(obj_mainchara.x, -300, obj_spamton_neo_enemy);
    sneo.myself = 1;
    sneo.facing = -1;
    sneo.gravity = shortened ? 0 : 4;
    sneo.shadow_amount = shortened ? 0 : 1;
    sneo.partmode = 30;
}
if (con == 2)
{
    if (!shortened)
    {
        if (sneo.y >= (obj_mainchara.y - 120))
        {
            with (obj_camera_area)
            {
                instance_destroy();
            }
            with (obj_camera_advanced)
            {
                ignoreFreeze = 1;
                ignoreCutscene = 1;
            }
            snd_play(snd_hurt1);
            snd_play(snd_damage);
            with (sneo)
            {
                gravity = 0;
                vspeed = 0;
            }
            with (obj_mainchara)
            {
                fun = 1;
                sprite_index = spr_kris_dw_landed;
                image_speed = 0;
                hspeed = 18;
                friction = 0.8;
            }
            con = 4;
            alarm[0] = 30;
        }
    }
    else
    {
        with (obj_camera_area)
        {
            instance_destroy();
        }
        with (obj_camera_advanced)
        {
            ignoreFreeze = 1;
            ignoreCutscene = 1;
        }
        con = 5;
    }
}
if (con == 5)
{
    if (i_ex(obj_camera_advanced))
    {
        with (obj_camera_advanced)
        {
            instance_destroy();
        }
    }
    with (obj_mainchara)
    {
        cutscene = 1;
    }
    scr_getchar(2);
    scr_getchar(3);
    scr_makecaterpillar(obj_mainchara.x + 60, cameray() - 300, 2, 0);
    scr_makecaterpillar(obj_mainchara.x + 100, cameray() - 300, 3, 1);
    with (obj_caterpillarchara)
    {
        visible = 0;
    }
    coaster_empty1 = scr_dark_marker(-100, -100, spr_sneo_car_empty);
    with (coaster_empty1)
    {
        depth = 98900;
    }
    coaster_empty2 = scr_dark_marker(-100, -100, spr_sneo_car_empty);
    with (coaster_empty2)
    {
        depth = 98000;
    }
    coaster_empty3 = scr_dark_marker(-100, -100, spr_sneo_car_empty);
    with (coaster_empty3)
    {
        depth = 98000;
    }
    cutscene_master = scr_cutscene_make();
    scr_maincharacters_actors();
    con = 5.1;
}
if (con == 5.1 || scr_cutscene_loaded())
{
    con = 6;
    alarm[0] = 30;
    c_sel(su);
    c_setxy(camerax() - 200, 200);
    c_visible(0);
    c_sel(ra);
    c_setxy(camerax() - 200, 200);
    c_visible(0);
    if (shortened)
    {
        c_sel(su);
        c_facing("susieunhappy");
        c_setxy(300, 173);
        c_visible(1);
        c_walkdirect(680, 173, 35);
        c_sel(ra);
        c_facing("ralseiunhappy");
        c_setxy(300, 230);
        c_visible(1);
        c_walkdirect(640, 230, 35);
        c_wait(40);
    }
    else
    {
        c_pannable(1);
        c_panspeed_wait(-3, 0, 30);
        c_wait(30);
        c_sel(kr);
        c_autowalk(0);
        c_sprite(spr_kris_dw_landed);
        c_imageindex(0);
        c_imagespeed(0);
        c_var_instance(sneo, "shake_head", 1);
        c_wait(30);
        c_var_instance(sneo, "shake_head", 1);
        c_wait(30);
        c_var_instance(sneo, "shake_head", 1);
        c_wait(30);
        c_fadeout(5);
        c_wait(30);
        c_var_instance(sneo, "y", 115);
        c_var_instance(sneo, "partmode", 31);
        c_wait(60);
        c_sel(kr);
        c_setxy(830, 216);
        c_msgside("bottom");
        c_speaker("sneo");
        c_msgsetloc(0, "* HOLY [[Cungadero]] DO I FEEL GOOD .../%", "obj_ch2_sceneex2_slash_Step_0_gml_98_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 33);
        c_wait(1);
        c_var_lerp_instance(sneo, "shadow_amount", 1, 0, 30);
        c_var_instance(sneo, "partmode", 1);
        c_fadein(5);
        c_wait(5);
        c_mus("free_all");
        c_mus2("initloop", "spamton_neo_meeting.ogg", 0);
        c_mus2("pitch", 1.3, 0);
        c_speaker("sneo");
        c_msgsetloc(0, "* HERE I AM!^1! KRIS!!/%", "obj_ch2_sceneex2_slash_Step_0_gml_111_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 15);
        c_var_instance(sneo, "headforceframe", 2);
        c_speaker("sneo");
        c_msgsetloc(0, "* BIG/%", "obj_ch2_sceneex2_slash_Step_0_gml_119_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 16);
        c_var_instance(sneo, "headforceframe", 1);
        c_speaker("sneo");
        c_msgsetloc(0, "* BIG^1,/%", "obj_ch2_sceneex2_slash_Step_0_gml_127_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 17);
        c_var_instance(sneo, "headforceframe", 2);
        c_speaker("sneo");
        c_msgsetloc(0, "* [[BIGGER AND BETTER THAN EVER]]/%", "obj_ch2_sceneex2_slash_Step_0_gml_135_0");
        c_talk_wait();
        c_sel(kr);
        c_autowalk(1);
        c_facing("l");
        c_var_instance(sneo, "partmode", 1);
        c_var_instance(sneo, "headforceframe", 1);
        c_speaker("sneo");
        c_msgsetloc(0, "* HA HA HA ..^1. THIS POWER IS/%", "obj_ch2_sceneex2_slash_Step_0_gml_148_0");
        c_talk_wait();
        c_var_instance(sneo, "headforceframe", 0);
        c_speaker("sneo");
        c_msgsetloc(0, "* FREEDOM./%", "obj_ch2_sceneex2_slash_Step_0_gml_156_0");
        c_talk_wait();
        c_var_instance(sneo, "headforceframe", -1);
        c_speaker("sneo");
        c_msgsetloc(0, "* I WON'T HAVE TO BE^1 &* JUST A PUPPET^1 &* ANY MORE!!!!/", "obj_ch2_sceneex2_slash_Step_0_gml_163_0");
        c_msgnextloc("* .../%", "obj_ch2_sceneex2_slash_Step_0_gml_166_0");
        c_talk_wait();
        c_var_instance(sneo, "headforceframe", 0);
        c_var_instance(sneo, "facing", 1);
        c_speaker("sneo");
        c_msgsetloc(0, "* OR..^1. so..^1. I..^1. thought./%", "obj_ch2_sceneex2_slash_Step_0_gml_174_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 22);
        c_var_instance(sneo, "headforceframe", 2);
        c_speaker("sneo");
        c_msgsetloc(0, "* WHAT ARE THESE STRINGS!^1? &* WHY AM I NOT [BIG] ENOUGH!^1? &* It's still DARK..^1. SO DARK!/%", "obj_ch2_sceneex2_slash_Step_0_gml_183_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 1);
        c_var_instance(sneo, "facing", -1);
        c_var_instance(sneo, "headforceframe", 1);
        c_var_lerp_instance(sneo, "x", sneo.x, sneo.x + 200, 30, 2, "out");
        c_soundplay_x(snd_swing, 1, 0.5);
        c_wait(10);
        c_panspeed(8, 0, 24);
        c_sel(kr);
        c_autowalk(0);
        c_imagespeed(0.25);
        c_walk_wait("r", 8, 25);
        c_imagespeed(0);
        c_speaker("sneo");
        c_msgsetloc(0, "* KRIS./%", "obj_ch2_sceneex2_slash_Step_0_gml_209_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 21);
        c_var_lerp_instance(sneo, "x", sneo.x + 200, sneo.x + 430, 30, 2, "out");
        c_soundplay_x(snd_swing, 1, 0.5);
        c_wait(5);
        c_panspeed(10, 0, 24);
        c_autowalk(0);
        c_walk("r", 10, 25);
        c_imagespeed(0.25);
        c_wait(26);
        c_imagespeed(0);
        c_speaker("sneo");
        c_msgsetloc(0, "* KRIS^1. &* KRIS^1. &* KRIS./", "obj_ch2_sceneex2_slash_Step_0_gml_228_0");
        c_msgnextloc("* THAT'S RIGHT^1. &* YOU^1. &* I NEED YOU./%", "obj_ch2_sceneex2_slash_Step_0_gml_229_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 23);
        c_var_lerp_instance(sneo, "x", sneo.x + 430, sneo.x + 630, 15, 2, "out");
        c_var_instance(sneo, "headforceframe", 1);
        c_soundplay_x(snd_swing, 1, 0.5);
        c_wait(3);
        c_panspeed(12, 0, 14);
        c_autowalk(0);
        c_walk("r", 12, 15);
        c_imagespeed(0.25);
        c_wait(16);
        c_imagespeed(0);
        c_speaker("sneo");
        c_msgsetloc(0, "* TO BE BIG.^3 &* WITH ME./%", "obj_ch2_sceneex2_slash_Step_0_gml_248_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 24);
        c_var_instance(sneo, "headforceframe", 2);
        c_speaker("sneo");
        c_msgsetloc(0, "* VERY   VERY    BIG/", "obj_ch2_sceneex2_slash_Step_0_gml_257_0");
        c_msgnextloc("* SO BIG WE'LL STAND UP TALL AND SEE PAST THE DARK/", "obj_ch2_sceneex2_slash_Step_0_gml_258_0");
        c_msgnextloc("* STAND UP WITH OUR HEADS IN THE CLOUDS AND LOOK INTO/%", "obj_ch2_sceneex2_slash_Step_0_gml_259_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 25);
        c_var_lerp_instance(sneo, "x", sneo.x + 600, sneo.x + 740, 5, 1, "out");
        c_var_instance(sneo, "headforceframe", 0);
        c_soundplay_x(snd_swing, 1, 0.5);
        c_wait(3);
        c_autowalk(0);
        c_var_lerp_instance(kr_actor, "x", 1430, 1590, 10, 2, "out");
        c_sprite(spr_kris_dw_landed);
        c_soundplay(snd_hurt1);
        c_imagespeed(0);
        c_imageindex(0);
        c_wait(30);
        c_imagespeed(0);
        c_speaker("sneo");
        c_msgsetloc(0, "* H E A V E N/%", "obj_ch2_sceneex2_slash_Step_0_gml_279_0");
        c_talk_wait();
        c_panspeed(5, 0, 10);
        c_var_lerp_instance(sneo, "x", 1380, 1300, 10, 2, "out");
        c_wait(10);
        c_var_instance(sneo, "headforceframe", 0);
        c_var_instance(sneo, "partmode", 3);
        c_speaker("sneo");
        c_msgsetloc(0, "* I^3 &* JUST NEED^3 &* THAT LITTLE,/%", "obj_ch2_sceneex2_slash_Step_0_gml_287_0");
        c_talk_wait();
        c_var_instance(sneo, "partmode", 13);
        c_var_instance(sneo, "headforceframe", 1);
        c_speaker("sneo");
        c_msgsetloc(0, "* [[SOUL]]^3 &* Y O U HAVE/%", "obj_ch2_sceneex2_slash_Step_0_gml_298_0");
        c_talk_wait();
        c_var_lerp_instance(sneo, "x", 1300, 1420, 120);
        c_var_lerp_instance(sneo, "y", 115, 140, 120);
        c_soundplay(snd_sneo_laugh_long);
        var _n = 0;
        repeat (10)
        {
            c_mus2("pitch", 1.3 + (_n / 15), 0);
            c_wait(12);
            _n++;
        }
        c_mus("free");
        c_soundplay_x(snd_rudebuster_swing, 0.8, 0.9);
        c_var_instance(sneo, "headforceframe", 2);
        c_var_instance(id, "rudebuster", true);
        c_wait(15);
        c_var_instance(sneo, "partmode", 20);
        c_var_instance(id, "sneo_fly", true);
        c_wait(45);
        c_sel(su);
        c_facing("susieunhappy");
        c_setxy(1000, 173);
        c_visible(1);
        c_walkdirect(1300, 173, 20);
        c_sel(ra);
        c_facing("ralseiunhappy");
        c_setxy(1000, 230);
        c_visible(1);
        c_walkdirect(1200, 230, 20);
        c_wait(45);
        c_speaker("susie");
        c_msgsetloc(0, "\\\\E4* Kris!/%", "obj_ch2_sceneex2_slash_Step_0_gml_411_0");
        c_talk_wait();
        c_sel(su);
        c_facing("susieunhappy");
        c_walkdirect(1550, 173, 20);
        c_sel(ra);
        c_facing("ralseiunhappy");
        c_walkdirect(1506, 230, 20);
        c_pan(1258, 0, 20);
        c_wait(22);
        c_speaker("susie");
        c_msgsetloc(0, "\\\\E4* The hell was that weirdo!?/", "obj_ch2_sceneex2_slash_Step_0_gml_341_0");
        c_facenext("ralsei", "Q");
        c_msgnextloc("\\\\EQ* Kris^1, we were worried about you^1, so.../%", "obj_ch2_sceneex2_slash_Step_0_gml_343_0");
        c_talk_wait();
        c_sel(su);
        c_emote("!", 30);
        c_sel(ra);
        c_emote("!", 30);
        c_shake();
        c_var_instance(id, "drawblack", 1);
        c_soundplay_x(snd_closet_impact, 1, 0.8);
        c_wait(30);
        c_speaker("sneo");
        c_msgsetloc(0, "* KRIS!!^1! YOU HAVE [Friends]!?/", "obj_ch2_sceneex2_slash_Step_0_gml_442_0");
        c_msgnextloc("* WHY DON'T YOU TELL THEM ABOUT MY [3 for One Specil]!/", "obj_ch2_sceneex2_slash_Step_0_gml_443_0");
        c_msgnextloc("* TODAY^1, THE WHOLE FAMILY CAN TAKE A LITTLE [Ride Around Town].../%", "obj_ch2_sceneex2_slash_Step_0_gml_418_0");
        c_talk_wait();
        c_wait(5);
        c_var_instance(coaster_empty1, "y", 210);
        c_var_instance(coaster_empty2, "y", 270);
        c_var_instance(coaster_empty3, "y", 330);
        c_var_lerp_instance(coaster_empty1, "x", 1100, 2000, 30, 2, "in");
        c_var_lerp_instance(coaster_empty2, "x", 1100, 2000, 30, 2, "in");
        c_var_lerp_instance(coaster_empty3, "x", 1100, 2000, 30, 2, "in");
        c_soundplay_x(snd_cardrive, 1, 0.8);
        c_soundplay_x(snd_cardrive, 1, 0.9);
        c_wait(10);
        c_sel(su);
        c_autowalk(0);
        c_sprite(spr_susie_shock);
        c_addxy(0, -15);
        c_var_lerp("x", 1550, 1580, 10, 2, "out");
        c_sel(ra);
        c_autowalk(0);
        c_sprite(spr_ralsei_surprised_down);
        c_var_lerp("x", 1496, 1600, 10, 2, "out");
        c_wait(11);
        c_pan(1640, 0, 15);
        c_sel(kr);
        c_sprite(spr_kris_fall_ball);
        c_imagespeed(0.5);
        c_jump(1720, 48, 40, 40);
        c_sel(su);
        c_sprite(spr_susie_dw_fall_ball);
        c_imagespeed(0.5);
        c_jump(1720, 120, 40, 40);
        c_sel(ra);
        c_sprite(spr_ralsei_jump_ball);
        c_imagespeed(0.5);
        c_jump(1720, 244, 40, 40);
        c_soundplay(snd_jump);
        c_soundplay_x(snd_jump, 0.9, 0.8);
        c_wait(10);
        c_var_lerp_instance(id, "trackspeed", 0, -15, 30, 2, "out");
        c_var_lerp_instance(coaster_empty1, "x", 2000, 1700, 30, 2, "out");
        c_var_lerp_instance(coaster_empty2, "x", 2000, 1700, 30, 2, "out");
        c_var_lerp_instance(coaster_empty3, "x", 2000, 1700, 30, 2, "out");
        c_var_lerp_instance(coaster_empty1, "y", 210, 100, 30, 2, "out");
        c_var_lerp_instance(coaster_empty2, "y", 270, 180, 30, 2, "out");
        c_var_lerp_instance(coaster_empty3, "y", 330, 260, 30, 2, "out");
        c_var_lerp_instance(id, "tracky0", 180, 70, 30, 2, "out");
        c_var_lerp_instance(id, "tracky1", 240, 150, 30, 2, "out");
        c_var_lerp_instance(id, "tracky2", 300, 230, 30, 2, "out");
        c_wait(31);
        c_mus("free");
        c_mus2("initloop", "shinkansen.ogg", 0);
        c_mus2("pitch", 2, 0);
        c_soundplay_x(snd_impact, 0.8, 0.5);
        c_soundplay_x(snd_impact, 0.8, 1.1);
        c_soundplay_x(snd_impact, 0.8, 1.4);
        c_sel(kr);
        c_visible(0);
        c_sel(su);
        c_visible(0);
        c_sel(ra);
        c_visible(0);
        c_var_instance(coaster_kris, "x", 1721);
        c_var_instance(coaster_kris, "y", 60);
        c_var_instance(coaster_susie, "x", 1718);
        c_var_instance(coaster_susie, "y", 125);
        c_var_instance(coaster_ralsei, "x", 1727);
        c_var_instance(coaster_ralsei, "y", 215);
        c_var_instance(coaster_kris, "siner_add0", 0.1);
        c_var_instance(coaster_susie, "siner_add0", 0.08);
        c_var_instance(coaster_ralsei, "siner_add0", 0.09);
        c_var_instance(coaster_kris, "visible", 1);
        c_var_instance(coaster_kris, "character_sprite", spr_krisb_defeat);
        c_var_instance(coaster_ralsei, "visible", 1);
        c_var_instance(coaster_ralsei, "character_sprite", spr_ralsei_surprised_down);
        c_var_instance(coaster_ralsei, "character_offset_x", -10);
        c_var_instance(coaster_susie, "visible", 1);
        c_var_instance(coaster_susie, "character_sprite", spr_susie_shock_r);
        c_var_instance(coaster_empty1, "visible", 0);
        c_var_instance(coaster_empty2, "visible", 0);
        c_var_instance(coaster_empty3, "visible", 0);
        c_wait(12);
        c_wait(4);
        c_soundplay(snd_closet_impact);
        c_wait(30);
        c_msgside("bottom");
        c_msgsetloc(0, "* [Attention Customers! Clean up on Aisle 3!]/", "obj_ch2_sceneex2_slash_Step_0_gml_553_0");
        c_msgnextloc("* SOMEONE LEFT [There] SOULS^1, [Lyeing Around......]/%", "obj_ch2_sceneex2_slash_Step_0_gml_554_0");
        c_talk_wait();
        c_var_instance(id, "special_scene", 1);
        c_mus("pause");
        c_waitcustom();
        c_mus("resume");
    }
    c_wait(30);
    if (!shortened)
    {
        c_speaker("sneo");
        c_msgsetloc(0, "* Kris!?!^1? WAS THAT A [BIG SHOT] JUST NOW!?/", "obj_ch2_sceneex2_slash_Step_0_gml_570_0");
        c_msgnextloc("* WOW!!^1!&* I'M SO [Proud] OF YOU^1, I COULD [Killed] YOU!/", "obj_ch2_sceneex2_slash_Step_0_gml_571_0");
        c_msgnextloc("* [Heaven]^1, are you WATCHING?/", "obj_ch2_sceneex2_slash_Step_0_gml_495_0");
        c_msgnextloc("* IT'S TIME TO MAKE A VERY [Specil] DEAL.../%", "obj_ch2_sceneex2_slash_Step_0_gml_496_0");
        c_talk_wait();
    }
    else
    {
        c_sel(kr);
        c_facing("r");
        c_sel(su);
        c_sprite(spr_susie_shock_r);
        c_shakeobj();
        c_sel(ra);
        c_sprite(spr_ralsei_surprised_down);
        c_shakeobj();
    }
    c_mus("free");
    c_soundplay(snd_sneo_laugh_long);
    if (!shortened)
    {
        c_var_instance(sneo, "partmode", 41);
    }
    c_wait(90);
    if (shortened)
    {
        c_fadeout(5);
        c_wait(15);
        c_pan(1640, 0, 15);
        c_var_lerp_instance(id, "trackspeed", 0, -15, 15, 2, "out");
        c_var_lerp_instance(id, "tracky0", 180, 70, 15, 2, "out");
        c_var_lerp_instance(id, "tracky1", 240, 150, 15, 2, "out");
        c_var_lerp_instance(id, "tracky2", 300, 230, 15, 2, "out");
        c_var_instance(coaster_kris, "x", 1721);
        c_var_instance(coaster_kris, "y", 60);
        c_var_instance(coaster_susie, "x", 1718);
        c_var_instance(coaster_susie, "y", 125);
        c_var_instance(coaster_ralsei, "x", 1727);
        c_var_instance(coaster_ralsei, "y", 215);
        c_var_instance(coaster_kris, "siner_add0", 0.1);
        c_var_instance(coaster_susie, "siner_add0", 0.08);
        c_var_instance(coaster_ralsei, "siner_add0", 0.09);
        c_var_instance(coaster_kris, "visible", 1);
        c_var_instance(coaster_kris, "character_sprite", spr_krisb_defeat);
        c_var_instance(coaster_ralsei, "visible", 1);
        c_var_instance(coaster_ralsei, "character_sprite", spr_ralsei_surprised_down);
        c_var_instance(coaster_ralsei, "character_offset_x", -10);
        c_var_instance(coaster_susie, "visible", 1);
        c_var_instance(coaster_susie, "character_sprite", spr_susie_shock_r);
        c_actortokris();
        c_actortocaterpillar();
        c_wait(15);
        c_fadein(5);
    }
    c_actortokris();
    c_actortocaterpillar();
    c_waitcustom();
}
if ((con == 7 && customcon == 1) && special_scene == 0)
{
    con = 8;
    alarm[0] = 120;
    if (global.tempflag[32] == 0)
    {
        global.tempflag[32] = 1;
    }
    with (obj_coaster)
    {
        visible = 0;
    }
    instance_create(x, y, o_coaster_controller_sneo);
    cityscape_active = true;
    global.flag[9] = 2;
    global.batmusic[0] = snd_init("spamton_neo_mix_ex_wip.ogg");
    global.flag[54] = 571;
    scr_battle(61, 1, sneo, 0, 0);
    if (shortened)
    {
        sneo.visible = 0;
        with (obj_encounterbasic)
        {
            counttimer = 14;
            c[2].y -= 28;
            fightcon = 2;
        }
    }
    else
    {
        with (obj_encounterbasic)
        {
            counttimer = 9;
            c[2].y -= 28;
        }
        with (obj_doom)
        {
            alarm[0] -= 9;
        }
    }
    with (obj_battleback)
    {
        instance_destroy();
    }
    global.flag[9] = 1;
}
if (customcon == 1 && special_scene > 0)
{
    if (special_scene == 1)
    {
        instance_create(0, 0, obj_ch2_sceneex2_special);
        special_scene = 2;
    }
    if (special_scene == 2 && !i_ex(obj_ch2_sceneex2_special))
    {
        customcon = 0;
        special_scene = 0;
        c_waitcustom_end();
    }
}
if (con == 9 && i_ex(obj_battlecontroller))
{
    var battle_end = false;
    with (obj_battlecontroller)
    {
        if (intro == 2)
        {
            battle_end = true;
        }
    }
    if (battle_end)
    {
        con = 10;
        with (o_coaster_hero_sneo)
        {
            lerpstate = 2;
        }
        coaster_kris.character_sprite = spr_krisr_dark;
        coaster_susie.character_sprite = spr_susie_walk_right_dw_unhappy;
        coaster_ralsei.character_sprite = spr_ralsei_walk_right_unhappy;
        alarm[0] = 5;
    }
}
if (con == 11)
{
    con = 12;
    alarm[0] = 10;
    with (obj_bulletparent)
    {
        instance_destroy();
    }
    if (i_ex(obj_battleback))
    {
        obj_battleback.destroy = 1;
    }
    if (i_ex(obj_battlecontroller))
    {
        instance_destroy(obj_battlecontroller);
    }
    snd_free(global.batmusic[0]);
    snd_volume(global.currentsong[1], 0, 0);
    snd_resume(global.currentsong[1]);
    snd_volume(global.currentsong[1], 1, 20);
}
if ((con == 13 && !i_ex(obj_battlecontroller)) || (con == 13 && forcend == 1))
{
    con = 49;
    alarm[0] = 30;
    coaster_kris.character_sprite = spr_krisr_dark;
    coaster_susie.character_sprite = spr_susie_walk_right_dw_unhappy;
    coaster_ralsei.character_sprite = spr_ralsei_walk_right_unhappy;
    coaster_kris.visible = 1;
    coaster_susie.visible = 1;
    coaster_ralsei.visible = 1;
    with (obj_heroparent)
    {
        instance_destroy();
    }
    c_waitcustom_end();
    with (obj_dialoguer)
    {
        side = 1;
    }
}
if (con == 50 && !d_ex())
{
    con = 59;
    alarm[0] = 30;
    c_actortokris();
    c_terminatekillactors();
}
if (con == 60 && !i_ex(obj_cutscene_master))
{
    con = -1;
    global.interact = 0;
    global.facing = 0;
    with (obj_spamton_neo_enemy)
    {
        instance_destroy();
    }
    global.fighting = 0;
    room_goto(room_dw_mansion_b_east_a);
}
if (rudebuster)
{
    rudebuster = false;
    rudebusteranim = instance_create(camerax() - 60, 275, obj_rudebuster_bolt);
    rudebusteranim.target = sneo;
}
if (sneo_fly)
{
    with (sneo)
    {
        gravity = -2;
    }
    if (sneo.y <= (cameray() - 200))
    {
        sneo_fly = false;
        sneo.gravity = 0;
        sneo.x = 840;
        sneo.y = cameray() - 200;
    }
}
if (sneo_release)
{
    if (sneo.gravity == 0)
    {
        sneo.gravity = 2;
        sneo.facing = 1;
        sneo.partmode = 1;
    }
    if (sneo.y >= 80)
    {
        sneo_release = false;
        with (sneo)
        {
            gravity = 0;
            vspeed = 0;
        }
    }
}
`},hashes:{Alarm_0:`f33ecd5003265508596a63a4699fee8f32f684920343b7cba0cb84f489b4f448`,Create_0:`56920d9a0c12e52021e89834997936ff03f64e59a14b6ee9f54849d4c8e62f56`,Draw_0:`0a6db5863b3c1834474a4c90907d8617d2d335a2831ae63a1a3301c06f81251e`,mus_Alarm_0:`f33ecd5003265508596a63a4699fee8f32f684920343b7cba0cb84f489b4f448`,mus_Create_0:`8fcc699a31f92a3e4f275e2b8342cbfa441c6310e51ff94b3a6c66530d34c84d`,mus_Step_0:`3014dfff28fcfc226fe29eba61018ec7b44271d729ffee6f89d6d89038f5a614`,special_Alarm_4:`f33ecd5003265508596a63a4699fee8f32f684920343b7cba0cb84f489b4f448`,special_Create_0:`7e50dbff3fba7cbdf9f6e8da9294e3502abfc1ad86c49455b93c4fd201f62a75`,special_Draw_0:`7901a5f122a20287e583ebd46791d90a3f5e1480e185342605133800e35da97c`,special_Step_0:`87bacfce4f77c56bf90c2f024c611bce994d0bf15a45612dd1b1e79f12be6832`,Step_0:`979d7dad186ac32b8a378a27f2cff62301983003a531498d1ee0e19d4f8c3837`}},o_coaster_controller_sneo:{metadata:{index:698,name:`o_coaster_controller_sneo`,parent:null,sprite:`spr_coaster_explosion`,mask:null,solid:!1,depth:0,visible:!1},sources:{Create_0:`timer = 0;
timermax = 180;
playerinput = 0;
playerinputtimer = 0;
actcon = 0;
krisgooffscreen = 0;
susiegooffscreen = 0;
ralseigooffscreen = 0;
buttonspressed = 0;
bumpmercy = 0;
mykey[0] = 90;
mykey[1] = 88;
mykey[2] = 67;
for (i = 0; i < 3; i += 1)
{
    HeroCoaster[i] = instance_create(0, 0, o_coaster_hero_sneo);
    HeroCoaster[i].HeroID = i;
    HeroCoaster[i].image_index = i;
    HeroCoaster[i].depth = HeroCoaster[i].y * -100;
    HeroCoaster[i].siner = 0;
    HeroCoaster[i].mykey = mykey[i];
    with (HeroCoaster[i])
    {
        back = instance_create(x, y, o_coaster_hero_back_sneo);
        back.parentid = id;
        back.depth = depth + 2;
    }
    yspot[i] = HeroCoaster[i].y;
}
`},hashes:{Create_0:`1e9ad9d2b28d35938fce7f4f89d6c5f96846398edd770e32c52215c133e211c9`}},o_coaster_hero_sneo:{metadata:{index:699,name:`o_coaster_hero_sneo`,parent:null,sprite:`spr_sneo_car_front`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`HeroID = 0;
xx = 0;
yy = 0;
forceact = 1;
gooffscreen = 0;
userealsprite = 0;
introanim = 1;
endtargetx = 0;
lerpstate = 0;
lerptimer = 0;
image_speed = 0.25;
image_xscale = 2;
image_yscale = 2;
mask_index = spr_coaster_hero;
siner = 0;
smoketimer = 0;
con = 0;
action = 0;
mykey = 81;
damaged = 0;
mykeybuffer = 0;
nitro = 0;
barrier = 0;
disabled = 0;
disabledtimer = 0;
disabledtype = 0;
flametimer = 0;
flameindex = 0;
flameindextimer = 0;
fsiner = 0;
actoncondelay = 0;
dontshowherosprite = 0;
draw_button_press = 0;
draw_button_press_timer = 0;
`,Destroy_0:`with (o_coaster_hero_back)
{
    instance_destroy();
}
`,Draw_0:`var kriscoaster_x = obj_ch2_sceneex2.coaster_kris.x + obj_ch2_sceneex2.coaster_kris.sinerx + obj_ch2_sceneex2.coaster_kris.coaster_offset_x + obj_ch2_sceneex2.coaster_kris.target_x_end;
var kriscoaster_y = obj_ch2_sceneex2.coaster_kris.y + obj_ch2_sceneex2.coaster_kris.sinery + obj_ch2_sceneex2.coaster_kris.coaster_offset_y;
var susiecoaster_x = obj_ch2_sceneex2.coaster_susie.x + obj_ch2_sceneex2.coaster_susie.sinerx + obj_ch2_sceneex2.coaster_susie.coaster_offset_x + obj_ch2_sceneex2.coaster_susie.target_x_end;
var susiecoaster_y = obj_ch2_sceneex2.coaster_susie.y + obj_ch2_sceneex2.coaster_susie.sinery + obj_ch2_sceneex2.coaster_susie.coaster_offset_y;
var ralseicoaster_x = obj_ch2_sceneex2.coaster_ralsei.x + obj_ch2_sceneex2.coaster_ralsei.sinerx + obj_ch2_sceneex2.coaster_ralsei.coaster_offset_x + obj_ch2_sceneex2.coaster_ralsei.target_x_end;
var ralseicoaster_y = obj_ch2_sceneex2.coaster_ralsei.y + obj_ch2_sceneex2.coaster_ralsei.sinery + obj_ch2_sceneex2.coaster_ralsei.coaster_offset_y;
if (lerpstate == 0)
{
    if (lerptimer < 10)
    {
        lerptimer++;
    }
    if (HeroID == 0)
    {
        x = lerp(kriscoaster_x, 1705, lerptimer / 10);
        y = lerp(kriscoaster_y, 101, lerptimer / 10);
    }
    else if (HeroID == 1)
    {
        x = lerp(susiecoaster_x, 1715, lerptimer / 10);
        y = lerp(susiecoaster_y, 182, lerptimer / 10);
    }
    else if (HeroID == 2)
    {
        x = lerp(ralseicoaster_x, 1710, lerptimer / 10);
        y = lerp(ralseicoaster_y, 260, lerptimer / 10);
    }
    if (lerptimer > 9 && instance_exists(obj_herokris))
    {
        lerptimer = 0;
        lerpstate = 1;
    }
}
if (lerpstate == 1)
{
    if (HeroID == 0 && instance_exists(obj_herokris))
    {
        x = obj_herokris.x - 15;
    }
    else if (HeroID == 1 && instance_exists(obj_herosusie))
    {
        x = obj_herosusie.x - 5;
    }
    else if (HeroID == 2 && instance_exists(obj_heroralsei))
    {
        x = obj_heroralsei.x - 10;
    }
}
if (lerpstate == 2)
{
    lerptimer += 1;
    if (HeroID == 0)
    {
        x = lerp(1705, kriscoaster_x, lerptimer / 5);
        y = lerp(101, kriscoaster_y, lerptimer / 5);
        if (instance_exists(obj_herokris))
        {
            obj_herokris.x = lerp(1710, obj_ch2_sceneex2.coaster_kris.x + obj_ch2_sceneex2.coaster_kris.sinerx + obj_ch2_sceneex2.coaster_kris.character_offset_x + obj_ch2_sceneex2.coaster_kris.target_x_end, lerptimer / 5);
        }
    }
    if (HeroID == 1)
    {
        x = lerp(1715, susiecoaster_x, lerptimer / 5);
        y = lerp(182, susiecoaster_y, lerptimer / 5);
        if (instance_exists(obj_herosusie))
        {
            obj_herosusie.x = lerp(1717, obj_ch2_sceneex2.coaster_susie.x + obj_ch2_sceneex2.coaster_susie.sinerx + obj_ch2_sceneex2.coaster_susie.character_offset_x + obj_ch2_sceneex2.coaster_susie.target_x_end, lerptimer / 5);
        }
    }
    if (HeroID == 2)
    {
        x = lerp(1710, ralseicoaster_x, lerptimer / 5);
        y = lerp(260, ralseicoaster_y, lerptimer / 5);
        if (instance_exists(obj_heroralsei))
        {
            obj_heroralsei.x = lerp(1712, obj_ch2_sceneex2.coaster_ralsei.x + obj_ch2_sceneex2.coaster_ralsei.sinerx + obj_ch2_sceneex2.coaster_ralsei.character_offset_x + obj_ch2_sceneex2.coaster_ralsei.target_x_end, lerptimer / 5);
        }
        if (instance_exists(obj_heroralsei))
        {
            obj_heroralsei.y += 0.5;
        }
    }
    if (lerptimer == 4)
    {
        with (obj_coaster)
        {
            visible = 1;
        }
    }
    if (lerptimer > 4)
    {
        with (obj_coaster)
        {
            visible = 1;
        }
        with (obj_heroparent)
        {
            instance_destroy();
        }
        with (o_coaster_hero_sneo)
        {
            instance_destroy();
        }
        with (o_coaster_hero_back_sneo)
        {
            instance_destroy();
        }
        with (o_coaster_controller_sneo)
        {
            instance_destroy();
        }
        exit;
    }
}
back.x = x + 1;
back.y = y;
draw_sprite_ext(sprite_index, image_index, x, y, image_xscale, image_yscale, 0, c_white, image_alpha);
`,Step_0:`if (o_coaster_controller_sneo.actcon == 1 && o_coaster_controller_sneo.timer < o_coaster_controller_sneo.timermax)
{
    if ((button1_p() && HeroID == 0 && gooffscreen == 0) || (button2_p() && HeroID == 1 && gooffscreen == 0) || (button3_p() && HeroID == 2 && gooffscreen == 0))
    {
        if (visible == 1)
        {
            if (button1_p() && HeroID == 0)
            {
                draw_button_press = 0;
            }
            if (button2_p() && HeroID == 1)
            {
                draw_button_press = 0;
            }
            if (button3_p() && HeroID == 2)
            {
                draw_button_press = 0;
            }
            mykeybuffer = 3;
            o_coaster_controller_sneo.playerinput = 1;
        }
    }
}
if (o_coaster_controller_sneo.actcon != 0)
{
    actoncondelay = 1;
}
if (instance_exists(obj_battleblcon))
{
    actoncondelay = 0;
}
if (disabled == 1)
{
    disabledtimer--;
    if (disabledtimer <= 0)
    {
        disabled = 0;
    }
}
if (con == 0)
{
    siner += 0.4;
    if (gooffscreen == 0)
    {
        x = xstart + (sin(siner / 6) * 3);
    }
    if (mykeybuffer > 0 && disabled == 0)
    {
        con = 1;
        dashtimer = 0;
        damaged = 0;
        with (o_coaster_controller_sneo)
        {
            buttonspressed += 1;
        }
    }
}
if (con == 1)
{
    if (nitro == 0)
    {
        hspeed += 4;
        if (hspeed > 30)
        {
            hspeed = 30;
        }
    }
    if (nitro == 1)
    {
        hspeed += 8;
        if (hspeed > 60)
        {
            hspeed = 60;
        }
    }
    smoketimer += 2;
    if (smoketimer >= 3)
    {
        smoke = instance_create(x + hspeed + 8, y - 10, o_coastersmoke);
        smoketimer = 0;
    }
    if (x >= (camerax() + 200))
    {
        con = 2;
    }
    if (damaged == 1)
    {
        con = 5;
        hspeed = -48;
        if (nitro == 1)
        {
            hspeed = -200;
        }
    }
}
if (con == 2)
{
    if (damaged == 1)
    {
        con = 5;
    }
    if (hspeed >= -6)
    {
        hspeed -= 2;
    }
    if (nitro == 1)
    {
        hspeed -= 1;
        if (x >= (camerax() + 400) && hspeed > 0)
        {
            hspeed = -2;
        }
    }
    if (x <= (xstart + 10))
    {
        damaged = 0;
        hspeed = 0;
        siner = 0;
        con = 0;
    }
}
if (con == 5)
{
    hspeed = -30;
    if (nitro == 1)
    {
        hspeed = -100;
    }
    if (x <= (xstart - hspeed))
    {
        hspeed = 0;
        damaged = 0;
        siner = 0;
        con = 0;
    }
}
mykeybuffer -= 1;
if (gooffscreen == 2)
{
    if (HeroID == 0)
    {
        x -= 2;
    }
}
`,Step_2:`if (HeroID == 0)
{
    depth = 80;
    if (instance_exists(obj_herokris))
    {
        obj_herokris.depth = depth + 1;
    }
}
if (HeroID == 1)
{
    depth = 75;
    if (instance_exists(obj_herosusie))
    {
        obj_herosusie.depth = depth + 1;
    }
}
if (HeroID == 2)
{
    depth = 70;
    if (instance_exists(obj_heroralsei))
    {
        obj_heroralsei.depth = depth + 1;
    }
}
if (instance_exists(obj_encounterbasic))
{
    if (HeroID == 0)
    {
    }
    if (HeroID == 1)
    {
        obj_encounterbasic.c[1].depth = depth + 1;
    }
    if (HeroID == 2)
    {
        obj_encounterbasic.c[2].depth = depth + 1;
    }
}
`},hashes:{Create_0:`95ada99ca6113c2dcff165a716fa2bd4f25aadb2d84c0eb47dad7021366c28bd`,Destroy_0:`de25850def1927da56f46fe25a184a745d8ad15059c8f32eccbd12d2351b6671`,Draw_0:`f7d1f0b9592fc06721441fd3722da1355f7a33dbc1b6c076baae32e7013dbab8`,Step_0:`87d9193a8056be0ede4d45727b9138bd05154acc69ec2c5b642b2d74d1ba5307`,Step_2:`63e58f49654cbdb23c182addc4fd4beefa43a0fa1a647ffb341a04ca30cc2677`}},o_coaster_hero_back_sneo:{metadata:{index:701,name:`o_coaster_hero_back_sneo`,parent:null,sprite:`spr_sneo_car_back`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`depth = o_coaster_hero_sneo.depth + 20;
image_speed = 0;
image_xscale = 2;
image_yscale = 2;
if (instance_exists(obj_encounterbasic))
{
    depth = obj_encounterbasic.c[0].depth + 1;
}
`,Draw_0:`draw_self();
`,Step_0:`depth = parentid.depth + 2;
if (instance_exists(obj_encounterbasic))
{
    depth = obj_encounterbasic.c[0].depth + 1;
}
`},hashes:{Create_0:`63d0effc13a7e80e6e21c77276fb9be973e14290088f2b0e05c76baaddbb859e`,Draw_0:`1b10bcafa44951bb0952bb1adcba3ce90e2dc90701b61cb4d0bbd10fad9a7b52`,Step_0:`bee4ce1a789e9cbce2ac3de6d3b83a576e30892e17e8d936c88be9892e9e1a40`}},obj_coaster:{metadata:{index:1126,name:`obj_coaster`,parent:null,sprite:`spr_kris_coaster_hurt_front`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`type = 0;
init = false;
con = 0;
actor = -1;
spam_car = room == room_dw_mansion_b_east;
default_sprite_front = spam_car ? spr_sneo_car_front : spr_kris_coaster_front;
default_sprite_back = spam_car ? spr_sneo_car_back : spr_kris_coaster_back;
hurt_sprite_front = spam_car ? spr_sneo_car_front : spr_kris_coaster_hurt_front;
hurt_sprite_back = spam_car ? spr_sneo_car_back : spr_kris_coaster_hurt_back;
hurt_character_sprite = spr_krisb_hurt;
character_sprite = spr_krisr_dark;
character_offset_x = 0;
character_offset_y = 0;
character_speed = 0.25;
image_speed = 1;
coaster_offset_x = -25;
coaster_offset_y = 40;
hurt = false;
siner = 0;
stop_siner = 0;
target_x = 0;
target_x_end = 0;
animate = false;
siner0 = 0;
siner_add0 = 0;
siner_amplitude0 = 10;
siner_direction0 = 0;
siner_type0 = "sin";
siner_visual0 = 1;
sinerx = 0;
sinery = 0;
battlecoasterx = 0;
`,Draw_0:`if (animate)
{
    siner++;
}
if (!hurt)
{
    if (default_sprite_back != -1)
    {
        draw_sprite_ext(default_sprite_back, image_index, x + sinerx + coaster_offset_x, y + sinery + coaster_offset_y, 2, 2, 0, c_white, 1);
    }
    draw_sprite_ext(actor.sprite_index, actor.image_index, x + sinerx + character_offset_x, y + sinery + character_offset_y, 2, 2, 0, c_white, 1);
    draw_sprite_ext(default_sprite_front, image_index, x + sinerx + coaster_offset_x, y + sinery + coaster_offset_y, 2, 2, 0, c_white, 1);
}
else
{
    draw_sprite_ext(hurt_sprite_back, image_index, x + coaster_offset_x, y + coaster_offset_y, 2, 2, 0, c_white, 1);
    draw_sprite_ext(hurt_character_sprite, image_index, x + sinerx + character_offset_x, y + sinery + character_offset_y, 2, 2, 0, c_white, 1);
    draw_sprite_ext(hurt_sprite_front, image_index, x + coaster_offset_x, y + coaster_offset_y, 2, 2, 0, c_white, 1);
}
`,Step_0:`if (type == 0 && !init)
{
    init = true;
    character_sprite = spr_krisr_dark;
    actor = scr_dark_marker(0, 0, spr_krisr_dark);
    actor.image_speed = 0;
    actor.visible = 0;
}
if (type == 1 && !init)
{
    init = true;
    default_sprite_front = spam_car ? spr_sneo_car_front : spr_susie_coaster_front;
    default_sprite_back = spam_car ? spr_sneo_car_back : spr_susie_coaster_back;
    hurt_sprite_front = spr_susie_coaster_hurt_front;
    hurt_sprite_back = spr_susie_coaster_hurt_back;
    hurt_character_sprite = spr_susie_hurt;
    character_sprite = spr_susie_walk_right_dw;
    actor = scr_dark_marker(0, 0, spr_susie_walk_right_dw);
    actor.image_speed = 0;
    actor.visible = 0;
    coaster_offset_x = -20;
    coaster_offset_y = 55;
}
if (type == 2 && !init)
{
    init = true;
    default_sprite_front = spam_car ? spr_sneo_car_front : spr_ralsei_coaster_front;
    default_sprite_back = spam_car ? spr_sneo_car_back : spr_ralsei_coaster_back;
    hurt_sprite_front = spr_ralsei_coaster_hurt_front;
    hurt_sprite_back = spr_ralsei_coaster_hurt_back;
    hurt_character_sprite = spr_ralsei_hurt_overworld;
    character_sprite = spr_ralsei_walk_right;
    actor = scr_dark_marker(0, 0, spr_ralsei_walk_right);
    actor.image_speed = 0;
    actor.visible = 0;
    coaster_offset_x = -30;
    coaster_offset_y = 45;
}
if (type == 3 && !init)
{
    init = true;
    default_sprite_front = spr_berdly_coaster_front;
    default_sprite_back = spr_berdly_coaster_back;
    hurt_sprite_front = spr_berdly_coaster_hurt_front;
    hurt_sprite_back = spr_berdly_coaster_hurt_back;
    hurt_character_sprite = spr_berdlyb_shocked;
    character_sprite = spr_berdly_walk_left_dw;
    actor = scr_dark_marker(0, 0, spr_berdly_walk_left_dw);
    actor.image_speed = 0;
    actor.visible = 0;
    coaster_offset_x = -65;
    coaster_offset_y = 30;
}
if (type == 4 && !init)
{
    init = true;
    default_sprite_front = spr_noelle_coaster_front;
    default_sprite_back = -1;
    character_sprite = spr_noelle_walk_left_dw;
    actor = scr_dark_marker(0, 0, spr_noelle_walk_left_dw);
    actor.image_speed = 0;
    actor.visible = 0;
    coaster_offset_x = -65;
    coaster_offset_y = 45;
}
if (character_sprite != actor.sprite_index)
{
    actor.sprite_index = character_sprite;
    actor.image_index = 0;
}
if (con == 0)
{
    actor.image_speed = animate ? 0.25 : 0;
}
else
{
    image_speed = 0;
    if (type == 0 && actor.image_index < 6)
    {
        actor.image_index += 0.25;
    }
    if (type == 1 && actor.image_index < 5)
    {
        actor.image_index += 0.25;
    }
    if (type == 2 && actor.image_index < 10)
    {
        actor.image_index += 0.5;
    }
}
if (stop_siner == 1)
{
    sinerx = 0;
    battlecoasterx = (camerax() + 122) - (type * 20);
    if (type == 3)
    {
        battlecoasterx = camerax() + 515;
    }
    if (type == 0)
    {
        battlecoasterx += 4;
    }
    repeat (4)
    {
        if (x < battlecoasterx)
        {
            x += 1;
        }
        if (x > battlecoasterx)
        {
            x -= 1;
        }
    }
}
else
{
    sinerx = 0;
    sinery = 0;
    if (siner_add0 != 0)
    {
        siner0 += siner_add0;
        if (siner_type0 == "sin")
        {
            sinmove = sin(siner0) * siner_amplitude0;
        }
        else
        {
            sinmove = cos(siner0) * siner_amplitude0;
        }
        if (siner_visual0 == 1)
        {
            sinerx += lengthdir_x(sinmove, siner_direction0);
            sinery += lengthdir_y(sinmove, siner_direction0);
        }
        else
        {
            x += lengthdir_x(sinmove, siner_direction0);
            y += lengthdir_y(sinmove, siner_direction0);
        }
    }
}
`},hashes:{Create_0:`fce6a1be1fac38092720e88e098e51aeb51c0d7233d0d1deeaf77a3d12526186`,Draw_0:`b47d689d7be0576a3e639a113060d8221c79fae56202ff53467c9f0fad6e2d04`,Step_0:`b104ecb4b627d76caa3acafe8354b23d8d163cc814737816e69dc38bc384ed2e`}},o_coastersmoke:{metadata:{index:505,name:`o_coastersmoke`,parent:null,sprite:`spr_coaster_explosion`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`image_xscale = 2;
image_speed = 1;
hspeed = -2;
vspeed = -2 + random(2);
depth = 90000;
`,Step_0:`hspeed -= 2;
if (image_index >= 4)
{
    instance_destroy();
}
`},hashes:{Create_0:`e2f6d1c83c92137490015aa0ad3b156521b1730bfdbfe6248919b79cbe0f9c3a`,Step_0:`2e3acabc829ea10fab5c1259a2ca177ddd48ffdde70c3f2bf46101012a757c35`}}},cn={scr_cutscene_loaded:`function scr_cutscene_loaded()
{
    var __loadedState = 0;
    if (instance_exists(obj_cutscene_master))
    {
        if (obj_cutscene_master.loadedState == 1)
        {
            __loadedState = 1;
        }
    }
    return __loadedState;
}
`,scr_draw_sprite_tiled_area:`function scr_draw_sprite_tiled_area()
{
    var sprite = argument[0];
    var subimg = argument[1];
    var xx = argument[2];
    var yy = argument[3];
    var x1 = argument[4];
    var y1 = argument[5];
    var x2 = argument[6];
    var y2 = argument[7];
    var xscale = argument[8];
    var yscale = argument[9];
    var col = (argument_count > 10) ? argument[10] : 16777215;
    var alpha = (argument_count > 11) ? argument[11] : 1;
    var sw = sprite_get_width(sprite) * xscale;
    var sh = sprite_get_height(sprite) * yscale;
    var i = x1 - ((x1 % sw) - (xx % sw)) - (sw * ((x1 % sw) < (xx % sw)));
    var j = y1 - ((y1 % sh) - (yy % sh)) - (sh * ((y1 % sh) < (yy % sh)));
    var jj = j;
    while (i <= x2)
    {
        while (j <= y2)
        {
            var left;
            if (i <= x1)
            {
                left = x1 - i;
            }
            else
            {
                left = 0;
            }
            var X = i + left;
            var top;
            if (j <= y1)
            {
                top = y1 - j;
            }
            else
            {
                top = 0;
            }
            var Y = j + top;
            var width;
            if (x2 <= (i + sw))
            {
                width = ((sw - ((i + sw) - x2)) + 1) - left;
            }
            else
            {
                width = sw - left;
            }
            var height;
            if (y2 <= (j + sh))
            {
                height = ((sh - ((j + sh) - y2)) + 1) - top;
            }
            else
            {
                height = sh - top;
            }
            draw_sprite_part_ext(sprite, subimg, left, top, width, height, X, Y, xscale, yscale, col, alpha);
            j += sh;
        }
        j = jj;
        i += sw;
    }
    return 0;
}
`},ln=(e,t,n)=>e+(t-e)*n,un=[`obj_herokris`,`obj_herosusie`,`obj_heroralsei`],dn=[`coaster_kris`,`coaster_susie`,`coaster_ralsei`],fn=[`spr_krisr_dark`,`spr_susie_walk_right_dw_unhappy`,`spr_ralsei_walk_right_unhappy`],pn=[{character:`spr_krisr_dark`},{front:`spr_susie_coaster_front`,back:`spr_susie_coaster_back`,hurtFront:`spr_susie_coaster_hurt_front`,hurtBack:`spr_susie_coaster_hurt_back`,hurtCharacter:`spr_susie_hurt`,character:`spr_susie_walk_right_dw`,x:-20,y:55},{front:`spr_ralsei_coaster_front`,back:`spr_ralsei_coaster_back`,hurtFront:`spr_ralsei_coaster_hurt_front`,hurtBack:`spr_ralsei_coaster_hurt_back`,hurtCharacter:`spr_ralsei_hurt_overworld`,character:`spr_ralsei_walk_right`,x:-30,y:45},{front:`spr_berdly_coaster_front`,back:`spr_berdly_coaster_back`,hurtFront:`spr_berdly_coaster_hurt_front`,hurtBack:`spr_berdly_coaster_hurt_back`,hurtCharacter:`spr_berdlyb_shocked`,character:`spr_berdly_walk_left_dw`,x:-65,y:30},{front:`spr_noelle_coaster_front`,character:`spr_noelle_walk_left_dw`,x:-65,y:45}];function mn(e,t,n,r,i,a){let o=t.create(n(`obj_marker`),r,i);return e.thismarker=o.id,o.sprite=a,o.imageSpeed=0,o.imageXscale=2,o.imageYscale=2,o}function hn(e,t,n,r,i,a,o,s,c,l,u,d=M.white,p=1){let m=e.bank.get(t);if(!m)return;let h=m.width*l,g=m.height*u;if(!f(h,0)||!f(g,0))throw Error(`NEO tiled-area drawing requires positive sprite dimensions and scale`);let v=a-(a%h-r%h)-h*Number(U(a%h,r%h)),y=o-(o%g-i%g)-g*Number(U(o%g,i%g)),b=y;for(;_(v,s);){for(;_(y,c);){let r=_(v,a)?a-v:0,i=_(y,o)?o-y:0,f=_(s,v+h)?h-(v+h-s)+1-r:h-r,m=_(c,y+g)?g-(y+g-c)+1-i:g-i;e.drawSpritePart(t,n,r,i,f,m,v+r,y+i,l,u,d,p),y+=g}y=b,v+=h}}function gn(e){Object.assign(e,{drawblack:2,drawtrack:1,trackx:0,tracky0:180,tracky1:240,tracky2:300,fightmode:0,trackspeed:0,trackaccel:0,trackspeedmax:0,cityscapefade:0,cityscape_active:!1,cityscape_speed:0,cityscape_alpha:0,init:0,con:-1,customcon:0,timer:0,sneo_x_save:0,sneo_y_save:0,shortened:!1,special_scene:!1,rudebuster:!1,sneo_fly:!1,sneo_release:!1,forcend:0,shop_spamton_bg_con:0,shop_spamton_bg_timer:0,cityscape_speed_max:5})}function _n(e,t,n,r){let i=e[t];if(!i)throw Error(`NEO world scene ${t} is not ported; source-backed callback required`);i(n,r)}function vn(e){let t=e.object,n=(e,n)=>e.first(t(n)),r=(e,n)=>{for(let r of e.all(t(n)))e.destroy(r)},i=(e,t,r)=>{let i=n(t,`obj_ch2_sceneex2`);return t.byId(i[dn[r]])};return[{name:`obj_ch2_sceneex2`,index:1004,sprite:`spr_event`,depth:0,events:{create:(t,n)=>{gn(t),T(n.globals.chapter,2)&&O(n.globals.flag[309],8)&&_n(e,`worldCreate`,t,n)},alarm0:e=>{e.con++},step:(i,a)=>{if(T(i.con,13)&&T(i.forcend,1)){e.battleBoundary(i,a);return}let o=e.cutsceneLoaded?e.cutsceneLoaded(a):T(n(a,`obj_cutscene_master`)?.loadedState??0,1);if(U(i.con,8)||f(i.con,13)||T(i.customcon,1)&&f(i.special_scene,0)||o){_n(e,`worldStep`,i,a);return}if(T(i.init,0)&&(i.trackx=0,i.init=1),T(i.con,9)&&n(a,`obj_battlecontroller`)&&a.all(t(`obj_battlecontroller`)).some(e=>T(e.intro,2))){i.con=10;for(let e of a.all(t(`o_coaster_hero_sneo`)))e.lerpstate=2;for(let e=0;e<3;e++)a.byId(i[dn[e]]).character_sprite=fn[e];i.alarm[0]=5}if(T(i.con,11)){i.con=12,i.alarm[0]=10,r(a,`obj_bulletparent`);let t=n(a,`obj_battleback`);t&&(t.destroy=1),r(a,`obj_battlecontroller`),e.finishBattleAudio(i,a)}if(T(i.con,13)&&!n(a,`obj_battlecontroller`)){_n(e,`worldStep`,i,a);return}if(i.rudebuster){i.rudebuster=!1;let e=a.create(t(`obj_rudebuster_bolt`),a.view.x-60,275);i.rudebusteranim=e.id,e.target=i.sneo}if(i.sneo_fly){let e=a.byId(i.sneo);e.gravity=-2,_(e.y,a.view.y-200)&&(i.sneo_fly=!1,e.gravity=0,e.x=840,e.y=a.view.y-200)}if(i.sneo_release){let e=a.byId(i.sneo);T(e.gravity,0)&&(e.gravity=2,e.facing=1,e.partmode=1),O(e.y,80)&&(i.sneo_release=!1,e.gravity=0,e.vspeed=0)}},draw:(e,r)=>{if(e.depth=99e3,n(r,`obj_encounterbasic`)&&(e.fightmode=1),T(e.drawblack,1)&&T(e.fightmode,0)&&(r.drawState.color=M.black,r.drawRect(1630,-10,2500,500)),T(e.drawtrack,1)){e.trackx+=e.trackspeed,U(e.trackx+640,r.view.x)&&(e.trackx+=640),f(e.trackx-640,r.view.x)&&(e.trackx-=640);for(let t of[e.tracky0,e.tracky1,e.tracky2])for(let n of[e.trackx-640,e.trackx,e.trackx+640])r.drawSprite(`spr_sneo_track`,0,n,t,2,2,0,M.white,e.imageAlpha);r.drawState.color=M.black,r.drawRect(0,200,80,420)}if(T(e.drawblack,2)&&T(e.fightmode,0)&&(r.drawState.color=M.black,r.drawRect(1640,-10,2500,500)),e.cityscape_active){U(e.cityscape_alpha,1)&&(e.cityscape_alpha=ln(e.cityscape_alpha,1,.2)),T(e.cityscapefade,1)&&(e.cityscape_alpha=0),e.cityscape_speed-=e.cityscape_speed_max,U(e.cityscape_speed_max,0)&&f(e.cityscape_speed,-398)&&(e.cityscape_speed-=398);let i=(t,n,i,a,o=t,s=0,c=e.cityscape_alpha)=>{let l=r.view.x+n,u=r.view.y+s,d=r.bank.get(o)?.height??0;hn(r,t,0,l,r.view.y,l,u,r.view.x+r.view.width,u+d*2,i,a,M.white,c)};if(i(`bg_dw_mansion_basement_cityscape_background`,e.cityscape_speed,2,2),i(`bg_dw_mansion_basement_cityscape_midground`,e.cityscape_speed*1.1,2,2),i(`bg_dw_mansion_basement_cityscape_foreground`,e.cityscape_speed*1.2,2,2),f(e.shop_spamton_bg_con,1)&&(T(e.cityscapefade,1)&&(e.cityscape_alpha=.15),i(`spr_shop_spamton_bg_battle`,e.cityscape_speed,1.6708,1.195,`bg_dw_mansion_basement_cityscape`)),T(e.shop_spamton_bg_con,1)&&!n(r,`obj_writer`)&&!n(r,`obj_battleblcon`)&&(e.shop_spamton_bg_timer++,T(e.shop_spamton_bg_timer,1)&&r.sound?.(`snd_petrify`),T(e.shop_spamton_bg_timer,23)&&(e.shop_spamton_bg_con=2)),T(e.shop_spamton_bg_con,2)&&(e.shop_spamton_bg_timer--,T(e.shop_spamton_bg_timer,0))){e.shop_spamton_bg_con=3;for(let e of r.all(t(`obj_spamton_neo_enemy`)))e.targetbgspeed=5}f(e.shop_spamton_bg_con,0)&&U(e.shop_spamton_bg_con,3)&&i(`spr_whitepixel`,e.cityscape_speed,396,8,`bg_dw_mansion_basement_cityscape`,-2,e.shop_spamton_bg_timer/20)}}}},{name:`o_coaster_controller_sneo`,index:698,sprite:`spr_coaster_explosion`,depth:0,visible:!1,events:{create:(e,n)=>{Object.assign(e,{timer:0,timermax:180,playerinput:0,playerinputtimer:0,actcon:0,krisgooffscreen:0,susiegooffscreen:0,ralseigooffscreen:0,buttonspressed:0,bumpmercy:0});let r=P(e,`mykey`);r[0]=90,r[1]=88,r[2]=67;let i=P(e,`HeroCoaster`),a=P(e,`yspot`);for(e.i=0;U(e.i,3);e.i++){let o=n.create(t(`o_coaster_hero_sneo`),0,0);i[e.i]=o.id,o.HeroID=e.i,o.imageIndex=e.i,o.depth=o.y*-100,o.siner=0,o.mykey=r[e.i];let s=n.create(t(`o_coaster_hero_back_sneo`),o.x,o.y);o.back=s.id,s.parentid=o.id,s.depth=o.depth+2,a[e.i]=o.y}}}},{name:`o_coaster_hero_sneo`,index:699,sprite:`spr_sneo_car_front`,depth:0,events:{create:e=>{Object.assign(e,{HeroID:0,xx:0,yy:0,forceact:1,gooffscreen:0,userealsprite:0,introanim:1,endtargetx:0,lerpstate:0,lerptimer:0,siner:0,smoketimer:0,con:0,action:0,mykey:81,damaged:0,mykeybuffer:0,nitro:0,barrier:0,disabled:0,disabledtimer:0,disabledtype:0,flametimer:0,flameindex:0,flameindextimer:0,fsiner:0,actoncondelay:0,dontshowherosprite:0,draw_button_press:0,draw_button_press_timer:0}),e.imageSpeed=.25,e.imageXscale=2,e.imageYscale=2,e.mask=`spr_coaster_hero`},destroy:(e,t)=>r(t,`o_coaster_hero_back`),step:(e,r)=>{let i=n(r,`o_coaster_controller_sneo`),a=T(e.HeroID,0)&&Ze(r,V.z,V.enter)||T(e.HeroID,1)&&Ze(r,V.x,V.shift)||T(e.HeroID,2)&&Ze(r,V.c,V.ctrl);if(T(i.actcon,1)&&U(i.timer,i.timermax)&&a&&T(e.gooffscreen,0)&&e.visible&&(e.draw_button_press=0,e.mykeybuffer=3,i.playerinput=1),T(i.actcon,0)||(e.actoncondelay=1),n(r,`obj_battleblcon`)&&(e.actoncondelay=0),T(e.disabled,1)&&(e.disabledtimer--,_(e.disabledtimer,0)&&(e.disabled=0)),T(e.con,0)&&(e.siner+=.4,T(e.gooffscreen,0)&&(e.x=e.xstart+Math.sin(e.siner/6)*3),f(e.mykeybuffer,0)&&T(e.disabled,0))){e.con=1,e.dashtimer=0,e.damaged=0;for(let e of r.all(t(`o_coaster_controller_sneo`)))e.buttonspressed++}T(e.con,1)&&(T(e.nitro,0)&&(e.hspeed+=4,f(e.hspeed,30)&&(e.hspeed=30)),T(e.nitro,1)&&(e.hspeed+=8,f(e.hspeed,60)&&(e.hspeed=60)),e.smoketimer+=2,O(e.smoketimer,3)&&(e.smoke=r.create(t(`o_coastersmoke`),e.x+e.hspeed+8,e.y-10).id,e.smoketimer=0),O(e.x,r.view.x+200)&&(e.con=2),T(e.damaged,1)&&(e.con=5,e.hspeed=T(e.nitro,1)?-200:-48)),T(e.con,2)&&(T(e.damaged,1)&&(e.con=5),O(e.hspeed,-6)&&(e.hspeed-=2),T(e.nitro,1)&&(e.hspeed--,O(e.x,r.view.x+400)&&f(e.hspeed,0)&&(e.hspeed=-2)),_(e.x,e.xstart+10)&&(e.damaged=0,e.hspeed=0,e.siner=0,e.con=0)),T(e.con,5)&&(e.hspeed=T(e.nitro,1)?-100:-30,_(e.x,e.xstart-e.hspeed)&&(e.hspeed=0,e.damaged=0,e.siner=0,e.con=0)),e.mykeybuffer--,T(e.gooffscreen,2)&&T(e.HeroID,0)&&(e.x-=2)},endStep:(e,t)=>{for(let r=0;r<3;r++)if(T(e.HeroID,r)){e.depth=[80,75,70][r];let i=n(t,un[r]);i&&(i.depth=e.depth+1)}let r=n(t,`obj_encounterbasic`);if(r)for(let n=1;n<3;n++)T(e.HeroID,n)&&(t.byId(r.c[n]).depth=e.depth+1)},draw:(e,a)=>{let o=[0,1,2].map(t=>i(e,a,t)),s=o.map(e=>[e.x+e.sinerx+e.coaster_offset_x+e.target_x_end,e.y+e.sinery+e.coaster_offset_y]),c=un.findIndex((t,n)=>T(e.HeroID,n)),l=s[c],u=o[c],d=c>=0?n(a,un[c]):void 0,p=[1705,1715,1710][c],m=[101,182,260][c];if(T(e.lerpstate,0)&&(U(e.lerptimer,10)&&e.lerptimer++,c>=0&&(e.x=ln(l[0],p,e.lerptimer/10),e.y=ln(l[1],m,e.lerptimer/10)),f(e.lerptimer,9)&&n(a,`obj_herokris`)&&(e.lerptimer=0,e.lerpstate=1)),T(e.lerpstate,1)&&d&&(e.x=d.x-[15,5,10][c]),T(e.lerpstate,2)){if(e.lerptimer++,c>=0&&(e.x=ln(p,l[0],e.lerptimer/5),e.y=ln(m,l[1],e.lerptimer/5)),d&&(d.x=ln([1710,1717,1712][c],u.x+u.sinerx+u.character_offset_x+u.target_x_end,e.lerptimer/5)),T(c,2)&&d&&(d.y+=.5),T(e.lerptimer,4))for(let e of a.all(t(`obj_coaster`)))e.visible=!0;if(f(e.lerptimer,4)){for(let e of a.all(t(`obj_coaster`)))e.visible=!0;r(a,`obj_heroparent`),r(a,`o_coaster_hero_sneo`),r(a,`o_coaster_hero_back_sneo`),r(a,`o_coaster_controller_sneo`);return}}let h=a.byId(e.back);h.x=e.x+1,h.y=e.y,a.drawSprite(e.sprite,e.imageIndex,e.x,e.y,e.imageXscale,e.imageYscale,0,M.white,e.imageAlpha)}}},{name:`o_coaster_hero_back_sneo`,index:701,sprite:`spr_sneo_car_back`,depth:0,events:{create:(e,t)=>{e.depth=n(t,`o_coaster_hero_sneo`).depth+20,e.imageSpeed=0,e.imageXscale=2,e.imageYscale=2;let r=n(t,`obj_encounterbasic`);r&&(e.depth=t.byId(r.c[0]).depth+1)},step:(e,t)=>{e.depth=t.byId(e.parentid).depth+2;let r=n(t,`obj_encounterbasic`);r&&(e.depth=t.byId(r.c[0]).depth+1)},draw:(e,t)=>t.drawSelf(e)}},{name:`obj_coaster`,index:1126,sprite:`spr_kris_coaster_hurt_front`,depth:0,events:{create:(t,n)=>{let r=(e.room??n.room.name)===`room_dw_mansion_b_east`;Object.assign(t,{type:0,init:!1,con:0,actor:-1,spam_car:r,default_sprite_front:r?`spr_sneo_car_front`:`spr_kris_coaster_front`,default_sprite_back:r?`spr_sneo_car_back`:`spr_kris_coaster_back`,hurt_sprite_front:r?`spr_sneo_car_front`:`spr_kris_coaster_hurt_front`,hurt_sprite_back:r?`spr_sneo_car_back`:`spr_kris_coaster_hurt_back`,hurt_character_sprite:`spr_krisb_hurt`,character_sprite:`spr_krisr_dark`,character_offset_x:0,character_offset_y:0,character_speed:.25,coaster_offset_x:-25,coaster_offset_y:40,hurt:!1,siner:0,stop_siner:0,target_x:0,target_x_end:0,animate:!1,siner0:0,siner_add0:0,siner_amplitude0:10,siner_direction0:0,siner_type0:`sin`,siner_visual0:1,sinerx:0,sinery:0,battlecoasterx:0}),t.imageSpeed=1},step:(e,n)=>{if(!e.init){let r=pn.findIndex((t,n)=>T(e.type,n));if(T(r,0)&&(e.character_sprite=`spr_krisr_dark`),T(r,1)||T(r,2)||T(r,3)){let t=pn[r];e.default_sprite_front=e.spam_car&&U(r,3)?`spr_sneo_car_front`:t.front,e.default_sprite_back=e.spam_car&&U(r,3)?`spr_sneo_car_back`:t.back,e.hurt_sprite_front=t.hurtFront,e.hurt_sprite_back=t.hurtBack,e.hurt_character_sprite=t.hurtCharacter,e.character_sprite=t.character,e.coaster_offset_x=t.x,e.coaster_offset_y=t.y}if(T(r,4)&&(e.default_sprite_front=`spr_noelle_coaster_front`,e.default_sprite_back=-1,e.character_sprite=`spr_noelle_walk_left_dw`,e.coaster_offset_x=-65,e.coaster_offset_y=45),O(r,0)&&_(r,4)){e.init=!0;let r=mn(e,n,t,0,0,e.character_sprite);e.actor=r.id,r.imageSpeed=0,r.visible=!1}}let r=n.byId(e.actor);if(e.character_sprite!==r.sprite&&(r.sprite=e.character_sprite,r.imageIndex=0),T(e.con,0)?r.imageSpeed=e.animate?.25:0:(e.imageSpeed=0,T(e.type,0)&&U(r.imageIndex,6)&&(r.imageIndex+=.25),T(e.type,1)&&U(r.imageIndex,5)&&(r.imageIndex+=.25),T(e.type,2)&&U(r.imageIndex,10)&&(r.imageIndex+=.5)),T(e.stop_siner,1)){e.sinerx=0,e.battlecoasterx=n.view.x+122-e.type*20,T(e.type,3)&&(e.battlecoasterx=n.view.x+515),T(e.type,0)&&(e.battlecoasterx+=4);for(let t=0;t<4;t++)U(e.x,e.battlecoasterx)&&e.x++,f(e.x,e.battlecoasterx)&&e.x--}else if(e.sinerx=0,e.sinery=0,!T(e.siner_add0,0)){e.siner0+=e.siner_add0,e.sinmove=(e.siner_type0===`sin`?Math.sin(e.siner0):Math.cos(e.siner0))*e.siner_amplitude0;let t=x(e.sinmove,e.siner_direction0),n=A(e.sinmove,e.siner_direction0);T(e.siner_visual0,1)?(e.sinerx+=t,e.sinery+=n):(e.x+=t,e.y+=n)}},draw:(e,t)=>{e.animate&&e.siner++;let n=(e,n,r,i)=>t.drawSprite(e,n,r,i,2,2,0,M.white,1);if(e.hurt)n(e.hurt_sprite_back,e.imageIndex,e.x+e.coaster_offset_x,e.y+e.coaster_offset_y),n(e.hurt_character_sprite,e.imageIndex,e.x+e.sinerx+e.character_offset_x,e.y+e.sinery+e.character_offset_y),n(e.hurt_sprite_front,e.imageIndex,e.x+e.coaster_offset_x,e.y+e.coaster_offset_y);else{e.default_sprite_back!==-1&&n(e.default_sprite_back,e.imageIndex,e.x+e.sinerx+e.coaster_offset_x,e.y+e.sinery+e.coaster_offset_y);let r=t.byId(e.actor);n(r.sprite,r.imageIndex,e.x+e.sinerx+e.character_offset_x,e.y+e.sinery+e.character_offset_y),n(e.default_sprite_front,e.imageIndex,e.x+e.sinerx+e.coaster_offset_x,e.y+e.sinery+e.coaster_offset_y)}}}},{name:`o_coastersmoke`,index:505,sprite:`spr_coaster_explosion`,depth:0,events:{create:(e,t)=>{e.imageXscale=2,e.imageSpeed=1,e.hspeed=-2,e.vspeed=-2+t.random.random(2),e.depth=9e4},step:(e,t)=>{e.hspeed-=2,O(e.imageIndex,4)&&t.destroy(e)}}}]}var yn={viewX:1640,viewY:0,con:8,fightmode:1,trackspeed:-15,trackY:[70,150,230],alarm0:120,coasters:[[1721,60,.1],[1718,125,.08],[1727,215,.09]]};function bn(e,t,n){if(e.view.x!==1640||e.view.y!==0)throw Error(`Native NEO coaster snapshot requires camera (1640,0)`);let r=yn,i=e.restore(t.object(`obj_ch2_sceneex2`),e.nextId++,e.view.x,0);gn(i),Object.assign(i,{con:r.con,customcon:1,fightmode:1,trackspeed:r.trackspeed,tracky0:70,tracky1:150,tracky2:230,cityscape_active:!0,sneo:n.id,shortened:!1,special_scene:!1}),i.alarm[0]=r.alarm0;let a=[`spr_krisb_defeat`,`spr_susie_shock_r`,`spr_ralsei_surprised_down`];for(let n=0;n<3;n++){let[o,s,c]=r.coasters[n],l=e.create(t.object(`obj_coaster`),o,s);l.type=n,D(l.object,`step`)(l,e),l.character_sprite=a[n],l.siner_add0=c,l.visible=!1,l.depth=[9e4,8e4,7e4][n],n===2&&(l.character_offset_x=-10),i[dn[n]]=l.id}return e.create(t.object(`o_coaster_controller_sneo`),i.x,i.y),e.globals.tempflag[32]=1,e.globals.flag[54]=571,e.globals.flag[9]=1,i}function xn(e){return{...e,scripts:{...xt,...cn,...e.scripts}}}function Sn(e){let t={},n=xn({...e,object:n=>t[n]??e.object(n)});for(let[e,r]of Object.entries(sn))t[e]=G(n,r.metadata,r.sources);let r=t.obj_ch2_sceneex2,i={...e,object:n.object,worldCreate:(e,t)=>r.events.create(e,t),worldStep:(e,t)=>r.events.step(e,t),finishBattleAudio:(e,t)=>{n.call(`snd_free`,e,t,[t.globals.batmusic[0]]),n.call(`snd_volume`,e,t,[t.globals.currentsong[1],0,0]),n.call(`snd_resume`,e,t,[t.globals.currentsong[1]]),n.call(`snd_volume`,e,t,[t.globals.currentsong[1],1,20])}};for(let e of vn(i))t[e.name]=e;return t}function Cn(e,t,n){return bn(e,{...t,finishBattleAudio:()=>{throw Error(`Snapshot setup must not finish battle audio`)}},n)}var wn={scr_damage:`function scr_damage()
{
    if (global.inv < 0)
    {
        scr_damage_cache();
        var __element = 0;
        if (variable_instance_exists(id, "element"))
        {
            if (is_real(element))
            {
                __element = element;
            }
        }
        if (target < 3)
        {
            if (global.hp[global.char[target]] <= 0)
            {
                scr_randomtarget_old();
                target = mytarget;
                with (global.charinstance[target])
                {
                    image_blend = c_white;
                    darkify = 0;
                }
            }
        }
        var __remtarget = -1;
        if (target == 4)
        {
            __remtarget = 4;
            scr_randomtarget_old();
            target = mytarget;
            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))
            {
                scr_randomtarget_old();
                target = mytarget;
            }
            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))
            {
                scr_randomtarget_old();
                target = mytarget;
            }
            if (target == 0 && (global.hp[global.char[target]] / global.maxhp[global.char[target]]) < 0.35)
            {
                scr_randomtarget_old();
                target = mytarget;
            }
            with (global.charinstance[target])
            {
                image_blend = c_white;
                darkify = 0;
            }
        }
        chartarget = 3;
        tdamage = damage;
        var oldcalculation = 0;
        if (target < 3)
        {
            if (oldcalculation)
            {
                tdamage = ceil(tdamage - (global.battledf[target] * 3));
            }
            else
            {
                tdamage = scr_damage_calculation(tdamage, target);
            }
            chartarget = global.char[target];
            if (global.charaction[target] == 10)
            {
                tdamage = ceil((2 * tdamage) / 3);
            }
            tdamage = ceil(tdamage * scr_element_damage_reduction(__element, global.char[target]));
            if (tdamage < 1)
            {
                tdamage = 1;
            }
        }
        if (!instance_exists(obj_shake))
        {
            instance_create(0, 0, obj_shake);
        }
        with (global.charinstance[target])
        {
            hurt = 1;
            hurttimer = 0;
        }
        hpdiff = tdamage;
        with (obj_dmgwriter)
        {
            if (delaytimer >= 1)
            {
                killactive = 1;
            }
        }
        doomtype = -1;
        with (obj_heart)
        {
            dmgnoise = 1;
        }
        if (target < 3)
        {
            if (global.hp[chartarget] <= 0)
            {
                doomtype = 4;
                global.hp[chartarget] -= round(tdamage / 4);
                hpdiff = round(tdamage / 4);
            }
            else
            {
                global.hp[chartarget] -= tdamage;
                if (global.chapter == 2 && instance_exists(obj_gigaqueen_enemy) && global.hp[chartarget] <= 0)
                {
                    global.hp[chartarget] = 1;
                    with (o_boxingcontroller)
                    {
                        event_user(3);
                    }
                }
                if (global.hp[chartarget] <= 0)
                {
                    hpdiff = abs(global.hp[chartarget] - (global.maxhp[chartarget] / 2));
                    doomtype = 4;
                    global.hp[chartarget] = round(-global.maxhp[chartarget] / 2);
                    scr_dead(target);
                }
            }
            dmgwriter = instance_create(global.charinstance[target].x, (global.charinstance[target].y + global.charinstance[target].myheight) - 24, obj_dmgwriter);
            dmgwriter.damage = hpdiff;
            dmgwriter.type = doomtype;
        }
        if (target == 3)
        {
            for (hpi = 0; hpi < 3; hpi += 1)
            {
                chartarget = global.char[hpi];
                if (global.hp[chartarget] >= 0)
                {
                    if (oldcalculation)
                    {
                        tdamage = ceil(tdamage - (global.battledf[hpi] * 3));
                    }
                    else
                    {
                        tdamage = scr_damage_calculation(tdamage, hpi);
                    }
                    tdamage = ceil(tdamage * scr_element_damage_reduction(__element, chartarget));
                    if (global.charaction[hpi] == 10)
                    {
                        global.hp[chartarget] -= ceil((3 * tdamage) / 4);
                    }
                    else
                    {
                        global.hp[chartarget] -= tdamage;
                    }
                    if (global.hp[chartarget] <= 0)
                    {
                        global.hp[chartarget] = round(-global.maxhp[0] / 2);
                    }
                }
            }
        }
        global.inv = global.invc * 40;
        scr_damage_check();
        gameover = 1;
        if (global.char[0] != 0 && global.hp[global.char[0]] > 0)
        {
            gameover = 0;
        }
        if (global.char[1] != 0 && global.hp[global.char[1]] > 0)
        {
            gameover = 0;
        }
        if (global.char[2] != 0 && global.hp[global.char[2]] > 0)
        {
            gameover = 0;
        }
        if (gameover == 1)
        {
            scr_gameover();
        }
        if (__remtarget != -1)
        {
            target = __remtarget;
        }
    }
}
`,scr_damage_all:`function scr_damage_all()
{
    if (global.inv < 0)
    {
        scr_damage_cache();
        remdamage = damage;
        _temptarget = target;
        for (ti = 0; ti < 3; ti += 1)
        {
            global.inv = -1;
            damage = remdamage;
            target = ti;
            if (global.hp[global.char[ti]] > 0 && global.char[ti] != 0)
            {
                scr_damage();
            }
        }
        global.inv = global.invc * 40;
        target = _temptarget;
        scr_damage_check();
    }
}
`,scr_damage_cache:`function scr_damage_cache()
{
    global.damage_cache = [];
    for (var i = 0; i < 3; i++)
    {
        global.damage_cache[array_length(global.damage_cache)] = global.hp[global.char[i]];
    }
}

function scr_damage_check()
{
    if (!variable_global_exists("damage_cache"))
    {
        global.damage_cache = [];
    }
    var took_damage = false;
    for (var i = 0; i < array_length(global.damage_cache); i++)
    {
        var hp_cache = global.damage_cache[i];
        if (global.hp[global.char[i]] < hp_cache)
        {
            took_damage = true;
            break;
        }
    }
    if (took_damage)
    {
        with (obj_event_manager)
        {
            trigger_event(UnknownEnum.Value_1);
        }
    }
}

enum UnknownEnum
{
    Value_1 = 1
}
`,scr_damage_check:`function scr_damage_cache()
{
    global.damage_cache = [];
    for (var i = 0; i < 3; i++)
    {
        global.damage_cache[array_length(global.damage_cache)] = global.hp[global.char[i]];
    }
}

function scr_damage_check()
{
    if (!variable_global_exists("damage_cache"))
    {
        global.damage_cache = [];
    }
    var took_damage = false;
    for (var i = 0; i < array_length(global.damage_cache); i++)
    {
        var hp_cache = global.damage_cache[i];
        if (global.hp[global.char[i]] < hp_cache)
        {
            took_damage = true;
            break;
        }
    }
    if (took_damage)
    {
        with (obj_event_manager)
        {
            trigger_event(UnknownEnum.Value_1);
        }
    }
}

enum UnknownEnum
{
    Value_1 = 1
}
`,scr_damage_calculation:`function scr_damage_calculation(arg0, arg1)
{
    var _tdamage = arg0;
    var _tdef = global.battledf[arg1];
    var _tmaxhp = global.maxhp[global.char[arg1]];
    var _finaldamage = 1;
    var _hpthresholda = _tmaxhp / 5;
    var _hpthresholdb = _tmaxhp / 8;
    for (var _di = 0; _di < _tdef; _di++)
    {
        if (_tdamage > _hpthresholda)
        {
            _tdamage -= 3;
        }
        else if (_tdamage > _hpthresholdb)
        {
            _tdamage -= 2;
        }
        else
        {
            _tdamage -= 1;
        }
    }
    return max(_tdamage, _finaldamage);
}
`,scr_damage_sneo_final_attack:`function scr_damage_sneo_final_attack()
{
    if (global.inv < 0)
    {
        scr_damage_cache();
        var __element = 0;
        if (variable_instance_exists(id, "element"))
        {
            if (is_real(element))
            {
                __element = element;
            }
        }
        if (target < 3)
        {
            if (global.hp[global.char[target]] <= 0)
            {
                scr_randomtarget_old();
                target = mytarget;
                with (global.charinstance[target])
                {
                    image_blend = c_white;
                    darkify = 0;
                }
            }
        }
        var __remtarget = -1;
        if (target == 4)
        {
            __remtarget = 4;
            scr_randomtarget_old();
            target = mytarget;
            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))
            {
                scr_randomtarget_old();
                target = mytarget;
            }
            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))
            {
                scr_randomtarget_old();
                target = mytarget;
            }
            if (target == 0 && (global.hp[global.char[target]] / global.maxhp[global.char[target]]) < 0.35)
            {
                scr_randomtarget_old();
                target = mytarget;
            }
            with (global.charinstance[target])
            {
                image_blend = c_white;
                darkify = 0;
            }
        }
        chartarget = 3;
        tdamage = damage;
        var oldcalculation = 0;
        if (target < 3)
        {
            chartarget = global.char[target];
            if (global.charaction[target] == 10)
            {
                tdamage = ceil((2 * tdamage) / 2);
            }
            tdamage = ceil(tdamage * scr_element_damage_reduction(__element, global.char[target]));
            if (tdamage < 1)
            {
                tdamage = 1;
            }
        }
        if (!instance_exists(obj_shake))
        {
            instance_create(0, 0, obj_shake);
        }
        with (global.charinstance[target])
        {
            hurt = 1;
            hurttimer = 0;
        }
        hpdiff = tdamage;
        with (obj_dmgwriter)
        {
            if (delaytimer >= 1)
            {
                killactive = 1;
            }
        }
        doomtype = -1;
        with (obj_heart)
        {
            dmgnoise = 1;
        }
        if (target < 3)
        {
            if (global.hp[chartarget] <= 0)
            {
                doomtype = 4;
                global.hp[chartarget] -= round(tdamage / 4);
                hpdiff = round(tdamage / 4);
            }
            else
            {
                global.hp[chartarget] -= tdamage;
                if (global.hp[chartarget] <= 0)
                {
                    hpdiff = abs(global.hp[chartarget] - (global.maxhp[chartarget] / 2));
                    doomtype = 4;
                    global.hp[chartarget] = round(-global.maxhp[chartarget] / 2);
                    scr_dead(target);
                }
            }
            dmgwriter = instance_create(global.charinstance[target].x, (global.charinstance[target].y + global.charinstance[target].myheight) - 24, obj_dmgwriter);
            dmgwriter.damage = hpdiff;
            dmgwriter.type = doomtype;
        }
        if (target == 3)
        {
            for (hpi = 0; hpi < 3; hpi += 1)
            {
                chartarget = global.char[hpi];
                if (global.hp[chartarget] >= 0)
                {
                    if (oldcalculation)
                    {
                        tdamage = ceil(tdamage - (global.battledf[hpi] * 3));
                    }
                    else
                    {
                        tdamage = scr_damage_calculation(tdamage, hpi);
                    }
                    tdamage = ceil(tdamage * scr_element_damage_reduction(__element, chartarget));
                    if (global.charaction[hpi] == 10)
                    {
                        global.hp[chartarget] -= ceil((3 * tdamage) / 4);
                    }
                    else
                    {
                        global.hp[chartarget] -= tdamage;
                    }
                    if (global.hp[chartarget] <= 0)
                    {
                        global.hp[chartarget] = round(-global.maxhp[0] / 2);
                    }
                }
            }
        }
        global.inv = global.invc * 40;
        scr_damage_check();
        gameover = 1;
        if (global.char[0] != 0 && global.hp[global.char[0]] > 0)
        {
            gameover = 0;
        }
        if (global.char[1] != 0 && global.hp[global.char[1]] > 0)
        {
            gameover = 0;
        }
        if (global.char[2] != 0 && global.hp[global.char[2]] > 0)
        {
            gameover = 0;
        }
        if (gameover == 1)
        {
            scr_gameover();
        }
        if (__remtarget != -1)
        {
            target = __remtarget;
        }
    }
}
`,scr_randomtarget_old:`function scr_randomtarget_old()
{
    abletotarget = 1;
    if (global.charcantarget[0] == 0 && global.charcantarget[1] == 0 && global.charcantarget[2] == 0)
    {
        abletotarget = 0;
    }
    mytarget = choose(0, 1, 2);
    if (abletotarget == 1)
    {
        while (global.charcantarget[mytarget] == 0)
        {
            mytarget = choose(0, 1, 2);
        }
    }
    else
    {
        mytarget = 3;
    }
    global.targeted[mytarget] = 1;
}
`,scr_party_hpaverage:`function scr_party_hpaverage()
{
    var _totalhp = 0;
    var _totalmaxhp = 0;
    var _members = 0;
    for (var _hpi = 0; _hpi < 3; _hpi++)
    {
        if (global.char[_hpi] > 0)
        {
            _members++;
            _totalhp += global.hp[global.char[_hpi]];
            _totalmaxhp += global.maxhp[global.char[_hpi]];
        }
    }
    if (_totalhp > 0)
    {
        return floor(_totalhp / _totalmaxhp);
    }
    else
    {
        return 0;
    }
}
`,scr_element_damage_reduction:`function scr_element_damage_reduction(arg0, arg1)
{
    var ___element = arg0;
    var ___char = arg1;
    var ___reduction = 1;
    if (___element != 0)
    {
        for (var ___itemi = 0; ___itemi < 2; ___itemi++)
        {
            if (global.itemelement[___char][___itemi + 1] != 0)
            {
                if (global.itemelement[___char][___itemi + 1] == ___element)
                {
                    ___reduction -= global.itemelementamount[___char][___itemi + 1];
                }
                if (global.itemelement[___char][___itemi + 1] == 9)
                {
                    if (___element == 2 || ___element == 8)
                    {
                        ___reduction -= global.itemelementamount[___char][___itemi + 1];
                    }
                }
                if (global.itemelement[___char][___itemi + 1] == 10)
                {
                    ___reduction -= global.itemelementamount[___char][___itemi + 1];
                }
            }
        }
    }
    if (___reduction < 0.25)
    {
        ___reduction = 0.25;
    }
    return ___reduction;
}
`,scr_dead:`function scr_dead(arg0)
{
    global.charmove[arg0] = 0;
    global.charcantarget[arg0] = 0;
    global.chardead[arg0] = 1;
    global.charaction[arg0] = 0;
    global.charspecial[arg0] = 0;
}
`,scr_tensionheal:`function scr_tensionheal(arg0)
{
    global.tension += arg0;
    if (global.tension > global.maxtension)
    {
        global.tension = global.maxtension;
    }
}
`,scr_heartcolor:`function scr_heartcolor(arg0)
{
    __heartcolor = arg0;
    if (__heartcolor == "red" || __heartcolor == 0)
    {
        with (obj_heart)
        {
            color = 0;
            sprite_index = spr_heart;
        }
    }
    if (__heartcolor == "yellow" || __heartcolor == 1)
    {
        with (obj_heart)
        {
            color = 1;
            sprite_index = spr_yellowheart;
        }
        obj_grazebox.sprite_index = spr_grazeappear_yellow;
    }
}
`,scr_moveheart:`function scr_moveheart()
{
    global.inv = 0;
    if (global.chapter == 2 && instance_exists(obj_gigaqueen_enemy))
    {
        return instance_create(o_boxingcontroller.x + 4, o_boxingcontroller.y - 120, obj_moveheart);
    }
    else
    {
        return instance_create(obj_herokris.x + 10, obj_herokris.y + 40, obj_moveheart);
    }
}
`,scr_act_charsprite:`function scr_act_charsprite(arg0, arg1, arg2, arg3)
{
    _charactor = arg0;
    _charinstance = obj_herokris;
    if (_charactor == "noelle")
    {
        _charinstance = obj_heronoelle;
        _charnum = 4;
    }
    if (_charactor == "ralsei")
    {
        _charinstance = obj_heroralsei;
        _charnum = 3;
    }
    if (_charactor == "susie")
    {
        _charinstance = obj_herosusie;
        _charnum = 2;
    }
    if (_charactor == "kris")
    {
        _charinstance = obj_herokris;
        _charnum = 1;
    }
    __returnvalue = _charactsprite[_charnum];
    if (i_ex(_charinstance))
    {
        with (_charinstance)
        {
            image_alpha = 0;
            state = 0;
            global.faceaction[myself] = 0;
        }
        _charactsprite[_charnum] = scr_dark_marker(_charinstance.x, _charinstance.y, arg1);
        with (_charactsprite[_charnum])
        {
            depth = 20 - (__view_get(e__VW.YView, 0) / 40);
            scr_oflash();
            if (arg2 > 0 && arg3 == 0)
            {
                scr_animate(0, 0, arg2);
            }
            if (arg2 > 0 && arg3 == 1)
            {
                image_speed = arg2;
            }
            a = scr_afterimage();
            a.hspeed = 2.5;
            a.depth = depth + 1;
            b = scr_afterimage();
            b.image_alpha = 0.6;
            b.hspeed = 5;
            b.depth = depth + 2;
        }
        __returnvalue = _charactsprite[_charnum];
    }
    return __returnvalue;
}

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`,scr_act_charsprite_end:`function scr_act_charsprite_end()
{
    for (i = 0; i < 10; i++)
    {
        with (_charactsprite[i])
        {
            instance_destroy();
        }
    }
    with (obj_heroparent)
    {
        if (image_alpha == 0)
        {
            image_alpha = 1;
            acttimer = 0;
            state = 0;
            global.faceaction[myself] = 0;
        }
    }
}
`,scr_smallface:`function scr_smallface(arg0, arg1, arg2, arg3, arg4, arg5)
{
    scr_smallface_reset(arg0);
    global.smsprite[arg0] = spr_face_susie_alt;
    if (is_string(arg1))
    {
        if (arg1 == "susie")
        {
            global.smsprite[arg0] = spr_face_susie_alt;
        }
        if (arg1 == "ralsei")
        {
            global.smsprite[arg0] = spr_face_r_nohat;
        }
        if (arg1 == "lancer")
        {
            global.smsprite[arg0] = spr_face_l0;
        }
        if (arg1 == "noelle")
        {
            global.smsprite[arg0] = spr_face_n_matome;
        }
        if (arg1 == "noelle_cropped")
        {
            global.smsprite[arg0] = spr_face_n_matome_cropped;
        }
        if (arg1 == "queen")
        {
            global.smsprite[arg0] = scr_84_get_sprite("spr_face_queen");
        }
        if (arg1 == "rouxls")
        {
            global.smsprite[arg0] = spr_face_rurus;
        }
        if (arg1 == "berdly")
        {
            global.smsprite[arg0] = spr_face_berdly_dark;
        }
        if (arg1 == "rudy")
        {
            global.smsprite[arg0] = spr_face_rudy;
        }
        if (arg1 == "none" || arg1 == "empty")
        {
            global.smsprite[arg0] = spr_empty;
        }
    }
    else
    {
        global.smsprite[arg0] = arg1;
        if (arg1 == 0)
        {
            global.smsprite[arg0] = spr_empty;
        }
    }
    global.smimage[arg0] = arg2;
    if (is_string(arg3))
    {
        if (global.fighting == 1)
        {
            if (arg3 == "left")
            {
                global.smxx[arg0] = 60;
            }
            if (arg3 == "leftmid")
            {
                global.smxx[arg0] = 160;
            }
            if (arg3 == "mid" || arg3 == "middle")
            {
                global.smxx[arg0] = 260;
            }
            if (arg3 == "rightmid")
            {
                global.smxx[arg0] = 360;
            }
            if (arg3 == "right")
            {
                global.smxx[arg0] = 460;
            }
        }
        else
        {
            if (arg3 == "left")
            {
                global.smxx[arg0] = 70;
            }
            if (arg3 == "leftmid")
            {
                global.smxx[arg0] = 160;
            }
            if (arg3 == "mid" || arg3 == "middle")
            {
                global.smxx[arg0] = 260;
            }
            if (arg3 == "rightmid")
            {
                global.smxx[arg0] = 360;
            }
            if (arg3 == "right")
            {
                global.smxx[arg0] = 400;
            }
        }
    }
    else
    {
        global.smxx[arg0] = arg3;
    }
    if (is_string(arg4))
    {
        if (global.fighting == 1)
        {
            if (arg4 == "top")
            {
                global.smyy[arg0] = -10;
            }
            if (arg4 == "mid" || arg4 == "middle")
            {
                global.smyy[arg0] = 30;
            }
            if (arg4 == "bottommid")
            {
                global.smyy[arg0] = 45;
            }
            if (arg4 == "bottom")
            {
                global.smyy[arg0] = 56;
            }
            if (arg4 == "bottom" || arg4 == "bottommid")
            {
                global.smdir[arg0] = 90;
                global.smspeed[arg0] = 4;
                global.smalarm[arg0] = 10;
                global.smyy[arg0] += 40;
                global.smxx[arg0] -= 40;
            }
        }
        else
        {
            if (arg4 == "top")
            {
                global.smyy[arg0] = -10;
            }
            if (arg4 == "mid" || arg4 == "middle")
            {
                global.smyy[arg0] = 30;
            }
            if (arg4 == "bottommid")
            {
                global.smyy[arg0] = 50;
            }
            if (arg4 == "bottom")
            {
                global.smyy[arg0] = 68;
            }
            if (global.darkzone == 0)
            {
                if (arg4 == "top")
                {
                    global.smyy[arg0] = 160;
                }
                if (arg4 == "mid" || arg4 == "middle")
                {
                    global.smyy[arg0] = 200;
                }
                if (arg4 == "bottommid")
                {
                    global.smyy[arg0] = 240;
                }
                if (arg4 == "bottom")
                {
                    global.smyy[arg0] = 240;
                }
            }
        }
    }
    else
    {
        global.smyy[arg0] = arg4;
    }
    global.smstring[arg0] = arg5;
}
`,scr_smallface_reset:`function scr_smallface_reset(arg0)
{
    global.smalarm[arg0] = 5;
    global.smyy[arg0] = 70;
    global.smxx[arg0] = 170;
    global.smdir[arg0] = 180;
    global.smspeed[arg0] = 10;
    global.smtype[arg0] = 3;
    global.smimage[arg0] = global.fe;
    global.smimagespeed[arg0] = 0;
    global.smsprite[arg0] = spr_face_s6;
    global.smcolor[arg0] = c_white;
    global.smstring[arg0] = stringsetloc("* ... what?", "scr_smallface_reset_slash_scr_smallface_reset_gml_12_0");
}
`,scr_cutscene_loaded:`function scr_cutscene_loaded()
{
    var __loadedState = 0;
    if (instance_exists(obj_cutscene_master))
    {
        if (obj_cutscene_master.loadedState == 1)
        {
            __loadedState = 1;
        }
    }
    return __loadedState;
}
`,scr_afterimage:`function scr_afterimage()
{
    afterimage = instance_create(x, y, obj_afterimage);
    afterimage.sprite_index = sprite_index;
    afterimage.image_index = image_index;
    afterimage.image_blend = image_blend;
    afterimage.image_speed = 0;
    afterimage.depth = depth;
    afterimage.image_xscale = image_xscale;
    afterimage.image_yscale = image_yscale;
    afterimage.image_angle = image_angle;
    return afterimage;
}
`,scr_afterimage_cut:`function scr_afterimage_cut()
{
    afterimage = instance_create(x, y, obj_afterimage_cut);
    afterimage.sprite_index = sprite_index;
    afterimage.image_index = image_index;
    afterimage.image_blend = image_blend;
    afterimage.image_speed = 0;
    afterimage.depth = depth;
    afterimage.image_xscale = image_xscale;
    afterimage.image_yscale = image_yscale;
    afterimage.image_angle = image_angle;
    with (afterimage)
    {
        event_user(0);
    }
    return afterimage;
}
`,scr_afterimage_grow:`function scr_afterimage_grow()
{
    afterimage = instance_create(x, y, obj_afterimage_grow);
    afterimage.sprite_index = sprite_index;
    afterimage.image_index = image_index;
    afterimage.image_blend = image_blend;
    afterimage.image_speed = 0;
    afterimage.depth = depth;
    afterimage.image_xscale = image_xscale;
    afterimage.image_yscale = image_yscale;
    afterimage.image_angle = image_angle;
    return afterimage;
}
`,scr_animate:`function scr_animate(arg0, arg1, arg2)
{
    __animator = instance_create(x, y, obj_animator);
    __animator.target = id;
    __animator.initframe = arg0;
    __animator.endframe = arg1;
    __animator.fake_image_speed = arg2;
    return __animator;
}
`,scr_dark_marker:`function scr_dark_marker(arg0, arg1, arg2)
{
    thismarker = instance_create(arg0, arg1, obj_marker);
    with (thismarker)
    {
        sprite_index = arg2;
        image_speed = 0;
        image_xscale = 2;
        image_yscale = 2;
    }
    return thismarker;
}
`,scr_oflash:`function scr_oflash()
{
    _oflash = instance_create(x, y, obj_oflash);
    _oflash.image_xscale = image_xscale;
    _oflash.image_speed = 0;
    _oflash.image_index = image_index;
    _oflash.image_yscale = image_yscale;
    if (global.chapter == 2 && object_index == obj_mauswheel_enemy)
    {
        _oflash.sprite_index = spr_mauswheel_idle;
    }
    else
    {
        _oflash.sprite_index = sprite_index;
    }
    _oflash.depth = depth - 1;
    _oflash.target = id;
    return _oflash;
}
`,scr_armorcheck_equipped_party:`function scr_armorcheck_equipped_party(arg0)
{
    var __totalwearing = 0;
    for (var __weari = 0; __weari < 3; __weari++)
    {
        if (global.char[__weari] != 0)
        {
            __totalwearing += scr_armorcheck_equipped(global.char[__weari], arg0);
        }
    }
    return __totalwearing;
}
`,scr_armorcheck_equipped:`function scr_armorcheck_equipped(arg0, arg1)
{
    var __wearing = 0;
    if (global.chararmor1[arg0] == arg1)
    {
        __wearing++;
    }
    if (global.chararmor2[arg0] == arg1)
    {
        __wearing++;
    }
    return __wearing;
}
`,scr_script_delayed:`function scr_script_delayed()
{
    var __scriptdelay = instance_create(0, 0, obj_script_delayed);
    __scriptdelay.script = argument[0];
    __scriptdelay.alarm[0] = argument[1];
    __scriptdelay.target = id;
    for (var __i = 0; __i < (argument_count - 2); __i++)
    {
        __scriptdelay.script_arg[__i] = argument[__i + 2];
    }
    __scriptdelay.arg_count = argument_count - 2;
    return __scriptdelay;
}
`,ease_out_elastic:`function ease_out_elastic(arg0, arg1, arg2, arg3)
{
    var _s = 1.70158;
    var _p = 0;
    var time = arg0;
    var start = arg1;
    var change = arg2;
    var duration = arg3;
    if (time == 0 || change == 0)
    {
        return start;
    }
    time /= duration;
    if (time == 1)
    {
        return start + arg2;
    }
    if (!_p)
    {
        _p = duration * 0.3;
    }
    if (change < abs(arg2))
    {
        change = arg2;
        _s = _p * 0.25;
    }
    else
    {
        _s = (_p / (2 * pi)) * arcsin(arg2 / change);
    }
    return (change * power(2, -10 * time) * sin((((time * duration) - _s) * (2 * pi)) / _p)) + arg2 + start;
}
`,snd_pitch_time:`function snd_pitch_time(arg0, arg1, arg2)
{
    with (obj_lerppitch)
    {
        if (sndtarget == arg0)
        {
            instance_destroy();
        }
    }
    var pitchthing = instance_create(0, 0, obj_lerppitch);
    pitchthing.sndtarget = arg0;
    pitchthing.targetpitch = arg1;
    pitchthing.maxframes = arg2;
    with (pitchthing)
    {
        event_user(0);
    }
}
`},Tn={obj_animator:{metadata:{index:926,name:`obj_animator`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`con = 0;
initframe = -1;
endframe = -1;
target = -1;
sprite = -1;
fake_image_speed = 0.25;
fake_image_index = 0;
fake_image_index_max = 0;
timer = 0;
`,Step_0:`if (i_ex(target))
{
    if (con == 0)
    {
        target.image_index = 0;
        target.image_speed = 0;
        if (sprite >= 0)
        {
            target.sprite_index = sprite;
        }
        if (initframe >= 0)
        {
            target.image_index = initframe;
        }
        fake_image_index_max = endframe;
        if (endframe == 0)
        {
            fake_image_index_max = target.image_number - 1 - target.image_index;
        }
        if (endframe == -1)
        {
            fake_image_index_max = target.image_number - target.image_index;
        }
        con = 1;
    }
    if (con == 1)
    {
        fake_image_index += fake_image_speed;
        target.image_index = fake_image_index;
        if (fake_image_index >= fake_image_index_max)
        {
            instance_destroy();
        }
    }
}
else
{
    instance_destroy();
}
`}},obj_smallface:{metadata:{index:64,name:`obj_smallface`,parent:null,sprite:`spr_smallface_s0`,mask:null,solid:!1,depth:-5,visible:!0},sources:{Alarm_0:`nowdir = direction;
speed = 0;
active = 1;
if (type != 2 && type != 4)
{
    finished = 1;
}
`,Create_0:`stringpos = 0;
mystring = " ";
part = 1;
partstring = " ";
type = 0;
rate = 1;
active = 0;
finished = 0;
mycolor = c_purple;
alarm[0] = 1;
getrid = 0;
writergod = obj_writer;
nowdir = 90;
facealpha = 0;
`,Draw_0:`if (global.darkzone == 1)
{
    if (facealpha < 1)
    {
        facealpha += 0.2;
    }
    draw_sprite_ext(sprite_index, image_index, x, y, image_xscale, image_yscale, image_angle, image_blend, facealpha);
    draw_set_alpha(facealpha);
    if (type == 0 || type == 3)
    {
        scr_84_set_draw_font("main");
        draw_set_color(mycolor);
        draw_text(x + 70, y + 10, string_hash_to_newline(mystring));
    }
    if (type == 1 && active == 1 && getrid == 0)
    {
        scr_84_set_draw_font("main");
        draw_set_color(mycolor);
        draw_text(x + 70, y + 15, string_hash_to_newline(mystring));
        finished = 1;
    }
    if (type == 2 || type == 4)
    {
        if (active == 1)
        {
            scr_84_set_draw_font("main");
            draw_set_color(mycolor);
            if (finished == 0)
            {
                partstring += string_char_at(mystring, part);
                part += 1;
                if (part >= (string_length(mystring) + 1))
                {
                    finished = 1;
                }
            }
            draw_text(x + 70 + random(1), y + 15 + random(1), string_hash_to_newline(partstring));
        }
    }
    if (i_ex(writergod))
    {
        if (finished == 1 && getrid == 0)
        {
            finished = 2;
        }
    }
    else
    {
        instance_destroy();
    }
    if (getrid == 1)
    {
        direction = -nowdir;
        speed += 2;
        if (type == 3 || type == 4)
        {
            instance_destroy();
        }
    }
    draw_set_alpha(1);
}
`}},obj_script_delayed:{metadata:{index:932,name:`obj_script_delayed`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`event_user(0);
instance_destroy();
`,Create_0:`script = -1;
target = -1;
rate = 1;
alarm[0] = 1;
for (i = 0; i < 13; i++)
{
    script_arg[i] = 0;
}
arg_count = 0;
constant = 0;
max_time = 0;
timer = 999;
totaltimer = 0;
`,Other_10:`if (i_ex(target))
{
    target.__scipt = script;
    for (i = 0; i < 10; i++)
    {
        target.__scipt_arg[i] = script_arg[i];
    }
    if (arg_count == 0)
    {
        with (target)
        {
            script_execute(__scipt);
        }
    }
    if (arg_count == 1)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0]);
        }
    }
    if (arg_count == 2)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1]);
        }
    }
    if (arg_count == 3)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2]);
        }
    }
    if (arg_count == 4)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3]);
        }
    }
    if (arg_count == 5)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4]);
        }
    }
    if (arg_count == 6)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5]);
        }
    }
    if (arg_count == 7)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6]);
        }
    }
    if (arg_count == 8)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6], __scipt_arg[7]);
        }
    }
    if (arg_count == 9)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6], __scipt_arg[7], __scipt_arg[8]);
        }
    }
    if (arg_count == 10)
    {
        with (target)
        {
            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6], __scipt_arg[7], __scipt_arg[8], __scipt_arg[9]);
        }
    }
}
`,Step_0:`if (constant == 1)
{
    if (max_time == -1)
    {
        totaltimer = -10;
    }
    timer++;
    if (timer >= rate)
    {
        if (i_ex(target) && totaltimer < max_time)
        {
            event_user(0);
            timer = 0;
        }
        else
        {
            instance_destroy();
        }
    }
    totaltimer++;
}
`}},obj_collidebullet:{metadata:{index:364,name:`obj_collidebullet`,parent:`obj_bulletparent`,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Other_15:`if (active == 1)
{
    if (target != 3)
    {
        scr_damage();
    }
    if (target == 3)
    {
        scr_damage_all();
    }
    if (destroyonhit == 1)
    {
        instance_destroy();
    }
}
`}},obj_regularbullet:{metadata:{index:372,name:`obj_regularbullet`,parent:`obj_collidebullet`,sprite:null,mask:null,solid:!1,depth:-10,visible:!0},sources:{Create_0:`scr_bullet_init();
spin = 0;
spinspeed = 0;
image_alpha = 1;
if (!instance_exists(obj_heart))
{
    instance_destroy();
}
wall_destroy = 1;
bottomfade = 0;
`,Step_0:`if (wall_destroy == 1)
{
    if (x < (__view_get(e__VW.XView, 0) - 80))
    {
        instance_destroy();
    }
    if (x > (__view_get(e__VW.XView, 0) + 760))
    {
        instance_destroy();
    }
    if (y < (__view_get(e__VW.YView, 0) - 80))
    {
        instance_destroy();
    }
    if (y > (__view_get(e__VW.YView, 0) + 580))
    {
        instance_destroy();
    }
}
if (updateimageangle == 1)
{
    image_angle = direction;
}
if (spin == 1)
{
    image_angle += spinspeed;
}
if (bottomfade != 0)
{
    if (y > (cameray() + bottomfade))
    {
        image_alpha *= 0.8;
    }
}

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`}},obj_growtangle:{metadata:{index:877,name:`obj_growtangle`,parent:`obj_battlesolid`,sprite:`spr_battlebg_0`,mask:`spr_battlebg_0`,solid:!1,depth:5,visible:!0},sources:{CleanUp_0:`if (customBox)
{
    d = instance_create(x, y, obj_battle_cleanup);
    d.custom_box_sprite = spr_custom_box;
}
`,correction_Create_0:`xhome = obj_growtangle.x;
yhome = obj_growtangle.y;
init = 0;
spawntimer = 0;
`,correction_Step_1:`if (instance_exists(obj_growtangle))
{
    if (global.turntimer < 0 || spawntimer < 15)
    {
        spawntimer++;
        if (spawntimer == 15)
        {
            obj_heart.x += (x - xhome);
            obj_heart.y += (y - yhome);
            x = xhome;
            y = yhome;
        }
        obj_growtangle.x = scr_movetowards(obj_growtangle.x, x, 5);
        obj_growtangle.y = scr_movetowards(obj_growtangle.y, y, 5);
    }
}
else
{
    instance_destroy();
}
`,Create_0:`image_xscale = 0;
image_yscale = 0;
image_alpha = 0.3;
timer = 0;
maxtimer = 15;
growcon = 1;
image_speed = 0;
image_blend = merge_color(c_green, c_lime, 0.5);
target_angle = 0;
fullgrow = 0;
keep = 0;
megakeep = 0;
maxxscale = 2;
maxyscale = 2;
customBox = false;
init = 0;
spr_custom_box = sprite_index;
`,Draw_0:`draw_sprite_ext(sprite_index, 1, x, y, image_xscale, image_yscale, image_angle, image_blend, image_alpha);
if (customBox && growth && growcon != 2)
{
    draw_sprite_ext(spr_custom_box, 0, x, y, image_xscale / (maxxscale / 2), image_yscale / (maxyscale / 2), image_angle, image_blend, image_alpha);
}
else
{
    draw_self();
}
`,electric_Create_0:`scr_bullet_init();
destroyonhit = 0;
image_speed = 0.2;
image_alpha = 0;
active = 0;
if (instance_exists(obj_growtangle))
{
    image_xscale = obj_growtangle.image_xscale;
    image_yscale = obj_growtangle.image_yscale;
    image_angle = obj_growtangle.image_angle;
}
else
{
    instance_destroy();
}
instance_create(x, y, obj_growtangle_electric_pushin);
timer = 0;
type = 0;
con = 0;
amplitude = 0;
maxamplitude = 60;
spinamplitude = 0;
plugx = 120;
plugalpha = 0;
shottimer = 0;
speedmode = 1;
xx = 0;
yy = 0;
if (instance_exists(obj_queen_enemy))
{
    damage = global.monsterat[obj_queen_enemy.myself] * 5;
}
if (instance_exists(obj_queen_bulletcontroller))
{
    target = obj_queen_bulletcontroller.target;
}
grazepoints = 4;
`,electric_Destroy_0:`with (obj_growtangle_electric_pushin)
{
    instance_destroy();
}
`,electric_Draw_0:`if (instance_exists(obj_growtangle))
{
    plugangle = 0;
    wy = 0;
    wx = 75;
    if (con >= 1)
    {
        plugangle = image_angle;
        wx = lengthdir_x(obj_growtangle.sprite_width / 2, image_angle);
        wy = lengthdir_y(obj_growtangle.sprite_width / 2, image_angle);
    }
    if (type != 1)
    {
        draw_sprite_ext(spr_growtangle_electric_plug, 0, (x + xx) - wx - plugx, (y + xx) - wy, 2, 2, plugangle, c_white, plugalpha);
    }
    draw_sprite_ext(spr_growtangle_electric_plug, 0, x + xx + wx + plugx, y + xx + wy, 2, 2, plugangle + 180, c_white, plugalpha);
}
draw_self();
`,electric_pushin_Create_0:`image_index = 1;
image_speed = 0;
image_xscale = obj_growtangle.image_xscale - 0.4;
image_yscale = obj_growtangle.image_yscale - 0.4;
image_angle = obj_growtangle.image_angle;
x = obj_growtangle.x;
y = obj_growtangle.y;
visible = false;
`,electric_pushin_Step_0:`image_xscale = obj_growtangle.image_xscale - 0.4;
image_yscale = obj_growtangle.image_yscale - 0.4;
image_angle = obj_growtangle.image_angle;
x = obj_growtangle.x;
y = obj_growtangle.y;
visible = false;
repeat (6)
{
    if (!place_meeting(x, y, obj_heart))
    {
        obj_heart.x += lengthdir_x(1, point_direction(obj_heart.x, obj_heart.y, obj_growtangle.x, obj_growtangle.y));
        obj_heart.y += lengthdir_y(1, point_direction(obj_heart.x, obj_heart.y, obj_growtangle.x, obj_growtangle.y));
    }
}
`,electric_Step_0:`if (grazed == 1)
{
    grazetimer += 1;
    if (grazetimer >= 30)
    {
        grazetimer = 0;
        grazed = 0;
    }
}
if (instance_exists(obj_growtangle))
{
    if (con == 0)
    {
        timer++;
        if (type == 1)
        {
            plugxend = -23;
            plugx = lerp(plugx, plugxend, 0.2);
        }
        else
        {
            plugxend = 0;
            plugx = lerp(plugx, plugxend, 0.15);
        }
        plugalpha = lerp(plugalpha, 1, 0.1);
        if (timer >= 15 && timer <= 25)
        {
            obj_growtangle.x = obj_growtangle.xstart + random_range((-35 + timer) / 2, (35 - timer) / 2);
            obj_growtangle.y = obj_growtangle.ystart + random_range((-35 + timer) / 2, (35 - timer) / 2);
        }
        if (timer >= 15)
        {
            plugalpha = 1;
            plugx = plugxend;
            image_alpha += 0.1;
            if (image_alpha >= 1)
            {
                active = 1;
            }
            else
            {
                active = 0;
            }
        }
        if (timer >= 25)
        {
            con = 1;
            timer = 0;
            plugx = 0;
        }
    }
    if (con == 1)
    {
        timer++;
        shottimer++;
        if (type == 0)
        {
            moveamount = sin(timer / 20) * amplitude;
        }
        if (type == 1)
        {
            moveamount = 1;
        }
        shotthreshold = 8;
        if (type == 1)
        {
            shotthreshold = 15;
        }
        if (shottimer >= shotthreshold)
        {
            shottimer = 0;
            lightning = instance_create(-100, y, obj_growtangle_spark);
            with (lightning)
            {
                scr_bullet_init();
                destroyonhit = 1;
            }
            if (speedmode == 1)
            {
                wx = lengthdir_x(obj_growtangle.sprite_width / 2, image_angle);
                wy = lengthdir_y(obj_growtangle.sprite_width / 2, image_angle);
                if (moveamount > 0)
                {
                    lightning.x = x + xx + wx;
                    lightning.y = y + yy + wy;
                    lightning.gravity_direction = 180 + image_angle;
                }
                if (moveamount < 0)
                {
                    lightning.x = (x + xx) - wx;
                    lightning.y = y + yy + wy;
                    lightning.gravity_direction = image_angle;
                }
                lightning.direction = lightning.gravity_direction + 180;
                lightning.speed = 5 + random(1);
                lightning.depth = depth - 5;
                if (type == 1)
                {
                    lightning.speed = 6 + random(1);
                }
                with (lightning)
                {
                    motion_add(direction + choose(90, 270), random(1.5));
                }
            }
            lightning.gravity = 0.3;
            lightning.image_xscale = 1.5;
            lightning.image_yscale = 1.5;
            with (lightning)
            {
                if (instance_exists(obj_queen_enemy))
                {
                    damage = global.monsterat[obj_queen_enemy.myself] * 5;
                }
            }
            scr_bullet_inherit(lightning);
            lightning.active = 1;
            lightning.sprite_index = spr_growtangle_elecbullet;
        }
        if (timer >= 150)
        {
            if (amplitude > 0)
            {
                amplitude -= 2;
            }
        }
        else
        {
            amplitude = lerp(amplitude, maxamplitude, 0.1);
        }
        if (type == 0)
        {
            obj_growtangle.x = obj_growtangle.xstart + moveamount;
        }
        if (type == 1)
        {
            moveamount = sin(timer / 20) * amplitude;
            obj_growtangle.x = obj_growtangle.xstart + moveamount;
            obj_growtangle.image_angle += 1.9565217391304348;
        }
        if (amplitude <= 0 && timer >= 230 && global.turntimer > 2)
        {
            global.turntimer = 2;
        }
    }
    x = obj_growtangle.x - xx;
    y = obj_growtangle.y - yy;
    image_xscale = obj_growtangle.image_xscale;
    image_yscale = obj_growtangle.image_yscale;
    image_angle = obj_growtangle.image_angle;
}
else
{
    instance_destroy();
}
`,spark_Create_0:`event_inherited();
timer = 0;
`,spark_Step_0:`event_inherited();
timer++;
if (timer == 4)
{
    image_xscale = 1.5;
    image_yscale = 1.5;
    image_angle = random(360);
}
if (timer == 8)
{
    timer = 1;
    image_xscale = 2;
    image_yscale = 2;
    image_angle = random(360);
}
`,Step_0:`if (!init)
{
    if (visible && (maxxscale != 2 || maxyscale != 2) && sprite_index == spr_battlebg_0)
    {
        customBox = true;
        if ((maxxscale % 1) != 0)
        {
            maxxscale = round(maxxscale * 37.5) / 37.5;
        }
        if ((maxyscale % 1) != 0)
        {
            maxyscale = round(maxyscale * 37.5) / 37.5;
        }
        var _tempxscale = maxxscale / 2;
        var _tempyscale = maxyscale / 2;
        var surf = surface_create(75 * _tempxscale, 75 * _tempyscale);
        surface_set_target(surf);
        draw_clear_alpha(c_black, 0);
        draw_sprite_ext(spr_battlebg_stretch, 0, 37 * _tempxscale, 37 * _tempyscale, _tempxscale, _tempyscale, 0, c_white, 1);
        spr_custom_box = sprite_create_from_surface(surf, 0, 0, 75 * _tempxscale, 75 * _tempyscale, false, false, round(37.5 * _tempxscale), round(37.5 * _tempyscale));
        sprite_index = spr_battlebg_stretch_hitbox;
        surface_reset_target();
        surface_free(surf);
    }
    init = 1;
}
growth = 0;
if (timer < maxtimer && growcon == 1)
{
    growth = 1;
}
if (timer > 0 && growcon == 3)
{
    growth = 1;
}
if (growth == 1)
{
    if (growcon == 1)
    {
        timer += 1;
    }
    if (growcon == 3)
    {
        timer -= 1;
    }
    image_xscale = maxxscale * (timer / maxtimer);
    image_yscale = maxyscale * (timer / maxtimer);
    image_angle = 180 + (180 * (timer / maxtimer)) + target_angle;
    image_alpha = 0.5 + ((timer / maxtimer) * 0.5);
    if (visible)
    {
        d = instance_create(x, y, obj_afterimage);
        d.sprite_index = spr_custom_box;
        d.image_xscale = image_xscale / (maxxscale / 2);
        d.image_yscale = image_yscale / (maxyscale / 2);
        d.image_angle = image_angle;
        d.depth = depth - 1;
        d.image_blend = image_blend;
        d.image_alpha = (1 - image_alpha) + 0.1;
        d.image_speed = 0;
    }
    if (timer >= maxtimer && growcon == 1)
    {
        growcon = 2;
        image_angle = target_angle;
    }
    if (timer <= 0 && growcon == 3)
    {
        instance_destroy();
    }
}
`,Step_2:`if (keep == 1)
{
    if (instance_exists(obj_heart))
    {
        if (path_speed != 0 || speed != 0 || megakeep == 1)
        {
            lborder = x - (sprite_width / 2);
            rborder = x + (sprite_width / 2);
            uborder = y - (sprite_height / 2);
            dborder = y + (sprite_height / 2);
            if (obj_heart.x < (lborder + 5))
            {
                obj_heart.x = lborder + 5;
            }
            if (obj_heart.x > (rborder - 22))
            {
                obj_heart.x = rborder - 22;
            }
            if (obj_heart.y < (uborder + 5))
            {
                obj_heart.y = uborder + 5;
            }
            if (obj_heart.y > (dborder - 22))
            {
                obj_heart.y = dborder - 22;
            }
        }
    }
}
`}},obj_growtangle_spark:{metadata:{index:8,name:`obj_growtangle_spark`,parent:`obj_regularbullet`,sprite:`spr_growtangle_elecbullet`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`event_inherited();
timer = 0;
`,Step_0:`event_inherited();
timer++;
if (timer == 4)
{
    image_xscale = 1.5;
    image_yscale = 1.5;
    image_angle = random(360);
}
if (timer == 8)
{
    timer = 1;
    image_xscale = 2;
    image_yscale = 2;
    image_angle = random(360);
}
`}},obj_moveheart:{metadata:{index:382,name:`obj_moveheart`,parent:null,sprite:`spr_dodgeheart`,mask:null,solid:!1,depth:0,visible:!0},sources:{Alarm_0:`x = distx;
y = disty;
if (!i_ex(obj_heart))
{
    instance_create(x, y, obj_heart);
}
instance_destroy();
`,Create_0:`burst = 0;
shift = 1;
image_alpha = 0;
flytime = 8;
if (instance_exists(obj_heartmarker))
{
    distx = obj_heartmarker.x;
    disty = obj_heartmarker.y;
}
else if (!instance_exists(obj_growtangle))
{
    distx = __view_get(e__VW.XView, 0) + 310;
    disty = __view_get(e__VW.YView, 0) + 160;
}
else
{
    distx = obj_growtangle.x - 10;
    disty = obj_growtangle.y - 10;
}
dist = point_distance(x, y, distx, disty);
move_towards_point(distx, disty, dist / flytime);
alarm[0] = flytime;
image_speed = 0;
instance_create(x, y, obj_heartburst);

enum e__VW
{
    XView,
    YView,
    WView,
    HView,
    Angle,
    HBorder,
    VBorder,
    HSpeed,
    VSpeed,
    Object,
    Visible,
    XPort,
    YPort,
    WPort,
    HPort,
    Camera,
    SurfaceID
}
`,Draw_0:`draw_self();
`,Step_0:`image_alpha += 0.334;
`}},obj_battle_cleanup:{metadata:{index:58,name:`obj_battle_cleanup`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!1},sources:{Alarm_0:`if (sprite_exists(custom_box_sprite))
{
    sprite_delete(custom_box_sprite);
}
if (instance_exists(self))
{
    instance_destroy();
}
`,Create_0:`custom_box_sprite = 0;
alarm[0] = 30;
`,Step_0:`if (!instance_exists(obj_afterimage))
{
    if (sprite_exists(custom_box_sprite))
    {
        sprite_delete(custom_box_sprite);
    }
    if (instance_exists(self))
    {
        instance_destroy();
    }
}
`}},obj_spamtonshot:{metadata:{index:598,name:`obj_spamtonshot`,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_bullet1`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`if (instance_exists(obj_sneo_heartattack) && obj_sneo_heartattack.heart_health < 1)
{
    instance_destroy();
    exit;
}
scr_bullet_init();
element = 6;
f = 2;
con = 0;
mode = 1;
dontexplode = 0;
destroyable = 0;
image_xscale = 1;
image_yscale = 1;
siner = 0;
fluffyguarddestroysthis = 0;
targetx = camerax() + (camerawidth() / 2);
targety = cameray() + (cameraheight() / 4);
if (instance_exists(obj_heart))
{
    targetx = obj_heart.x;
    targety = obj_heart.y;
}
move_towards_point(targetx, targety, 5);
angle_speed = 0;
grazepoints = 4;
if (instance_exists(obj_sneo_bulletcontroller))
{
    target = obj_sneo_bulletcontroller.target;
}
`,Step_0:`if (instance_exists(obj_spamton_neo_enemy))
{
    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;
}
if (global.turntimer < 1)
{
    instance_destroy();
}
dontexplode = 1;
if (instance_exists(obj_heart))
{
    if (y > (cameray() + 280))
    {
        depth = obj_heart.depth + 100;
    }
    else
    {
        depth = obj_heart.depth + 2;
    }
}
else if (instance_exists(obj_sneo_lilguy))
{
    depth = obj_sneo_lilguy.depth - 1;
}
else
{
    depth = obj_heart.depth + 2;
}
if (con == 0)
{
    siner += (1 * f);
    image_xscale = 0.5 + (sin(siner / 4) * 0.1 * f);
    image_yscale = 0.5 + (sin(siner / 4) * 0.1 * f);
    if (siner >= 30 && dontexplode == 0)
    {
        con = 1;
    }
}
if (con == 1)
{
    image_xscale -= (0.05 * f);
    image_yscale -= (0.05 * f);
    if (image_xscale <= 0 && image_yscale <= 0)
    {
        uniformangleoff = random(360);
        uniformanglespeed = -1 + random(2);
        shotamount = 20;
        off = 0;
        for (i = 0; i < shotamount; i += 1)
        {
            shot[i] = instance_create(x, y, obj_basicbullet_sneo);
            if (off == 0)
            {
                shot[i].destroyable = 1;
                shot[i].image_blend = c_yellow;
                off = 1;
            }
            else
            {
                off = 0;
            }
            shot[i].speed = 1 * f;
            shot[i].friction = -0.05 * f;
            if (mode == 1)
            {
                shot[i].angle_speed = uniformanglespeed;
            }
            if (mode == 5)
            {
                shot[i].angle_speed = -2 + random(4);
            }
            shot[i].image_xscale = 1.5;
            shot[i].image_yscale = 1.5;
            shot[i].sprite_index = spr_sneo_bullet_arrow;
        }
        instance_destroy();
    }
}
`}},obj_lerppitch:{metadata:{index:933,name:`obj_lerppitch`,parent:null,sprite:null,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`sndtarget = -1;
targetpitch = 1;
frames = 0;
maxframes = 10;
`,Other_10:`initpitch = audio_sound_get_pitch(sndtarget);
`,Step_0:`frames++;
var newpitch = lerp(initpitch, targetpitch, frames / maxframes);
snd_pitch(sndtarget, newpitch);
if (frames >= maxframes)
{
    instance_destroy();
}
`}},obj_fadein:{metadata:{index:194,name:`obj_fadein`,parent:null,sprite:`spr_pixel_white`,mask:null,solid:!1,depth:-99999,visible:!0},sources:{Create_0:`image_blend = c_black;
fadespeed = -0.08;
image_alpha = 1;
length = 10 + (room_width / 4);
height = 10 + (room_height / 4);
x = -20;
y = -20;
`,Draw_0:`image_alpha += fadespeed;
draw_sprite_ext(sprite_index, image_index, x, y, length, height, 0, image_blend, image_alpha);
if (image_alpha <= 0)
{
    instance_destroy();
}
`,Other_5:`instance_destroy();
`}},obj_battleblcon:{metadata:{index:875,name:`obj_battleblcon`,parent:null,sprite:`spr_battleblcon`,mask:null,solid:!1,depth:0,visible:!0},sources:{Create_0:`mywriter = instance_create(x + 5, y + 5, obj_writer);
mywriter.depth = 9999999;
auto_length = 0;
side = 1;
xoffset = 0;
init = 0;
reformatted = 0;
remx = x;
remy = y;
remmsgno = -1;
initwritingx = -1;
initwritingy = -1;
`,Draw_0:`if (i_ex(mywriter))
{
    mywriter.depth = depth - 5;
    if (remmsgno != obj_writer.msgno)
    {
        reformatted = 0;
    }
    if (auto_length == 0)
    {
        init = 1;
        reformatted = 1;
    }
    if (reformatted == 0)
    {
        if (mywriter.formatted == 1)
        {
            if (init == 0)
            {
                initwritingx = mywriter.writingx;
                initwritingy = mywriter.writingy;
                init = 1;
            }
            writingx = mywriter.writingx;
            writingy = mywriter.writingy;
            stringmax = mywriter.stringmax;
            hspace = mywriter.hspace;
            vspace = mywriter.vspace;
            linecount = mywriter.linecount;
            balloonwidth = (stringmax * hspace) + 10;
            balloonheight = ((linecount + 1) * vspace) + 5;
            if (global.lang == "ja")
            {
                var checkstring = mywriter.mystring;
                var spacing = mywriter.hspace;
                var stringlength = string_length(checkstring);
                var newmaxlength = 0;
                var currentlength = 0;
                for (var ii = 1; ii < (stringlength + 1); ii += 1)
                {
                    var mychar = string_char_at(checkstring, ii);
                    if (mychar == "&" || mychar == "\\n")
                    {
                        currentlength = 0;
                    }
                    else if (mychar == "^" || mychar == "*")
                    {
                        ii++;
                    }
                    else if (mychar == "\\\\")
                    {
                        ii += 2;
                    }
                    else if (mychar == "/" || mychar == "%")
                    {
                    }
                    else if (ord(mychar) < 256 || (ord(mychar) >= 65377 && ord(mychar) <= 65439))
                    {
                        currentlength += (spacing * 0.5);
                    }
                    else
                    {
                        currentlength += spacing;
                    }
                    if (currentlength >= newmaxlength)
                    {
                        newmaxlength = currentlength;
                    }
                }
                balloonwidth = newmaxlength + 10;
            }
            if (side == 1)
            {
                mywriter.writingx = initwritingx - (balloonwidth + 20);
                mywriter.writingy = initwritingy - (balloonheight / 2);
                writingx = initwritingx - (balloonwidth + 20);
                writingy = initwritingy - (balloonheight / 2);
            }
            if (side == -1)
            {
                xoffset = 20;
                mywriter.writingx = initwritingx;
                mywriter.writingy = initwritingy - (balloonheight / 2);
                writingx = initwritingx;
                writingy = initwritingy - (balloonheight / 2);
            }
        }
    }
    if (auto_length == 0)
    {
        draw_self();
    }
    if (auto_length == 1 && init == 1)
    {
        blconscale = 1;
        if (balloonheight < 40)
        {
            blconscale = 0.5;
        }
        if (side == 1)
        {
            draw_sprite_ext(spr_battleblcon_parts, 4, x, y, 1, blconscale, 0, c_white, 1);
        }
        if (side == -1)
        {
            draw_sprite_ext(spr_battleblcon_parts, 4, x - xoffset, y, -1, blconscale, 0, c_white, 1);
        }
        draw_set_color(c_white);
        draw_rectangle(writingx - 10, writingy - 5, writingx + balloonwidth, (writingy + balloonheight) - 5, false);
        draw_rectangle(writingx - 5, writingy - 10, (writingx + balloonwidth) - 5, writingy + balloonheight, false);
    }
    remmsgno = mywriter.msgno;
}
`,Other_10:`exit;
`,Step_0:`if (i_ex(mywriter) == false)
{
    instance_destroy();
}
`}}},En=`if (nextchar == "f" && faced == 0)
        {
            fam = 0;
            fam = real(nextchar2);
            if (!i_ex(global.sminstance[fam]))
            {
                global.sminstance[fam] = instance_create(global.smxx[fam], global.smyy[fam], obj_smallface);
                smallface = global.sminstance[fam];
                if (i_ex(smallface))
                {
                    smallface.x += x;
                    smallface.y += y;
                    smallface.speed = global.smspeed[fam];
                    smallface.direction = global.smdir[fam];
                    smallface.type = global.smtype[fam];
                    smallface.sprite_index = global.smsprite[fam];
                    smallface.image_speed = global.smimagespeed[fam];
                    smallface.image_index = global.smimage[fam];
                    smallface.alarm[0] = global.smalarm[fam];
                    smallface.mystring = global.smstring[fam];
                    smallface.mycolor = global.smcolor[fam];
                    smallface.writergod = id;
                }
            }
        }`,Dn=[{name:`obj_sneo_friedpipis`,index:0,parent:null,sprite:`spr_pipis_egg`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_pipis_bullet_cone`,index:1,parent:`obj_collidebullet`,sprite:`spr_sneo_crew`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_smoke`,index:4,parent:null,sprite:`spr_sneo_smoke`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_growtangle_spark`,index:8,parent:`obj_regularbullet`,sprite:`spr_growtangle_elecbullet`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_mettaton_bomb_hitbox`,index:9,parent:`obj_regularbullet`,sprite:`spr_hitbox_10px_center`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_fountainkris_ch2_sideb`,index:21,parent:null,sprite:`spr_krisu_bright`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_rotatingwall_pipis`,index:23,parent:`obj_collidebullet`,sprite:`spr_pipis_egg`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_event_manager`,index:24,parent:null,sprite:null,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_sneo_staticwall_new`,index:37,parent:`obj_collidebullet`,sprite:`spr_sneo_mail`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_rotatingwall_bomb`,index:38,parent:`obj_collidebullet`,sprite:`spr_mettaton_bomb1`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_wallbullet_new`,index:40,parent:`obj_collidebullet`,sprite:`spr_sneo_crew`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_final_forme_mouth_back`,index:41,parent:null,sprite:`spr_sneo_final_forme`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_pipis_bomb`,index:46,parent:`obj_collidebullet`,sprite:`spr_mettaton_bomb1`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_wall_controller_new`,index:54,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_battle_cleanup`,index:58,parent:null,sprite:null,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_choicer_neo`,index:61,parent:null,sprite:`spr_alphysdesk`,mask:null,depth:-600,visible:!0,solid:!1},{name:`obj_face_parent`,index:62,parent:null,sprite:null,mask:null,depth:10,visible:!0,solid:!1},{name:`obj_face`,index:63,parent:`obj_face_parent`,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_smallface`,index:64,parent:null,sprite:`spr_smallface_s0`,mask:null,depth:-5,visible:!0,solid:!1},{name:`obj_dialoguer`,index:65,parent:null,sprite:null,mask:null,depth:2,visible:!0,solid:!1},{name:`obj_writer`,index:66,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_mainchara`,index:84,parent:null,sprite:`spr_krisd`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_marker`,index:131,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_interactable`,index:133,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_readable_room1`,index:136,parent:`obj_interactable`,sprite:`spr_interactable`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_astream`,index:186,parent:null,sprite:`spr_heart`,mask:null,depth:-200,visible:!1,solid:!1},{name:`obj_fadeout`,index:193,parent:null,sprite:`spr_pixel_white`,mask:null,depth:-99999,visible:!0,solid:!1},{name:`obj_fadein`,index:194,parent:null,sprite:`spr_pixel_white`,mask:null,depth:-99999,visible:!0,solid:!1},{name:`obj_shake`,index:196,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_afterimage_cut`,index:211,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_heart_laser`,index:245,parent:null,sprite:`spr_sneo_bullet1`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_encounterbasic`,index:278,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_caterpillarchara`,index:279,parent:null,sprite:`spr_susied_party`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_afterimage`,index:355,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_afterimage_grow`,index:356,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_attackpress`,index:358,parent:null,sprite:`spr_pressfront`,mask:null,depth:1,visible:!0,solid:!1},{name:`obj_basicattack`,index:359,parent:null,sprite:`spr_attack_cut1`,mask:null,depth:-100,visible:!0,solid:!1},{name:`obj_battlecontroller`,index:360,parent:null,sprite:null,mask:null,depth:5,visible:!0,solid:!1},{name:`obj_battlesolid`,index:361,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_burstbolt`,index:362,parent:null,sprite:`spr_attackspot`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_bulletparent`,index:363,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_collidebullet`,index:364,parent:`obj_bulletparent`,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_darkener`,index:366,parent:null,sprite:null,mask:null,depth:200,visible:!0,solid:!1},{name:`obj_grazebox`,index:367,parent:null,sprite:`spr_grazeappear`,mask:`spr_grazemask`,depth:2,visible:!0,solid:!1},{name:`obj_heartburst`,index:370,parent:null,sprite:`spr_heartoutline`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_heartmarker`,index:371,parent:null,sprite:`spr_diamondbullet_form`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_regularbullet`,index:372,parent:`obj_collidebullet`,sprite:null,mask:null,depth:-10,visible:!0,solid:!1},{name:`obj_lancerbike`,index:373,parent:`obj_regularbullet`,sprite:`spr_lancerbike`,mask:null,depth:-20,visible:!0,solid:!1},{name:`obj_heroparent`,index:374,parent:null,sprite:`spr_krisb_idle`,mask:null,depth:100,visible:!0,solid:!1},{name:`obj_herokris`,index:375,parent:`obj_heroparent`,sprite:`spr_krisplace`,mask:null,depth:100,visible:!0,solid:!1},{name:`obj_herosusie`,index:376,parent:`obj_heroparent`,sprite:`spr_krisplace`,mask:null,depth:100,visible:!0,solid:!1},{name:`obj_heroralsei`,index:377,parent:`obj_heroparent`,sprite:`spr_krisplace`,mask:null,depth:100,visible:!0,solid:!1},{name:`obj_heronoelle`,index:378,parent:`obj_heroparent`,sprite:`spr_krisplace`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_initializer`,index:379,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_moveheart`,index:382,parent:null,sprite:`spr_dodgeheart`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_returnheart`,index:383,parent:null,sprite:`spr_dodgeheart`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_tensionbar`,index:384,parent:null,sprite:`spr_tensionbar`,mask:null,depth:1,visible:!0,solid:!1},{name:`obj_pacifyspell`,index:386,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_bulletgenparent`,index:393,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_dbulletcontroller`,index:394,parent:`obj_bulletgenparent`,sprite:`spr_grazemask`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_monsterparent`,index:396,parent:null,sprite:null,mask:null,depth:90,visible:!0,solid:!1},{name:`obj_checkers_enemy`,index:403,parent:`obj_monsterparent`,sprite:null,mask:null,depth:90,visible:!0,solid:!1},{name:`obj_checker_animtest`,index:404,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_throwtarget`,index:405,parent:null,sprite:null,mask:null,depth:4,visible:!0,solid:!1},{name:`obj_ralseithrown`,index:406,parent:null,sprite:`spr_ralsei_thrown`,mask:null,depth:1,visible:!0,solid:!1},{name:`obj_throwralsei`,index:407,parent:null,sprite:`spr_susieb_throwralseiready`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_checkers_leap`,index:408,parent:`obj_collidebullet`,sprite:null,mask:null,depth:1,visible:!0,solid:!1},{name:`obj_clubsenemy`,index:410,parent:`obj_monsterparent`,sprite:`spr_clubs_idle`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_clubsbullet_dark`,index:411,parent:`obj_bulletparent`,sprite:`spr_clubsbullet_dark`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_clubsbullet`,index:412,parent:`obj_bulletparent`,sprite:`spr_clubsbullet`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_werewire_bullet_lasersquare`,index:478,parent:`obj_regularbullet`,sprite:`spr_bullet_laser_square`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_werewire_bullet_lasercircle`,index:479,parent:`obj_regularbullet`,sprite:`spr_bullet_laser_circle`,mask:null,depth:0,visible:!0,solid:!1},{name:`o_coaster_hero_back`,index:504,parent:null,sprite:`spr_coaster_back`,mask:null,depth:0,visible:!1,solid:!1},{name:`o_coastersmoke`,index:505,parent:null,sprite:`spr_coaster_explosion`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_growtangle_electric_pushin`,index:534,parent:null,sprite:`spr_battlebg_0`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_queen_laser`,index:561,parent:`obj_collidebullet`,sprite:`spr_lasergun_laser`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_wreckpausespew`,index:565,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_queen_enemy`,index:578,parent:`obj_monsterparent`,sprite:`spr_queen_chair_1_old`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_queen_bulletcontroller`,index:579,parent:`obj_bulletgenparent`,sprite:`spr_cutscene_13_queen_hand`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_spamton_cherub`,index:595,parent:null,sprite:`spr_spamton_cherub`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_yheart_shot`,index:596,parent:null,sprite:`spr_yheart_shot`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_basicbullet_sneo`,index:597,parent:`obj_collidebullet`,sprite:`spr_sneo_bullet0`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_spamtonshot`,index:598,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_bullet1`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_basicbullet_sneo_finale`,index:599,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_bullet0`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_phonebullet`,index:600,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_phonebullet`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_hitdetector`,index:601,parent:null,sprite:`spr_sneo_head_sad`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_yshot_anim`,index:602,parent:null,sprite:`spr_yheart_shot_hit`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_guymaker`,index:603,parent:`obj_bulletparent`,sprite:`spr_sneo_bullet_crew`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_sneo_lilguy`,index:607,parent:`obj_collidebullet`,sprite:`spr_sneo_crew`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_crew_dissolve`,index:608,parent:`obj_bulletparent`,sprite:`spr_sneo_crew_dissolve`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_yheart_shot_afterimage`,index:609,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_yheart_sneo_particle`,index:610,parent:null,sprite:`spr_yheart_charge`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_supercharge_end`,index:611,parent:null,sprite:`spr_supercharge_end`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_warped_box`,index:612,parent:`obj_bulletparent`,sprite:`spr_battlebg_0`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_heartattack`,index:613,parent:null,sprite:`spr_sneo_heart`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_heatattack_bullet`,index:615,parent:`obj_basicbullet_sneo`,sprite:`spr_neo_heart_bullet`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_lilguy_bullet`,index:623,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_crew_bullet`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_crusher`,index:624,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_pillar_head_top`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_wallbullet`,index:625,parent:`obj_collidebullet`,sprite:`spr_sneo_mail`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_staticwall`,index:626,parent:`obj_collidebullet`,sprite:`spr_sneo_mail`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_orb_shot`,index:627,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_neobuster`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_elevator_electric_ball`,index:628,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_electric_orb_idle`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_phonecall`,index:629,parent:`obj_bulletparent`,sprite:`spr_sneo_phone`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_pipis_wall`,index:630,parent:null,sprite:`spr_pipis_wall`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_pipis_egg_bullet`,index:631,parent:`obj_collidebullet`,sprite:`spr_pipis_egg`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_pipis_bullet`,index:632,parent:`obj_collidebullet`,sprite:`spr_sneo_crew`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_laser_bullet`,index:633,parent:`obj_basicbullet_sneo`,sprite:`spr_neo_heart_bullet`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_faceattack`,index:634,parent:`obj_basicbullet_sneo`,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_tiny_susie_axe`,index:635,parent:null,sprite:`spr_rudebuster_sneo_act`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_heart`,index:636,parent:null,sprite:`spr_dodgeheart`,mask:`spr_dodgeheartmask`,depth:1,visible:!0,solid:!1},{name:`obj_sneo_biglaser`,index:637,parent:`obj_collidebullet`,sprite:`spr_sneo_laser`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_bigshot`,index:638,parent:`obj_collidebullet`,sprite:`spr_sneo_bigshot_s`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_tiny_ralsei`,index:639,parent:null,sprite:`spr_fluffy_guard_new`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_sneo_wireheart`,index:640,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_wireheart`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_heart_bomb_explode`,index:641,parent:null,sprite:`spr_sneo_wireheart_bomb`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_final_orb`,index:642,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_neobuster`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_final_forme`,index:643,parent:`obj_basicbullet_sneo_finale`,sprite:`spr_sneo_final_forme`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_final_forme_hitbox`,index:644,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_final_forme_hitbox`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_sneo_dollar`,index:645,parent:`obj_regularbullet`,sprite:`spr_spamton_dollar`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_fakeheart`,index:646,parent:`obj_bulletparent`,sprite:`spr_yellowheart`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_finale_bullet`,index:647,parent:`obj_basicbullet_sneo_finale`,sprite:`spr_sneo_crew_bullet`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_lastattack`,index:648,parent:null,sprite:`spr_sneo_lastattack_head`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_lastattack_hitbox`,index:649,parent:null,sprite:`spr_whitepx_10`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_finale_growtangle`,index:652,parent:`obj_bulletparent`,sprite:`spr_battlebg_0`,mask:`spr_battlebg_0`,depth:0,visible:!0,solid:!1},{name:`obj_sneo_phonehand_master`,index:653,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_head_sad`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_phonehand_master_hurtbox`,index:654,parent:`obj_regularbullet`,sprite:`spr_hitbox_10px`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_phonehand`,index:655,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_phonehand`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_mmx_spreadshot`,index:656,parent:`obj_basicbullet_sneo`,sprite:`spr_sneo_bullet0`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_pipis_controller`,index:660,parent:null,sprite:`spr_sneo_arml`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_pipis_egg_bullet_piece`,index:661,parent:null,sprite:`spr_pipis_egg_piece`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_pipis_center`,index:662,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_pipis_destroy_fx`,index:663,parent:null,sprite:`spr_boxing_crescent`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_armcannon_smoke`,index:664,parent:null,sprite:`spr_boxing_smoke`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_phonecall_sneohead`,index:665,parent:null,sprite:`spr_sneo_crew`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_phonecall_pipis_stream`,index:667,parent:`obj_collidebullet`,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_wall_controller`,index:668,parent:`obj_bulletparent`,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_arm_laser_telegraph`,index:671,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_faceattack_target`,index:675,parent:null,sprite:`spr_boxing_crescent`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_sneo_biglaser_friendlyhitbox`,index:684,parent:`obj_bulletparent`,sprite:`spr_sneo_laser_friendly`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_tiny_susie`,index:689,parent:null,sprite:`spr_tiny_susie_sneo`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_sneo_throwkris`,index:690,parent:null,sprite:`spr_susieb_throwkrisready`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_throwtarget`,index:691,parent:null,sprite:`spr_sneo_c_weakpoint_growth`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_kristhrown`,index:692,parent:null,sprite:`spr_krisb_throw`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_vine_cut`,index:693,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_vine_transition`,index:694,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_vine_weak`,index:695,parent:null,sprite:`spr_attack_cut1`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_throwkris_vine_controller`,index:696,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_susie_act`,index:697,parent:null,sprite:`spr_dodgeheart_centered_white`,mask:null,depth:0,visible:!0,solid:!1},{name:`o_coaster_controller_sneo`,index:698,parent:null,sprite:`spr_coaster_explosion`,mask:null,depth:0,visible:!1,solid:!1},{name:`o_coaster_hero_sneo`,index:699,parent:null,sprite:`spr_sneo_car_front`,mask:null,depth:0,visible:!0,solid:!1},{name:`o_coaster_hero_back_sneo`,index:701,parent:null,sprite:`spr_sneo_car_back`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_spamton_neo_enemy`,index:702,parent:`obj_monsterparent`,sprite:`spr_sneo_example`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_sneo_bulletcontroller`,index:703,parent:`obj_bulletgenparent`,sprite:`spr_sneo_c_weakpoint_hit`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_rouxls_power_up_orb`,index:758,parent:null,sprite:`spr_bullet_laser_circle`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_mauswheel_enemy`,index:766,parent:`obj_monsterparent`,sprite:`spr_nothing`,mask:null,depth:0,visible:!0,solid:!1},{name:`o_boxingcontroller`,index:782,parent:null,sprite:`spr_bhero`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_boxing_crescent`,index:837,parent:null,sprite:`spr_boxing_crescent`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_gigaqueen_enemy`,index:845,parent:`obj_monsterparent`,sprite:`spr_cutscene_27_queen_giga_surprise`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_dbullet_vert`,index:858,parent:`obj_collidebullet`,sprite:`spr_diamondbullet_vert`,mask:null,depth:-1,visible:!0,solid:!1},{name:`obj_defeatanim`,index:860,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_healanim`,index:863,parent:null,sprite:`spr_sparestar_anim`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_oflash`,index:864,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_rudebuster_anim`,index:865,parent:null,sprite:`spr_susie_rudebuster`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_rudebuster_bolt`,index:866,parent:null,sprite:`spr_rudebuster_beam`,mask:null,depth:-10,visible:!0,solid:!1},{name:`obj_hypnofx`,index:867,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_spareanim`,index:868,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_battleback`,index:873,parent:null,sprite:null,mask:null,depth:1e4,visible:!0,solid:!1},{name:`obj_spellphase`,index:874,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_battleblcon`,index:875,parent:null,sprite:`spr_battleblcon`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_growtangle`,index:877,parent:`obj_battlesolid`,sprite:`spr_battlebg_0`,mask:`spr_battlebg_0`,depth:5,visible:!0,solid:!1},{name:`obj_dmgwriter`,index:878,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_actor`,index:898,parent:null,sprite:`spr_susied_party`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_cutscene_master`,index:903,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_animator`,index:926,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_move_to_point`,index:928,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_lerpvar`,index:929,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_script_delayed`,index:932,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_lerppitch`,index:933,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_ch2_sceneex2`,index:1004,parent:null,sprite:`spr_event`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_ch2_sceneex2_special`,index:1005,parent:null,sprite:null,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_doom`,index:1101,parent:null,sprite:null,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_gamecontroller`,index:1117,parent:null,sprite:null,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_coaster`,index:1126,parent:null,sprite:`spr_kris_coaster_hurt_front`,mask:null,depth:0,visible:!0,solid:!1},{name:`obj_camera_advanced`,index:1163,parent:null,sprite:`spr_thrashweapon_duck1`,mask:null,depth:0,visible:!1,solid:!1},{name:`obj_camera_area`,index:1165,parent:null,sprite:`spr_swordarea`,mask:null,depth:0,visible:!1,solid:!1}];function On(e){let t=new Map,n=1,r=[...e.bank.names?.()??[]].length,i=[],a=e=>{if(!Number.isFinite(e)||e<1||e>4096)throw Error(`Invalid source surface size`);return Math.ceil(e)};e.sourceSurfaces={create:(r,i)=>{let o=n++,s=a(r),c=a(i);return t.set(o,{width:s,height:c}),e.gfx?.surfaceCreate?.(o,s,c),o},target:n=>{if(n!==null&&!t.has(n))throw Error(`Missing source surface`);if(e.gfx&&!e.gfx.surfaceTarget)throw Error(`Renderer lacks source surfaces`);e.gfx?.surfaceTarget?.(n)},clear:(t,n)=>e.gfx?.surfaceClear?.(t,n),capture:(n,o,s,c,l,u,d)=>{if(!t.has(n))throw Error(`Missing source sprite surface`);let f=i.indexOf(!1);f<0&&(f=i.length),i[f]=!0;let p=`__newsprite${r+f}`,m=a(c),h=a(l);return e.dynamicSprites.set(p,{name:p,width:m,height:h,originX:u,originY:d,bboxMode:1,left:0,right:m-1,top:0,bottom:h-1,sepMasks:0,frames:1,special:!1,playbackSpeed:1,playbackType:1}),e.gfx?.surfaceSprite?.(n,p,o,s,m,h,u,d),p},free:n=>{t.delete(n),e.gfx?.surfaceFree?.(n)},deleteSprite:t=>{let n=/^__newsprite(\d+)$/.exec(t);n&&(i[Number(n[1])-r]=!1),e.dynamicSprites.delete(t),e.gfx?.spriteDelete?.(t)}}}var kn={name:`obj_battleblcon`,index:875,sprite:`spr_battleblcon`,events:{create:(e,t)=>{let n=t.create(I,e.x+5,e.y+5);n.depth=9999999,e.mywriter=n.id,Object.assign(e,{auto_length:0,side:1,xoffset:0,init:0,reformatted:0,remx:e.x,remy:e.y,remmsgno:-1,initwritingx:-1,initwritingy:-1})},step:(e,t)=>{t.byId(e.mywriter)||t.destroy(e)},draw:(e,t)=>{let n=t.byId(e.mywriter);n&&(n.depth=e.depth-5,e.remmsgno!==t.first(I).msgno&&(e.reformatted=0),e.auto_length===0&&(e.init=1,e.reformatted=1),e.reformatted===0&&n.formatted===1&&(e.init===0&&(e.initwritingx=n.writingx,e.initwritingy=n.writingy,e.init=1),e.writingx=n.writingx,e.writingy=n.writingy,e.stringmax=n.stringmax,e.hspace=n.hspace,e.vspace=n.vspace,e.linecount=n.linecount,e.balloonwidth=e.stringmax*e.hspace+10,e.balloonheight=(e.linecount+1)*e.vspace+5,e.side===1&&(n.writingx=e.initwritingx-(e.balloonwidth+20),n.writingy=e.initwritingy-e.balloonheight/2,e.writingx=e.initwritingx-(e.balloonwidth+20),e.writingy=e.initwritingy-e.balloonheight/2),e.side===-1&&(e.xoffset=20,n.writingx=e.initwritingx,n.writingy=e.initwritingy-e.balloonheight/2,e.writingx=e.initwritingx,e.writingy=e.initwritingy-e.balloonheight/2)),e.auto_length===0&&t.drawSelf(e),e.auto_length===1&&e.init===1&&(e.blconscale=e.balloonheight<40?.5:1,e.side===1&&t.drawSprite(`spr_battleblcon_parts`,4,e.x,e.y,1,e.blconscale,0,M.white,1),e.side===-1&&t.drawSprite(`spr_battleblcon_parts`,4,e.x-e.xoffset,e.y,-1,e.blconscale,0,M.white,1),t.drawState.color=M.white,t.drawRect(e.writingx-10,e.writingy-5,e.writingx+e.balloonwidth,e.writingy+e.balloonheight-5,!1),t.drawRect(e.writingx-5,e.writingy-10,e.writingx+e.balloonwidth-5,e.writingy+e.balloonheight,!1)),e.remmsgno=n.msgno)}}},An={0:null,1:[`spr_battleblcon`,-1],2:[`spr_battleblcon_v`,-1],3:[`spr_battleblcon_long`,-1],4:[`spr_battleblcon_clubs`,0],5:[`spr_battleblcon_clubs`,1],6:[`spr_battleblcon_clubs`,2],7:[`spr_battleblcon_long_r`,2],8:[`spr_battleblcon_long_tall`,-1],10:[`spr_battleblcon_long`,-1,!0]};function jn(e,t,n,r,i){let a=An[i];if(a===void 0)return;if(a===null){let i=t.create(I,n,r);return e.mywriter=i.id,i}let o=t.create(kn,n,r);return e.myblcon=o.id,a[0]!==`spr_battleblcon`&&(o.sprite=a[0]),a[1]>=0&&(o.imageIndex=a[1],o.imageSpeed=0),a[2]&&(o.auto_length=1),o}var Mn={name:`obj_growtangle`,index:877,depth:5,parent:p,sprite:`spr_battlebg_0`,mask:`spr_battlebg_0`,events:{create:e=>{Object.assign(e,{imageXscale:0,imageYscale:0,imageAlpha:.3,timer:0,maxtimer:15,growcon:1,imageSpeed:0,imageBlend:o(M.green,M.lime,.5),target_angle:0,fullgrow:0,keep:0,megakeep:0,maxxscale:2,maxyscale:2,customBox:!1,init:0}),e.spr_custom_box=e.sprite},step:(e,t)=>{if(!e.init){if(e.visible&&(e.maxxscale!==2||e.maxyscale!==2)&&e.sprite===`spr_battlebg_0`){e.customBox=!0,e.maxxscale%1!=0&&(e.maxxscale=h(e.maxxscale*37.5)/37.5),e.maxyscale%1!=0&&(e.maxyscale=h(e.maxyscale*37.5)/37.5);let n=e.maxxscale/2,r=e.maxyscale/2,i=t.sourceSurfaces,a=i.create(75*n,75*r);i.target(a),i.clear(M.black,0),t.drawSprite(`spr_battlebg_stretch`,0,37*n,37*r,n,r,0,M.white,1),e.spr_custom_box=i.capture(a,0,0,75*n,75*r,h(37.5*n),h(37.5*r)),e.sprite=`spr_battlebg_stretch_hitbox`,i.target(null),i.free(a)}e.init=1}if(e.growth=0,e.timer<e.maxtimer&&e.growcon===1&&(e.growth=1),e.timer>0&&e.growcon===3&&(e.growth=1),e.growth!==1)return;e.growcon===1&&(e.timer+=1),e.growcon===3&&--e.timer;let n=e.timer/e.maxtimer;if(e.imageXscale=e.maxxscale*n,e.imageYscale=e.maxyscale*n,e.imageAngle=180+180*n+e.target_angle,e.imageAlpha=.5+n*.5,e.visible){let n=t.create(ne,e.x,e.y);e.d=n.id,n.sprite=e.spr_custom_box,n.imageXscale=e.imageXscale/(e.maxxscale/2),n.imageYscale=e.imageYscale/(e.maxyscale/2),n.imageAngle=e.imageAngle,n.depth=e.depth-1,n.imageBlend=e.imageBlend,n.imageAlpha=1-e.imageAlpha+.1,n.imageSpeed=0}e.timer>=e.maxtimer&&e.growcon===1&&(e.growcon=2,e.imageAngle=e.target_angle),e.timer<=0&&e.growcon===3&&t.destroy(e)},draw:(e,t)=>{t.drawSprite(e.sprite,1,e.x,e.y,e.imageXscale,e.imageYscale,e.imageAngle,e.imageBlend,e.imageAlpha),e.customBox&&e.growth&&e.growcon!==2?t.drawSprite(e.spr_custom_box,0,e.x,e.y,e.imageXscale/(e.maxxscale/2),e.imageYscale/(e.maxyscale/2),e.imageAngle,e.imageBlend,e.imageAlpha):t.drawSelf(e)},endStep:(e,t)=>{if(e.keep!==1)return;let n=t.first(Be);if(!n||e.speed===0&&e.megakeep!==1)return;let r=t.spriteWidth(e),i=t.spriteHeight(e),a=e.x-r/2,o=e.x+r/2,s=e.y-i/2,c=e.y+i/2;n.x<a+5&&(n.x=a+5),n.x>o-22&&(n.x=o-22),n.y<s+5&&(n.y=s+5),n.y>c-22&&(n.y=c-22)},destroy:(e,t)=>{if(e.customBox){let n=t.create(Nn,e.x,e.y);n.custom_box_sprite=e.spr_custom_box}}}},Nn={name:`obj_battle_cleanup`,index:58,visible:!1,events:{create:e=>{e.custom_box_sprite=0,e.alarm[0]=30},alarm0:(e,t)=>{Pn(t,e.custom_box_sprite),t.destroy(e)},step:(e,t)=>{t.exists(ne)||(Pn(t,e.custom_box_sprite),t.destroy(e))}}};function Pn(e,t){typeof t==`string`&&e.dynamicSprites.has(t)&&e.sourceSurfaces?.deleteSprite(t)}var Fn=ie({bigLaser:()=>Kn,choicerNeo:()=>zn,dbulletController:()=>In,heartAttack:()=>Yn,phoneBullet:()=>Xn,pipisDestroyFx:()=>Jn,sceneEx2:()=>Wn,sneoPhonecall:()=>Ln,sneoSusieAct:()=>Bn,spamtonCherub:()=>Rn,spamtonShot:()=>qn,throwKris:()=>Hn,throwKrisVineController:()=>Vn,tinyRalsei:()=>Un,wireheart:()=>Gn}),J=(e,t)=>({name:e,index:t}),In=J(`obj_dbulletcontroller`,394),Ln=J(`obj_sneo_phonecall`,629),Rn=J(`obj_spamton_cherub`,595),zn=J(`obj_choicer_neo`,61),Bn=J(`obj_sneo_susie_act`,697),Vn=J(`obj_sneo_throwkris_vine_controller`,696),Hn=J(`obj_sneo_throwkris`,690),Un=J(`obj_sneo_tiny_ralsei`,639),Wn=J(`obj_ch2_sceneex2`,1004),Gn=J(`obj_sneo_wireheart`,640),Kn=J(`obj_sneo_biglaser`,637),qn=J(`obj_spamtonshot`,598),Jn=J(`obj_pipis_destroy_fx`,663),Yn=J(`obj_sneo_heartattack`,613),Xn=J(`obj_sneo_phonebullet`,600),Zn={name:`obj_sneo_bulletcontroller`,index:703,events:{create:()=>{throw Error(`NEO bullet controller must be registered before creation`)}}},Qn=[0,1,1.5,6,8.5,9,12],$n=(e,t,n)=>e+(t-e)*n,er=e=>-1*((e-1)**4-1);function tr(e){let t=(t,n)=>t.all(e(n)),n=(t,n)=>{let r=t.first(e(n));if(!r)throw Error(`NEO bullet controller requires ${n}`);return r},r=e=>n(e,`obj_spamton_neo_enemy`),i=(t,n)=>{let i=r(n);Object.assign(t,{type:1,btimer:99,atimer:0,timermax:12,damage:-1,grazepoints:-1,timepoints:-1,inv:-1,grazed:-1,grazetimer:-1,element:6,target:-1,side:1,difficulty:i.difficulty,made:0,hellmode:i.hellmode,init:0,sameattack:0,sameattacker:0,miny:999,maxy:999,maxx:999,creator:0,sneo:e(`obj_spamton_neo_enemy`),hideshooty:1,lastType:0,sneoarm_x:i.x+i.partxoff[1],sneoarm_y:i.y+i.partyoff[1],elevatororb:2,doubleelevatorattack:0,arm1:-1,arm2:-1,arm3:-1,sneodollarcount:0,mercyaccumulated:0,hearttargettimer:0,facetimeincrease:0,krishp:n.globals.hp[1],sushp:n.globals.hp[2],ralhp:n.globals.hp[3]})};function o(t,n){let r=n.globals;for(t.__sameattack=0,t._sameattacki=0;t._sameattacki<3;t._sameattacki++)r.monsterattackname[t._sameattacki]===r.monsterattackname[t.creator]&&r.monster[t._sameattacki]===1&&t.__sameattack++;t.sameattack=t.__sameattack,t.sameattack>1&&(t.creator===2?t.sameattacker=t.sameattack-1:t.creator===1&&(t.sameattacker=t.sameattack===3?t.creator:Number(r.monsterattackname[0]===r.monsterattackname[1])));let i=n.first(e(`obj_growtangle`));i&&(t.miny=i.y-n.spriteHeight(i)/2,t.maxy=i.y+n.spriteHeight(i)/2,t.minx=i.x-n.spriteWidth(i)/2,t.maxx=i.x+n.spriteWidth(i)/2),t.init=1}function s(n,r,i){if(n.init===1)n.btimer=0,r.create(e(`obj_sneo_guymaker`),0,0),n.init=2,r.globals.turntimer=n.difficulty===2?360:n.difficulty===3?300:240;else if(n.difficulty===2){if([40,150,260].includes(n.btimer)){n.sneoarm_x=i.x+i.partxoff[1],n.sneoarm_y=i.y+i.partyoff[1],n.armangle=-68-r.random.random(32),n.side=n.armangle;let t=n.sneoarm_y+A(60,n.armangle-90),a=n.sneoarm_x+x(60,n.armangle-90),o=r.create(e(`obj_sneo_biglaser`),a,t);n.d=o.id,o.direction=n.armangle-90,o.imageAngle=n.armangle-90,o.depth+=1,o.damage=n.damage*2,o.target=n.target,i.aimmode=1,i.armaim=n.armangle,i.partmode=3}else if([90,200,310].includes(n.btimer)){for(let e of t(r,`obj_sneo_biglaser`))e.firecon=1,e.active=1,e.imageBlend=M.white;i.partmode=12}else if(n.btimer>=90&&n.btimer<120||n.btimer>=200&&n.btimer<230||n.btimer>=310&&n.btimer<340){for(let e of t(r,`obj_sneo_biglaser`))e.x=n.sneoarm_x+x(60,n.armangle-90),e.y=n.sneoarm_y+A(60,n.armangle-90),e.direction=n.armangle-90,e.imageAngle=n.armangle-90;i.armaim=n.armangle}else if([130,240,350].includes(n.btimer)){for(let e of t(r,`obj_sneo_biglaser`))e.firecon=2;i.partmode=4}}else n.difficulty===3&&n.btimer===1&&(i.partmode=36)}function c(e,t,n,r){n.x-=10;let i=t.globals.turntimer-1;n.vinex=((Math.min(10,i)/10-1)**5+1)*50,n.x=n.xstart+er(i/20)*200,r&&(n.y=$n(n.y,n.___myremembery,i/20))}function l(n,r,i){if(n.atimer++,n.atimer===1&&(n.btimer=0),n.atimer===6){let t=r.create(e(`obj_pipis_egg_bullet`),i.x+4,i.y+60);n.bul=t.id,Object.assign(t,{type:2,drawlabel:1,depth:i.depth,gravity:.2+r.random.random(10)/100,vspeed:0,hspeed:-1.55,target:n.target,damage:n.damage})}if(n.atimer<20&&(i.x+=10,i.vinex=(Math.min(10,n.atimer)/10)**5*300,i.x=i.xstart+(n.atimer/20)**2*300),n.atimer===20&&n.init===1){i.x=i.xstart+300,i.vinex*=-1;let t=r.create(e(`obj_pipis_controller`),n.x,n.y);n.pipis=t.id,t.damage=n.damage,t.target=n.target,n.init=2}let a=r.globals.turntimer;if(a<21&&a>1){i.partmode=1;for(let e of t(r,`obj_sneo_phonecall`))e.fadealpha=0;c(n,r,i,!0)}a===1&&(i.x=i.xstart)}function u(r,i,a){let o=i.globals;if(r.atimer++,r.atimer===1&&a.facebroken===2&&(o.turntimer=170,a.facebroken=1),r.atimer<20&&(a.x+=10,a.vinex=(Math.min(10,r.atimer)/10)**5*300,a.x=a.xstart+(r.atimer/20)**2*300),r.atimer===20){let o=i.create(e(`obj_sneo_faceattack`),i.view.x+424,i.view.y+100);r.face=o.id,o.target=r.target,o.damage=r.damage,o.special=r.hellmode,a.faceattackcount===1&&(o.first_time=!0),i.userEvent(o,0);for(let e of i.all(r.object))e.facetimeincrease=0,a.eyeshp<=0&&e.facetimeincrease++,a.nosehp<=0&&e.facetimeincrease++,a.mouthhp<=0&&e.facetimeincrease++;let s=n(i,`obj_sneo_bulletcontroller`).facetimeincrease;for(let e of t(i,`obj_sneo_faceattack`))e.type===1?s>=1&&s<=3&&(e.timer+=20):(s===1&&(e.timer+=20),(s===2||s===3)&&(e.timer+=50))}let s=t(i,`obj_sneo_faceattack`);if(o.turntimer>80&&s.length&&s[0].init===1&&a.facebroken===0){let e=0;P(r,`enemy`);for(let t=0;t<s.length;t++)r.enemy[t]=s[t].id,s[t].type!==0&&s[t].broken===0&&(e=1);e===0&&(o.turntimer=80)}if(o.turntimer<21&&o.turntimer>1){for(let e of s)e.imageAlpha-=.1,U(e.imageAlpha,0)&&i.destroy(e);c(r,i,a,!0)}o.turntimer===1&&(a.facebroken===1&&(a.facebroken=0),a.x=a.xstart)}function d(r,i,a){let o=n(i,`obj_growtangle`);if(r.init===1){i.globals.turntimer=1200,i.create(e(`obj_finale_growtangle`),o.x,o.y),r.init=2,r.special=1,r.btimer=0;for(let e of t(i,`obj_sneo_hitdetector`))e.active=!1}if(r.special===1&&r.btimer===45){r.special=2,r.d=i.create(e(`obj_sneo_warped_box`),o.x,o.y).id;let t=i.create(e(`obj_sneo_final_forme`),i.view.x+680,a.y);r.d=t.id,Object.assign(t,{intro:-1,damage:r.damage,target:r.target,speed:16.75,direction:180,friction:.5}),r.btimer=0}if(r.special===2&&r.btimer===70){for(let e of t(i,`obj_sneo_warped_box`))e.state=1;for(let e of t(i,`obj_sneo_final_forme_hitbox`))e.destroyable=1;for(let e of t(i,`obj_sneo_final_forme`))e.destroyable=1,e.imageIndex++;r.special=3}if(r.special===3&&r.btimer>=10){r.xx=r.minx-i.random.random(30)-40;let t=[2,5,6].includes(r.sneodollarcount);r.yy=o.y-i.random.random(t?200:100)+([1,4].includes(r.sneodollarcount)?200:100);let n=i.create(e(`obj_sneo_dollar`),r.xx,r.yy);r.d=n.id,n.startscale=r.sneodollarcount===6?2:t?1.5:1,r.sneodollarcount=(r.sneodollarcount+1)%7,r.btimer=3,n.speed=.1}}let p=(i,c)=>{if(!Qn.includes(i.type))throw Error(`Spamton NEO controller type ${i.type} is outside the NORMAL source route`);let p=r(c),m=c.globals;if(f(m.mercymod[p.myself],99)&&f(m.turntimer,1)&&(m.turntimer=1),i.init===0&&o(i,c),i.btimer++,T(i.type,0)&&s(i,c,p),T(i.type,1)&&l(i,c,p),T(i.type,1.5)){if(i.hearttargettimer--,i.init===1){for(let e of t(c,`obj_spamton_neo_enemy`))e.partmode=34;i.init=2,i.btimer=100}if(i.btimer===110)for(let e of t(c,`obj_spamton_neo_enemy`))e.heart_release_con++,e.heart_release_con===1&&(e.makeheart=1)}if(T(i.type,6)&&(i.init===1&&(c.create(e(i.difficulty===9?`obj_sneo_wall_controller`:`obj_sneo_wall_controller_new`),0,0),i.init=2),_(m.turntimer,10)&&f(m.turntimer,9))){for(let e of t(c,`obj_spamton_neo_enemy`))a(e,c,8);m.turntime=9}if(T(i.type,8.5)&&(i.init===1&&(i.init=2,i.made=60),O(i.btimer,1)&&(f(m.turntimer,11)&&f(p.imageAlpha,-.2)&&(p.imageAlpha-=.2),i.btimer===115))){let t=n(c,`obj_growtangle`),r=c.create(e(`obj_sneo_phonehand_master`),t.x+40+c.spriteWidth(t)/2,t.y);i.d=r.id,r.target=i.target}T(i.type,9)&&d(i,c,p),T(i.type,12)&&u(i,c,p)},m=(e,i)=>{let o=r(i),s=i.globals;e.hideshooty&&(o.partframe[1]=0);for(let e of t(i,`obj_spamton_neo_enemy`))Object.assign(e,{makeheartinit:0,makeheartalt:0,partmode:1,heart_release_con:0});if(T(e.type,0)&&e.difficulty===3)for(let e of t(i,`obj_spamton_neo_enemy`))a(e,i,4);else o.x=o.xstart;if(T(e.type,8.5)&&(e.krishp!==s.hp[1]||e.sushp!==s.hp[2]||e.ralhp!==s.hp[3])&&(o.nothitduringphonehands=0),f(e.mercyaccumulated,0))for(let e of t(i,`obj_spamton_neo_enemy`))s.mercymod[e.myself]+=n(i,`obj_sneo_bulletcontroller`).mercyaccumulated,s.mercymod[e.myself]=Math.max(0,Math.min(99,s.mercymod[e.myself]))};return{...Zn,parent:e(`obj_bulletgenparent`),sprite:`spr_sneo_c_weakpoint_hit`,depth:0,visible:!1,events:{create:i,step:p,destroy:m}}}var nr=13056,rr=e=>e.first(oi),ir={name:`obj_sneo_vine_cut`,index:693,depth:0,events:{create:e=>{Object.assign(e,{timer:0,shakeamount:10,type:0,vineid:-1,hide:0,x1:e.x,x2:e.x,y1:e.y,y2:e.y,x3:e.x,x4:e.x,y3:e.y,y4:e.y,alpha:1,lineangle:0,anglecutspeed:3,bottomlinevisible:1})},draw:(e,t)=>{e.timer+=1,e.shakeamount>0&&--e.shakeamount;let n=e.shakeamount-t.random.random(e.shakeamount*2),r=rr(t);e.y1=r.y+r.party[e.vineid]-10+r.partyoff[e.vineid],e.type===0&&(e.timer===11&&(e.x3=e.x1,e.x4=e.x2,e.y3=e.y1-130,e.y4=e.y2,e.y2=e.y1-130),e.timer>11&&(e.y4<e.y3&&(e.y3-=4),e.y1>e.y2&&(e.y2+=4)),e.timer===60&&t.destroy(e)),e.type===1&&(e.timer>1&&e.timer<17&&(e.x3+=x(e.anglecutspeed,e.lineangle+23),e.y3+=A(e.anglecutspeed,e.lineangle+23),e.x2+=x(e.anglecutspeed,e.lineangle-157),e.y2+=A(e.anglecutspeed,e.lineangle-157),e.anglecutspeed-=.2),e.timer>11&&(e.alpha-=.1),(e.timer===60||e.alpha<.1)&&t.destroy(e)),(Math.abs(e.y1-e.y2)<16||e.y2>e.y1)&&(e.bottomlinevisible=0);let i=t.drawState;i.alpha=e.alpha,i.color=M.orange,(e.timer>=11&&e.type===0&&e.hide===0||e.type===1&&e.hide===0)&&t.drawLine(e.x3,e.y3,e.x4,e.y4,2),e.bottomlinevisible===1&&e.hide===0&&t.drawLine(e.x1+n,e.y1+n,e.x2+n,e.y2+n,2),e.timer<11&&e.hide===0&&(i.color=M.white,i.alpha=11-e.timer/10,t.drawLine(e.x1,e.y1,e.x2,e.y2,2),i.alpha=1),i.alpha=1}}};function ar(e,t){return e.x+e.partx_back[t]+e.partxoff_back[t]+Math.sin(e.partsiner_back[t]/30)*2}function or(e,t){return[e.x+e.partx[t]+e.partxoff[t]/1.2+t*5+Math.sin(e.partsiner[t]/30)*2,e.x+e.partx[t]+e.partxoff[t]/1.5+t*8]}var sr={name:`obj_sneo_vine_transition`,index:694,depth:0,events:{create:(e,t)=>{let n=rr(t);Object.assign(e,{timer:0,width:1,vineid:n.vineid,hide:0,x1:e.x,x2:e.x,y1:e.y,y2:e.y,x3:e.x,x4:e.x,y3:e.y,y4:e.y}),e.depth=n.depth+5,e.a=0,e.selected_vine=0;let r=t.random.irandom(17),i=!1,a=0;for(;!i;)if(n.partvisible_back[r]===1)e.a=r,n.partvisible_back[r]=0,e.selected_vine=r,e.x1=ar(n,e.a),e.x2=n.x+n.partx_back[e.a]+n.partxoff_back[e.a],e.y1=n.y+n.party_back[e.a]+n.partyoff_back[e.a],e.y2=-400,i=!0;else if(r+=1,r>17&&(r=0),a+=1,a>18){t.destroy(e);return}[e.x3,e.x4]=or(n,e.vineid),e.y3=n.y+n.party[e.vineid]-10+n.partyoff[e.vineid],e.y4=-400},draw:(e,t)=>{let n=t.globals,r=rr(t);e.timer+=1,e.width+=1/30,[e.x3,e.x4]=or(r,e.vineid),n.myfight!==3&&n.monsterattackname[r.myself]===`UnspecifiedSneoAttack`&&(e.x1=ar(r,e.a)),e.y1=r.y+r.party_back[e.a]+r.partyoff_back[e.a];for(let t=0;t<2;t++)e.x1<e.x3-1&&(e.x1+=1),e.x2<e.x3-1&&(e.x2+=1),e.x1>e.x3+1&&--e.x1,e.x2>e.x3+1&&--e.x2;if(e.timer>=31){if(r.partvisible[e.vineid]=1,r.partweakened[e.vineid]=0,r.extra_vines>0)for(e.ii=0;e.ii<18;e.ii+=1)r.partvisible_back[e.ii]===0&&r.extra_vines>0&&(--r.extra_vines,r.partvisible_back[e.ii]=1,r.vinebgcount+=1);t.destroy(e)}if(e.hide===1)return;let i=t.drawState;i.color=M.green,t.drawLine(e.x1,e.y1,e.x2,e.y2,e.width),i.alpha=(31-e.timer)/30,i.color=nr,t.drawLine(e.x1,e.y1,e.x2,e.y2,e.width),i.alpha=1}}},cr={name:`obj_sneo_vine_weak`,index:695,depth:0,sprite:`spr_attack_cut1`,events:{create:e=>{e.imageSpeed=.25},step:(e,t)=>{e.imageIndex>3&&t.destroy(e)}}},Y=(e,t,n)=>e+(t-e)*n,lr=13056;function ur(e,t){let n=t.globals,r=t.drawState,i=e.myself,a=t.first(Zn)?.type===8.5,o=Ve(t)&&n.mercymod[i]>89?1:0,s=0;for(let n=0;n<18;n++){if(e.partvisible_back[n]===1&&(s+=1),o!==0)continue;e.partmode!==34&&(e.heartattackoffsetx=0),r.color=lr,e.partsiner_back[n]+=.5,a&&(r.alpha=e.imageAlpha);let i=()=>t.drawLine(e.x+e.partx_back[n]+e.partxoff_back[n]+e.heartattackoffsetx+Math.sin(e.partsiner_back[n]/30)*2,e.y+e.party_back[n]+e.partyoff_back[n],e.x+e.partx_back[n]+e.heartattackoffsetx+e.partxoff_back[n],-400,1);e.partvisible_back[n]===1&&i(),r.alpha=1,e.violentendflash>0&&(r.color=M.white,r.alpha=e.violentendflash/10,e.partvisible_back[n]===1&&i(),r.alpha=1)}e.weakentimer>0&&(e.weakentimer+=1,e.weakenshakeamount>0&&(e.weakenshakeamount-=.5));let c=n=>t.drawLine(e.x+e.partx[4]+e.partxoff[4]/1.2+20+Math.sin(e.partsiner[4]/25)*1.8,e.y+e.party[4]-10+e.partyoff[4],e.x+e.partx[4]+e.partxoff[4]/1.5+32,-400,n);(e.lastwirecon===0||e.lastwirecon===1)&&(r.color=lr,a&&(r.alpha=e.imageAlpha),c(1),r.alpha=1,e.violentendflash>0&&(r.color=M.white,r.alpha=e.violentendflash/10,c(1),r.alpha=1)),e.endcon===1&&e.lastwirecon===0&&(e.lastwirecon=1),e.lastwirecon===1&&(e.lastwiretimer+=1,e.lastwiretimer===30&&(e.lastwirecon=2)),(e.lastwirecon===1||e.lastwirecon===2)&&(r.alpha=e.lastwiretimer/30,r.color=M.green,c(1+e.lastwiretimer/30),r.alpha=1);let l=t.exists(Ln);for(let n=0;n<6;n++){r.color=M.green;let i=0;e.partweakened[n]===1&&(i=e.weakenshakeamount-t.random.random(e.weakenshakeamount)*2),e.partweakened[n]>0&&(r.color=M.orange),a&&(r.alpha=e.imageAlpha);let o=()=>t.drawLine(e.x+e.partx[n]+e.partxoff[n]/1.2+n*5+Math.sin(e.partsiner[n]/30)*2+i,e.y+e.party[n]-10+e.partyoff[n]+i,e.x+e.partx[n]+e.partxoff[n]/1.5+n*8,-400,2);e.partvisible[n]===1&&o(),r.alpha=1,e.partweakened[n]===1&&e.weakentimer<11&&(r.color=M.white,r.alpha=11-e.weakentimer/10,l&&(r.alpha=e.imageAlpha),o(),r.alpha=1),e.violentendflash>0&&(r.color=M.white,r.alpha=e.violentendflash/10,l&&(r.alpha=e.imageAlpha),o(),r.alpha=1),e.partweakened[n]===1&&e.weakentimer===10&&(e.partweakened[n]=2)}if(Ve(t)&&n.mercymod[i]>89&&s>0&&!t.exists(sr)&&!t.exists(ir))for(let n=0;n<6;n++)e.partvisible[n]===0&&(e.vineid=n,e.vine=t.create(sr,e.x,e.y).id)}function dr(e,t){let n=t.globals.monsterat[e.myself],r=(r,i)=>{let a=t.create(Gn,e.x+10,e.y+80);return e.wireheart=a.id,a.boss=e.id,a.bossx=e.x+10,a.bossy=e.y+80,a.type=r,a.target=3,i?.(a),a.damage=Math.floor(n*5*.6),a},i=t=>{t.special=e.hellmode},a=e.hearttype,o=e.makehearttype;if(a===0)r(0,i);else if(a===1)r(0,i),r(1),r(1);else if(a===2)r(0,t=>{t.bighearttype=1,t.special=e.hellmode});else if(a===3||a===4){if(o===0&&r(1),o===0||o===3){let e=r(a);a===3&&(e.altbiter=3)}if(o===0||o===4){let e=r(a);a===3&&(e.altbiter=4)}}for(let n=0;n<6;n++){let n=t.create(ne,e.x+10,e.y+80);n.sprite=`spr_bullet_laser_circle`,n.speed=10+t.random.random(2),n.direction=140+t.random.randomRange(-40,40),n.gravity=1,n.imageXscale=.5+t.random.random(.5),n.imageYscale=n.imageXscale}e.makeheart=0}var fr=[10,30,-50,-50,40,60,-30,30],pr=[-40,90,50,50,-40,-100,30,-30],mr=[4,0,0,0,0,15,0,4],hr=[-20,-120,-30,30,0,0,-230,0],gr=[-20,-250,30,-30,0,0,-120,-30];function _r(e,t,n){e.partx[t]=Y(e.partx[t],0,.25*n),e.party[t]=Y(e.party[t],0,.25*n),e.partrot[t]-=10*n;let r=e.partmode;r===5||r===8||r===9?(e.partrot[t]/=2,e.partrot[t]+=10*n,e.partframe[t]=1):r===6||r===7?(e.partrot[t]/=2,(r>6||e.partrot[1]<=-120)&&(e.partframe[t]=0)):r===11?e.partframe[t]+=.2*n:r===12?e.partframe[t]+=.3*n:e.partframe[t]+=.05*n,e.partframe[t]>=3&&(e.partframe[t]=0),e.partframe[t]>=2&&(e.partrot[t]+=20*n)}function vr(e,t,n){let r=t.globals,a=e.f,o=e.partmode;if(o<20){if(o===0&&(e.partsiner[n]=0,e.partframe[n]=0,n===5?(e.partrot[n]=Y(e.partrot[n],30,.25*a),e.partx[n]=Y(e.partx[n],-10,.25*a),e.party[n]=Y(e.party[n],10,.25*a),e.dead===1&&(e.partframe[n]=3)):(e.partrot[n]=Y(e.partrot[n],0,.25*a),e.partx[n]=Y(e.partx[n],0,.25*a),e.party[n]=Y(e.party[n],0,.25*a),Math.abs(e.partrot[n])<1&&(e.partrot[n]=0),Math.abs(e.partx[n])<1&&(e.partx[n]=0),Math.abs(e.party[n])<1&&(e.party[n]=0))),o===1||o===3||o>=5){if(o===1&&e.aimmode!==0&&(e.aimmode=0),(o===3||o>=9&&o<=13)&&n===1){let r=t.first(Be);e.aimmode===2&&r&&o===3?e.armaim=i(e.x+e.partxoff[n],e.y+e.partyoff[n],r.x+8,r.y+8)+90:e.aimmode!==1&&(e.armaim=-80),o<10&&(e.partrot[n]=Y(e.partrot[n],e.armaim,.25*a)),o<9&&(e.partframe[n]=o===3?1:3),o===12&&(e.partframe[n]=1),o>=10&&(e.partrot[n]=e.partrot[n]===e.armaim?e.armaim+2:e.armaim)}else o>=6&&o<11&&n===1?(e.partrot[n]=Y(e.partrot[n],-160,.25*a),e.partframe[n]!==2&&e.partrot[n]<=-90&&(e.partframe[n]=2)):(n===1&&(o===5||o===1)&&(e.partframe[n]=0),e.partsiner[n]+=(1+n/5)*a,e.partrot[n]=Math.sin(e.partsiner[n]/30)*15);n===5&&_r(e,n,a)}o===2&&(e.partsiner[n]+=(1+n/5)*a,e.partx[n]=Math.sin(e.partsiner[n]/2*a),e.party[n]=Math.cos(e.partsiner[n]/2*a),e.shocker<0&&(e.partrot[n]=60-t.random.random(120),n===5&&(e.partframe[n]+=a,e.partframe[n]>=3&&(e.partframe[n]=0)))),o===4&&(e.idealrot=[-43,-180,-20,-10,-31,-60,-61,-56],e.shotanimtimer===.125*a&&n===1&&(e.armendx=e.x+e.partx[1]+e.partxoff[1]+x(e.armlength,e.partrot[1]-93),e.armendy=e.y+e.party[1]+e.partyoff[1]+A(e.armlength,e.partrot[1]-93),t.exists(Yn)&&(e.aimmode=0)),e.shotanimtimer+=.125*a,e.shotanimtimer<13&&(e.partframe[5]=2,e.partrot[n]=Y(e.partrot[n],e.idealrot[n],.3*a),e.lerper=0),e.shotanimtimer>=13&&(e.partframe[5]=1,e.lerper+=.015*a,n!==1&&(e.partrot[n]=Y(e.partrot[n],Math.sin(e.partsiner[n]/30)*15,e.lerper)),n===1&&(e.partrot[n]=Y(e.partrot[n],e.armaim,e.lerper))),e.shotanimtimer>=24&&(e.shotanimtimer=0,e.partmode=3)),e.partmode===6&&(e.shotanimtimer=0),e.partmode===7&&(e.partrot[5]+=Math.sin(e.shotanimtimer/5)*15,e.shotanimtimer+=.2*a,e.shotanimtimer>60&&(e.partmode=6)),n===5&&(e.partmode>=15&&e.partmode<=18?(e.partmode===15&&(e.partframe[5]=2,e.headsize=Y(e.headsize,.5,.25)),e.partmode===16&&(e.partframe[5]=2,e.headsize=Y(e.headsize,1,.25)),e.partmode===17&&(e.partframe[5]=2,e.headsize=Y(e.headsize,1.5,.25),e.partrot[5]+=t.random.random(20))):e.headsize=Y(e.headsize,0,.25))}if(e.partmode>=21&&e.partmode<=30){let r=e.partmode;(r===21||r===23||r===24||r===25)&&(P(e,`idealrot`,()=>Array(8).fill(0)),e.partsiner[n]+=.1,e.partx[n]=Y(e.partx[n],0,.5),e.party[n]=Y(e.party[n],0,.5),e.idealrot[n]=Math.sin(e.partsiner[n]+n/8)*20,e.idealrot[1]=Math.sin(e.partsiner[2])*60,e.idealrot[2]=Math.sin(e.partsiner[2]-.1)*60,e.idealrot[3]=-Math.sin(e.partsiner[2]+.3)*60,e.idealrot[6]=-Math.sin(e.partsiner[2]+.1)*60,e.partframe[5]=1,e.partrot[n]=Y(e.partrot[n],e.idealrot[n],.5),e.partrot[5]+=2,n===5&&(r===23&&(e.partframe[5]=2,e.headsize=Y(e.headsize,.5,.25)),r===24&&(e.partframe[5]=2,e.headsize=Y(e.headsize,1,.25)),r===25&&(e.partframe[5]=2,e.headsize=Y(e.headsize,1.5,.25),e.partrot[5]=-15,e.partx[n]=t.random.random(2),e.party[n]=t.random.random(2)))),r===22&&(e.partframe[5]=0,e.partrot[5]=Math.sin(e.partsiner[0]/2)*4,e.partsiner[0]+=.1,e.partsiner[0]>=5&&(e.partx[n]=t.random.random(2),e.party[n]=t.random.random(2))),r===27&&(P(e,`idealrot`,()=>Array(8).fill(0)),e.partframe[5]=1,e.idealrot[n]=0,e.idealrot[2]=45,e.partframe[2]=1,e.partrot[n]=Y(e.partrot[n],e.idealrot[n],.5))}e.partmode>=30&&br(e,t,n),e.partmode===34&&xr(e,t,n),e.partmode===35&&Sr(e,t,n),e.partmode===36&&Cr(e,t,n),e.partmode===40&&(n===0&&e.dontchangepose===0&&(e.shocktimer+=1),e.partsiner[n]+=(1+n/5)*a,e.partx[n]=Math.sin(e.partsiner[n]/2*a),e.party[n]=Math.cos(e.partsiner[n]/2*a),(e.shockthreshold<=5&&e.hurttimer2===0&&n===0||e.smokethreshold>1&&n===0)&&(e.smoketimer+=1,e.smoketimer>=e.smokethreshold&&(yr(e,t,-1,-2),e.smoketimer=0)),e.shockthreshold<=8&&e.hurttimer2===0&&r.flag[8]===0&&(e.fsiner=e.partsiner[n]/8,e.flash=1),r.flag[8]===1&&(e.shockthreshold=Math.min(Math.max(e.shockthreshold,5),100)),e.shocktimer>=e.shockthreshold&&(e.partrot[n]=60-t.random.random(120),n===4&&(e.partrot[n]=40-t.random.random(80)),n===5&&(e.partframe[n]+=a,e.partframe[n]>=3&&(e.partframe[n]=0)),n===7&&(e.shocktimer=0))),e.partmode===41&&wr(e,t,n),e.partmode===42&&Tr(e,t,n),e.partmode===43&&n===0&&Er(e,t)}function yr(e,t,n,r,i=8){let a=t.create(re,e.x+50,e.y+80);a.visible=!1,E(a,t,De,1,`visible`,!0),a.depth=e.depth+10,a.imageAlpha=2.5,a.sprite=`spr_cakesmoke`,a.hspeed=t.random.randomRange(2,i),a.gravity=-.5,a.friction=.2,a.vspeed=t.random.randomRange(n,r)}function br(e,t,n){if(e.partmode===30&&(e.headsize=0,e.partsprite[5]=`spr_sneo_head_preview`,e.partframe[5]===0&&(e.partframe[5]=1),e.partsprite[0]=`spr_nothing`,e.partsiner[n]+=1,e.shake_head===0?(e.party[n]=Math.sin(e.partsiner[n]/15)*4,P(e,`idealrot`,()=>Array(8).fill(0)),e.idealrot[n]=Math.sin(e.partsiner[n]/20)*4):n===5&&(e.shake_head===1&&(e.partframe[5]+=1,R(t,`snd_swallow`)),e.partrot[5]=Math.sin(e.shake_head*2)*8+t.random.random(4),e.party[5]=t.random.random(4),e.partx[5]=t.random.random(4),e.shake_head+=1,e.shake_head>=6&&(e.shake_head=0,e.partrot[5]=0))),e.partmode===31&&n===5){R(t,`snd_weaponpull_fast`);let n=0,r;for(let i=0;i<5;i++)r=t.create(re,n*8+e.x+e.partx[5]*e.facing+e.partxoff[5]*e.facing+e.lastxoff,e.y+e.party[5]+e.partyoff[5]),r.sprite=`spr_sneo_head_preview`,r.imageIndex=0,r.imageSpeed=0,r.imageXscale=-2-n/5,r.imageYscale=2+n/5,r.xrate=0,r.yrate=0,r.imageAlpha=1+n,n+=.2;r.imageAngle=e.partrot[5]*e.facing;let i=k(t,e,e.x+e.partx[5]*e.facing+e.partxoff[5]*e.facing+e.lastxoff,e.y+e.party[5]+e.partyoff[5],`spr_sneo_head_preview`);i.imageXscale=-2,e.partmode=32}if(e.partmode===33){for(let e of t.all(Ie))e.sprite===`spr_sneo_head_preview`&&t.destroy(e);e.partsprite=[`spr_sneo_wingl`,`spr_sneo_arml`,`spr_sneo_legl`,`spr_sneo_legr`,`spr_sneo_body`,`spr_sneo_head`,`spr_sneo_armr`,`spr_sneo_wingr`],e.partframe[5]=0,e.partmode=0,R(t,`snd_bump`)}}function xr(e,t,n){let r=t.globals,i=e.f,a=e.difficulty;e.hearttype=a>=1&&a<=4?a:0;let o=e.heart_release_con===1?-20:0;P(e,`idealx`,()=>Array(8).fill(0)),P(e,`idealrot`,()=>Array(8).fill(0)),n===0&&(e.siner+=1,e.heart_release_con>=2&&(e.heart_release_con=0),e.heart_release_con===0&&(e.idealx=[0,0,0,0,0,0,0,0],e.idealrot=[...fr],e.hearttype>2&&t.count(Gn)<3&&e.makehearttimer<1&&r.turntimer>100&&e.makeheartinit===1&&(e.makehearttimer=80,e.makeheart=1,e.makehearttype=t.random.choose(3,4),e.makeheartalt!==0&&(e.makehearttype=e.makeheartalt,e.makehearttimer=120))),e.heart_release_con===1&&(e.idealx=[...mr],e.idealrot=[...pr]),r.turntimer<20&&(e.idealx=[0,0,0,0,0,0,0,0],e.idealrot=[0,0,0,0,0,0,0,0]),e.makehearttimer>0&&--e.makehearttimer,e.makeheart&&(e.makeheartinit===0&&(e.makeheartinit=1,e.makehearttype=0),dr(e,t))),r.turntimer<20?(e.partrot[n]=Y(e.partrot[n],0,.14*i),e.partx[n]=Y(e.partx[n],0,.1*i),e.party[n]=Y(0,e.party[n],.06*i),e.heartattackoffsetx=Y(e.heartattackoffsetx,0,.06*i),e.x=Y(e.x,e.xstart,.1)):(e.partrot[n]=Y(e.partrot[n],e.idealrot[n]+t.random.random(4),.14*i),e.partx[n]=Y(e.partx[n]+o,e.idealx[n],.1*i),e.party[n]=Y(e.party[n],0,.06*i),e.heart_release_con===0&&(e.heartattackoffsetx=Y(e.heartattackoffsetx,-10,.01*i)),e.heart_release_con===1&&(e.heartattackoffsetx=Y(e.heartattackoffsetx,-60,.01*i)),e.x=Y(e.x,e.xstart+60,.1))}function Sr(e,t,n){let r=e.f;P(e,`idealx`,()=>Array(8).fill(0)),P(e,`idealrot`,()=>Array(8).fill(0)),n===0&&(e.siner+=1.3,e.dance_timer+=1,e.dance_timer>9&&(e.dance_timer=0,e.dance_con+=1),e.dance_con>=2&&(e.dance_con=0),e.dance_con===0&&(e.idealx=[0,0,0,0,0,0,0,0],e.idealrot=[...hr]),e.dance_con===1&&(e.idealx=[...mr],e.idealrot=[...gr])),e.partrot[n]=Y(e.partrot[n],e.idealrot[n]+t.random.random(4),.14*r),e.partx[n]=Y(e.partx[n],e.idealx[n],.1*r),e.party[n]=Y(e.party[n],0,.06*r),n===5&&(e.partx[n]=Y(e.partx[n],0,.25*r),e.party[n]=Y(e.party[n],0,.25*r),e.partrot[n]-=10*r,e.partframe[n]+=.05*r,e.partframe[n]>=3&&(e.partframe[n]=0),e.partframe[n]>=2&&(e.partrot[n]+=20*r)),e.y=e.ystart+Math.sin(e.siner/6)*30,e.x=Y(e.x,e.xstart+60,.1)}function Cr(e,t,n){if(P(e,`idealrot`,()=>Array(8).fill(0)),e.shootydanceinit===0&&(e.shootydanceinit=1,e.shootydancex=e.x,e.shootydancey=e.y),e.endcon>0?((e.dancealtcon===1||e.dancealtcon===2)&&(e.siner+=.23),e.x=e.xstart+Math.sin(e.siner/20)*10,e.y=e.ystart+Math.sin(e.siner/6)*20):(e.x=e.shootydancex+Math.sin(e.siner/20)*10,e.y=e.shootydancey+Math.sin(e.siner/6)*20),e.armendx=e.x+e.partx[1]+e.partxoff[1]+x(e.armlength,e.partrot[1]-93),e.armendy=e.y+e.party[1]+e.partyoff[1]+A(e.armlength,e.partrot[1]-93),e.dance_timer===0){let n=t.first(Be);n&&(e.armangle=i(e.partxoff[1],e.partyoff[1],n.x,n.y)),e.idealrot[5]=-15}if((n!==1||e.endcon>0)&&(e.partsiner[n]+=.1,e.partx[n]=Y(e.partx[n],0,.5),e.party[n]=Y(e.party[n],0,.5),e.idealrot[n]=Math.sin(e.partsiner[n]+n/8)*20,e.idealrot[1]=Math.sin(e.partsiner[2])*60,e.idealrot[2]=Math.sin(e.partsiner[2]-.1)*60,e.idealrot[3]=-Math.sin(e.partsiner[2]+.3)*60,e.idealrot[6]=-Math.sin(e.partsiner[2]+.1)*60,e.partrot[5]=-15-Math.abs(Math.sin(e.head_recoil_amount/60))*150,e.partframe[5]=2,e.head_recoil_amount=Y(e.head_recoil_amount,0,.03),e.partrot[n]=Y(e.partrot[n],e.idealrot[n],.5)),n===0&&e.endcon===0){if(e.siner+=1.3,e.dance_timer+=1,e.dance_timer===7||e.dance_timer===42){let n=t.create(Kn,e.x,e.y);e.d=n.id,n.depth+=1,n._type=1,e.chargeshot_sound=t.soundLoop?.(`snd_chargeshot_charge`),e.chargesfxtimer=1}let n=n=>{for(let e of t.all(Kn))t.destroy(e);let r=t.create(qn,e.armendx,e.armendy);e.shot=r.id,r.target=e.mytarget,r.damage=e.damage,e.armaim+=n,e.head_recoil_amount=-170,t.soundStop?.(e.chargeshot_sound),R(t,`snd_chargeshot_fire`,.5,.6)};e.dance_timer===32&&n(360),e.dance_timer===64&&n(-360),e.dance_timer===65&&(e.dance_timer=3),e.chargesfxtimer===1&&(e.chargepitch=.1,t.soundPitch?.(e.chargeshot_sound,e.chargepitch),t.sourceAudio?.volume(e.chargeshot_sound,0,0),t.sourceAudio?.volume(e.chargeshot_sound,.8,20)),e.chargesfxtimer>0&&e.chargesfxtimer<=30&&(e.chargesfxtimer+=1,e.chargepitch+=.03,t.soundPitch?.(e.chargeshot_sound,e.chargepitch))}if(n===1&&e.endcon===0){let r=t.exists(Kn)?-4+t.random.random(8):0;e.partrot[n]=Y(e.partrot[n],e.armaim,.12)+r,e.partframe[n]=1;for(let n of t.all(Kn))n.x=e.armendx,n.y=e.armendy}}function wr(e,t,n){let r=t.globals,i=e.f;if(n===0&&(e.laughtimer+=1),n===5){let r=e.laughtimer;r===1&&R(t,`snd_sneo_laugh_long`),r>=1&&r<30&&(e.headsize=0,e.partframe[n]=0,e.headsize=t.random.random(.25),e.partrot[n]=30+t.random.random(10)),r>=30&&r<48&&(e.partframe[n]=1,e.headsize=t.random.random(.25),e.partrot[n]=-40+t.random.random(10)),r>=48&&r<60&&(e.partframe[n]=2,e.headsize=t.random.random(.25),e.partrot[n]=30),r>=60&&(e.partframe[n]=3,e.headsize=t.random.random(.25),e.partrot[n]=-70+t.random.random(10)),r>=80&&(e.headsize=0),e.partframe[n]>=3&&(e.partframe[n]=0)}e.partsiner[n]+=(1+n/5)*i,e.partx[n]=Math.sin(e.partsiner[n]/2*i),e.party[n]=Math.cos(e.partsiner[n]/2*i),r.flag[8]===1&&(e.shockthreshold=Math.min(Math.max(e.shockthreshold,5),100))}function Tr(e,t,n){let r=e.f,i=t.view.y;if(e.partsiner[n]=0,e.partframe[n]=0,e.partframe[5]=7,n!==0)return;let a=0;e.y<i+130?(e.fakegrav+=1,e.y+=e.fakegrav):a=1,a===1&&e.y<i+216&&(e.partrot[2]=Y(e.partrot[2],-90,.1),e.partrot[3]=Y(e.partrot[3],90,.1),e.partrot[5]=e.y-(i+120),e.y>i+216-30&&(e.partrot[1]=Y(e.partrot[1],-30,.1),e.partrot[6]=Y(e.partrot[6],30,.1)),e.y=Y(e.y,i+216,.1)),a===0&&(e.partrot[n]=Y(e.partrot[n],0,.25*r),e.partx[n]=Y(e.partx[n],0,.25*r),e.party[n]=Y(e.party[n],0,.25*r),Math.abs(e.partrot[n])<1&&(e.partrot[n]=0),Math.abs(e.partx[n])<1&&(e.partx[n]=0),Math.abs(e.party[n])<1&&(e.party[n]=0))}function Er(e,t){let n=0;e.falltimer+=1,e.y<t.view.y+200?(e.fallshake=10,e.fakegrav+=.5+e.fakegrav/10,e.fakegrav=Math.min(Math.max(e.fakegrav,0),16.5),e.y+=e.fakegrav):n=1;let r=e.fakegrav;if(e.partframe[5]=7,e.partrot[1]=-r*6,e.partx[1]=r*2,e.party[1]=r*1.5,e.partrot[6]=-r*6,e.partx[6]=r*.6,e.party[6]=r*2,e.partrot[2]=-r*6,e.partx[2]=-r*1.6,e.party[2]=-r*.65,e.partrot[3]=-r*6,e.partx[3]=-r*2.5,e.party[3]=-r*.15,e.partrot[4]=-r*6.25,e.partx[4]=r*2,e.party[4]=r/1.5,e.partrot[5]=-r*8,e.partx[5]=r*1.8,e.party[5]=r*2,e.partrot[0]=-r*4,e.party[0]=r*3,e.partrot[7]=-r*4,e.party[7]=r*3,n!==0){e.fallshake===10&&R(t,`snd_closet_impact`);for(let n=0;n<7;n++)e.party[n]+=t.random.randomRange(-e.fallshake,e.fallshake),e.partx[n]+=t.random.randomRange(-e.fallshake,e.fallshake);e.fallshake>0&&--e.fallshake}}function Dr(e,t){let n=t.globals,r=e.myself,i=e.f;if(e.partmode===10&&(e.partmode=9),!t.exists(Ln)&&e.imageAlpha<1&&(e.imageAlpha+=.1),e.state===0&&(e.fsiner+=1),ur(e,t),e.specialcon===1){e.specialcontimer+=1;for(let t=0;t<8;t++)e.partrot[t]=Y(e.partrot[t],0,.07*i),e.partx[t]=Y(e.partx[t],0,.05*i),e.party[t]=Y(e.party[t],0,.03*i);e.flameframe=e.specialcontimer/4%2,e.flamealpha=e.specialcontimer/15,e.flamealpha>=.9&&(e.flamealpha=.9),e.specialcontimer>=15&&(e.flamealpha=1-e.specialcontimer/60,e.flamealpha<0&&(e.flamealpha=0)),e.specialcontimer>=60&&(e.specialcontimer=12,e.specialcon=0,e.imageIndex=0),t.drawSprite(`spr_bhero`,10+e.flameframe,e.x+75,e.y+177,-2,2.8+Math.abs(Math.sin(e.specialcontimer/4)/2),0,16711680,e.flamealpha),t.drawSprite(`spr_bhero`,11-e.flameframe,e.x+75,e.y+177,-2,2.8,0,8421376,e.flamealpha/1.4)}e.shocker-=i;for(let i=0;i<8;i++){vr(e,t,i),e.scalebonus=i===5?e.headsize:0,e.shadow_amount>=0&&(e.partblend[i]=o(M.white,M.black,e.shadow_amount)),e.lastxoff=e.facing===-1?110:0,t.exists(In)?(e.partframe[5]=3,e.partblend[5]=e.blend):e.partblend[5]===e.blend&&(e.partblend[5]=16777215);let a=0;if(i===0&&(e.hurttimer2>0&&--e.hurttimer2,e.hurttimer2===1&&(e.endcon===0&&(e.shockthreshold=10,e.partmode=1),e.didwejustdie===0&&Ve(t)&&n.monsterhp[n.chartarget[r]]<=0&&(e.partmode=99,e.dontchangepose=1))),e.hurttimer2>0&&(a=t.random.random(e.hurttimer2)/2-e.hurttimer2/4),e.headendcon===1&&(e.partrot[5]=-37+Math.sin(e.partsiner[4]/16),e.partframe[5]=1,e.partsprite[5]=`spr_sneo_head`),e.headendcon===2&&(e.partrot[5]=15+Math.sin(e.partsiner[4]/16),e.partsprite[5]=`spr_sneo_head_sad`),e.headendcon===3&&(e.partsprite[5]=`spr_sneo_head`),t.exists(Jn)&&i===5&&(e.partrot[5]-=t.random.random(60)),e.headforceframe!==-1&&i===5&&(e.partframe[5]=e.headforceframe),e.funnycheat>5){if(e.funnycheattimer<28&&(e.funnycheattimer+=.125),e.partblend[5]=o(M.white,M.red,e.funnycheattimer/30),e.funnycheattimer===24&&(R(t,`snd_carhonk`),e.funnycheattimer3+=1),e.funnycheattimer3>0&&e.funnycheattimer3<33&&i===5){e.funnycheattimer3+=1;let n=e.funnycheattimer3;n>0&&n<6&&(e.headexpand=Y(e.headexpand,2,n/6)),n>=8&&n<16&&(e.headexpand=Y(e.headexpand,0,(n-8)/8)),n>=16&&n<22&&(e.headexpand=Y(e.headexpand,2,(n-16)/6)),n>=24&&n<32&&(e.headexpand=Y(e.headexpand,0,(n-24)/8)),(n>=4&&n<=10||n>=20&&n<=26)&&(a=-12+t.random.random(24))}e.funnycheattimer2+=1,e.funnycheattimer2>=10&&e.imageAlpha>.6&&(yr(e,t,-1,-2),e.funnycheattimer2=0)}let s=i===5?e.headexpand:0,c=e.scalebonus,l=e.x+e.partx[i]*e.facing+e.partxoff[i]*e.facing+e.lastxoff+a,u=e.y+e.party[i]+e.partyoff[i]-a;Se(e,t,e.partsprite[i],e.partframe[i],l,u,(2+c)*e.facing+s,2+c+s,e.partrot[i]*e.facing,e.partblend[i],e.imageAlpha),e.violentendflash>0&&t.drawSpriteFog(e.partsprite[i],e.partframe[i],l,u,(2+c)*e.facing,2+c,e.partrot[i]*e.facing,M.white,e.violentendflash/10)}e.shocker<0&&(e.shocker=e.shocker_threshold,e.shocker_threshold>2&&(e.shocker_threshold-=.25*i)),e.partmode===13&&(e.partframe[1]=1,e.armendx=e.x+e.partx[1]*e.facing+e.partxoff[1]*e.facing+x(e.armlength,e.partrot[1]-93)*e.facing+15,e.armendy=e.y+e.party[1]+e.partyoff[1]+A(e.armlength,e.partrot[1]-93),e.partframe[5]=e.partsiner[5]/6%3,t.drawState.color=M.white,t.drawCircle(e.armendx+120,e.armendy+6,13+Math.sin(e.partrot[0]/2)*12,!1)),t.drawState.color=M.red,e.headx=e.x+e.partx[5]+e.partxoff[5],e.heady=e.y+e.party[5]+e.partyoff[5];let a=t.byId(e.hitdetector);a&&(a.x=e.headx,a.y=e.heady,a.imageAngle=e.partrot[5],a.imageIndex=e.partframe[5]),(e.hitcon===1||e.hitcon===-1)&&(e.partblend[5]=4235519,e.hitcontimer=0,e.headhit<20&&(e.headhit+=6),e.hitcon=2),e.hitcon===2&&(e.hitcontimer+=i,e.hitcontimer>=5&&(e.partblend[5]=o(e.partblend[5],M.white,.15*i)),e.hitcontimer>=15&&(e.hitcontimer=0,e.hitcon=0,e.partblend[5]=16777215)),e.violentendflash>0&&(e.violentendflash+=1),e.becomeflash===0&&(e.flash=0),e.becomeflash=0}var X=e=>F(`obj_spamton_neo_enemy_slash_Step_0_gml_`+e);function Or(e,t){let n=t.globals;kr(e,t),n.fighting===0&&(e.myself=0,n.mercymod[e.myself]=0),Object.assign(e,{heart_attack_count:10,heart_health:25,heart_speed_scaling:2,heart_1st_wave_timer:6,heart_2nd_wave_timer:11,heart_3rd_wave_timer:16,heart_variant_arm_shoot_timer:90,heart_turntimer:1200,heart_hurt_timer_reduction:27,heart_hurt_timer_reduction_bigshot:108,heart_bullet_image_scale:1.1,heart_bullet_speed_1st_wave:.1,heart_bullet_friction_1st_wave:.1,heart_bullet_speed_2nd_wave:.1,heart_bullet_friction_2nd_wave:.09,heart_bullet_speed_3rd_wave:.1,heart_bullet_friction_3rd_wave:.08,heart_bullet_gravity_acceleration:1.075,crusher_start_hspeed:-3,crusher_start_hacceleration:.4,crusher_turret_speed:15,crusher_turret_distance:44,crusher_x_origin:220,crusher_turret_bullet_speed:-.5,crusher_turret_bullet_gravity:.5,upgrade:0,bigshot:1,bigshotused:0,bigshotcount:0,tinyralsei:0,weakentimer:0,weakenshakeamount:0,maxvinecount:6,vinecuttimer:0,vinebgcount:18,vineid:-1,snapallcount:0,endcon:0,weirdpathendcon:0,weirdpathendtimer:0,endtimer:0,dancealtcon:0,cantspareinit:0,savemeactcon:0,usedact:0,difficulty:0,turn:0,phaseturn:0,phase:1,firstheartattack:0,fireslasers:0,haveusedfinalattack:0,phonejokeplayerdied:0,newcrushermovement:1,sneomacaronihandscon:0,flyingheadsbseen:0,singleshotmercy:0,prevmercy:0,prevhearttack:0,facebroken:0,correct_answer:-1,hurttimer2:0,faceattackcount:0,nothitduringphonehands:1,sneo_defeat_cutscene_version:0,targetbgspeed:0,smoketimer:0,smokethreshold:1,didwejustdie:0,dontchangepose:0,lastwirecon:0,lastwiretimer:0,headendcon:0,finalattackconversationcon:0,funnycheat:0,funnycheattimer:0,funnycheattimer2:0,funnycheattimer3:0,headexpand:0,hellmode:0}),e.laserflash=t.random.irandom(3),Object.assign(e,{talkmax:90,imageSpeed:.16666666666666666,idlesprite:`spr_sneo_example`,hurtsprite:`spr_sneo_example`,sparedsprite:`spr_sneo_example`,custom_draw:1,f:2,imageXscale:2,imageYscale:2,sinerb:0,lerper:0,shocker:0,dead:0,checkcount:0,shake_head:0,heart_release_con:0,shocker_threshold:10,shotanimtimer:0,shocktimer:0,shockthreshold:10,laughtimer:0,fakegrav:0,falltimer:0,fallshake:10,aim:1,hitcon:0}),e.hitdetector=t.create(ii,e.x,e.y).id,Object.assign(e,{stoprumblesfx:0,chargepitch:.1,chargesfxtimer:0,dance_con:0,dance_timer:0,partfocus:0,blend:o(16777215,0,.15),shootydanceinit:0,shootydancex:e.x,shootydancey:e.y}),e.partsprite=[`spr_sneo_wingl`,`spr_sneo_arml`,`spr_sneo_legl`,`spr_sneo_legr`,`spr_sneo_body`,`spr_sneo_head`,`spr_sneo_armr`,`spr_sneo_wingr`];let r=e=>t.bank.get(e).originX,i=e=>t.bank.get(e).originY;for(let t of[`partframe`,`partsiner`,`partrot`,`partx`,`party`,`partweakened`])e[t]=Array(8).fill(0);e.partblend=Array(8).fill(16777215),e.partvisible=Array(8).fill(1),e.partxoff=e.partsprite.map(e=>r(e)*2),e.partyoff=e.partsprite.map(e=>i(e)*2),e.partsiner_back=Array(18).fill(0),e.partx_back=Array(18).fill(0),e.party_back=Array(18).fill(0),e.partvisible_back=Array(18).fill(1),e.partxoff_back=Array.from({length:18},(t,n)=>r(e.partsprite[0])*(1.8+n/9)),e.partyoff_back=Array(18).fill(i(e.partsprite[0])*2),e.heartattackoffsetx=0,e.extra_vines=26,e.armlength=L(e.partxoff[1],e.partyoff[1],36,146),Object.assign(e,{partmode:1,songtime:0,songplaying:1,resumeinterval:1.715,drawaimer:0,phoneevent:0,headmode:0,vinex:0,attackdebug:-1,difficultydebug:-1,musicdebug:0,party_heal:!1,makeheart:0,makeheartinit:0,makehearttype:0,makehearttimer:0,makeheartalt:0,violentendflash:0,head_recoil_amount:0,shadow_amount:0,facing:1,headhit:0,headsize:1,headforceframe:-1,aimmode:0,armaim:-80,hitcontimer:0,balloonorder:0,ballooncon:0,balloonend:1,talkedcon:0,init:0,statustextorder:0,statustextalt:0,statustextalt2:0,statustextupdate:0,joke:0,eyeshp:16,nosehp:16,mouthhp:16,specialcontimer:0,specialcon:0,flameframe:0,flamealpha:0})}function kr(e,t){Object.assign(e,{becomeflash:0,flash:0,turnt:0,turns:0,talktimer:0,state:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,shakex:0,acting:0,actcon:0,mywriter:343249823,acttimer:0,con:0,dodgetimer:0,fatal:0,candodge:0,mytarget:0,ambushed:0,firststrike:0,damage:-1,grazepoints:-1,timepoints:-1,inv:-1,target:-1,grazed:-1,grazetimer:-1,element:`none`,actingsus:0,actingnoe:0,actingral:0,actconsus:0,actconral:0,actconnoe:0,simulorderkri:-1,simulordersus:-1,simulorderral:-1,simulordernoe:-1,simultotal:0,simulboss:-1,talkmax:90,mercymod:0,maxmercy:100,recruitable:1,freezable:1,recruitcount:1,sactionboxx:0,sactionboxy:0,hurtspriteoffx:0,hurtspriteoffy:0,imageXscale:2,imageYscale:2,imageSpeed:.2,idlesprite:`spr_diamond_knight_overworld`,hurtsprite:`spr_diamond_knight_hurt`,sparedsprite:`spr_diamond_knight_spared`,custombody:0}),e._charactsprite=Array(10).fill(382938298329),e.depth=90-(e.y-t.view.y)/50}function Ar(e){let{rr:t,difficulty:n,haveusedfinalattack:r,faceattackcount:i}=e;if(r)return t===9&&e.finalattackconversationcon===0?[`93_0`,25]:void 0;if(t===0&&n===1)return[`56_0`,1];if(t===6&&n===0)return[`57_0`,2];if(t===8&&n===0)return[`58_0_b`,3];if(t===2&&n===0)return[`59_0_b`,4];if(t===8.5&&n===0)return[`60_0`,0];if(t===7&&i===0)return[`61_0`,5];if(t===0&&n===3)return[`62_0`,6];if(t===2&&n===2)return[`63_0_b`,0];if(t===8&&n===1)return[`64_0_b`,7];if(t===8.5&&n===2)return[`65_0`,8];if(t===7&&i===1)return[`66_0`,10];if(t===6&&n===1)return[`67_0`,11];if(t===2&&n===1)return[`69_0_b`,12];if(t===8&&n===3)return[`121_0`,13];if(t===9&&e.finalattackconversationcon===0)return[`93_0`,25]}var jr={1:[`136_0`,0],2:[`137_0`,0],3:[`138_0`,0],4:[`139_0`,0],5:[`140_0`,0],6:[`141_0`,0],7:[`142_0`,0],8:[`143_0`,9],9:[`144_0`,0],10:[`145_0`,0],11:[`146_0`,0],12:[`147_0`,0],13:[`163_0`,0],15:[`173_0`,0],25:[`207_0`,26],26:[`208_0`,27],27:[`209_0`,0]};function Mr(t,n){let r=n.globals,i=t.myself;Ge(t,n),n.exists(e)||n.create(e,0,0),t.turn>14&&t.weirdpathendcon===0&&r.monsterdf[i]>-10&&(r.monsterdf[i]-=3),Object.assign(t,{ballooncon:0,balloonsubcon:0,balloonend:1,talkedcon:0,statustextupdate:0});for(let e of n.all(Bn))--e.turnsleft;r.typer=72,t.rr=-1,gt(t,n);let a=Ar(t);if(a)N(n,0,X(a[0])),t.ballooncon=a[1],t.balloonend=+(a[1]===0),a[0]===`93_0`&&(t.finalattackconversationcon=1);else{let e=n.random.choose(0,1,2,3);e===0&&(t.statustextalt2===0&&(N(n,0,X(`86_0`)),t.ballooncon=15,t.balloonend=0),t.statustextalt2===1&&(N(n,0,X(`87_0`)),t.balloonend=1),t.statustextalt2+=1,t.statustextalt2>1&&(t.statustextalt2=0)),e===1&&(t.statustextalt===0&&N(n,0,X(`58_0`)),t.statustextalt===1&&N(n,0,X(`59_0`)),t.statustextalt+=1,t.statustextalt>1&&(t.statustextalt=0)),e===2&&N(n,0,X(`63_0`)),e===3&&N(n,0,X(`64_0`))}t.usedact=0,t.correct_answer!==1&&(r.typer=72,jn(t,n,t.x-10,r.monstery[i],10)),t.correct_answer=-1,t.talked=t.ballooncon===0?1:.6,t.talktimer=0}function Nr(e,t){let n=t.create(Pe,t.view.x+245,t.view.y+170),r=e.rr,i=()=>{for(let e of t.all(ir))e.hide=1;for(let e of t.all(sr))e.hide=1};r===0&&(n.x+=54,n.maxxscale=3.2,n.maxyscale=1.5,e.chargesfxtimer=0,e.dance_timer=0,e.armaim=-80,e.difficulty===3&&(l(e),j(e,t,e.x+50,e.y,8),i())),r===3&&(n.x+=44,n.y+=54,n.maxxscale=2,n.maxyscale=2),r===5&&(l(e),j(e,t,e.x+200,e.y,8),i()),r===7?(n.x+=15,n.maxxscale=2,n.maxyscale=2,l(e)):r===8?(l(e),j(e,t,e.x,t.view.y+20,8),i()):r===8.5||r===4?(n.x+=64,n.y+=8,n.maxxscale=3.2,n.maxyscale=1.5):r===6?(n.x+=58,n.maxxscale=3.3333333333333335,n.maxyscale=2.3,l(e),j(e,t,e.x+200,e.y,16),i()):r===9&&(n.y+=10,n.maxyscale=1.9,n.maxxscale=2.5)}var Pr={0:`FlyingHeads`,1:`FootballPipis`,2:`HeartAttackNeo`,3:`FootballPipis`,4:`Phonehands`,5:`PipisExplosion`,6:`RECREWColumns`,7:`SneoFaceAttack`,8:`Phonecall`,8.5:`Phonehands`,9:`NeoFinale`,10:`diamonds`};function Fr(e,t){let n=t.globals,r=e.myself,i=e.rr;n.monsterattackname[r]=Pr[i]??`UnspecifiedSneoAttack`;let a;i===5?(a=je(e,t,e.x,e.y,In),a.type=51,a.damage=3,a.btimer=35-t.random.random(30)):i===8?(a=t.create(Ln,e.x-10,e.y+20),a.isattack=1,a.target=e.mytarget,e.difficulty===3?e.phoneevent=2:(e.phoneevent>=1&&(a.skipintro=1),e.phoneevent+=1)):i===10?(a=je(e,t,e.x,e.y,In),a.type=1,a.target=3,e.partframe[5]=3):(a=je(e,t,e.x,e.y,Zn),a.type={0:0,1:1,2:1.5,3:1,4:8.5,6:6,7:12,8.5:8.5,9:9}[i]??i,(i===2||i===7)&&(a.special=e.hellmode),i===7&&(e.faceattackcount+=1),i===9&&(a.target=3)),e.dc=a.id,ce(e,t,`yellow`);for(let e of t.all(Be))e.wspeed=n.sp;z(t,260),i===1&&z(t,300),i===2&&z(t,750+e.hellmode*450),i===2&&e.difficulty===1&&z(t,850+e.hellmode*450),i===2&&e.difficulty===6&&z(t,150),i===6&&z(t,330),i===7&&z(t,300),i===5&&z(t,90)}function Ir(e,t){e.rr=t.random.choose(0,1,2,3),t.globals.battlemsg[0]=X([`294_0`,`295_0`,`296_0`,`297_0`][e.rr])}function Lr(e,t){let n=t.globals,r=e.myself;if(n.monsterhp[r]<n.monstermaxhp[r]*.1&&e.haveusedfinalattack===0)n.battlemsg[0]=X(`312_0`);else if(e.bigshot===1&&e.bigshotused===0&&n.monsterhp[r]>n.monstermaxhp[r]*.7)n.battlemsg[0]=X(`313_0`).split(`~1`).join(pe(4));else if(e.bigshot===1&&e.bigshotused===1){let t={0:`316_0`,1:`317_0`,2:`318_0`,3:`319_0`,6:`320_0`,9:`321_0`};t[e.statustextorder]&&(n.battlemsg[0]=X(t[e.statustextorder])),e.statustextorder+=1}}function Rr(e,t,n,r,i){let a=t.globals,o=e.myself,s=n;if(a.mercymod[o]+s>100&&(s=100-a.mercymod[o]),de(e,t,o,s),s===0){for(let e of t.all(_e))e.type===5&&t.destroy(e);return N(t,0,X(r)),!1}return i&&N(t,0,X(i)),!0}function zr(e,t){let n=t.random.irandom(5),r=0;for(let t=0;t<6&&!(e.partvisible[n]===1&&e.partweakened[n]>0);t++)n+=1,n>5&&(n=0),e.partvisible[n]===1&&(r+=1);e.vinebgcount<1&&(e.maxvinecount=r)}function Br(e,t){let n=t.globals;if(e.myself,e.xx=t.view.x,e.yy=t.view.y,e.acting===1&&e.actcon===0&&e.savemeactcon===0&&(e.actcon=1,e.checkcount===0?(N(t,0,X(`375_0`)),Je(t,X(`376_0`)),Je(t,X(`377_0`))):N(t,0,X(`381_0`)),H(t,e),e.checkcount+=1),e.acting===2&&e.actcon===0||e.acting===3&&e.actcon===0){let r=0;for(let t=0;t<6;t++)e.partvisible[t]===1&&(r+=1);if(e.vinebgcount<1&&(e.maxvinecount=r),n.hp[2]<=0&&n.hp[3]<=0&&e.acting===2)Rr(e,t,4,`946_0`)&&(N(t,0,X(`949_0`)),Je(t,X(`950_0`)));else if(e.acting===3)e.snapallcount+=1,e.snapallcount===2&&(e.snapallcount=0),Rr(e,t,7,`961_0`,`964_0`);else{let n=X(e.simultotal===1?`275_0`:`275_1`);Rr(e,t,2,`973_0`)&&N(t,0,n)}H(t,e),e.acting===2?e.alarm[4]=30:e.actcon=1,e.acting=0}if(e.acting===5&&e.actcon===0&&(e.actcon=12,e.acting=0,e.alarm[4]=15,t.create(Vn,e.x,e.y),l(e),j(e,t,e.x-40,t.view.y+195,8)),e.actcon===13){N(t,0,X(`534_0`).split(`~1`).join(pe(6)));for(let e of t.all(Te))e.visible=!1;for(let e of t.all(ue))e.visible=!1;let n=t.first(ue);e.throwsus=t.create(Hn,n.x,n.y).id,H(t,e),e.actcon=14}if(e.actcon===15){for(let e of t.all(Vn))e.con=2;a(e,t,8),e.actcon=16,e.alarm[4]=15}e.actcon===17&&(e.actcon=1);let r=(r,i,a,o,s,c,l)=>{zr(e,t),n.hp[1]<=0&&n.hp[i]<=0?Rr(e,t,4,a)&&(N(t,0,X(o)),Je(t,X(s))):Rr(e,t,2,c,l),H(t,e),e[`actcon`+r]=0,e[`acting`+r]=0};if(e.actingsus===1&&e.actconsus===1&&(r(`sus`,3,`1127_0`,`1130_0`,`1131_0`,`1140_0`,`1141_0`),e.alarm[4]=30),e.actingsus===2&&e.actconsus===1&&(e.actingsus=0,e.actcon=1,e.bigshotcount=20,N(t,0,X(`898_0`)),H(t,e)),e.actingral===1&&e.actconral===1&&(r(`ral`,2,`1273_0`,`1276_0`,`1277_0`,`1285_0`,`1288_0`),e.actcon=1),e.actingral===2&&e.actconral===1){if(e.actconral=0,e.actingral=0,e.actcon=1,t.count(Un)<4){N(t,0,X(e.simultotal===1?`643_0`:`643_1`)),H(t,e),t.all(Un).forEach((e,t)=>{e.place=t*90});for(let n=0;n<2;n++){t.create(Un,e.x,e.y);let n=t.all(Un),r={4:90,3:180,2:270}[n.length];r!==void 0&&n.forEach((e,t)=>{e.place=t*r})}}else{N(t,0,X(`679_0`)),H(t,e);let r=2;n.hp[2]<n.hp[3]&&(r=2),n.hp[2]<n.hp[4]&&(r=2),n.hp[3]<n.hp[2]&&(r=3),n.hp[3]<n.hp[4]&&(r=3),n.hp[4]<n.hp[2]&&(r=4),n.hp[4]<n.hp[3]&&(r=4),n.hp[r]+=10,R(t,`snd_boost`)}}}function Vr(e,t){(e.actcon===1&&!t.exists(I)||e.actconsus===20||e.actconral===20)&&(e.usedact=1,t.globals.mercymod[e.myself]>99&&e.endcon===0?e.endcon=1:e.endcon===0&&ke(t,e))}var Hr=e=>e.first(Wn);function Ur(e,t){let n=t.globals;if(e.endcon=3,n.typer=72,jn(e,t,e.x-10,n.monstery[e.myself],10),e.ballooncon>=8)for(let e of t.all(I))e.shake=2;return e}function Wr(e,t){if(t.globals,e.endcon===2){if(e.talktimer+=1,le(t)&&e.talktimer>15||!t.exists(I)){r(t);let n=e.ballooncon,i=()=>{e.shocktimer=9999,e.hurttimer2=10};if(n===1)N(t,0,X(`1034_0`)),e.ballooncon=2,e.balloonend=0,i(),e.partmode=40;else if(n===2)N(t,0,X(`1038_0`)),e.ballooncon=3,e.balloonend=0,i();else if(n===3)N(t,0,X(`1042_0`)),e.ballooncon=4,e.balloonend=0,i();else if(n===4)N(t,0,X(`1046_0`)),e.ballooncon=5,e.balloonend=0,i();else if(n===5){N(t,0,X(`1052_0`)),e.ballooncon=6,e.balloonend=0,e.shockthreshold=10,e.hurttimer2=20,R(t,`snd_damage`),e.dontchangepose=0,e.smokethreshold=10,e.partmode=40;for(let n=0;n<6;n++){let n=t.create(re,e.x+50,e.y+80);n.visible=!1,E(n,t,De,1,`visible`,!0),n.depth=e.depth+10,n.imageAlpha=2.5,n.sprite=`spr_cakesmoke`,n.hspeed=t.random.randomRange(2,10),n.gravity=-.5,n.friction=.2,n.vspeed=t.random.randomRange(-1,-8)}}else if(n===6)N(t,0,X(`1058_0`)),e.ballooncon=7,e.balloonend=0;else if(n===7)N(t,0,X(`1062_0`)),e.ballooncon=8,e.balloonend=0;else if(n===8){let n=Hr(t);n&&(n.trackspeed=20),N(t,0,X(`1068_0`)),e.ballooncon=9,e.balloonend=0,e.shockthreshold=10,e.hurttimer2=10,R(t,`snd_sneo_overpower`),t.soundLoop?.(`snd_sneo_overpower`),t.soundPitch?.(`snd_sneo_overpower`,.3),e.targetbgspeed=-5}else n===9?(N(t,0,X(`1076_0`)),e.ballooncon=10,e.balloonend=0,e.shockthreshold=5,t.soundPitch?.(`snd_sneo_overpower`,.5),e.targetbgspeed=-9,e.smokethreshold=1):n===10?(N(t,0,X(`1083_0`)),e.ballooncon=11,e.balloonend=0,e.shockthreshold=3,t.soundPitch?.(`snd_sneo_overpower`,.7),e.targetbgspeed=-13):n===11?(N(t,0,X(`1089_0`)),e.ballooncon=12,e.balloonend=0,e.shockthreshold=2,t.soundPitch?.(`snd_sneo_overpower`,.9),e.targetbgspeed=-17):n===12?(N(t,0,X(`1095_0`)),e.ballooncon=13,e.balloonend=0,e.shockthreshold=1,t.soundPitch?.(`snd_sneo_overpower`,1.1),e.targetbgspeed=-21):n===13&&(N(t,0,X(`1101_0`)),e.ballooncon=0,e.balloonend=1,e.shocktimer=1,t.soundPitch?.(`snd_sneo_overpower`,1.3),e.targetbgspeed=-25);if(Ur(e,t),e.ballooncon===0)for(let e of t.all(I))e.shake=3,e.rate=3;e.alarm[6]=1}let n=Hr(t);n&&(n.trackspeed+=(e.targetbgspeed*6-n.trackspeed)*.1,n.cityscape_speed_max+=(e.targetbgspeed-n.cityscape_speed_max)*.1)}if(e.endcon===4&&(e.talktimer+=1,le(t)&&e.talktimer>15||!t.exists(I))){e.endtimer+=1;let n=e.endtimer;if(n<=90&&t.soundPitch?.(`snd_sneo_overpower`,1.3+n/90*.7),n===120&&(e.violentendflash=1,e.endtimer=140),n===151){t.soundStop?.(`snd_sneo_overpower`);for(let e of t.all(re))t.destroy(e);R(t,`snd_explosion`);let n=k(t,e,-10,-10,`spr_pixel_white`);n.imageXscale=999,n.imageYscale=999,n.depth=0,n.imageAlpha=0,e.whiteall=n.id}if(n>150&&n<162){let r=t.byId(e.whiteall);r&&(r.imageAlpha=(n-150)/11)}if(n===300){let n=k(t,e,-10,-10,`spr_pixel_white`);n.imageXscale=999,n.imageYscale=999,n.depth=-1,n.imageAlpha=0,n.imageBlend=0,e.blackall=n.id}if(n>300&&n<331){let r=t.byId(e.blackall);r&&(r.imageAlpha=(n-300)/30)}n===331&&t.byId(e.whiteall)&&Gr(t)}}function Gr(e){let t=e.globals;for(let e of[1,2,3])t.hp[e]<1&&(t.hp[e]=1);let n=Hr(e);n&&(n.forcend=1,n.con=13)}function Kr(e,t){let n=t.globals;if(e.endcon===2){let i=Hr(t),a=i&&i.shop_spamton_bg_con>0&&i.shop_spamton_bg_con<3?1:0;if(e.talktimer+=1,(le(t)&&e.talktimer>15&&a===0||!t.exists(I)&&a===0)&&e.ballooncon===7&&i&&i.shop_spamton_bg_con<3&&(i.shop_spamton_bg_con=1,a=1),le(t)&&e.talktimer>15&&a===0||!t.exists(I)&&a===0){r(t);let i=e.ballooncon;if(i===1?(e.headendcon=1,N(t,0,X(`1172_0`)),e.ballooncon=2,e.balloonend=0,e.partmode=1):i===2?(N(t,0,X(`1176_0`)),e.ballooncon=3,e.balloonend=0):i===3?(e.headendcon=2,N(t,0,X(`1181_0`)),e.ballooncon=4,e.balloonend=0,e.partmode=1):i===4?(e.headendcon=3,N(t,0,X(`1186_0`)),e.ballooncon=5,e.balloonend=0,e.partmode=1):i===5?(N(t,0,X(`1190_0`)),e.ballooncon=6,e.balloonend=0):i===6?(e.headendcon=2,N(t,0,X(`1195_0`)),e.ballooncon=7,e.balloonend=0,e.partmode=99):i===7?(e.headendcon=3,n.currentsong[0]=`spamton_happy`,n.currentsong[1]=t.sourceAudio?.music(`spamton_happy`)??`spamton_happy`,t.sourceAudio?.loop(n.currentsong[0]),N(t,0,X(`1202_0`)),e.ballooncon=8,e.balloonend=0,e.partmode=36):i===8?(N(t,0,X(`1208_0`)),e.ballooncon=9,e.balloonend=0):i===9?(N(t,0,X(`1212_0`)),e.ballooncon=10,e.balloonend=0):i===10?(N(t,0,X(`1216_0`)),e.ballooncon=11,e.balloonend=0):i===11?(N(t,0,X(`1220_0`)),e.ballooncon=12,e.balloonend=0):i===12?(N(t,0,X(`1225_0`)),e.ballooncon=13,e.balloonend=0,e.partmode=36):i===13&&(N(t,0,X(`1229_0`)),e.ballooncon=0,e.balloonend=1,e.partmode=36,e.dancealtcon=2),Ur(e,t),e.ballooncon===13||e.ballooncon===0)for(let e of t.all(I))e.shake=3,e.rate=3;e.alarm[6]=1}if(i&&(i.trackspeed+=(e.targetbgspeed*6-i.trackspeed)*.1,i.cityscape_speed_max+=(e.targetbgspeed-i.cityscape_speed_max)*.1),e.ballooncon===13){e.siner+=2;for(let t=0;t<8;t++)e.partsiner[t]+=.6}}if(e.endcon===4){if(e.talktimer+=1,le(t)&&e.talktimer>15||!t.exists(I)){e.endtimer+=1;let r=e.endtimer;if(r===1){Ke(t,e,n.currentsong[0]),R(t,`snd_noise`),R(t,`snd_damage`);let r=k(t,e,-10,-10,`spr_pixel_white`);r.imageXscale=999,r.imageYscale=999,r.depth=(Hr(t)?.depth??0)-1,r.imageAlpha=.5,r.imageBlend=0;let i=t.create(ir,e.x,e.y);e.vine=i.id,i.x1=e.x+e.partx[4]+e.partxoff[4]/1.2+20+Math.sin(e.partsiner[4]/25)*1.8,i.x2=e.x+e.partx[4]+e.partxoff[4]/1.5+32,i.y1=e.y+e.party[4]-10+e.partyoff[4],i.y2=-400,i.depth=e.depth+1,i.vineid=4;let a=t.create(cr,e.x+e.partx[4]+e.partxoff[4]/1.2+16,e.y-35);e.vfx=a.id,a.depth=e.depth-5,e.lastwirecon=3,e.partmode=99;let o=Hr(t);o&&(o.cityscape_speed_max=0,o.cityscape_speed=0,o.trackspeed=0)}if(r===91){e.depth=-99999;let n=k(t,e,-10,-10,`spr_pixel_white`);n.imageXscale=999,n.imageYscale=999,n.depth=0,n.imageAlpha=1,n.imageBlend=0,e.blackall=n.id,e.partmode=43}if(r===330){let n=k(t,e,-10,-10,`spr_pixel_white`);n.imageXscale=999,n.imageYscale=999,n.imageAlpha=1,n.imageBlend=0,n.depth=-999999,e.blackall2=n.id}r===450&&t.byId(e.blackall2)&&Gr(t)}if(e.ballooncon===0&&e.endtimer===0){e.siner+=3;for(let t=0;t<8;t++)e.partsiner[t]+=.9}}}function qr(e,t){(qe(t,`enemytalk`,e)&&e.talked===0&&t.globals.monsterhp[e.myself]<=0||e.endcon===1)&&(e.talked=-1,e.endcon=1)}function Jr(e,t){let n=t.globals;if(e.talked===.6&&(e.talktimer+=1,le(t)&&e.talktimer>15||!t.exists(I))){r(t);let i=jr[e.ballooncon];i&&(N(t,0,X(i[0])),e.ballooncon=i[1],e.balloonend=+(i[1]===0)),e.talked=.7,e.talktimer=0,e.correct_answer!==1&&(n.typer=72,jn(e,t,e.x-10,n.monstery[e.myself],10)),e.correct_answer=-1,e.alarm[6]=1}}function Yr(e,t){e.talked===1&&qe(t,`enemytalk`,e)&&!t.exists(zn)&&(e.talktimer+=1,(le(t)&&e.talktimer>15||!t.exists(I))&&(r(t),e.talkedcon=1),e.talkedcon===1&&(e.partmode===40&&(e.partmode=1,e.shockthreshold=0,e.hurttimer2=0),e.rtimer=0,t.exists(Rn)?e.talktimer+=1:ve(e,t,-1),qe(t,`bullets`,e)&&(t.exists(Pe)||Nr(e,t),!t.exists(He)&&!t.exists(Be)&&me(t))))}function Xr(e,t){t.exists(Ae)&&e.statustextupdate===0&&(e.statustextupdate=1,Lr(e,t))}function Zr(e,t){let n=t.globals,r=e.myself;if(e.endcon===1){if(e.endtimer+=1,e.endtimer===1&&(Ke(t,e,n.batmusic[0]),t.userEvent(e,3)),e.endtimer>0&&e.endtimer<91){let n=Hr(t);n&&(n.trackspeed=-15+15*(e.endtimer/90),n.cityscape_speed_max=5-5*(e.endtimer/90))}e.endtimer===91&&(e.didwejustdie=1,n.mercymod[r]>99&&(e.sneo_defeat_cutscene_version=1),N(t,0,X(`1009_0`)),e.partmode=99,e.endcon=2,n.typer=72,jn(e,t,e.x-10,n.monstery[r],10),e.endtimer=0,e.endcon=2,e.talktimer=0,e.ballooncon=1,e.balloonend=0)}if(e.sneo_defeat_cutscene_version===0&&Wr(e,t),e.sneo_defeat_cutscene_version===1&&Kr(e,t),e.endcon===10){e.endcon=11;let n=Ve(t);n&&(n.skipvictory=1),he(t)}e.stoprumblesfx>0&&--e.stoprumblesfx,e.stoprumblesfx===1&&t.soundStop?.(`snd_rumble`)}function Qr(e,t){let n=t.globals,r=e.myself;if(e.singleshotmercy>9){let i=t.first(Zn);if(i&&i.type===1.5){i.mercyaccumulated+=1;let e=t.create(_e,n.monsterx[r],n.monstery[r]+20-n.hittarget[r]*20);e.damage=1,e.type=5,n.hittarget[r]+=1}else de(e,t,r,1);e.singleshotmercy=0}if(t.exists(Zn)||(P(e,`idealx`,()=>[,,,,,,].fill(0)),P(e,`idealrot`,()=>[,,,,,,].fill(0)),e.idealx[5]=0,e.idealrot[5]=0,e.partsiner[5]=0,e.partrot[5]=0,e.partx[5]=0,e.party[5]=0,e.partxoff[5]=t.bank.get(e.partsprite[5]).originX*2,e.partyoff[5]=t.bank.get(e.partsprite[5]).originY*2),n.fighting===1&&e.prevmercy!==n.mercymod[r]){let i=n.mercymod[r]-e.prevmercy;for(let n=0;n<i;n++){if(e.prevmercy+=1,e.prevmercy%2!=0)continue;zr(e,t);let n=t.random.irandom(5),r=!1,i=0;for(;!r;){if(e.partvisible[n]===1){e.partvisible[n]=0;let a=t.create(ir,e.x,e.y);e.vine=a.id,a.x1=e.x+e.partx[n]+e.partxoff[n]/1.2+n*5+Math.sin(e.partsiner[n]/30)*2,a.x2=e.x+e.partx[n]+e.partxoff[n]/1.5+n*8,a.y1=e.y+e.party[n]-10+e.partyoff[n],a.y2=-400,a.depth=e.depth+1,a.vineid=n;let o=t.create(cr,e.x+e.partx[n]+e.partxoff[n]/1.2+n*5,e.y-20);e.vfx=o.id,o.depth=e.depth-5,(t.sourceAudio?.playing(`snd_damage`)??!1)||R(t,`snd_damage`),n=t.random.irandom(5),i+=1,i>=1&&(r=!0),--e.vinebgcount}else n+=1,n>5&&(n=0);e.partvisible.slice(0,6).some(e=>e===1)||(r=!0)}}if(e.vinebgcount>-2&&!t.exists(Vn))for(let n=0;n<6;n++)e.partvisible[n]===0&&(e.vineid=n,e.vine=t.create(sr,e.x,e.y).id);e.weakentimer=1,e.weakenshakeamount=10}n.fighting===1&&(e.prevmercy=n.mercymod[r])}function $r(e,t){let n=t.globals,r=e.myself;n.canact[r][0]=1,n.actactor[r][0]=1,n.actname[r][0]=F(`obj_spamton_neo_enemy_slash_Other_11_gml_7_0`),n.actdesc[r][0]=``,n.actcost[r][0]=0;for(let e of[1,2])n.canact[r][e]=0,n.actactor[r][e]=0,n.actname[r][e]=``,n.actdesc[r][e]=``,n.actcost[r][e]=0;g(t,e)}function ei(e,t){let n=t.globals,r=e.myself,i=n.flag,a=(e,t)=>!U(e,t)&&!f(e,t);for(n.monstergold[3]+=n.monstergold[r],n.monsterexp[3]+=n.monsterexp[r],a(i[51+r],0)&&(i[51+r]=2,f(n.monsterhp[r],0)||(i[51+r]=1)),a(i[51+r],1)&&(i[40]+=1,a(e.fatal,1)&&(i[44]+=1)),a(i[51+r],2)&&(i[41]+=1),a(i[51+r],3)&&(i[42]+=1),a(i[51+r],5)&&(i[43]+=1),a(i[51+r],6)&&(i[45]+=1,n.monstergold[3]+=24),e._amt_add=0,e._frozened=0,e._violenced=0,e._spared=0,e._pacified=0,e.d_i=0;U(e.d_i,3);e.d_i+=1){let t=i[51+e.d_i];a(t,0)||(e._amt_add+=1),a(t,1)&&(e._violenced+=1),a(t,2)&&(e._spared+=1),a(t,3)&&(e._pacified+=1),a(t,6)&&(e._frozened+=1)}f(e._frozened,0)&&(i[50]=6),f(e._pacified,0)&&(i[50]=3),f(e._spared,0)&&(i[50]=2),f(e._violenced,0)&&(i[50]=1),a(i[50],6)&&(i[926]+=1),a(i[54],0)||(i[i[54]]=i[50],i[54]=0)}function ti(e,t){let n=t.globals,r=e.myself;if(e.funnycheat+=1,e.funnycheat<=5)return;let i=n.tempflag[37],a=(e,t)=>{n.monsterat[r]<e?n.monsterat[r]+=t:n.monsterat[r]=e};i<2?(a(26,.5),e.hellmode=1):i<4?(a(22,.25),e.hellmode=1):i<6?a(18,.1):i<10&&a(15,.04),i<10&&t.onBattleMode?.(`enraged`)}function ni(e,t){t.soundStop?.(`snd_sneo_overpower`),t.globals.sp=4,t.soundStop?.(`snd_rumble`),t.sourceAudio?.volume(`snd_rumble`,1,0)}function ri(e){e.endcon>0?e.balloonend===1?e.endcon=4:(e.endcon=2,e.talktimer=0):e.balloonend===1?e.talked=1:(e.talked=.6,e.talktimer=0)}var ii={name:`obj_sneo_hitdetector`,index:601,sprite:`spr_sneo_head_sad`,events:{create:e=>{e.imageSpeed=0,e.imageXscale=2,e.imageYscale=2,e.imageAlpha=.2,e.imageBlend=0,e.visible=!1,e.active=!0}},collisions:[{target:Xn,run:(e,t,n)=>{for(let e of n.all(oi))e.hitcon=1;n.userEvent(t,0)}}]};function ai(e,t,n,r){if(n.chargeshotcount>1&&r.userEvent(e,4),e.bigshotused=1,e.bigshotcount<=0)return;t.hspeed=10*n.f,t.trail=1,--e.bigshotcount;let i=r.random.random(45);if(e.bigshotcount===0){r.create(Ce,n.x,n.y),R(r,`snd_stardrop`);for(let e=0;e<8;e++){let e=r.create(Me,n.x+10,n.y+10);e.direction=i+r.random.random(15),e.imageXscale=2+r.random.random(2),e.imageYscale=2+r.random.random(2),e.speed=16,e.friction=.8,i+=45}}else for(let e=0;e<8;e++){let e=r.create(Me,n.x+10,n.y+10);e.direction=i+r.random.random(15),e.speed=8,e.friction=.8,i+=45}}var oi=Ue({name:`obj_spamton_neo_enemy`,index:702,depth:0,sprite:`spr_sneo_example`},{create:Or,beforeStep:(e,t)=>{e.bigshot===1&&(t.globals.sp=5)},onlyWhileFighting:!0,beforeTalk:qr,startTalk:Mr,duringTalk:Jr,endTalk:Yr,attackDelay:15,attack:Fr,statusLine:Ir,afterAttack:Xr,acts:Br,actsDone:Vr,afterStep:Zr,monsterPosition:(e,t)=>[e.x+t.spriteWidth(e)/3,e.y+t.spriteHeight(e)/2],hooks:{drawActOverlay:(e,t,n)=>{e.savemeactcon>0&&n.drawSprite(e.savemeactcon<=2?`spr_headralsei`:e.savemeactcon<=4?`spr_headsusie`:`spr_headnoelle`,0,t.xx+30,t.yy+380,1,1,0,t.noeblend,1)},onHeroHit:e=>{Object.assign(e,{partmode:40,shockthreshold:15,shocktimer:9999,hurttimer2:10})},defeatedByDamage:!1,upgradedShot:e=>e.upgrade<=0?!1:(e.bigshotused=1,!0),superCharged:e=>e.bigshotcount>0,onBigShot:ai,onFlash:(e,t,n)=>{if(t.siner+=t.flashspeed,t.siner>4&&Math.sin(t.siner/3)<0)return n.destroy(t),e.state=0,!0;t.siner===t.flashspeed&&Object.assign(e,{partmode:40,shockthreshold:15,shocktimer:9999,hurttimer2:10});for(let t=0;t<8;t++)e.flash=1,e.fsiner=e.partsiner[t]/8;return!0},onTurnEnd:(e,t)=>t.globals.mercymod[e.myself]<=99?!1:(e.endcon=1,!0)},events:{endStep:Qr,draw:Dr,destroy:ni,alarm4:e=>{e.actcon+=1},alarm6:ri,user0:gt,user1:$r,user2:(e,t)=>{let n=t.globals;if(U(n.inv,0)){for(e.remdamage=e.damage,e._temptarget=e.target,e.ti=0;e.ti<3;e.ti+=1){n.inv=-1;let r=n.hp[n.char[e.ti]],i=n.maxhp[n.char[e.ti]];f(r,i*.5)?e.damage=Math.floor(r/5):O(r,i*.15)?e.damage=Math.floor(r/10):U(r,i*.15)&&(e.damage=Math.floor(r/20)),e.target=e.ti,f(n.hp[n.char[e.ti]],0)&&n.char[e.ti]!==0&&se(e,t)}n.inv=n.invc*40,e.target=e._temptarget}},user3:ei,user4:ti,user10:()=>{}}}),si={0:{typeAll:1,steps:[{choose:[1,2,3]},{when:1,walls:[[0,0,0,2,0,1,1],[0,2,3,0,0,30,1],[0,3,0,2,0,30,1]]},{when:2,walls:[[0,2,0,3,0,1,1],[0,3,0,2,0,30,1],[0,2,0,3,0,30,1]]},{when:3,walls:[[0,0,0,0,2,1,1],[0,3,2,0,0,30,1],[0,2,3,0,0,30,1]]},{choose:[1,2,3]},{when:1,walls:[[0,1,1,0,0,40,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},{when:2,walls:[[0,0,0,1,1,40,1],[0,0,0,2,2,6,1],[0,0,0,2,2,6,1],[0,0,0,2,2,6,1]]},{when:3,walls:[[0,0,1,1,0,40,1],[0,0,2,1,0,6,1],[0,0,2,2,0,6,1],[0,0,2,2,0,6,1]]},{when:1,walls:[[0,0,0,0,2,30,1],[0,2,0,0,0,30,1],[0,3,0,2,0,30,1]]},{when:2,walls:[[0,2,0,0,0,30,1],[0,0,0,2,0,30,1],[0,2,0,3,0,30,1]]},{when:3,walls:[[2,0,0,0,0,30,1],[0,0,2,0,0,30,1],[0,2,3,0,0,30,1]]},{choose:[1,2,3]},{when:1,walls:[[0,1,1,0,0,40,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},{when:2,walls:[[0,1,1,0,0,40,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},{when:3,walls:[[0,1,1,0,0,40,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},{wall:[1,1,1,1,1,9999,0]}]},1:{typeAll:1,steps:[{choose:[1,2,3,4]},{when:1,walls:[[3,0,0,2,0,1,1],[0,2,3,0,0,20,1],[0,3,0,2,0,20,1]]},{when:2,walls:[[0,2,0,3,0,1,1],[0,3,0,2,0,20,1],[0,2,0,3,0,20,1]]},{when:3,walls:[[0,0,0,3,2,1,1],[0,3,2,0,0,20,1],[0,2,3,0,0,20,1]]},{when:4,walls:[[2,3,0,0,0,1,1],[0,0,2,3,0,20,1],[0,0,3,2,0,20,1]]},{choose:[1,2,3,4]},{when:1,walls:[[3,0,0,2,0,20,1],[0,2,3,0,0,20,1],[0,3,0,2,0,20,1]]},{when:2,walls:[[0,2,0,3,0,20,1],[0,3,0,2,0,20,1],[0,2,0,3,0,20,1]]},{when:3,walls:[[0,0,0,3,2,20,1],[0,3,2,0,0,20,1],[0,2,3,0,0,20,1]]},{when:4,walls:[[2,3,0,0,0,20,1],[0,0,2,3,0,20,1],[0,0,3,2,0,20,1]]},{when:1,walls:[[0,1,1,0,0,32,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1],[0,2,2,0,0,6,1]]},{when:2,walls:[[0,0,0,1,1,32,1],[0,0,0,2,2,6,1],[0,0,0,2,2,6,1],[0,0,0,2,2,6,1]]},{when:3,walls:[[0,0,1,1,0,32,1],[0,0,2,2,0,6,1],[0,0,2,2,0,6,1],[0,0,2,2,0,6,1]]},{when:4,walls:[[1,1,0,0,0,32,1],[2,2,0,0,0,6,1],[2,2,0,0,0,6,1],[2,2,0,0,0,6,1]]},{when:1,walls:[[0,0,0,0,2,20,1],[0,2,0,0,0,20,1],[0,3,0,2,0,20,1]]},{when:2,walls:[[0,2,0,0,0,20,1],[0,0,0,2,0,20,1],[0,2,0,3,0,20,1]]},{when:3,walls:[[2,0,0,0,0,20,1],[0,2,0,0,0,20,1],[0,2,3,0,0,20,1]]},{when:4,walls:[[0,0,0,2,0,20,1],[2,0,0,0,0,20,1],[0,0,3,2,0,20,1]]},{choose:[1,2,3,4]},{when:1,walls:[[3,0,0,2,0,20,1],[0,2,3,0,0,20,1],[0,3,0,2,0,20,1]]},{when:2,walls:[[0,2,0,3,0,20,1],[0,3,0,2,0,20,1],[0,2,0,3,0,20,1]]},{when:3,walls:[[0,0,0,3,2,20,1],[0,3,2,0,0,20,1],[0,2,3,0,0,20,1]]},{when:4,walls:[[2,3,0,0,0,20,1],[0,0,2,3,0,20,1],[0,0,3,2,0,20,1]]},{wall:[1,1,1,1,1,9999,0]}]},99:{typeAll:void 0,steps:[{choose:[1,2]},{when:1,walls:[[0,0,0,0,4,1,1],[1,0,0,0,0,7,1]]},{when:2,walls:[[4,0,0,0,0,1,1],[0,0,0,0,1,7,1]]},{choose:[1,2,3]},{when:1,walls:[[4,0,0,0,3,63,1]]},{when:2,walls:[[3,0,0,0,4,63,1]]},{when:3,walls:[[0,3,4,0,0,63,1]]},{wall:[0,0,1,0,4,60,0]},{wall:[4,2,1,0,0,7,0]},{wall:[0,2,3,1,0,7,0]},{wall:[0,2,3,1,0,7,0]},{wall:[0,4,1,3,1,50,0]},{wall:[3,1,1,4,2,7,0]},{wall:[3,4,0,3,1,7,0]},{wall:[2,1,0,1,2,7,0]},{wall:[2,4,2,0,4,7,0]},{wall:[2,1,2,0,0,7,0]},{wall:[1,4,2,0,3,50,0]},{wall:[4,2,0,0,2,7,0]},{wall:[0,2,1,1,1,7,0]},{wall:[3,1,2,1,3,7,0]},{wall:[1,1,4,0,0,7,0]},{wall:[4,2,2,0,1,7,0]},{wall:[3,2,3,4,2,50,0]},{wall:[2,2,1,2,4,7,0]},{wall:[3,1,1,1,4,7,0]},{wall:[2,2,1,1,3,7,0]},{wall:[3,4,1,1,1,7,0]},{wall:[3,0,0,4,2,7,0]},{wall:[0,0,0,0,0,9999,0]}]}},ci={2:[2,2,1,1,1,4,3,0],3:[2,2,1,1,1,3,0]},li={1:`emptyspot`,2:`breakspot`,3:`pipispot`,4:`redbreakspot`};function ui(e){let t=t=>t.first(e(`obj_sneo_wall_controller_new`)),r=t=>t.first(e(`obj_spamton_neo_enemy`)),i=(t,n)=>{let i=r(n);i&&(t.damage=n.globals.monsterat[i.myself]*5);let a=n.first(e(`obj_sneo_bulletcontroller`));a&&(t.target=a.target),t.grazepoints=2},a=(e,t)=>{for(let n=0;n<5;n++){let r=li[t[n]];r&&(e[r+(n+1)][e.wallsetupcount]=n+1)}e.wallcreatetimer[e.wallsetupcount]=t[5],e.walltype[e.wallsetupcount]=t[6],e.wallsetupcount+=1},s=(e,t,n,r)=>{let i=t.random.choose(...n),o=t.random.choose(...n),s=t.random.choose(...n),c=t.random.choose(...n),l=t.random.choose(...n);a(e,[l,c,s,o,i,r,0])},c={name:`obj_sneo_wall_controller_new`,index:54,depth:0,events:{create:(e,t)=>{Object.assign(e,{wallsize:7,wallcountmax:35,wallcount:0,wallsetupcount:0,timer:0,timer2:0,wallcreatetimermax:30,con:0}),e.difficulty=r(t).difficulty,e.xx=t.view.x,e.yy=t.view.y,e.track1_x=t.view.x,e.track2_x=t.view.x+320,e.track3_x=t.view.x+640,e.x=0,e.y=0;for(let t of[`breakspot`,`pipispot`,`emptyspot`,`redbreakspot`])for(let n=1;n<=5;n++){let r=Array(e.wallcountmax+1).fill(0);r[e.wallcountmax]=-1,e[t+n]=r}e.wallcreatetimer=Array(e.wallcountmax).fill(e.wallcreatetimermax),e.wallspeed=Array(e.wallcountmax).fill(-7),e.walltype=Array(e.wallcountmax).fill(0);let n=si[e.difficulty];if(n){n.typeAll!==void 0&&e.walltype.fill(n.typeAll);let r=0;for(let i of n.steps)if(`choose`in i)r=t.random.choose(...i.choose);else if(`when`in i){if(r===i.when)for(let t of i.walls)a(e,t)}else a(e,i.wall)}let i=ci[e.difficulty];if(i){for(let n=0;n<6;n++)s(e,t,i,7);s(e,t,i,63);for(let n=0;n<5;n++)s(e,t,i,7);s(e,t,i,63);for(let n=0;n<5;n++)s(e,t,i,7);a(e,[0,0,0,0,0,9999,0])}},step:(e,t)=>{if(e.timer+=1,U(t.globals.turntimer,1)&&t.destroy(e),e.wallcount<e.wallcountmax&&e.timer===e.wallcreatetimer[e.wallcount]){let n=t.view.x+t.view.width,r=e.yy+t.view.height/2,i=e.wallcount,a=(t,n)=>[1,2,3,4,5].some(r=>e[t+r][i]===n),o=P(e,`bullet`);for(e.i=0;e.i<e.wallsize;e.i+=1){let s=e.i;if(s===0||s===e.wallsize-1){let a=t.create(m,n,r+s*34-172);o[s]=a.id,a.sprite=`spr_sneo_bullet_box`,a.imageXscale=1.25,a.imageYscale=1.6,a.destroyable=0,a.imageBlend=M.white,a.wallnumber=i,s===0&&(a.wallcontroller=1),s===e.wallsize-1&&(a=t.create(m,n-50,r+s*34-180),o[s]=a.id,a.sprite=`spr_sneo_wall_car`,a.imageXscale=1.25,a.imageYscale=1.6,a.destroyable=0,a.imageBlend=M.white,a.depth=e.depth-1,a.wallnumber=i)}else if(!a(`emptyspot`,s)){if(a(`pipispot`,s)){let e=t.create(h,n,r+s*34-170);o[s]=e.id,e.wallnumber=i}else{let e=t.create(m,n,r+s*34-172);o[s]=e.id,e.sprite=`spr_sneo_mail`,e.imageXscale=1.2,e.imageYscale=1.71,e.destroyable=0,e.wallnumber=i,a(`breakspot`,s)?(e.destroyable=1,e.sprite=`spr_sneo_crew`,e.imageSpeed=.5,e.imageYscale=1.2):a(`redbreakspot`,s)?(e.destroyable=1,e.red=1,e.sprite=`spr_sneo_crew`,e.imageSpeed=.5,e.imageYscale=1.2,e.imageBlend=M.red):e.imageBlend=M.white}}}e.timer=0,e.wallcount+=1}e.timer2+=1},draw:(e,t)=>{let n=t.view.x+t.view.width,r=t.view.y+t.view.height-180;for(let t of[`track1_x`,`track2_x`,`track3_x`])e[t]+=4,f(e[t],n)&&(e[t]-=960);for(let n of[`track1_x`,`track2_x`,`track3_x`])t.drawSprite(`spr_sneo_wall_track`,0,e[n],r)}}},l=(e,t,r,i,a)=>{let o={...e,x:r,y:i,sprite:e.sprite,mask:e.mask,imageAngle:e.imageAngle,imageXscale:e.imageXscale,imageYscale:e.imageYscale,imageIndex:e.imageIndex};return t.all(a).some(r=>r!==e&&n(t.bank,o,r))},u=(e,t,n,r)=>{let i,a=0;for(let o of e.all(r)){let e=o.x-t,r=o.y-n,s=e*e+r*r;(!i||s<a)&&(i=o,a=s)}return i},d=(e,t,n)=>{let r=n=>l(e,t,e.x,e.y+n,m)&&u(t,e.x,e.y+n,m)?.sprite===`spr_sneo_mail`;return n.y<e.y&&r(-40)||n.y>e.y&&r(40)?!1:f(Math.abs(n.y-e.y),12)},p=(t,n)=>{let r=n.create(e(`obj_yshot_anim`),t.x,t.y);t.anim=r.id,r.imageXscale=t.imageXscale,r.imageYscale=t.imageYscale,r.sprite=`spr_yheart_shot_hit3`},m={name:`obj_sneo_wallbullet_new`,index:40,parent:e(`obj_collidebullet`),sprite:`spr_sneo_crew`,depth:0,events:{create:(e,t)=>{B(e),e.element=6,e.destroyable=1,e.red=0,e.bighitbox=1,e.imageSpeed=0,e.imageBlend=o(15245824,M.aqua,.25+Math.sin(0)*.25),i(e,t),Object.assign(e,{wallcontroller:-1,wallspeed:-7,wallnumber:0,walltype:0,timer:0,hp:1})},step:(n,r)=>{U(r.globals.turntimer,1)&&r.destroy(n);let i=t(r);if(i&&(n.x+=i.wallspeed[n.wallnumber]),n.wallcontroller>-1){let e=t(r);e.walltype[n.wallnumber]===0&&(n.timer+=1,n.timer<9?e.wallspeed[n.wallnumber]=-16+10*(n.timer/9):n.timer<150&&(e.wallspeed[n.wallnumber]=-6)),e.walltype[n.wallnumber]===1&&(n.timer+=1,n.timer<16?e.wallspeed[n.wallnumber]=-21+16*(n.timer/15):n.timer<90&&(e.wallspeed[n.wallnumber]=-5+-8*((n.timer-15)/70)))}if(n.sprite===`spr_sneo_crew`){let t=e(`obj_yheart_shot`),i=r.all(t).find(e=>Ee(r.bank,e,n.x-18,n.y-22,n.x+19,n.y+22,!0));if(n.hitshot=i?i.id:-4,i){if(n.destroyable===0&&i.big===1&&d(n,r,i))return;if(r.userEvent(n,0),n.destroyable===1&&n.active===1){let t=r.byId(n.hitshot);t&&t.big===0&&r.userEvent(t,0),R(r,`snd_bomb`,1.1+r.random.random(.2)),q(n,r,e),p(n,r),r.destroy(n)}}}},draw:(e,t)=>t.drawSelf(e),user0:(t,n)=>{if(t.sprite===`spr_sneo_bullet_box`)return;let r=n.byId(t.hitshot);if(t.destroyable===1){if(r&&r.big===0&&n.userEvent(r,0),t.red===1){for(let r of n.all(m))r.wallnumber===t.wallnumber&&(R(n,`snd_bomb`,1.1+n.random.random(.2)),q(r,n,e).flash=!0,n.destroy(r));for(let r of n.all(e(`obj_sneo_rotatingwall_pipis`)))r.wallnumber===t.wallnumber&&(n.userEvent(r,0),n.destroy(r))}p(t,n)}else r&&n.userEvent(r,0),R(n,`snd_bell`)}},collisions:[{target:e(`obj_yheart_shot`),run:(t,n,r)=>{if(!(t.destroyable===0&&n.big===1&&d(t,r,n))&&(t.hitshot=n.id,r.userEvent(t,0),t.destroyable===1&&t.active===1)){let n=r.byId(t.hitshot);n&&n.big===0&&r.userEvent(n,0),r.sourceAudio?.volume(`snd_bomb`,.7,0),R(r,`snd_bomb`,1.1+r.random.random(.2),.7),q(t,r,e).flash=!0,p(t,r),r.destroy(t)}}}]},h={name:`obj_sneo_rotatingwall_bomb`,index:38,parent:e(`obj_collidebullet`),sprite:`spr_mettaton_bomb1`,depth:0,events:{create:(e,t)=>{B(e),Object.assign(e,{imageXscale:1,imageYscale:1,timer:0,con:0,element:6,destroyable:0,bighitbox:1,imageSpeed:0}),i(e,t),e.wallspeed=-7,e.wallnumber=0},step:(n,r)=>{U(r.globals.turntimer,1)&&r.destroy(n);let i=t(r);if(n.timer===0&&i&&(n.x+=i.wallspeed[n.wallnumber]),n.timer>0&&(n.timer+=1),n.timer===6){R(r,`snd_bomb`),r.soundStop?.(n.bomsfallsfx),n.sprite=`spr_mettaton_bomb2`,n.imageIndex=0,r.create(e(`obj_shake`),n.x,n.y);let t=r.create(g,n.x,n.y);n.hitbox1=t.id,t.imageXscale=500,t.imageYscale=.5;let i=r.create(g,n.x,n.y);n.hitbox2=i.id,i.imageXscale=.2,i.imageYscale=500}n.timer===12&&r.destroy(n)},draw:(e,t)=>{if(t.drawSelf(e),e.sprite===`spr_mettaton_bomb2`)for(let n=1;n<24;n++)t.drawSprite(`spr_mettaton_bomb3`,e.imageIndex,e.x+24*n,e.y,e.imageXscale,e.imageYscale,90,M.white,e.imageAlpha),t.drawSprite(`spr_mettaton_bomb3`,e.imageIndex,e.x-24*n,e.y,e.imageXscale,e.imageYscale,90,M.white,e.imageAlpha),t.drawSprite(`spr_mettaton_bomb3`,e.imageIndex,e.x,e.y-24*n,e.imageXscale,e.imageYscale,0,M.white,e.imageAlpha),t.drawSprite(`spr_mettaton_bomb3`,e.imageIndex,e.x,e.y+24*n,e.imageXscale,e.imageYscale,0,M.white,e.imageAlpha)},destroy:(e,t)=>{e.timer>0&&t.soundStop?.(e.bomsfallsfx)}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>{e.timer===0&&(R(n,`snd_damage`),t.big===0&&n.userEvent(t,0),e.timer=1,e.imageSpeed=1,e.bomsfallsfx=n.soundLoop?.(`snd_bombfall`)??-1)}}]},g={name:`obj_mettaton_bomb_hitbox`,index:9,parent:e(`obj_regularbullet`),sprite:`spr_hitbox_10px_center`,depth:0,visible:!1,events:{create:(e,t)=>{B(e),Object.assign(e,{wall_destroy:1,imageAlpha:1,sprite:`spr_hitbox_10px_center`,imageXscale:1,imageYscale:1,destroyonhit:0,grazed:1,element:6}),i(e,t),e.timer=0,e.depth=-999999,e.creator=-1},step:(e,t)=>{e.timer+=1,e.timer===3&&t.destroy(e);let n=e.creator===-1?void 0:t.byId(e.creator);n&&(e.x=n.x,e.y=n.y)},user5:(e,t)=>{e.active===1&&(e.target!==3&&v(e,t),e.target===3&&oe(e,t),e.destroyonhit===1&&t.destroy(e))}}};return[c,m,h,g]}var Z=(e,t,n)=>e+(t-e)*n;function di(e){let t=t=>t.first(e(`obj_spamton_neo_enemy`)),n=t=>t.first(e(`obj_sneo_bulletcontroller`)),r=be(`scr_afterimage_cut`,(t,n)=>{q(t,n,e)}),a=be(`snd_play`,(e,t,n)=>{R(t,n)}),o=be(`snd_volume`,(e,t,n,r,i)=>{t.sourceAudio?.volume(n,r,i)}),s=(t,n)=>{let r=n.create(e(`obj_collidebullet`),t.x,t.y);return t.radialshot=r.id,B(r),r.sprite=`spr_diamondbullet`,r},c=(i,s)=>{let c=s.globals;if(R(s,`snd_bomb`),i.type===4&&f(c.turntimer,20)){let e=s.create(g,i.x,i.y);i.bomb=e.id,e.depth=i.depth-2}else q(i,s,e);for(i.i=10;i.i>=0;--i.i){let t=s.create(Ie,Z(i.x,i.rembossx,i.i/9),Z(i.y,i.rembossy,i.i/9));i.thismarker=t.id,t.sprite=`spr_sneo_wireheart`,t.imageSpeed=0,i.piece=t.id,t.imageIndex=4,t.i=i.i,t.depth=i.depth+1,E(t,s,r,t.i*2),E(t,s,a,t.i*2,`snd_bomb`),E(t,s,o,t.i*2,`snd_bomb`,.5,0),en(s,e,t.id,t.i*2+1)}let l=t(s);if((i.altbiter===1||i.altbiter===2)&&(l.makeheartalt=i.altbiter+2),i.type===0||i.type===1&&l.difficulty>2)for(let t of s.all(e(`obj_spamton_neo_enemy`)))if(c.monsterhp[t.myself]===c.monstermaxhp[t.myself]&&d(s)<3){n(s).mercyaccumulated+=3;for(let t of s.all(e(`obj_spamton_neo_enemy`))){let n=s.create(e(`obj_dmgwriter`),c.monsterx[t.myself],c.monstery[t.myself]+20-c.hittarget[t.myself]*20);t.__mercydmgwriter=n.id,n.damage=3,n.type=5,c.hittarget[t.myself]+=1}}else c.monsterhp[0]-=Math.ceil(c.monstermaxhp[0]*.03),c.monsterhp[0]<0&&(c.monsterhp[0]=1);s.destroy(i)},l=(e,n)=>{if(e.hp=0,e.type===0||e.type===1&&t(n).difficulty>2&&f(n.globals.turntimer,20)){n.globals.turntimer=20;for(let e of n.all(p))e.hp=0,e.destroyed=1}},u=(e,n)=>e.type===0||e.type===1&&t(n).difficulty>2,p={name:`obj_sneo_wireheart`,index:640,parent:e(`obj_basicbullet_sneo`),sprite:`spr_sneo_wireheart`,depth:0,events:{create:(e,t)=>{B(e),Object.assign(e,{element:6,hp:300,damagetimer:0,defeated:0,active:1,destroyonhit:0,target:0,damage:1,animtimer:0,firedtimer:0,destroyed:0,rembossx:0,rembossy:0,invincibility_timer:2,chargeshothitcount:0,normalshothitcount:0,imageXscale:0,imageYscale:0,bossx:e.xstart,bossy:e.ystart,boss:-1,imageIndex:0,imageSpeed:0,init:0,con:1,timer:0,moveframes:30,targetx:0,type:0,shottype:0,bighearttype:0,special:0,preset:-1,altbiter:1}),e.hpos=5+t.random.random(1.5)},step:(r,a)=>{let o=a.random,c=a.view;if(r.init===0){Object.assign(r,{imageXscale:.5,imageYscale:.5,destroyed:0,shotcount:0,bouncecount:0,shottype:0,shottimer:0,init:1,con:1});let t=a.byId(r.boss);t?(r.rembossx=t.x,r.rembossy=t.y):(r.rembossx=r.bossx,r.rembossy=r.bossy);let n=1,i=1;r.type===1&&(n=1,i=1,r.sprite=`spr_sneo_wireheart_smaller`,r.moveframes*=.8,r.hp=10),tn(r,a,e,`image_xscale`,.5,n,20,-1,`out`),tn(r,a,e,`image_yscale`,.5,i,20,-1,`out`),r.type===3&&(r.sprite=`spr_sneo_wireheart_biter`,r.hp=3,r.moveframes=12),r.type===4&&(r.sprite=`spr_sneo_wireheart_bomb`,r.hp=1)}if(r.con===1){r.bighearttype===1&&(r.moveframes=16),r.targetx=c.x+300+o.random(70),r.targety=c.y+145+o.randomRange(-70,70),r.type===3&&(r.altbiter>0&&r.altbiter<3?(r.targetx=c.x+150,r.targety=r.altbiter===1?c.y+240:c.y+75):(r.targetx=c.x+170+o.random(70),r.targety=c.y+145+o.randomRange(-60,60)),r.altbiter===3&&(r.targetx=c.x+350,r.targety=c.y+130+o.randomRange(-45,0)),r.altbiter===4&&(r.targetx=c.x+350,r.targety=c.y+160+o.randomRange(45,0)));let t=a.first(e(`obj_heart`));if(t&&n(a).hearttargettimer<1&&r.type!==3&&o.choose(0,1,2)===0&&(r.targety=t.y+10,n(a).hearttargettimer=6),r.movetimer=0,r.con=2,r.type===0||r.type===1){let e=a.byId(r.boss);e&&(e.heart_release_con=1)}}if(r.con===2&&(r.movetimer+=1/r.moveframes,r.x=Xt(r.bossx,r.targetx,r.movetimer,2),r.y=Xt(r.bossy,r.targety,r.movetimer,2),O(r.movetimer,1)&&(r.movetimer=0,r.con=3)),r.con===3&&(r.type===3&&r.altbiter>0&&r.altbiter<3&&(r.movetimer+=1,r.altbiter===1&&(r.y=Z(c.y+240,c.y+75,r.movetimer/21)),r.altbiter===2&&(r.y=Z(c.y+75,c.y+240,r.movetimer/21)),O(r.movetimer,20)&&(r.movetimer=0,r.con=10,r.targety=r.y)),r.type===3&&r.altbiter>2?(r.movetimer+=1,r.movetimer===1&&a.create(m,r.x,r.y),O(r.movetimer,16)&&(r.movetimer=0,r.con=10)):(r.con=10,r.movetimer=0)),r.con===10){if(r.movetimer+=1/r.moveframes,r.x=Zt(r.targetx,r.bossx,r.movetimer,2),r.y=Zt(r.targety,r.bossy,r.movetimer,2),f(r.movetimer,.5)&&r.type===0||f(r.movetimer,.5)&&r.type===1&&t(a).difficulty>2){let e=a.byId(r.boss);e&&(e.heart_release_con=0)}O(r.movetimer,1)&&(r.movetimer=0,r.shottimer=0,r.con=1)}if((r.con===2||r.con===3||r.con===10)&&U(Math.abs((r.x-r.targetx)/(r.targetx-r.bossx)),.2)&&(--r.shottimer,_(r.shottimer,0))){if(r.type===0){r.firedtimer=4;let n=0,i=a.first(e(`obj_growtangle`));for(r.bighearttype===1&&U(r.y,i.y)&&(n=25+o.random(10)),r.bighearttype===1&&f(r.y,i.y)&&(n=o.random(10)*-1-25),r.i=0;r.i<5;r.i+=1){let e=s(r,a);e.direction=r.i/5*180+110+n,r.special===1&&(e.direction+=o.randomRange(-10,10)),e.imageAngle=e.direction,e.active=1,e.speed=1,e.friction=-.3,r.bighearttype===1&&(e.speed=1,e.friction=-.23),e.depth=r.depth-1,e.target=r.target,e.damage=r.damage,e.grazed=0,e.element=6,t(a).difficulty===0&&(e.grazepoints=3),t(a).difficulty===2&&(e.grazepoints=2)}r.shottimer=10,r.bighearttype===1&&(r.shottimer=6)}else if(r.type===1){r.firedtimer=4;let t=a.first(e(`obj_heart`));for(r.i=0;r.i<5;r.i+=1){let e=s(r,a);e.direction=i(e.x,e.y,t.x+10,t.y+10),e.imageAngle=e.direction,e.imageXscale=.5,e.imageYscale=.5,e.active=1,e.speed=3,e.friction=-.2,e.depth=r.depth-1,e.target=r.target,e.damage=r.damage,e.grazed=0,e.element=6}r.shottimer=6}}},draw:(e,t)=>{let n=t.byId(e.boss);if(n){let r=50-n.heart_release_con*100;U(t.globals.turntimer,20)&&(r=0),e.rembossx=Z(e.rembossx,n.x+r,.16),e.rembossy=n.y+80}e.destroyed===1&&(e.invincibility_timer=0);let r=0;if(e.invincibility_timer>0&&([10,9,6,5,3,2].includes(e.invincibility_timer)&&(r=1),--e.invincibility_timer),r===0){if(e.type===3&&e.altbiter>0&&e.altbiter<3){let n=e.altbiter===1?5:6;for(e.i=6;e.i>=0;--e.i)t.drawSprite(`spr_sneo_wireheart`,5,Z(e.x,e.rembossx,e.i/n),Z(e.y,e.rembossy,e.i/e.hpos),.75,.75,0,e.imageBlend,e.imageAlpha)}else for(e.i=10;e.i>=0;--e.i)t.drawSprite(`spr_sneo_wireheart`,4,Z(e.x,e.rembossx,e.i/9),Z(e.y,e.rembossy,e.i/9),e.imageXscale,e.imageYscale,0,e.imageBlend,e.imageAlpha);e.animtimer+=1,--e.firedtimer,e.imageIndex=0,e.animtimer>=5&&(e.imageIndex=1),e.animtimer>=10&&(e.animtimer=0),e.firedtimer>4&&(e.imageIndex=3),t.drawSelf(e),e.damagetimer>0&&(t.drawSprite(e.sprite,2,e.x,e.y,e.imageXscale,e.imageYscale,e.imageAngle,e.imageBlend,e.damagetimer/5),--e.damagetimer)}e.destroyed===1&&c(e,t)}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>{let r=n.globals;if(e.invincibility_timer>0&&t.big===0){n.destroy(t);return}e.invincibility_timer=10,U(r.turntimer,150)?l(e,n):u(e,n)?t.big===1?(r.turntimer-=80-e.chargeshothitcount*10,e.chargeshothitcount<3&&(e.chargeshothitcount+=1)):(r.turntimer-=20-e.normalshothitcount,e.normalshothitcount<10&&(e.normalshothitcount+=1)):t.big===1?e.hp-=5:--e.hp,n.destroy(t),e.damagetimer=5,R(n,`snd_damage`),_(e.hp,0)&&(e.destroyed=1)}},{target:e(`obj_sneo_tiny_ralsei`),run:(e,t,n)=>{let r=n.globals;t.active===0||e.invincibility_timer>0||(e.invincibility_timer=10,U(r.turntimer,150)?l(e,n):u(e,n)?r.turntimer-=80:(e.hp-=5,t.hp-=10,t.alarm[0]=10,(n.sourceAudio?.playing(`snd_hurt1`)??!1)||R(n,`snd_hurt1`)),e.damagetimer=5,R(n,`snd_damage`),_(e.hp,0)&&(e.destroyed=1))}},{target:e(`obj_sneo_tiny_susie_axe`),run:(e,t,n)=>{let r=n.globals;U(r.turntimer,150)?l(e,n):u(e,n)?r.turntimer-=5:e.hp-=.25,n.destroy(t),e.damagetimer=5,R(n,`snd_damage`),_(e.hp,0)&&(e.destroyed=1)}}]},m={name:`obj_sneo_heart_laser`,index:245,sprite:`spr_sneo_bullet1`,depth:0,events:{create:(t,n)=>{Object.assign(t,{timer:0,siner:0,con:0,con2:0}),B(t),t.imageSpeed=.25,t.imageXscale=.1,t.imageYscale=.1,t.destroyonhit=0;let r=n.first(e(`obj_heart`));t.imageAngle=i(t.x,t.y,r.x+10,r.y+10)+n.random.randomRange(-20,20)},step:(e,t)=>{if(e.timer+=1,e.timer>0&&e.timer<8){let n=t.create(y,e.x,e.y);e.d=n.id,n.direction=t.random.irandom(360),n.lifetime=12,n.depth=e.depth+1,n.imageBlend=e.imageBlend}if(e.timer>0&&e.timer<14&&(e.imageXscale+=.025,e.imageYscale+=.025),e.timer===14){R(t,`snd_wallclaw`);let n=t.create(h,e.x,e.y);e.laser=n.id,n.imageAngle=e.imageAngle,n.direction=e.imageAngle,n.imageYscale=1,t.destroy(e)}},draw:(e,t)=>{t.drawState.color=M.red,t.drawSprite(`spr_lasergun_laser_telegraph`,0,e.x,e.y,999,.7,e.imageAngle,M.white,.3),e.siner+=1,t.drawSprite(e.sprite,e.imageIndex,e.x,e.y,e.imageXscale+Math.sin(e.siner)/20,e.imageYscale+Math.sin(e.siner)/20,0,M.white,e.imageAlpha)}}},h={name:`obj_queen_laser`,index:561,parent:e(`obj_collidebullet`),sprite:`spr_lasergun_laser`,depth:0,events:{create:(t,n)=>{B(t),t.destroyonhit=1,t.timer=0,t.imageXscale=0,t.imageYscale=1,t.active=1;let r=n.first(e(`obj_queen_enemy`));r&&(t.damage=n.globals.monsterat[r.myself]*5);let i=n.first(e(`obj_queen_bulletcontroller`));i&&(t.target=i.target),t.grazepoints=4},step:(e,t)=>{U(e.imageXscale,10)&&(e.imageXscale+=.5),O(e.imageXscale,6)&&(e.speed+=4,O(e.speed,20)&&(e.active=0,O(e.imageYscale,1)&&(e.imageYscale+=.2),e.imageAlpha-=.2,_(e.imageAlpha,0)&&t.destroy(e)))}}},g={name:`obj_sneo_heart_bomb_explode`,index:641,sprite:`spr_sneo_wireheart_bomb`,depth:0,events:{create:e=>{Object.assign(e,{timer:0,con:0,siner:0,target:0,damage:0,imageSpeed:0,imageIndex:1})},step:(e,t)=>{if(e.timer+=1,e.timer===3&&e.imageIndex===0?(e.imageIndex=1,e.timer=0):e.timer===3&&e.imageIndex===1&&(e.imageIndex=0,e.timer=0),e.siner+=4,e.imageXscale=2+Math.sin(e.siner/6)*.5,e.imageYscale=2+Math.sin(e.siner/6)*.5,T(e.siner,96)){R(t,`snd_rocket`);let n=t.random.random(44);for(let r=0;r<8;r++){for(let[r,i]of[[0,-.34],[10,-.1]]){let a=t.create(v,e.x,e.y);e.radialshot=a.id,B(a),a.sprite=`spr_diamondbullet`,a.direction=n+r,a.imageAngle=n+r,a.active=1,a.speed=1,a.friction=i,a.depth=e.depth-1,a.target=e.target,a.damage=e.damage,a.grazed=0,a.newtype=1,a.element=6}n+=45}t.destroy(e)}}}},v={name:`obj_sneo_heatattack_bullet`,index:615,parent:e(`obj_basicbullet_sneo`),sprite:`spr_neo_heart_bullet`,depth:0,events:{create:(e,r)=>{B(e),Object.assign(e,{element:6,f:1,destroyable:0,angle_speed:0,destroypoints:1,dir:0});let i=t(r);i&&(e.damage=r.globals.monsterat[i.myself]*5);let a=n(r);a&&(e.target=a.target),e.grazepoints=2,e.newtype=0,e.timer=0},step:(e,t)=>{e.imageAngle=e.dir,e.f+=1.4,e.x+=x(e.f,e.dir),e.y+=A(e.f,e.dir),U(t.globals.turntimer,1)&&t.destroy(e)},user0:()=>{throw Error(`obj_sneo_heatattack_bullet event 0 is not used by the game`)}}},y={name:`obj_rouxls_power_up_orb`,index:758,sprite:`spr_bullet_laser_circle`,depth:0,events:{create:e=>{Object.assign(e,{init:0,imageAlpha:0,lifetime:30,xx:e.x,yy:e.y,timer:0,radius:5,parenttarget:-1,thin:0,_type:0,track_target:-4,xoff:0,yoff:0,max_radius:6,distance_multiplier:1})},draw:(e,t)=>{if(e.parenttarget!==-1&&!t.byId(e.parenttarget)){t.destroy(e);return}let n=e.parenttarget===-1?void 0:t.byId(e.parenttarget);if(n&&(e.xstart=n.x,e.ystart=n.y),e.init===0){e.init=1,e.thin&&(e.lifetime/=2),e.track_target!==-4&&(e.xstart=0,e.ystart=0);let n=t.random.randomRange(70,90)*e.distance_multiplier;e._type===1&&(n=t.random.randomRange(40,45)),e.xx=e.xstart+x(n,e.direction),e.x=e.xx,e.yy=e.ystart+A(n,e.direction),e.y=e.yy}if(e.track_target!==-4){let n=t.byId(e.track_target);e.xoff=n.x,e.yoff=n.y}if(e.timer+=1,f(e.timer,e.lifetime)){t.destroy(e);return}let r=e.timer/e.lifetime,i=t.drawState;if(e.imageAlpha=1,e.thin)e.imageBlend=M.white,e.imageYscale=.25,e.imageAngle=e.direction,t.drawSelf(e),e.x=Z(e.xx,e.xstart,K(r,2))+e.xoff,e.y=Z(e.yy,e.ystart,K(r,2))+e.yoff;else{let n=i.alpha;i.color=e.imageBlend,t.drawCircle(e.x,e.y,e.radius-2,!1),i.alpha=e.imageAlpha,e.x=Z(e.xx,e.xstart,K(r,2))+e.xoff,e.y=Z(e.yy,e.ystart,K(r,2))+e.yoff,t.drawCircle(e.x,e.y,e.radius,!1),f(e.radius-3,0)&&(i.color=M.white,t.drawCircle(e.x,e.y,e.radius-2,!1)),i.alpha=n,e.radius=Z(e.max_radius,1,r)}}}};return[p,m,h,g,v,y]}var fi=(e,t,n)=>e+(t-e)*n;function pi(e,t,n,r,a){if(a===0)return[n,r];let o=i(e,t,n,r)+a,s=L(e,t,n,r);return[e+x(s,o),t+A(s,o)]}var mi=e=>fe(e,V.c,V.ctrl);function hi(e){let t=t=>t.first(e(`obj_spamton_neo_enemy`)),n=t=>t.first(e(`obj_growtangle`)),r=t=>t.first(e(`obj_heart`)),s={name:`obj_sneo_phonecall`,index:629,parent:e(`obj_bulletparent`),sprite:`spr_sneo_phone`,depth:0,events:{create:(t,n)=>{Object.assign(t,{timer:0,seen:0,writeline:!1,state:0,talktimer:-15,talking:!1,talkmax:45,songtime:0,secondtime:0,skipintro:0,resumeinterval:1.715,sneo:e(`obj_spamton_neo_enemy`),isattack:0,target:0,peeking:0,siner:0,init:0,visible:!1,ydrop:0,ringtimer:0,damage:-1}),t.target=-1,t.fadealpha=1,t.textboxdistance=20,t.textboxoffsetx=0,t.textboxoffsety=0},step:(n,r)=>{let i=r.globals,a=t(r);if(n.init===0&&(n.y=-30,n.visible=!0,n.init=1),n.state<7&&(i.turntimer=430,a.difficulty===3&&(i.turntimer=100)),n.talking){n.talktimer+=1;let t=+(a.difficulty===3&&n.state>=5);if($e(r)&&n.talktimer>5&&t===0&&(n.talktimer=n.talkmax),mi(r)&&n.talktimer>1&&t===0&&(n.talktimer=n.talkmax),n.talktimer>=n.talkmax){a.talktimer=a.talkmax;for(let t of r.all(e(`obj_writer`)))r.destroy(t);n.talking=!1,n.talktimer=-10,n.state+=1}return}if(n.state===6){if(qe(r,`bullets`,n)||n.isattack){if(n.secondtime||(n.songtime=n.songtime+n.resumeinterval-n.songtime%n.resumeinterval,n.songtime>140&&(n.songtime=0)),n.isattack){if(a.difficulty===3)r.create(l,a.x+a.partx[5],a.y+a.party[5]+60);else{for(let t of r.all(e(`obj_sneo_bulletcontroller`)))r.destroy(t);let[t,o]=pi(0,0,-26,n.secondtime?30:70,a.partrot[1]),s=t+a.x+a.partx[1]+a.partxoff[1],c=o+a.y+a.party[1]+a.partyoff[1];i.monsterattackname[a.myself]=`FootballPipis`;let l=r.create(e(`obj_sneo_bulletcontroller`),s,c);n.d=l.id,l.type=1,l.damage=i.monsterat[a.myself]*5,l.target=n.target}}n.state=7}return}if(n.talktimer<0)n.talktimer+=1;else if(n.state===0)n.ringtimer=12,n.sndphone=R(r,`snd_phone`)??-1,r.sourceAudio?.volume(n.sndphone,.7,0),n.talktimer=-10,n.state+=1;else if(n.state===1)n.talktimer=-10,n.state+=1,a.partmode=6,n.skipintro===1&&(n.state=5);else if(n.state===2)a.difficulty===3?N(r,0,F(`obj_sneo_phonecall_slash_Step_0_gml_89_0`)):(N(r,0,F(`obj_sneo_phonecall_slash_Step_0_gml_96_0`)),a.partmode=7),n.writeline=!0;else if(n.state===3)a.difficulty===3?n.state=5:(N(r,0,F(`obj_sneo_phonecall_slash_Step_0_gml_136_0`)),a.partmode=7,n.writeline=!0);else if(n.state===4)n.state=5;else if(n.state===5){qe(r,`bullets`,n)&&n.skipintro===0?(n.textboxoffsetx=10,n.textboxoffsety=20,a.difficulty===3?N(r,0,F(`obj_sneo_phonecall_slash_Step_0_gml_176_0`)):(N(r,0,F(`obj_sneo_phonecall_slash_Step_0_gml_138_0`)),a.partframe[1]=3),n.textboxdistance=40,n.writeline=!0):n.state=6;for(let t of r.all(e(`obj_spamton_neo_enemy`)))a.difficulty===3?(t.partmode=9,t.partframe[1]=4):(t.partmode=9,t.partrot[1]=-180,t.partframe[1]=3)}if(n.writeline){n.writeline=!1;for(let t of r.all(e(`obj_spamton_neo_enemy`)))i.typer=72,jn(t,r,t.x-n.textboxdistance+22-n.textboxoffsetx,t.y+60+n.textboxoffsety,10);n.talktimer=0,n.talking=!0}},draw:(e,n)=>{let r=n.drawState,i=t(n);if(r.alpha=e.fadealpha,r.color=M.white,e.state===0||e.state===1&&i.partframe[1]===0)e.siner+=1,n.drawSelf(e),n.drawLine(e.x,e.y,i.x+i.partx[5],-20,2),e.imageAngle=Math.sin(e.siner/20)*10,e.ringtimer>0&&(e.imageAngle+=e.ringtimer%2==0?1:-1,--e.ringtimer,e.ringtimer<=6&&(i.partmode=5)),e.x=e.xstart+Math.sin((e.siner+0)/20)*10,U(e.ydrop,1)&&(e.ydrop+=.02),e.y=fi(-30,e.ystart,qt(e.ydrop,-2));else{let[t,r]=pi(0,0,20,50,i.partrot[1]);e.xx=t+i.x+i.partx[1]+i.partxoff[1],e.yy=r+i.y+i.party[1]+i.partyoff[1],n.drawLine(e.xx,e.yy,i.x+i.partx[5],-20,2)}r.alpha=1},destroy:(n,r)=>{t(r).partmode=1;for(let t of r.all(e(`obj_spamton_neo_enemy`)))a(t,r,8)}},collisions:[{target:e(`obj_yheart_shot`),run:()=>{}}]},l={name:`obj_sneo_phonecall_pipis_stream`,index:667,parent:e(`obj_collidebullet`),depth:0,events:{create:e=>{e.timer=0},step:(e,t)=>{let n=e.y-4+t.random.random(8),r=e.x-4+t.random.random(8),i=t.create(u,r,n);e.part=i.id,i.direction=-5+t.random.random(38),i.speed=7+t.random.random(13),i.imageAngle=e.direction-180}}},u={name:`obj_sneo_phonecall_sneohead`,index:665,sprite:`spr_sneo_crew`,depth:0,events:{create:e=>{Object.assign(e,{imageXscale:.5,imageYscale:-.5,timer:0,con:0,homingfactor:0,maxhomingfactor:2})},step:(e,n)=>{if(U(n.globals.turntimer,3)&&n.destroy(e),e.imageAngle=e.direction-180,e.timer+=1,e.timer>=4+n.random.irandom(1)){n.destroy(e);let r=n.create(C,e.x,e.y);e.fx=r.id,r.imageXscale=2,r.imageYscale=2,r.imageSpeed=1,R(n,`snd_rocket_sneo`),n.sourceAudio?.volume(`snd_rocket_sneo`,.1,0);let i=t(n);i.partx[5]=n.random.random(8),i.party[5]=n.random.random(8)}}}},d=(e,t,n)=>[t+5+x(50,e.imageAngle+270),n+A(50,e.imageAngle+270)],p=(e,t,n,r,i)=>{let[a,o]=d(e,r,i),s=t.create(n,a,o);return e.bul=s.id,s},m=(e,t,n,r)=>{for(let i=0;i<3;i++){let i=p(e,t,ee,n,r);i.depth=e.depth-2}},h={name:`obj_pipis_controller`,index:660,sprite:`spr_sneo_arml`,depth:0,events:{create:(e,t)=>{Object.assign(e,{con:0,timer:0,con2:0,timer2:0,timer3:0,variant:2,eggcount:20,savex:0,firstshot:1}),e.siner=t.random.irandom(100),Object.assign(e,{timervariance:30,pipiscount:0,speedvar:2,movecon:0,movetimer:0,imageAngle:-170,imageXscale:2,angle_final:-170,damage:0,target:0,sprite:`spr_sneo_arml_egg`,maxpipis:10})},draw:(e,r)=>{let i=r.globals,a=r.random,o=r.view;e.siner+=.25;let s=o.x+o.width-10,c=o.y+o.height-230+Math.sin(e.siner/6)*21,l=0;e.sprite===`spr_sneo_arml_egg`&&(l=-4+a.random(8)),e.movecon===0&&(e.movetimer+=1,s=fi(o.x+o.width+70,o.x+o.width-10,e.movetimer/10),e.movetimer===10&&(e.movetimer=0,e.movecon=1)),U(i.turntimer,16)&&(e.movecon=2),e.movecon===2&&(e.movetimer+=1,s=fi(o.x+o.width-10,o.x+o.width+70,e.movetimer/10),e.movetimer===10&&r.destroy(e));let u=()=>r.count(v);if(e.variant===3&&e.movecon===1){if(e.con===0&&(e.timer+=1,e.timer>=1)){if(!r.exists(w)){let t=n(r),i=r.create(w,t.x+200,t.y+r.spriteHeight(t)/2+60);e.wall=i.id,i.imageXscale=2.5}e.con=1,e.timer=0}if(e.con===1){for(let t=0;t<3;t++)if(a.irandom(10)<6){let t=p(e,r,D,s,c);t.gravity=.2+a.random(3)/100,t.vspeed=-6-a.random(2),t.hspeed=-1.8-a.random(1.5),t.target=e.target,t.damage=e.damage,t.depth=e.depth-1,t.directhit=1}else{let t=p(e,r,v,s,c);t.type=3,t.gravity=.2+a.random(3)/100,t.vspeed=-6-a.random(2),t.hspeed=-1.6-a.random(3),t.target=e.target,t.damage=e.damage,t.depth=e.depth-1,t.directhit=1}e.sprite=`spr_sneo_arml`,e.angle_final=-180+a.random(50),m(e,r,s,c),e.con=2}e.con===2&&(e.timer+=1,e.timer<11&&(e.imageAngle=fi(e.imageAngle,e.angle_final,e.timer/10)),e.timer<e.timervariance-15&&f(e.eggcount,.4)&&(e.imageXscale=fi(1.8,2.5,e.timer/(e.timervariance-15))),e.timer===e.timervariance-15&&f(e.eggcount,.4)&&(e.sprite=`spr_sneo_arml_egg`,e.imageXscale=2),e.timer>=e.timervariance&&(e.eggcount-=.4,e.timervariance=60+a.irandom(15),e.con=1,e.timer=0))}if(e.variant===2&&e.movecon===1){if(e.con===0&&(e.timer+=1,e.timer>=1)){if(!r.exists(w)){let t=n(r),i=r.create(w,t.x+200,t.y+r.spriteHeight(t)/2);e.wall=i.id,i.imageXscale=2.9}e.con=1,e.timer=0}if(e.con===1){let n=1;e.pipiscount+=1,(e.pipiscount===3||e.pipiscount===5||e.pipiscount===9)&&(n=0),(e.pipiscount===0||e.pipiscount===4||e.pipiscount===8||e.pipiscount===11)&&(n=1);let o=t=>{let n=p(e,r,v,s,c);return n.type=2,n.gravity=.5+a.random(10)/100,n.vspeed=-14,n.hspeed=t(),n.target=e.target,n.damage=e.damage,n.depth=e.depth-1,n},l=()=>{let t=p(e,r,v,s,c);t.type=2,t.gravity=.063+a.random(4)/100,t.vspeed=-4.25,t.hspeed=-4,t.target=e.target,t.damage=e.damage,t.depth=e.depth-1,t.directhit=1};if(t(r).difficulty===0){let t=.8;f(i.turntimer,380)&&(t=.5);let r=0;u()<2&&U(i.turntimer,250)&&(r=1),u()<3&&e.pipiscount<e.maxpipis&&(n===1?o(()=>-1.55-r-a.random(t)):l())}else{let e=0;if(u()<2&&U(i.turntimer,250)&&(e=1),u()<3){if(-1.6-a.random(.6),n===1)for(let t=0;t<2;t++)o(()=>-1.55-e-a.random(.8)),-2.2-a.random(.6);else l(),o(()=>-1.4-a.random(.4)),-2.2-a.random(.6)}}e.sprite=`spr_sneo_arml`,e.angle_final=-180+a.random(50),m(e,r,s,c),e.con=2}let o=1;u()<1&&(o=3);for(let t=0;t<o;t++)e.con===2&&(e.timer+=1,e.timer<11&&(e.imageAngle=fi(e.imageAngle,e.angle_final,e.timer/10)),e.timer<e.timervariance-15&&f(e.eggcount,.4)&&(e.imageXscale=fi(1.8,2.5,e.timer/(e.timervariance-15))),e.timer===e.timervariance-15&&f(e.eggcount,.4)&&e.pipiscount<e.maxpipis&&(e.sprite=`spr_sneo_arml_egg`,e.imageXscale=2),e.timer>=e.timervariance&&(e.eggcount-=.4,e.timervariance=30+a.irandom(15),f(e.eggcount,0)?(e.con=0,e.timer=0):r.destroy(e)))}if(r.drawSprite(`spr_sneo_wingl`,0,s,c+20,2,2,20,M.white,1),r.drawSprite(e.sprite,1,s,c+11+l/2,e.imageXscale,2,e.imageAngle+l,M.white,1),r.drawSprite(`spr_sneo_body`,0,s,c+20,2,2,0,M.white,1),r.drawSprite(`spr_sneo_head`,1,s+26,c,2,2,0,M.white,1),e.pipiscount>=e.maxpipis&&f(i.turntimer,10)&&!r.exists(v)&&(i.turntimer=10),U(i.turntimer,1)&&r.destroy(e),e.variant===0){let t=n(r);if(e.con===0&&(e.timer+=1,e.timer===1&&(e.savex=t.x+220-80+a.random(160),r.create(w,e.savex,t.y-a.random(30)+r.spriteHeight(t)/2)),e.timer>=10&&(e.con=1,e.timer=0)),e.con===1){let t=r.create(v,e.savex,o.y-20);e.bul=t.id,t.gravity=.2+a.random(10)/100,t.target=e.target,t.damage=e.damage,e.con=2}if(e.con===2&&(e.timer+=1,e.timer>=50)){if(--e.eggcount,f(e.eggcount,0)){e.con=0,e.timer=0;for(let e of r.all(w))e.con=1}else r.destroy(e)}}if(e.variant===1){let t=n(r);if(e.con===0){if(e.timer+=1,e.timer===1){let n=r.create(w,t.x+190-50+a.random(100),t.y+r.spriteHeight(t)/2);e.wall=n.id,n.type=1}e.timer>=10&&(e.con=1,e.timer=0)}if(e.con===1){let t=r.byId(e.wall),n=r.create(v,t.x,o.y-20);e.bul=n.id,n.gravity=.2+a.random(10)/100,n.type=1,n.parent=t.id,n.target=e.target,n.damage=e.damage,e.con=2}if(e.con===2&&(e.timer+=1,e.timer>=50)){if(--e.eggcount,f(e.eggcount,0)){e.con=0,e.timer=-40;let t=r.byId(e.wall);t&&(t.con=1)}else r.destroy(e)}if(e.con2===0){if(e.timer2+=1,e.timer2===40){let n=r.create(w,t.x+280-50+a.random(100),t.y-r.spriteHeight(t)/2);e.wall2=n.id,n.type=1}e.timer2>=50&&(e.con2=1,e.timer2=0)}if(e.con2===1){let t=r.byId(e.wall2),n=r.create(v,t.x,o.y+o.height+20);e.bul=n.id,n.gravity=.2+a.random(10)/100,n.gravityDirection=90,n.type=1,n.parent=t.id,n.target=e.target,n.damage=e.damage,e.con2=2}if(e.con2===2&&(e.timer2+=1,e.timer2>=50)){if(--e.eggcount,f(e.eggcount,0)){e.con2=0,e.timer2=0;let t=r.byId(e.wall2);t&&(t.con=1)}else r.destroy(e)}if(e.timer3+=1,e.timer3===150){let n=r.create(v,o.x+o.width,t.y);e.bul=n.id,n.gravity=.6+a.random(10)/100,n.gravityDirection=180,n.target=e.target,n.damage=e.damage}}}}},g=(n,a)=>{let o=a.random,s=t(a),c=a.create(C,n.x,n.y);if(n.fx=c.id,c.imageXscale=1.5,c.imageYscale=1.5,s.difficulty!==4){let e=r(a);if(n.type===2||n.type===3){let t=n.type===2?[25,50]:[20,40];for(n.i=0;n.i<10;n.i+=1){let r=a.create(b,n.x,n.y);n.hed=r.id,r.direction=i(n.x,n.y,e.x+10,e.y+10)-t[0]+o.random(t[1]),r.speed=15+o.random(5),r.depth=n.depth-100,n.type===2&&(r.sprite=`spr_sneo_crew`,r.imageXscale=.5,r.imageYscale=.5),r.target=n.target,r.damage=n.damage,r.grazed=0,r.element=6}}else{let e=a.create(S,n.x,n.y);n.center=e.id,e.target=n.target,e.damage=n.damage}}if(s.difficulty===4){let t=r(a);for(n.i=0;n.i<15;n.i+=1){let t=a.create(e(`obj_sneo_heatattack_bullet`),n.x,n.y);n.radialshot=t.id,B(t),t.sprite=`spr_diamondbullet`,t.dir=n.i*24+o.random(14)-7,t.active=1,t.depth=n.depth-100,t.target=n.target,t.damage=n.damage,t.grazed=0,t.element=6}for(let r of[0,-40,40]){let o=a.create(e(`obj_sneo_heatattack_bullet`),n.x,n.y);n.radialshot=o.id,B(o),o.sprite=`spr_diamondbullet`,o.dir=i(n.x,n.y,t.x+10,t.y+10+r),o.active=1,o.depth=n.depth-100,o.target=n.target,o.damage=n.damage,o.grazed=0,o.element=6}}for(let e=0;e<3;e++){let e=a.create(E,n.x,n.y);n.fx=e.id,e.imageIndex=o.random(3),e.imageXscale=2,e.imageYscale=2,e.direction=45+o.random(90)}a.destroy(n)},_=(e,t)=>{let n=t.create(C,e.x,e.y);e.fx=n.id,n.imageXscale=1.5,n.imageYscale=1.5;for(let n=0;n<3;n++){let n=t.create(E,e.x,e.y);e.fx=n.id,n.imageXscale=2,n.imageYscale=2}t.destroy(e)},v={name:`obj_pipis_egg_bullet`,index:631,parent:e(`obj_collidebullet`),sprite:`spr_pipis_egg`,depth:0,events:{create:(e,t)=>{B(e),Object.assign(e,{hp:3,con:0,timer:0,type:0,shake:0,parent:-1,imageSpeed:0,imageXscale:2,imageYscale:2}),e.imageAngle=t.random.random(360),Object.assign(e,{target:0,damage:1,directhit:0,element:6,bluesiner:0}),e.image_blend2=o(15245824,M.aqua,.25+Math.sin(e.bluesiner/3)*.25),Object.assign(e,{hitstun:0,hitstunenabled:0}),e.bouncespeed=-5-t.random.random(3),e.drawlabel=0,e.grazepoints=2},alarm0:()=>{},user0:g,draw:(e,t)=>{let r=t.random,i=n(t),a=t.spriteWidth(i),o=t.spriteHeight(i);if(e.drawlabel===1){let n=e.y+t.spriteHeight(e)/2+12+r.randomRange(0,1),i=e.x-4+r.randomRange(0,1);t.drawSprite(`spr_pipissign`,0,i,n,1,1,0,M.white,1)}let s=()=>U(e.x,i.x+a/2+10)&&f(e.y,i.y-o/2+10);e.type===3?(s()&&(t.userEvent(e,0),R(t,`snd_bomb`)),f(e.y,i.y-20+o)&&(t.userEvent(e,0),R(t,`snd_bomb`)),e.imageAngle+=10):e.type===2?(e.imageAngle+=45,e.con===0&&f(e.y,i.y-20+o/2)&&f(e.vspeed,0)&&(e.con=1),e.con===1&&(R(t,`snd_bump`),e.imageAngle=-30-r.random(30),e.gravity=.24,e.vspeed=e.bouncespeed,e.con=2,e.alarm[0]=10),s()&&(t.userEvent(e,0),R(t,`snd_bomb`)),f(e.y,i.y-20+o/2)&&f(e.vspeed,0)&&e.con===2&&e.alarm[0]<1&&(e.con=1)):(e.type===1&&(e.x=t.byId(e.parent).x),e.imageAngle+=4,T(e.gravityDirection,180)&&U(e.x,i.x+a/2+10)&&(t.userEvent(e,0),R(t,`snd_bomb`)));let c=0,l=0;e.shake>0&&(--e.shake,c=4-r.random(8),l=4-r.random(8)),t.drawSprite(e.sprite,e.imageIndex,e.x+c,e.y+l,e.imageXscale,e.imageYscale,e.imageAngle,M.white,e.imageAlpha),e.type===2&&(e.con===2&&U(e.y,i.y-o/2)&&U(e.x,i.x+a/2+80)||e.directhit===1&&U(e.y,i.y-o/2))&&(e.gravity+=.01)}},collisions:[{target:e(`obj_yheart_shot`),run:(e,n,r)=>{if(e.shake=8,e.hp-=n.damage,e.imageIndex<3&&(e.imageIndex+=1),R(r,`snd_damage`),n.big===0&&r.userEvent(n,0),U(e.hp,1))_(e,r),ge(r,t(r).difficulty===1?2:3);else{let t=r.create(E,e.x,e.y);e.fx=t.id,t.imageIndex=e.imageIndex,U(e.x,r.view.x+500)&&(e.hspeed/=1.05)}}},{target:e(`obj_mettaton_bomb_hitbox`),run:(e,n,r)=>{e.shake=8,e.hp-=3,e.imageIndex<3&&(e.imageIndex+=1),R(r,`snd_damage`),_(e,r),ge(r,t(r).difficulty===1?3:1.5)}},{target:e(`obj_pipis_wall`),run:(e,t,n)=>{e.type!==2&&e.type!==3&&n.userEvent(e,0)}}]},y={name:`obj_pipis_bullet`,index:632,parent:e(`obj_collidebullet`),sprite:`spr_sneo_crew`,depth:0,events:{create:e=>{B(e),Object.assign(e,{element:6,timer:0,con:0,type:0,target:0,damage:1,hp:.5,imageXscale:.5,imageYscale:.5,length:0,place:0,parent:-1})},step:(e,t)=>{let n=t.byId(e.parent);if(!n){t.destroy(e);return}e.length<36&&(e.length+=2),e.x=n.x+x(e.length,e.place),e.y=n.y+A(e.length,e.place),e.hp===0&&t.userEvent(e,1)},destroy:()=>{},user1:(t,n)=>{R(n,`snd_bomb`,1.1+n.random.random(.2)),q(t,n,e),n.destroy(t)}},collisions:[{target:e(`obj_yheart_shot`),run:(e,n,r)=>{(t(r).difficulty===2||n.big===0)&&r.userEvent(n,0),r.userEvent(e,1)}}]},b={name:`obj_pipis_bullet_cone`,index:1,parent:e(`obj_collidebullet`),sprite:`spr_sneo_crew`,depth:0,events:{create:e=>{B(e),Object.assign(e,{element:6,timer:0,con:0,type:0,target:0,damage:1,hp:.5,imageXscale:.4,imageYscale:.4,length:0,place:0,parent:-1,grazepoints:1})},step:(e,t)=>{e.hp===0&&t.userEvent(e,1)},destroy:()=>{},user1:(t,n)=>{R(n,`snd_bomb`,1.1+n.random.random(.2)),q(t,n,e),n.destroy(t)}},collisions:[{target:e(`obj_yheart_shot`),run:()=>{}}]},S={name:`obj_pipis_center`,index:662,depth:0,events:{create:e=>{Object.assign(e,{timer:0,con:0,maxlength:36,init:0,homingfactor:0,maxhomingfactor:5})},step:(t,n)=>{let i=r(n);if(!i){n.destroy(t);return}t.init===0&&(t.init=1,[60,120,180,240,300,360].forEach((e,r)=>{let i=n.create(y,t.x,t.y);t[`b`+(r+1)]=i.id,i.place=e+n.random.random(15),i.parent=t.id,i.damage=t.damage,i.target=t.target})),t.con===0&&(t.timer+=1,t.timer===15&&(t.con=1,t.timer=0)),(t.con===1||t.con>1&&t.con<6)&&(c(t,i.x,i.y,13),t.con+=1,U(Oe(n.bank,t,n.all(e(`obj_heart`))),30)&&(t.con=6)),U(t.x,n.view.x-50)&&n.destroy(t)}}},C={name:`obj_pipis_destroy_fx`,index:663,sprite:`spr_boxing_crescent`,depth:0,events:{create:e=>{e.imageSpeed=.25},step:(e,t)=>{U(t.globals.turntimer,1)&&t.destroy(e)},animationEnd:(e,t)=>t.destroy(e)}},w={name:`obj_pipis_wall`,index:630,sprite:`spr_pipis_wall`,depth:0,events:{create:(e,t)=>{Object.assign(e,{imageAlpha:0,imageBlend:M.lime,imageXscale:1,con:0,timer:0,type:0}),e.siner=t.random.random(100)},step:(e,t)=>{e.con===0&&U(e.imageAlpha,1)&&(e.imageAlpha+=.1),e.con===1&&(f(e.imageAlpha,0)?e.imageAlpha-=.1:t.destroy(e)),e.type===1&&(e.siner+=.5,e.x=e.xstart+Math.sin(e.siner/6)*48),U(t.globals.turntimer,1)&&t.destroy(e)}}},E={name:`obj_pipis_egg_bullet_piece`,index:661,sprite:`spr_pipis_egg_piece`,depth:0,events:{create:(e,t)=>{e.timer=0,e.con=0,e.grav=0,e.imageAngle=t.random.random(360),e.direction=t.random.random(360),e.speed=3+t.random.random(7),e.imageAlpha=2.9;let n=r(t);n?e.depth=n.depth-100:t.destroy(e)},step:(e,t)=>{e.imageAlpha-=.1,e.grav+=.3,e.y+=e.grav,f(e.y,t.view.y+t.view.height+10)&&t.destroy(e),U(t.globals.turntimer,1)&&t.destroy(e)}}},D={name:`obj_sneo_pipis_bomb`,index:46,parent:e(`obj_collidebullet`),sprite:`spr_mettaton_bomb1`,depth:0,events:{create:(t,n)=>{B(t),Object.assign(t,{imageXscale:1,imageYscale:1,timer:0,con:0,element:6,destroyable:0,bighitbox:1,imageSpeed:0});let r=n.first(e(`obj_spamton_neo_enemy`));r&&(t.damage=n.globals.monsterat[r.myself]*5);let i=n.first(e(`obj_sneo_bulletcontroller`));i&&(t.target=i.target),Object.assign(t,{grazepoints:2,wallspeed:-7,wallnumber:0,spawninvincibilitytimer:0})},alarm0:()=>{},alarm1:()=>{},step:(t,r)=>{if(U(r.globals.turntimer,1)&&r.destroy(t),t.timer>0&&(t.timer+=1),t.spawninvincibilitytimer+=1,t.timer===6){R(r,`snd_bomb`),r.soundStop?.(t.bomsfallsfx),t.sprite=`spr_mettaton_bomb2`,t.imageIndex=0,r.create(e(`obj_shake`),t.x,t.y);for(let[n,i,a]of[[1,5e3,.5],[2,.2,5e3]]){let o=r.create(e(`obj_mettaton_bomb_hitbox`),t.x,t.y);t[`hitbox`+n]=o.id,o.imageXscale=i,o.imageYscale=a,o.creator=t.id}}t.timer===12&&r.destroy(t);let i=n(r);f(t.y,i.y-81+r.spriteHeight(i))&&t.alarm[0]<1&&(R(r,`snd_bump`),t.gravity=.24,t.vspeed=-5.5-r.random.random(3),t.con=2,t.alarm[0]=10),U(t.x,i.x+r.spriteWidth(i)/2+10)&&f(t.y,i.y-r.spriteHeight(i)/2+10)&&t.timer===0&&(R(r,`snd_damage`),t.gravity=0,t.speed=0,t.timer=1,t.imageSpeed=1,t.bomsfallsfx=r.soundLoop?.(`snd_bombfall`)??-1)},draw:(e,t)=>{if(t.drawSelf(e),e.sprite===`spr_mettaton_bomb2`)for(let n=1;n<24;n++)t.drawSprite(`spr_mettaton_bomb3`,e.imageIndex,e.x+24*n,e.y,e.imageXscale,e.imageYscale,90,M.white,e.imageAlpha),t.drawSprite(`spr_mettaton_bomb3`,e.imageIndex,e.x-24*n,e.y,e.imageXscale,e.imageYscale,90,M.white,e.imageAlpha),t.drawSprite(`spr_mettaton_bomb3`,e.imageIndex,e.x,e.y-24*n,e.imageXscale,e.imageYscale,0,M.white,e.imageAlpha),t.drawSprite(`spr_mettaton_bomb3`,e.imageIndex,e.x,e.y+24*n,e.imageXscale,e.imageYscale,0,M.white,e.imageAlpha)},destroy:(e,t)=>{e.timer>0&&t.soundStop?.(e.bomsfallsfx)}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>{e.timer===0&&e.spawninvincibilitytimer>11&&(R(n,`snd_damage`),t.big===0&&n.userEvent(t,0),e.timer=1,e.imageSpeed=1,e.bomsfallsfx=n.soundLoop?.(`snd_bombfall`)??-1)}}]},ee={name:`obj_sneo_armcannon_smoke`,index:664,sprite:`spr_boxing_smoke`,depth:0,events:{create:(e,t)=>{Object.assign(e,{imageXscale:1,imageYscale:1,speed:4,friction:.2}),e.direction=70+t.random.random(80),e.imageSpeed=0,e.imageAngle=70+t.random.random(80),e.timer=0},step:(e,t)=>{e.imageAlpha-=.05,U(e.imageAlpha,0)&&t.destroy(e),U(t.globals.turntimer,1)&&t.destroy(e)}}};return[s,l,u,h,v,y,b,S,C,w,E,D,ee]}var gi=(e,t,n)=>e+(t-e)*n;function _i(e){let t=e(`obj_basicbullet_sneo`),n=e(`obj_regularbullet`),r=D(t,`create`);if(!r)throw Error(`NEO phone hands require obj_basicbullet_sneo Create`);let i=(t,n)=>t.first(e(n)),a=(e,t)=>{let n=e.byId(t);if(!n)throw Error(`NEO phone hands require instance ${t}`);return n},s=e=>(e.visibiliytimer+=1,!U(e.visibiliytimer,2)&&(U(e.imageAlpha,1)&&(e.imageAlpha+=.1),!0)),c=(e,n,r,i)=>{let a=n.create(t,e.x,e.y);return e.shot=a.id,e.orientation===`top`&&(a.direction=270+n.random.randomRange(-r,r)),e.orientation===`bottom`&&(a.direction=90+n.random.randomRange(-r,r)),a.speed=i,a.sprite=`spr_sneo_soundbullet`,a.imageAngle=a.direction,a.target=e.target,a.grazepoints=3,a},l={name:`obj_sneo_phonehand`,index:655,parent:t,sprite:`spr_sneo_phonehand`,depth:0,events:{create:(e,t)=>{r(e,t),Object.assign(e,{destroyonhit:0,siner:0,crawlsiner:0,jointx:999,jointy:999,remjointy:999,boss:-1,element:6,amplitude:4,period:5,orientation:`top`,init:0,difficulty:0,btimer:0,moving:0,wasmoving:0,alt:0,visibiliytimer:0,imageAlpha:0})},step:(e,t)=>{let n=()=>t.byId(e.boss);if(e.init===0){let t=n();t&&(e.orientation===`top`&&(e.jointx=t.x-10,e.jointy=e.y-30),e.orientation===`bottom`&&(e.imageYscale=-1,e.jointx=t.x-10,e.jointy=e.y+30),e.remjointy=e.jointy,e.init=1)}e.btimer===13&&(f(e.imageYscale,0)&&(e.imageYscale=2),U(e.imageYscale,0)&&(e.imageYscale=-2)),f(e.imageYscale,1)&&(e.imageYscale-=.2),U(e.imageYscale,-1)&&(e.imageYscale+=.2),e.movingcheck=0;let r=()=>{let t=n();t&&(e.jointx=(e.x+t.x)/2,e.jointy=(e.remjointy+e.y)/2)};if(e.alt===0&&(e.crawlsiner+=1,e.orientation===`top`&&U(Math.sin(e.crawlsiner/e.period),0)&&(e.wasmoving=1,e.movingcheck=1,e.y+=Math.cos(e.crawlsiner/e.period)*e.amplitude*2,e.x+=Math.sin(e.crawlsiner/e.period)*e.amplitude),e.orientation===`bottom`&&U(Math.cos(e.crawlsiner/e.period+Math.PI/2),0)&&(e.wasmoving=1,e.movingcheck=1,e.y+=Math.sin(e.crawlsiner/e.period+Math.PI/2)*e.amplitude*2,e.x+=Math.cos(e.crawlsiner/e.period+Math.PI/2)*e.amplitude),r()),e.alt===1&&n()&&(e.orientation===`top`?e.crawlsiner+=1:--e.crawlsiner,e.xx=t.view.x+200,e.endx=n().x-20,e.x=e.xx+(e.endx-e.xx)/2+Math.sin(e.crawlsiner/12)*((e.endx-e.xx)/2),e.btimer+=1,e.threshold=e.orientation===`top`?28:18,O(e.btimer,e.threshold)&&(c(e,t,2,3),e.btimer=0,e.btimer=e.orientation===`top`?10:0),r()),e.difficulty===99&&e.movingcheck===0&&e.wasmoving===1){e.wasmoving=0;for(let n=0;n<3;n++)c(e,t,10,8)}e.difficulty===99&&O(e.btimer,6)&&(c(e,t,4,4),e.btimer=0)},draw:(e,t)=>{if(!s(e))return;t.drawState.alpha=e.imageAlpha,t.drawState.color=M.green,t.drawLine(e.x,e.y,e.jointx,e.jointy,4);let n=t.byId(e.boss);if(n)for(t.drawLine(e.jointx,e.jointy,n.x,n.y,4),e.i=0;e.i<4;e.i+=1)t.drawSprite(`spr_sneo_bullet0`,0,gi(e.x,e.jointx,e.i/4),gi(e.y,e.jointy,e.i/4),2,2,0,M.green,1),t.drawSprite(`spr_sneo_bullet0`,0,gi(e.jointx,n.x,e.i/4),gi(e.jointy,n.y,e.i/4),2,2,0,M.green,1);t.drawSelf(e),t.drawState.alpha=1}}},u={name:`obj_sneo_phonehand_master`,index:653,parent:t,sprite:`spr_sneo_head_sad`,depth:0,events:{create:(e,t)=>{r(e,t),Object.assign(e,{destroyonhit:0,imageSpeed:0,imageXscale:2,imageYscale:2,siner:0,element:6,xdist:70});let n=t.create(l,e.x-e.xdist,e.y-70);e.phonehand_top=n.id,n.orientation=`top`,n.boss=e.id,n.target=i(t,`obj_sneo_bulletcontroller`).target;let a=t.create(l,e.x-e.xdist,e.y+60);e.phonehand_bottom=a.id,a.orientation=`bottom`,a.boss=e.id,a.target=i(t,`obj_sneo_bulletcontroller`).target,Object.assign(e,{movedx:0,hp:200,difficulty:0}),e.difficulty=i(t,`obj_spamton_neo_enemy`).difficulty,Object.assign(e,{btimer:0,init:0,visibiliytimer:0,imageAlpha:0,bluesiner:0}),e.imageBlend=o(15245824,M.aqua,.25+Math.sin(e.bluesiner/3)*.25)},step:(e,n)=>{e.siner+=1,e.bluesiner+=1,e.imageBlend=o(15245824,M.aqua,.25+Math.sin(e.bluesiner/3)*.25),O(e.x,n.view.x+480)&&(e.x=n.view.x+480),e.grazed===1&&(e.grazetimer+=1,O(e.grazetimer,3)&&(e.grazetimer=0,e.grazed=0));let r=i(n,`obj_heart`);if(r&&f(r.x,i(n,`obj_sneo_phonehand_master`).x-36)&&(r.x=i(n,`obj_sneo_phonehand_master`).x-36),e.init===0){if(e.difficulty===2)for(let e of n.all(l))e.alt=1;a(n,e.phonehand_top).target=e.target,a(n,e.phonehand_bottom).target=e.target,e.init=1}e.difficulty===0&&(e.y=e.ystart+Math.sin(e.siner/8)*40),(e.difficulty===1||e.difficulty===2)&&(e.y=e.ystart+Math.sin(e.siner/10)*60);let s=n.byId(e.phonehand_top);if(s&&(U(e.difficulty,2)?e.x=gi(e.x,s.x+e.xdist,.2):--e.x),(e.difficulty===0||e.difficulty===1||e.difficulty===2)&&(e.btimer+=1,e.threshold=20,e.difficulty===1&&(e.threshold=15),e.difficulty===2&&(e.threshold=30),O(e.btimer,e.threshold)&&O(e.imageAlpha,1))){e.btimer=0;let r=n.create(U(e.difficulty,2)?p:t,e.x,e.y);e.shot=r.id,r.speed=12,r.imageXscale=3,r.imageYscale=3,U(e.difficulty,2)?r.friction=1:r.speed=10,r.alarm[0]=25,r.direction=180+n.random.randomRange(-5,5),r.depth=e.depth-1,r.target=e.target,e.sprite=`spr_sneo_head_open`,e.alarm[0]=10}},draw:(e,t)=>{s(e)&&(t.drawState.alpha=e.imageAlpha,t.drawSelf(e),t.drawState.alpha=1)},alarm0:e=>{e.sprite=`spr_sneo_head`},destroy:()=>{}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>{if(--e.hp,_(e.x,n.view.x+480)){e.friction=.5,e.hspeed+=t.big===1?8:4;let r=t.big;for(let e of n.all(l))e.friction=.5,e.hspeed+=2,r&&(e.hspeed+=4)}R(n,`snd_damage`),O(e.x,n.view.x+480)&&(e.x=n.view.x+480),n.userEvent(t,0)}}]},d={name:`obj_sneo_phonehand_master_hurtbox`,index:654,parent:n,sprite:`spr_hitbox_10px`,depth:0,events:{create:e=>{B(e),Object.assign(e,{wall_destroy:1,imageAlpha:1,sprite:`spr_hitbox_10px`,imageXscale:4,imageYscale:20,visible:!0,destroyonhit:0,grazed:1,element:6})},endStep:()=>{},user5:(e,t)=>{e.active===1&&(e.target===3?oe(e,t):v(e,t),e.destroyonhit===1&&t.destroy(e))}}},p={name:`obj_sneo_mmx_spreadshot`,index:656,parent:t,sprite:`spr_sneo_bullet0`,depth:0,events:{create:(e,t)=>{r(e,t),Object.assign(e,{element:6,flashtimer:0,grazed:0,grazepoints:2,timepoints:1,target:-1,grazetimer:0,dont:1,inv:120});let n=i(t,`obj_clubsenemy`);n&&(e.damage=t.globals.monsterat[n.myself]*5)},step:(e,t)=>{(O(e.x,t.room.width+100)||_(e.x,-100)||O(e.y,t.room.height+100)||_(e.y,-100))&&t.destroy(e),e.direction+=e.angle_speed,e.imageAngle=e.direction,(T(e.alarm[0],8)||T(e.alarm[0],16))&&(e.flashtimer=5)},alarm0:(e,t)=>{for(e.i=0;e.i<3;e.i+=1){let r=t.create(n,e.x,e.y);e.shot=r.id,r.live&&(r.direction=120+e.i*60,r.speed=2,r.friction=-.6,r.sprite=`spr_sneo_soundbullet`,r.imageAngle=r.direction,r.depth=i(t,`obj_sneo_phonehand_master`).depth-1,r.grazepoints=7,r.element=6),Le(e,r)}t.destroy(e)},draw:(e,t)=>{t.drawSelf(e),f(e.flashtimer,0)&&--e.flashtimer,t.drawSpriteFog(e.sprite,e.imageIndex,e.x-2,e.y-2,e.imageXscale,e.imageYscale,0,M.yellow,e.flashtimer/5)}}};return[u,l,d,p]}var vi=(e,t,n)=>T(e,t)?e:f(e,t)?Math.max(e-n,t):Math.min(e+n,t);function yi(e,t){e.inst=t.id,t.imageXscale=2,t.imageYscale=2}function bi(e){let t=(t,n)=>t.first(e(n)),n=(e,n)=>{let r=t(e,n);if(!r)throw Error(`NEO face requires live ${n}`);return r},r=e=>n(e,`obj_spamton_neo_enemy`),a={name:`obj_sneo_faceattack`,index:634,parent:e(`obj_basicbullet_sneo`),depth:0,hooks:{ringsShots:e=>T(e.init,1)},events:{create:e=>{B(e),Object.assign(e,{element:6,type:0,timer:0,hp:16,init:0,imageSpeed:0,imageIndex:0,imageAlpha:0,broken:0}),yi(e,e),Object.assign(e,{blend:o(M.green,M.lime,.5),invincibilitytimer:0,hurtflashtimer:0,shootflashtimer:0,explodetimer:0,laserinit:0,noseinit:0,eyesinit:0,boss:1,destroytarget:0,blue_col:o(15245824,M.aqua,.25),intro_timer:0,first_time:!1,smashspeed:25,growtangle_x:0,heart_recoil:0,special:0})},user0:(e,n)=>{if(n.first(a)?.id!==e.id){e.boss=0;return}e.boss=1;let r=t(n,`obj_spamton_neo_enemy`);r?(e.eyeshp=r.eyeshp,e.nosehp=r.nosehp,e.mouthhp=r.mouthhp,T(r.facebroken,1)&&(e.eyeshp=-1,e.nosehp=-1,e.mouthhp=-1)):(e.eyeshp=16,e.nosehp=16,e.mouthhp=16);for(let[t,r,i]of[[`eyes`,`eyeshp`,1],[`nose`,`nosehp`,2],[`mouth`,`mouthhp`,3]]){let o=n.create(a,e.x,e.y);e[t]=o.id,o.hp=e[r],o.type=i,o.target=e.target,o.damage=e.damage,o.first_time=e.first_time}},user2:(e,t)=>{let n=0,r=0;if(T(e.type,1)&&(n=62,r=32),T(e.type,2)&&(n=34,r=64),T(e.type,3)&&(n=52,r=102),!T(e.type,0)){let i=t.create(s,e.x+n,e.y+r);e.targ=i.id,i.depth=e.depth-999}},step:(t,r)=>{if(T(t.init,0)&&(T(t.type,0)&&(t.sprite=`spr_spamtonneo_faceAttack_face`),T(t.type,1)&&(t.sprite=`spr_spamtonneo_faceAttack_eyes`),T(t.type,2)&&(t.sprite=`spr_spamtonneo_faceAttack_nose`),T(t.type,3)&&(t.sprite=`spr_spamtonneo_faceAttack_mouth`),t.first_time||r.userEvent(t,2),O(t.type,1)&&(t.imageIndex=1,_(t.hp,0)&&(t.broken=1,t.imageIndex=2)),T(t.type,0)&&(t.depth+=10),t.init=1,t.first_time&&(t.imageAlpha=1,t.xstart=t.x,t.growtangle_x=n(r,`obj_growtangle`).x,t.x=r.view.x+730)),t.first_time){if(T(t.intro_timer,0)&&(t.x-=t.smashspeed,t.smashspeed+=.5,U(t.x,t.xstart)&&(t.intro_timer=15,T(t.type,0)&&(r.create(e(`obj_shake`),t.x,t.y),R(r,`snd_closet_impact`)))),f(t.intro_timer,0)){if(--t.intro_timer,T(t.intro_timer,0)){if(t.first_time=!1,t.x=t.xstart,T(t.type,0)){t.intro_timer=-1;for(let n of r.all(e(`obj_growtangle`)))n.x=t.growtangle_x}r.userEvent(t,2)}else if(t.x=t.xstart-Math.sin(Math.PI*(t.intro_timer/15))*20,T(t.type,0))for(let n of r.all(e(`obj_growtangle`)))n.x=t.growtangle_x-Math.sin(Math.PI*(t.intro_timer/15))*20}if(t.first_time)return}if(T(t.broken,1)&&!T(t.type,0)&&T(t.destroytarget,0)){let e=r.byId(t.targ);e&&r.destroy(e),t.destroytarget=1}if(t.timer+=1,U(t.imageAlpha,1)&&f(r.globals.turntimer,21)&&(t.imageAlpha+=.1),f(t.explodetimer,0)){let e=0,n=0;if(T(t.type,1)&&(e=58,n=32),T(t.type,2)&&(e=30,n=64),T(t.type,3)&&(e=48,n=102),T(t.explodetimer%2,0)){let i=t.y+n-25+r.random.random(50),a=t.x+e-25+r.random.random(50),o=r.create(c,a,i);t.cres=o.id,o.depth=t.depth-100}--t.explodetimer}let o=0;for(let e of r.all(a))T(e.broken,1)&&(o+=1);if(T(t.type,1)&&T(t.broken,0)){if(T(t.timer,30)||T(t.laserinit,0)){t.brokenmod=o,t.lasex=-10+t.x+56,t.lasey=t.y+32;let e=n(r,`obj_heart`);t.laserdir=i(t.lasex,t.lasey,e.x+10,e.y+10),t.laserinit=1}if(O(t.timer,30)&&T(t.timer%3,0)&&f(r.globals.turntimer,21)){let e=r.create(l,t.lasex,t.lasey);t.laser=e.id,Le(t,e),e.my_angle=t.laserdir,T(t.brokenmod,2)&&(e.my_angle=t.laserdir+t.brokenmod*r.random.randomRange(-8,8)),e.my_speed=7,e.my_accel=t.brokenmod*.25,e.imageYscale=2,e.my_angle_change=0,e.target=t.target,e.damage=t.damage,e.element=6,t.shootflashtimer=3}T(t.timer,50)&&(t.timer=t.brokenmod*5)}if(T(t.type,2)&&T(t.broken,0)){if(O(t.timer,70)&&T(t.noseinit,0)&&(t.brokenmod=o,t.noseinit=1),O(t.timer,80)&&T(t.timer%5,0)){let n=r.random.randomRange(-2,2);for(let i=0;i<3;i++){let a=r.create(e(`obj_regularbullet`),t.x,t.y);t.bullet=a.id,Le(t,a),a.sprite=`spr_spamtonneo_faceAttack_nose_bullet`,a.mask=`spr_spamtonneo_faceAttack_nose_bullet_mask`,yi(t,a),a.gravity=.6,a.gravityDirection=180,a.friction=.4,a.vspeed=-4+i*4.5,T(t.brokenmod,2)&&(a.vspeed+=n),a.hspeed=-3,a.target=t.target,a.damage=t.damage,a.element=6,t.shootflashtimer=3}}T(t.timer,90)&&(t.timer=26+t.brokenmod*10)}if(T(t.type,3)&&T(t.broken,0)){if(O(t.timer,10)&&T(t.eyesinit,0)&&(t.eyesinit=1,t.brokenmod=o),O(t.timer,10)&&(t.imageIndex=3),O(t.timer,10)&&T(t.timer%6,0)){let i=r.create(e(`obj_regularbullet`),t.x+30,t.y+98);t.bullet=i.id,i.sprite=`spr_spamtonneo_faceAttack_wisp`,Le(t,i),i.hspeed=r.random.randomRange(-4,-7),i.vspeed=r.random.randomRange(6,-2),O(n(r,`obj_heart`).y,n(r,`obj_growtangle`).y)&&(i.vspeed+=1),i.gravity=-.2,i.target=t.target,i.damage=t.damage,i.element=6,t.shootflashtimer=3}T(t.timer,42)&&(t.imageIndex=1,t.timer=-40+t.brokenmod*20)}(T(t.type,1)||T(t.type,2))&&T(t.broken,1)&&(t.imageIndex=2),T(t.type,3)&&T(t.broken,1)&&(t.imageIndex=4)},endStep:(e,t)=>{if(!T(e.type,0)||T(e.intro_timer,0)&&T(e.heart_recoil,0))return;let r=n(t,`obj_heart`),i=n(t,`obj_growtangle`),a=t.spriteWidth(i);T(e.intro_timer,-1)?(_(r.x,i.x-a/2+4)&&(e.heart_recoil=10),e.intro_timer=0):f(e.intro_timer,0)&&T(e.heart_recoil,0)&&f(e.intro_timer,7)&&O(r.x,i.x+a/2-24)&&(e.heart_recoil=(e.intro_timer-8)/7*-10),T(e.heart_recoil,0)||(r.x+=e.heart_recoil,e.heart_recoil=vi(e.heart_recoil,0,1)),r.x=Math.min(Math.max(r.x,i.x-a/2+2),i.x+a/2-24)},draw:(e,t)=>{if(!T(e.init,1))return;for(let[n,i,a]of[[1,`eyeshp`,2],[2,`nosehp`,2],[3,`mouthhp`,4]])T(e.type,n)&&f(r(t)[i],0)&&(e.imageBlend=o(M.purple,e.blue_col,r(t)[i]/16)),T(e.type,n)&&(U(r(t)[i],1)||T(e.imageIndex,a))&&(e.imageBlend=M.white);f(e.shootflashtimer,0)&&(e.imageBlend=M.yellow,--e.shootflashtimer),f(e.hurtflashtimer,0)&&(e.imageBlend=M.red,--e.hurtflashtimer);let n=0;f(e.invincibilitytimer,0)&&([10,9,6,5,3,2].some(t=>T(e.invincibilitytimer,t))&&(n=1),--e.invincibilitytimer,e.imageBlend=M.red),T(n,0)&&t.drawSelf(e),t.drawSprite(`spr_battlebg_0`,0,e.x-3,e.y+70,2.4,2,0,e.blend,1)},destroy:(n,i)=>{if(T(n.boss,1)){let n=r(i);if(_(n.eyeshp,0)&&_(n.nosehp,0)&&_(n.mouthhp,0)&&t(i,`obj_spamton_neo_enemy`))for(let t of i.all(e(`obj_spamton_neo_enemy`)))Object.assign(t,{eyeshp:16,nosehp:16,mouthhp:16,facebroken:2})}for(let e of i.all(s))i.destroy(e)}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>{if(T(e.type,0)||U(e.imageAlpha,.9))return;if(T(e.broken,1)){R(n,`snd_bell`),n.userEvent(t,0);return}if(f(e.invincibilitytimer,0)&&T(t.big,0)){n.destroy(t);return}e.shake=6;let i=1;T(t.big,0)||(i=T(r(n).hellmode,1)?2:4);let a=r(n);T(e.type,1)&&(a.eyeshp-=i),T(e.type,2)&&(a.nosehp-=i),T(e.type,3)&&(a.mouthhp-=i),R(n,`snd_damage`),e.invincibilitytimer=10,e.hurtflashtimer=3,(T(e.type,1)&&_(a.eyeshp,0)||T(e.type,2)&&_(a.nosehp,0)||T(e.type,3)&&_(a.mouthhp,0))&&(e.broken=1,e.imageIndex=2,R(n,`snd_rocket`),e.explodetimer=16),n.userEvent(t,0)}}]},s={name:`obj_sneo_faceattack_target`,index:675,sprite:`spr_boxing_crescent`,visible:!1,depth:0,events:{create:e=>{e.imageSpeed=0,e.imageXscale=.4,e.imageYscale=.4,e.imageBlend=M.red}}},c={name:`obj_boxing_crescent`,index:837,sprite:`spr_boxing_crescent`,depth:0,events:{create:e=>{e.imageSpeed=.5,e.imageXscale=2,e.imageYscale=2,e.timer=0},step:(e,t)=>{O(e.imageIndex,3)&&t.destroy(e)}}},l={name:`obj_werewire_bullet_lasercircle`,index:479,parent:e(`obj_regularbullet`),sprite:`spr_bullet_laser_circle`,depth:0,events:{create:e=>{B(e),Object.assign(e,{grazepoints:3,destroyonhit:0,imageXscale:0,imageYscale:0,timer:0,tri:1,tri_angle:20,my_angle:180,my_speed:4,my_accel:0,my_length:1,my_angle_change:0,part_count:0,siner:0,m:2,parent:-1})},step:(e,n)=>{if(!T(e.parent,-1)){let t=n.byId(e.parent);t&&(e.x=t.x-32,e.y=t.y)}if(e.siner+=.5,e.timer+=1,_(e.timer,6/e.m)&&(e.imageXscale+=.4*e.m,e.imageYscale+=.4*e.m),f(e.timer,6/e.m)&&_(e.timer,e.my_length+3)){let r=n.create(u,e.x,e.y);e.laser=r.id,Le(e,r),e.imageXscale-=Math.sin(e.siner*1.3*e.m)*.2,e.imageYscale-=Math.sin(e.siner*1.3*e.m)*.2,r.imageAngle=e.my_angle,r.speed=e.my_speed,r.direction=e.my_angle,r.friction=-e.my_accel,r.imageYscale=1,r.my_angle_change=e.my_angle_change;let i=!!t(n,`obj_spamton_neo_enemy`);r.sprite=i?`spr_bullet_laser_square_sneo`:`spr_bullet_laser_square`,T(e.timer,3)&&(r.sprite=i?`spr_bullet_laser_front_sneo`:`spr_bullet_laser_front`),T(e.timer,e.my_length+3)&&(r.sprite=i?`spr_bullet_laser_front_sneo`:`spr_bullet_laser_front`,r.imageIndex=1)}else e.imageXscale-=.1*e.m,e.imageYscale-=.1*e.m,_(e.imageXscale,0)&&_(e.imageYscale,0)&&n.destroy(e)}}},u={name:`obj_werewire_bullet_lasersquare`,index:478,parent:e(`obj_regularbullet`),sprite:`spr_bullet_laser_square`,depth:0,events:{create:e=>{B(e),Object.assign(e,{destroyonhit:0,grazepoints:2,init_con:0,init_timer:0,circle_size:1,imageXscale:2,imageYscale:3,imageSpeed:0,my_angle_change:0,m:2,stretch:1})},step:(e,t)=>{T(e.stretch,1)&&(e.imageXscale=2+e.speed/(10*e.m)),_(e.x,-100)&&t.destroy(e),e.direction+=e.my_angle_change,e.imageAngle=e.direction}}};return[a,s,c,l,u]}var xi=(e,t,n)=>T(e,t)?e:f(e,t)?Math.max(e-n,t):Math.min(e+n,t);function Si(e){let t=(t,n)=>t.first(e(n)),n=(e,n)=>{let r=t(e,n);if(!r)throw Error(`NEO lasers require live ${n}`);return r},r={name:`obj_sneo_biglaser`,index:637,parent:e(`obj_collidebullet`),sprite:`spr_sneo_laser`,depth:0,events:{create:(e,n)=>{B(e),Object.assign(e,{element:6,destroyonhit:0,active:0,imageYscale:.05,imageXscale:0,mask:`spr_nothing`,firecon:0,effecttimer:0,siner:0,orbsize:0}),n.create(i,e.x,e.y),n.create(a,e.x,e.y);let r=t(n,`obj_spamton_neo_enemy`);r&&(e.damage=n.globals.monsterat[r.myself]*5);let o=t(n,`obj_sneo_bulletcontroller`);o&&(e.target=o.target),e.grazepoints=10,e.grazed=1,e._type=0},step:(e,t)=>{n(t,`obj_spamton_neo_enemy`).difficulty},draw:(t,n)=>{if(T(t.firecon,0)){if(t.imageYscale=.001,t.imageXscale=2,_(t.effecttimer,42)&&T(t.effecttimer%6,0)){let r=T(t._type,1)?3:6,i=T(t._type,1)?120:60;for(t.i=0;t.i<r;t.i+=1){let r=n.create(e(`obj_rouxls_power_up_orb`),t.x,t.y);t.d=r.id,r.direction=n.random.irandom(i)+t.i*i,r.lifetime=16,r.depth=t.depth+1,r.imageBlend=t.imageBlend,r.parenttarget=t.id,r._type=t._type}}f(t.effecttimer,50)?t.orbsize-=4:t.orbsize+=1,n.drawState.color=M.white,n.drawCircle(t.x,t.y,Math.max(2,t.orbsize/2+Math.sin(t.siner/2)*2)),t.effecttimer+=1,t.siner+=1}else T(t.firecon,1)?(t.active=!0,t.mask=`spr_sneo_laser`,U(t.imageYscale,.5)?t.imageYscale=xi(t.imageYscale,.5,.1):t.imageYscale-=.05,n.drawState.color=M.white,n.drawCircle(t.x,t.y,t.imageYscale*100),n.drawSelf(t)):T(t.firecon,2)&&(n.drawState.color=M.white,t.active=0,t.mask=`spr_nothing`,_(t.imageYscale,.01)?t.imageYscale-=.0025:t.imageYscale=xi(t.imageYscale,.01,.1),_(t.imageYscale,0)&&n.destroy(t),n.drawCircle(t.x,t.y,t.imageYscale*100),n.drawSelf(t))},destroy:(e,t)=>{for(let e of t.all(a))t.destroy(e)}},collisions:[{target:e(`obj_heart`),run:()=>{}},{target:e(`obj_sneo_lilguy`),run:()=>{}}]},i={name:`obj_sneo_biglaser_friendlyhitbox`,index:684,parent:e(`obj_bulletparent`),sprite:`spr_sneo_laser_friendly`,depth:0,events:{create:e=>{e.source=637,e.imageBlend=M.red,e.depth=-99999999,e.visible=!1},endStep:(e,t)=>{let n=e.source===637?r:s(t,e.source),i=n?t.first(n):t.byId(e.source);i?(e.x=i.x,e.y=i.y,e.imageXscale=i.imageXscale,e.imageYscale=Math.max(i.imageYscale-.25,0),e.imageAngle=i.imageAngle,e.direction=i.direction):t.destroy(e)}},collisions:[{target:e(`obj_sneo_lilguy`),run:()=>{}}]},a={name:`obj_sneo_arm_laser_telegraph`,index:671,depth:0,events:{create:e=>{e.laserflash=0},draw:()=>{},step:(e,i)=>{T(n(i,`obj_spamton_neo_enemy`).partmode,3)||i.destroy(e);let a=i.first(r);a&&(e.depth=a.depth+1);let o=t(i,`obj_heart`);o&&(e.depth=o.depth+1)}}},o={name:`obj_spamtonshot`,index:598,parent:e(`obj_basicbullet_sneo`),sprite:`spr_sneo_bullet1`,depth:0,events:{create:(e,n)=>{let r=t(n,`obj_sneo_heartattack`);if(r&&U(r.heart_health,1)){n.destroy(e);return}B(e),Object.assign(e,{element:6,f:2,con:0,mode:1,dontexplode:0,destroyable:0,imageXscale:1,imageYscale:1,siner:0,fluffyguarddestroysthis:0,targetx:n.view.x+n.view.width/2,targety:n.view.y+n.view.height/4});let i=t(n,`obj_heart`);i&&(e.targetx=i.x,e.targety=i.y),c(e,e.targetx,e.targety,5),e.angle_speed=0,e.grazepoints=4;let a=t(n,`obj_sneo_bulletcontroller`);a&&(e.target=a.target)},step:(r,i)=>{let a=t(i,`obj_spamton_neo_enemy`);a&&(r.damage=i.globals.monsterat[a.myself]*5),U(i.globals.turntimer,1)&&i.destroy(r),r.dontexplode=1;let o=t(i,`obj_heart`),s=t(i,`obj_sneo_lilguy`);if(r.depth=o?o.depth+(f(r.y,i.view.y+280)?100:2):s?s.depth-1:n(i,`obj_heart`).depth+2,T(r.con,0)&&(r.siner+=r.f,r.imageXscale=.5+Math.sin(r.siner/4)*.1*r.f,r.imageYscale=.5+Math.sin(r.siner/4)*.1*r.f,O(r.siner,30)&&T(r.dontexplode,0)&&(r.con=1)),T(r.con,1)&&(r.imageXscale-=.05*r.f,r.imageYscale-=.05*r.f,_(r.imageXscale,0)&&_(r.imageYscale,0))){r.uniformangleoff=i.random.random(360),r.uniformanglespeed=-1+i.random.random(2),r.shotamount=20,r.off=0;let t=P(r,`shot`);for(r.i=0;r.i<r.shotamount;r.i+=1){let n=i.create(e(`obj_basicbullet_sneo`),r.x,r.y);t[r.i]=n.id,T(r.off,0)?(n.destroyable=1,n.imageBlend=M.yellow,r.off=1):r.off=0,n.speed=r.f,n.friction=-.05*r.f,T(r.mode,1)&&(n.angle_speed=r.uniformanglespeed),T(r.mode,5)&&(n.angle_speed=-2+i.random.random(4)),n.imageXscale=1.5,n.imageYscale=1.5,n.sprite=`spr_sneo_bullet_arrow`}i.destroy(r)}}}},s=(e,t)=>e.instances.find(e=>e.object.index===t)?.object;return[r,i,a,o]}var Q=(e,t,n)=>e+(t-e)*n,$=(e,t,n)=>Math.max(t,Math.min(n,e)),Ci=(e,t,n)=>T(e,t)?0:(n-e)/(t-e),wi=(e,t,n)=>T(e,t)?e:f(e,t)?Math.max(e-n,t):Math.min(e+n,t);function Ti(e){let n=e(`obj_basicbullet_sneo`),r=e(`obj_regularbullet`),a=D(n,`create`),s=D(r,`create`),l=D(r,`step`),u=(t,n)=>t.first(e(n)),p=(e,t)=>{let n=u(e,t);if(!n)throw Error(`NEO finale requires ${t}`);return n},m=(t,n,r)=>{for(let i of t.withInstances(e(n)))i.live&&r(i)},h=(t,n,r,i=t.x,a=t.y,o=`d`)=>{let s=n.create(e(r),i,a);return t[o]=s.id,s},g=(e,t)=>{let n=u(t,`obj_spamton_neo_enemy`),r=u(t,`obj_sneo_bulletcontroller`);n&&(e.damage=Math.floor(t.globals.monsterat[n.myself]*5/3)),r&&(e.target=r.target),e.grazepoints=4},v=(e,t)=>{T(e.active,1)&&(m(t,`obj_spamton_neo_enemy`,e=>t.userEvent(e,2)),T(e.destroyonhit,1)&&t.destroy(e))},y=(t,n,r)=>{let i=u(n,`obj_shake`);i?t.d=e(`obj_shake`).index:i=h(t,n,`obj_shake`,0,0),m(n,`obj_shake`,e=>{e.shakex=Math.ceil(r),e.shakey=Math.ceil(r)})},b={name:`obj_basicbullet_sneo_finale`,index:599,parent:n,sprite:`spr_sneo_bullet0`,depth:0,events:{create:(e,t)=>{B(e),Object.assign(e,{element:6,f:2,destroyable:0,angle_speed:0,destroypoints:1,grazepoints:4});let n=u(t,`obj_spamton_neo_enemy`),r=u(t,`obj_sneo_bulletcontroller`);n&&(e.damage=t.globals.monsterat[n.myself]*5),r&&(e.target=r.target)},step:(e,t)=>{(O(e.x,t.room.width+100)||_(e.x,-100)||O(e.y,t.room.height+100)||_(e.y,-100))&&t.destroy(e),e.direction+=e.angle_speed,e.imageAngle=e.direction},user5:(e,t)=>{T(e.active,1)&&(T(e.target,3)||ae(e,t),T(e.target,3)&&oe(e,t),T(e.destroyonhit,1)&&t.destroy(e))}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>{if(T(e.destroyable,1)){T(t.big,0)&&n.userEvent(t,0);let r=h(e,n,`obj_yshot_anim`,e.x,e.y,`anim`);r.imageXscale=e.imageXscale,r.imageYscale=e.imageYscale,r.sprite=`spr_yheart_shot_hit3`,n.destroy(e)}else T(e.destroyable,-1)&&n.userEvent(t,0)}}]},S={name:`obj_finale_growtangle`,index:652,parent:e(`obj_bulletparent`),sprite:`spr_battlebg_0`,mask:`spr_battlebg_0`,depth:0,events:{create:(e,t)=>{Object.assign(e,{imageXscale:0,imageYscale:0,imageAlpha:.3,maxtimer:15,timeincrease:1,timer:14,growcon:1,imageSpeed:0,imageBlend:o(M.green,M.lime,.5),target_angle:0,fullgrow:0,keep:0,megakeep:0});let n=p(t,`obj_growtangle`);e.maxxscale=n.maxxscale,e.maxyscale=n.maxyscale,e.sprite=n.spr_custom_box,n.depth-=2,e.depth=n.depth+1},step:(e,t)=>{if(e.growth=0,U(e.timer,e.maxtimer*5)&&T(e.growcon,1)&&(e.growth=1),f(e.timer,0)&&T(e.growcon,3)&&(e.growth=1),T(e.growth,1)){T(e.growcon,1)&&(e.timer+=e.timeincrease),e.timeincrease+=.025,T(e.growcon,3)&&--e.timer,e.imageXscale=e.maxxscale*e.timer/e.maxtimer,e.imageYscale=e.maxyscale*e.timer/e.maxtimer,e.imageAngle=180+180*e.timer/e.maxtimer+e.target_angle,e.imageAlpha=Math.min(1,.5+e.timer/e.maxtimer*.5);let n=h(e,t,`obj_afterimage`);n.sprite=e.sprite,n.imageXscale=e.imageXscale/(e.maxxscale/2),n.imageYscale=e.imageYscale/(e.maxyscale/2),n.imageAngle=e.imageAngle,n.depth=e.depth-3,T(e.growcon,1)&&T(e.timer,e.maxtimer)?(n.imageXscale=e.imageXscale,n.imageYscale=e.imageYscale,n.sprite=p(t,`obj_growtangle`).sprite,n.imageBlend=M.white,--n.depth,n.imageAlpha=1):(n.imageBlend=e.imageBlend,n.imageAlpha=(1-e.timer/(e.maxtimer*5))*.5+.1),n.imageSpeed=0,O(e.timer,e.maxtimer*5)&&T(e.growcon,1)&&(e.growcon=2,e.imageAngle=e.target_angle),T(e.growcon,3)&&_(e.timer,e.maxtimer)&&(t.globals.turntimer=0,t.destroy(e))}},draw:(e,t)=>{t.drawSprite(`spr_battlebg_stretch`,1,e.x,e.y,e.imageXscale,e.imageYscale,e.imageAngle,e.imageBlend,e.imageAlpha),t.drawSprite(e.sprite,0,e.x,e.y,e.imageXscale/(e.maxxscale/2),e.imageYscale/(e.maxyscale/2),e.imageAngle,e.imageBlend,e.imageAlpha)}}},C={name:`obj_sneo_warped_box`,index:612,parent:e(`obj_bulletparent`),sprite:`spr_battlebg_0`,depth:0,events:{create:(e,t)=>{let n=p(t,`obj_growtangle`);e.depth=n.depth,n.imageAlpha=0,Object.assign(e,{minx:n.x-t.spriteWidth(n)/2,maxx:n.x+t.spriteWidth(n)/2,miny:n.y-t.spriteHeight(n)/2,maxy:n.y+t.spriteHeight(n)/2,suckx:n.x+100,upper_sucky:n.y-40,lower_sucky:n.y+40,suckpower:0,timer:0,snapback:0,target:0,state:0,inhale:0,inhalespeed:0,intro:0,stopthesucc:0}),m(t,`obj_battlesolid`,e=>{e.imageXscale=3,e.imageYscale=3})},destroy:(e,t)=>{m(t,`obj_growtangle`,e=>{e.imageAlpha=1,e.keep=1}),m(t,`obj_battlesolid`,e=>{e.imageXscale=2,e.imageYscale=2})},draw:(e,t)=>{let n=t.drawState.color;f(e.inhalespeed,0)&&U(e.inhale,1)&&(e.inhale=$(e.inhale+e.inhalespeed,0,1));let r=Q(e.minx,Q(e.maxx,e.suckx,e.suckpower)-8,e.inhale),i=Q(e.maxy,Q(e.maxy,e.lower_sucky,e.suckpower)+8,e.inhale),a=Q(e.miny,Q(e.miny,e.upper_sucky,e.suckpower)-8,e.inhale);t.drawState.color=49152,t.drawState.alpha=e.imageAlpha,t.drawTriangle(r,a,Q(e.maxx,e.suckx,e.suckpower),Q(a,e.upper_sucky,e.suckpower),Q(e.maxx,e.suckx,e.suckpower),Q(i,e.lower_sucky,e.suckpower)),t.drawTriangle(r,a,r,i,Q(e.maxx,e.suckx,e.suckpower),Q(i,e.lower_sucky,e.suckpower)),t.drawState.color=M.black,t.drawTriangle(r+4,a+4,Q(e.maxx-4,e.suckx-4,e.suckpower),Q(a+4,e.upper_sucky+3,e.suckpower),Q(e.maxx-4,e.suckx-4,e.suckpower),Q(i-4,e.lower_sucky-3,e.suckpower)),t.drawTriangle(r+4,a+4,r+4,i-4,Q(e.maxx-4,e.suckx-4,e.suckpower),Q(i-4,e.lower_sucky-3,e.suckpower)),t.drawState.color=n,t.drawState.alpha=1,T(e.state,1)?(O(e.timer,60)&&--e.timer,e.suckpower=O(e.timer,59)?e.timer/60:K(e.timer/60,3)):T(e.state,2)&&(f(e.timer,30)&&(e.timer=30),T(e.snapback,0)&&(e.snapback=-1),f(e.timer,0)&&--e.timer,e.suckpower=K(e.timer/30,-2))},endStep:(e,t)=>{let n=u(t,`obj_heart`);if(!n)return;if(T(e.state,0)){U(n.x,e.minx+3)&&(n.x=e.minx+3),U(n.y,e.miny+3)&&(n.y=e.miny+3),f(n.y,e.maxy-20)&&(n.y=e.maxy-20),f(n.x,e.maxx-20)&&(n.x=e.maxx-20);return}if(e.rborder=Q(e.maxx,e.suckx,e.suckpower),e.uborder=e.miny,e.dborder=e.maxy,T(e.snapback,0)&&T(e.stopthesucc,0)&&(n.x+=e.suckpower),_(e.snapback,0)&&_(t.globals.turntimer,30)&&O(n.x,e.rborder-22)&&(e.snapback=e.suckpower,f(e.suckpower,.5)&&!u(t,`obj_shake`))){let n=h(e,t,`obj_shake`,0,0);n.shakex=Math.ceil(e.suckpower*4),n.shakey=Math.ceil(e.suckpower*4)}f(e.snapback,0)&&(n.x-=20*K(e.snapback,2),e.snapback-=.1),U(n.x,e.minx+3)&&(n.x=e.minx+3),f(n.x,e.rborder-20)&&(n.x=e.rborder-20);let r=(n.x-(e.minx+3))/(e.rborder-20-(e.minx+3)),i=(e.upper_sucky-e.miny)*r*e.suckpower,a=(e.maxy-e.lower_sucky)*r*e.suckpower;U(n.y,e.uborder+3+i)&&(n.y=e.uborder+3+i),f(n.y,e.dborder-20-a)&&(n.y=e.dborder-20-a),U(n.y,e.uborder+3)&&(n.y=e.uborder+3),f(n.y,e.dborder-20)&&(n.y=e.dborder-20)}}},w=e=>!!e.destroyable&&T(e.state,0)||T(e.state,1)&&U(e.formtimer,30),E=(e,t,n,r)=>{n.userEvent(t,0),r||m(n,`obj_sneo_final_forme`,e=>{e.hurtalpha=1});let i=u(n,`obj_sneo_final_forme`);if((!i||w(i))&&(R(n,`snd_damage`),i&&(m(n,`obj_sneo_final_forme`,e=>{e.hurtalpha=1}),T(e.destroyable,1)))){let i=r?p(n,`obj_sneo_final_forme`):e;T(t.big,0)?(i.x+=r?7:6,i.formtimer+=r?5:4):(i.pushback=r?13:10,i.formtimer+=r?13:10)}},ee={name:`obj_sneo_final_forme_mouth_back`,index:41,sprite:`spr_sneo_final_forme`,depth:0,events:{create:e=>{e.imageIndex=7},endStep:(e,t)=>{let n=u(t,`obj_sneo_final_forme`);n&&(e.x=n.x+n.headoffset_x,e.y=n.y+n.headoffset_y)}}},k={name:`obj_sneo_final_forme_hitbox`,index:644,parent:n,sprite:`spr_sneo_final_forme_hitbox`,visible:!1,depth:0,events:{create:(e,t)=>{a(e,t),e.destroyonhit=!1,e.parent=643},endStep:(e,t)=>{let n=u(t,`obj_sneo_final_forme`);n&&(e.parent=643,e.x=n.x,e.y=n.y),u(t,`obj_sneo_lastattack`)&&t.destroy(e)}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>E(e,t,n,!0)}]};return[b,S,C,{name:`obj_sneo_final_forme`,index:643,parent:b,sprite:`spr_sneo_final_forme`,depth:0,hooks:{pullsShots:e=>[e.x+122,e.y+146]},events:{create:(e,t)=>{b.events.create(e,t),e.element=6,g(e,t),Object.assign(e,{steptimer:0,stepping:!0,pushback:0,advancespeed:3,imageSpeed:0,mouthopen:!1,destroyonhit:0,introtimer:0,intro:0,mouthx:90,mouthy:142}),t.create(k,e.x,e.y),Object.assign(e,{state:0,formtimer:0,stepdir:-1,made:0,fakeheart:-4,fakeheart_speed:0,effecttimer:0,lerptimer:0,inhalesfx:0,hurtalpha:0,bullet_suck_x1:20,bullet_suck_x2:130,bullet_suck_y1:100,bullet_suck_y2:190,movetimer:0,moveframes:12,movecon:0,timer2:0,timer3:0,headoffset_x:0,headoffset_y:0,dmgcon:0});let n=t.create(ee,e.x,e.y);e.back=n.id,n.depth=e.depth+1;let r=u(t,`obj_heart`);r&&(n.depth=r.depth+1),e.hidemouthback=0,e.playback_sprite=`spr_sneo_playback`},destroy:(e,t)=>{m(t,`obj_sneo_hitdetector`,e=>{e.active=!0}),m(t,`obj_sneo_final_forme_mouth_back`,e=>t.destroy(e))},user5:v,draw:(e,t)=>{m(t,`obj_sneo_final_forme_mouth_back`,t=>{T(e.imageIndex,5)&&T(e.hidemouthback,0)?(t.imageIndex=7,t.x=e.x+e.headoffset_x,t.y=e.y+e.headoffset_y,t.visible=!0):t.visible=!1});let n=U(e.state,2)?.15:.05;if(t.drawSprite(e.sprite,3,e.x,e.ystart-Math.abs(Math.sin(e.steptimer+n)*40),1,1,0,e.imageBlend,1),!T(e.imageAngle,0))t.drawSprite(`spr_sneo_final_forme_head_rotate_origin`,e.imageIndex,e.x+138+e.headoffset_x,e.y+135+e.headoffset_y,e.imageXscale,e.imageYscale,e.imageAngle,M.white,1);else if(O(e.state,2)&&U(e.state,10)||T(e.state,11)&&O(e.formtimer,30)&&_(e.formtimer,70)){let r=T(e.state,3)?2:1,i=t.random.randomRange(-r,r),a=t.random.randomRange(-r,r);t.drawSprite(e.sprite,e.imageIndex,e.x+a,e.ystart-Math.abs(Math.sin(e.steptimer+n)*40+i))}else t.drawSprite(e.sprite,e.imageIndex,e.x+e.headoffset_x,e.y+e.headoffset_y,e.imageXscale,e.imageYscale,e.imageAngle,e.imageBlend,e.imageAlpha);w(e)&&(f(e.hurtalpha,0)&&(e.hurtalpha-=.1),t.drawSprite(e.sprite,e.imageIndex,e.x,e.y,1,1,0,M.yellow,e.hurtalpha)),T(e.intro,0)||(e.imageIndex=4,e.introtimer+=1,e.imageBlend=o(M.black,M.white,$((e.introtimer/30-.5)/1.5,0,1)),t.drawSprite(e.sprite,2,e.x,e.y,1,1,0,T(e.intro,1)?o(M.black,M.white,$(e.introtimer/30,0,1)):M.white,1),O(e.introtimer,68)&&(e.intro=0,e.imageIndex=4,e.imageAlpha=1,e.imageBlend=M.white))},step:(n,r)=>{if(u(r,`obj_sneo_final_forme_hitbox`)||r.create(k,n.x,n.y),T(n.intro,1))return;n.formtimer+=1,T(n.grazed,1)&&(n.grazetimer+=1,O(n.grazetimer,30)&&(n.grazetimer=0,n.grazed=0));let i=()=>p(r,`obj_growtangle`),a=()=>p(r,`obj_sneo_warped_box`),o=()=>p(r,`obj_heart`),s=(e,t)=>{let o=a();o.suckx=Math.min(i().x+150,n.x+106);let s=$(Ci((e?r.view.x:0)+520,i().x+100,n.x),0,1)*60;o.timer=t?wi(o.timer,s,2):s,o.upper_sucky=n.y+129,o.lower_sucky=n.y+159};if(U(n.state,2)){if(T(n.state,0)&&(n.stepdir=-1),T(n.state,0)&&O(n.formtimer,25)&&(n.steptimer+=.05),O(n.steptimer,Math.PI)&&(n.steptimer-=Math.PI,y(n,r,2),R(r,`snd_screenshake`),T(n.state,1)&&(n.stepdir=1)),T(n.state,11)&&O(n.formtimer,65)||(n.y=n.ystart-Math.sin(n.steptimer)*40),T(n.state,0)&&U(n.formtimer,25)||(n.x+=1.6*n.stepdir),(n.destroyable&&T(n.state,0)&&f(n.x,i().x+140)||T(n.state,1)&&U(n.formtimer,30)&&f(n.x,i().x+140))&&(n.x+=4*n.stepdir,n.pushback=0),n.destroyable&&s(!1,!0),f(n.pushback,0)&&(n.x+=n.pushback*2/3,--n.pushback),w(n)){if(T(n.inhalesfx,0)){n.inhalesfx=1,r.soundLoop?.(`snd_sneo_overpower`),r.soundPitch?.(`snd_sneo_overpower`,.1),t(r,`snd_sneo_overpower`,1,90),r.sourceAudio?.volume(`snd_sneo_overpower`,.75,0);let e=h(n,r,`obj_wreckpausespew`,n.x,n.y,`wreck`);e.depth=n.depth-1}if(n.effecttimer+=1,T(n.effecttimer%6,0))for(n.i=0;U(n.i,3);n.i+=1){let e=h(n,r,`obj_rouxls_power_up_orb`,n.x+n.mouthx,n.y+n.mouthy);e.direction=r.random.irandom(40)+n.i*40+120,e.lifetime=12,e.depth=n.depth+1,e.imageBlend=n.imageBlend}}T(n.state,0)&&U(n.x,i().x-r.spriteWidth(i())/2.5)||T(n.state,0)&&f(o().x,n.x+70)?(n.state=10,n.formtimer=0,p(r,`obj_sneo_bulletcontroller`).special+=1,h(n,r,`obj_sneo_fakeheart`,o().x,o().y,`fakeheart`)):T(n.state,0)&&O(n.formtimer,320)?(p(r,`obj_sneo_bulletcontroller`).special+=1,n.state+=1,n.formtimer=45):T(n.state,1)&&O(n.formtimer,45)&&(m(r,`obj_wreckpausespew`,e=>{e.imageIndex=1}),m(r,`obj_sneo_dollar`,e=>{e.fade=1}),n.state+=1,n.formtimer=45,f(n.x,i().x+70)&&(a().state=2),n.imageIndex=4,n.imageAngle=1,r.soundStop?.(`snd_sneo_overpower`),a().stopthesucc=1)}else if(T(n.state,2)&&O(n.formtimer,45))n.state+=1,n.imageIndex=5,n.formtimer=0,n.steptimer=Math.PI-n.steptimer,m(r,`obj_sneo_final_forme_hitbox`,e=>{e.destroyable=!1}),r.globals.turntimer=360;else if(T(n.state,3)){if(T(n.movecon,0)&&(n.movetimer+=1/n.moveframes,n.imageAngle=Zt(n.imageAngle,25,n.movetimer,2),T(n.movetimer,1)&&(n.movetimer=0,n.movecon=1)),T(n.movecon,2)&&(n.timer3+=1,f(n.timer3,20)&&(n.movetimer+=1/n.moveframes,n.imageAngle=Zt(n.imageAngle,-1,n.movetimer,2),n.headoffset_x=Q(0,-12,n.movetimer),n.headoffset_y=Q(0,2,n.movetimer))),U(n.timer2,100)&&(n.timer2+=1),n.x=Q(n.x,r.view.x+439,n.timer2/100),f(n.x,i().x+70)?a().state=2:s(!0,!1),f(n.x,r.view.x+438)&&(n.x=r.view.x+438,n.movecon=2,T(n.movecon,2)&&T(n.movetimer,1))){r.destroy(n);let e=h(n,r,`obj_sneo_lastattack`,n.x,n.ystart-Math.abs(Math.sin(n.steptimer+.15)*40),`aa`);e.yspot[0]=i().y-r.spriteHeight(i())/2-e.y_offset+40,e.yspot[1]=i().y+r.spriteHeight(i())/2-e.y_offset-40,r.globals.turntimer=300}}else if(T(n.state,4)&&O(n.formtimer,25))n.formtimer=0,n.state=5,r.create(e(`obj_sneo_final_orb`),n.x+n.mouthx,n.y+n.mouthy),n.imageIndex=5;else if(T(n.state,10)){n.fakeheart_speed=wi(n.fakeheart_speed,10,1);let e=r.byId(n.fakeheart);if(e){let t=n.x+n.mouthx+5;f(e.x,t-10)&&(t+=20),c(e,t,n.y+n.mouthy,n.fakeheart_speed)}if(a().inhalespeed+=.01,f(n.x,n.x+n.mouthx+10)&&(n.imageIndex=4,r.soundStop?.(`snd_sneo_overpower`)),f(n.formtimer,45)){if(!e)throw Error(`NEO finale requires swallowed soul`);e.speed=0,e.direction=0,n.state=11,n.formtimer=0,n.imageIndex=4,n.hidemouthback=1,r.soundStop?.(`snd_sneo_overpower`),a().imageAlpha=0,a().timer=0,e.state=1,m(r,`obj_sneo_dollar`,e=>{e.fade=1})}}else if(T(n.state,11)){if(U(n.formtimer,15))return;if(U(n.x,r.view.x+438)&&(n.x+=4),f(n.x,r.view.x+438)&&U(n.formtimer,65)&&(n.formtimer=65),T(n.formtimer%5,0)&&O(n.formtimer,30)&&_(n.formtimer,65)){let e=R(r,`snd_hurt1`),t=r.random.randomRange(1.4,2);r.soundPitch?.(e??`snd_hurt1`,t),y(n,r,1),T(n.dmgcon,0)&&(n.dmgcon=1,r.globals.inv=-1,m(r,`obj_spamton_neo_enemy`,e=>r.userEvent(e,2)))}if(T(n.formtimer,50)&&(i().timer=0,i().growcon=1,i().imageAlpha=1),T(n.formtimer,65)&&(a().inhale=0,a().inhalespeed=0,a().imageAlpha=1,i().imageAlpha=0),f(n.x,r.view.x+438)){U(n.formtimer,50)&&(i().timer=0,i().growcon=1,i().imageAlpha=1),n.formtimer=0,n.state=12;let e=r.byId(n.fakeheart);if(!e)throw Error(`NEO finale requires swallowed soul`);e.x=n.x+n.mouthx,e.y=n.y+n.mouthy,e.state=2,n.imageIndex=5}}else T(n.state,12)&&(m(r,`obj_wreckpausespew`,e=>{e.imageIndex=1}),U(n.movetimer,1)&&(n.movetimer+=1/n.moveframes,n.headoffset_x=Q(0,-12,n.movetimer),n.headoffset_y=Q(0,2,n.movetimer)),O(n.formtimer,30)&&O(n.movetimer,1)&&(n.state=2,n.formtimer=0,n.imageIndex=4,r.destroy(n),r.create(e(`obj_sneo_lastattack`),n.x,n.ystart-Math.abs(Math.sin(n.steptimer+.15)*40))));O(n.state,11)&&(n.steptimer+=.05,O(n.steptimer,Math.PI)&&(n.steptimer-=Math.PI,y(n,r,2),R(r,`snd_screenshake`)),n.y=n.ystart-Math.sin(n.steptimer)*40)}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>E(e,t,n,!1)}]},k,ee,{name:`obj_sneo_dollar`,index:645,parent:r,sprite:`spr_spamton_dollar`,depth:0,events:{create:(e,t)=>{s(e,t),Object.assign(e,{element:6,imageAlpha:0,startscale:1,destroyable:0,fade:0}),g(e,t)},draw:(e,t)=>{U(e.imageAlpha,1)&&T(e.fade,0)&&(e.imageAlpha+=.1),t.drawSelf(e)},user5:(e,t)=>{T(e.fade,1)||v(e,t)},step:(e,t)=>{T(e.fade,1)&&(e.imageAlpha-=.1,e.speed=0,_(e.imageAlpha,0)&&t.destroy(e)),l(e,t);let n=u(t,`obj_sneo_final_forme`);if(!n)return;let r=n.x+n.mouthx,a=n.y+n.mouthy;f(e.x,r-50)&&(e.y+=$(a-e.y,-5,5)),U(e.x,r-10)&&(e.direction=i(e.x,e.y,r,a),e.friction=-.1);let o=Q(e.startscale,1,$(Ci(r-200,r-50,e.x),0,1));e.imageXscale=o,e.imageYscale=o,f(e.x,r+50)&&(t.destroy(e),R(t,`snd_swallow`))}}},{name:`obj_sneo_fakeheart`,index:646,parent:e(`obj_bulletparent`),sprite:`spr_yellowheart`,depth:0,events:{create:(e,t)=>{let n=p(t,`obj_heart`);e.depth=n.depth,n.imageAlpha=0,t.globals.inv=300,Object.assign(e,{state:0,heartspeed:14,startangle:0}),n.color=0},destroy:(e,t)=>{_(t.globals.turntimer,0)&&(t.globals.inv=-1),m(t,`obj_heart`,t=>{t.imageAlpha=1,t.x=e.x,t.y=e.y,t.color=1})},draw:(e,t)=>{let n=e.x+9,r=e.y+9,a=i(n,r,e.x,e.y)+e.imageAngle,o=L(n,r,e.x,e.y);e.xx=T(e.imageAngle,0)?e.x:n+x(o,a),e.yy=T(e.imageAngle,0)?e.y:r+A(o,a);let s=p(t,`obj_heart`);!T(e.imageXscale,1)||!T(e.imageYscale,1)?t.drawSprite(e.sprite,s.imageIndex,e.x,e.y,e.imageXscale,e.imageYscale,e.imageAngle,M.white,e.imageAlpha):t.drawSprite(e.sprite,s.imageIndex,e.xx,e.yy,e.imageXscale,e.imageYscale,e.imageAngle,M.white,e.imageAlpha)},endStep:(e,t)=>{let n=()=>p(t,`obj_heart`),r=()=>p(t,`obj_growtangle`);if(T(e.state,0))e.imageAngle-=e.speed*2;else if(T(e.state,1))e.imageAlpha=0,e.imageAngle=0,e.x=r().x+400,e.speed=0,e.direction=0;else if(T(e.state,2)){e.imageAngle+=60,e.imageAlpha=1,e.x-=20;let i=r().x-t.spriteWidth(r())/2+4;_(e.x,i+20)&&(e.x=i,n().x=e.x,n().y=e.y,e.state=3,t.globals.inv=-1,m(t,`obj_spamton_neo_enemy`,e=>t.userEvent(e,2)),m(t,`obj_dmgwriter`,n=>{n.depth=e.depth-2,n.x=p(t,`obj_heroparent`).x,n.y=p(t,`obj_heroparent`).y}),n().color=1,e.imageAngle%=360,U(e.imageAngle,180)&&(e.imageAngle+=360),e.startangle=e.imageAngle,e.heartspeed=8)}else T(e.state,3)&&(n().x+=e.heartspeed,e.x=n().x,e.heartspeed-=1.5,e.imageAngle=Q(e.startangle,0,(e.heartspeed-8)/-8),_(e.heartspeed,0)&&(n().color=1,n().imageAlpha=1,t.destroy(e)))}}},{name:`obj_sneo_lastattack`,index:648,sprite:`spr_sneo_lastattack_head`,depth:0,events:{create:(t,n)=>{let r=p(n,`obj_growtangle`);Object.assign(t,{x_offset:66,y_offset:135,skip_1st_part_hp:12,skip_2nd_part_hp:17,yspot:[r.y-n.spriteHeight(r)/2-135,r.y+n.spriteHeight(r)/2-135,t.y],lastshoty:t.y,rand:80,ycurrent:1,con:0,movetimer:0,shottimer:0,timer:0,count:0,mouthtopy:0,mouthbottomy:0,shotmouthopen:0,shotmouthopentimer:0,mouthangle:0,init:0,remx:t.x,hurtalpha:0}),n.create(e(`obj_sneo_lastattack_hitbox`),t.x,t.y),t.endattack=0,m(n,`obj_wreckpausespew`,e=>{e.imageIndex=2})},destroy:(e,t)=>{m(t,`obj_wreckpausespew`,e=>t.destroy(e))},draw:(e,t)=>{f(e.hurtalpha,0)&&(e.hurtalpha-=.1),t.drawSprite(`spr_sneo_final_forme`,3,e.x,e.y);let n=e.x+60+e.mouthbottomy/2+e.x_offset,r=e.y+e.mouthtopy+e.y_offset;t.drawSprite(`spr_sneo_lastattack_head_top`,0,n,r,1,1,e.mouthangle,M.white,1),t.drawSprite(e.sprite,1,e.x+e.mouthbottomy/2+e.x_offset,e.y+e.mouthbottomy+e.y_offset),t.drawSprite(`spr_sneo_lastattack_head_top`,0,n,r,1,1,e.mouthangle,M.yellow,e.hurtalpha),t.drawSprite(e.sprite,1,e.x+e.mouthbottomy/2+e.x_offset,e.y+e.mouthbottomy+e.y_offset,1,1,0,M.yellow,e.hurtalpha)},step:(e,t)=>{if(T(e.init,0)&&(e.remx=e.x,e.movetimer+=1,e.init=1),T(e.con,0)){if(e.movetimer+=1,_(e.movetimer,14)?e.y=Q(e.y,e.yspot[e.ycurrent],.122):(e.movetimer=0,e.count+=1,e.ycurrent+=1,O(e.ycurrent,2)&&(e.ycurrent=0)),e.shottimer+=1,O(e.shottimer,t.random.choose(15))){e.lastshoty=e.y;let n=h(e,t,`obj_sneo_bigshot`,e.x+100,e.y+e.y_offset,`bigshot`);n.hspeed=-6,n.friction=-.25,e.shottimer=e.count/4,e.shotmouthopen=1,e.shotmouthopentimer=0,e.rand=70+t.random.irandom(5),R(t,`snd_chargeshot_fire`,.7,.75)}(T(e.count,10)||T(e.endattack,1))&&(e.con=1,e.timer=0,e.endattack=1)}if(T(e.shotmouthopen,1)&&(e.shotmouthopentimer+=1,e.mouthtopy=-Math.sin(e.shotmouthopentimer/3)*30,e.mouthbottomy=-e.mouthtopy,e.mouthangle=e.mouthtopy,U(e.mouthbottomy,0)&&(e.mouthangle=0,e.mouthtopy=0,e.mouthbottomy=0,e.shotmouthopentimer=0,e.shotmouthopen=0)),T(e.con,1)&&(e.timer+=1,e.y=Q(e.y,(e.yspot[0]+e.yspot[1])/2,.1),U(e.timer,10)&&(e.mouthbottomy=Q(e.mouthbottomy,0,.2),e.mouthtopy=Q(e.mouthtopy,20,.2)),O(e.timer,10)&&U(e.timer,25)&&(e.mouthbottomy=Q(e.mouthbottomy,120,.04),e.mouthtopy=Q(e.mouthtopy,-100,.04),e.mouthangle=Q(e.mouthangle,-45,.05)),O(e.timer,10)&&(e.mouthtopy+=Math.sin(e.timer*2)*4,e.mouthbottomy-=Math.sin(e.timer*2)*4,e.mouthangle-=Math.sin(e.timer)*5,e.x+=t.random.randomRange(-1,1),e.y+=t.random.randomRange(-1,1)),T(e.timer,11))){let n=h(e,t,`obj_sneo_bigshot`,e.x+131,e.y+e.y_offset,`bigshot`);n.imageXscale=0,n.imageYscale=0,n.sprite=`spr_sneo_bigshot_l`,e.shottimer=0;for(let e of[.4,.6,.8,.9])R(t,`snd_chargeshot_fire`,e,.7)}}}},{name:`obj_sneo_lastattack_hitbox`,index:649,sprite:`spr_whitepx_10`,visible:!1,depth:0,events:{create:(e,t)=>{e.destroyonhit=!1,e.parent=648;let n=p(t,`obj_sneo_lastattack`);e.x=n.x+n.x_offset+30,e.y=n.y+n.y_offset-40,e.imageXscale=4,e.imageYscale=6},endStep:(e,t)=>{let n=u(t,`obj_sneo_lastattack`);n&&(e.parent=648,e.x=n.x+n.x_offset+30,e.y=n.y+n.y_offset-40)}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>{n.userEvent(t,0);let r=p(n,`obj_sneo_lastattack`);T(r.endattack,2)||(R(n,`snd_damage`),m(n,`obj_sneo_lastattack`,e=>{e.hurtalpha=1}),T(r.endattack,0)&&(r.skip_1st_part_hp-=t.damage),U(r.skip_1st_part_hp,1)&&T(r.endattack,0)&&(r.endattack=1),U(r.skip_2nd_part_hp,1)&&T(r.endattack,1)&&(m(n,`obj_sneo_bigshot`,e=>{e.playerhit=1,e.damage=0,n.userEvent(e,0)}),r.endattack=2))}}]},{name:`obj_sneo_final_orb`,index:642,parent:n,sprite:`spr_sneo_neobuster`,depth:0,events:{create:(e,t)=>{a(e,t),Object.assign(e,{destroyable:1,destroyonhit:0,imageXscale:4,imageYscale:4,hp:12,timer:0,direction:180,speed:3,playerhit:0,flashsiner:0}),t.globals.turntimer=300},user0:(e,t)=>{f(e.timer,0)||(e.timer=1,e.destroyable=0,e.depth-=40,h(e,t,`obj_fadeout`).imageBlend=M.white)},user5:(e,t)=>{T(e.destroyable,1)&&(e.playerhit=1,t.userEvent(e,0))},step:(e,t)=>{if(T(e.timer,0)?T(e.timer,0)&&U(e.speed,3)&&(e.speed+=.25):e.timer+=1,f(e.timer,60)){let n=h(e,t,`obj_fadein`,t.view.x,t.view.y);m(t,`obj_fadeout`,e=>t.destroy(e)),n.imageBlend=M.white,n.fadespeed=-.01,e.playerhit&&oe(e,t),t.globals.turntimer=1,t.destroy(e)}},draw:(e,t)=>{for(e.flashsiner+=1,t.drawSelf(e),e.imageAngle+=10+e.timer*2,f(e.timer,0)&&(t.drawSprite(`spr_sneo_bigcircle`,0,e.x,e.y,e.imageXscale+e.timer*2,e.imageYscale+e.timer,0,M.white,1),t.drawSprite(`spr_pixel_white`,0,t.view.x-20,t.view.y-20,220,220,0,M.white,$(e.timer/15,0,1))),t.drawState.alpha=.5,t.drawState.color=M.white,e.i=Math.max(0,e.hp);U(e.i,12);){let n=(T((e.i-1)%3,0)?14:4)/2,r=(Math.sin(e.i)+1)*180;t.drawTriangle(e.x,e.y,x(999,r-n),A(999,r-n),x(999,r+n),A(999,r+n)),e.i+=1}t.drawState.alpha=1}},collisions:[{target:e(`obj_yheart_shot`),run:(e,t,n)=>{T(e.destroyable,1)&&(T(t.big,0)?(--e.hp,e.speed=3):(e.hp-=3,e.speed=0),_(e.hp,0)?(n.userEvent(e,0),R(n,`snd_badexplosion`),e.speed=0):(e.timer=-1,R(n,`snd_damage`))),n.userEvent(t,0)}}]},{name:`obj_sneo_bigshot`,index:638,parent:e(`obj_collidebullet`),sprite:`spr_sneo_bigshot_s`,depth:0,events:{create:(e,t)=>{B(e),Object.assign(e,{element:6,destroyonhit:0,f:2,destroyable:1,angle_speed:0,destroypoints:1,attackisdone:0,damage:50,imageXscale:1,imageYscale:2,timer:0,playerhit:0,flashsiner:0,explosion_alpha:1,explosion_hide:0,xx:e.x,yy:e.y,grazepoints:4,timer2:0,explodesfx:0}),e.depth=p(t,`obj_heart`).depth-5,g(e,t)},destroy:(t,n)=>{let r=h(t,n,`obj_fadein`,n.view.x,n.view.y);m(n,`obj_fadeout`,e=>n.destroy(e)),r.imageBlend=M.white,r.fadespeed=-.034,n.globals.turntimer=1,m(n,`obj_sneo_lastattack`,e=>n.destroy(e)),m(n,`obj_sneo_lastattack_hitbox`,e=>n.destroy(e)),t.sprite===`spr_sneo_bigshot_l`&&m(n,`obj_spamton_neo_enemy`,t=>{let r=n.globals;T(r.monsterhp[t.myself],r.monstermaxhp[t.myself])&&U(d(n),3)?(p(n,`obj_sneo_bulletcontroller`).mercyaccumulated+=5,m(n,`obj_spamton_neo_enemy`,t=>{let i=n.create(e(`obj_dmgwriter`),r.monsterx[t.myself],r.monstery[t.myself]+20-r.hittarget[t.myself]*20);t.__mercydmgwriter=i.id,i.damage=5,i.type=5,r.hittarget[t.myself]+=1})):(r.monsterhp[0]-=Math.ceil(r.monstermaxhp[0]*.05),U(r.monsterhp[0],0)&&(r.monsterhp[0]=1))})},user0:(e,t)=>{if(e.playerhit){if(f(e.timer,0))return;e.timer=1,e.destroyable=0,e.attackisdone=1,e.depth-=40,e.hspeed=0;let n=p(t,`obj_sneo_lastattack`);n.skip_2nd_part_hp,n.endattack=3,e.xx=e.x,e.yy=e.y}},user5:(e,t)=>{e.sprite===`spr_sneo_bigshot_l`?(e.playerhit=1,t.userEvent(e,0),m(t,`obj_spamton_neo_enemy`,e=>t.userEvent(e,2))):e.sprite===`spr_sneo_bigshot_s`&&v(e,t)},step:(t,n)=>{if(t.sprite===`spr_sneo_bigshot_l`){t.timer2+=1;let e=u(n,`obj_sneo_lastattack`);e&&(t.depth=U(t.timer2,11)?e.depth+1:e.depth-1),U(t.timer2,16)&&(t.imageXscale=Q(0,2,t.timer2/15),t.imageYscale=Q(0,2,t.timer2/15)),T(t.timer2,15)&&(t.hspeed=-1,t.friction=-.05),t.x+=n.random.randomRange(-1,1),t.y=t.ystart+n.random.randomRange(-4,4),U(t.x,n.view.x+400)&&(n.userEvent(t,0),t.playerhit=1,t.damage=0,e&&(e.endattack=2))}else t.imageXscale=Q(t.imageXscale,2,.2);T(t.timer,0)||(t.timer+=1),f(t.timer,13)&&(n.create(e(`obj_sneo_smoke`),n.view.x+320,n.view.y+240),n.destroy(t),n.sourceAudio?.volume(`snd_rumble`,0,70),m(n,`obj_spamton_neo_enemy`,e=>{e.stoprumblesfx=70}))},draw:(e,t)=>{if(T(e.explosion_hide,0)&&t.drawSelf(e),f(e.timer,0)){let n=p(t,`obj_sneo_lastattack`);n.endattack=3,T(n.endattack,2)?(O(e.timer,7)&&(e.explosion_alpha-=.1),t.drawSprite(`spr_pixel_white`,0,t.view.x-20,t.view.y-20,220,220,0,M.white,$(e.timer/60,0,1))):(T(e.explodesfx,0)&&(e.explodesfx=1,t.soundLoop?.(`snd_rumble`),R(t,`snd_explosion`,1,.6)),t.drawSprite(`spr_sneo_bigcircle`,0,e.x-50,e.y,e.imageXscale+e.timer*2,e.imageYscale+e.timer,0,M.white,1),t.drawSprite(`spr_pixel_white`,0,t.view.x-20,t.view.y-20,220,220,0,M.white,$(e.timer/12,0,1)))}}}},{name:`obj_sneo_finale_bullet`,index:647,parent:b,sprite:`spr_sneo_crew_bullet`,depth:0,events:{create:(e,t)=>{b.events.create(e,t),e.flashsiner=0;let n=u(t,`obj_spamton_neo_enemy`),r=u(t,`obj_sneo_bulletcontroller`);n&&(e.damage=t.globals.monsterat[n.myself]*5),r&&(e.target=r.target),e.grazepoints=4},step:(e,t)=>{(O(e.x,t.room.width+100)||_(e.x,-100)||O(e.y,t.room.height+100)||_(e.y,-100))&&t.destroy(e),e.imageAngle+=36,T(e.destroyable,1)&&(e.flashsiner+=1,e.imageBlend=o(15245824,M.aqua,.25+Math.sin(e.flashsiner/3)*.25))}}},{name:`obj_wreckpausespew`,index:565,depth:0,events:{create:e=>{e.playback_sprite=`spr_sneo_playback`,e.imageSpeed=0},draw:(e,t)=>{t.drawSprite(e.playback_sprite,e.imageIndex,t.view.x+20,t.view.y+400)}}}]}var Ei=[oi,ii,kn,Mn,Nn,Xe,s,Qe,{name:`obj_fadeout`,index:193,depth:-99999,sprite:`spr_pixel_white`,events:{create:(e,t)=>{Object.assign(e,{imageBlend:M.black,fadespeed:.08,imageAlpha:0,length:10+t.room.width/4,height:10+t.room.height/4,x:-20,y:-20,fadein:0})},draw:(e,t)=>{e.imageAlpha+=e.fadespeed,t.drawSprite(e.sprite,e.imageIndex,e.x,e.y,e.length,e.height,0,e.imageBlend,e.imageAlpha),T(e.fadein,1)&&_(e.imageAlpha,0)&&t.destroy(e)}}},xe,ye,Re,Ce,Me,ir,sr,cr],Di=new Set([`obj_heart`,`obj_grazebox`,`obj_moveheart`,`obj_collidebullet`,`obj_regularbullet`]);function Oi(e,t={}){let n={},r=new Map(Dn.map(e=>[e.name,e])),i=new Map(Dn.map(e=>[e.index,e.name])),a=e=>{let t=n[e];if(!t)throw Error(`Chapter 2 resource not registered: ${e}`);return t},o=new Map,s=new Map,c=-100,l=e=>o.get(Number(e))??e;e.soundPitch??=(e,t)=>{s.set(l(e),t)},e.soundGetPitch??=e=>s.get(l(e))??1,e.soundFree??=t=>{e.sourceAudio?.free(l(t))},On(e);let u={object:a,objectIndex:e=>{let t=i.get(e);return t?n[t]:void 0},text:F,scripts:{...xt,...wn,...Rt},room:`room_dw_mansion_b_east`,battleBoundary:(e,t)=>{t.pendingRoom=`battle_end`},call:(e,t,n,r)=>{let i=n.globals;switch(e){case`array_length`:return r[0].length;case`variable_instance_exists`:return r[1]in(n.byId(Number(r[0]))??{});case`variable_global_exists`:return r[0]in i;case`real`:return Number(r[0]);case`string_length`:return String(r[0]).length;case`string_char_at`:return String(r[0])[r[1]-1]??``;case`string_hash_to_newline`:return String(r[0]).replace(/#/g,`
`);case`scr_84_set_draw_font`:n.drawState.font=`fnt_`+r[0];return;case`scr_monstersetup`:return Ne(t,n);case`scr_nextact`:return ke(n,t);case`scr_attackphase`:return ze(n);case`scr_spellmenu_setup`:return g(n,t);case`scr_randomtarget`:return Ge(t,n);case`scr_battletext_default`:return H(n,t).id;case`scr_battletext`:return te(n,t).id;case`scr_damage_enemy`:return w(t,n,r[0],r[1]);case`scr_gameover`:return We(n);case`scr_wincombat`:return he(n);case`scr_get_input_name`:return[`LEFT`,`UP`,`RIGHT`,`DOWN`,`Z`,`X`,`C`][r[0]];case`snd_init`:{let e=c--;return o.set(e,String(r[0]).replace(/\.ogg$/,``)),e}case`snd_play`:case`snd_play_x`:case`snd_play_pitch`:{let t=o.get(r[0])??r[0];if(typeof t!=`string`)throw Error(`Unknown sound resource ${t}`);let i=e===`snd_play_x`?r[2]??1:r[1]??1,a=e===`snd_play_x`?r[1]:void 0;return n.sourceAudio?n.sourceAudio.effect(t,i,a)??t:(n.sound?.(t,i),t)}case`snd_loop`:return n.soundLoop?.(r[0]);case`snd_stop`:case`audio_stop_sound`:return n.soundStop?.(l(r[0]));case`snd_pitch`:return s.set(r[0],r[1]),n.soundPitch?.(l(r[0]),r[1]);case`audio_sound_get_pitch`:return s.get(r[0])??1;case`snd_volume`:case`mus_volume`:return n.sourceAudio?.volume(l(r[0]),r[1],r[2]??0);case`snd_free`:!Ke(n,t,r[0])&&o.has(r[0])&&n.soundFree?.(r[0]),o.delete(r[0]);return;case`mus_play`:return n.sourceAudio?.music(o.get(r[0])??r[0])??r[0];case`mus_loop`:return n.sourceAudio?.loop(l(r[0]));case`snd_pause`:return n.sourceAudio?.pause(l(r[0]));case`snd_resume`:return n.sourceAudio?.resume(l(r[0]));case`snd_position`:return n.sourceAudio?.position(l(r[0]),r[1]);case`snd_is_playing`:case`audio_is_playing`:return n.sourceAudio?.playing(l(r[0]))??!1}throw Error(`Chapter 2 host operation not implemented: ${e}`)}};for(let e of Dn)n[e.name]=G(u,e,{Create_0:`unavailable_source_object();`});let d=[],f=e=>{e&&typeof e==`object`&&typeof e.index==`number`&&typeof e.name==`string`&&(d.push(e),e.parent&&f(e.parent))};for(let e of[y,m,Fe,ee,b])for(let t of Object.values(e))f(t);S.forEach(f);for(let e of d){let t=r.get(e.name);if(!t)continue;let i={...n[t.name].events};delete i.create;let a=e,o=[];for(;a?.name===e.name;)o.unshift(a),a=a.parent;for(let e of o)Object.assign(i,e.events);let s=G(u,t,{});s.events=i,s.collisions=e.collisions,n[t.name]=s}for(let e of[we,...S]){let t=a(e.name),n=e,r=[];for(;n?.name===e.name;)r.unshift(n),n=n.parent;t.events={};for(let e of r)Object.assign(t.events,e.events)}for(let[e,t]of Object.entries(Tt(u)))Di.has(e)||(n[e]=t);n.obj_spamton_neo_enemy=St(u),Object.assign(n,Ct(u)),Object.assign(n,on(u)),Object.assign(n,Sn(u));for(let[e,t]of Object.entries(Tn))Di.has(e)||(n[e]=G(u,t.metadata,t.sources));let p=[],h=e=>{let t=e.parent?n[e.parent.name]??e.parent:void 0;return t===e.parent?e:{...e,parent:t}},_=[()=>Ei,()=>$t(a),()=>[tr(a)],()=>nn(a),()=>ui(a),()=>di(a),()=>hi(a),()=>_i(a),()=>bi(a),()=>Si(a),()=>Ti(a)];for(let e of _)for(let r of e()){let e=n[r.name],i=h(r),a=r.name===`obj_spamton_neo_enemy`&&t.rage===!1?{...i,events:{...i.events,user4:()=>{}}}:i;n[r.name]=a,e&&e!==a&&p.push([e,a]),a!==r&&p.push([r,a])}p.push([Zn,a(Zn.name)]);for(let e of Object.values(Fn))p.push([e,a(e.name)]);for(let e of Object.values(n))e.depth=r.get(e.name)?.depth??e.depth;return e.installObjectAliases([...d.filter(e=>n[e.name]&&!p.some(([t])=>t===e)).map(e=>[e,n[e.name]]),...p]),e.globals.onChapter2SmallFace=(t,n)=>{Object.assign(t,{nextchar:`f`,nextchar2:n,faced:0}),ht(En,t,e,u)},{host:u,objects:n,enter:t=>Cn(e,u,t)}}export{Oi as installNeoHost};