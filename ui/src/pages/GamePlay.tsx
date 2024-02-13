import React, { useState } from 'react';

/*
TODO - Page will be displayed once a game has been joined.  Should show:
- Board cards
- Player hole cards
- Player stack sizes
- Current pot size
- Last action
- Possible actions (if it's player's turn)

Look to model after standard poker interfaces
*/

// Define types
type Card = {
    rank: string;
    suit: string;
};

type Player = {
    holeCards: Card[];
    stackSize: number;
};

type GameState = {
    boardCards: Card[];
    players: Player[];
    possibleActions: string[];
};

// Dummy data for initial game state
const initialGameState: GameState = {
    boardCards: [],
    players: [],
    possibleActions: ['Bet', 'Check', 'Fold'],
};

// Component
const PokerGame: React.FC = () => {
    const [gameState, setGameState] = useState(initialGameState);

    return (
        <div>
            <h1>Poker Game</h1>
            <div>
                <h2>Board Cards</h2>
                <div>
                    {gameState.boardCards.map((card, index) => (
                        <span key={index}>{card.rank}{card.suit} </span>
                    ))}
                </div>
            </div>

            <div>
                <h2>Players</h2>
                {gameState.players.map((player, index) => (
                    <div key={index}>
                        <h3>Player {index + 1}</h3>
                        <div>
                            <h4>Hole Cards</h4>
                            {player.holeCards.map((card, index) => (
                                <span key={index}>{card.rank}{card.suit} </span>
                            ))}
                        </div>
                        <div>
                            <h4>Stack Size: {player.stackSize}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h2>Possible Actions</h2>
                <ul>
                    {gameState.possibleActions.map((action, index) => (
                        <li key={index}>{action}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PokerGame;
