import React, { useState } from 'react';

/*
TODO - Page should show a list of games that are available to join
And have functionality for clicking "join"
*/


interface Game {
    id: number;
    opponent: string;
}

const GameTable: React.FC<{ games: Game[], onJoin: (gameId: number) => void }> = ({ games, onJoin }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Players</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {games.map(game => (
                    <tr key={game.id}>
                        <td>{game.id}</td>
                        <td>{game.opponent}</td>
                        <td>
                            <button onClick={() => onJoin(game.id)}>Join</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const GamePage: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);

    const handleJoinGame = (gameId: number) => { };

    return (
        <div>
            <h1>Game List</h1>
            <GameTable games={games} onJoin={handleJoinGame} />
        </div>
    );
};

export default GamePage;
