import { Field, SmartContract, state, State, method, PublicKey, PrivateKey, Bool, Provable, UInt64, AccountUpdate, Poseidon, MerkleMapWitness, Scalar } from 'o1js';

/*
Creating a mapping of prime numbers in order to combine:
1. Player
2. Street
3. LastAction
Into a single variable representing game state.  
The values can be multiplied together in order to create a unique value 
representing the current game state, and divMod can be used in order to
extract the individual values

Mapping is as follows:
GameOver 1

P1 2
P2 3

Preflop 5
Flop 7
Turn 11
River 13
Showdown 17

Null 19
Bet 23
Call 29
Fold 31
Raise 37
Check 41
*/


export const actionMapping = {
    // Showdown logic: when players need to show their cards we'll set this to
    // be gamestate.  Then as each player shows their cards, we'll multiply by
    // 2, and then by 3.  This will result in gamestate of 6, 'ShowdownComplete'
    // and this is the unique way we can achieve a gamestate of 6
    // From there either player can call the 'showdown' method, which will transition
    // to GameOver and allow the players to collect their winnings
    "ShowdownPending": 1,
    // Players 
    "P1": 2,
    "P2": 3,
    "ShowdownComplete": 6,
    // Streets
    "Preflop": 5,
    "Flop": 7,
    "Turn": 11,
    "River": 13,
    // "Showdown": 17,  // doesn't exist anymore, we have PendingShowdown and ShowdownComplete
    // Actions
    "Null": 19,
    "Bet": 23,
    "Call": 29,
    "Fold": 31,
    "Raise": 37,
    "Check": 41,
    // Specifically for player 1 calling player2's blind
    // The action proceeds differently in this case, easier to have it separate
    // Note - action does not need to be specified externally, it's easier to have 
    // action transformed into this inside of our takeAction logic
    "PreflopCall": 43,
    // This will override others - we'll set this to be gamestate, no multiplying
    "GameOver": 47
}


// Want an additional mapping for cards, using same prime idea 
export const cardMapping13 = {
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
    "A": 41,
}


// Need mapping of full cards to properly track board cards - 
// We need to store suit and rank
// Issue with only tracking board card rank is at end of hand we
// will need the suit to prevent players from cheating by keeping
// same board rank but changing suit
// Important to use same suit ordering as 'cards' in playpoker.ts
export const cardMapping52 = {
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
    "": 241,
}


export class PoZKerApp extends SmartContract {
    GameOver = UInt64.from(actionMapping["GameOver"]);

    //cardMapping52_list = [UInt64.from(1), UInt64.from(2), UInt64.from(3)]
    cardMapping52_list = [UInt64.from(2), UInt64.from(3), UInt64.from(5), UInt64.from(7), UInt64.from(11), UInt64.from(13), UInt64.from(17), UInt64.from(19)]

    P1 = UInt64.from(actionMapping["P1"]);
    P2 = UInt64.from(actionMapping["P2"]);

    Preflop = UInt64.from(actionMapping["Preflop"]);
    Flop = UInt64.from(actionMapping["Flop"]);
    Turn = UInt64.from(actionMapping["Turn"]);
    River = UInt64.from(actionMapping["River"]);
    ShowdownPending = UInt64.from(actionMapping["ShowdownPending"]);
    ShowdownComplete = UInt64.from(actionMapping["ShowdownComplete"]);

    Null = UInt64.from(actionMapping["Null"]);
    Bet = UInt64.from(actionMapping["Bet"]);
    Call = UInt64.from(actionMapping["Call"]);
    Fold = UInt64.from(actionMapping["Fold"]);
    Raise = UInt64.from(actionMapping["Raise"]);
    Check = UInt64.from(actionMapping["Check"]);
    PreflopCall = UInt64.from(actionMapping["PreflopCall"]);

    NullBoardcard = Field(cardMapping52[""]);

    // This are generated via the genmap script
    MerkleMapRootBasic = Field("27699641125309939543225716816460043210743676221173039607853127025430840122106");
    MerkleMapRootFlush = Field("12839577190240250171319696533609974348200540625786415982151412596597428662991");
    // Hardcode 100 as game size
    GameBuyin = UInt64.from(100);
    SmallBlind = UInt64.from(1);
    BigBlind = UInt64.from(2);
    //player1Hash = Field(8879912305210651084592467885807902739034137217445691720217630551894134031710);
    //player2Hash = Field(17608229569872969144485439827417022479409407220457475048103405509470577631109);

    @state(Field) player1Hash = State<Field>();
    @state(Field) player2Hash = State<Field>();
    // Player balances for the hand
    @state(UInt64) stack1 = State<UInt64>();
    @state(UInt64) stack2 = State<UInt64>();
    // Coded game state, logic described at top of file
    @state(UInt64) gamestate = State<UInt64>();

    // Free memory slots for storing data
    @state(Field) slot0 = State<Field>();
    @state(Field) slot1 = State<Field>();
    @state(Field) slot2 = State<Field>();

    init() {
        super.init();
        // Starting gamestate is always P1's turn preflop, with no previous action
        // Starting action is a bet because of blinds!
        const currstate = this.P1.mul(this.Preflop).mul(this.Bet);
        this.gamestate.set(currstate);
    }

    @method initState(player1: PublicKey, player2: PublicKey) {
        const p1Hash = Poseidon.hash(player1.toFields());
        const p2Hash = Poseidon.hash(player2.toFields());
        this.player1Hash.set(p1Hash);
        this.player2Hash.set(p2Hash);
    }

    @method withdraw(playerSecKey: PrivateKey) {
        // Can ONLY withdraw when the hand is over!
        const isGameOver = this.gamestate.getAndAssertEquals();
        isGameOver.assertEquals(this.GameOver);

        const player1Hash = this.player1Hash.getAndAssertEquals();
        const player2Hash = this.player2Hash.getAndAssertEquals();
        const player = PublicKey.fromPrivateKey(playerSecKey);
        const playerHash = Poseidon.hash(player.toFields());
        const cond0 = playerHash.equals(player1Hash).or(playerHash.equals(player2Hash));
        cond0.assertTrue('Player is not part of this game!')

        // We'll have tallied up the players winnings into their stack, 
        // so both players can withdraw whatever is in their stack when hand ends
        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();

        const sendAmount = Provable.if(
            playerHash.equals(player1Hash),
            stack1,
            stack2
        );

        this.send({ to: player, amount: sendAmount });

        // We have to update the stacks so they cannot withdraw multiple times!
        const stack1New = Provable.if(
            playerHash.equals(player1Hash),
            UInt64.from(0),
            stack1
        );

        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            playerHash.equals(player2Hash),
            UInt64.from(0),
            stack2
        );
        this.stack2.set(stack2New);
    }

    @method deposit(playerSecKey: PrivateKey) {
        // Constraints:
        // Only player1 and player2 can deposit
        // They can only deposit once
        const player1Hash = this.player1Hash.getAndAssertEquals();
        const player2Hash = this.player2Hash.getAndAssertEquals();

        const player = PublicKey.fromPrivateKey(playerSecKey);
        const playerHash = Poseidon.hash(player.toFields());

        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();
        const cond0 = playerHash.equals(player1Hash).or(playerHash.equals(player2Hash));
        cond0.assertTrue('Player is not part of this game!')
        const cond1 = playerHash.equals(player1Hash).and(stack1.equals(UInt64.from(0)));
        const cond2 = playerHash.equals(player2Hash).and(stack2.equals(UInt64.from(0)));
        cond1.or(cond2).assertTrue('Player can only deposit once!');

        // From https://github.com/o1-labs/o1js/blob/5ca43684e98af3e4f348f7b035a0ad7320d88f3d/src/examples/zkapps/escrow/escrow.ts
        const payerUpdate = AccountUpdate.createSigned(player);
        // Hardcoded 100 mina as game size
        payerUpdate.send({ to: this.address, amount: this.GameBuyin });

        // Also include blinds!
        // 1/2, where player1 always posts small blind
        const stack1New = Provable.if(
            playerHash.equals(player1Hash),
            this.GameBuyin.sub(this.SmallBlind),
            stack1
        );
        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            playerHash.equals(player2Hash),
            this.GameBuyin.sub(this.BigBlind),
            stack2
        );
        this.stack2.set(stack2New);
    }

    uint_subtraction(cond: Bool, val1: UInt64, val1sub: UInt64, val2: UInt64, val2sub: UInt64): UInt64 {
        // We have multiple situations where we're subtracting UInts representing stack sizes
        // In really they cannot underflow due to game logic
        // However because both branches always execute in the Provable.if, we get underflow
        // errors in the branch that will not be selected
        // Is there a better solution besides casting them to fields and back?
        const val1F = val1.toFields()[0];
        const val2F = val2.toFields()[0];
        const val1subF = val1sub.toFields()[0];
        const val2subF = val2sub.toFields()[0];

        const valDiffF: Field = Provable.if(cond,
            val1F.sub(val1subF),
            val2F.sub(val2subF)
        );
        // Run into weird errors with this assertion
        // valDiffF.assertGreaterThanOrEqual(Field(0), "Bad subtraction!");
        const valDiff = UInt64.from(valDiffF);
        return valDiff;
    }

    @method takeAction(playerSecKey: PrivateKey, action: UInt64, betSize: UInt64) {

        // Need to check that it's the current player's turn, 
        // and the action is valid
        const gamestate = this.gamestate.getAndAssertEquals();

        gamestate.equals(this.GameOver).not().assertTrue('Game has already finished!');

        const p1turn = gamestate.divMod(this.P1).rest.equals(UInt64.from(0));
        const p2turn = gamestate.divMod(this.P2).rest.equals(UInt64.from(0));
        // Do a full sanity check for now, make sure one of them is true
        //const p2turn = p1turn.not();
        p1turn.or(p2turn).assertTrue('Invalid game state player');

        //const player = this.sender;
        const player = PublicKey.fromPrivateKey(playerSecKey);
        // Logic modified from https://github.com/betterclever/zk-chess/blob/main/src/Chess.ts
        const player1Hash = this.player1Hash.getAndAssertEquals();
        const player2Hash = this.player2Hash.getAndAssertEquals();
        const playerHash = Poseidon.hash(player.toFields());

        playerHash
            .equals(player1Hash)
            .and(p1turn)
            .or(playerHash.equals(player2Hash).and(p2turn))
            .assertTrue('Player is not allowed to make a move');

        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();

        const isPreflop = gamestate.divMod(this.Preflop).rest.equals(UInt64.from(0));
        const isFlop = gamestate.divMod(this.Flop).rest.equals(UInt64.from(0));
        const isTurn = gamestate.divMod(this.Turn).rest.equals(UInt64.from(0));
        const isRiver = gamestate.divMod(this.River).rest.equals(UInt64.from(0));
        isPreflop.or(isFlop).or(isTurn).or(isRiver).assertTrue('Invalid game state street');

        const facingNull = gamestate.divMod(this.Null).rest.equals(UInt64.from(0));
        const facingBet = gamestate.divMod(this.Bet).rest.equals(UInt64.from(0));
        const facingCall = gamestate.divMod(this.Call).rest.equals(UInt64.from(0));
        // This should be impossible, we should be in GameOver state if 'facingFold', and earlier assertion would be hit
        // const facingFold = gamestate.divMod(this.Fold).rest.equals(UInt64.from(0));
        const facingRaise = gamestate.divMod(this.Raise).rest.equals(UInt64.from(0));
        const facingCheck = gamestate.divMod(this.Check).rest.equals(UInt64.from(0));
        const facingPreflopCall = gamestate.divMod(this.PreflopCall).rest.equals(UInt64.from(0));

        facingNull.or(facingBet).or(facingCall).or(facingRaise).or(facingCheck).or(facingPreflopCall).assertTrue('Invalid game state action');

        // Confirm actions is valid, must be some combination below:
        // actions:
        // Bet - valid when facing [Null, Check]
        // Call - valid when facing [Bet, Raise]
        // Fold - valid when facing [Bet, Raise]
        // Raise - valid when facing [Bet, Raise, PreflopCall]
        // Check - valid when facing [Null, Check, PreflopCall]
        let act1 = action.equals(this.Bet).and(facingNull.or(facingCheck));
        let act2 = action.equals(this.Call).and(facingBet.or(facingRaise));
        let act3 = action.equals(this.Fold).and(facingBet.or(facingRaise));
        let act4 = action.equals(this.Raise).and(facingBet.or(facingRaise).or(facingPreflopCall));
        let act5 = action.equals(this.Check).and(facingNull.or(facingCheck).or(facingPreflopCall));

        act1.or(act2).or(act3).or(act4).or(act5).assertTrue('Invalid bet!');

        // If action is call, we need to determine if it's actually PreflopCall...
        // Player 1's stack can only ever be 99 if game has just started and it's their turn
        const actionReal: UInt64 = Provable.if(
            action.equals(this.Call).and(stack1.equals(this.GameBuyin.sub(this.SmallBlind))),
            this.PreflopCall,
            action);

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

        const foldCheckAmountBool = Provable.if(actionReal.equals(this.Check).or(actionReal.equals(this.Fold)),
            betSize.equals(UInt64.from(0)),
            Bool(true)
        )
        foldCheckAmountBool.assertTrue("Bad betsize for check or fold!");

        // Bet - betsize should be gt 1 (or whatever minsize is)
        Provable.if(actionReal.equals(this.Bet),
            betSize,
            UInt64.from(1),
        ).assertGreaterThanOrEqual(UInt64.from(1), "Invalid bet size!")

        // Raise - betsize should be at least equal to diff*2, or all-in
        const stackPlusAmount: UInt64 = Provable.if(p1turn,
            this.GameBuyin.sub(stack1).add(betSize),
            this.GameBuyin.sub(stack2).add(betSize)
        )
        stackPlusAmount.assertLessThanOrEqual(this.GameBuyin, "Cannot bet more than stack!");

        const allin: Bool = stackPlusAmount.equals(this.GameBuyin);

        Provable.if(actionReal.equals(this.Raise),
            betSize.greaterThanOrEqual(stackDiff.mul(2)).or(allin),
            Bool(true),
        ).assertTrue("Invalid raise amount!");

        // Call - betsize should make stacks equal
        // So we might need to override the other betsize here
        const betSizeReal = Provable.if(actionReal.equals(this.Call).or(actionReal.equals(this.PreflopCall)),
            stackDiff,
            betSize,
        )

        //or(actionReal.equals(Field(actionReal.Bet)).and(gamestate.equals(Field(actionReal.Null)).or(gamestate.equals(Field(actionReal.Check)))).assertTrue('Bet is valid when facing [Null, Check]'));

        // Make sure the player has enough funds to take the action
        const case1 = playerHash.equals(player1Hash).and(betSizeReal.lessThanOrEqual(stack1));
        const case2 = playerHash.equals(player2Hash).and(betSizeReal.lessThanOrEqual(stack2));
        case1.or(case2).assertTrue("Not enough balance for bet!");

        const stack1New = this.uint_subtraction(playerHash.equals(player1Hash),
            stack1, betSizeReal,
            stack1, UInt64.from(0));
        const stack2New = this.uint_subtraction(playerHash.equals(player2Hash),
            stack2, betSizeReal,
            stack2, UInt64.from(0));

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
        const nextShowdownEnd = Provable.if(isRiver.and(newStreetBool), Bool(true), Bool(false));
        // Additional scenario where we can have a showdown - both allin
        const nextShowdownAllin = stack1New.equals(UInt64.from(0)).and(stack2New.equals(UInt64.from(0)));
        const nextShowdown = nextShowdownEnd.or(nextShowdownAllin);
        const nextPreflop = Provable.if(nextShowdown.not().and(isPreflop.and(newStreetBool.not())), Bool(true), Bool(false));
        const nextFlop = Provable.if(nextShowdown.not().and(isFlop.and(newStreetBool.not()).or(isPreflop.and(newStreetBool))), Bool(true), Bool(false));
        const nextTurn = Provable.if(nextShowdown.not().and(isTurn.and(newStreetBool.not()).or(isFlop.and(newStreetBool))), Bool(true), Bool(false));
        const nextRiver = Provable.if(nextShowdown.not().and(isRiver.and(newStreetBool.not()).or(isTurn.and(newStreetBool))), Bool(true), Bool(false));

        const currStreet = Provable.switch(
            [nextPreflop, nextFlop, nextTurn, nextRiver, nextShowdown],
            UInt64,
            [this.Preflop, this.Flop, this.Turn, this.River, this.ShowdownPending]
        );

        // ISSUE - if i's showdown pending, wee want to override value...

        // If we did go to the next street, previous action should be 'Null'
        const facingAction = Provable.if(
            newStreetBool,
            this.Null,
            actionReal
        );

        const playerTurnNow = Provable.if(
            newStreetBool.or(p2turn),
            this.P1,
            this.P2
        );

        const gameOverBool = Provable.if(
            actionReal.equals(this.Fold),
            Bool(true),
            Bool(false)
        );

        // If the hand is continuing this is how we're encoding the game state
        const currGamestateMul = playerTurnNow.mul(currStreet).mul(facingAction)
        // But for showdowns - we want to overwrite and have it just be '1'
        const currGamestateNoGameover: UInt64 = Provable.if(
            currStreet.equals(this.ShowdownPending),
            (this.ShowdownPending),
            currGamestateMul
        );

        // gamestate should be:
        // player-whose-turn-it-is * street * lastaction
        const currGamestate = Provable.if(
            gameOverBool,
            this.GameOver,
            currGamestateNoGameover
        );
        this.gamestate.set(currGamestate);

        // If game is over from a fold - need to send funds to winner
        const p1WinnerBal = stack1.add(this.GameBuyin.sub(stack2New));
        const p2WinnerBal = stack2.add(this.GameBuyin.sub(stack1New));

        const stack1Final = Provable.if(
            gameOverBool.and(playerHash.equals(player2Hash)),
            p1WinnerBal,
            stack1New
        );
        this.stack1.set(stack1Final);
        const stack2Final = Provable.if(
            gameOverBool.and(playerHash.equals(player1Hash)),
            p2WinnerBal,
            stack2New
        );
        this.stack2.set(stack2Final);
    }

    @method showdown() {
        // We should only call this if we actually made it to showdown
        // So valid states for showdown are actually
        // {1, 2, 3}
        // 1 = ShowdownPending
        // 2 = P1 (meaning P1 has shown their cards)
        // 3 = P3 (meaning P1 has shown their cards)
        const gamestate = this.gamestate.getAndAssertEquals();
        gamestate.equals(this.ShowdownComplete).assertTrue("Invalid showdown gamestate!");

        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();
        // Sanity check - if it's a showdown both stacks must be equal
        stack1.assertEquals(stack2);

        const p1WinnerBal = this.GameBuyin.add(this.GameBuyin.sub(stack2));
        const p2WinnerBal = this.GameBuyin.add(this.GameBuyin.sub(stack1));

        // Convention is we'll have stored player1's lookup value for their hand 
        // in slot0, and player2's lookup value in slot1
        const slot0 = this.slot0.getAndAssertEquals();
        const slot1 = this.slot1.getAndAssertEquals();

        // If we get a tie - split the pot
        const tieAdj = Provable.if(
            Bool(slot0 === slot1),
            // Could subtract from either one here - stacks must be the same
            this.GameBuyin.sub(stack2),
            UInt64.from(0),
        );

        // Lower is better for the hand rankings
        const stack1Final = Provable.if(
            Bool(slot0.lessThan(slot1)),
            p1WinnerBal,
            stack1.add(tieAdj)
        );
        const stack2Final = Provable.if(
            Bool(slot1.lessThan(slot0)),
            p2WinnerBal,
            stack2.add(tieAdj)
        );

        stack1Final.add(stack2Final).assertEquals(this.GameBuyin.mul(UInt64.from(2)));

        this.stack1.set(stack1Final);
        this.stack2.set(stack2Final);

        this.gamestate.set(this.GameOver);
    }

    cardPrimeToCardPoint(cardPrime: UInt64): PublicKey {
        /*
        Players will pass in the prime52 value of their card, we want to get
        the publickey, the cardPoint, associated with that card, so we can
        ensure the cards they passed in are the cards that were committed
    
        Code to generate this mapping is in gameutils
        */
        const cardPoint = Provable.switch([cardPrime.equals(UInt64.from(2)),
        cardPrime.equals(UInt64.from(3)),
        cardPrime.equals(UInt64.from(5)),
        cardPrime.equals(UInt64.from(7)),
        cardPrime.equals(UInt64.from(11)),
        cardPrime.equals(UInt64.from(13)),
        cardPrime.equals(UInt64.from(17)),
        cardPrime.equals(UInt64.from(19)),
        cardPrime.equals(UInt64.from(23)),
        cardPrime.equals(UInt64.from(29)),
        cardPrime.equals(UInt64.from(31)),
        cardPrime.equals(UInt64.from(37)),
        cardPrime.equals(UInt64.from(41)),
        cardPrime.equals(UInt64.from(43)),
        cardPrime.equals(UInt64.from(47)),
        cardPrime.equals(UInt64.from(53)),
        cardPrime.equals(UInt64.from(59)),
        cardPrime.equals(UInt64.from(61)),
        cardPrime.equals(UInt64.from(67)),
        cardPrime.equals(UInt64.from(71)),
        cardPrime.equals(UInt64.from(73)),
        cardPrime.equals(UInt64.from(79)),
        cardPrime.equals(UInt64.from(83)),
        cardPrime.equals(UInt64.from(89)),
        cardPrime.equals(UInt64.from(97)),
        cardPrime.equals(UInt64.from(101)),
        cardPrime.equals(UInt64.from(103)),
        cardPrime.equals(UInt64.from(107)),
        cardPrime.equals(UInt64.from(109)),
        cardPrime.equals(UInt64.from(113)),
        cardPrime.equals(UInt64.from(127)),
        cardPrime.equals(UInt64.from(131)),
        cardPrime.equals(UInt64.from(137)),
        cardPrime.equals(UInt64.from(139)),
        cardPrime.equals(UInt64.from(149)),
        cardPrime.equals(UInt64.from(151)),
        cardPrime.equals(UInt64.from(157)),
        cardPrime.equals(UInt64.from(163)),
        cardPrime.equals(UInt64.from(167)),
        cardPrime.equals(UInt64.from(173)),
        cardPrime.equals(UInt64.from(179)),
        cardPrime.equals(UInt64.from(181)),
        cardPrime.equals(UInt64.from(191)),
        cardPrime.equals(UInt64.from(193)),
        cardPrime.equals(UInt64.from(197)),
        cardPrime.equals(UInt64.from(199)),
        cardPrime.equals(UInt64.from(211)),
        cardPrime.equals(UInt64.from(223)),
        cardPrime.equals(UInt64.from(227)),
        cardPrime.equals(UInt64.from(229)),
        cardPrime.equals(UInt64.from(233)),
        cardPrime.equals(UInt64.from(239))],
            PublicKey,
            [PublicKey.fromBase58("B62qs2xPJgNhvBw7ubgppB4YSDf1dYyvLYD1ghCrhnkXabLSVAainWx"),
            PublicKey.fromBase58("B62qoK7BxuzJx9Kn7hzNXxJGLXXzmXgzfg59p4ZCWYGXsJE2hbwZC2j"),
            PublicKey.fromBase58("B62qrKpP3NBbF97cx2aAdCmaSuVqaiGgvs9fMARxASPmVFgugoQekjr"),
            PublicKey.fromBase58("B62qmn9ZV1nNyLUG7fCcQHpkkt4PaT8ctgtrPyqtBNHP2KfexF2hPro"),
            PublicKey.fromBase58("B62qkj5CSRx9qWwYtHUWaYp5M3whGuhavCmZWBwsTAK9Du7xsq1NgUb"),
            PublicKey.fromBase58("B62qopEG5GqujH3reoh4uAwcbGMJnzSBnokPS1aP7KZGJDK9Yvsn8g3"),
            PublicKey.fromBase58("B62qoYts8pW1GVTt44vhA3esBDN67UsX9jLBackLGarfVKBRWtjQBkU"),
            PublicKey.fromBase58("B62qmK1iyMJfJZXd717RexE9TVf7uLd848gpkWYnnnEufUUWjsmN1Xs"),
            PublicKey.fromBase58("B62qjuepd8NRZzHqVbKcRJUtM5zdM9B2Me2pzDi4i1kUKz1C8Mous19"),
            PublicKey.fromBase58("B62qmS2bNfvrRXPzLyvbaBVF9g2J6crL4zR6LjcRQzTxzqXTBEjprno"),
            PublicKey.fromBase58("B62qnLS6BkhAXF3YHkpSZ9brNoLk1kSo55VQsZqrfYorZVrnjckzQfQ"),
            PublicKey.fromBase58("B62qjbhEXAYUqMESzUk4XZcXf5dcTpUy8Sv4Kd231oKs29j25AF23Jc"),
            PublicKey.fromBase58("B62qoa5ohnNnFEXfbPshXCzkBkgWSzXk3auy2yS9hyjLma4EkH7xWbs"),
            PublicKey.fromBase58("B62qqqUB9WmFCviaiPxnvT6a8PhtFyyfWtGUC5fLzrZh8MLuHteR23u"),
            PublicKey.fromBase58("B62qn7Qv1Ur7eEd8MUvm8G2QX2xy5KZ2XGFpHSvXFapzpUPe3mkqscG"),
            PublicKey.fromBase58("B62qpaK3GbVbpeoZyF95KmaDbTzM9YPpzeGNFVNfiuCAaS6iEAUqTVy"),
            PublicKey.fromBase58("B62qj8HkeQ2fzttty6TdWuDawJzFB1YozQARYCAtU3w2SUhDBtkQk8V"),
            PublicKey.fromBase58("B62qj7gbbFMhEPnsmVsouRyDuqzqY5GYYL9xYYxC9VVoREJcGEZAmRy"),
            PublicKey.fromBase58("B62qrYfYzv33FQ7tkKSveW4Bv5TPWR8w8BHFRboCezML9uia1JvQqM4"),
            PublicKey.fromBase58("B62qnT7U86RKp6wmCeDN9H8hLoQM63iwREcaYZ3QprmbHFp3B8pJ3Tg"),
            PublicKey.fromBase58("B62qmTF5nNcEfTqmoEuTgjBFRYdZ2P4SBBNsyV4qgtFuqKvWKVZ6vxH"),
            PublicKey.fromBase58("B62qk6tpoVSvS9N6tba72VAYij9kGkYfntz2HxuGXWbKTHnJcexYLBU"),
            PublicKey.fromBase58("B62qoXjH7mB9F1Lh7bqCJ2HK6ugV5aL4hsmJQKDhnNVPojqoUywk8tD"),
            PublicKey.fromBase58("B62qpYXzESQUfvssCXHpMBBA68PDWyg5AbKqsS6uPh6edTeJRaeMCeX"),
            PublicKey.fromBase58("B62qoNUbnMGz2wSP6fThYAzi9pgXjbXCsFLcN24feAGjfK9FEikyv44"),
            PublicKey.fromBase58("B62qiuLMUJ9xPCYGqAzJY2C8JTwgAFhfgZFTnVRsq3EBksHKAE1G3mX"),
            PublicKey.fromBase58("B62qobewhPUGcq3d51k7LpprwpdvZXHa3tt5cQqrHXFwGMYr1sfzytJ"),
            PublicKey.fromBase58("B62qpzcCZwyVuc3jMMK6hSWML5XFBDHhjGzxmQxqbxsj7CUq69tz73u"),
            PublicKey.fromBase58("B62qkJX7rwZhVvERKLTgdP1nR2uvp7r71gUMbg4r433hqGchqVUSAvH"),
            PublicKey.fromBase58("B62qjzb33UZEW73Azm4UNLHt5h9j8QGN1VHthZ5qtLp4HW2RopPgqnq"),
            PublicKey.fromBase58("B62qiyjjmivsXANPdai446hdVxbzp3XGvBeqrp2MwPagawWgGFscitu"),
            PublicKey.fromBase58("B62qmm9QtXK2sgunTFQZHcZ4QLoWxcm2kqR8Funhhz1cCnoWDKrZCo7"),
            PublicKey.fromBase58("B62qmCRjfwQf5TqVAthSsahapRo3TzAJLWV111Jvjysnd52T15Hhqv8"),
            PublicKey.fromBase58("B62qndkT7z5GRdNdVzFVJS5n3VyY2F7Vz3EpGyPiCUpiHRUm6uLdb8Z"),
            PublicKey.fromBase58("B62qkehCjfnN9sppd6XqsP8yBg5QcBgKpYbBqBz57ucmi5PLhwG2S9f"),
            PublicKey.fromBase58("B62qnfRT4wwPbTqDA5RaLYpoQEnB1HoafQmpZDjyhqUGfy6JmcpW5cB"),
            PublicKey.fromBase58("B62qpemVeQk9KtShw7i4LBkXHKncPLEmWvubA2Rm79adXDmNYP8DbuA"),
            PublicKey.fromBase58("B62qiczv8AH2wHirAXEYWs3FofpqmwMAMqsH1turCF5pg4yDyTHo96o"),
            PublicKey.fromBase58("B62qoxgp76z6NxCACZMhVFmtFivGBXySv6rt1K4njuQj5FDek14KqmZ"),
            PublicKey.fromBase58("B62qrjCGUYUt7RkTaycWK9UxmK2UrL2PqzTnsfbZ2TqKJzoRRQ4AETX"),
            PublicKey.fromBase58("B62qju23mB8xFV8LD6KuzjYP5TrQ5oC8m3nbq21kJCaQyJhwBrS1BYJ"),
            PublicKey.fromBase58("B62qniYvDRvQeGenwoCSWbuHkRYVJP35a1KhrWVg8DEV22HMg9BbRby"),
            PublicKey.fromBase58("B62qpt7XdABiHZtKWaf7wYmf4ZpeYJd2LfbT7w9dJAR9hhM4UC8MpsP"),
            PublicKey.fromBase58("B62qn6aN7zUMDNDCq4s39nf32mks7YRRatUimtgmTyEH5ghPnbnCqER"),
            PublicKey.fromBase58("B62qnwVexivudVh5CAj1yqGXFkrgjimR1F3WB4cq3VZ2KNn5WL8XNGX"),
            PublicKey.fromBase58("B62qmTVrhEfXW1h5R9Ea8Lzgv8LapGZmmjBwzujsPoe58DtKA896QLb"),
            PublicKey.fromBase58("B62qqPPARzHjNc222t1EHbaU2jAVNGxai1Pfv229xj2Qen6R3dHuw6V"),
            PublicKey.fromBase58("B62qrdxHXHyuQjDSyYPsWYTEgtZBSEqF5bpTktk5RqSwbdojebLVZLH"),
            PublicKey.fromBase58("B62qn9vSE3Jmep2pwx2XtfKV86omVpdcaYiY91mbcseKRRoPSEzx28Y"),
            PublicKey.fromBase58("B62qogwrj3eDhmoNETRUX3VToBYuXo8r7NM8w1onp6RWYat1c56zpyu"),
            PublicKey.fromBase58("B62qnp98SGKe6dQ2cTMUKJeWGhECfj57vZGS5D5MA9hr5bXFYMo3wDM"),
            PublicKey.fromBase58("B62qqA4jWdkLUE2ceoJPyqVYViFga2kJJ1UUMG2hS4pbD8zxEHhtfvW")]);

        return cardPoint;
    }


    @method tallyBoardCards(cardPrime52: Field) {
        // Remember - cardPrime52 should be in the 52 format
        // We'll always store the board card product in slot2
        const slot2 = this.slot2.getAndAssertEquals();

        // Remember - we start out having the board card be Null*5
        // Need to do this so we can ensure at showdown that player submitted all cards
        const slot2New = slot2.mul(cardPrime52).div(this.NullBoardcard);
        this.slot2.set(slot2New)
    }


    convert52to13(c52: UInt64): UInt64 {
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

        const c13 = Provable.switch([
            // CONDITIONS
            c52.equals(UInt64.from(2)).or(c52.equals(UInt64.from(43))).or(c52.equals(UInt64.from(103))).or(c52.equals(UInt64.from(173))),
            c52.equals(UInt64.from(3)).or(c52.equals(UInt64.from(47))).or(c52.equals(UInt64.from(107))).or(c52.equals(UInt64.from(179))),
            c52.equals(UInt64.from(5)).or(c52.equals(UInt64.from(53))).or(c52.equals(UInt64.from(109))).or(c52.equals(UInt64.from(181))),
            c52.equals(UInt64.from(7)).or(c52.equals(UInt64.from(59))).or(c52.equals(UInt64.from(113))).or(c52.equals(UInt64.from(191))),
            c52.equals(UInt64.from(11)).or(c52.equals(UInt64.from(61))).or(c52.equals(UInt64.from(127))).or(c52.equals(UInt64.from(193))),
            c52.equals(UInt64.from(13)).or(c52.equals(UInt64.from(67))).or(c52.equals(UInt64.from(131))).or(c52.equals(UInt64.from(197))),
            c52.equals(UInt64.from(17)).or(c52.equals(UInt64.from(71))).or(c52.equals(UInt64.from(137))).or(c52.equals(UInt64.from(199))),
            c52.equals(UInt64.from(19)).or(c52.equals(UInt64.from(73))).or(c52.equals(UInt64.from(139))).or(c52.equals(UInt64.from(211))),
            c52.equals(UInt64.from(23)).or(c52.equals(UInt64.from(79))).or(c52.equals(UInt64.from(149))).or(c52.equals(UInt64.from(223))),
            c52.equals(UInt64.from(29)).or(c52.equals(UInt64.from(83))).or(c52.equals(UInt64.from(151))).or(c52.equals(UInt64.from(227))),
            c52.equals(UInt64.from(31)).or(c52.equals(UInt64.from(89))).or(c52.equals(UInt64.from(157))).or(c52.equals(UInt64.from(229))),
            c52.equals(UInt64.from(37)).or(c52.equals(UInt64.from(97))).or(c52.equals(UInt64.from(163))).or(c52.equals(UInt64.from(233))),
            c52.equals(UInt64.from(41)).or(c52.equals(UInt64.from(101))).or(c52.equals(UInt64.from(167))).or(c52.equals(UInt64.from(239)))],
            // RETURN TYPE
            UInt64,
            // SELECT VALUES
            [UInt64.from(2),
            UInt64.from(3),
            UInt64.from(5),
            UInt64.from(7),
            UInt64.from(11),
            UInt64.from(13),
            UInt64.from(17),
            UInt64.from(19),
            UInt64.from(23),
            UInt64.from(29),
            UInt64.from(31),
            UInt64.from(37),
            UInt64.from(41),])

        return c13;

    }

    calcLookupVal(holecard0: UInt64,
        holecard1: UInt64,
        boardcard0: UInt64,
        boardcard1: UInt64,
        boardcard2: UInt64,
        boardcard3: UInt64,
        boardcard4: UInt64,
        useHolecard0: Bool,
        useHolecard1: Bool,
        useBoardcards0: Bool,
        useBoardcards1: Bool,
        useBoardcards2: Bool,
        useBoardcards3: Bool,
        useBoardcards4: Bool,
    ): UInt64 {
        // Remember - all cards are in cardMapping52 format
        let lookupVal = UInt64.from(1);

        const cardList = [holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4];
        const boolList = [useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4];

        // Incredibly ugly but we need to convert cards from cardMapping52 to cardMapping13
        // And then multiply together all the ones that are used to get the lookup val
        for (let i = 0; i < 7; i++) {
            const c52 = cardList[i];
            const c13 = this.convert52to13(c52)
            const boolUse = boolList[i];
            // So if we use it, use the value, otherwise just 1...
            const lvMul = Provable.if(boolUse, c13, UInt64.from(1));
            lookupVal = lookupVal.mul(lvMul);
        }

        return lookupVal;
    }


    calcCheckFlush(holecard0: UInt64,
        holecard1: UInt64,
        boardcard0: UInt64,
        boardcard1: UInt64,
        boardcard2: UInt64,
        boardcard3: UInt64,
        boardcard4: UInt64,
        useHolecard0: Bool,
        useHolecard1: Bool,
        useBoardcards0: Bool,
        useBoardcards1: Bool,
        useBoardcards2: Bool,
        useBoardcards3: Bool,
        useBoardcards4: Bool,
    ): Bool {

        const cardList = [holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4];
        const boolList = [useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4];

        let allHearts = Bool(true);
        let allDiamonds = Bool(true);
        let allClubs = Bool(true);
        let allSpades = Bool(true);

        // So idea - go through and set all to true
        // After each valid card, all the suits that don't match
        // will be set to false
        // So at the end if any of the bools is still 'true', it
        // must be the case that every card we used was of that suit

        for (let i = 0; i < 7; i++) {
            const c52 = cardList[i];
            const boolUse = boolList[i];

            // Ranges for each suit
            // "2h": 2, "Ah": 41,
            // "2d": 43, "Ad": 101,
            // "2c": 103, "Ac": 167,
            // "2s": 173, "As": 239,
            const minHeart = UInt64.from(2);
            const maxHeart = UInt64.from(41);
            const minDiamond = UInt64.from(43);
            const maxDiamond = UInt64.from(101);
            const minClub = UInt64.from(103);
            const maxClub = UInt64.from(167);
            const minSpade = UInt64.from(173);
            const maxSpade = UInt64.from(239);

            const isHeart = Provable.if(boolUse.not(), Bool(true), c52.greaterThanOrEqual(minHeart).and(c52.lessThanOrEqual(maxHeart)));
            const isDiamond = Provable.if(boolUse.not(), Bool(true), c52.greaterThanOrEqual(minDiamond).and(c52.lessThanOrEqual(maxDiamond)));
            const isClub = Provable.if(boolUse.not(), Bool(true), c52.greaterThanOrEqual(minClub).and(c52.lessThanOrEqual(maxClub)));
            const isSpade = Provable.if(boolUse.not(), Bool(true), c52.greaterThanOrEqual(minSpade).and(c52.lessThanOrEqual(maxSpade)));

            allHearts = allHearts.and(isHeart);
            allDiamonds = allDiamonds.and(isDiamond);
            allClubs = allClubs.and(isClub);
            allSpades = allSpades.and(isSpade);
        }

        const isFlush = allHearts.or(allDiamonds).or(allClubs).or(allSpades)
        return isFlush;

    }

    @method showCards(holecard0: UInt64,
        holecard1: UInt64,
        boardcard0: UInt64,
        boardcard1: UInt64,
        boardcard2: UInt64,
        boardcard3: UInt64,
        boardcard4: UInt64,
        useHolecard0: Bool,
        useHolecard1: Bool,
        useBoardcards0: Bool,
        useBoardcards1: Bool,
        useBoardcards2: Bool,
        useBoardcards3: Bool,
        useBoardcards4: Bool,
        isFlush: Bool,
        playerSecKey: PrivateKey,
        shuffleKey: PrivateKey,
        merkleMapKey: Field,
        merkleMapVal: Field,
        path: MerkleMapWitness,
    ) {

        /*
        Each player has to pass in their holecards, along with all board cards
        And specify which cards are used to make their best 6c hand
    
        To make cheating impossible, we need these checks:
        1. confirm the card lookup key and value are valid entries in the merkle map
        2. independently calculate the card lookup key using their cards and confirm the lookup key is valid
        3. re-hash the cards and confirm it matches their stored hash
        4. check that board cards are the real board cards
        */
        const gamestate = this.gamestate.getAndAssertEquals();
        gamestate.assertLessThanOrEqual(UInt64.from(3));

        // Player card hash will be stored in slot1 or slot1
        const slot0 = this.slot0.getAndAssertEquals();
        const slot1 = this.slot1.getAndAssertEquals();
        // We are going to be storing the product of all the board card primes here!
        const slot2 = this.slot2.getAndAssertEquals();


        // CHECK 0. - make sure player is a part of the game...
        const player = PublicKey.fromPrivateKey(playerSecKey);
        const player1Hash = this.player1Hash.getAndAssertEquals();
        const player2Hash = this.player2Hash.getAndAssertEquals();
        const playerHash = Poseidon.hash(player.toFields());
        playerHash.equals(player1Hash).or(playerHash.equals(player2Hash)).assertTrue('Player is not part of this game!');

        const holecardsHash = Provable.if(
            playerHash.equals(player1Hash),
            slot0,
            slot1
        );

        // CHECK 2. independently calculate the card lookup key using their cards and confirm the lookup key is valid
        // the lookupVal is the expected key for our merkle map
        const lookupVal: UInt64 = this.calcLookupVal(holecard0,
            holecard1,
            boardcard0,
            boardcard1,
            boardcard2,
            boardcard3,
            boardcard4,
            useHolecard0,
            useHolecard1,
            useBoardcards0,
            useBoardcards1,
            useBoardcards2,
            useBoardcards3,
            useBoardcards4)

        const isFlushReal: Bool = this.calcCheckFlush(holecard0,
            holecard1,
            boardcard0,
            boardcard1,
            boardcard2,
            boardcard3,
            boardcard4,
            useHolecard0,
            useHolecard1,
            useBoardcards0,
            useBoardcards1,
            useBoardcards2,
            useBoardcards3,
            useBoardcards4)

        isFlushReal.assertEquals(isFlush, 'Player did not pass in correct flush value!');
        lookupVal.toFields()[0].assertEquals(merkleMapKey, 'Incorrect hand strenght passed in!');

        // CHECK 1. confirm the card lookup key and value are valid entries in the merkle map
        // MerkleMapRootBasic
        // MerkleMapRootFlush
        const root = Provable.if(
            isFlush,
            this.MerkleMapRootFlush,
            this.MerkleMapRootBasic,
        );
        const pathValid = path.computeRootAndKey(merkleMapVal);
        pathValid[0].assertEquals(root);
        pathValid[1].assertEquals(merkleMapKey);

        // CHECK 3. re-hash the cards and confirm it matches their stored hash
        const cardPoint1 = this.cardPrimeToCardPoint(holecard0);
        const cardPoint2 = this.cardPrimeToCardPoint(holecard1);
        const cardPoint1F = cardPoint1.toFields()[0]
        const cardPoint2F = cardPoint2.toFields()[0]
        const cardHash = this.generateHash(cardPoint1F, cardPoint2F, shuffleKey);
        cardHash.assertEquals(holecardsHash, 'Player did not pass in their real cards!');

        // CHECK 4. check that board cards are the real board cards
        const boardcardMul = boardcard0.mul(boardcard1).mul(boardcard2).mul(boardcard3).mul(boardcard4);
        const boardcardMulReal = UInt64.from(slot2);
        boardcardMul.assertEquals(boardcardMulReal);
        // And check that we have 5 boardcards - should not be divisible by null val
        const nullBoardcardUint = UInt64.from(this.NullBoardcard);
        boardcardMulReal.divMod(nullBoardcardUint).rest.equals(UInt64.from(0)).assertFalse();

        // And now we can store the lookup value in the appropriate slot

        // Assuming we made it past all our checks - 
        // We are now storing the merkleMapVal, which represents
        // hand strength in these slots!  Lower is better!
        const slot0New = Provable.if(
            playerHash.equals(player1Hash),
            merkleMapVal,
            slot0,
        );
        const slot1New = Provable.if(
            playerHash.equals(player2Hash),
            merkleMapVal,
            slot1,
        );
        this.slot0.set(slot0New);
        this.slot1.set(slot1New);

        // Description of logic within actionMapping - 
        // transition from 1 to 6 via multiplying by 2 and 3 after each player
        // shows their cards
        const gamestateNew = Provable.if(
            playerHash.equals(player1Hash),
            gamestate.mul(this.P1),
            gamestate.mul(this.P2),
        );

        this.gamestate.set(gamestateNew);
    }

    generateHash(card1: Field, card2: Field, privateKey: PrivateKey): Field {
        // Apply a double hash to get a single value for both cards
        // We'll use this to generate the hash for a given card
        // We'll use the same hash function as the lookup table
        const pkField = privateKey.toFields()[0];
        const round1 = Poseidon.hash([pkField, card1]);
        const round2 = Poseidon.hash([round1, card2]);
        return round2
    }


    decodeCard(epk: PublicKey, msg: PublicKey, shuffleSecret: PrivateKey): PublicKey {
        const d1 = PublicKey.fromGroup(epk.toGroup().scale(Scalar.fromFields(shuffleSecret.toFields())));
        const pubKey = PublicKey.fromGroup(msg.toGroup().sub(d1.toGroup()));
        return pubKey
    }

    @method storeCardHash(slotI: Field, shuffleSecret: PrivateKey, epk1: PublicKey, epk2: PublicKey, msg1: PublicKey, msg2: PublicKey) {
        // Used to store a hash of the player's cards
        // 1. decrypt both cards
        // 2. double hash the resulting value
        // 3. and store the hash in a slot

        // For both players their encrypted card will be stored here
        const slot0 = this.slot0.getAndAssertEquals();
        // these are the cards - should be the same as 'msg' that we passed in
        // but have to pass in 'msg' because we need the secon field
        const msg1F = this.slot1.getAndAssertEquals();
        const msg2F = this.slot2.getAndAssertEquals();

        msg1F.assertEquals(msg1.toFields()[0]);
        msg2F.assertEquals(msg2.toFields()[0]);

        // We are ALWAYS storing the encrypted cards in slots1 and 2

        // Want to decrypt BOTH cards, and multiply them together
        const cardPoint1 = this.decodeCard(epk1, msg1, shuffleSecret)
        const cardPoint2 = this.decodeCard(epk2, msg2, shuffleSecret)
        // This is still a field representation of the card - not the prime52 value!
        const cardPoint1F = cardPoint1.toFields()[0];
        const cardPoint2F = cardPoint2.toFields()[0];
        const cardHash = this.generateHash(cardPoint1F, cardPoint2F, shuffleSecret);

        const slot0New = Provable.if(
            slotI.equals(0),
            cardHash,
            slot0,
        );

        const slot1New = Provable.if(
            slotI.equals(1),
            cardHash,
            Field(0),
        );

        this.slot0.set(slot0New);
        this.slot1.set(slot1New);

        // We'll store board cards in slot2, initialize with all nul values
        const noBoardcards = this.NullBoardcard.mul(this.NullBoardcard).mul(this.NullBoardcard).mul(this.NullBoardcard).mul(this.NullBoardcard)
        this.slot2.set(noBoardcards);
    }

    @method commitCard(slotI: Field, msg: PublicKey) {
        // msg corresponds to the field representation of the msg PublicKey in the mentalpoker Card struct

        // The other player should perform their half of the partialUnmask,
        // and then commit the results here

        // Players can then decrypt their cards, preserving the secrecy of the
        // cards and avoiding the need for a trusted dealer

        const msgF = msg.toFields()[0];

        const slot1 = this.slot1.getAndAssertEquals();
        const slot2 = this.slot2.getAndAssertEquals();
        const slot1New = Provable.if(
            slotI.equals(1),
            msgF,
            slot1,
        );
        const slot2New = Provable.if(
            slotI.equals(2),
            msgF,
            slot2,
        );
        this.slot1.set(slot1New);
        this.slot2.set(slot2New);
    }
}
