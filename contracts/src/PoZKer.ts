import { Field, SmartContract, state, State, method, PublicKey, PrivateKey, Bool, Provable, UInt64, AccountUpdate } from 'o1js';


const enum Actions {
    // We'll use 'Null' when it's the first action on a given street
    Null,
    Bet,
    Call,
    Fold,
    Raise,
    Check,
}

// Hardcode 100 mina as game size
const GAME_BUYIN = 1000000;


export class PoZKerApp extends SmartContract {
    //@state(Field) num = State<Field>();
    //@state(Field) gameHash = State<Field>();
    //@state(Field) gameId = State<Field>();

    // Player balances for the hand
    @state(PublicKey) player1 = State<PublicKey>();
    @state(PublicKey) player2 = State<PublicKey>();
    @state(UInt64) stack1 = State<UInt64>();
    @state(UInt64) stack2 = State<UInt64>();
    @state(UInt64) street = State<UInt64>();
    @state(Field) lastAction = State<Field>();
    @state(Bool) turn = State<Bool>();
    @state(Bool) isGameOver = State<Bool>();
    // @state(PublicKey) winner = State<PublicKey>();

    init() {
        super.init();
        //this.num.set(Field(1));

    }

    @method initState(player1: PublicKey, player2: PublicKey) {
        this.player1.set(player1);
        this.player2.set(player2);
        // For now - player1 always goes first
        this.turn.set(Bool(true));
    }

    @method withdraw(playerSecKey: PrivateKey) {
        // Can ONLY withdraw when the hand is over!
        const isGameOver = this.isGameOver.getAndAssertEquals();
        isGameOver.assertTrue();

        const player1 = this.player1.getAndAssertEquals();
        const player2 = this.player2.getAndAssertEquals();
        const player = PublicKey.fromPrivateKey(playerSecKey);
        const cond0 = player.equals(player1).or(player.equals(player2));
        cond0.assertTrue('Player is not part of this game!')

        // We'll have tallied up the players winnings into their stack, 
        // so both players can withdraw whatever is in their stack when hand ends
        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();

        const sendAmount = Provable.if(
            player.equals(player1),
            stack1,
            stack2
        );

        this.send({ to: player, amount: sendAmount });

        // We have to update the stacks so they cannot withdraw multiple times!
        const stack1New = Provable.if(
            player.equals(player1),
            UInt64.from(0),
            stack1
        );

        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            player.equals(player2),
            UInt64.from(0),
            stack2
        );
        this.stack2.set(stack2New);


    }

    // From https://github.com/o1-labs/o1js/blob/5ca43684e98af3e4f348f7b035a0ad7320d88f3d/src/examples/zkapps/escrow/escrow.ts
    @method deposit(playerSecKey: PrivateKey) {
        // Constraints:
        // Only player1 and player2 can deposit
        // They can only deposit once
        const player1 = this.player1.getAndAssertEquals();
        const player2 = this.player2.getAndAssertEquals();

        const player = PublicKey.fromPrivateKey(playerSecKey);
        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();
        const cond0 = player.equals(player1).or(player.equals(player2));
        cond0.assertTrue('Player is not part of this game!')
        const cond1 = player.equals(player1).and(stack1.equals(UInt64.from(0)));
        const cond2 = player.equals(player2).and(stack2.equals(UInt64.from(0)));
        cond1.or(cond2).assertTrue('Player can only deposit once!');

        const payerUpdate = AccountUpdate.createSigned(player);
        // Hardcode 100 mina as game size
        const amount = UInt64.from(GAME_BUYIN);
        payerUpdate.send({ to: this.address, amount: amount });

        const stack1New = Provable.if(
            player.equals(player1),
            amount,
            stack1
        );
        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            player.equals(player2),
            amount,
            stack2
        );
        this.stack2.set(stack2New);

    }


    @method update() {
        //const currentState = this.num.getAndAssertEquals();
        //const newState = currentState.add(2);
        //this.num.set(newState);
    }

    //Field(Actions.Bet);
    @method takeAction(playerSecKey: PrivateKey, action: Field, betSize: UInt64) {
        // Need to check that it's the current player's turn, 
        // and the action is valid

        //const player = this.sender;
        const player = PublicKey.fromPrivateKey(playerSecKey);

        // Logic modified from https://github.com/betterclever/zk-chess/blob/main/src/Chess.ts
        const player1 = this.player1.getAndAssertEquals();
        const player2 = this.player2.getAndAssertEquals();
        // True if it's player1's turn
        const turn = this.turn.getAndAssertEquals();
        const lastAction = this.lastAction.getAndAssertEquals();

        player
            .equals(player1)
            .and(turn)
            .or(player.equals(player2).and(turn.not()))
            .assertTrue('player is allowed to make the move');

        // Confirm actions is valid, must be some combination below:
        // actions:
        // Bet - valid when facing [Null, Check]
        // Call - valid when facing [Bet]
        // Fold - valid when facing [Bet, Raise]
        // Raise - valid when facing [Bet]
        // Check - valid when facing [Null]

        let act1 = action.equals(Field(Actions.Bet)).and(lastAction.equals(Field(Actions.Null)).or(lastAction.equals(Field(Actions.Check))));
        let act2 = action.equals(Field(Actions.Call)).and(lastAction.equals(Field(Actions.Bet)));
        let act3 = action.equals(Field(Actions.Fold)).and(lastAction.equals(Field(Actions.Bet)).or(lastAction.equals(Field(Actions.Raise))));
        let act4 = action.equals(Field(Actions.Raise)).and(lastAction.equals(Field(Actions.Bet)));
        let act5 = action.equals(Field(Actions.Check)).and(lastAction.equals(Field(Actions.Null)));
        act1.or(act2).or(act3).or(act4).or(act5).assertTrue('Invalid bet!');

        //or(action.equals(Field(Actions.Bet)).and(lastAction.equals(Field(Actions.Null)).or(lastAction.equals(Field(Actions.Check)))).assertTrue('Bet is valid when facing [Null, Check]'));

        action.assertEquals(Field(Actions.Bet));

        // Make sure the player has enough funds to take the action
        const stack1 = this.stack1.getAndAssertEquals();
        const stack2 = this.stack2.getAndAssertEquals();
        const case1 = player.equals(player1).and(betSize < stack1);
        const case2 = player.equals(player2).and(betSize < stack2);
        case1.or(case2).assertTrue("Not enough balance for bet!");

        const stack1New = Provable.if(
            player.equals(player1),
            stack1.sub(betSize),
            stack1
        );
        this.stack1.set(stack1New);

        const stack2New = Provable.if(
            player.equals(player2),
            stack2.sub(betSize),
            stack2
        );
        this.stack2.set(stack2New);

        this.lastAction.set(action);

        // TODO - need to check if we've hit the end of the street - transition to next street
        // TODO - need to check if it's showdown (fold or so on...), transition if so

    }


    showdown() {
        // See who won...

        //const largest = Provable.switch(
        //    [input1largest, input2largest, input3largest],
        //    Int64,
        //    [input1, input2, input3]
        //);

    }





}