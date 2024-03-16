import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { useEffect, useState } from 'react';

export default function Component() {
    // stack, facing bet, action history,  board_cards, hole_cards, pot
    const [amount, setAmount] = useState<number>(0);

    const [stack, setStack] = useState(3000);
    const [facingBet, setFacingBet] = useState(1000);

    const actions = [{ "action": "Call", "player": "player1" },
    { "action": "Bet", "player": "player2" },
    { "action": "Raise", "player": "player1" },
    ]
    const [actionHistory, setActionHistory] = useState(actions);
    const possibleActionsInit = [{ "action": "Call", "needsAmount": true },]
    const [possibleActions, setPossibleActions] = useState(possibleActionsInit);
    const [boardCards, setBoardCards] = useState(["Ad", "2h", "3c", "4s", "5d"]);
    const [holeCards, setHoleCards] = useState(["Ad", "2h"]);
    const [pot, setPot] = useState(9000);

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

    const handleActionClick = (action: string) => {
        console.log(`Action "${action}" clicked with amount ${amount}`);
        // Perform action here with the given amount if needed
    };
    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);
        setAmount(isNaN(value) ? 0 : value);
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
                        <div>Stack</div>
                        <span className="ml-auto font-semibold">${stack}</span>
                    </div>
                    <div className="flex items-center">
                        <div>Facing Bet</div>
                        <span className="ml-auto font-semibold">${facingBet}</span>
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
                                .map((row, index) => { return (<span>{row}</span>) })}
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
                            <button onClick={() => handleActionClick(action.action)}>
                                {action.action}
                            </button>
                            {action.needsAmount && (
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    min={0}
                                />
                            )}
                        </div>
                    ))}
                </div>



            </div>
        </div>
    )
}

