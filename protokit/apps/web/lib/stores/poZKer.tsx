import { create } from "zustand";
import { Client, useClientStore } from "./client";
import { immer } from "zustand/middleware/immer";
import { PendingTransaction, UnsignedTransaction } from "@proto-kit/sequencer";
import { BalancesKey } from "@proto-kit/library";
import { PublicKey, Field, UInt64 } from "o1js";
import { useCallback, useEffect } from "react";
import { useChainStore } from "./chain";
import { useWalletStore } from "./wallet";

export interface BalancesState {
  loading: boolean;
  balances: {
    // address - balance
    [key: string]: string;
  };
  player1Key: string;
  player2Key: string;
  stack1: string;
  stack2: string;
  loadBalance: (client: Client, address: string) => Promise<void>;
  faucet: (client: Client, address: string) => Promise<PendingTransaction>;
  deposit: (client: Client, address: string, depositAmount: number) => Promise<PendingTransaction>;
}

function isPendingTransaction(
  transaction: PendingTransaction | UnsignedTransaction | undefined,
): asserts transaction is PendingTransaction {
  if (!(transaction instanceof PendingTransaction))
    throw new Error("Transaction is not a PendingTransaction");
}

export const useBalancesStore = create<
  BalancesState,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    loading: Boolean(false),
    balances: {},
    player1Key: "0",
    player2Key: "0",
    stack1: "0",
    stack2: "0",

    async loadBalance(client: Client, address: string) {
      set((state) => {
        state.loading = true;
      });

      console.log("Calleed useBalanceStore loadBalance...");
      const player1Key = await client.query.runtime.PoZKerApp.player1Key.get();
      console.log("MADE player1Hash CALL AND GOT");
      console.log(player1Key);
      const player2Key = await client.query.runtime.PoZKerApp.player2Key.get();
      console.log("MADE player1Hash CALL AND GOT");
      console.log(player2Key);
      const stack1 = await client.query.runtime.PoZKerApp.stack1.get();
      const stack2 = await client.query.runtime.PoZKerApp.stack2.get();



      set((state) => {
        state.loading = false;
        state.player1Key = player1Key?.toString() ?? "0";
        state.player2Key = player2Key?.toString() ?? "0";
        state.stack1 = stack1?.toString() ?? "0";
        state.stack2 = stack2?.toString() ?? "0";
        // state.balances[address] = player1Hash?.toString() ?? "0";
      });
    },

    async faucet(client: Client, address: string) {
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

export const useObserveBalance = () => {
  const client = useClientStore();
  const chain = useChainStore();
  const wallet = useWalletStore();
  const balances = useBalancesStore();

  useEffect(() => {
    if (!client.client || !wallet.wallet) return;

    balances.loadBalance(client.client, wallet.wallet);
  }, [client.client, chain.block?.height, wallet.wallet]);
};

export const useFaucet = () => {
  const client = useClientStore();
  const pkrStore = useBalancesStore();
  const wallet = useWalletStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrStore.faucet(
      client.client,
      wallet.wallet,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};

export const useDeposit = () => {
  const client = useClientStore();
  const pkrStore = useBalancesStore();
  const wallet = useWalletStore();

  return useCallback(async (depositAmount: number) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await pkrStore.deposit(
      client.client,
      wallet.wallet,
      depositAmount,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
};