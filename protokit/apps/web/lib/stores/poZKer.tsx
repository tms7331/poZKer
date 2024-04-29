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
  loadState: (client: Client, address: string) => Promise<void>;
  joinTable: (client: Client, address: string, seatI: number, depositAmount: number) => Promise<PendingTransaction>;
  leaveTable: (client: Client, address: string) => Promise<PendingTransaction>;
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
    pot: "0",

    async loadState(client: Client, address: string) {
      set((state) => {
        state.loading = true;
      });

      console.log("Calleed useBalanceStore loadBalance...");
      const player0Key = await client.query.runtime.PoZKerApp.player0Key.get();
      console.log("MADE player1Hash CALL AND GOT");
      console.log(player0Key?.toBase58());
      const player1Key = await client.query.runtime.PoZKerApp.player1Key.get();
      console.log("MADE player2Hash CALL AND GOT");
      console.log(player1Key?.toBase58());
      console.log("empty key?", PublicKey.empty().toBase58());
      const stack0 = await client.query.runtime.PoZKerApp.stack0.get();
      const stack1 = await client.query.runtime.PoZKerApp.stack1.get();

      const playerTurn = await client.query.runtime.PoZKerApp.playerTurn.get();
      const handStage = await client.query.runtime.PoZKerApp.handStage.get();
      const pot = await client.query.runtime.PoZKerApp.pot.get();

      const handId = await client.query.runtime.PoZKerApp.handId.get();
      const button = await client.query.runtime.PoZKerApp.button.get();
      const lastAction = await client.query.runtime.PoZKerApp.lastAction.get();

      // So if key is null OR equalty to empty public key, display 0...
      const p1Empty = player0Key?.toBase58() === PublicKey.empty().toBase58();
      const p2Empty = player1Key?.toBase58() === PublicKey.empty().toBase58();
      const player0Key_ = p1Empty ? "0" : player0Key?.toBase58();
      const player1Key_ = p2Empty ? "0" : player1Key?.toBase58();

      set((state) => {
        state.player0Key = player0Key_ ?? "0";
        state.player1Key = player1Key_ ?? "0";
        state.stack0 = stack0?.toString() ?? "0";
        state.stack1 = stack1?.toString() ?? "0";
        state.playerTurn = playerTurn?.toString() ?? "0";
        state.lastAction = lastAction?.toString() ?? "0";
        state.handStage = handStage?.toString() ?? "0";
        state.pot = pot?.toString() ?? "0";
        state.handId = handId?.toString() ?? "0";
        state.button = button?.toString() ?? "0";
        state.loading = false;
      });
    },

    async joinTable(client: Client, address: string, seatI: number, depositAmount: number) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);
      console.log("Fauced called pozker...");

      const tx = await client.transaction(sender, () => {
        pkr.joinTable(Field(seatI), Field(depositAmount))
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
      const g1: Group = Group.generator;
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