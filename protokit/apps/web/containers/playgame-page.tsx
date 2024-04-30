"use client";
import { useEffect, useRef, useState } from "react";
import { PrivateKey } from "o1js";
import {
    usePoZKerStore,
    useShowCards,
    useTakeAction,
    useSettle,
    useCommitOpponentHolecards,
    useDecodeBoardcards,
    useCommitBoardcards,
    useLeaveTable,
    useRebuy,
} from "@/lib/stores/poZKer";
import { useWalletStore } from "@/lib/stores/wallet";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const cardMapping52SVG: { [key: number]: string } = {
    0: "/svg_playing_cards/backs/blue.svg", // this is default value - have background
    2: "/svg_playing_cards/fronts/hearts_2.svg",
    3: "/svg_playing_cards/fronts/hearts_3.svg",
    5: "/svg_playing_cards/fronts/hearts_4.svg",
    7: "/svg_playing_cards/fronts/hearts_5.svg",
    11: "/svg_playing_cards/fronts/hearts_6.svg",
    13: "/svg_playing_cards/fronts/hearts_7.svg",
    17: "/svg_playing_cards/fronts/hearts_8.svg",
    19: "/svg_playing_cards/fronts/hearts_9.svg",
    23: "/svg_playing_cards/fronts/hearts_10.svg",
    29: "/svg_playing_cards/fronts/hearts_jack.svg",
    31: "/svg_playing_cards/fronts/hearts_queen.svg",
    37: "/svg_playing_cards/fronts/hearts_king.svg",
    41: "/svg_playing_cards/fronts/hearts_ace.svg",
    43: "/svg_playing_cards/fronts/diamonds_2.svg",
    47: "/svg_playing_cards/fronts/diamonds_3.svg",
    53: "/svg_playing_cards/fronts/diamonds_4.svg",
    59: "/svg_playing_cards/fronts/diamonds_5.svg",
    61: "/svg_playing_cards/fronts/diamonds_6.svg",
    67: "/svg_playing_cards/fronts/diamonds_7.svg",
    71: "/svg_playing_cards/fronts/diamonds_8.svg",
    73: "/svg_playing_cards/fronts/diamonds_9.svg",
    79: "/svg_playing_cards/fronts/diamonds_10.svg",
    83: "/svg_playing_cards/fronts/diamonds_jack.svg",
    89: "/svg_playing_cards/fronts/diamonds_queen.svg",
    97: "/svg_playing_cards/fronts/diamonds_king.svg",
    101: "/svg_playing_cards/fronts/diamonds_ace.svg",
    103: "/svg_playing_cards/fronts/clubs_2.svg",
    107: "/svg_playing_cards/fronts/clubs_3.svg",
    109: "/svg_playing_cards/fronts/clubs_4.svg",
    113: "/svg_playing_cards/fronts/clubs_5.svg",
    127: "/svg_playing_cards/fronts/clubs_6.svg",
    131: "/svg_playing_cards/fronts/clubs_7.svg",
    137: "/svg_playing_cards/fronts/clubs_8.svg",
    139: "/svg_playing_cards/fronts/clubs_9.svg",
    149: "/svg_playing_cards/fronts/clubs_10.svg",
    151: "/svg_playing_cards/fronts/clubs_jack.svg",
    157: "/svg_playing_cards/fronts/clubs_queen.svg",
    163: "/svg_playing_cards/fronts/clubs_king.svg",
    167: "/svg_playing_cards/fronts/clubs_ace.svg",
    173: "/svg_playing_cards/fronts/spades_2.svg",
    179: "/svg_playing_cards/fronts/spades_3.svg",
    181: "/svg_playing_cards/fronts/spades_4.svg",
    191: "/svg_playing_cards/fronts/spades_5.svg",
    193: "/svg_playing_cards/fronts/spades_6.svg",
    197: "/svg_playing_cards/fronts/spades_7.svg",
    199: "/svg_playing_cards/fronts/spades_8.svg",
    211: "/svg_playing_cards/fronts/spades_9.svg",
    223: "/svg_playing_cards/fronts/spades_10.svg",
    227: "/svg_playing_cards/fronts/spades_jack.svg",
    229: "/svg_playing_cards/fronts/spades_queen.svg",
    233: "/svg_playing_cards/fronts/spades_king.svg",
    239: "/svg_playing_cards/fronts/spades_ace.svg",
};

export default function Component() {
    const showCards = useShowCards();
    const takeAction = useTakeAction();
    const wallet = useWalletStore();
    const pkrState = usePoZKerStore();
    const settle = useSettle();
    const commitOpponentHolecards = useCommitOpponentHolecards();
    const decodeBoardcards = useDecodeBoardcards();
    const commitBoardcards = useCommitBoardcards();
    const leaveTable = useLeaveTable();
    const rebuy = useRebuy();

    const [betAmountInput, setBetAmountInput] = useState(0);
    const [maxSlider, setMaxSlider] = useState(100);
    const [minSlider, setMinSlider] = useState(0);

    const [shuffleKey, setShuffleKey] = useState<string>("");
    const [shuffleComplete, setShuffleComplete] = useState<boolean>(false);

    // All cards will be in prime52 format
    const [holecard0, setHolecard0] = useState<number>(0);
    const [holecard1, setHolecard1] = useState<number>(0);
    const [boardcard0, setBoardcard0] = useState<number>(0);
    const [boardcard1, setBoardcard1] = useState<number>(0);
    const [boardcard2, setBoardcard2] = useState<number>(0);
    const [boardcard3, setBoardcard3] = useState<number>(0);
    const [boardcard4, setBoardcard4] = useState<number>(0);

    const svgDefault = "/svg_playing_cards/backs/blue.svg";

    const [holecard0SVG, setHolecard0SVG] = useState<string>(svgDefault);
    const [holecard1SVG, setHolecard1SVG] = useState<string>(svgDefault);
    const [boardcard0SVG, setBoardcard0SVG] = useState<string>(svgDefault);
    const [boardcard1SVG, setBoardcard1SVG] = useState<string>(svgDefault);
    const [boardcard2SVG, setBoardcard2SVG] = useState<string>(svgDefault);
    const [boardcard3SVG, setBoardcard3SVG] = useState<string>(svgDefault);
    const [boardcard4SVG, setBoardcard4SVG] = useState<string>(svgDefault);

    // Which player we are...
    type Player = "0" | "1" | "notInGame";
    const [player, setPlayer] = useState<Player>("notInGame");

    const [ourStack, setOurStack] = useState<number>(0);
    const [oppStack, setOppStack] = useState<number>(0);

    const [ourBetThisStreet, setOurBetThisStreet] = useState<number>(0);
    const [oppBetThisStreet, setOppBetThisStreet] = useState<number>(0);

    const [possibleActions, setPossibleActions] = useState<any[]>([]);

    const [ourButton, setOurButton] = useState<boolean>(false);

    useEffect(() => {
        const userKey = wallet.wallet;

        // Figure out which player we are...
        if (userKey === pkrState.player0Key) {
            setPlayer("0");
            setOurStack(Number(pkrState.stack0))
            setOppStack(Number(pkrState.stack1))
            let ourButton_ = false;
            if (pkrState.button === "0") {
                ourButton_ = true;
            }
            setOurButton(ourButton_);
            // Hardcoding player's cards
            // setHoleCards(["Ah", "Ad"]);
        } else if (userKey === pkrState.player1Key) {
            setPlayer("1");
            setOurStack(Number(pkrState.stack1))
            setOppStack(Number(pkrState.stack0))
            let ourButton_ = false;
            if (pkrState.button === "1") {
                ourButton_ = true;
            }
            setOurButton(ourButton_);
        } else {
            setPlayer("notInGame");
            setOurStack(0)
            setOppStack(0)
        }
    }, [pkrState.player0Key, pkrState.player1Key, wallet.wallet]);

    useEffect(() => {
        const userKey = wallet.wallet;
        // Figure out which player we are...
        if (userKey === pkrState.player0Key) {
            setOurBetThisStreet(Number(pkrState.betThisStreet0));
            setOppBetThisStreet(Number(pkrState.betThisStreet1));
        } else if (userKey === pkrState.player1Key) {

            setOurBetThisStreet(Number(pkrState.betThisStreet1));
            setOppBetThisStreet(Number(pkrState.betThisStreet0));
        } else {
            setOurBetThisStreet(0);
            setOppBetThisStreet(0);
        }
    }, [pkrState.betThisStreet0, pkrState.betThisStreet1]);

    useEffect(() => {
        const randNum: number = Math.floor(Math.random() * 1_000_000_000_000);
        // For every hand we need to generate a new shuffleKey for the shuffling
        const shuffleKeyNew: string = PrivateKey.fromBigInt(BigInt(randNum)).toBase58();
        setShuffleKey(shuffleKeyNew);
        setShuffleComplete(false);
        setHolecard0(0);
        setHolecard1(0);
        setBoardcard0(0);
        setBoardcard1(0);
        setBoardcard2(0);
        setBoardcard3(0);
        setBoardcard4(0);
        setHolecard0SVG(svgDefault);
        setHolecard1SVG(svgDefault);
        setBoardcard0SVG(svgDefault);
        setBoardcard1SVG(svgDefault);
        setBoardcard2SVG(svgDefault);
        setBoardcard3SVG(svgDefault);
        setBoardcard4SVG(svgDefault);

        // Do it this way to be sure during loading?
        let player_ = "notInGame"
        const userKey = wallet.wallet;
        if (userKey === pkrState.player0Key) {
            player_ = "0"
        } else if (userKey === pkrState.player1Key) {
            player_ = "1"
        }
        if (player_ === pkrState.button) {
            setOurButton(true);
        }
        else {
            setOurButton(false);
        }
    }, [pkrState.handId]);


    useEffect(() => {
        setBoardcard0(Number(pkrState.flop0));
        setBoardcard1(Number(pkrState.flop1));
        setBoardcard2(Number(pkrState.flop2));
        setBoardcard3(Number(pkrState.turn0));
        setBoardcard4(Number(pkrState.river0));
        setBoardcard0SVG(cardMapping52SVG[Number(pkrState.flop0)]);
        setBoardcard1SVG(cardMapping52SVG[Number(pkrState.flop1)]);
        setBoardcard2SVG(cardMapping52SVG[Number(pkrState.flop2)]);
        setBoardcard3SVG(cardMapping52SVG[Number(pkrState.turn0)]);
        setBoardcard4SVG(cardMapping52SVG[Number(pkrState.river0)]);

    }, [pkrState.flop0, pkrState.flop1, pkrState.flop2, pkrState.turn0, pkrState.river0]);


    useEffect(() => {
        // Only if we're player 0, get cards
        // Should be in DealHolecardsA (2)
        const fetchData = async () => {
            // Think it can be in 2 or 3?
            if (player === "0" && (pkrState.handStage === "2" || pkrState.handStage === "3")) {
                const seatI = "0";
                const cards = await fetchAPICards(pkrState.handId, seatI, "holeCards");
                setHolecard0(cards[0]!);
                setHolecard1(cards[1]!);
                setHolecard0SVG(cardMapping52SVG[cards[0]]);
                setHolecard1SVG(cardMapping52SVG[cards[1]]);
            }
        }
        fetchData();
    }, [pkrState.p0Hc0, pkrState.p0Hc1]);

    useEffect(() => {
        // Only if we're player 1, get cards
        // Should be in DealHolecardsB (3)
        const fetchData = async () => {
            if (player === "1" && (pkrState.handStage === "3" || pkrState.handStage === "4")) {
                const seatI = "1"
                const cards = await fetchAPICards(pkrState.handId, seatI, "holeCards");
                setHolecard0(cards[0]!);
                setHolecard1(cards[1]!);
                setHolecard0SVG(cardMapping52SVG[cards[0]]);
                setHolecard1SVG(cardMapping52SVG[cards[1]]);
            }
        }
        fetchData();

    }, [pkrState.p1Hc0, pkrState.p1Hc1]);



    useEffect(() => {
        const randNum: number = Math.floor(Math.random() * 1_000_000_000_000);
        // For every hand we need to generate a new shuffleKey for the shuffling
        const shuffleKeyNew: string = PrivateKey.fromBigInt(
            BigInt(randNum),
        ).toBase58();
        setShuffleKey(shuffleKeyNew);
    }, [pkrState.handId]);

    useEffect(() => {
        setBoardcard0(Number(pkrState.flop0));
        setBoardcard1(Number(pkrState.flop1));
        setBoardcard2(Number(pkrState.flop2));
        setBoardcard3(Number(pkrState.turn0));
        setBoardcard4(Number(pkrState.river0));
        setBoardcard0SVG(cardMapping52SVG[Number(pkrState.flop0)]);
        setBoardcard1SVG(cardMapping52SVG[Number(pkrState.flop1)]);
        setBoardcard2SVG(cardMapping52SVG[Number(pkrState.flop2)]);
        setBoardcard3SVG(cardMapping52SVG[Number(pkrState.turn0)]);
        setBoardcard4SVG(cardMapping52SVG[Number(pkrState.river0)]);
    }, [
        pkrState.flop0,
        pkrState.flop1,
        pkrState.flop2,
        pkrState.turn0,
        pkrState.river0,
    ]);

    const fetchAPICards = async (
        handId: string,
        seatI: string,
        cardKey: string,
    ) => {
        const queryParams = new URLSearchParams({
            handId: handId,
            seatI: seatI,
            cardKey: cardKey,
        });
        try {
            const response = await fetch("/api/deck?" + queryParams, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });
            if (response) {
                const data = await response.json();
                return data.cards;
            } else {
                console.log("NO RESPONSE FROM API...");
            }
        } catch (error) {
            console.log(error);
        }
        console.log("DONE CALLING API...");
    };

    const callRebuy = async (depositAmount: number) => {
        // always rebuy for 100?
        if (player === "notInGame") {
            return;
        }
        const seatI: number = player === "0" ? 0 : 1;
        // let seatI: number;
        // if (player === "0") {
        //     seatI = 0;
        // }
        // else if (player === "1") {
        //     seatI = 1;
        // }
        await rebuy(seatI, depositAmount);
    };

    const fetchAPILookupValue = async (
        card0prime52: string,
        card1prime52: string,
        boardcard0: string,
        boardcard1: string,
        boardcard2: string,
        boardcard3: string,
        boardcard4: string,
    ) => {
        // Remember - should be in prime52 format
        const queryParams = new URLSearchParams({
            card0prime52: card0prime52,
            card1prime52: card1prime52,
            boardcard0: boardcard0,
            boardcard1: boardcard1,
            boardcard2: boardcard2,
            boardcard3: boardcard3,
            boardcard4: boardcard4,
        });
        try {
            const response = await fetch("/api/lookupVal?" + queryParams, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });
            if (response) {
                const data = await response.json();
                return data;
            } else {
                console.log("NO RESPONSE FROM API...");
            }
        } catch (error) {
            console.log(error);
        }
        console.log("DONE CALLING API...");
    };

    const onClickAction = async (methodStr: string) => {
        // Action mappings... we'll use these directly
        // Bet = Field(1);
        // Call = Field(2);
        // Fold = Field(3);
        // Raise = Field(4);
        // Check = Field(5);
        // PreflopCall = Field(6);
        // PostSBAct = Field(7);
        // PostBBAct = Field(8);

        let actF: number;
        // Needed for several of the transactions
        switch (methodStr) {
            // Start with the 'takeAction' actions
            case "Post SB":
                // PostSBAct = Field(7);
                actF = 7;
                await takeAction(actF, 1);
                break;
            case "Post BB":
                // PostBBAct = Field(8);
                actF = 8;
                await takeAction(actF, 2);
                break;
            case "Bet":
                // Bet = Field(1);
                actF = 1;
                await takeAction(actF, betAmountInput);
                break;
            case "Check":
                // Check = Field(5);
                actF = 5;
                await takeAction(actF, 0);
                break;
            case "Call":
                // Call = Field(2);
                // PreflopCall = Field(6);
                // '6' is postBB - if last action was PostBB and we call
                // it's actually the preflopCall action
                if (pkrState.lastAction === "8") {
                    actF = 6;
                } else {
                    actF = 2;
                }
                await takeAction(actF, 0);
                break;
            case "Fold":
                // Fold = Field(3);
                actF = 3;
                await takeAction(actF, 0);
                break;
            case "Raise":
                // Raise = Field(4);
                actF = 4;
                await takeAction(actF, betAmountInput);
                break;
            case "Shuffle and Pass":
                setShuffleComplete(true);
                // shuffleAndPass() - no contract interaciton, only API:
                // getDeck() encryptDeck() shuffleDeck() postDeck()
                break;
            case "Get Holecards":
                // Actually Commit Opponent Holecards, but this labeling is clearer 
                // TODO - still need to get the cards here...
                // commitOpponentHolecards(card0: Card, card1: Card)
                await commitOpponentHolecards();
                break;
            case "Commit Boardcards":
                // TODO - need to understand card format...
                // Think we can't pass in groups?
                await commitBoardcards();
                break;
            case "Decode Boardcards":
                // TODO - actually pull values and decrypt them...
                // again - dealing with groups might be tricky

                // FlopDealDec = Field(6); // 'Dec' ones are decode stage
                // TurnDealDec = Field(9);
                // RiverDealDec = Field(12);
                let boardStr: string = "";
                if (pkrState.handStage === "6") {
                    boardStr = "flop";
                } else if (pkrState.handStage === "9") {
                    boardStr = "turn";
                } else if (pkrState.handStage === "12") {
                    boardStr = "river";
                }
                const cards = await fetchAPICards(pkrState.handId, "0", boardStr);
                await decodeBoardcards(cards[0], cards[1], cards[2]);
                break;
            case "Show Cards":
                const showCardsData = await fetchAPILookupValue(
                    holecard0.toString(),
                    holecard1.toString(),
                    boardcard0.toString(),
                    boardcard1.toString(),
                    boardcard2.toString(),
                    boardcard3.toString(),
                    boardcard4.toString(),
                );
                await showCards(
                    holecard0,
                    holecard1,
                    boardcard0,
                    boardcard1,
                    boardcard2,
                    boardcard3,
                    boardcard4,
                    showCardsData.useCards[0],
                    showCardsData.useCards[1],
                    showCardsData.useCards[2],
                    showCardsData.useCards[3],
                    showCardsData.useCards[4],
                    showCardsData.useCards[5],
                    showCardsData.useCards[6],
                    showCardsData.isFlush,
                    shuffleKey,
                    showCardsData.merkleMapKey,
                    showCardsData.merkleMapVal,
                    showCardsData.witnessPath,
                );
                break;
            case "Settle":
                await settle();
                break;
        }
    };

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


    // So we need to figure out this logic too...
    function getPossibleActions(playerI: string): any[] {
        // We need a mapping from every possible handStage to the possible actions - 
        // for each player, at that handStage...
        // Some of the logic is dependent on player0/player1
        // Other logic is dependent-  on who has the button

        // 'takeAction' actions
        const POSTSB = { "action": "Post SB" };
        const POSTBB = { "action": "Post BB" };
        const BET = { "action": "Bet" };
        const CHECK = { "action": "Check" };
        const CALL = { "action": "Call" };
        const FOLD = { "action": "Fold" };
        const RAISE = { "action": "Raise" };
        // Other methods
        const SHUFFLE_AND_DEAL = { "action": "Shuffle and Pass" };
        // const COMMIT_OPP_HOLECARDS = { "action": "Commit Opponent Holecards" };
        const COMMIT_OPP_HOLECARDS = { "action": "Get Holecards" };
        const COMMIT_BOARDCARDS = { "action": "Commit Boardcards" };
        const DECODE_BOARDCARDS = { "action": "Decode Boardcards" };
        const SHOW_CARDS = { "action": "Show Cards" };
        const SETTLE = { "action": "Settle" };


        // So approach:
        // 1. define what possible actionso are... the structures
        // 2. go through EAACH one of these, have a big switch statement
        // and conditionally set it for the players

        // HandStage encoding...
        let actionList: any[] = []

        switch (pkrState.handStage) {
            case '0':
                // SBPostStage = Field(0);
                // If player is the button, their turn to post, else nothing
                if (playerI === pkrState.button) {
                    actionList = [POSTSB];
                }
                break;
            case '1':
                // BBPostStage = Field(1);
                // If player is NOT the button, their turn to post BB, else nothing
                if (playerI !== pkrState.button) {
                    actionList = [POSTBB];
                }
                break;
            case '2':
                // DealHolecardsA = Field(2);
                // We will ALWAYS have player0 shuffle + deal first
                // TODO - figure out better way to do transitions
                // both players need to shuffle and pass (step 1)
                // and after that is done, both players commit cards
                if (playerI === "0") {
                    if (!shuffleComplete) {
                        actionList = [SHUFFLE_AND_DEAL];
                    }
                    else {
                        actionList = [COMMIT_OPP_HOLECARDS];
                    }
                }
                break;
            case '3':
                // DealHolecardsB = Field(3);
                if (playerI === "1") {
                    if (!shuffleComplete) {
                        actionList = [SHUFFLE_AND_DEAL];
                    }
                    else {
                        actionList = [COMMIT_OPP_HOLECARDS];
                    }
                }
                break;
            case '5':
                // FlopDeal = Field(5);
                if (playerI === "0") {
                    actionList = [COMMIT_BOARDCARDS];
                }
                break;
            case '6':
                // FlopDealDec = Field(6); // 'Dec' ones are decode stage
                if (playerI === "1") {
                    actionList = [DECODE_BOARDCARDS];
                }
                break;
            case '8':
                // TurnDeal = Field(8);
                if (playerI === "0") {
                    actionList = [COMMIT_BOARDCARDS];
                }
                break;
            case '9':
                // TurnDealDec = Field(9);
                if (playerI === "1") {
                    actionList = [DECODE_BOARDCARDS];
                }
                break;
            case '11':
                // RiverDeal = Field(11);
                if (playerI === "0") {
                    actionList = [COMMIT_BOARDCARDS];
                }
                break;
            case '12':
                // RiverDealDec = Field(12);
                if (playerI === "1") {
                    actionList = [DECODE_BOARDCARDS];
                }
                break;
            case '14':
                // ShowdownA = Field(14);
                if (playerI === "0") {
                    actionList = [SHOW_CARDS];
                }
                break;
            case '15':
                // ShowdownB = Field(15);
                if (playerI === "1") {
                    actionList = [SHOW_CARDS];
                }
                break;
            case '16':
                // Settle = Field(16);
                if (playerI === "0") {
                    actionList = [SETTLE];
                }
                break;

            default:
                // Will always be one of these three:
                // PreflopBetting = Field(4);
                // FlopBetting = Field(7);
                // TurnBetting = Field(10);
                // RiverBetting = Field(13);

                // Need to reference our state encoding
                // Null = Field(0);
                // Bet = Field(1);
                // Call = Field(2);
                // Fold = Field(3);
                // Raise = Field(4);
                // Check = Field(5);
                // PreflopCall = Field(6);
                // PostSBAct = Field(7);
                // PostBBAct = Field(8);
                const lastActionRef: { [key: string]: string } = {
                    "0": "Null",
                    "1": "Bet",
                    "2": "Call",
                    "3": "Fold",
                    "4": "Raise",
                    "5": "Check",
                    "6": "PreflopCall",
                    "7": "PostSBAct",
                    "8": "PostBBAct",
                };
                const lastActionStr: string = lastActionRef[pkrState.lastAction];
                // Can only act if it's their turn!
                if (playerI == pkrState.playerTurn) {
                    // Given game state we should specify the subset of actions that are available to the player
                    // Max bet is always our stack...
                    setMaxSlider(ourStack);
                    if (lastActionStr === "Null" || lastActionStr === "Check") {
                        // For the preflop scenario - we handle that via separate handStage...
                        actionList = [BET, CHECK, FOLD];
                        setMinSlider(1);
                        setBetAmountInput(1);
                    } else if (lastActionStr === "Bet" || lastActionStr === "Raise" || lastActionStr === "Call") {
                        actionList = [RAISE, CALL, FOLD];
                        // const betDiff = oppBetThisStreet - ourBetThisStreet;
                        const betDiff = Math.abs(Number(pkrState.betThisStreet1) - Number(pkrState.betThisStreet0));
                        if (betDiff * 2 < ourStack) {
                            setMinSlider(betDiff * 2);
                            setBetAmountInput(betDiff * 2);
                        }
                        else {
                            setMinSlider(ourStack);
                            setBetAmountInput(ourStack);
                        }
                    } else if (lastActionStr === "PreflopCall") {
                        actionList = [RAISE, CHECK];
                        // Just hardcode it here?  Min raise is to 4?
                        setMinSlider(2);
                        setBetAmountInput(2);
                    }
                    else if (lastActionStr === "PostBBAct") {
                        actionList = [RAISE, CALL, FOLD];
                        const betDiff = Math.abs(Number(pkrState.betThisStreet1) - Number(pkrState.betThisStreet0));
                        if (betDiff * 2 < ourStack) {
                            setMinSlider(betDiff * 2);
                            setBetAmountInput(betDiff * 2);
                        }
                        else {
                            setMinSlider(ourStack);
                            setBetAmountInput(ourStack);
                        }
                    }
                    // Handled elsewhere...
                    // else if (lastActionStr === "PostSBAct") {
                    //     actionList = [POSTBB];
                    // }
                    else {
                        console.error("Unexpected facing action:", pkrState.lastAction);
                    }
                }
                break;
        }

        return actionList;
    }

    useEffect(() => {
        // Whenever handStage or lastAction changes, the possible actions should change
        // To enable switching between both players in one browser, also run it when wallet changes...
        // console.log("Updating possible actions...")
        // // this will return a "1" if player is not in game, look to clean it up...
        // const possibleActions = getPossibleActions(player);
        // console.log("Got possible actions!", possibleActions);
        // setPossibleActions(possibleActions);
        const userKey = wallet.wallet;
        if (userKey === pkrState.player0Key) {
            setPlayer("0");
            // Hardcoding player's cards
            // setHoleCards(["Ah", "Ad"]);
            const possibleActions = getPossibleActions("0");
            setPossibleActions(possibleActions);
            setOurStack(Number(pkrState.stack0))
            setOppStack(Number(pkrState.stack1))
        } else if (userKey === pkrState.player1Key) {
            setPlayer("1");
            const possibleActions = getPossibleActions("1");
            setPossibleActions(possibleActions);
            setOurStack(Number(pkrState.stack1))
            setOppStack(Number(pkrState.stack0))
        } else {
            setPlayer("notInGame");
            setOurStack(0)
            setOppStack(0)
        }
    }, [pkrState.handStage, pkrState.lastAction, wallet.wallet, shuffleComplete]);


    useEffect(() => {
        const userKey = wallet.wallet;
        if (userKey === pkrState.player0Key) {
            setOurStack(Number(pkrState.stack0))
            setOppStack(Number(pkrState.stack1))
        } else if (userKey === pkrState.player1Key) {
            setOurStack(Number(pkrState.stack1))
            setOppStack(Number(pkrState.stack0))
        } else {
            setOurStack(0)
            setOppStack(0)
        }
    }, [pkrState.stack0, pkrState.stack1, wallet.wallet]);


    // On page load we need to set player and actions...
    useEffect(() => {
        const userKey = wallet.wallet;
        if (userKey === pkrState.player0Key) {
            setPlayer("0");
            // Hardcoding player's cards
            // setHoleCards(["Ah", "Ad"]);
            const possibleActions = getPossibleActions("0");
            setPossibleActions(possibleActions);
        } else if (userKey === pkrState.player1Key) {
            setPlayer("1");
            const possibleActions = getPossibleActions("1");
            setPossibleActions(possibleActions);
        } else {
            setPlayer("notInGame");
        }

    }, []);

    // This is for the rebuy popup
    const [isOpen, setIsOpen] = useState(false);
    const [rebuyAmountInput, setRebuyAmountInput] = useState(100);

    const toggleModal = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="min-h-[calc(100dvh-56px)] w-full">
            <main className="flex min-h-[calc(100dvh-56px)] w-full flex-col justify-between gap-4 bg-[#111] py-4 lg:flex-row lg:gap-0 lg:px-8">
                {isOpen && (
                    <div
                        className="fixed inset-0 z-10 overflow-y-auto"
                        onClick={toggleModal}
                    >
                        <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center lg:block lg:p-0">
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
                                        <h1 className="mr-5 bg-[#222] pb-3 pl-2 text-white">
                                            Rebuy
                                        </h1>
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
                                            callRebuy(rebuyAmountInput);
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
                <div className="flex gap-2 px-3 lg:h-auto lg:flex-1 lg:flex-col lg:px-0">
                    {pkrState.handStage !== "0" ? (
                        <>
                            <TooltipProvider>
                                <Tooltip delayDuration={10}>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="h-fit w-full rounded-lg bg-zinc-800 px-4 py-3 text-[15px]  font-medium text-zinc-100 shadow-lg transition-colors hover:bg-opacity-80 disabled:cursor-not-allowed lg:w-[150px]"
                                            disabled={pkrState.handStage !== "0"}
                                            onClick={() => leaveTable()}
                                        >
                                            Leave Table
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        className="max-w-[300px] border-none bg-zinc-800 p-4 text-white disabled:hover:bg-zinc-800"
                                        sideOffset={10}
                                    >
                                        <p>This action can only be performed in between hands.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip delayDuration={10}>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="h-fit w-full rounded-lg bg-zinc-800 px-4 py-3 text-[15px]  font-medium text-zinc-100 shadow-lg transition-colors hover:bg-opacity-80 disabled:cursor-not-allowed lg:w-[150px]"
                                            disabled={pkrState.handStage !== "0"}
                                            //   onClick={() => callRebuy()}
                                            onClick={toggleModal}
                                        >
                                            Rebuy
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        className="max-w-[300px] border-none bg-zinc-800 p-4 text-white disabled:hover:bg-zinc-800"
                                        sideOffset={10}
                                    >
                                        <p>This action can only be performed in between hands.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    ) : (
                        <>
                            <button
                                className="h-fit w-full rounded-lg bg-zinc-800 px-4 py-3 text-[15px]  font-medium text-zinc-100 shadow-lg transition-colors hover:bg-opacity-80 lg:w-[150px]"
                                disabled={pkrState.handStage !== "0"}
                                onClick={() => leaveTable()}
                            >
                                Leave Table
                            </button>
                            <button
                                className="h-fit w-full rounded-lg bg-zinc-800 px-4 py-3 text-[15px]  font-medium text-zinc-100 shadow-lg transition-colors hover:bg-opacity-80 lg:w-[150px]"
                                disabled={pkrState.handStage !== "0"}
                                onClick={toggleModal}
                            >
                                Rebuy
                            </button>
                        </>
                    )}
                </div>

                {/* poker board border */}
                <div className="flex h-full w-full flex-1 lg:h-auto lg:w-[650px] lg:flex-none lg:flex-shrink-0 xl:w-[750px]">
                    <div className="mx-auto flex w-full max-w-[750px] flex-1 flex-col overflow-hidden rounded-[50%/200px] border-4 border-[#000201] bg-[#3f3d3d] p-2 md:rounded-[40%/300px] lg:h-full lg:p-4 2xl:rounded-[60%/500px]">
                        {/* poker board */}
                        <div className="poker-board mx-auto flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[50%/200px] border-4 border-[#000201] px-[5px] py-8 md:rounded-[40%/300px] lg:h-[calc(100dvh-56px-136px)] 2xl:rounded-[60%/500px] 2xl:py-12">
                            <div className="flex flex-col gap-2">
                                <section className="relative mx-auto flex w-full max-w-[188px] justify-center  gap-2 px-1 lg:max-w-[232px]">
                                    {!ourButton ? (
                                        <div className="absolute -left-10 bottom-0 top-0 grid h-full items-center text-center">
                                            <Image
                                                className="my-auto h-fit rounded-full bg-black/60"
                                                src="/svg_playing_cards/yellow-chip.png"
                                                width={32}
                                                height={32}
                                                alt="Yellow Casino Chip"
                                            />
                                        </div>
                                    ) : null}

                                    <div className="absolute inset-x-0 -bottom-1 flex h-12 flex-col justify-center rounded-xl bg-zinc-800 px-4 py-2 text-white shadow-lg">
                                        <div className="flex">
                                            <span className="text-sm font-bold lg:text-base">
                                                Opponent
                                            </span>
                                            <span className="flex-1 text-center">${oppStack}</span>
                                        </div>
                                    </div>
                                    <Image
                                        className="max-w-[70px] lg:max-w-[100px]"
                                        src={svgDefault}
                                        width={100}
                                        height={142.3}
                                        alt="Poker Card"
                                    />
                                    <Image
                                        className="max-w-[70px] lg:max-w-[100px]"
                                        src={svgDefault}
                                        width={100}
                                        height={142.3}
                                        alt="Poker Card"
                                    />
                                </section>
                                <div className="mx-auto flex w-fit min-w-[60px] gap-1 rounded-full bg-black/60 px-3 py-2 text-center text-white">
                                    <Image
                                        className="my-auto h-fit"
                                        src="/svg_playing_cards/black-chip.svg"
                                        width={20}
                                        height={20}
                                        alt="Black Casino Chip"
                                    />{" "}
                                    <span className="font-semibold">
                                        {oppBetThisStreet}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 lg:gap-2.5">
                                <section className="mx-auto flex w-full max-w-[536px] justify-center gap-2">
                                    <Image
                                        className="my-auto h-fit max-w-[63px] sm:max-w-[90px] lg:max-w-[100px]"
                                        src={boardcard0SVG}
                                        width={100}
                                        height={142.3}
                                        alt="Poker Card"
                                    />
                                    <Image
                                        className="my-auto h-fit max-w-[63px] sm:max-w-[90px] lg:max-w-[100px]"
                                        src={boardcard1SVG}
                                        width={100}
                                        height={142.3}
                                        alt="Poker Card"
                                    />
                                    <Image
                                        className="my-auto h-fit max-w-[63px] sm:max-w-[90px] lg:max-w-[100px]"
                                        src={boardcard2SVG}
                                        width={100}
                                        height={142.3}
                                        alt="Poker Card"
                                    />
                                    <Image
                                        className="my-auto h-fit max-w-[63px] sm:max-w-[90px] lg:max-w-[100px]"
                                        src={boardcard3SVG}
                                        width={100}
                                        height={142.3}
                                        alt="Poker Card"
                                    />
                                    <Image
                                        className="my-auto h-fit max-w-[63px] sm:max-w-[90px] lg:max-w-[100px]"
                                        src={boardcard4SVG}
                                        width={100}
                                        height={142.3}
                                        alt="Poker Card"
                                    />
                                </section>
                                {/* pot */}
                                <div className="mx-auto flex w-fit min-w-[60px] gap-1 rounded-full bg-black/60 px-3 py-2 text-center text-white">
                                    <Image
                                        className="my-auto h-fit"
                                        src="/svg_playing_cards/red-chip.png"
                                        width={20}
                                        height={20}
                                        alt="Red Casino Chip"
                                    />{" "}
                                    <span className="font-semibold">
                                        {Number(pkrState.pot) - ourBetThisStreet - oppBetThisStreet}
                                        MIN NUM: {minSlider}
                                        MAX NUM: {maxSlider}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="mx-auto flex w-fit min-w-[60px] gap-1 rounded-full bg-black/60 px-3 py-2 text-center text-white">
                                    <Image
                                        className="my-auto h-fit"
                                        src="/svg_playing_cards/black-chip.svg"
                                        width={20}
                                        height={20}
                                        alt="Black Casino Chip"
                                    />{" "}
                                    <span className="font-semibold">
                                        {ourBetThisStreet}
                                    </span>
                                </div>
                                <section className="relative mx-auto flex w-full max-w-[188px] justify-center gap-2 px-1 lg:max-w-[232px]">
                                    {ourButton ? (
                                        <div className="absolute -left-10 bottom-0 top-0 grid h-full items-center text-center">
                                            <Image
                                                className="my-auto h-fit rounded-full bg-black/60"
                                                src="/svg_playing_cards/yellow-chip.png"
                                                width={32}
                                                height={32}
                                                alt="Yellow Casino Chip"
                                            />
                                        </div>
                                    ) : null}

                                    <div className="absolute inset-x-0 -bottom-1 flex h-12 flex-col justify-center rounded-xl bg-zinc-800 px-4 py-2 text-white">
                                        <div className="flex">
                                            <span className="text-sm font-bold lg:text-base">
                                                You
                                            </span>
                                            <span className="flex-1 text-center">
                                                ${ourStack}
                                            </span>
                                        </div>
                                    </div>
                                    <Image
                                        className="max-w-[70px] lg:max-w-[100px]"
                                        src={holecard0SVG}
                                        width={100}
                                        height={142.3}
                                        alt="Poker Card"
                                    />
                                    <Image
                                        className="max-w-[70px] lg:max-w-[100px]"
                                        src={holecard1SVG}
                                        width={100}
                                        height={142.3}
                                        alt="Poker Card"
                                    />
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center lg:flex-1 lg:flex-col lg:justify-end">
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
                        <div className="flex w-full justify-start gap-2">
                            {possibleActions.map((action, index) => (
                                <div key={index} className="flex w-full">
                                    <button
                                        className="w-[120px] rounded-lg bg-zinc-800 px-4 py-3 text-[14px] font-medium text-zinc-100 shadow-lg transition-colors hover:bg-opacity-80"
                                        onClick={() => onClickAction(action.action)}
                                    >
                                        {action.action}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
