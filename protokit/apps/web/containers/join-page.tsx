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

export default function Home() {
  const [numPlayers, setNumPlayers] = useState<number>(0);

  const [canJoin, setCanJoin] = useState<boolean>(true);

  const joinTable = useJoinTable();
  const resetTableState = useResetTableState();
  const pkrState = usePoZKerStore();

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

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col bg-[#111]">
      <main className="flex-1">
        <div className="container px-4 md:px-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-[1fr_200px] items-center pt-20">
              <h2 className="text-2xl font-bold text-white">Available Games</h2>
            </div>
            <div className="divide-y divide-gray-500 rounded-lg border border-gray-500 text-gray-200 dark:divide-gray-800 dark:border-gray-800">
              <div className="flex items-center justify-between p-4">
                <div className="w-1/4 text-sm font-medium dark:text-gray-400">
                  Game ID
                </div>
                <div className="w-1/4 text-sm font-medium">Players</div>
                <div className="w-1/4 text-sm font-medium">Join</div>
                <div className="w-1/4 text-sm font-medium">Reset</div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="w-1/4 text-sm font-medium">Game01</div>
                <div className="w-1/4 text-sm font-medium">
                  {numPlayers} / 2
                </div>
                <div className="w-1/4 text-sm font-medium">
                  <Button
                    disabled={!canJoin}
                    onClick={() => handleJoinTable()}
                    className="bg-indigo-500 px-2 py-1 text-xs hover:bg-indigo-600 sm:px-3 sm:py-2 sm:text-sm"
                  >
                    Join Game
                  </Button>
                </div>
                <div className="w-1/4 text-sm font-medium">
                  <TooltipProvider>
                    <Tooltip>
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
                        className="max-w-[400px] p-4"
                        sideOffset={10}
                      >
                        <p>
                          <span className="pb-2 font-semibold text-red-500">
                            Warning!
                          </span>{" "}
                          <br />
                          This button will remove all players from the table and
                          reset the contract state so a new hand can be played.
                          Only press if you need to remove an inactive player
                          from the table!
                        </p>
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
