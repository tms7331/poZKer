import { Field, SmartContract, state, State, method, PublicKey, PrivateKey, Bool, Provable, UInt64, AccountUpdate, Poseidon } from 'o1js';
import { evaluate_7_cards } from './evaluator7.js';



export const enum Streets {
    // We'll use 'Null' when it's the first action on a given street
    Preflop,
    Flop,
    Turn,
    River,
    Showdown,
}

export const enum Actions {
    // We'll use 'Null' when it's the first action on a given street
    Null,
    Bet,
    Call,
    Fold,
    Raise,
    Check,
}

// combining 'turn' and 'isGameOver' bools to save a slot
export const enum TurnGameOver {
    Player1Turn,
    Player2Turn,
    GameOver,
}

// Hardcode 100 mina as game size
const GAME_BUYIN = 1000000;


export class PoZKerApp extends SmartContract {
    root = Field(706658705228152685713447102194564896352128976013742567056765536952384688062);
    //@state(Field) num = State<Field>();
    //@state(Field) gameHash = State<Field>();
    //@state(Field) gameId = State<Field>();

    // Player balances for the hand
    @state(Field) player1Hash = State<Field>(); // State<PublicKey>();
    @state(Field) player2Hash = State<Field>();
    @state(UInt64) stack1 = State<UInt64>();
    @state(UInt64) stack2 = State<UInt64>();
    //@state(Bool) turn = State<Bool>();
    //@state(Bool) isGameOver = State<Bool>();
    @state(Field) turnGameOver = State<Field>();
    // These two are both actually enums
    @state(Field) lastAction = State<Field>();
    @state(Field) street = State<Field>();
    // @state(PublicKey) winner = State<PublicKey>();

    init() {
        super.init();
        this.street.set(Field(Streets.Preflop));
        // For now - player1 always goes first
        this.turnGameOver.set(Field(0));
    }

    @method initState(player1: PublicKey, player2: PublicKey) {
        const p1Hash = Poseidon.hash(player1.toFields());
        const p2Hash = Poseidon.hash(player2.toFields());
        this.player1Hash.set(p1Hash);
        this.player2Hash.set(p2Hash);
    }

    @method withdraw(playerSecKey: PrivateKey) {
        // Can ONLY withdraw when the hand is over!
        const isGameOver = this.turnGameOver.getAndAssertEquals();
        isGameOver.assertEquals(Field(2));

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
        // Hardcode 100 mina as game size
        const amount = UInt64.from(GAME_BUYIN);
        payerUpdate.send({ to: this.address, amount: amount });

        const stack1New = Provable.if(
            playerHash.equals(player1Hash),
            amount,
            stack1
        );
        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            playerHash.equals(player2Hash),
            amount,
            stack2
        );
        this.stack2.set(stack2New);
    }

    @method getHolecards(playerSecKey: PrivateKey) {
        const street = this.street.getAndAssertEquals();
        const lastAction = this.lastAction.getAndAssertEquals();
        lastAction.assertEquals(Field(Actions.Null));
        street.assertEquals(Field(Streets.Preflop));

        const player = PublicKey.fromPrivateKey(playerSecKey);
        const player1Hash = this.player1Hash.getAndAssertEquals();
        const player2Hash = this.player2Hash.getAndAssertEquals();
        const playerHash = Poseidon.hash(player.toFields());
        const cond0 = playerHash.equals(player1Hash).or(playerHash.equals(player2Hash));
        cond0.assertTrue('Player is not part of this game!')

        return [31, 32];
    }

    @method getFlop() {
        const street = this.street.getAndAssertEquals();
        const lastAction = this.lastAction.getAndAssertEquals();
        lastAction.assertEquals(Field(Actions.Null));
        street.assertEquals(Field(Streets.Flop));
        return [1, 3, 5];
    }

    @method getTurn() {
        const street = this.street.getAndAssertEquals();
        const lastAction = this.lastAction.getAndAssertEquals();
        lastAction.assertEquals(Field(Actions.Null));
        return 2;
    }

    @method getRiver() {
        const street = this.street.getAndAssertEquals();
        const lastAction = this.lastAction.getAndAssertEquals();
        lastAction.assertEquals(Field(Actions.Null));
        return 9;
    }


    @method takeAction(playerSecKey: PrivateKey, action: Field, betSize: UInt64) {
        // Need to check that it's the current player's turn, 
        // and the action is valid
        const turn = this.turnGameOver.getAndAssertEquals();
        turn.assertLessThan(2, "Game has already finished!");

        //const player = this.sender;
        const player = PublicKey.fromPrivateKey(playerSecKey);

        // Logic modified from https://github.com/betterclever/zk-chess/blob/main/src/Chess.ts
        const player1Hash = this.player1Hash.getAndAssertEquals();
        const player2Hash = this.player2Hash.getAndAssertEquals();
        const playerHash = Poseidon.hash(player.toFields());
        const lastAction = this.lastAction.getAndAssertEquals();

        playerHash
            .equals(player1Hash)
            .and(turn.equals(0))
            .or(playerHash.equals(player2Hash).and(turn.equals(1)))
            .assertTrue('player is allowed to make the move');

        // Confirm actions is valid, must be some combination below:
        // actions:
        // Bet - valid when facing [Null, Check]
        // Call - valid when facing [Bet]
        // Fold - valid when facing [Bet, Raise]
        // Raise - valid when facing [Bet]
        // Check - valid when facing [Null, Check]
        let act1 = action.equals(Field(Actions.Bet)).and(lastAction.equals(Field(Actions.Null)).or(lastAction.equals(Field(Actions.Check))));
        let act2 = action.equals(Field(Actions.Call)).and(lastAction.equals(Field(Actions.Bet)));
        let act3 = action.equals(Field(Actions.Fold)).and(lastAction.equals(Field(Actions.Bet)).or(lastAction.equals(Field(Actions.Raise))));
        let act4 = action.equals(Field(Actions.Raise)).and(lastAction.equals(Field(Actions.Bet)));
        let act5 = action.equals(Field(Actions.Check)).and(lastAction.equals(Field(Actions.Null)).or(lastAction.equals(Field(Actions.Check))));
        act1.or(act2).or(act3).or(act4).or(act5).assertTrue('Invalid bet!');

        //or(action.equals(Field(Actions.Bet)).and(lastAction.equals(Field(Actions.Null)).or(lastAction.equals(Field(Actions.Check)))).assertTrue('Bet is valid when facing [Null, Check]'));

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
        // Scenario for this would be:
        // player 2 has checked, or called

        const street = this.street.getAndAssertEquals();

        // TODO - this logic is flawed!
        // player 1 can also end action with a call if it goes: Bet Raise Call
        const endAction = action.equals(Field(Actions.Call)).or(action.equals(Field(Actions.Check)));
        const newStreet = playerHash.equals(player2Hash).and(endAction);
        const streetUpdate = Provable.if(
            newStreet,
            street.add(1),
            street
        );
        this.street.set(streetUpdate);
        // If we did go to the next street, previous action should be 'Null'
        const actionMaybeNull = Provable.if(
            playerHash.equals(player2Hash).and(endAction),
            Field(Actions.Null),
            action
        );
        this.lastAction.set(actionMaybeNull);

        // turnGameOver over logic:
        // Someone folds - other player wins, set it to GameOver
        // End of street action - set it to Player1Turn
        // Otherwise - set it to the other player's turn
        const gameOverBool = action.equals(Field(Actions.Fold));
        const alternate = Provable.if(playerHash.equals(player1Hash), Field(1), Field(0));

        // Can only have one (or zero) true value with switch... have to hack values to make this hold
        const cond2 = newStreet.and(gameOverBool.not());
        const cond3 = newStreet.not().and(gameOverBool.not());

        const turnGameOverVal = Provable.switch(
            [gameOverBool, cond2, cond3],
            Field,
            [Field(TurnGameOver.GameOver), Field(TurnGameOver.Player1Turn), alternate]
        );
        this.turnGameOver.set(turnGameOverVal);

        // If game is over - need to send funds to winner
        const startingBal = UInt64.from(GAME_BUYIN);
        const p1WinnerBal = stack1.add(startingBal.sub(stack2));
        const p2WinnerBal = stack2.add(startingBal.sub(stack1));

        const gameOver = turnGameOverVal.equals(Field(TurnGameOver.GameOver));
        // Would be player 2 folding...
        const stack1Final = Provable.if(
            gameOver.and(playerHash.equals(player2Hash)),
            p1WinnerBal,
            stack1
        );
        this.stack1.set(stack1Final);
        const stack2Final = Provable.if(
            gameOver.and(playerHash.equals(player1Hash)),
            p2WinnerBal,
            stack2
        );
        this.stack2.set(stack2Final);
    }

    @method showdown(v1: Field, v2: Field) {
        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();
        stack1.assertEquals(stack2);

        // Do accounting for showdowno

        //const cardMap0 = { 0: 1, 2: 3, 4: 5 }
        //const cardMap1 = { Field(0): 1, Field(2): 3, Field(4: ) 5 }
        //const conv = cardMap0[c1];
        //const conv = cardMap0[c1.toNumber()];


        // Try and use external js library first
        //let val1 = evaluate_7_cards(c1.toBigInt(), c2.toBigInt(), c5.toBigInt(), c6.toBigInt(), c7.toBigInt(), c8.toBigInt(), c9.toBigInt());
        //let val2 = evaluate_7_cards(c3, c4, c5, c6, c7, c8, c9);
        //let val2 = evaluate_7_cards(c3, c4, c5, c6, c7, c8, c9);

        // Player1 wins - send funds to player1

        const startingBal = UInt64.from(GAME_BUYIN);
        const p1WinnerBal = stack1.add(startingBal.sub(stack2));
        const p2WinnerBal = stack2.add(startingBal.sub(stack1));

        // Lower is better for the hand rankings
        const stack1Final = Provable.if(
            Bool(v1.lessThan(v2)),
            p1WinnerBal,
            stack1
        );
        const stack2Final = Provable.if(
            Bool(v2.lessThan(v1)),
            p2WinnerBal,
            stack2
        );

        // If we get a tie - split the pot
        const tieAdj = Provable.if(
            Bool(v2 === v1),
            startingBal.sub(stack2),
            UInt64.from(0),
        );
        this.stack1.set(stack1Final.add(tieAdj));
        this.stack2.set(stack2Final.add(tieAdj));

        this.turnGameOver.set(Field(TurnGameOver.GameOver));

    }
}