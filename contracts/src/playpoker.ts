// Modified from Hello World tutorial at https://docs.minaprotocol.com/zkapps/tutorials/hello-world
import { PoZKerApp, Actions, Streets } from './PoZKer.js';
//import { readline } from 'readline';
//const readline = require('readline');
import readline from 'readline';
import { promisify } from 'util';
import { Cipher, ElGamalFF } from 'o1js-elgamal';

const cards = ['2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh', 'Ah',
    '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd', 'Ad',
    '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc', 'Ac',
    '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks', 'As']

// import { evaluate_7_cards } from './evaluator7.js';
//ReadLine.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


import {
    isReady,
    shutdown,
    Field,
    Mina,
    PrivateKey,
    AccountUpdate,
    UInt64,
    MerkleMap,
} from 'o1js';
import { getHoleFromOracle, getFlopFromOracle, getRiverFromOracle, getTakeFromOracle } from "./oracleLib.js";


await isReady;
const useProof = false;
console.log("Welcome to PoZKer!");
console.log("Funds will be auto-deposited and gameplay will start automatically...");
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
const { privateKey: playerPrivKey1, publicKey: playerPubKey1 } = Local.testAccounts[1];
const { privateKey: playerPrivKey2, publicKey: playerPubKey2 } = Local.testAccounts[2];

// Keys for elgamal encryption/decryption
let keys1 = ElGamalFF.generateKeys();
let keys2 = ElGamalFF.generateKeys();


function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseCardInt(cardInt: number): string {
    return cards[cardInt];
}


const SLEEP_TIME_SHORT = 0; // 1000
const SLEEP_TIME_LONG = 0; //3000
const GAME_ID = getRandomInt(1, 9999999999)
console.log(" GENERATING GAME WITH ID ", GAME_ID);

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

const txn1 = await Mina.transaction(playerPubKey1, () => {
    zkAppInstance.initState(playerPubKey1, playerPubKey2)
});
await txn1.prove();
await txn1.sign([playerPrivKey1]).send();



/////////////// Stage 1 - Deposit
console.log("Auto depositing for player 1...");
const txn2 = await Mina.transaction(playerPubKey1, () => {
    zkAppInstance.deposit(playerPrivKey1)
});
await txn2.prove();
await txn2.sign([playerPrivKey1]).send();
const bal1 = zkAppInstance.stack1.get();
console.log("Player 1 Stack:", bal1.toString());

console.log("Auto depositing for player 2...");
const txn3 = await Mina.transaction(playerPubKey2, () => {
    zkAppInstance.deposit(playerPrivKey2)
});
await txn3.prove();
await txn3.sign([playerPrivKey2]).send();
const bal2 = zkAppInstance.stack2.get();
console.log("Player 2 Stack:", bal2.toString());

await sleep(SLEEP_TIME_LONG);

console.log("Dealing cards to player 1, look away player 2!");
await sleep(SLEEP_TIME_SHORT);
let card1 = -1
let card2 = -1;

const retVal = await getHoleFromOracle(GAME_ID.toString());
const retValHand = retVal.hand
card1 = retValHand[0];
card2 = retValHand[1];


// Player 1 will encrypt their cards - we'll pretend that we've done 
// shuffles and encryptions, and player 2 has decrypted their half of the
// key and that is what player2 is committing to the blockchain...
let c0 = ElGamalFF.encrypt(Field(card1), keys1.pk);
let c1 = ElGamalFF.encrypt(Field(card2), keys1.pk);

const txnC1 = await Mina.transaction(playerPubKey2, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(1);
    zkAppInstance.commitCard(slotI, c0.c1)
});
await txnC1.prove();
await txnC1.sign([playerPrivKey2]).send();

const txnC2 = await Mina.transaction(playerPubKey2, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(2);
    zkAppInstance.commitCard(slotI, c1.c1)
});
await txnC2.prove();
await txnC2.sign([playerPrivKey2]).send();

// Now player 1 can call to store a hashed version of card onchain
const txnC3 = await Mina.transaction(playerPubKey1, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(0);
    const c2a = c0.c2;
    const c2b = c1.c2;
    const cipherKeys = keys1.sk;
    const playerSecKey = playerPrivKey1;
    zkAppInstance.storeCardHash(slotI, c2a, c2b, cipherKeys, playerSecKey)
});
await txnC3.prove();
await txnC3.sign([playerPrivKey1]).send();





//const txn90 = await Mina.transaction(playerPubKey1, async () => {
//    console.log("RETVAL", retVal);
//});
//await txn90.prove();
//await txn90.sign([playerPrivKey1]).send();
console.log("player 1 hole cards:", parseCardInt(parseInt(card1.toString())), parseCardInt(parseInt(card2.toString())));
console.log("Screen will be cleared after 3 seconds...")

await sleep(SLEEP_TIME_LONG);
clear();


console.log("Dealing cards to player 2, look away player 1!");
await sleep(SLEEP_TIME_SHORT);
let card3 = -1
let card4 = -1;

const retVal2 = await getHoleFromOracle(GAME_ID.toString());
const retValHand2 = retVal2.hand
card3 = retValHand2[0];
card4 = retValHand2[1];

console.log("player 2 hole cards:", parseCardInt(parseInt(card3.toString())), parseCardInt(parseInt(card4.toString())));
console.log("Screen will be cleared after 3 seconds...")

// Exact same logic as for player 1
let c3 = ElGamalFF.encrypt(Field(card1), keys1.pk);
let c4 = ElGamalFF.encrypt(Field(card2), keys1.pk);

const txnC4 = await Mina.transaction(playerPubKey1, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(1);
    zkAppInstance.commitCard(slotI, c3.c1)
});
await txnC4.prove();
await txnC4.sign([playerPrivKey1]).send();

const txnC5 = await Mina.transaction(playerPubKey1, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(2);
    zkAppInstance.commitCard(slotI, c4.c1)
});
await txnC5.prove();
await txnC5.sign([playerPrivKey1]).send();

// Now player 1 can call to store a hashed version of card onchain
const txnC6 = await Mina.transaction(playerPubKey2, () => {
    // Have to put it in slots 1 and 2
    const slotI = Field(1);
    const c2a = c3.c2;
    const c2b = c4.c2;
    const cipherKeys = keys2.sk;
    const playerSecKey = playerPrivKey2;
    zkAppInstance.storeCardHash(slotI, c2a, c2b, cipherKeys, playerSecKey)
});
await txnC6.prove();
await txnC6.sign([playerPrivKey2]).send();

await sleep(SLEEP_TIME_LONG);
clear();


// now start game loop...
console.log("ACTIONS LIST:")
console.log("Bet: 1")
console.log("Call: 2")
console.log("Fold: 3")
console.log("Raise: 4")
console.log("Check: 5")

const actionList = ["", "Bets", "Calls", "Folds", "Raises", "Checks"]


let currStreet = zkAppInstance.street.get().toString()

const board: string[] = []
let boardPrimes = 1;

// Main game loop - keep accepting actions until hand ends
while (true) {
    const player = zkAppInstance.turnGameOver.get().toString()
    if (player == "0") {
        const action = await question("Player 1 - Choose your action\n") as number;
        // If it's a bet/call/raise - need to include amount
        let amount: number = 0;
        if (action == 1 || action == 2 || action == 4) {
            amount = await question("Player 1 - Choose amount\n") as number;
        }
        const actionField = Field(action);
        const betSize = UInt64.from(amount);
        const txn = await Mina.transaction(playerPubKey1, () => {
            zkAppInstance.takeAction(playerPrivKey1, actionField, betSize)
        });
        await txn.prove();
        await txn.sign([playerPrivKey1]).send();
        const actionStr = actionList[action];
        console.log("Player 1", actionStr)
    }
    else if (player == "1") {
        const action = await question("Player 2 - Choose your action\n") as number;
        // If it's a bet/call/raise - need to include amount
        let amount: number = 0;
        if (action == 1 || action == 2 || action == 4) {
            amount = await question("Player 2 - Choose amount\n") as number;
        }
        const actionField = Field(action);
        const betSize = UInt64.from(amount);
        const txn = await Mina.transaction(playerPubKey2, () => {
            zkAppInstance.takeAction(playerPrivKey2, actionField, betSize)
        });
        await txn.prove();
        await txn.sign([playerPrivKey2]).send();
        const actionStr = actionList[action];
        console.log("Player 2", actionStr)
    }
    else {
        // This condition would mean game is over...
        break
    }

    const street = zkAppInstance.street.get().toString()
    if (parseInt(street) == Streets.Showdown) {

        // BOTH players must show cards before we can do showdown...

        const txnA = await Mina.transaction(playerPubKey1, () => {
            const slotI = Field(0)
            // Key is SUM of primes...
            const merkleMapKey: Field = Field((card1 & 13) * (card2 & 13) * boardPrimes);
            const merkleMapVal: Field = Field(getRandomInt(0, 6500));
            const playerSecKey = playerPrivKey2;
            zkAppInstance.showCards(slotI, Field(card1 & 13), Field(card2 & 13), merkleMapKey, merkleMapVal, playerSecKey)
        });
        await txnA.prove();
        await txnA.sign([playerPrivKey1]).send();


        const txnB = await Mina.transaction(playerPubKey2, () => {
            const slotI = Field(1)
            // Key is SUM of primes...
            const merkleMapKey: Field = Field((card3 & 13) * (card4 & 13) * boardPrimes);
            const merkleMapVal: Field = Field(getRandomInt(0, 6500));
            const playerSecKey = playerPrivKey2;
            zkAppInstance.showCards(slotI, Field(card3 & 13), Field(card4 & 13), merkleMapKey, merkleMapVal, playerSecKey)
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
        if (parseInt(street) == Streets.Flop) {
            console.log("DEALING FLOP...")
            let flop = await getFlopFromOracle(GAME_ID.toString());
            let flopHand = flop.hand
            board.push(parseCardInt(parseInt(flopHand[0])));
            board.push(parseCardInt(parseInt(flopHand[1])));
            board.push(parseCardInt(parseInt(flopHand[2])));
            console.log("BOARD IS", board);

            // We have to keep track of the board cards...
            const cardPrime1 = flopHand[0] % 13;
            const cardPrime2 = flopHand[1] % 13;
            const cardPrime3 = flopHand[2] % 13;
            // have to keep our own tally of primes...
            boardPrimes *= cardPrime1;
            boardPrimes *= cardPrime2;
            boardPrimes *= cardPrime3;
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
        else if (parseInt(street) == Streets.Turn) {
            console.log("DEALING TURN...")
            let take = await getTakeFromOracle(GAME_ID.toString());
            let takeHand = take.hand
            board.push(parseCardInt(parseInt(takeHand[0])));
            console.log("BOARD IS", board);

            const cardPrime1 = (takeHand[0] % 13);
            boardPrimes *= cardPrime1;
            const txnA = await Mina.transaction(playerPubKey2, () => {
                zkAppInstance.tallyBoardCards(Field(cardPrime1))
            });
            await txnA.prove();
            await txnA.sign([playerPrivKey2]).send();

        }
    }
    else if (parseInt(street) == Streets.River) {
        console.log("DEALING RIVER...")
        let river = await getRiverFromOracle(GAME_ID.toString());
        let riverHand = river.hand
        board.push(parseCardInt(parseInt(riverHand[0])));
        console.log("BOARD IS", board);

        const cardPrime1 = riverHand[0] % 13;
        boardPrimes *= cardPrime1;
        const txnA = await Mina.transaction(playerPubKey2, () => {
            zkAppInstance.tallyBoardCards(Field(cardPrime1))
        });
        await txnA.prove();
        await txnA.sign([playerPrivKey2]).send();
    }
    currStreet = street;
}





const bal3 = zkAppInstance.stack1.get().toString();
const bal4 = zkAppInstance.stack2.get().toString();
console.log("Hand Complete!")
console.log("End Balances", bal3, bal4);
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