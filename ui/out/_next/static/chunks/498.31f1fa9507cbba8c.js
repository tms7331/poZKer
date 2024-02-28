"use strict";
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[498],{

/***/ 6498:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.a(module, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PoZKerApp: function() { return /* binding */ PoZKerApp; }
/* harmony export */ });
/* unused harmony exports cardMapping13, cardMapping52, Gamestate */
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
/* harmony import */ var o1js_pack__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8455);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__, o1js_pack__WEBPACK_IMPORTED_MODULE_1__]);
([o1js__WEBPACK_IMPORTED_MODULE_0__, o1js_pack__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
var __decorate = undefined && undefined.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


// Want a mapping for cards, each represented as a prime so we can multiply
// them together and get a unique value
const cardMapping13 = {
    "2": 2,
    "3": 3,
    "4": 5,
    "5": 7,
    "6": 11,
    "7": 13,
    "8": 17,
    "9": 19,
    "T": 23,
    "J": 29,
    "Q": 31,
    "K": 37,
    "A": 41
};
// Need mapping of full cards to properly track board cards - 
// We need to store suit and rank
// Issue with only tracking board card rank is at end of hand we
// will need the suit to prevent players from cheating by keeping
// same board rank but changing suit
// Important to use same suit ordering as 'cards' in playpoker.ts
const cardMapping52 = {
    "2h": 2,
    "3h": 3,
    "4h": 5,
    "5h": 7,
    "6h": 11,
    "7h": 13,
    "8h": 17,
    "9h": 19,
    "Th": 23,
    "Jh": 29,
    "Qh": 31,
    "Kh": 37,
    "Ah": 41,
    "2d": 43,
    "3d": 47,
    "4d": 53,
    "5d": 59,
    "6d": 61,
    "7d": 67,
    "8d": 71,
    "9d": 73,
    "Td": 79,
    "Jd": 83,
    "Qd": 89,
    "Kd": 97,
    "Ad": 101,
    "2c": 103,
    "3c": 107,
    "4c": 109,
    "5c": 113,
    "6c": 127,
    "7c": 131,
    "8c": 137,
    "9c": 139,
    "Tc": 149,
    "Jc": 151,
    "Qc": 157,
    "Kc": 163,
    "Ac": 167,
    "2s": 173,
    "3s": 179,
    "4s": 181,
    "5s": 191,
    "6s": 193,
    "7s": 197,
    "8s": 199,
    "9s": 211,
    "Ts": 223,
    "Js": 227,
    "Qs": 229,
    "Ks": 233,
    "As": 239,
    "": 241
};
class Gamestate extends (0,o1js_pack__WEBPACK_IMPORTED_MODULE_1__/* .PackedUInt32Factory */ .RP)() {
}
class PoZKerApp extends o1js__WEBPACK_IMPORTED_MODULE_0__/* .SmartContract */ .C3 {
    init() {
        super.init();
        // Starting gamestate is always P2's turn preflop, with P1 having posted small blind
        const stack1 = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0);
        const stack2 = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0);
        const turn = this.P1Turn;
        const street = this.Preflop;
        const lastAction = this.Bet;
        const gameOver = this.GameNotOver;
        this.setGamestate(stack1, stack2, turn, street, lastAction, gameOver);
        // Initialize with 0s so we can tell when two players have joined
        this.player1Hash.set((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0));
        this.player2Hash.set((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0));
        // Temp - just want to use this to experiment with pulling data
        this.slot4.set((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(42));
    }
    joinGame(player) {
        // Because we'll add player1 and then player 2, we only need
        // to check if player 2 is initialized to know if game is full
        const player1Hash = this.player1Hash.getAndRequireEquals();
        const player2Hash = this.player2Hash.getAndRequireEquals();
        player2Hash.assertEquals((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0), "Game is full!");
        const pHash = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon */ .jm.hash(player.toFields());
        // If p1 is uninitialized: p1 = pHash, p2 = Field(0)
        // If p1 is initialized: p1 = p1, p2 = pHash
        const p1Hash = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(player1Hash.equals((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0)), pHash, player1Hash);
        const p2Hash = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(player1Hash.equals((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0)), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0), pHash);
        this.player1Hash.set(p1Hash);
        this.player2Hash.set(p2Hash);
    }
    recordMove(player) {
        // TODO - how can we record this number?
        const blockNumber = this.network.blockchainLength.get();
    // this is in milliseconds
    // this.network.timestamp.get(): UInt64;
    }
    getGamestate() {
        const gamestate = this.gamestate.getAndRequireEquals();
        const unpacked = Gamestate.unpack(gamestate.packed);
        return [
            unpacked[0],
            unpacked[1],
            unpacked[2],
            unpacked[3],
            unpacked[4],
            unpacked[5]
        ];
    }
    setGamestate(stack1, stack2, turn, street, lastAction, gameOver) {
        const gamestateField = Gamestate.fromUInt32s([
            stack1,
            stack2,
            turn,
            street,
            lastAction,
            gameOver
        ]);
        this.gamestate.set(gamestateField);
    }
    playerTimeout() {
        // If the other player hasn't made a move in n blocks, we can
        // end the hand and claim the pot...
        // TODO - we need to be recording block numbers so we can verify timeout condition is met
        const player1Hash = this.player1Hash.getAndRequireEquals();
        const player2Hash = this.player2Hash.getAndRequireEquals();
        const [stack1, stack2, turn, street, lastAction, gameOver] = this.getGamestate();
        gameOver.equals(this.GameNotOver).assertTrue("Game has already finished!");
        const player = this.sender;
        const playerHash = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon */ .jm.hash(player.toFields());
        const p1WinnerBal = stack1.add(this.GameBuyin.sub(stack2));
        const p2WinnerBal = stack2.add(this.GameBuyin.sub(stack1));
        // We must  check that that the OTHER player has timed out for this to be valid
        const stack1Final = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player2Hash), p1WinnerBal, stack1);
        const stack2Final = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player1Hash), p2WinnerBal, stack2);
        this.setGamestate(stack1Final, stack2Final, turn, street, lastAction, gameOver);
    }
    withdraw() {
        // Can ONLY withdraw when the hand is over!
        const [stack1, stack2, turn, street, lastAction, gameOver] = this.getGamestate();
        gameOver.equals(this.GameOver).assertTrue("Game is not over!");
        const player1Hash = this.player1Hash.getAndRequireEquals();
        const player2Hash = this.player2Hash.getAndRequireEquals();
        const player = this.sender;
        const playerHash = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon */ .jm.hash(player.toFields());
        const cond0 = playerHash.equals(player1Hash).or(playerHash.equals(player2Hash));
        cond0.assertTrue("Player is not part of this game!");
        // We'll have tallied up the players winnings into their stack, 
        // so both players can withdraw whatever is in their stack when hand ends
        const sendAmount = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player1Hash), stack1, stack2);
        // TEMP - disabling this so we can test game without needing to send funds
        // this.send({ to: player, amount: sendAmount.toUInt64() });
        // We have to update the stacks so they cannot withdraw multiple times!
        const stack1New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player1Hash), o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0), stack1);
        const stack2New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player2Hash), o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0), stack2);
        // We want to reset the gamestate once both players have withdrawn,
        // so we can use the contract for another hand
        const player1HashNew = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player1Hash), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0), player1Hash);
        const player2HashNew = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player2Hash), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0), player2Hash);
        this.player1Hash.set(player1HashNew);
        this.player2Hash.set(player2HashNew);
        const turnReset = this.P1Turn;
        const streetReset = this.Preflop;
        const lastActionReset = this.Bet;
        // Check that both players have been reset to reset game
        // We can't check stack sizes because if one player goes bust, 
        // both stacks will be 0 after the winner calls
        const gameShouldReset = player1HashNew.equals((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0)).and(player2HashNew.equals((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0)));
        const gameOverNew = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(gameShouldReset, this.GameNotOver, this.GameOver);
        this.setGamestate(stack1New, stack2New, turnReset, streetReset, lastActionReset, gameOverNew);
    }
    deposit() {
        // Constraints:
        // Only player1 and player2 can deposit
        // They can only deposit once
        const player1Hash = this.player1Hash.getAndRequireEquals();
        const player2Hash = this.player2Hash.getAndRequireEquals();
        const player = this.sender;
        const playerHash = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon */ .jm.hash(player.toFields());
        const [stack1, stack2, turn, street, lastAction, gameOver] = this.getGamestate();
        const cond0 = playerHash.equals(player1Hash).or(playerHash.equals(player2Hash));
        cond0.assertTrue("Player is not part of this game!");
        const cond1 = playerHash.equals(player1Hash).and(stack1.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0)));
        const cond2 = playerHash.equals(player2Hash).and(stack2.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0)));
        cond1.or(cond2).assertTrue("Player can only deposit once!");
        // From https://github.com/o1-labs/o1js/blob/5ca43684e98af3e4f348f7b035a0ad7320d88f3d/src/examples/zkapps/escrow/escrow.ts
        const payerUpdate = o1js__WEBPACK_IMPORTED_MODULE_0__/* .AccountUpdate */ .nx.createSigned(player);
        // Hardcoded 100 mina as game size
        const gameBuyin64 = this.GameBuyin.toUInt64();
        // TEMP - disabling this so we can test game without needing to send funds
        // payerUpdate.send({ to: this.address, amount: gameBuyin64 });
        // Also include blinds!
        // 1/2, where player1 always posts small blind
        const stack1New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player1Hash), this.GameBuyin.sub(this.SmallBlind), stack1);
        const stack2New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player2Hash), this.GameBuyin.sub(this.BigBlind), stack2);
        this.setGamestate(stack1New, stack2New, turn, street, lastAction, gameOver);
    }
    uint_subtraction(cond, val1, val1sub, val2, val2sub) {
        // We have multiple situations where we're subtracting UInts representing stack sizes
        // In really they cannot underflow due to game logic
        // However because both branches always execute in the Provable.if, we get underflow
        // errors in the branch that will not be selected
        // Is there a better solution besides casting them to fields and back?
        const val1F = val1.toFields()[0];
        const val2F = val2.toFields()[0];
        const val1subF = val1sub.toFields()[0];
        const val2subF = val2sub.toFields()[0];
        const valDiffF = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(cond, val1F.sub(val1subF), val2F.sub(val2subF));
        // Run into weird errors with this assertion
        // valDiffF.assertGreaterThanOrEqual(Field(0), "Bad subtraction!");
        const valDiff = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(valDiffF);
        return valDiff;
    }
    takeAction(action, betSize) {
        // Need to check that it's the current player's turn, 
        // and the action is valid
        const [stack1, stack2, turn, street, lastAction, gameOver] = this.getGamestate();
        gameOver.equals(this.GameNotOver).assertTrue("Game has already finished!");
        // Want these as bools to simplify checks
        const p1turn = turn.equals(this.P1Turn);
        const p2turn = turn.equals(this.P2Turn);
        p1turn.or(p2turn).assertTrue("Invalid game state player");
        const player = this.sender;
        // Logic modified from https://github.com/betterclever/zk-chess/blob/main/src/Chess.ts
        const player1Hash = this.player1Hash.getAndRequireEquals();
        const player2Hash = this.player2Hash.getAndRequireEquals();
        const playerHash = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon */ .jm.hash(player.toFields());
        playerHash.equals(player1Hash).and(p1turn).or(playerHash.equals(player2Hash).and(p2turn)).assertTrue("Player is not allowed to make a move");
        const isPreflop = street.equals(this.Preflop);
        const isFlop = street.equals(this.Flop);
        const isTurn = street.equals(this.Turn);
        const isRiver = street.equals(this.River);
        isPreflop.or(isFlop).or(isTurn).or(isRiver).assertTrue("Invalid game state street");
        const facingNull = lastAction.equals(this.Null);
        const facingBet = lastAction.equals(this.Bet);
        const facingCall = lastAction.equals(this.Call);
        const facingRaise = lastAction.equals(this.Raise);
        const facingCheck = lastAction.equals(this.Check);
        const facingPreflopCall = lastAction.equals(this.PreflopCall);
        // facingFold is impossible - we'd be in showdown state
        facingNull.or(facingBet).or(facingCall).or(facingRaise).or(facingCheck).or(facingPreflopCall).assertTrue("Invalid game state action");
        // Confirm actions is valid, must be some combination below:
        // actions:
        // Bet - valid when facing [Null, Check]
        // Call - valid when facing [Bet, Raise]
        // Fold - valid when facing [Bet, Raise]
        // Raise - valid when facing [Bet, Raise, PreflopCall]
        // Check - valid when facing [Null, Check, PreflopCall]
        const act1 = action.equals(this.Bet).and(facingNull.or(facingCheck));
        const act2 = action.equals(this.Call).and(facingBet.or(facingRaise));
        const act3 = action.equals(this.Fold).and(facingBet.or(facingRaise));
        const act4 = action.equals(this.Raise).and(facingBet.or(facingRaise).or(facingPreflopCall));
        const act5 = action.equals(this.Check).and(facingNull.or(facingCheck).or(facingPreflopCall));
        act1.or(act2).or(act3).or(act4).or(act5).assertTrue("Invalid bet!");
        // If action is call, we need to determine if it's actually PreflopCall...
        // Player 1's stack can only ever be 99 if game has just started and it's their turn
        const actionReal = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(action.equals(this.Call).and(stack1.equals(this.GameBuyin.sub(this.SmallBlind))), this.PreflopCall, action);
        // Amount checks/logic:
        // For calls - we are not passing in amount, so we need to figure it out
        // For raises - raise needs to be to a valid size
        // If stack1 99 and stack2 90, returns 9
        const stackDiff = this.uint_subtraction(p1turn, stack1, stack2, stack2, stack1);
        // We get an error on underflows so this is always true
        // stackDiff.assertGreaterThanOrEqual(UInt64.from(0), "");
        // Betsize constraints:
        // Fold/Check - betsize should be 0
        // Bet - betsize should be gt 1 (or whatever minsize is)
        // Call - betsize should make stacks equal
        // Raise - betsize should be at least equal to diff*2, or all-in
        const foldCheckAmountBool = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(actionReal.equals(this.Check).or(actionReal.equals(this.Fold)), betSize.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0)), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true));
        foldCheckAmountBool.assertTrue("Bad betsize for check or fold!");
        // Bet - betsize should be gt 1 (or whatever minsize is)
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(actionReal.equals(this.Bet), betSize, o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(1)).assertGreaterThanOrEqual(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(1), "Invalid bet size!");
        // Raise - betsize should be at least equal to diff*2, or all-in
        const stackPlusAmount = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(p1turn, this.GameBuyin.sub(stack1).add(betSize), this.GameBuyin.sub(stack2).add(betSize));
        stackPlusAmount.assertLessThanOrEqual(this.GameBuyin, "Cannot bet more than stack!");
        const allin = stackPlusAmount.equals(this.GameBuyin);
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(actionReal.equals(this.Raise), betSize.greaterThanOrEqual(stackDiff.mul(2)).or(allin), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true)).assertTrue("Invalid raise amount!");
        // Call - betsize should make stacks equal
        // So we might need to override the other betsize here
        const betSizeReal = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(actionReal.equals(this.Call).or(actionReal.equals(this.PreflopCall)), stackDiff, betSize);
        // Make sure the player has enough funds to take the action
        const case1 = playerHash.equals(player1Hash).and(betSizeReal.lessThanOrEqual(stack1));
        const case2 = playerHash.equals(player2Hash).and(betSizeReal.lessThanOrEqual(stack2));
        case1.or(case2).assertTrue("Not enough balance for bet!");
        const stack1New = this.uint_subtraction(playerHash.equals(player1Hash), stack1, betSizeReal, stack1, o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0));
        const stack2New = this.uint_subtraction(playerHash.equals(player2Hash), stack2, betSizeReal, stack2, o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0));
        // Need to check if we've hit the end of the street - transition to next street
        // Scenarios for this would be:
        // 1. Either player has called - (but not the PreflopCall)
        // 2. Player 2 has checked
        const newStreetBool = actionReal.equals(this.Call).or(playerHash.equals(player2Hash).and(actionReal.equals(this.Check)));
        // Is there any way we could simplify this with something like:
        // If newStreetBool and (isPreflop or isTurn) -> Add 2
        // If newStreetBool and (isFlop or isRiver) -> Add 4
        // Else keep same street
        // Showdown takes priority over other logic
        const nextShowdownEnd = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(isRiver.and(newStreetBool), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(false));
        // Additional scenario where we can have a showdown - both allin
        const nextShowdownAllin = stack1New.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0)).and(stack2New.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0)));
        const nextShowdown = nextShowdownEnd.or(nextShowdownAllin);
        const nextPreflop = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(nextShowdown.not().and(isPreflop.and(newStreetBool.not())), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(false));
        const nextFlop = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(nextShowdown.not().and(isFlop.and(newStreetBool.not()).or(isPreflop.and(newStreetBool))), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(false));
        const nextTurn = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(nextShowdown.not().and(isTurn.and(newStreetBool.not()).or(isFlop.and(newStreetBool))), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(false));
        const nextRiver = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(nextShowdown.not().and(isRiver.and(newStreetBool.not()).or(isTurn.and(newStreetBool))), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(false));
        const currStreet = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.switch([
            nextPreflop,
            nextFlop,
            nextTurn,
            nextRiver,
            nextShowdown
        ], o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH, [
            this.Preflop,
            this.Flop,
            this.Turn,
            this.River,
            this.ShowdownPending
        ]);
        // ISSUE - if i's showdown pending, wee want to override value...
        // If we did go to the next street, previous action should be 'Null'
        const facingAction = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(newStreetBool, this.Null, actionReal);
        const playerTurnNow = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(newStreetBool.or(p2turn), this.P1Turn, this.P2Turn);
        const gameOverNow = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(actionReal.equals(this.Fold), this.GameOver, this.GameNotOver);
        // If game is over from a fold - need to send funds to winner
        const p1WinnerBal = stack1.add(this.GameBuyin.sub(stack2New));
        const p2WinnerBal = stack2.add(this.GameBuyin.sub(stack1New));
        const stack1Final = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(gameOverNow.equals(this.GameOver).and(playerHash.equals(player2Hash)), p1WinnerBal, stack1New);
        const stack2Final = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(gameOverNow.equals(this.GameOver).and(playerHash.equals(player1Hash)), p2WinnerBal, stack2New);
        this.setGamestate(stack1Final, stack2Final, playerTurnNow, currStreet, facingAction, gameOverNow);
    }
    showdown() {
        // We should only call this if we actually made it to showdown
        const [stack1, stack2, turn, street, lastAction, gameOver] = this.getGamestate();
        street.equals(this.ShowdownComplete).assertTrue("Invalid showdown gamestate!");
        // Sanity check - if it's a showdown both stacks must be equal
        stack1.equals(stack2).assertTrue("Invalid showdown gamestate!");
        const p1WinnerBal = this.GameBuyin.add(this.GameBuyin.sub(stack2));
        const p2WinnerBal = this.GameBuyin.add(this.GameBuyin.sub(stack1));
        // Convention is we'll have stored player1's lookup value for their hand 
        // in slot0, and player2's lookup value in slot1
        const slot0 = this.slot0.getAndRequireEquals();
        const slot1 = this.slot1.getAndRequireEquals();
        // If we get a tie - split the pot
        const tieAdj = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(slot0 === slot1), // Could subtract from either one here - stacks must be the same
        this.GameBuyin.sub(stack2), o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0));
        // Lower is better for the hand rankings
        const stack1Final = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(slot0.lessThan(slot1)), p1WinnerBal, stack1.add(tieAdj));
        const stack2Final = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(slot1.lessThan(slot0)), p2WinnerBal, stack2.add(tieAdj));
        // Sanity check - should always be true
        stack1Final.add(stack2Final).assertEquals(this.GameBuyin.mul(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(2)));
        this.setGamestate(stack1Final, stack2Final, turn, street, lastAction, this.GameOver);
    }
    cardPrimeToCardPoint(cardPrime) {
        /*
        Players will pass in the prime52 value of their card, we want to get
        the publickey, the cardPoint, associated with that card, so we can
        ensure the cards they passed in are the cards that were committed
    
        Code to generate this mapping is in gameutils
        */ const cardPoint = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.switch([
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(2)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(3)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(5)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(7)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(11)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(13)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(17)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(19)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(23)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(29)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(31)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(37)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(41)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(43)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(47)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(53)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(59)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(61)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(67)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(71)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(73)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(79)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(83)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(89)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(97)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(101)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(103)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(107)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(109)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(113)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(127)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(131)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(137)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(139)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(149)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(151)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(157)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(163)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(167)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(173)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(179)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(181)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(191)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(193)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(197)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(199)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(211)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(223)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(227)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(229)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(233)),
            cardPrime.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(239))
        ], o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh, [
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qs2xPJgNhvBw7ubgppB4YSDf1dYyvLYD1ghCrhnkXabLSVAainWx"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qoK7BxuzJx9Kn7hzNXxJGLXXzmXgzfg59p4ZCWYGXsJE2hbwZC2j"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qrKpP3NBbF97cx2aAdCmaSuVqaiGgvs9fMARxASPmVFgugoQekjr"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qmn9ZV1nNyLUG7fCcQHpkkt4PaT8ctgtrPyqtBNHP2KfexF2hPro"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qkj5CSRx9qWwYtHUWaYp5M3whGuhavCmZWBwsTAK9Du7xsq1NgUb"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qopEG5GqujH3reoh4uAwcbGMJnzSBnokPS1aP7KZGJDK9Yvsn8g3"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qoYts8pW1GVTt44vhA3esBDN67UsX9jLBackLGarfVKBRWtjQBkU"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qmK1iyMJfJZXd717RexE9TVf7uLd848gpkWYnnnEufUUWjsmN1Xs"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qjuepd8NRZzHqVbKcRJUtM5zdM9B2Me2pzDi4i1kUKz1C8Mous19"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qmS2bNfvrRXPzLyvbaBVF9g2J6crL4zR6LjcRQzTxzqXTBEjprno"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qnLS6BkhAXF3YHkpSZ9brNoLk1kSo55VQsZqrfYorZVrnjckzQfQ"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qjbhEXAYUqMESzUk4XZcXf5dcTpUy8Sv4Kd231oKs29j25AF23Jc"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qoa5ohnNnFEXfbPshXCzkBkgWSzXk3auy2yS9hyjLma4EkH7xWbs"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qqqUB9WmFCviaiPxnvT6a8PhtFyyfWtGUC5fLzrZh8MLuHteR23u"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qn7Qv1Ur7eEd8MUvm8G2QX2xy5KZ2XGFpHSvXFapzpUPe3mkqscG"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qpaK3GbVbpeoZyF95KmaDbTzM9YPpzeGNFVNfiuCAaS6iEAUqTVy"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qj8HkeQ2fzttty6TdWuDawJzFB1YozQARYCAtU3w2SUhDBtkQk8V"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qj7gbbFMhEPnsmVsouRyDuqzqY5GYYL9xYYxC9VVoREJcGEZAmRy"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qrYfYzv33FQ7tkKSveW4Bv5TPWR8w8BHFRboCezML9uia1JvQqM4"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qnT7U86RKp6wmCeDN9H8hLoQM63iwREcaYZ3QprmbHFp3B8pJ3Tg"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qmTF5nNcEfTqmoEuTgjBFRYdZ2P4SBBNsyV4qgtFuqKvWKVZ6vxH"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qk6tpoVSvS9N6tba72VAYij9kGkYfntz2HxuGXWbKTHnJcexYLBU"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qoXjH7mB9F1Lh7bqCJ2HK6ugV5aL4hsmJQKDhnNVPojqoUywk8tD"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qpYXzESQUfvssCXHpMBBA68PDWyg5AbKqsS6uPh6edTeJRaeMCeX"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qoNUbnMGz2wSP6fThYAzi9pgXjbXCsFLcN24feAGjfK9FEikyv44"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qiuLMUJ9xPCYGqAzJY2C8JTwgAFhfgZFTnVRsq3EBksHKAE1G3mX"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qobewhPUGcq3d51k7LpprwpdvZXHa3tt5cQqrHXFwGMYr1sfzytJ"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qpzcCZwyVuc3jMMK6hSWML5XFBDHhjGzxmQxqbxsj7CUq69tz73u"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qkJX7rwZhVvERKLTgdP1nR2uvp7r71gUMbg4r433hqGchqVUSAvH"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qjzb33UZEW73Azm4UNLHt5h9j8QGN1VHthZ5qtLp4HW2RopPgqnq"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qiyjjmivsXANPdai446hdVxbzp3XGvBeqrp2MwPagawWgGFscitu"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qmm9QtXK2sgunTFQZHcZ4QLoWxcm2kqR8Funhhz1cCnoWDKrZCo7"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qmCRjfwQf5TqVAthSsahapRo3TzAJLWV111Jvjysnd52T15Hhqv8"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qndkT7z5GRdNdVzFVJS5n3VyY2F7Vz3EpGyPiCUpiHRUm6uLdb8Z"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qkehCjfnN9sppd6XqsP8yBg5QcBgKpYbBqBz57ucmi5PLhwG2S9f"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qnfRT4wwPbTqDA5RaLYpoQEnB1HoafQmpZDjyhqUGfy6JmcpW5cB"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qpemVeQk9KtShw7i4LBkXHKncPLEmWvubA2Rm79adXDmNYP8DbuA"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qiczv8AH2wHirAXEYWs3FofpqmwMAMqsH1turCF5pg4yDyTHo96o"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qoxgp76z6NxCACZMhVFmtFivGBXySv6rt1K4njuQj5FDek14KqmZ"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qrjCGUYUt7RkTaycWK9UxmK2UrL2PqzTnsfbZ2TqKJzoRRQ4AETX"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qju23mB8xFV8LD6KuzjYP5TrQ5oC8m3nbq21kJCaQyJhwBrS1BYJ"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qniYvDRvQeGenwoCSWbuHkRYVJP35a1KhrWVg8DEV22HMg9BbRby"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qpt7XdABiHZtKWaf7wYmf4ZpeYJd2LfbT7w9dJAR9hhM4UC8MpsP"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qn6aN7zUMDNDCq4s39nf32mks7YRRatUimtgmTyEH5ghPnbnCqER"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qnwVexivudVh5CAj1yqGXFkrgjimR1F3WB4cq3VZ2KNn5WL8XNGX"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qmTVrhEfXW1h5R9Ea8Lzgv8LapGZmmjBwzujsPoe58DtKA896QLb"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qqPPARzHjNc222t1EHbaU2jAVNGxai1Pfv229xj2Qen6R3dHuw6V"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qrdxHXHyuQjDSyYPsWYTEgtZBSEqF5bpTktk5RqSwbdojebLVZLH"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qn9vSE3Jmep2pwx2XtfKV86omVpdcaYiY91mbcseKRRoPSEzx28Y"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qogwrj3eDhmoNETRUX3VToBYuXo8r7NM8w1onp6RWYat1c56zpyu"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qnp98SGKe6dQ2cTMUKJeWGhECfj57vZGS5D5MA9hr5bXFYMo3wDM"),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromBase58("B62qqA4jWdkLUE2ceoJPyqVYViFga2kJJ1UUMG2hS4pbD8zxEHhtfvW")
        ]);
        return cardPoint;
    }
    tallyBoardCards(cardPrime52) {
        // Remember - cardPrime52 should be in the 52 format
        // We'll always store the board card product in slot2
        const slot2 = this.slot2.getAndRequireEquals();
        // Remember - we start out having the board card be Null*5
        // Need to do this so we can ensure at showdown that player submitted all cards
        const slot2New = slot2.mul(cardPrime52).div(this.NullBoardcard);
        this.slot2.set(slot2New);
    }
    convert52to13(c52) {
        // takes care of converting a card in cardMapping52 format to cardMapping13
        // "2h": 2,  "2d": 43, "2c": 103, "2s": 173,
        // "3h": 3,  "3d": 47, "3c": 107, "3s": 179,
        // "4h": 5,  "4d": 53, "4c": 109, "4s": 181,
        // "5h": 7,  "5d": 59, "5c": 113, "5s": 191,
        // "6h": 11, "6d": 61, "6c": 127, "6s": 193,
        // "7h": 13, "7d": 67, "7c": 131, "7s": 197,
        // "8h": 17, "8d": 71, "8c": 137, "8s": 199,
        // "9h": 19, "9d": 73, "9c": 139, "9s": 211,
        // "Th": 23, "Td": 79, "Tc": 149, "Ts": 223,
        // "Jh": 29, "Jd": 83, "Jc": 151, "Js": 227,
        // "Qh": 31, "Qd": 89, "Qc": 157, "Qs": 229,
        // "Kh": 37, "Kd": 97, "Kc": 163, "Ks": 233,
        // "Ah": 41, "Ad": 101,"Ac": 167, "As": 239,
        const c13 = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.switch([
            // CONDITIONS
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(2)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(43))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(103))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(173))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(3)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(47))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(107))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(179))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(5)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(53))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(109))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(181))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(7)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(59))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(113))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(191))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(11)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(61))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(127))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(193))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(13)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(67))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(131))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(197))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(17)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(71))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(137))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(199))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(19)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(73))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(139))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(211))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(23)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(79))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(149))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(223))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(29)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(83))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(151))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(227))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(31)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(89))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(157))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(229))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(37)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(97))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(163))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(233))),
            c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(41)).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(101))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(167))).or(c52.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(239)))
        ], // RETURN TYPE
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM, // SELECT VALUES
        [
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(2),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(3),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(5),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(7),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(11),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(13),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(17),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(19),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(23),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(29),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(31),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(37),
            o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(41)
        ]);
        return c13;
    }
    calcLookupVal(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4) {
        // Remember - all cards are in cardMapping52 format
        let lookupVal = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(1);
        const cardList = [
            holecard0,
            holecard1,
            boardcard0,
            boardcard1,
            boardcard2,
            boardcard3,
            boardcard4
        ];
        const boolList = [
            useHolecard0,
            useHolecard1,
            useBoardcards0,
            useBoardcards1,
            useBoardcards2,
            useBoardcards3,
            useBoardcards4
        ];
        // Incredibly ugly but we need to convert cards from cardMapping52 to cardMapping13
        // And then multiply together all the ones that are used to get the lookup val
        for(let i = 0; i < 7; i++){
            const c52 = cardList[i];
            const c13 = this.convert52to13(c52);
            const boolUse = boolList[i];
            // So if we use it, use the value, otherwise just 1...
            const lvMul = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(boolUse, c13, o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(1));
            lookupVal = lookupVal.mul(lvMul);
        }
        return lookupVal;
    }
    calcCheckFlush(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4) {
        const cardList = [
            holecard0,
            holecard1,
            boardcard0,
            boardcard1,
            boardcard2,
            boardcard3,
            boardcard4
        ];
        const boolList = [
            useHolecard0,
            useHolecard1,
            useBoardcards0,
            useBoardcards1,
            useBoardcards2,
            useBoardcards3,
            useBoardcards4
        ];
        let allHearts = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true);
        let allDiamonds = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true);
        let allClubs = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true);
        let allSpades = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true);
        // So idea - go through and set all to true
        // After each valid card, all the suits that don't match
        // will be set to false
        // So at the end if any of the bools is still 'true', it
        // must be the case that every card we used was of that suit
        for(let i = 0; i < 7; i++){
            const c52 = cardList[i];
            const boolUse = boolList[i];
            // Ranges for each suit
            // "2h": 2, "Ah": 41,
            // "2d": 43, "Ad": 101,
            // "2c": 103, "Ac": 167,
            // "2s": 173, "As": 239,
            const minHeart = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(2);
            const maxHeart = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(41);
            const minDiamond = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(43);
            const maxDiamond = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(101);
            const minClub = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(103);
            const maxClub = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(167);
            const minSpade = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(173);
            const maxSpade = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(239);
            const isHeart = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(boolUse.not(), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true), c52.greaterThanOrEqual(minHeart).and(c52.lessThanOrEqual(maxHeart)));
            const isDiamond = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(boolUse.not(), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true), c52.greaterThanOrEqual(minDiamond).and(c52.lessThanOrEqual(maxDiamond)));
            const isClub = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(boolUse.not(), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true), c52.greaterThanOrEqual(minClub).and(c52.lessThanOrEqual(maxClub)));
            const isSpade = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(boolUse.not(), (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true), c52.greaterThanOrEqual(minSpade).and(c52.lessThanOrEqual(maxSpade)));
            allHearts = allHearts.and(isHeart);
            allDiamonds = allDiamonds.and(isDiamond);
            allClubs = allClubs.and(isClub);
            allSpades = allSpades.and(isSpade);
        }
        const isFlush = allHearts.or(allDiamonds).or(allClubs).or(allSpades);
        return isFlush;
    }
    showCards(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4, isFlush, shuffleKey, merkleMapKey, merkleMapVal, path) {
        /*
        Each player has to pass in their holecards, along with all board cards
        And specify which cards are used to make their best 6c hand
    
        To make cheating impossible, we need these checks:
        1. confirm the card lookup key and value are valid entries in the merkle map
        2. independently calculate the card lookup key using their cards and confirm the lookup key is valid
        3. re-hash the cards and confirm it matches their stored hash
        4. check that board cards are the real board cards
        */ const [stack1, stack2, turn, street, lastAction, gameOver] = this.getGamestate();
        // const gamestate = this.gamestate.getAndRequireEquals();
        // TODO - what was this check again?  Reimplement with new format...
        // gamestate.assertLessThanOrEqual(UInt64.from(3));
        // Player card hash will be stored in slot1 or slot1
        const slot0 = this.slot0.getAndRequireEquals();
        const slot1 = this.slot1.getAndRequireEquals();
        // We are going to be storing the product of all the board card primes here!
        const slot2 = this.slot2.getAndRequireEquals();
        // CHECK 0. - make sure player is a part of the game...
        const player = this.sender;
        const player1Hash = this.player1Hash.getAndRequireEquals();
        const player2Hash = this.player2Hash.getAndRequireEquals();
        const playerHash = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon */ .jm.hash(player.toFields());
        playerHash.equals(player1Hash).or(playerHash.equals(player2Hash)).assertTrue("Player is not part of this game!");
        const holecardsHash = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player1Hash), slot0, slot1);
        // CHECK 2. independently calculate the card lookup key using their cards and confirm the lookup key is valid
        // the lookupVal is the expected key for our merkle map
        const lookupVal = this.calcLookupVal(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4);
        const isFlushReal = this.calcCheckFlush(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4);
        isFlushReal.assertEquals(isFlush, "Player did not pass in correct flush value!");
        lookupVal.toFields()[0].assertEquals(merkleMapKey, "Incorrect hand strenght passed in!");
        // CHECK 1. confirm the card lookup key and value are valid entries in the merkle map
        // MerkleMapRootBasic
        // MerkleMapRootFlush
        const root = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(isFlush, this.MerkleMapRootFlush, this.MerkleMapRootBasic);
        const pathValid = path.computeRootAndKey(merkleMapVal);
        pathValid[0].assertEquals(root);
        pathValid[1].assertEquals(merkleMapKey);
        // CHECK 3. re-hash the cards and confirm it matches their stored hash
        const cardPoint1 = this.cardPrimeToCardPoint(holecard0);
        const cardPoint2 = this.cardPrimeToCardPoint(holecard1);
        const cardPoint1F = cardPoint1.toFields()[0];
        const cardPoint2F = cardPoint2.toFields()[0];
        const cardHash = this.generateHash(cardPoint1F, cardPoint2F, shuffleKey);
        cardHash.assertEquals(holecardsHash, "Player did not pass in their real cards!");
        // CHECK 4. check that board cards are the real board cards
        const boardcardMul = boardcard0.mul(boardcard1).mul(boardcard2).mul(boardcard3).mul(boardcard4);
        const boardcardMulReal = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(slot2);
        boardcardMul.assertEquals(boardcardMulReal);
        // And check that we have 5 boardcards - should not be divisible by null val
        const nullBoardcardUint = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(this.NullBoardcard);
        boardcardMulReal.divMod(nullBoardcardUint).rest.equals(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM.from(0)).assertFalse();
        // And now we can store the lookup value in the appropriate slot
        // Assuming we made it past all our checks - 
        // We are now storing the merkleMapVal, which represents
        // hand strength in these slots!  Lower is better!
        const slot0New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player1Hash), merkleMapVal, slot0);
        const slot1New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player2Hash), merkleMapVal, slot1);
        this.slot0.set(slot0New);
        this.slot1.set(slot1New);
        // Description of logic within actionMapping - 
        // transition from 1 to 6 via multiplying by 2 and 3 after each player
        // shows their cards
        const streetNew = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(playerHash.equals(player1Hash), street.mul(this.P1Turn), street.mul(this.P2Turn));
        // this.gamestate.set(gamestateNew);
        this.setGamestate(stack1, stack2, turn, streetNew, lastAction, gameOver);
    }
    generateHash(card1, card2, privateKey) {
        // Apply a double hash to get a single value for both cards
        // We'll use this to generate the hash for a given card
        // We'll use the same hash function as the lookup table
        const pkField = privateKey.toFields()[0];
        const round1 = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon */ .jm.hash([
            pkField,
            card1
        ]);
        const round2 = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon */ .jm.hash([
            round1,
            card2
        ]);
        return round2;
    }
    decodeCard(epk, msg, shuffleSecret) {
        const d1 = o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromGroup(epk.toGroup().scale(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Scalar */ .Ru.fromFields(shuffleSecret.toFields())));
        const pubKey = o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromGroup(msg.toGroup().sub(d1.toGroup()));
        return pubKey;
    }
    storeCardHash(slotI, shuffleSecret, epk1, epk2) {
        // Used to store a hash of the player's cards
        // 1. decrypt both cards
        // 2. double hash the resulting value
        // 3. and store the hash in a slot
        // For both players their encrypted card will be stored here
        const slot0 = this.slot0.getAndRequireEquals();
        const msg1F0 = this.slot1.getAndRequireEquals();
        const msg2F0 = this.slot2.getAndRequireEquals();
        const msg1F1 = this.slot3.getAndRequireEquals();
        const msg2F1 = this.slot4.getAndRequireEquals();
        //msg1F.assertEquals(msg1.toFields()[0]);
        //msg2F.assertEquals(msg2.toFields()[0]);
        const msg1 = o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromFields([
            msg1F0,
            msg1F1
        ]);
        const msg2 = o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh.fromFields([
            msg2F0,
            msg2F1
        ]);
        // We are ALWAYS storing the encrypted cards in slots1 and 2
        // Want to decrypt BOTH cards, and multiply them together
        const cardPoint1 = this.decodeCard(epk1, msg1, shuffleSecret);
        const cardPoint2 = this.decodeCard(epk2, msg2, shuffleSecret);
        // This is still a field representation of the card - not the prime52 value!
        const cardPoint1F = cardPoint1.toFields()[0];
        const cardPoint2F = cardPoint2.toFields()[0];
        const cardHash = this.generateHash(cardPoint1F, cardPoint2F, shuffleSecret);
        const slot0New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(slotI.equals(0), cardHash, slot0);
        const slot1New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(slotI.equals(1), cardHash, (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0));
        this.slot0.set(slot0New);
        this.slot1.set(slot1New);
        // We'll store board cards in slot2, initialize with all nul values
        const noBoardcards = this.NullBoardcard.mul(this.NullBoardcard).mul(this.NullBoardcard).mul(this.NullBoardcard).mul(this.NullBoardcard);
        this.slot2.set(noBoardcards);
    }
    commitCard(slotI, msg) {
        // msg corresponds to the field representation of the msg PublicKey in the mentalpoker Card struct
        // The other player should perform their half of the partialUnmask,
        // and then commit the results here
        // Players can then decrypt their cards, preserving the secrecy of the
        // cards and avoiding the need for a trusted dealer
        const [msgF0, msgF1] = msg.toFields();
        const slot1 = this.slot1.getAndRequireEquals();
        const slot2 = this.slot2.getAndRequireEquals();
        const slot3 = this.slot3.getAndRequireEquals();
        const slot4 = this.slot4.getAndRequireEquals();
        const slot1New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(slotI.equals(1), msgF0, slot1);
        const slot2New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(slotI.equals(2), msgF0, slot2);
        // And now store the second value too
        const slot3New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(slotI.equals(1), msgF1, slot3);
        const slot4New = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.if(slotI.equals(2), msgF1, slot4);
        this.slot1.set(slot1New);
        this.slot2.set(slot2New);
        this.slot3.set(slot3New);
        this.slot4.set(slot4New);
    }
    setTempvar() {
        this.slot4.set((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(123));
    }
    setTempvar2() {
        this.slot4.set((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(456));
    }
    setTempvarValue(val) {
        this.slot4.set(val);
    }
    constructor(){
        super(...arguments);
        this.GameNotOver = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0);
        this.GameOver = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(1);
        // we need P1Turn*P2Turn*ShowdownPending = ShowdownComplete
        this.P1Turn = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(2);
        this.P2Turn = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(3);
        this.ShowdownPending = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(1);
        this.ShowdownComplete = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(6);
        this.Preflop = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(2);
        this.Flop = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(3);
        this.Turn = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(4);
        this.River = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(5);
        this.Null = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(0);
        this.Bet = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(1);
        this.Call = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(2);
        this.Fold = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(3);
        this.Raise = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(4);
        this.Check = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(5);
        this.PreflopCall = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(6);
        this.NullBoardcard = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(cardMapping52[""]);
        // This are generated via the genmap script
        this.MerkleMapRootBasic = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)("27699641125309939543225716816460043210743676221173039607853127025430840122106");
        this.MerkleMapRootFlush = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)("12839577190240250171319696533609974348200540625786415982151412596597428662991");
        // Hardcode 100 as game size
        this.GameBuyin = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(100);
        this.SmallBlind = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(1);
        this.BigBlind = o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(2);
        this.player1Hash = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.player2Hash = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        // Coded game state, contains packed data:
        // stack1, stack2, turn, street, lastAction, gameOver
        this.gamestate = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        // Free memory slots for storing data
        this.slot0 = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.slot1 = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.slot2 = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.slot3 = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.slot4 = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
    }
}
__decorate([
    (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], PoZKerApp.prototype, "player1Hash", void 0);
__decorate([
    (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], PoZKerApp.prototype, "player2Hash", void 0);
__decorate([
    (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(Gamestate),
    __metadata("design:type", Object)
], PoZKerApp.prototype, "gamestate", void 0);
__decorate([
    (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], PoZKerApp.prototype, "slot0", void 0);
__decorate([
    (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], PoZKerApp.prototype, "slot1", void 0);
__decorate([
    (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], PoZKerApp.prototype, "slot2", void 0);
__decorate([
    (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], PoZKerApp.prototype, "slot3", void 0);
__decorate([
    (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], PoZKerApp.prototype, "slot4", void 0);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh
    ]),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "joinGame", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "playerTimeout", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "withdraw", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "deposit", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH
    ]),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "takeAction", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "showdown", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN
    ]),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "tallyBoardCards", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt64 */ .zM,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .PrivateKey */ ._q,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .MerkleMapWitness */ .FJ
    ]),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "showCards", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .PrivateKey */ ._q,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh
    ]),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "storeCardHash", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN,
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh
    ]),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "commitCard", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "setTempvar", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "setTempvar2", null);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN
    ]),
    __metadata("design:returntype", void 0)
], PoZKerApp.prototype, "setTempvarValue", null); //# sourceMappingURL=PoZKer.js.map

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 8455:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

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

}]);