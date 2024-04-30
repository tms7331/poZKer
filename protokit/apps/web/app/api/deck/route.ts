import { promises as fs } from 'fs';
import path from 'path';

function getNewShuffledDeck(): number[] {
    const cards = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239];
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Pick a random index from 0 to i
        // Swap elements between i and j
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards
}

// Instead of writing to a file just store the decks in memory?
// Need some way to clean up though...
const deckStore: { [key: string]: number[] } = {
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const handId = searchParams.get("handId");
    const seatI = searchParams.get("seatI");
    const cardKey = searchParams.get("cardKey");

    // If handId doesn't exist we should create a deck and shuffle it
    // otherwise load it and return specific cards...
    let deck: number[] = [];
    let matched = false;
    if (deckStore.hasOwnProperty(handId!)) {
        deck = deckStore[handId!];
        matched = true;
    }
    else {
        deck = getNewShuffledDeck();
        deckStore[handId!] = deck;
    }

    // If we're getting holecards then seatI matters, otherwise it shouldn't
    let ind0 = 0;
    let ind1 = 0;
    if (cardKey === "holeCards") {
        if (seatI === "0") {
            ind0 = 0;
            ind1 = 2;
        }
        else if (seatI === "1") {
            ind0 = 2;
            ind1 = 4;
        }
    }
    else if (cardKey === "flop") {
        ind0 = 4;
        ind1 = 7;
    }
    // For simplicity, with turn/river still return 3 cards
    // even though we'll only use the first one
    else if (cardKey === "turn") {
        ind0 = 7;
        ind1 = 10;
    }
    else if (cardKey === "river") {
        ind0 = 10;
        ind1 = 13;
    }
    const returnCards = deck.slice(ind0, ind1);
    let jsonData = { "cards": returnCards, "matched": matched };
    return new Response(JSON.stringify(jsonData));
}

export async function POST(req: Request) {
    // When player returns the shuffled deck they'll call this endpoint
    const res = await req.json();
    const data2 = res['data2'];

    // Write the entire deck to a file
    let jsonData = { "newObj": data2 };
    return new Response(JSON.stringify(jsonData));
}