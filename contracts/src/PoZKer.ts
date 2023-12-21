import { Field, SmartContract, state, State, method, PublicKey, PrivateKey, Bool, Provable, UInt64, AccountUpdate, Poseidon, MerkleMapWitness } from 'o1js';
import { Cipher, ElGamalFF } from 'o1js-elgamal';


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
    "GameOver": 1,
    // Players 
    "P1": 2,
    "P2": 3,
    // Streets
    "Preflop": 5,
    "Flop": 7,
    "Turn": 11,
    "River": 13,
    "Showdown": 17,
    // Actions
    "Null": 19,
    "Bet": 23,
    "Call": 29,
    "Fold": 31,
    "Raise": 37,
    "Check": 41,
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
}


export class PoZKerApp extends SmartContract {
    GameOver = UInt64.from(actionMapping["GameOver"]);

    P1 = UInt64.from(actionMapping["P1"]);
    P2 = UInt64.from(actionMapping["P2"]);

    Preflop = UInt64.from(actionMapping["Preflop"]);
    Flop = UInt64.from(actionMapping["Flop"]);
    Turn = UInt64.from(actionMapping["Turn"]);
    River = UInt64.from(actionMapping["River"]);
    Showdown = UInt64.from(actionMapping["Showdown"]);

    Null = UInt64.from(actionMapping["Null"]);
    Bet = UInt64.from(actionMapping["Bet"]);
    Call = UInt64.from(actionMapping["Call"]);
    Fold = UInt64.from(actionMapping["Fold"]);
    Raise = UInt64.from(actionMapping["Raise"]);
    Check = UInt64.from(actionMapping["Check"]);

    // This are generated via the genmap script
    MerkleMapRootBasic = Field("27699641125309939543225716816460043210743676221173039607853127025430840122106");
    MerkleMapRootFlush = Field("12839577190240250171319696533609974348200540625786415982151412596597428662991");
    // Hardcode 100 as game size still?
    GameBuyin = UInt64.from(100);
    SmallBlind = UInt64.from(1);
    BigBlind = UInt64.from(1);
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
        const isShowdown = gamestate.divMod(this.Showdown).rest.equals(UInt64.from(0));

        // Can't take any more actions at showdown, all others are ok
        isShowdown.assertFalse('Showdown has been reached');
        isPreflop.or(isFlop).or(isTurn).or(isRiver).assertTrue('Invalid game state street');


        const facingNull = gamestate.divMod(this.Null).rest.equals(UInt64.from(0));
        const facingBet = gamestate.divMod(this.Bet).rest.equals(UInt64.from(0));
        const facingCall = gamestate.divMod(this.Call).rest.equals(UInt64.from(0));
        // This should be impossible, we should be in GameOver state if 'facingFold', and earlier assertion would be hit
        // const facingFold = gamestate.divMod(this.Fold).rest.equals(UInt64.from(0));
        const facingRaise = gamestate.divMod(this.Raise).rest.equals(UInt64.from(0));
        const facingCheck = gamestate.divMod(this.Check).rest.equals(UInt64.from(0));

        facingNull.or(facingBet).or(facingCall).or(facingRaise).or(facingCheck).assertTrue('Invalid game state action');

        // Confirm actions is valid, must be some combination below:
        // actions:
        // Bet - valid when facing [Null, Check]
        // Call - valid when facing [Bet]
        // Fold - valid when facing [Bet, Raise]
        // Raise - valid when facing [Bet]
        // Check - valid when facing [Null, Check]
        let act1 = action.equals(this.Bet).and(facingNull.or(facingCheck));
        let act2 = action.equals(this.Call).and(facingBet);
        let act3 = action.equals(this.Fold).and(facingBet.or(facingRaise));
        let act4 = action.equals(this.Raise).and(facingBet);
        let act5 = action.equals(this.Check).and(facingNull.or(facingCheck));
        act1.or(act2).or(act3).or(act4).or(act5).assertTrue('Invalid bet!');

        // Amount checks/logic:
        // For calls - we are not passing in amount, so we need to figure it out
        // For raises - raise needs to be to a valid size

        const stackDiff = Provable.if(p1turn,
            stack1.sub(stack2),
            stack2.sub(stack1)
        )
        // sanity check...
        stackDiff.assertGreaterThanOrEqual(UInt64.from(0));

        // Betsize constraints:
        // Fold/Check - betsize should be 0
        // Bet - betsize should be gt 1 (or whatever minsize is)
        // Call - betsize should make stacks equal
        // Raise - betsize should be at least equal to diff*2, or all-in

        const foldCheckAmountBool = Provable.if(action.equals(this.Check).or(action.equals(this.Fold)),
            betSize.equals(UInt64.from(0)),
            Bool(true)
        )
        foldCheckAmountBool.assertTrue();

        // Bet - betsize should be gt 1 (or whatever minsize is)
        Provable.if(action.equals(this.Bet),
            UInt64.from(1),
            betSize,
        ).assertGreaterThanOrEqual(UInt64.from(1))

        // Raise - betsize should be at least equal to diff*2, or all-in
        const stackPlusAmount = Provable.if(p1turn,
            stack1.add(betSize),
            stack2.add(betSize)
        )
        const allin: Bool = stackPlusAmount.equals(this.GameBuyin);

        Provable.if(action.equals(this.Raise),
            stackDiff.mul(2).greaterThanOrEqual(betSize).or(allin),
            Bool(true),
        ).assertTrue();

        // Call - betsize should make stacks equal
        // So we might need to override the other betsize here
        const betSizeReal = Provable.if(action.equals(this.Call),
            stackDiff,
            betSize,
        )


        //or(action.equals(Field(Actions.Bet)).and(gamestate.equals(Field(Actions.Null)).or(gamestate.equals(Field(Actions.Check)))).assertTrue('Bet is valid when facing [Null, Check]'));

        // Make sure the player has enough funds to take the action
        const case1 = playerHash.equals(player1Hash).and(betSizeReal.lessThanOrEqual(stack1));
        const case2 = playerHash.equals(player2Hash).and(betSizeReal.lessThanOrEqual(stack2));
        case1.or(case2).assertTrue("Not enough balance for bet!");

        // We'll actually write stack sizes at the end after we check for game over condition
        const stack1New = Provable.if(
            playerHash.equals(player1Hash),
            stack1.sub(betSizeReal),
            stack1
        );

        const stack2New = Provable.if(
            playerHash.equals(player2Hash),
            stack2.sub(betSizeReal),
            stack2
        );

        // Need to check if we've hit the end of the street - transition to next street
        // Scenarios for this would be:
        // 1. Either player has called
        // 2. Player 2 has checked
        const newStreetBool = action.equals(this.Call).or(playerHash.equals(player2Hash).and(action.equals(this.Check)));

        // Is there any way we could simplify this with something like:
        // If newStreetBool and (isPreflop or isTurn) -> Add 2
        // If newStreetBool and (isFlop or isRiver) -> Add 4
        // Else keep same street
        const nextPreflop = Provable.if(isPreflop.and(newStreetBool.not()), Bool(true), Bool(false));
        const nextFlop = Provable.if(isFlop.and(newStreetBool.not()).or(isPreflop.and(newStreetBool)), Bool(true), Bool(false));
        const nextTurn = Provable.if(isTurn.and(newStreetBool.not()).or(isFlop.and(newStreetBool)), Bool(true), Bool(false));
        const nextRiver = Provable.if(isRiver.and(newStreetBool.not()).or(isTurn.and(newStreetBool)), Bool(true), Bool(false));
        const nextShowdown = Provable.if(isRiver.and(newStreetBool), Bool(true), Bool(false));

        const currstreet = Provable.switch(
            [nextPreflop, nextFlop, nextTurn, nextRiver, nextShowdown],
            UInt64,
            [this.Preflop, this.Flop, this.Turn, this.River, this.Showdown]
        );

        // If we did go to the next street, previous action should be 'Null'
        const lastaction = Provable.if(
            newStreetBool,
            this.Null,
            action
        );

        const currplayer = Provable.if(
            newStreetBool.or(p2turn),
            this.P1,
            this.P2
        );

        const gameOverBool = Provable.if(
            action.equals(this.Fold),
            Bool(true),
            Bool(false)
        );

        const currgamestate = Provable.if(
            gameOverBool,
            this.GameOver,
            currstreet.mul(lastaction).mul(currplayer)
        );

        this.gamestate.set(currgamestate);

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
        const gamestate = this.gamestate.getAndAssertEquals();
        gamestate.divMod(this.Showdown).rest.assertEquals(UInt64.from(0));

        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();
        stack1.assertEquals(stack2);

        const p1WinnerBal = stack1.add(this.GameBuyin.sub(stack2));
        const p2WinnerBal = stack2.add(this.GameBuyin.sub(stack1));

        // Convention is we'll have stored player1's lookup value for their hand 
        // in slot0, and player2's lookup value in slot1
        const slot0 = this.slot0.getAndAssertEquals();
        const slot1 = this.slot1.getAndAssertEquals();

        // Lower is better for the hand rankings
        const stack1Final = Provable.if(
            Bool(slot0.lessThan(slot1)),
            p1WinnerBal,
            stack1
        );
        const stack2Final = Provable.if(
            Bool(slot1.lessThan(slot0)),
            p2WinnerBal,
            stack2
        );

        // If we get a tie - split the pot
        const tieAdj = Provable.if(
            Bool(slot0 === slot1),
            this.GameBuyin.sub(stack2),
            UInt64.from(0),
        );
        this.stack1.set(stack1Final.add(tieAdj));
        this.stack2.set(stack2Final.add(tieAdj));

        this.gamestate.set(this.GameOver);
    }

    @method tallyBoardCards(cardPrime52: Field) {
        // Remember - cardPrime52 should be in the 52 format
        // We'll always store the board card product in slot2
        const slot2 = this.slot2.getAndAssertEquals();
        const slot2New = slot2.mul(cardPrime52);
        this.slot2.set(slot2New)
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
        const v1 = Provable.if(useHolecard0, holecard0, UInt64.from(1)).divMod(13).rest;
        const v2 = Provable.if(useHolecard1, holecard1, UInt64.from(1)).divMod(13).rest;
        const v3 = Provable.if(useBoardcards0, boardcard0, UInt64.from(1)).divMod(13).rest;
        const v4 = Provable.if(useBoardcards1, boardcard1, UInt64.from(1)).divMod(13).rest;
        const v5 = Provable.if(useBoardcards2, boardcard2, UInt64.from(1)).divMod(13).rest;
        const v6 = Provable.if(useBoardcards3, boardcard3, UInt64.from(1)).divMod(13).rest;
        const v7 = Provable.if(useBoardcards4, boardcard4, UInt64.from(1)).divMod(13).rest;

        const lookupVal = v1.mul(v2).mul(v3).mul(v4).mul(v5).mul(v6).mul(v7);
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
        // A valid flush lookup will be one in wich all 5 cards have the same quotient when
        // divided by 13
        const v1 = Provable.if(useHolecard0, holecard0, UInt64.from(4)).divMod(13).quotient;
        const v2 = Provable.if(useHolecard1, holecard1, UInt64.from(4)).divMod(13).quotient;
        const v3 = Provable.if(useBoardcards0, boardcard0, UInt64.from(4)).divMod(13).quotient;
        const v4 = Provable.if(useBoardcards1, boardcard1, UInt64.from(4)).divMod(13).quotient;
        const v5 = Provable.if(useBoardcards2, boardcard2, UInt64.from(4)).divMod(13).quotient;
        const v6 = Provable.if(useBoardcards3, boardcard3, UInt64.from(4)).divMod(13).quotient;
        const v7 = Provable.if(useBoardcards4, boardcard4, UInt64.from(4)).divMod(13).quotient;

        let isFlush: Bool = Bool(true);
        for (let x of [v1, v2, v3, v4, v5, v6, v7]) {
            const realX = Provable.if(x.equals(UInt64.from(4)), Bool(false), Bool(true));
            for (let y of [v1, v2, v3, v4, v5, v6, v7]) {
                // Can we do this instead?  Would simplify some logic
                // if (x == y) {
                //     continue
                // }

                // valid quotients are 0, 1, 2, 3
                // we put '4' as our placeholder for unused cards
                // So if values are anything except 4, we should confirm they're the same
                const realY = Provable.if(y.equals(UInt64.from(4)), Bool(false), Bool(true));
                const quotientMatch = Provable.if(realX.and(realY), x.equals(y), Bool(true));
                isFlush = isFlush.and(quotientMatch);
            }

        }
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
        merkleMapKey: Field,
        merkleMapVal: Field,
        path: MerkleMapWitness
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

        // Player card hash will be stored in slot1 or slot1
        const slot0 = this.slot0.getAndAssertEquals();
        const slot1 = this.slot1.getAndAssertEquals();
        // We are going to be storing the product of all the board card primes here!
        const slot2 = this.slot2.getAndAssertEquals();

        // 0 - make sure player is a part of the game...
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

        // 1. confirm the card lookup key and value are valid entries in the merkle map

        // MerkleMapRootBasic, MerkleMapRootFlush

        const holecard0Field = holecard0.toFields()[0];
        const holecard1Field = holecard1.toFields()[0];
        const cardHash = this.generateHash(holecard0Field, holecard1Field, playerSecKey);
        // CHECK 3. re-hash the cards and confirm it matches their stored hash
        cardHash.assertEquals(holecardsHash, 'Player did not pass in their real cards!');


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


        isFlush.assertEquals(isFlushReal, 'Player did not specify hand correctly!');

        lookupVal.toFields()[0].assertEquals(merkleMapKey, 'Player did not pass in their real cards!');

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

        // Prime values of the boardcards
        const boardcard0p = boardcard0.divMod(UInt64.from(13));
        const boardcard1p = boardcard1.divMod(UInt64.from(13));
        const boardcard2p = boardcard2.divMod(UInt64.from(13));
        const boardcard3p = boardcard3.divMod(UInt64.from(13));
        const boardcard4p = boardcard4.divMod(UInt64.from(13));
        const boardcardMul = boardcard0p.rest.mul(boardcard1p.rest).mul(boardcard2p.rest).mul(boardcard3p.rest).mul(boardcard4p.rest)


        const boardcardMulReal = UInt64.from(slot2);
        // CHECK 4. check that board cards are the real board cards
        boardcardMul.assertEquals(boardcardMulReal);


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

    @method storeCardHash(slotI: Field, c2a: Field, c2b: Field, cipherKeys: Field, playerSecKey: PrivateKey) {
        // Used to store a hash of the player's cards
        // 1. decrypt both cards
        // 2. double hash the resulting value
        // 3. and store the hash in a slot

        // For both players their encrypted card will be stored here
        const slot0 = this.slot1.getAndAssertEquals();
        const slot1 = this.slot1.getAndAssertEquals();
        const slot2 = this.slot2.getAndAssertEquals();

        // We are ALWAYS storing the encrypted cards in slots1 and 2

        // Want to decrypt BOTH cards, and multiply them together

        // Need to recreate ciphers - we ONLY stashed the first value before...
        const c1 = new Cipher({ c1: slot1, c2: c2a });
        const c2 = new Cipher({ c1: slot2, c2: c2b });
        const holecard1: Field = ElGamalFF.decrypt(c1, cipherKeys);
        const holecard2: Field = ElGamalFF.decrypt(c2, cipherKeys);

        const cardHash = this.generateHash(holecard1, holecard2, playerSecKey);

        const slot0New = Provable.if(
            slotI.equals(0),
            cardHash,
            slot0,
        );

        const slot1New = Provable.if(
            slotI.equals(1),
            cardHash,
            slot1,
        );

        this.slot0.set(slot0New);
        this.slot1.set(slot1New);

        // We want this to be '1' so we can properly multiply our board values
        this.slot2.set(Field(1));
    }

    @method commitCard(slotI: Field, encryptedCard: Field) {
        // For each player we want to store their encrypyted card in slots 1 and 2
        // and then we'll decrypt it and store the hash

        // Note - encryptedCard will be the 'c1' value of a elgamal Cipher
        // the user will have to pass in the 'c2' value in the decrypt function

        // 'slotI' param is just the memory slot where we will save this card
        slotI.assertLessThanOrEqual(2);
        slotI.assertGreaterThanOrEqual(1);
        const slot1 = this.slot1.getAndAssertEquals();
        const slot2 = this.slot2.getAndAssertEquals();

        const slot1New = Provable.if(
            slotI.equals(1),
            encryptedCard,
            slot1,
        );
        const slot2New = Provable.if(
            slotI.equals(2),
            encryptedCard,
            slot2,
        );

        this.slot1.set(slot1New);
        this.slot2.set(slot2New);
    }
}