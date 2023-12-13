import fs from 'fs'

import {
    shutdown,
    Field,
    MerkleMap,
} from 'o1js';

function buildMerkleMap(fnLoad: string): MerkleMap {
    const map = new MerkleMap();
    const dataArray = JSON.parse(fs.readFileSync(fnLoad, 'utf-8'))
    //const dataArray = JSON.parse(fs.readFileSync('./lookup_table_basic.json', 'utf-8'))
    console.log("DATA ARRAY", dataArray.length);
    let counter = 0;
    for (var key in dataArray) {
        if (dataArray.hasOwnProperty(key)) {
            console.log(counter, key + " -> " + dataArray[key]);
            // map.set(Field(0), Field(100));
            map.set(Field(key), Field(dataArray[key]));
            counter += 1
            // Break early for testing...
            // if (counter > 30) {
            //     break
            // }
        }
    }
    return map
}

// TODO - we need serialization for merkle maps so we can save+load them
function serializeMerkleMap(map: MerkleMap, fnWrite: string) {
    const jsonString = JSON.stringify(map);
    fs.writeFileSync(fnWrite, jsonString);
}

function deserializeMerkleMap(fnRead: string): MerkleMap {
    const jsonData = fs.readFileSync(fnRead, 'utf8');
    const map = JSON.parse(jsonData) as MerkleMap;
    // By default map will have strings instead of Field objects
    return map;
}


const fnBasic = 'lookup_table_basic.json'
const fnFlush = 'lookup_table_flushes.json'
const merkleMapBasic = buildMerkleMap(fnBasic);
const merkleMapFlush = buildMerkleMap(fnFlush);


//const test_hand = 41 * 41 * 41 * 41 * 2 * 3 * 5;
// Same example we used in python script - lookup value should be 10
const four_aces = 41 * 41 * 41 * 41 * 37
const ret = merkleMapBasic.get(Field(four_aces));
console.log("TEST HAND", ret);


const merkleMapBasicFn = "merkleMapBasic.json"
const merkleMapFlushFn = "merkleMapFlush.json"

serializeMerkleMap(merkleMapBasic, merkleMapBasicFn)
serializeMerkleMap(merkleMapFlush, merkleMapFlushFn)

const merkleMapBasic_ = deserializeMerkleMap(merkleMapBasicFn);
const merkleMapFlush_ = deserializeMerkleMap(merkleMapFlushFn);

await shutdown();
