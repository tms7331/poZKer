import { RuntimeModule, runtimeModule, state, runtimeMethod } from "@proto-kit/module";
import { State, assert, StateMap, Option } from "@proto-kit/protocol";
import { UInt32 } from "@proto-kit/library";
import { PublicKey, PrivateKey, Poseidon, Field, Bool, Provable, MerkleMapWitness, Scalar } from "o1js";

// Want a mapping for cards, each represented as a prime so we can multiply
// them together and get a unique value
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

@runtimeModule()
export class PoZKerApp extends RuntimeModule<unknown> {

  // we need P1Turn*P2Turn*ShowdownPending = ShowdownComplete
  P1Turn = Field(2);
  P2Turn = Field(3);

  ShowdownPending = Field(1);
  ShowdownComplete = Field(6);
  Preflop = Field(2);
  Flop = Field(3);
  Turn = Field(4);
  River = Field(5);

  Null = Field(0);
  Bet = Field(1);
  Call = Field(2);
  Fold = Field(3);
  Raise = Field(4);
  Check = Field(5);
  PreflopCall = Field(6);
  PostSB = Field(7);
  PostBB = Field(8);

  NullBoardcard = Field(cardMapping52[""]);

  // This are generated via the genmap script
  MerkleMapRootBasic = Field("27699641125309939543225716816460043210743676221173039607853127025430840122106");
  MerkleMapRootFlush = Field("12839577190240250171319696533609974348200540625786415982151412596597428662991");
  // Hardcode 100 as game size
  // Say game is 1/2, players can buy in from 20 to 200
  MinBuyin = Field(20);
  MaxBuyin = Field(200);
  SmallBlind = Field(1);
  BigBlind = Field(2);

  @state() public player1Key = State.from<PublicKey>(PublicKey);
  @state() public player2Key = State.from<PublicKey>(PublicKey);

  // Free memory slots for storing data
  @state() public slot0 = State.from<Field>(Field);
  @state() public slot1 = State.from<Field>(Field);
  @state() public slot2 = State.from<Field>(Field);
  @state() public slot3 = State.from<Field>(Field);
  @state() public slot4 = State.from<Field>(Field);

  // Coded game state, contains packed data:
  // stack1, stack2, turn, street, lastAction, gameOver
  // Store gamestate as a FIELD instead, to address challenges calling .get from frontend
  // @state(Gamestate) gamestate = State<Gamestate>();
  @state() public stack1 = State.from<Field>(Field);
  @state() public stack2 = State.from<Field>(Field);
  @state() public turn = State.from<Field>(Field);
  @state() public street = State.from<Field>(Field);
  @state() public lastAction = State.from<Field>(Field);
  @state() public lastBetSize = State.from<Field>(Field);
  @state() public gameOver = State.from<Bool>(Bool);
  @state() public pot = State.from<Field>(Field);

  init() {
    // super.init();
    // Starting gamestate is always P2's turn preflop, with P1 having posted small blind
    this.stack1.set(Field(0));
    this.stack2.set(Field(0));
    this.turn.set(this.P1Turn);
    this.street.set(this.Preflop);
    this.lastAction.set(this.Bet);
    this.gameOver.set(Bool(false));
    this.pot.set(Field(0));
    this.lastBetSize.set(Field(0));

    // Initialize with 0s so we can tell when two players have joined
    this.player1Key.set(PublicKey.empty());
    this.player2Key.set(PublicKey.empty());

    // Temp - just want to use this to experiment with pulling data
    this.slot4.set(Field(42));
    // Temp - hardcode cards for each player
    // this.storeHardcodedCards();
    // Temp - hardcoding board cards
    // "Kc": 163,
    // "Ac": 167,
    // "Qs": 229,
    // "8s": 199,
    // "6s": 193,
    // 163*167*229*199*193 = 239414220863
    this.slot2.set(Field(239414220863))
  }

  @runtimeMethod()
  public resetTableState(): void {
    // Should call this on init too, but want to let players reset the game state
    this.turn.set(this.P1Turn);
    this.street.set(this.Preflop);
    this.lastAction.set(this.Null);
    this.gameOver.set(Bool(false));
  }

  @runtimeMethod()
  public joinTable(seatI: Field, depositAmount: Field): void {
    // seatI is index of seat they're joining - now should be 0 or 1...
    const player: PublicKey = this.transaction.sender.value;
    const seatOk: Bool = seatI.equals(Field(0)).or(seatI.equals(Field(1)));
    assert(seatOk, "Not a valid seat!");

    const player1Key = this.player1Key.get().value;
    const player2Key = this.player2Key.get().value;

    // If seat is free, should be the empty key
    const seatFree: Bool = Provable.if(seatI.equals(Field(0)),
      player1Key.equals(PublicKey.empty()),
      player2Key.equals(PublicKey.empty()),
    )
    assert(seatFree, "Seat is not available!");

    const p1KeyWrite: PublicKey = Provable.if(seatI.equals(Field(0)),
      player,
      player1Key
    )
    const p2KeyWrite: PublicKey = Provable.if(seatI.equals(Field(1)),
      player,
      player2Key
    )
    this.player1Key.set(p1KeyWrite);
    this.player2Key.set(p2KeyWrite);

    this.deposit(seatI, depositAmount);
  }

  private deposit(seatI: Field, depositAmount: Field): void {
    // Method is only called when joining table
    // When this is called we will already have verified that seat is free
    const stack1: Field = this.stack1.get().value;
    const stack2: Field = this.stack2.get().value;
    const stack1New = Provable.if(
      seatI.equals(Field(0)),
      depositAmount,
      stack1
    );
    const stack2New = Provable.if(
      seatI.equals(Field(1)),
      depositAmount,
      stack2
    );
    this.stack1.set(stack1New);
    this.stack2.set(stack2New);

    // From https://github.com/o1-labs/o1js/blob/5ca43684e98af3e4f348f7b035a0ad7320d88f3d/src/examples/zkapps/escrow/escrow.ts
    // const payerUpdate = AccountUpdate.createSigned(player);

    // TEMP - disabling this so we can test game without needing to send funds
    // payerUpdate.send({ to: this.address, amount: gameBuyin64 });
  }

  @runtimeMethod()
  public withdraw(): void {
    // Can ONLY withdraw when the hand is over!
    // const [stack1, stack2, turn, street, lastAction, lastBetSize, gameOver, pot] = this.getGamestate();
    const stack1: Field = this.stack1.get().value;
    const stack2: Field = this.stack2.get().value;
    const gameOver = this.gameOver.get().value;
    const pot = this.pot.get().value;
    // gameOver.assertTrue('Game is not over!');
    assert(gameOver, 'Game is not over!');

    // Sanity check - pot should have been awarded by this time...
    // pot.equals(Field(0)).assertTrue("Pot has not been awarded!");
    assert(pot.equals(Field(0)), "Pot has not been awarded!");

    const player1Key = this.player1Key.get().value;
    const player2Key = this.player2Key.get().value;

    const player: PublicKey = this.transaction.sender.value;
    const cond0 = player.equals(player1Key).or(player.equals(player2Key));
    // cond0.assertTrue('Player is not part of this game!')
    assert(cond0, 'Player is not part of this game!');

    // We'll have tallied up the players winnings into their stack, 
    // so both players can withdraw whatever is in their stack when hand ends
    const sendAmount = Provable.if(
      player.equals(player1Key),
      stack1,
      stack2
    );

    // TEMP - disabling this so we can test game without needing to send funds
    // this.send({ to: player, amount: sendAmount.toUInt64() });

    // We have to update the stacks so they cannot withdraw multiple times!
    const stack1New = Provable.if(
      player.equals(player1Key),
      Field(0),
      stack1
    );

    const stack2New = Provable.if(
      player.equals(player2Key),
      Field(0),
      stack2
    );

    // We want to reset the gamestate once both players have withdrawn,
    // so we can use the contract for another hand
    const player1KeyNew = Provable.if(
      player.equals(player1Key),
      PublicKey.empty(),
      player1Key
    );
    const player2KeyNew = Provable.if(
      player.equals(player2Key),
      PublicKey.empty(),
      player2Key
    );
    this.player1Key.set(player1KeyNew);
    this.player2Key.set(player2KeyNew);

    const turnReset: Field = this.P1Turn;
    const streetReset: Field = this.Preflop;
    const lastActionReset: Field = this.Bet;

    // Check that both players have been reset to reset game
    // We can't check stack sizes because if one player goes bust, 
    // both stacks will be 0 after the winner calls
    const gameShouldReset: Bool = player1KeyNew.equals(PublicKey.empty()).and(player2KeyNew.equals(PublicKey.empty()));
    const gameOverNew = Provable.if(gameShouldReset, Bool(false), Bool(true));

    const newLastBetSize = Field(0);
    this.stack1.set(stack1New);
    this.stack2.set(stack2New);

    this.turn.set(turnReset);
    this.street.set(streetReset);
    this.lastAction.set(lastActionReset);
    this.lastBetSize.set(newLastBetSize);
    this.gameOver.set(gameOverNew);
    this.pot.set(pot);

    // TEMP - when game is over, reset player cards for next hand
    // this.storeHardcodedCards();
  }


  @runtimeMethod()
  public takeAction(action: Field, betSize: Field): void {

    // add handling for these...
    // PostSB = Field(7);
    // PostBB = Field(8);


    // Need to check that it's the current player's turn, 
    // and the action is valid
    const stack1: Field = this.stack1.get().value;
    const stack2: Field = this.stack2.get().value;
    const gameOver = this.gameOver.get().value;
    const turn = this.turn.get().value;
    const street = this.street.get().value;
    const lastAction = this.lastAction.get().value;
    const pot = this.pot.get().value;

    // gameOver.assertFalse('Game has already finished!');
    assert(gameOver.not(), 'Game has already finished!');

    // Want these as bools to simplify checks
    const p1turn: Bool = turn.equals(this.P1Turn);
    const p2turn: Bool = turn.equals(this.P2Turn);
    // p1turn.or(p2turn).assertTrue('Invalid game state player');
    assert(p1turn.or(p2turn), 'Invalid game state player');

    const player: PublicKey = this.transaction.sender.value;

    // Logic modified from https://github.com/betterclever/zk-chess/blob/main/src/Chess.ts
    const player1Key = this.player1Key.get().value;
    const player2Key = this.player2Key.get().value;
    const playerOk: Bool = player
      .equals(player1Key)
      .and(p1turn)
      .or(player.equals(player2Key).and(p2turn))
    assert(playerOk, 'Player is not allowed to make a move')
    //.assertTrue('Player is not allowed to make a move');

    const isPreflop = street.equals(this.Preflop);
    const isFlop = street.equals(this.Flop)
    const isTurn = street.equals(this.Turn)
    const isRiver = street.equals(this.River)
    //isPreflop.or(isFlop).or(isTurn).or(isRiver).assertTrue('Invalid game state street');
    assert(isPreflop.or(isFlop).or(isTurn).or(isRiver), 'Invalid game state street');

    const facingSB = lastAction.equals(this.PostSB);
    const facingBB = lastAction.equals(this.PostBB);
    const facingNull = lastAction.equals(this.Null);
    const facingBet = lastAction.equals(this.Bet);
    const facingCall = lastAction.equals(this.Call);
    const facingRaise = lastAction.equals(this.Raise);
    const facingCheck = lastAction.equals(this.Check);
    const facingPreflopCall = lastAction.equals(this.PreflopCall);
    // facingFold is impossible - we'd be in showdown state
    //facingNull.or(facingBet).or(facingCall).or(facingRaise).or(facingCheck).or(facingPreflopCall).assertTrue('Invalid game state action');
    assert(facingSB.or(facingBB).or(facingNull).or(facingBet).or(facingCall).or(facingRaise).or(facingCheck).or(facingPreflopCall), 'Invalid game state action');

    // Confirm actions is valid, must be some combination below:
    // actions:
    // Bet - valid when facing [Null, Check]
    // Call - valid when facing [Bet, Raise, PostBB]
    // Fold - valid when facing [Bet, Raise]
    // Raise - valid when facing [Bet, Raise, PreflopCall, PostBB]
    // Check - valid when facing [Null, Check, PreflopCall]
    // PostSB - valid when facing [Null] and street==preflop
    // PostBB - valid when facing [PostSB] and street==preflop
    const act1 = action.equals(this.Bet).and(facingNull.or(facingCheck));
    const act2 = action.equals(this.Call).and(facingBet.or(facingRaise).or(facingBB));
    const act3 = action.equals(this.Fold).and(facingBet.or(facingRaise));
    const act4 = action.equals(this.Raise).and(facingBet.or(facingRaise).or(facingPreflopCall).or(facingBB));
    const act5 = action.equals(this.Check).and(facingNull.or(facingCheck).or(facingPreflopCall));
    // Blinds...
    const act6 = action.equals(this.PostSB).and(facingNull).and(street.equals(this.Preflop));
    const act7 = action.equals(this.PostBB).and(facingSB);
    const act8 = action.equals(this.PreflopCall).and(facingBB);

    //act1.or(act2).or(act3).or(act4).or(act5).assertTrue('Invalid bet!');
    assert(act1.or(act2).or(act3).or(act4).or(act5).or(act6).or(act7).or(act8), 'Invalid bet!');

    // Amount checks/logic:
    // For calls - we are not passing in amount, so we need to figure it out
    // For raises - raise needs to be to a valid size

    // If stack1 99 and stack2 90, returns 9
    //const stackDiff = this.uint_subtraction(p1turn, stack1, stack2, stack2, stack1);
    const stackDiff = Provable.if(p1turn,
      stack1.sub(stack2),
      stack2.sub(stack1));

    // We get an error on underflows so this is always true
    // stackDiff.assertGreaterThanOrEqual(Field(0), "");

    // Betsize constraints:
    // Fold/Check - betsize should be 0
    // Bet - betsize should be gt 1 (or whatever minsize is)
    // Call - betsize should make stacks equal
    // Raise - betsize should be at least equal to diff*2, or all-in

    const foldCheckAmountBool = Provable.if(action.equals(this.Check).or(action.equals(this.Fold)),
      betSize.equals(Field(0)),
      Bool(true)
    )
    //foldCheckAmountBool.assertTrue("Bad betsize for check or fold!");
    assert(foldCheckAmountBool, "Bad betsize for check or fold!");

    // Bet - betsize should be gt 1 (or whatever minsize is)
    const actionF: Field = Provable.if(action.equals(this.Bet),
      betSize,
      Field(1),
    )  // .assertGreaterThanOrEqual(Field(1), "Invalid bet size!")
    assert(actionF.greaterThanOrEqual(Field(1)), "Invalid bet size!");

    // Hardcode sizes for preflop betsize...
    // TODO - improve this logic, better to not force them to pass it in
    const preflopBetA = Provable.if(action.equals(this.PostSB),
      betSize.equals(Field(1)),
      Bool(true));
    const preflopBetB = Provable.if(action.equals(this.PostBB),
      betSize.equals(Field(2)),
      Bool(true));
    assert(preflopBetA.and(preflopBetB), "Bad preflop betsize!");

    // Call - betsize should make stacks equal
    // So we might need to override the other betsize here
    const betSizeReal = Provable.if(action.equals(this.Call).or(action.equals(this.PreflopCall)),
      stackDiff,
      betSize,
    )

    const compareStack = Provable.if(p1turn,
      stack1,
      stack2)

    // betSizeReal.assertLessThanOrEqual(compareStack, "Cannot bet more than stack!");
    assert(betSizeReal.lessThanOrEqual(compareStack), "Cannot bet more than stack!");
    const allin: Bool = betSizeReal.equals(compareStack);

    const raiseOk: Bool = Provable.if(action.equals(this.Raise),
      betSize.greaterThanOrEqual(stackDiff.mul(2)).or(allin),
      Bool(true),
    )
    //.assertTrue("Invalid raise amount!");
    assert(raiseOk, "Invalid raise amount!");


    // Make sure the player has enough funds to take the action
    const case1 = player.equals(player1Key).and(betSizeReal.lessThanOrEqual(stack1));
    const case2 = player.equals(player2Key).and(betSizeReal.lessThanOrEqual(stack2));
    // case1.or(case2).assertTrue("Not enough balance for bet!");
    assert(case1.or(case2), "Not enough balance for bet!");


    // const stack1New = this.uint_subtraction(playerHash.equals(player1Hash),
    //   stack1, betSizeReal,
    //   stack1, UInt32.from(0));
    // const stack2New = this.uint_subtraction(playerHash.equals(player2Hash),
    //   stack2, betSizeReal,
    //   stack2, UInt32.from(0));
    const stack1New = Provable.if(player.equals(player1Key),
      stack1.sub(betSizeReal),
      stack1.sub(Field(0)));
    const stack2New = Provable.if(player.equals(player2Key),
      stack2.sub(betSizeReal),
      stack2.sub(Field(0)));

    // Need to check if we've hit the end of the street - transition to next street
    // Scenarios for this would be:
    // 1. Either player has called - (but not the PreflopCall)
    // 2. Player 2 has checked
    const newStreetBool = action.equals(this.Call).or(player.equals(player2Key).and(action.equals(this.Check)));

    // Is there any way we could simplify this with something like:
    // If newStreetBool and (isPreflop or isTurn) -> Add 2
    // If newStreetBool and (isFlop or isRiver) -> Add 4
    // Else keep same street
    // Showdown takes priority over other logic
    const nextShowdownEnd = Provable.if(isRiver.and(newStreetBool), Bool(true), Bool(false));
    // Additional scenario where we can have a showdown - both allin
    const nextShowdownAllin = stack1New.equals(Field(0)).and(stack2New.equals(Field(0)));
    const nextShowdown = nextShowdownEnd.or(nextShowdownAllin);
    const nextPreflop = Provable.if(nextShowdown.not().and(isPreflop.and(newStreetBool.not())), Bool(true), Bool(false));
    const nextFlop = Provable.if(nextShowdown.not().and(isFlop.and(newStreetBool.not()).or(isPreflop.and(newStreetBool))), Bool(true), Bool(false));
    const nextTurn = Provable.if(nextShowdown.not().and(isTurn.and(newStreetBool.not()).or(isFlop.and(newStreetBool))), Bool(true), Bool(false));
    const nextRiver = Provable.if(nextShowdown.not().and(isRiver.and(newStreetBool.not()).or(isTurn.and(newStreetBool))), Bool(true), Bool(false));

    const currStreet = Provable.switch(
      [nextPreflop, nextFlop, nextTurn, nextRiver, nextShowdown],
      Field,
      [this.Preflop, this.Flop, this.Turn, this.River, this.ShowdownPending]
    );

    // ISSUE - if i's showdown pending, wee want to override value...

    // If we did go to the next street, previous action should be 'Null'
    const facingAction = Provable.if(
      newStreetBool,
      this.Null,
      action
    );

    const playerTurnNow = Provable.if(
      newStreetBool.or(p2turn),
      this.P1Turn,
      this.P2Turn
    );

    const gameOverNow: Bool = Provable.if(
      action.equals(this.Fold),
      Bool(true),
      Bool(false)
    )

    // If game is over from a fold - need to send funds to winner
    const p1WinnerBal = stack1.add(pot);
    const p2WinnerBal = stack2.add(pot);


    const stack1Final = Provable.if(
      gameOverNow.equals(Bool(true)).and(player.equals(player2Key)),
      p1WinnerBal,
      stack1New
    );
    const stack2Final = Provable.if(
      gameOverNow.equals(Bool(true)).and(player.equals(player1Key)),
      p2WinnerBal,
      stack2New
    );

    const potNew = Provable.if(
      gameOverNow.equals(Bool(true)),
      Field(0),
      pot.add(betSizeReal)
    );

    // TODO - double check logic - any other scenarios we should reset lastBetSize?
    const newLastBetSize = Provable.if(
      action.equals(this.Call),
      Field(0),
      betSizeReal
    )

    this.stack1.set(stack1Final);
    this.stack2.set(stack2Final);
    this.turn.set(playerTurnNow);
    this.street.set(currStreet);
    this.lastAction.set(facingAction);
    this.lastBetSize.set(newLastBetSize);
    this.gameOver.set(gameOverNow);
    this.pot.set(potNew);
  }

  @runtimeMethod()
  public showdown(): void {
    // We should only call this if we actually made it to showdown
    // const [stack1, stack2, turn, street, lastAction, lastBetSize, gameOver, pot] = this.getGamestate();
    const stack1: Field = this.stack1.get().value;
    const stack2: Field = this.stack2.get().value;
    const pot: Field = this.pot.get().value;
    const street: Field = this.street.get().value;

    //street.equals(this.ShowdownComplete).assertTrue("Invalid showdown gamestate!");
    assert(street.equals(this.ShowdownComplete), "Invalid showdown gamestate!");

    // This is no longer true if players can start with different stacks!
    // Sanity check - if it's a showdown both stacks must be equal
    // stack1.equals(stack2).assertTrue("Invalid showdown gamestate!");

    const p1WinnerBal = stack1.add(pot);
    const p2WinnerBal = stack2.add(pot);

    // Convention is we'll have stored player1's lookup value for their hand 
    // in slot0, and player2's lookup value in slot1
    const slot0 = this.slot0.get().value;
    const slot1 = this.slot1.get().value;

    // If we get a tie - split the pot
    const tieAdj = Provable.if(
      Bool(slot0 === slot1),
      // pot should always be evenly divisible by 2
      pot.div(Field(2)),
      Field(0),
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

    const potNew = Field(0);
    // this.setGamestate(stack1Final, stack2Final, turn, street, lastAction, lastBetSize, Bool(true), potNew);

    this.stack1.set(stack1Final);
    this.stack2.set(stack2Final);
    this.gameOver.set(Bool(true));
    this.pot.set(potNew);

  }

  cardPrimeToCardPoint(cardPrime: Field): PublicKey {
    /*
    Players will pass in the prime52 value of their card, we want to get
    the publickey, the cardPoint, associated with that card, so we can
    ensure the cards they passed in are the cards that were committed
   
    Code to generate this mapping is in gameutils
    */
    const cardPoint = Provable.switch([cardPrime.equals(Field(2)),
    cardPrime.equals(Field(3)),
    cardPrime.equals(Field(5)),
    cardPrime.equals(Field(7)),
    cardPrime.equals(Field(11)),
    cardPrime.equals(Field(13)),
    cardPrime.equals(Field(17)),
    cardPrime.equals(Field(19)),
    cardPrime.equals(Field(23)),
    cardPrime.equals(Field(29)),
    cardPrime.equals(Field(31)),
    cardPrime.equals(Field(37)),
    cardPrime.equals(Field(41)),
    cardPrime.equals(Field(43)),
    cardPrime.equals(Field(47)),
    cardPrime.equals(Field(53)),
    cardPrime.equals(Field(59)),
    cardPrime.equals(Field(61)),
    cardPrime.equals(Field(67)),
    cardPrime.equals(Field(71)),
    cardPrime.equals(Field(73)),
    cardPrime.equals(Field(79)),
    cardPrime.equals(Field(83)),
    cardPrime.equals(Field(89)),
    cardPrime.equals(Field(97)),
    cardPrime.equals(Field(101)),
    cardPrime.equals(Field(103)),
    cardPrime.equals(Field(107)),
    cardPrime.equals(Field(109)),
    cardPrime.equals(Field(113)),
    cardPrime.equals(Field(127)),
    cardPrime.equals(Field(131)),
    cardPrime.equals(Field(137)),
    cardPrime.equals(Field(139)),
    cardPrime.equals(Field(149)),
    cardPrime.equals(Field(151)),
    cardPrime.equals(Field(157)),
    cardPrime.equals(Field(163)),
    cardPrime.equals(Field(167)),
    cardPrime.equals(Field(173)),
    cardPrime.equals(Field(179)),
    cardPrime.equals(Field(181)),
    cardPrime.equals(Field(191)),
    cardPrime.equals(Field(193)),
    cardPrime.equals(Field(197)),
    cardPrime.equals(Field(199)),
    cardPrime.equals(Field(211)),
    cardPrime.equals(Field(223)),
    cardPrime.equals(Field(227)),
    cardPrime.equals(Field(229)),
    cardPrime.equals(Field(233)),
    cardPrime.equals(Field(239))],
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

  /*
  @runtimeMethod()
  public tallyBoardCards(cardPrime52: Field): void {
    // Remember - cardPrime52 should be in the 52 format
    // We'll always store the board card product in slot2
    const slot2 = this.slot2.getAndRequireEquals();
   
    // Remember - we start out having the board card be Null*5
    // Need to do this so we can ensure at showdown that player submitted all cards
    const slot2New = slot2.mul(cardPrime52).div(this.NullBoardcard);
    this.slot2.set(slot2New)
  }
  */

  convert52to13(c52: Field): Field {
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
      c52.equals(Field(2)).or(c52.equals(Field(43))).or(c52.equals(Field(103))).or(c52.equals(Field(173))),
      c52.equals(Field(3)).or(c52.equals(Field(47))).or(c52.equals(Field(107))).or(c52.equals(Field(179))),
      c52.equals(Field(5)).or(c52.equals(Field(53))).or(c52.equals(Field(109))).or(c52.equals(Field(181))),
      c52.equals(Field(7)).or(c52.equals(Field(59))).or(c52.equals(Field(113))).or(c52.equals(Field(191))),
      c52.equals(Field(11)).or(c52.equals(Field(61))).or(c52.equals(Field(127))).or(c52.equals(Field(193))),
      c52.equals(Field(13)).or(c52.equals(Field(67))).or(c52.equals(Field(131))).or(c52.equals(Field(197))),
      c52.equals(Field(17)).or(c52.equals(Field(71))).or(c52.equals(Field(137))).or(c52.equals(Field(199))),
      c52.equals(Field(19)).or(c52.equals(Field(73))).or(c52.equals(Field(139))).or(c52.equals(Field(211))),
      c52.equals(Field(23)).or(c52.equals(Field(79))).or(c52.equals(Field(149))).or(c52.equals(Field(223))),
      c52.equals(Field(29)).or(c52.equals(Field(83))).or(c52.equals(Field(151))).or(c52.equals(Field(227))),
      c52.equals(Field(31)).or(c52.equals(Field(89))).or(c52.equals(Field(157))).or(c52.equals(Field(229))),
      c52.equals(Field(37)).or(c52.equals(Field(97))).or(c52.equals(Field(163))).or(c52.equals(Field(233))),
      c52.equals(Field(41)).or(c52.equals(Field(101))).or(c52.equals(Field(167))).or(c52.equals(Field(239)))],
      // RETURN TYPE
      Field,
      // SELECT VALUES
      [Field(2),
      Field(3),
      Field(5),
      Field(7),
      Field(11),
      Field(13),
      Field(17),
      Field(19),
      Field(23),
      Field(29),
      Field(31),
      Field(37),
      Field(41),])

    return c13;

  }

  calcLookupVal(holecard0: Field,
    holecard1: Field,
    boardcard0: Field,
    boardcard1: Field,
    boardcard2: Field,
    boardcard3: Field,
    boardcard4: Field,
    useHolecard0: Bool,
    useHolecard1: Bool,
    useBoardcards0: Bool,
    useBoardcards1: Bool,
    useBoardcards2: Bool,
    useBoardcards3: Bool,
    useBoardcards4: Bool,
  ): Field {
    // Remember - all cards are in cardMapping52 format
    // let lookupVal = Field(1);
    let lookupVal = Field(1);

    const cardList = [holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4];
    const boolList = [useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4];

    // Incredibly ugly but we need to convert cards from cardMapping52 to cardMapping13
    // And then multiply together all the ones that are used to get the lookup val
    for (let i = 0; i < 7; i++) {
      const c52: Field = cardList[i];
      const c13: Field = this.convert52to13(c52)
      const boolUse: Bool = boolList[i];
      // So if we use it, use the value, otherwise just 1...
      const lvMul = Provable.if(boolUse, c13, Field(1));
      lookupVal = lookupVal.mul(lvMul);
    }

    return lookupVal;
  }


  calcCheckFlush(holecard0: Field,
    holecard1: Field,
    boardcard0: Field,
    boardcard1: Field,
    boardcard2: Field,
    boardcard3: Field,
    boardcard4: Field,
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
      const minHeart = Field(2);
      const maxHeart = Field(41);
      const minDiamond = Field(43);
      const maxDiamond = Field(101);
      const minClub = Field(103);
      const maxClub = Field(167);
      const minSpade = Field(173);
      const maxSpade = Field(239);

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


  @runtimeMethod()
  public showCards(holecard0: Field,
    holecard1: Field,
    boardcard0: Field,
    boardcard1: Field,
    boardcard2: Field,
    boardcard3: Field,
    boardcard4: Field,
    useHolecard0: Bool,
    useHolecard1: Bool,
    useBoardcards0: Bool,
    useBoardcards1: Bool,
    useBoardcards2: Bool,
    useBoardcards3: Bool,
    useBoardcards4: Bool,
    isFlush: Bool,
    shuffleKey: PrivateKey,
    merkleMapKey: Field,
    merkleMapVal: Field,
    path: MerkleMapWitness,
  ): void {

    /*
    Each player has to pass in their holecards, along with all board cards
    And specify which cards are used to make their best 6c hand
     
    To make cheating impossible, we need these checks:
    1. confirm the card lookup key and value are valid entries in the merkle map
    2. independently calculate the card lookup key using their cards and confirm the lookup key is valid
    3. re-hash the cards and confirm it matches their stored hash
    4. check that board cards are the real board cards
    */

    // const [stack1, stack2, turn, street, lastAction, lastBetSize, gameOver, pot] = this.getGamestate();
    const street = this.street.get().value;
    // const gamestate = this.gamestate.getAndRequireEquals();
    // TODO - what was this check again?  Reimplement with new format...
    // gamestate.assertLessThanOrEqual(Field(3));

    // Player card hash will be stored in slot1 or slot1
    const slot0 = this.slot0.get().value;
    const slot1 = this.slot1.get().value;
    // We are going to be storing the product of all the board card primes here!
    const slot2 = this.slot2.get().value;


    // CHECK 0. - make sure player is a part of the game...
    const player: PublicKey = this.transaction.sender.value;
    const player1Key = this.player1Key.get().value;
    const player2Key = this.player2Key.get().value;
    // playerHash.equals(player1Hash).or(playerHash.equals(player2Hash)).assertTrue('Player is not part of this game!');
    assert(player.equals(player1Key).or(player.equals(player2Key)), 'Player is not part of this game!');

    const holecardsHash = Provable.if(
      player.equals(player1Key),
      slot0,
      slot1
    );

    // CHECK 2. independently calculate the card lookup key using their cards and confirm the lookup key is valid
    // the lookupVal is the expected key for our merkle map
    const lookupVal: Field = this.calcLookupVal(holecard0,
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

    //isFlushReal.assertEquals(isFlush, 'Player did not pass in correct flush value!');
    assert(isFlushReal.equals(isFlush), 'Player did not pass in correct flush value!');
    //lookupVal.assertEquals(merkleMapKey, 'Incorrect hand strenght passed in!');
    assert(lookupVal.equals(merkleMapKey), 'Incorrect hand strenght passed in!');

    // CHECK 1. confirm the card lookup key and value are valid entries in the merkle map
    // MerkleMapRootBasic
    // MerkleMapRootFlush
    // TEMP - disabling since we don't currently have access to merkle map on front end
    // const root = Provable.if(
    //     isFlush,
    //     this.MerkleMapRootFlush,
    //     this.MerkleMapRootBasic,
    // );
    // const pathValid = path.computeRootAndKey(merkleMapVal);
    // pathValid[0].assertEquals(root);
    // pathValid[1].assertEquals(merkleMapKey);

    // CHECK 3. re-hash the cards and confirm it matches their stored hash
    const cardPoint1 = this.cardPrimeToCardPoint(holecard0);
    const cardPoint2 = this.cardPrimeToCardPoint(holecard1);
    const cardPoint1F = cardPoint1.toFields()[0]
    const cardPoint2F = cardPoint2.toFields()[0]
    const cardHash = this.generateHash(cardPoint1F, cardPoint2F, shuffleKey);
    //cardHash.assertEquals(holecardsHash, 'Player did not pass in their real cards!');
    assert(cardHash.equals(holecardsHash), 'Player did not pass in their real cards!');

    // CHECK 4. check that board cards are the real board cards
    const boardcardMul = boardcard0.mul(boardcard1).mul(boardcard2).mul(boardcard3).mul(boardcard4);
    const boardcardMulReal = Field(slot2);
    // boardcardMul.assertEquals(boardcardMulReal);
    assert(boardcardMul.equals(boardcardMulReal), "Bad board cards passed in!");
    // And check that we have 5 boardcards - should not be divisible by null val
    const nullBoardcardUint = Field(this.NullBoardcard);
    const divModRes = UInt32.from(boardcardMulReal).divMod(UInt32.from(nullBoardcardUint));
    const evenDiv = divModRes.rest.value.equals(Field(0));
    // evenDiv.assertFalse()
    assert(evenDiv.not(), "Should have five board cards!");
    // boardcardMulReal.divMod(nullBoardcardUint).rest.equals(Field(0)).assertFalse();

    // And now we can store the lookup value in the appropriate slot

    // Assuming we made it past all our checks - 
    // We are now storing the merkleMapVal, which represents
    // hand strength in these slots!  Lower is better!
    const slot0New = Provable.if(
      player.equals(player1Key),
      merkleMapVal,
      slot0,
    );
    const slot1New = Provable.if(
      player.equals(player2Key),
      merkleMapVal,
      slot1,
    );
    this.slot0.set(slot0New);
    this.slot1.set(slot1New);

    // Description of logic within actionMapping - 
    // transition from 1 to 6 via multiplying by 2 and 3 after each player
    // shows their cards
    const streetNew = Provable.if(
      player.equals(player1Key),
      street.mul(this.P1Turn),
      street.mul(this.P2Turn),
    );

    this.street.set(streetNew);
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

  storeHardcodedCards() {
    // Just for live testing - store cards directly rather than doing decryption to simplify front end teesting
    // PrivateKey.empty
    // const shuffleSecret = PrivateKey.fromFields([Field(1), Field(2), Field(3), Field(4)])
    const shuffleSecret = PrivateKey.fromBigInt(BigInt(1));
    // Ah
    const cardPoint1F = PublicKey.fromBase58("B62qoa5ohnNnFEXfbPshXCzkBkgWSzXk3auy2yS9hyjLma4EkH7xWbs").toFields()[0];
    // Ad
    const cardPoint2F = PublicKey.fromBase58("B62qiuLMUJ9xPCYGqAzJY2C8JTwgAFhfgZFTnVRsq3EBksHKAE1G3mX").toFields()[0];
    // Ks
    const cardPoint3F = PublicKey.fromBase58("B62qnp98SGKe6dQ2cTMUKJeWGhECfj57vZGS5D5MA9hr5bXFYMo3wDM").toFields()[0];
    // Ts
    const cardPoint4F = PublicKey.fromBase58("B62qrdxHXHyuQjDSyYPsWYTEgtZBSEqF5bpTktk5RqSwbdojebLVZLH").toFields()[0];

    const cardHash1 = this.generateHash(cardPoint1F, cardPoint2F, shuffleSecret);
    const cardHash2 = this.generateHash(cardPoint3F, cardPoint4F, shuffleSecret);

    this.slot0.set(cardHash1);
    this.slot1.set(cardHash2);

    // We'll store board cards in slot2, initialize with all nul values
    const noBoardcards = this.NullBoardcard.mul(this.NullBoardcard).mul(this.NullBoardcard).mul(this.NullBoardcard).mul(this.NullBoardcard)
    this.slot2.set(noBoardcards);
  }


  @runtimeMethod()
  public storeCardHash(slotI: Field, shuffleSecret: PrivateKey, epk1: PublicKey, epk2: PublicKey): void {
    // Used to store a hash of the player's cards
    // 1. decrypt both cards
    // 2. double hash the resulting value
    // 3. and store the hash in a slot

    // For both players their encrypted card will be stored here
    const slot0 = this.slot0.get().value;

    const msg1F0 = this.slot1.get().value;
    const msg2F0 = this.slot2.get().value;
    const msg1F1 = this.slot3.get().value;
    const msg2F1 = this.slot4.get().value;

    //msg1F.assertEquals(msg1.toFields()[0]);
    //msg2F.assertEquals(msg2.toFields()[0]);
    const msg1: PublicKey = PublicKey.fromFields([msg1F0, msg1F1]);
    const msg2: PublicKey = PublicKey.fromFields([msg2F0, msg2F1]);

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

  @runtimeMethod()
  public commitCard(slotI: Field, msg: PublicKey): void {
    // msg corresponds to the field representation of the msg PublicKey in the mentalpoker Card struct

    // The other player should perform their half of the partialUnmask,
    // and then commit the results here

    // Players can then decrypt their cards, preserving the secrecy of the
    // cards and avoiding the need for a trusted dealer

    const [msgF0, msgF1] = msg.toFields()

    const slot1 = this.slot1.get().value;
    const slot2 = this.slot2.get().value;
    const slot3 = this.slot3.get().value;
    const slot4 = this.slot4.get().value;
    const slot1New = Provable.if(
      slotI.equals(1),
      msgF0,
      slot1,
    );
    const slot2New = Provable.if(
      slotI.equals(2),
      msgF0,
      slot2,
    );
    // And now store the second value too
    const slot3New = Provable.if(
      slotI.equals(1),
      msgF1,
      slot3,
    );
    const slot4New = Provable.if(
      slotI.equals(2),
      msgF1,
      slot4,
    );
    this.slot1.set(slot1New);
    this.slot2.set(slot2New);
    this.slot3.set(slot3New);
    this.slot4.set(slot4New);
  }

}