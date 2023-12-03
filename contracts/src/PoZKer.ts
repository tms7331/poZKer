import { Field, SmartContract, state, State, method, PublicKey, PrivateKey, Bool, Provable, UInt64, AccountUpdate, Poseidon, MerkleMapWitness } from 'o1js';
import { Cipher, ElGamalFF } from 'o1js-elgamal';


export const enum Streets {
    // We'll use 'Null' when it's the first action on a given street
    Preflop,
    Flop,
    Turn,
    River,
    Showdown,
}

export const enum LastActions {
    // We'll use 'Null' when it's the first action on a given street
    Null,
    // Put P2 actions first, then any value < Bet_P1 means it's actually P1's turn
    Bet_P2,
    Call_P2,
    Fold_P2,
    Raise_P2,
    Check_P2,
    Bet_P1,
    Call_P1,
    Fold_P1,
    Raise_P1,
    Check_P1,
    GameOver,
}

export class PoZKerApp extends SmartContract {
    root = Field("706658705228152685713447102194564896352128976013742567056765536952384688062");
    // Hardcode 100 as game size still?
    game_buyin = UInt64.from(100)
    //player1Hash = Field(8879912305210651084592467885807902739034137217445691720217630551894134031710);
    //player2Hash = Field(17608229569872969144485439827417022479409407220457475048103405509470577631109);
    player1Hash = Field("22815974219453997791270010474514944183100615364023761746135765369464653526436");
    player2Hash = Field("28547674816827136247144956082038810992927179147050935228345113737473207360785");

    // Will combine both player hashes here
    @state(Field) playerHashes = State<Field>();

    //player1Key = PublicKey("B62qkyTq79yooTr4wWUMSYDgxz1DFJstpeoDa2LuLBEF9i9HgUaLMfn");
    //@state(Field) player1Hash = State<Field>();
    //@state(Field) player2Hash = State<Field>();
    // Player balances for the hand
    @state(UInt64) stack1 = State<UInt64>();
    @state(UInt64) stack2 = State<UInt64>();
    // These two are both enums
    @state(Field) lastAction = State<Field>();
    @state(Field) street = State<Field>();

    // Free memory slots for storing data
    @state(Field) slot0 = State<Field>();
    @state(Field) slot1 = State<Field>();
    @state(Field) slot2 = State<Field>();

    init() {
        super.init();
        this.street.set(Field(Streets.Preflop));
        // For now - player1 always goes first
        this.lastAction.set(Field(LastActions.Null));
    }

    // Hardcoded players
    // @method initState(player1: PublicKey, player2: PublicKey) {
    //     //const p1Hash = Poseidon.hash(player1.toFields());
    //     //const p2Hash = Poseidon.hash(player2.toFields());
    //     //this.player1Hash.set(p1Hash);
    //     //this.player2Hash.set(p2Hash);
    // }

    @method withdraw(playerSecKey: PrivateKey) {
        // Can ONLY withdraw when the hand is over!
        const isGameOver = this.lastAction.getAndAssertEquals();
        isGameOver.assertEquals(Field(LastActions.GameOver));

        //const player1Hash = this.player1Hash.getAndAssertEquals();
        //const player2Hash = this.player2Hash.getAndAssertEquals();
        const player = PublicKey.fromPrivateKey(playerSecKey);
        const playerHash = Poseidon.hash(player.toFields());
        const cond0 = playerHash.equals(this.player1Hash).or(playerHash.equals(this.player2Hash));
        cond0.assertTrue('Player is not part of this game!')

        // We'll have tallied up the players winnings into their stack, 
        // so both players can withdraw whatever is in their stack when hand ends
        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();

        const sendAmount = Provable.if(
            playerHash.equals(this.player1Hash),
            stack1,
            stack2
        );

        this.send({ to: player, amount: sendAmount });

        // We have to update the stacks so they cannot withdraw multiple times!
        const stack1New = Provable.if(
            playerHash.equals(this.player1Hash),
            UInt64.from(0),
            stack1
        );

        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            playerHash.equals(this.player2Hash),
            UInt64.from(0),
            stack2
        );
        this.stack2.set(stack2New);
    }

    @method deposit(playerSecKey: PrivateKey) {
        // Constraints:
        // Only player1 and player2 can deposit
        // They can only deposit once
        //const player1Hash = this.player1Hash.getAndAssertEquals();
        //const player2Hash = this.player2Hash.getAndAssertEquals();

        const player = PublicKey.fromPrivateKey(playerSecKey);
        const playerHash = Poseidon.hash(player.toFields());

        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();
        const cond0 = playerHash.equals(this.player1Hash).or(playerHash.equals(this.player2Hash));
        cond0.assertTrue('Player is not part of this game!')
        const cond1 = playerHash.equals(this.player1Hash).and(stack1.equals(UInt64.from(0)));
        const cond2 = playerHash.equals(this.player2Hash).and(stack2.equals(UInt64.from(0)));
        cond1.or(cond2).assertTrue('Player can only deposit once!');

        // From https://github.com/o1-labs/o1js/blob/5ca43684e98af3e4f348f7b035a0ad7320d88f3d/src/examples/zkapps/escrow/escrow.ts
        const payerUpdate = AccountUpdate.createSigned(player);
        // Hardcoded 100 mina as game size
        payerUpdate.send({ to: this.address, amount: this.game_buyin });

        const stack1New = Provable.if(
            playerHash.equals(this.player1Hash),
            this.game_buyin,
            stack1
        );
        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            playerHash.equals(this.player2Hash),
            this.game_buyin,
            stack2
        );
        this.stack2.set(stack2New);
    }

    @method getHolecards(playerSecKey: PrivateKey) {
        const street = this.street.getAndAssertEquals();
        const lastAction = this.lastAction.getAndAssertEquals();
        lastAction.assertEquals(Field(LastActions.Null));
        street.assertEquals(Field(Streets.Preflop));

        const player = PublicKey.fromPrivateKey(playerSecKey);
        //const player1Hash = this.player1Hash.getAndAssertEquals();
        //const player2Hash = this.player2Hash.getAndAssertEquals();
        const playerHash = Poseidon.hash(player.toFields());
        const cond0 = playerHash.equals(this.player1Hash).or(playerHash.equals(this.player2Hash));
        cond0.assertTrue('Player is not part of this game!')

        return [31, 32];
    }

    @method getFlop() {
        const street = this.street.getAndAssertEquals();
        const lastAction = this.lastAction.getAndAssertEquals();
        lastAction.assertEquals(Field(LastActions.Null));
        street.assertEquals(Field(Streets.Flop));
        return [1, 3, 5];
    }

    @method getTurn() {
        const street = this.street.getAndAssertEquals();
        const lastAction = this.lastAction.getAndAssertEquals();
        lastAction.assertEquals(Field(LastActions.Null));
        return 2;
    }

    @method getRiver() {
        const street = this.street.getAndAssertEquals();
        const lastAction = this.lastAction.getAndAssertEquals();
        lastAction.assertEquals(Field(LastActions.Null));
        return 9;
    }


    @method takeAction(playerSecKey: PrivateKey, action: Field, betSize: UInt64) {
        // Need to check that it's the current player's turn, 
        // and the action is valid
        const lastAction = this.lastAction.getAndAssertEquals();
        lastAction.assertNotEquals(LastActions.GameOver, "Game has already finished!");

        const p1turn = lastAction.lessThan(Field(LastActions.Bet_P2));
        const p2turn = p1turn.not();

        //const player = this.sender;
        const player = PublicKey.fromPrivateKey(playerSecKey);

        // Logic modified from https://github.com/betterclever/zk-chess/blob/main/src/Chess.ts
        //const player1Hash = this.player1Hash.getAndAssertEquals();
        //const player2Hash = this.player2Hash.getAndAssertEquals();
        const playerHash = Poseidon.hash(player.toFields());

        playerHash
            .equals(this.player1Hash)
            .and(p1turn)
            .or(playerHash.equals(this.player2Hash).and(p2turn))
            .assertTrue('player is not allowed to make a move');

        // For action logic - if last action was P1, we should subtract 5 so
        // everything can use the x_P2 fields to simplify proof construction
        const lastActionMod = Provable.if(
            lastAction.greaterThan(LastActions.Check_P2),
            lastAction.sub(5),
            lastAction,
        );

        // Confirm actions is valid, must be some combination below:
        // actions:
        // Bet - valid when facing [Null, Check]
        // Call - valid when facing [Bet]
        // Fold - valid when facing [Bet, Raise]
        // Raise - valid when facing [Bet]
        // Check - valid when facing [Null, Check]
        let act1 = action.equals(Field(LastActions.Bet_P2)).and(lastActionMod.equals(Field(LastActions.Null)).or(lastActionMod.equals(Field(LastActions.Check_P2))));
        let act2 = action.equals(Field(LastActions.Call_P2)).and(lastActionMod.equals(Field(LastActions.Bet_P2)));
        let act3 = action.equals(Field(LastActions.Fold_P2)).and(lastActionMod.equals(Field(LastActions.Bet_P2)).or(lastActionMod.equals(Field(LastActions.Raise_P2))));
        let act4 = action.equals(Field(LastActions.Raise_P2)).and(lastActionMod.equals(Field(LastActions.Bet_P2)));
        let act5 = action.equals(Field(LastActions.Check_P2)).and(lastActionMod.equals(Field(LastActions.Null)).or(lastActionMod.equals(Field(LastActions.Check_P2))));
        act1.or(act2).or(act3).or(act4).or(act5).assertTrue('Invalid bet!');

        //or(action.equals(Field(Actions.Bet)).and(lastAction.equals(Field(Actions.Null)).or(lastAction.equals(Field(Actions.Check)))).assertTrue('Bet is valid when facing [Null, Check]'));

        // Make sure the player has enough funds to take the action
        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();
        const case1 = playerHash.equals(this.player1Hash).and(betSize.lessThan(stack1));
        const case2 = playerHash.equals(this.player2Hash).and(betSize.lessThan(stack2));
        case1.or(case2).assertTrue("Not enough balance for bet!");

        const stack1New = Provable.if(
            playerHash.equals(this.player1Hash),
            stack1.sub(betSize),
            stack1
        );
        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            playerHash.equals(this.player2Hash),
            stack2.sub(betSize),
            stack2
        );
        this.stack2.set(stack2New);


        // Need to check if we've hit the end of the street - transition to next street
        // Scenario for this would be:
        // player 2 has checked, or called
        const street = this.street.getAndAssertEquals();

        const newStreet = action.equals(Field(LastActions.Call_P1)).or(playerHash.equals(this.player2Hash).and(action.equals(Field(LastActions.Check_P1))));
        const streetUpdate = Provable.if(
            newStreet,
            street.add(1),
            street
        );
        this.street.set(streetUpdate);
        // If we did go to the next street, previous action should be 'Null'
        const actionMaybeNull = Provable.if(
            newStreet,
            Field(LastActions.Null),
            action
        );
        this.lastAction.set(actionMaybeNull);

        // TODO - logic is definitely flawed, make a pass to fix it...

        // turnGameOver over logic:
        // Someone folds - other player wins, set it to GameOver
        // End of street action - set it to Player1Turn
        // Otherwise - set it to the other player's turn
        const gameOverBool = action.equals(Field(LastActions.Fold_P1));
        const alternate = Provable.if(playerHash.equals(this.player1Hash), Field(1), Field(0));

        // Can only have one (or zero) true value with switch... have to hack values to make this hold
        const cond2 = newStreet.and(gameOverBool.not());
        const cond3 = newStreet.not().and(gameOverBool.not());

        //const turnGameOverVal = Provable.switch(
        //    [gameOverBool, cond2, cond3],
        //    Field,
        //    [Field(LastActions.GameOver), Field(TurnGameOver.Player1Turn), alternate]
        //);
        //this.turnGameOver.set(turnGameOverVal);

        // If game is over - need to send funds to winner
        const p1WinnerBal = stack1.add(this.game_buyin.sub(stack2));
        const p2WinnerBal = stack2.add(this.game_buyin.sub(stack1));

        //const gameOver = turnGameOverVal.equals(Field(LastActions.GameOver));
        // Would be player 2 folding...
        const stack1Final = Provable.if(
            gameOverBool.and(playerHash.equals(this.player2Hash)),
            p1WinnerBal,
            stack1
        );
        this.stack1.set(stack1Final);
        const stack2Final = Provable.if(
            gameOverBool.and(playerHash.equals(this.player1Hash)),
            p2WinnerBal,
            stack2
        );
        this.stack2.set(stack2Final);
    }

    @method showdown() {
        // We should only call this if we actually made it to showdown
        const street = this.street.getAndAssertEquals();
        street.assertEquals(Field(Streets.Showdown));

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

        this.lastAction.set(Field(LastActions.GameOver));
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