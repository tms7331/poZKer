import { PoZKerApp, actionMapping } from './PoZKer';
import {
  Field, Mina, PrivateKey, PublicKey, AccountUpdate, UInt64,
} from 'o1js';
import { Cipher, ElGamalFF } from 'o1js-elgamal';

let proofsEnabled = false;



// taken from actionMapping
const NULL = actionMapping["Null"];
const BET = actionMapping["Bet"];
const CALL = actionMapping["Call"];
const FOLD = actionMapping["Fold"];
const RAISE = actionMapping["Raise"];
const CHECK = actionMapping["Check"];

// describe('PoZKer.js', () => {
//   describe('PoZKer()', () => {
//     it.todo('should be correct');
//   });
// });

describe('PoZKer', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    fundedPubKey1: PublicKey,
    fundedPrivKey1: PrivateKey,
    playerPrivKey1: PrivateKey,
    playerPrivKey2: PrivateKey,
    playerPubKey1: PublicKey,
    playerPubKey2: PublicKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkAppInstance: PoZKerApp;

  beforeAll(async () => {
    if (proofsEnabled) await PoZKerApp.compile();

  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    playerPrivKey1 = PrivateKey.fromBase58("EKE3TZ7PYTyf4XSyEcqCUuyFZAtiW5w9Enm5PUjruTLFUHangY3k");
    playerPubKey1 = playerPrivKey1.toPublicKey();
    playerPrivKey2 = PrivateKey.fromBase58("EKErvBujci5uiqL5nBv5kBP5d2MMz2zE8E5EtdZZPSF6p7AhzSK5");;
    playerPubKey2 = playerPrivKey2.toPublicKey();

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkAppInstance = new PoZKerApp(zkAppAddress);

    ({ privateKey: fundedPrivKey1, publicKey: fundedPubKey1 } = Local.testAccounts[1]);
  });

  async function localDeploy() {
    console.log("Deploying...");
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkAppInstance.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

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
  }

  async function setPlayers() {
    const txn = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.initState(playerPubKey1, playerPubKey2)
    });
    await txn.prove();
    await txn.sign([playerPrivKey1]).send();
  }


  async function localDeposit() {
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

    const bal2 = zkAppInstance.stack1.get();
    console.log("Player 2 Stack:", bal2.toString());
  }

  async function localCommitCards(card1: number, card2: number, card3: number, card4: number) {

    let keys1 = ElGamalFF.generateKeys();
    let keys2 = ElGamalFF.generateKeys();

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

    // Exact same logic as for player 1
    let c3 = ElGamalFF.encrypt(Field(card3), keys1.pk);
    let c4 = ElGamalFF.encrypt(Field(card4), keys1.pk);

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
  }

  it('posts both player blinds and initializes gamestate', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // After depositing player 1 should have stack of 99 (SB)
    // Player 2 should have stack of 98 (BB)
    const bal1 = zkAppInstance.stack1.get();
    const bal2 = zkAppInstance.stack2.get();
    expect(bal1.toString()).toMatch('99');
    expect(bal2.toString()).toMatch('98');

    const gamestate: UInt64 = zkAppInstance.gamestate.get();
    const gamestatejs = gamestate.toBigInt();
    const remainder = Number(gamestatejs) % BET;
    expect(remainder).toEqual(0);
  });


  it('prevents wrong player from acting', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // Player 2 should not be able to act
    try {
      const txnFail = await Mina.transaction(playerPubKey2, () => {
        zkAppInstance.takeAction(playerPrivKey2, UInt64.from(BET), UInt64.from(10))
      });
      await txnFail.prove();
    } catch (e: any) {
      const err_str = e.toString();
      console.log("ERROR IS:");
      console.log(err_str);
      console.log("PRINTED ERROR...:");
      expect(err_str).toMatch('Error: Player is not allowed to make a move');
    }
  });


  it('fails on invalid p1 actions', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // Preflop - remember we are actually facing a bet!
    // So valid actions are call, fold, raise
    // Invalid actions are check, bet

    // Player 1 should not be able to check or bet
    try {
      const txnFail = await Mina.transaction(playerPubKey1, () => {
        zkAppInstance.takeAction(playerPrivKey1, UInt64.from(BET), UInt64.from(10))
      });
      await txnFail.prove();
    } catch (e: any) {
      const err_str = e.toString();
      console.log("ERROR IS:");
      console.log(err_str);
      console.log("PRINTED ERROR...:");
      expect(err_str).toMatch('Invalid bet!');
    }


    try {
      const txnFail = await Mina.transaction(playerPubKey1, () => {
        zkAppInstance.takeAction(playerPrivKey1, UInt64.from(CHECK), UInt64.from(0))
      });
      await txnFail.prove();
    } catch (e: any) {
      const err_str = e.toString();
      console.log("ERROR IS:");
      console.log(err_str);
      console.log("PRINTED ERROR...:");
      expect(err_str).toMatch('Invalid bet!');
    }

  });

  it('succeeds on valid p1 actions', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // Preflop - remember we are actually facing a bet!
    // So valid actions are call, fold, raise
    // Invalid actions are check, bet

    const txnSucc1 = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(CALL), UInt64.from(0))
    });
    // await txnSucc1.prove();
    // await txnSucc1.sign([playerPrivKey1]).send();

    const txnSucc2 = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(FOLD), UInt64.from(0))
    });
    // await txnSucc2.prove();
    // await txnSucc2.sign([playerPrivKey1]).send();

    const txnSucc3 = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(RAISE), UInt64.from(2))
    });
    await txnSucc3.prove();
    await txnSucc3.sign([playerPrivKey1]).send();

    // state is turn * street * lastAction
    const p2Turn = 3
    const currStreetPreflop = 5
    const lastActionRaise = 37
    const expectedState = p2Turn * currStreetPreflop * lastActionRaise

    const gamestate: Number = Number(zkAppInstance.gamestate.get().toBigInt());
    expect(gamestate).toEqual(expectedState);
  });


  it.todo('prevents players from betting more than their stack');

  it.todo('prevents players from taking invalid actions');

});