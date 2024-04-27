"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, PublicKey, PrivateKey } from "o1js";
import {
  usePoZKerStore,
  useShowCards,
  useTakeAction,
} from "@/lib/stores/poZKer";
import { useWalletStore } from "@/lib/stores/wallet";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
export default function Component() {
  const showCards = useShowCards();
  const takeAction = useTakeAction();
  const wallet = useWalletStore();
  const pkrState = usePoZKerStore();

  const [betAmountInput, setBetAmountInput] = useState(0);
  const [maxSlider, setMaxSlider] = useState(100);
  const [minSlider, setMinSlider] = useState(0);
  // Corresponds directly to data pulled from packed 'gamestate'
  // const [stack1, setStack1] = useState<number>(0);
  // const [stack2, setStack2] = useState<number>(0);
  // const [turn, setTurn] = useState<number | "">("");
  // const [street, setStreet] = useState<string>("");
  // const [lastAction, setLastAction] = useState<string>("");
  // const [lastBetSize, setLastBetSize] = useState<number>(0);
  // const [gameOver, setGameOver] = useState<string>("false");
  // const [pot, setPot] = useState<number>(0);

  const [holeCards, setHoleCards] = useState<string[]>(["", ""]);
  const [boardCards, setBoardCards] = useState<string[]>([]);
  // We'll always use these board cards for now - pull them to 'boardCards'
  // based on street
  const boardCardsHardcoded = ["Kc", "Ac", "Qs", "8s", "6s"];

  // Which player we are...
  type Player = "player1" | "player2" | "notInGame";
  const [player, setPlayer] = useState<Player>("notInGame");

  // useEffect(() => {
  //   // TODO - where can we get this?
  //   const userKey = wallet.wallet;
  //   console.log("userKey is:", userKey);

  //   // Figure out which player we are...
  //   if (userKey === pkrState.player1Key) {
  //     console.log("Matched player 1...");
  //     setPlayer("player1");
  //     // Hardcoding player's cards
  //     setHoleCards(["Ah", "Ad"]);
  //   } else if (userKey === pkrState.player2Key) {
  //     console.log("Matched player 2...");
  //     setPlayer("player2");
  //     setHoleCards(["Ks", "Ts"]);
  //   } else {
  //     console.log("Not in game...");
  //     setPlayer("notInGame");
  //   }
  // }, [pkrState.player1Key, pkrState.player2Key, wallet.wallet]);

  // const onSendTransaction = async (methodStr: string, actionStr: string) => {
  //   // await globalState.zkappWorkerClient!.fetchAccount({
  //   //     publicKey: globalState.publicKey!
  //   // });

  //   // Needed for several of the transactions
  //   switch (methodStr) {
  //     case "takeAction":
  //       const actionMapping: { [key: string]: number } = {
  //         // "Null": UInt32.from(0),
  //         Bet: 1,
  //         Call: 2,
  //         Fold: 3,
  //         Raise: 4,
  //         Check: 5,
  //         // We'll infer this one
  //         // "PreflopCall": UInt32.from(6),
  //       };
  //       const action: number = actionMapping[actionStr];
  //       const betSize: number = betAmount;
  //       await takeAction(action, betSize);
  //       // await globalState.zkappWorkerClient!.createTakeActionTx(senderB58, action, betSize);
  //       break;
  //     case "showdown":
  //       await showdown();
  //       break;
  //     case "withdraw":
  //       await withdraw();
  //       break;
  //     case "tallyBoardCards":
  //       const cardPrime52: number = 0;
  //       // useTallyBoardCardsTx(cardPrime52);
  //       break;
  //     case "showCards":
  //       // Hardcoded values for now...

  //       // "Ah": 41,
  //       // "Ad": 101,
  //       // "Ks": 233,
  //       // "Ts": 223,

  //       // "Kc": 163,
  //       // "Ac": 167,
  //       // "Qs": 229,
  //       // "8s": 199,
  //       // "6s": 193,

  //       let holecard0: number;
  //       let holecard1: number;

  //       let useHolecard0: boolean;
  //       let useHolecard1: boolean;
  //       let useBoardcards0: boolean;
  //       let useBoardcards1: boolean;
  //       let useBoardcards2: boolean;
  //       let useBoardcards3: boolean;
  //       let useBoardcards4: boolean;
  //       let isFlush: boolean;
  //       let merkleMapKey: number;
  //       let merkleMapVal: number;

  //       if (player === "player1") {
  //         holecard0 = 41;
  //         holecard1 = 101;

  //         useHolecard0 = true;
  //         useHolecard1 = true;
  //         useBoardcards0 = true;
  //         useBoardcards1 = true;
  //         useBoardcards2 = true;
  //         useBoardcards3 = false;
  //         useBoardcards4 = false;
  //         isFlush = false;
  //         merkleMapKey = 79052387;
  //         merkleMapVal = 1609;
  //       } else if (player === "player2") {
  //         holecard0 = 233;
  //         holecard1 = 223;

  //         useHolecard0 = true;
  //         useHolecard1 = true;
  //         useBoardcards0 = false;
  //         useBoardcards1 = false;
  //         useBoardcards2 = true;
  //         useBoardcards3 = true;
  //         useBoardcards4 = true;
  //         isFlush = true;
  //         merkleMapKey = 4933247;
  //         merkleMapVal = 858;
  //       } else {
  //         throw new Error("Not in game!");
  //       }

  //       const boardcard0: number = 163;
  //       const boardcard1: number = 167;
  //       const boardcard2: number = 229;
  //       const boardcard3: number = 199;
  //       const boardcard4: number = 193;

  //       const shuffleKey: string = PrivateKey.fromBigInt(BigInt(1)).toBase58();
  //       const path: string = "?";

  //       await showCards(
  //         holecard0,
  //         holecard1,
  //         boardcard0,
  //         boardcard1,
  //         boardcard2,
  //         boardcard3,
  //         boardcard4,
  //         useHolecard0,
  //         useHolecard1,
  //         useBoardcards0,
  //         useBoardcards1,
  //         useBoardcards2,
  //         useBoardcards3,
  //         useBoardcards4,
  //         isFlush,
  //         shuffleKey,
  //         merkleMapKey,
  //         merkleMapVal,
  //         path,
  //       );
  //       break;
  //   }
  // };

  // TODO - we'll need multiple functions like this to convert our encoding to strings
  // useEffect(() => {
  //   // Set board based on current street...
  //   // type Street = "ShowdownPending" | "Preflop" | "Flop" | "Turn" | "River" | "ShowdownComplete";
  //   const boardStr: string = pkrState.street;
  //   const streetMap: { [key: string]: string } = {
  //     "1": "ShowdownPending",
  //     "2": "Preflop",
  //     "3": "Flop",
  //     "4": "Turn",
  //     "5": "River",
  //     "6": "ShowdownComplete",
  //   };
  //   const streetStr = streetMap[boardStr];
  //   // setStreet(streetStr);

  //   // const lastActionStr: string = lastAction_.toJSON()
  //   const actionMap: { [key: string]: string } = {
  //     "0": "Null",
  //     "1": "Bet",
  //     "2": "Call",
  //     "3": "Fold",
  //     "4": "Raise",
  //     "5": "Check",
  //     "6": "PreflopCall",
  //   };
  //   // const actionStr = actionMap[lastActionStr];
  //   // setLastAction(actionStr);;

  //   // Street encoding
  //   // Preflop = UInt32.from(2);
  //   // Flop = UInt32.from(3);
  //   // Turn = UInt32.from(4);
  //   // River = UInt32.from(5);
  //   if (boardStr === "3") {
  //     const board = boardCardsHardcoded.slice(0, 3);
  //     setBoardCards(board);
  //   } else if (boardStr === "4") {
  //     const board = boardCardsHardcoded.slice(0, 4);
  //     setBoardCards(board);
  //   } else if (boardStr === "5") {
  //     setBoardCards(boardCardsHardcoded);
  //   } else {
  //     setBoardCards([]);
  //   }
  // }, []);

  // stack, facing bet, action history,  board_cards, hole_cards, pot
  // This is our bet amount
  const [betAmount, setBetAmount] = useState<number>(0);

  const actions = [
    { action: "Call", player: "player1" },
    { action: "Bet", player: "player2" },
    { action: "Raise", player: "player1" },
  ];
  const [actionHistory, setActionHistory] = useState(actions);
  const possibleActionsInit = [{ action: "Call", needsAmount: true }];
  const [possibleActions, setPossibleActions] = useState(possibleActionsInit);

  function getPossibleActions(facingAction: string): any[] {
    const BET = { action: "Bet", needsAmount: true };
    const CHECK = { action: "Check", needsAmount: false };
    const CALL = { action: "Call", needsAmount: false };
    const FOLD = { action: "Fold", needsAmount: false };
    const RAISE = { action: "Raise", needsAmount: true };
    // Given game state we should specify the subset of actions that are available to the player
    if (facingAction === "Null" || facingAction === "Check") {
      return [BET, CHECK, FOLD];
    } else if (
      facingAction === "Bet" ||
      facingAction === "Raise" ||
      facingAction === "Call"
    ) {
      return [CALL, FOLD, RAISE];
    } else if (facingAction === "PreflopCall") {
      return [RAISE, CHECK];
    } else {
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
    const facingAction = actionHistory[actionHistory.length - 1]["action"];
    const possibleActions = getPossibleActions(facingAction);
    setPossibleActions(possibleActions);
  }, [actionHistory]);

  return (
    <div className="min-h-[calc(100dvh-56px)]">
      {/* overall green background */}
      <main className="flex min-h-[calc(100dvh-56px)] flex-col justify-between gap-4 bg-[#111] py-4 sm:flex-row sm:gap-0 sm:px-8">
        <div className="hidden flex-1 sm:block"></div>
        {/* poker board border */}
        <div className="flex h-full w-full flex-1 sm:h-auto sm:flex-none md:w-[750px] md:flex-shrink-0">
          <div className="mx-auto flex w-full max-w-[750px] flex-1 flex-col overflow-hidden rounded-[50%/200px] border-4 border-[#000201] bg-[#3f3d3d] p-2 sm:h-full sm:p-4 md:rounded-[40%/300px] 2xl:rounded-[60%/500px]">
            {/* poker board */}
            <div className="poker-board mx-auto flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[50%/200px] border-4 border-[#000201] px-[5px] py-8 sm:h-[calc(100dvh-56px-136px)] md:rounded-[40%/300px] 2xl:rounded-[60%/500px] 2xl:py-12">
              <section className="relative mx-auto flex w-full max-w-[188px] justify-center  gap-2 px-1 sm:max-w-[232px]">
                <div className="absolute inset-x-0 -bottom-1 flex h-12 flex-col justify-center rounded-xl bg-zinc-800 px-4 py-2 text-white shadow-lg">
                  <div className="flex">
                    <span className="text-sm font-bold sm:text-base">
                      Opponent
                    </span>
                    <span className="flex-1 text-center">${"0"}</span>
                    {/* pkrState.stack2 || */}
                  </div>
                </div>
                <Image
                  className="max-w-[80px] sm:max-w-[100px]"
                  src="/svg_playing_cards/backs/blue.svg"
                  width={100}
                  height={142.3}
                  alt="Poker Card"
                />
                <Image
                  className="max-w-[80px] sm:max-w-[100px]"
                  src="/svg_playing_cards/backs/blue.svg"
                  width={100}
                  height={142.3}
                  alt="Poker Card"
                />
              </section>
              <div className="flex flex-col gap-2 sm:gap-2.5">
                <section className="mx-auto flex w-full max-w-[536px] gap-2">
                  <Image
                    className="my-auto h-fit max-w-[63px] sm:max-w-[100px]"
                    src="/svg_playing_cards/fronts/hearts_8.svg"
                    width={100}
                    height={142.3}
                    alt="Poker Card"
                  />
                  <Image
                    className="my-auto h-fit max-w-[63px] sm:max-w-[100px]"
                    src="/svg_playing_cards/fronts/hearts_9.svg"
                    width={100}
                    height={142.3}
                    alt="Poker Card"
                  />
                  <Image
                    className="my-auto h-fit max-w-[63px] sm:max-w-[100px]"
                    src="/svg_playing_cards/fronts/clubs_8.svg"
                    width={100}
                    height={142.3}
                    alt="Poker Card"
                  />
                  <Image
                    className="my-auto h-fit max-w-[63px] sm:max-w-[100px]"
                    src="/svg_playing_cards/fronts/diamonds_queen.svg"
                    width={100}
                    height={142.3}
                    alt="Poker Card"
                  />
                  <Image
                    className="my-auto h-fit max-w-[63px] sm:max-w-[100px]"
                    src="/svg_playing_cards/fronts/hearts_3.svg"
                    width={100}
                    height={142.3}
                    alt="Poker Card"
                  />
                </section>
                {/* pot */}
                <div className="mx-auto flex w-fit min-w-[60px] gap-1 rounded-full bg-black/60 px-3 py-2 text-center text-white">
                  <Image
                    className="my-auto h-fit max-w-[80px] sm:max-w-[100px]"
                    src="/svg_playing_cards/red-chip.png"
                    width={24}
                    height={24}
                    alt="Red Casino Chip"
                  />{" "}
                  <span className="font-semibold">
                    {pkrState.pot || "4000"}
                  </span>
                </div>
              </div>
              <section className="relative mx-auto flex w-full max-w-[188px] justify-center  gap-2 px-1 sm:max-w-[232px]">
                <div className="absolute inset-x-0 -bottom-1 flex h-12 flex-col justify-center rounded-xl bg-zinc-800 px-4 py-2 text-white">
                  <div className="flex">
                    <span className="text-sm font-bold sm:text-base">You</span>
                    <span className="flex-1 text-center">
                      ${pkrState.stack1}
                    </span>
                  </div>
                </div>
                <Image
                  className="max-w-[80px] sm:max-w-[100px]"
                  src="/svg_playing_cards/fronts/clubs_ace.svg"
                  width={100}
                  height={142.3}
                  alt="Poker Card"
                />
                <Image
                  className="max-w-[80px] sm:max-w-[100px]"
                  src="/svg_playing_cards/fronts/diamonds_queen.svg"
                  width={100}
                  height={142.3}
                  alt="Poker Card"
                />
              </section>
            </div>
          </div>
        </div>
        <div className="flex justify-center sm:flex-1 sm:flex-col sm:justify-end">
          <div className="flex w-fit flex-col space-y-3">
            <div className="flex w-full gap-2 rounded-lg bg-zinc-800 p-2 pl-5">
              <input
                type="number"
                className="w-[60px] bg-transparent  text-white"
                value={betAmountInput}
                onChange={(event) =>
                  setBetAmountInput(parseInt(event?.target.value))
                }
              />
              <input
                type="range"
                min={minSlider}
                max={maxSlider}
                className="custom-range-input w-full"
                value={betAmountInput}
                onChange={(event) =>
                  setBetAmountInput(parseInt(event.target.value))
                }
              />
            </div>
            <div className="flex w-fit justify-start gap-2">
              <button className="w-[100px] rounded-lg bg-zinc-800 px-4 py-3 text-[15px]  font-medium text-zinc-100 shadow-lg transition-colors hover:bg-opacity-80">
                Call
              </button>
              <button className="w-[100px] rounded-lg bg-zinc-800 px-4 py-3 text-[15px]  font-medium text-zinc-100 shadow-lg transition-colors hover:bg-opacity-80">
                Fold
              </button>
              <button className="w-[100px] rounded-lg bg-zinc-800 px-4 py-3 text-[15px]  font-medium text-zinc-100 shadow-lg transition-colors hover:bg-opacity-80">
                Raise
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
