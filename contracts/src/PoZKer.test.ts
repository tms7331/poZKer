import { PoZKerApp, actionMapping, cardMapping52 } from './PoZKer';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate, UInt64, MerkleMapWitness } from 'o1js';
import fs from 'fs';
import { Card, addPlayerToCardMask, mask, partialUnmask, EMPTYKEY, cardPrimeToPublicKey } from './mentalpoker.js';
import { getMerkleMapWitness, getShowdownData } from './gameutils.js';
import { MerkleMapSerializable, deserialize } from './merkle_map_serializable.js';

let proofsEnabled = false;

// taken from actionMapping
// const NULL = actionMapping["Null"];
const BET = actionMapping["Bet"];
const CALL = actionMapping["Call"];
const FOLD = actionMapping["Fold"];
const RAISE = actionMapping["Raise"];
const CHECK = actionMapping["Check"];

const SHOWDOWNPENDING = actionMapping["ShowdownPending"];

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

  function encryptCard(cardPrime: number, shuffleKeyP1: PrivateKey, shuffleKeyP2: PrivateKey): Card {
    const cardPoint: PublicKey = cardPrimeToPublicKey(cardPrime);
    console.log("Encrypting card...", cardPrime);
    console.log(cardPoint.toBase58())
    let card: Card = new Card(EMPTYKEY, cardPoint, EMPTYKEY);

    card = addPlayerToCardMask(card, shuffleKeyP1);
    card = mask(card);

    card = addPlayerToCardMask(card, shuffleKeyP2);
    card = mask(card);
    return card

  }


  async function localCommitCards(cardPrime1: number, cardPrime2: number, cardPrime3: number, cardPrime4: number) {
    // Only using single encoding here

    // Use private keys for shuffleKeys to simplify....
    let card1 = encryptCard(cardPrime1, playerPrivKey1, playerPrivKey2)
    let card2 = encryptCard(cardPrime2, playerPrivKey1, playerPrivKey2)
    let card3 = encryptCard(cardPrime3, playerPrivKey1, playerPrivKey2)
    let card4 = encryptCard(cardPrime4, playerPrivKey1, playerPrivKey2)

    // Player 2 shoould halfway decrypt cards 1 and 2, and vice versa for 3 and 4
    card1 = partialUnmask(card1, playerPrivKey2);
    card2 = partialUnmask(card2, playerPrivKey2);
    card3 = partialUnmask(card3, playerPrivKey1);
    card4 = partialUnmask(card4, playerPrivKey1);


    const txnC1 = await Mina.transaction(playerPubKey2, () => {
      // Have to put it in slots 1 and 2
      const slotI = Field(1);
      zkAppInstance.commitCard(slotI, card1.msg)
    });
    await txnC1.prove();
    await txnC1.sign([playerPrivKey2]).send();

    const txnC2 = await Mina.transaction(playerPubKey2, () => {
      // Have to put it in slots 1 and 2
      const slotI = Field(2);
      zkAppInstance.commitCard(slotI, card2.msg)
    });
    await txnC2.prove();
    await txnC2.sign([playerPrivKey2]).send();

    // Now player 1 can call to store a hashed version of card onchain
    const txnC3 = await Mina.transaction(playerPubKey1, () => {
      // Have to put it in slots 1 and 2
      const slotI = Field(0);
      const playerSecret = playerPrivKey1;
      zkAppInstance.storeCardHash(slotI, playerSecret, card1.epk, card2.epk, card1.msg, card2.msg);
    });
    await txnC3.prove();
    await txnC3.sign([playerPrivKey1]).send();

    const txnC4 = await Mina.transaction(playerPubKey1, () => {
      // Have to put it in slots 1 and 2
      const slotI = Field(1);
      zkAppInstance.commitCard(slotI, card3.msg)
    });
    await txnC4.prove();
    await txnC4.sign([playerPrivKey1]).send();

    const txnC5 = await Mina.transaction(playerPubKey1, () => {
      // Have to put it in slots 1 and 2
      const slotI = Field(2);
      zkAppInstance.commitCard(slotI, card4.msg)
    });
    await txnC5.prove();
    await txnC5.sign([playerPrivKey1]).send();

    // Now player 1 can call to store a hashed version of card onchain
    const txnC6 = await Mina.transaction(playerPubKey2, () => {
      // Have to put it in slots 1 and 2
      const slotI = Field(1);
      const playerSecret = playerPrivKey2;
      zkAppInstance.storeCardHash(slotI, playerSecret, card3.epk, card4.epk, card3.msg, card4.msg);
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
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
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
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
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
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
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


  it('fails on invalid p2 actions', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // Start facing a call
    const txn = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(CALL), UInt64.from(0))
    });
    await txn.prove();
    await txn.sign([playerPrivKey1]).send();

    // Make sure that the state is correct
    const p2Turn = 3
    const currStreetPreflop = 5
    const lastActionPreflopCall = 43
    const expectedState = p2Turn * currStreetPreflop * lastActionPreflopCall

    const gamestate: Number = Number(zkAppInstance.gamestate.get().toBigInt());

    expect(gamestate).toEqual(expectedState);


    // Valid actions are check, raise
    // Invalid actions are call, fold, bet
    try {
      const txnFail = await Mina.transaction(playerPubKey2, () => {
        zkAppInstance.takeAction(playerPrivKey2, UInt64.from(CALL), UInt64.from(10))
      });
      await txnFail.prove();
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
    } catch (e: any) {
      const err_str = e.toString();
      expect(err_str).toMatch('Invalid bet!');
    }

    try {
      const txnFail = await Mina.transaction(playerPubKey2, () => {
        zkAppInstance.takeAction(playerPrivKey2, UInt64.from(FOLD), UInt64.from(10))
      });
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
      await txnFail.prove();
    } catch (e: any) {
      const err_str = e.toString();
      expect(err_str).toMatch('Invalid bet!');
    }

    try {
      const txnFail = await Mina.transaction(playerPubKey2, () => {
        zkAppInstance.takeAction(playerPrivKey2, UInt64.from(BET), UInt64.from(10))
      });
      await txnFail.prove();
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
    } catch (e: any) {
      const err_str = e.toString();
      expect(err_str).toMatch('Invalid bet!');
    }
  });

  it('succeeds on valid p2 actions', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // Again start facing a call
    const txn = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(CALL), UInt64.from(0))
    });
    await txn.prove();
    await txn.sign([playerPrivKey1]).send();

    // Valid actions are check, raise

    const txnSucc1 = await Mina.transaction(playerPubKey2, () => {
      zkAppInstance.takeAction(playerPrivKey2, UInt64.from(RAISE), UInt64.from(2))
    });
    // await txnSucc1.prove();
    // await txnSucc1.sign([playerPrivKey2]).send();

    const txnSucc2 = await Mina.transaction(playerPubKey2, () => {
      zkAppInstance.takeAction(playerPrivKey2, UInt64.from(CHECK), UInt64.from(0))
    });
    await txnSucc2.prove();
    await txnSucc2.sign([playerPrivKey2]).send();

    // state is turn * street * lastAction
    const p1Turn = 2
    const currStreetFlop = 7
    const lastActionNull = 19
    const expectedState = p1Turn * currStreetFlop * lastActionNull

    const gamestate: Number = Number(zkAppInstance.gamestate.get().toBigInt());
    expect(gamestate).toEqual(expectedState);
  });

  it('prevents players from betting more than their stack', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // Raising to 100 should fail
    try {
      const txnFail = await Mina.transaction(playerPubKey1, () => {
        zkAppInstance.takeAction(playerPrivKey1, UInt64.from(RAISE), UInt64.from(100))
      });
      // await txnFail.prove();
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
    } catch (e: any) {
      const err_str = e.toString();
      expect(err_str).toMatch('Cannot bet more than stack!');
    }

    // But raising to 99 should work!
    const txnSucc = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(RAISE), UInt64.from(99))
    });
  })

  it('allows players to raise all-in if they have less than a normal raise amount', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // Raise to 90 and then p2's raise will be less than 2x
    const txn = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(RAISE), UInt64.from(90))
    });
    await txn.prove();
    await txn.sign([playerPrivKey1]).send();

    // P2 raising to 99, all-in except 1, should not work
    try {
      const txnFail = await Mina.transaction(playerPubKey2, () => {
        zkAppInstance.takeAction(playerPrivKey2, UInt64.from(RAISE), UInt64.from(97))
      });
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
      // await txnFail.prove();
    } catch (e: any) {
      const err_str = e.toString();
      expect(err_str).toMatch('Invalid raise amount!');
    }

    // But raising all-in should work
    const txnSucc = await Mina.transaction(playerPubKey2, () => {
      zkAppInstance.takeAction(playerPrivKey2, UInt64.from(RAISE), UInt64.from(98))
    });
    await txnSucc.prove();
    await txnSucc.sign([playerPrivKey2]).send();

    // And if player 1 calls, we should have 'showdown' state
    const txnCall = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(CALL), UInt64.from(0))
    });
    await txnCall.prove();
    await txnCall.sign([playerPrivKey1]).send();

    const gamestate: number = Number(zkAppInstance.gamestate.get().toBigInt()) as number;
    // just important that we've reached 'showdown'
    expect(gamestate).toEqual(SHOWDOWNPENDING);
  })

  it('fails on bets of 0', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    const txnCall = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(CALL), UInt64.from(0))
    });
    await txnCall.prove();
    await txnCall.sign([playerPrivKey1]).send();

    const txnCheck = await Mina.transaction(playerPubKey2, () => {
      zkAppInstance.takeAction(playerPrivKey2, UInt64.from(CHECK), UInt64.from(0))
    });
    await txnCheck.prove();
    await txnCheck.sign([playerPrivKey2]).send();

    // Betting 0 should fail
    try {
      const txnFail = await Mina.transaction(playerPubKey1, () => {
        zkAppInstance.takeAction(playerPrivKey1, UInt64.from(BET), UInt64.from(0))
      });
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
      // await txnFail.prove();
    } catch (e: any) {
      const err_str = e.toString();
      expect(err_str).toMatch('Invalid bet size!');
    }

  })

  it('prevents transition to gameover before showdown is complete', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // Just immediately go all-in to finish betting
    const txnRaise = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(RAISE), UInt64.from(99))
    });
    await txnRaise.prove();
    await txnRaise.sign([playerPrivKey1]).send();

    const txnCall = await Mina.transaction(playerPubKey2, () => {
      zkAppInstance.takeAction(playerPrivKey2, UInt64.from(CALL), UInt64.from(0))
    });
    await txnCall.prove();
    await txnCall.sign([playerPrivKey2]).send();

    const gamestate: number = Number(zkAppInstance.gamestate.get().toBigInt()) as number;
    // make sure we've reached showdown...
    expect(gamestate).toEqual(SHOWDOWNPENDING);

    // We should NOT be able to call 'showdown' method yet - 
    // 1. Need other board cards
    // 2. Both players need to show hands
    try {
      const txnFail = await Mina.transaction(playerPubKey2, () => {
        zkAppInstance.showdown()
      });
      // If it doesn't fail it will not call the 'expect' below
      expect("TX SUCCESSFUL!").toMatch('TX DID NOT FAIL!');
      // await txnFail.prove();
    } catch (e: any) {
      const err_str = e.toString();
      expect(err_str).toMatch('Invalid showdown gamestate!');
    }

  })

  it('allows players to show their cards', async () => {
    await localDeploy();
    await setPlayers();
    await localDeposit();

    // Just immediately go all-in to finish betting
    const txnRaise = await Mina.transaction(playerPubKey1, () => {
      zkAppInstance.takeAction(playerPrivKey1, UInt64.from(RAISE), UInt64.from(99))
    });
    await txnRaise.prove();
    await txnRaise.sign([playerPrivKey1]).send();

    const txnCall = await Mina.transaction(playerPubKey2, () => {
      zkAppInstance.takeAction(playerPrivKey2, UInt64.from(CALL), UInt64.from(0))
    });
    await txnCall.prove();
    await txnCall.sign([playerPrivKey2]).send();

    const gamestate: number = Number(zkAppInstance.gamestate.get().toBigInt()) as number;
    // make sure we've reached showdown...
    expect(gamestate).toEqual(SHOWDOWNPENDING);

    const card1prime52 = cardMapping52["Ah"];
    const card2prime52 = cardMapping52["Ad"];
    // we'll give p2 a flush
    const card3prime52 = cardMapping52["Ks"];
    const card4prime52 = cardMapping52["Ts"];

    const boardcard0 = cardMapping52["Kc"];
    const boardcard1 = cardMapping52["Ac"];
    const boardcard2 = cardMapping52["Qs"];
    const boardcard3 = cardMapping52["8s"];
    const boardcard4 = cardMapping52["6s"];


    // Commits cards for both players...
    await localCommitCards(card1prime52, card2prime52, card3prime52, card4prime52);

    // other player has to store halfway decrypted cards first!
    // commitCard(slotI: Field, encryptedCard: Field)
    // commitCard(slotI: Field, encryptedCard: Field)
    // // And now other player can see cards and store it
    // storeCardHash(slotI: Field, c2a: Field, c2b: Field, cipherKeys: Field, playerSecKey: PrivateKey)

    const boardcards = [boardcard0, boardcard1, boardcard2, boardcard3, boardcard4];

    for (const bc of boardcards) {
      const txnB = await Mina.transaction(playerPubKey1, () => {
        zkAppInstance.tallyBoardCards(Field(bc));
      });
      await txnB.prove();
      await txnB.sign([playerPrivKey1]).send();
    }

    // Loading map
    const merkleMapBasicFn = "merkleMapBasic.json"
    const merkleMapFlushFn = "merkleMapFlush.json"

    const jsonDataBasic = fs.readFileSync(merkleMapBasicFn, 'utf8');
    const merkleMapBasic: MerkleMapSerializable = deserialize(jsonDataBasic);

    const jsonDataFlush = fs.readFileSync(merkleMapFlushFn, 'utf8');
    const merkleMapFlush: MerkleMapSerializable = deserialize(jsonDataFlush);

    const allCardsP1: [UInt64, UInt64, UInt64, UInt64, UInt64, UInt64, UInt64] = [UInt64.from(card1prime52), UInt64.from(card2prime52), UInt64.from(boardcard0), UInt64.from(boardcard1), UInt64.from(boardcard2), UInt64.from(boardcard3), UInt64.from(boardcard4)]
    const [useCardsP1, isFlushP1, merkleMapKeyP1, merkleMapValP1] = getShowdownData(allCardsP1);
    const pathP1: MerkleMapWitness = getMerkleMapWitness(merkleMapBasic, merkleMapFlush, isFlushP1.toBoolean(), merkleMapKeyP1)

    const allCardsP2: [UInt64, UInt64, UInt64, UInt64, UInt64, UInt64, UInt64] = [UInt64.from(card3prime52), UInt64.from(card4prime52), UInt64.from(boardcard0), UInt64.from(boardcard1), UInt64.from(boardcard2), UInt64.from(boardcard3), UInt64.from(boardcard4)]
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
        playerPrivKey1,
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
        playerPrivKey2,
        merkleMapKeyP2,
        merkleMapValP2,
        pathP2,
      )
    });
    await txnB.prove();
    await txnB.sign([playerPrivKey2]).send();


    // We should have transitioned to ShowdownComplete at this point
    const gamestateSD: number = Number(zkAppInstance.gamestate.get().toBigInt()) as number;
    expect(gamestateSD).toEqual(actionMapping["ShowdownComplete"]);

    // Showdown means no more actions, need to handle card logic though
    // showdown(v1: Field, v2: Field)
    const txn = await Mina.transaction(playerPubKey2, () => {
      zkAppInstance.showdown()
    });
    await txn.prove();
    await txn.sign([playerPrivKey2]).send();

    // And after calling 'showdown' we should have transitioned to GameOver
    const gamestateFinal: number = Number(zkAppInstance.gamestate.get().toBigInt()) as number;
    expect(gamestateFinal).toEqual(actionMapping["GameOver"]);

    // And finally - both players can claim their profits
    const txnWd = await Mina.transaction(playerPubKey2, () => {
      zkAppInstance.withdraw(playerPrivKey2)
    });
    await txnWd.prove();
    await txnWd.sign([playerPrivKey2]).send();

    const stack1: number = Number(zkAppInstance.stack1.get().toBigInt()) as number;
    const stack2: number = Number(zkAppInstance.stack2.get().toBigInt()) as number;
    expect(stack1).toEqual(0);
    expect(stack2).toEqual(0);
  })

});