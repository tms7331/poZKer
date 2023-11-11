// Modified from Hello World tutorial at https://docs.minaprotocol.com/zkapps/tutorials/hello-world
import { PoZKerApp } from './PoZKer.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'o1js';

await isReady;
console.log('o1js loaded');
const useProof = false;
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1];
// ----------------------------------------------------
// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();
// create an instance of Square - and deploy it to zkAppAddress
const zkAppInstance = new PoZKerApp(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
});
// let test = deployTxn.sign([deployerKey, zkAppPrivateKey]);
// console.log("TEST SIGNATURE", test);
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
// get the initial state of Square after deployment
const num0 = zkAppInstance.num.get();
console.log('state after init:', num0.toString());
// ----------------------------------------------------
const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.update()
});
await txn1.prove();
await txn1.sign([senderKey]).send();
const num1 = zkAppInstance.num.get();

console.log('state after txn1:', num1.toString());
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
const num2 = zkAppInstance.num.get();
console.log('state after txn2:', num2.toString());


// ----------------------------------------------------
console.log('Shutting down');
await shutdown();