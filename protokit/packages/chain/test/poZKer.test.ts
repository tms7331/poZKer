import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, Field, Poseidon } from "o1js";
import { Balances } from "../src/poker";
import { log } from "@proto-kit/common";
import { BalancesKey, TokenId, UInt64 } from "@proto-kit/library";

log.setLevel("ERROR");

describe("poZKer", () => {

  async function localDeploy() {
    const appChain = TestingAppChain.fromRuntime({
      Balances,
    });

    appChain.configurePartial({
      Runtime: {
        Balances: {
          totalSupply: UInt64.from(10000),
        },
      },
    });

    await appChain.start();
    return appChain;
  }

  it("allows players to join game (joinGame)", async () => {

    const appChain = await localDeploy();

    // Join game with two players
    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const aliceHash = Poseidon.hash(alice.toFields());
    const bobPrivateKey = PrivateKey.random();
    const bob = alicePrivateKey.toPublicKey();
    const bobHash = Poseidon.hash(alice.toFields());

    appChain.setSigner(alicePrivateKey);

    const balances = appChain.runtime.resolve("Balances");

    // First player joining
    const tx1 = await appChain.transaction(alice, () => {
      balances.joinGame(alice)
    });
    await tx1.sign();
    await tx1.send();
    const block = await appChain.produceBlock();

    const player1Hash = await appChain.query.runtime.Balances.player1Hash.get();
    const player2Hash = await appChain.query.runtime.Balances.player2Hash.get();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);
    expect(player1Hash).toEqual(aliceHash);
    expect(player2Hash).toEqual(Field(0));


    // Second player joining
    // appChain.setSigner(bobPrivateKey);
    const tx2 = await appChain.transaction(bob, () => {
      balances.joinGame(bob)
    });
    await tx2.sign();
    await tx2.send();
    const block2 = await appChain.produceBlock();

    const player1HashB = await appChain.query.runtime.Balances.player1Hash.get();
    const player2HashB = await appChain.query.runtime.Balances.player2Hash.get();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);
    expect(player1HashB).toEqual(aliceHash);
    expect(player2HashB).toEqual(bobHash);

  }, 1_000_000);
});
