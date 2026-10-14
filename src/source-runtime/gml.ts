/** Strict execution of decoded GML. Unsupported operations are errors, never no-op fallbacks. */
import {bankersRound} from '../remake/gm/math';
type Token={value:string;offset:number;kind:string};
export type GmlNode={kind:string;[key:string]:any};
export type GmlProgram={statements:GmlNode[]};
type ObjectValue=Record<string,any>;
type Scope={self:ObjectValue;other:ObjectValue;locals:Map<string,any>};
export type ExecutionOptions={budget?:number;calls?:Record<string,(self:ObjectValue,...args:any[])=>any>;targets?:(value:any)=>ObjectValue[];truth?:(value:any)=>boolean;operators?:Record<string,(a:any,b:any)=>any>;argumentOrder?:'left-to-right'|'right-to-left';other?:ObjectValue;member?:(value:any)=>ObjectValue};
function tokenize(source:string):Token[]{
 const tokens:Token[]=[];let pos=0;
 while(pos<source.length){
  const tail=source.slice(pos),skip=tail.match(/^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/);
  if(skip){pos+=skip[0].length;continue;}
  const string=tail.match(/^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
  const number=tail.match(/^(?:#[\da-f]{6}(?![\da-f])|0x[\da-f]+|\$[\da-f]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)/i);
  const word=tail.match(/^[a-zA-Z_][a-zA-Z_\d]*/);
  const operator=tail.match(/^(?:\+\+|--|\+=|-=|\*=|\/=|%=|==|!=|<>|<=|>=|&&|\|\||<<|>>|[{}()[\];,.?:+\-*\/%=!<>~&|^])/);
  const value=(string??number??word??operator)?.[0];if(!value)throw Error(`Unsupported token at ${pos}: ${tail.slice(0,16)}`);
  tokens.push({value,offset:pos,kind:string?'string':number?'number':word?'word':'operator'});pos+=value.length;
 }
 tokens.push({value:'<eof>',offset:pos,kind:'eof'});return tokens;
}
const precedences:Record<string,number>={'=':1,'+=':1,'-=':1,'*=':1,'/=':1,'%=':1,'||':2,or:2,'&&':3,and:3,'|':4,'^':5,'&':6,'==':7,'!=':7,'<>':7,'<':8,'>':8,'<=':8,'>=':8,'<<':9,'>>':9,'+':10,'-':10,'*':11,'/':11,'%':11,mod:11,div:11};
class Parser{
 private index=0;constructor(private tokens:Token[]){}
 peek(){return this.tokens[this.index].value;}
 take(value?:string){const t=this.tokens[this.index++];if(value&&t.value!==value)throw Error(`Expected ${value}, got ${t.value} at ${t.offset}`);return t;}
 match(value:string){if(this.peek()===value){this.take();return true;}return false;}
 program():GmlProgram{const statements:GmlNode[]=[];while(this.peek()!=='<eof>')statements.push(this.statement());return {statements};}
 statement():GmlNode{
  const keyword=this.peek();if(this.match(';'))return {kind:'block',body:[]};
  if(this.match('{')){const body=[];while(this.peek()!=='}'){if(this.peek()==='<eof>')throw Error('Unclosed block');body.push(this.statement());}this.take('}');return {kind:'block',body};}
  if(this.match('if')){this.take('(');const condition=this.expression();this.take(')');const yes=this.statement(),no=this.match('else')?this.statement():undefined;return {kind:'if',condition,yes,no};}
  if(this.match('switch')){
   this.take('(');const value=this.expression();this.take(')');this.take('{');const cases:GmlNode[]=[];
   while(this.peek()!=='}'){
    let test:GmlNode|undefined;
    if(this.match('case'))test=this.expression();else if(!this.match('default'))throw Error('Expected switch label');
    this.take(':');const body:GmlNode[]=[];
    while(!['case','default','}'].includes(this.peek())){if(this.peek()==='<eof>')throw Error('Unclosed switch');body.push(this.statement());}
    if(!test&&cases.some(c=>!c.test))throw Error('Duplicate default label');
    cases.push({kind:'case',test,body});
   }
   this.take('}');return {kind:'switch',value,cases};
  }
  if(this.match('with')){this.take('(');const target=this.expression();this.take(')');return {kind:'with',target,body:this.statement()};}
  if(this.match('while')){this.take('(');const condition=this.expression();this.take(')');return {kind:'while',condition,body:this.statement()};}
  if(this.match('repeat')){this.take('(');const count=this.expression();this.take(')');return {kind:'repeat',count,body:this.statement()};}
  if(this.match('for')){this.take('(');const init=this.match(';')?undefined:this.peek()==='var'?this.variable():this.expressionStatement();const condition=this.peek()===';'?undefined:this.expression();this.take(';');const increment=this.peek()===')'?undefined:this.expression();this.take(')');return {kind:'for',init,condition,increment,body:this.statement()};}
  if(keyword==='var')return this.variable();
  if(this.match('enum')){const name=this.take();if(name.kind!=='word')throw Error('Expected enum name');this.take('{');const members=[];while(this.peek()!=='}'){const member=this.take();if(member.kind!=='word')throw Error('Expected enum member');members.push({name:member.value,value:this.match('=')?this.expression(2):undefined});if(!this.match(','))break;}this.take('}');this.match(';');return {kind:'enum',name:name.value,members};}
  if(this.match('function')){const name=this.take();if(name.kind!=='word')throw Error('Expected function name');this.take('(');const parameters:string[]=[];if(this.peek()!==')')do{const parameter=this.take();if(parameter.kind!=='word')throw Error('Expected parameter name');parameters.push(parameter.value);}while(this.match(','));this.take(')');const body=this.statement();if(body.kind!=='block')throw Error('Expected function body');return {kind:'function',name:name.value,parameters,body};}
  if(['exit','break','continue','return'].includes(keyword)){this.take();const value=keyword==='return'&&this.peek()!==';'?this.expression():undefined;this.match(';');return {kind:keyword,value};}
  if(['do','try','new','static','globalvar'].includes(keyword))throw Error(`Unsupported statement ${keyword} at ${this.tokens[this.index].offset}`);
  return this.expressionStatement();
 }
 variable():GmlNode{this.take('var');const declarations=[];do{const name=this.take();if(name.kind!=='word')throw Error('Expected variable name');const value=this.match('=')?this.expression(2):undefined;declarations.push({name:name.value,value});}while(this.match(','));this.take(';');return {kind:'var',declarations};}
 expressionStatement():GmlNode{const expression=this.expression();this.take(';');return {kind:'expression',expression};}
 expression(min=1):GmlNode{
  let left=this.prefix();
  while(true){
   if(this.match('.')){left={kind:'member',object:left,key:{kind:'literal',value:this.take().value}};continue;}
   if(this.match('[')){do{const key=this.expression();left={kind:'member',object:left,key};}while(this.match(','));this.take(']');continue;}
   if(this.match('(')){const args=[];if(this.peek()!==')')do{args.push(this.expression());}while(this.match(','));this.take(')');left={kind:'call',callee:left,args};continue;}
   if(['++','--'].includes(this.peek())){left={kind:'update',operand:left,operator:this.take().value,postfix:true};continue;}
   const operator=this.peek(),priority=precedences[operator];if(!priority||priority<min)break;this.take();
   const assignment=priority===1,right=this.expression(assignment?priority:priority+1);left={kind:assignment?'assign':'binary',operator,left,right};
  }
  if(min<=2&&this.match('?')){const yes=this.expression();this.take(':');left={kind:'conditional',condition:left,yes,no:this.expression()};}
  return left;
 }
 prefix():GmlNode{
  const token=this.take();
  if(token.value==='('){const expression=this.expression();this.take(')');return expression;}
  if(token.value==='['){const values:GmlNode[]=[];if(this.peek()!==']')do{values.push(this.expression());}while(this.match(','));this.take(']');return {kind:'array',values};}
  if(['!','not','-','+','~','++','--'].includes(token.value))return {kind:token.value==='++'||token.value==='--'?'update':'unary',operator:token.value,operand:this.expression(12),postfix:false};
  if(token.kind==='number'){
   const text=token.value;let value=text.startsWith('$')?parseInt(text.slice(1),16):Number(text);
   if(text.startsWith('#')){const rgb=parseInt(text.slice(1),16);value=((rgb&255)<<16)|(rgb&0xff00)|(rgb>>>16);}
   return {kind:'literal',value};
  }
  if(token.kind==='string'){
   const body=token.value.slice(1,-1),escapes:Record<string,string>={n:'\n',r:'\r',t:'\t'},value=body.replace(/\\([\\'"nrt])/g,(_m,x:string)=>escapes[x]??x);return {kind:'literal',value};
  }
  if(token.value==='true'||token.value==='false')return {kind:'literal',value:token.value==='true'};
  if(token.kind==='word')return {kind:'identifier',name:token.value};
  throw Error(`Unsupported expression ${token.value} at ${token.offset}`);
 }
}
export function parseGml(source:string):GmlProgram{return new Parser(tokenize(source)).program();}
class Control{constructor(public kind:string,public value?:any){}}
function binary(operator:string,a:any,b:any):any{
 switch(operator){case '+':return a+b;case '-':return a-b;case '*':return a*b;case '/':return a/b;case '%':case 'mod':return a%b;case 'div':return Math.trunc(a/b);case '==':return a===b;case '!=':case '<>':return a!==b;case '<':return a<b;case '>':return a>b;case '<=':return a<=b;case '>=':return a>=b;case '&':return a&b;case '|':return a|b;case '^':return a^b;case '<<':return a<<b;case '>>':return a>>b;default:throw Error('Unsupported operator '+operator);}
}
export function executeGml(program:GmlProgram,self:ObjectValue,environment:ObjectValue,options:ExecutionOptions={}):any{
 let budget=options.budget??100000;const work=()=>{if(--budget<0)throw Error('GML execution budget exhausted');};
 const root:Scope={self,other:options.other??self,locals:new Map()};
 const truth=options.truth??((value:any)=>{if(typeof value==='boolean')return value;if(typeof value==='number')return value>.5;if(value===undefined)return false;throw Error('GML boolean conversion requires native runtime for this type');});
 const operate=(operator:string,a:any,b:any)=>{const native=options.operators?.[operator];return native?native(a,b):binary(operator,a,b);};
 const functions=new Map<string,GmlNode>();
 const enums=new Map<string,ObjectValue>();
 for(const node of program.statements)if(node.kind==='function')functions.set(node.name,node);
 const read=(name:string,scope:Scope):any=>{if(name==='self')return scope.self;if(name==='other')return scope.other;if(scope.locals.has(name))return scope.locals.get(name);if(enums.has(name))return enums.get(name);if(name in scope.self)return scope.self[name];if(name in environment)return environment[name];throw Error('Unknown GML variable '+name);};
 const reference=(node:GmlNode,scope:Scope):{get:()=>any;set:(v:any)=>void}=>{
  if(node.kind==='identifier')return {get:()=>read(node.name,scope),set:v=>{if(scope.locals.has(node.name))scope.locals.set(node.name,v);else scope.self[node.name]=v;}};
  if(node.kind==='member'){const value=expression(node.object,scope),object=options.member?options.member(value):value,key=expression(node.key,scope);if(object===null||typeof object!=='object')throw Error('GML member target is not an instance/array');return {get:()=>{if(!(key in object))throw Error('Unknown GML member '+key);return object[key];},set:v=>{object[key]=v;}};}
  throw Error('Invalid GML assignment target');
 };
 const expression=(node:GmlNode,scope:Scope):any=>{
  work();switch(node.kind){
   case 'literal':return node.value;case 'array':return node.values.map((value:GmlNode)=>expression(value,scope));case 'identifier':return read(node.name,scope);case 'member':return reference(node,scope).get();
   case 'assign':{const ref=reference(node.left,scope),rhs=expression(node.right,scope),value=node.operator==='='?rhs:operate(node.operator[0],ref.get(),rhs);ref.set(value);return value;}
   case 'update':{const ref=reference(node.operand,scope),old=ref.get(),value=old+(node.operator==='++'?1:-1);ref.set(value);return node.postfix?old:value;}
   case 'unary':{const v=expression(node.operand,scope);switch(node.operator){case '!':case 'not':return !truth(v);case '-':return -v;case '+':return +v;case '~':return ~v;}throw Error('Unsupported unary');}
   case 'binary':{const a=expression(node.left,scope);if(node.operator==='&&'||node.operator==='and')return truth(a)&&truth(expression(node.right,scope));if(node.operator==='||'||node.operator==='or')return truth(a)||truth(expression(node.right,scope));return operate(node.operator,a,expression(node.right,scope));}
   case 'conditional':return truth(expression(node.condition,scope))?expression(node.yes,scope):expression(node.no,scope);
   case 'call':{
    const args=new Array(node.args.length);
    if(options.argumentOrder==='right-to-left'){for(let i=node.args.length-1;i>=0;i--)args[i]=expression(node.args[i],scope);}
    else for(let i=0;i<node.args.length;i++)args[i]=expression(node.args[i],scope);
    if(node.callee.kind!=='identifier')throw Error('Unsupported GML method call');
    const name=node.callee.name,declared=functions.get(name);
    if(declared){const locals=new Map<string,any>();declared.parameters.forEach((parameter:string,index:number)=>locals.set(parameter,args[index]));locals.set('argument',args);locals.set('argument_count',args.length);args.forEach((value:any,index:number)=>locals.set('argument'+index,value));try{statement(declared.body,{self:scope.self,other:scope.other,locals});}catch(e){if(e instanceof Control&&(e.kind==='return'||e.kind==='exit'))return e.value;throw e;}return undefined;}
    const call=options.calls?.[name];if(!call)throw Error('Unsupported GML call '+name);return call(scope.self,...args);
   }
   default:throw Error('Unsupported GML expression '+node.kind);
  }
 };
 const loopBody=(body:GmlNode,scope:Scope):boolean=>{try{statement(body,scope);return true;}catch(e){if(e instanceof Control&&e.kind==='break')return false;if(e instanceof Control&&e.kind==='continue')return true;throw e;}};
 const statement=(node:GmlNode,scope:Scope):void=>{
  work();switch(node.kind){
   case 'block':for(const item of node.body)statement(item,scope);return;
   case 'expression':expression(node.expression,scope);return;
   case 'var':for(const d of node.declarations)scope.locals.set(d.name,d.value?expression(d.value,scope):undefined);return;
   case 'function':if(!functions.has(node.name)||functions.get(node.name)!==node)throw Error('Unsupported nested GML function');return;
   case 'enum':if(!enums.has(node.name))throw Error('Unsupported nested GML enum');return;
   case 'if':if(truth(expression(node.condition,scope)))statement(node.yes,scope);else if(node.no)statement(node.no,scope);return;
   case 'switch':{
    const value=expression(node.value,scope);let start=-1,fallback=-1;
    for(let i=0;i<node.cases.length;i++){const clause=node.cases[i];if(!clause.test){fallback=i;continue;}if(truth(operate('==',value,expression(clause.test,scope)))){start=i;break;}}
    if(start<0)start=fallback;if(start<0)return;
    try{for(let i=start;i<node.cases.length;i++)for(const child of node.cases[i].body)statement(child,scope);}catch(e){if(!(e instanceof Control&&e.kind==='break'))throw e;}
    return;
   }
   case 'while':while(truth(expression(node.condition,scope))){work();if(!loopBody(node.body,scope))break;}return;
   case 'repeat':{
    const value=expression(node.count,scope);if(typeof value!=='number'||!Number.isFinite(value))throw Error('Unsupported GML repeat count');
    const count=bankersRound(value);for(let i=0;i<count;i++){work();if(!loopBody(node.body,scope))break;}return;
   }
   case 'for':if(node.init)statement(node.init,scope);while(!node.condition||truth(expression(node.condition,scope))){work();if(!loopBody(node.body,scope))break;if(node.increment)expression(node.increment,scope);}return;
   case 'with':{
    const target=expression(node.target,scope),targets=options.targets?options.targets(target):Array.isArray(target)?target:[target];
    for(const selected of targets){if(!selected||typeof selected!=='object')throw Error('Invalid GML with target');statement(node.body,{self:selected,other:scope.self,locals:scope.locals});}return;
   }
   case 'exit':case 'break':case 'continue':case 'return':throw new Control(node.kind,node.value?expression(node.value,scope):undefined);
   default:throw Error('Unsupported GML statement '+node.kind);
  }
 };
 for(const node of program.statements)if(node.kind==='enum'){const values:ObjectValue={};let next=0;for(const member of node.members){const value=member.value?expression(member.value,root):next;if(typeof value!=='number'||!Number.isFinite(value))throw Error('Unsupported GML enum value');values[member.name]=value;next=value+1;}enums.set(node.name,values);}
 try{for(const node of program.statements)statement(node,root);}catch(e){if(e instanceof Control&&(e.kind==='exit'||e.kind==='return'))return e.value;throw e;}
}
