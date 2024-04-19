"use client";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Field, PublicKey } from 'o1js';
import { useFaucet, useBalancesStore, useDeposit, useObserveBalance } from "@/lib/stores/poZKer";

export default function Home() {

    const [numPlayers, setNumPlayers] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    // either one of these alone triggers it...
    const drip = useFaucet();
    const deposit = useDeposit();
    const balances = useBalancesStore();

    useEffect(() => {
        console.log("Updating num players...")

        // Hashes will be overwritten when we have players, so track it here
        if (balances.player1Key === '0') {
            setNumPlayers(0);
        }
        else if (balances.player2Key === '0') {
            setNumPlayers(1);
        }
        else {
            setNumPlayers(2);
        }
    }, [balances.player1Key, balances.player2Key]);


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
        <div className="flex flex-col min-h-[100dvh]">
            <main className="flex-1">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-4">

                        <p>P1Hash: {balances.player1Key}</p>
                        <p>P2Hash: {balances.player2Key}</p>
                        <p>Stack1: {balances.stack1}</p>
                        <p>Stack2: {balances.stack2}</p>

                        <button onClick={handleClick} disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Click me'}
                        </button>


                        <div className="grid grid-cols-[1fr_200px] items-center">
                            <h2 className="text-2xl font-bold">Available Games</h2>
                        </div>
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 dark:border-gray-800 dark:divide-gray-800">
                            <div className="flex items-center justify-between p-4">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Game ID</div>
                                <div className="text-sm font-medium">Players</div>
                                <div className="text-sm font-medium">Join</div>
                                <div className="text-sm font-medium">Deposit</div>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <div className="text-sm font-medium">Game01</div>
                                <div className="text-sm font-medium">{numPlayers} / 2</div>
                                <div className="text-sm font-medium"><Button variant="secondary" onClick={() => drip()}>Join Game</Button></div>
                                <div className="text-sm font-medium"><Button variant="secondary" onClick={() => deposit(100)}>Deposit</Button></div>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}


