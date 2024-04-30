"use client";
import { Faucet } from "@/components/faucet";
import { useFaucet } from "@/lib/stores/balances";
import { useWalletStore } from "@/lib/stores/wallet";

export default function Home() {
  const wallet = useWalletStore();
  const drip = useFaucet();

  return (
    <div className="mx-auto min-h-[calc(100dvh-56px)] bg-[#111]">
      <div className="flex w-full items-center justify-center pt-20">
        <div className="flex basis-10/12 flex-col items-center justify-center sm:basis-8/12 lg:basis-4/12 2xl:basis-3/12">
          <Faucet
            wallet={wallet.wallet}
            onConnectWallet={wallet.connectWallet}
            onDrip={drip}
            loading={false}
          />
        </div>
      </div>
    </div>
  );
}
