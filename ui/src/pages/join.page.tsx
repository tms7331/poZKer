import { useEffect, useState } from 'react';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useGlobalContext } from "./global-context";
import { Field, PublicKey } from 'o1js';

export default function Component() {

    const { globalState, setGlobalState } = useGlobalContext();

    const [numPlayers, setNumPlayers] = useState<number>(0);

    useEffect(() => {
        const player1HashS = globalState.player1Hash.toJSON();
        const player2HashS = globalState.player2Hash.toJSON();

        console.log("Player hashes...")
        console.log(player1HashS);
        console.log(player2HashS);

        // Hashes will be overwritten when we have players, so track it here
        if (player1HashS === '0') {
            setNumPlayers(0);
        }
        else if (player2HashS === '0') {
            setNumPlayers(1);
        }
        else {
            setNumPlayers(2);
        }
    }, [globalState.player1Hash, globalState.player2Hash]);

    // We'll run this in a loop every 60 seconds to keep gamestate updated
    async function fetchData(): Promise<void> {
        const mina = (window as any).mina;
        if (mina == null) {
            console.log("Could not find mina...")
            return;
        }

        // Keep updating player account too
        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        console.log("index: publicKeyBase58", publicKeyBase58)
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        console.log('Reloading zkApp state...');
        const zkappPublicKey = PublicKey.fromBase58(globalState.zkappAddress);
        // Don't need to initialize again
        // await zkappWorkerClient.initZkappInstance(zkappPublicKey);
        await globalState.zkappWorkerClient!.fetchAccount({ publicKey: zkappPublicKey });

        const player1Hash = await globalState.zkappWorkerClient!.getPlayer1Hash();
        const player2Hash = await globalState.zkappWorkerClient!.getPlayer2Hash();
        const gamestate = await globalState.zkappWorkerClient!.getGamestate();
        setGlobalState({
            ...globalState,
            publicKey,
            gamestate,
            player1Hash,
            player2Hash
        });
    }

    useEffect(() => {
        const intervalId = setInterval(async () => {
            await fetchData()
        }, 60000); // 60 seconds in milliseconds

        // Clean up the interval to prevent memory leaks
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs only once on component mount


    const onSendTransaction = async (methodStr: string) => {
        setGlobalState({ ...globalState, creatingTransaction: true });

        console.log('Creating a transaction...');

        const res = await globalState.zkappWorkerClient!.fetchAccount({
            publicKey: globalState.publicKey!
        });
        console.log("Res was...", res)
        const accountExists = res.error == null;
        console.log("Account exists?", accountExists);
        console.log("Creating transaction from...", methodStr)

        switch (methodStr) {
            case "joinGame":
                const player: PublicKey = globalState.publicKey!;
                console.log("JOINING WITH PLAYER", player.toBase58())
                await globalState.zkappWorkerClient!.createJoinGameTx(player);
                break;
            case 'deposit':
                const senderB58 = globalState.publicKey!.toBase58();
                await globalState.zkappWorkerClient!.createDepositTx(senderB58);
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
        <div className="flex flex-col min-h-[100dvh]">
            <header className="px-4 lg:px-6">
                <div className="container flex items-center justify-center h-14 px-4 md:px-6">
                    <nav className="hidden gap-4 lg:flex">
                        <Link className="text-sm font-medium hover:underline underline-offset-4" href="join">
                            Join
                        </Link>
                        <Link className="text-sm font-medium hover:underline underline-offset-4" href="playgame">
                            Gameplay
                        </Link>
                    </nav>
                    <div className="flex-1" />
                    <Link className="flex items-center justify-center text-sm font-medium" href="#">
                        Home
                    </Link>
                </div>
            </header>
            <main className="flex-1">
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

