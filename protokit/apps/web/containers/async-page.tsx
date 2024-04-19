"use client";
import { Faucet } from "@/components/faucet";
import { useFaucet, useBalancesStore } from "@/lib/stores/balances";
// import { useJoinGame, useBalancesStore, useDeposit, useObserveBalance } from "@/lib/stores/poZKer";
import { useWalletStore } from "@/lib/stores/wallet";
import { Button } from "@/components/ui/button";
import { useState } from 'react';



export default function Home() {
  const wallet = useWalletStore();
  const drip = useFaucet();

  const [isLoading, setIsLoading] = useState(false);

  const balances = useBalancesStore();


  const handleClick = async () => {
    setIsLoading(true);

    try {
      // Simulating an async operation, replace this with your actual async function
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Async function executed successfully!');
    } catch (error) {
      console.error('Error occurred while executing async function:', error);
    }
    setIsLoading(false);
  };


  return (
    <div className="mx-auto -mt-32 h-full pt-16">
      <div className="flex h-full w-full items-center justify-center pt-16">
        <div className="flex basis-4/12 flex-col items-center justify-center 2xl:basis-3/12">

          <button onClick={handleClick} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Click me'}
          </button>

          <Button
            size={"lg"}
            type="submit"
            className="mt-6 w-full"
            onClick={() => {
              drip();
            }}
          >
            Alternate faucet button... {wallet ? "Drip 💦" : "Connect wallet"}
          </Button>



          <Faucet
            wallet={wallet.wallet}
            onConnectWallet={wallet.connectWallet}
            onDrip={drip}
            loading={false}
          />
          <p>Async page!</p>
        </div>
      </div>
    </div>
  );
}
