"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, PublicKey } from "o1js";
import {
  useJoinTable,
  usePoZKerStore,
  useResetTableState,
  useObservePoZKer,
} from "@/lib/stores/poZKer";
import css from "styled-jsx/css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X } from "lucide-react";
import { useBalancesStore } from "@/lib/stores/balances";
import { useWalletStore } from "@/lib/stores/wallet";

export default function Home() {
  const [numPlayers, setNumPlayers] = useState<number>(0);

  const [canJoin, setCanJoin] = useState<boolean>(true);

  const joinTable = useJoinTable();
  const resetTableState = useResetTableState();
  const pkrState = usePoZKerStore();

  const wallet = useWalletStore();
  const balances = useBalancesStore();

  useEffect(() => {
    // Hashes will be overwritten when we have players, so track it here
    if (pkrState.player0Key === "0") {
      setNumPlayers(0);
    } else if (pkrState.player1Key === "0") {
      setNumPlayers(1);
    } else {
      setNumPlayers(2);
    }
  }, [pkrState.player0Key, pkrState.player1Key]);

  const handleJoinTable = async () => {
    let seat: number;
    if (numPlayers === 0) {
      seat = 0;
    } else if (pkrState.player1Key === "0") {
      seat = 1;
    } else {
      console.log("Game full, cannot join...");
      return;
    }
    // If both seats available - join seat 0, else join seat 1
    await joinTable(seat, 100);
  };

  const [isOpen, setIsOpen] = useState(false);

  const [rebuyAmountInput, setRebuyAmountInput] = useState(20);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col bg-[#111]">
      {isOpen && (
        <div
          className="fixed inset-0 z-10 overflow-y-auto"
          onClick={toggleModal}
        >
          <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center lg:block lg:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className="inline-block h-full transform overflow-hidden rounded-lg bg-[#222] p-5 text-left align-bottom shadow-xl transition-all lg:mt-32 lg:w-full lg:max-w-lg lg:align-middle"
            >
              <div className="bg-[#222] pb-4 text-white">
                <div className="flex justify-between pb-4">
                  <h1 className="mr-5 bg-[#222] pb-3 pl-2 text-white">Rebuy</h1>
                  <button
                    className="h-fit rounded-xl p-1 transition-all hover:bg-zinc-700"
                    onClick={toggleModal}
                  >
                    <X className="size-4 text-zinc-200" />
                  </button>
                </div>
                <div className="flex w-full gap-2 rounded-lg pl-2.5">
                  <input
                    type="number"
                    className="w-[60px] bg-transparent  text-white"
                    value={rebuyAmountInput}
                    onChange={(event) =>
                      setRebuyAmountInput(parseInt(event?.target.value))
                    }
                  />
                  <input
                    type="range"
                    min={20}
                    max={200}
                    className="custom-range-input w-full"
                    value={rebuyAmountInput}
                    onChange={(event) =>
                      setRebuyAmountInput(parseInt(event.target.value))
                    }
                  />
                </div>
              </div>
              <div className="bg-[#222]  lg:flex lg:flex-row-reverse ">
                <button
                  onClick={() => {
                    toggleModal();
                    // callRebuy(rebuyAmountInput);
                    handleJoinTable();
                  }}
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-600 focus:outline-none lg:ml-3 lg:w-auto lg:text-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="flex-1">
        <div className="container px-4 md:px-6">
          <div className="grid gap-4">
            <div className="items-center pt-20">
              <h2 className="w-fit text-2xl font-bold text-white">
                Available Games
              </h2>
            </div>
            <div className="divide-y divide-gray-500 rounded-lg border border-gray-500 text-gray-200 dark:divide-gray-800 dark:border-gray-800">
              <div className="flex items-center justify-between p-4">
                <div className="w-1/5 text-sm font-medium dark:text-gray-400">
                  Game ID
                </div>
                <div className="w-1/6 text-sm font-medium">Players</div>
                <div className="w-1/4 text-sm font-medium">Join</div>
                <div className="w-1/4 text-sm font-medium">Reset</div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="w-1/5 text-sm font-medium">Game01</div>
                <div className="w-1/6 text-sm font-medium">
                  {numPlayers} / 2
                </div>
                <div className="w-1/4 text-sm font-medium">
                  {parseInt(balances.balances[wallet.wallet ?? ""]) <= 0 ? (
                    <TooltipProvider>
                      <Tooltip delayDuration={10}>
                        <TooltipTrigger asChild>
                          <Button className="bg-indigo-500 px-2 py-1 text-xs hover:bg-indigo-600 sm:px-3 sm:py-2 sm:text-sm">
                            Join Game
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className="max-w-[400px] border-none bg-zinc-800 p-4 text-zinc-100"
                          sideOffset={10}
                        >
                          <p>Please get tokens before joining the game!</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      disabled={!canJoin}
                      onClick={() => toggleModal()}
                      className="bg-indigo-500 px-2 py-1 text-xs hover:bg-indigo-600 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      Join Game
                    </Button>
                  )}
                </div>
                <div className="w-1/4 text-sm font-medium">
                  <TooltipProvider>
                    <Tooltip delayDuration={10}>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => resetTableState()}
                          className="bg-indigo-500 px-2 py-1 text-xs hover:bg-indigo-600 sm:px-3 sm:py-2 sm:text-sm"
                        >
                          Reset Table
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="max-w-[400px] border-none bg-zinc-800 p-4 text-zinc-100"
                        sideOffset={10}
                      >
                        <div>
                          <span className=" font-semibold text-red-500">
                            Warning!
                          </span>{" "}
                          <p className="pt-2">
                            This button will remove all players from the table
                            and reset the contract state so a new hand can be
                            played. Only press if you need to remove an inactive
                            player from the table!
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
