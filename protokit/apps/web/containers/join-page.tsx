"use client";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Field, PublicKey } from 'o1js';
import { useJoinTable, usePoZKerStore, useObservePoZKer } from "@/lib/stores/poZKer";
import css from 'styled-jsx/css';

export default function Home() {

    const [numPlayers, setNumPlayers] = useState<number>(0);

    const joinTable = useJoinTable();
    const pkrState = usePoZKerStore();




    useEffect(() => {
        // Hashes will be overwritten when we have players, so track it here
        if (pkrState.player0Key === '0') {
            setNumPlayers(0);
        }
        else if (pkrState.player1Key === '0') {
            setNumPlayers(1);
        }
        else {
            setNumPlayers(2);
        }




    }, [pkrState.player0Key, pkrState.player1Key]);

    const handleJoinTable = async () => {
        let seat: number;
        if (numPlayers === 0) {
            seat = 0;
        }
        else if (pkrState.player1Key === '0') {
            seat = 1;
        }
        else {
            console.log("Game full, cannot join...")
            return
        }
        // If both seats available - join seat 0, else join seat 1
        await joinTable(seat, 100);
    };


    return (
        <div className="flex flex-col min-h-[100dvh]">
            <main className="flex-1">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-4">

                        <p>P1Hash: {pkrState.player0Key}</p>
                        <p>P2Hash: {pkrState.player1Key}</p>
                        <p>stack0: {pkrState.stack0}</p>
                        <p>stack1: {pkrState.stack1}</p>

                        <div className="grid grid-cols-[1fr_200px] items-center">
                            <h2 className="text-2xl font-bold">Available Games</h2>
                        </div>
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 dark:border-gray-800 dark:divide-gray-800">
                            <div className="flex items-center justify-between p-4">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Game ID</div>
                                <div className="text-sm font-medium">Players</div>
                                <div className="text-sm font-medium">Join</div>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <div className="text-sm font-medium">Game01</div>
                                <div className="text-sm font-medium">{numPlayers} / 2</div>
                                <div className="text-sm font-medium"><Button variant="secondary" onClick={() => handleJoinTable()}>Join Game</Button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}


