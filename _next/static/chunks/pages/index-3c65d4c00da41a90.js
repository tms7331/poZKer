(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[405],{

/***/ 9208:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


    (window.__NEXT_P = window.__NEXT_P || []).push([
      "/",
      function () {
        return __webpack_require__(2052);
      }
    ]);
    if(false) {}
  

/***/ }),

/***/ 2052:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(module, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Component; }
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7294);
/* harmony import */ var _global_context__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(679);
/* harmony import */ var _zkappWorkerClient__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9619);
/* harmony import */ var _reactCOIServiceWorker__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3530);
/* harmony import */ var _reactCOIServiceWorker__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_reactCOIServiceWorker__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9466);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_global_context__WEBPACK_IMPORTED_MODULE_3__, _zkappWorkerClient__WEBPACK_IMPORTED_MODULE_4__, o1js__WEBPACK_IMPORTED_MODULE_6__]);
([_global_context__WEBPACK_IMPORTED_MODULE_3__, _zkappWorkerClient__WEBPACK_IMPORTED_MODULE_4__, o1js__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);







function Component() {
    const { globalState, setGlobalState } = (0,_global_context__WEBPACK_IMPORTED_MODULE_3__/* .useGlobalContext */ .bN)();
    // For setting a specific value
    const [inputValue, setInputValue] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)("");
    const [displayText, setDisplayText] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)("");
    const [transactionlink, setTransactionLink] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)("");
    const [setupComplete, setSetupComplete] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
    (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(()=>{
        async function timeout(seconds) {
            return new Promise((resolve)=>{
                setTimeout(()=>{
                    resolve();
                }, seconds * 1000);
            });
        }
        (async ()=>{
            if (!globalState.hasBeenSetup) {
                setDisplayText("Loading web worker...");
                console.log("Loading web worker...");
                const zkappWorkerClient = new _zkappWorkerClient__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z();
                await timeout(5);
                setDisplayText("Done loading web worker");
                console.log("Done loading web worker");
                await zkappWorkerClient.setActiveInstanceToBerkeley();
                const mina = window.mina;
                if (mina == null) {
                    setGlobalState({
                        ...globalState,
                        hasWallet: false
                    });
                    return;
                }
                const publicKeyBase58 = (await mina.requestAccounts())[0];
                console.log("index: publicKeyBase58", publicKeyBase58);
                const publicKey = o1js__WEBPACK_IMPORTED_MODULE_6__/* .PublicKey */ .nh.fromBase58(publicKeyBase58);
                console.log("Using key:".concat(publicKey.toBase58()));
                setDisplayText("Using key:".concat(publicKey.toBase58()));
                setDisplayText("Checking if fee payer account exists...");
                console.log("Checking if fee payer account exists...");
                const res = await zkappWorkerClient.fetchAccount({
                    publicKey: publicKey
                });
                console.log("Res was...", res);
                const accountExists = res.error == null;
                await zkappWorkerClient.loadContract();
                // Already deployed contract address, use that instead
                console.log("Compiling zkApp...");
                setDisplayText("Compiling zkApp...");
                await zkappWorkerClient.compileContract();
                console.log("zkApp compiled");
                setDisplayText("zkApp compiled...");
                const zkappPublicKey = o1js__WEBPACK_IMPORTED_MODULE_6__/* .PublicKey */ .nh.fromBase58(globalState.zkappAddress);
                await zkappWorkerClient.initZkappInstance(zkappPublicKey);
                console.log("Getting zkApp state...");
                setDisplayText("Getting zkApp state...");
                await zkappWorkerClient.fetchAccount({
                    publicKey: zkappPublicKey
                });
                const currentNum = await zkappWorkerClient.getNum();
                const player1Hash = await zkappWorkerClient.getPlayer1Hash();
                const player2Hash = await zkappWorkerClient.getPlayer2Hash();
                const gamestate = await zkappWorkerClient.getGamestate();
                console.log("Current state in zkApp: ".concat(currentNum.toString()));
                setDisplayText("");
                setGlobalState({
                    ...globalState,
                    zkappWorkerClient,
                    hasWallet: true,
                    hasBeenSetup: true,
                    publicKey,
                    zkappPublicKey,
                    accountExists,
                    currentNum,
                    gamestate,
                    player1Hash,
                    player2Hash
                });
            }
        })();
    }, []);
    // -------------------------------------------------------
    // Wait for account to exist, if it didn't
    (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(()=>{
        (async ()=>{
            if (globalState.hasBeenSetup && !globalState.accountExists) {
                for(;;){
                    setDisplayText("Checking if fee payer account exists...");
                    console.log("Checking if fee payer account exists...");
                    const res = await globalState.zkappWorkerClient.fetchAccount({
                        publicKey: globalState.publicKey
                    });
                    const accountExists = res.error == null;
                    if (accountExists) {
                        break;
                    }
                    await new Promise((resolve)=>setTimeout(resolve, 5000));
                }
                setGlobalState({
                    ...globalState,
                    accountExists: true
                });
            }
        })();
    }, [
        globalState.hasBeenSetup
    ]);
    // -------------------------------------------------------
    // Create UI elements
    let hasWallet;
    if (globalState.hasWallet != null && !globalState.hasWallet) {
        const auroLink = "https://www.aurowallet.com/";
        const auroLinkElem = /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("a", {
            href: auroLink,
            target: "_blank",
            rel: "noreferrer",
            children: "Install Auro wallet here"
        });
        hasWallet = /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
            children: [
                "Could not find a wallet. ",
                auroLinkElem
            ]
        });
    }
    const stepDisplay = transactionlink ? /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("a", {
        href: displayText,
        target: "_blank",
        rel: "noreferrer",
        children: "View transaction"
    }) : displayText;
    let setup = /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        style: {
            fontWeight: "bold",
            fontSize: "1.5rem",
            paddingBottom: "5rem"
        },
        children: [
            stepDisplay,
            hasWallet
        ]
    });
    let accountDoesNotExist;
    if (globalState.hasBeenSetup && !globalState.accountExists) {
        const faucetLink = "https://faucet.minaprotocol.com/?address=" + globalState.publicKey.toBase58();
        accountDoesNotExist = /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
            children: [
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {
                    style: {
                        paddingRight: "1rem"
                    },
                    children: "Account does not exist."
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("a", {
                    href: faucetLink,
                    target: "_blank",
                    rel: "noreferrer",
                    children: "Visit the faucet to fund this fee payer account"
                })
            ]
        });
    }
    let loadingContent = /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", {
        children: "Loading contracts, please wait for contracts to load!"
    });
    let mainContent;
    if (globalState.hasBeenSetup && globalState.accountExists) {
        loadingContent = /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h1", {});
        mainContent = /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
            style: {
                justifyContent: "center",
                alignItems: "center"
            },
            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                style: {
                    padding: 0
                },
                children: [
                    "zkApp loaded! player1hash: ",
                    globalState.player1Hash.toString(),
                    " ",
                    "player2hash: ",
                    globalState.player2Hash.toString(),
                    " ",
                    "gamestate: ",
                    globalState.gamestate.toString(),
                    " "
                ]
            })
        });
    }
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
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                                    className: "text-sm font-medium hover:underline underline-offset-4",
                                    href: "join",
                                    children: "Join"
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                                    className: "text-sm font-medium hover:underline underline-offset-4",
                                    href: "playgame",
                                    children: "Gameplay"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                            className: "flex-1"
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
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
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("section", {
                        className: "w-full py-12 md:py-24 lg:py-32",
                        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            className: "container flex flex-col items-center justify-center space-y-4 text-center px-4 md:px-6",
                            children: [
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h1", {
                                            className: "text-3xl font-bold tracking-tighter sm:text-5xl",
                                            children: "Welcome to poZKer"
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", {
                                            className: "max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400",
                                            children: "Play decentralized Poker on Mina"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                    className: "flex flex-col gap-2 min-[400px]:flex-row",
                                    children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                        style: {
                                            padding: 0
                                        },
                                        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                            style: {
                                                padding: 0
                                            },
                                            children: [
                                                loadingContent,
                                                setup,
                                                accountDoesNotExist,
                                                mainContent
                                            ]
                                        })
                                    })
                                })
                            ]
                        })
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("section", {
                        className: "w-full py-12 md:py-24 lg:py-32 border-t",
                        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                            className: "container flex items-center justify-center gap-4 px-4 text-center md:px-6",
                            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                className: "space-y-3",
                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", {
                                    className: "text-3xl font-bold tracking-tighter md:text-4xl/tight",
                                    children: "Learn more about decentralized poker on Mina"
                                })
                            })
                        })
                    })
                ]
            })
        ]
    });
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 9619:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(module, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: function() { return /* binding */ ZkappWorkerClient; }
/* harmony export */ });
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__]);
o1js__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

var ZkappWorkerClient;
ZkappWorkerClient = class ZkappWorkerClient {
    // ---------------------------------------------------------------------------------------
    setActiveInstanceToBerkeley() {
        return this._call("setActiveInstanceToBerkeley", {});
    }
    loadContract() {
        return this._call("loadContract", {});
    }
    compileContract() {
        return this._call("compileContract", {});
    }
    fetchAccount(param) {
        let { publicKey } = param;
        const result = this._call("fetchAccount", {
            publicKey58: publicKey.toBase58()
        });
        return result;
    }
    initZkappInstance(publicKey) {
        return this._call("initZkappInstance", {
            publicKey58: publicKey.toBase58()
        });
    }
    async getNum() {
        const result = await this._call("getNum", {});
        return o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN.fromJSON(JSON.parse(result));
    }
    async getPlayer1Hash() {
        const result = await this._call("getPlayer1Hash", {});
        return o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN.fromJSON(JSON.parse(result));
    }
    async getPlayer2Hash() {
        const result = await this._call("getPlayer2Hash", {});
        return o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN.fromJSON(JSON.parse(result));
    }
    async getGamestate() {
        const result = await this._call("getGamestate", {});
        return o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN.fromJSON(JSON.parse(result));
    }
    createUpdateTransaction() {
        return this._call("createUpdateTransaction", {});
    }
    createSetTempvarTx(num) {
        return this._call("createSetTempvarTx", {
            num: num
        });
    }
    createJoinGameTx(player) {
        const playerStr = player.toBase58();
        return this._call("createJoinGameTx", {
            publicKey58: playerStr
        });
    }
    createWithdrawTx(senderB58) {
        return this._call("createWithdrawTx", {
            senderB58
        });
    }
    createDepositTx(senderB58) {
        return this._call("createDepositTx", {
            senderB58
        });
    }
    createTakeActionTx(senderB58, action, betSize) {
        return this._call("createTakeActionTx", {
            senderB58: senderB58,
            action: action,
            betSize: betSize
        });
    }
    createShowdownTx() {
        return this._call("createShowdownTx", {});
    }
    createPlayerTimeoutTx() {
        return this._call("createPlayerTimeoutTx", {});
    }
    createTallyBoardCardsTx(cardPrime52) {
        return this._call("createTallyBoardCardsTx", {
            cardPrime52: cardPrime52
        });
    }
    createStoreCardHashTx(slotI, shuffleSecretB58, epk1B58, epk2B58) {
        return this._call("createStoreCardHashTx", {
            slotI: slotI,
            shuffleSecretB58: shuffleSecretB58,
            epk1B58: epk1B58,
            epk2B58: epk2B58
        });
    }
    createCommitCardTx(slotI, msg) {
        return this._call("createCommitCardTx", {
            slotI: slotI,
            msg: msg
        });
    }
    createShowCardsTx(senderB58, holecard0n, holecard1n, boardcard0n, boardcard1n, boardcard2n, boardcard3n, boardcard4n, useHolecard0b, useHolecard1b, useBoardcards0b, useBoardcards1b, useBoardcards2b, useBoardcards3b, useBoardcards4b, isFlushb, shuffleKeyB58, merkleMapKey, merkleMapVal) {
        return this._call("createShowCardsTx", {
            senderB58: senderB58,
            holecard0n: holecard0n,
            holecard1n: holecard1n,
            boardcard0n: boardcard0n,
            boardcard1n: boardcard1n,
            boardcard2n: boardcard2n,
            boardcard3n: boardcard3n,
            boardcard4n: boardcard4n,
            useHolecard0b: useHolecard0b,
            useHolecard1b: useHolecard1b,
            useBoardcards0b: useBoardcards0b,
            useBoardcards1b: useBoardcards1b,
            useBoardcards2b: useBoardcards2b,
            useBoardcards3b: useBoardcards3b,
            useBoardcards4b: useBoardcards4b,
            isFlushb: isFlushb,
            shuffleKeyB58: shuffleKeyB58,
            merkleMapKey: merkleMapKey,
            merkleMapVal: merkleMapVal
        });
    }
    proveUpdateTransaction() {
        return this._call("proveUpdateTransaction", {});
    }
    async getTransactionJSON() {
        const result = await this._call("getTransactionJSON", {});
        return result;
    }
    _call(fn, args) {
        return new Promise((resolve, reject)=>{
            this.promises[this.nextId] = {
                resolve,
                reject
            };
            const message = {
                id: this.nextId,
                fn,
                args
            };
            this.worker.postMessage(message);
            this.nextId++;
        });
    }
    constructor(){
        this.worker = new Worker(__webpack_require__.tu(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(504), __webpack_require__.b)));
        this.promises = {};
        this.nextId = 0;
        this.worker.onmessage = (event)=>{
            this.promises[event.data.id].resolve(event.data.data);
            delete this.promises[event.data.id];
        };
    }
};


__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, [664,774,888,179], function() { return __webpack_exec__(9208); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ _N_E = __webpack_exports__;
/******/ }
]);