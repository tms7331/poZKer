import { useEffect, useState } from 'react';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useGlobalContext } from "./global-context";
import { Field, PublicKey } from 'o1js';

export default function Component() {

    const { globalState, setGlobalState } = useGlobalContext();

    const [numPlayers, setNumPlayers] = useState<number>(0);

    // On load - see what the state of our game is
    useEffect(() => {
        (async () => {
            const mina = (window as any).mina;

            if (mina == null) {
                return;
            }

            // Hashes will be overwritten when we have players, so track it here
            if (globalState.player1Hash === Field(0)) {
                setNumPlayers(0);
            }
            else if (globalState.player2Hash === Field(0)) {
                setNumPlayers(1);
            }
            else {
                setNumPlayers(2);
            }
        })
    }, []);

    const onSendTransaction = async (methodStr: string) => {
        setGlobalState({ ...globalState, creatingTransaction: true });

        console.log('Creating a transaction...');

        await globalState.zkappWorkerClient!.fetchAccount({
            publicKey: globalState.publicKey!
        });

        switch (methodStr) {
            case "joinGame":
                const player: PublicKey = globalState.publicKey!;
                await globalState.zkappWorkerClient!.createJoinGameTx(player);
                break;
            case 'deposit':
                await globalState.zkappWorkerClient!.createDepositTx();
                break;
        }

        console.log('Creating proof...');
        await globalState.zkappWorkerClient!.proveUpdateTransaction();

        console.log('Requesting send transaction...');
        const transactionJSON = await globalState.zkappWorkerClient!.getTransactionJSON();

        console.log('Getting transaction JSON...');
        const { hash } = await (window as any).mina.sendTransaction({
            transaction: transactionJSON,
            feePayer: {
                fee: globalState.transactionFee,
                memo: ''
            }
        });

        //const transactionLink = `https://berkeley.minaexplorer.com/transaction/${hash}`;
        const transactionLink = `minascan.io/berkeley/tx/${hash}`;
        console.log(`View transaction at ${transactionLink}`);

        setGlobalState({ ...globalState, creatingTransaction: false });
    };



    return (
        <div className="flex flex-col h-screen">
            <header className="sticky top-0 z-10 bg-white border-b border-gray-100 backdrop-blur-smooth dark:bg-gray-950 dark:border-gray-850">
                <div className="container flex items-center justify-between h-[60px] px-4 md:px-6">
                    <h1 className="text-xl font-semibold tracking-tighter">Join Game</h1>
                    <nav className="flex gap-4">
                        <Link
                            className="flex items-center text-sm font-medium rounded-md transition-colors hover:bg-gray-100 hover:text-gray-900 px-3 py-2 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                            href="#"
                        >
                            Back
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto py-6">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-4">
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
                                <div className="text-sm font-medium"><Button variant="primary" onClick={() => onSendTransaction('joinGame')} disabled={globalState.creatingTransaction}>Join Game</Button></div>
                                <div className="text-sm font-medium"><Button variant="primary" onClick={() => onSendTransaction('deposit')} disabled={globalState.creatingTransaction}>Deposit</Button></div>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

