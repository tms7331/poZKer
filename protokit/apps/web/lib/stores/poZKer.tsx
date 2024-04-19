import { create } from "zustand";
import { Client, useClientStore } from "./client";
import { immer } from "zustand/middleware/immer";
import { PendingTransaction, UnsignedTransaction } from "@proto-kit/sequencer";
import { BalancesKey } from "@proto-kit/library";
import { PublicKey, Field, UInt64 } from "o1js";
import { useCallback, useEffect } from "react";
import { useChainStore } from "./chain";
import { useWalletStore } from "./wallet";

export interface PoZKerState {
  loading: boolean;
  player1Key: string;
  player2Key: string;
  stack1: string;
  stack2: string;
  loadState: (client: Client, address: string) => Promise<void>;
  joinGame: (client: Client, address: string) => Promise<PendingTransaction>;
  deposit: (client: Client, address: string, depositAmount: number) => Promise<PendingTransaction>;
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
        state.loading = false;
      });
    },

    async joinGame(client: Client, address: string) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);
      console.log("Fauced called pozker...");

      const tx = await client.transaction(sender, () => {
        pkr.joinGame(sender)
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },

    async deposit(client: Client, address: string, depositAmount: number) {
      const pkr = client.runtime.resolve("PoZKerApp");
      const sender = PublicKey.fromBase58(address);
      console.log("Deposit called pozker...");

      const tx = await client.transaction(sender, () => {
        pkr.deposit(Field(depositAmount))
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

export const useJoinGame = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.joinGame(
      client.client,
      wallet.wallet,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};

export const useDeposit = () => {
  const client = useClientStore();
  const pkrState = usePoZKerStore();
  const wallet = useWalletStore();

  return useCallback(async (depositAmount: number) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrState.deposit(
      client.client,
      wallet.wallet,
      depositAmount,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};