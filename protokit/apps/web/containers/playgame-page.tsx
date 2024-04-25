"use client";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Field, PublicKey, PrivateKey } from 'o1js';
import { usePoZKerStore, useShowCards, useSettle, useLeaveTable, useTakeAction, useCommitOpponentHolecards, useDecodeBoardcards, useCommitBoardcards } from "@/lib/stores/poZKer";
import { useWalletStore } from "@/lib/stores/wallet";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"

export default function Component() {

    const showCards = useShowCards();
    const settle = useSettle();
    const leaveTable = useLeaveTable();
    const takeAction = useTakeAction();
    const commitOpponentHolecards = useCommitOpponentHolecards();
    const decodeBoardcards = useDecodeBoardcards();
    const commitBoardcards = useCommitBoardcards();

    const wallet = useWalletStore();
    const pkrState = usePoZKerStore();

    // Corresponds directly to data pulled from packed 'gamestate'
    // const [stack0, setstack0] = useState<number>(0);
    // const [stack1, setstack1] = useState<number>(0);
    // const [turn, setTurn] = useState<number | "">("");
    // const [handStage, sethandStage] = useState<string>("");
    // const [lastAction, setLastAction] = useState<string>("");
    // const [lastBetSize, setLastBetSize] = useState<number>(0);
    // const [gameOver, setGameOver] = useState<string>("false");
    // const [pot, setPot] = useState<number>(0);

    const [decryptKey, setDecryptKey] = useState<number>(0);

    const [holeCards, setHoleCards] = useState<string[]>([]);
    const [boardCards, setBoardCards] = useState<string[]>([]);

    const [myStack, setMyStack] = useState<string>("0");
    const [opponentStack, setOpponentStack] = useState<string>("0");

    const [myBetThisStreet, setMyBetThisStreet] = useState<string>("12");
    const [opponentBetThisStreet, opponentMyBetThisStreet] = useState<string>("18");
    // We'll always use these board cards for now - pull them to 'boardCards'
    // based on handStage
    const boardCardsHardcoded = ["Kc", "Ac", "Qs", "8s", "6s"]

    // Which player we are...
    // type Player = "player1" | "player2" | "notInGame";
    const [playerI, setPlayer] = useState<number>(-1);


    useEffect(() => {
        const userKey = wallet.wallet;
        console.log("userKey is:", userKey);

        // Figure out which player we are...
        if (userKey === pkrState.player0Key) {
            console.log("Matched player 1...")
            setPlayer(0);
            // Hardcoding player's cards
            // setHoleCards(["Ah", "Ad"]);
        }
        else if (userKey === pkrState.player1Key) {
            console.log("Matched player 2...")
            setPlayer(1);
            // setHoleCards(["Ks", "Ts"]);
        }
        else {
            console.log("Not in game...")
            setPlayer(-1);
        }
    }, [pkrState.player0Key, pkrState.player1Key, wallet.wallet]);

    useEffect(() => {
        // Keep stacks updated
        const userKey = wallet.wallet;
        // Figure out which player we are...
        if (userKey === pkrState.player0Key) {
            setMyStack(pkrState.stack0);
            setOpponentStack(pkrState.stack1);
        }
        else if (userKey === pkrState.player1Key) {
            setMyStack(pkrState.stack1);
            setOpponentStack(pkrState.stack0);
        }
        else {
            setMyStack("0");
            setOpponentStack("0");
        }
    }, [pkrState.stack0, pkrState.stack1, wallet.wallet]);


    const shuffleAndPass = async () => {
        // 1. getDeck(player, handId) - pull all cards from API (if we're p1, it will generate an empty deck for us and send that) 
        // 2. encrypt and shuffle them
        // 3. postDeck(player, handId)

        try {
            const response = await fetch('/api/deck', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });
            if (response) {
                const data = await response.json();
                console.log("GOT API DATA!");
                console.log(data);
                // In reality we'll need to do this somewhere else...
                setHoleCards(data.cards.slice(2))
                // setBoardCards(data.cards.slice(4))
            }
            else {
                console.log("NO RESPONSE FROM API...")
            }
        } catch (error) {
            console.log(error);
        }
        console.log("DONE CALLING API...")

        // TODO - encrypt and shuffle them
        // encryptDeck(deck);
        // shuffleDeck(deck);
        try {
            const response = await fetch('/api/deck', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
            });
            if (response) {
                const data = await response.json();
                console.log("GOT API DATA!");
                console.log(data);
            }
            else {
                console.log("NO RESPONSE FROM API...")
            }
        } catch (error) {
            console.log(error);
        }
        console.log("DONE CALLING API...")
    };


    const dealHolecards = async () => {
        // 1. getCards(handId, n) - pull 2 cards from API endpoint
        // 2. decode our half of them
        // 3. commitOpponentHolecards(card0: Card, card1: Card) - commit them to contract
        try {
            const response = await fetch('/api/deck', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });
            if (response) {
                const data = await response.json();
                console.log("GOT API DATA!");
                console.log(data);

                // In reality we'll need to do this somewhere else...
                // And need awareness of whether it's flop/turn/river...
                setBoardCards(data.cards);
            }
            else {
                console.log("NO RESPONSE FROM API...")
            }
        } catch (error) {
            console.log(error);
        }
        console.log("DONE CALLING API...")

        // TODO - decode...

        // card0: Card, card1: Card
        //const decryptKeyStr: string =PrivateKey.fromBigInt(BigInt(1)).toBase58();
        // await commitOpponentHolecards();
    };






    const onSendTransaction = async (methodStr: string, actionStr: string) => {
        // await globalState.zkappWorkerClient!.fetchAccount({
        //     publicKey: globalState.publicKey!
        // });

        // Needed for several of the transactions
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
                await takeAction(action, betSize);
                // await globalState.zkappWorkerClient!.createTakeActionTx(senderB58, action, betSize);
                break;
            case 'settle':
                await settle();
                break;
            case "leaveTable":
                await leaveTable();
                break;
            case 'tallyBoardCards':
                const cardPrime52: number = 0;
                // useTallyBoardCardsTx(cardPrime52);
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

                if (playerI === 0) {
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
                else if (playerI === 1) {
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
                const path: string = "?";

                await showCards(holecard0,
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
                    path,
                )
                break;
        }
    }

    useEffect(() => {
        // Initialization useEffect...
        // We need to generate a random BigInt for the shuffle/decrypt key
        const min: number = 0;
        const max: number = 10 * 10 ** 18;
        const range: number = max - min;
        const randNum: number = Math.random() * range + min;
        setDecryptKey(randNum);

        // Set board based on current handStage...
        // type handStage = "ShowdownPending" | "Preflop" | "Flop" | "Turn" | "River" | "ShowdownComplete";
        const boardStr: string = pkrState.handStage;
        const handStageMap: { [key: string]: string } = {
            "1": "ShowdownPending",
            "2": "Preflop",
            "3": "Flop",
            "4": "Turn",
            "5": "River",
            "6": "ShowdownComplete",
        };
        const handStageStr = handStageMap[boardStr];
        // sethandStage(handStageStr);

        // const lastActionStr: string = lastAction_.toJSON()
        const actionMap: { [key: string]: string } = {
            "0": "Null",
            "1": "Bet",
            "2": "Call",
            "3": "Fold",
            "4": "Raise",
            "5": "Check",
            "6": "PreflopCall",
        };
        // const actionStr = actionMap[lastActionStr];
        // setLastAction(actionStr);;

        // handStage encoding
        // Preflop = UInt32.from(2);
        // Flop = UInt32.from(3);
        // Turn = UInt32.from(4);
        // River = UInt32.from(5);
        if (boardStr === "3") {
            const board = boardCardsHardcoded.slice(0, 3);
            // setBoardCards(board);

        }
        else if (boardStr === "4") {
            const board = boardCardsHardcoded.slice(0, 4);
            // setBoardCards(board);
        }
        else if (boardStr === "5") {
            // setBoardCards(boardCardsHardcoded);
        }
        else {
            // setBoardCards([]);
        }

    }, []);

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
        <div className="flex flex-col min-h-[100dvh]">
            <main className="flex-1">
                <div>
                    <div>Game Info</div>
                    <div>Current Pot: ${pkrState.pot}</div>
                </div>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <div>My stack</div>
                            <span className="ml-auto font-semibold">${myStack}</span>
                        </div>
                        <div className="flex items-center">
                            <div>Opponent stack</div>
                            <span className="ml-auto font-semibold">${opponentStack}</span>
                        </div>
                        <div className="flex items-center">
                            <div>Player Turn</div>
                            <span className="ml-auto font-semibold">player{pkrState.playerTurn}</span>
                        </div>
                        <div className="flex items-center">
                            <div>handStage</div>
                            <span className="ml-auto font-semibold">{pkrState.handStage}</span>
                        </div>
                        <div className="flex items-center">
                            <div>You are player:</div>
                            <span className="ml-auto font-semibold">{playerI}</span>
                        </div>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Board Cards</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex items-center justify-center space-x-4 h-24">
                                <span>{boardCards[0]}</span>
                                <span>{boardCards[1]}</span>
                                <span>{boardCards[2]}</span>
                                <span>{boardCards[3]}</span>
                                <span>{boardCards[4]}</span>
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
                                <Button variant="secondary" onClick={() => onSendTransaction('takeAction', action.action)}>{action.action}</Button>
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
                                <Button variant="secondary" onClick={() => onSendTransaction('showCards', "")}>Show Cards</Button>
                                <Button variant="secondary" onClick={() => onSendTransaction('settle', "")}>Showdown</Button>
                                <Button variant="secondary" onClick={() => onSendTransaction('leaveTable', "")}>Leave Table</Button>
                                <Button variant="secondary" onClick={() => dealHolecards()}>Deal Holecards</Button>
                                <Button variant="secondary" onClick={() => shuffleAndPass()}>Shuffle and Pass</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main >
        </div >
    )
}