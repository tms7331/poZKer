import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { useEffect, useState } from 'react';

export default function Component() {
    // stack, facing bet, action history,  board_cards, hole_cards, pot

    const [stack, setStack] = useState(3000);
    const [facingBet, setFacingBet] = useState(1000);

    const actions = [{ "action": "Call", "player": "player1" },
    { "action": "Bet", "player": "player2" },
    { "action": "Raise", "player": "player1" },
    { "action": "Fold", "player": "player2" },
    ]
    const [actionHistory, setActionHistory] = useState(actions);
    const [boardCards, setBoardCards] = useState(["Ad", "2h", "3c", "4s", "5d"]);
    const [holeCards, setHoleCards] = useState(["Ad", "2h"]);
    const [pot, setPot] = useState(9000);

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
                                            <li className="px-4 py-2 flex items-center space-x-2">
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
            </div>
        </div>
    )
}

