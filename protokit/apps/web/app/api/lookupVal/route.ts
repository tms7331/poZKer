import { promises as fs } from 'fs';
import path from 'path';

function flushCheck(card1: number, card2: number, card3: number, card4: number, card5: number): boolean {
    // These are the prime52 values, can just check if all the cards are in the same range
    const h0 = 2;
    const h1 = 41;
    const d0 = 43
    const d1 = 101;
    const c0 = 103;
    const c1 = 167;
    const s0 = 173;
    const s1 = 239;

    const cards = [card1, card2, card3, card4, card5];

    const hearts: boolean = cards.every(card => h0 <= card && card <= h1);
    const diamonds: boolean = cards.every(card => d0 <= card && card <= d1);
    const clubs: boolean = cards.every(card => c0 <= card && card <= c1);
    const spades: boolean = cards.every(card => s0 <= card && card <= s1);
    return hearts || diamonds || clubs || spades
}

const cardMapping52to13: { [key: number]: number } = { 2: 2, 3: 3, 5: 5, 7: 7, 11: 11, 13: 13, 17: 17, 19: 19, 23: 23, 29: 29, 31: 31, 37: 37, 41: 41, 43: 2, 47: 3, 53: 5, 59: 7, 61: 11, 67: 13, 71: 17, 73: 19, 79: 23, 83: 29, 89: 31, 97: 37, 101: 41, 103: 2, 107: 3, 109: 5, 113: 7, 127: 11, 131: 13, 137: 17, 139: 19, 149: 23, 151: 29, 157: 31, 163: 37, 167: 41, 173: 2, 179: 3, 181: 5, 191: 7, 193: 11, 197: 13, 199: 17, 211: 19, 223: 23, 227: 29, 229: 31, 233: 37, 239: 41 }

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


function evaluateHand(
    dataMapBasic: { [key: string]: number },
    dataMapFlush: { [key: string]: number },
    card1: number, card2: number, card3: number, card4: number, card5: number): [number, number, boolean] {

    // Cards are currently in prime52 format
    // but we need them in prime13 format for the lookup
    const lookupKey: number = _calcLookupKey(card1, card2, card3, card4, card5)
    let lookupVal = dataMapBasic[lookupKey.toString()];

    const isFlush = flushCheck(card1, card2, card3, card4, card5)
    // For five card hands - if it's a flush it will always be best hand
    // so can overwrite lookupVal
    if (isFlush) {
        lookupVal = dataMapFlush[lookupKey.toString()];
    }
    return [lookupKey, lookupVal, isFlush];
}

export function getShowdownData(
    dataMapBasic: { [key: string]: number },
    dataMapFlush: { [key: string]: number },
    allCards: [number, number, number, number, number, number, number]):
    [[boolean, boolean, boolean, boolean, boolean, boolean, boolean],
        boolean,
        number,
        number] {

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

                        const [merkleMapKey_, merkleMapVal_, isFlush_] = evaluateHand(dataMapBasic, dataMapFlush, card1, card2, card3, card4, card5);
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
    return [useCards, isFlush, merkleMapKey, merkleMapVal]
}


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const card0prime52 = searchParams.get("card0prime52");
    const card1prime52 = searchParams.get("card1prime52");
    const boardcard0 = searchParams.get("boardcard0");
    const boardcard1 = searchParams.get("boardcard1");
    const boardcard2 = searchParams.get("boardcard2");
    const boardcard3 = searchParams.get("boardcard3");
    const boardcard4 = searchParams.get("boardcard4");

    const allCards: [number, number, number, number, number, number, number] = [Number(card0prime52), Number(card1prime52), Number(boardcard0), Number(boardcard1), Number(boardcard2), Number(boardcard3), Number(boardcard4)];

    const fnBasic = path.join(process.cwd(), './lookup_table_basic.json');
    const fnFlush = path.join(process.cwd(), './lookup_table_flushes.json');

    const jsonDataBasic = await fs.readFile(fnBasic, 'utf8'); // fs.readFileSync(merkleMapFlushFn, 'utf8');
    const jsonDataFlush = await fs.readFile(fnFlush, 'utf8'); // fs.readFileSync(merkleMapFlushFn, 'utf8');

    const dataMapBasic: { [key: string]: number } = JSON.parse(jsonDataBasic)
    const dataMapFlush: { [key: string]: number } = JSON.parse(jsonDataFlush)

    // Now run lookup for these values
    const [useCards, isFlush, merkleMapKey, merkleMapVal] = getShowdownData(dataMapBasic, dataMapFlush, allCards);

    // const fourAces = 41 * 41 * 41 * 41 * 37
    // should be 10
    // const lookupVal = dataMapBasic[fourAces.toString()];

    let jsonData = {
        "useCards": useCards,
        "isFlush": isFlush,
        "merkleMapKey": merkleMapKey,
        "merkleMapVal": merkleMapVal,
        "witnessPath": "",
    };

    return new Response(JSON.stringify(jsonData));
}