import fs from 'fs'
import * as assert from 'assert';

import {
    shutdown,
    Field,
} from 'o1js';

import { MerkleMapSerializable, serialize, deserialize } from './merkle_map_serializable.js';

function buildMerkleMap(fnLoad: string): MerkleMapSerializable {
    const map = new MerkleMapSerializable();
    const dataArray = JSON.parse(fs.readFileSync(fnLoad, 'utf-8'))
    let counter = 0;
    for (var key in dataArray) {
        if (dataArray.hasOwnProperty(key)) {
            console.log(counter, key + " -> " + dataArray[key]);
            // map.set(Field(0), Field(100));
            map.set(Field(key), Field(dataArray[key]));
            counter += 1
            // Break early for testing...
            // if (counter > 5) {
            //     break
            // }
        }
    }
    return map
}


// Load fns - raw dict containing {key: value} lookups
const fnBasic = 'lookup_table_basic.json'
const fnFlush = 'lookup_table_flushes.json'
// Write fns - serialized merkle maps
const merkleMapBasicFn = "merkleMapBasic.json"
const merkleMapFlushFn = "merkleMapFlush.json"

// Build and serialize+write merkle maps
const merkleMapBasic = buildMerkleMap(fnBasic);
const jsonStringBasic = serialize(merkleMapBasic);
fs.writeFileSync(merkleMapBasicFn, jsonStringBasic);

const merkleMapFlush = buildMerkleMap(fnFlush);
const jsonStringFlush = serialize(merkleMapFlush);
fs.writeFileSync(merkleMapFlushFn, jsonStringFlush);


// Sanity checks - make sure we have a valid lookup value
// and make sure we can deserialize and lookup again

// Same example we used in python script - lookup value should be 10
//const four_aces = 48;
const fourAces = 41 * 41 * 41 * 41 * 37
const lookupVal = merkleMapBasic.get(Field(fourAces));
console.log(lookupVal.toString());
assert.equal(lookupVal.toString(), "10", 'Initial lookup should be 10');

// Only going to check the basic lookups - should be fine for flush too if this works
const jsonDataBasic = fs.readFileSync(merkleMapBasicFn, 'utf8');
const merkleMapBasic_ = deserialize(jsonDataBasic);
const lookupValS = merkleMapBasic_.get(Field(fourAces));
console.log(lookupValS.toString());
assert.equal(lookupValS.toString(), "10", 'Serialized+load lookup should be 10');

await shutdown();
