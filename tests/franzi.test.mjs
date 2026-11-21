import test from 'node:test';
import assert from 'node:assert/strict';
import {campusAnswer,franziReady,startFranziAI} from '../src/franzi.js';
test('campus help explains selling, contact requests and the optional AI honestly',()=>{
 assert.match(campusAnswer('Wie verkaufe ich Skier?'),/0 €/);
 assert.match(campusAnswer('Wie kann ich Freunde finden?'),/Anfragen/);
 assert.match(campusAnswer('Was ist die Hauptstadt von Italien?'),/allgemeine Fragen aktiviere/);
 assert.equal(franziReady(),false);
});
test('unsupported devices do not start a download',async()=>{
 await assert.rejects(startFranziAI(),/WebGPU/);
});
