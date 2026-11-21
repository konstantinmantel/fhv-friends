import test from 'node:test';
import assert from 'node:assert/strict';
import {campusAnswer,franziReady,startFranziAI} from '../src/franzi.js';
test('campus help explains selling, contact requests and the optional AI honestly',()=>{
 assert.match(campusAnswer('How do I sell skis?'),/€0/);
 assert.match(campusAnswer('How do I connect with people?'),/Requests/);
 assert.match(campusAnswer('Was ist die Hauptstadt of Italien?'),/general questions, enable/);
 assert.equal(franziReady(),false);
});
test('unsupported devices do not start a download',async()=>{
 await assert.rejects(startFranziAI(),/WebGPU/);
});
