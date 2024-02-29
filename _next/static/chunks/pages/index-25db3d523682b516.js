(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[405],{

/***/ 3454:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var _global_process, _global_process1;
module.exports = ((_global_process = __webpack_require__.g.process) == null ? void 0 : _global_process.env) && typeof ((_global_process1 = __webpack_require__.g.process) == null ? void 0 : _global_process1.env) === "object" ? __webpack_require__.g.process : __webpack_require__(7663);

//# sourceMappingURL=process.js.map

/***/ }),

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

/***/ 8122:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: function() { return /* binding */ GradientBG; }
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var _styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1110);
/* harmony import */ var _styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7294);
// @ts-nocheck



function GradientBG(param) {
    let { children } = param;
    const canvasRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    const [context, setContext] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [pixels, setPixels] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    function Color(h, s, l, a) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
        this.dir = Math.random() > 0.5 ? -1 : 1;
        this.toString = function() {
            return "hsla(" + this.h + ", " + this.s + "%, " + this.l + "%, " + this.a + ")";
        };
    }
    function Pixel(x, y, w, h, color) {
        this.x = {
            c: x,
            min: 0,
            max: canvasRef.current.width,
            dir: Math.random() > 0.5 ? -1 : 1
        };
        this.y = {
            c: y,
            min: 0,
            max: canvasRef.current.height,
            dir: Math.random() > 0.5 ? -1 : 1
        };
        this.w = {
            c: w,
            min: 2,
            max: canvasRef.current.width,
            dir: Math.random() > 0.5 ? -1 : 1
        };
        this.h = {
            c: h,
            min: 2,
            max: canvasRef.current.height,
            dir: Math.random() > 0.5 ? -1 : 1
        };
        this.color = color;
        this.direction = Math.random() > 0.1 ? -1 : 1;
        this.velocity = (Math.random() * 100 + 100) * 0.01 * this.direction;
    }
    function updatePixel(pixel) {
        if (pixel.x.c <= pixel.x.min || pixel.x.c >= pixel.x.max) {
            pixel.x.dir *= -1;
        }
        if (pixel.y.c <= pixel.y.min || pixel.y.c >= pixel.y.max) {
            pixel.y.dir *= -1;
        }
        if (pixel.w.c <= pixel.w.min || pixel.w.c >= pixel.w.max) {
            pixel.w.dir *= -1;
        }
        if (pixel.h.c <= pixel.h.min || pixel.h.c >= pixel.h.max) {
            pixel.h.dir *= -1;
        }
        if (pixel.color.a <= 0 || pixel.color.a >= 0.75) {
            pixel.color.dir *= -1;
        }
        pixel.x.c += 0.005 * pixel.x.dir;
        pixel.y.c += 0.005 * pixel.y.dir;
        pixel.w.c += 0.005 * pixel.w.dir;
        pixel.h.c += 0.005 * pixel.h.dir;
    }
    function renderPixel(pixel) {
        context.restore();
        context.fillStyle = pixel.color.toString();
        context.fillRect(pixel.x.c, pixel.y.c, pixel.w.c, pixel.h.c);
    }
    function paint() {
        if (canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            for(let i = 0; i < pixels.length; i++){
                updatePixel(pixels[i]);
                renderPixel(pixels[i]);
            }
        }
    }
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            setContext(ctx);
            const currentPixels = [
                new Pixel(1, 1, 3, 4, new Color(252, 70, 67, 0.8)),
                new Pixel(0, 0, 1, 1, new Color(0, 0, 98, 1)),
                new Pixel(0, 3, 2, 2, new Color(11, 100, 62, 0.8)),
                new Pixel(4, 0, 4, 3, new Color(190, 94, 75, 0.8)),
                new Pixel(3, 1, 1, 2, new Color(324, 98, 50, 0.1))
            ];
            setPixels(currentPixels);
        }
    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        let animationFrameId;
        if (context) {
            const animate = ()=>{
                paint();
                animationFrameId = window.requestAnimationFrame(animate);
            };
            animate();
        }
        return ()=>{
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [
        paint,
        pixels,
        context
    ]);
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2___default().background),
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("canvas", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2___default().backgroundGradients),
                    width: "6",
                    height: "6",
                    ref: canvasRef
                })
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2___default().container),
                children: children
            })
        ]
    });
}


/***/ }),

/***/ 2052:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(module, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Home; }
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7294);
/* harmony import */ var _reactCOIServiceWorker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3530);
/* harmony import */ var _reactCOIServiceWorker__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_reactCOIServiceWorker__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _zkappWorkerClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9619);
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9466);
/* harmony import */ var _components_GradientBG_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8122);
/* harmony import */ var _styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1110);
/* harmony import */ var _styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_zkappWorkerClient__WEBPACK_IMPORTED_MODULE_3__, o1js__WEBPACK_IMPORTED_MODULE_4__]);
([_zkappWorkerClient__WEBPACK_IMPORTED_MODULE_3__, o1js__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);







let transactionFee = 0.1;
// Address we deployed to on berkeley
const ZKAPP_ADDRESS = "B62qpGqTpNvxMNjh1msVt1Dy6KTSZo2Q9XYR3dcc8Ld1LpcuDm4VUhW";
function Home() {
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({
        zkappWorkerClient: null,
        hasWallet: null,
        hasBeenSetup: false,
        accountExists: false,
        currentNum: null,
        player1Hash: null,
        player2Hash: null,
        publicKey: null,
        zkappPublicKey: null,
        creatingTransaction: false
    });
    // For setting a specific value
    const [inputValue, setInputValue] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const [displayText, setDisplayText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const [transactionlink, setTransactionLink] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const handleInputChange = (event)=>{
        setInputValue(event.target.value);
    };
    // -------------------------------------------------------
    // Do Setup
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        async function timeout(seconds) {
            return new Promise((resolve)=>{
                setTimeout(()=>{
                    resolve();
                }, seconds * 1000);
            });
        }
        (async ()=>{
            if (!state.hasBeenSetup) {
                setDisplayText("Loading web worker...");
                console.log("Loading web worker...");
                const zkappWorkerClient = new _zkappWorkerClient__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z();
                await timeout(5);
                setDisplayText("Done loading web worker");
                console.log("Done loading web worker");
                await zkappWorkerClient.setActiveInstanceToBerkeley();
                const mina = window.mina;
                if (mina == null) {
                    setState({
                        ...state,
                        hasWallet: false
                    });
                    return;
                }
                const publicKeyBase58 = (await mina.requestAccounts())[0];
                console.log("index: publicKeyBase58", publicKeyBase58);
                const publicKey = o1js__WEBPACK_IMPORTED_MODULE_4__/* .PublicKey */ .nh.fromBase58(publicKeyBase58);
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
                const zkappPublicKey = o1js__WEBPACK_IMPORTED_MODULE_4__/* .PublicKey */ .nh.fromBase58(ZKAPP_ADDRESS);
                await zkappWorkerClient.initZkappInstance(zkappPublicKey);
                console.log("Getting zkApp state...");
                setDisplayText("Getting zkApp state...");
                await zkappWorkerClient.fetchAccount({
                    publicKey: zkappPublicKey
                });
                const currentNum = await zkappWorkerClient.getNum();
                const player1Hash = await zkappWorkerClient.getPlayer1Hash();
                const player2Hash = await zkappWorkerClient.getPlayer2Hash();
                console.log("Current state in zkApp: ".concat(currentNum.toString()));
                setDisplayText("");
                setState({
                    ...state,
                    zkappWorkerClient,
                    hasWallet: true,
                    hasBeenSetup: true,
                    publicKey,
                    zkappPublicKey,
                    accountExists,
                    currentNum,
                    player1Hash,
                    player2Hash
                });
            }
        })();
    }, []);
    // -------------------------------------------------------
    // Wait for account to exist, if it didn't
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        (async ()=>{
            if (state.hasBeenSetup && !state.accountExists) {
                for(;;){
                    setDisplayText("Checking if fee payer account exists...");
                    console.log("Checking if fee payer account exists...");
                    const res = await state.zkappWorkerClient.fetchAccount({
                        publicKey: state.publicKey
                    });
                    const accountExists = res.error == null;
                    if (accountExists) {
                        break;
                    }
                    await new Promise((resolve)=>setTimeout(resolve, 5000));
                }
                setState({
                    ...state,
                    accountExists: true
                });
            }
        })();
    }, [
        state.hasBeenSetup
    ]);
    // -------------------------------------------------------
    // Send a transaction
    const onSendTransaction = async (methodStr)=>{
        setState({
            ...state,
            creatingTransaction: true
        });
        setDisplayText("Creating a transaction...");
        console.log("Creating a transaction...");
        await state.zkappWorkerClient.fetchAccount({
            publicKey: state.publicKey
        });
        switch(methodStr){
            case "createUpdateTransaction":
                await state.zkappWorkerClient.createUpdateTransaction();
                break;
            case "createSetTempvarTx":
                const num = Number(inputValue);
                await state.zkappWorkerClient.createSetTempvarTx(num);
                break;
            case "joinGame":
                const player = state.publicKey;
                await state.zkappWorkerClient.createJoinGameTx(player);
                break;
            case "playerTimeout":
                await state.zkappWorkerClient.createPlayerTimeoutTx();
                break;
            case "withdraw":
                await state.zkappWorkerClient.createWithdrawTx();
                break;
            case "deposit":
                await state.zkappWorkerClient.createDepositTx();
                break;
            case "takeAction":
                const action = o1js__WEBPACK_IMPORTED_MODULE_4__/* .UInt32 */ .xH.from(0);
                const betSize = o1js__WEBPACK_IMPORTED_MODULE_4__/* .UInt32 */ .xH.from(0);
                await state.zkappWorkerClient.createTakeActionTx(action, betSize);
                break;
            case "showdown":
                await state.zkappWorkerClient.createShowdownTx();
                break;
            case "tallyBoardCards":
                const cardPrime52 = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Field */ .gN)(0);
                await state.zkappWorkerClient.createTallyBoardCardsTx(cardPrime52);
                break;
            case "showCards":
                const holecard0 = o1js__WEBPACK_IMPORTED_MODULE_4__/* .UInt64 */ .zM.from(0);
                const holecard1 = o1js__WEBPACK_IMPORTED_MODULE_4__/* .UInt64 */ .zM.from(0);
                const boardcard0 = o1js__WEBPACK_IMPORTED_MODULE_4__/* .UInt64 */ .zM.from(0);
                const boardcard1 = o1js__WEBPACK_IMPORTED_MODULE_4__/* .UInt64 */ .zM.from(0);
                const boardcard2 = o1js__WEBPACK_IMPORTED_MODULE_4__/* .UInt64 */ .zM.from(0);
                const boardcard3 = o1js__WEBPACK_IMPORTED_MODULE_4__/* .UInt64 */ .zM.from(0);
                const boardcard4 = o1js__WEBPACK_IMPORTED_MODULE_4__/* .UInt64 */ .zM.from(0);
                const useHolecard0 = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Bool */ .tW)(false);
                const useHolecard1 = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Bool */ .tW)(false);
                const useBoardcards0 = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Bool */ .tW)(false);
                const useBoardcards1 = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Bool */ .tW)(false);
                const useBoardcards2 = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Bool */ .tW)(false);
                const useBoardcards3 = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Bool */ .tW)(false);
                const useBoardcards4 = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Bool */ .tW)(false);
                const isFlush = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Bool */ .tW)(false);
                const shuffleKey = o1js__WEBPACK_IMPORTED_MODULE_4__/* .PrivateKey */ ._q.random();
                const merkleMapKey = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Field */ .gN)(0);
                const merkleMapVal = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Field */ .gN)(0);
                const isLefts = [];
                const siblings = [];
                const path = new o1js__WEBPACK_IMPORTED_MODULE_4__/* .MerkleMapWitness */ .FJ(isLefts, siblings);
                await state.zkappWorkerClient.createShowCardsTx(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4, isFlush, shuffleKey, merkleMapKey, merkleMapVal, path);
                break;
            case "storeCardHash":
                const slotIsc = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Field */ .gN)(0);
                const shuffleSecret = o1js__WEBPACK_IMPORTED_MODULE_4__/* .PrivateKey */ ._q.random();
                const epk1 = shuffleSecret.toPublicKey();
                const epk2 = shuffleSecret.toPublicKey();
                await state.zkappWorkerClient.createStoreCardHashTx(slotIsc, shuffleSecret, epk1, epk2);
                break;
            case "commitCard":
                const slotIcc = (0,o1js__WEBPACK_IMPORTED_MODULE_4__/* .Field */ .gN)(0);
                const msg = o1js__WEBPACK_IMPORTED_MODULE_4__/* .PrivateKey */ ._q.random().toPublicKey();
                await state.zkappWorkerClient.createCommitCardTx(slotIcc, msg);
                break;
        }
        setDisplayText("Creating proof...");
        console.log("Creating proof...");
        await state.zkappWorkerClient.proveUpdateTransaction();
        console.log("Requesting send transaction...");
        setDisplayText("Requesting send transaction...");
        const transactionJSON = await state.zkappWorkerClient.getTransactionJSON();
        setDisplayText("Getting transaction JSON...");
        console.log("Getting transaction JSON...");
        const { hash } = await window.mina.sendTransaction({
            transaction: transactionJSON,
            feePayer: {
                fee: transactionFee,
                memo: ""
            }
        });
        //const transactionLink = `https://berkeley.minaexplorer.com/transaction/${hash}`;
        const transactionLink = "minascan.io/berkeley/tx/".concat(hash);
        console.log("View transaction at ".concat(transactionLink));
        setTransactionLink(transactionLink);
        setDisplayText(transactionLink);
        setState({
            ...state,
            creatingTransaction: false
        });
    };
    // -------------------------------------------------------
    // Refresh the current state
    const onRefreshCurrentNum = async ()=>{
        console.log("Getting zkApp state...");
        setDisplayText("Getting zkApp state...");
        await state.zkappWorkerClient.fetchAccount({
            publicKey: state.zkappPublicKey
        });
        const currentNum = await state.zkappWorkerClient.getNum();
        setState({
            ...state,
            currentNum
        });
        console.log("Current state in zkApp: ".concat(currentNum.toString()));
        setDisplayText("");
    };
    // -------------------------------------------------------
    // Create UI elements
    let hasWallet;
    if (state.hasWallet != null && !state.hasWallet) {
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
        className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().start),
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
    if (state.hasBeenSetup && !state.accountExists) {
        const faucetLink = "https://faucet.minaprotocol.com/?address=" + state.publicKey.toBase58();
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
    let mainContent;
    if (state.hasBeenSetup && state.accountExists) {
        mainContent = /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
            style: {
                justifyContent: "center",
                alignItems: "center"
            },
            children: [
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().center),
                    style: {
                        padding: 0
                    },
                    children: [
                        "Current state in zkApp: ",
                        state.currentNum.toString(),
                        " ",
                        "player1hash: ",
                        state.player1Hash.toString(),
                        " ",
                        "player2hash: ",
                        state.player2Hash.toString(),
                        " "
                    ]
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("createUpdateTransaction"),
                    disabled: state.creatingTransaction,
                    children: "testFunc1"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", {
                    type: "text",
                    value: inputValue,
                    onChange: handleInputChange,
                    placeholder: "Set field value"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("createSetTempvarTx"),
                    disabled: state.creatingTransaction,
                    children: "testFunc2"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("joinGame"),
                    disabled: state.creatingTransaction,
                    children: "joinGame"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("playerTimeout"),
                    disabled: state.creatingTransaction,
                    children: "playerTimeout"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("withdraw"),
                    disabled: state.creatingTransaction,
                    children: "withdraw"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("deposit"),
                    disabled: state.creatingTransaction,
                    children: "deposit"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("takeAction"),
                    disabled: state.creatingTransaction,
                    children: "takeAction"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("showdown"),
                    disabled: state.creatingTransaction,
                    children: "showdown"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("tallyBoardCards"),
                    disabled: state.creatingTransaction,
                    children: "tallyBoardCards"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("showCards"),
                    disabled: state.creatingTransaction,
                    children: "showCards"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("storeCardHash"),
                    disabled: state.creatingTransaction,
                    children: "storeCardHash"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: ()=>onSendTransaction("commitCard"),
                    disabled: state.creatingTransaction,
                    children: "commitCard"
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                    className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().card),
                    onClick: onRefreshCurrentNum,
                    children: "Get Latest State"
                })
            ]
        });
    }
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_GradientBG_js__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
            className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().main),
            style: {
                padding: 0
            },
            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: (_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_6___default().center),
                style: {
                    padding: 0
                },
                children: [
                    setup,
                    accountDoesNotExist,
                    mainContent
                ]
            })
        })
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
    createUpdateTransaction() {
        return this._call("createUpdateTransaction", {});
    }
    createSetTempvarTx(num) {
        return this._call("createSetTempvarTx", {
            num: num
        });
    }
    createJoinGameTx(player) {
        return this._call("createJoinGameTx", {
            player: player
        });
    }
    createWithdrawTx() {
        return this._call("createWithdrawTx", {});
    }
    createDepositTx() {
        return this._call("createDepositTx", {});
    }
    createTakeActionTx(action, betSize) {
        return this._call("createTakeActionTx", {
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
    createStoreCardHashTx(slotI, shuffleSecret, epk1, epk2) {
        return this._call("createStoreCardHashTx", {
            slotI: slotI,
            shuffleSecret: shuffleSecret,
            epk1: epk1,
            epk2: epk2
        });
    }
    createCommitCardTx(slotI, msg) {
        return this._call("createCommitCardTx", {
            slotI: slotI,
            msg: msg
        });
    }
    createShowCardsTx(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4, isFlush, shuffleKey, merkleMapKey, merkleMapVal, path) {
        return this._call("createShowCardsTx", {
            holecard0: holecard0,
            holecard1: holecard1,
            boardcard0: boardcard0,
            boardcard1: boardcard1,
            boardcard2: boardcard2,
            boardcard3: boardcard3,
            boardcard4: boardcard4,
            useHolecard0: useHolecard0,
            useHolecard1: useHolecard1,
            useBoardcards0: useBoardcards0,
            useBoardcards1: useBoardcards1,
            useBoardcards2: useBoardcards2,
            useBoardcards3: useBoardcards3,
            useBoardcards4: useBoardcards4,
            isFlush: isFlush,
            shuffleKey: shuffleKey,
            merkleMapKey: merkleMapKey,
            merkleMapVal: merkleMapVal,
            path: path
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

/***/ }),

/***/ 1110:
/***/ (function(module) {

// extracted by mini-css-extract-plugin
module.exports = {"main":"Home_main__2uIek","background":"Home_background__CTycG","backgroundGradients":"Home_backgroundGradients__VUGb4","container":"Home_container__9OuOz","tagline":"Home_tagline__Jw01K","start":"Home_start__ELciH","code":"Home_code__BZK8z","grid":"Home_grid__vo_ES","card":"Home_card__HIlp_","center":"Home_center__Y_rV4","logo":"Home_logo__ZEOng","content":"Home_content__Qnbja"};

/***/ }),

/***/ 7663:
/***/ (function(module) {

var __dirname = "/";
(function(){var e={229:function(e){var t=e.exports={};var r;var n;function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}(function(){try{if(typeof setTimeout==="function"){r=setTimeout}else{r=defaultSetTimout}}catch(e){r=defaultSetTimout}try{if(typeof clearTimeout==="function"){n=clearTimeout}else{n=defaultClearTimeout}}catch(e){n=defaultClearTimeout}})();function runTimeout(e){if(r===setTimeout){return setTimeout(e,0)}if((r===defaultSetTimout||!r)&&setTimeout){r=setTimeout;return setTimeout(e,0)}try{return r(e,0)}catch(t){try{return r.call(null,e,0)}catch(t){return r.call(this,e,0)}}}function runClearTimeout(e){if(n===clearTimeout){return clearTimeout(e)}if((n===defaultClearTimeout||!n)&&clearTimeout){n=clearTimeout;return clearTimeout(e)}try{return n(e)}catch(t){try{return n.call(null,e)}catch(t){return n.call(this,e)}}}var i=[];var o=false;var u;var a=-1;function cleanUpNextTick(){if(!o||!u){return}o=false;if(u.length){i=u.concat(i)}else{a=-1}if(i.length){drainQueue()}}function drainQueue(){if(o){return}var e=runTimeout(cleanUpNextTick);o=true;var t=i.length;while(t){u=i;i=[];while(++a<t){if(u){u[a].run()}}a=-1;t=i.length}u=null;o=false;runClearTimeout(e)}t.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1){for(var r=1;r<arguments.length;r++){t[r-1]=arguments[r]}}i.push(new Item(e,t));if(i.length===1&&!o){runTimeout(drainQueue)}};function Item(e,t){this.fun=e;this.array=t}Item.prototype.run=function(){this.fun.apply(null,this.array)};t.title="browser";t.browser=true;t.env={};t.argv=[];t.version="";t.versions={};function noop(){}t.on=noop;t.addListener=noop;t.once=noop;t.off=noop;t.removeListener=noop;t.removeAllListeners=noop;t.emit=noop;t.prependListener=noop;t.prependOnceListener=noop;t.listeners=function(e){return[]};t.binding=function(e){throw new Error("process.binding is not supported")};t.cwd=function(){return"/"};t.chdir=function(e){throw new Error("process.chdir is not supported")};t.umask=function(){return 0}}};var t={};function __nccwpck_require__(r){var n=t[r];if(n!==undefined){return n.exports}var i=t[r]={exports:{}};var o=true;try{e[r](i,i.exports,__nccwpck_require__);o=false}finally{if(o)delete t[r]}return i.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var r=__nccwpck_require__(229);module.exports=r})();

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, [674,774,888,179], function() { return __webpack_exec__(9208); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ _N_E = __webpack_exports__;
/******/ }
]);