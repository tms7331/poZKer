// Modified from Hello World tutorial at https://docs.minaprotocol.com/zkapps/tutorials/hello-world
import { PoZKerApp, Actions } from './PoZKer.js';
//import { readline } from 'readline';
//const readline = require('readline');
import readline from 'readline';
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

await isReady;
console.log('o1js loaded');
const useProof = false;
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
const { privateKey: playerPrivKey1, publicKey: playerPubKey1 } = Local.testAccounts[1];
const { privateKey: playerPrivKey2, publicKey: playerPubKey2 } = Local.testAccounts[2];

const map = new MerkleMap();
map.set(Field(0), Field(100));
map.set(Field(1), Field(101));
map.set(Field(2), Field(102));
map.set(Field(3), Field(103));
map.set(Field(4), Field(104));
map.set(Field(5), Field(105));
map.set(Field(6), Field(106));
map.set(Field(7), Field(107));
map.set(Field(8), Field(108));


const root = map.getRoot();
//console.log("ROOT", root);
console.log("ROOT STR", root.toString());

function question(theQuestion: string) {
  return new Promise(resolve => rl.question(theQuestion, answ => resolve(answ)))
}

// ----------------------------------------------------
// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();
const zkAppInstance = new PoZKerApp(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
});
// let test = deployTxn.sign([deployerKey, zkAppPrivateKey]);
// console.log("TEST SIGNATURE", test);
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
// get the initial state of Square after deployment
//const num0 = zkAppInstance.num.get();
//console.log('state after init:', num0.toString());
// ----------------------------------------------------

const txn1 = await Mina.transaction(playerPubKey1, () => {
  zkAppInstance.initState(playerPubKey1, playerPubKey2)
});
await txn1.prove();
await txn1.sign([playerPrivKey1]).send();



const txn2 = await Mina.transaction(playerPubKey1, () => {
  zkAppInstance.deposit(playerPrivKey1)
});
await txn2.prove();
await txn2.sign([playerPrivKey1]).send();

const txn3 = await Mina.transaction(playerPubKey2, () => {
  zkAppInstance.deposit(playerPrivKey2)
});
await txn3.prove();
await txn3.sign([playerPrivKey2]).send();

//Both balances should be 1000000
const bal1 = zkAppInstance.stack1.get();
const bal2 = zkAppInstance.stack2.get();
console.log("Balances", bal1.toString(), bal2.toString());


let card1;
let card2;
const txn90 = await Mina.transaction(playerPubKey1, () => {
  const retVal = zkAppInstance.getHolecards(playerPrivKey1)
  card1 = retVal[0];
  card2 = retVal[1];
  //console.log("RETVAL", retVal);
});
await txn90.prove();
await txn90.sign([playerPrivKey1]).send();


///////////// Flop

const check = Field(Actions.Check);
const betSize = UInt64.from(0);
const txn4 = await Mina.transaction(playerPubKey1, () => {
  zkAppInstance.takeAction(playerPrivKey1, check, betSize)
});
await txn4.prove();
await txn4.sign([playerPrivKey1]).send();


console.log("############")
console.log("Street:", zkAppInstance.street.get().toString());
console.log("Turn:", zkAppInstance.turnGameOver.get().toString());
console.log("LastAction:", zkAppInstance.lastAction.get().toString());


const txn5 = await Mina.transaction(playerPubKey2, () => {
  zkAppInstance.takeAction(playerPrivKey2, check, betSize)
});
await txn5.prove();
await txn5.sign([playerPrivKey2]).send();

console.log("############")
console.log("Street:", zkAppInstance.street.get().toString());
console.log("Turn:", zkAppInstance.turnGameOver.get().toString());
console.log("LastAction:", zkAppInstance.lastAction.get().toString());


///////////////////// Turn
const txn6 = await Mina.transaction(playerPubKey1, () => {
  zkAppInstance.takeAction(playerPrivKey1, check, betSize)
});
await txn6.prove();
await txn6.sign([playerPrivKey1]).send();


console.log("############")
console.log("Street:", zkAppInstance.street.get().toString());
console.log("Turn:", zkAppInstance.turnGameOver.get().toString());
console.log("LastAction:", zkAppInstance.lastAction.get().toString());


const txn7 = await Mina.transaction(playerPubKey2, () => {
  zkAppInstance.takeAction(playerPrivKey2, check, betSize)
});
await txn7.prove();
await txn7.sign([playerPrivKey2]).send();

console.log("############")
console.log("Street:", zkAppInstance.street.get().toString());
console.log("Turn:", zkAppInstance.turnGameOver.get().toString());
console.log("LastAction:", zkAppInstance.lastAction.get().toString());




///////////////////// River
const txn8 = await Mina.transaction(playerPubKey1, () => {
  zkAppInstance.takeAction(playerPrivKey1, check, betSize)
});
await txn8.prove();
await txn8.sign([playerPrivKey1]).send();


console.log("############")
console.log("Street:", zkAppInstance.street.get().toString());
console.log("Turn:", zkAppInstance.turnGameOver.get().toString());
console.log("LastAction:", zkAppInstance.lastAction.get().toString());


const txn9 = await Mina.transaction(playerPubKey2, () => {
  zkAppInstance.takeAction(playerPrivKey2, check, betSize)
});
await txn9.prove();
await txn9.sign([playerPrivKey2]).send();

console.log("############")
console.log("Street:", zkAppInstance.street.get().toString());
console.log("Turn:", zkAppInstance.turnGameOver.get().toString());
console.log("LastAction:", zkAppInstance.lastAction.get().toString());
console.log("Game complete?", zkAppInstance.turnGameOver.get().toString());

const key1 = await question("Card 1?") as string;
const key2 = await question("Card 2?") as string;
const v1 = map.get(Field(parseInt(key1)));
const v2 = map.get(Field(parseInt(key2)));

console.log("## Field vals", v1.toString(), v2.toString());

const txn10 = await Mina.transaction(playerPubKey2, () => {
  zkAppInstance.showdown((v1), (v2))
});
await txn10.prove();
await txn10.sign([playerPrivKey2]).send();

console.log("############")
console.log("Game complete?", zkAppInstance.turnGameOver.get().toString());


console.log("############ WITHDRAWING")

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

const bal3 = zkAppInstance.stack1.get();
const bal4 = zkAppInstance.stack2.get();
console.log("Balances", bal3.toString(), bal4.toString());


/*

getFlop()
getTurn()
method getRiver()

*/

/*
//console.log('state after txn1:', num1.toString());
// ----------------------------------------------------
try {
  const txn2 = await Mina.transaction(senderAccount, () => {
    zkAppInstance.update()
  });
  await txn2.prove();
  await txn2.sign([senderKey]).send();
} catch (ex: any) {
  console.log(ex.message);
}
//const num2 = zkAppInstance.num.get();
//console.log('state after txn2:', num2.toString());



//let val = evaluate_7_cards('As', 'Ks', '4h', 'Ad', 'Kd', 'Td', '5d');
//let val = evaluate_7_cards(0, 3, 5, 6, 1, 8, 11);
*/


// ----------------------------------------------------
console.log('Shutting down');
await shutdown();
rl.close();