import React from 'react';

/*
TODO - Page will allow player to create a game, 
maybe this is just a single button and we could do it from navbar?
*/

interface CreateGameButtonProps {
    onCreateGame: () => void;
}

const CreateGame: React.FC<CreateGameButtonProps> = ({ onCreateGame }) => {
    return (
        <div>
            <button onClick={onCreateGame}>Create Game</button>
        </div>
    );
}

export default CreateGame;