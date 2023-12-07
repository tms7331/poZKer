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

    root = Field("706658705228152685713447102194564896352128976013742567056765536952384688062");
    // Hardcode 100 as game size still?
    game_buyin = UInt64.from(100);
    //player1Hash = Field(8879912305210651084592467885807902739034137217445691720217630551894134031710);
    //player2Hash = Field(17608229569872969144485439827417022479409407220457475048103405509470577631109);

    @state(Field) player1Hash = State<Field>();
    @state(Field) player2Hash = State<Field>();
    // Player balances for the hand
    @state(UInt64) stack1 = State<UInt64>();
    @state(UInt64) stack2 = State<UInt64>();
    // Coded game state, logic described at top of file
    @state(Field) gamestate = State<UInt64>();

    // Free memory slots for storing data
    @state(Field) slot0 = State<Field>();
    @state(Field) slot1 = State<Field>();
    @state(Field) slot2 = State<Field>();

    init() {
        super.init();
        // Starting gamestate is always P1's turn preflop, with no previous action
        const currstate = this.P1.mul(this.Preflop).mul(this.Null);
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
        payerUpdate.send({ to: this.address, amount: this.game_buyin });

        const stack1New = Provable.if(
            playerHash.equals(player1Hash),
            this.game_buyin,
            stack1
        );
        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            playerHash.equals(player2Hash),
            this.game_buyin,
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

        //or(action.equals(Field(Actions.Bet)).and(gamestate.equals(Field(Actions.Null)).or(gamestate.equals(Field(Actions.Check)))).assertTrue('Bet is valid when facing [Null, Check]'));

        // Make sure the player has enough funds to take the action
        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();
        const case1 = playerHash.equals(player1Hash).and(betSize.lessThan(stack1));
        const case2 = playerHash.equals(player2Hash).and(betSize.lessThan(stack2));
        case1.or(case2).assertTrue("Not enough balance for bet!");

        const stack1New = Provable.if(
            playerHash.equals(player1Hash),
            stack1.sub(betSize),
            stack1
        );
        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            playerHash.equals(player2Hash),
            stack2.sub(betSize),
            stack2
        );
        this.stack2.set(stack2New);

        // Need to check if we've hit the end of the street - transition to next street
        // Scenarios for this would be:
        // 1. Either player has called
        // 2. Player 2 has checked
        const newStreetBool = action.equals(this.Call).or(playerHash.equals(player2Hash).and(action.equals(this.Check)));

        // Is there any way we could simplify this with something like:
        // If newStreetBool and (isPreflop or isTurn) -> Add 2
        // If newStreetBool and (isFlop or isRiver) -> Add 4
        // Else keep same street
        const nextPreflop = Provable.if(isPreflop.and(!newStreetBool), Bool(true), Bool(false));
        const nextFlop = Provable.if(isFlop.and(!newStreetBool).or(isPreflop.and(newStreetBool)), Bool(true), Bool(false));
        const nextTurn = Provable.if(isTurn.and(!newStreetBool).or(isFlop.and(newStreetBool)), Bool(true), Bool(false));
        const nextRiver = Provable.if(isRiver.and(!newStreetBool).or(isTurn.and(newStreetBool)), Bool(true), Bool(false));
        const nextShowdown = Provable.if(isTurn.and(newStreetBool), Bool(true), Bool(false));

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
        const p1WinnerBal = stack1.add(this.game_buyin.sub(stack2));
        const p2WinnerBal = stack2.add(this.game_buyin.sub(stack1));

        const stack1Final = Provable.if(
            gameOverBool.and(playerHash.equals(player2Hash)),
            p1WinnerBal,
            stack1
        );
        this.stack1.set(stack1Final);
        const stack2Final = Provable.if(
            gameOverBool.and(playerHash.equals(player1Hash)),
            p2WinnerBal,
            stack2
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

        const p1WinnerBal = stack1.add(this.game_buyin.sub(stack2));
        const p2WinnerBal = stack2.add(this.game_buyin.sub(stack1));

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
            this.game_buyin.sub(stack2),
            UInt64.from(0),
        );
        this.stack1.set(stack1Final.add(tieAdj));
        this.stack2.set(stack2Final.add(tieAdj));

        this.gamestate.set(this.GameOver);
    }


    @method tallyBoardCards(cardPrime: Field) {
        // We'll always store the board card product in slot2
        const slot2 = this.slot2.getAndAssertEquals();
        const slot2New = slot2.mul(cardPrime);
        this.slot2.set(slot2New)
    }

    @method showCards(slotI: Field, card1: Field, card2: Field, merkleMapKey: Field, merkleMapVal: Field, playerSecKey: PrivateKey) {
        // Ideally add in merkleWitness: MerkleMapWitness, and confirm that too...
        slotI.assertLessThanOrEqual(1);
        slotI.assertGreaterThanOrEqual(0);
        // Players will have to call this with their claimed cards, along with the lookup value.

        // We need to:
        // 1. confirm the card lookup key and value are valid entries in the merkle map
        // 2. independently calculate the card lookup key using their cards and confirm the lookup key is valid
        // 3. re-hash the cards and confirm it matches their stored hash

        // We are going to be storing the product of all the board card primes here!
        const slot0 = this.slot0.getAndAssertEquals();
        const slot1 = this.slot1.getAndAssertEquals();
        const slot2 = this.slot2.getAndAssertEquals();

        // Check 2
        // TODO - fails - why?
        //const expectedMerkleMapKey = card1.mul(card2).mul(slot2);
        //expectedMerkleMapKey.assertEquals(merkleMapKey);

        // Check 3
        // TODO - also fails - why?
        // const cardHash = this.generateHash(card1, card2, playerSecKey);
        // const compareHash = Provable.if(
        //     slotI.equals(0),
        //     slot0,
        //     slot1,
        // );
        // cardHash.assertEquals(compareHash);

        // Assuming we made it past all our checks - 
        // We are now storing the merkleMapVal, which represents
        // hand strength in these slots!  Lower is better!
        const slot0New = Provable.if(
            slotI.equals(0),
            merkleMapVal,
            slot0,
        );
        const slot1New = Provable.if(
            slotI.equals(1),
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
        const card1: Field = ElGamalFF.decrypt(c1, cipherKeys);
        const card2: Field = ElGamalFF.decrypt(c2, cipherKeys);

        const cardHash = this.generateHash(card1, card2, playerSecKey);

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