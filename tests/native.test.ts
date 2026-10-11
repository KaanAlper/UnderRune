import {describe,it,expect} from 'vitest';
import {nativeKeyCode,isNativeEvent} from '../src/game/native';
describe('native battle bridge',()=>{
 it('maps app and touch keys to the original game key codes',()=>{
  expect(nativeKeyCode('ArrowUp')).toBe(38);expect(nativeKeyCode('Z')).toBe(90);expect(nativeKeyCode('x')).toBe(88);expect(nativeKeyCode('Enter')).toBe(13);
  expect(nativeKeyCode('w')).toBe(38);expect(nativeKeyCode('F5')).toBeUndefined();expect(nativeKeyCode('r')).toBeUndefined();
 });
 it('accepts only player messages with a known type',()=>{
  expect(isNativeEvent({source:'underrune-native',type:'running'})).toBe(true);
  expect(isNativeEvent({source:'underrune-host',type:'running'})).toBe(false);
  expect(isNativeEvent({source:'underrune-native',type:'eval'})).toBe(false);
  expect(isNativeEvent(null)).toBe(false);
 });
 it('accepts battle outcomes reported by the launcher watcher',()=>{
  expect(isNativeEvent({source:'underrune-native',type:'outcome',outcome:'victory'})).toBe(true);
  expect(isNativeEvent({source:'underrune-native',type:'outcome',outcome:'draw'})).toBe(false);
 });
});
