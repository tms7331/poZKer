import React, { createContext, useContext, useState } from 'react';
import { Field, PublicKey } from 'o1js';
import ZkappWorkerClient from './zkappWorkerClient';

type GlobalContextProviderProps = {
    children: React.ReactNode;
}

type GlobalState = {
    testStr: string;
    zkappWorkerClient: null | ZkappWorkerClient;
    hasWallet: null | boolean;
    hasBeenSetup: boolean;
    accountExists: boolean;
    currentNum: Field;
    // This should have the o1js-pack encoded game state
    gamestate: Field;
    player1Hash: Field;
    player2Hash: Field;
    publicKey: null | PublicKey;
    zkappPublicKey: null | PublicKey;
    creatingTransaction: boolean;
    transactionFee: Number,
    // Address we deployed to on berkeley
    zkappAddress: string,
}


type GlobalContext = {
    globalState: GlobalState;
    setGlobalState: React.Dispatch<React.SetStateAction<GlobalState>>;
};

export const GlobalContext = createContext<GlobalContext | null>(null);

export default function GlobalContextProvider({ children }: GlobalContextProviderProps) {

    const [globalState, setGlobalState] = useState<GlobalState>(
        {
            testStr: "abcd",
            zkappWorkerClient: null,
            hasWallet: null,
            hasBeenSetup: false,
            accountExists: false,
            currentNum: Field(0),
            gamestate: Field(0),
            player1Hash: Field(0),
            player2Hash: Field(0),
            publicKey: null,
            zkappPublicKey: null,
            creatingTransaction: false,
            // These are constants
            transactionFee: 0.1,
            // zkappAddress: 'B62qpGqTpNvxMNjh1msVt1Dy6KTSZo2Q9XYR3dcc8Ld1LpcuDm4VUhW',
            // zkappAddress: 'B62qiy9qMzMKXhP3N2Dad6P4VZHQehP4YSQojHnyF9uCfGN3Fg4zkos',
            zkappAddress: 'B62qqcj8mPmXN1wYDG38oX4zVSSUHefd1gBWpfUUCVjBYS5J2SBdNJW',
        }
    );

    return (
        <GlobalContext.Provider value={{ globalState, setGlobalState }}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobalContext must be used within a GlobalContextProvider');
    }
    return context;
}