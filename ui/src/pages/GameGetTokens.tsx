import React, { useState } from 'react';

/*
TODO - Page should show balance of tokens and allow user to get more tokens
*/


const TokenBalance: React.FC = () => {
    const [balance, setBalance] = useState<number>(0);

    const handleGetMoreTokens = () => { };

    return (
        <div>
            <h2>Token Balance: {balance}</h2>
            <button onClick={handleGetMoreTokens}>Get More Tokens</button>
        </div>
    );
};

export default TokenBalance;
