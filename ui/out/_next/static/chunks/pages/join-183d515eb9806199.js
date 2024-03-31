(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[233],{

/***/ 4521:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


    (window.__NEXT_P = window.__NEXT_P || []).push([
      "/join",
      function () {
        return __webpack_require__(2810);
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

/***/ 2810:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(module, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Component; }
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7294);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _components_ui_button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(802);
/* harmony import */ var _global_context__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(679);
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9466);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_global_context__WEBPACK_IMPORTED_MODULE_4__, o1js__WEBPACK_IMPORTED_MODULE_5__]);
([_global_context__WEBPACK_IMPORTED_MODULE_4__, o1js__WEBPACK_IMPORTED_MODULE_5__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);






function Component() {
    const { globalState, setGlobalState } = (0,_global_context__WEBPACK_IMPORTED_MODULE_4__/* .useGlobalContext */ .bN)();
    const [numPlayers, setNumPlayers] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(0);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        const player1HashS = globalState.player1Hash.toJSON();
        const player2HashS = globalState.player2Hash.toJSON();
        console.log("Player hashes...");
        console.log(player1HashS);
        console.log(player2HashS);
        // Hashes will be overwritten when we have players, so track it here
        if (player1HashS === "0") {
            setNumPlayers(0);
        } else if (player2HashS === "0") {
            setNumPlayers(1);
        } else {
            setNumPlayers(2);
        }
    }, [
        globalState.player1Hash,
        globalState.player2Hash
    ]);
    // We'll run this in a loop every 60 seconds to keep gamestate updated
    async function fetchData() {
        const mina = window.mina;
        if (mina == null) {
            console.log("Could not find mina...");
            return;
        }
        // Keep updating player account too
        const publicKeyBase58 = (await mina.requestAccounts())[0];
        console.log("index: publicKeyBase58", publicKeyBase58);
        const publicKey = o1js__WEBPACK_IMPORTED_MODULE_5__/* .PublicKey */ .nh.fromBase58(publicKeyBase58);
        console.log("Reloading zkApp state...");
        const zkappPublicKey = o1js__WEBPACK_IMPORTED_MODULE_5__/* .PublicKey */ .nh.fromBase58(globalState.zkappAddress);
        // Don't need to initialize again
        // await zkappWorkerClient.initZkappInstance(zkappPublicKey);
        await globalState.zkappWorkerClient.fetchAccount({
            publicKey: zkappPublicKey
        });
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
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        const intervalId = setInterval(async ()=>{
            await fetchData();
        }, 60000); // 60 seconds in milliseconds
        // Clean up the interval to prevent memory leaks
        return ()=>clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs only once on component mount
    const onSendTransaction = async (methodStr)=>{
        setGlobalState({
            ...globalState,
            creatingTransaction: true
        });
        console.log("Creating a transaction...");
        const res = await globalState.zkappWorkerClient.fetchAccount({
            publicKey: globalState.publicKey
        });
        console.log("Res was...", res);
        const accountExists = res.error == null;
        console.log("Account exists?", accountExists);
        console.log("Creating transaction from...", methodStr);
        switch(methodStr){
            case "joinGame":
                const player = globalState.publicKey;
                console.log("JOINING WITH PLAYER", player.toBase58());
                await globalState.zkappWorkerClient.createJoinGameTx(player);
                break;
            case "deposit":
                const senderB58 = globalState.publicKey.toBase58();
                await globalState.zkappWorkerClient.createDepositTx(senderB58);
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
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
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
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("main", {
                className: "flex-1",
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                    className: "container px-4 md:px-6",
                    children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "grid gap-4",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                className: "grid grid-cols-[1fr_200px] items-center",
                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", {
                                    className: "text-2xl font-bold",
                                    children: "Available Games"
                                })
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "border border-gray-200 rounded-lg divide-y divide-gray-200 dark:border-gray-800 dark:divide-gray-800",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center justify-between p-4",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                className: "text-sm font-medium text-gray-500 dark:text-gray-400",
                                                children: "Game ID"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                className: "text-sm font-medium",
                                                children: "Players"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                className: "text-sm font-medium",
                                                children: "Join"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                className: "text-sm font-medium",
                                                children: "Deposit"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center justify-between p-4",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                className: "text-sm font-medium",
                                                children: "Game01"
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "text-sm font-medium",
                                                children: [
                                                    numPlayers,
                                                    " / 2"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                className: "text-sm font-medium",
                                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .z, {
                                                    variant: "secondary",
                                                    onClick: ()=>onSendTransaction("joinGame"),
                                                    disabled: globalState.creatingTransaction,
                                                    children: "Join Game"
                                                })
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                                className: "text-sm font-medium",
                                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .z, {
                                                    variant: "secondary",
                                                    onClick: ()=>onSendTransaction("deposit"),
                                                    disabled: globalState.creatingTransaction,
                                                    children: "Deposit"
                                                })
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                })
            })
        ]
    });
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, [534,664,774,888,179], function() { return __webpack_exec__(4521); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ _N_E = __webpack_exports__;
/******/ }
]);