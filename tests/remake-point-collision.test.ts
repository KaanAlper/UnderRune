import {describe,it,expect} from 'vitest';
import {pointMeets,type Collidable} from '../src/remake/gm/collision';
import type {SpriteBank,SpriteData} from '../src/remake/gm/sprites';
import {GmRuntime} from '../src/remake/gm/runtime';
import {preciseHit} from '../src/remake/deltarune/chapter3-scripts';
import {heart} from '../src/remake/deltarune/battle';
const sprite:SpriteData={name:'mask',width:4,height:4,originX:0,originY:0,bboxMode:2,left:1,right:2,top:1,bottom:2,sepMasks:1,frames:1,special:false,playbackSpeed:1,playbackType:0,masks:[new Uint8Array([0,0x40,0,0])]};
const bank:SpriteBank={get:()=>sprite,collisionCompat:false,roomSpeed:30};
const body:Collidable={x:0,y:0,imageAngle:0,imageXscale:1,imageYscale:1,imageIndex:0,sprite:'mask',mask:null};
describe('native point collision',()=>{
 it('tests the exact pixel, including integer coordinates rather than an empty rectangle',()=>{
  expect(pointMeets(bank,body,1,1,true)).toBe(true);expect(pointMeets(bank,body,2,1,true)).toBe(false);expect(pointMeets(bank,body,2,1,false)).toBe(true);
  expect(pointMeets(bank,body,3,1,false)).toBe(false);expect(pointMeets(bank,body,1,3,false)).toBe(false);
 });
 it('respects a mirrored scaled mask and rotated manual collision margins',()=>{
  expect(pointMeets(bank,{...body,imageXscale:-2},-3,1,true)).toBe(true);expect(pointMeets(bank,{...body,imageXscale:-2},-2,1,true)).toBe(false);
  const rotatedBank={...bank,get:()=>({...sprite,sepMasks:2,masks:null})};
  expect(pointMeets(rotatedBank,{...body,imageAngle:45},2.8,0,false)).toBe(true);expect(pointMeets(rotatedBank,{...body,imageAngle:45},1.5,1.2,false)).toBe(false);
 });
 it('uses point collision when the shrunken soul asks precise_hit for a zero-sized hitbox',()=>{
  const rt=new GmRuntime(bank),bullet=rt.restore({name:'bullet',index:1,sprite:'mask'},100000,0,0);rt.restore(heart,100001,-9,-9);
  expect(preciseHit(bullet,rt,0)).toBe(true);
 });
});
