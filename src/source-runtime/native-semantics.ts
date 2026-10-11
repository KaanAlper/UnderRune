import type {ExecutionOptions} from './gml';
/** Delegate value comparisons and boolean conversion to the pinned official runner. */
export function nativeSemantics(runtime:Record<string,any>):Pick<ExecutionOptions,'truth'|'operators'>{
 const required=['yyGetBool','yyfequal','yyfless','yyflessequal','yyfgreater','yyfgreaterequal'];
 for(const name of required)if(typeof runtime[name]!=='function')throw Error('Official runtime missing '+name);
 const equal=runtime.yyfequal;
 return {truth:runtime.yyGetBool,operators:{'==':equal,'!=':(a,b)=>!equal(a,b),'<>':(a,b)=>!equal(a,b),'<':runtime.yyfless,'<=':runtime.yyflessequal,'>':runtime.yyfgreater,'>=':runtime.yyfgreaterequal}};
}
