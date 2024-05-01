import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, Field, PublicKey, MerkleMapWitness } from "o1js";
import { PoZKerApp, cardMapping52 } from "../src/poZKer";
import { Balances } from "../src/balances";
import { log } from "@proto-kit/common";
import { UInt64, TokenId, BalancesKey } from "@proto-kit/library";

// 
import fs from 'fs';
import { MerkleMapSerializable, deserialize } from '../src/merkle_map_serializable.js';
import { getMerkleMapWitness, getShowdownData } from '../src/gameutils.js';
import { Card, addPlayerToCardMask, mask, partialUnmask, createNewCard, cardPrimeToPublicKey } from '../src/mentalpoker.js';


log.setLevel("ERROR");

describe("poZKer", () => {

  async function localDeploy() {
    const appChain = TestingAppChain.fromRuntime({
      PoZKerApp, Balances
    });
    appChain.configurePartial({
      Runtime: {
        PoZKerApp: {},
        Balances: {
          totalSupply: UInt64.from(10000),
        },
      },
    });
    await appChain.start();
    return appChain;
  }

  async function init(appChain: any, pkr: PoZKerApp, alicePrivateKey: PrivateKey, alice: PublicKey, bobPrivateKey: PrivateKey, bob: PublicKey) {
    // Set table state first!
    appChain.setSigner(alicePrivateKey);
    const txn0 = await appChain.transaction(alice, () => {
      pkr.resetTableState()
    });
    await txn0.sign();
    await txn0.send();
    const block0 = await appChain.produceBlock();
    expect(block0?.transactions[0].status.toBoolean()).toBe(true);

    // And we need to get tokens for each player
    const bals = appChain.runtime.resolve("Balances");

    const tokenId = TokenId.from(0);
    appChain.setSigner(alicePrivateKey);
    const txn1 = await appChain.transaction(alice, () => {
      bals.addBalance(tokenId, alice, UInt64.from(1000))
    });
    await txn1.sign();
    await txn1.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn2 = await appChain.transaction(bob, () => {
      bals.addBalance(tokenId, bob, UInt64.from(1000))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);
  }

  async function setPlayer(appChain: any, pkr: PoZKerApp, playerPrivKey: PrivateKey, playerPubKey: PublicKey, seatI: Field, depositAmount: Field) {
    // This will automatically deposit now too...
    appChain.setSigner(playerPrivKey);
    const tx1 = await appChain.transaction(playerPubKey, () => {
      pkr.joinTable(seatI, depositAmount)
    });
    await tx1.sign();
    await tx1.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);
  }

  async function postBlinds(appChain: any, pkr: PoZKerApp, alicePrivateKey: PrivateKey, alice: PublicKey, bobPrivateKey: PrivateKey, bob: PublicKey) {
    // Set table state first?
    appChain.setSigner(alicePrivateKey);
    const txn1 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.PostSBAct, Field(1))
    });
    await txn1.sign();
    await txn1.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.PostBBAct, Field(2))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);
  }

  async function commitHolecards(appChain: any, pkr: PoZKerApp, shuffleKeyP1: PrivateKey, shuffleKeyP2: PrivateKey, alicePrivateKey: PrivateKey, alice: PublicKey, bobPrivateKey: PrivateKey, bob: PublicKey) {
    // Sticking with same hand/cards as old tests
    const card0prime52 = cardMapping52["Ah"];
    const card1prime52 = cardMapping52["Ad"];
    // we'll give p2 a flush
    const card2prime52 = cardMapping52["Ks"];
    const card3prime52 = cardMapping52["Ts"];

    // p0 cards...
    const card0 = encryptCard(card0prime52, shuffleKeyP1, shuffleKeyP2);
    const card1 = encryptCard(card1prime52, shuffleKeyP1, shuffleKeyP2);
    // p1 cards...
    const card2 = encryptCard(card2prime52, shuffleKeyP1, shuffleKeyP2);
    const card3 = encryptCard(card3prime52, shuffleKeyP1, shuffleKeyP2);

    // p0 commit p1's cards
    appChain.setSigner(alicePrivateKey);
    const txn1 = await appChain.transaction(alice, () => {
      pkr.commitOpponentHolecards(card0, card1)
    });
    await txn1.sign();
    await txn1.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn2 = await appChain.transaction(bob, () => {
      pkr.commitOpponentHolecards(card2, card3)
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);
  }

  async function commitFlop(appChain: any, pkr: PoZKerApp, shuffleKeyP0: PrivateKey, shuffleKeyP1: PrivateKey, alicePrivateKey: PrivateKey, alice: PublicKey, bobPrivateKey: PrivateKey, bob: PublicKey) {
    // It's flop now so we have to commit flop
    const boardcard0 = cardMapping52["Kc"];
    const boardcard1 = cardMapping52["Ac"];
    const boardcard2 = cardMapping52["Qs"];

    // p0 cards...
    const card0Enc = encryptCard(boardcard0, shuffleKeyP0, shuffleKeyP1);
    const card1Enc = encryptCard(boardcard1, shuffleKeyP0, shuffleKeyP1);
    const card2Enc = encryptCard(boardcard2, shuffleKeyP0, shuffleKeyP1);

    // alice should decrypt her half of the cards before committing them...
    const card0 = partialUnmask(card0Enc, shuffleKeyP0);
    const card1 = partialUnmask(card1Enc, shuffleKeyP0);
    const card2 = partialUnmask(card2Enc, shuffleKeyP0);

    appChain.setSigner(alicePrivateKey);
    const txn3 = await appChain.transaction(alice, () => {
      pkr.commitBoardcards(card0, card1, card2)
    });
    await txn3.sign();
    await txn3.send();
    const block3 = await appChain.produceBlock();
    expect(block3?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn4 = await appChain.transaction(bob, () => {
      pkr.decodeBoardcards(Field(boardcard0), Field(boardcard1), Field(boardcard2))
    });
    await txn4.sign();
    await txn4.send();
    const block4 = await appChain.produceBlock();
    expect(block4?.transactions[0].status.toBoolean()).toBe(true);
  }

  async function commitTurn(appChain: any, pkr: PoZKerApp, shuffleKeyP0: PrivateKey, shuffleKeyP1: PrivateKey, alicePrivateKey: PrivateKey, alice: PublicKey, bobPrivateKey: PrivateKey, bob: PublicKey) {
    // It's flop now so we have to commit flop

    // This is turn - other two cards will NOT be committed
    const boardcard0 = cardMapping52["8s"];
    const boardcard1 = cardMapping52["Ac"];
    const boardcard2 = cardMapping52["Qs"];

    // p0 cards...
    const card0Enc = encryptCard(boardcard0, shuffleKeyP0, shuffleKeyP1);
    const card1Enc = encryptCard(boardcard1, shuffleKeyP0, shuffleKeyP1);
    const card2Enc = encryptCard(boardcard2, shuffleKeyP0, shuffleKeyP1);

    // alice should decrypt her half of the cards before committing them...
    const card0 = partialUnmask(card0Enc, shuffleKeyP0);
    const card1 = partialUnmask(card1Enc, shuffleKeyP0);
    const card2 = partialUnmask(card2Enc, shuffleKeyP0);

    appChain.setSigner(alicePrivateKey);
    const txn3 = await appChain.transaction(alice, () => {
      pkr.commitBoardcards(card0, card1, card2)
    });
    await txn3.sign();
    await txn3.send();
    const block3 = await appChain.produceBlock();
    expect(block3?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn4 = await appChain.transaction(bob, () => {
      pkr.decodeBoardcards(Field(boardcard0), Field(boardcard1), Field(boardcard2))
    });
    await txn4.sign();
    await txn4.send();
    const block4 = await appChain.produceBlock();
    expect(block4?.transactions[0].status.toBoolean()).toBe(true);

  }

  async function commitRiver(appChain: any, pkr: PoZKerApp, shuffleKeyP0: PrivateKey, shuffleKeyP1: PrivateKey, alicePrivateKey: PrivateKey, alice: PublicKey, bobPrivateKey: PrivateKey, bob: PublicKey) {
    // This is river, other cards will be ignored
    const boardcard0 = cardMapping52["6s"];
    // const boardcard0 = cardMapping52["Kc"];
    const boardcard1 = cardMapping52["Ac"];
    const boardcard2 = cardMapping52["Qs"];

    // p0 cards...
    const card0Enc = encryptCard(boardcard0, shuffleKeyP0, shuffleKeyP1);
    const card1Enc = encryptCard(boardcard1, shuffleKeyP0, shuffleKeyP1);
    const card2Enc = encryptCard(boardcard2, shuffleKeyP0, shuffleKeyP1);

    // alice should decrypt her half of the cards before committing them...
    const card0 = partialUnmask(card0Enc, shuffleKeyP0);
    const card1 = partialUnmask(card1Enc, shuffleKeyP0);
    const card2 = partialUnmask(card2Enc, shuffleKeyP0);

    appChain.setSigner(alicePrivateKey);
    const txn3 = await appChain.transaction(alice, () => {
      pkr.commitBoardcards(card0, card1, card2)
    });
    await txn3.sign();
    await txn3.send();
    const block3 = await appChain.produceBlock();
    expect(block3?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn4 = await appChain.transaction(bob, () => {
      pkr.decodeBoardcards(Field(boardcard0), Field(boardcard1), Field(boardcard2))
    });
    await txn4.sign();
    await txn4.send();
    const block4 = await appChain.produceBlock();
    expect(block4?.transactions[0].status.toBoolean()).toBe(true);

  }

  it("allows players to join game (joinTable)", async () => {
    const appChain = await localDeploy();

    // Join game with two players
    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bobPrivateKey = PrivateKey.random();
    const bob = bobPrivateKey.toPublicKey();

    const pkr = appChain.runtime.resolve("PoZKerApp");

    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

    // First player joining
    const aliceSeat = Field(0);
    const bobSeat = Field(1);
    appChain.setSigner(alicePrivateKey);
    const tx1 = await appChain.transaction(alice, () => {
      pkr.joinTable(aliceSeat, Field(100))
    });
    await tx1.sign();
    await tx1.send();
    const block = await appChain.produceBlock();

    const player0Key = await appChain.query.runtime.PoZKerApp.player0Key.get();
    const player1Key = await appChain.query.runtime.PoZKerApp.player1Key.get();
    const stack0 = await appChain.query.runtime.PoZKerApp.stack0.get();
    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);
    expect(player0Key).toEqual(alice);
    expect(player1Key).toEqual(PublicKey.empty());
    expect(stack0).toEqual(Field(100));
    expect(stack1).toEqual(Field(0));

    // Second player joining
    appChain.setSigner(bobPrivateKey);
    const tx2 = await appChain.transaction(bob, () => {
      pkr.joinTable(bobSeat, Field(100))
    });
    await tx2.sign();
    await tx2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);

    const player0KeyB = await appChain.query.runtime.PoZKerApp.player0Key.get();
    const player1KeyB = await appChain.query.runtime.PoZKerApp.player1Key.get();
    const stack0B = await appChain.query.runtime.PoZKerApp.stack0.get();
    const stack1B = await appChain.query.runtime.PoZKerApp.stack1.get();
    expect(player0KeyB).toEqual(alice);
    expect(player1KeyB).toEqual(bob);
    expect(stack0B).toEqual(Field(100));
    expect(stack1B).toEqual(Field(100));

  }, 1_000_000);


  it('lets both players post blinds (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");

    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(150));

    appChain.setSigner(alicePrivateKey);
    const txn1 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.PostSBAct, Field(1))
    });
    await txn1.sign();
    await txn1.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    // Should have posted sb of 1
    const stack0 = await appChain.query.runtime.PoZKerApp.stack0.get();
    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    const pot = await appChain.query.runtime.PoZKerApp.pot.get();
    const betThisStreet0 = await appChain.query.runtime.PoZKerApp.betThisStreet0.get();
    const betThisStreet1 = await appChain.query.runtime.PoZKerApp.betThisStreet1.get();

    // Make sure deposits were successful
    expect(stack0).toEqual((Field(99)));
    expect(stack1).toEqual((Field(150)));
    expect(pot).toEqual((Field(1)));
    expect(betThisStreet0).toEqual((Field(1)));
    expect(betThisStreet1).toEqual((Field(0)));

    // After sb is posted, should be at stage 'BBPostStage'
    const handStageA = await appChain.query.runtime.PoZKerApp.handStage.get();
    expect(handStageA).toEqual(pkr.BBPostStage);

    appChain.setSigner(bobPrivateKey);
    const txn2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.PostBBAct, Field(2))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);

    // Now should have SB and BB posted
    const stack0B = await appChain.query.runtime.PoZKerApp.stack0.get();
    const stack1B = await appChain.query.runtime.PoZKerApp.stack1.get();
    const potB = await appChain.query.runtime.PoZKerApp.pot.get();
    const betThisStreet0B = await appChain.query.runtime.PoZKerApp.betThisStreet0.get();
    const betThisStreet1B = await appChain.query.runtime.PoZKerApp.betThisStreet1.get();
    // Make sure deposits were successful
    expect(stack0B).toEqual((Field(99)));
    expect(stack1B).toEqual((Field(148)));
    expect(potB).toEqual((Field(3)));
    expect(betThisStreet0B).toEqual((Field(1)));
    expect(betThisStreet1B).toEqual((Field(2)));

    // And handStage should be DealHolecardsA!
    const handStageB = await appChain.query.runtime.PoZKerApp.handStage.get();
    expect(handStageB).toEqual(pkr.DealHolecardsA);

  }, 1_000_000);

  it('succeeds on valid p1 actions (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    const shuffleKeyP2: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP1, shuffleKeyP2, alicePrivateKey, alice, bobPrivateKey, bob);

    const stack0 = await appChain.query.runtime.PoZKerApp.stack0.get();
    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    // Make sure posting blinds was successful
    expect(stack0).toEqual((Field(99)));
    expect(stack1).toEqual((Field(98)));

    // Preflop - remember we are actually facing a bet!
    // So valid actions are call, fold, raise
    // Invalid actions are check, bet

    appChain.setSigner(alicePrivateKey);
    // TODO - this are not actually tested, how can we check?
    /*
    const txnSucc1 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Call, Field(0))
    });
    await txnSucc1.sign();
    // await txnSucc1.send();
    // const block = await appChain.produceBlock();
  
    const txnSucc2 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Fold, Field(0))
    });
    await txnSucc2.sign();
    // await txnSucc2.send();
    // const block = await appChain.produceBlock();
    */

    const txnSucc3 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Raise, Field(4))
    });
    await txnSucc3.sign();
    await txnSucc3.send();
    const block = await appChain.produceBlock();

    const playerTurn = await appChain.query.runtime.PoZKerApp.playerTurn.get();
    const handStage = await appChain.query.runtime.PoZKerApp.handStage.get();
    const lastAction = await appChain.query.runtime.PoZKerApp.lastAction.get();

    // const err = block?.transactions[0].statusMessage;
    // console.log(err);
    expect(block?.transactions[0].status.toBoolean()).toBe(true);
    expect(playerTurn).toEqual(pkr.P1Turn);
    // Handstage is STILL preflop betting round...
    expect(handStage).toEqual(pkr.PreflopBetting);
    expect(lastAction).toEqual(pkr.Raise);
  }, 1_000_000);


  it('posts both player blinds and initializes gamestate', async () => {
    // Just ensure our helper functions for joining+depositing work
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

    // After depositing player 1 should have stack of 99 (SB)
    // Player 2 should have stack of 98 (BB)
    const stack0 = await appChain.query.runtime.PoZKerApp.stack0.get();
    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    expect(stack0).toEqual(Field(99));
    expect(stack1).toEqual(Field(98));

  });

  it("prevents wrong player from acting (takeAction)", async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    const shuffleKeyP2: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP1, shuffleKeyP2, alicePrivateKey, alice, bobPrivateKey, bob);

    // Player 2 should not be able to act
    appChain.setSigner(bobPrivateKey);
    const txnFail = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Bet, Field(10))
    });
    await txnFail.sign();
    await txnFail.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(false);
    expect(block?.transactions[0].statusMessage).toBe('Player is not allowed to make a move');

  }, 1_000_000);


  it('fails on invalid p1 actions (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    const shuffleKeyP2: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP1, shuffleKeyP2, alicePrivateKey, alice, bobPrivateKey, bob);


    // Preflop - remember we are actually facing a bet!
    // So valid actions are call, fold, raise
    // Invalid actions are check, bet

    // Player 1 should not be able to check or bet
    appChain.setSigner(alicePrivateKey);
    const txn = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Bet, Field(10))
    });
    await txn.sign();
    await txn.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(false);
    expect(block?.transactions[0].statusMessage).toBe('Invalid bet!');


    const txn2 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Check, Field(0))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(false);
    expect(block2?.transactions[0].statusMessage).toBe('Invalid bet!');
  });


  it('fails on invalid p2 actions (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    const shuffleKeyP2: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP1, shuffleKeyP2, alicePrivateKey, alice, bobPrivateKey, bob);

    // Start facing a call
    appChain.setSigner(alicePrivateKey);
    const txn = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.PreflopCall, Field(0))
    });
    await txn.sign();
    await txn.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    // Make sure that the state is correct
    const playerTurn = await appChain.query.runtime.PoZKerApp.playerTurn.get();
    const handStage = await appChain.query.runtime.PoZKerApp.handStage.get();
    const lastAction = await appChain.query.runtime.PoZKerApp.lastAction.get();
    expect(playerTurn).toEqual(pkr.P1Turn);
    // TODO - what should this be?
    // expect(handStage).toEqual(pkr.Preflop);
    expect(lastAction).toEqual(pkr.PreflopCall);

    // Valid actions are check, raise
    // Invalid actions are call, fold, bet
    appChain.setSigner(bobPrivateKey);
    const txnFail1 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Call, Field(10))
    });
    await txnFail1.sign();
    await txnFail1.send();
    const blockFail1 = await appChain.produceBlock();
    expect(blockFail1?.transactions[0].statusMessage).toBe('Invalid bet!');


    const txnFail2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Fold, Field(10))
    });
    await txnFail2.sign();
    await txnFail2.send();
    const blockFail2 = await appChain.produceBlock();
    expect(blockFail2?.transactions[0].statusMessage).toBe('Invalid bet!');

    const txnFail3 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Bet, Field(10))
    });
    await txnFail3.sign();
    await txnFail3.send();
    const blockFail3 = await appChain.produceBlock();
    expect(blockFail3?.transactions[0].statusMessage).toBe('Invalid bet!');
  });

  it('succeeds on valid p2 actions (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    const shuffleKeyP2: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP1, shuffleKeyP2, alicePrivateKey, alice, bobPrivateKey, bob);

    // Again start facing a call
    appChain.setSigner(alicePrivateKey);
    const txn = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.PreflopCall, Field(0))
    });
    await txn.sign();
    await txn.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    // Valid actions are check, raise

    // TODO - can't test in this manner, add a new test?
    /*
    const txnSucc1 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Raise, Field(2))
    });
    // await txnSucc1.prove();
    // await txnSucc1.sign([playerPrivKey2]).send();
    */

    appChain.setSigner(bobPrivateKey);
    const txnSucc2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Check, Field(0))
    });
    await txnSucc2.sign();
    await txnSucc2.send();
    const blockSucc = await appChain.produceBlock();
    expect(blockSucc?.transactions[0].status.toBoolean()).toBe(true);

    // We actually committed the check, so should be p1's turn on flop
    const playerTurn = await appChain.query.runtime.PoZKerApp.playerTurn.get();
    const handStage = await appChain.query.runtime.PoZKerApp.handStage.get();
    const lastAction = await appChain.query.runtime.PoZKerApp.lastAction.get();
    expect(playerTurn).toEqual(pkr.P0Turn);
    // TODO - what should this be?
    // expect(handStage).toEqual(pkr.Flop);
    expect(lastAction).toEqual(pkr.Null);
  });


  it('prevents players from betting more than their stack (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(150));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    const shuffleKeyP2: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP1, shuffleKeyP2, alicePrivateKey, alice, bobPrivateKey, bob);

    // Raising to 100 should fail
    appChain.setSigner(alicePrivateKey);
    const txnFail = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Raise, Field(100))
    });
    await txnFail.sign();
    await txnFail.send();
    const blockFail = await appChain.produceBlock();
    expect(blockFail?.transactions[0].status.toBoolean()).toBe(false);
    expect(blockFail?.transactions[0].statusMessage).toBe('Cannot bet more than stack!');

    // But raising to 99 should work!
    const txn = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Raise, Field(99))
    });
    await txn.sign();
    await txn.send();
    const block = await appChain.produceBlock();
    // const err = block?.transactions[0].statusMessage;
    // console.log(err);
    expect(block?.transactions[0].status.toBoolean()).toBe(true);
  })

  it('allows players to raise all-in if they have less than a normal raise amount (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    const shuffleKeyP2: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP1, shuffleKeyP2, alicePrivateKey, alice, bobPrivateKey, bob);

    // Raise to 90 and then p2's raise will be less than 2x
    appChain.setSigner(alicePrivateKey);
    const txn = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Raise, Field(90))
    });
    await txn.sign();
    await txn.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    // P2 raising to 99, all-in except 1, should not work
    appChain.setSigner(bobPrivateKey);
    const txnFail = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Raise, Field(97))
    });
    await txnFail.sign();
    await txnFail.send();
    const blockFail = await appChain.produceBlock();
    expect(blockFail?.transactions[0].status.toBoolean()).toBe(false);
    expect(blockFail?.transactions[0].statusMessage).toBe('Invalid raise amount!');


    // But raising all-in should work
    const txn2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Raise, Field(98))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);


    // And if player 1 calls, we should have 'showdown' state
    appChain.setSigner(alicePrivateKey);
    const txn3 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Call, Field(0))
    });
    await txn3.sign();
    await txn3.send();
    const block3 = await appChain.produceBlock();
    expect(block3?.transactions[0].status.toBoolean()).toBe(true);

    const handStage = await appChain.query.runtime.PoZKerApp.handStage.get();
    // TODO - what should this be?
    // expect(handStage).toEqual(pkr.ShowdownPending);
  })


  it('fails on bets of 0 (takeAction())', async () => {
    // Just ensure our helper functions for joining+depositing work
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP0: PrivateKey = PrivateKey.random();
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP0, shuffleKeyP1, alicePrivateKey, alice, bobPrivateKey, bob);

    // Start with a call and check
    appChain.setSigner(alicePrivateKey);
    const txn1 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.PreflopCall, Field(0))
    });
    await txn1.sign();
    await txn1.send();
    const block1 = await appChain.produceBlock();
    expect(block1?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Check, Field(0))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);

    // It's flop now so we have to commit flop
    await commitFlop(appChain, pkr, shuffleKeyP0, shuffleKeyP1, alicePrivateKey, alice, bobPrivateKey, bob)

    // Betting 0 should fail
    appChain.setSigner(alicePrivateKey);
    const txnFail = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Bet, Field(0))
    });
    await txnFail.sign();
    await txnFail.send();
    const blockFail = await appChain.produceBlock();
    expect(blockFail?.transactions[0].status.toBoolean()).toBe(false);
    // invalid game state street?
    expect(blockFail?.transactions[0].statusMessage).toBe('Invalid bet size!');
  })


  function encryptCard(cardPrime: number, shuffleKeyP1: PrivateKey, shuffleKeyP2: PrivateKey): Card {
    const cardPoint: PublicKey = cardPrimeToPublicKey(cardPrime);
    // console.log("Encrypting card...", cardPrime);
    // console.log(cardPoint.toBase58())
    let card: Card = createNewCard(cardPoint.toGroup())

    card = addPlayerToCardMask(card, shuffleKeyP1);
    card = mask(card);

    card = addPlayerToCardMask(card, shuffleKeyP2);
    card = mask(card);
    return card
  }

  it('lets players showdown and settle (showsCards(), settle())', async () => {
    // If p1 immediately folds we should be able to call 'settle', do that and confirm balances are valid
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    const shuffleKeyP2: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP1, shuffleKeyP2, alicePrivateKey, alice, bobPrivateKey, bob);

    // p1 folds
    appChain.setSigner(alicePrivateKey);
    const txn3 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Fold, Field(0))
    });
    await txn3.sign();
    await txn3.send();
    const block3 = await appChain.produceBlock();
    // const err = block3?.transactions[0].statusMessage;
    // console.log(err);
    expect(block3?.transactions[0].status.toBoolean()).toBe(true);

    // Do NOT have to call showCards - should go straight to settle

    appChain.setSigner(alicePrivateKey);
    const txn4 = await appChain.transaction(alice, () => {
      pkr.settle()
    });
    await txn4.sign();
    await txn4.send();
    const block4 = await appChain.produceBlock();
    expect(block4?.transactions[0].status.toBoolean()).toBe(true);

    const stack0 = await appChain.query.runtime.PoZKerApp.stack0.get();
    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    expect(stack0).toEqual(Field(99));
    expect(stack1).toEqual(Field(101));
  })


  it('lets players commit and decode board cards (commitBoardcards(), decodeBoardcards())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(100));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    const shuffleKeyP2: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP1, shuffleKeyP2, alicePrivateKey, alice, bobPrivateKey, bob);

    // Start with a call and check
    appChain.setSigner(alicePrivateKey);
    const txn1 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.PreflopCall, Field(0))
    });
    await txn1.sign();
    await txn1.send();
    const block1 = await appChain.produceBlock();
    expect(block1?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Check, Field(0))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);

    const handStageA = await appChain.query.runtime.PoZKerApp.handStage.get();
    expect(handStageA).toEqual(pkr.FlopDeal);

    // It's flop now so we have to commit flop
    const boardcard0 = cardMapping52["Kc"];
    const boardcard1 = cardMapping52["Ac"];
    const boardcard2 = cardMapping52["Qs"];
    // For these we're actually using a different encryption key, but it's fine for the test
    const encryptKeyAlice: PrivateKey = PrivateKey.random();
    const encryptKeyBob: PrivateKey = PrivateKey.random();

    // p0 cards...
    const card0Enc = encryptCard(boardcard0, encryptKeyAlice, encryptKeyBob);
    const card1Enc = encryptCard(boardcard1, encryptKeyAlice, encryptKeyBob);
    const card2Enc = encryptCard(boardcard2, encryptKeyAlice, encryptKeyBob);

    // alice should decrypt her half of the cards before committing them...
    const card0 = partialUnmask(card0Enc, encryptKeyAlice);
    const card1 = partialUnmask(card1Enc, encryptKeyAlice);
    const card2 = partialUnmask(card2Enc, encryptKeyAlice);

    appChain.setSigner(alicePrivateKey);
    const txn3 = await appChain.transaction(alice, () => {
      pkr.commitBoardcards(card0, card1, card2)
    });
    await txn3.sign();
    await txn3.send();
    const block3 = await appChain.produceBlock();
    expect(block3?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn4 = await appChain.transaction(bob, () => {
      pkr.decodeBoardcards(Field(boardcard0), Field(boardcard1), Field(boardcard2))
    });
    await txn4.sign();
    await txn4.send();
    const block4 = await appChain.produceBlock();
    expect(block4?.transactions[0].status.toBoolean()).toBe(true);

    // And at this point cards should be fully committed, and it should be turn betting
    const handStageB = await appChain.query.runtime.PoZKerApp.handStage.get();
    expect(handStageB).toEqual(pkr.FlopBetting);

    const flop0 = await appChain.query.runtime.PoZKerApp.flop0.get();
    const flop1 = await appChain.query.runtime.PoZKerApp.flop1.get();
    const flop2 = await appChain.query.runtime.PoZKerApp.flop2.get();
    expect(flop0).toEqual(Field(boardcard0));
    expect(flop1).toEqual(Field(boardcard1));
    expect(flop2).toEqual(Field(boardcard2));
  })


  it('allows players to show cards and settle showCards() settle()', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await init(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

    // Adding in balance checks on this test - we should have 1k each at this point
    const tokenId = TokenId.from(0);
    const aliceBalKey = new BalancesKey({ tokenId, address: alice });
    const bobBalKey = new BalancesKey({ tokenId, address: bob });
    const balAliceA = await appChain.query.runtime.Balances.balances.get(aliceBalKey);
    const balBobA = await appChain.query.runtime.Balances.balances.get(bobBalKey);
    expect(balAliceA?.toBigInt()).toEqual(1000n);
    expect(balBobA?.toBigInt()).toEqual(1000n);

    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0), Field(100));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1), Field(150));

    // After joining - alice should have 900, bob should have 850
    const balAliceB = await appChain.query.runtime.Balances.balances.get(aliceBalKey);
    const balBobB = await appChain.query.runtime.Balances.balances.get(bobBalKey);
    expect(balAliceB?.toBigInt()).toEqual(900n);
    expect(balBobB?.toBigInt()).toEqual(850n);


    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);
    const shuffleKeyP0: PrivateKey = PrivateKey.random();
    const shuffleKeyP1: PrivateKey = PrivateKey.random();
    await commitHolecards(appChain, pkr, shuffleKeyP0, shuffleKeyP1, alicePrivateKey, alice, bobPrivateKey, bob);

    // Just immediately go all-in to finish betting
    appChain.setSigner(alicePrivateKey);
    const txn1 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Raise, Field(99))
    });
    await txn1.sign();
    await txn1.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.Call, Field(0))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);

    // These are what we're committing
    const card0prime52 = cardMapping52["Ah"];
    const card1prime52 = cardMapping52["Ad"];
    // // we'll give p2 a flush
    const card2prime52 = cardMapping52["Ks"];
    const card3prime52 = cardMapping52["Ts"];

    const boardcard0 = cardMapping52["Kc"];
    const boardcard1 = cardMapping52["Ac"];
    const boardcard2 = cardMapping52["Qs"];
    const boardcard3 = cardMapping52["8s"];
    const boardcard4 = cardMapping52["6s"];
    await commitFlop(appChain, pkr, shuffleKeyP0, shuffleKeyP1, alicePrivateKey, alice, bobPrivateKey, bob)
    // Because we're all in, we should immediately skip to deal stage of next street
    const handStageA = await appChain.query.runtime.PoZKerApp.handStage.get();
    expect(handStageA).toEqual(pkr.TurnDeal);
    await commitTurn(appChain, pkr, shuffleKeyP0, shuffleKeyP1, alicePrivateKey, alice, bobPrivateKey, bob)
    const handStageB = await appChain.query.runtime.PoZKerApp.handStage.get();
    expect(handStageB).toEqual(pkr.RiverDeal);
    await commitRiver(appChain, pkr, shuffleKeyP0, shuffleKeyP1, alicePrivateKey, alice, bobPrivateKey, bob)
    const handStageC = await appChain.query.runtime.PoZKerApp.handStage.get();
    expect(handStageC).toEqual(pkr.ShowdownA);

    // const street = await appChain.query.runtime.PoZKerApp.street.get();
    // expect(street).toEqual(pkr.ShowdownPending);

    // Loading map
    const merkleMapBasicFn = "merkleMapBasic.json"
    const merkleMapFlushFn = "merkleMapFlush.json"

    const jsonDataBasic = fs.readFileSync(merkleMapBasicFn, 'utf8');
    const merkleMapBasic: MerkleMapSerializable = deserialize(jsonDataBasic);

    const jsonDataFlush = fs.readFileSync(merkleMapFlushFn, 'utf8');
    const merkleMapFlush: MerkleMapSerializable = deserialize(jsonDataFlush);

    const allCardsP1: [Field, Field, Field, Field, Field, Field, Field] = [Field(card0prime52), Field(card1prime52), Field(boardcard0), Field(boardcard1), Field(boardcard2), Field(boardcard3), Field(boardcard4)]
    const [useCardsP1, isFlushP1, merkleMapKeyP1, merkleMapValP1] = getShowdownData(allCardsP1);
    const pathP1: MerkleMapWitness = getMerkleMapWitness(merkleMapBasic, merkleMapFlush, isFlushP1.toBoolean(), merkleMapKeyP1)
    // console.log("---- p1 info")
    // console.log(useCardsP1[0].toJSON());
    // console.log(useCardsP1[1].toJSON());
    // console.log(useCardsP1[2].toJSON());
    // console.log(useCardsP1[3].toJSON());
    // console.log(useCardsP1[4].toJSON());
    // console.log(useCardsP1[5].toJSON());
    // console.log(useCardsP1[6].toJSON());
    // console.log(isFlushP1.toJSON());
    // console.log(merkleMapKeyP1.toJSON())
    // console.log(merkleMapValP1.toJSON())

    const allCardsP2: [Field, Field, Field, Field, Field, Field, Field] = [Field(card2prime52), Field(card3prime52), Field(boardcard0), Field(boardcard1), Field(boardcard2), Field(boardcard3), Field(boardcard4)]
    const [useCardsP2, isFlushP2, merkleMapKeyP2, merkleMapValP2] = getShowdownData(allCardsP2);
    const pathP2: MerkleMapWitness = getMerkleMapWitness(merkleMapBasic, merkleMapFlush, isFlushP2.toBoolean(), merkleMapKeyP2)
    // console.log("---- p2 info")
    // console.log(useCardsP2[0].toJSON());
    // console.log(useCardsP2[1].toJSON());
    // console.log(useCardsP2[2].toJSON());
    // console.log(useCardsP2[3].toJSON());
    // console.log(useCardsP2[4].toJSON());
    // console.log(useCardsP2[5].toJSON());
    // console.log(useCardsP2[6].toJSON());
    // console.log(isFlushP2.toJSON());
    // console.log(merkleMapKeyP2.toJSON())
    // console.log(merkleMapValP2.toJSON())

    appChain.setSigner(alicePrivateKey);
    const txnA = await appChain.transaction(alice, () => {
      pkr.showCards(allCardsP1[0],
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
        shuffleKeyP0,
        merkleMapKeyP1,
        merkleMapValP1,
        pathP1,
      )
    });
    await txnA.sign();
    await txnA.send();
    const blockA = await appChain.produceBlock();
    expect(blockA?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txnB = await appChain.transaction(bob, () => {
      pkr.showCards(allCardsP2[0],
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
        shuffleKeyP1,
        merkleMapKeyP2,
        merkleMapValP2,
        pathP2,
      )
    });
    await txnB.sign();
    await txnB.send();
    const blockB = await appChain.produceBlock();
    const err = blockB?.transactions[0].statusMessage;
    console.log(err);
    expect(blockB?.transactions[0].status.toBoolean()).toBe(true);

    // After showing cards should be at settle...
    const handStageSettle = await appChain.query.runtime.PoZKerApp.handStage.get();
    expect(handStageSettle).toEqual(pkr.Settle);

    appChain.setSigner(bobPrivateKey);
    const txn = await appChain.transaction(bob, () => {
      pkr.settle()
    });
    await txn.sign();
    await txn.send();
    const blockSettle = await appChain.produceBlock();
    expect(blockSettle?.transactions[0].status.toBoolean()).toBe(true);

    // After calling settle - hand state should have fully reset
    const lastAction = await appChain.query.runtime.PoZKerApp.lastAction.get();
    const handStage = await appChain.query.runtime.PoZKerApp.handStage.get();
    const pot = await appChain.query.runtime.PoZKerApp.pot.get();
    const showdownValueP0 = await appChain.query.runtime.PoZKerApp.showdownValueP0.get();
    const showdownValueP1 = await appChain.query.runtime.PoZKerApp.showdownValueP1.get();
    const betThisStreet0 = await appChain.query.runtime.PoZKerApp.betThisStreet0.get();
    const betThisStreet1 = await appChain.query.runtime.PoZKerApp.betThisStreet1.get();
    const lastBetSize = await appChain.query.runtime.PoZKerApp.lastBetSize.get();
    const button = await appChain.query.runtime.PoZKerApp.button.get();
    const playerTurn = await appChain.query.runtime.PoZKerApp.playerTurn.get();
    const stack0 = await appChain.query.runtime.PoZKerApp.stack0.get();
    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    // So p1 wins with a flush - they should have stack of 200!
    expect(stack0).toEqual(Field(0));
    expect(stack1).toEqual(Field(250));

    expect(lastAction).toEqual(pkr.Null);
    expect(handStage).toEqual(pkr.SBPostStage);
    expect(pot).toEqual(Field(0));
    expect(showdownValueP0).toEqual(Field(0));
    expect(showdownValueP1).toEqual(Field(0));
    expect(betThisStreet0).toEqual(Field(0));
    expect(betThisStreet1).toEqual(Field(0));
    expect(lastBetSize).toEqual(Field(0));
    // The important check - should have switched to other player's button/SB
    expect(button).toEqual(Field(1));
    expect(playerTurn).toEqual(pkr.P1Turn);

    // And after calling 'showdown' we should have transitioned to GameOver
    // const gameOver = await appChain.query.runtime.PoZKerApp.gameOver.get();
    // expect(gameOver?.toBoolean()).toEqual(true);

    // When P1 leaves - 
    appChain.setSigner(bobPrivateKey);
    const txnWd2 = await appChain.transaction(bob, () => {
      pkr.leaveTable()
    });
    await txnWd2.sign();
    await txnWd2.send();
    const blockWd2 = await appChain.produceBlock();
    expect(blockWd2?.transactions[0].status.toBoolean()).toBe(true);

    // So after p1 leaves, their stack should be 0
    const stack0B = await appChain.query.runtime.PoZKerApp.stack0.get();
    const stack1B = await appChain.query.runtime.PoZKerApp.stack1.get();
    expect(stack0B).toEqual(Field(0));
    expect(stack1B).toEqual(Field(0));
    const player0Key = await appChain.query.runtime.PoZKerApp.player0Key.get();
    const player1Key = await appChain.query.runtime.PoZKerApp.player1Key.get();
    // expect(player0Key).toEqual(PublicKey.empty())
    expect(player1Key).toEqual(PublicKey.empty());


    appChain.setSigner(alicePrivateKey);
    const txnWd1 = await appChain.transaction(alice, () => {
      pkr.leaveTable()
    });
    await txnWd1.sign();
    await txnWd1.send();
    const blockWd1 = await appChain.produceBlock();
    expect(blockWd1?.transactions[0].status.toBoolean()).toBe(true);

    // And now both of them should be empty
    const player0KeyB = await appChain.query.runtime.PoZKerApp.player0Key.get();
    const player1KeyB = await appChain.query.runtime.PoZKerApp.player1Key.get();
    expect(player0KeyB).toEqual(PublicKey.empty());
    expect(player1KeyB).toEqual(PublicKey.empty());

    // And finally after quitting, alice should still have 900, bob should be up to 1100
    const balAliceC = await appChain.query.runtime.Balances.balances.get(aliceBalKey);
    const balBobC = await appChain.query.runtime.Balances.balances.get(bobBalKey);
    expect(balAliceC?.toBigInt()).toEqual(900n);
    expect(balBobC?.toBigInt()).toEqual(1100n);
  })

});

