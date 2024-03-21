import { Button } from "@/components/ui/button"
import { useGlobalContext } from "./global-context";

export default function Component() {
    const { globalState, setGlobalState } = useGlobalContext();

    const handleClick = () => {
        setGlobalState({ ...globalState, testStr: "qwghf" });
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="flex items-center justify-center p-4">
                <h1 className="text-4xl font-bold tracking-tighter">Get Tokens</h1>
            </header>
            <div className="flex-1 flex items-center justify-center">
                <Button variant="primary">Get Tokens</Button>
            </div>
            <div className="flex-1 flex items-center justify-center">
                Current state in zkApp: {globalState.testStr} {globalState.currentNum!.toString()}
            </div>

            <button onClick={handleClick}>Change value</button>

        </div>
    )
}
