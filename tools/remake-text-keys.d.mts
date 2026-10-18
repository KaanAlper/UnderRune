export function referencedTextKeys(source:string,language:Record<string,unknown>):Set<string>;
export function codeLiterals(code:string):string[];
export function referencedLiterals(source:string,codeDir:string):Promise<Record<string,string>>;
