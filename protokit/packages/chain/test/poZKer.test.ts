import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, Field, Poseidon, PublicKey, MerkleMapWitness } from "o1js";
import { PoZKerApp, cardMapping52 } from "../src/poZKer";
import { log } from "@proto-kit/common";
import { UInt64 } from "@proto-kit/library";

log.setLevel("ERROR");

describe("poZKer", () => {

  async function localDeploy() {
    const appChain = TestingAppChain.fromRuntime({
      PoZKerApp,
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

  async function setPlayer(appChain: any, pkr: PoZKerApp, playerPrivKey: PrivateKey, playerPubKey: PublicKey, seatI: Field) {
    // This will automatically deposit now too...
    appChain.setSigner(playerPrivKey);
    const tx1 = await appChain.transaction(playerPubKey, () => {
      pkr.joinTable(seatI, Field(100))
    });
    await tx1.sign();
    await tx1.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);
  }

  async function postBlinds(appChain: any, pkr: PoZKerApp, alicePrivateKey: PrivateKey, alice: PublicKey, bobPrivateKey: PrivateKey, bob: PublicKey) {

    // Set table state first?
    appChain.setSigner(alicePrivateKey);
    const txn0 = await appChain.transaction(alice, () => {
      pkr.resetTableState()
    });
    await txn0.sign();
    await txn0.send();
    const block0 = await appChain.produceBlock();
    expect(block0?.transactions[0].status.toBoolean()).toBe(true);

    const txn1 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.PostSB, Field(1))
    });
    await txn1.sign();
    await txn1.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    appChain.setSigner(bobPrivateKey);
    const txn2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.PostBB, Field(2))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);
  }

  it("allows players to join game (joinTable)", async () => {
    const appChain = await localDeploy();

    // Join game with two players
    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bobPrivateKey = PrivateKey.random();
    const bob = bobPrivateKey.toPublicKey();

    appChain.setSigner(alicePrivateKey);

    const pkr = appChain.runtime.resolve("PoZKerApp");

    // First player joining
    const aliceSeat = Field(0);
    const bobSeat = Field(1);
    const tx1 = await appChain.transaction(alice, () => {
      pkr.joinTable(aliceSeat, Field(100))
    });
    await tx1.sign();
    await tx1.send();
    const block = await appChain.produceBlock();

    const player1Key = await appChain.query.runtime.PoZKerApp.player1Key.get();
    const player2Key = await appChain.query.runtime.PoZKerApp.player2Key.get();
    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    const stack2 = await appChain.query.runtime.PoZKerApp.stack2.get();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);
    expect(player1Key).toEqual(alice);
    expect(player2Key).toEqual(PublicKey.empty());
    expect(stack1).toEqual(Field(100));
    expect(stack2).toEqual(Field(0));


    // Second player joining
    appChain.setSigner(bobPrivateKey);
    const tx2 = await appChain.transaction(bob, () => {
      pkr.joinTable(bobSeat, Field(100))
    });
    await tx2.sign();
    await tx2.send();
    const block2 = await appChain.produceBlock();

    const player1KeyB = await appChain.query.runtime.PoZKerApp.player1Key.get();
    const player2KeyB = await appChain.query.runtime.PoZKerApp.player2Key.get();
    const stack1B = await appChain.query.runtime.PoZKerApp.stack1.get();
    const stack2B = await appChain.query.runtime.PoZKerApp.stack2.get();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);
    expect(player1KeyB).toEqual(alice);
    expect(player2KeyB).toEqual(bob);
    expect(stack1B).toEqual(Field(100));
    expect(stack2B).toEqual(Field(100));

  }, 1_000_000);

  it('lets both players post blinds (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));

    // Set table state first?
    appChain.setSigner(alicePrivateKey);
    const txn0 = await appChain.transaction(alice, () => {
      pkr.resetTableState()
    });
    await txn0.sign();
    await txn0.send();
    const block0 = await appChain.produceBlock();
    expect(block0?.transactions[0].status.toBoolean()).toBe(true);


    appChain.setSigner(alicePrivateKey);
    const txn1 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.PostSB, Field(1))
    });
    await txn1.sign();
    await txn1.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    // Should have posted sb of 1
    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    const stack2 = await appChain.query.runtime.PoZKerApp.stack2.get();
    // Make sure deposits were successful
    expect(stack1).toEqual((Field(99)));
    expect(stack2).toEqual((Field(100)));

    appChain.setSigner(bobPrivateKey);
    const txn2 = await appChain.transaction(bob, () => {
      pkr.takeAction(pkr.PostBB, Field(2))
    });
    await txn2.sign();
    await txn2.send();
    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);

    // Now should have SB and BB posted
    const stack1B = await appChain.query.runtime.PoZKerApp.stack1.get();
    const stack2B = await appChain.query.runtime.PoZKerApp.stack2.get();
    // Make sure deposits were successful
    expect(stack1B).toEqual((Field(99)));
    expect(stack2B).toEqual((Field(98)));

  }, 1_000_000);

  it('succeeds on valid p1 actions (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    const stack2 = await appChain.query.runtime.PoZKerApp.stack2.get();
    // Make sure deposits were successful
    expect(stack1).toEqual((Field(99)));
    expect(stack2).toEqual((Field(98)));

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

    const turn = await appChain.query.runtime.PoZKerApp.turn.get();
    const street = await appChain.query.runtime.PoZKerApp.street.get();
    const lastAction = await appChain.query.runtime.PoZKerApp.lastAction.get();

    // const err = block?.transactions[0].statusMessage;
    // console.log(err);
    expect(block?.transactions[0].status.toBoolean()).toBe(true);
    expect(turn).toEqual(pkr.P2Turn);
    expect(street).toEqual(pkr.Preflop);
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
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

    // After depositing player 1 should have stack of 99 (SB)
    // Player 2 should have stack of 98 (BB)
    const stack1 = await appChain.query.runtime.PoZKerApp.stack1.get();
    const stack2 = await appChain.query.runtime.PoZKerApp.stack2.get();
    expect(stack1).toEqual(Field(99));
    expect(stack2).toEqual(Field(98));

  });

  it("prevents wrong player from acting (takeAction)", async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

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
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);


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
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

    // Start facing a call
    appChain.setSigner(alicePrivateKey);
    const txn = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Call, Field(0))
    });
    await txn.sign();
    await txn.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    // Make sure that the state is correct
    const turn = await appChain.query.runtime.PoZKerApp.turn.get();
    const street = await appChain.query.runtime.PoZKerApp.street.get();
    const lastAction = await appChain.query.runtime.PoZKerApp.lastAction.get();
    expect(turn).toEqual(pkr.P2Turn);
    expect(street).toEqual(pkr.Preflop);
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
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

    // Again start facing a call
    appChain.setSigner(alicePrivateKey);
    const txn = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Call, Field(0))
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
    const turn = await appChain.query.runtime.PoZKerApp.turn.get();
    const street = await appChain.query.runtime.PoZKerApp.street.get();
    const lastAction = await appChain.query.runtime.PoZKerApp.lastAction.get();
    expect(turn).toEqual(pkr.P1Turn);
    expect(street).toEqual(pkr.Flop);
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
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

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
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

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

    const street = await appChain.query.runtime.PoZKerApp.street.get();
    expect(street).toEqual(pkr.ShowdownPending);
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
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

    // Start with a call and check

    appChain.setSigner(alicePrivateKey);

    const txn1 = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Call, Field(0))
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

    // Betting 0 should fail
    appChain.setSigner(alicePrivateKey);
    const txnFail = await appChain.transaction(alice, () => {
      pkr.takeAction(pkr.Bet, Field(0))
    });
    await txnFail.sign();
    await txnFail.send();
    const blockFail = await appChain.produceBlock();
    expect(blockFail?.transactions[0].status.toBoolean()).toBe(false);
    expect(blockFail?.transactions[0].statusMessage).toBe('Invalid bet size!');
  })


  it('prevents transition to gameover before showdown is complete (takeAction())', async () => {
    const appChain = await localDeploy();
    const alicePrivateKey = PrivateKey.random();
    const bobPrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bob = bobPrivateKey.toPublicKey();
    appChain.setSigner(alicePrivateKey);
    const pkr = appChain.runtime.resolve("PoZKerApp");
    await setPlayer(appChain, pkr, alicePrivateKey, alice, Field(0));
    await setPlayer(appChain, pkr, bobPrivateKey, bob, Field(1));
    await postBlinds(appChain, pkr, alicePrivateKey, alice, bobPrivateKey, bob);

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

    const street = await appChain.query.runtime.PoZKerApp.street.get();
    expect(street).toEqual(pkr.ShowdownPending);

    // TODO - this test actually seemed like it was set to pass before?  Not understanding

    // We should NOT be able to call 'showdown' method yet - 
    // 1. Need other board cards
    // 2. Both players need to show hands
    const txnFail = await appChain.transaction(bob, () => {
      pkr.showdown()
    });
    await txnFail.sign();
    await txnFail.send();
    const blockFail = await appChain.produceBlock();
    expect(blockFail?.transactions[0].status.toBoolean()).toBe(false);
    expect(blockFail?.transactions[0].statusMessage).toBe('Invalid showdown gamestate!');

  })

});