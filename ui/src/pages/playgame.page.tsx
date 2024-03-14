import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"

export default function Component() {
    return (
        <div>
            <div>
                <div>Game</div>
                <div>Pot: $10,000</div>
            </div>
            <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <div>Stack</div>
                        <span className="ml-auto font-semibold">$5,000</span>
                    </div>
                    <div className="flex items-center">
                        <div>Facing Bet</div>
                        <span className="ml-auto font-semibold">$1,000</span>
                    </div>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Action List</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="divide-y">
                                <li className="px-4 py-2 flex items-center space-x-2">
                                    <span>Call</span>
                                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">Player 2</span>
                                </li>
                                <li className="px-4 py-2 flex items-center space-x-2">
                                    <span>Raise</span>
                                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">Player 3</span>
                                </li>
                                <li className="px-4 py-2 flex items-center space-x-2">
                                    <span>Check</span>
                                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">Player 1</span>
                                </li>
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
                            <span>♠️ A</span>
                            <span>♠️ 2</span>
                            <span>♠️ 3</span>
                            <span>♠️ 4</span>
                            <span>♠️ 5</span>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Hole Cards</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-center space-x-4 h-24">
                            <span>♠️ A</span>
                            <span>♠️ 2</span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

