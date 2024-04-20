import { create } from "zustand";
import { Client, useClientStore } from "./client";
import { immer } from "zustand/middleware/immer";
import { PendingTransaction, UnsignedTransaction } from "@proto-kit/sequencer";
import { BalancesKey } from "@proto-kit/library";
import { PublicKey, Field, UInt64, PrivateKey, MerkleMapWitness, Bool } from "o1js";
import { useCallback, useEffect } from "react";
import { useChainStore } from "./chain";
import { useWalletStore } from "./wallet";

export interface PoZKerState {
  loading: boolean;
  player1Key: string;
  player2Key: string;
  stack1: string;
  stack2: string;
  turn: string,
  street: string,
  gameOver: string,
  pot: string,
  loadState: (client: Client, address: string) => Promise<void>;
  joinTable: (client: Client, address: string, seatI: number, depositAmount: number) => Promise<PendingTransaction>;
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
  showdown: (client: Client, address: string) => Promise<PendingTransaction>;
  withdraw: (client: Client, address: string) => Promise<PendingTransaction>;
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
    player1Key: "0",
    player2Key: "0",
    stack1: "0",
    stack2: "0",
    turn: "0",
    street: "0",
    gameOver: "0",
    pot: "0",

    async loadState(client: Client, address: string) {
      set((state) => {
        state.loading = true;
      });

      console.log("Calleed useBalanceStore loadBalance...");
      const player1Key = await client.query.runtime.PoZKerApp.player1Key.get();
      console.log("MADE player1Hash CALL AND GOT");
      console.log(player1Key?.toBase58());
      const player2Key = await client.query.runtime.PoZKerApp.player2Key.get();
      console.log("MADE player2Hash CALL AND GOT");
      console.log(player2Key?.toBase58());
      console.log("empty key?", PublicKey.empty().toBase58());
      const stack1 = await client.query.runtime.PoZKerApp.stack1.get();
      const stack2 = await client.query.runtime.PoZKerApp.stack2.get();

      const turn = await client.query.runtime.PoZKerApp.turn.get();
      const street = await client.query.runtime.PoZKerApp.street.get();
      const gameOver = await client.query.runtime.PoZKerApp.gameOver.get();
      const pot = await client.query.runtime.PoZKerApp.pot.get();

      // So if key is null OR equalty to empty public key, display 0...
      const p1Empty = player1Key?.toBase58() === PublicKey.empty().toBase58();
      const p2Empty = player2Key?.toBase58() === PublicKey.empty().toBase58();
      const player1Key_ = p1Empty ? "0" : player1Key?.toBase58();
      const player2Key_ = p2Empty ? "0" : player2Key?.toBase58();

      set((state) => {
        state.player1Key = player1Key_ ?? "0";
        state.player2Key = player2Key_ ?? "0";
        state.stack1 = stack1?.toString() ?? "0";
        state.stack2 = stack2?.toString() ?? "0";
        state.turn = turn?.toString() ?? "0";
        state.street = street?.toString() ?? "0";
        state.gameOver = gameOver?.toString() ?? "0";
        state.pot = pot?.toString() ?? "0";
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

    async showdown(client: Client, address: string) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        pkr.showdown()
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async withdraw(client: Client, address: string) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, () => {
        pkr.withdraw()
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


export const useShowdown = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.showdown(
      client.client,
      wallet.wallet,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};


export const useWithdraw = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.withdraw(
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
