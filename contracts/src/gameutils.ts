import {
    Field,
    MerkleMapWitness,
    Bool,
    UInt64,
    PrivateKey,
    PublicKey,
} from 'o1js';
import fs from 'fs';
import { cardMapping52, actionMapping } from './PoZKer.js';
import { getCardFromOracle } from "./oracleLib.js";
import { MerkleMapSerializable, deserialize } from './merkle_map_serializable.js';


export type CardStr = '2d' | '3d' | '4d' | '5d' | '6d' | '7d' | '8d' | '9d' | 'Td' | 'Jd' | 'Qd' | 'Kd' | 'Ad' | '2c' | '3c' | '4c' | '5c' | '6c' | '7c' | '8c' | '9c' | 'Tc' | 'Jc' | 'Qc' | 'Kc' | 'Ac' | '2h' | '3h' | '4h' | '5h' | '6h' | '7h' | '8h' | '9h' | 'Th' | 'Jh' | 'Qh' | 'Kh' | 'Ah' | '2s' | '3s' | '4s' | '5s' | '6s' | '7s' | '8s' | '9s' | 'Ts' | 'Js' | 'Qs' | 'Ks' | 'As';

const cards: CardStr[] = ['2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh', 'Ah',
    '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd', 'Ad',
    '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc', 'Ac',
    '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks', 'As']

// TODO - don't like that we're loading this here, any way we could refactor?
const fnBasic = 'lookup_table_basic.json';
const fnFlush = 'lookup_table_flushes.json';
const lookupTableBasic = JSON.parse(fs.readFileSync(fnBasic, 'utf-8'));
const lookupTableFlushes = JSON.parse(fs.readFileSync(fnFlush, 'utf-8'));

export function parseCardInt(cardInt: number): CardStr {
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
        let w = merkleMapFlush.getWitness(merkleMapKey);
        witness = new MerkleMapWitness(w.isLefts, w.siblings);
    }
    else {
        let w = merkleMapBasic.getWitness(merkleMapKey);
        witness = new MerkleMapWitness(w.isLefts, w.siblings);
    }
    return witness;
}


// TODO - we're not currently using this, should we switch back to it?
// Want mapping from prime52 encoding (in cardMapping52) back to the 0..51 indexes for our lookups
type Prime52ToCardType = {
    [key: number]: number;
};

const prime52ToCard: Prime52ToCardType = {
}

for (const [key, value] of Object.entries(cardMapping52)) {
    // key, value would be like
    // "7c": 131,
    // console.log(key, value);
    const card: CardStr = key as CardStr;
    const cardIndex = cards.indexOf(card);
    prime52ToCard[value] = cardIndex;
}

function _getSuit(card: number): String {
    // get suit from the ccard in cardMapping52 format
    if ((2 <= card) && (card <= 41)) {
        return "H";
    }
    else if ((43 <= card) && (card <= 101)) {
        return "D";
    }
    else if ((103 <= card) && (card <= 167)) {
        return "C";
    }
    else if ((173 <= card) && (card <= 239)) {
        return "S";
    }
    return "-";
}

function flushCheck(card1: number, card2: number, card3: number, card4: number, card5: number): boolean {
    // It's sufficient to get the suit of the first card and compare cards 2-5 to it
    const suit0 = _getSuit(card1);

    const otherCards = [card2, card3, card4, card5];
    for (let i = 0; i < 4; i++) {
        const card = otherCards[i];
        const suit = _getSuit(card);
        if (suit != suit0) {
            return false;
        }
    }
    return true;
}

const cardMapping52to13: { [key: number]: number } = { 2: 2, 3: 3, 5: 5, 7: 7, 11: 11, 13: 13, 17: 17, 19: 19, 23: 23, 29: 29, 31: 31, 37: 37, 41: 41, 43: 2, 47: 3, 53: 5, 59: 7, 61: 11, 67: 13, 71: 17, 73: 19, 79: 23, 83: 29, 89: 31, 97: 37, 101: 41, 103: 2, 107: 3, 109: 5, 113: 7, 127: 11, 131: 13, 137: 17, 139: 19, 149: 23, 151: 29, 157: 31, 163: 37, 167: 41, 173: 2, 179: 3, 181: 5, 191: 7, 193: 11, 197: 13, 199: 17, 211: 19, 223: 23, 227: 29, 229: 31, 233: 37, 239: 41 };

function _calcLookupKey(card1: number, card2: number, card3: number, card4: number, card5: number): number {
    // Remember - hand is in cardMapping52 prime format
    // get a map from 52 prime to 13 prime lookup values
    // and then multiply together
    let lookupKey = 1;
    const cards = [card1, card2, card3, card4, card5];
    for (let i = 0; i < 5; i++) {
        const card = cards[i];
        const cardVal = cardMapping52to13[card];
        lookupKey = lookupKey * cardVal;
    }
    return lookupKey;
}

function evaluateHand(card1: number, card2: number, card3: number, card4: number, card5: number): [number, number, boolean] {

    const lookupKey = _calcLookupKey(card1, card2, card3, card4, card5)
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
        // const cardIndex = prime52ToCard[prime52];
        // allCards[i] = cardIndex;
        allCards[i] = prime52;
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

                        // console.log("GOT CARDS, CALCULATING VAL")
                        // console.log(card1, card2, card3, card4, card5);

                        const [merkleMapKey_, merkleMapVal_, isFlush_] = evaluateHand(card1, card2, card3, card4, card5);
                        // console.log("LOOKING UP", merkleMapKey_, merkleMapVal_, isFlush_)
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


function parseOracleResp(cardHand0: number) {
    const cardInt = cardHand0 - 1;
    return cardInt;
}

export async function getCardAndPrime(GAME_ID: number) {
    // Return both a card integer (0 to 51) and its prime52 value
    const cardr = await getCardFromOracle(GAME_ID.toString());
    // Takes care of subtracting one because oracle responses are 1..52 instead of 0..51
    const card = parseOracleResp(cardr.hand[0]);
    const cardPrime52 = cardMapping52[parseCardInt(card)];
    return [card, cardPrime52];
}


const P1 = actionMapping["P1"];
const P2 = actionMapping["P2"];
const PREFLOP = actionMapping["Preflop"];
const FLOP = actionMapping["Flop"];
const TURN = actionMapping["Turn"];
const RIVER = actionMapping["River"];
const SHOWDOWNPENDING = actionMapping["ShowdownPending"];
// const GAMEOVER = actionMapping["GameOver"]


export function getStreet(gamestate: number) {
    if (gamestate % PREFLOP == 0) {
        return "Preflop";
    }
    else if (gamestate % FLOP == 0) {
        return "Flop";
    }
    else if (gamestate % TURN == 0) {
        return "Turn";
    }
    else if (gamestate % RIVER == 0) {
        return "River";
    }
    else if (gamestate % SHOWDOWNPENDING == 0) {
        return "ShowdownPending";
    }
    throw "Invalid street!";
}

export function getPlayer(gamestate: number) {
    if (gamestate % P1 == 0) {
        return "p1";
    }
    else if (gamestate % P2 == 0) {
        return "p2";
    }
    throw "Invalid player!";
}


// We need public keys as points for our mental poker encryption scheme,
// it's acceptable to make these points deterministic
export function cardPrimeToPublicKey(cardPrime: number): PublicKey {
    return PrivateKey.fromBigInt(BigInt(cardPrime)).toPublicKey();
}

// Want to return a mapping that will allow us to recover the card
// from the public key generated with cardPrimeToPublicKey
// This will map back to the card str!
export function buildCardMapping(cardMapping52: Record<string, number>): Record<string, string> {
    // Example usage
    const keyToCard: Record<string, string> = {}

    for (const [key, value] of Object.entries(cardMapping52)) {
        if (key === "") {
            continue
        }
        const publicKey: PublicKey = cardPrimeToPublicKey(value)
        const publicKeyStr: string = publicKey.toBase58();
        keyToCard[publicKeyStr] = key;
    }
    return keyToCard;
}


// fisher-yates shuffle, from chatgpt
export function shuffleCards(inputArray: number[]): number[] {
    // Clone the input array to avoid modifying the original array
    const array = [...inputArray];

    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index between 0 and i (inclusive)
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap the elements at randomIndex and i
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }

    return array;
}
