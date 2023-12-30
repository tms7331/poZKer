import {
    Field,
    MerkleMapWitness,
    Bool,
    UInt64,
} from 'o1js';
import fs from 'fs';
import { cardMapping52 } from './PoZKer.js';

import { MerkleMapSerializable, deserialize } from './merkle_map_serializable.js';


export type Card = '2d' | '3d' | '4d' | '5d' | '6d' | '7d' | '8d' | '9d' | 'Td' | 'Jd' | 'Qd' | 'Kd' | 'Ad' | '2c' | '3c' | '4c' | '5c' | '6c' | '7c' | '8c' | '9c' | 'Tc' | 'Jc' | 'Qc' | 'Kc' | 'Ac' | '2h' | '3h' | '4h' | '5h' | '6h' | '7h' | '8h' | '9h' | 'Th' | 'Jh' | 'Qh' | 'Kh' | 'Ah' | '2s' | '3s' | '4s' | '5s' | '6s' | '7s' | '8s' | '9s' | 'Ts' | 'Js' | 'Qs' | 'Ks' | 'As';

const cards: Card[] = ['2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh', 'Ah',
    '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd', 'Ad',
    '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc', 'Ac',
    '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks', 'As']


// TODO - don't like that we're loading this here, any way we could refactor?
const fnBasic = 'lookup_table_basic.json';
const fnFlush = 'lookup_table_flushes.json';
const lookupTableBasic = JSON.parse(fs.readFileSync(fnBasic, 'utf-8'));
const lookupTableFlushes = JSON.parse(fs.readFileSync(fnFlush, 'utf-8'));

export function parseCardInt(cardInt: number): Card {
    return cards[cardInt];
}


export function getMerkleMapWitness(merkleMapBasic: MerkleMapSerializable,
    merkleMapFlush: MerkleMapSerializable,
    isFlush: boolean,
    merkleMapKey: Field): MerkleMapWitness {
    //console.log(merkleMapBasic.getRoot())
    // console.log(merkleMapFlush.getRoot())

    let witness: MerkleMapWitness;
    if (isFlush) {
        let w = merkleMapBasic.getWitness(merkleMapKey);
        witness = new MerkleMapWitness(w.isLefts, w.siblings);
    }
    else {
        let w = merkleMapFlush.getWitness(merkleMapKey);
        witness = new MerkleMapWitness(w.isLefts, w.siblings);

    }
    return witness;
}



// Want mapping from prime52 encoding (in cardMapping52) back to the 0..51 indexes for our lookups
type Prime52ToCardType = {
    [key: number]: number;
};

const prime52ToCard: Prime52ToCardType = {
}

for (const [key, value] of Object.entries(cardMapping52)) {
    // key, value would be like
    // "7c": 131,
    console.log(key, value);
    const card: Card = key as Card;
    const cardIndex = cards.indexOf(card);
    prime52ToCard[value] = cardIndex;
}


function flushCheck(card1: number, card2: number, card3: number, card4: number, card5: number): boolean {
    // if all of them are in the same block of 13, it's a flush
    const suitNum1 = Math.floor(card1 / 13);
    const suitNum2 = Math.floor(card2 / 13);
    const suitNum3 = Math.floor(card3 / 13);
    const suitNum4 = Math.floor(card4 / 13);
    const suitNum5 = Math.floor(card5 / 13);
    if (suitNum1 == suitNum2 && suitNum1 == suitNum3 && suitNum1 == suitNum4 && suitNum1 == suitNum5) {
        return true;
    }
    return false;
}

function evaluateHand(card1: number, card2: number, card3: number, card4: number, card5: number): [number, number, boolean] {
    // Hands will be the 0..51 indexes!

    const lookupKey = card1 % 13 * card2 % 13 * card3 % 13 * card4 % 13 * card5 % 13
    let lookupVal = lookupTableBasic[lookupKey]
    const isFlush = flushCheck(card1, card2, card3, card4, card5)
    if (isFlush) {
        lookupVal = lookupTableFlushes[lookupKey]
    }
    return [lookupKey, lookupVal, isFlush];
}


export function getShowdownData(allCardsUint: [UInt64, UInt64, UInt64, UInt64, UInt64, UInt64, UInt64]):
    [[Bool, Bool, Bool, Bool, Bool, Bool, Bool],
        Bool,
        Field,
        Field] {

    // Want cards in 0 to 52 numbering
    const allCards: [number, number, number, number, number, number, number] = [-1, -1, -1, -1, -1, -1, -1];
    for (let i = 0; i < 7; i++) {
        const prime52: number = parseInt(allCardsUint[i].toString());
        const cardIndex = prime52ToCard[prime52];
        allCards[i] = cardIndex;
    }

    // Find best 5 card hand from 7 cards 
    let useCards: [boolean, boolean, boolean, boolean, boolean, boolean, boolean] = [false, false, false, false, false, false, false];
    let isFlush: boolean = false;
    let merkleMapKey: number = 0;
    // 7462 total hands (so indexes 0 to 7641) so every hand should be lower than this
    let merkleMapVal: number = 7462;
    for (let i = 0; i < 7; i++) {
        const card1 = allCards[i];
        for (let j = i + 1; j < 7; j++) {
            const card2 = allCards[j];
            for (let k = j + 1; k < 7; k++) {
                const card3 = allCards[k];
                for (let l = k + 1; l < 7; l++) {
                    const card4 = allCards[l];
                    for (let m = l + 1; m < 7; m++) {
                        const card5 = allCards[m];

                        const [merkleMapKey_, merkleMapVal_, isFlush_] = evaluateHand(card1, card2, card3, card4, card5);
                        // lower is better
                        if (merkleMapVal_ < merkleMapVal) {
                            merkleMapVal = merkleMapVal_;
                            merkleMapKey = merkleMapKey_;
                            isFlush = isFlush_;
                            useCards = [false, false, false, false, false, false, false];
                            useCards[i] = true;
                            useCards[j] = true;
                            useCards[k] = true;
                            useCards[l] = true;
                            useCards[m] = true;
                        }

                    }
                }
            }
        }
    }

    // Want to return these as fields...
    const useCardsRet: [Bool, Bool, Bool, Bool, Bool, Bool, Bool] = [Bool(useCards[0]), Bool(useCards[1]), Bool(useCards[2]), Bool(useCards[3]), Bool(useCards[4]), Bool(useCards[5]), Bool(useCards[6])];
    const isFlushRet = Bool(isFlush);
    const merkleMapKeyRet = Field(merkleMapKey);
    const merkleMapValRet: Field = Field(merkleMapVal);

    return [useCardsRet, isFlushRet, merkleMapKeyRet, merkleMapValRet];

}