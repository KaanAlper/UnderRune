export type KeyReplay=Record<number,{keysPressed:number[];keysReleased:number[]}>;
export function zScript(totalFrames:number,every?:number):KeyReplay;
export function menuScript(totalFrames:number):KeyReplay;
export function actScript(totalFrames:number):KeyReplay;
export function choiceScript(totalFrames:number):KeyReplay;
export function boardScript(totalFrames:number):KeyReplay;
export const SCRIPTS:Record<string,(totalFrames:number)=>KeyReplay>;
