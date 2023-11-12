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


const SLEEP_TIME_SHORT = 1000
const SLEEP_TIME_LONG = 3000
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

//const txn90 = await Mina.transaction(playerPubKey1, async () => {
//    console.log("RETVAL", retVal);
//});
//await txn90.prove();
//await txn90.sign([playerPrivKey1]).send();
console.log("player 1 hole cards:", parseCardInt(parseInt(card1.toString())), parseCardInt(parseInt(card2.toString())));
console.log("Screen will be cleared after 3 seconds...")

await sleep(SLEEP_TIME_LONG);
//clear();


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

await sleep(SLEEP_TIME_LONG);
//clear();


// now start game loop...
console.log("ACTIONS LIST:")
console.log("Bet: 1")
console.log("Call: 2")
console.log("Fold: 3")
console.log("Raise: 4")
console.log("Check: 5")

const actionMap = {
    1: "Bet",
    2: "Call",
    3: "Fold",
    4: "Raise",
    5: "Check",
}

let currStreet = zkAppInstance.street.get().toString()

const board: string[] = []

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
    }
    else {
        // This condition would mean game is over...
        break
    }

    const street = zkAppInstance.street.get().toString()
    if (parseInt(street) == Streets.Showdown) {
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
        }
        else if (parseInt(street) == Streets.Turn) {
            console.log("DEALING TURN...")
            let take = await getTakeFromOracle(GAME_ID.toString());
            let takeHand = take.hand
            board.push(parseCardInt(parseInt(takeHand[0])));
            console.log("BOARD IS", board);
        }
    }
    else if (parseInt(street) == Streets.River) {
        console.log("DEALING RIVER...")
        let river = await getRiverFromOracle(GAME_ID.toString());
        let riverHand = river.hand
        board.push(parseCardInt(parseInt(riverHand[0])));
        console.log("BOARD IS", board);
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