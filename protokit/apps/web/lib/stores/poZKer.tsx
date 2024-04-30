import { create } from "zustand";
import { Client, useClientStore } from "./client";
import { immer } from "zustand/middleware/immer";
import { PendingTransaction, UnsignedTransaction } from "@proto-kit/sequencer";
import { BalancesKey } from "@proto-kit/library";
import { PublicKey, Field, UInt64, PrivateKey, MerkleMapWitness, Bool, Struct, Group } from "o1js";
import { useCallback, useEffect } from "react";
import { useChainStore } from "./chain";
import { useWalletStore } from "./wallet";


export class Card extends Struct({
  /**
   * The joint ephemeral key for this card, resulting from all the masking operations.
   * New cards should have this set to the zero point (For example `Group.generator.sub(Group.generator)`)
   */
  epk: Group,

  /**
   * The card value( or masked value) represented as a Group element.
   *
   * Mapping to and from actual game cards and group elements must be done at the application level.
   */
  msg: Group,

  /**
   * The elliptic curve point representing the sum of the public keys of all players masking this card.
   */
  pk: Group,
}) {
  constructor(c1: Group, c2: Group, h: Group) {
    super({ epk: c1, msg: c2, pk: h });
  }
}


export interface PoZKerState {
  loading: boolean;
  player0Key: string;
  player1Key: string;
  stack0: string;
  stack1: string;
  playerTurn: string,
  lastAction: string,
  handStage: string,
  pot: string,
  handId: string,
  button: string,
  p0Hc0: string,
  p0Hc1: string,
  p1Hc0: string,
  p1Hc1: string,
  flop0: string,
  flop1: string,
  flop2: string,
  turn0: string,
  river0: string,
  loadState: (client: Client, address: string) => Promise<void>;
  joinTable: (client: Client, address: string, seatI: number, depositAmount: number) => Promise<PendingTransaction>;
  leaveTable: (client: Client, address: string) => Promise<PendingTransaction>;
  rebuy: (client: Client, address: string, seatI: number, depositAmount: number) => Promise<PendingTransaction>;
  resetTableState: (client: Client, address: string) => Promise<PendingTransaction>;
  commitBoardcards: (client: Client, address: string) => Promise<PendingTransaction>;
  decodeBoardcards: (client: Client, address: string, cardVal0: number, cardVal1: number, cardVal2: number,) => Promise<PendingTransaction>;
  commitOpponentHolecards: (client: Client, address: string) => Promise<PendingTransaction>;

  showCards: (client: Client, address: string, holecard0: number,
    holecard1: number,
    boardcard0: number,
    boardcard1: number,
    boardcard2: number,
    boardcard3: number,
    boardcard4: number,
    useHolecard0: boolean,
    useHolecard1: boolean,
    useBoardcards0: boolean,
    useBoardcards1: boolean,
    useBoardcards2: boolean,
    useBoardcards3: boolean,
    useBoardcards4: boolean,
    isFlush: boolean,
    shuffleKey: string,
    merkleMapKey: number,
    merkleMapVal: number,
    path: string,
  ) => Promise<PendingTransaction>;
  settle: (client: Client, address: string) => Promise<PendingTransaction>;
  takeAction: (client: Client, address: string, action: number, betSize: number) => Promise<PendingTransaction>;
}

function isPendingTransaction(
  transaction: PendingTransaction | UnsignedTransaction | undefined,
): asserts transaction is PendingTransaction {
  if (!(transaction instanceof PendingTransaction))
    throw new Error("Transaction is not a PendingTransaction");
}

export const usePoZKerStore = create<
  PoZKerState,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    loading: Boolean(false),
    player0Key: "0",
    player1Key: "0",
    stack0: "0",
    stack1: "0",
    playerTurn: "0",
    lastAction: "0",
    handStage: "0",
    handId: "0",
    button: "0",
    p0Hc0: "0",
    p0Hc1: "0",
    p1Hc0: "0",
    p1Hc1: "0",
    flop0: "0",
    flop1: "0",
    flop2: "0",
    turn0: "0",
    river0: "0",
    pot: "0",

    async loadState(client: Client, address: string) {
      set((state) => {
        state.loading = true;
      });

      const player0Key = await client.query.runtime.PoZKerApp.player0Key.get();
      const player1Key = await client.query.runtime.PoZKerApp.player1Key.get();
      const stack0 = await client.query.runtime.PoZKerApp.stack0.get();
      const stack1 = await client.query.runtime.PoZKerApp.stack1.get();

      const playerTurn = await client.query.runtime.PoZKerApp.playerTurn.get();
      const handStage = await client.query.runtime.PoZKerApp.handStage.get();
      const pot = await client.query.runtime.PoZKerApp.pot.get();

      const handId = await client.query.runtime.PoZKerApp.handId.get();
      const button = await client.query.runtime.PoZKerApp.button.get();
      const lastAction = await client.query.runtime.PoZKerApp.lastAction.get();

      const p0Hc0 = await client.query.runtime.PoZKerApp.p0Hc0.get();
      const p0Hc1 = await client.query.runtime.PoZKerApp.p0Hc1.get();
      const p1Hc0 = await client.query.runtime.PoZKerApp.p1Hc0.get();
      const p1Hc1 = await client.query.runtime.PoZKerApp.p1Hc1.get();

      // console.log("Card string value... ", p0Hc0?.toString())
      // console.log("Card string value... ", p1Hc0?.toString())
      // console.log("Card message value... ", p0Hc0?.msg.toString())
      // console.log("Card message value... ", p1Hc0?.msg.toString())
      // console.log("Testing...")
      // 

      const p0Hc0G: Group = p0Hc0?.msg;
      const p0Hc1G: Group = p0Hc1?.msg;
      const p1Hc0G: Group = p1Hc0?.msg;
      const p1Hc1G: Group = p1Hc1?.msg;

      let p0Hc0V = "0"
      let p0Hc1V = "0"
      let p1Hc0V = "0"
      let p1Hc1V = "0"
      try {
        // const test = Group.generator;
        // const r = test.toJSON();
        // console.log("R GENERATOR", r)
        // console.log(r.y)
        // console.log("R PULL", r)
        // console.log(p1Hc0G.y);
        // console.log(p1Hc0G.y.value);
        // console.log(p1Hc0G.y.value[0]);
        // const rVal = p1Hc0G.y.value[1].toString();
        p0Hc0V = p0Hc0G.y.value[1].toString()
        p0Hc1V = p0Hc1G.y.value[1].toString()
        p1Hc0V = p1Hc0G.y.value[1].toString()
        p1Hc1V = p1Hc1G.y.value[1].toString()

      } catch (e: any) {

      }



      /*
      const v1 = p1Hc0G.toFields();
      const v2 = p1Hc0G.toFields()[0];
      const v3 = p1Hc0G.toFields()[0] ? [0];
      const v4 = p1Hc0G.toFields()[0] ? [1];
      console.log(v1);
      console.log(v2);
      */

      const flop0 = await client.query.runtime.PoZKerApp.flop0.get();
      const flop1 = await client.query.runtime.PoZKerApp.flop1.get();
      const flop2 = await client.query.runtime.PoZKerApp.flop2.get();
      const turn0 = await client.query.runtime.PoZKerApp.turn0.get();
      const river0 = await client.query.runtime.PoZKerApp.river0.get();

      // So if key is null OR equalty to empty public key, display 0...
      const p1Empty = player0Key?.toBase58() === PublicKey.empty().toBase58();
      const p2Empty = player1Key?.toBase58() === PublicKey.empty().toBase58();

      const player0Key_ = p1Empty ? "0" : player0Key?.toBase58();
      const player1Key_ = p2Empty ? "0" : player1Key?.toBase58();
      // console.log("PLAYER KEYS:")
      // console.log(player0Key_);
      // console.log(player1Key_);
      // const player0Key_ = "B62qjskaUzuxWfXiEQHRTHoNHCwFqDNhJSxCjkVLJY7VuA7uFjtcGrP";
      // const player1Key_ = "B62qneaGjjo5CtUsJBCWA6NCmf67qMWz84C5vwkHSdHAxaJS8PMxdfu";

      const playerTurnStr = playerTurn?.toString();
      // We used 2 and 3 for our encoding due to a past version of the contract
      // Easier if we convert to 0/1
      const playerTurn_ = playerTurnStr === "3" ? "1" : "0"
      set((state) => {
        state.player0Key = player0Key_ ?? "0";
        state.player1Key = player1Key_ ?? "0";
        state.stack0 = stack0?.toString() ?? "0";
        state.stack1 = stack1?.toString() ?? "0";
        state.playerTurn = playerTurn_;
        state.lastAction = lastAction?.toString() ?? "0";
        state.handStage = handStage?.toString() ?? "0";
        state.pot = pot?.toString() ?? "0";
        state.handId = handId?.toString() ?? "0";
        state.button = button?.toString() ?? "0";
        state.p0Hc0 = p0Hc0V;
        state.p0Hc1 = p0Hc1V;
        state.p1Hc0 = p1Hc0V;
        state.p1Hc1 = p1Hc1V;
        state.flop0 = flop0?.toString() ?? "0";
        state.flop1 = flop1?.toString() ?? "0";
        state.flop2 = flop2?.toString() ?? "0";
        state.turn0 = turn0?.toString() ?? "0";
        state.river0 = river0?.toString() ?? "0";
        state.loading = false;
      });
    },

    async joinTable(client: Client, address: string, seatI: number, depositAmount: number) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);
      const tx = await client.transaction(sender, () => {
        pkr.joinTable(Field(seatI), Field(depositAmount))
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },


    async rebuy(client: Client, address: string, seatI: number, depositAmount: number) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);
      const tx = await client.transaction(sender, () => {
        pkr.rebuy(Field(seatI), Field(depositAmount))
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async showCards(client: Client, address: string, holecard0: number,
      holecard1: number,
      boardcard0: number,
      boardcard1: number,
      boardcard2: number,
      boardcard3: number,
      boardcard4: number,
      useHolecard0: boolean,
      useHolecard1: boolean,
      useBoardcards0: boolean,
      useBoardcards1: boolean,
      useBoardcards2: boolean,
      useBoardcards3: boolean,
      useBoardcards4: boolean,
      isFlush: boolean,
      shuffleKey: string,
      merkleMapKey: number,
      merkleMapVal: number,
      path: string,
    ) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const shuffleKey_: PrivateKey = PrivateKey.fromBase58(shuffleKey);

      // TEMP - just pass in null merkle map...
      const isLefts: Bool[] = [];
      const siblings: Field[] = [];
      const path_: MerkleMapWitness = new MerkleMapWitness(isLefts, siblings);

      const tx = await client.transaction(sender, () => {
        pkr.showCards(
          Field(holecard0),
          Field(holecard1),
          Field(boardcard0),
          Field(boardcard1),
          Field(boardcard2),
          Field(boardcard3),
          Field(boardcard4),
          Bool(useHolecard0),
          Bool(useHolecard1),
          Bool(useBoardcards0),
          Bool(useBoardcards1),
          Bool(useBoardcards2),
          Bool(useBoardcards3),
          Bool(useBoardcards4),
          Bool(isFlush),
          shuffleKey_,
          Field(merkleMapKey),
          Field(merkleMapVal),
          path_,
        );
      });
      await tx.sign();
      await tx.send();
      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async settle(client: Client, address: string) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        pkr.settle()
      });
      await tx.sign();
      await tx.send();
      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async leaveTable(client: Client, address: string) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        pkr.leaveTable()
      });
      await tx.sign();
      await tx.send();
      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async resetTableState(client: Client, address: string) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        pkr.resetTableState()
      });
      await tx.sign();
      await tx.send();
      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async takeAction(client: Client, address: string, action: number, betSize: number) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        pkr.takeAction(Field(action), Field(betSize))
      });
      await tx.sign();
      await tx.send();
      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async commitBoardcards(client: Client, address: string) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const g0: Group = Group.generator;
      const g1: Group = Group.generator;
      const g2: Group = Group.generator;
      const card0: Card = new Card(g0, g1, g2);
      const card1: Card = new Card(g0, g1, g2);
      const card2: Card = new Card(g0, g1, g2);
      const tx = await client.transaction(sender, () => {
        pkr.commitBoardcards(card0, card1, card2)
      });
      await tx.sign();
      await tx.send();
      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async decodeBoardcards(client: Client, address: string, cardVal0: number, cardVal1: number, cardVal2: number) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        pkr.decodeBoardcards(Field(cardVal0), Field(cardVal1), Field(cardVal2))
      });
      await tx.sign();
      await tx.send();
      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async commitOpponentHolecards(client: Client, address: string) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const g0: Group = Group.generator;
      // Use a random value so it's differentiated from the generator and we detect change
      const cardPoint: PublicKey = PublicKey.fromPrivateKey(PrivateKey.random());
      const g1: Group = cardPoint.toGroup();
      const g2: Group = Group.generator;
      const card0: Card = new Card(g0, g1, g2);
      const card1: Card = new Card(g0, g1, g2);
      const tx = await client.transaction(sender, () => {
        pkr.commitOpponentHolecards(card0, card1)
      })

      await tx.sign();
      await tx.send();
      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

  })),
);

export const useObservePoZKer = () => {
  const client = useClientStore();
  const chain = useChainStore();
  const wallet = useWalletStore();
  const pkrState = usePoZKerStore();

  useEffect(() => {
    if (!client.client || !wallet.wallet) return;

    pkrState.loadState(client.client, wallet.wallet);
  }, [client.client, chain.block?.height, wallet.wallet]);
};

export const useJoinTable = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async (seatI: number, depositAmount: number) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.joinTable(
      client.client,
      wallet.wallet,
      seatI,
      depositAmount
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};


export const useRebuy = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async (seatI: number, depositAmount: number) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.rebuy(
      client.client,
      wallet.wallet,
      seatI,
      depositAmount
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};

export const useShowCards = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async (holecard0: number,
    holecard1: number,
    boardcard0: number,
    boardcard1: number,
    boardcard2: number,
    boardcard3: number,
    boardcard4: number,
    useHolecard0: boolean,
    useHolecard1: boolean,
    useBoardcards0: boolean,
    useBoardcards1: boolean,
    useBoardcards2: boolean,
    useBoardcards3: boolean,
    useBoardcards4: boolean,
    isFlush: boolean,
    shuffleKey: string,
    merkleMapKey: number,
    merkleMapVal: number,
    path: string) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.showCards(
      client.client,
      wallet.wallet,
      holecard0,
      holecard1,
      boardcard0,
      boardcard1,
      boardcard2,
      boardcard3,
      boardcard4,
      useHolecard0,
      useHolecard1,
      useBoardcards0,
      useBoardcards1,
      useBoardcards2,
      useBoardcards3,
      useBoardcards4,
      isFlush,
      shuffleKey,
      merkleMapKey,
      merkleMapVal,
      path);

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};


export const useSettle = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.settle(
      client.client,
      wallet.wallet,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};


export const useLeaveTable = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.leaveTable(
      client.client,
      wallet.wallet,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};


export const useTakeAction = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async (action: number, betSize: number) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.takeAction(
      client.client,
      wallet.wallet,
      action,
      betSize
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};


export const useCommitBoardcards = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.commitBoardcards(
      client.client,
      wallet.wallet,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};


export const useDecodeBoardcards = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async (cardVal0: number, cardVal1: number, cardVal2: number) => {
    if (!client.client || !wallet.wallet) return;

    // const decryptKey = PrivateKey.fromBase58(decryptKeyStr);
    const pendingTransaction = await pkrState.decodeBoardcards(
      client.client,
      wallet.wallet,
      cardVal0,
      cardVal1,
      cardVal2,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};

export const useCommitOpponentHolecards = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;
    const pendingTransaction = await pkrState.commitOpponentHolecards(
      client.client,
      wallet.wallet,
    );
    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};

export const useResetTableState = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;
    const pendingTransaction = await pkrState.resetTableState(
      client.client,
      wallet.wallet,
    );
    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};