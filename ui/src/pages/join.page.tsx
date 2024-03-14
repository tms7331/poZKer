import Link from "next/link"

export default function Component() {
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
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <div className="text-sm font-medium">ABC123</div>
                                <div className="text-sm font-medium">2/4</div>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <div className="text-sm font-medium">DEF456</div>
                                <div className="text-sm font-medium">3/4</div>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <div className="text-sm font-medium">GHI789</div>
                                <div className="text-sm font-medium">1/4</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

