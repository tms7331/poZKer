import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { useGlobalContext } from "./global-context";
import { Field, PublicKey, Poseidon, PrivateKey, Bool, UInt64, UInt32, MerkleMapWitness } from 'o1js';
import { PackedUInt32Factory } from 'o1js-pack';

class Gamestate extends PackedUInt32Factory() { }


export default function Component() {
    const { globalState, setGlobalState } = useGlobalContext();

    // Corresponds directly to data pulled from packed 'gamestate'
    const [stack1, setStack1] = useState<number>(0);
    const [stack2, setStack2] = useState<number>(0);
    const [turn, setTurn] = useState<number>(0);
    const [street, setStreet] = useState<number>(0);
    const [lastAction, setLastAction] = useState<number>(0);
    const [lastBetSize, setLastBetSize] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [pot, setPot] = useState<number>(0);


    const [holeCards, setHoleCards] = useState<string[]>(["", ""]);
    const [boardCards, setBoardCards] = useState<string[]>([]);
    // We'll always use these board cards for now - pull them to 'boardCards'
    // based on street
    const boardCardsHardcoded = ["Kc", "Ac", "Qs", "8s", "6s"]

    // Which player we are...
    type Player = "player1" | "player2" | "notInGame";
    const [player, setPlayer] = useState<Player>("notInGame");

    // On page load - we SHOULD be one of the players in the game...
    useEffect(() => {
        (async () => {
            const mina = (window as any).mina;

            if (mina == null) {
                // This should never happen?  If we make it to this page we
                // should have joined a game...
                // setGlobalState({ ...globalState, hasWallet: false });
                return;
            }

            const publicKeyBase58: string = (await mina.requestAccounts())[0];
            console.log("index: publicKeyBase58", publicKeyBase58)
            const publicKey = PublicKey.fromBase58(publicKeyBase58);


            // const publicKey = globalState.publicKey!;
            const pHash = Poseidon.hash(publicKey.toFields());

            console.log("PHASH COMPARISON")
            console.log(pHash.toJSON());
            console.log(globalState.player1Hash.toJSON());

            // Figure out which player we are...
            if (pHash === globalState.player1Hash) {
                setPlayer("player1");
                // Hardcoding player's cards
                setHoleCards(["Ah", "Ad"]);
            }
            else if (pHash === globalState.player2Hash) {
                setPlayer("player2");
                setHoleCards(["Ks", "Ts"]);
            }
            else {
                setPlayer("notInGame");
            }
        })
    }, []);


    /*
    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log('Logging every 30 seconds');
        }, 30000); // 30 seconds in milliseconds

        // Clean up the interval to prevent memory leaks
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs only once on component mount
    */


    const onSendTransaction = async (methodStr: string, actionStr: string) => {
        setGlobalState({ ...globalState, creatingTransaction: true });

        console.log('Creating a transaction...');

        await globalState.zkappWorkerClient!.fetchAccount({
            publicKey: globalState.publicKey!
        });

        switch (methodStr) {
            case 'takeAction':
                const actionMapping: { [key: string]: number } = {
                    // "Null": UInt32.from(0),
                    "Bet": 1,
                    "Call": 2,
                    "Fold": 3,
                    "Raise": 4,
                    "Check": 5,
                    // We'll infer this one
                    // "PreflopCall": UInt32.from(6),
                };

                const action: number = actionMapping[actionStr];
                const betSize: number = betAmount
                await globalState.zkappWorkerClient!.createTakeActionTx(action, betSize);
                break;
            case 'showdown':
                await globalState.zkappWorkerClient!.createShowdownTx();
                break;
            case "withdraw":
                await globalState.zkappWorkerClient!.createWithdrawTx();
                break;
            case 'tallyBoardCards':
                const cardPrime52: number = 0;
                await globalState.zkappWorkerClient!.createTallyBoardCardsTx(cardPrime52);
                break;
            case 'showCards':
                // Hardcoded values for now...

                // "Ah": 41,
                // "Ad": 101,
                // "Ks": 233,
                // "Ts": 223,

                // "Kc": 163,
                // "Ac": 167,
                // "Qs": 229,
                // "8s": 199,
                // "6s": 193,

                let holecard0: number;
                let holecard1: number;

                let useHolecard0: boolean;
                let useHolecard1: boolean;
                let useBoardcards0: boolean;
                let useBoardcards1: boolean;
                let useBoardcards2: boolean;
                let useBoardcards3: boolean;
                let useBoardcards4: boolean;
                let isFlush: boolean;
                let merkleMapKey: number;
                let merkleMapVal: number;

                if (player === "player1") {
                    holecard0 = 41;
                    holecard1 = 101;

                    useHolecard0 = true;
                    useHolecard1 = true;
                    useBoardcards0 = true;
                    useBoardcards1 = true;
                    useBoardcards2 = true;
                    useBoardcards3 = false;
                    useBoardcards4 = false;
                    isFlush = false;
                    merkleMapKey = 79052387;
                    merkleMapVal = 1609;
                }
                else if (player === "player2") {
                    holecard0 = 233;
                    holecard1 = 223;

                    useHolecard0 = true;
                    useHolecard1 = true;
                    useBoardcards0 = false;
                    useBoardcards1 = false;
                    useBoardcards2 = true;
                    useBoardcards3 = true;
                    useBoardcards4 = true;
                    isFlush = true;
                    merkleMapKey = 4933247;
                    merkleMapVal = 858;
                }
                else {
                    throw new Error("Not in game!");
                }

                const boardcard0: number = 163;
                const boardcard1: number = 167;
                const boardcard2: number = 229;
                const boardcard3: number = 199;
                const boardcard4: number = 193;

                const shuffleKey: string = PrivateKey.fromBigInt(BigInt(1)).toBase58();
                // Leaving these empty - we've disabled that check
                const isLefts: Bool[] = [];
                const siblings: Field[] = [];
                const path: MerkleMapWitness = new MerkleMapWitness(isLefts, siblings);
                await globalState.zkappWorkerClient!.createShowCardsTx(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4, isFlush, shuffleKey, merkleMapKey, merkleMapVal);
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
    }


    useEffect(() => {
        const publicKey = globalState.publicKey!;
        const pHashJSON = Poseidon.hash(publicKey.toFields()).toJSON();

        // Figure out which player we are...
        if (pHashJSON === globalState.player1Hash.toJSON()) {
            console.log("Matched player 1...")
            setPlayer("player1");
            // Hardcoding player's cards
            setHoleCards(["Ah", "Ad"]);
        }
        else if (pHashJSON === globalState.player2Hash.toJSON()) {
            console.log("Matched player 2...")
            setPlayer("player2");
            setHoleCards(["Ks", "Ts"]);
        }
        else {
            console.log("Not in game...")
            setPlayer("notInGame");
        }
    }, [globalState.player1Hash, globalState.player2Hash, globalState.publicKey]);


    useEffect(() => {
        const unpacked = Gamestate.unpack(globalState.gamestate!);
        const [stack1_, stack2_, turn_, street_, lastAction_, lastBetSizeGameOver, pot_] = unpacked;
        // Need to further unpack gameOver and lastBetSize
        const gameOverLastBetSize = lastBetSizeGameOver.toJSON() as number;
        let lastBetSize_ = gameOverLastBetSize;
        let gameOver_ = false;
        if (gameOverLastBetSize > 1000) {
            lastBetSize_ = lastBetSize_ - 1000;
            gameOver_ = true;
        }

        console.log("UNPACKED GAMESTATE", stack1_.toJSON(),
            stack2_.toJSON(),
            turn_.toJSON(),
            street_.toJSON(),
            lastAction_.toJSON(),
            lastBetSize_,
            gameOver_,
            pot_.toJSON())

        setStack1(stack1_.toJSON());
        setStack2(stack2_.toJSON());
        setTurn(turn_.toJSON());
        setStreet(street_.toJSON());
        setLastAction(lastAction_.toJSON());
        setLastBetSize(lastBetSize_);
        setGameOver(gameOver_);
        setPot(pot_.toJSON());

        // Set board based on current street...
        const boardStr = street_.toJSON()
        // Street encoding
        // Preflop = UInt32.from(2);
        // Flop = UInt32.from(3);
        // Turn = UInt32.from(4);
        // River = UInt32.from(5);
        if (boardStr === "3") {
            const board = boardCardsHardcoded.slice(0, 3);
            setBoardCards(board);
        }
        else if (boardStr === "4") {
            const board = boardCardsHardcoded.slice(0, 4);
            setBoardCards(board);
        }
        else if (boardStr === "5") {
            setBoardCards(boardCardsHardcoded);
        }
        else {
            setBoardCards([]);
        }

    }, [globalState.gamestate]);

    // stack, facing bet, action history,  board_cards, hole_cards, pot
    // This is our bet amount
    const [betAmount, setBetAmount] = useState<number>(0);

    const actions = [{ "action": "Call", "player": "player1" },
    { "action": "Bet", "player": "player2" },
    { "action": "Raise", "player": "player1" },
    ]
    const [actionHistory, setActionHistory] = useState(actions);
    const possibleActionsInit = [{ "action": "Call", "needsAmount": true },]
    const [possibleActions, setPossibleActions] = useState(possibleActionsInit);

    function getPossibleActions(facingAction: string): any[] {
        const BET = { "action": "Bet", "needsAmount": true };
        const CHECK = { "action": "Check", "needsAmount": false };
        const CALL = { "action": "Call", "needsAmount": false };
        const FOLD = { "action": "Fold", "needsAmount": false };
        const RAISE = { "action": "Raise", "needsAmount": true };
        // Given game state we should specify the subset of actions that are available to the player
        if (facingAction === "Null" || facingAction === "Check") {
            return [BET, CHECK, FOLD];
        } else if (facingAction === "Bet" || facingAction === "Raise" || facingAction === "Call") {
            return [CALL, FOLD, RAISE];
        } else if (facingAction === "PreflopCall") {
            return [RAISE, CHECK];
        }
        else {
            console.error("Unexpected facing action:", facingAction);
            return [];
        }
    }

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);
        setBetAmount(isNaN(value) ? 0 : value);
    };

    useEffect(() => {
        if (actionHistory.length == 0) {
            return;
        }
        console.log("ACTION HISTORY", actionHistory);
        const facingAction = actionHistory[actionHistory.length - 1]["action"]
        const possibleActions = getPossibleActions(facingAction);
        setPossibleActions(possibleActions);
    }, [actionHistory]);



    return (
        <div>
            <div>
                <div>Game</div>
                <div>Pot: ${pot}</div>
            </div>
            <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <div>Stack 1</div>
                        <span className="ml-auto font-semibold">${stack1}</span>
                    </div>
                    <div className="flex items-center">
                        <div>Stack 2</div>
                        <span className="ml-auto font-semibold">${stack2}</span>
                    </div>
                    <div className="flex items-center">
                        <div>Turn</div>
                        <span className="ml-auto font-semibold">{turn}</span>
                    </div>
                    <div className="flex items-center">
                        <div>Turn</div>
                        <span className="ml-auto font-semibold">{street}</span>
                    </div>
                    <div className="flex items-center">
                        <div>Facing Action</div>
                        <span className="ml-auto font-semibold">{lastAction}</span>
                    </div>
                    <div className="flex items-center">
                        <div>Facing Bet</div>
                        <span className="ml-auto font-semibold">{lastBetSize}</span>
                    </div>
                    <div className="flex items-center">
                        <div>Pot</div>
                        <span className="ml-auto font-semibold">{pot}</span>
                    </div>
                    <div className="flex items-center">
                        <div>Game Over?</div>
                        <span className="ml-auto font-semibold">{gameOver}</span>
                    </div>
                    <div className="flex items-center">
                        <div>You are player:</div>
                        <span className="ml-auto font-semibold">{player}</span>
                    </div>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Action List</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="divide-y">
                                {actionHistory
                                    .map((row, index) => {
                                        return (
                                            <li key={index} className="px-4 py-2 flex items-center space-x-2">
                                                <span>{row.action}</span>
                                                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{row.player}</span>
                                            </li>)
                                    })}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Board Cards</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-center space-x-4 h-24">
                            {boardCards
                                .map((row, index) => { return (<span key={index}>{row}</span>) })}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Hole Cards</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-center space-x-4 h-24">
                            <span>{holeCards[0]}</span>
                            <span>{holeCards[1]}</span>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    {possibleActions.map((action, index) => (
                        <div key={index}>
                            <Button variant="primary" onClick={() => onSendTransaction('takeAction', action.action)} disabled={globalState.creatingTransaction}>{action.action}</Button>
                            {action.needsAmount && (
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={handleAmountChange}
                                    min={0}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Showdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-center space-x-4 h-24">
                            <Button variant="primary" onClick={() => onSendTransaction('showCards', "")} disabled={globalState.creatingTransaction}>Show Cards</Button>
                            <Button variant="primary" onClick={() => onSendTransaction('showdown', "")} disabled={globalState.creatingTransaction}>Showdown</Button>
                            <Button variant="primary" onClick={() => onSendTransaction('withdraw', "")} disabled={globalState.creatingTransaction}>Withdraw</Button>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </div>
    )
}

