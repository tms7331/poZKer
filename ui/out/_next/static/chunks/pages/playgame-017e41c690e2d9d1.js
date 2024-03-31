(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[815],{

/***/ 2201:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


    (window.__NEXT_P = window.__NEXT_P || []).push([
      "/playgame",
      function () {
        return __webpack_require__(6775);
      }
    ]);
    if(false) {}
  

/***/ }),

/***/ 802:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   z: function() { return /* binding */ Button; }
/* harmony export */ });
/* unused harmony export buttonVariants */
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7294);
/* harmony import */ var _radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(634);
/* harmony import */ var class_variance_authority__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5139);
/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(3204);





const buttonVariants = (0,class_variance_authority__WEBPACK_IMPORTED_MODULE_2__/* .cva */ .j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((param, ref)=>{
    let { className, variant, size, asChild = false, ...props } = param;
    const Comp = asChild ? _radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__/* .Slot */ .g7 : "button";
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Comp, {
        className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_4__.cn)(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    });
});
Button.displayName = "Button";



/***/ }),

/***/ 7738:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ol: function() { return /* binding */ CardHeader; },
/* harmony export */   Zb: function() { return /* binding */ Card; },
/* harmony export */   aY: function() { return /* binding */ CardContent; },
/* harmony export */   ll: function() { return /* binding */ CardTitle; }
/* harmony export */ });
/* unused harmony exports CardFooter, CardDescription */
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7294);
/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3204);



const Card = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
        ref: ref,
        className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_2__.cn)("rounded-lg border bg-card text-card-foreground shadow-sm", className),
        ...props
    });
});
Card.displayName = "Card";
const CardHeader = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
        ref: ref,
        className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_2__.cn)("flex flex-col space-y-1.5 p-6", className),
        ...props
    });
});
CardHeader.displayName = "CardHeader";
const CardTitle = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", {
        ref: ref,
        className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_2__.cn)("text-2xl font-semibold leading-none tracking-tight", className),
        ...props
    });
});
CardTitle.displayName = "CardTitle";
const CardDescription = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", {
        ref: ref,
        className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_2__.cn)("text-sm text-muted-foreground", className),
        ...props
    });
});
CardDescription.displayName = "CardDescription";
const CardContent = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
        ref: ref,
        className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_2__.cn)("p-6 pt-0", className),
        ...props
    });
});
CardContent.displayName = "CardContent";
const CardFooter = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
        ref: ref,
        className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_2__.cn)("flex items-center p-6 pt-0", className),
        ...props
    });
});
CardFooter.displayName = "CardFooter";



/***/ }),

/***/ 3204:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cn: function() { return /* binding */ cn; }
/* harmony export */ });
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(512);
/* harmony import */ var tailwind_merge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8388);


function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_0__/* .twMerge */ .m6)((0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .W)(inputs));
}


/***/ }),

/***/ 6775:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(module, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Component; }
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var _components_ui_card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7738);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7294);
/* harmony import */ var _components_ui_button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(802);
/* harmony import */ var _global_context__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(679);
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9466);
/* harmony import */ var o1js_pack__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(8455);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_global_context__WEBPACK_IMPORTED_MODULE_5__, o1js__WEBPACK_IMPORTED_MODULE_6__, o1js_pack__WEBPACK_IMPORTED_MODULE_7__]);
([_global_context__WEBPACK_IMPORTED_MODULE_5__, o1js__WEBPACK_IMPORTED_MODULE_6__, o1js_pack__WEBPACK_IMPORTED_MODULE_7__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);








class Gamestate extends (0,o1js_pack__WEBPACK_IMPORTED_MODULE_7__/* .PackedUInt32Factory */ .RP)() {
}
function Component() {
    const { globalState, setGlobalState } = (0,_global_context__WEBPACK_IMPORTED_MODULE_5__/* .useGlobalContext */ .bN)();
    // Corresponds directly to data pulled from packed 'gamestate'
    const [stack1, setStack1] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(0);
    const [stack2, setStack2] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(0);
    const [turn, setTurn] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)("");
    const [street, setStreet] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)("");
    const [lastAction, setLastAction] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)("");
    const [lastBetSize, setLastBetSize] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(0);
    const [gameOver, setGameOver] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)("false");
    const [pot, setPot] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(0);
    const [holeCards, setHoleCards] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([
        "",
        ""
    ]);
    const [boardCards, setBoardCards] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
    // We'll always use these board cards for now - pull them to 'boardCards'
    // based on street
    const boardCardsHardcoded = [
        "Kc",
        "Ac",
        "Qs",
        "8s",
        "6s"
    ];
    const [player, setPlayer] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)("notInGame");
    // We'll run this in a loop every 60 seconds to keep gamestate updated
    async function fetchData() {
        console.log("Fetching data...");
        const mina = window.mina;
        if (mina == null) {
            console.log("MINA IS NULL...");
            // This should never happen?  If we make it to this page we
            // should have joined a game...
            // setGlobalState({ ...globalState, hasWallet: false });
            return;
        }
        // Keep updating player account too
        const publicKeyBase58 = (await mina.requestAccounts())[0];
        console.log("index: publicKeyBase58", publicKeyBase58);
        const publicKey = o1js__WEBPACK_IMPORTED_MODULE_6__/* .PublicKey */ .nh.fromBase58(publicKeyBase58);
        console.log("Reloading zkApp state...");
        const zkappPublicKey = o1js__WEBPACK_IMPORTED_MODULE_6__/* .PublicKey */ .nh.fromBase58(globalState.zkappAddress);
        // Don't need to initialize again
        // await zkappWorkerClient.initZkappInstance(zkappPublicKey);
        await globalState.zkappWorkerClient.fetchAccount({
            publicKey: zkappPublicKey
        });
        // Want to repeatedly pull gamestate and players
        const player1Hash = await globalState.zkappWorkerClient.getPlayer1Hash();
        const player2Hash = await globalState.zkappWorkerClient.getPlayer2Hash();
        const gamestate = await globalState.zkappWorkerClient.getGamestate();
        setGlobalState({
            ...globalState,
            publicKey,
            gamestate,
            player1Hash,
            player2Hash
        });
    }
    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(()=>{
        const intervalId = setInterval(async ()=>{
            console.log("Logging every 30 seconds");
            await fetchData();
        }, 60000); // 60 seconds in milliseconds
        // Clean up the interval to prevent memory leaks
        return ()=>clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs only once on component mount
    const onSendTransaction = async (methodStr, actionStr)=>{
        setGlobalState({
            ...globalState,
            creatingTransaction: true
        });
        console.log("Creating a transaction...");
        await globalState.zkappWorkerClient.fetchAccount({
            publicKey: globalState.publicKey
        });
        // Needed for several of the transactions
        const senderB58 = globalState.publicKey.toBase58();
        switch(methodStr){
            case "takeAction":
                const actionMapping = {
                    // "Null": UInt32.from(0),
                    "Bet": 1,
                    "Call": 2,
                    "Fold": 3,
                    "Raise": 4,
                    "Check": 5
                };
                const action = actionMapping[actionStr];
                const betSize = betAmount;
                await globalState.zkappWorkerClient.createTakeActionTx(senderB58, action, betSize);
                break;
            case "showdown":
                await globalState.zkappWorkerClient.createShowdownTx();
                break;
            case "withdraw":
                await globalState.zkappWorkerClient.createWithdrawTx(senderB58);
                break;
            case "tallyBoardCards":
                const cardPrime52 = 0;
                await globalState.zkappWorkerClient.createTallyBoardCardsTx(cardPrime52);
                break;
            case "showCards":
                // Hardcoded values for now...
                // "Ah": 41,
                // "Ad": 101,
                // "Ks": 233,
                // "Ts": 223,
                // "Kc": 163,
                // "Ac": 167,
                // "Qs": 229,
                // "8s": 199,
                // "6s": 193,
                let holecard0;
                let holecard1;
                let useHolecard0;
                let useHolecard1;
                let useBoardcards0;
                let useBoardcards1;
                let useBoardcards2;
                let useBoardcards3;
                let useBoardcards4;
                let isFlush;
                let merkleMapKey;
                let merkleMapVal;
                if (player === "player1") {
                    holecard0 = 41;
                    holecard1 = 101;
                    useHolecard0 = true;
                    useHolecard1 = true;
                    useBoardcards0 = true;
                    useBoardcards1 = true;
                    useBoardcards2 = true;
                    useBoardcards3 = false;
                    useBoardcards4 = false;
                    isFlush = false;
                    merkleMapKey = 79052387;
                    merkleMapVal = 1609;
                } else if (player === "player2") {
                    holecard0 = 233;
                    holecard1 = 223;
                    useHolecard0 = true;
                    useHolecard1 = true;
                    useBoardcards0 = false;
                    useBoardcards1 = false;
                    useBoardcards2 = true;
                    useBoardcards3 = true;
                    useBoardcards4 = true;
                    isFlush = true;
                    merkleMapKey = 4933247;
                    merkleMapVal = 858;
                } else {
                    throw new Error("Not in game!");
                }
                const boardcard0 = 163;
                const boardcard1 = 167;
                const boardcard2 = 229;
                const boardcard3 = 199;
                const boardcard4 = 193;
                const shuffleKey = o1js__WEBPACK_IMPORTED_MODULE_6__/* .PrivateKey */ ._q.fromBigInt(BigInt(1)).toBase58();
                // Leaving these empty - we've disabled that check
                const isLefts = [];
                const siblings = [];
                const path = new o1js__WEBPACK_IMPORTED_MODULE_6__/* .MerkleMapWitness */ .FJ(isLefts, siblings);
                await globalState.zkappWorkerClient.createShowCardsTx(senderB58, holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4, isFlush, shuffleKey, merkleMapKey, merkleMapVal);
                break;
        }
        console.log("Creating proof...");
        await globalState.zkappWorkerClient.proveUpdateTransaction();
        console.log("Requesting send transaction...");
        const transactionJSON = await globalState.zkappWorkerClient.getTransactionJSON();
        console.log("Getting transaction JSON...");
        const { hash } = await window.mina.sendTransaction({
            transaction: transactionJSON,
            feePayer: {
                fee: globalState.transactionFee,
                memo: ""
            }
        });
        //const transactionLink = `https://berkeley.minaexplorer.com/transaction/${hash}`;
        const transactionLink = "minascan.io/berkeley/tx/".concat(hash);
        console.log("View transaction at ".concat(transactionLink));
        setGlobalState({
            ...globalState,
            creatingTransaction: false
        });
    };
    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(()=>{
        const publicKey = globalState.publicKey;
        const pHashJSON = o1js__WEBPACK_IMPORTED_MODULE_6__/* .Poseidon */ .jm.hash(publicKey.toFields()).toJSON();
        // Figure out which player we are...
        if (pHashJSON === globalState.player1Hash.toJSON()) {
            console.log("Matched player 1...");
            setPlayer("player1");
            // Hardcoding player's cards
            setHoleCards([
                "Ah",
                "Ad"
            ]);
        } else if (pHashJSON === globalState.player2Hash.toJSON()) {
            console.log("Matched player 2...");
            setPlayer("player2");
            setHoleCards([
                "Ks",
                "Ts"
            ]);
        } else {
            console.log("Not in game...");
            setPlayer("notInGame");
        }
    }, [
        globalState.player1Hash,
        globalState.player2Hash,
        globalState.publicKey
    ]);
    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(()=>{
        const unpacked = Gamestate.unpack(globalState.gamestate);
        const [stack1_, stack2_, turn_, street_, lastAction_, lastBetSizeGameOver, pot_] = unpacked;
        // Need to further unpack gameOver and lastBetSize
        const gameOverLastBetSize = lastBetSizeGameOver.toJSON();
        let lastBetSize_ = gameOverLastBetSize;
        let gameOver_ = false;
        if (gameOverLastBetSize >= 1000) {
            lastBetSize_ = lastBetSize_ - 1000;
            gameOver_ = true;
        }
        console.log("UNPACKED GAMESTATE", stack1_.toJSON(), stack2_.toJSON(), turn_.toJSON(), street_.toJSON(), lastAction_.toJSON(), lastBetSize_, gameOver_, pot_.toJSON());
        setStack1(stack1_.toJSON());
        setStack2(stack2_.toJSON());
        setTurn(turn_.toJSON());
        setLastBetSize(lastBetSize_);
        setGameOver(gameOver_.toString());
        setPot(pot_.toJSON());
        // Set board based on current street...
        // type Street = "ShowdownPending" | "Preflop" | "Flop" | "Turn" | "River" | "ShowdownComplete";
        const boardStr = street_.toJSON();
        const streetMap = {
            "1": "ShowdownPending",
            "2": "Preflop",
            "3": "Flop",
            "4": "Turn",
            "5": "River",
            "6": "ShowdownComplete"
        };
        const streetStr = streetMap[boardStr];
        setStreet(streetStr);
        const lastActionStr = lastAction_.toJSON();
        const actionMap = {
            "0": "Null",
            "1": "Bet",
            "2": "Call",
            "3": "Fold",
            "4": "Raise",
            "5": "Check",
            "6": "PreflopCall"
        };
        const actionStr = actionMap[lastActionStr];
        setLastAction(actionStr);
        // Street encoding
        // Preflop = UInt32.from(2);
        // Flop = UInt32.from(3);
        // Turn = UInt32.from(4);
        // River = UInt32.from(5);
        if (boardStr === "3") {
            const board = boardCardsHardcoded.slice(0, 3);
            setBoardCards(board);
        } else if (boardStr === "4") {
            const board = boardCardsHardcoded.slice(0, 4);
            setBoardCards(board);
        } else if (boardStr === "5") {
            setBoardCards(boardCardsHardcoded);
        } else {
            setBoardCards([]);
        }
    }, [
        globalState.gamestate
    ]);
    // stack, facing bet, action history,  board_cards, hole_cards, pot
    // This is our bet amount
    const [betAmount, setBetAmount] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(0);
    const actions = [
        {
            "action": "Call",
            "player": "player1"
        },
        {
            "action": "Bet",
            "player": "player2"
        },
        {
            "action": "Raise",
            "player": "player1"
        }
    ];
    const [actionHistory, setActionHistory] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(actions);
    const possibleActionsInit = [
        {
            "action": "Call",
            "needsAmount": true
        }
    ];
    const [possibleActions, setPossibleActions] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(possibleActionsInit);
    function getPossibleActions(facingAction) {
        const BET = {
            "action": "Bet",
            "needsAmount": true
        };
        const CHECK = {
            "action": "Check",
            "needsAmount": false
        };
        const CALL = {
            "action": "Call",
            "needsAmount": false
        };
        const FOLD = {
            "action": "Fold",
            "needsAmount": false
        };
        const RAISE = {
            "action": "Raise",
            "needsAmount": true
        };
        // Given game state we should specify the subset of actions that are available to the player
        if (facingAction === "Null" || facingAction === "Check") {
            return [
                BET,
                CHECK,
                FOLD
            ];
        } else if (facingAction === "Bet" || facingAction === "Raise" || facingAction === "Call") {
            return [
                CALL,
                FOLD,
                RAISE
            ];
        } else if (facingAction === "PreflopCall") {
            return [
                RAISE,
                CHECK
            ];
        } else {
            console.error("Unexpected facing action:", facingAction);
            return [];
        }
    }
    const handleAmountChange = (event)=>{
        const value = parseInt(event.target.value);
        setBetAmount(isNaN(value) ? 0 : value);
    };
    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(()=>{
        if (actionHistory.length == 0) {
            return;
        }
        console.log("ACTION HISTORY", actionHistory);
        const facingAction = actionHistory[actionHistory.length - 1]["action"];
        const possibleActions = getPossibleActions(facingAction);
        setPossibleActions(possibleActions);
    }, [
        actionHistory
    ]);
    // Think it's not possible to construct action list
    // based on visible state in contract?  We'd have to see all the state changes
    /*

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
                                                <li key={index} className="px-4 py-2 flex items-center space-x-2">
                                                    <span>{row.action}</span>
                                                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{row.player}</span>
                                                </li>)
                                        })}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
    */ return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "flex flex-col min-h-[100dvh]",
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("header", {
                className: "px-4 lg:px-6",
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                    className: "container flex items-center justify-center h-14 px-4 md:px-6",
                    children: [
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("nav", {
                            className: "hidden gap-4 lg:flex",
                            children: [
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {
                                    className: "text-sm font-medium hover:underline underline-offset-4",
                                    href: "join",
                                    children: "Join"
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {
                                    className: "text-sm font-medium hover:underline underline-offset-4",
                                    href: "playgame",
                                    children: "Gameplay"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                            className: "flex-1"
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {
                            className: "flex items-center justify-center text-sm font-medium",
                            href: "#",
                            children: "Home"
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("main", {
                className: "flex-1",
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                children: "Game Info"
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                children: [
                                    "Current Pot: $",
                                    pot
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "grid gap-4",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "grid grid-cols-2 gap-4",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                children: "Stack 1"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                                className: "ml-auto font-semibold",
                                                children: [
                                                    "$",
                                                    stack1
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                children: "Stack 2"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                                className: "ml-auto font-semibold",
                                                children: [
                                                    "$",
                                                    stack2
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                children: "Turn"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                                className: "ml-auto font-semibold",
                                                children: [
                                                    "player",
                                                    turn
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                children: "Street"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {
                                                className: "ml-auto font-semibold",
                                                children: street
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                children: "Facing Action"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {
                                                className: "ml-auto font-semibold",
                                                children: lastAction
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                children: "Facing Bet"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {
                                                className: "ml-auto font-semibold",
                                                children: lastBetSize
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                children: "Game Over?"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {
                                                className: "ml-auto font-semibold",
                                                children: gameOver
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                children: "You are player:"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {
                                                className: "ml-auto font-semibold",
                                                children: player
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .Card */ .Zb, {
                                    children: [
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .CardHeader */ .Ol, {
                                            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .CardTitle */ .ll, {
                                                children: "Board Cards"
                                            })
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .CardContent */ .aY, {
                                            className: "p-0 flex items-center justify-center space-x-4 h-24",
                                            children: boardCards.map((row, index)=>{
                                                return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {
                                                    children: row
                                                }, index);
                                            })
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .Card */ .Zb, {
                                    children: [
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .CardHeader */ .Ol, {
                                            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .CardTitle */ .ll, {
                                                children: "Hole Cards"
                                            })
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .CardContent */ .aY, {
                                            className: "p-0 flex items-center justify-center space-x-4 h-24",
                                            children: [
                                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {
                                                    children: holeCards[0]
                                                }),
                                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {
                                                    children: holeCards[1]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                children: possibleActions.map((action, index)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .z, {
                                                variant: "secondary",
                                                onClick: ()=>onSendTransaction("takeAction", action.action),
                                                disabled: globalState.creatingTransaction,
                                                children: action.action
                                            }),
                                            action.needsAmount && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", {
                                                type: "number",
                                                value: betAmount,
                                                onChange: handleAmountChange,
                                                min: 0
                                            })
                                        ]
                                    }, index))
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .Card */ .Zb, {
                                    children: [
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .CardHeader */ .Ol, {
                                            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .CardTitle */ .ll, {
                                                children: "Showdown"
                                            })
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_ui_card__WEBPACK_IMPORTED_MODULE_1__/* .CardContent */ .aY, {
                                            className: "p-0 flex items-center justify-center space-x-4 h-24",
                                            children: [
                                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .z, {
                                                    variant: "secondary",
                                                    onClick: ()=>onSendTransaction("showCards", ""),
                                                    disabled: globalState.creatingTransaction,
                                                    children: "Show Cards"
                                                }),
                                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .z, {
                                                    variant: "secondary",
                                                    onClick: ()=>onSendTransaction("showdown", ""),
                                                    disabled: globalState.creatingTransaction,
                                                    children: "Showdown"
                                                }),
                                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .z, {
                                                    variant: "secondary",
                                                    onClick: ()=>onSendTransaction("withdraw", ""),
                                                    disabled: globalState.creatingTransaction,
                                                    children: "Withdraw"
                                                })
                                            ]
                                        })
                                    ]
                                })
                            })
                        ]
                    })
                ]
            })
        ]
    });
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 8455:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RP: function() { return /* reexport safe */ _lib_packed_types_PackedUInt32_js__WEBPACK_IMPORTED_MODULE_1__.R; }
/* harmony export */ });
/* harmony import */ var _lib_packed_types_PackedBool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9137);
/* harmony import */ var _lib_packed_types_PackedUInt32_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8012);
/* harmony import */ var _lib_PackingPlant_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5682);
/* harmony import */ var _lib_packed_types_PackedString_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7706);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_packed_types_PackedBool_js__WEBPACK_IMPORTED_MODULE_0__, _lib_packed_types_PackedUInt32_js__WEBPACK_IMPORTED_MODULE_1__, _lib_PackingPlant_js__WEBPACK_IMPORTED_MODULE_2__, _lib_packed_types_PackedString_js__WEBPACK_IMPORTED_MODULE_3__]);
([_lib_packed_types_PackedBool_js__WEBPACK_IMPORTED_MODULE_0__, _lib_packed_types_PackedUInt32_js__WEBPACK_IMPORTED_MODULE_1__, _lib_PackingPlant_js__WEBPACK_IMPORTED_MODULE_2__, _lib_packed_types_PackedString_js__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);





//# sourceMappingURL=index.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 5682:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   l: function() { return /* binding */ PackingPlant; }
/* harmony export */ });
/* unused harmony export MultiPackingPlant */
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__]);
o1js__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

const MAX_BITS_PER_FIELD = 254n;
function PackingPlant(elementType, l, bitSize) {
    if (bitSize * BigInt(l) > MAX_BITS_PER_FIELD) {
        throw new Error(`The Packing Plant is only accepting orders that can fit into one Field, try using MultiPackingPlant`);
    }
    class Packed_ extends (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Struct */ .AU)({
        packed: o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN,
    }) {
        constructor(packed) {
            super({ packed });
        }
        // Must implement these in type-specific implementation
        static extractField(input) {
            throw new Error('Must implement extractField');
        }
        static sizeInBits() {
            throw new Error('Must implement sizeInBits');
        }
        static unpack(f) {
            throw new Error('Must implement unpack');
        }
        // End
        /**
         *
         * @param unpacked Array of the implemented packed type
         * @throws if the length of the array is longer than the length of the implementing factory config
         */
        static checkPack(unpacked) {
            if (unpacked.length > l) {
                throw new Error(`Input of size ${unpacked.length} is larger than expected size of ${l}`);
            }
        }
        /**
         *
         * @param unpacked Array of the implemented packed type, must be shorter than the max allowed, which varies by type, will throw if the input is too long
         * @returns Field, packed with the information from the unpacked input
         */
        static pack(unpacked) {
            this.checkPack(unpacked);
            let f = this.extractField(unpacked[0]);
            const n = Math.min(unpacked.length, l);
            for (let i = 1; i < n; i++) {
                const c = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)((2n ** this.sizeInBits()) ** BigInt(i));
                f = f.add(this.extractField(unpacked[i]).mul(c));
            }
            return f;
        }
        /**
         *
         * @param f Field, packed with the information, as returned by #pack
         * @returns Array of bigints, which can be decoded by the implementing class into the final type
         */
        static unpackToBigints(f) {
            let unpacked = new Array(l);
            unpacked.fill(0n);
            let packedN;
            if (f) {
                packedN = f.toBigInt();
            }
            else {
                throw new Error('No Packed Value Provided');
            }
            for (let i = 0; i < l; i++) {
                unpacked[i] = packedN & ((1n << this.sizeInBits()) - 1n);
                packedN >>= this.sizeInBits();
            }
            return unpacked;
        }
        // NOTE: adding to fields here breaks the proof generation.  Probably not overriding it correctly
        /**
         * @returns array of single Field element which constitute the packed object
         */
        toFields() {
            return [this.packed];
        }
        assertEquals(other) {
            this.packed.assertEquals(other.packed);
        }
    }
    Packed_.type = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .provable */ .MZ)({ packed: o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN }, {});
    Packed_.l = l;
    Packed_.bitSize = bitSize;
    return Packed_;
}
function MultiPackingPlant(elementType, l, bitSize) {
    if (bitSize * BigInt(l) > 8n * MAX_BITS_PER_FIELD) {
        throw new Error(`The Packing Plant is only accepting orders that can fit into eight Fields`);
    }
    const n = Math.ceil(Number(bitSize * BigInt(l)) / Number(255n));
    class Packed_ extends Struct({
        packed: Provable.Array(Field, n),
    }) {
        constructor(packed) {
            super({ packed });
        }
        // Must implement these in type-specific implementation
        static extractField(input) {
            throw new Error('Must implement extractField');
        }
        static sizeInBits() {
            throw new Error('Must implement sizeInBits');
        }
        static elementsPerField() {
            throw new Error('Must implement elementsPerField');
        }
        static unpack(fields) {
            throw new Error('Must implement unpack');
        }
        // End
        /**
         *
         * @param unpacked Array of the implemented packed type
         * @throws if the length of the array is longer than the length of the implementing factory config
         */
        static checkPack(unpacked) {
            if (unpacked.length > this.l) {
                throw new Error(`Input of size ${unpacked.length} is larger than expected size of ${l}`);
            }
        }
        /**
         *
         * @param unpacked Array of the implemented packed type, must be shorter than the max allowed, which varies by type, will throw if the input is too long
         * @returns Array of Fields, packed such that each Field has as much information as possible
         *
         * e.g. 15 Characters pack into 1 Field.  15 or fewer Characters will return an array of 1 Field
         *      30 of fewer Characters will return an aray of 2 Fields
         */
        static pack(unpacked) {
            this.checkPack(unpacked);
            const q = this.elementsPerField();
            let fields = [];
            let mutableUnpacked = [...unpacked];
            for (let i = 0; i < this.n; i++) {
                let f = this.extractField(mutableUnpacked[i * q]);
                if (!f) {
                    throw new Error('Unexpected Array Length');
                }
                for (let j = 1; j < q; j++) {
                    const idx = i * q + j;
                    let value = this.extractField(mutableUnpacked[idx]);
                    if (!value) {
                        throw new Error('Unexpected Array Length');
                    }
                    value = value || Field(0);
                    const c = Field((2n ** this.sizeInBits()) ** BigInt(j));
                    f = f.add(value.mul(c));
                }
                fields.push(f);
            }
            return fields;
        }
        /**
         *
         * @param fields Array of Fields, packed such that each Field has as much information as possible, as returned in #pack
         * @returns Array of bigints, which can be decoded by the implementing class into the final type
         */
        static unpackToBigints(fields) {
            let uints_ = new Array(this.l); // array length is number of elements per field * number of fields
            uints_.fill(0n);
            let packedNs = new Array(this.n);
            packedNs.fill(0n);
            const packedArg = new Array(this.n);
            packedArg.fill(Field(0), 0, this.n);
            for (let i = 0; i < this.n; i++) {
                if (fields[i]) {
                    packedArg[i] = fields[i];
                }
            }
            if (packedArg.length !== this.n) {
                throw new Error(`Packed value must be exactly ${this.n} in length`);
            }
            for (let i = 0; i < this.n; i++) {
                packedNs[i] = packedArg[i].toConstant().toBigInt();
            }
            for (let i = 0; i < packedNs.length; i++) {
                let packedN = packedNs[i];
                for (let j = 0; j < this.elementsPerField(); j++) {
                    const k = i * this.elementsPerField() + j;
                    uints_[k] = packedN & ((1n << this.sizeInBits()) - 1n);
                    packedN >>= this.sizeInBits();
                }
            }
            return uints_;
        }
        // NOTE: adding to fields here breaks the proof generation.  Probably not overriding it correctly
        /**
         * @returns array of Field elements which constitute the multi-packed object
         */
        toFields() {
            return this.packed;
        }
        assertEquals(other) {
            for (let x = 0; x < n; x++) {
                this.packed[x].assertEquals(other.packed[x]);
            }
        }
    }
    Packed_.type = provable({ packed: Provable.Array(Field, n) }, {});
    Packed_.l = l;
    Packed_.n = n;
    Packed_.bitSize = bitSize;
    return Packed_;
}
//# sourceMappingURL=PackingPlant.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 9137:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* unused harmony export PackedBoolFactory */
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
/* harmony import */ var _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5682);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__]);
([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);


const L = 254; // 254 1-bit booleans fit in one Field
const SIZE_IN_BITS = 1n;
function PackedBoolFactory(l = L) {
    class PackedBool_ extends PackingPlant(Bool, l, SIZE_IN_BITS) {
        static extractField(input) {
            return input.toField();
        }
        static sizeInBits() {
            return SIZE_IN_BITS;
        }
        /**
         *
         * @param f Field, packed with the information, as returned by #pack
         * @returns Array of Bool
         */
        static unpack(f) {
            const unpacked = Provable.witness(Provable.Array(Bool, l), () => {
                const unpacked = this.unpackToBigints(f);
                return unpacked.map((x) => Bool.fromJSON(Boolean(x)));
            });
            f.assertEquals(PackedBool_.pack(unpacked));
            return unpacked;
        }
        /**
         *
         * @param bools Array of Bools to be packed
         * @returns Instance of the implementing class
         */
        static fromBools(bools) {
            const packed = PackedBool_.pack(bools);
            return new PackedBool_(packed);
        }
        /**
         *
         * @param booleans Array of booleans to be packed
         * @returns Instance of the implementing class
         */
        static fromBooleans(booleans) {
            const bools = booleans.map((x) => Bool(x));
            return PackedBool_.fromBools(bools);
        }
        toBooleans() {
            return PackedBool_.unpack(this.packed).map((x) => x.toBoolean());
        }
    }
    return PackedBool_;
}
//# sourceMappingURL=PackedBool.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 7706:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* unused harmony exports PackedStringFactory, MultiPackedStringFactory */
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
/* harmony import */ var _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5682);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__]);
([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);


const SIZE_IN_BITS = 8n;
const L = 31; // Default to one-field worth of characters
const CHARS_PER_FIELD = 31;
function PackedStringFactory(l = L) {
    class PackedString_ extends PackingPlant(Character, l, SIZE_IN_BITS) {
        static extractField(input) {
            return input.value;
        }
        static sizeInBits() {
            return SIZE_IN_BITS;
        }
        /**
         *
         * @param f Field, packed with the information, as returned by #pack
         * @returns Array of Character
         */
        static unpack(f) {
            const unpacked = Provable.witness(Provable.Array(Character, l), () => {
                const unpacked = this.unpackToBigints(f);
                return unpacked.map((x) => Character.fromString(String.fromCharCode(Number(x))));
            });
            f.assertEquals(PackedString_.pack(unpacked));
            return unpacked;
        }
        /**
         *
         * @param characters Array of Character to be packed
         * @returns Instance of the implementing class
         */
        static fromCharacters(input) {
            let characters = new Array(this.l);
            characters.fill(new Character(Field(0)), 0, this.l);
            for (let i = 0; i < input.length; i++) {
                characters[i] = input[i];
            }
            const packed = this.pack(characters);
            return new PackedString_(packed);
        }
        /**
         *
         * @param str string to be packed
         * @returns Instance of the implementing class
         */
        static fromString(str) {
            let characters = new Array(this.l);
            characters.fill(new Character(Field(0)), 0, this.l);
            for (let i = 0; i < str.length; i++) {
                characters[i] = Character.fromString(str[i]);
            }
            return this.fromCharacters(characters);
        }
        toString() {
            const nullChar = String.fromCharCode(0);
            return PackedString_.unpack(this.packed)
                .filter((c) => c.toString() !== nullChar)
                .join('');
        }
    }
    return PackedString_;
}
/**
 *
 * @param n number of fields to employ to store the string
 * @returns MultiPackedString_ class with length of n * CHARS_PER_FIELD
 */
function MultiPackedStringFactory(n = 8) {
    class MultiPackedString_ extends MultiPackingPlant(Character, n * CHARS_PER_FIELD, SIZE_IN_BITS) {
        static extractField(input) {
            return input.value;
        }
        static sizeInBits() {
            return SIZE_IN_BITS;
        }
        static elementsPerField() {
            return CHARS_PER_FIELD;
        }
        /**
         *
         * @param fields Array of Fields, containing packed Characters
         * @returns Array of Character
         */
        static unpack(fields) {
            const unpacked = Provable.witness(Provable.Array(Character, this.l), () => {
                let unpacked = this.unpackToBigints(fields);
                return unpacked.map((x) => Character.fromString(String.fromCharCode(Number(x))));
            });
            Poseidon.hash(fields).assertEquals(Poseidon.hash(MultiPackedString_.pack(unpacked)));
            return unpacked;
        }
        /**
         *
         * @param characters Array of Character to be packed
         * @returns Instance of the implementing class
         */
        static fromCharacters(input) {
            let characters = new Array(this.l);
            characters.fill(new Character(Field(0)), 0, this.l);
            for (let i = 0; i < input.length; i++) {
                characters[i] = input[i];
            }
            const packed = this.pack(characters);
            return new MultiPackedString_(packed);
        }
        /**
         *
         * @param str string to be packed
         * @returns Instance of the implementing class
         */
        static fromString(str) {
            let characters = new Array(this.l);
            characters.fill(new Character(Field(0)), 0, this.l);
            for (let i = 0; i < str.length; i++) {
                characters[i] = Character.fromString(str[i]);
            }
            return this.fromCharacters(characters);
        }
        toString() {
            const nullChar = String.fromCharCode(0);
            return MultiPackedString_.unpack(this.packed)
                .filter((c) => c.toString() !== nullChar)
                .join('');
        }
    }
    return MultiPackedString_;
}
//# sourceMappingURL=PackedString.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 8012:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   R: function() { return /* binding */ PackedUInt32Factory; }
/* harmony export */ });
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
/* harmony import */ var _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5682);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__]);
([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);


const L = 7; // 7 32-bit uints fit in one Field
const SIZE_IN_BITS = 32n;
function PackedUInt32Factory(l = L) {
    class PackedUInt32_ extends (0,_PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__/* .PackingPlant */ .l)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH, l, SIZE_IN_BITS) {
        static extractField(input) {
            return input.value;
        }
        static sizeInBits() {
            return SIZE_IN_BITS;
        }
        /**
         *
         * @param f Field, packed with the information, as returned by #pack
         * @returns Array of UInt32
         */
        static unpack(f) {
            const unpacked = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.witness(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.Array(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH, l), () => {
                const unpacked = this.unpackToBigints(f);
                return unpacked.map((x) => o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(x));
            });
            f.assertEquals(PackedUInt32_.pack(unpacked));
            return unpacked;
        }
        /**
         *
         * @param uint32s Array of UInt32s to be packed
         * @returns Instance of the implementing class
         */
        static fromUInt32s(uint32s) {
            const packed = PackedUInt32_.pack(uint32s);
            return new PackedUInt32_(packed);
        }
        /**
         *
         * @param bigints Array of bigints to be packed
         * @returns Instance of the implementing class
         */
        static fromBigInts(bigints) {
            const uint32s = bigints.map((x) => o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(x));
            return PackedUInt32_.fromUInt32s(uint32s);
        }
        toBigInts() {
            return PackedUInt32_.unpack(this.packed).map((x) => x.toBigint());
        }
    }
    return PackedUInt32_;
}
//# sourceMappingURL=PackedUInt32.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, [534,664,774,888,179], function() { return __webpack_exec__(2201); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ _N_E = __webpack_exports__;
/******/ }
]);