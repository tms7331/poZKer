import { Button } from "@/components/ui/button"

export default function Component() {
    return (
        <div className="flex flex-col h-screen">
            <header className="flex items-center justify-center p-4">
                <h1 className="text-4xl font-bold tracking-tighter">Get Tokens</h1>
            </header>
            <div className="flex-1 flex items-center justify-center">
                <Button variant="primary">Get Tokens</Button>
            </div>
        </div>
    )
}
