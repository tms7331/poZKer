import { Player } from './players.js';
import {
  applyMask,
  applyShuffle,
  bumpCurrentPlayer,
  createGame,
  dealFirstHand,
  joinGame,
} from './gameActions.js';


let gameData = createGame();

console.log(" ----------- creating game ------------")
console.log("gameData",gameData);

const player1 = gameData.players[0]
const player2 = gameData.players[1]

console.log("----------players ----------")
console.log("player 1",player1);
console.log("player 2",player1);


// console.log("----------introductions,players joining the game ----------")
// console.log("---------- player 1 joining the game ----------")
// currentGame.gameState = joinGame(gameData, currentGame.player.publicKeys); // player 1
// joinGame(currentGame.gameData, currentGame.player.publicKeys); // player 2


// applyShuffle(currentGame.gameData, currentGame.player); // player 1
// applyShuffle(currentGame.gameData, currentGame.player); // player 2


// applyMask(currentGame.gameData, currentGame.player); // player 1
// applyMask(currentGame.gameData, currentGame.player); // player 2


// dealFirstHand(currentGame.gameData, currentGame.player); // player 1 
// dealFirstHand(currentGame.gameData, currentGame.player); // player 2