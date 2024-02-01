// Modified from Hello World tutorial at https://docs.minaprotocol.com/zkapps/tutorials/hello-world
import { PoZKerApp, actionMapping, cardMapping52, Stacks } from './PoZKer.js';
//import { readline } from 'readline';
//const readline = require('readline');
import readline from 'readline';
import fs from 'fs';
import { promisify } from 'util';
import {
    isReady,
    shutdown,
    Field,
    Mina,
    PrivateKey,
    PublicKey,
    AccountUpdate,
    UInt32,
    UInt64,
    MerkleMapWitness,
} from 'o1js';
import { MerkleMapSerializable, deserialize } from './merkle_map_serializable.js';
import { CardStr, getMerkleMapWitness, getShowdownData, getPlayer, getStreet, shuffleCards } from './gameutils.js';
import { Card, addPlayerToCardMask, mask, partialUnmask, createNewCard, cardPrimeToPublicKey, getCardAndPrimeHalf, getCardAndPrime, hashShuffledDeck } from './mentalpoker.js';

await isReady;

// import { evaluate_7_cards } from './evaluator7.js';
//ReadLine.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const useProof = false;
console.log("Welcome to PoZKer!");
console.log("Funds will be auto-deposited and gameplay will start automatically...");
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
const { privateKey: fundedPrivKey1, publicKey: fundedPubKey1 } = Local.testAccounts[1];
//const { privateKey: playerPrivKey2, publicKey: playerPubKey2 } = Local.testAccounts[2];

const playerPrivKey1: PrivateKey = PrivateKey.fromBase58("EKE3TZ7PYTyf4XSyEcqCUuyFZAtiW5w9Enm5PUjruTLFUHangY3k");;
const playerPubKey1 = playerPrivKey1.toPublicKey();
const playerPrivKey2: PrivateKey = PrivateKey.fromBase58("EKErvBujci5uiqL5nBv5kBP5d2MMz2zE8E5EtdZZPSF6p7AhzSK5");;
const playerPubKey2 = playerPrivKey2.toPublicKey();


// Load merkle maps for our hand lookups
const merkleMapBasicFn = "merkleMapBasic.json"
const merkleMapFlushFn = "merkleMapFlush.json"

const jsonDataBasic = fs.readFileSync(merkleMapBasicFn, 'utf8');
const merkleMapBasic: MerkleMapSerializable = deserialize(jsonDataBasic);

const jsonDataFlush = fs.readFileSync(merkleMapFlushFn, 'utf8');
const merkleMapFlush: MerkleMapSerializable = deserialize(jsonDataFlush);

// These have to be stored in PoZKer class!
// console.log(merkleMapBasic.getRoot())
// console.log(merkleMapFlush.getRoot())

// Keys for card encryption/decryption
const shuffleKeyP1 = PrivateKey.random()
const shuffleKeyP2 = PrivateKey.random()



// This is a mapping from the publicKey.toBase58() of the cards
// to their string value, B62abcdefg... -> 5h
// const cardMapping = buildCardMapping(cardMapping52)
// console.log(cardMapping)
// throw ("FU");

// Have to encode all cards and perform shuffle!
const cards: Card[] = []
for (const [key, value] of Object.entries(cardMapping52)) {
    const cardPoint: PublicKey = cardPrimeToPublicKey(value)
    let card = createNewCard(cardPoint.toGroup())
    cards.push(card);
    // const publicKeyStr: string = publicKey.toBase58();
    //keyToCard[publicKeyStr]
}

// Player 1's round - shuffle and encrypt
let shuffledCardsR1 = shuffleCards(cards);
for (let i = 0; i < shuffledCardsR1.length; i++) {
    let card = addPlayerToCardMask(shuffledCardsR1[i], shuffleKeyP1);
    card = mask(card);
    shuffledCardsR1[i] = card;
}

// Player 2's round - shuffle and encrypt
let shuffledCards = shuffleCards(shuffledCardsR1);
for (let i = 0; i < shuffledCards.length; i++) {
    let card = addPlayerToCardMask(shuffledCards[i], shuffleKeyP2);
    card = mask(card);
    shuffledCards[i] = card;
}

// So each playeyr should be able to do this and get the same hash...
// Need to separate shuffles and then how can they exchange hashes?
const hash1 = hashShuffledDeck(shuffledCards)
const hash2 = hashShuffledDeck(shuffledCards)
if (hash1 != hash2) {
    throw ("Bad hashes!")
}


function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SLEEP_TIME_SHORT = 0; // 1000;
const SLEEP_TIME_LONG = 0; //3000;

//console.log("ACCOUNTS", playerPubKey1.toBase58(), playerPubKey2.toBase58());

function question(theQuestion: string) {
    return new Promise(resolve => rl.question(theQuestion, answ => resolve(answ)))
}

function clear() {
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearLine(process.stdout, 0);
    readline.clearScreenDown(process.stdout);
}

const sleep = promisify(setTimeout);

// ----------------------------------------------------
// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();
const zkAppInstance = new PoZKerApp(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
// ----------------------------------------------------


// Same logic as function in ZK app except we don't need getAndAssertEquals
function getStacks(): [UInt32, UInt32] {
    const stacks = zkAppInstance.stacks.get();
    const unpacked = Stacks.unpack(stacks.packed);
    return [unpacked[0], unpacked[1]]
}




let txSend1 = await Mina.transaction(fundedPubKey1, () => {
    AccountUpdate.fundNewAccount(fundedPubKey1).send({
        to: playerPubKey1,
        amount: 100,
    });
});
await txSend1.prove();
await txSend1.sign([fundedPrivKey1]).send();

let txSend2 = await Mina.transaction(fundedPubKey1, () => {
    AccountUpdate.fundNewAccount(fundedPubKey1).send({
        to: playerPubKey2,
        amount: 100,
    });
});
await txSend2.prove();
await txSend2.sign([fundedPrivKey1]).send();


/////////////// Stage 0 - Set players
const txn = await Mina.transaction(fundedPubKey1, () => {
    zkAppInstance.initState(playerPubKey1, playerPubKey2)
});
await txn.prove();
await txn.sign([fundedPrivKey1]).send();
console.log("Initialized players...");


/////////////// Stage 1 - Deposit
console.log("Auto depositing for player 1...");
const txn2 = await Mina.transaction(playerPubKey1, () => {
    zkAppInstance.deposit(playerPrivKey1)
});
await txn2.prove();
await txn2.sign([playerPrivKey1]).send();
const bal1 = getStacks()[0];
console.log("Player 1 Stack:", bal1.toString());

console.log("Auto depositing for player 2...");
const txn3 = await Mina.transaction(playerPubKey2, () => {
    zkAppInstance.deposit(playerPrivKey2)
});
await txn3.prove();
await txn3.sign([playerPrivKey2]).send();
const bal2 = getStacks()[1];
console.log("Player 2 Stack:", bal2.toString());

await sleep(SLEEP_TIME_LONG);

console.log("Dealing cards to player 1, look away player 2!");
await sleep(SLEEP_TIME_SHORT);


// Each player needs to halfway decrypt and then commit the card for the other player

// player 1 cards are first two
let card1 = shuffledCards[0];
let card2 = shuffledCards[1];
// player 2 should partially unmask and then commit
card1 = partialUnmask(card1, shuffleKeyP2);
card2 = partialUnmask(card2, shuffleKeyP2);


// And inverse for player 1
let card3 = shuffledCards[2];
let card4 = shuffledCards[3];
card3 = partialUnmask(card3, shuffleKeyP1);
card4 = partialUnmask(card4, shuffleKeyP1);



// Now the players can finish decoding their cards
const card1Str = getCardAndPrimeHalf(card1, shuffleKeyP1)
const card2Str = getCardAndPrimeHalf(card2, shuffleKeyP1)
const card3Str = getCardAndPrimeHalf(card3, shuffleKeyP2)
const card4Str = getCardAndPrimeHalf(card4, shuffleKeyP2)
const card1prime52 = cardMapping52[card1Str as CardStr]
const card2prime52 = cardMapping52[card2Str as CardStr]
const card3prime52 = cardMapping52[card3Str as CardStr]
const card4prime52 = cardMapping52[card4Str as CardStr]

const txnC1 = await Mina.transaction(playerPubKey2, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(1);
    zkAppInstance.commitCard(slotI, PublicKey.fromGroup(card1.msg))
});
await txnC1.prove();
await txnC1.sign([playerPrivKey2]).send();

const txnC2 = await Mina.transaction(playerPubKey2, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(2);
    zkAppInstance.commitCard(slotI, PublicKey.fromGroup(card2.msg))
});
await txnC2.prove();
await txnC2.sign([playerPrivKey2]).send();

// Now player 1 can call to store a hashed version of card onchain
const txnC3 = await Mina.transaction(playerPubKey1, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(0);

    const c1m = PublicKey.fromGroup(card1.msg);
    const c1e = PublicKey.fromGroup(card1.epk);
    const c2m = PublicKey.fromGroup(card2.msg);
    const c2e = PublicKey.fromGroup(card2.epk);
    zkAppInstance.storeCardHash(slotI, shuffleKeyP1, c1e, c2e, c1m, c2m);
});
await txnC3.prove();
await txnC3.sign([playerPrivKey1]).send();


console.log("player 1 hole cards:", card1Str, card2Str)
console.log("Screen will be cleared after 3 seconds...")

await sleep(SLEEP_TIME_LONG);
// clear();


console.log("Dealing cards to player 2, look away player 1!");
await sleep(SLEEP_TIME_SHORT);

console.log("player 2 hole cards:", card3Str, card4Str)
console.log("Screen will be cleared after 3 seconds...")

const txnC4 = await Mina.transaction(playerPubKey1, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(1);
    zkAppInstance.commitCard(slotI, PublicKey.fromGroup(card3.msg))
});
await txnC4.prove();
await txnC4.sign([playerPrivKey1]).send();

const txnC5 = await Mina.transaction(playerPubKey1, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(2);
    zkAppInstance.commitCard(slotI, PublicKey.fromGroup(card4.msg))
});
await txnC5.prove();
await txnC5.sign([playerPrivKey1]).send();

// Now player 1 can call to store a hashed version of card onchain
const txnC6 = await Mina.transaction(playerPubKey2, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(1);
    // const playerSecKey = playerPrivKey2;

    const c3m = PublicKey.fromGroup(card3.msg);
    const c3e = PublicKey.fromGroup(card3.epk);
    const c4m = PublicKey.fromGroup(card4.msg);
    const c4e = PublicKey.fromGroup(card4.epk);
    zkAppInstance.storeCardHash(slotI, shuffleKeyP2, c3e, c4e, c3m, c4m);

});
await txnC6.prove();
await txnC6.sign([playerPrivKey2]).send();

await sleep(SLEEP_TIME_LONG);
// clear();


// now start game loop...
console.log("POSSIBLE ACTIONS: bet, call, fold, raise, check")

// user will enter string of their action but we need the corresponding prime
const actionMap: { [key: string]: number } = {
    "bet": actionMapping["Bet"],
    "call": actionMapping["Call"],
    "fold": actionMapping["Fold"],
    "raise": actionMapping["Raise"],
    "check": actionMapping["Check"],
};


// let gamestate = parseInt(zkAppInstance.gamestate.get().toString());
let currStreet = "Preflop";

const boardStrs: CardStr[] = []
const boardPrimes: UInt64[] = []



// Main game loop - keep accepting actions until hand ends
while (true) {
    let gamestate = parseInt(zkAppInstance.gamestate.get().toString());

    // let player: string = lastAction < LastActions.Bet_P1 ? "0" : "1";
    let player: string = getPlayer(gamestate);

    if (player === "p1") {
        const actionStr: string = await question("Player 1 - Choose your action\n") as string;
        // If it's a bet/raise - need to include amount
        let amount: number = 0;
        if (actionStr == "bet" || actionStr == "raise") {
            amount = await question("Player 1 - Choose amount\n") as number;
        }
        const actionField = UInt64.from(actionMap[actionStr]);
        const betSize = UInt32.from(amount);
        const txn = await Mina.transaction(playerPubKey1, () => {
            zkAppInstance.takeAction(playerPrivKey1, actionField, betSize)
        });
        await txn.prove();
        await txn.sign([playerPrivKey1]).send();
        //const actionStr = actionList[action];
        console.log("Player 1", actionStr)
    }
    else if (player === "p2") {
        const actionStr: string = await question("Player 2 - Choose your action\n") as string;
        // If it's a bet/call/raise - need to include amount
        let amount: number = 0;
        if (actionStr == "bet" || actionStr == "raise") {
            amount = await question("Player 2 - Choose amount\n") as number;
        }
        const actionField = UInt64.from(actionMap[actionStr]);
        const betSize = UInt32.from(amount);
        const txn = await Mina.transaction(playerPubKey2, () => {
            zkAppInstance.takeAction(playerPrivKey2, actionField, betSize);
        });
        await txn.prove();
        await txn.sign([playerPrivKey2]).send();
        console.log("Player 2", actionStr)
    }
    else {
        // This condition would mean game is over...
        break
    }

    gamestate = parseInt(zkAppInstance.gamestate.get().toString());
    let street = getStreet(gamestate);
    // const street = zkAppInstance.street.get().toString()
    if (street == "ShowdownPending") {
        // BOTH players must show cards before we can do showdown...

        const allCardsP1: [UInt64, UInt64, UInt64, UInt64, UInt64, UInt64, UInt64] = [UInt64.from(card1prime52), UInt64.from(card2prime52), boardPrimes[0], boardPrimes[1], boardPrimes[2], boardPrimes[3], boardPrimes[4]]
        const [useCardsP1, isFlushP1, merkleMapKeyP1, merkleMapValP1] = getShowdownData(allCardsP1);
        const pathP1: MerkleMapWitness = getMerkleMapWitness(merkleMapBasic, merkleMapFlush, isFlushP1.toBoolean(), merkleMapKeyP1)

        const allCardsP2: [UInt64, UInt64, UInt64, UInt64, UInt64, UInt64, UInt64] = [UInt64.from(card3prime52), UInt64.from(card4prime52), boardPrimes[0], boardPrimes[1], boardPrimes[2], boardPrimes[3], boardPrimes[4]]
        const [useCardsP2, isFlushP2, merkleMapKeyP2, merkleMapValP2] = getShowdownData(allCardsP2);
        const pathP2: MerkleMapWitness = getMerkleMapWitness(merkleMapBasic, merkleMapFlush, isFlushP2.toBoolean(), merkleMapKeyP2)

        const txnA = await Mina.transaction(playerPubKey1, () => {
            zkAppInstance.showCards(allCardsP1[0],
                allCardsP1[1],
                allCardsP1[2],
                allCardsP1[3],
                allCardsP1[4],
                allCardsP1[5],
                allCardsP1[6],
                useCardsP1[0],
                useCardsP1[1],
                useCardsP1[2],
                useCardsP1[3],
                useCardsP1[4],
                useCardsP1[5],
                useCardsP1[6],
                isFlushP1,
                playerPrivKey1,
                shuffleKeyP1,
                merkleMapKeyP1,
                merkleMapValP1,
                pathP1,
            )
        });
        await txnA.prove();
        await txnA.sign([playerPrivKey1]).send();


        const txnB = await Mina.transaction(playerPubKey2, () => {
            zkAppInstance.showCards(allCardsP2[0],
                allCardsP2[1],
                allCardsP2[2],
                allCardsP2[3],
                allCardsP2[4],
                allCardsP2[5],
                allCardsP2[6],
                useCardsP2[0],
                useCardsP2[1],
                useCardsP2[2],
                useCardsP2[3],
                useCardsP2[4],
                useCardsP2[5],
                useCardsP2[6],
                isFlushP2,
                playerPrivKey2,
                shuffleKeyP2,
                merkleMapKeyP2,
                merkleMapValP2,
                pathP2,
            )
        });
        await txnB.prove();
        await txnB.sign([playerPrivKey2]).send();

        // Showdown means no more actions, need to handle card logic though
        // showdown(v1: Field, v2: Field)
        const txn = await Mina.transaction(playerPubKey2, () => {
            zkAppInstance.showdown()
        });
        await txn.prove();
        await txn.sign([playerPrivKey2]).send();

        break
    }
    // If it was a street transition, need to get board cards
    else if (currStreet != street) {
        if (street == "Flop") {
            console.log("DEALING FLOP...")

            const flop1 = getCardAndPrime(shuffledCards[4], shuffleKeyP1, shuffleKeyP2)
            const flop2 = getCardAndPrime(shuffledCards[5], shuffleKeyP1, shuffleKeyP2)
            const flop3 = getCardAndPrime(shuffledCards[6], shuffleKeyP1, shuffleKeyP2)
            const cardPrime1 = cardMapping52[flop1 as CardStr]
            const cardPrime2 = cardMapping52[flop2 as CardStr]
            const cardPrime3 = cardMapping52[flop3 as CardStr]

            boardStrs.push(flop1 as CardStr)
            boardStrs.push(flop2 as CardStr);
            boardStrs.push(flop3 as CardStr);
            console.log("BOARD IS", boardStrs);

            boardPrimes.push(UInt64.from(cardPrime1));
            boardPrimes.push(UInt64.from(cardPrime2));
            boardPrimes.push(UInt64.from(cardPrime3));

            // have to keep our own tally of primes...
            const txnA = await Mina.transaction(playerPubKey2, () => {
                zkAppInstance.tallyBoardCards(Field(cardPrime1))
            });
            await txnA.prove();
            await txnA.sign([playerPrivKey2]).send();

            const txnB = await Mina.transaction(playerPubKey2, () => {
                zkAppInstance.tallyBoardCards(Field(cardPrime2))
            });
            await txnB.prove();
            await txnB.sign([playerPrivKey2]).send();

            const txnC = await Mina.transaction(playerPubKey2, () => {
                zkAppInstance.tallyBoardCards(Field(cardPrime3))
            });
            await txnC.prove();
            await txnC.sign([playerPrivKey2]).send();

        }
        else if (street == "Turn") {
            console.log("DEALING TURN...")
            // let turn = await getTakeFromOracle(GAME_ID.toString());
            // let turnHand: Card = turn.hand[0]
            //boardStrs.push(parseCardInt(parseInt(turnHand)));
            const turn = getCardAndPrime(shuffledCards[7], shuffleKeyP1, shuffleKeyP2)
            const cardPrime1 = cardMapping52[turn as CardStr]

            boardStrs.push(turn as CardStr);
            console.log("BOARD IS", boardStrs);

            boardPrimes.push(UInt64.from(cardPrime1));

            const txnA = await Mina.transaction(playerPubKey2, () => {
                zkAppInstance.tallyBoardCards(Field(cardPrime1))
            });
            await txnA.prove();
            await txnA.sign([playerPrivKey2]).send();

        }
        else if (street == "River") {
            console.log("DEALING RIVER...")

            const river = getCardAndPrime(shuffledCards[8], shuffleKeyP1, shuffleKeyP2)
            const cardPrime1 = cardMapping52[river as CardStr]
            boardStrs.push(river as CardStr);

            console.log("BOARD IS", boardStrs);

            boardPrimes.push(UInt64.from(cardPrime1));

            const txnA = await Mina.transaction(playerPubKey2, () => {
                zkAppInstance.tallyBoardCards(Field(cardPrime1))
            });
            await txnA.prove();
            await txnA.sign([playerPrivKey2]).send();
        }
        currStreet = street;
    }
}

// Sanity check - should always be in GameOver state here...
const gamestate = parseInt(zkAppInstance.gamestate.get().toString());
console.log("gamestate", gamestate)
if (gamestate != actionMapping["GameOver"]) {
    throw "Invalid game state!";
}

const [bal3, bal4] = getStacks()
console.log("Hand Complete!")
console.log("End Balances", bal3.toString(), bal4.toString());
if (bal3 == bal4) {
    console.log("Hand was a tie!")
}
else {
    const p1winner = bal3 > bal4;
    if (p1winner) {
        console.log("Player 1 wins!")
    }
    else {
        console.log("Player 2 wins!")
    }
}

console.log("Withdrawing balances...")

const txn11 = await Mina.transaction(playerPubKey2, () => {
    zkAppInstance.withdraw(playerPrivKey2)
});
await txn11.prove();
await txn11.sign([playerPrivKey2]).send();


const txn12 = await Mina.transaction(playerPubKey1, () => {
    zkAppInstance.withdraw(playerPrivKey1)
});
await txn12.prove();
await txn12.sign([playerPrivKey1]).send();


// ----------------------------------------------------
await shutdown();
rl.close();